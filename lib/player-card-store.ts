import "server-only"
import { createClient, type Client } from "@libsql/client"
import { randomBytes } from "node:crypto"
import type { CardDesign, PublishedCard } from "./player-card-types"

let client: Client | undefined
let ready: Promise<unknown> | undefined
async function db() {
  if (!client) {
    const url = process.env.PLAYER_CARDS_DATABASE_URL || process.env.TURSO_DATABASE_URL || process.env.hhs_TURSO_DATABASE_URL || process.env.RED_ROOM_DATABASE_URL
    if (!url && process.env.NODE_ENV === "production") throw new Error("Player card storage is not configured.")
    client = createClient({ url: url || "file:.player-cards.db", authToken: process.env.PLAYER_CARDS_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || process.env.hhs_TURSO_AUTH_TOKEN })
  }
  ready ??= client.execute("CREATE TABLE IF NOT EXISTS player_cards (id TEXT PRIMARY KEY, share_token TEXT NOT NULL UNIQUE, draft TEXT NOT NULL, published TEXT, updated_at TEXT NOT NULL)").catch((error) => { ready = undefined; throw error })
  await ready
  return client
}

export async function publishedCard(token: string): Promise<PublishedCard | null> {
  if (!/^[a-f0-9]{32}$/.test(token)) return null
  const result = await (await db()).execute({ sql: "SELECT published FROM player_cards WHERE share_token = ?", args: [token] })
  return result.rows[0]?.published ? JSON.parse(String(result.rows[0].published)) : null
}
export async function cardDraft(id: string): Promise<{ design: CardDesign; published: boolean; token: string } | null> {
  const result = await (await db()).execute({ sql: "SELECT draft, published, share_token FROM player_cards WHERE id = ?", args: [id] })
  return result.rows[0] ? { design: JSON.parse(String(result.rows[0].draft)), published: result.rows[0].published != null, token: String(result.rows[0].share_token) } : null
}
export async function saveCard(id: string, design: CardDesign, published?: PublishedCard) {
  const database = await db()
  await database.execute({ sql: `INSERT INTO player_cards (id, share_token, draft, published, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET draft = excluded.draft, updated_at = excluded.updated_at${published ? ", published = excluded.published" : ""}`, args: [id, randomBytes(16).toString("hex"), JSON.stringify(design), published ? JSON.stringify(published) : null, new Date().toISOString()] })
  return (await cardDraft(id))!.token
}
export async function withdrawCard(id: string) {
  await (await db()).execute({ sql: "UPDATE player_cards SET published = NULL WHERE id = ?", args: [id] })
}
