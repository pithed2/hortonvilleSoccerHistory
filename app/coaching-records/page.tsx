import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { coachRecords } from "@/lib/games"

// games.csv only records coach surnames ("Ruhle", "Montalbano", "Everett").
// Full names and narrative highlights aren't derivable from the data, so
// they're curated here rather than invented from the CSV. Add an entry when
// a new coach's games start appearing in games.csv, or this coach falls
// back to displaying their CSV surname with no extra highlights.
const COACH_INFO: Record<string, { fullName: string; highlights: string[] }> = {
  Everett: {
    fullName: "Paul Everett",
    highlights: ["Longest-tenured head coach in program history", "Pioneered the identity and standards of Hortonville soccer],
  },
  Montalbano: {
    fullName: "Andy Montalbano",
    highlights: [
      "2009: First season under the lights at Akin Field",
      "Led the program through the transition to varsity legitimacy",
    ],
  },
    Ruhle: {
    fullName: "Gary Ruhle",
    highlights: ["Program's first recorded varsity seasons", "Built the program from scratch"],
  },

}

export default async function CoachingRecordsPage() {
  const records = await coachRecords()

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Coaching Records</h1>
          <p className="text-lg opacity-90">Head coaching history and achievements</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {records.map((coach, idx) => {
            const info = COACH_INFO[coach.name]
            const displayName = info?.fullName ?? coach.name
            const highlights = [...(info?.highlights ?? [])]
            if (coach.bestSeason) {
              highlights.unshift(
                `${coach.bestSeason.season_year}: ${coach.bestSeason.wins}-${coach.bestSeason.losses}-${coach.bestSeason.ties} season (${coach.bestSeason.winPct.toFixed(1)}%)${coach.bestSeason.notes ? ` — ${coach.bestSeason.notes}` : ""}`,
              )
            }

            return (
              <div key={coach.name} className="bg-card border border-border rounded-lg overflow-hidden">
                <div
                  className={`${idx === 0 ? "bg-primary/10 border-b border-border" : "bg-muted/30 border-b border-border"} p-8`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-black text-primary mb-2">{displayName}</h2>
                      <p className="text-lg font-semibold text-muted-foreground">
                        {coach.tenureStart}-{coach.tenureEnd === new Date().getFullYear() ? "Present" : coach.tenureEnd}
                      </p>
                    </div>
                    <div className="text-right mt-4 md:mt-0">
                      <p className="text-sm font-semibold text-muted-foreground">Seasons</p>
                      <p className="text-4xl font-black text-primary">{coach.seasons}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Wins</p>
                      <p className="text-3xl font-black text-green-600">{coach.wins}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Losses</p>
                      <p className="text-3xl font-black text-red-600">{coach.losses}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Ties</p>
                      <p className="text-3xl font-black text-blue-600">{coach.ties}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Win %</p>
                      <p className="text-3xl font-black text-primary">{coach.winPct.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="font-black mb-4">Highlights & Achievements</h3>
                  <ul className="space-y-2">
                    {highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Footer />
    </main>
  )
}
