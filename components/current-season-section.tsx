import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import { gamesBySeason, seasonRows } from "@/lib/games"

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date)
}

function resultTone(result?: string) {
  if (result === "W") return "bg-emerald-100 text-emerald-800"
  if (result === "L") return "bg-red-100 text-red-800"
  return "bg-amber-100 text-amber-800"
}

export async function CurrentSeasonSection() {
  const seasons = await seasonRows()
  const current = seasons[0]
  if (!current) return null

  const games = await gamesBySeason(current.season_year)
  const completed = games.filter((game) => ["W", "L", "T", "D"].includes((game.result || "").toUpperCase()))
  const upcoming = games.filter((game) => !["W", "L", "T", "D"].includes((game.result || "").toUpperCase())).slice(0, 3)
  const recent = completed.slice(-3).reverse()

  return (
    <section className="bg-background py-14 sm:py-16" aria-labelledby="match-center-title">
      <div className="site-container">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">Varsity match center</p>
            <h2 id="match-center-title" className="text-3xl font-black tracking-tight sm:text-4xl">Follow the season</h2>
          </div>
          <Link href={`/seasons/${current.season_year}`} className="action-primary w-fit">
            Full season <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <article className="surface-card p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Completed</p>
                <h3 className="text-xl font-black">Latest results</h3>
              </div>
            </div>

            <div className="mt-6 divide-y">
              {recent.length ? recent.map((game) => (
                <div key={`${game.date}-${game.opponent}`} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <time dateTime={game.date} className="w-14 shrink-0 text-sm font-bold text-muted-foreground">{formatDate(game.date)}</time>
                  <p className="min-w-0 flex-1 font-black">{game.opponent}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${resultTone(game.result)}`}>{game.result}</span>
                  <p className="w-11 text-right text-lg font-black tabular-nums">{game.score}</p>
                </div>
              )) : <p className="text-muted-foreground">No completed matches are currently listed.</p>}
            </div>
          </article>

          <article className="surface-card p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <ArrowRight className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">On the schedule</p>
                <h3 className="text-xl font-black">Upcoming matches</h3>
              </div>
            </div>

            <div className="mt-6 divide-y">
              {upcoming.length ? upcoming.map((game) => (
                <div key={`${game.date}-${game.opponent}`} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <time dateTime={game.date} className="w-14 shrink-0 text-sm font-bold text-primary">{formatDate(game.date)}</time>
                  <div className="min-w-0 flex-1">
                    <p className="font-black">{game.opponent}</p>
                    <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      {game.notes || "Location TBD"}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{game.venue || "TBD"}</span>
                </div>
              )) : <p className="text-muted-foreground">No upcoming matches are currently listed.</p>}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
