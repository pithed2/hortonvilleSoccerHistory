import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SeasonStatsTable } from "@/components/season-stats-table"
import { programOverview, seasonRows } from "@/lib/games"
import { ArrowRight, BarChart3, Goal, Percent, Trophy } from "lucide-react"
import Link from "next/link"

export const runtime = "nodejs"
export const revalidate = 60

export default async function StatsPage() {
  const [overview, rows] = await Promise.all([programOverview(), seasonRows()])

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-20">
        <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[48px] border-white/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-white/70">Program records</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Season Statistics</h1>
          <p className="max-w-2xl text-lg text-white/85">The complete documented record of Hortonville boys varsity soccer.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Program Overview */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-14">
          <div className="rounded-2xl border bg-card p-6 shadow-sm"><Trophy className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground mb-2">Total Seasons</p>
            <p className="text-3xl font-black text-primary">{overview.seasons}</p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm"><BarChart3 className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground mb-2">Program Record</p>
            <p className="text-3xl font-black text-primary">
              {overview.wins}-{overview.losses}-{overview.ties}
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm"><Percent className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground mb-2">Win Percentage</p>
            <p className="text-3xl font-black text-primary">{overview.winPct.toFixed(1)}%</p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm"><Goal className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground mb-2">Goals For / Against</p>
            <p className="text-3xl font-black text-primary">
              {overview.gf} / {overview.ga}
            </p>
          </div>
        </div>

        <div className="mb-14"><div className="mb-6"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Year by year</p><h2 className="mt-1 text-3xl font-black">Season Records</h2></div><SeasonStatsTable rows={rows} /></div>
        <div className="mb-12 flex flex-col gap-5 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-black mb-2">All-Time Player Leaders</h2>
            <p className="text-muted-foreground">
              View leaders for goals, assists, points, shots, and saves from available player stats.
            </p>
          </div>
          <Link
            href="/stats/leaders"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
          >
            View Leaders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
