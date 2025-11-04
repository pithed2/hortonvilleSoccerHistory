"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const coachingRecords = [
  {
    name: "Paul Everett",
    tenure: "2011-Present",
    seasons: 15,
    wins: 161,
    losses: 106,
    ties: 40,
    winPct: 59.04,
    highlights: [
      "2013: 16-7-1 season (66.7%)",
      "2025: Historic 20-0-4 season (83.3%)",
      "Most consistent winning record",
    ],
  },
  {
    name: "Andy Montalbano",
    tenure: "2007-2010",
    seasons: 4,
    wins: 36,
    losses: 43,
    ties: 10,
    winPct: 45.57,
    highlights: [
      "2009: First season under stadium lights",
      "Led program through transition period",
      "Established competitive foundation",
    ],
  },
  {
    name: "Gary Ruhle",
    tenure: "2003-2006",
    seasons: 2,
    wins: 7,
    losses: 23,
    ties: 5,
    winPct: 23.33,
    highlights: [
      "2005: Program's first recorded season",
      "Built program from scratch",
      "Established soccer as school sport",
    ],
  },
]

export default function CoachingRecordsPage() {
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
          {coachingRecords.map((coach, idx) => (
            <div key={coach.name} className="bg-card border border-border rounded-lg overflow-hidden">
              <div
                className={`${idx === 0 ? "bg-primary/10 border-b border-border" : "bg-muted/30 border-b border-border"} p-8`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-primary mb-2">{coach.name}</h2>
                    <p className="text-lg font-semibold text-muted-foreground">{coach.tenure}</p>
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
                  {coach.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
