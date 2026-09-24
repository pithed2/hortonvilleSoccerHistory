const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(file, dependencies = {}, fetcher = fetch) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
  }).outputText
  new Function('require', 'module', 'exports', 'fetch', code)(name => dependencies[name], module, module.exports, fetcher)
  return module.exports
}

const weather = load('lib/game-weather.ts')
const now = Date.parse('2026-09-24T16:00:00Z')
const event = { id: 'home', date: '2026-09-24', start: '2026-09-24T23:30:00Z', time: '6:30 PM', home: true, opponent: 'Appleton West' }
assert.equal(weather.weatherLocation(event), '54944')
assert.equal(weather.weatherLocation({ ...event, home: false }), 'Appleton')
assert.equal(weather.weatherLocation({ ...event, home: false, location: 'De Pere' }), 'De Pere')
assert.equal(weather.weatherLocation({ ...event, home: false, opponent: 'Unknown' }), null)
assert.equal(weather.forecastEligible(event, now), true)
assert.equal(weather.forecastEligible({ ...event, time: 'TBD' }, now), false)
assert.equal(weather.forecastEligible({ ...event, time: '' }, now), false)
assert.equal(weather.forecastEligible({ ...event, start: 'invalid' }, now), false)
assert.equal(weather.forecastEligible({ ...event, date: '2026-09-25' }, now), false)
assert.equal(weather.forecastEligible(event, Date.parse(event.start)), false)
assert.equal(weather.forecastEligible(event, now - 17 * 86400000), false)
// UTC timestamps work across Central daylight-saving transitions.
assert.equal(weather.forecastEligible({ ...event, date: '2026-11-02', start: '2026-11-03T00:30:00Z' }, Date.parse('2026-11-02T16:00:00Z')), true)
const hour = Date.parse('2026-09-24T23:00:00Z') / 1000
const data = { hourly: { time: [hour, hour + 3600], temperature_2m: [68.3, 65], weather_code: [2, 3] } }
assert.deepEqual(weather.forecastAtKickoff(data, event.start), { temperature: 68, description: 'Partly cloudy' })
assert.equal(weather.forecastAtKickoff(data, '2026-09-25T04:00:00Z'), null)
assert.equal(weather.forecastAtKickoff({ hourly: { ...data.hourly, temperature_2m: [null, null] } }, event.start), null)
assert.equal(weather.forecastAtKickoff({ hourly: { ...data.hourly, weather_code: [999, 999] } }, event.start), null)
assert.equal(weather.forecastAtKickoff({}, event.start), null)

async function checkRoute() {
  const calls = []
  const events = [event, { ...event, id: 'away', home: false }, { ...event, id: 'unavailable', home: false, opponent: 'Kaukauna' }]
  const fetcher = async url => {
    const parsed = new URL(url)
    calls.push(parsed)
    const name = parsed.searchParams.get('name')
    if (name?.includes('Kaukauna')) throw new Error('Simulated provider outage')
    if (name) {
      const home = name === '54944'
      return Response.json({ results: [{ name: home ? 'Hortonville' : 'Appleton', country_code: 'US', admin1: 'Wisconsin', latitude: home ? 44.3 : 44.26, longitude: -88.4, postcodes: [home ? '54944' : '54911'] }] })
    }
    assert.equal(parsed.searchParams.get('temperature_unit'), 'fahrenheit')
    assert.equal(parsed.searchParams.get('timeformat'), 'unixtime')
    return Response.json(data)
  }
  const route = load('app/api/game-weather/route.ts', {
    '@/data/jv/calendar.json': { events },
    '@/lib/game-weather': { ...weather, forecastEligible: e => weather.forecastEligible(e, now) },
  }, fetcher)
  const response = await route.GET()
  const result = await response.json()
  assert.equal(result.forecasts.home.zip, '54944')
  assert.equal(result.forecasts.away.zip, '54911')
  assert.equal(result.forecasts.unavailable, undefined)
  assert(calls.some(url => url.searchParams.get('name') === '54911'), 'Away city must resolve through its ZIP')
  const failed = load('app/api/game-weather/route.ts', {
    '@/data/jv/calendar.json': { events },
    '@/lib/game-weather': { ...weather, forecastEligible: () => true },
  }, async () => { throw new Error('Offline') })
  const empty = await failed.GET()
  assert.deepEqual(await empty.json(), { forecasts: {} })
  assert.equal(empty.headers.get('cache-control'), 'no-store')
  console.log('Weather checks passed: ZIP selection, kickoff/DST, forecast horizon, missing values, and isolated API failures.')
}
checkRoute().catch(error => { console.error(error); process.exitCode = 1 })
