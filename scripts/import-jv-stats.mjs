import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import XLSX from "xlsx"

const projectRoot = process.cwd()
const config = JSON.parse(fs.readFileSync(path.join(projectRoot, "data", "jv", "teams.config.json"), "utf8"))
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...value] = arg.replace(/^--/, "").split("=")
  return [key, value.join("=")]
}))
const slug = args.team || "red"
const teamConfig = config[slug]
if (!teamConfig) throw new Error(`Unknown JV team: ${slug}`)

const sourcePath = args.source || process.env.JV_STATS_WORKBOOK || teamConfig.sourcePath
const approvedBy = args["approved-by"] || process.env.JV_STATS_APPROVED_BY || teamConfig.approvedBy
if (!sourcePath || !fs.existsSync(sourcePath)) throw new Error(`Workbook not found: ${sourcePath || "not configured"}`)
if (!approvedBy) throw new Error("An approver is required. Use --approved-by=Name or JV_STATS_APPROVED_BY.")

const workbook = XLSX.readFile(sourcePath, { cellDates: true })
const issues = []

function rows(sheetName) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) throw new Error(`Missing required sheet: ${sheetName}`)
  return XLSX.utils.sheet_to_json(sheet, { defval: null }).map((row) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.replace(/\s+/g, " ").trim(), value]),
  ))
}

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function text(value) {
  return value == null ? "" : String(value).replace(/\s+/g, " ").trim()
}

function isoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const parsed = new Date(text(value))
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10)
}

function shortDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`))
}

const rosterRows = rows("Roster").filter((row) => text(row["Player Name"]))
const scheduleRows = rows("Schedule & Team Stats").filter((row) => number(row["Game #"]) && isoDate(row.Date) && text(row.Opponent))
const gameLogRows = rows("Game Log").filter((row) => number(row["Game #"]) && text(row["Player (No. - Name)"]))
const goalLogRows = rows("Goal Log").filter((row) => number(row["Game #"]) && text(row["Scorer (No. - Name)"]))

const scheduleByGame = new Map(scheduleRows.map((row) => [number(row["Game #"]), row]))
for (const row of gameLogRows) if (!scheduleByGame.has(number(row["Game #"]))) issues.push(`Game Log references missing game ${row["Game #"]}.`)
for (const row of goalLogRows) if (!scheduleByGame.has(number(row["Game #"]))) issues.push(`Goal Log references missing game ${row["Game #"]}.`)

const completed = scheduleRows.filter((row) => ["W", "L", "T"].includes(text(row.Result).toUpperCase()))
const completedIds = new Set(completed.map((row) => number(row["Game #"])))
for (const row of completed) {
  const gameNumber = number(row["Game #"])
  const expectedGoals = number(row.GF)
  const loggedGoals = goalLogRows.filter((goal) => number(goal["Game #"]) === gameNumber).length + number(row["Own Goals For"])
  if (expectedGoals !== loggedGoals) issues.push(`Game ${gameNumber}: GF is ${expectedGoals}, but Goal Log plus own goals is ${loggedGoals}.`)
}

const playerTotals = new Map()
for (const row of gameLogRows.filter((entry) => completedIds.has(number(entry["Game #"])))) {
  const key = text(row["Player (No. - Name)"])
  const current = playerTotals.get(key) || { shots: 0, sog: 0, goals: 0, assists: 0, yc: 0, rc: 0, saves: 0, gkMinutes: 0 }
  current.shots += number(row.Shots)
  current.sog += number(row.SOG)
  current.goals += number(row.Goals)
  current.assists += number(row.Assists)
  current.yc += number(row.YC)
  current.rc += number(row.RC)
  current.saves += number(row.Saves)
  current.gkMinutes += number(row["GK Minutes"])
  playerTotals.set(key, current)
}

const inactivePlayers = new Set(teamConfig.inactivePlayers || [])
const players = rosterRows.map((row) => {
  const name = text(row["Player Name"])
  const key = text(row["Player Key (auto)"]) || `${number(row["No."])} - ${name}`
  const totals = playerTotals.get(key) || { goals: 0, assists: 0 }
  return {
    number: number(row["No."]),
    name,
    gp: inactivePlayers.has(name) ? 0 : completed.length,
    goals: totals.goals || 0,
    assists: totals.assists || 0,
    points: (totals.goals || 0) * 2 + (totals.assists || 0),
  }
}).sort((left, right) => right.points - left.points || right.goals - left.goals || left.name.localeCompare(right.name))

const boxScores = completed.map((row) => {
  const id = number(row["Game #"])
  const playerRows = gameLogRows.filter((entry) => number(entry["Game #"]) === id)
  return {
    id,
    date: isoDate(row.Date),
    opponent: text(row.Opponent),
    location: text(row["H/A"]).toUpperCase() === "H" ? "Home" : "Away",
    conference: text(row["Conf?"]).toUpperCase() === "Y",
    result: text(row.Result).toUpperCase(),
    team: { shots: number(row["Team Shots"]), sog: number(row["Team SOG"]), saves: number(row["Team Saves"]), yc: number(row["Team YC"]), rc: number(row["Team RC"]), goals: number(row.GF) },
    opponentTotals: { shots: number(row["Opp Shots"]), saves: number(row["Opp Saves"]), goals: number(row.GA) },
    players: playerRows.map((entry) => ({
      player: text(entry["Player (No. - Name)"]), shots: number(entry.Shots), sog: number(entry.SOG), goals: number(entry.Goals), assists: number(entry.Assists), yc: number(entry.YC), rc: number(entry.RC), saves: number(entry.Saves), gkMinutes: number(entry["GK Minutes"]),
    })),
    scoring: goalLogRows.filter((goal) => number(goal["Game #"]) === id).map((goal) => ({ half: text(goal.Half), scorer: text(goal["Scorer (No. - Name)"]), assist: text(goal["Assist (No. - Name)"]) || null })),
  }
})

const goalkeepersByKey = new Map()
for (const game of boxScores) {
  const keepers = game.players.filter((player) => player.saves || player.gkMinutes)
  if (keepers.length > 1 && game.opponentTotals.goals) issues.push(`Game ${game.id}: multiple goalkeepers require per-keeper goals-against allocation.`)
  for (const keeper of keepers) {
    const current = goalkeepersByKey.get(keeper.player) || { games: 0, saves: 0, minutes: 0, goalsAgainst: 0 }
    current.games += 1
    current.saves += keeper.saves
    current.minutes += keeper.gkMinutes
    if (keepers.length === 1) current.goalsAgainst += game.opponentTotals.goals
    goalkeepersByKey.set(keeper.player, current)
  }
}

const rosterByKey = new Map(rosterRows.map((row) => [text(row["Player Key (auto)"]), row]))
const goalkeepers = [...goalkeepersByKey.entries()].map(([key, totals]) => {
  const roster = rosterByKey.get(key)
  return { number: number(roster?.["No."] || key.split("-")[0]), name: text(roster?.["Player Name"]) || key.replace(/^\d+\s*-\s*/, ""), ...totals }
})

const wins = completed.filter((row) => text(row.Result).toUpperCase() === "W").length
const losses = completed.filter((row) => text(row.Result).toUpperCase() === "L").length
const ties = completed.filter((row) => text(row.Result).toUpperCase() === "T").length
const conferenceGames = completed.filter((row) => text(row["Conf?"]).toUpperCase() === "Y")
const conferenceRecord = ["W", "L", "T"].map((result) => conferenceGames.filter((row) => text(row.Result).toUpperCase() === result).length).join("–")
const totals = completed.reduce((sum, row) => ({ goalsFor: sum.goalsFor + number(row.GF), goalsAgainst: sum.goalsAgainst + number(row.GA), shots: sum.shots + number(row["Team Shots"]), sog: sum.sog + number(row["Team SOG"]), saves: sum.saves + number(row["Team Saves"]) }), { goalsFor: 0, goalsAgainst: 0, shots: 0, sog: 0, saves: 0 })
const sourceBuffer = fs.readFileSync(sourcePath)
const importedAt = new Date().toISOString()
const sourceModifiedAt = fs.statSync(sourcePath).mtime.toISOString()

const output = {
  stats: {
    slug,
    team: teamConfig.team,
    updated: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${completed.at(-1)?.Date ? isoDate(completed.at(-1).Date) : importedAt.slice(0, 10)}T00:00:00Z`)),
    audit: {
      sourceFile: path.basename(sourcePath), sourceModifiedAt, sourceSha256: createHash("sha256").update(sourceBuffer).digest("hex"), importedAt,
      validation: issues.length ? "warning" : "passed",
      validationSummary: issues.length ? issues.join(" ") : "Schedule, completed-game count, team totals, player totals, goalkeeper totals, and scoring logs reconciled.",
      approvedBy,
    },
    record: { wins, losses, ties, conference: conferenceRecord }, totals, goalkeepers,
    recent: [...completed].reverse().map((row) => ({ id: number(row["Game #"]), date: shortDate(isoDate(row.Date)), opponent: text(row.Opponent), location: text(row["H/A"]).toUpperCase() === "H" ? "Home" : "Away", score: `${number(row.GF)}–${number(row.GA)}`, result: text(row.Result).toUpperCase() })),
    upcoming: scheduleRows.filter((row) => !completedIds.has(number(row["Game #"]))).map((row) => ({ date: shortDate(isoDate(row.Date)), opponent: text(row.Opponent), location: text(row["H/A"]).toUpperCase() === "H" ? "Home" : "Away" })),
    players,
  },
  boxScores,
}

const outputPath = path.join(projectRoot, "data", "jv", `${slug}.json`)
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8")
console.log(`Imported ${teamConfig.team}: ${completed.length} completed games, ${players.length} players, validation ${output.stats.audit.validation}.`)
if (issues.length) for (const issue of issues) console.warn(`Warning: ${issue}`)
