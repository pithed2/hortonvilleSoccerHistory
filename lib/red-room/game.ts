import { createHash, randomBytes, randomUUID } from "node:crypto"
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

type MatchOptions = { seed?: string; challengerAbility?: string | null; opponentAbility?: string | null }

function seededIndex(seed: string, size: number) {
  return createHash("sha256").update(seed).digest().readUInt32BE(0) % size
}

function effectiveCoverage(coverage: KeeperPick, shooterAbility: string | null | undefined, keeperAbility: string | null | undefined, seed: string) {
  const originalCovered = [...coverage]
  const covered = [...coverage]
  const abilities: string[] = []
  if (keeperAbility === "third_keeper_zone" || keeperAbility === "time_machine") {
    const open = Array.from({ length: 9 }, (_, index) => index + 1).filter((zone) => !covered.includes(zone))
    covered.push(open[seededIndex(`${seed}:wall`, open.length)])
    abilities.push(keeperAbility === "time_machine" ? "2013 Marco added a time-warp save zone" : "The Wall added a third save zone")
  }
  if (["erase_keeper_zone", "messi_erase", "ronaldo_erase", "arsenal_invincibles", "tottenham_tax", "time_machine"].includes(shooterAbility || "") && covered.length) {
    const removed = covered.splice(seededIndex(`${seed}:erase`, covered.length), 1)[0]
    const name = shooterAbility === "messi_erase" ? "La Pulga" : shooterAbility === "ronaldo_erase" ? "Siuuu Surge" : shooterAbility === "arsenal_invincibles" ? "Va Va Voom" : shooterAbility === "tottenham_tax" ? "Golden Boot" : shooterAbility === "time_machine" ? "2013 Marco" : "Offensive bonus"
    abilities.push(`${name} erased keeper zone ${removed}`)
  }
  return { covered, originalCovered, ability: abilities.join(" · ") || undefined }
}

function savedShotBonus(ability: string | null | undefined) {
  if (ability === "arsenal_invincibles") return "Arsenal Invincibles overturned the first save. Arsenal is the best football club of all time. Bow down to the Invincibles."
  if (ability === "second_ball") return "The Shed opened and Coach Paul produced a second ball"
  return null
}

function addAbility(current: string | undefined, next: string) {
  return current ? `${current} · ${next}` : next
}

export function scoreMatch(challengerId: string, opponentId: string, challengerShots: number[], challengerKeeps: KeeperPick[], opponentShots: number[], opponentKeeps: KeeperPick[], options: MatchOptions = {}) {
  const replay = []
  let challengerScore = 0
  let opponentScore = 0
  let challengerSaveBonusUsed = false
  let opponentSaveBonusUsed = false
  let challengerTaxUsed = false
  let opponentTaxUsed = false
  const seed = options.seed || `${challengerId}:${opponentId}`
  for (let round = 0; round < SHOT_COUNT; round++) {
    const challengerDefense = effectiveCoverage(opponentKeeps[round], options.challengerAbility, options.opponentAbility, `${seed}:${round}:challenger`)
    let challengerGoal = !challengerDefense.covered.includes(challengerShots[round])
    let challengerAbility = challengerDefense.ability
    const challengerBonus = savedShotBonus(options.challengerAbility)
    if (!challengerGoal && challengerBonus && !challengerSaveBonusUsed) {
      challengerGoal = true; challengerSaveBonusUsed = true; challengerAbility = addAbility(challengerAbility, challengerBonus)
    }
    if (challengerGoal && options.challengerAbility === "tottenham_tax" && !challengerTaxUsed) {
      challengerGoal = false; challengerTaxUsed = true; challengerAbility = addAbility(challengerAbility, "Tottenham Tax ruled out the first goal. When you think of 💩, I think of Tottenham.")
    }
    if (challengerGoal) challengerScore++
    replay.push({ shooterId: challengerId, keeperId: opponentId, shot: challengerShots[round], covered: challengerDefense.covered, originalCovered: challengerDefense.originalCovered, goal: challengerGoal, ability: challengerAbility })
    const opponentDefense = effectiveCoverage(challengerKeeps[round], options.opponentAbility, options.challengerAbility, `${seed}:${round}:opponent`)
    let opponentGoal = !opponentDefense.covered.includes(opponentShots[round])
    let opponentAbility = opponentDefense.ability
    const opponentBonus = savedShotBonus(options.opponentAbility)
    if (!opponentGoal && opponentBonus && !opponentSaveBonusUsed) {
      opponentGoal = true; opponentSaveBonusUsed = true; opponentAbility = addAbility(opponentAbility, opponentBonus)
    }
    if (opponentGoal && options.opponentAbility === "tottenham_tax" && !opponentTaxUsed) {
      opponentGoal = false; opponentTaxUsed = true; opponentAbility = addAbility(opponentAbility, "Tottenham Tax ruled out the first goal. When you think of 💩, I think of Tottenham.")
    }
    if (opponentGoal) opponentScore++
    replay.push({ shooterId: opponentId, keeperId: challengerId, shot: opponentShots[round], covered: opponentDefense.covered, originalCovered: opponentDefense.originalCovered, goal: opponentGoal, ability: opponentAbility })
  }
  return { challengerScore, opponentScore, replay }
}

export function botMoves(botId: string, challengeId: string) {
  const shots = Array.from({ length: SHOT_COUNT }, (_, round) => seededIndex(`${challengeId}:${botId}:shot:${round}`, 9) + 1)
  const keeps = Array.from({ length: SHOT_COUNT }, (_, round) => {
    const first = seededIndex(`${challengeId}:${botId}:keep-a:${round}`, 9) + 1
    const remaining = Array.from({ length: 9 }, (_, index) => index + 1).filter((zone) => zone !== first)
    return [first, remaining[seededIndex(`${challengeId}:${botId}:keep-b:${round}`, remaining.length)]] as KeeperPick
  })
  return { shots, keeps }
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
