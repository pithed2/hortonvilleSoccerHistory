import { readFile } from "node:fs/promises"
import path from "node:path"
import { cookies } from "next/headers"
import { COACH_COOKIE, validCoachCookie } from "@/lib/coach-auth"
import { getWeeklyReview } from "@/lib/weekly-reviews"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(_request: Request, { params }: { params: Promise<{ version: string }> }) {
  const jar = await cookies()
  const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" }
  if (!validCoachCookie(jar.get(COACH_COOKIE)?.value)) return new Response("Sign in to Coach’s Corner to download this review.", { status: 401, headers })
  const review = getWeeklyReview((await params).version)
  if (!review) return new Response("Review not found.", { status: 404, headers })
  const file = await readFile(path.join(process.cwd(), "data", "coachs-corner", "weekly-reviews", review.filename))
  return new Response(new Uint8Array(file), { headers: {
    ...headers,
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename="polar_bears_weekly_review_${review.id}.docx"`,
    "Content-Length": String(file.length),
  } })
}
