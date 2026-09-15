import calendar from "@/data/jv/calendar.json"
import { compareJerseyNumbers } from "@/lib/roster-order"
import Link from "next/link"
import { JV_CONFERENCE_NOTE, isJvConferenceOpponent } from "@/lib/jv-conference.mjs"
import { CalendarDays, ChevronRight, ShieldCheck, Target, Trophy } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { JvTeamStats } from "@/lib/jv-teams"

export type JvDashboardStats = Omit<JvTeamStats, "totals" | "players" | "goalkeepers" | "recent"> & {
 scoredGames?: number
 totals: { goalsFor: number | null; goalsAgainst: number | null; shots: number | null; sog: number | null; saves: number | null }
 players: Array<{ number: string | number; name: string; squad?: string; gp: number | null; goals: number | null; assists: number | null; points: number | null }>
 goalkeepers: Array<{ number: string | number; name: string; games: number | null; saves: number | null; minutes: number | null; recordedSaves?: number; goalsAgainst: number | null }>
 recent: Array<{ id: number; date: string; opponent: string; location: string; kickoff?: string; score: string | null; result: string; boxScoreAvailable?: boolean }>
}

export function JvSeasonDashboard({ stats: jvStats }: { stats: JvDashboardStats }) {
 const teamSlug = jvStats.slug
  const calendarTeams = teamSlug === "black-gray" ? ["JV Black", "JV Gray", "JV Black/Gray"] : [jvStats.team]
  const dateLabel = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(date + "T12:00:00Z"))
  const latestResult = jvStats.recent.reduce((latest, game) => {
    const date = new Date(game.date + " 2026 12:00:00 GMT").toISOString().slice(0, 10)
    return date > latest ? date : latest
  }, "2026-01-01")
  const upcoming = calendar.events
    .filter(event => calendarTeams.includes(event.team) && event.date > latestResult)
    .sort((a, b) => a.start.localeCompare(b.start))
    .map(event => ({
      id: event.id, date: dateLabel(event.date), opponent: event.opponent,
      location: (teamSlug === "black-gray" ? event.team + " · " : "") + (event.home ? "Home" : "Away") + (event.location ? " · " + event.location : ""),
      time: event.time, bus: !event.home ? event.bus : null,
    }))
  const games = jvStats.record.wins + jvStats.record.losses + jvStats.record.ties
  const scoredGames = jvStats.scoredGames ?? games
  const partialScores = scoredGames < games
  const goalDifference = jvStats.totals.goalsFor == null || jvStats.totals.goalsAgainst == null ? null : jvStats.totals.goalsFor - jvStats.totals.goalsAgainst

  return <main className="min-h-screen bg-background">
    <Navigation />
    <header className="relative overflow-hidden border-b border-white/10 bg-[#0b0d10] py-10 text-white md:py-12">
      <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[48px] border-primary/10" aria-hidden="true" />
      <div className="site-container relative">
        <Link href="/jv" className="text-sm font-semibold text-white/60 hover:text-white">Back to all JV teams</Link>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Boys soccer · {jvStats.team}</p><h1 className="mt-1 text-4xl font-black tracking-tight md:text-5xl">2026 Season</h1><p className="mt-3 flex items-center gap-2 text-sm text-white/60"><span className="size-1.5 rounded-full bg-emerald-400" />{jvStats.sourceLabel ?? "Workbook data"} · Updated {jvStats.updated}</p></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <HeaderStat label="Conference" value={jvStats.record.conference} />
            <HeaderStat label="Overall" value={`${jvStats.record.wins}-${jvStats.record.losses}-${jvStats.record.ties}`} />
            <HeaderStat label={partialScores ? "Goals For (known)" : "Goals For"} value={`${jvStats.totals.goalsFor ?? "—"}`} />
            <HeaderStat label={partialScores ? "Goals Against (known)" : "Goals Against"} value={`${jvStats.totals.goalsAgainst ?? "—"}`} />
            <HeaderStat label="Conference" value="FVA" compact />
          </div>
        </div>
      </div>
    </header>

    <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur"><nav aria-label="JV season sections" className="site-container flex gap-2 overflow-x-auto py-3"><a href="#schedule" className="whitespace-nowrap rounded-full border bg-card px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary">Schedule</a><a href="#players" className="whitespace-nowrap rounded-full border bg-card px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary">Player Stats</a><a href="#goalkeepers" className="whitespace-nowrap rounded-full border bg-card px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary">Goalkeepers</a></nav></div>

    <div className="site-container space-y-8 py-10 sm:py-12">
      <section className="grid gap-4 sm:grid-cols-3"><StatCard icon={<Target />} label="Goals per match" value={jvStats.totals.goalsFor == null ? "—" : (jvStats.totals.goalsFor / Math.max(scoredGames, 1)).toFixed(1)} note={jvStats.totals.goalsFor == null ? "Awaiting complete scores" : partialScores ? `${jvStats.totals.goalsFor} goals in ${scoredGames} games with scores` : `${jvStats.totals.goalsFor} total goals`} /><StatCard icon={<CalendarDays />} label="Goal difference" value={goalDifference == null ? "—" : `${goalDifference >= 0 ? "+" : ""}${goalDifference}`} note={partialScores ? `${scoredGames} of ${games} matches have scores` : `${games} matches played`} /><StatCard icon={<Trophy />} label="Overall Record" value={`${jvStats.record.wins}-${jvStats.record.losses}-${jvStats.record.ties}`} note="W–L–T" /></section>

      {jvStats.notes?.length ? <aside className="rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">{jvStats.notes.map(note => <p key={note} className="py-1">{note}</p>)}</aside> : null}
      <p className="text-sm leading-6 text-muted-foreground">{JV_CONFERENCE_NOTE}</p>
      <section id="schedule" className="scroll-mt-36 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <article className="surface-card p-5 sm:p-7"><p className="section-eyebrow">Match center</p><h2 className="text-2xl font-black">Recent results</h2><div className="mt-5 space-y-2">{jvStats.recent.map(game => <ResultCard key={game.id} game={game} teamSlug={teamSlug} />)}</div></article>
        <article className="surface-card p-5 sm:p-7"><p className="section-eyebrow">Coming up</p><h2 className="text-2xl font-black">Next matches</h2><div className="mt-5 divide-y">{!upcoming.length ? <p className="text-sm text-muted-foreground">Upcoming schedule has not been added.</p> : null}{upcoming.map((game,index) => <div key={game.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"><div className={`grid size-11 shrink-0 place-items-center rounded-xl text-xs font-black ${index === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{game.date}</div><div className="min-w-0"><p className="truncate font-bold">{game.opponent}</p>{isJvConferenceOpponent(game.opponent) ? <span className="text-xs font-semibold text-primary">Conference</span> : null}<p className="text-xs text-muted-foreground">{game.location}</p><p className="text-xs text-muted-foreground">Game: {game.time ?? "Time TBD"} · Central</p>{game.bus ? <p className="text-xs text-muted-foreground">Bus loads: {game.bus}</p> : null}</div></div>)}</div></article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.65fr_1.35fr]">
        <div className="min-w-0 space-y-6">
          <article className="surface-card p-6"><p className="section-eyebrow">Team totals</p><h2 className="text-2xl font-black">By the numbers</h2><div className="mt-6 grid grid-cols-2 gap-3">{[["Saves",jvStats.totals.saves],[partialScores ? "Goals allowed (known)" : "Goals allowed",jvStats.totals.goalsAgainst]].map(([label,value]) => <div key={label} className="rounded-xl bg-muted/50 p-4"><p className="text-2xl font-black">{value ?? "—"}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div></article>
          <article id="goalkeepers" className="surface-card scroll-mt-36 p-6"><p className="section-eyebrow">Goalkeeper stats</p><h2 className="text-2xl font-black">Season totals</h2><div className="mt-5 overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Goalkeeper</TableHead><TableHead className="text-center">SV</TableHead><TableHead className="text-center">MIN</TableHead><TableHead className="text-right">GA</TableHead></TableRow></TableHeader><TableBody>{[...jvStats.goalkeepers].sort((a, b) => compareJerseyNumbers(a.number, b.number) || a.name.localeCompare(b.name)).map(goalkeeper => <TableRow key={goalkeeper.name}><TableCell><p className="font-semibold">{goalkeeper.name}</p><p className="text-xs text-muted-foreground">#{goalkeeper.number} · {goalkeeper.games ?? "—"} GP</p></TableCell><TableCell className="text-center font-bold">{goalkeeper.saves ?? (goalkeeper.recordedSaves != null ? `${goalkeeper.recordedSaves} recorded*` : "—")}</TableCell><TableCell className="text-center font-bold">{goalkeeper.minutes ?? "—"}</TableCell><TableCell className="text-right font-bold">{goalkeeper.goalsAgainst ?? "—"}</TableCell></TableRow>)}</TableBody></Table></div></article>
        </div>
        <article id="players" className="surface-card min-w-0 scroll-mt-36 p-5 sm:p-7"><p className="section-eyebrow">Player stats</p><h2 className="text-2xl font-black">Full roster</h2><p className="mt-1 text-xs text-muted-foreground">{jvStats.gamesNote ?? "GP reflects team participation · Goals: 2 points · Assists: 1 point"}</p><div className="mt-4 max-h-[36rem] overflow-auto"><Table><TableHeader><TableRow><TableHead>Player</TableHead><TableHead className="text-center">GP</TableHead><TableHead className="text-center">G</TableHead><TableHead className="text-center">A</TableHead><TableHead className="text-right">Pts</TableHead></TableRow></TableHeader><TableBody>{[...jvStats.players].sort((a, b) => compareJerseyNumbers(a.number, b.number) || a.name.localeCompare(b.name)).map(player => <TableRow key={`${player.squad ?? ""}-${player.number}-${player.name}`}><TableCell><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-xs font-black text-primary">{player.number}</span><span><span className="font-semibold">{player.name}</span>{player.squad ? <span className="block text-xs text-muted-foreground">{player.squad}</span> : null}</span></div></TableCell><TableCell className="text-center">{player.gp ?? "—"}</TableCell><TableCell className="text-center">{player.goals ?? "—"}</TableCell><TableCell className="text-center">{player.assists ?? "—"}</TableCell><TableCell className="text-right font-black text-primary">{player.points ?? "—"}</TableCell></TableRow>)}</TableBody></Table></div></article>
      </section>

      <div className="flex items-center gap-3 rounded-2xl border bg-card p-5"><ShieldCheck className="size-5 text-emerald-600" /><div><p className="text-sm font-bold">Public team page</p><p className="text-xs text-muted-foreground">Statistics are unofficial and maintained by the team.</p></div></div>
    </div>
    <Footer />
  </main>
}

function ResultCard({ game, teamSlug }: { game: JvDashboardStats["recent"][number]; teamSlug: string }) {
  const hasBoxScore = game.boxScoreAvailable !== false
  const className = "group grid grid-cols-[56px_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl border bg-card p-4"
  const content = <><p className="text-xs font-bold uppercase text-muted-foreground">{game.date}</p><div className="min-w-0"><p className="truncate font-bold">{game.opponent}</p>{isJvConferenceOpponent(game.opponent) ? <span className="text-xs font-semibold text-primary">Conference</span> : null}<p className="text-xs text-muted-foreground">{game.location}{game.kickoff ? ` · ${game.kickoff}` : ""} · {hasBoxScore ? "Box score" : "Stats coming soon"}</p>{game.score == null ? <p className="text-xs text-muted-foreground">Score pending</p> : null}</div><div className="text-right"><p className="text-xl font-black">{game.score ?? "—"}</p><p className="text-xs font-bold">{game.result}</p></div>{hasBoxScore ? <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" /> : <span className="size-4" aria-hidden="true" />}</>
  return hasBoxScore ? <Link href={`/jv/${teamSlug}/games/${game.id}`} className={`${className} transition hover:border-primary/40 hover:bg-primary/5`}>{content}</Link> : <div className={className}>{content}</div>
}

function HeaderStat({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) { return <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3"><p className="text-xs font-bold uppercase text-white/50">{label}</p><p className={`mt-1 font-black ${compact ? "text-sm" : "text-xl"}`}>{value}</p></div> }
function StatCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) { return <article className="surface-card p-6"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.18em] text-muted-foreground">{label}</p><span className="text-primary [&>svg]:size-4">{icon}</span></div><p className="mt-5 text-4xl font-black">{value}</p><p className="mt-2 text-sm text-muted-foreground">{note}</p></article> }
