"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { shiftDate, weekStart, weeklyMatchups, type WeeklyData } from "@/lib/coach-weekly"

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))
}

export function OnTap({ data, today }: { data: WeeklyData; today: string }) {
  const currentWeek = weekStart(today)
  const [start, setStart] = useState(currentWeek)
  const sections = weeklyMatchups(data, start)
  return (
    <details className="mb-8 overflow-hidden rounded-2xl border bg-white" open>
      <summary className="cursor-pointer list-none p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">The week’s matchups</p>
            <h2 className="mt-1 text-2xl font-bold">On tap this week</h2>
            <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">{dateLabel(start)} – {dateLabel(shiftDate(start, 6))}, {start.slice(0, 4)}</p>
          </div>
          <span className="shrink-0 self-center text-xs font-bold uppercase tracking-wide text-muted-foreground">Tap to collapse</span>
        </div>
      </summary>
      <div className="border-t px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setStart(shiftDate(start, -7))}>Previous week</Button>
          <Button variant="outline" size="sm" onClick={() => setStart(currentWeek)} disabled={start === currentWeek}>This week</Button>
          <Button variant="outline" size="sm" onClick={() => setStart(shiftDate(start, 7))}>Next week</Button>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Sunday–Saturday · Winning record means more wins than losses. Highlights stay listed after scores are entered. Records reflect the latest saved data; opponents without a known record aren’t classified as key matchups. FVA key matchups require a winning conference (FVA-only) record for at least one side.</p>
        <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
          {sections.map(section => (
            <section key={section.title} className={`overflow-hidden rounded-xl border ${section.isFva ? "lg:col-span-2" : ""}`}>
              <div className="border-b bg-neutral-50 px-4 py-3"><h3 className="font-bold">{section.title}</h3><p className="text-xs text-muted-foreground">{section.detail}</p></div>
              {section.games.length ? <ul className="divide-y">{section.games.map(game => (
                <li key={[game.Date, game.Team, game.Opponent].join("|")} className={`flex flex-wrap items-center justify-between gap-3 p-4 ${game.Team === "Hortonville" || game.Opponent === "Hortonville" ? "bg-red-50/60" : ""}`}>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground"><time dateTime={game.Date}>{dateLabel(game.Date)}</time> · {game.Location === "H" ? "Home" : game.Location === "N" ? "Neutral site" : "Away"} for {game.Team}</p>
                    <p className="mt-1 font-semibold">{game.Team} <span className="font-normal text-muted-foreground">{game.Location === "A" ? "at" : "vs."}</span> {game.Opponent}</p>
                    {game.teamRecord && <p className="mt-1 text-xs text-muted-foreground">{game.Team} (FVA): {game.teamRecord.W}–{game.teamRecord.L}–{game.teamRecord.T}</p>}
                    {game.opponentRecord && <p className="mt-1 text-xs text-muted-foreground">{game.Opponent}{game.teamRecord ? " (FVA)" : ""}: {game.opponentRecord.W}–{game.opponentRecord.L}–{game.opponentRecord.T}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${game.Result ? "bg-neutral-900 text-white" : "bg-sky-50 text-sky-900"}`}>
                    {game.Result ? `${game.Result === "D" ? "T" : game.Result} ${game.Score ?? "Score pending"} · Final` : game.Date < today ? "Result pending" : "Scheduled"}
                  </span>
                </li>
              ))}</ul> : <p className="p-4 text-sm text-muted-foreground">No qualifying matches scheduled this week.</p>}
            </section>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Results are shown from the first team’s perspective and update with the saved schedule.</p>
      </div>
    </details>
  )
}
