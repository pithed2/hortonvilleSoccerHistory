// lib/games.ts
import fs from 'node:fs';
import path from 'node:path';
import { Game, SeasonRow, CoachRecord } from './types';
import { headers } from "next/headers";

// RFC4180-ish CSV parse that handles quotes + commas and BOM
function parseCSV(text: string): { cols: string[]; rows: string[][] } {
  // normalize newlines, strip BOM if any
  const clean = text.replace(/\r/g, '').replace(/^\uFEFF/, '');
  const lines = clean.split('\n').filter(l => l.length);
  if (!lines.length) return { cols: [], rows: [] };
  const cols = splitCSVLine(lines[0]).map(c => c.replace(/^\uFEFF/, ''));
  const rows = lines.slice(1).map(splitCSVLine);
  return { cols, rows };
}

function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQ = false; }
      else { cur += ch; }
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else { cur += ch; }
    }
  }
  out.push(cur);
  return out;
}

async function readDataFile(...names: string[]): Promise<string> {
  // 1) Local/dev: filesystem works
  for (const n of names) {
    const p = path.join(process.cwd(), "public", "data", n);
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  }

  // 2) Vercel/prod: fetch from CDN using current request host
  // This is the key change: don't guess the base URL.
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ??
    h.get("host");

  const proto =
    h.get("x-forwarded-proto") ??
    "https";

  if (host) {
    const base = `${proto}://${host}`;
    for (const n of names) {
      const res = await fetch(`${base}/data/${n}`, { cache: "no-store" });
      if (res.ok) return await res.text();
    }
  }

  return "";
}

export async function loadGames(): Promise<Game[]> {
  const csvText = await readDataFile("games.csv");
  if (!csvText) return [];

  const { cols, rows } = parseCSV(csvText);
  const ix = (k: string) => cols.indexOf(k);
  const need = ['season_year', 'date', 'opponent'];
  const missing = need.filter(k => ix(k) < 0);
  if (missing.length) return [];

  return rows.map(parts => {
    const get = (k: string) => {
      const i = ix(k);
      return i >= 0 ? parts[i] ?? '' : '';
    };
    return {
      season_year: Number(get('season_year')),
      date: get('date'),
      opponent: get('opponent'),
      venue: get('venue'),
      result: (get('result') || '').toUpperCase() as any,
      score: get('score'),
      notes: get('notes'),
      home_away: get('home_away') as any,
      competition: get('competition'),
      coach: get('coach'),
    } as Game;
  }).filter(g => Number.isFinite(g.season_year));
}

export async function gamesBySeason(year: number) {
  const all = await loadGames();
  return all
    .filter(g => g.season_year === year)
    .sort((a, b) => a.date.localeCompare(b.date) || a.opponent.localeCompare(b.opponent));
}

export async function listSeasons(): Promise<number[]> {
  const all = await loadGames();
  return Array.from(new Set(all.map(g => g.season_year)))
    .filter(Boolean)
    .sort((a, b) => b - a);
}

// Optional per-season notes (e.g. "Won Bay Conference"), keyed by season_year.
// This file is supplementary -- if it's missing, notes are simply blank.
async function loadSeasonNotes(): Promise<Record<number, string>> {
  const csvText = await readDataFile('seasons.csv');
  if (!csvText) return {};
  const { cols, rows } = parseCSV(csvText);
  const ix = (k: string) => cols.indexOf(k);
  const yi = ix('season_year');
  const ni = ix('notes');
  if (yi < 0) return {};
  const map: Record<number, string> = {};
  for (const parts of rows) {
    const y = Number(parts[yi]);
    if (Number.isFinite(y) && ni >= 0 && parts[ni]) map[y] = parts[ni];
  }
  return map;
}

// Single source of truth for season-level performance. Every page that shows
// win/loss records, goal totals, or win% should derive from this instead of
// hand-rolling its own CSV parse or hardcoding numbers that will drift the
// next time a season gets added to games.csv.
export async function seasonRows(): Promise<SeasonRow[]> {
  const [games, notes] = await Promise.all([loadGames(), loadSeasonNotes()]);
  const acc = new Map<number, SeasonRow>();

  for (const g of games) {
    if (!acc.has(g.season_year)) {
      acc.set(g.season_year, {
        season_year: g.season_year,
        coach: g.coach || undefined,
        played: 0, wins: 0, losses: 0, ties: 0, gf: 0, ga: 0, winPct: 0,
        notes: notes[g.season_year],
      });
    }
    const row = acc.get(g.season_year)!;
    row.played += 1;
    if (!row.coach && g.coach) row.coach = g.coach;

    const r = (g.result || '').toUpperCase();
    if (r === 'W') row.wins += 1;
    else if (r === 'L') row.losses += 1;
    else if (r === 'T' || r === 'D') row.ties += 1;

    if (g.score && /^\s*\d+\s*-\s*\d+\s*$/.test(g.score)) {
      const [a, b] = g.score.split('-').map(s => Number(s.trim()));
      row.gf += a;
      row.ga += b;
    }
  }

  for (const row of acc.values()) {
    row.winPct = row.played ? (row.wins / row.played) * 100 : 0;
  }

  return Array.from(acc.values()).sort((a, b) => b.season_year - a.season_year);
}

// Program-wide totals, replacing the hand-typed numbers that used to live
// directly in components/stats-section.tsx.
export async function programOverview() {
  const rows = await seasonRows();
  let wins = 0, losses = 0, ties = 0, gf = 0, ga = 0;
  const coaches = new Set<string>();
  for (const r of rows) {
    wins += r.wins; losses += r.losses; ties += r.ties; gf += r.gf; ga += r.ga;
    if (r.coach) coaches.add(r.coach);
  }
  const played = wins + losses + ties;
  const years = rows.map(r => r.season_year);
  return {
    seasons: rows.length,
    wins, losses, ties, gf, ga,
    winPct: played ? (wins / played) * 100 : 0,
    headCoaches: coaches.size,
    yearStart: years.length ? Math.min(...years) : undefined,
    yearEnd: years.length ? Math.max(...years) : undefined,
  };
}

// Career records per coach, replacing the hand-typed array that used to live
// directly in app/coaching-records/page.tsx. Grouping happens off the coach
// column in games.csv, so a new coach shows up automatically once their
// games are logged -- nobody has to remember to edit a second file.
export async function coachRecords(): Promise<CoachRecord[]> {
  const rows = await seasonRows();
  const byCoach = new Map<string, SeasonRow[]>();

  for (const row of rows) {
    const name = row.coach?.trim();
    if (!name) continue; // skip seasons with no coach recorded rather than silently mislabeling them
    if (!byCoach.has(name)) byCoach.set(name, []);
    byCoach.get(name)!.push(row);
  }

  const records: CoachRecord[] = [];
  for (const [name, seasons] of byCoach) {
    let wins = 0, losses = 0, ties = 0;
    let best: SeasonRow | undefined;
    for (const s of seasons) {
      wins += s.wins; losses += s.losses; ties += s.ties;
      if (!best || s.winPct > best.winPct) best = s;
    }
    const played = wins + losses + ties;
    const years = seasons.map(s => s.season_year);
    records.push({
      name,
      tenureStart: Math.min(...years),
      tenureEnd: Math.max(...years),
      seasons: seasons.length,
      wins, losses, ties,
      winPct: played ? (wins / played) * 100 : 0,
      bestSeason: best,
    });
  }

  return records.sort((a, b) => a.tenureStart - b.tenureStart);
}
