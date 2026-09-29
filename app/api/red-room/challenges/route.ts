import { randomUUID } from "node:crypto"
import { and, eq, ne, or, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { authenticatedPlayer } from "@/lib/red-room/auth"
import { getRedRoomDb } from "@/lib/red-room/db"
import { botMoves, scoreMatch, unusedChallengeCode, validKeeps, validShots } from "@/lib/red-room/game"
import { legendProgress } from "@/lib/red-room/legends"
import { challenges, creditEvents, players, triviaAttempts } from "@/lib/red-room/schema"

export async function POST(request: Request) {
  const me = await authenticatedPlayer()
  if (!me) return NextResponse.json({ error: "Claim your player identity first." }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!validShots(body?.shots) || !validKeeps(body?.keeps)) return NextResponse.json({ error: "Choose five shots and two different keeper zones for every round." }, { status: 400 })
  const opponentId = String(body?.opponentId || "")
  const db = getRedRoomDb()
  const opponent = await db.select().from(players).where(and(eq(players.id, opponentId), ne(players.id, me.id))).get()
  if (!opponent) return NextResponse.json({ error: "Choose a roster opponent." }, { status: 400 })
  const freshMe = await db.select().from(players).where(eq(players.id, me.id)).get()
  if (!freshMe || freshMe.matchCredits <= 0) return NextResponse.json({ error: "You need to beat an Archive Keeper question for another match pack." }, { status: 409 })
  if (opponent.accountType === "legend" && freshMe.accountType !== "coach") {
    const [matches, correctAttempts] = await Promise.all([
      db.select().from(challenges).where(and(eq(challenges.status, "completed"), or(eq(challenges.challengerId, me.id), eq(challenges.opponentId, me.id)))),
      db.select({ questionId: triviaAttempts.questionId }).from(triviaAttempts).where(and(eq(triviaAttempts.playerId, me.id), eq(triviaAttempts.correct, true))),
    ])
    const wins = matches.filter((challenge) => challenge.challengerId === me.id ? (challenge.challengerScore || 0) > (challenge.opponentScore || 0) : (challenge.opponentScore || 0) > (challenge.challengerScore || 0)).length
    const answered = new Set(correctAttempts.map((attempt) => attempt.questionId)).size
    const progress = legendProgress(opponent.publicTag, wins, answered)
    if (!progress?.unlocked) return NextResponse.json({ error: `That legend is still locked. Earn ${progress?.wins ?? 0} wins and solve ${progress?.archiveAnswers ?? 0} archive questions first.` }, { status: 403 })
  }
  const id = randomUUID()
  const code = await unusedChallengeCode()
  const now = new Date()
  const bot = opponent.isBot ? botMoves(opponent.id, id) : null
  const botResult = bot ? scoreMatch(me.id, opponent.id, body.shots, body.keeps, bot.shots, bot.keeps, { seed: id, challengerAbility: freshMe.specialAbility, opponentAbility: opponent.specialAbility }) : null
  const expectedMe = 1 / (1 + 10 ** ((opponent.rating - freshMe.rating) / 400))
  const actualMe = botResult ? botResult.challengerScore === botResult.opponentScore ? 0.5 : botResult.challengerScore > botResult.opponentScore ? 1 : 0 : 0
  const myRating = botResult ? Math.round(freshMe.rating + 24 * (actualMe - expectedMe)) : freshMe.rating
  const opponentRating = botResult ? Math.round(opponent.rating + 24 * ((1 - actualMe) - (1 - expectedMe))) : opponent.rating
  await db.transaction(async (tx) => {
    await tx.insert(challenges).values({ id, code, challengerId: me.id, opponentId, challengerShots: body.shots, challengerKeeps: body.keeps, opponentShots: bot?.shots, opponentKeeps: bot?.keeps, status: botResult ? "completed" : "pending", challengerScore: botResult?.challengerScore, opponentScore: botResult?.opponentScore, replay: botResult?.replay, completedAt: botResult ? now : null, expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) })
    await tx.update(players).set({ matchCredits: sql`${players.matchCredits} - 1`, rating: myRating, updatedAt: now }).where(eq(players.id, me.id))
    if (botResult) await tx.update(players).set({ rating: opponentRating, updatedAt: now }).where(eq(players.id, opponent.id))
    await tx.insert(creditEvents).values({ id: randomUUID(), playerId: me.id, delta: -1, reason: "challenge_created", referenceId: id })
  })
  return NextResponse.json({ ok: true, code, completed: Boolean(botResult) })
}
