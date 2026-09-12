import Link from "next/link"
import { JV_CONFERENCE_NOTE } from "@/lib/jv-conference.mjs"
import { ArrowRight, Trophy, Users } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"

const teams = [
  { name: "JV Red", description: "Results, schedule, full roster statistics, and individual game box scores for Coach Andy's JV Red team.", status: "Season Live", href: "/jv/red" },
  { name: "JV White", description: "Results, schedule, full roster statistics, and individual game box scores for Coach Alex's JV White team.", status: "Season Live", href: "/jv/white" },
  { name: "JV Black/Gray", description: "Results, schedule, full roster statistics, and individual game box scores for Coach Seth's JV Black & Gray teams.", status: "Season Live", href: "/jv/black-gray" },
] as const

export default function JvLandingPage() {
  return <main id="main-content" className="min-h-screen bg-background">
    <Navigation />
    <header className="page-header"><div className="page-header-decoration" aria-hidden="true" /><div className="site-container relative"><p className="page-eyebrow">Hortonville Boys Soccer · 2026</p><h1 className="page-title">Junior Varsity Teams</h1><p className="page-description">Choose a team to follow its schedule, results, statistics, and season story. More team pages will come online as their information is prepared.</p><div className="page-header-meta"><span className="flex items-center gap-2"><Users className="size-4 text-primary" /> Three JV team groups</span><span className="flex items-center gap-2"><Trophy className="size-4 text-primary" /> One program</span></div></div></header>

    <section className="site-container py-12 sm:py-16" aria-labelledby="jv-team-title">
      <div className="mb-7"><p className="section-eyebrow">Team center</p><h2 id="jv-team-title" className="text-3xl font-black">Select a JV team</h2></div>
      <p className="mb-6 text-sm leading-6 text-muted-foreground">{JV_CONFERENCE_NOTE}</p>
      <div className="grid gap-5 lg:grid-cols-3">{teams.map((team) => (
        <Link key={team.name} href={team.href} className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
          <article className="group flex min-h-64 flex-col rounded-3xl border bg-card p-7 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
            <div className="flex items-center justify-between"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[.12em] text-primary">{team.status}</span><ArrowRight className="size-5 text-primary transition group-hover:translate-x-1" /></div>
            <h3 className="mt-10 text-3xl font-black tracking-tight">{team.name}</h3>
            <p className="mt-3 leading-7 text-muted-foreground">{team.description}</p>
            <p className="mt-auto pt-7 text-sm font-bold text-primary">Open season dashboard</p>
          </article>
        </Link>
      ))}</div>
    </section>
    <Footer />
  </main>
}
