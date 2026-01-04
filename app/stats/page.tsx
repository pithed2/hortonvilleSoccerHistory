"use client";

import { useEffect, useMemo, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

// ---------- tiny CSV utils (RFC4180-ish for our simple needs) ----------
function parseCSV(text: string): { cols: string[]; rows: string[][] } {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  if (!lines.length) return { cols: [], rows: [] };
  const cols0 = splitCSVLine(lines[0]);
  // Strip BOM if present
  if (cols0.length && cols0[0].charCodeAt(0) === 0xFEFF) {
    cols0[0] = cols0[0].replace(/^\uFEFF/, "");
  }
  const rows = lines.slice(1).map(splitCSVLine);
  return { cols: cols0, rows };
}
function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'; i++; // escaped quote
      } else if (ch === '"') {
        inQ = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ",") { out.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out.map(s => s.trim());
}
function idx(cols: string[], name: string) { return cols.indexOf(name); }
function toNum(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
// ----------------------------------------------------------------------

type Game = {
  season_year: number;
  date: string;
  opponent: string;
  venue?: string;
  result?: string; // 'W' | 'L' | 'T'
  score?: string;  // "2-1" (text, not date)
  notes?: string;
  coach?: string;
  competition?: string;
};

type SeasonMeta = {
  season_year: number;
  head_coach?: string;
  notes_md?: string;
  coach?: string;   // allow either head_coach or coach, we’ll normalize
  notes?: string;   // allow notes_md or notes
};

type SeasonRow = {
  season: number;
  wins: number;
  losses: number;
  ties: number;
  gf: number;
  ga: number;
  winPct: number;
  coach?: string;
  notes?: string;
};

export default function StatsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [seasonMeta, setSeasonMeta] = useState<Record<number, SeasonMeta>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [sortBy, setSortBy] = useState<"season" | "wins" | "winPct">("season");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setStatus("loading");
        // Try games.csv, then games_textscore.csv
        let gamesCsv = "";
        for (const name of ["/data/games.csv", "/data/games_textscore.csv"]) {
          const res = await fetch(name, { cache: "no-store" });
          if (res.ok) { gamesCsv = await res.text(); break; }
        }
        if (!gamesCsv) throw new Error("Unable to load games CSV from /data.");

        const { cols, rows } = parseCSV(gamesCsv);
        const gx = {
          season_year: idx(cols, "season_year"),
          date: idx(cols, "date"),
          opponent: idx(cols, "opponent"),
          venue: idx(cols, "venue"),
          result: idx(cols, "result"),
          score: idx(cols, "score"),
          notes: idx(cols, "notes"),
          coach: idx(cols, "coach") >= 0 ? idx(cols, "coach") : idx(cols, "Coach"),
          competition: idx(cols, "competition"),
        };
        const parsedGames: Game[] = rows.map(parts => ({
          season_year: toNum(parts[gx.season_year]),
          date: parts[gx.date] || "",
          opponent: parts[gx.opponent] || "",
          venue: gx.venue >= 0 ? parts[gx.venue] : "",
          result: gx.result >= 0 ? parts[gx.result]?.toUpperCase() : "",
          score: gx.score >= 0 ? parts[gx.score] : "",
          notes: gx.notes >= 0 ? parts[gx.notes] : "",
          home_away: gx.home_away >= 0 ? parts[gx.home_away] : "",
          competition: gx.competition >= 0 ? parts[gx.competition] : "",
        })).filter(g => g.season_year);

        if (cancelled) return;
        setGames(parsedGames);

        // Optional seasons.csv for coach/notes enrichment
        try {
          const sres = await fetch("/data/seasons.csv", { cache: "no-store" });
          if (sres.ok) {
            const text = await sres.text();
            const { cols: sc, rows: sr } = parseCSV(text);
            const sx = {
              season_year: idx(sc, "season_year"),
              head_coach: idx(sc, "head_coach"),
              coach: idx(sc, "coach") >= 0 ? idx(sc, "coach") : idx(sc, "Coach"),
              notes_md: idx(sc, "notes_md"),
              notes: idx(sc, "notes"),
            };
            const map: Record<number, SeasonMeta> = {};
            sr.forEach(parts => {
              const y = toNum(parts[sx.season_year]);
              if (!y) return;
              map[y] = {
                season_year: y,
                head_coach: sx.head_coach >= 0 ? parts[sx.head_coach] : undefined,
                coach: sx.coach >= 0 ? parts[sx.coach] : undefined,
                notes_md: sx.notes_md >= 0 ? parts[sx.notes_md] : undefined,
                notes: sx.notes >= 0 ? parts[sx.notes] : undefined,
              };
            });
            if (!cancelled) setSeasonMeta(map);
          }
        } catch { /* seasons.csv optional */ }

        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus("error");
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Build per-season rollups
  const seasonRows: SeasonRow[] = useMemo(() => {
    if (!games.length) return [];
    const acc = new Map<number, SeasonRow>();
    const getRow = (y: number) => {
      if (!acc.has(y)) acc.set(y, { season: y, wins: 0, losses: 0, ties: 0, gf: 0, ga: 0, winPct: 0 });
      return acc.get(y)!;
    };
    for (const g of games) {
      const row = getRow(g.season_year);
      // parse score "X-Y"
      if (g.score && /^\s*\d+\s*-\s*\d+\s*$/.test(g.score)) {
        const [a, b] = g.score.split("-").map(s => toNum(s));
        row.gf += a; row.ga += b;
      }
      const r = (g.result || "").toUpperCase();
      if (r === "W") row.wins += 1;
      else if (r === "L") row.losses += 1;
      else if (r === "T" || r === "D") row.ties += 1;

      // attach coach/notes once (prefer seasons.csv if exists)
      const meta = seasonMeta[g.season_year];
      if (meta) {
        row.coach = meta.coach || meta.head_coach || row.coach;
        row.notes = (meta.notes_md || meta.notes || row.notes)?.toString();
      }
    }
    // finalize win%
    for (const r of acc.values()) {
      const gamesPlayed = r.wins + r.losses + r.ties;
      r.winPct = gamesPlayed ? ((r.wins + 0.5 * r.ties) / gamesPlayed) * 100 : 0;
    }
    return Array.from(acc.values());
  }, [games, seasonMeta]);

  const sorted = useMemo(() => {
    const copy = [...seasonRows];
    if (sortBy === "season") copy.sort((a, b) => b.season - a.season);
    else if (sortBy === "wins") copy.sort((a, b) => b.wins - a.wins || b.season - a.season);
    else copy.sort((a, b) => b.winPct - a.winPct || b.season - a.season);
    return copy;
  }, [seasonRows, sortBy]);

  // Program overview
  const overview = useMemo(() => {
    if (!seasonRows.length) return { seasons: 0, wins: 0, losses: 0, ties: 0, gf: 0, ga: 0, winPct: 0 };
    let wins = 0, losses = 0, ties = 0, gf = 0, ga = 0;
    for (const r of seasonRows) { wins += r.wins; losses += r.losses; ties += r.ties; gf += r.gf; ga += r.ga; }
    const gp = wins + losses + ties;
    const winPct = gp ? ((wins + 0.5 * ties) / gp) * 100 : 0;
    return { seasons: seasonRows.length, wins, losses, ties, gf, ga, winPct };
  }, [seasonRows]);

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Season Statistics</h1>
          <p className="text-lg opacity-90">Complete record of all boys varsity seasons (from CSV)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Program Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Total Seasons</p>
            <p className="text-3xl font-black text-primary">{overview.seasons}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Program Record</p>
            <p className="text-3xl font-black text-primary">
              {overview.wins}-{overview.losses}-{overview.ties}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Win Percentage</p>
            <p className="text-3xl font-black text-primary">{overview.winPct.toFixed(1)}%</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Goals For / Against</p>
            <p className="text-3xl font-black text-primary">{overview.gf} / {overview.ga}</p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setSortBy("season")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              sortBy === "season" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            By Year
          </button>
          <button
            onClick={() => setSortBy("wins")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              sortBy === "wins" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Most Wins
          </button>
          <button
            onClick={() => setSortBy("winPct")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              sortBy === "winPct" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Win %
          </button>
        </div>

        {/* Season Stats Table */}
        <div className="overflow-x-auto">
          {status === "loading" && (
            <div className="p-6 text-sm text-muted-foreground">Loading CSV…</div>
          )}
          {status === "error" && (
            <div className="p-6 text-red-600 text-sm">
              Couldn’t load CSV. Ensure <code>/data/games.csv</code> or <code>/data/games_textscore.csv</code> exists.
            </div>
          )}
          {status === "ready" && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-black">Season</th>
                  <th className="text-left py-4 px-4 font-semibold">Record</th>
                  <th className="text-center py-4 px-4 font-semibold">Win %</th>
                  <th className="text-center py-4 px-4 font-semibold">GF/GA</th>
                  <th className="text-left py-4 px-4 font-semibold">Coach</th>
                  <th className="text-left py-4 px-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((stat, idx) => (
                  <tr
                    key={stat.season}
                    className={`border-b border-border/50 ${idx % 2 === 0 ? "bg-muted/30" : ""} hover:bg-muted/50 transition-colors`}
                  >
                    <td className="py-4 px-4 font-black text-primary">
                      <a href={`/seasons/${stat.season}`} className="underline decoration-dotted">
                        {stat.season}
                      </a>
                    </td>
                    <td className="py-4 px-4 font-semibold">
                      {stat.wins}-{stat.losses}-{stat.ties}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold">{stat.winPct.toFixed(1)}%</td>
                    <td className="py-4 px-4 text-center text-sm">
                      <span className="font-semibold">{stat.gf}</span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="font-semibold">{stat.ga}</span>
                    </td>
                    <td className="py-4 px-4 text-sm">{stat.coach || "—"}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground italic">{stat.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
