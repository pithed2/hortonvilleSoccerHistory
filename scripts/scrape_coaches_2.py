#!/usr/bin/env python3
# ==============================================================================
# Script:    scrape_coaches.py
# Author:    Andy (built with Claude)
# Created:   2026-10-04
# Purpose:   Read a program-url-registry JSON (one object per school with a
#            program_website), visit each program's coaches/roster pages, and
#            extract every coach's name, title, email and phone.
#
# Input:     program-url-registry-<div>.json
#              [{"division","school","program_website","discovery_source","note"}]
# Output:    1) <input>.coaches.json   same objects + new properties:
#                 coaches[]            {name,title,email,phone,is_head_coach,source_url}
#                 coach_source_url     page the coaches came from
#                 scrape_status        ok | ok_no_email | no_coaches | no_url |
#                                      blocked | error
#                 scrape_detail        short reason / what was tried
#                 scraped_at           ISO timestamp
#            2) <input>.coaches_flat.csv  one row per coach (for the Directory)
#            3) <input>.cache/        raw HTML per URL (re-runs skip the network)
#
# Strategy:  Detect site platform from the program URL, then try candidate pages
#            in order and stop at the first that yields coaches:
#              SIDEARM  (/sports/mens-soccer)  ->  /coaches, /roster
#              PRESTO   (/sports/msoc/index)   ->  /coaches/index, /<season>/coaches,
#                                                  /<season>/roster
#              OTHER                           ->  the program page itself
#            If coaches were found but none have an email, the athletics staff
#            directory is scanned once to backfill emails by name.
#            Parsers, in order: header-mapped tables -> person "cards" ->
#            mailto-anchored blocks.  Cloudflare-obfuscated emails are decoded.
#
# Politeness: honors robots.txt, 1 request/sec per host, retries 429/5xx with
#            backoff, identifies itself with a contact User-Agent.  Fully
#            resumable: rerun the same command and finished schools are skipped.
#
# Usage:     pip install requests beautifulsoup4 lxml
#            python scrape_coaches.py program-url-registry.json --limit 5
#            python scrape_coaches.py program-url-registry.json
#            python scrape_coaches.py program-url-registry.json --divisions D3 NAIA
#            python scrape_coaches.py program-url-registry.json --retry-failed
#
# Changes:   2026-10-04  v1.1  Full-registry support: --divisions filter
#                        (default D2 D3 NAIA JUCO); D1 and other excluded
#                        divisions pass through to the output untouched; rows
#                        with no program_website are marked no_url up front
#                        (no network, no worker slot, no count against
#                        --limit); explicit UTF-8 file I/O for Windows;
#                        Retry-After capped; per-school time budget; live
#                        progress lines and a heartbeat while workers fetch.
#            2026-10-04  v1.2  --verbose request log; heartbeat shows schools left
#                        count and pages cached.
# ==============================================================================
import argparse, csv, hashlib, json, re, sys, threading, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib import robotparser

import requests
from bs4 import BeautifulSoup

# ------------------------------------------------------------------------------
# Config
# ------------------------------------------------------------------------------
USER_AGENT = ("HHS-SoccerRecruiting-Directory/1.0 "
              "(+contact: your-email@example.com; low-volume coach contact lookup)")
TIMEOUT = 12
SCHOOL_BUDGET = 120         # max seconds spent on one school before giving up
MAX_RETRY_AFTER = 60        # never sleep longer than this on a 429/503
VERBOSE = False             # --verbose: print every page request as it happens
DEFAULT_DIVISIONS = ["D2", "D3", "NAIA", "JUCO"]
PER_HOST_DELAY = 1.0          # seconds between requests to the same host
WORKERS = 8                   # different hosts run in parallel
MAX_RETRIES = 3
SEASONS = ["2026-27", "2025-26", "2026", "2025"]   # Presto season folders to try

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?:\s*(?:x|ext\.?)\s*\d{1,5})?", re.I)
TITLE_WORDS = re.compile(r"\b(head|assistant|associate|interim|volunteer|graduate|director|"
                         r"coach|coordinator|goalkeeper|keeper|manager|trainer|operations)\b", re.I)
HEAD_RE = re.compile(r"\bhead\s+(men'?s\s+)?(soccer\s+)?coach\b", re.I)
NOT_A_NAME = re.compile(r"(coach|staff|email|phone|roster|soccer|director|@|\d)", re.I)

# ------------------------------------------------------------------------------
# HTTP layer: cache, robots, per-host throttle, retries
# ------------------------------------------------------------------------------
class Fetcher:
    def __init__(self, cache_dir: Path):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.s = requests.Session()
        self.s.headers.update({"User-Agent": USER_AGENT,
                               "Accept": "text/html,application/xhtml+xml"})
        self.host_lock, self.host_last, self.robots = {}, {}, {}
        self.glock = threading.Lock()

    def _lock(self, host):
        with self.glock:
            return self.host_lock.setdefault(host, threading.Lock())

    def _allowed(self, url):
        host = urlparse(url).scheme + "://" + urlparse(url).netloc
        if host not in self.robots:
            rp = robotparser.RobotFileParser()
            try:
                r = self.s.get(host + "/robots.txt", timeout=TIMEOUT)
                rp.parse(r.text.splitlines() if r.status_code == 200 else [])
            except requests.RequestException:
                rp.parse([])
            self.robots[host] = rp
        return self.robots[host].can_fetch(USER_AGENT, url)

    def get(self, url):
        """Return (status, final_url, html). status: 200, 404, 'blocked', 'robots', 'error'."""
        key = hashlib.sha1(url.encode()).hexdigest()
        cp = self.cache_dir / f"{key}.json"
        if cp.exists():
            c = json.loads(cp.read_text(encoding="utf-8"))
            return c["status"], c["final_url"], c["html"]
        if not self._allowed(url):
            return "robots", url, ""
        host = urlparse(url).netloc
        with self._lock(host):
            for attempt in range(MAX_RETRIES):
                wait = PER_HOST_DELAY - (time.time() - self.host_last.get(host, 0))
                if wait > 0:
                    time.sleep(wait)
                self.host_last[host] = time.time()
                t0 = time.time()
                try:
                    r = self.s.get(url, timeout=TIMEOUT, allow_redirects=True)
                    if VERBOSE:
                        print(f"    GET {r.status_code} {time.time() - t0:5.1f}s {url}", flush=True)
                except requests.RequestException as e:
                    if VERBOSE:
                        print(f"    GET ERR {time.time() - t0:5.1f}s {url} ({type(e).__name__})", flush=True)
                    if attempt == MAX_RETRIES - 1:
                        return "error", url, str(e)[:200]
                    time.sleep(2 ** attempt * 3)
                    continue
                if r.status_code in (429, 503) or r.status_code >= 500:
                    if attempt == MAX_RETRIES - 1:
                        return "blocked", url, ""
                    ra = r.headers.get("Retry-After", "")
                    time.sleep(min(int(ra) if ra.isdigit() else 2 ** attempt * 10, MAX_RETRY_AFTER))
                    continue
                if r.status_code == 403:
                    return "blocked", url, ""
                status, html = r.status_code, (r.text if r.status_code == 200 else "")
                cp.write_text(json.dumps({"status": status, "final_url": r.url, "html": html}), encoding="utf-8")
                return status, r.url, html
        return "error", url, ""

# ------------------------------------------------------------------------------
# Candidate pages per platform
# ------------------------------------------------------------------------------
def candidate_pages(program_url):
    u = program_url.rstrip("/")
    p = urlparse(u)
    root = f"{p.scheme}://{p.netloc}"
    path = p.path
    if re.search(r"/sports/(m-)?soccer|/sports/mens-soccer$", path) and "/index" not in path:
        plat = "sidearm"
        pages = [u + "/coaches", u + "/roster"]
        directory = [root + "/staff-directory"]
    elif re.search(r"/sports/(msoc|m-soccer)(/index)?$", path):
        plat = "presto"
        base = re.sub(r"/index$", "", u)
        pages = [base + "/coaches/index"] + [f"{base}/{s}/coaches" for s in SEASONS[:2]] \
                + [f"{base}/{s}/roster" for s in SEASONS]
        directory = [root + "/information/directory/index", root + "/staff/index"]
    else:
        plat = "other"
        pages = [u]
        directory = []
    return plat, pages, directory

# ------------------------------------------------------------------------------
# Field helpers
# ------------------------------------------------------------------------------
def cf_decode(hexstr):
    """Cloudflare email protection: first byte is the XOR key."""
    try:
        k = int(hexstr[:2], 16)
        return "".join(chr(int(hexstr[i:i + 2], 16) ^ k) for i in range(2, len(hexstr), 2))
    except ValueError:
        return ""

def emails_in(node):
    out = []
    for a in node.select("a[href]"):
        h = a["href"]
        if h.lower().startswith("mailto:"):
            out.append(h[7:].split("?")[0].strip())
        elif "/cdn-cgi/l/email-protection#" in h:
            out.append(cf_decode(h.split("#", 1)[1]))
    for sp in node.select("[data-cfemail]"):
        out.append(cf_decode(sp["data-cfemail"]))
    if not out:
        out += EMAIL_RE.findall(node.get_text(" "))
    return [e for e in dict.fromkeys(x.strip().strip(".") for x in out) if EMAIL_RE.fullmatch(e)]

def phones_in(node):
    out = []
    for a in node.select("a[href^='tel:']"):
        out.append(a["href"][4:].strip())
    out += PHONE_RE.findall(node.get_text(" "))
    norm = []
    for p in out:
        digits = re.sub(r"\D", "", p.split("x")[0].split("ext")[0])
        if len(digits) >= 10:
            norm.append(p.strip())
    return list(dict.fromkeys(norm))

def clean(t):
    return re.sub(r"\s+", " ", t or "").strip(" |-–:")

def looks_like_name(t):
    t = clean(t)
    return 2 <= len(t.split()) <= 5 and len(t) <= 45 and not NOT_A_NAME.search(t)

def make(name, title, email, phone, src):
    return {"name": clean(name), "title": clean(title), "email": (email or "").lower(),
            "phone": clean(phone), "is_head_coach": bool(HEAD_RE.search(title or "")),
            "source_url": src}

# ------------------------------------------------------------------------------
# Parsers (each returns list of coach dicts)
# ------------------------------------------------------------------------------
def parse_tables(soup, src, section_filter=None):
    """Tables with a header row containing name + (title|position)."""
    found = []
    for tbl in soup.select("table"):
        heads = [clean(th.get_text()).lower() for th in tbl.select("thead th")] or \
                [clean(td.get_text()).lower() for td in (tbl.select_one("tr") or soup.new_tag("tr")).select("th,td")]
        if not any("name" in h for h in heads) or not any(k in " ".join(heads) for k in ("title", "position")):
            continue
        idx = {k: next((i for i, h in enumerate(heads) if k in h), None)
               for k in ("name", "title", "position", "phone", "email")}
        ti = idx["title"] if idx["title"] is not None else idx["position"]
        in_section = section_filter is None
        for tr in tbl.select("tr"):
            cells = tr.select("td,th")
            txt = clean(tr.get_text(" "))
            if section_filter is not None and (len(cells) == 1 or "category" in " ".join(tr.get("class", []))):
                in_section = bool(section_filter.search(txt))   # sport sub-header row
                continue
            if not in_section or len(cells) < 2 or tr.find_parent("thead"):
                continue
            get = lambda i: clean(cells[i].get_text(" ")) if i is not None and i < len(cells) else ""
            name, title = get(idx["name"]), get(ti)
            if not looks_like_name(name):
                continue
            em = emails_in(cells[idx["email"]]) if idx["email"] is not None and idx["email"] < len(cells) else emails_in(tr)
            ph = get(idx["phone"]) or (phones_in(tr)[:1] or [""])[0]
            found.append(make(name, title, em[0] if em else "", ph, src))
    return found

CARD_SEL = ("[class*='coach'], [class*='s-person'], [class*='staff-member'], "
            "[class*='person-card'], [class*='bio-card'], li[class*='roster']")

def parse_cards(soup, src):
    """Repeated person blocks (SIDEARM roster coach cards, Nextgen s-person-card, Presto bios)."""
    found = []
    for card in soup.select(CARD_SEL):
        txt_nodes = [clean(x) for x in card.stripped_strings]
        if not txt_nodes or len(txt_nodes) > 25:
            continue
        # a block holding several people is a list container, not a card
        if sum(1 for t in txt_nodes if looks_like_name(t)) > 2 or len(emails_in(card)) > 1:
            continue
        name = next((t for t in txt_nodes if looks_like_name(t)), "")
        title = next((t for t in txt_nodes if TITLE_WORDS.search(t) and t != name and len(t) < 80), "")
        if not name or not title:
            continue
        em, ph = emails_in(card), phones_in(card)
        found.append(make(name, title, em[0] if em else "", ph[0] if ph else "", src))
    return found

def parse_mailto_blocks(soup, src):
    """Last resort: every mailto, climb to the smallest ancestor holding one email."""
    found = []
    for a in soup.select("a[href^='mailto:'], a[href*='email-protection']"):
        node = a
        for _ in range(6):
            node = node.parent
            if node is None:
                break
            if len(emails_in(node)) > 1:
                node = None
                break
            strings = [clean(s) for s in node.stripped_strings]
            name = next((s for s in strings if looks_like_name(s)), "")
            title = next((s for s in strings if TITLE_WORDS.search(s) and s != name and len(s) < 80), "")
            if name and title:
                ph = phones_in(node)
                found.append(make(name, title, emails_in(node)[0], ph[0] if ph else "", src))
                break
    return found

def coach_filter(c):
    """Keep coaching staff only (drop sports info directors, trainers listed nearby)."""
    t = c["title"].lower()
    return "coach" in t or "director of soccer" in t or "goalkeep" in t

def dedupe(coaches):
    seen, out = {}, []
    for c in coaches:
        k = re.sub(r"[^a-z]", "", c["name"].lower())
        if k in seen:
            o = seen[k]
            for f in ("email", "phone", "title"):
                if not o[f] and c[f]:
                    o[f] = c[f]
            continue
        seen[k] = c
        out.append(c)
    return out

def extract(html, src):
    soup = BeautifulSoup(html, "lxml")
    for fn in (parse_tables, parse_cards, parse_mailto_blocks):
        got = [c for c in dedupe(fn(soup, src)) if coach_filter(c)]
        if got:
            return got, fn.__name__
    return [], None

SOCCER_SECTION = re.compile(r"\bsoccer\b", re.I)
MENS = re.compile(r"\bmen'?s\b|\bmsoc\b", re.I)

def backfill_from_directory(fetch, dir_urls, coaches):
    for u in dir_urls:
        st, final, html = fetch.get(u)
        if st != 200 or not html:
            continue
        soup = BeautifulSoup(html, "lxml")
        rows = parse_tables(soup, final, section_filter=SOCCER_SECTION) or parse_cards(soup, final)
        byname = {re.sub(r"[^a-z]", "", r["name"].lower()): r for r in rows}
        hit = 0
        for c in coaches:
            r = byname.get(re.sub(r"[^a-z]", "", c["name"].lower()))
            if r:
                c["email"] = c["email"] or r["email"]
                c["phone"] = c["phone"] or r["phone"]
                hit += 1
        if hit:
            return final
    return None

# ------------------------------------------------------------------------------
# Per-school worker
# ------------------------------------------------------------------------------
def process(rec, fetch):
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    url = (rec.get("program_website") or "").strip()
    base = {"coaches": [], "coach_source_url": None, "scraped_at": now}
    if not url:
        return {**base, "scrape_status": "no_url", "scrape_detail": rec.get("note") or "no program_website"}
    plat, pages, dirs = candidate_pages(url)
    tried, t0 = [], time.time()
    for p in pages:
        if time.time() - t0 > SCHOOL_BUDGET:
            tried.append("time budget hit")
            break
        st, final, html = fetch.get(p)
        tried.append(f"{p.replace(url.rstrip('/'), '~')}:{st}")
        if st in ("robots", "blocked"):
            return {**base, "scrape_status": "blocked", "scrape_detail": f"{plat}; {st} at {p}"}
        if st != 200 or not html:
            continue
        coaches, how = extract(html, final)
        if coaches:
            detail = f"{plat}; {how}"
            if not any(c["email"] for c in coaches) and dirs:
                d = backfill_from_directory(fetch, dirs, coaches)
                if d:
                    detail += f"; emails from {d}"
            status = "ok" if any(c["email"] for c in coaches) else "ok_no_email"
            return {**base, "coaches": coaches, "coach_source_url": final,
                    "scrape_status": status, "scrape_detail": detail}
    return {**base, "scrape_status": "no_coaches", "scrape_detail": f"{plat}; tried " + ", ".join(tried)}

# ------------------------------------------------------------------------------
# Main: resumable batch
# ------------------------------------------------------------------------------
def norm_div(d):
    d = re.sub(r"[^a-z0-9]", "", (d or "").lower())
    return {"ncaad1": "D1", "d1": "D1", "di": "D1", "ncaad2": "D2", "d2": "D2", "dii": "D2",
            "ncaad3": "D3", "d3": "D3", "diii": "D3", "naia": "NAIA",
            "juco": "JUCO", "njcaa": "JUCO", "juniorcollege": "JUCO"}.get(d, d.upper())

def key(r):
    return (norm_div(r.get("division")), r.get("school"), r.get("program_website") or "")

def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")   # Windows console safety
    except AttributeError:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("registry")
    ap.add_argument("--divisions", nargs="+", default=DEFAULT_DIVISIONS,
                    help="divisions to scrape (default: D2 D3 NAIA JUCO); others pass through untouched")
    ap.add_argument("--limit", type=int, default=0, help="scrape only the first N pending schools that have a URL")
    ap.add_argument("--retry-failed", action="store_true", help="re-run blocked/error/no_coaches rows")
    ap.add_argument("--workers", type=int, default=WORKERS)
    ap.add_argument("--verbose", action="store_true", help="print every page request (URL, status, seconds)")
    a = ap.parse_args()
    global VERBOSE
    VERBOSE = a.verbose
    wanted = {norm_div(d) for d in a.divisions}

    src = Path(a.registry)
    out_json = src.with_suffix(".coaches.json")
    out_csv = src.with_suffix(".coaches_flat.csv")
    fetch = Fetcher(src.with_suffix(".cache"))

    recs = json.loads(src.read_text(encoding="utf-8"))
    if isinstance(recs, dict):      # tolerate {"schools":[...]} style wrappers
        recs = next(v for v in recs.values() if isinstance(v, list))
    done = {}
    if out_json.exists():   # resume
        for r in json.loads(out_json.read_text(encoding="utf-8")):
            if "scrape_status" in r:
                done[key(r)] = r

    from collections import Counter
    in_scope = [r for r in recs if norm_div(r.get("division")) in wanted]
    print("registry by division:", dict(Counter(norm_div(r.get("division")) for r in recs)))
    print("scraping:", sorted(wanted), "| passing through:",
          sorted({norm_div(r.get("division")) for r in recs} - wanted) or "none")

    # rows with no URL: settle immediately, no worker, no network
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    for r in in_scope:
        if not (r.get("program_website") or "").strip() and key(r) not in done:
            done[key(r)] = {**r, "coaches": [], "coach_source_url": None, "scrape_status": "no_url",
                            "scrape_detail": r.get("note") or "no program_website", "scraped_at": now}

    retry = {"blocked", "error", "no_coaches"} if a.retry_failed else set()
    todo = [r for r in in_scope if (r.get("program_website") or "").strip()
            and (key(r) not in done or done[key(r)]["scrape_status"] in retry)]
    if a.limit:
        todo = todo[:a.limit]
    print(f"{len(in_scope)} in scope | {len(done)} already settled | {len(todo)} to scrape"
          f" | {a.workers} workers")

    lock = threading.Lock()
    def save():
        merged = [done.get(key(r), r) for r in recs]   # original order, D1 untouched
        tmp = out_json.with_suffix(".tmp")
        tmp.write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")
        tmp.replace(out_json)
    save()

    t_start = time.time()
    with ThreadPoolExecutor(max_workers=a.workers) as ex:
        futs = {ex.submit(process, r, fetch): r for r in todo}
        pending = set(futs)
        n = 0
        while pending:
            finished = [f for f in pending if f.done()]
            if not finished:
                time.sleep(5)
                if not any(f.done() for f in pending):
                    print(f"  ... still working: {n}/{len(todo)} done, {len(pending)} left, "
                          f"{len(list(fetch.cache_dir.glob('*.json')))} pages cached, "
                          f"{int(time.time() - t_start)}s elapsed", flush=True)
                continue
            for f in finished:
                pending.discard(f)
                n += 1
                r = futs[f]
                try:
                    res = f.result()
                except Exception as e:   # never let one school kill the batch
                    res = {"coaches": [], "coach_source_url": None, "scrape_status": "error",
                           "scrape_detail": f"{type(e).__name__}: {e}"[:200],
                           "scraped_at": datetime.now(timezone.utc).isoformat(timespec="seconds")}
                with lock:
                    done[key(r)] = {**r, **res}
                    print(f"[{n}/{len(todo)}] {norm_div(r.get('division')):4} {res['scrape_status']:12} "
                          f"{len(res['coaches']):2} coaches  {r['school']}", flush=True)
                    if n % 10 == 0:
                        save()
    save()

    # flat CSV for the Directory (scraped divisions only)
    rows = json.loads(out_json.read_text(encoding="utf-8"))
    with out_csv.open("w", newline="", encoding="utf-8-sig") as fh:   # -sig so Excel reads UTF-8
        w = csv.writer(fh)
        w.writerow(["division", "school", "coach_name", "title", "is_head_coach", "email", "phone",
                    "source_url", "scrape_status", "scraped_at"])
        for r in rows:
            for c in r.get("coaches") or []:
                w.writerow([r.get("division"), r["school"], c["name"], c["title"], c["is_head_coach"],
                            c["email"], c["phone"], c["source_url"], r["scrape_status"], r.get("scraped_at")])
    scoped = [r for r in rows if norm_div(r.get("division")) in wanted]
    print("status (scraped divisions):", dict(Counter(r.get("scrape_status", "pending") for r in scoped)))
    by_div = Counter((norm_div(r.get("division")), r.get("scrape_status", "pending")) for r in scoped)
    for d in sorted(wanted):
        print(f"  {d:4}", {s: c for (dd, s), c in sorted(by_div.items()) if dd == d})
    print(f"wrote {out_json.name} and {out_csv.name}")

if __name__ == "__main__":
    sys.exit(main())
