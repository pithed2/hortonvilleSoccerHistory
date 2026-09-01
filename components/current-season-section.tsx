import Link from "next/link"
import { ArrowRight, CalendarDays, Facebook, Instagram, MapPin, Trophy } from "lucide-react"
import { gamesBySeason, seasonRows } from "@/lib/games"

const INSTAGRAM_URL = "https://www.instagram.com/hortonvillesoccer/"
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61588501114059"

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date)
}

export async function CurrentSeasonSection() {
  const seasons = await seasonRows()
  const current = seasons[0]
  if (!current) return null

  const games = await gamesBySeason(current.season_year)
  const completed = games.filter((game) => ["W", "L", "T", "D"].includes((game.result || "").toUpperCase()))
  const upcoming = games.filter((game) => !["W", "L", "T", "D"].includes((game.result || "").toUpperCase())).slice(0, 3)
  const recent = completed.slice(-2).reverse()

  return (
    <section className="relative overflow-hidden bg-foreground py-20 text-background md:py-24" aria-labelledby="current-season-title">
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[56px] border-primary" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full border-[48px] border-primary" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-primary">Now playing</p>
            <h2 id="current-season-title" className="text-4xl font-black tracking-tight md:text-5xl">
              {current.season_year} Boys Varsity
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-background/75">
              Follow the current team, upcoming matches, results, and updates throughout the season.
            </p>
          </div>
          <Link href={`/seasons/${current.season_year}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-primary-foreground transition-transform hover:-translate-y-0.5">
            Full season hub <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.35fr_1fr]">
          <article className="rounded-2xl border border-background/15 bg-background/5 p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-center gap-3 text-primary">
              <Trophy className="h-6 w-6" aria-hidden="true" />
              <h3 className="font-black uppercase tracking-wide">Season record</h3>
            </div>
            <p className="text-6xl font-black tracking-tight">{current.wins}-{current.losses}-{current.ties}</p>
            <p className="mt-3 text-background/70">{current.gf} goals for / {current.ga} against</p>
            <span className="mt-6 inline-flex rounded-full bg-primary/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
              Season underway
            </span>
          </article>

          <article className="rounded-2xl border border-background/15 bg-background/5 p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-center gap-3 text-primary">
              <CalendarDays className="h-6 w-6" aria-hidden="true" />
              <h3 className="font-black uppercase tracking-wide">Coming up</h3>
            </div>
            {upcoming.length ? (
              <div className="space-y-3">
                {upcoming.map((game) => (
                  <div key={`${game.date}-${game.opponent}`} className="flex items-center justify-between gap-4 rounded-xl bg-background/5 px-4 py-3">
                    <div>
                      <p className="font-black">{game.opponent}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-background/65">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {game.venue || "Location TBD"}
                      </p>
                    </div>
                    <time dateTime={game.date} className="shrink-0 text-sm font-black text-primary">{formatDate(game.date)}</time>
                  </div>
                ))}
              </div>
            ) : <p className="text-background/70">No upcoming matches are currently listed.</p>}
          </article>

          <div className="space-y-6">
            <article className="rounded-2xl border border-background/15 bg-background/5 p-6 backdrop-blur-sm">
              <h3 className="font-black uppercase tracking-wide">Latest results</h3>
              <div className="mt-4 space-y-3">
                {recent.map((game) => (
                  <div key={`${game.date}-${game.opponent}`} className="flex items-center justify-between gap-4">
                    <div><p className="font-bold">{game.opponent}</p><p className="text-xs text-background/60">{formatDate(game.date)}</p></div>
                    <p className="text-lg font-black"><span className="mr-2 text-primary">{game.result}</span>{game.score}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid grid-cols-2 gap-3">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex min-h-24 flex-col justify-between rounded-2xl bg-gradient-to-br from-fuchsia-600 via-rose-500 to-amber-400 p-4 font-black text-white transition-transform hover:-translate-y-0.5">
                <Instagram className="h-6 w-6" aria-hidden="true" /><span>Instagram</span>
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="flex min-h-24 flex-col justify-between rounded-2xl bg-[#1877F2] p-4 font-black text-white transition-transform hover:-translate-y-0.5">
                <Facebook className="h-6 w-6" aria-hidden="true" /><span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
