import { Award, CalendarDays, ClipboardCheck, Trophy } from "lucide-react"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { coachRecords } from "@/lib/games"
import { ContentContainer, PageHeader } from "@/components/archive-ui"

type ExpandedRecord = { wins: number; losses: number; ties: number; label: string }
type CoachInfo = { fullName: string; image: string; highlights: string[]; current?: boolean; expandedRecord?: ExpandedRecord }

const COACH_INFO: Record<string, CoachInfo> = {
  Everett: {
    fullName: "Paul Everett",
    image: "/coaches/paul-everett.jpg",
    current: true,
    highlights: ["Longest-tenured head coach in program history", "Pioneered the identity and standards of Hortonville soccer"],
    expandedRecord: { wins: 179, losses: 109, ties: 41, label: "Including reported scrimmages" },
  },
  Montalbano: {
    fullName: "Andy Montalbano",
    image: "/coaches/andy-montalbano.jpg",
    highlights: ["2009: First season under the lights at Akin Field", "Led the program through the transition to varsity legitimacy"],
  },
  Ruhle: {
    fullName: "Gary Ruhle",
    image: "/coaches/gary-ruhle.jpg",
    highlights: ["Program's first recorded varsity seasons", "Built the program from scratch"],
  },
}

export default async function CoachingRecordsPage() {
  const coachOrder = ["Everett", "Montalbano", "Ruhle"]
  const records = (await coachRecords()).sort((a, b) => coachOrder.indexOf(a.name) - coachOrder.indexOf(b.name))
  const totalSeasons = records.reduce((sum, coach) => sum + coach.seasons, 0)

  return <main className="min-h-screen bg-background">
    <Navigation />
    <PageHeader eyebrow="Program leadership" title="Coaching Records" description="The head coaches who built, guided, and sustained Hortonville boys soccer."><span>{records.length} head coaches</span><span>{totalSeasons} documented seasons</span></PageHeader>

    <ContentContainer className="py-12 md:py-14">
      <aside className="surface-card mb-12 flex gap-4 border-primary/20 bg-primary/5 p-6">
        <ClipboardCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        <div><h2 className="font-black">How records are counted</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">The main totals below are calculated from documented varsity games in the archive. When a broader coaching total includes reported scrimmages, it is shown separately so the historical game data and expanded total remain clearly distinguished.</p></div>
      </aside>

      <div className="relative space-y-8 before:absolute before:bottom-8 before:left-5 before:top-8 before:w-px before:bg-border md:before:left-8">
        {records.map((coach) => {
          const info = COACH_INFO[coach.name]
          const displayName = info?.fullName ?? coach.name
          const highlights = [...(info?.highlights ?? [])]
          if (coach.bestSeason) highlights.unshift(`${coach.bestSeason.season_year}: ${coach.bestSeason.wins}-${coach.bestSeason.losses}-${coach.bestSeason.ties} season (${coach.bestSeason.winPct.toFixed(1)}%)${coach.bestSeason.notes ? ` - ${coach.bestSeason.notes}` : ""}`)
          const expanded = info?.expandedRecord
          const reportedScrimmages = expanded ? { wins: expanded.wins - coach.wins, losses: expanded.losses - coach.losses, ties: expanded.ties - coach.ties } : undefined
          const expandedGames = expanded ? expanded.wins + expanded.losses + expanded.ties : 0

          return <article key={coach.name} className="relative pl-12 md:pl-20">
            <span className="absolute left-1.5 top-8 flex h-7 w-7 items-center justify-center rounded-full border-4 border-background bg-primary md:left-[18px] md:h-8 md:w-8"><span className="h-2 w-2 rounded-full bg-white" /></span>
            <div className="surface-card overflow-hidden">
              <div className="border-b bg-muted/25 p-6 md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-center gap-5"><div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm md:h-28 md:w-24"><Image src={info.image} alt={`${displayName}, Hortonville boys soccer coach`} fill sizes="96px" className="object-cover object-top" /></div><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{coach.tenureStart}-{info?.current ? "Present" : coach.tenureEnd}</p><h2 className="mt-2 text-3xl font-black md:text-4xl">{displayName}</h2></div></div>
                  <div className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3"><CalendarDays className="h-5 w-5 text-primary" /><div><p className="text-xs font-semibold uppercase text-muted-foreground">Seasons</p><p className="text-2xl font-black">{coach.seasons}</p></div></div>
                </div>

                <div className="mt-7"><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Documented varsity record</p><div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {[['Wins', coach.wins, 'text-green-700'], ['Losses', coach.losses, 'text-red-700'], ['Ties', coach.ties, 'text-blue-700'], ['Games', coach.wins + coach.losses + coach.ties, 'text-foreground'], ['Win %', `${coach.winPct.toFixed(1)}%`, 'text-primary']].map(([label, value, color]) => <div key={String(label)} className="rounded-xl border bg-background p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-black ${color}`}>{value}</p></div>)}
                </div></div>

                {expanded && reportedScrimmages ? <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{expanded.label}</p><p className="mt-1 text-3xl font-black">{expanded.wins}-{expanded.losses}-{expanded.ties}</p><p className="mt-2 text-sm text-muted-foreground">Expanded total: {expandedGames} contests, {((expanded.wins / expandedGames) * 100).toFixed(1)}% wins</p></div><div className="rounded-xl bg-background px-4 py-3 ring-1 ring-border"><p className="text-xs font-semibold uppercase text-muted-foreground">Reported scrimmage subtotal</p><p className="mt-1 text-xl font-black">{reportedScrimmages.wins}-{reportedScrimmages.losses}-{reportedScrimmages.ties}</p><p className="text-xs text-muted-foreground">22 contests not itemized in the game archive</p></div></div>
                </div> : null}
              </div>

              <div className="p-6 md:p-8"><div className="mb-5 flex items-center gap-3"><Award className="h-5 w-5 text-primary" /><h3 className="text-lg font-black">Highlights & Achievements</h3></div><ul className="grid gap-3 md:grid-cols-2">{highlights.map((highlight) => <li key={highlight} className="flex items-start gap-3 rounded-xl bg-muted/40 p-4"><Trophy className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="text-sm font-semibold leading-relaxed">{highlight}</span></li>)}</ul></div>
            </div>
          </article>
        })}
      </div>
    </ContentContainer>
    <Footer />
  </main>
}
