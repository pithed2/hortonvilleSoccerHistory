import calendar from "@/data/jv/calendar.json"
import { forecastAtKickoff, forecastEligible, weatherLocation, type GameForecast, type HourlyForecast } from "@/lib/game-weather"

export const runtime = "nodejs"

type Place = { name: string; country_code: string; admin1: string; latitude: number; longitude: number; postcodes?: string[] }

async function places(name: string): Promise<Place[]> {
  const params = new URLSearchParams({ name, countryCode: "US", count: "20", language: "en", format: "json" })
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) })
  if (!response.ok) return []
  const data = await response.json()
  return Array.isArray(data.results) ? data.results.filter((p: Place) => p.country_code === "US" && p.admin1 === "Wisconsin") : []
}

async function locationForecast(location: string) {
  const isZip = /^\d{5}$/.test(location)
  const matches = await places(isZip ? location : `${location}, Wisconsin`)
  const city = matches.find(p => isZip ? p.postcodes?.includes(location) : p.name.toLowerCase() === location.toLowerCase())
  const zip = isZip ? location : city?.postcodes?.find(p => /^\d{5}$/.test(p))
  if (!city || !zip) return null
  const place = isZip ? city : (await places(zip)).find(p => p.postcodes?.includes(zip))
  if (!place || !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return null
  const params = new URLSearchParams({ latitude: String(place.latitude), longitude: String(place.longitude), hourly: "temperature_2m,weather_code", temperature_unit: "fahrenheit", timeformat: "unixtime", timezone: "America/Chicago", forecast_days: "16" })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(7000) })
  if (!response.ok) return null
  return { data: await response.json() as HourlyForecast, zip, city: city.name }
}

export async function GET() {
  const events = calendar.events.filter(event => forecastEligible(event))
  const locations = [...new Set(events.map(weatherLocation).filter((value): value is string => value !== null))]
  const forecasts: Record<string, GameForecast> = {}
  await Promise.all(locations.map(async location => {
    try {
      const result = await locationForecast(location)
      if (!result) return
      for (const event of events.filter(event => weatherLocation(event) === location)) {
        const forecast = forecastAtKickoff(result.data, event.start)
        if (forecast) forecasts[event.id] = { ...forecast, zip: result.zip, city: result.city }
      }
    } catch {
      // Weather is optional. One unavailable location must not hide other forecasts.
    }
  }))
  return Response.json({ forecasts }, { headers: { "Cache-Control": Object.keys(forecasts).length ? "public, max-age=300, s-maxage=1800" : "no-store" } })
}
