import "server-only"

import fs from "node:fs"
import path from "node:path"
import { eq } from "drizzle-orm"
import { getRedRoomDb } from "@/lib/red-room/db"
import { rosterMemberships, players } from "@/lib/red-room/schema"
import { cardPlayerId, cardPlayers } from "@/lib/player-cards"
import { varsityHistoryByPlayer } from "@/lib/player-stats"
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

/**
 * The 2024/2025 goalkeeper archive, not browser input, defines Grant's card.
 * Skip the inconsistent archived 2025 save-percentage and GAA calculations.
 */
function grantDeckerCardProfile(): CardPlayer | null {
  const history = varsityHistoryByPlayer().get("Grant Decker") ?? []
  const source = [2024, 2025].map((year) => history.find((row) => row.season === year)?.goalkeeper)
  if (source.some((row) => !row)) return null
  const fields = [["GAMES", "gp"], ["MIN", "minutes"], ["SAVES", "saves"], ["GA", "ga"]] as const
  const numbers = source.map((row) => fields.map(([, key]) => {
    const raw = row?.[key]
    return !raw || !Number.isFinite(Number(raw)) || Number(raw) < 0 ? null : Number(raw)
  }))
  if (numbers.some((row) => row.some((value) => value === null))) return null
  const totals = fields.map((_, i) => numbers.reduce((total, row) => total + (row[i] ?? 0), 0))
  return {
    id: "alumni-grant-decker", name: "Grant Decker", number: "40", position: "GK",
    classYear: "2025", season: 2025, careerSpan: "2024–2025",
    metrics: fields.map(([label], i) => ({ label, season: String(numbers[1][i]), career: String(totals[i]) })),
    statsTitle: "VARSITY GOALKEEPER / 2024–2025",
    statsRows: [
      { label: "2024 JR", values: numbers[0].map(String) },
      { label: "2025 SR", values: numbers[1].map(String) },
      { label: "TOTAL", values: totals.map(String) },
    ],
    incomplete: false,
    studioNote: "Recorded goalkeeper counts. Save percentages omitted because the 2025 archive is inconsistent.",
  }
}

/** One named, roster-verified delegation. Does not grant other Red Room permissions. */
export async function cardSubjectsForAccount(account: Account, primary: CardPlayer): Promise<CardPlayer[]> {
  if (account.accountType !== "player" || account.isBot || normalized(account.displayName) !== "ben decker") return [primary]
  const memberships = await getRedRoomDb().select().from(rosterMemberships)
    .where(eq(rosterMemberships.playerId, account.id))
  if (!memberships.some((membership) => membership.squad === "JV White")) return [primary]
  const grant = grantDeckerCardProfile()
  return grant ? [primary, grant] : [primary]
}

/**
 * Coach-only preview roster. Use public, verified season data. No player keys,
 * credentials, sessions, or database writes are involved.
 */
export function coachCardPreviewRoster(): CardPlayer[] {
  const roster = new Map<string, CardPlayer>()
  const add = (player: CardPlayer) => {
    const key = normalized(player.name)
    if (!roster.has(key)) roster.set(key, player)
  }
  for (const player of cardPlayers()) {
    if (player.season === 2026 && !player.example && !player.coach) add(player)
  }
  for (const squad of ["JV Red", "JV White", "JV Black", "JV Gray"]) {
    const data = squadData(squad)
    if (!data) continue
    const athletes = data.players ?? data.roster ?? []
    for (const athlete of athletes) {
      const keeper = (data.goalkeepers ?? []).find(entry => normalized(entry.name) === normalized(athlete.name))
      const isKeeper = Boolean(keeper || athlete.position?.toUpperCase().includes("GK"))
      const metrics = isKeeper
        ? [metric("SAVES", value(keeper?.saves ?? keeper?.recordedSaves)), metric("GA", value(keeper?.goalsAgainst))]
        : [metric("GOALS", value(athlete.goals)), metric("ASSISTS", value(athlete.assists)), metric("POINTS", value(athlete.points))]
      add({
        id: "preview-" + cardPlayerId(athlete.name),
        name: athlete.name,
        number: String(athlete.number),
        position: athlete.position || (isKeeper ? "GK" : ""),
        classYear: "",
        season: 2026,
        careerSpan: "2026 " + squad,
        metrics,
        incomplete: true,
        statsTitle: "2026 " + squad.toUpperCase() + " / RECORDED STATS",
        studioNote: "Available JV statistics only. Undocumented numbers remain unknown.",
      })
    }
  }
  return [...roster.values()].sort((a, b) => a.name.localeCompare(b.name))
}
