import fs from "node:fs"
import path from "node:path"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Navigation } from "@/components/navigation"
import { COACH_COOKIE, validCoachCookie } from "@/lib/coach-auth"
import { withMainHortonvilleSchedule } from "@/lib/coach-corner-data"
import { CoachDashboard } from "./dashboard"
import { CoachLogin } from "./login"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Coach’s Corner",
  robots: { index: false, follow: false, nocache: true },
}

export default async function CoachCornerPage() {
  const jar = await cookies()
  const authorized = validCoachCookie(jar.get(COACH_COOKIE)?.value)
  if (!authorized) return <><Navigation /><CoachLogin /></>

  const file = path.join(process.cwd(), "data", "coachs-corner", "seeding-2026.json")
  const rawData = JSON.parse(fs.readFileSync(file, "utf8"))
  const hortonvilleCsv = fs.readFileSync(path.join(process.cwd(), "public", "data", "games_2026.csv"), "utf8")
  const data = withMainHortonvilleSchedule(rawData, hortonvilleCsv)
  return <><Navigation /><CoachDashboard data={data} /></>
}
