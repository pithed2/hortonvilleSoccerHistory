import Link from "next/link"
import { ArrowRight, Clock3, Trophy, Users } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"

const teams = [
  { name: "JV Red", description: "Results, schedule, full roster statistics, and individual game box scores.", status: "Season live", href: "/jv/red" },
  { name: "JV White", description: "A dedicated season page for schedules, results, player statistics, and team progress.", status: "In Progress", href: null },
  { name: "JV Black/Gray", description: "A dedicated home for the team and its season information.", status: "In Progress", href: null },
] as const

export default function JvLandingPage() {
  return <main id="main-content" className="min-h-screen bg-background">
    <Navigation />
    <header className="page-header"><div className="page-header-decoration" aria-hidden="true" /><div className="site-container relative"><p className="page-eyebrow">Hortonville Boys Soccer · 2026</p><h1 className="page-title">Junior Varsity Teams</h1><p className="page-description">Choose a team to follow its schedule, results, statistics, and season story. More team pages will come online as their information is prepared.</p><div className="page-header-meta"><span className="flex items-center gap-2"><Users className="size-4 text-primary" /> Three JV team groups</span><span className="flex items-center gap-2"><Trophy className="size-4 text-primary" /> One program</span></div></div></header>

    <section className="site-container py-12 sm:py-16" aria-labelledby="jv-team-title">
      <div className="mb-7"><p className="section-eyebrow">Team center</p><h2 id="jv-team-title" className="text-3xl font-black">Select a JV team</h2></div>
      <div className="grid gap-5 lg:grid-cols-3">{teams.map((team) => {
        const card = <article className={`group flex min-h-64 flex-col rounded-3xl border p-7 transition ${team.href ? "bg-card shadow-sm hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl" : "border-dashed bg-muted/30"}`}><div className="flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[.12em] ${team.href ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{team.status}</span>{team.href ? <ArrowRight className="size-5 text-primary transition group-hover:translate-x-1" /> : <Clock3 className="size-5 text-muted-foreground/60" />}</div><h3 className="mt-10 text-3xl font-black tracking-tight">{team.name}</h3><p className="mt-3 leading-7 text-muted-foreground">{team.description}</p><p className={`mt-auto pt-7 text-sm font-bold ${team.href ? "text-primary" : "text-muted-foreground"}`}>{team.href ? "Open season dashboard" : "Team page coming soon"}</p></article>
        return team.href ? <Link key={team.name} href={team.href} className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">{card}</Link> : <div key={team.name}>{card}</div>
      })}</div>
    </section>
    <Footer />
  </main>
}
