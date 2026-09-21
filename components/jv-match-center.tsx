import Link from "next/link"
import { ChevronRight } from "lucide-react"
import calendar from "@/data/jv/calendar.json"
import { getJvTeam, type JvTeamSlug } from "@/lib/jv-teams"
import { isJvConferenceOpponent } from "@/lib/jv-conference.mjs"

const slugs: JvTeamSlug[] = ["red", "white", "black", "gray"]
const label = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))

export function JvMatchCenter() {
  const bundles = slugs.flatMap(slug => {
    const bundle = getJvTeam(slug)
    return bundle ? [{ slug, ...bundle }] : []
  })
  const results = bundles.flatMap(({ slug, stats, boxScores }) => boxScores.map(game => ({ ...game, slug, teamName: stats.team })))
    .sort((a, b) => b.date.localeCompare(a.date) || a.teamName.localeCompare(b.teamName))
  const upcoming = bundles.flatMap(({ stats, boxScores }) => {
    const latest = boxScores.reduce((date, game) => game.date > date ? game.date : date, "2026-01-01")
    return calendar.events.filter(event => event.team === stats.team && event.date > latest)
  }).sort((a, b) => a.start.localeCompare(b.start) || a.team.localeCompare(b.team))

  const resultCard = (game: typeof results[number]) => (
    <Link key={`${game.slug}-${game.id}`} href={`/jv/${game.slug}/games/${game.id}`} className="group grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5 sm:grid-cols-[56px_minmax(0,1fr)_auto_auto]">
      <time dateTime={game.date} className="text-xs font-bold uppercase text-muted-foreground">{label(game.date)}</time>
      <div className="min-w-0">
        <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{game.teamName}</span>
        <p className="font-bold">{game.opponent}</p>
        {game.conference && <p className="text-xs font-semibold text-primary">Conference</p>}
        <p className="text-xs text-muted-foreground">{game.location} · Box score</p>
      </div>
      <div className="text-right"><p className="text-xl font-black">{game.team.goals}–{game.opponentTotals.goals}</p><p className="text-xs font-bold">{game.result}</p></div>
      <ChevronRight className="hidden size-4 text-muted-foreground group-hover:text-primary sm:block" aria-hidden="true" />
    </Link>
  )
  const nextCard = (game: typeof upcoming[number]) => (
    <li key={game.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <time dateTime={game.date} className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-black text-primary">{label(game.date)}</time>
      <div className="min-w-0">
        <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{game.team}</span>
        <p className="font-bold">{game.opponent}</p>
        {isJvConferenceOpponent(game.opponent) && <p className="text-xs font-semibold text-primary">Conference</p>}
        <p className="text-xs text-muted-foreground">{game.home ? "Home" : "Away"}{game.location ? ` · ${game.location}` : ""}</p>
        <p className="text-xs text-muted-foreground">Game: {game.time || "Time TBD"} · Central</p>
        {!game.home && game.bus && <p className="text-xs text-muted-foreground">Bus loads: {game.bus}</p>}
      </div>
    </li>
  )
  return (
    <section className="site-container pb-12 sm:pb-16" aria-label="Combined JV match center">
      <div className="mb-7"><p className="section-eyebrow">All JV teams</p><h2 className="text-3xl font-black">Games &amp; results</h2></div>
      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="surface-card p-5 sm:p-7">
          <p className="section-eyebrow">Match center</p><h3 className="text-2xl font-black">Recent results</h3>
          <div className="mt-5 space-y-2">{results.slice(0, 8).map(resultCard)}{!results.length && <p className="text-sm text-muted-foreground">No results recorded yet.</p>}</div>
          {results.length > 8 && <details className="mt-4"><summary className="cursor-pointer text-sm font-bold text-primary">Show {results.length - 8} earlier results</summary><div className="mt-4 space-y-2">{results.slice(8).map(resultCard)}</div></details>}
        </article>
        <article className="surface-card p-5 sm:p-7">
          <p className="section-eyebrow">Coming up</p><h3 className="text-2xl font-black">Next matches</h3>
          <ul className="mt-5 divide-y">{upcoming.slice(0, 8).map(nextCard)}</ul>
          {!upcoming.length && <p className="mt-5 text-sm text-muted-foreground">No upcoming games listed.</p>}
          {upcoming.length > 8 && <details className="mt-4"><summary className="cursor-pointer text-sm font-bold text-primary">Show {upcoming.length - 8} more matches</summary><ul className="mt-4 divide-y">{upcoming.slice(8).map(nextCard)}</ul></details>}
        </article>
      </div>
    </section>
  )
}
