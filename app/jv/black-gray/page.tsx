import type { Metadata } from "next"
import { JvSeasonDashboard, type JvDashboardStats } from "@/components/jv-season-dashboard"
import { jvConferenceRecord } from "@/lib/jv-conference.mjs"
import blackGrayData from "@/data/jv/black-gray.json"

export const metadata: Metadata = { title: "JV Black & Gray 2026" }

const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))

export default function JvBlackGrayPage() {
  const results = blackGrayData.results
  const scoredGames = results.filter(game => game.score !== null)
  const players = Object.values(blackGrayData.squads).flatMap(squad => squad.roster.map(player => ({
    number: player.number, name: player.name, squad: squad.name,
    gp: null, goals: null, assists: null, points: null,
  })))
  const goalkeeperNames = new Set(Object.values(blackGrayData.squads).flatMap(squad => squad.roster.filter(player => player.position === "GK").map(player => player.name)))
  const stats: JvDashboardStats = {
    slug: "black-gray", team: "JV Black/Gray", updated: formatDate(blackGrayData.updated) + ", 2026",
    sourceLabel: "Team-reported results",
    gamesNote: "Base rosters by squad · — means statistics are not yet available.",
    notes: ["Player and goalkeeper statistics are coming soon. Dashes indicate unavailable data, not zero. Results and records combine JV Black and JV Gray.", "The August 28 FVL loss is included in the record. Its score is pending and excluded from goal totals, goals per match, and goal difference. Those figures use only games with known scores."],
    audit: { sourceFile: "Team rosters and reported results", sourceModifiedAt: "", sourceSha256: "", importedAt: blackGrayData.resultsAudit.importedAt, validation: "warning", validationSummary: "Six reported results; FVL score and player statistics pending.", approvedBy: "Andrew Montalbano" },
    record: { wins: results.filter(game => game.result === "W").length, losses: results.filter(game => game.result === "L").length, ties: results.filter(game => game.result === "T").length, conference: jvConferenceRecord(results) },
    totals: { goalsFor: scoredGames.length ? scoredGames.reduce((sum, game) => sum + Number(game.score?.split("-")[0]), 0) : null, goalsAgainst: scoredGames.length ? scoredGames.reduce((sum, game) => sum + Number(game.score?.split("-")[1]), 0) : null, shots: null, sog: null, saves: null },
    scoredGames: scoredGames.length,
    recent: results.map((game, index) => ({ id: index + 1, date: formatDate(game.date), opponent: game.opponent, location: game.location, score: game.score, result: game.result, boxScoreAvailable: false })).reverse(),
    upcoming: [],
    players,
    goalkeepers: [...goalkeeperNames].map(name => ({ name, number: players.find(player => player.name === name)!.number, games: null, saves: null, minutes: null, goalsAgainst: null })),
  }
  return <JvSeasonDashboard stats={stats} />
}
