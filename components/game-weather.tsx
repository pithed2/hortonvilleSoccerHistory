"use client"

import { useEffect, useState } from "react"
import { CloudSun } from "lucide-react"
import { forecastEligible, type GameForecast, type WeatherEvent } from "@/lib/game-weather"

let cached: { expires: number; request: Promise<Record<string, GameForecast>> } | undefined
function forecasts() {
  if (!cached || cached.expires <= Date.now()) {
    cached = { expires: Date.now() + 1800000, request: fetch("/api/game-weather", { cache: "no-store", signal: AbortSignal.timeout(20000) })
      .then(async response => response.ok ? (await response.json()).forecasts ?? {} : {})
      .catch(() => ({})) }
  }
  return cached.request
}

export function GameWeather({ event }: { event: WeatherEvent }) {
  const { id, date, start, time } = event
  const [forecast, setForecast] = useState<GameForecast | null>(null)
  useEffect(() => {
    let active = true
    async function update() {
      const result = forecastEligible({ date, start, time }) ? (await forecasts())[id] ?? null : null
      if (active) setForecast(result)
    }
    void update()
    const timer = setInterval(() => { void update() }, 60000)
    return () => { active = false; clearInterval(timer) }
  }, [id, date, start, time])
  if (!forecast) return null
  return <p className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-relaxed text-muted-foreground">
    <CloudSun aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
    <span>Expected game-time temperature ~{forecast.temperature}°F · {forecast.description}<span className="block text-[11px] font-normal">{forecast.city} {forecast.zip} · <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2">Open-Meteo</a></span></span>
  </p>
}
