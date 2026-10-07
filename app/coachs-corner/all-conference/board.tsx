"use client"

import { useEffect, useState } from "react"
import type snapshot from "@/data/coachs-corner/all-conference-2026.json"
import type conferenceStandings from "@/data/coachs-corner/fva-conference-2026.json"

type Scope = "conference" | "overall"
type Metric = "goals" | "assists" | "points"
type Nomination = { id: string; name: string; team: string; role: string; tier: string; notes: string }
const storageKey = "hortonville-fva-nominations-2026-v1"
const tiers = ["Watch list", "1st team", "2nd team", "Honorable mention"]
const fieldClass = "rounded-lg border bg-white px-3 py-2 text-sm"

export function AllConferenceBoard({ data, standings }: { data: typeof snapshot; standings: typeof conferenceStandings }) {
  const [scope, setScope] = useState<Scope>("conference")
  const [metric, setMetric] = useState<Metric>("points")
  const [team, setTeam] = useState("All teams")
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [ready, setReady] = useState(false)
  const [storageMessage, setStorageMessage] = useState("Loading saved nominations…")
  const [manualName, setManualName] = useState("")
  const [manualTeam, setManualTeam] = useState("Hortonville")
  const teams = data.coverage.map(row => row.team)
  useEffect(() => {
    // Load the browser draft after hydration; never read storage during server rendering.
    const frame = requestAnimationFrame(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]")
      if (!Array.isArray(saved) || !saved.every(row => row && ["id", "name", "team", "role", "tier", "notes"].every(key => typeof row[key] === "string") && tiers.includes(row.tier))) throw new Error("Invalid saved draft")
      setNominations(saved)
      setStorageMessage("Draft saved in this browser only. Export a copy to share or keep a backup.")
    } catch {
      setStorageMessage("Saved draft could not be loaded. New changes will attempt to save in this browser; export a backup.")
    }
    setReady(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  function save(next: Nomination[]) {
    setNominations(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      setStorageMessage("Draft saved in this browser only. Export a copy to share or keep a backup.")
    } catch {
      setStorageMessage("Browser storage is unavailable. This draft lasts until you leave the page; export it to keep a copy.")
    }
  }
  function add(id: string, name: string, school: string) {
    if (nominations.some(row => row.id === id)) return
    save([...nominations, { id, name, team: school, role: "Unconfirmed", tier: "Watch list", notes: "" }])
  }
  function update(id: string, change: Partial<Nomination>) {
    save(nominations.map(row => row.id === id ? { ...row, ...change } : row))
  }
  function exportDraft() {
    const quote = (value: string) => `"${value.replace(/"/g, '""')}"`
    const csv = [["Player", "Team", "Role", "Proposed recognition", "Coach notes"], ...nominations.map(row => [row.name, row.team, row.role, row.tier, row.notes])].map(row => row.map(value => quote(/^[=+@\-\t\r]/.test(value) ? `'${value}` : value)).join(",")).join("\r\n")
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "FVA-All-Conference-2026-draft.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  // Rank across the reporting conference before narrowing to one school.
  const ranked = data.players.flatMap(player => {
    const stats = player[scope]
    return stats && stats[metric] > 0 ? [{ ...player, stats }] : []
  })
    .sort((a, b) => b.stats[metric] - a.stats[metric] || a.name.localeCompare(b.name))
    .map((player, _index, rows) => ({ ...player, rank: rows.findIndex(row => row.stats[metric] === player.stats[metric]) + 1 }))
  const visible = ranked.filter(row => team === "All teams" || row.team === team)
  const teamRecords = [...standings.standings].sort((a, b) => (3 * b.W + b.T) - (3 * a.W + a.T) || a.Team.localeCompare(b.Team))

  return <div className="site-container space-y-8 py-8">
    <section className="grid gap-4 md:grid-cols-3">
      <div className="surface-card p-5"><p className="text-sm text-muted-foreground">Individual stat coverage</p><p className="mt-2 text-3xl font-black">5 / 10 teams</p><p className="mt-2 text-sm">Missing stats keep players in consideration. Zero scoring totals do not measure defensive impact.</p></div>
      <div className="surface-card p-5"><p className="text-sm text-muted-foreground">Conference evidence first</p><p className="mt-2 font-bold">Goals · Assists · Points</p><p className="mt-2 text-sm">Overall production adds context. Points = 2 × goals + assists. Tied players share the same rank.</p></div>
      <div className="surface-card p-5"><p className="text-sm text-muted-foreground">Coach review</p><p className="mt-2 font-bold">Team finish + individual impact</p><p className="mt-2 text-sm">Give stronger teams a deeper nomination review. Include defenders, midfielders and keepers alongside scoring leaders.</p></div>
    </section>

    <section aria-labelledby="leaders-title"><h2 id="leaders-title" className="text-2xl font-bold">FVA leaders</h2>
      <p className="mt-2 text-sm text-muted-foreground">Leaders among reporting teams. These dated totals are a starting point for nominations, not official selections.</p>
      <div className="my-4 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">Games<select className={fieldClass} value={scope} onChange={e => setScope(e.target.value as Scope)}><option value="conference">Conference only</option><option value="overall">Overall</option></select></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Rank by<select className={fieldClass} value={metric} onChange={e => setMetric(e.target.value as Metric)}><option value="goals">Goals</option><option value="assists">Assists</option><option value="points">Points</option></select></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">School<select className={fieldClass} value={team} onChange={e => setTeam(e.target.value)}><option>All teams</option>{teams.map(name => <option key={name}>{name}</option>)}</select></label>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><caption className="sr-only">{scope === "conference" ? "Conference" : "Overall"} leaders ranked by {metric}</caption><thead><tr className="border-b bg-neutral-50">{["Rank", "Player", "School", "G", "A", "Pts", "Review"].map(label => <th scope="col" key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{visible.map(player => <tr className={`border-b ${player.team === "Hortonville" ? "bg-red-50/60" : ""}`} key={player.id}><td className="p-3">{player.rank}</td><th scope="row" className="p-3">{player.name}</th><td className="p-3">{player.team}</td><td className={`p-3 ${metric === "goals" ? "font-bold" : ""}`}>{player.stats.goals}</td><td className={`p-3 ${metric === "assists" ? "font-bold" : ""}`}>{player.stats.assists}</td><td className={`p-3 ${metric === "points" ? "font-bold" : ""}`}>{player.stats.points}</td><td className="p-3"><button disabled={!ready || nominations.some(row => row.id === player.id)} className="font-semibold text-primary underline disabled:text-muted-foreground disabled:no-underline" onClick={() => add(player.id, player.name, player.team)} aria-label={`Add ${player.name} to nomination board`}>{nominations.some(row => row.id === player.id) ? "On board" : "Add to board"}</button></td></tr>)}</tbody></table>{visible.length === 0 && <p className="p-5 text-muted-foreground">{data.coverage.find(row => row.team === team)?.available === false ? "Individual stats unavailable for this school. Add candidates manually below." : "No positive totals for this selection."}</p>}</div>
    </section>

    <section aria-labelledby="context-title"><h2 id="context-title" className="text-2xl font-bold">Team success and representation</h2><p className="mt-2 max-w-4xl text-sm leading-relaxed">Your planning principle: teams finishing higher in the FVA generally warrant more 1st- and 2nd-team candidates. Use final conference finish to guide how deeply to review each roster, then weigh role, consistency, head-to-head impact and coach evaluations. No fixed school quotas or automatic selections are applied; the FVA selection rules and team sizes still need confirmation.</p>
      <p className="mt-3 text-sm text-muted-foreground">Saved standings snapshot: {standings.updated}. Ordered by 3 points per win, 1 per draw for discussion; games played differ and this is not the final conference order.</p>
      <div className="mt-4 overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead><tr className="border-b">{["School", "W–L–T", "GP", "Table pts", "Stat coverage", "1st / 2nd draft"].map(label => <th scope="col" key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{teamRecords.map(row => <tr key={row.Team} className="border-b"><th scope="row" className="p-3">{row.Team}</th><td className="p-3">{row.W}–{row.L}–{row.T}</td><td className="p-3">{row.W + row.L + row.T}</td><td className="p-3">{row.W * 3 + row.T}</td><td className="p-3">{data.coverage.find(c => c.team === row.Team)?.available ? "Available" : "Missing — request nominations"}</td><td className="p-3">{nominations.filter(n => n.team === row.Team && n.tier === "1st team").length} / {nominations.filter(n => n.team === row.Team && n.tier === "2nd team").length}</td></tr>)}</tbody></table></div>
    </section>

    <section aria-labelledby="board-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="board-title" className="text-2xl font-bold">Working nomination board</h2><button className={fieldClass} disabled={!ready || nominations.length === 0} onClick={exportDraft}>Export draft CSV</button></div><p role="status" className="mt-2 text-sm text-muted-foreground">{storageMessage}</p>
      <form className="my-4 flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); const name = manualName.trim(); if (name) { add(`${manualTeam}|${name}`, name, manualTeam); setManualName("") } }}>
        <label className="flex flex-col gap-1 text-sm font-semibold">Player name<input required maxLength={100} className={fieldClass} value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Add any candidate" /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">School<select className={fieldClass} value={manualTeam} onChange={e => setManualTeam(e.target.value)}>{teams.map(name => <option key={name}>{name}</option>)}</select></label><button disabled={!ready} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Add candidate</button>
      </form><p className="mb-4 text-sm text-muted-foreground">Add players from all ten schools, including defenders and goalkeepers. Enter proposed recognition and evidence; no players are preselected.</p>
      <div className="grid gap-4 md:grid-cols-2">{nominations.map(row => <article className="surface-card space-y-3 p-5" key={row.id}><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{row.name}</h3><p className="text-sm text-muted-foreground">{row.team}</p></div><button className="text-sm text-primary underline" aria-label={`Remove ${row.name} from board`} onClick={() => save(nominations.filter(n => n.id !== row.id))}>Remove</button></div><div className="flex flex-wrap gap-3"><label className="flex flex-col gap-1 text-sm">Proposed recognition<select className={fieldClass} value={row.tier} onChange={e => update(row.id, { tier: e.target.value })}>{tiers.map(tier => <option key={tier}>{tier}</option>)}</select></label><label className="flex flex-col gap-1 text-sm">Role<select className={fieldClass} value={row.role} onChange={e => update(row.id, { role: e.target.value })}>{["Unconfirmed", "Forward", "Midfielder", "Defender", "Goalkeeper"].map(role => <option key={role}>{role}</option>)}</select></label></div><label className="flex flex-col gap-1 text-sm">Coach evidence<textarea className={`${fieldClass} min-h-24 w-full`} maxLength={3000} value={row.notes} onChange={e => update(row.id, { notes: e.target.value })} placeholder="Conference impact, defensive assignments, leadership, head-to-head observations…" /></label></article>)}</div>{nominations.length === 0 && <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Start with the leaders above or add a candidate manually.</p>}
    </section>

    <details className="surface-card p-5"><summary className="cursor-pointer font-bold">Coverage, sources and refresh notes</summary><p className="mt-3 text-sm">Static snapshot checked {data.checkedAt}; available results through {data.resultsThrough}. Hortonville totals are updated through October 6; conference totals sum nine FVA box scores and reconcile with its published overall scoring totals. Bound totals use each school’s season and conference filters. Reporting completeness varies; missing stats are unknown. Goalkeeper reporting needs reconciliation before comparative rankings are added.</p><ul className="mt-4 space-y-2 text-sm">{data.coverage.map(row => <li key={row.team}><span className="font-semibold">{row.team}</span> · {row.available ? "Individual stats available" : "Individual stats missing"} · <a className="text-primary underline" href={row.conferenceSource} target="_blank" rel="noreferrer">Conference source</a> · <a className="text-primary underline" href={row.source} target="_blank" rel="noreferrer">Overall source</a></li>)}</ul><p className="mt-4 text-sm">Standings: <a className="text-primary underline" href={standings.source} target="_blank" rel="noreferrer">StatsPlus snapshot</a>. {standings.notes}</p><p className="mt-3 text-sm text-muted-foreground">Refresh the stat snapshot and standings when new results arrive; the board does not fetch live totals. Confirm final standings, positional requirements, selection sizes and voting rules before the meeting.</p></details>
  </div>
}
