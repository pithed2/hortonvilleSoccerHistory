"use client"

import { useMemo, useState } from "react"
import { CalendarDays, ChevronRight, Goal, ShieldCheck, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { resultTone } from "@/lib/utils"
import { coachLogout } from "./actions"

type Standing = { Team: string; GS: number; GP: number; W: number; L: number; T: number; GF: number; GA: number; GD: number; Points: number; Group: string; Rank: number | null; Rating: number | null }
type Game = { Date: string; Team: string; Opponent: string; Location: string; Result: string | null; Score: string | null; Source?: string }
type Seed = { Team: string; Group: string; GroupPoints: number; HeadToHeadPoints: number; HeadToHeadDetail: string; OverallPoints: number; GD: number; Rank: number | null; Rating: number | null; Seed: number }
type Data = { generatedAt: string; sourceUrl?: string; overall: Standing[]; schedule: Game[]; seedings: Record<string, Seed[]>; headToHead: { team: string; group: string; opponents: Record<string, string | number | null> }[] }

export function CoachDashboard({ data }: { data: Data }) {
  const [group, setGroup] = useState("Group B")
  const [team, setTeam] = useState("Hortonville")
  const [view, setView] = useState<"seeding" | "schedule" | "head">("seeding")
  const groupTeams = data.overall.filter(row => row.Group === group)
  const selected = data.overall.find(row => row.Team === team) || groupTeams[0]
  const games = useMemo(() => data.schedule.filter(game => game.Team === team), [data.schedule, team])
  const played = games.filter(game => game.Result)
  const upcoming = games.filter(game => !game.Result)
  const h2h = data.headToHead.find(row => row.team === team)

  function switchGroup(value: string) { setGroup(value); const first = data.overall.find(row => row.Group === value); if (first) setTeam(first.Team) }

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <header className="border-b bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">Hortonville Boys Soccer · 2026</p><h1 className="mt-1 text-2xl font-bold">Coach’s Corner</h1></div>
          <form action={coachLogout}><Button type="submit" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white hover:text-black">Sign out</Button></form>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <section className="mb-6 flex flex-col gap-4 rounded-2xl bg-primary p-5 text-white shadow-lg sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold text-white/70">Drill into the seeding picture</p><h2 className="mt-1 text-3xl font-bold">{team}</h2><p className="mt-1 text-sm text-white/80">{group} · {played.length} played · {upcoming.length} remaining</p></div>
          <div className="flex flex-wrap gap-2">
            <Select value={group} onValueChange={switchGroup}><SelectTrigger className="w-36 border-white/30 bg-white text-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Group A">Group A</SelectItem><SelectItem value="Group B">Group B</SelectItem></SelectContent></Select>
            <Select value={team} onValueChange={setTeam}><SelectTrigger className="w-52 border-white/30 bg-white text-black"><SelectValue /></SelectTrigger><SelectContent>{groupTeams.map(row => <SelectItem key={row.Team} value={row.Team}>{row.Team}</SelectItem>)}</SelectContent></Select>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Metric icon={<Trophy />} label="Overall points" value={selected?.Points ?? 0} />
          <Metric icon={<ShieldCheck />} label="Record" value={`${selected?.W ?? 0}-${selected?.L ?? 0}-${selected?.T ?? 0}`} />
          <Metric icon={<Goal />} label="Goal difference" value={(selected?.GD ?? 0) > 0 ? `+${selected.GD}` : selected?.GD ?? 0} />
          <Metric icon={<Trophy />} label="StatsPlus rank" value={selected?.Rank ? `#${selected.Rank}` : "–"} />
          <Metric icon={<CalendarDays />} label="Games scheduled" value={selected?.GS ?? games.length} />
        </section>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-1">{([['seeding','Seeding board'],['schedule','Team schedule'],['head','Head to head']] as const).map(([id,label]) => <Button key={id} variant={view === id ? 'default' : 'outline'} onClick={() => setView(id)}>{label}</Button>)}</div>

        <section className="mt-4">
          {view === "seeding" && <SeedingTable rows={data.seedings[group]} team={team} />}
          {view === "schedule" && <ScheduleTable games={games} />}
          {view === "head" && <HeadToHead opponents={h2h?.opponents || {}} games={games} team={team} />}
        </section>
        <p className="mt-5 text-xs text-muted-foreground">Non-Hortonville schedules and results: {data.sourceUrl ? <a className="font-semibold text-primary underline" href={data.sourceUrl} target="_blank" rel="noreferrer">StatsPlus</a> : "StatsPlus"} · Hortonville: manual entry · updated {new Date(data.generatedAt).toLocaleDateString()}</p>
      </div>
    </main>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) { return <Card className="gap-3 py-5"><CardContent className="flex items-center gap-4"><span className="grid size-10 place-items-center rounded-lg bg-red-50 text-primary">{icon}</span><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div></CardContent></Card> }
function SeedingTable({ rows, team }: { rows: Seed[]; team: string }) { return <Card><CardHeader><CardTitle>Live {rows?.[0]?.Group} seeding</CardTitle><p className="text-sm text-muted-foreground">Order: group points, head-to-head among tied teams, overall points, goal difference, then rating.</p></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Seed</TableHead><TableHead>Team</TableHead><TableHead>State rank</TableHead><TableHead>Rating</TableHead><TableHead>Group pts</TableHead><TableHead>H2H tiebreak</TableHead><TableHead>Overall pts</TableHead><TableHead>GD</TableHead></TableRow></TableHeader><TableBody>{rows?.map(row => <TableRow key={row.Team} className={row.Team === team ? "bg-red-50 font-semibold" : ""}><TableCell><Badge variant={row.Team === team ? "default" : "secondary"}>#{row.Seed}</Badge></TableCell><TableCell>{row.Team}</TableCell><TableCell>{row.Rank ? `#${row.Rank}` : "–"}</TableCell><TableCell>{row.Rating?.toFixed(1) ?? "–"}</TableCell><TableCell>{row.GroupPoints}</TableCell><TableCell>{row.HeadToHeadDetail ? <div><p className="font-semibold">{row.HeadToHeadDetail}</p><p className="text-xs text-muted-foreground">{row.HeadToHeadPoints} pts</p></div> : <span className="text-muted-foreground">–</span>}</TableCell><TableCell>{row.OverallPoints}</TableCell><TableCell>{row.GD > 0 ? `+${row.GD}` : row.GD}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card> }
function ScheduleTable({ games }: { games: Game[] }) { return <Card><CardHeader><CardTitle>Full team schedule</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Opponent</TableHead><TableHead>Site</TableHead><TableHead>Result</TableHead><TableHead>Source</TableHead></TableRow></TableHeader><TableBody>{games.map((game, i) => <TableRow key={`${game.Date}-${game.Opponent}-${i}`}><TableCell>{new Date(`${game.Date}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</TableCell><TableCell>{game.Opponent}</TableCell><TableCell>{game.Location === 'H' ? 'Home' : 'Away'}</TableCell><TableCell>{game.Result ? <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${resultTone(game.Result)}`}>{game.Result} {game.Score}</span> : <span className="text-muted-foreground">Scheduled</span>}</TableCell><TableCell>{game.Source?.startsWith('http') ? <a className="font-semibold text-primary underline" href={game.Source} target="_blank" rel="noreferrer">StatsPlus</a> : <span className="text-muted-foreground">Manual</span>}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card> }
function HeadToHead({ opponents, games, team }: { opponents: Record<string, string | number | null>; games: Game[]; team: string }) {
  const rows = Object.keys(opponents).filter((name) => name !== team)
  const tones = {
    W: "border-emerald-200 bg-emerald-50 text-emerald-900",
    L: "border-slate-300 bg-slate-100 text-slate-700",
    T: "border-amber-200 bg-amber-50 text-amber-900",
    Scheduled: "border-sky-200 bg-sky-50 text-sky-900",
    "No Match": "border-slate-200 bg-slate-50 text-slate-500",
  }
  return <Card><CardHeader><CardTitle>Head-to-head map</CardTitle></CardHeader><CardContent className="grid items-start gap-2 sm:grid-cols-2">{rows.map((name) => {
    const matches = games.filter((game) => game.Opponent === name).sort((a, b) => a.Date.localeCompare(b.Date))
    if (!matches.length) return <div key={name} className={`flex items-center justify-between rounded-lg border p-3 ${tones["No Match"]}`}><span className="font-semibold">{name}</span><span className="flex items-center gap-1 text-sm font-bold">No Match<ChevronRight className="size-4 opacity-50" /></span></div>
    return <div key={name} className="rounded-lg border bg-white p-3"><div className="mb-2 flex items-center justify-between"><span className="font-semibold">{name}</span>{matches.length > 1 ? <Badge variant="secondary">{matches.length} meetings</Badge> : null}</div><div className="space-y-2">{matches.map((match, index) => {
      const result = match.Result ? (match.Result === "D" ? "T" : match.Result) as "W" | "L" | "T" : "Scheduled"
      const date = new Date(`${match.Date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      const detail = match.Result ? `${result} · ${match.Score || "Score pending"}` : "Scheduled"
      return <div key={`${match.Date}-${index}`} className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${tones[result]}`}><span className="font-medium">{date} · {match.Location === "H" ? "Home" : "Away"}</span><span className="font-bold">{detail}</span></div>
    })}</div></div>
  })}</CardContent></Card>
}
