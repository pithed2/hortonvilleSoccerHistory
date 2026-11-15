import "server-only"
import { createClient, type Client } from "@libsql/client"
import { randomUUID, randomBytes } from "node:crypto"
import { PLAYER_CARD_LIMIT, type CardDesign, type CardPlayer } from "./player-card-types"

export type StoredCard = { id: string; ownerId: string; title: string; draft: CardDesign; submitted: { title: string; design: CardDesign; player: CardPlayer; revision: number } | null; approved: { title: string; design: CardDesign; player: CardPlayer; revision: number } | null; status: string; revision: number; token: string }
let conn: Client | undefined
let initialized: Promise<unknown> | undefined
async function db() {
  if (process.env.CARD_STUDIO_WRITES_ENABLED !== "true") throw new Error("Card Studio is not enabled on this deployment.")
  if (!conn) {
    const url = process.env.TURSO_DATABASE_URL || process.env.RED_ROOM_DATABASE_URL || (process.env.NODE_ENV !== "production" ? process.env.hhs_TURSO_DATABASE_URL : undefined)
    if (!url && process.env.NODE_ENV === "production") throw new Error("Red Room database is not configured.")
    conn = createClient({ url: url || "file:.red-room/red-room.db", authToken: process.env.TURSO_AUTH_TOKEN || process.env.RED_ROOM_AUTH_TOKEN })
  }
  const client = conn
  initialized ??= client.executeMultiple([
    "CREATE TABLE IF NOT EXISTS card_studio_cards (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES red_room_players(id), title TEXT NOT NULL, draft TEXT NOT NULL, submitted TEXT, approved TEXT, status TEXT NOT NULL DEFAULT 'draft', revision INTEGER NOT NULL DEFAULT 0, token TEXT NOT NULL UNIQUE, updated_at TEXT NOT NULL)",
    "CREATE INDEX IF NOT EXISTS card_studio_owner_idx ON card_studio_cards(owner_id)",
    "CREATE TABLE IF NOT EXISTS card_studio_reviews (id TEXT PRIMARY KEY, card_id TEXT NOT NULL, revision INTEGER NOT NULL, coach_id TEXT NOT NULL, decision TEXT NOT NULL, reason TEXT, reviewed_at TEXT NOT NULL, UNIQUE(card_id,revision,decision))",
    "CREATE TABLE IF NOT EXISTS card_studio_notifications (card_id TEXT NOT NULL, revision INTEGER NOT NULL, state TEXT NOT NULL DEFAULT 'queued', attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT, updated_at TEXT NOT NULL, PRIMARY KEY(card_id, revision))",
  ].join(";") + ";").catch((error) => { initialized = undefined; throw error })
  await initialized
  return client
}
function decode(row: Record<string, unknown>): StoredCard {
  return { id: String(row.id), ownerId: String(row.owner_id), title: String(row.title), draft: JSON.parse(String(row.draft)), submitted: row.submitted ? JSON.parse(String(row.submitted)) : null, approved: row.approved ? JSON.parse(String(row.approved)) : null, status: String(row.status), revision: Number(row.revision), token: String(row.token) }
}
export async function playerCards(ownerId: string): Promise<StoredCard[]> {
  const rows = await (await db()).execute({ sql: "SELECT * FROM card_studio_cards WHERE owner_id = ? ORDER BY updated_at DESC", args: [ownerId] })
  return rows.rows.map(decode)
}
export async function getCard(id: string): Promise<StoredCard | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null
  const rows = await (await db()).execute({ sql: "SELECT * FROM card_studio_cards WHERE id = ?", args: [id] })
  return rows.rows[0] ? decode(rows.rows[0]) : null
}
export async function publicCard(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return null
  const rows = await (await db()).execute({ sql: "SELECT title, approved FROM card_studio_cards WHERE token = ? AND approved IS NOT NULL AND status <> 'withdrawn'", args: [token] })
  return rows.rows[0] ? { ...JSON.parse(String(rows.rows[0].approved)) as { title: string; player: CardPlayer; design: CardDesign; revision: number } } : null
}
export async function createCard(ownerId: string, title: string, design: CardDesign) {
  const client = await db()
  // Keep the count check and insert in a write transaction so concurrent clicks
  // cannot bypass the per-player limit.
  const tx = await client.transaction("write")
  try {
    const counts = await tx.execute({
      sql: "SELECT COUNT(*) AS n FROM card_studio_cards WHERE owner_id = ?",
      args: [ownerId],
    })
    if (Number(counts.rows[0]?.n) >= PLAYER_CARD_LIMIT) {
      throw new Error("You can have up to " + PLAYER_CARD_LIMIT + " cards. Edit an existing card instead.")
    }
    const id = randomUUID()
    await tx.execute({
      sql: "INSERT INTO card_studio_cards (id, owner_id, title, draft, token, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, ownerId, title, JSON.stringify(design), randomBytes(16).toString("hex"), new Date().toISOString()],
    })
    await tx.commit()
    return id
  } catch (error) {
    await tx.rollback()
    throw error
  } finally {
    tx.close()
  }
}
/** Players may discard an unsubmitted draft to free one of their three slots. */
export async function deleteUnusedCard(id: string, ownerId: string) {
  const result = await (await db()).execute({
    sql: "DELETE FROM card_studio_cards WHERE id = ? AND owner_id = ? AND status = 'draft' AND submitted IS NULL AND approved IS NULL",
    args: [id, ownerId],
  })
  if (!result.rowsAffected) throw new Error("Only an unsubmitted draft belonging to you can be deleted.")
}
export async function saveDraft(id: string, ownerId: string, title: string, design: CardDesign) {
  const result = await (await db()).execute({ sql: "UPDATE card_studio_cards SET title=?, draft=?, updated_at=? WHERE id=? AND owner_id=?", args: [title, JSON.stringify(design), new Date().toISOString(), id, ownerId] })
  if (!result.rowsAffected) throw new Error("Card not found or access denied.")
}
export async function submitCard(id: string, ownerId: string, player: CardPlayer) {
  const client = await db()
  const tx = await client.transaction("write")
  try {
    const found = await tx.execute({ sql: "SELECT * FROM card_studio_cards WHERE id=? AND owner_id=?", args: [id, ownerId] })
    if (!found.rows[0]) throw new Error("Card not found or access denied.")
    const card = decode(found.rows[0])
    if (card.status === "pending") throw new Error("This card is already pending approval.")
    const revision = card.revision + 1
    const now = new Date().toISOString()
    await tx.execute({ sql: "UPDATE card_studio_cards SET submitted=?, revision=?, status='pending', updated_at=? WHERE id=? AND owner_id=?", args: [JSON.stringify({ title: card.title, player, design: card.draft, revision }), revision, now, id, ownerId] })
    await tx.execute({ sql: "INSERT INTO card_studio_notifications (card_id,revision,updated_at) VALUES (?,?,?)", args: [id, revision, now] })
    await tx.commit()
    return revision
  } catch (error) { await tx.rollback(); throw error } finally { tx.close() }
}
export async function pendingCards() {
  const rows = await (await db()).execute("SELECT c.*,p.display_name AS owner_name,p.public_tag AS owner_tag FROM card_studio_cards c JOIN red_room_players p ON p.id=c.owner_id WHERE c.status='pending' ORDER BY c.updated_at")
  return rows.rows.map((row) => ({ ...decode(row), ownerName: String(row.owner_name), ownerTag: String(row.owner_tag) }))
}
export async function decideCard(id: string, revision: number, coachId: string, decision: "approved" | "rejected", reason: string) {
  const tx = await (await db()).transaction("write")
  try {
    const found = await tx.execute({ sql: "SELECT * FROM card_studio_cards WHERE id=?", args: [id] })
    if (!found.rows[0]) throw new Error("Card missing.")
    const card = decode(found.rows[0])
    if (card.status !== "pending" || card.revision !== revision || !card.submitted) throw new Error("Card already reviewed. Refresh.")
    const now = new Date().toISOString()
    const result = await tx.execute({
      sql: "UPDATE card_studio_cards SET approved=CASE WHEN ?='approved' THEN submitted ELSE approved END, submitted=NULL, status=?, updated_at=? WHERE id=? AND status='pending' AND revision=?",
      args: [decision, decision, now, id, revision],
    })
    if (!result.rowsAffected) throw new Error("Submission already handled.")
    await tx.execute({ sql: "INSERT INTO card_studio_reviews (id,card_id,revision,coach_id,decision,reason,reviewed_at) VALUES (?,?,?,?,?,?,?)", args: [randomUUID(), id, revision, coachId, decision, reason, now] })
    await tx.commit()
  } catch (error) { await tx.rollback(); throw error } finally { tx.close() }
}
export async function updateNotification(id: string, revision: number, state: "sent" | "failed", error = "") {
  await (await db()).execute({ sql: "UPDATE card_studio_notifications SET state=?, attempts=attempts+1, last_error=?, updated_at=? WHERE card_id=? AND revision=?", args: [state, error.slice(0,500), new Date().toISOString(), id, revision] })
}

export async function approvedCards() {
  const rows = await (await db()).execute("SELECT c.*,p.display_name AS owner_name,p.public_tag AS owner_tag FROM card_studio_cards c JOIN red_room_players p ON p.id=c.owner_id WHERE c.approved IS NOT NULL AND c.status <> 'withdrawn' ORDER BY c.updated_at DESC")
  return rows.rows.map(row => ({ ...decode(row), ownerName: String(row.owner_name), ownerTag: String(row.owner_tag) }))
}
export async function withdrawCard(id: string, coachId: string) {
  const client = await db()
  const tx = await client.transaction("write")
  try {
    const found = await tx.execute({ sql: "SELECT revision FROM card_studio_cards WHERE id=? AND approved IS NOT NULL", args: [id] })
    if (!found.rows[0]) throw new Error("No approved card found.")
    const revision = Number(found.rows[0].revision)
    await tx.execute({ sql: "UPDATE card_studio_cards SET approved=NULL, submitted=NULL, status='withdrawn', updated_at=? WHERE id=?", args: [new Date().toISOString(),id] })
    await tx.execute({ sql: "INSERT INTO card_studio_reviews (id,card_id,revision,coach_id,decision,reason,reviewed_at) VALUES (?,?,?,?,?,?,?)", args: [randomUUID(),id,revision,coachId,"withdrawn","Withdrawn by coach",new Date().toISOString()] })
    await tx.commit()
  } catch(error) { await tx.rollback(); throw error } finally { tx.close() }
}
