import { randomBytes, randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { getRedRoomDb } from "./db"
import { challenges, type KeeperPick } from "./schema"

export const SHOT_COUNT = 5

export function validShots(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === SHOT_COUNT && value.every((zone) => Number.isInteger(zone) && zone >= 1 && zone <= 9)
}

export function validKeeps(value: unknown): value is KeeperPick[] {
  return Array.isArray(value) && value.length === SHOT_COUNT && value.every((pick) =>
    Array.isArray(pick) && pick.length === 2 && pick[0] !== pick[1] && pick.every((zone) => Number.isInteger(zone) && zone >= 1 && zone <= 9))
}

export function scoreMatch(challengerId: string, opponentId: string, challengerShots: number[], challengerKeeps: KeeperPick[], opponentShots: number[], opponentKeeps: KeeperPick[]) {
  const replay = []
  let challengerScore = 0
  let opponentScore = 0
  for (let round = 0; round < SHOT_COUNT; round++) {
    const challengerGoal = !opponentKeeps[round].includes(challengerShots[round])
    if (challengerGoal) challengerScore++
    replay.push({ shooterId: challengerId, keeperId: opponentId, shot: challengerShots[round], covered: opponentKeeps[round], goal: challengerGoal })
    const opponentGoal = !challengerKeeps[round].includes(opponentShots[round])
    if (opponentGoal) opponentScore++
    replay.push({ shooterId: opponentId, keeperId: challengerId, shot: opponentShots[round], covered: challengerKeeps[round], goal: opponentGoal })
  }
  return { challengerScore, opponentScore, replay }
}

export async function unusedChallengeCode() {
  const db = getRedRoomDb()
  for (let attempt = 0; attempt < 10; attempt++) {
    const raw = randomBytes(3).toString("base64url").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "7")
    const code = `PK-${raw}`
    if (!(await db.select({ id: challenges.id }).from(challenges).where(eq(challenges.code, code)).get())) return code
  }
  return `PK-${randomUUID().slice(0, 6).toUpperCase()}`
}
