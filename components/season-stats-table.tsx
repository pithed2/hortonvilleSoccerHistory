"use client"

import { useMemo, useState } from "react"
import type { SeasonRow } from "@/lib/types"
import Link from "next/link"
import { EmptyState } from "@/components/archive-ui"

type SortKey = "season" | "wins" | "winPct"

export function SeasonStatsTable({ rows }: { rows: SeasonRow[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("season")

  const sorted = useMemo(() => {
    const copy = [...rows]
    if (sortBy === "season") copy.sort((a, b) => b.season_year - a.season_year)
    else if (sortBy === "wins") copy.sort((a, b) => b.wins - a.wins || b.season_year - a.season_year)
    else copy.sort((a, b) => b.winPct - a.winPct || b.season_year - a.season_year)
    return copy
  }, [rows, sortBy])

  const sortButton = (key: SortKey, label: string) => (
    <button
      onClick={() => setSortBy(key)}
      className={`min-h-11 rounded-lg px-4 py-2 font-semibold transition-colors ${
        sortBy === key ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
      }`}
    >
      {label}
    </button>
  )

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-4">
        {sortButton("season", "By Year")}
        {sortButton("wins", "Most Wins")}
        {sortButton("winPct", "Win %")}
      </div>

      <div className="archive-table-wrap">
        {rows.length === 0 ? (
          <EmptyState title="No season data found" description={<>Check that <code>public/data/games.csv</code> exists and has rows.</>} />
        ) : (
          <table className="archive-table min-w-[760px]">
            <caption className="sr-only">Season-by-season team records, goals, coaches, and achievements</caption>
            <thead className="bg-muted/60">
              <tr className="border-b border-border">
                <th scope="col" className="text-left py-4 px-4 font-black">Season</th>
                <th scope="col" className="text-left py-4 px-4 font-semibold">Record</th>
                <th scope="col" className="text-center py-4 px-4 font-semibold">Win %</th>
                <th scope="col" className="text-center py-4 px-4 font-semibold">GF/GA</th>
                <th scope="col" className="text-left py-4 px-4 font-semibold">Coach</th>
                <th scope="col" className="text-left py-4 px-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => (
                <tr
                  key={row.season_year}
                  className={`border-b border-border/50 ${idx % 2 === 0 ? "bg-muted/30" : ""} hover:bg-muted/50 transition-colors`}
                >
                  <td className="py-4 px-4 font-black text-primary">
                    <Link href={`/seasons/${row.season_year}`} className="text-link">
                      {row.season_year}
                    </Link>
                  </td>
                  <td className="py-4 px-4 font-semibold">
                    {row.played ? `${row.wins}-${row.losses}-${row.ties}` : "Incomplete"}
                  </td>
                  <td className="py-4 px-4 text-center font-semibold">{row.played ? `${row.winPct.toFixed(1)}%` : "-"}</td>
                  <td className="py-4 px-4 text-center text-sm">
                    <span className="font-semibold">{row.played ? row.gf : "-"}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="font-semibold">{row.played ? row.ga : "-"}</span>
                  </td>
                  <td className="py-4 px-4 text-sm">{row.coach || "-"}</td>
                  <td className="py-4 px-4 text-sm text-foreground/75">{row.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
