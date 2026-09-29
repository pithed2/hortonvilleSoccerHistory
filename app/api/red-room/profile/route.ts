import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { authenticatedPlayer } from "@/lib/red-room/auth"
import { getRedRoomDb } from "@/lib/red-room/db"
import { RED_ROOM_TAUNTS, RED_ROOM_VICTORY_CELEBRATIONS, RED_ROOM_VICTORY_YELLS } from "@/lib/red-room/persona"
import { players } from "@/lib/red-room/schema"

const allowed = {
  tauntId: new Set<string>(RED_ROOM_TAUNTS.map((taunt) => taunt.id)),
  victoryId: new Set<string>(RED_ROOM_VICTORY_YELLS.map((victory) => victory.id)),
  celebrationId: new Set<string>(RED_ROOM_VICTORY_CELEBRATIONS.map((celebration) => celebration.id)),
}

export async function POST(request: Request) {
  const me = await authenticatedPlayer()
  if (!me) return NextResponse.json({ error: "Claim your player identity first." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const tauntId = String(body?.tauntId || "")
  const victoryId = String(body?.victoryId || "")
  const celebrationId = String(body?.celebrationId || "")
  if (!allowed.tauntId.has(tauntId) || !allowed.victoryId.has(victoryId) || !allowed.celebrationId.has(celebrationId)) return NextResponse.json({ error: "Choose from the available options." }, { status: 400 })
  const taunt = RED_ROOM_TAUNTS.find((option) => option.id === tauntId)
  if (taunt?.ownerTag && taunt.ownerTag !== me.publicTag) return NextResponse.json({ error: "That taunt belongs to another player." }, { status: 403 })
  await getRedRoomDb().update(players).set({ tauntId, victoryId, celebrationId, updatedAt: new Date() }).where(eq(players.id, me.id))
  return NextResponse.json({ ok: true })
}
