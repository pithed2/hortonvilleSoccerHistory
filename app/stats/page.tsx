import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SeasonStatsTable } from "@/components/season-stats-table"
import { programOverview, seasonRows } from "@/lib/games"

export const runtime = "nodejs"
export const revalidate = 60

export default async function StatsPage() {
  const [overview, rows] = await Promise.all([programOverview(), seasonRows()])

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Season Statistics</h1>
          <p className="text-lg opacity-90">Complete record of all boys varsity seasons</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Program Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Total Seasons</p>
            <p className="text-3xl font-black text-primary">{overview.seasons}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Program Record</p>
            <p className="text-3xl font-black text-primary">
              {overview.wins}-{overview.losses}-{overview.ties}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Win Percentage</p>
            <p className="text-3xl font-black text-primary">{overview.winPct.toFixed(1)}%</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Goals For / Against</p>
            <p className="text-3xl font-black text-primary">
              {overview.gf} / {overview.ga}
            </p>
          </div>
        </div>

        <SeasonStatsTable rows={rows} />
        <div className="mb-12 rounded-lg border border-border bg-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black mb-2">All-Time Player Leaders</h2>
            <p className="text-muted-foreground">
              View leaders for goals, assists, points, shots, and saves from available player stats.
            </p>
          </div>
          <a
            href="/stats/leaders"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            View Leaders
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}
