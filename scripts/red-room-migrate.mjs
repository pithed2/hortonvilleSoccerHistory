import { mkdir, readFile } from "node:fs/promises"
import { createClient } from "@libsql/client"

const url = process.env.TURSO_DATABASE_URL || process.env.hhs_TURSO_DATABASE_URL || process.env.RED_ROOM_DATABASE_URL || "file:.red-room/red-room.db"
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.hhs_TURSO_AUTH_TOKEN
if (url.startsWith("file:")) await mkdir(".red-room", { recursive: true })
const client = createClient({ url, authToken })
await client.executeMultiple(await readFile("drizzle/0000_red_room.sql", "utf8"))
const columns = new Set((await client.execute("PRAGMA table_info(red_room_players)")).rows.map((row) => String(row.name)))
const additions = [
  ["account_type", "ALTER TABLE red_room_players ADD COLUMN account_type TEXT DEFAULT 'player' NOT NULL"],
  ["is_bot", "ALTER TABLE red_room_players ADD COLUMN is_bot INTEGER DEFAULT 0 NOT NULL"],
  ["special_ability", "ALTER TABLE red_room_players ADD COLUMN special_ability TEXT"],
  ["special_ability_label", "ALTER TABLE red_room_players ADD COLUMN special_ability_label TEXT"],
]
for (const [name, statement] of additions) if (!columns.has(name)) await client.execute(statement)
client.close()
console.log(`Red Room schema applied to ${url.startsWith("file:") ? url : "hosted SQLite"}.`)
