import Link from "next/link"
import { JV_CONFERENCE_NOTE } from "@/lib/jv-conference.mjs"
import { ArrowRight, Trophy, Users } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { getJvTeam, type JvTeamSlug } from "@/lib/jv-teams"

const teams: Array<{ name: string; description: string; status: string; href: string }> = [
  { name: "JV Red", description: "Results, schedule, full roster statistics, and individual game box scores for Coach Andy's JV Red team.", status: "Season Live", href: "/jv/red" },
  { name: "JV White", description: "Results, schedule, full roster statistics, and individual game box scores for Coach Alex's JV White team.", status: "Season Live", href: "/jv/white" },
  { name: "JV Black/Gray", description: "Results, schedule, full roster statistics, and individual game box scores for Coach Seth's JV Black & Gray teams.", status: "Season Live", href: "/jv/black-gray" },
]

function HeaderStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3"><p className="text-xs font-bold uppercase text-white/50">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>
}

function getCollectiveStats() {
  const slugs: JvTeamSlug[] = ["red", "white", "black", "gray"]
  const bundles = slugs.map((slug) => getJvTeam(slug)).filter((bundle): bundle is NonNullable<typeof bundle> => Boolean(bundle))

  let wins = 0, losses = 0, ties = 0, goalsFor = 0, goalsAgainst = 0
  let confWins = 0, confLosses = 0, confTies = 0
  for (const bundle of bundles) {
    wins += bundle.stats.record.wins
    losses += bundle.stats.record.losses
    ties += bundle.stats.record.ties
    goalsFor += bundle.stats.totals.goalsFor
    goalsAgainst += bundle.stats.totals.goalsAgainst
    const [cw, cl, ct] = bundle.stats.record.conference.split("–").map(Number)
    confWins += cw || 0
    confLosses += cl || 0
    confTies += ct || 0
  }

  const diff = goalsFor - goalsAgainst
  return {
    overall: `${wins}-${losses}-${ties}`,
    conference: `${confWins}-${confLosses}-${confTies}`,
    goalsFor: String(goalsFor),
    goalsAgainst: String(goalsAgainst),
    diff: diff >= 0 ? `+${diff}` : String(diff),
  }
}

export default function JvLandingPage() {
  const collective = getCollectiveStats()
  return <main id="main-content" className="min-h-screen bg-background">
    <Navigation />
    <header className="page-header"><div className="page-header-decoration" aria-hidden="true" /><div className="site-container relative"><p className="page-eyebrow">Hortonville Boys Soccer · 2026</p><h1 className="page-title">Junior Varsity Teams</h1><p className="page-description">Choose a team to follow its schedule, results, statistics, and season story. More team pages will come online as their information is prepared.</p><div className="page-header-meta"><span className="flex items-center gap-2"><Users className="size-4 text-primary" /> Three JV team groups</span><span className="flex items-center gap-2"><Trophy className="size-4 text-primary" /> One program</span></div>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <HeaderStat label="Overall" value={collective.overall} />
        <HeaderStat label="Conference" value={collective.conference} />
        <HeaderStat label="Goals For" value={collective.goalsFor} />
        <HeaderStat label="Goals Against" value={collective.goalsAgainst} />
        <HeaderStat label="+/-" value={collective.diff} />
      </div>
    </div></header>

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
