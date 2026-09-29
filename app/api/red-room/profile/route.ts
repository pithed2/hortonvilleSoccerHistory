import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { authenticatedPlayer } from "@/lib/red-room/auth"
import { getRedRoomDb } from "@/lib/red-room/db"
import { players } from "@/lib/red-room/schema"

const allowed = {
  tauntId: new Set(["pressure", "guess", "ice"]),
  victoryId: new Set(["cold", "wall", "net"]),
  celebrationId: new Set(["ice", "fist", "slide"]),
}

export async function POST(request: Request) {
  const me = await authenticatedPlayer()
  if (!me) return NextResponse.json({ error: "Claim your player identity first." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const tauntId = String(body?.tauntId || "")
  const victoryId = String(body?.victoryId || "")
  const celebrationId = String(body?.celebrationId || "")
  if (!allowed.tauntId.has(tauntId) || !allowed.victoryId.has(victoryId) || !allowed.celebrationId.has(celebrationId)) return NextResponse.json({ error: "Choose from the available options." }, { status: 400 })
  await getRedRoomDb().update(players).set({ tauntId, victoryId, celebrationId, updatedAt: new Date() }).where(eq(players.id, me.id))
  return NextResponse.json({ ok: true })
}
