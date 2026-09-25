const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const ts = require('typescript')
const { createRequire } = require('node:module')
const read = slug => JSON.parse(fs.readFileSync(`data/jv/${slug}.json`, 'utf8'))
const sum = (rows, field) => rows.reduce((n, row) => n + (row[field] ?? 0), 0)
const report = []
for (const slug of ['red', 'white']) {
  const { stats, boxScores } = read(slug)
  const matches = (line, player) => line.player === `${player.number} - ${player.name}` || line.player === player.name
  const players = stats.players.map(player => {
    const lines = boxScores.flatMap(game => game.players.filter(line => matches(line, player)))
    const totals = { goals: sum(lines, 'goals'), assists: sum(lines, 'assists') }
    totals.points = totals.goals * 2 + totals.assists
    for (const [field, value] of Object.entries(totals)) assert.equal(player[field], value, `${slug}: ${player.name} ${field}`)
    // Red's sparse stat lines aren't a full participation log.
    if (slug === 'white') assert.equal(player.gp, lines.length, `${player.name} GP`)
    return { ...player, recordedStatLines: lines.length }
  })
  for (const game of boxScores) {
    assert.equal(new Set(game.players.map(p => p.player)).size, game.players.length, `${slug} duplicate player: ${game.id}`)
    assert.equal(sum(game.players, 'goals') + (game.unattributedGoals ?? 0), game.team.goals, `${slug} goals reconciliation: ${game.id}`)
    for (const line of game.players) assert.equal(stats.players.filter(p => matches(line, p)).length, 1, `Unmatched player: ${line.player}`)
  }
  for (const keeper of stats.goalkeepers) {
    const appearances = boxScores.flatMap(game => game.players.filter(line => matches(line, keeper) && line.gkMinutes > 0).map(line => ({ game, line })))
    const lines = appearances.map(a => a.line)
    assert.equal(keeper.games, lines.length, `${slug} ${keeper.name} keeper games`)
    assert.equal(keeper.minutes, sum(lines, 'gkMinutes'))
    assert.equal(keeper.saves, lines.every(l => l.saves != null) ? sum(lines, 'saves') : null)
    if (keeper.recordedSaves != null) assert.equal(keeper.recordedSaves, sum(lines, 'saves'))
    let ga = 0
    for (const { game, line } of appearances) {
      const keepers = game.players.filter(p => p.gkMinutes > 0)
      assert(line.goalsAgainst != null || keepers.length === 1 || game.opponentTotals.goals === 0, 'Unattributed keeper GA')
      ga += line.goalsAgainst ?? game.opponentTotals.goals
    }
    assert.equal(keeper.goalsAgainst, ga, `${slug} keeper GA`)
  }
  report.push({ team: stats.team, games: boxScores.length, players, goalkeepers: stats.goalkeepers, caveat: slug === 'red' ? 'GP preserved: sparse game stat lines do not establish full participation. Existing Game Log/Goal Log conflicts remain flagged in source audit.' : null })
}
const bg = read('black-gray')
const calendar = read('calendar').events
const compiled = { exports: {} }
const localRequire = createRequire(path.resolve('lib/black-gray-team.ts'))
const resolve = name => name.startsWith('@/') ? require(path.resolve(name.slice(2))) : localRequire(name)
new Function('exports', 'module', 'require', ts.transpileModule(fs.readFileSync('lib/black-gray-team.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText)(compiled.exports, compiled, resolve)
for (const squad of ['black', 'gray']) {
  const { stats } = compiled.exports.getBlackGrayBundle(squad)
  const games = bg.gameStats.filter(game => calendar.some(e => e.team === stats.team && e.date === game.date && e.opponent === game.opponent))
  const normalize = name => name.replace(/©/g, '').trim()
  assert.equal(new Set(stats.players.map(p => normalize(p.name))).size, stats.players.length, `${squad} split player identity`)
  for (const player of stats.players) {
    const lines = games.flatMap(g => g.players.filter(p => p.name === player.name))
    assert.equal(player.goals, sum(lines, 'goals'))
    assert.equal(player.assists, sum(lines, 'assists'))
    assert.equal(player.points, player.goals * 2 + player.assists)
    assert.equal(player.gp, games.filter(g => g.played?.includes(player.name)).length)
  }
  for (const game of games) {
    const result = bg.results.find(r => r.date === game.date && r.opponent === game.opponent)
    assert.equal(sum(game.players, 'goals') + (game.unattributedGoals ?? 0), Number(result.score.split('-')[0]))
    assert.equal(new Set(game.played ?? []).size, (game.played ?? []).length)
  }
  for (const keeper of stats.goalkeepers) {
    const lines = games.flatMap(g => g.goalkeepers.filter(k => k.name === keeper.name))
    assert.equal(keeper.games, lines.length)
    assert.equal(keeper.minutes, sum(lines, 'minutes'))
    assert.equal(keeper.goalsAgainst, sum(lines, 'goalsAgainst'))
    assert.equal(keeper.saves, lines.every(l => l.saves == null) ? null : sum(lines, 'saves'))
  }
  report.push({ team: stats.team, games: games.length, players: stats.players, goalkeepers: stats.goalkeepers, incompleteLineups: games.filter(g => !g.played).map(g => `${g.date} vs ${g.opponent}`), caveat: 'Saves remain unknown where not recorded; GP counts only recorded lineups.' })
}
assert.equal(report.slice(2).reduce((n, r) => n + r.games, 0), bg.gameStats.length, 'Unassigned Black/Gray game')
fs.writeFileSync('output/jv-totals-audit.json', JSON.stringify({ auditedAt: new Date().toISOString(), teams: report }, null, 2) + '\n')
for (const team of report) console.log(JSON.stringify({ team: team.team, games: team.games, goals: sum(team.players, 'goals'), assists: sum(team.players, 'assists'), keepers: team.goalkeepers, incompleteLineups: team.incompleteLineups }))
console.log('All recorded JV player and keeper totals reconcile.')
