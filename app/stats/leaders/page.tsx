import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { allTimePlayerLeaders } from "@/lib/player-stats"
import Link from "next/link"
import { Medal } from "lucide-react"

function topBy<T extends keyof ReturnType<typeof allTimePlayerLeaders>[number]>(
  leaders: ReturnType<typeof allTimePlayerLeaders>,
  key: T,
  limit = 10,
) {
  return [...leaders]
    .sort((a, b) => Number(b[key]) - Number(a[key]) || a.player_name.localeCompare(b.player_name))
    .slice(0, limit)
}

function LeaderTable({
  title,
  rows,
  statKey,
}: {
  title: string
  rows: ReturnType<typeof allTimePlayerLeaders>
  statKey: keyof ReturnType<typeof allTimePlayerLeaders>[number]
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b bg-primary/5 px-6 py-5"><Medal className="h-5 w-5 text-primary" /><h2 className="text-2xl font-black">{title}</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="text-left px-3 py-2 border-b">Rank</th>
              <th className="text-left px-3 py-2 border-b">Player</th>
              <th className="text-left px-3 py-2 border-b">Years</th>
              <th className="text-left px-3 py-2 border-b">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((player, index) => (
              <tr key={`${title}-${player.player_name}`} className="even:bg-muted/20">
                <td className="px-3 py-3 border-b font-black text-primary">{index + 1}</td>
                <td className="px-3 py-2 border-b font-semibold">{player.player_name}</td>
                <td className="px-3 py-2 border-b">{player.seasons.join(", ")}</td>
                <td className="px-3 py-2 border-b font-bold">{String(player[statKey])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function LeadersPage() {
  const leaders = allTimePlayerLeaders()

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-20">
        <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[48px] border-white/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/stats" className="text-sm font-semibold text-white/80 hover:text-white">Back to program statistics</Link>
          <p className="mb-3 mt-5 text-sm font-bold uppercase tracking-[0.22em] text-white/70">Player records</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4">All-Time Leaders</h1>
          <p className="text-lg opacity-90">
            Compiled from available Hortonville boys soccer player stats, 2007-present.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <LeaderTable title="Goals" rows={topBy(leaders, "goals")} statKey="goals" />
        <LeaderTable title="Assists" rows={topBy(leaders, "assists")} statKey="assists" />
        <LeaderTable title="Points" rows={topBy(leaders, "points")} statKey="points" />
        <LeaderTable title="Shots" rows={topBy(leaders, "shots")} statKey="shots" />
        <LeaderTable title="Saves" rows={topBy(leaders, "saves")} statKey="saves" />
      </div>

      <Footer />
    </main>
  )
}

