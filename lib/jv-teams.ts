import redData from "@/data/jv/red.json"

export type JvTeamSlug = "red" | "white" | "black-gray"
export type PlayerBoxLine = { player: string; shots: number; sog: number; goals: number; assists: number; yc: number; rc: number; saves: number; gkMinutes: number }
export type BoxScore = {
  id: number; date: string; opponent: string; location: string; conference: boolean; result: string
  team: { shots: number; sog: number; saves: number; yc: number; rc: number; goals: number }
  opponentTotals: { shots: number; saves: number; goals: number }
  players: PlayerBoxLine[]
  scoring: Array<{ half: string; scorer: string; assist: string | null }>
}
export type ImportAudit = {
  sourceFile: string
  sourceModifiedAt: string
  sourceSha256: string
  importedAt: string
  validation: "passed" | "warning" | "failed"
  validationSummary: string
  approvedBy: string
}
export type JvTeamStats = {
  slug: JvTeamSlug
  team: string
  updated: string
  audit: ImportAudit
  record: { wins: number; losses: number; ties: number; conference: string }
  totals: { goalsFor: number; goalsAgainst: number; shots: number; sog: number; saves: number }
  goalkeepers: Array<{ number: number; name: string; games: number; saves: number; minutes: number; goalsAgainst: number }>
  recent: Array<{ id: number; date: string; opponent: string; location: string; score: string; result: string }>
  upcoming: Array<{ date: string; opponent: string; location: string }>
  players: Array<{ number: number; name: string; gp: number; goals: number; assists: number; points: number }>
}

type JvTeamBundle = { stats: JvTeamStats; boxScores: BoxScore[] }

const teams: Partial<Record<JvTeamSlug, JvTeamBundle>> = {
  red: redData as JvTeamBundle,
}

export function isJvTeamSlug(value: string): value is JvTeamSlug {
  return value in teams
}

export function getJvTeam(slug: JvTeamSlug) {
  return teams[slug] ?? null
}

export function getJvBoxScore(slug: JvTeamSlug, id: number) {
  return getJvTeam(slug)?.boxScores.find((game) => game.id === id) ?? null
}
