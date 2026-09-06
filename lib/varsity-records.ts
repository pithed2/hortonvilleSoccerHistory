import { loadGames, seasonRows } from "./games"
import { varsityRecordSources } from "./player-stats"

type Entry = { value: number; name: string; season: number; detail?: string; href: string }
export type VarsityRecord = { title: string; note: string; holders: Entry[] }

export function recordHolders(entries: Entry[], minimum = false): Entry[] {
  const valid = entries.filter(entry => Number.isFinite(entry.value) && entry.value >= 0)
  if (!valid.length) return []
  const best = (minimum ? Math.min : Math.max)(...valid.map(entry => entry.value))
  return valid.filter(entry => entry.value === best).sort((a, b) => a.season - b.season || a.name.localeCompare(b.name))
}

export async function varsityRecords() {
  const [games, seasons] = await Promise.all([loadGames(), seasonRows()])
  const sources = varsityRecordSources()
  const numeric = (row: Record<string, string>, key: string) => row[key]?.trim() && Number.isFinite(Number(row[key])) ? Number(row[key]) : null
  const playerEntries = (rows: Record<string, string>[], key: string, game = false): Entry[] => rows.flatMap(row => {
    const value = numeric(row, key)
    if (value === null || (game && key === "saves" && row.has_saves !== "true")) return []
    return [{ value, name: row.player_name, season: Number(row.season), href: `/seasons/${row.season}${game ? `#game-${row.game_number}` : key === "saves" ? "#goalkeepers" : "#players"}`, detail: game ? `${row.date} · vs. ${row.opponent}` : undefined }]
  })
  const teamEntries = (rows: Record<string, string>[], key: string): Entry[] => {
    const totals = new Map<number, number>()
    for (const row of rows) {
      const value = numeric(row, key)
      if (value !== null) totals.set(Number(row.season), (totals.get(Number(row.season)) ?? 0) + value)
    }
    return Array.from(totals, ([season, value]) => ({ value, season, name: "Hortonville", href: `/seasons/${season}` }))
  }
  const scored = (year: number) => games.filter(game => game.season_year === year && ["W", "L", "T", "D"].includes(game.result ?? "") && /^\s*\d+\s*-\s*\d+\s*$/.test(game.score ?? ""))
  const teamGoals = seasons.filter(season => season.played > 0).map(season => ({ value: season.gf, name: "Hortonville", season: season.season_year, href: `/seasons/${season.season_year}` }))
  const complete = seasons.filter(season => season.played > 0 && !/in progress|incomplete|not yet/i.test(season.notes ?? "") && scored(season.season_year).length === season.played && games.filter(game => game.season_year === season.season_year).every(game => ["W", "L", "T", "D"].includes(game.result ?? "")))
  const conceded = complete.map(season => ({ value: season.ga, name: "Hortonville", season: season.season_year, detail: `${season.played} games`, href: `/seasons/${season.season_year}` }))
  const shutouts = seasons.filter(season => scored(season.season_year).length > 0).map(season => ({ value: scored(season.season_year).filter(game => Number(game.score!.split("-")[1]) === 0).length, name: "Hortonville", season: season.season_year, href: `/seasons/${season.season_year}` }))
  const record = (title: string, entries: Entry[], note: string, minimum = false): VarsityRecord => ({ title, note, holders: recordHolders(entries, minimum) })
  return {
    singleGame: [
      record("Most goals by a player", playerEntries(sources.boxscores, "goals", true), "Single game · recorded player box scores"),
      record("Most assists by a player", playerEntries(sources.boxscores, "assists", true), "Single game · recorded player box scores"),
      record("Most saves by a player", playerEntries(sources.boxscores, "saves", true), "Single game · recorded goalkeeper saves"),
    ],
    season: [
      record("Most team goals", teamGoals, "Season · scored match results"),
      record("Most goals by a player", playerEntries(sources.players, "goals"), "Season · recorded player totals"),
      record("Most team assists", teamEntries(sources.players, "assists"), "Season · sum of recorded player assists"),
      record("Most assists by a player", playerEntries(sources.players, "assists"), "Season · recorded player totals"),
      record("Most team saves", teamEntries(sources.keepers, "saves"), "Season · sum of recorded goalkeeper saves"),
      record("Most saves by a player", playerEntries(sources.keepers, "saves"), "Season · recorded goalkeeper totals"),
      record("Fewest team goals conceded", conceded, "Completed seasons with all listed games scored · season lengths vary", true),
      record("Most team shutouts", shutouts, "Season · matches with zero goals conceded, including 0–0 draws"),
    ],
  }
}
