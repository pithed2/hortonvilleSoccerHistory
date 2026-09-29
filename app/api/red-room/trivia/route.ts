import { randomUUID } from "node:crypto"
import { and, eq, lte, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { authenticatedPlayer } from "@/lib/red-room/auth"
import { getRedRoomDb } from "@/lib/red-room/db"
import { creditEvents, players, triviaAttempts, triviaQuestions } from "@/lib/red-room/schema"

export async function POST(request: Request) {
  const me = await authenticatedPlayer()
  if (!me) return NextResponse.json({ error: "Claim your player identity first." }, { status: 401 })
  if (me.matchCredits > 0) return NextResponse.json({ error: "Save the archive questions for when your match pack is empty." }, { status: 409 })
  const body = await request.json().catch(() => null)
  const db = getRedRoomDb()
  const question = await db.select().from(triviaQuestions).where(eq(triviaQuestions.id, String(body?.questionId || ""))).get()
  if (!question || !question.active) return NextResponse.json({ error: "That archive question is unavailable." }, { status: 404 })
  const selected = String(body?.answer ?? "")
  const correct = selected === question.answer
  await db.insert(triviaAttempts).values({ id: randomUUID(), playerId: me.id, questionId: question.id, selectedAnswer: selected, correct })
  if (correct) {
    await db.transaction(async (tx) => {
      const credited = await tx.update(players).set({ matchCredits: sql`${players.matchCredits} + 3`, updatedAt: new Date() }).where(and(eq(players.id, me.id), lte(players.matchCredits, 0))).returning({ id: players.id })
      if (credited.length) await tx.insert(creditEvents).values({ id: randomUUID(), playerId: me.id, delta: 3, reason: "archive_question", referenceId: question.id })
    })
  }
  return NextResponse.json({ correct, hint: correct ? undefined : question.hint, sourceHref: question.sourceHref, sourceLabel: question.sourceLabel })
}
