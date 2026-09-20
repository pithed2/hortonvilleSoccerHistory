const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const compiled = { exports: {} }
new Function('exports', 'module', 'require', ts.transpileModule(fs.readFileSync('lib/coach-weekly.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText)(compiled.exports, compiled, id => require(id.startsWith('@/') ? '../' + id.slice(2) : '../lib/' + id))
const { weekStart, shiftDate, weeklyMatchups } = compiled.exports
assert.equal(weekStart('2026-09-20'), '2026-09-20')
assert.equal(weekStart('2026-09-21'), '2026-09-20')
assert.equal(shiftDate('2026-12-28', 6), '2027-01-03')
const game = (Team, Opponent, Date = '2026-09-17', Result = null, Score = null) => ({ Team, Opponent, Date, Result, Score, Location: 'H' })
const data = {
  overall: [{ Team: 'Hortonville', Group: 'Group B', W: 6, L: 0, T: 1 }, { Team: 'Preble', Group: 'Group B', W: 5, L: 2, T: 0 }, { Team: 'Hudson', Group: 'Group A', W: 7, L: 0, T: 1 }],
  opponentRecords: [{ Team: 'Winner', W: 5, L: 1, T: 0 }, { Team: 'Even', W: 2, L: 2, T: 1 }],
  schedule: [game('Hortonville', 'Preble'), game('Preble', 'Hortonville', '2026-09-17', 'L', '0-2'), game('Hudson', 'Winner'), game('Preble', 'Even'), game('Preble', 'Unknown'), game('Preble', 'Winner', '2026-09-21')],
}
let sections = weeklyMatchups(data, '2026-09-13')
assert.deepEqual(sections.map(s => s.title), ['Group B · Head-to-head', 'Group B · Key matchups', 'Group A · Head-to-head', 'Group A · Key matchups', 'FVA · Key matchups'])
assert.equal(sections[0].games.length, 1)
assert.equal(sections[0].games[0].Score, '0-2')
assert.equal(sections[1].games.length, 0)
assert.equal(sections[3].games.length, 1)
data.weeklyHighlights = ['2026-09-17|Hudson|Winner']
data.opponentRecords[0] = { Team: 'Winner', W: 5, L: 5, T: 0 }
data.schedule[2].Result = 'W'
data.schedule[2].Score = '3-0'
sections = weeklyMatchups(data, '2026-09-13')
assert.equal(sections[3].games.length, 1)
assert.equal(sections[3].games[0].Score, '3-0')
console.log('Weekly matchups: dates, group order, deduplication, records, and retained results passed.')

assert.equal(weekStart('2026-09-19'), '2026-09-13')
assert.equal(weekStart('2026-09-26'), '2026-09-20')
assert.equal(weekStart('2026-09-27'), '2026-09-27')
assert.equal(weekStart('2027-01-01'), '2026-12-27')
const saved = JSON.parse(fs.readFileSync('data/coachs-corner/seeding-2026.json', 'utf8'))
const week2 = weeklyMatchups(saved, weekStart('2026-09-20'))
const fva = week2.find(section => section.isFva)
for (const [date, opponent] of [['2026-09-22', 'Appleton North'], ['2026-09-24', 'Appleton West']]) {
  assert.ok(fva.games.some(game => game.Date === date && game.Team === 'Hortonville' && game.Opponent === opponent))
}
assert.ok(week2.flatMap(section => section.games).every(game => game.Date >= '2026-09-20' && game.Date <= '2026-09-26'))
console.log('Week 2: Sunday rollover, year boundary, and both Hortonville fixtures passed.')
