import { isJvConferenceOpponent } from "./jv-conference.mjs"
import fvaConferenceData from "@/data/coachs-corner/fva-conference-2026.json"

export type WeeklyGame = { Date: string; Team: string; Opponent: string; Location: string; Result: string | null; Score: string | null }
export type TeamRecord = { Team: string; W: number; L: number; T: number }
export type WeeklyData = {
  overall: (TeamRecord & { Group: string })[]
  schedule: WeeklyGame[]
  opponentRecords?: TeamRecord[]
  weeklyHighlights?: string[]
}

export function weekStart(date: string) {
  const day = new Date(`${date}T12:00:00Z`)
  day.setUTCDate(day.getUTCDate() - day.getUTCDay())
  return day.toISOString().slice(0, 10)
}

export function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

/** FVA (Fox Valley Association) conference membership, including Hortonville itself. */
function isFvaMember(team: string) {
  return team === "Hortonville" || isJvConferenceOpponent(team)
}

const fvaStandings = new Map(fvaConferenceData.standings.map(row => [row.Team, row]))

/** A team's W-L-T record against FVA opponents only, from the official conference standings. */
function fvaRecord(team: string): TeamRecord {
  return fvaStandings.get(team) ?? { Team: team, W: 0, L: 0, T: 0 }
}

export function weeklyMatchups(data: WeeklyData, start: string) {
  const end = shiftDate(start, 6)
  const records = new Map((data.opponentRecords ?? []).map(row => [row.Team, row]))
  for (const row of data.overall) records.set(row.Team, row)
  const groups = new Map(data.overall.map(row => [row.Team, row.Group]))
  const retained = new Set(data.weeklyHighlights ?? [])
  const games = data.schedule.filter(game => game.Date >= start && game.Date <= end)
    .sort((a, b) => a.Date.localeCompare(b.Date) || a.Team.localeCompare(b.Team))

  function dedupe(list: WeeklyGame[]) {
    const unique = new Map<string, WeeklyGame>()
    for (const game of list) {
      const key = [game.Date, ...[game.Team, game.Opponent].sort()].join("|")
      const previous = unique.get(key)
      if (!previous || (!previous.Result && game.Result) || (Boolean(previous.Result) === Boolean(game.Result) && game.Team === "Hortonville")) unique.set(key, game)
    }
    return [...unique.values()]
  }

  const groupSections = ["Group B", "Group A"].flatMap(group => {
    const own = games.filter(game => groups.get(game.Team) === group)
    const headToHead = dedupe(own.filter(game => groups.get(game.Opponent) === group))
    const keyMatches = own.filter(game => {
      if (groups.get(game.Opponent) === group) return false
      const record = records.get(game.Opponent)
      return retained.has([game.Date, game.Team, game.Opponent].join("|")) || Boolean(record && record.W > record.L)
    })
    return [
      { title: `${group} · Head-to-head`, detail: "Meetings between teams in this group", games: headToHead },
      { title: `${group} · Key matchups`, detail: "Other opponents with winning records when highlighted", games: keyMatches },
    ].map(section => ({ ...section, isFva: false, games: section.games.map(game => ({ ...game, opponentRecord: records.get(game.Opponent), teamRecord: undefined as TeamRecord | undefined })) }))
  })

  const fvaGames = dedupe(games.filter(game => isFvaMember(game.Team) && isFvaMember(game.Opponent)))
  const fvaKeyMatches = fvaGames
    .map(game => ({ game, teamRecord: fvaRecord(game.Team), opponentRecord: fvaRecord(game.Opponent) }))
    .filter(({ teamRecord, opponentRecord }) => teamRecord.W > teamRecord.L || opponentRecord.W > opponentRecord.L)
    .map(({ game, teamRecord, opponentRecord }) => ({ ...game, teamRecord, opponentRecord }))

  return [
    ...groupSections,
    { title: "FVA · Key matchups", detail: "Conference games where a team carries a winning FVA record", isFva: true, games: fvaKeyMatches },
  ]
}
