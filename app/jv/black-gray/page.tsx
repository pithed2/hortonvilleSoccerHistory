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

function RosterCard({ name, roster }: { name: string; roster: RosterPlayer[] }) {
  return (
    <article className="surface-card p-5 sm:p-7">
      <p className="section-eyebrow">Roster</p>
      <h2 className="text-2xl font-black">{name}</h2>
      {roster.length ? (
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Player</TableHead><TableHead className="text-right">Position</TableHead></TableRow></TableHeader>
            <TableBody>
              {sortRoster(roster).map((player) => (
                <TableRow key={`${player.number}-${player.name}`}>
                  <TableCell className="font-black text-primary">{player.number}</TableCell>
                  <TableCell className="font-semibold">{player.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{player.position}</TableCell>
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
  return <main id="main-content" className="min-h-screen bg-background">
    <Navigation />
    <header className="page-header"><div className="site-container"><Link href="/jv" className="text-sm font-semibold">Back to all JV teams</Link><p className="page-eyebrow mt-5">Hortonville Boys Soccer · 2026</p><h1 className="page-title">JV Black &amp; Gray</h1><p className="page-description">Follow Coach Seth’s JV Black and JV Gray teams throughout the season.</p></div></header>
    <div className="site-container space-y-6 py-10">
      <p className="text-sm leading-6 text-muted-foreground">{JV_CONFERENCE_NOTE}</p>
      <div className="grid gap-5 lg:grid-cols-2">
        <RosterCard name={blackGrayData.squads.black.name} roster={blackGrayData.squads.black.roster} />
        <RosterCard name={blackGrayData.squads.gray.name} roster={blackGrayData.squads.gray.roster} />
      </div>
      <JvCalendar teams={["JV Black", "JV Gray"]} />
    </div>
    <Footer />
  </main>
}
