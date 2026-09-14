import type { Metadata } from "next"
import { JvSeasonDashboard, type JvDashboardStats } from "@/components/jv-season-dashboard"
import { jvConferenceRecord } from "@/lib/jv-conference.mjs"
import blackGrayData from "@/data/jv/black-gray.json"

export const metadata: Metadata = { title: "JV Black & Gray 2026" }

const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))

export default function JvBlackGrayPage() {
  const results = blackGrayData.results
  const scoredGames = results.filter(game => game.score !== null)
  const reportedPlayers = blackGrayData.gameStats.flatMap(game => game.players)
  const players = Object.values(blackGrayData.squads).flatMap(squad => squad.roster.map(player => {
    const lines = reportedPlayers.filter(line => line.name === player.name)
    const goals = lines.length ? lines.reduce((sum, line) => sum + line.goals, 0) : null
    const assists = lines.length ? lines.reduce((sum, line) => sum + line.assists, 0) : null
    return {
    number: player.number, name: player.name, squad: squad.name,
    gp: null, goals, assists, points: goals !== null && assists !== null ? goals * 2 + assists : null,
  }}))
  const goalkeeperNames = new Set(Object.values(blackGrayData.squads).flatMap(squad => squad.roster.filter(player => player.position === "GK").map(player => player.name)))
  const stats: JvDashboardStats = {
    slug: "black-gray", team: "JV Black/Gray", updated: formatDate(blackGrayData.updated) + ", 2026",
    sourceLabel: "Team-reported results",
    gamesNote: "Base rosters by squad · Player and goalkeeper totals cover reported statistics only.",
    notes: ["Results and records combine JV Black and JV Gray. Player and goalkeeper totals are partial, covering only August 25 at Appleton East and September 10 at Little Chute. Full player appearances and other game statistics are unavailable; dashes indicate unknown values.", "Ayden Lenth: 80 minutes and 1 save at Appleton East; 80 minutes at Little Chute with saves not stated. 1 recorded* is a partial save count. Ayden allowed 3 goals at Appleton East and 2 at Little Chute, totaling 5 in the two reported games.", "August 25: Neel Patel and Ethan Nysse scored once each; no assists. September 10: Colton Daniels, Neel Patel, Ethan Nysse, and Henri Biese scored once each; Aarav Patel, Ezekiel Hartjes, and Colton Daniels each had one assist."],
    audit: { sourceFile: "Team rosters and reported results", sourceModifiedAt: "", sourceSha256: "", importedAt: blackGrayData.statsAudit.importedAt, validation: "warning", validationSummary: "Six final scores confirmed; scoring and goalkeeper statistics supplied for two games only.", approvedBy: "Andrew Montalbano" },
    record: { wins: results.filter(game => game.result === "W").length, losses: results.filter(game => game.result === "L").length, ties: results.filter(game => game.result === "T").length, conference: jvConferenceRecord(results) },
    totals: { goalsFor: scoredGames.length ? scoredGames.reduce((sum, game) => sum + Number(game.score?.split("-")[0]), 0) : null, goalsAgainst: scoredGames.length ? scoredGames.reduce((sum, game) => sum + Number(game.score?.split("-")[1]), 0) : null, shots: null, sog: null, saves: null },
    scoredGames: scoredGames.length,
    recent: results.map((game, index) => ({ id: index + 1, date: formatDate(game.date), opponent: game.opponent, location: game.location, score: game.score, result: game.result, boxScoreAvailable: false })).reverse(),
    upcoming: [],
    players,
    goalkeepers: [...goalkeeperNames].map(name => {
      const lines = blackGrayData.gameStats.flatMap<{ name: string; minutes: number; saves: number | null; goalsAgainst?: number | null }>(game => game.goalkeepers).filter(line => line.name === name)
      return { name, number: players.find(player => player.name === name)!.number,
        games: lines.length || null, saves: null,
        recordedSaves: lines.some(line => line.saves !== null) ? lines.reduce((sum, line) => sum + (line.saves ?? 0), 0) : undefined,
        minutes: lines.length ? lines.reduce((sum, line) => sum + line.minutes, 0) : null, goalsAgainst: lines.length && lines.every(line => line.goalsAgainst != null) ? lines.reduce((sum, line) => sum + line.goalsAgainst!, 0) : null }
    }),
  }
  return <JvSeasonDashboard stats={stats} />
}
