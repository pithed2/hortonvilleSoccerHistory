import { programOverview } from "@/lib/games"
import Link from "next/link"
import { ContentContainer } from "@/components/archive-ui"

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
      value: overview.yearStart && overview.yearEnd ? `${overview.yearStart}-${overview.yearEnd}` : "-",
    },
  ]

  return (
    <section id="stats" className="bg-primary/5 py-16 md:py-20">
      <ContentContainer>
        <div className="mb-10 text-center md:mb-12">
          <p className="section-eyebrow">Program overview</p>
          <h2 className="section-title text-balance">By The Numbers</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The Hortonville Boys Soccer program spanning over twenty years
          </p>
        </div>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mb-12">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="surface-card p-6 text-center md:p-7"
            >
              <p className="text-3xl font-black tracking-tight text-primary sm:text-4xl">{stat.value}</p>
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground sm:text-base">{stat.label}</h3>
            </article>
          ))}
        </div>

        <div className="text-center">
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/stats"
              className="action-primary"
            >
              View Season-by-Season Stats
            </Link>
            <Link
              href="/coaching-records"
              className="action-secondary"
            >
              Coaching Records
            </Link>
          </div>
        </div>
      </ContentContainer>
    </section>
  )
}
