import fs from "node:fs"
import path from "node:path"
import XLSX from "xlsx"

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const workbookPath =
  "C:/Users/amontalbano/Downloads/Hortonville_Player_Stats_2007-2025 (1).xlsx"

const mappingPath = "C:/Users/amontalbano/Downloads/Mapping.xlsx"

const rosterWorkbookPath = "C:/Users/amontalbano/Downloads/2011-2025 Rosters.xlsx"

const outputDir = path.join(process.cwd(), "public", "data")
const gamesCsvPath = path.join(outputDir, "games.csv")

// -----------------------------------------------------------------------------
// File Validation
// -----------------------------------------------------------------------------

if (!fs.existsSync(workbookPath)) {
  throw new Error(`Workbook not found: ${workbookPath}`)
}

if (!fs.existsSync(mappingPath)) {
  throw new Error(`Mapping workbook not found: ${mappingPath}`)
}

if (!fs.existsSync(rosterWorkbookPath)) {
  throw new Error(`Roster workbook not found: ${rosterWorkbookPath}`)
}

if (!fs.existsSync(outputDir)) {
  throw new Error(`Output directory not found: ${outputDir}`)
}

if (!fs.existsSync(gamesCsvPath)) {
  throw new Error(`Games CSV not found: ${gamesCsvPath}`)
}

// -----------------------------------------------------------------------------
// Workbook Loading
// -----------------------------------------------------------------------------

const workbook = XLSX.readFile(workbookPath)
const mappingWorkbook = XLSX.readFile(mappingPath)
const rosterWorkbook = XLSX.readFile(rosterWorkbookPath)

// -----------------------------------------------------------------------------
// Generic Helpers
// -----------------------------------------------------------------------------

function cleanName(value) {
  return value == null ? "" : String(value).trim()
}

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function excelSerialDateToIso(value) {
  const serial = Number(value)
  if (!Number.isFinite(serial) || serial <= 0) return ""

  // Excel's serial day 1 is 1900-01-01, with the historical 1900 leap-year bug.
  const epoch = Date.UTC(1899, 11, 30)
  const date = new Date(epoch + serial * 24 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 10)
}

function cleanDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }

  if (typeof value === "number") {
    return excelSerialDateToIso(value)
  }

  const text = cleanName(value)
  if (!text) return ""

  const parsed = new Date(text)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  return text
}

function sheetRows(sheetName) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`Missing sheet: ${sheetName}`)
  }

  return XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  })
}

function rosterSheetRows(sheetName) {
  const sheet = rosterWorkbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`Missing roster sheet: ${sheetName}`)
  }

  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  })
}

function csvEscape(value) {
  const text = value == null ? "" : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

function writeCsv(fileName, rows, columns) {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ]

  const outputPath = path.join(outputDir, fileName)
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8")
  console.log(`Wrote ${fileName}: ${rows.length} rows`)
}

// -----------------------------------------------------------------------------
// CSV Reading Helpers
// -----------------------------------------------------------------------------

function parseCsvLine(line) {
  const out = []
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

function readCsvRows(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean)
  const headers = parseCsvLine(lines[0])

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row = {}

    headers.forEach((header, index) => {
      row[header] = values[index] ?? ""
    })

    return row
  })
}

// -----------------------------------------------------------------------------
// Team Game Data
// -----------------------------------------------------------------------------

function scheduleGamesBySeason() {
  const gamesBySeason = new Map()

  for (const row of readCsvRows(gamesCsvPath)) {
    const season = Number(row.season_year)
    if (!season) continue

    if (!gamesBySeason.has(season)) {
      gamesBySeason.set(season, [])
    }

    gamesBySeason.get(season).push(row)
  }

  return gamesBySeason
}

function teamGoalsAgainstBySeason() {
  const totals = new Map()

  for (const [season, games] of scheduleGames.entries()) {
    for (const game of games) {
      const score = String(game.score || "").trim()
      const match = score.match(/^(\d+)\s*-\s*(\d+)$/)

      if (!match) continue

      const goalsAgainst = Number(match[2])
      totals.set(season, (totals.get(season) ?? 0) + goalsAgainst)
    }
  }

  return totals
}

const scheduleGames = scheduleGamesBySeason()
const goalsAgainstBySeason = teamGoalsAgainstBySeason()

// -----------------------------------------------------------------------------
// Player Name Mapping
// -----------------------------------------------------------------------------

function mappingRows() {
  const sheet = mappingWorkbook.Sheets[mappingWorkbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { defval: "" })
}

function mappingKey(season, sourceName) {
  return `${season}|${cleanName(sourceName)}`
}

const playerNameMap = new Map()

for (const row of mappingRows()) {
  if (!row.Season || !row.Old || !row.New) continue
  playerNameMap.set(mappingKey(row.Season, row.Old), cleanName(row.New))
}

function mappedPlayerName(season, sourceName) {
  return playerNameMap.get(mappingKey(season, sourceName)) ?? cleanName(sourceName)
}

// -----------------------------------------------------------------------------
// Roster Class Mapping
// -----------------------------------------------------------------------------

const rosterClassMap = new Map()

for (const row of sheetRows("2007 Roster")) {
  if (!row.Season || !row.Name) continue
  rosterClassMap.set(mappingKey(row.Season, row.Name), cleanName(row.Class))
}

function mappedPlayerClass(season, displayName, fallbackClass) {
  return rosterClassMap.get(mappingKey(season, displayName)) ?? cleanName(fallbackClass)
}

// -----------------------------------------------------------------------------
// Roster Export
// -----------------------------------------------------------------------------

const legacyRosterSheets = ["2007 Roster", "2008 Roster", "2009 Roster", "2010 Roster"]

const legacyRosters = legacyRosterSheets.flatMap((sheetName) =>
  sheetRows(sheetName)
    .filter((row) => row.Season && row.Name)
    .map((row) => ({
      season: row.Season,
      player_name: cleanName(row.Name),
      class: cleanName(row.Class),
      number: "",
      position: "",
    })),
)

function modernRosterName(row, season) {
  if (season <= 2013) return cleanName(row[2])
  return cleanName(row[1])
}

function modernRosterNumber(row) {
  return row[0]
}

function modernRosterExtra(row, season) {
  if (season === 2014) return cleanName(row[4])
  if (season === 2025) return cleanName(row[2])
  if (season <= 2013) return cleanName(row[3])
  return cleanName(row[2])
}

function modernRosterExtraType(season) {
  if (season === 2014 || season === 2025) return "class"
  return "position"
}

const modernRosters = rosterWorkbook.SheetNames.flatMap((sheetName) => {
  const season = Number(sheetName)
  if (!season) return []

  return rosterSheetRows(sheetName)
    .slice(1)
    .map((row) => {
      const extraType = modernRosterExtraType(season)
      const extra = modernRosterExtra(row, season)

      return {
        season,
        player_name: modernRosterName(row, season),
        class: extraType === "class" ? extra : "",
        number: modernRosterNumber(row),
        position: extraType === "position" ? extra : "",
      }
    })
    .filter((row) => row.player_name)
})

const rosters = [...legacyRosters, ...modernRosters]

writeCsv("rosters.csv", rosters, ["season", "player_name", "class", "number", "position"])

// -----------------------------------------------------------------------------
// Player Season Stats Export
// -----------------------------------------------------------------------------

const legacySeasonSheets = [
  "2007 Season Totals",
  "2008 Season Totals",
  "2009 Season Totals",
  "2010 Season Totals",
]

const legacyPlayerSeasonStats = legacySeasonSheets.flatMap((sheetName) =>
  sheetRows(sheetName).map((row) => {
    const playerName = mappedPlayerName(row.Season, row.Player)

    return {
      season: row.Season,
      player_name: playerName,
      class: mappedPlayerClass(row.Season, playerName, row.Class),
      number: "",
      gp: row.GP,
      minutes: row.Minutes,
      goals: row.Goals,
      assists: row.Assists,
      points: toNumber(row.Goals) * 2 + toNumber(row.Assists),
      shots: row.Shots,
      sog: row.SOG,
      pk: "",
      gwg: "",
      yc: row.YC,
      rc: row.RC,
      saves: row.Saves,
      steals: "",
      corner_kicks: "",
    }
  }),
)

const modernPlayerSeasonStats = sheetRows("2011-2025 Player Stats").map((row) => ({
  season: row.Season,
  player_name: row.Name,
  class: row.Class || "",
  number: row.Number,
  gp: row.GP,
  minutes: row.Min,
  goals: row.Goals,
  assists: row.Assists,
  points: row.Points,
  shots: row.Shots,
  sog: row.SOG,
  pk: row.PK,
  gwg: row.GWG,
  yc: "",
  rc: "",
  saves: "",
  steals: row.Steals,
  corner_kicks: row.CornerKicks,
}))

const playerSeasonStats = [...legacyPlayerSeasonStats, ...modernPlayerSeasonStats]

writeCsv(
  "player-season-stats.csv",
  playerSeasonStats,
  [
    "season",
    "player_name",
    "class",
    "number",
    "gp",
    "minutes",
    "goals",
    "assists",
    "points",
    "shots",
    "sog",
    "pk",
    "gwg",
    "yc",
    "rc",
    "saves",
    "steals",
    "corner_kicks",
  ],
)

// -----------------------------------------------------------------------------
// Player Game Stats Export
// -----------------------------------------------------------------------------

const rawDetailSheets = [
  "2007 Raw Detail",
  "2008 Raw Detail",
  "2009 Raw Detail",
  "2010 Raw Detail",
]

const playerGameStats = rawDetailSheets.flatMap((sheetName) => {
  const playerGameCounts = new Map()

  return sheetRows(sheetName).map((row) => {
    const season = Number(row.Season)
    const playerName = mappedPlayerName(row.Season, row.Player)
    const playerKey = mappingKey(season, playerName)
    const gameNumber = (playerGameCounts.get(playerKey) ?? 0) + 1
    const scheduleGame = scheduleGames.get(season)?.[gameNumber - 1]

    playerGameCounts.set(playerKey, gameNumber)

    return {
      season: row.Season,
      game_number: gameNumber,
      date: cleanDate(row.Date) || cleanDate(scheduleGame?.date),
      player_name: playerName,
      opponent: row.Opponent,
      shots: row.Shots,
      sog: row.SOG,
      goals: row.Goals,
      assists: row.Assists,
      yc: row.YC,
      rc: row.RC,
      saves: row.Saves,
      minutes: row.Minutes,
    }
  })
})

writeCsv(
  "player-game-stats.csv",
  playerGameStats,
  [
    "season",
    "game_number",
    "date",
    "player_name",
    "opponent",
    "shots",
    "sog",
    "goals",
    "assists",
    "yc",
    "rc",
    "saves",
    "minutes",
  ],
)

// -----------------------------------------------------------------------------
// Goalkeeper Stats Export
// -----------------------------------------------------------------------------

function legacyKeeperGamesPlayed(season, playerName) {
  return playerGameStats.filter(
    (row) =>
      row.season === season &&
      row.player_name === playerName &&
      toNumber(row.minutes) > 0,
  ).length
}

const legacyGoalkeeperSeasonStats = legacyPlayerSeasonStats
  .filter((row) => toNumber(row.minutes) > 0)
  .map((row) => {
    const seasonGoalkeepers = legacyPlayerSeasonStats.filter(
      (candidate) => candidate.season === row.season && toNumber(candidate.minutes) > 0,
    )

    const totalKeeperMinutes = seasonGoalkeepers.reduce(
      (sum, keeper) => sum + toNumber(keeper.minutes),
      0,
    )

    const teamGa = goalsAgainstBySeason.get(row.season) ?? 0
    const allocatedGa = totalKeeperMinutes
      ? teamGa * (toNumber(row.minutes) / totalKeeperMinutes)
      : 0

    return {
      season: row.season,
      player_name: row.player_name,
      class: row.class,
      number: row.number,
      gp: legacyKeeperGamesPlayed(row.season, row.player_name),
      minutes: row.minutes,
      ga: allocatedGa.toFixed(2),
      saves: row.saves,
      pksv: "",
      save_pct:
        toNumber(row.saves) + allocatedGa > 0
          ? (toNumber(row.saves) / (toNumber(row.saves) + allocatedGa)).toFixed(3)
          : "",
      gaa:
        toNumber(row.minutes) > 0
          ? ((allocatedGa * 80) / toNumber(row.minutes)).toFixed(2)
          : "",
      opp_sog: "",
      source_note: "2007-2010 GA allocated by keeper minutes from team goals against",
    }
  })

const modernGoalkeeperSeasonStats = sheetRows("2011-2025 Goalkeeper Stats").map((row) => ({
  season: row.Season,
  player_name: row.Name,
  class: row.Class || "",
  number: row.Number,
  gp: row.GP,
  minutes: row.Min,
  ga: row.GA,
  saves: row.Saves,
  pksv: row.PKSV,
  save_pct: row.SavePct,
  gaa: row.GAA,
  opp_sog: row.OppSOG,
  source_note: "Source workbook goalkeeper stats",
}))

const goalkeeperSeasonStats = [...legacyGoalkeeperSeasonStats, ...modernGoalkeeperSeasonStats]

writeCsv(
  "goalkeeper-season-stats.csv",
  goalkeeperSeasonStats,
  [
    "season",
    "player_name",
    "class",
    "number",
    "gp",
    "minutes",
    "ga",
    "saves",
    "pksv",
    "save_pct",
    "gaa",
    "opp_sog",
    "source_note",
  ],
)

// -----------------------------------------------------------------------------
// Diagnostics
// -----------------------------------------------------------------------------

console.log("Player name mappings:", playerNameMap.size)

for (const season of [2007, 2008, 2009, 2010]) {
  console.log(`${season} GA:`, goalsAgainstBySeason.get(season))
}
