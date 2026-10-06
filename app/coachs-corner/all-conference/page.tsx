import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { Navigation } from "@/components/navigation"
import { COACH_COOKIE, validCoachCookie } from "@/lib/coach-auth"
import snapshot from "@/data/coachs-corner/all-conference-2026.json"
import standings from "@/data/coachs-corner/fva-conference-2026.json"
import { CoachLogin } from "../login"
import { AllConferenceBoard } from "./board"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "FVA All-Conference | Coach’s Corner",
  robots: { index: false, follow: false, nocache: true },
}

export default async function AllConferencePage() {
  if (!validCoachCookie((await cookies()).get(COACH_COOKIE)?.value)) {
    return <><Navigation /><CoachLogin /></>
  }
  return <><Navigation /><main className="min-h-screen bg-[#f7f7f5] pb-16">
    <header className="bg-neutral-950 text-white"><div className="site-container py-10">
      <Link href="/coachs-corner" className="text-sm text-white/75">← Coach’s Corner</Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-widest text-red-400">2026 · Selection preparation</p>
      <h1 className="mt-2 text-4xl font-black">FVA All-Conference</h1>
      <p className="mt-4 max-w-3xl text-white/75">Build the case for conference recognition: production, team success, and the roles that the scoring sheet misses.</p>
      <p className="mt-4 text-sm text-white/75">Stats checked October 6 · Available results through October 1 · Working nominations</p>
    </div></header>
    <AllConferenceBoard data={snapshot} standings={standings} />
  </main></>
}
