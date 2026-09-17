const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const compiled = { exports: {} }
new Function('exports', 'module', ts.transpileModule(fs.readFileSync('lib/coach-weekly.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(compiled.exports, compiled)
const { weekStart, shiftDate, weeklyMatchups } = compiled.exports
assert.equal(weekStart('2026-09-20'), '2026-09-14')
assert.equal(weekStart('2026-09-21'), '2026-09-21')
assert.equal(shiftDate('2026-12-28', 6), '2027-01-03')
const game = (Team, Opponent, Date = '2026-09-17', Result = null, Score = null) => ({ Team, Opponent, Date, Result, Score, Location: 'H' })
const data = {
  overall: [{ Team: 'Hortonville', Group: 'Group B', W: 6, L: 0, T: 1 }, { Team: 'Preble', Group: 'Group B', W: 5, L: 2, T: 0 }, { Team: 'Hudson', Group: 'Group A', W: 7, L: 0, T: 1 }],
  opponentRecords: [{ Team: 'Winner', W: 5, L: 1, T: 0 }, { Team: 'Even', W: 2, L: 2, T: 1 }],
  schedule: [game('Hortonville', 'Preble'), game('Preble', 'Hortonville', '2026-09-17', 'L', '0-2'), game('Hudson', 'Winner'), game('Preble', 'Even'), game('Preble', 'Unknown'), game('Preble', 'Winner', '2026-09-21')],
}
let sections = weeklyMatchups(data, '2026-09-14')
assert.deepEqual(sections.map(s => s.title), ['Group B · Head-to-head', 'Group B · Key matchups', 'Group A · Head-to-head', 'Group A · Key matchups'])
assert.equal(sections[0].games.length, 1)
assert.equal(sections[0].games[0].Score, '0-2')
assert.equal(sections[1].games.length, 0)
assert.equal(sections[3].games.length, 1)
data.weeklyHighlights = ['2026-09-17|Hudson|Winner']
data.opponentRecords[0] = { Team: 'Winner', W: 5, L: 5, T: 0 }
data.schedule[2].Result = 'W'
data.schedule[2].Score = '3-0'
sections = weeklyMatchups(data, '2026-09-14')
assert.equal(sections[3].games.length, 1)
assert.equal(sections[3].games[0].Score, '3-0')
console.log('Weekly matchups: dates, group order, deduplication, records, and retained results passed.')
