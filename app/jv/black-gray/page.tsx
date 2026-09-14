import type { Metadata } from "next"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { JvCalendar } from "@/components/jv-calendar"
import { JV_CONFERENCE_NOTE } from "@/lib/jv-conference.mjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import blackGrayData from "@/data/jv/black-gray.json"

export const metadata: Metadata = { title: "JV Black & Gray 2026" }

type RosterPlayer = { number: string; name: string; position: string }

function sortRoster(roster: RosterPlayer[]) {
  return [...roster].sort((a, b) => {
    const left = Number.parseInt(a.number, 10)
    const right = Number.parseInt(b.number, 10)
    return (Number.isFinite(left) ? left : Infinity) - (Number.isFinite(right) ? right : Infinity)
  })
}

function RosterCard({ name, roster, rosterNote }: { name: string; roster: RosterPlayer[]; rosterNote: string }) {
  return (
    <article className="surface-card p-5 sm:p-7">
      <p className="section-eyebrow">Roster</p>
      <h2 className="text-2xl font-black">{name}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{rosterNote}</p>
      {roster.length ? (
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Player</TableHead><TableHead className="text-right">Position</TableHead></TableRow></TableHeader>
            <TableBody>
              {sortRoster(roster).map((player) => (
                <TableRow key={`${player.number}-${player.name}`}>
                  <TableCell className="font-black text-primary">{player.number || "—"}</TableCell>
                  <TableCell className="font-semibold">{player.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{player.position || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Roster not yet available.</p>
      )}
    </article>
  )
}

export default function JvBlackGrayPage() {
  const results = blackGrayData.results
  const wins = results.filter(game => game.result === "W").length
  const losses = results.filter(game => game.result === "L").length
  const ties = results.filter(game => game.result === "T").length
  return <main id="main-content" className="min-h-screen bg-background">
    <Navigation />
    <header className="page-header"><div className="site-container"><Link href="/jv" className="text-sm font-semibold">Back to all JV teams</Link><p className="page-eyebrow mt-5">Hortonville Boys Soccer · 2026</p><h1 className="page-title">JV Black &amp; Gray</h1><p className="page-description">Follow Coach Seth’s JV Black and JV Gray teams throughout the season.</p></div></header>
    <div className="site-container space-y-6 py-10">
      <p className="text-sm leading-6 text-muted-foreground">{JV_CONFERENCE_NOTE}</p>
      <section className="surface-card p-5 sm:p-7" aria-labelledby="results-title">
        <p className="section-eyebrow">Combined JV Black &amp; Gray</p>
        <h2 id="results-title" className="text-2xl font-black">Results</h2>
        <p className="mt-2 font-bold">Reported record: {wins}–{losses}–{ties} (W–L–T)</p>
        <p className="mt-2 text-sm text-muted-foreground">Player statistics are not yet available for these games.</p>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Opponent</TableHead><TableHead>Site</TableHead><TableHead>Result</TableHead><TableHead>Score</TableHead></TableRow></TableHeader>
            <TableBody>{results.map(game => (
              <TableRow key={`${game.date}-${game.opponent}`}>
                <TableCell className="whitespace-nowrap"><time dateTime={game.date}>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${game.date}T12:00:00Z`))}</time></TableCell>
                <TableCell className="font-semibold">{game.opponent}</TableCell>
                <TableCell>{game.location}</TableCell>
                <TableCell>{game.result === "W" ? "Win" : game.result === "L" ? "Loss" : "Tie"}</TableCell>
                <TableCell className="whitespace-nowrap">{game.score ?? "Score pending"}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <RosterCard name={blackGrayData.squads.black.name} roster={blackGrayData.squads.black.roster} rosterNote={blackGrayData.squads.black.rosterNote} />
        <RosterCard name={blackGrayData.squads.gray.name} roster={blackGrayData.squads.gray.roster} rosterNote={blackGrayData.squads.gray.rosterNote} />
      </div>
      <JvCalendar teams={["JV Black", "JV Gray"]} />
    </div>
    <Footer />
  </main>
}
