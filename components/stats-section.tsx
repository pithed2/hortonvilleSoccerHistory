import { programOverview } from "@/lib/games"

export async function StatsSection() {
  const overview = await programOverview()

  const stats = [
    { label: "Total Seasons", value: String(overview.seasons) },
    { label: "All-Time Record", value: `${overview.wins}-${overview.losses}-${overview.ties}` },
    { label: "Career Win Rate", value: `${overview.winPct.toFixed(1)}%` },
    { label: "Total Goals Scored", value: overview.gf.toLocaleString() },
    { label: "Head Coaches", value: String(overview.headCoaches) },
    {
      label: "Years Active",
      value: overview.yearStart && overview.yearEnd ? `${overview.yearStart}-${overview.yearEnd}` : "—",
    },
  ]

  return (
    <section id="stats" className="py-20 md:py-32 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-balance">By The Numbers</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The Hortonville Boys Soccer program spanning over twenty years
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-lg p-8 border border-border text-center hover:border-primary transition-colors"
            >
              <p className="text-5xl md:text-6xl font-black text-primary mb-3">{stat.value}</p>
              <p className="text-lg font-semibold text-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/stats"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              View Season-by-Season Stats
            </a>
            <a
              href="/coaching-records"
              className="inline-block px-8 py-3 border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/10 transition-colors"
            >
              Coaching Records
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
