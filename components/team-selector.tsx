import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const teams = [
  {
    name: "Varsity",
    detail: "Schedule, roster, and statistics",
    href: "/seasons/2026",
    status: "Season Live",
  },
  {
    name: "JV Red",
    detail: "Results, stats, and box scores",
    href: "/jv/red",
    status: "Season Live",
  },
  {
    name: "JV White",
    detail: "Results, stats, and box scores",
    href: "/jv/white",
    status: "Season Live",
  },
  {
    name: "JV Black/Gray",
    detail: "Team schedules and game details",
    href: "/jv/black-gray",
    status: "Season Live",
  },
] as const

export function TeamSelector() {
  return (
    <section className="border-b bg-muted/20 py-10 sm:py-12" aria-labelledby="team-selector-title">
      <div className="site-container">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">The program</p>
            <h2 id="team-selector-title" className="section-title">Choose your team</h2>
          </div>
          <Link href="/jv" className="text-link w-fit text-sm">View all JV teams</Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {teams.map((team) => (
            <Link key={team.name} href={team.href} className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
              <article className="surface-card-interactive group flex min-h-44 flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-primary">
                    {team.status}
                  </span>
                  <ArrowUpRight className="size-5 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </div>
                <h3 className="mt-7 text-2xl font-black tracking-tight">{team.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{team.detail}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
