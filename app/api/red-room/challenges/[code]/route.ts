import { randomUUID } from "node:crypto"
import { and, eq, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { authenticatedPlayer } from "@/lib/red-room/auth"
import { getRedRoomDb } from "@/lib/red-room/db"
import { scoreMatch, validKeeps, validShots } from "@/lib/red-room/game"
import { challenges, creditEvents, players } from "@/lib/red-room/schema"

type Props = { params: Promise<{ code: string }> }

export async function POST(request: Request, { params }: Props) {
  const me = await authenticatedPlayer()
  if (!me) return NextResponse.json({ error: "Claim your player identity first." }, { status: 401 })
  const code = (await params).code.toUpperCase()
  const body = await request.json().catch(() => null)
  if (!validShots(body?.shots) || !validKeeps(body?.keeps)) return NextResponse.json({ error: "Choose five shots and two different keeper zones for every round." }, { status: 400 })
  const db = getRedRoomDb()
  const challenge = await db.select().from(challenges).where(and(eq(challenges.code, code), eq(challenges.status, "pending"))).get()
  if (!challenge) return NextResponse.json({ error: "That challenge is no longer open." }, { status: 404 })
  if (challenge.opponentId !== me.id) return NextResponse.json({ error: "That code is tied to another player." }, { status: 403 })
  const freshMe = await db.select().from(players).where(eq(players.id, me.id)).get()
  if (!freshMe || freshMe.matchCredits <= 0) return NextResponse.json({ error: "Unlock another match pack before answering this challenge." }, { status: 409 })
  const result = scoreMatch(challenge.challengerId, challenge.opponentId, challenge.challengerShots, challenge.challengerKeeps, body.shots, body.keeps)
  const challenger = await db.select().from(players).where(eq(players.id, challenge.challengerId)).get()
  if (!challenger) return NextResponse.json({ error: "The challenger is unavailable." }, { status: 409 })
  const expectedChallenger = 1 / (1 + 10 ** ((freshMe.rating - challenger.rating) / 400))
  const actualChallenger = result.challengerScore === result.opponentScore ? 0.5 : result.challengerScore > result.opponentScore ? 1 : 0
  const challengerRating = Math.round(challenger.rating + 24 * (actualChallenger - expectedChallenger))
  const opponentRating = Math.round(freshMe.rating + 24 * ((1 - actualChallenger) - (1 - expectedChallenger)))
  const now = new Date()
  await db.transaction(async (tx) => {
    await tx.update(challenges).set({ status: "completed", opponentShots: body.shots, opponentKeeps: body.keeps, ...result, completedAt: now, updatedAt: now }).where(eq(challenges.id, challenge.id))
    await tx.update(players).set({ matchCredits: sql`${players.matchCredits} - 1`, updatedAt: now }).where(eq(players.id, me.id))
    await tx.update(players).set({ rating: challengerRating, updatedAt: now }).where(eq(players.id, challenger.id))
    await tx.update(players).set({ rating: opponentRating, updatedAt: now }).where(eq(players.id, freshMe.id))
    await tx.insert(creditEvents).values({ id: randomUUID(), playerId: me.id, delta: -1, reason: "challenge_answered", referenceId: challenge.id })
  })
  return NextResponse.json({ ok: true, result })
}
