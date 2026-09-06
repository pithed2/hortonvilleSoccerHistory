import { ChevronDown } from "lucide-react"
import type { RosterPlayer, VarsitySeasonHistory } from "@/lib/player-stats"

const fieldStats = [["gp", "Games"], ["goals", "Goals"], ["assists", "Assists"], ["points", "Points"], ["minutes", "Minutes"], ["pk", "PK goals"], ["gwg", "Game winners"]] as const
const keeperStats = [["gp", "Games"], ["minutes", "Minutes"], ["saves", "Saves"], ["ga", "Goals against"], ["save_pct", "Save %"], ["gaa", "GAA"], ["pksv", "PK saves"]] as const

function StatGrid({ row, fields }: { row: Record<string, string>; fields: readonly (readonly [string, string])[] }) {
  return <dl className="mt-2 grid grid-cols-3 gap-2">
    {fields.map(([key, label]) => <div key={key} className="rounded-lg bg-muted/50 p-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-bold tabular-nums">{row[key]?.trim() ? key === "save_pct" ? `${(Number(row[key]) * 100).toFixed(1)}%` : row[key] : "—"}</dd>
    </div>)}
  </dl>
}

export function VarsityRosterCard({ player, history }: { player: RosterPlayer; history: VarsitySeasonHistory[] }) {
  const totals = (kind: "stats" | "goalkeeper", keys: string[]) => Object.fromEntries(keys.map(key => {
    const values = history.map(season => season[kind]?.[key]).filter((value): value is string => !!value?.trim() && Number.isFinite(Number(value)))
    return [key, values.length ? String(Number(values.reduce((sum, value) => sum + Number(value), 0).toFixed(2))) : ""]
  }))
  const scoringTotals = totals("stats", ["gp", "goals", "assists", "points"])
  const goalkeepingTotals = totals("goalkeeper", ["saves", "minutes", "ga"])
  return <details className="group min-w-0 self-start rounded-xl border bg-card open:border-primary/40">
    <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-4 focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-black text-primary">{player.number || "-"}</span>
      <span className="min-w-0 flex-1"><span className="block font-bold">{player.player_name}</span><span className="block text-sm text-muted-foreground">{[player.class, player.position].filter(Boolean).join(" / ") || "Rostered player"}</span><span className="mt-1 block text-xs font-semibold text-primary">Varsity season stats · {history.length} {history.length === 1 ? "season" : "seasons"}</span></span>
      <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
    </summary>
    <div className="space-y-5 border-t p-4">
      <section aria-label={`${player.player_name} varsity career totals`} className="rounded-xl border border-primary/20 bg-primary/5 p-3">
        <h3 className="font-black text-primary">Varsity career totals</h3>
        {history.some(season => season.stats) ? <StatGrid row={scoringTotals} fields={fieldStats.slice(0, 4)} /> : null}
        {history.some(season => season.goalkeeper) ? <><h4 className="mt-3 text-sm font-bold">Goalkeeping totals</h4><StatGrid row={goalkeepingTotals} fields={[["saves", "Saves"], ["minutes", "Minutes"], ["ga", "Goals against"]]} /></> : null}
        <p className="mt-2 text-xs text-muted-foreground">Totals include recorded statistics only; missing seasons or values are excluded.</p>
      </section>
      {history.map(({ season, stats, goalkeeper }) => <section key={season} aria-label={`${player.player_name} ${season} statistics`}>
        <h3 className="font-black text-primary">{season} season</h3>
        {stats ? <StatGrid row={stats} fields={fieldStats} /> : !goalkeeper ? <p className="mt-2 text-sm text-muted-foreground">Rostered this season; statistics not yet available.</p> : null}
        {goalkeeper ? <><h4 className="mt-3 text-sm font-bold">Goalkeeping</h4><StatGrid row={goalkeeper} fields={keeperStats} />{goalkeeper.source_note ? <p className="mt-2 text-xs text-muted-foreground">{goalkeeper.source_note}</p> : null}</> : null}
      </section>)}
      <p className="text-xs text-muted-foreground">— = not recorded. Documented varsity seasons shown, newest first.</p>
    </div>
  </details>
}
