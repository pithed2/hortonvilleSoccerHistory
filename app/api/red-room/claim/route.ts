import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { createPlayerSession, validClaimKey } from "@/lib/red-room/auth"
import { getRedRoomDb } from "@/lib/red-room/db"
import { players } from "@/lib/red-room/schema"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const tag = String(body?.tag || "").trim().toUpperCase()
  const key = String(body?.key || "").trim().toUpperCase()
  if (!tag || !key) return NextResponse.json({ error: "Enter your player tag and private key." }, { status: 400 })
  const db = getRedRoomDb()
  const player = await db.select().from(players).where(eq(players.publicTag, tag)).get()
  if (!player || !validClaimKey(key, player.claimKeySalt, player.claimKeyHash)) {
    return NextResponse.json({ error: "That tag and key do not match." }, { status: 401 })
  }
  await db.update(players).set({ claimedAt: player.claimedAt || new Date(), updatedAt: new Date() }).where(eq(players.id, player.id))
  await createPlayerSession(player.id)
  return NextResponse.json({ ok: true, requestId: randomUUID() })
}
