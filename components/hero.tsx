import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import { gamesBySeason, seasonRows } from "@/lib/games"

function formatMatchDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export async function Hero() {
  const seasons = await seasonRows()
  const current = seasons[0]
  const games = current ? await gamesBySeason(current.season_year) : []
  const nextMatch = games.find((game) => !["W", "L", "T", "D"].includes((game.result || "").toUpperCase()))

  return (
    <section className="relative overflow-hidden bg-[#0b0d10] text-white" aria-labelledby="home-hero-title">
      <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_1px)] bg-[size:34px_34px]" />
      </div>
      <div className="absolute -right-32 -top-52 size-[34rem] rounded-full border-[76px] border-primary/15" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-18 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-14 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary sm:text-sm">
            Hortonville Boys Soccer
          </p>
          <h1 id="home-hero-title" className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            Building a Tradition of Excellence
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Follow every Hortonville team through the current season. Celebrate the players, matches, and history shaping our program.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/seasons/2026" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-primary/90">
              2026 Season <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/jv" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10">
              JV Teams
            </Link>
          </div>
        </div>

        <aside className="min-w-0 rounded-3xl border border-white/12 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur-sm sm:p-7" aria-label="Next varsity match">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Next match</p>
            <Image src="/logos/modern-bear-logo-white-fill.png" alt="" width={44} height={44} className="h-11 w-auto opacity-90" />
          </div>
          {nextMatch ? (
            <>
              <p className="mt-7 text-sm font-bold uppercase tracking-wide text-white/55">Hortonville vs.</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{nextMatch.opponent}</h2>
              <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-white/70">
                <p className="flex items-center gap-3"><CalendarDays className="size-5 shrink-0 text-primary" aria-hidden="true" /> {formatMatchDate(nextMatch.date)}</p>
                <p className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /> {nextMatch.notes || "Location to be announced"}</p>
              </div>
            </>
          ) : (
            <p className="mt-7 text-white/70">The next match will be posted when the schedule is updated.</p>
          )}
        </aside>
      </div>

      {current ? (
        <div className="relative border-t border-white/10 bg-black/25">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-4 text-sm sm:px-6 lg:px-8">
            <span className="font-black uppercase tracking-[0.16em] text-white/50">{current.season_year} Varsity</span>
            <span><strong className="text-lg text-white">{current.wins}-{current.losses}-{current.ties}</strong> <span className="ml-1 text-white/55">record</span></span>
            <span><strong className="text-white">{current.gf}</strong> <span className="ml-1 text-white/55">goals for</span></span>
            <span><strong className="text-white">{current.ga}</strong> <span className="ml-1 text-white/55">goals against</span></span>
          </div>
        </div>
      ) : null}
    </section>
  )
}
