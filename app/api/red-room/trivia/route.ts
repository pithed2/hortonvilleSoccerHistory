import { randomUUID } from "node:crypto"
import { eq, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { authenticatedPlayer } from "@/lib/red-room/auth"
import { getRedRoomDb } from "@/lib/red-room/db"
import { creditEvents, players, triviaAttempts, triviaQuestions } from "@/lib/red-room/schema"

export async function POST(request: Request) {
  const me = await authenticatedPlayer()
  if (!me) return NextResponse.json({ error: "Claim your player identity first." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const db = getRedRoomDb()
  const question = await db.select().from(triviaQuestions).where(eq(triviaQuestions.id, String(body?.questionId || ""))).get()
  if (!question || !question.active) return NextResponse.json({ error: "That archive question is unavailable." }, { status: 404 })
  const selected = String(body?.answer ?? "")
  const correct = selected === question.answer
  await db.insert(triviaAttempts).values({ id: randomUUID(), playerId: me.id, questionId: question.id, selectedAnswer: selected, correct })
  if (correct) {
    await db.transaction(async (tx) => {
      await tx.update(players).set({ matchCredits: sql`${players.matchCredits} + 3`, updatedAt: new Date() }).where(eq(players.id, me.id))
      await tx.insert(creditEvents).values({ id: randomUUID(), playerId: me.id, delta: 3, reason: "archive_question", referenceId: question.id })
    })
  }
  return NextResponse.json({ correct, hint: correct ? undefined : question.hint, sourceHref: question.sourceHref, sourceLabel: question.sourceLabel })
}
