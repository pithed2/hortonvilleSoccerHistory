import Link from "next/link"
import { ArrowRight, BarChart3, ListOrdered, Swords } from "lucide-react"
import { programOverview } from "@/lib/games"

const destinations = [
  { title: "Season Statistics", detail: "Year-by-year records and team performance", href: "/stats", icon: BarChart3 },
  { title: "All-Time Leaders", detail: "Goals, assists, points, shots, and saves", href: "/stats/leaders", icon: ListOrdered },
  { title: "Head to Head", detail: "Hortonville’s record against every opponent", href: "/head-to-head", icon: Swords },
] as const

export async function StatsSection() {
  const overview = await programOverview()
  const stats = [
    { label: "Documented seasons", value: String(overview.seasons) },
    { label: "Program record", value: `${overview.wins}-${overview.losses}-${overview.ties}` },
    { label: "Win percentage", value: `${overview.winPct.toFixed(1)}%` },
    { label: "Goals scored", value: overview.gf.toLocaleString() },
  ]

  return (
    <section id="stats" className="bg-muted/25 py-10 sm:py-12" aria-labelledby="program-numbers-title">
      <div className="site-container">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="section-eyebrow">Program records</p>
            <h2 id="program-numbers-title" className="text-3xl font-black tracking-tight sm:text-4xl">Program by the Numbers</h2>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">A living record of Hortonville boys soccer, compiled from the seasons and statistics currently documented in the archive.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => <article key={stat.label} className="surface-card border-t-4 border-t-primary p-4"><p className="text-2xl font-black tracking-tight sm:text-3xl">{stat.value}</p><h3 className="mt-2 text-xs font-bold uppercase leading-5 tracking-[0.08em] text-muted-foreground">{stat.label}</h3></article>)}
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {destinations.map((destination) => {
            const Icon = destination.icon
            return <Link key={destination.href} href={destination.href} className="group flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block font-black">{destination.title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{destination.detail}</span></span><ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" /></Link>
          })}
        </div>
      </div>
    </section>
  )
}
