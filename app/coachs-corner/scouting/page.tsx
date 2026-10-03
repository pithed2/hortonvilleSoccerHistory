import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { cookies } from "next/headers"
import { Navigation } from "@/components/navigation"
import { COACH_COOKIE, validCoachCookie } from "@/lib/coach-auth"
import { scoutingReports } from "@/lib/scouting"
import { CoachLogin } from "../login"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Scouting | Coach’s Corner", robots: { index:false, follow:false, nocache:true } }
export default async function ScoutingPage() {
  if (!validCoachCookie((await cookies()).get(COACH_COOKIE)?.value)) return <><Navigation /><CoachLogin /></>
  return <><Navigation /><main className="min-h-screen bg-[#f7f7f5] pb-16"><header className="bg-neutral-950 text-white"><div className="site-container py-10"><Link href="/coachs-corner" className="text-sm text-white/75">← Coach’s Corner</Link><p className="mt-8 text-xs font-bold uppercase tracking-widest text-red-400">2026 opponent preparation</p><h1 className="mt-3 text-4xl font-black">Scouting</h1><p className="mt-4 max-w-2xl text-white/75">Four opponents, one report format. Match evidence, player identification and specific questions to answer with video.</p></div></header><div className="site-container py-8"><Link href="/coachs-corner/seeding-review" className="mb-6 inline-block font-bold text-primary underline">Open Group B Seeding Review →</Link><div className="grid gap-5 md:grid-cols-2">{scoutingReports.map(r=><Link key={r.slug} href={`/coachs-corner/scouting/${r.slug}`} className="surface-card flex gap-5 p-6 hover:border-primary"><div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-white p-2"><Image src={r.logo} alt={`${r.name} logo`} width={96} height={96} className="max-h-full object-contain" /></div><div><h2 className="text-2xl font-bold">{r.name}</h2><p className="mt-2 font-semibold">{r.record.w}–{r.record.l}–{r.record.d} · {r.record.gf}–{r.record.ga} goals</p><p className="mt-2 text-sm text-muted-foreground">Results through {r.resultsThrough}</p><p className="mt-3 text-sm text-muted-foreground">{r.assessment}</p><p className="mt-4 font-bold text-primary">Read report and video priorities →</p></div></Link>)}</div></div></main></>
}
