import fs from "node:fs"

// Read-only reconciliation. Sparse box scores do not prove full participation.
const normalize = value => {
  const name = String(value).trim().replace(/^\d+(?:\/\d+)?\s*-\s*/, "").replace(/\s+/g, " ")
  return name === "Fenton Hershi" ? "Fenton Hirschi" : name
}
function csv(file) {
  const text = fs.readFileSync(`public/data/${file}.csv`, "utf8").replace(/^\uFEFF/, "")
  const rows = []; let row = [], cell = "", quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++ }
      else quoted = !quoted
    } else if (!quoted && (c === "," || c === "\n")) {
      row.push(cell.replace(/\r$/, "")); cell = ""
      if (c === "\n") { rows.push(row); row = [] }
    } else cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  const headers = rows.shift()
  return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])))
}
const sum = (rows, key) => rows.reduce((n, row) => n + Number(row[key] ?? 0), 0)
const group = (rows, key) => {
  const groups = new Map()
  for (const row of rows) { const id = key(row); groups.set(id, [...(groups.get(id) ?? []), row]) }
  return groups
}
const boxes = csv("boxscore-player-stats")
const seasons = csv("player-season-stats")
const keepers = csv("goalkeeper-season-stats")
const detail = csv("player-game-stats")
const roster = csv("rosters")
// Expand initials only when the season roster/totals supply one unique match.
const varsityName = row => {
  const name = normalize(row.player_name)
  if (!/^[A-Z]\. /.test(name)) return name
  const candidates = [...new Set([...roster, ...seasons, ...keepers].filter(p => p.season === row.season)
    .map(p => normalize(p.player_name)).filter(n => n[0] === name[0] && n.slice(n.indexOf(" ") + 1) === name.slice(3)))]
  return candidates.length === 1 ? candidates[0] : name
}
for (const row of boxes) row.player_name = varsityName(row)
const report = { varsity: [], jv: [], historical: [] }
for (const [season, rows] of group(boxes, r => r.season)) {
  const differences = []
  const players = []
  for (const [name, lines] of group(rows, r => normalize(r.player_name))) {
    const stored = seasons.find(r => r.season === season && normalize(r.player_name) === name)
    const goals = sum(lines, "goals"), assists = sum(lines, "assists"), points = goals * 2 + assists
    if (stored) for (const [key, actual] of Object.entries({ goals, assists, points })) {
      if (Number(stored[key]) !== actual) differences.push({ name, key, stored: Number(stored[key]), retallied: actual })
    }
    else if (goals || assists) differences.push({ name, key: "missing season player", goals, assists })
    players.push({ name, recordedGames: new Set(lines.map(r => r.game_number)).size, goals, assists, points })
  }
  for (const stored of seasons.filter(r => r.season === season)) {
    if (!players.some(p => p.name === normalize(stored.player_name)) && (Number(stored.goals) || Number(stored.assists))) {
      differences.push({ name: normalize(stored.player_name), key: "season scorer missing from box scores", goals: Number(stored.goals), assists: Number(stored.assists) })
    }
  }
  const games = [...group(rows, r => r.game_number)].map(([id, lines]) => {
    const goals = sum(lines, "goals"), scoreGoals = Number(lines[0].score.split(/[-–]/)[0])
    return { id, date: lines[0].date, opponent: lines[0].opponent, score: lines[0].score, playerGoals: goals, assists: sum(lines, "assists"), unattributedGoals: scoreGoals - goals }
  })
  const duplicateRows = [...group(rows, r => `${r.game_number}|${normalize(r.player_name)}`)].filter(([, lines]) => lines.length > 1).map(([key]) => key)
  const goalkeeperTotals = [...group(rows.filter(r => r.is_goalkeeper === "true"), r => normalize(r.player_name))].map(([name, lines]) => {
    const saved = keepers.find(r => r.season === season && normalize(r.player_name) === name)
    const saves = sum(lines.filter(r => r.has_saves === "true"), "saves")
    const ga = sum(lines.filter(r => r.has_ga === "true"), "ga")
    return { name, recordedGames: lines.length, saves, ga, storedSaves: saved?.saves, storedGA: saved?.ga,
      savesComplete: lines.every(r => r.has_saves === "true"), gaComplete: lines.every(r => r.has_ga === "true") }
  })
  const entry = { season, games, players, differences, duplicateRows, goalkeeperTotals }
  if (season === "2026") {
    entry.secondaryGameLogMissing = games.filter(g => !detail.some(r => r.season === season && r.game_number === g.id)).map(g => g.id)
    report.varsity.push(entry)
  } else report.historical.push(entry)
}
for (const slug of ["red", "white"]) {
  const data = JSON.parse(fs.readFileSync(`data/jv/${slug}.json`, "utf8"))
  const lines = data.boxScores.flatMap(g => g.players)
  const matchesPlayer = (label, player) => {
    const key = label.replace(/\s+/g, " ").trim()
    return key === `${player.number} - ${player.name}` || (key === player.name && data.stats.players.filter(p => p.name === player.name).length === 1)
  }
  const players = data.stats.players.map(p => {
    const entries = lines.filter(r => matchesPlayer(r.player, p))
    const goals = sum(entries, "goals"), assists = sum(entries, "assists"), points = goals * 2 + assists
    return { number: p.number, name: p.name, goals, assists, points, matchesStored: p.goals === goals && p.assists === assists && p.points === points }
  })
  const games = data.boxScores.map(g => {
    const logConflicts = []
    if (g.scoring.length) for (const p of g.players) {
      for (const [key, field] of [["goals", "scorer"], ["assists", "assist"]]) {
        const count = g.scoring.filter(s => (s[field] ?? "").replace(/\s+/g, " ").trim() === p.player.replace(/\s+/g, " ").trim()).length
        if (count !== p[key]) logConflicts.push({ name: normalize(p.player), key, boxScore: p[key], scoringLog: count })
      }
    }
    return { id: g.id, date: g.date, opponent: g.opponent, score: `${g.team.goals}-${g.opponentTotals.goals}`, playerGoals: sum(g.players, "goals"), assists: sum(g.players, "assists"), saves: sum(g.players, "saves"), minutes: sum(g.players, "gkMinutes"), logConflicts,
      duplicatePlayers: [...group(g.players, p => p.player.replace(/\s+/g, " ").trim())].filter(([, list]) => list.length > 1).map(([name]) => name) }
  })
  const goalkeeperTotals = data.stats.goalkeepers.map(k => {
    const entries = lines.filter(p => matchesPlayer(p.player, k) && (p.gkMinutes > 0 || p.saves > 0))
    return { name: k.name, games: entries.length, saves: sum(entries, "saves"), minutes: sum(entries, "gkMinutes"), stored: k }
  })
  report.jv.push({ team: data.stats.team, games, players, goalkeeperTotals })
}
const bg = JSON.parse(fs.readFileSync("data/jv/black-gray.json", "utf8"))
report.jv.push({ team: bg.team,
  games: bg.results.map(g => {
    const stats = bg.gameStats.find(s => s.date === g.date && s.opponent === g.opponent)
    return { ...g, playerGoals: stats ? sum(stats.players, "goals") : null, assists: stats ? sum(stats.players, "assists") : null,
      unattributedGoals: Number(g.score.split("-")[0]) - (stats ? sum(stats.players, "goals") : 0) }
  }),
  players: [...group(bg.gameStats.flatMap(g => g.players), p => p.name)].map(([name, rows]) => ({ name, goals: sum(rows, "goals"), assists: sum(rows, "assists"), points: 2 * sum(rows, "goals") + sum(rows, "assists") })),
  goalkeeperTotals: [...group(bg.gameStats.flatMap(g => g.goalkeepers), p => p.name)].map(([name, rows]) => ({ name, reportedGames: rows.length, goalsAgainst: rows.every(r => r.goalsAgainst != null) ? sum(rows, "goalsAgainst") : null, minutes: sum(rows, "minutes"), recordedSaves: sum(rows, "saves"), saves: rows.every(r => r.saves !== null) ? sum(rows, "saves") : null })),
})
if (process.argv.includes("--markdown")) {
  const table = (headers, rows) => [headers, headers.map(() => "---"), ...rows].map(row => `| ${row.map(v => v ?? "Unknown").join(" | ")} |`).join("\n")
  const sections = [
    "# Player statistics reconciliation — September 14, 2026",
    "Retallied every available varsity and JV player box score. Current-season coverage: 25 final results, with individual game statistics for 21. Also checked 313 historical varsity box scores (2007–2025). This is an audit of available records, not independent verification of every original score sheet or full match participation.",
    "## Findings",
    "- Current-season varsity, JV Red, and JV White goals, assists, and points match their game records. No scoring totals were changed.\n- Black/Gray’s six reported player goals and three assists add up correctly. Five of the team’s eleven goals still lack player attribution: August 28 FVL (2), August 31 Appleton North (2), and September 8 Appleton East (1). The coach confirmed these details are not yet available.\n- JV Red: Jaxon Wolff’s August 27 assist appears in both the source workbook Game Log and the website box score, but not in the Goal Log. His one assist is retained pending clarification.\n- JV Red’s September 10 correction from Carson Sanford to Grayson Ackermann is already present on the website and matches the Goal Log. The source workbook Game Log still assigns those two goals to Carson. Commit b983412 documents the correction. A raw re-import would undo it; the updated import validation flags the conflict.\n- The separate varsity player-game-stats.csv stops at September 8 and omits September 12. The public box scores and season scoring totals include September 12. The older player_game_stats.csv only covers the first two games; it was not added again to the public box scores.\n- GP is not a uniform attendance measure: varsity reflects recorded stat appearances, Red/White use team participation, and Black/Gray player GP is unknown. Sparse scoring records cannot establish true individual appearances.",
    "## Black/Gray goalkeeping",
    "Ayden Lenth: two reported games, 160 minutes, and one recorded save. August 25: 80 minutes, one save. September 10: 80 minutes, saves unknown. Confirmed goals allowed: 3 at Appleton East and 2 at Little Chute, totaling 5 for the two reported games. Full season totals remain incomplete.",
  ]
  for (const team of [...report.varsity.map(v => ({ ...v, team: `Varsity ${v.season}` })), ...report.jv]) {
    sections.push(`## ${team.team}`, table(["Date", "Opponent", "Final", "Player goals", "Assists"], team.games.map(g => [g.date, g.opponent, g.score, g.playerGoals, g.assists])))
    sections.push(table(["Player", "Goals", "Assists", "Points"], team.players.map(p => [`${p.number != null ? `#${p.number} ` : ""}${p.name}`, p.goals, p.assists, p.points])))
  }
  sections.push("## Current-season goalkeeper cross-check", "Varsity: Eli Ryan’s 17 saves and 5 goals allowed, and David Grasse’s 11 saves and 2 goals allowed, match the public box scores. The detailed minutes file supports all 138 of David’s minutes and 242 of Eli’s stored 322 minutes; the September 12 game is absent from that file, so the remaining 80 minutes cannot be independently retallied there. No minute totals were changed.\n\nJV Red: Henri Waite (#31) totals 20 saves in 430 minutes; Nolan Raaths totals 1 save in 5 minutes. JV White: Ben Decker totals 19 saves in 500 minutes. These match all available game lines. The two JV Red players named Henri Waite (#17 and #31) were kept separate using their source player keys.")
  sections.push("## Historical varsity", "After resolving unique abbreviated names against the season roster and totals, all recorded player goals, assists, and points reconcile to their season totals. Twelve games have a discrepancy between the sum of individual goals and the final score. These are unresolved source differences; changing a player’s total without an attribution would be speculative.")
  sections.push(table(["Season", "Date", "Opponent", "Final", "Player goals"], report.historical.flatMap(s => s.games.filter(g => g.unattributedGoals !== 0).map(g => [s.season, g.date, g.opponent, g.score, g.playerGoals]))))
  sections.push("Historical goalkeeper GA for 2007–2010 cannot be reconciled as confirmed individual totals: the season import allocates team goals against in proportion to minutes, while the box-score source assigns game goals against to the goalkeeper with the most minutes. Both are estimates using different methods. These estimates were preserved; recorded saves were checked separately. Historical seasons without a box score for every match are not certified complete by this audit.")
  sections.push("## Sources and method", "Sources: public/data/boxscore-player-stats.csv, player-season-stats.csv, goalkeeper-season-stats.csv, player-game-stats.csv, rosters.csv; data/jv/red.json, white.json, black-gray.json; JV Red source workbook 2026_Season_Stats.xlsx (read only); and the prior JV Red correction in git history. Goals and assists were summed per player and game, with points recalculated as 2 × goals + assists. Repeated source representations were compared, not added together. Missing saves were kept unknown. Run node scripts/audit-player-stats.mjs --json for the detailed reconciliation data.")
  console.log(sections.join("\n\n"))
} else if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2))
else {
  for (const team of [...report.varsity.map(v => ({ ...v, team: `Varsity ${v.season}` })), ...report.jv]) {
    console.log(team.team, JSON.stringify(team))
  }
  console.log("Historical season comparisons:", JSON.stringify(report.historical.map(s => ({ season: s.season, games: s.games.length, differences: s.differences.length, gameGoalGaps: s.games.filter(g => g.unattributedGoals !== 0).length, duplicateRows: s.duplicateRows.length }))))
}
