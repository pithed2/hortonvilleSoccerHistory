import type { Metadata } from "next"
import { RedRoomApp } from "@/components/red-room/red-room-app"

export const metadata: Metadata = { title: "The Red Room", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default function RedRoomPage() {
  return <RedRoomApp />
}
