import { randomUUID } from "node:crypto"
import { and, eq, ne, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { authenticatedPlayer } from "@/lib/red-room/auth"
import { getRedRoomDb } from "@/lib/red-room/db"
import { unusedChallengeCode, validKeeps, validShots } from "@/lib/red-room/game"
import { challenges, creditEvents, players } from "@/lib/red-room/schema"

export async function POST(request: Request) {
  const me = await authenticatedPlayer()
  if (!me) return NextResponse.json({ error: "Claim your player identity first." }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!validShots(body?.shots) || !validKeeps(body?.keeps)) return NextResponse.json({ error: "Choose five shots and two different keeper zones for every round." }, { status: 400 })
  const opponentId = String(body?.opponentId || "")
  const db = getRedRoomDb()
  const opponent = await db.select({ id: players.id }).from(players).where(and(eq(players.id, opponentId), ne(players.id, me.id))).get()
  if (!opponent) return NextResponse.json({ error: "Choose a roster opponent." }, { status: 400 })
  const freshMe = await db.select().from(players).where(eq(players.id, me.id)).get()
  if (!freshMe || freshMe.matchCredits <= 0) return NextResponse.json({ error: "You need to beat an Archive Keeper question for another match pack." }, { status: 409 })
  const id = randomUUID()
  const code = await unusedChallengeCode()
  const now = new Date()
  await db.transaction(async (tx) => {
    await tx.insert(challenges).values({ id, code, challengerId: me.id, opponentId, challengerShots: body.shots, challengerKeeps: body.keeps, expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) })
    await tx.update(players).set({ matchCredits: sql`${players.matchCredits} - 1`, updatedAt: now }).where(eq(players.id, me.id))
    await tx.insert(creditEvents).values({ id: randomUUID(), playerId: me.id, delta: -1, reason: "challenge_created", referenceId: id })
  })
  return NextResponse.json({ ok: true, code })
}
