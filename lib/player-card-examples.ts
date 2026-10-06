import fs from "node:fs"
import path from "node:path"
import type { CardDesign, CardPlayer } from "./player-card-types"

// Temporary studio example; never added to the official roster or stat archive.
export const ogAndyPlayer: CardPlayer = {
  id: "og-andy", name: "OG Andy", number: "16", position: "", classYear: "",
  season: 2026, careerSpan: "Example edition", example: true, incomplete: true,
  metrics: ["GOALS", "ASSISTS", "POINTS"].map(label => ({ label, season: "—", career: "—" })),
}

// Coach tester only; collegiate totals never enter Hortonville's varsity archive.
export const cooperRePlayer: CardPlayer = {
  id: "cooper-re-coach", name: "Cooper Re", number: "", position: "Assistant Coach", classYear: "",
  season: 2026, statsSeason: 2025, careerSpan: "2022–2025", example: true, coach: true, incomplete: false,
  metrics: [
    { label: "GOALS", season: "16", career: "33" },
    { label: "ASSISTS", season: "5", career: "11" },
    { label: "POINTS", season: "37", career: "77" },
  ],
}

export const cooperReOverview = "A two-time FVA Player of the Year at Kimberly, Cooper Re brings an accomplished playing background to Hortonville’s coaching staff. At UW–Whitewater, he totaled 33 goals, 11 assists and 77 points in 81 matches. His 16-goal senior season earned him 2025 WIAC Offensive Player of the Year and United Soccer Coaches Third Team All-American honors in NCAA Division III. A three-time first-team all-conference selection, he finished with the third-most career goals in Warhawk history."

export function exampleCardDesign(id: string): CardDesign | undefined {
  if (id === cooperRePlayer.id) {
    const photo = (file: string, x = 50, y = 50) => ({
      src: `data:image/jpeg;base64,${fs.readFileSync(path.join(process.cwd(), "data", "player-card-examples", "cooper-re", file)).toString("base64")}`,
      x, y, zoom: 1,
    })
    return {
      portrait: photo("portrait.jpg", 50, 0), action: photo("action.jpg", 50, 30),
      highlight: { ...photo("back.jpg"), fit: "contain" },
      overview: cooperReOverview, theme: "ice", rightsConfirmed: false,
    }
  }
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
