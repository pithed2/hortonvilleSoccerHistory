import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}

export const players = sqliteTable("red_room_players", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  normalizedName: text("normalized_name").notNull().unique(),
  publicTag: text("public_tag").notNull().unique(),
  accountType: text("account_type", { enum: ["player", "coach", "legend"] }).notNull().default("player"),
  isBot: integer("is_bot", { mode: "boolean" }).notNull().default(false),
  specialAbility: text("special_ability"),
  specialAbilityLabel: text("special_ability_label"),
  claimKeySalt: text("claim_key_salt").notNull(),
  claimKeyHash: text("claim_key_hash").notNull(),
  claimedAt: integer("claimed_at", { mode: "timestamp_ms" }),
  matchCredits: integer("match_credits").notNull().default(3),
  rating: integer("rating").notNull().default(1000),
  tauntId: text("taunt_id").notNull().default("pressure"),
  victoryId: text("victory_id").notNull().default("cold"),
  celebrationId: text("celebration_id").notNull().default("ice"),
  ...timestamps,
}, (table) => [uniqueIndex("red_room_players_tag_idx").on(table.publicTag)])

export const rosterMemberships = sqliteTable("red_room_roster_memberships", {
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  squad: text("squad").notNull(),
  jersey: text("jersey").notNull(),
  isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.playerId, table.squad] }),
  index("red_room_memberships_squad_idx").on(table.squad),
])

export const sessions = sqliteTable("red_room_sessions", {
  id: text("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (table) => [index("red_room_sessions_player_idx").on(table.playerId)])

export type KeeperPick = [number, number]

export const challenges = sqliteTable("red_room_challenges", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  challengerId: text("challenger_id").notNull().references(() => players.id),
  opponentId: text("opponent_id").notNull().references(() => players.id),
  status: text("status", { enum: ["pending", "completed", "expired"] }).notNull().default("pending"),
  challengerShots: text("challenger_shots", { mode: "json" }).$type<number[]>().notNull(),
  challengerKeeps: text("challenger_keeps", { mode: "json" }).$type<KeeperPick[]>().notNull(),
  opponentShots: text("opponent_shots", { mode: "json" }).$type<number[]>(),
  opponentKeeps: text("opponent_keeps", { mode: "json" }).$type<KeeperPick[]>(),
  challengerScore: integer("challenger_score"),
  opponentScore: integer("opponent_score"),
  replay: text("replay", { mode: "json" }).$type<Array<{ shooterId: string; keeperId: string; shot: number; covered: number[]; originalCovered?: number[]; goal: boolean; ability?: string }>>(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  ...timestamps,
}, (table) => [
  index("red_room_challenges_challenger_idx").on(table.challengerId),
  index("red_room_challenges_opponent_idx").on(table.opponentId),
])

export const triviaQuestions = sqliteTable("red_room_trivia_questions", {
  id: text("id").primaryKey(),
  prompt: text("prompt").notNull(),
  answer: text("answer").notNull(),
  choices: text("choices", { mode: "json" }).$type<string[]>().notNull(),
  hint: text("hint").notNull(),
  sourceHref: text("source_href").notNull(),
  sourceLabel: text("source_label").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
})

export const triviaAttempts = sqliteTable("red_room_trivia_attempts", {
  id: text("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => triviaQuestions.id),
  selectedAnswer: text("selected_answer").notNull(),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  attemptedAt: integer("attempted_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (table) => [index("red_room_attempts_player_idx").on(table.playerId)])

export const creditEvents = sqliteTable("red_room_credit_events", {
  id: text("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  referenceId: text("reference_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (table) => [index("red_room_credits_player_idx").on(table.playerId)])
