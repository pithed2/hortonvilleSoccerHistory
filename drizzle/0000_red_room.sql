CREATE TABLE IF NOT EXISTS red_room_players (
  id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  public_tag TEXT NOT NULL UNIQUE,
  claim_key_salt TEXT NOT NULL,
  claim_key_hash TEXT NOT NULL,
  claimed_at INTEGER,
  match_credits INTEGER DEFAULT 3 NOT NULL,
  rating INTEGER DEFAULT 1000 NOT NULL,
  taunt_id TEXT DEFAULT 'pressure' NOT NULL,
  victory_id TEXT DEFAULT 'cold' NOT NULL,
  celebration_id TEXT DEFAULT 'ice' NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS red_room_players_tag_idx ON red_room_players (public_tag);

CREATE TABLE IF NOT EXISTS red_room_roster_memberships (
  player_id TEXT NOT NULL REFERENCES red_room_players(id) ON DELETE CASCADE,
  squad TEXT NOT NULL,
  jersey TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0 NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (player_id, squad)
);
CREATE INDEX IF NOT EXISTS red_room_memberships_squad_idx ON red_room_roster_memberships (squad);

CREATE TABLE IF NOT EXISTS red_room_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  player_id TEXT NOT NULL REFERENCES red_room_players(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS red_room_sessions_player_idx ON red_room_sessions (player_id);

CREATE TABLE IF NOT EXISTS red_room_challenges (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT NOT NULL UNIQUE,
  challenger_id TEXT NOT NULL REFERENCES red_room_players(id),
  opponent_id TEXT NOT NULL REFERENCES red_room_players(id),
  status TEXT DEFAULT 'pending' NOT NULL,
  challenger_shots TEXT NOT NULL,
  challenger_keeps TEXT NOT NULL,
  opponent_shots TEXT,
  opponent_keeps TEXT,
  challenger_score INTEGER,
  opponent_score INTEGER,
  replay TEXT,
  expires_at INTEGER NOT NULL,
  completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS red_room_challenges_challenger_idx ON red_room_challenges (challenger_id);
CREATE INDEX IF NOT EXISTS red_room_challenges_opponent_idx ON red_room_challenges (opponent_id);

CREATE TABLE IF NOT EXISTS red_room_trivia_questions (
  id TEXT PRIMARY KEY NOT NULL,
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  choices TEXT NOT NULL,
  hint TEXT NOT NULL,
  source_href TEXT NOT NULL,
  source_label TEXT NOT NULL,
  active INTEGER DEFAULT 1 NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS red_room_trivia_attempts (
  id TEXT PRIMARY KEY NOT NULL,
  player_id TEXT NOT NULL REFERENCES red_room_players(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES red_room_trivia_questions(id),
  selected_answer TEXT NOT NULL,
  correct INTEGER NOT NULL,
  attempted_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS red_room_attempts_player_idx ON red_room_trivia_attempts (player_id);

CREATE TABLE IF NOT EXISTS red_room_credit_events (
  id TEXT PRIMARY KEY NOT NULL,
  player_id TEXT NOT NULL REFERENCES red_room_players(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS red_room_credits_player_idx ON red_room_credit_events (player_id);
