"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useState } from "react"

const seasonStats = [
  {
    season: 2025,
    wins: 20,
    losses: 0,
    ties: 4,
    gf: 87,
    ga: 11,
    winPct: 83.33,
    coach: "Paul Everett",
    notes: "Historic undefeated season",
  },
  {
    season: 2024,
    wins: 14,
    losses: 3,
    ties: 4,
    gf: 65,
    ga: 14,
    winPct: 66.67,
    coach: "Paul Everett",
    notes: "Strong finish to season",
  },
  { season: 2023, wins: 13, losses: 5, ties: 3, gf: 61, ga: 17, winPct: 61.9, coach: "Paul Everett" },
  { season: 2022, wins: 6, losses: 8, ties: 5, gf: 24, ga: 20, winPct: 31.58, coach: "Paul Everett" },
  { season: 2021, wins: 11, losses: 6, ties: 3, gf: 70, ga: 28, winPct: 55.0, coach: "Paul Everett" },
  {
    season: 2020,
    wins: 5,
    losses: 5,
    ties: 2,
    gf: 24,
    ga: 18,
    winPct: 41.67,
    coach: "Paul Everett",
    notes: "COVID-shortened season",
  },
  { season: 2019, wins: 10, losses: 8, ties: 4, gf: 60, ga: 44, winPct: 45.45, coach: "Paul Everett" },
  {
    season: 2018,
    wins: 9,
    losses: 8,
    ties: 2,
    gf: 41,
    ga: 29,
    winPct: 47.37,
    coach: "Paul Everett",
    notes: "First season post-field renovation",
  },
  { season: 2017, wins: 6, losses: 13, ties: 2, gf: 43, ga: 68, winPct: 28.57, coach: "Paul Everett" },
  { season: 2016, wins: 9, losses: 8, ties: 3, gf: 60, ga: 56, winPct: 45.0, coach: "Paul Everett" },
  { season: 2015, wins: 7, losses: 14, ties: 0, gf: 42, ga: 85, winPct: 33.33, coach: "Paul Everett" },
  { season: 2014, wins: 12, losses: 7, ties: 4, gf: 52, ga: 36, winPct: 52.17, coach: "Paul Everett" },
  {
    season: 2013,
    wins: 16,
    losses: 7,
    ties: 1,
    gf: 96,
    ga: 29,
    winPct: 66.67,
    coach: "Paul Everett",
    notes: "Best season of the decade",
  },
  { season: 2012, wins: 10, losses: 7, ties: 2, gf: 61, ga: 36, winPct: 52.63, coach: "Paul Everett" },
  {
    season: 2011,
    wins: 13,
    losses: 7,
    ties: 1,
    gf: 68,
    ga: 35,
    winPct: 61.9,
    coach: "Paul Everett",
    notes: "Strong start to Paul Everett era",
  },
  { season: 2010, wins: 6, losses: 14, ties: 2, gf: 29, ga: 44, winPct: 27.27, coach: "Andy Montalbano" },
  {
    season: 2009,
    wins: 11,
    losses: 7,
    ties: 3,
    gf: 47,
    ga: 31,
    winPct: 52.38,
    coach: "Andy Montalbano",
    notes: "First season under lights at Akin Field",
  },
  { season: 2008, wins: 9, losses: 11, ties: 2, gf: 26, ga: 40, winPct: 40.91, coach: "Andy Montalbano" },
  { season: 2007, wins: 10, losses: 11, ties: 3, gf: 31, ga: 51, winPct: 41.67, coach: "Andy Montalbano" },
  { season: 2006, wins: 1, losses: 16, ties: 5, gf: 18, ga: 70, winPct: 4.55, coach: "Gary Ruhle" },
  {
    season: 2005,
    wins: 6,
    losses: 7,
    ties: 0,
    gf: 43,
    ga: 35,
    winPct: 46.15,
    coach: "Gary Ruhle",
    notes: "Program's first recorded season",
  },
]

export default function StatsPage() {
  const [sortBy, setSortBy] = useState<"season" | "wins" | "winPct">("season")

  const sorted = [...seasonStats].sort((a, b) => {
    if (sortBy === "season") return b.season - a.season
    if (sortBy === "wins") return b.wins - a.wins
    return b.winPct - a.winPct
  })

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Season Statistics</h1>
          <p className="text-lg opacity-90">Complete record of all boys varsity seasons from 2005 to present</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Program Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Total Seasons</p>
            <p className="text-3xl font-black text-primary">21</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Program Record</p>
            <p className="text-3xl font-black text-primary">204-172-55</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Win Percentage</p>
            <p className="text-3xl font-black text-primary">47.3%</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Goals For / Against</p>
            <p className="text-3xl font-black text-primary">1,048 / 797</p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setSortBy("season")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              sortBy === "season" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            By Year
          </button>
          <button
            onClick={() => setSortBy("wins")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              sortBy === "wins" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Most Wins
          </button>
          <button
            onClick={() => setSortBy("winPct")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              sortBy === "winPct" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Win %
          </button>
        </div>

        {/* Season Stats Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-black">Season</th>
                <th className="text-left py-4 px-4 font-semibold">Record</th>
                <th className="text-center py-4 px-4 font-semibold">Win %</th>
                <th className="text-center py-4 px-4 font-semibold">GF/GA</th>
                <th className="text-left py-4 px-4 font-semibold">Coach</th>
                <th className="text-left py-4 px-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((stat, idx) => (
                <tr
                  key={stat.season}
                  className={`border-b border-border/50 ${
                    idx % 2 === 0 ? "bg-muted/30" : ""
                  } hover:bg-muted/50 transition-colors`}
                >
                  <td className="py-4 px-4 font-black text-primary">{stat.season}</td>
                  <td className="py-4 px-4 font-semibold">
                    {stat.wins}-{stat.losses}-{stat.ties}
                  </td>
                  <td className="py-4 px-4 text-center font-semibold">{stat.winPct.toFixed(1)}%</td>
                  <td className="py-4 px-4 text-center text-sm">
                    <span className="font-semibold text-green-600">{stat.gf}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="font-semibold text-red-600">{stat.ga}</span>
                  </td>
                  <td className="py-4 px-4 text-sm">{stat.coach}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground italic">{stat.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </main>
  )
}
