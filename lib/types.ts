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
  coach?: string;
};

// One row of aggregated season performance, derived from Game[].
export type SeasonRow = {
  season_year: number;
  coach?: string;
  played: number;
  wins: number;
  losses: number;
  ties: number;
  gf: number;
  ga: number;
  winPct: number; // wins / played, expressed 0-100
  notes?: string;
};

// One coach's career record, derived by grouping SeasonRow[] by coach.
export type CoachRecord = {
  name: string;
  tenureStart: number;
  tenureEnd: number;
  seasons: number;
  wins: number;
  losses: number;
  ties: number;
  winPct: number; // wins / games, expressed 0-100
  bestSeason?: SeasonRow;
};