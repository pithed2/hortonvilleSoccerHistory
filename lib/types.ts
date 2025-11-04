export type Game = {
  season_year: number;
  date: string; // ISO yyyy-mm-dd
  opponent: string;
  venue?: string;
  result?: 'W'|'L'|'T'|string;
  score?: string; // "2-1"
  notes?: string;
  home_away?: 'Home'|'Away'|string;
  competition?: string;
};