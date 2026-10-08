import calendarData from "@/data/jv/calendar.json"
import blackGrayData from "@/data/jv/black-gray.json"
import { isJvConferenceOpponent, jvConferenceRecord } from "./jv-conference.mjs"
import type { JvTeamStats, BoxScore, PlayerBoxLine } from "./jv-teams"

export type SquadKey = "black" | "gray"

const calendarTeamName: Record<SquadKey, string> = { black: "JV Black", gray: "JV Gray" }
const goalkeeperNumber = 21 // Ayden Lenth wears "21/1" on the roster sheet; 21 is used for typed number fields.

function formatShortDate(iso: string) {
  const date = new Date(`${iso}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date)
}

function rosterNumber(name: string): number {
  const player = blackGrayData.squads.black.roster.find((p) => p.name === name) ?? blackGrayData.squads.gray.roster.find((p) => p.name === name)
  if (player?.position === "GK") return goalkeeperNumber
  const parsed = player ? Number.parseInt(player.number, 10) : NaN
  return Number.isFinite(parsed) ? parsed : 0
}

export function getBlackGrayBundle(squad: SquadKey): { stats: JvTeamStats; boxScores: BoxScore[] } {
  const teamName = calendarTeamName[squad]
  const events = calendarData.events
    .filter((event) => event.team === teamName)
    .sort((a, b) => a.date.localeCompare(b.date))

  const roster = blackGrayData.squads[squad].roster
  const squadName = blackGrayData.squads[squad].name

  const recent: JvTeamStats["recent"] = []
  const boxScores: BoxScore[] = []
  const conferenceGames: { opponent: string; result: string }[] = []
  let wins = 0, losses = 0, ties = 0, goalsFor = 0, goalsAgainst = 0

  const gkGames = new Map<string, { minutes: number; saves: number | null; goalsAgainst: number }[]>()
  const playerTotals = new Map<string, { goals: number; assists: number; gp: number }>()
  for (const player of roster) playerTotals.set(player.name, { goals: 0, assists: 0, gp: 0 })

  let id = 0
  for (const event of events) {
    const result = blackGrayData.results.find((r) => r.date === event.date && r.opponent === event.opponent)
    if (!result) continue
    id++

    if (result.result === "W") wins++
    else if (result.result === "L") losses++
    else ties++
    const [gf, ga] = result.score.split("-").map(Number)
    goalsFor += gf
    goalsAgainst += ga
    const conference = isJvConferenceOpponent(event.opponent)
    conferenceGames.push({ opponent: event.opponent, result: result.result })
    recent.unshift({ id, date: formatShortDate(event.date), opponent: event.opponent, location: event.home ? "Home" : "Away", score: result.score, result: result.result })

    const stat = blackGrayData.gameStats.find((g) => g.date === event.date && g.opponent === event.opponent)
    const statPlayers = stat?.players ?? []
    const hasFullLineup = stat && "played" in stat && Array.isArray(stat.played)

    for (const p of statPlayers) {
      const entry = playerTotals.get(p.name) ?? { goals: 0, assists: 0, gp: 0 }
      entry.goals += p.goals
      entry.assists += p.assists
      playerTotals.set(p.name, entry)
    }

    const lineupNames: string[] = hasFullLineup ? (stat!.played as string[]) : statPlayers.map((p) => p.name)
    if (hasFullLineup) {
      for (const name of lineupNames) {
        const entry = playerTotals.get(name) ?? { goals: 0, assists: 0, gp: 0 }
        entry.gp += 1
        playerTotals.set(name, entry)
      }
    }

    const gameKeepers = stat?.goalkeepers ?? []
    for (const keeper of gameKeepers) {
      const games = gkGames.get(keeper.name) ?? []
      games.push(keeper)
      gkGames.set(keeper.name, games)
    }
    const gameSaves = gameKeepers.some((keeper) => keeper.saves != null)
      ? gameKeepers.reduce((sum, keeper) => sum + (keeper.saves ?? 0), 0)
      : null

    const boxPlayers: PlayerBoxLine[] = lineupNames
      .filter((name) => !gameKeepers.some((keeper) => keeper.name === name))
      .map((name) => {
        const line = statPlayers.find((p) => p.name === name) as { name: string; goals: number; assists: number; sot?: number } | undefined
        return {
          player: name,
          shots: null,
          sog: (line?.sot ?? 0) + (line?.goals ?? 0),
          goals: line?.goals ?? 0,
          assists: line?.assists ?? 0,
          yc: null,
          rc: null,
          saves: null,
          gkMinutes: null,
        }
      })
    for (const keeper of [...gameKeepers].reverse()) {
      boxPlayers.unshift({ player: keeper.name, shots: null, sog: 0, goals: 0, assists: 0, yc: null, rc: null, saves: keeper.saves, gkMinutes: keeper.minutes })
    }

    const notes = [...(stat?.notes ?? [])]
    if (!hasFullLineup) notes.push("Full lineup not yet recorded for this game — only players with a stat line are shown.")

    boxScores.push({
      id,
      date: event.date,
      opponent: event.opponent,
      location: event.home ? "Home" : "Away",
      kickoff: event.time,
      conference,
      result: result.result,
      team: { shots: null, sog: boxPlayers.reduce((sum, p) => sum + p.sog, 0), saves: gameSaves, yc: null, rc: null, goals: gf },
      opponentTotals: { shots: null, saves: null, goals: ga },
      players: boxPlayers,
      notes,
      scoringRecorded: false,
      scoring: [],
    })
  }

  const rosterNames = new Set(roster.map((p) => p.name))
  const otherSquadName = blackGrayData.squads[squad === "black" ? "gray" : "black"].name
  const players: JvTeamStats["players"] = [...playerTotals.entries()].map(([name, totals]) => ({
    number: rosterNumber(name),
    name,
    squad: rosterNames.has(name) ? undefined : `Guest from ${otherSquadName}`,
    gp: totals.gp,
    goals: totals.goals,
    assists: totals.assists,
    points: totals.goals * 2 + totals.assists,
  }))

  // Include home-roster keepers' guest appearances in their season totals.
  for (const stat of blackGrayData.gameStats) {
    const isGuestGame = calendarData.events.some((event) =>
      event.team === calendarTeamName[squad === "black" ? "gray" : "black"] &&
      event.date === stat.date && event.opponent === stat.opponent)
    if (!isGuestGame) continue
    for (const keeper of stat.goalkeepers.filter((keeper) => rosterNames.has(keeper.name))) {
      const games = gkGames.get(keeper.name) ?? []
      games.push(keeper)
      gkGames.set(keeper.name, games)
    }
  }

  const keeperNames = new Set([
    ...roster.filter((player) => player.position === "GK").map((player) => player.name),
    ...gkGames.keys(),
  ])
  const goalkeepers: JvTeamStats["goalkeepers"] = [...keeperNames].map((name) => {
    const games = gkGames.get(name) ?? []
    return {
      number: rosterNumber(name),
      name,
      games: games.length,
      saves: games.some((g) => g.saves != null) ? games.reduce((sum, g) => sum + (g.saves ?? 0), 0) : null,
      minutes: games.length ? games.reduce((sum, g) => sum + g.minutes, 0) : null,
      goalsAgainst: games.reduce((sum, g) => sum + g.goalsAgainst, 0),
    }
  })

  const stats: JvTeamStats = {
    slug: squad,
    team: teamName,
    sourceLabel: "Team score sheets",
    gamesNote: "GP reflects games with a recorded lineup · Goals: 2 points · Assists: 1 point. Players guesting from the other squad are included with their home squad's number.",
    notes: [],
    updated: blackGrayData.updated,
    audit: {
      sourceFile: "Team score sheets",
      sourceModifiedAt: "",
      sourceSha256: "",
      importedAt: blackGrayData.statsAudit.importedAt,
      validation: "passed",
      validationSummary: `${recent.length} result(s) recorded for ${squadName}.`,
      approvedBy: "Andrew Montalbano",
    },
    record: { wins, losses, ties, conference: jvConferenceRecord(conferenceGames) },
    totals: { goalsFor, goalsAgainst, shots: null, sog: boxScores.reduce((sum, g) => sum + (g.team.sog ?? 0), 0), saves: boxScores.some((g) => g.team.saves != null) ? boxScores.reduce((sum, g) => sum + (g.team.saves ?? 0), 0) : null },
    goalkeepers,
    recent,
    upcoming: [],
    players,
  }

  return { stats, boxScores }
}
