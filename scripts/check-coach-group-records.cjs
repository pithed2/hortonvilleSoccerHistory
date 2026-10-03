const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const compiled = { exports: {} }
new Function('exports', 'module', ts.transpileModule(fs.readFileSync('lib/coach-group-records.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(compiled.exports, compiled)
const { groupRecords } = compiled.exports
const teams = ['Hortonville', 'A', 'B', 'Idle'].map(Team => ({ Team, Group: 'Group B' })).concat([{ Team: 'Outside', Group: 'Group A' }])
const game = (Date, Team, Opponent, Result, Score) => ({ Date, Team, Opponent, Result, Score })
const rows = groupRecords(teams, [
  game('2026-09-01', 'Hortonville', 'A', 'W', '3-0'),
  game('2026-09-01', 'A', 'Hortonville', 'W', '1-0'), // main schedule wins conflicts
  game('2026-09-02', 'A', 'B', null, null),
  game('2026-09-02', 'B', 'A', 'D', '2-2'), // one-sided result credits both teams
  game('2026-09-03', 'Hortonville', 'A', 'T', null), // repeat meeting, missing score
  game('2026-09-04', 'Hortonville', 'Outside', 'W', '9-0'),
  game('2026-09-05', 'A', 'B', null, null),
], 'Group B')
const h = rows.find(row => row.Team === 'Hortonville')
assert.deepEqual([h.GP, h.W, h.L, h.T, h.Points, h.PPG, h.scored, h.opponents.length], [2, 1, 0, 1, 4, 2, 1, 1])
const a = rows.find(row => row.Team === 'A')
assert.deepEqual([a.GP, a.W, a.L, a.T, a.GF, a.GA], [3, 0, 1, 2, 2, 5])
assert.equal(rows.find(row => row.Team === 'Idle').PPG, null)
assert.deepEqual(rows.map(row => row.Team), ['Hortonville', 'B', 'A', 'Idle'])
const saved = JSON.parse(fs.readFileSync('data/coachs-corner/seeding-2026.json', 'utf8'))
for (const group of ['Group A', 'Group B']) {
  const actual = groupRecords(saved.teams, saved.schedule, group)
  assert.equal(actual.reduce((sum, row) => sum + row.W - row.L, 0), 0)
  assert.equal(actual.reduce((sum, row) => sum + row.GD, 0), 0)
  assert.ok(actual.every(row => row.GP === row.W + row.L + row.T && row.Points === row.W * 3 + row.T))
  console.log(group, actual.map(row => `${row.Team}: ${row.W}-${row.L}-${row.T}, ${row.PPG?.toFixed(2) ?? '–'} PPG`).join('; '))
}
console.log('Group records: mirrored fixtures, conflicts, repeat meetings, missing scores, and group isolation passed.')
