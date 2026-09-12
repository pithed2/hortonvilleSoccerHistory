import { isJvConferenceOpponent, jvConferenceRecord } from "./jv-conference.mjs"
import whiteData from "@/data/jv/white.json"
import redData from "@/data/jv/red.json"

export type JvTeamSlug = "red" | "white" | "black-gray"
export type PlayerBoxLine = { player: string; shots: number | null; sog: number; goals: number; assists: number; yc: number | null; rc: number | null; saves: number | null; gkMinutes: number | null }
export type BoxScore = {
  id: number; date: string; opponent: string; location: string; kickoff?: string; conference: boolean; result: string
  team: { shots: number | null; sog: number; saves: number | null; yc: number | null; rc: number | null; goals: number }
  opponentTotals: { shots: number | null; saves: number | null; goals: number }
  players: PlayerBoxLine[]
  notes?: string[]
  scoringRecorded?: boolean
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
  sourceLabel?: string
  gamesNote?: string
  notes?: string[]
  updated: string
  audit: ImportAudit
  record: { wins: number; losses: number; ties: number; conference: string }
  totals: { goalsFor: number; goalsAgainst: number; shots: number | null; sog: number; saves: number | null }
  goalkeepers: Array<{ number: number; name: string; games: number; saves: number | null; minutes: number | null; recordedSaves?: number; goalsAgainst: number }>
  recent: Array<{ id: number; date: string; opponent: string; location: string; kickoff?: string; score: string; result: string }>
  upcoming: Array<{ date: string; opponent: string; location: string }>
  players: Array<{ number: number; name: string; gp: number; goals: number; assists: number; points: number }>
}

type JvTeamBundle = { stats: JvTeamStats; boxScores: BoxScore[] }

const teams: Partial<Record<JvTeamSlug, JvTeamBundle>> = {
  red: redData as JvTeamBundle,
  white: whiteData as JvTeamBundle,
}

export function isJvTeamSlug(value: string): value is JvTeamSlug {
  return value in teams
}

export function getJvTeam(slug: JvTeamSlug) {
  const bundle = teams[slug]
  if (!bundle) return null
  return {
    stats: { ...bundle.stats, record: { ...bundle.stats.record, conference: jvConferenceRecord(bundle.boxScores) } },
    boxScores: bundle.boxScores.map(game => ({ ...game, conference: isJvConferenceOpponent(game.opponent) })),
  }
}

export function getJvBoxScore(slug: JvTeamSlug, id: number) {
  return getJvTeam(slug)?.boxScores.find((game) => game.id === id) ?? null
}
