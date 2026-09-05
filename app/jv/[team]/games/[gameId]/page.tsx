import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, MapPin, ShieldCheck } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getJvBoxScore, getJvTeam, isJvTeamSlug } from "@/lib/jv-teams"
import { resultTone } from "@/lib/utils"

type Props = { params: Promise<{ team: string; gameId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const values = await params
  if (!isJvTeamSlug(values.team)) return { title: "Game not found" }
  const game = getJvBoxScore(values.team, Number(values.gameId))
  const team = getJvTeam(values.team)
  if (!game || !team) return { title: "Game not found" }
  return { title: `Hortonville ${game.team.goals}–${game.opponentTotals.goals} ${game.opponent} | ${team.stats.team} Box Score` }
}

export default async function JvGamePage({ params }: Props) {
  const values = await params
  if (!isJvTeamSlug(values.team)) notFound()
  const game = getJvBoxScore(values.team, Number(values.gameId))
  const team = getJvTeam(values.team)
  if (!game || !team) notFound()

  return <main id="main-content" className="min-h-screen bg-background">
    <Navigation />
    <header className="border-b bg-[#0b0d10] py-5 text-white"><div className="site-container flex flex-wrap items-center justify-between gap-3"><Link href={`/jv/${values.team}#schedule`} className="flex items-center gap-2 text-sm font-semibold text-white/65 hover:text-white"><ArrowLeft className="size-4" /> {team.stats.team} season</Link><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-white/55"><ShieldCheck className="size-4 text-emerald-400" /> Verified box score</div></div></header>

    <div className="mx-auto max-w-6xl space-y-7 px-4 py-10 sm:px-6 lg:px-8">
      <section className="surface-card overflow-hidden">
        <div className="border-b bg-gradient-to-br from-primary/10 via-background to-background px-5 py-7 sm:px-9 sm:py-9">
          <div className="flex flex-wrap gap-5 text-xs font-semibold uppercase tracking-[.13em] text-muted-foreground"><span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{formatDate(game.date)}</span><span className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{game.location}</span>{game.conference ? <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Conference</span> : null}</div>
          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Hortonville</p><p className="mt-2 text-xl font-black sm:text-4xl">Polar Bears</p></div><div className="text-center"><p className="text-4xl font-black tabular-nums sm:text-6xl">{game.team.goals}<span className="mx-2 text-border">–</span>{game.opponentTotals.goals}</p><p className={`mx-auto mt-3 w-fit rounded-lg px-3 py-1 text-xs font-black ${resultTone(game.result)}`}>FINAL · {game.result}</p></div><div className="text-right"><p className="text-xs font-bold uppercase tracking-[.18em] text-muted-foreground">Opponent</p><p className="mt-2 text-xl font-black sm:text-4xl">{game.opponent}</p></div></div>
        </div>

        <div className="grid gap-8 p-5 sm:p-9 lg:grid-cols-[.9fr_1.1fr]">
          <div><p className="section-eyebrow">Match comparison</p><h2 className="text-2xl font-black">Team totals</h2><div className="mt-5 overflow-hidden rounded-2xl border"><Comparison label="Goals" home={game.team.goals} away={game.opponentTotals.goals} /><Comparison label="Shots" home={game.team.shots} away={game.opponentTotals.shots} /><Comparison label="Shots on goal" home={game.team.sog} away="—" /><Comparison label="Saves" home={game.team.saves} away={game.opponentTotals.saves} /><Comparison label="Yellow cards" home={game.team.yc} away="—" /></div></div>
          <div><p className="section-eyebrow">Goal log</p><h2 className="text-2xl font-black">Scoring summary</h2><div className="mt-5 space-y-2">{game.scoring.length ? game.scoring.map((goal,index) => <div key={`${goal.scorer}-${index}`} className="flex items-center gap-4 rounded-2xl border bg-card p-4"><span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-black text-white">{index + 1}</span><div><p className="font-bold">{stripKey(goal.scorer)}</p><p className="text-xs text-muted-foreground">{goal.assist ? `Assist: ${stripKey(goal.assist)}` : "Unassisted"}</p></div><span className="ml-auto text-xs font-bold uppercase text-muted-foreground">{goal.half}</span></div>) : <div className="rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">No Hortonville goals recorded.</div>}</div></div>
        </div>
      </section>

      <section className="surface-card p-5 sm:p-8"><p className="section-eyebrow">Hortonville</p><h2 className="text-2xl font-black">Player box score</h2><div className="mt-5 overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Player</TableHead>{["SH","SOG","G","A","YC","RC","SV","GK MIN"].map(label => <TableHead key={label} className="text-center">{label}</TableHead>)}</TableRow></TableHeader><TableBody>{game.players.map(player => <TableRow key={player.player}><TableCell className="font-semibold">{stripKey(player.player)}</TableCell>{[player.shots,player.sog,player.goals,player.assists,player.yc,player.rc,player.saves,player.gkMinutes].map((value,index) => <TableCell key={index} className={`text-center ${value ? "font-bold" : "text-muted-foreground/50"}`}>{value || "—"}</TableCell>)}</TableRow>)}</TableBody></Table></div></section>
    </div>
    <Footer />
  </main>
}

function Comparison({ label, home, away }: { label: string; home: number | string; away: number | string }) { return <div className="grid grid-cols-[1fr_1.5fr_1fr] items-center border-b px-4 py-3 last:border-0"><span className="text-center text-lg font-black">{home}</span><span className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span><span className="text-center text-lg font-black text-muted-foreground">{away}</span></div> }
function stripKey(value: string) { return value.replace(/^\d+\s*-\s*/, "") }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) }
