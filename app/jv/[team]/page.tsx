import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarDays, ChevronRight, ShieldCheck, Target, Trophy } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getJvTeam, isJvTeamSlug } from "@/lib/jv-teams"

type Props = { params: Promise<{ team: string }> }

export function generateStaticParams() { return [{ team: "red" }] }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const teamSlug = (await params).team
  if (!isJvTeamSlug(teamSlug)) return { title: "JV team not found" }
  const team = getJvTeam(teamSlug)
  return { title: team ? `${team.stats.team} 2026` : "JV team not found" }
}

export default async function JvTeamPage({ params }: Props) {
  const teamSlug = (await params).team
  if (!isJvTeamSlug(teamSlug)) notFound()
  const bundle = getJvTeam(teamSlug)
  if (!bundle) notFound()
  const jvStats = bundle.stats
  const games = jvStats.record.wins + jvStats.record.losses + jvStats.record.ties
  const goalDifference = jvStats.totals.goalsFor - jvStats.totals.goalsAgainst

  return <main id="main-content" className="min-h-screen bg-background">
    <Navigation />
    <header className="relative overflow-hidden border-b border-white/10 bg-[#0b0d10] py-10 text-white md:py-12">
      <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[48px] border-primary/10" aria-hidden="true" />
      <div className="site-container relative">
        <Link href="/jv" className="text-sm font-semibold text-white/60 hover:text-white">Back to all JV teams</Link>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Boys soccer · {jvStats.team}</p><h1 className="mt-1 text-4xl font-black tracking-tight md:text-5xl">2026 Season</h1><p className="mt-3 flex items-center gap-2 text-sm text-white/60"><span className="size-1.5 rounded-full bg-emerald-400" />Workbook data · Updated {jvStats.updated}</p></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <HeaderStat label="Record" value={`${jvStats.record.wins}-${jvStats.record.losses}-${jvStats.record.ties}`} />
            <HeaderStat label="Goals For" value={`${jvStats.totals.goalsFor}`} />
            <HeaderStat label="Goals Against" value={`${jvStats.totals.goalsAgainst}`} />
            <HeaderStat label="Conference" value={jvStats.record.conference} compact />
          </div>
        </div>
      </div>
    </header>

    <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur"><nav aria-label="JV season sections" className="site-container flex gap-2 overflow-x-auto py-3"><a href="#schedule" className="whitespace-nowrap rounded-full border bg-card px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary">Schedule</a><a href="#players" className="whitespace-nowrap rounded-full border bg-card px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary">Player Stats</a><a href="#goalkeepers" className="whitespace-nowrap rounded-full border bg-card px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary">Goalkeepers</a></nav></div>

    <div className="site-container space-y-8 py-10 sm:py-12">
      <section className="grid gap-4 sm:grid-cols-3"><StatCard icon={<Target />} label="Goals per match" value={(jvStats.totals.goalsFor / Math.max(games, 1)).toFixed(1)} note={`${jvStats.totals.goalsFor} total goals`} /><StatCard icon={<CalendarDays />} label="Goal difference" value={`${goalDifference >= 0 ? "+" : ""}${goalDifference}`} note={`${games} matches played`} /><StatCard icon={<Trophy />} label="Conference" value={jvStats.record.conference} note="Fox Valley Association" /></section>

      <section id="schedule" className="scroll-mt-36 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <article className="surface-card p-5 sm:p-7"><p className="section-eyebrow">Match center</p><h2 className="text-2xl font-black">Recent results</h2><div className="mt-5 space-y-2">{jvStats.recent.map(game => <Link href={`/jv/${teamSlug}/games/${game.id}`} key={game.id} className="group grid grid-cols-[56px_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5"><p className="text-xs font-bold uppercase text-muted-foreground">{game.date}</p><div className="min-w-0"><p className="truncate font-bold">{game.opponent}</p><p className="truncate text-xs text-muted-foreground">{game.location} · Box score</p></div><p className="text-xl font-black">{game.score}</p><ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" /></Link>)}</div></article>
        <article className="surface-card p-5 sm:p-7"><p className="section-eyebrow">Coming up</p><h2 className="text-2xl font-black">Next matches</h2><div className="mt-5 divide-y">{jvStats.upcoming.map((game,index) => <div key={`${game.date}-${game.opponent}`} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"><div className={`grid size-11 shrink-0 place-items-center rounded-xl text-xs font-black ${index === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{game.date}</div><div className="min-w-0"><p className="truncate font-bold">{game.opponent}</p><p className="truncate text-xs text-muted-foreground">{game.location}</p></div></div>)}</div></article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.65fr_1.35fr]">
        <div className="min-w-0 space-y-6">
          <article className="surface-card p-6"><p className="section-eyebrow">Team totals</p><h2 className="text-2xl font-black">By the numbers</h2><div className="mt-6 grid grid-cols-2 gap-3">{[["Shots",jvStats.totals.shots],["Shots on goal",jvStats.totals.sog],["Saves",jvStats.totals.saves],["Goals allowed",jvStats.totals.goalsAgainst]].map(([label,value]) => <div key={label} className="rounded-xl bg-muted/50 p-4"><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div></article>
          <article id="goalkeepers" className="surface-card scroll-mt-36 p-6"><p className="section-eyebrow">Goalkeeper stats</p><h2 className="text-2xl font-black">Season totals</h2><div className="mt-5 overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Goalkeeper</TableHead><TableHead className="text-center">SV</TableHead><TableHead className="text-center">MIN</TableHead><TableHead className="text-right">GA</TableHead></TableRow></TableHeader><TableBody>{jvStats.goalkeepers.map(goalkeeper => <TableRow key={goalkeeper.number}><TableCell><p className="font-semibold">{goalkeeper.name}</p><p className="text-xs text-muted-foreground">#{goalkeeper.number} · {goalkeeper.games} GP</p></TableCell><TableCell className="text-center font-bold">{goalkeeper.saves}</TableCell><TableCell className="text-center font-bold">{goalkeeper.minutes}</TableCell><TableCell className="text-right font-bold">{goalkeeper.goalsAgainst}</TableCell></TableRow>)}</TableBody></Table></div></article>
        </div>
        <article id="players" className="surface-card min-w-0 scroll-mt-36 p-5 sm:p-7"><p className="section-eyebrow">Player stats</p><h2 className="text-2xl font-black">Full roster</h2><p className="mt-1 text-xs text-muted-foreground">GP reflects team participation · Goals: 2 points · Assists: 1 point</p><div className="mt-4 max-h-[36rem] overflow-auto"><Table><TableHeader><TableRow><TableHead>Player</TableHead><TableHead className="text-center">GP</TableHead><TableHead className="text-center">G</TableHead><TableHead className="text-center">A</TableHead><TableHead className="text-right">Pts</TableHead></TableRow></TableHeader><TableBody>{jvStats.players.map(player => <TableRow key={player.number}><TableCell><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-xs font-black text-primary">{player.number}</span><span className="font-semibold">{player.name}</span></div></TableCell><TableCell className="text-center">{player.gp}</TableCell><TableCell className="text-center">{player.goals}</TableCell><TableCell className="text-center">{player.assists}</TableCell><TableCell className="text-right font-black text-primary">{player.points}</TableCell></TableRow>)}</TableBody></Table></div></article>
      </section>

      <aside className="rounded-2xl border bg-muted/30 p-5 text-xs leading-6 text-muted-foreground" aria-label="Data update audit"><p className="font-bold uppercase tracking-[.14em] text-foreground">Data update audit</p><p className="mt-2">Source: {jvStats.audit.sourceFile} · Imported {formatAuditDate(jvStats.audit.importedAt)} · Validation: {jvStats.audit.validation} · Approved by {jvStats.audit.approvedBy}</p><p>{jvStats.audit.validationSummary}</p></aside>
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-5"><ShieldCheck className="size-5 text-emerald-600" /><div><p className="text-sm font-bold">Public team page</p><p className="text-xs text-muted-foreground">Statistics are unofficial and maintained by the team.</p></div></div>
    </div>
    <Footer />
  </main>
}

function HeaderStat({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) { return <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3"><p className="text-xs font-bold uppercase text-white/50">{label}</p><p className={`mt-1 font-black ${compact ? "text-sm" : "text-xl"}`}>{value}</p></div> }
function StatCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) { return <article className="surface-card p-6"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.18em] text-muted-foreground">{label}</p><span className="text-primary [&>svg]:size-4">{icon}</span></div><p className="mt-5 text-4xl font-black">{value}</p><p className="mt-2 text-sm text-muted-foreground">{note}</p></article> }
function formatAuditDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" }).format(new Date(value)) }
