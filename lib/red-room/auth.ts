import "server-only"

import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto"
import { and, eq, gt } from "drizzle-orm"
import { cookies } from "next/headers"
import { getRedRoomDb } from "./db"
import { players, sessions } from "./schema"

export const RED_ROOM_COOKIE = "red_room_session"
const SESSION_DAYS = 180

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function validClaimKey(key: string, salt: string, expected: string) {
  const actual = scryptSync(key.trim().toUpperCase(), salt, 64)
  const target = Buffer.from(expected, "hex")
  return actual.length === target.length && timingSafeEqual(actual, target)
}

export async function createPlayerSession(playerId: string) {
  const db = getRedRoomDb()
  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await db.insert(sessions).values({ id: randomUUID(), playerId, tokenHash: hashToken(token), expiresAt })
  const jar = await cookies()
  jar.set(RED_ROOM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

export async function authenticatedPlayer() {
  const token = (await cookies()).get(RED_ROOM_COOKIE)?.value
  if (!token) return null
  const db = getRedRoomDb()
  const result = await db.select({ player: players, sessionId: sessions.id })
    .from(sessions)
    .innerJoin(players, eq(players.id, sessions.playerId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .get()
  return result?.player ?? null
}

export async function clearPlayerSession() {
  const jar = await cookies()
  const token = jar.get(RED_ROOM_COOKIE)?.value
  if (token) await getRedRoomDb().delete(sessions).where(eq(sessions.tokenHash, hashToken(token)))
  jar.delete(RED_ROOM_COOKIE)
}
