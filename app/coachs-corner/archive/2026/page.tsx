import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { Navigation } from "@/components/navigation"
import { COACH_COOKIE, validCoachCookie } from "@/lib/coach-auth"
import snapshot from "@/data/coachs-corner/archive/seeding-2026.json"
import { CoachLogin } from "../../login"
import { SeedingTable } from "../../dashboard"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "2026 Seeding Archive | Coach’s Corner",
  robots: { index: false, follow: false, nocache: true },
}

export default async function SeedingArchivePage() {
  if (!validCoachCookie((await cookies()).get(COACH_COOKIE)?.value)) return <><Navigation /><CoachLogin /></>
  return <><Navigation /><main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f7f7f5] pb-16">
    <header className="bg-neutral-950 text-white"><div className="site-container py-10">
      <Link href="/coachs-corner" className="text-sm text-white/75">← Coach’s Corner</Link>
      <h1 className="mt-8 text-4xl font-black">2026 Seeding Archive</h1>
      <p className="mt-4 max-w-3xl text-white/75">Unofficial comparisons preserved on October 9, 2026. These tables are a historical snapshot; the WIAA bracket provides official seeds and matchups.</p>
    </div></header>
    <div className="site-container space-y-8 py-8">
      <Link href="/coachs-corner/seeding-review" className="inline-block font-bold text-primary underline">Archived Group B evidence and coach review →</Link>
      {Object.entries(snapshot.seedings).map(([group, rows]) => <section key={group}><h2 className="mb-4 text-2xl font-bold">{group} · Archived points comparison</h2><SeedingTable rows={rows} team="Hortonville" /></section>)}
    </div>
  </main></>
}
