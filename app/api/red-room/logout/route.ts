import { NextResponse } from "next/server"
import { clearPlayerSession } from "@/lib/red-room/auth"

export async function POST() {
  await clearPlayerSession()
  return NextResponse.json({ ok: true })
}
