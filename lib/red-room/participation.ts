import "server-only"
import { eq } from "drizzle-orm"
import { getRedRoomDb } from "@/lib/red-room/db"
import { challenges, players } from "@/lib/red-room/schema"

/** Read-only participation counts. A seeded identity is not evidence that someone played. */
export async function redRoomParticipation() {
  const db = getRedRoomDb()
  const [accounts, completed] = await Promise.all([
    db.select({ id: players.id, accountType: players.accountType, isBot: players.isBot, claimedAt: players.claimedAt }).from(players),
    db.select({ challengerId: challenges.challengerId, opponentId: challenges.opponentId }).from(challenges).where(eq(challenges.status, "completed")),
  ])
  const eligible = accounts.filter(a => a.accountType === "player" && !a.isBot)
  const ids = new Set(eligible.map(a => a.id))
  const completedByPlayers = new Set<string>()
  for (const game of completed) {
    if (ids.has(game.challengerId)) completedByPlayers.add(game.challengerId)
    if (ids.has(game.opponentId)) completedByPlayers.add(game.opponentId)
  }
  return {
    eligible: eligible.length,
    signedIn: eligible.filter(a => a.claimedAt !== null).length,
    played: completedByPlayers.size,
    completedMatchesWithPlayers: completed.filter(g => ids.has(g.challengerId) || ids.has(g.opponentId)).length,
  }
}
