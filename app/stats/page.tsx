import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SeasonStatsTable } from "@/components/season-stats-table"
import { programOverview, seasonRows } from "@/lib/games"
import { ArrowRight, BarChart3, Goal, Percent, Trophy } from "lucide-react"
import Link from "next/link"
import { ContentContainer, PageHeader, SectionHeading } from "@/components/archive-ui"

export const runtime = "nodejs"
export const revalidate = 60

export default async function StatsPage() {
  const [overview, rows] = await Promise.all([programOverview(), seasonRows()])

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <PageHeader eyebrow="Program records" title="Season Statistics" description="The complete documented record of Hortonville boys varsity soccer." />

      <ContentContainer className="py-12 md:py-16">
        {/* Program Overview */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-14">
          <div className="surface-card p-6"><Trophy className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground mb-2">Total Seasons</p>
            <p className="text-3xl font-black text-primary">{overview.seasons}</p>
          </div>
          <div className="surface-card p-6"><BarChart3 className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground mb-2">Program Record</p>
            <p className="text-3xl font-black text-primary">
              {overview.wins}-{overview.losses}-{overview.ties}
            </p>
          </div>
          <div className="surface-card p-6"><Percent className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground mb-2">Win Percentage</p>
            <p className="text-3xl font-black text-primary">{overview.winPct.toFixed(1)}%</p>
          </div>
          <div className="surface-card p-6"><Goal className="mb-4 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground mb-2">Goals For / Against</p>
            <p className="text-3xl font-black text-primary">
              {overview.gf} / {overview.ga}
            </p>
          </div>
        </div>

        <div className="mb-14"><SectionHeading eyebrow="Year by year" title="Season Records" /><SeasonStatsTable rows={rows} /></div>
        <div className="mb-12 flex flex-col gap-5 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-black mb-2">All-Time Player Leaders</h2>
            <p className="text-muted-foreground">
              View leaders for goals, assists, points, shots, and saves from available player stats.
            </p>
          </div>
          <Link
            href="/stats/leaders"
            className="action-primary"
          >
            View Leaders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ContentContainer>

      <Footer />
    </main>
  )
}
