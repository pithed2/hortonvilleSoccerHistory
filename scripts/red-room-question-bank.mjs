import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"

const csvRows = (source) => {
  const lines = source.replace(/\r/g, "").trim().split("\n")
  const split = (line) => {
    const values = []; let value = ""; let quoted = false
    for (let index = 0; index < line.length; index++) {
      const char = line[index]
      if (char === '"' && quoted && line[index + 1] === '"') { value += '"'; index++ }
      else if (char === '"') quoted = !quoted
      else if (char === "," && !quoted) { values.push(value); value = "" }
      else value += char
    }
    values.push(value)
    return values
  }
  const columns = split(lines[0])
  return lines.slice(1).filter(Boolean).map((line) => Object.fromEntries(split(line).map((value, index) => [columns[index], value])))
}

const hash = (value) => createHash("sha256").update(value).digest("hex")
const slug = (value) => value.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const shuffled = (values, seed) => [...values].sort((a, b) => hash(`${seed}|${a}`).localeCompare(hash(`${seed}|${b}`)))
const choiceSet = (answer, candidates, seed, desired = 4) => {
  const answerText = String(answer)
  const alternatives = shuffled([...new Set(candidates.map(String).filter((value) => value !== answerText))], seed)
  return shuffled([answerText, ...alternatives.slice(0, desired - 1)], `${seed}|final`)
}
const numericChoices = (answer, seed, floor = 0) => {
  const value = Number(answer)
  const candidates = [value - 3, value - 2, value - 1, value + 1, value + 2, value + 3, 0].filter((item) => item >= floor)
  return choiceSet(String(value), candidates.map(String), seed)
}
const prettyDate = (value, season) => {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : `${value.replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/, "")}, ${season} 12:00:00 UTC`
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(normalized))
}
const resultWord = { W: "Win", L: "Loss", T: "Tie" }

function takeAcrossSeasons(items, count, seed) {
  const groups = new Map()
  for (const item of items) groups.set(item.season, [...(groups.get(item.season) || []), item])
  const seasons = [...groups.keys()].sort((a, b) => Number(b) - Number(a))
  for (const season of seasons) groups.set(season, shuffled(groups.get(season), `${seed}|${season}|items`))
  const selected = []
  let round = 0
  while (selected.length < count) {
    let added = false
    for (const season of shuffled(seasons, `${seed}|${round}|seasons`)) {
      const group = groups.get(season)
      if (group[round]) { selected.push(group[round]); added = true }
      if (selected.length === count) break
    }
    if (!added) break
    round++
  }
  if (selected.length < count) throw new Error(`Question category ${seed} only produced ${selected.length} of ${count} requested items.`)
  return selected
}

export async function buildRedRoomQuestionBank() {
  const [boxSource, playerSource, keeperSource, seasonSource, gamesSource] = await Promise.all([
    readFile("public/data/boxscore-player-stats.csv", "utf8"),
    readFile("public/data/player-season-stats.csv", "utf8"),
    readFile("public/data/goalkeeper-season-stats.csv", "utf8"),
    readFile("public/data/seasons.csv", "utf8"),
    readFile("public/data/games.csv", "utf8"),
  ])
  const boxRows = csvRows(boxSource).filter((row) => Number(row.season) >= 2007 && Number(row.season) <= 2026)
  const playerRows = csvRows(playerSource).filter((row) => Number(row.season) >= 2007 && Number(row.season) <= 2026)
  const keeperRows = csvRows(keeperSource).filter((row) => Number(row.season) >= 2007 && Number(row.season) <= 2026 && row.saves !== "")
  const seasonRows = csvRows(seasonSource).filter((row) => Number(row.season_year) >= 2005 && Number(row.played) > 0)
  const varsityGames = csvRows(gamesSource).filter((row) => Number(row.season_year) >= 2005 && ["W", "L", "T", "D"].includes(row.result))

  const gameMap = new Map()
  for (const row of boxRows) {
    const key = `${row.season}-${row.game_number}`
    if (!gameMap.has(key)) gameMap.set(key, { season: row.season, gameNumber: row.game_number, date: row.date, opponent: row.opponent, score: row.score, result: row.result, site: row.site })
  }
  const games = [...gameMap.values()]
  const opponentsBySeason = new Map()
  const scoresBySeason = new Map()
  for (const game of games) {
    opponentsBySeason.set(game.season, [...new Set([...(opponentsBySeason.get(game.season) || []), game.opponent])])
    scoresBySeason.set(game.season, [...new Set([...(scoresBySeason.get(game.season) || []), game.score])])
  }

  const question = ({ id, prompt, answer, choices, hint, href, label, season }) => ({ id, prompt, answer: String(answer), choices, hint, sourceHref: href, sourceLabel: label, season: String(season) })
  const gameHref = (row) => `/seasons/${row.season}#game-${row.game_number}`
  const gameLabel = (row) => `${row.season} ${row.opponent} box score`
  const bank = []

  const goalRows = boxRows.filter((row) => row.player_name && Number(row.goals) >= 0 && (Number(row.goals) > 0 || Number(row.assists) > 0))
  for (const row of takeAcrossSeasons(goalRows, 30, "game-goals")) {
    const id = `rrq-game-goals-${row.season}-${row.game_number}-${slug(row.player_name)}`
    bank.push(question({ id, season: row.season, prompt: `How many goals did ${row.player_name} score against ${row.opponent} on ${prettyDate(row.date, row.season)}?`, answer: row.goals, choices: numericChoices(row.goals, id), hint: `Hortonville's final score was ${row.score}. Check the individual scoring lines.`, href: gameHref(row), label: gameLabel(row) }))
  }

  const assistRows = boxRows.filter((row) => row.player_name && Number(row.assists) >= 0 && (Number(row.goals) > 0 || Number(row.assists) > 0))
  for (const row of takeAcrossSeasons(assistRows, 30, "game-assists")) {
    const id = `rrq-game-assists-${row.season}-${row.game_number}-${slug(row.player_name)}`
    bank.push(question({ id, season: row.season, prompt: `How many assists did ${row.player_name} record against ${row.opponent} on ${prettyDate(row.date, row.season)}?`, answer: row.assists, choices: numericChoices(row.assists, id), hint: `The match finished ${row.score}. Look at the assists column in the box score.`, href: gameHref(row), label: gameLabel(row) }))
  }

  const saveRows = boxRows.filter((row) => row.player_name && row.has_saves === "true" && row.saves !== "")
  for (const row of takeAcrossSeasons(saveRows, 20, "game-saves")) {
    const id = `rrq-game-saves-${row.season}-${row.game_number}-${slug(row.player_name)}`
    bank.push(question({ id, season: row.season, prompt: `How many saves did ${row.player_name} record against ${row.opponent} on ${prettyDate(row.date, row.season)}?`, answer: row.saves, choices: numericChoices(row.saves, id), hint: `The final score was ${row.score}. Check the goalkeeper line.`, href: gameHref(row), label: gameLabel(row) }))
  }

  for (const game of takeAcrossSeasons(games.filter((game) => game.score), 20, "game-score")) {
    const id = `rrq-game-score-${game.season}-${game.gameNumber}`
    const choices = choiceSet(game.score, scoresBySeason.get(game.season) || [], id)
    bank.push(question({ id, season: game.season, prompt: `What was the final score when Hortonville played ${game.opponent} on ${prettyDate(game.date, game.season)}?`, answer: game.score, choices, hint: `It was a ${resultWord[game.result] || game.result} for Hortonville.`, href: `/seasons/${game.season}#game-${game.gameNumber}`, label: `${game.season} ${game.opponent} box score` }))
  }

  for (const game of takeAcrossSeasons(games.filter((game) => resultWord[game.result]), 15, "game-result")) {
    const id = `rrq-game-result-${game.season}-${game.gameNumber}`
    bank.push(question({ id, season: game.season, prompt: `What was Hortonville's result against ${game.opponent} on ${prettyDate(game.date, game.season)}?`, answer: resultWord[game.result], choices: shuffled(["Win", "Loss", "Tie"], id), hint: `The recorded final score was ${game.score}.`, href: `/seasons/${game.season}#game-${game.gameNumber}`, label: `${game.season} ${game.opponent} box score` }))
  }

  for (const game of takeAcrossSeasons(games.filter((game) => (opponentsBySeason.get(game.season) || []).length >= 4), 10, "game-opponent")) {
    const id = `rrq-game-opponent-${game.season}-${game.gameNumber}`
    bank.push(question({ id, season: game.season, prompt: `Which opponent did Hortonville play on ${prettyDate(game.date, game.season)} in game ${game.gameNumber} of the ${game.season} season?`, answer: game.opponent, choices: choiceSet(game.opponent, opponentsBySeason.get(game.season) || [], id), hint: `Hortonville's score in that match was ${game.score}.`, href: `/seasons/${game.season}#game-${game.gameNumber}`, label: `${game.season} game ${game.gameNumber} box score` }))
  }

  for (const row of takeAcrossSeasons(playerRows.filter((row) => row.player_name && row.goals !== ""), 10, "season-player-goals")) {
    const id = `rrq-season-goals-${row.season}-${slug(row.player_name)}`
    bank.push(question({ id, season: row.season, prompt: `How many goals did ${row.player_name} score during the ${row.season} season?`, answer: row.goals, choices: numericChoices(row.goals, id), hint: `Check the ${row.season} player totals, not a single-game box score.`, href: `/seasons/${row.season}#players`, label: `${row.season} player statistics` }))
  }

  for (const row of takeAcrossSeasons(playerRows.filter((row) => row.player_name && row.assists !== ""), 5, "season-player-assists")) {
    const id = `rrq-season-assists-${row.season}-${slug(row.player_name)}`
    bank.push(question({ id, season: row.season, prompt: `How many assists did ${row.player_name} record during the ${row.season} season?`, answer: row.assists, choices: numericChoices(row.assists, id), hint: `Check the season totals in the player table.`, href: `/seasons/${row.season}#players`, label: `${row.season} player statistics` }))
  }

  for (const row of takeAcrossSeasons(keeperRows, 5, "season-keeper-saves")) {
    const id = `rrq-season-saves-${row.season}-${slug(row.player_name)}`
    bank.push(question({ id, season: row.season, prompt: `How many saves did ${row.player_name} record during the ${row.season} season?`, answer: row.saves, choices: numericChoices(row.saves, id), hint: `Use the goalkeeper season totals.`, href: `/seasons/${row.season}#goalkeepers`, label: `${row.season} goalkeeper statistics` }))
  }

  for (const row of takeAcrossSeasons(seasonRows.map((row) => ({ ...row, season: row.season_year })), 5, "season-record")) {
    const id = `rrq-season-wins-${row.season_year}`
    bank.push(question({ id, season: row.season_year, prompt: `How many matches did Hortonville win during the ${row.season_year} season?`, answer: row.wins, choices: numericChoices(row.wins, id), hint: `The team played ${row.played} matches and finished ${row.wins}-${row.losses}-${row.ties}.`, href: `/seasons/${row.season_year}`, label: `${row.season_year} season record` }))
  }

  for (const row of takeAcrossSeasons(seasonRows.map((row) => ({ ...row, season: row.season_year })), 5, "season-goals-for")) {
    const id = `rrq-season-goals-for-${row.season_year}`
    bank.push(question({ id, season: row.season_year, prompt: `How many goals did Hortonville score during the ${row.season_year} season?`, answer: row.gf, choices: numericChoices(row.gf, id), hint: `This asks for the team's full-season goals-for total.`, href: `/seasons/${row.season_year}`, label: `${row.season_year} season record` }))
  }

  const headToHead = new Map()
  for (const game of varsityGames) {
    const opponent = game.opponent.trim()
    if (!headToHead.has(opponent)) headToHead.set(opponent, { opponent, played: 0, wins: 0, gf: 0 })
    const record = headToHead.get(opponent)
    record.played++
    if (game.result === "W") record.wins++
    const score = game.score.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/)
    if (score) record.gf += Number(score[1])
  }
  const frequentOpponents = [...headToHead.values()].filter((record) => record.played >= 8).sort((a, b) => b.played - a.played || a.opponent.localeCompare(b.opponent)).slice(0, 5)
  for (const record of frequentOpponents) {
    const href = `/head-to-head/${slug(record.opponent)}`
    const label = `Hortonville vs. ${record.opponent} history`
    for (const [kind, prompt, answer, hint] of [
      ["meetings", `How many documented varsity matches has Hortonville played against ${record.opponent}?`, record.played, `Use the all-time head-to-head summary, not one season.`],
      ["wins", `How many documented varsity wins does Hortonville have against ${record.opponent}?`, record.wins, `The head-to-head page separates wins, losses, and ties.`],
      ["goals", `How many total goals has Hortonville scored in its documented varsity matches against ${record.opponent}?`, record.gf, `Add nothing yourself—the head-to-head summary already has the goals-for total.`],
    ]) {
      const id = `rrq-head-to-head-${kind}-${slug(record.opponent)}`
      bank.push(question({ id, season: "history", prompt, answer, choices: numericChoices(answer, id), hint, href, label }))
    }
  }

  const coachNames = { Ruhle: "Gary Ruhle", Montalbano: "Andy Montalbano", Everett: "Paul Everett" }
  const coachChoices = Object.values(coachNames)
  for (const year of [2005, 2009, 2013, 2019, 2025]) {
    const row = seasonRows.find((candidate) => Number(candidate.season_year) === year)
    const id = `rrq-coach-season-${year}`
    bank.push(question({ id, season: year, prompt: `Who was Hortonville's boys varsity head coach for the ${year} season?`, answer: coachNames[row.coach], choices: shuffled(coachChoices, id), hint: `The coaching records organize the program into three documented head-coaching eras.`, href: "/coaching-records", label: "Hortonville coaching records" }))
  }
  const recordsByCoach = new Map()
  for (const row of seasonRows) {
    if (!row.coach) continue
    if (!recordsByCoach.has(row.coach)) recordsByCoach.set(row.coach, { wins: 0, seasons: 0 })
    const record = recordsByCoach.get(row.coach)
    record.wins += Number(row.wins)
    record.seasons++
  }
  for (const coach of ["Ruhle", "Montalbano", "Everett"]) {
    const id = `rrq-coach-wins-${slug(coach)}`
    const record = recordsByCoach.get(coach)
    bank.push(question({ id, season: "history", prompt: `How many documented varsity wins are credited to ${coachNames[coach]} in the archive?`, answer: record.wins, choices: numericChoices(record.wins, id), hint: `The coaching page keeps documented game totals separate from any reported scrimmages.`, href: "/coaching-records", label: "Hortonville coaching records" }))
  }
  {
    const id = "rrq-coach-longest-tenured"
    bank.push(question({ id, season: "history", prompt: "Who is the longest-tenured head coach in Hortonville boys soccer history?", answer: "Paul Everett", choices: shuffled(coachChoices, id), hint: "His era began in 2010 and continues with the current team.", href: "/coaching-records", label: "Hortonville coaching records" }))
  }
  {
    const id = "rrq-coach-expanded-record"
    bank.push(question({ id, season: "history", prompt: "Which coach has a separately listed expanded record that includes reported scrimmages?", answer: "Paul Everett", choices: shuffled(coachChoices, id), hint: "The page separates the game archive from the broader reported coaching total.", href: "/coaching-records", label: "Hortonville coaching records" }))
  }

  const storyQuestions = [
    ["commercial-club-quirk", "What made retrieving a stray ball at Commercial Club Field especially memorable?", "An active electric fence beside a cow pasture", ["An active electric fence beside a cow pasture", "A creek running through midfield", "A railroad crossing behind the goal", "A rooftop beside the touchline"], "The cattle stayed in. The soccer balls did not always cooperate.", "/fields", "Fields & Facilities"],
    ["original-jv-landmark", "What landmark sat just feet off the sideline of Hortonville's original JV field?", "A large cottonwood tree", ["A large cottonwood tree", "A red grain silo", "A stone clock tower", "A covered bridge"], "Early players remembered this natural obstacle fondly.", "/fields", "Fields & Facilities"],
    ["original-fields-today", "What now runs through the site of Hortonville's original campus soccer fields?", "A parking lot and driveway", ["A parking lot and driveway", "A baseball grandstand", "The high school library", "A community swimming pool"], "The campus kept evolving after the fields moved.", "/fields", "Fields & Facilities"],
    ["middle-school-before", "What was the middle school soccer field area before it was rebuilt?", "An overgrown field", ["An overgrown field", "A corn maze", "A paved tennis complex", "A frozen retention pond"], "Community partners turned neglected space into a full-size pitch.", "/fields", "Fields & Facilities"],
    ["middle-school-builder", "Who led the reconstruction and development of the middle school field?", "Jeff Kellner and McMahon Associates", ["Jeff Kellner and McMahon Associates", "Jason Hurley and Mark Jones", "Gary Ruhle and FC Magic", "Patrick Koss and New London"], "Look in the collaboration list under Middle School Field Development.", "/fields", "Fields & Facilities"],
    ["middle-school-scoreboard", "Who provided the scoreboard for the first phase of the middle school field?", "Drs. Claybaugh and Dunathan", ["Drs. Claybaugh and Dunathan", "The Hortonville Commercial Club", "Fox West YMCA", "Mike Sommers"], "The Claybaugh family supported the program in several roles.", "/fields", "Fields & Facilities"],
    ["middle-school-shed", "Who secured the full-size equipment shed and weather shelter at the middle school field?", "Paul Everett", ["Paul Everett", "Andy Montalbano", "Gary Ruhle", "Patrick Koss"], "The coaching archive credits him with many physical pieces of the program.", "/fields", "Fields & Facilities"],
    ["middle-school-bleachers", "Who provided the bleacher seating at the middle school soccer field?", "Hortonville Area School District", ["Hortonville Area School District", "Fox West YMCA", "FC Magic", "The Bay Conference"], "This contribution came from the district itself.", "/fields", "Fields & Facilities"],
    ["akin-first-lights", "In what year did Hortonville soccer first play under the lights at Akin Field?", "2009", ["2009", "2005", "2013", "2018"], "It happened before the stadium's later turf modernization.", "/fields", "Fields & Facilities"],
    ["akin-announcer", "Who is remembered as the announcer—and Hortonville Soccer's biggest fan—during the grass-field Akin era?", "Mark Jones", ["Mark Jones", "Jason Hurley", "Mike Sommers", "Jeff Kellner"], "The field story gives him both titles.", "/fields", "Fields & Facilities"],
    ["akin-modernized", "In what year was Akin Field completely modernized?", "2018", ["2018", "2009", "2013", "2021"], "Football, track and field, soccer, and the district joined forces.", "/fields", "Fields & Facilities"],
    ["akin-uprights", "What can Akin Field's football uprights do when they are not needed?", "Rotate away from the soccer pitch", ["Rotate away from the soccer pitch", "Lower beneath the turf", "Slide behind the scoreboard", "Convert into corner flags"], "The modernization was designed so football equipment would not interfere with soccer.", "/fields", "Fields & Facilities"],
    ["origin-narrator", "Whose memories tell the origin story on Hortonville's history page?", "Patrick Koss", ["Patrick Koss", "Paul Everett", "Andy Montalbano", "Gary Ruhle"], "He describes students joining him while he kicked a ball around after work.", "/history", "Hortonville soccer history"],
    ["origin-early-keeper", "Which early player is identified as a goalkeeper in the program's origin story?", "Keaton Craddock", ["Keaton Craddock", "Ben Yankee", "Mike Sommers", "Jason Hurley"], "He is named alongside Ben Yankee in the early pickup-game story.", "/history", "Hortonville soccer history"],
    ["origin-first-coach", "Who became the club coach as Hortonville's informal soccer effort grew into a team?", "Gary Ruhle", ["Gary Ruhle", "Paul Everett", "Andy Montalbano", "Patrick Koss"], "The founding story says Mrs. Craddock helped secure this coach.", "/history", "Hortonville soccer history"],
    ["camp-founders", "Who began the Polar Bear Camp tradition in 2003?", "Jean Wagner and Lorie Claybaugh", ["Jean Wagner and Lorie Claybaugh", "Dena Craddock and Mandy Price", "Patrick Koss and Mike Sommers", "Jeff Kellner and Jason Hurley"], "The camp started at Greenville Middle School Field.", "/history", "Hortonville soccer timeline"],
    ["first-conference-title", "Which conference championship did Hortonville win in 2013?", "Bay Conference", ["Bay Conference", "Fox Valley Association", "Eastern Valley Conference", "Wisconsin Valley Conference"], "This was the program's first conference championship.", "/history", "Hortonville soccer timeline"],
    ["regional-title-years", "Which set lists Hortonville's documented regional championship years on the history timeline?", "2019, 2020, 2023, and 2025", ["2019, 2020, 2023, and 2025", "2013, 2018, 2021, and 2026", "2009, 2014, 2019, and 2024", "2020, 2021, 2022, and 2023"], "Two came in consecutive years, followed later by two more.", "/history", "Hortonville soccer timeline"],
    ["modern-logo-era", "When did the current Modern Bear logo era begin?", "2018", ["2018", "2005", "2009", "2025"], "The logo evolution section starts this era the same year Akin Field was modernized.", "/history", "Hortonville logo evolution"],
    ["camp-logo-name", "What is the name of the one-time camp logo in the program's logo history?", "Junior Polar Bears", ["Junior Polar Bears", "Polar Cub United", "Young H-Bears", "Little Akin Eleven"], "It was designed as a special mascot for youth development camps.", "/history", "Hortonville logo evolution"],
  ]
  for (const [key, prompt, answer, choices, hint, href, label] of storyQuestions) {
    const id = `rrq-story-${key}`
    bank.push(question({ id, season: "history", prompt, answer, choices: shuffled(choices, id), hint, href, label }))
  }

  if (bank.length !== 200) throw new Error(`Expected 200 Red Room questions; generated ${bank.length}.`)
  const ids = new Set(bank.map((item) => item.id))
  if (ids.size !== bank.length) throw new Error("Red Room question IDs are not unique.")
  for (const item of bank) {
    if (!item.choices.includes(item.answer)) throw new Error(`Question ${item.id} does not include its answer.`)
    if (new Set(item.choices).size !== item.choices.length || item.choices.length < 3) throw new Error(`Question ${item.id} has invalid choices.`)
  }
  return bank
}
