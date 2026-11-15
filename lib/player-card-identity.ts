import "server-only"

import fs from "node:fs"
import path from "node:path"
import { eq } from "drizzle-orm"
import { getRedRoomDb } from "@/lib/red-room/db"
import { rosterMemberships, type players } from "@/lib/red-room/schema"
import { cardPlayers } from "@/lib/player-cards"
import type { CardPlayer, CardMetric } from "@/lib/player-card-types"

type Account = typeof players.$inferSelect
type RawPlayer = { name: string; number: number | string; gp?: number; goals?: number; assists?: number; points?: number; position?: string; saves?: number | null; recordedSaves?: number | null; goalsAgainst?: number | null }
type Squad = { players: RawPlayer[]; goalkeepers?: RawPlayer[]; roster?: RawPlayer[] }
const normalized = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US")
const value = (n: number | null | undefined) => typeof n === "number" && Number.isFinite(n) ? String(n) : "—"
const metric = (label: string, season: string): CardMetric => ({ label, season, career: "—" })
function readJson(file: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "jv", file), "utf8"))
}
function squadData(squad: string): Squad | null {
  if (squad === "JV Red" || squad === "JV White") {
    const root = readJson(squad === "JV Red" ? "red.json" : "white.json") as { stats?: Squad }
    return root.stats ?? null
  }
  if (squad === "JV Black" || squad === "JV Gray") {
    const root = readJson("black-gray.json") as { squads?: { black: Squad; gray: Squad } }
    return squad === "JV Black" ? root.squads?.black ?? null : root.squads?.gray ?? null
  }
  return null
}

/** Never accept a player name, squad, jersey or stats from a browser request. */
export async function cardProfileForAccount(account: Account): Promise<CardPlayer | null> {
  if (account.isBot || !["player", "coach"].includes(account.accountType)) return null

  const memberships = await getRedRoomDb().select().from(rosterMemberships)
    .where(eq(rosterMemberships.playerId, account.id))
  const ordered = [...memberships].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
  const varsity = cardPlayers().find((entry) => !entry.example && normalized(entry.name) === normalized(account.displayName) && entry.season === 2026)
  if (varsity && ordered.some((entry) => entry.squad === "Varsity")) return { ...varsity, id: account.id }

  for (const membership of ordered) {
    const source = squadData(membership.squad)
    if (!source) continue
    const roster = source.players ?? source.roster ?? []
    const athlete = roster.find((entry) => normalized(entry.name) === normalized(account.displayName))
    if (!athlete) continue
    const keeper = (source.goalkeepers ?? []).find((entry) => normalized(entry.name) === normalized(account.displayName))
    const isKeeper = Boolean(keeper || athlete.position?.toUpperCase().includes("GK"))
    const metrics = isKeeper
      ? [metric("SAVES", value(keeper?.saves ?? keeper?.recordedSaves)), metric("GA", value(keeper?.goalsAgainst))]
      : [metric("GOALS", value(athlete.goals)), metric("ASSISTS", value(athlete.assists)), metric("POINTS", value(athlete.points))]
    return {
      id: account.id,
      name: account.displayName,
      number: membership.jersey,
      position: athlete.position || (isKeeper ? "GK" : membership.squad),
      classYear: "",
      season: 2026,
      careerSpan: "2026 " + membership.squad,
      metrics,
      incomplete: true,
      statsTitle: "2026 " + membership.squad.toUpperCase() + " / RECORDED STATS",
      studioNote: "JV stats reflect recorded 2026 results only. Career totals are not available.",
    }
  }

  if (account.accountType === "coach") {
    const example = cardPlayers().find((entry) => normalized(entry.name) === normalized(account.displayName))
    if (example) return { ...example, id: account.id }
    return {
      id: account.id, name: account.displayName, number: "", position: "Coach",
      classYear: "", season: 2026, careerSpan: "Coach edition", coach: true,
      metrics: ["GOALS", "ASSISTS", "POINTS"].map((label) => metric(label, "—")),
      incomplete: true,
    }
  }
  return null
}
