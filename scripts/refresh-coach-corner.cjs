const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const assert = require('node:assert/strict')
const ts = require('typescript')

process.chdir(path.resolve(__dirname, '..'))
const file = 'data/coachs-corner/seeding-2026.json'
const original = fs.readFileSync(file, 'utf8')
const bundledPython = path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe')
const python = process.env.PYTHON_EXE || (fs.existsSync(bundledPython) ? bundledPython : 'python3')

try {
  const refresh = spawnSync(python, ['output/refresh-coach-stats.py'], { stdio: 'inherit', timeout: 180000 })
  if (refresh.error) throw refresh.error
  assert.equal(refresh.status, 0, 'StatsPlus refresh failed')
  const compiled = { exports: {} }
  new Function('exports', 'module', ts.transpileModule(fs.readFileSync('lib/coach-corner-data.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText)(compiled.exports, compiled)
  const updated = compiled.exports.withMainHortonvilleSchedule(JSON.parse(fs.readFileSync(file, 'utf8')), fs.readFileSync('public/data/games_2026.csv', 'utf8'))
  assert.equal(updated.overall.length, updated.teams.length)
  for (const row of updated.overall) {
    assert.equal(row.GP, row.W + row.L + row.T)
    assert.equal(row.Points, row.W * 3 + row.T)
    assert.equal(row.GD, row.GF - row.GA)
  }
  for (const game of updated.schedule.filter(game => game.Score)) {
    assert.match(game.Score, /^\d+-\d+$/)
    const [gf, ga] = game.Score.split('-').map(Number)
    assert.equal(game.Result === 'T' ? 'D' : game.Result, gf > ga ? 'W' : gf < ga ? 'L' : 'D')
  }
  fs.writeFileSync(file, JSON.stringify(updated, null, 2) + '\n')
  console.log(`Validated ${updated.overall.length} teams. Weekly slate: ${updated.sync.weeklyPreparedFor}. Hortonville results read only from the main schedule.`)
} catch (error) {
  fs.writeFileSync(file, original)
  console.error(error.message)
  process.exitCode = 1
}
