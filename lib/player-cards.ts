import { rosterBySeason, varsityHistoryByPlayer, type VarsitySeasonHistory } from "./player-stats"
import type { CardPlayer } from "./player-card-types"
import { cooperRePlayer, marcoPlayer, ogAndyPlayer } from "./player-card-examples"

export function cardPlayerId(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }

// Do not turn undocumented fields into zeroes or average season percentages.
export function cardTotal(history: VarsitySeasonHistory[], key: string, keeper = false): string {
  const values = history.map((entry) => (keeper ? entry.goalkeeper : entry.stats)?.[key])
  const known = values.filter((value): value is string => value != null && value.trim() !== "" && Number.isFinite(Number(value)))
  if (!known.length) return "—"
  const total = known.reduce((sum, value) => sum + Number(value), 0)
  return `${Number(total.toFixed(2))}${known.length < values.length ? "*" : ""}`
}

export function cardPlayers(): CardPlayer[] {
  const histories = varsityHistoryByPlayer()
  const roster = [...rosterBySeason(2026), ...rosterBySeason(2021).filter((player) => player.player_name === "Miles Montalbano")]
  const players: CardPlayer[] = roster.map((player) => {
    const year = player.season
    const history = (histories.get(player.player_name) ?? []).filter((entry) => entry.season <= year)
    const season = history.filter((entry) => entry.season === year)
    const keeper = player.position.toUpperCase().includes("GK")
    const fields = keeper ? [["SAVES", "saves"], ["GA", "ga"]] : [["GOALS", "goals"], ["ASSISTS", "assists"], ["POINTS", "points"]]
    const metrics = fields.map(([label, key]) => ({ label, season: cardTotal(season, key, keeper), career: cardTotal(history, key, keeper) }))
    const years = history.map((entry) => entry.season)
    const first = years.length ? Math.min(...years) : year
    return { id: cardPlayerId(player.player_name), name: player.player_name, number: player.number, position: player.position, classYear: player.class, season: year, careerSpan: first === year ? String(year) : `${first}–${year}`, metrics, incomplete: metrics.some((metric) => /[—*]/.test(metric.season + metric.career)) }
  })
  return [...players, ogAndyPlayer, cooperRePlayer, marcoPlayer]
}
