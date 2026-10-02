import { desc, eq, or } from "drizzle-orm"
import { NextResponse } from "next/server"
import { authenticatedPlayer } from "@/lib/red-room/auth"
import { getRedRoomDb } from "@/lib/red-room/db"
import { canSeeRedRoomPlayer, isPrivateRedRoomMatch, isPrivateRedRoomPlayer } from "@/lib/red-room/access"
import { legendAbilityLabel, legendProgress } from "@/lib/red-room/legends"
import { challenges, players, rosterMemberships, triviaQuestions } from "@/lib/red-room/schema"

export async function GET() {
  const me = await authenticatedPlayer()
  if (!me) return NextResponse.json({ authenticated: false })
  const db = getRedRoomDb()
  const [roster, memberships, myChallenges, allCompleted, questions, attempts] = await Promise.all([
    db.select({ id: players.id, displayName: players.displayName, publicTag: players.publicTag, rating: players.rating, accountType: players.accountType, isBot: players.isBot, specialAbility: players.specialAbility, specialAbilityLabel: players.specialAbilityLabel, tauntId: players.tauntId, victoryId: players.victoryId, celebrationId: players.celebrationId }).from(players).orderBy(players.displayName),
    db.select().from(rosterMemberships),
    db.select().from(challenges).where(or(eq(challenges.challengerId, me.id), eq(challenges.opponentId, me.id))).orderBy(desc(challenges.createdAt)).limit(20),
    db.select().from(challenges).where(eq(challenges.status, "completed")),
    db.select({ id: triviaQuestions.id, prompt: triviaQuestions.prompt, choices: triviaQuestions.choices, hint: triviaQuestions.hint, sourceHref: triviaQuestions.sourceHref, sourceLabel: triviaQuestions.sourceLabel }).from(triviaQuestions).where(eq(triviaQuestions.active, true)),
    db.query.triviaAttempts.findMany({ where: (attempt, { eq }) => eq(attempt.playerId, me.id) }),
  ])
  const squadByPlayer = new Map<string, string[]>()
  for (const membership of memberships) squadByPlayer.set(membership.playerId, [...(squadByPlayer.get(membership.playerId) || []), membership.squad])
  const playerById = new Map(roster.map((player) => [player.id, player]))
  const complete = myChallenges.filter((challenge) => challenge.status === "completed")
  const wins = complete.filter((challenge) => challenge.challengerId === me.id ? (challenge.challengerScore || 0) > (challenge.opponentScore || 0) : (challenge.opponentScore || 0) > (challenge.challengerScore || 0)).length
  const losses = complete.filter((challenge) => challenge.challengerId === me.id ? (challenge.challengerScore || 0) < (challenge.opponentScore || 0) : (challenge.opponentScore || 0) < (challenge.challengerScore || 0)).length
  const overallCompleted = allCompleted.filter((challenge) => {
    const challenger = playerById.get(challenge.challengerId)
    const opponent = playerById.get(challenge.opponentId)
    return challenger && opponent && !isPrivateRedRoomMatch(challenger, opponent)
  })
  const leaderboard = roster.filter((player) => !isPrivateRedRoomPlayer(player)).map((player) => {
    const matches = overallCompleted.filter((challenge) => challenge.challengerId === player.id || challenge.opponentId === player.id)
    const wins = matches.filter((challenge) => challenge.challengerId === player.id ? (challenge.challengerScore || 0) > (challenge.opponentScore || 0) : (challenge.opponentScore || 0) > (challenge.challengerScore || 0)).length
    const losses = matches.filter((challenge) => challenge.challengerId === player.id ? (challenge.challengerScore || 0) < (challenge.opponentScore || 0) : (challenge.opponentScore || 0) < (challenge.challengerScore || 0)).length
    return { ...player, squads: squadByPlayer.get(player.id) || [], matches: matches.length, wins, losses, draws: matches.length - wins - losses }
  }).filter((player) => player.matches > 0).sort((a, b) => b.rating - a.rating || b.wins - a.wins || a.displayName.localeCompare(b.displayName)).slice(0, 10)
  const activeQuestionIds = new Set(questions.map((question) => question.id))
  const correctlyAnswered = new Set(attempts.filter((attempt) => attempt.correct && activeQuestionIds.has(attempt.questionId)).map((attempt) => attempt.questionId))
  const lastAttemptByQuestion = new Map<string, number>()
  for (const attempt of attempts) lastAttemptByQuestion.set(attempt.questionId, Math.max(lastAttemptByQuestion.get(attempt.questionId) || 0, attempt.attemptedAt.getTime()))
  const unansweredQuestion = questions.find((candidate) => !correctlyAnswered.has(candidate.id))
  const reviewQuestion = [...questions].sort((a, b) => (lastAttemptByQuestion.get(a.id) || 0) - (lastAttemptByQuestion.get(b.id) || 0))[0]
  const question = unansweredQuestion || reviewQuestion || null
  return NextResponse.json({
    authenticated: true,
    me: { id: me.id, displayName: me.displayName, publicTag: me.publicTag, accountType: me.accountType, isBot: me.isBot, specialAbility: me.specialAbility, specialAbilityLabel: me.specialAbilityLabel, matchCredits: me.matchCredits, rating: me.rating, tauntId: me.tauntId, victoryId: me.victoryId, celebrationId: me.celebrationId, squads: squadByPlayer.get(me.id) || [] },
    players: roster.filter((player) => player.id !== me.id && canSeeRedRoomPlayer(me, player)).map((player) => ({ ...player, specialAbilityLabel: legendAbilityLabel(player.specialAbility, player.specialAbilityLabel), squads: squadByPlayer.get(player.id) || [], legendUnlock: legendProgress(player.publicTag, wins, correctlyAnswered.size, me.accountType === "coach" || me.accountType === "private") })),
    challenges: myChallenges.map((challenge) => ({
      ...challenge,
      challengerTauntId: playerById.get(challenge.challengerId)?.tauntId || "pressure",
      opponentTauntId: playerById.get(challenge.opponentId)?.tauntId || "pressure",
      challengerName: playerById.get(challenge.challengerId)?.displayName,
      opponentName: playerById.get(challenge.opponentId)?.displayName,
      challengerVictoryId: playerById.get(challenge.challengerId)?.victoryId,
      opponentVictoryId: playerById.get(challenge.opponentId)?.victoryId,
      challengerCelebrationId: playerById.get(challenge.challengerId)?.celebrationId,
      opponentCelebrationId: playerById.get(challenge.opponentId)?.celebrationId,
      isMineToAnswer: challenge.status === "pending" && challenge.opponentId === me.id,
    })),
    stats: { matches: complete.length, wins, losses, draws: complete.length - wins - losses, archiveAnswers: correctlyAnswered.size },
    archive: { correct: correctlyAnswered.size, total: questions.length },
    leaderboard,
    question: me.matchCredits <= 0 && question ? { ...question, review: correctlyAnswered.has(question.id) } : null,
  })
}
