import { mkdir, readFile } from "node:fs/promises"
import { createClient } from "@libsql/client"

const url = process.env.TURSO_DATABASE_URL || process.env.RED_ROOM_DATABASE_URL || "file:.red-room/red-room.db"
if (url.startsWith("file:")) await mkdir(".red-room", { recursive: true })
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
await client.executeMultiple(await readFile("drizzle/0000_red_room.sql", "utf8"))
client.close()
console.log(`Red Room schema applied to ${url.startsWith("file:") ? url : "hosted SQLite"}.`)
