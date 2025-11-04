import fs from 'node:fs';
import path from 'node:path';
import { Game } from './types';

export function loadGames(): Game[] {
  const csv = fs.readFileSync(path.join(process.cwd(), 'data', 'games.csv'), 'utf8').trim();
  const [head, ...rows] = csv.split('\n');
  const cols = head.split(',');
  const idx = (k: string) => cols.indexOf(k);

  const toGame = (r: string): Game => {
    const parts = r.split(',');
    const get = (k: string) => parts[idx(k)] ?? '';
    return {
      season_year: Number(get('season_year')),
      date: get('date'),
      opponent: get('opponent'),
      venue: get('venue'),
      result: get('result') as any,
      score: get('score'),
      notes: get('notes'),
      home_away: get('home_away') as any,
      competition: get('competition'),
    };
  };

  return rows.filter(Boolean).map(toGame);
}

export function gamesBySeason(year: number) {
  const all = loadGames();
  return all.filter(g => g.season_year === year)
            .sort((a,b) => a.date.localeCompare(b.date) || a.opponent.localeCompare(b.opponent));
}

export function listSeasons(): number[] {
  const all = loadGames();
  return Array.from(new Set(all.map(g => g.season_year))).sort((a,b) => b - a);
}