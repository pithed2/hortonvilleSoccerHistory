import Link from "next/link"
import { ArrowUpRight, Clock3 } from "lucide-react"

const teams = [
  {
    name: "Varsity",
    detail: "Schedule, roster, and statistics",
    href: "/seasons/2026",
    status: "Season live",
  },
  {
    name: "JV Red",
    detail: "Results, stats, and box scores",
    href: "/jv/red",
    status: "Season live",
  },
  {
    name: "JV White",
    detail: "Team season center",
    href: null,
    status: "In Progress",
  },
  {
    name: "JV Black/Gray",
    detail: "Team season center",
    href: null,
    status: "In Progress",
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
          {teams.map((team) => {
            const content = (
              <article className={`group flex min-h-44 flex-col p-5 ${team.href ? "surface-card-interactive" : "rounded-2xl border border-dashed bg-muted/30"}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${team.href ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {team.status}
                  </span>
                  {team.href ? <ArrowUpRight className="size-5 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /> : <Clock3 className="size-5 text-muted-foreground/60" aria-hidden="true" />}
                </div>
                <h3 className="mt-7 text-2xl font-black tracking-tight">{team.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{team.detail}</p>
              </article>
            )

            return team.href ? (
              <Link key={team.name} href={team.href} className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
                {content}
              </Link>
            ) : (
              <div key={team.name}>{content}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
