import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { allTimePlayerLeaders } from "@/lib/player-stats"

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
    <section className="rounded-xl border p-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left px-3 py-2 border-b">Rank</th>
              <th className="text-left px-3 py-2 border-b">Player</th>
              <th className="text-left px-3 py-2 border-b">Years</th>
              <th className="text-left px-3 py-2 border-b">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((player, index) => (
              <tr key={`${title}-${player.player_name}`} className="odd:bg-white even:bg-neutral-50">
                <td className="px-3 py-2 border-b">{index + 1}</td>
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

      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4">All-Time Leaders</h1>
          <p className="text-lg opacity-90">
            Compiled from available Hortonville boys soccer player stats, 2007-present.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
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

