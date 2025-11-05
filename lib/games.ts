// lib/games.ts
import fs from 'node:fs';
import path from 'node:path';
import { Game } from './types';

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

function readPublicData(...names: string[]): string {
  for (const n of names) {
    const p = path.join(process.cwd(), 'public', 'data', n);
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  return '';
}

export function loadGames(): Game[] {
  const csvText = readPublicData('games.csv', 'games_textscore.csv');
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
    } as Game;
  }).filter(g => Number.isFinite(g.season_year));
}

export function gamesBySeason(year: number) {
  const all = loadGames();
  return all
    .filter(g => g.season_year === year)
    .sort((a, b) => a.date.localeCompare(b.date) || a.opponent.localeCompare(b.opponent));
}

export function listSeasons(): number[] {
  const all = loadGames();
  return Array.from(new Set(all.map(g => g.season_year)))
    .filter(Boolean)
    .sort((a, b) => b - a);
}
