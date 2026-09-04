import Link from "next/link"
import { ArrowRight, Clock3, Trophy, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"

const teams = [
  {
    name: "JV Red",
    description: "Follow the 2026 season with results, schedule, full roster statistics, and individual game box scores.",
    status: "Season live",
    href: "/jv/red",
    tone: "red",
  },
  {
    name: "JV White",
    description: "A dedicated season page for JV White schedules, results, player statistics, and team progress.",
    status: "In Progress",
    href: null,
    tone: "white",
  },
  {
    name: "JV Black/Gray",
    description: "A dedicated home for the developing JV Black/Gray team and its season information.",
    status: "In Progress",
    href: null,
    tone: "gray",
  },
] as const

export default function JvLandingPage() {
  return <><Navigation /><main id="main-content" className="min-h-screen bg-[#080c13] text-slate-100">
    <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,.18),transparent_42%)]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
        <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-red-400">Hortonville Boys Soccer · 2026</p><h1 className="mt-4 text-5xl font-black tracking-[-.05em] text-white sm:text-7xl">One program.<br /><span className="text-red-500">Every JV team.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">Choose a team to follow its schedule, results, statistics, and season story. More JV team pages will come online as their information is prepared.</p></div>
        <div className="mt-10 flex flex-wrap gap-3 text-sm text-slate-400"><span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-4 py-2"><Users className="size-4 text-red-400" /> Three JV team groups</span><span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-4 py-2"><Trophy className="size-4 text-red-400" /> Built around each season</span></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8">
      <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Team center</p><h2 className="mt-2 text-3xl font-black text-white">Select a JV team</h2></div>
      <div className="grid gap-5 lg:grid-cols-3">{teams.map((team) => {
        const card = <article className={`group relative min-h-72 overflow-hidden rounded-[30px] border p-7 transition ${team.href ? "border-red-500/30 bg-gradient-to-br from-red-700/35 via-[#101722] to-[#0d131e] hover:-translate-y-1 hover:border-red-400/60 hover:shadow-2xl hover:shadow-red-950/30" : "border-white/8 bg-[#0d131e]"}`}>
          <div className={`absolute right-0 top-0 size-40 translate-x-14 -translate-y-14 rounded-full blur-3xl ${team.tone === "red" ? "bg-red-600/25" : team.tone === "white" ? "bg-white/10" : "bg-slate-500/10"}`} />
          <div className="relative flex h-full flex-col"><div className="flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[.12em] ${team.href ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-slate-500"}`}>{team.status}</span>{team.href ? <ArrowRight className="size-5 text-red-400 transition group-hover:translate-x-1" /> : <Clock3 className="size-5 text-slate-600" />}</div><h3 className="mt-12 text-4xl font-black tracking-[-.04em] text-white">{team.name}</h3><p className="mt-4 leading-7 text-slate-400">{team.description}</p><p className={`mt-auto pt-7 text-sm font-bold ${team.href ? "text-red-400" : "text-slate-600"}`}>{team.href ? "Open season dashboard" : "Team page coming soon"}</p></div>
        </article>
        return team.href ? <Link key={team.name} href={team.href} className="block rounded-[30px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080c13]">{card}</Link> : <div key={team.name}>{card}</div>
      })}</div>
    </section>
  </main></>
}
