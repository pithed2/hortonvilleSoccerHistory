import calendar from "@/data/jv/calendar.json"
import { GameWeather } from "@/components/game-weather"
import type { Game } from "@/lib/types"

const normalize = (name: string) => name.toLowerCase().replace(/high school|de la baie academy|[^a-z0-9]/g, "")

export function VarsityGameWeather({ game }: { game: Game }) {
  if (game.result || game.score) return null
  const event = calendar.events.find(event => event.team === "Varsity" && event.date === game.date && normalize(event.opponent) === normalize(game.opponent))
  return event ? <GameWeather event={event} /> : null
}
