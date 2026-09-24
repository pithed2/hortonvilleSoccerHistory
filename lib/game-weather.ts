export type WeatherEvent = { id: string; date: string; start: string; time?: string | null; home: boolean; opponent: string; location?: string }
export type GameForecast = { temperature: number; description: string; zip: string; city: string }
export type HourlyForecast = { hourly?: { time?: number[]; temperature_2m?: (number | null)[]; weather_code?: (number | null)[] } }

const cityAliases: [RegExp, string][] = [
  [/appleton|fox valley lutheran|\bfvl\b/i, "Appleton"],
  [/west de pere|de pere/i, "De Pere"],
  [/bay port/i, "Suamico"],
  [/preble|notre dame/i, "Green Bay"],
  [/oshkosh/i, "Oshkosh"],
  [/wi(?:sconsin)? rapids/i, "Wisconsin Rapids"],
  [/stevens point|spash/i, "Stevens Point"],
  [/luxemburg/i, "Luxemburg"],
  [/d\.?c\.? everest/i, "Weston"],
  ...["Little Chute", "Neenah", "Fond du Lac", "Shawano", "New London", "Kaukauna", "Kimberly", "Marshfield"].map(city => [new RegExp(city, "i"), city] as [RegExp, string]),
]

export function weatherLocation(event: WeatherEvent): string | null {
  if (event.home) return "54944"
  // An explicit venue city takes precedence over the opponent (neutral-site games).
  for (const value of [event.location, event.opponent]) {
    if (!value) continue
    const city = cityAliases.find(([pattern]) => pattern.test(value))?.[1]
    if (city) return city
  }
  return null
}

export function forecastEligible(event: Pick<WeatherEvent, "time" | "start" | "date">, now = Date.now()): boolean {
  if (!event.time || /tbd|postponed|cancel/i.test(event.time)) return false
  const kickoff = Date.parse(event.start)
  if (!Number.isFinite(kickoff) || kickoff <= now || kickoff - now >= 16 * 86400000) return false
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(kickoff)
  return date === event.date
}

export function weatherDescription(code: number): string | null {
  const descriptions: Record<number, string> = {
    0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Freezing fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
    56: "Light freezing drizzle", 57: "Freezing drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Freezing rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
    80: "Light rain showers", 81: "Rain showers", 82: "Heavy rain showers", 85: "Light snow showers", 86: "Heavy snow showers",
    95: "Thunderstorms", 96: "Thunderstorms with hail", 99: "Thunderstorms with heavy hail",
  }
  return descriptions[code] ?? null
}

export function forecastAtKickoff(data: HourlyForecast, start: string): Pick<GameForecast, "temperature" | "description"> | null {
  const target = Date.parse(start) / 1000
  const hourly = data.hourly
  if (!Number.isFinite(target) || !hourly?.time?.length) return null
  let index = -1
  let distance = Infinity
  hourly.time.forEach((time, i) => {
    const delta = Math.abs(time - target)
    if (delta < distance) { index = i; distance = delta }
  })
  // Hourly observations: use the nearest forecast, never a different day's fallback.
  if (distance > 1800) return null
  const temperature = hourly.temperature_2m?.[index]
  const code = hourly.weather_code?.[index]
  if (typeof temperature !== "number" || !Number.isFinite(temperature) || typeof code !== "number") return null
  const description = weatherDescription(code)
  return description ? { temperature: Math.round(temperature), description } : null
}
