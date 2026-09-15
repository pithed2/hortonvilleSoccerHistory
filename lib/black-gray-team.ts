import calendarData from "@/data/jv/calendar.json"
import blackGrayData from "@/data/jv/black-gray.json"
import { jvConferenceRecord } from "./jv-conference.mjs"
import type { JvDashboardStats } from "@/components/jv-season-dashboard"

export type SquadKey = "black" | "gray"

const calendarTeamName: Record<SquadKey, string> = { black: "JV Black", gray: "JV Gray" }

function formatShortDate(iso: string) {
  const date = new Date(`${iso}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date)
}

export function getSquadDashboardStats(squad: SquadKey): JvDashboardStats {
  const teamName = calendarTeamName[squad]
  const events = calendarData.events
    .filter((event) => event.team === teamName)
    .sort((a, b) => a.date.localeCompare(b.date))

  const roster = blackGrayData.squads[squad].roster
  const squadName = blackGrayData.squads[squad].name

  const recent: JvDashboardStats["recent"] = []
  const conferenceGames: { opponent: string; result: string }[] = []
  let wins = 0, losses = 0, ties = 0, goalsFor = 0, goalsAgainst = 0, scoredGames = 0

  const gkGames: { minutes: number; saves: number | null; goalsAgainst: number }[] = []
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
    scoredGames++
    conferenceGames.push({ opponent: event.opponent, result: result.result })
    recent.unshift({
      id, date: formatShortDate(event.date), opponent: event.opponent,
      location: event.home ? "Home" : "Away", score: result.score, result: result.result,
      boxScoreAvailable: false,
    })

    const stat = blackGrayData.gameStats.find((g) => g.date === event.date && g.opponent === event.opponent)
    if (!stat) continue

    for (const p of stat.players) {
      const entry = playerTotals.get(p.name) ?? { goals: 0, assists: 0, gp: 0 }
      entry.goals += p.goals
      entry.assists += p.assists
      playerTotals.set(p.name, entry)
    }
    if ("played" in stat && Array.isArray(stat.played)) {
      for (const playerName of stat.played) {
        const entry = playerTotals.get(playerName) ?? { goals: 0, assists: 0, gp: 0 }
        entry.gp += 1
        playerTotals.set(playerName, entry)
      }
    }
    for (const gk of stat.goalkeepers) {
      gkGames.push({ minutes: gk.minutes, saves: gk.saves, goalsAgainst: gk.goalsAgainst })
    }
  }

  const rosterNumbers = new Map(roster.map((p) => [p.name, p.number]))
  const players: JvDashboardStats["players"] = [...playerTotals.entries()].map(([name, totals]) => ({
    number: rosterNumbers.get(name) ?? "G",
    name,
    gp: totals.gp || null,
    goals: totals.goals,
    assists: totals.assists,
    points: totals.goals * 2 + totals.assists,
  }))

  const goalkeeperPlayer = roster.find((player) => player.position === "GK")
  const goalkeepers: JvDashboardStats["goalkeepers"] = goalkeeperPlayer ? [{
    number: goalkeeperPlayer.number,
    name: goalkeeperPlayer.name,
    games: gkGames.length || null,
    saves: gkGames.some((g) => g.saves != null) ? gkGames.reduce((sum, g) => sum + (g.saves ?? 0), 0) : null,
    minutes: gkGames.length ? gkGames.reduce((sum, g) => sum + g.minutes, 0) : null,
    goalsAgainst: gkGames.length ? gkGames.reduce((sum, g) => sum + g.goalsAgainst, 0) : null,
  }] : []

  return {
    slug: squad,
    team: teamName,
    updated: blackGrayData.updated,
    sourceLabel: "Team score sheets",
    gamesNote: "GP reflects games with a recorded lineup · Goals: 2 points · Assists: 1 point. Players guesting from the other squad are included with their home squad's number.",
    notes: [
      "Statistics are transcribed from team score sheets as they're submitted; some completed games may not yet have full detail.",
    ],
    audit: {
      sourceFile: "Team score sheets",
      sourceModifiedAt: "",
      sourceSha256: "",
      importedAt: blackGrayData.statsAudit.importedAt,
      validation: "passed",
      validationSummary: `${scoredGames} result(s) recorded for ${squadName}.`,
      approvedBy: "Andrew Montalbano",
    },
    record: { wins, losses, ties, conference: jvConferenceRecord(conferenceGames) },
    totals: { goalsFor, goalsAgainst, shots: null, sog: null, saves: goalkeepers[0]?.saves ?? null },
    scoredGames,
    recent,
    upcoming: [],
    players,
    goalkeepers,
  }
}
