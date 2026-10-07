import "server-only"

import { createClient, type Client } from "@libsql/client"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import * as schema from "./schema"

let client: Client | undefined
let database: LibSQLDatabase<typeof schema> | undefined

export function getRedRoomDb() {
  if (database) return database
  const configuredUrl = process.env.TURSO_DATABASE_URL || process.env.RED_ROOM_DATABASE_URL || (process.env.NODE_ENV !== "production" ? process.env.hhs_TURSO_DATABASE_URL : undefined)
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.RED_ROOM_AUTH_TOKEN || (process.env.NODE_ENV !== "production" ? process.env.hhs_TURSO_AUTH_TOKEN : undefined)
  if (process.env.NODE_ENV === "production" && !configuredUrl) throw new Error("Red Room database is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to the shared master database.")
  const url = configuredUrl || "file:.red-room/red-room.db"
  client = createClient({ url, authToken })
  database = drizzle(client, { schema })
  return database
}

export function redRoomDatabaseConfigured() {
  return process.env.NODE_ENV !== "production" || Boolean(process.env.TURSO_DATABASE_URL || process.env.RED_ROOM_DATABASE_URL)
}
