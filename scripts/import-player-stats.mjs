import fs from "node:fs"
import path from "node:path"
import XLSX from "xlsx"

const workbookPath =
  "C:/Users/amontalbano/Downloads/Hortonville_Player_Stats_2007-2025 (1).xlsx"

const outputDir = path.join(process.cwd(), "public", "data")

if (!fs.existsSync(workbookPath)) {
  throw new Error(`Workbook not found: ${workbookPath}`)
}

if (!fs.existsSync(outputDir)) {
  throw new Error(`Output directory not found: ${outputDir}`)
}

const workbook = XLSX.readFile(workbookPath)

function sheetRows(sheetName) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`Missing sheet: ${sheetName}`)
  }

  return XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  })
}

console.log("Workbook sheets:")
for (const sheetName of workbook.SheetNames) {
  console.log(`- ${sheetName}`)
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

const rosters = sheetRows("2007 Roster").map((row) => ({
  season: row.Season,
  player_name: row.Name,
  class: row.Class,
  number: "",
}))

writeCsv("rosters.csv", rosters, ["season", "player_name", "class", "number"])

const legacySeasonSheets = [
  "2007 Season Totals",
  "2008 Season Totals",
  "2009 Season Totals",
  "2010 Season Totals",
]

const legacyPlayerSeasonStats = legacySeasonSheets.flatMap((sheetName) =>
  sheetRows(sheetName).map((row) => ({
    season: row.Season,
    player_name: row.Player,
    class: row.Class || "",
    number: "",
    gp: row.GP,
    minutes: row.Minutes,
    goals: row.Goals,
    assists: row.Assists,
    points: Number(row.Goals || 0) * 2 + Number(row.Assists || 0),
    shots: row.Shots,
    sog: row.SOG,
    pk: "",
    gwg: "",
    yc: row.YC,
    rc: row.RC,
    saves: row.Saves,
    steals: "",
    corner_kicks: "",
  })),
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

const rawDetailSheets = [
  "2007 Raw Detail",
  "2008 Raw Detail",
  "2009 Raw Detail",
  "2010 Raw Detail",
]

const playerGameStats = rawDetailSheets.flatMap((sheetName) =>
  sheetRows(sheetName).map((row) => ({
    season: row.Season,
    player_name: row.Player,
    opponent: row.Opponent,
    shots: row.Shots,
    sog: row.SOG,
    goals: row.Goals,
    assists: row.Assists,
    yc: row.YC,
    rc: row.RC,
    saves: row.Saves,
    minutes: row.Minutes,
  })),
)

writeCsv(
  "player-game-stats.csv",
  playerGameStats,
  [
    "season",
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

const goalkeeperSeasonStats = sheetRows("2011-2025 Goalkeeper Stats").map((row) => ({
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
}))

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
  ],
)

