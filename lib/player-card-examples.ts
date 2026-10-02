import fs from "node:fs"
import path from "node:path"
import type { CardDesign, CardPlayer } from "./player-card-types"

// Temporary studio example; never added to the official roster or stat archive.
export const ogAndyPlayer: CardPlayer = {
  id: "og-andy", name: "OG Andy", number: "16", position: "", classYear: "",
  season: 2026, careerSpan: "Example edition", example: true, incomplete: true,
  metrics: ["GOALS", "ASSISTS", "POINTS"].map(label => ({ label, season: "—", career: "—" })),
}

export function exampleCardDesign(id: string): CardDesign | undefined {
  if (id !== ogAndyPlayer.id) return undefined
  const photo = (file: string, x: number, y: number) => ({
    src: `data:image/jpeg;base64,${fs.readFileSync(path.join(process.cwd(), "data", "player-card-examples", "og-andy", file)).toString("base64")}`,
    x, y, zoom: 1,
  })
  return {
    portrait: photo("portrait.jpg", 50, 0), action: photo("action.jpg", 72, 50),
    overview: "OG Andy. Number 16. A throwback portrait and a sliding challenge, brought together in a Cracked Ice example card.",
    theme: "ice", rightsConfirmed: false,
  }
}
