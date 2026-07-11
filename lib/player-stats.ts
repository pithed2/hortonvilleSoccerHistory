import fs from "node:fs"
import path from "node:path"

function parseCSV(text: string): { cols: string[]; rows: string[][] } {
  const clean = text.replace(/\r/g, "").replace(/^\uFEFF/, "")
  const lines = clean.split("\n").filter((line) => line.length)
  if (!lines.length) return { cols: [], rows: [] }

  const cols = splitCSVLine(lines[0])
  const rows = lines.slice(1).map(splitCSVLine)
  return { cols, rows }
}

function splitCSVLine(line: string): string[] {
  const out: string[] = []
  let cur = ""
  let inQ = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQ = false
      } else {
        cur += ch
      }
    } else {
      if (ch === '"') inQ = true
      else if (ch === ",") {
        out.push(cur)
        cur = ""
      } else {
        cur += ch
      }
    }
  }

  out.push(cur)
  return out
}

function readDataFile(fileName: string): string {
  const filePath = path.join(process.cwd(), "public", "data", fileName)
  if (!fs.existsSync(filePath)) return ""
  return fs.readFileSync(filePath, "utf8")
}

function readRows(fileName: string): Record<string, string>[] {
  const text = readDataFile(fileName)
  if (!text) return []

  const { cols, rows } = parseCSV(text)

  return rows.map((parts) => {
    const row: Record<string, string> = {}
    cols.forEach((col, index) => {
      row[col] = parts[index] ?? ""
    })
    return row
  })
}

export type RosterPlayer = {
  season: number
  player_name: string
  class: string
  number: string
  position: string
}

export function rosterBySeason(year: number): RosterPlayer[] {
  return readRows("rosters.csv")
    .map((row) => ({
      season: Number(row.season),
      player_name: row.player_name,
      class: row.class,
      number: row.number,
      position: row.position,
    }))
    .filter((row) => row.season === year)
    .sort((a, b) => a.player_name.localeCompare(b.player_name))
}

export type PlayerSeasonStats = {
  season: number
  player_name: string
  class: string
  number: string
  gp: number
  minutes: number
  goals: number
  assists: number
  points: number
  shots: number
  sog: number
  pk: number
  gwg: number
  yc: number
  rc: number
  saves: number
  steals: number
  corner_kicks: number
}

function toNumber(value: string): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function playerSeasonStatsBySeason(year: number): PlayerSeasonStats[] {
  return readRows("player-season-stats.csv")
    .map((row) => ({
      season: toNumber(row.season),
      player_name: row.player_name,
      class: row.class,
      number: row.number,
      gp: toNumber(row.gp),
      minutes: toNumber(row.minutes),
      goals: toNumber(row.goals),
      assists: toNumber(row.assists),
      points: toNumber(row.points),
      shots: toNumber(row.shots),
      sog: toNumber(row.sog),
      pk: toNumber(row.pk),
      gwg: toNumber(row.gwg),
      yc: toNumber(row.yc),
      rc: toNumber(row.rc),
      saves: toNumber(row.saves),
      steals: toNumber(row.steals),
      corner_kicks: toNumber(row.corner_kicks),
    }))
    .filter((row) => row.season === year)
    .sort((a, b) => b.points - a.points || b.goals - a.goals || a.player_name.localeCompare(b.player_name))
}

export type GoalkeeperSeasonStats = {
  season: number
  player_name: string
  class: string
  number: string
  gp: number
  minutes: number
  ga: number
  saves: number
  pksv: number
  save_pct: number
  gaa: number
  opp_sog: number
}

export function goalkeeperSeasonStatsBySeason(year: number): GoalkeeperSeasonStats[] {
  return readRows("goalkeeper-season-stats.csv")
    .map((row) => ({
      season: toNumber(row.season),
      player_name: row.player_name,
      class: row.class,
      number: row.number,
      gp: toNumber(row.gp),
      minutes: toNumber(row.minutes),
      ga: toNumber(row.ga),
      saves: toNumber(row.saves),
      pksv: toNumber(row.pksv),
      save_pct: toNumber(row.save_pct),
      gaa: toNumber(row.gaa),
      opp_sog: toNumber(row.opp_sog),
    }))
    .filter((row) => row.season === year)
    .sort((a, b) => b.minutes - a.minutes || a.player_name.localeCompare(b.player_name))
}

export type BoxscorePlayerStat = {
  season: number
  game_number: number
  date: string
  time: string
  result: string
  score: string
  opponent: string
  site: string
  venue: string
  player_name: string
  number: string
  class: string
  goals: number
  assists: number
  points: number
  saves: number
  source_note: string
}

export type BoxscoreGame = {
  season: number
  game_number: number
  date: string
  time: string
  result: string
  score: string
  opponent: string
  site: string
  venue: string
  goals: number
  assists: number
  saves: number
  players: BoxscorePlayerStat[]
}

export function boxscoreGamesBySeason(year: number): BoxscoreGame[] {
  const byGame = new Map<number, BoxscoreGame>()

  for (const player of boxscorePlayerStatsBySeason(year)) {
    if (!byGame.has(player.game_number)) {
      byGame.set(player.game_number, {
        season: player.season,
        game_number: player.game_number,
        date: player.date,
        time: player.time,
        result: player.result,
        score: player.score,
        opponent: player.opponent,
        site: player.site,
        venue: player.venue,
        goals: 0,
        assists: 0,
        saves: 0,
        players: [],
      })
    }

    const game = byGame.get(player.game_number)!
    game.goals += player.goals
    game.assists += player.assists
    game.saves += player.saves
    game.players.push(player)
  }

  return Array.from(byGame.values())
    .map((game) => ({
      ...game,
      players: game.players.sort(
        (a, b) =>
          b.goals - a.goals ||
          b.assists - a.assists ||
          b.saves - a.saves ||
          a.player_name.localeCompare(b.player_name),
      ),
    }))
    .sort((a, b) => a.game_number - b.game_number)
}

function boxscorePlayerStatsBySeason(year: number): BoxscorePlayerStat[] {
  return readRows("boxscore-player-stats.csv")
    .map((row) => ({
      season: toNumber(row.season),
      game_number: toNumber(row.game_number),
      date: row.date,
      time: row.time,
      result: row.result,
      score: row.score,
      opponent: row.opponent,
      site: row.site,
      venue: row.venue,
      player_name: row.player_name,
      number: row.number,
      class: row.class,
      goals: toNumber(row.goals),
      assists: toNumber(row.assists),
      points: toNumber(row.points),
      saves: toNumber(row.saves),
      source_note: row.source_note,
    }))
    .filter((row) => row.season === year)
}

export type AllTimeLeader = {
  player_name: string
  seasons: number[]
  gp: number
  goals: number
  assists: number
  points: number
  shots: number
  sog: number
  saves: number
}

export function allTimePlayerLeaders(): AllTimeLeader[] {
  const byPlayer = new Map<string, AllTimeLeader>()

  for (const row of playerSeasonStatsBySeasonRange(2007, 2025)) {
    if (!byPlayer.has(row.player_name)) {
      byPlayer.set(row.player_name, {
        player_name: row.player_name,
        seasons: [],
        gp: 0,
        goals: 0,
        assists: 0,
        points: 0,
        shots: 0,
        sog: 0,
        saves: 0,
      })
    }

    const leader = byPlayer.get(row.player_name)!
    leader.seasons.push(row.season)
    leader.gp += row.gp
    leader.goals += row.goals
    leader.assists += row.assists
    leader.points += row.points
    leader.shots += row.shots
    leader.sog += row.sog
    leader.saves += row.saves
  }

  return Array.from(byPlayer.values()).map((leader) => ({
    ...leader,
    seasons: Array.from(new Set(leader.seasons)).sort((a, b) => a - b),
  }))
}

function playerSeasonStatsBySeasonRange(startYear: number, endYear: number): PlayerSeasonStats[] {
  return readRows("player-season-stats.csv")
    .map((row) => ({
      season: toNumber(row.season),
      player_name: row.player_name,
      class: row.class,
      number: row.number,
      gp: toNumber(row.gp),
      minutes: toNumber(row.minutes),
      goals: toNumber(row.goals),
      assists: toNumber(row.assists),
      points: toNumber(row.points),
      shots: toNumber(row.shots),
      sog: toNumber(row.sog),
      pk: toNumber(row.pk),
      gwg: toNumber(row.gwg),
      yc: toNumber(row.yc),
      rc: toNumber(row.rc),
      saves: toNumber(row.saves),
      steals: toNumber(row.steals),
      corner_kicks: toNumber(row.corner_kicks),
    }))
    .filter((row) => row.season >= startYear && row.season <= endYear)
}

