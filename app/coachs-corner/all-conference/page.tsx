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
      <p className="mt-4 text-sm text-white/75">Stats checked {snapshot.checkedAt} · Hortonville box scores through {snapshot.resultsThrough} · Working nominations</p>
    </div></header>
    <AllConferenceBoard data={snapshot} standings={standings} />
    <section className="site-container" aria-labelledby="poy-review-title"><div className="surface-card space-y-4 p-6">
      <h2 id="poy-review-title" className="text-2xl font-bold">Player of the Year: challenge the Baetke case</h2>
      <p className="text-sm text-muted-foreground">Private selection preparation · October 7, 2026. {snapshot.freshnessNote}</p>
      <p>Ian Baetke leads the reporting teams with 11 conference goals, 4 assists and 26 points. Fenton Hirschi has 9 goals, 7 assists and 25 points. Overall: Baetke 13/6/32; Hirschi 9/12/30. The scoring lead belongs to Baetke in this snapshot.</p>
      <p><strong>The strongest countercase:</strong> Hirschi is one conference point behind while providing three more assists for the unbeaten conference champion. Hortonville finished 8–0–1; Neenah is 5–2–1 with Appleton West still to play. If coaches value playmaking and sustained impact on the title winner, Hirschi has a credible case beyond the goals column. Team finish supports that argument; it does not automatically determine an individual award.</p>
      <p><strong>Neenah’s strongest reply:</strong> Baetke scored 11 of Neenah’s 22 conference goals, and he has the higher point total with one fewer team game played. He scored twice against Hortonville and once in each loss to Appleton North and Oshkosh West. Those results do not support an argument that he disappeared against strong opposition.</p>
      <p><strong>Evidence still needed:</strong> compare each candidate’s pressing, defensive work, chance creation and impact in close games using film and coach evaluations. Five schools lack individual rows. Missing stats exclude neither their players nor defenders and goalkeepers from consideration. Do not infer poor defensive work, easy-opponent scoring or penalty dependence from the available totals.</p>
      <p className="text-sm">Sources: <a className="text-primary underline" href="https://www.gobound.com/wi/wiaa/bsc/2026-27/neenah/v/stats?competitor=athlete&amp;range=conference&amp;block=total">Neenah conference stats</a> · <a className="text-primary underline" href="https://www.gobound.com/wi/wiaa/bsc/2026-27/neenah/v/schedule">Neenah schedule and game stats</a> · <Link className="text-primary underline" href="/seasons/2026">Hortonville archive</Link></p>
    </div></section>
  </main></>
}
