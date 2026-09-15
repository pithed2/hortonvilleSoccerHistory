import type { Metadata } from "next"
import { JvSeasonDashboard } from "@/components/jv-season-dashboard"
import { getSquadDashboardStats } from "@/lib/black-gray-team"

export const metadata: Metadata = { title: "JV Black 2026" }

export default function JvBlackPage() {
  return <JvSeasonDashboard stats={getSquadDashboardStats("black")} />
}
