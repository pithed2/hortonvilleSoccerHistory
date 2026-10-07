import { mkdir, readFile } from "node:fs/promises"
import { createClient } from "@libsql/client"

const url = process.env.TURSO_DATABASE_URL || process.env.hhs_TURSO_DATABASE_URL || process.env.RED_ROOM_DATABASE_URL || "file:.red-room/red-room.db"
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.hhs_TURSO_AUTH_TOKEN
if (url.startsWith("file:")) await mkdir(".red-room", { recursive: true })
const client = createClient({ url, authToken })
await client.executeMultiple(await readFile("drizzle/0000_red_room.sql", "utf8"))
const columns = new Set((await client.execute("PRAGMA table_info(red_room_players)")).rows.map((row) => String(row.name)))
const additions = [
  ["instructions_seen_at", "ALTER TABLE red_room_players ADD COLUMN instructions_seen_at INTEGER"],
  ["account_type", "ALTER TABLE red_room_players ADD COLUMN account_type TEXT DEFAULT 'player' NOT NULL"],
  ["is_bot", "ALTER TABLE red_room_players ADD COLUMN is_bot INTEGER DEFAULT 0 NOT NULL"],
  ["special_ability", "ALTER TABLE red_room_players ADD COLUMN special_ability TEXT"],
  ["special_ability_label", "ALTER TABLE red_room_players ADD COLUMN special_ability_label TEXT"],
]
for (const [name, statement] of additions) if (!columns.has(name)) await client.execute(statement)
// Previously claimed identities have already visited the room.
if (!columns.has("instructions_seen_at")) await client.execute("UPDATE red_room_players SET instructions_seen_at = claimed_at WHERE claimed_at IS NOT NULL")
// Apply the larger starting pack once, preserving every credit already spent.
await client.execute("CREATE TABLE IF NOT EXISTS red_room_migrations (id TEXT PRIMARY KEY NOT NULL, applied_at INTEGER NOT NULL)")
const tx = await client.transaction("write")
try {
  const migrationId = "starting-match-credits-10"
  const applied = await tx.execute({ sql: "SELECT id FROM red_room_migrations WHERE id = ?", args: [migrationId] })
  if (!applied.rows.length) {
    const now = Date.now()
    await tx.execute({ sql: "INSERT INTO red_room_credit_events (id, player_id, delta, reason, reference_id, created_at) SELECT 'starting-pack-10:' || id, id, 7, 'starting_credit_increase', ?, ? FROM red_room_players WHERE account_type IN ('player', 'private') AND is_bot = 0", args: [migrationId, now] })
    await tx.execute({ sql: "UPDATE red_room_players SET match_credits = match_credits + 7, updated_at = ? WHERE account_type IN ('player', 'private') AND is_bot = 0", args: [now] })
    await tx.execute({ sql: "INSERT INTO red_room_migrations (id, applied_at) VALUES (?, ?)", args: [migrationId, now] })
  }
  await tx.commit()
} catch (error) {
  await tx.rollback()
  throw error
} finally {
  tx.close()
}
client.close()
console.log(`Red Room schema applied to ${url.startsWith("file:") ? url : "hosted SQLite"}.`)
