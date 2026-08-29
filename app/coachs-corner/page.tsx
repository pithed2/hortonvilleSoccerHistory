import fs from "node:fs"
import path from "node:path"
import { cookies } from "next/headers"
import { Navigation } from "@/components/navigation"
import { COACH_COOKIE, validCoachCookie } from "@/lib/coach-auth"
import { CoachDashboard } from "./dashboard"
import { CoachLogin } from "./login"

export const dynamic = "force-dynamic"

export default async function CoachCornerPage() {
  const jar = await cookies()
  const authorized = validCoachCookie(jar.get(COACH_COOKIE)?.value)
  const file = path.join(process.cwd(), "public", "data", "seeding-2026.json")
  const data = JSON.parse(fs.readFileSync(file, "utf8"))
  return <><Navigation />{authorized ? <CoachDashboard data={data} /> : <CoachLogin />}</>
}
