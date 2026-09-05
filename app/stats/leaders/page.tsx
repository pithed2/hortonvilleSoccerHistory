import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { allTimePlayerLeaders } from "@/lib/player-stats"
import Link from "next/link"
import { Medal } from "lucide-react"
import { ContentContainer, PageHeader } from "@/components/archive-ui"

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
  note,
}: {
  title: string
  rows: ReturnType<typeof allTimePlayerLeaders>
  statKey: keyof ReturnType<typeof allTimePlayerLeaders>[number]
  note?: string
}) {
  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b bg-primary/5 px-6 py-5">
        <div className="flex items-center gap-3"><Medal className="h-5 w-5 text-primary" /><h2 className="text-2xl font-black">{title}</h2></div>
        {note ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
      </div>
      <div className="overflow-x-auto">
        <table className="archive-table min-w-[560px]">
          <caption className="sr-only">Top ten Hortonville players ranked by career {title.toLowerCase()}</caption>
          <thead className="bg-muted/60">
            <tr>
              <th scope="col" className="text-left px-3 py-2 border-b">Rank</th>
              <th scope="col" className="text-left px-3 py-2 border-b">Player</th>
              <th scope="col" className="text-left px-3 py-2 border-b">Years</th>
              <th scope="col" className="text-left px-3 py-2 border-b">Total</th>
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

      <PageHeader eyebrow="Player records" title="All-Time Leaders" description="Compiled from available Hortonville boys soccer player stats, 2007-present."><Link href="/stats" className="underline decoration-white/50 underline-offset-4 hover:decoration-white">Back to program statistics</Link></PageHeader>

      <ContentContainer className="grid gap-8 py-12 md:py-16 lg:grid-cols-2">
        <LeaderTable title="Goals" rows={topBy(leaders, "goals")} statKey="goals" />
        <LeaderTable title="Assists" rows={topBy(leaders, "assists")} statKey="assists" />
        <LeaderTable title="Points" rows={topBy(leaders, "points")} statKey="points" />
        <LeaderTable title="Saves" rows={topBy(leaders, "saves")} statKey="saves" />
      </ContentContainer>

      <Footer />
    </main>
  )
}

