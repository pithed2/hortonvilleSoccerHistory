import type { Metadata } from "next"
import { JvSeasonDashboard } from "@/components/jv-season-dashboard"
import { getSquadDashboardStats } from "@/lib/black-gray-team"

export const metadata: Metadata = { title: "JV Gray 2026" }

export default function JvGrayPage() {
  return <JvSeasonDashboard stats={getSquadDashboardStats("gray")} />
}
