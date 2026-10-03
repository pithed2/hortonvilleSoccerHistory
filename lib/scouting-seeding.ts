export type Fixture = { date: string; a: string; b: string; ga: number; gb: number; status: string; fixtureId?: string }
export type SeedTeam = { id: string; name: string; rating: number | null; sos: number; sourceRecord: { w: number; l: number; d: number; gf: number; ga: number } }
export function normalizeFixtures(matches: Fixture[], cutoff: string) {
  const seen = new Map<string, Fixture>()
  for (const m of matches) {
    if (m.status !== "final") continue
    if (!/^\d{4}-\d{2}-\d{2}$/.test(m.date) || Number.isNaN(Date.parse(m.date)) || new Date(m.date).toISOString().slice(0,10) !== m.date || m.a === m.b || !m.a || !m.b || !Number.isInteger(m.ga) || !Number.isInteger(m.gb) || m.ga < 0 || m.gb < 0) throw new Error("Invalid completed match")
    if (m.date > cutoff) continue
    const row = m.a < m.b ? m : { ...m, a: m.b, b: m.a, ga: m.gb, gb: m.ga }
    const key = `${row.date}|${row.a}|${row.b}|${row.fixtureId ?? ""}`
    const old = seen.get(key)
    if (old && (old.ga !== row.ga || old.gb !== row.gb)) throw new Error(`Conflicting scores: ${key}`)
    seen.set(key, row)
  }
  return [...seen.values()].sort((a,b)=>a.date.localeCompare(b.date))
}
export function matchRecord(id: string, matches: Fixture[]) {
  let w=0,l=0,d=0,gf=0,ga=0
  for (const m of matches) {
    if (m.a !== id && m.b !== id) continue
    const scored=m.a===id?m.ga:m.gb, conceded=m.a===id?m.gb:m.ga
    gf+=scored; ga+=conceded
    if(scored>conceded) w++; else if(scored<conceded) l++; else d++
  }
  return {w,l,d,gf,ga,ppg:w+l+d?(3*w+d)/(w+l+d):null}
}
export function reviewSeeding(teams: SeedTeam[], matches: Fixture[], cutoff: string) {
  if (new Set(teams.map(t=>t.id)).size !== teams.length) throw new Error("Duplicate team IDs")
  const finals=normalizeFixtures(matches,cutoff)
  const baseline=[...teams].sort((a,b)=>(Number.isFinite(b.rating)?b.rating!:-Infinity)-(Number.isFinite(a.rating)?a.rating!:-Infinity)||a.name.localeCompare(b.name))
  const records=baseline.map(t=>{
    const record=matchRecord(t.id,finals)
    const keys=['w','l','d','gf','ga'] as const
    return {...t,record,reconciled:keys.every(key=>record[key]===t.sourceRecord[key])}
  })
  const pairs=baseline.flatMap((a,i)=>baseline.slice(i+1).map(b=>{
    const opponents=(id:string)=>new Set(finals.filter(m=>m.a===id||m.b===id).map(m=>m.a===id?m.b:m.a))
    const bo=opponents(b.id)
    const common=[...opponents(a.id)].filter(o=>o!==b.id&&o!==a.id&&bo.has(o)).sort().map(opponent=>{
      const fixtures=(id:string)=>finals.filter(m=>(m.a===id&&m.b===opponent)||(m.b===id&&m.a===opponent))
      return {opponent,a:matchRecord(a.id,fixtures(a.id)),b:matchRecord(b.id,fixtures(b.id)),aScores:fixtures(a.id),bScores:fixtures(b.id)}
    })
    const direct=finals.filter(m=>(m.a===a.id&&m.b===b.id)||(m.b===a.id&&m.a===b.id))
    const h2h=matchRecord(a.id,direct)
    const delta=common.length?common.reduce((s,c)=>s+c.a.ppg!-c.b.ppg!,0)/common.length:null
    return {a:a.id,b:b.id,direct,h2h,common,delta,flags:[...(h2h.l>h2h.w?['Head-to-head favors the lower-rated team']:[]),...(delta!==null&&delta<0?['Common-opponent outcomes favor the lower-rated team']:[]),...(!Number.isFinite(a.rating)||!Number.isFinite(b.rating)?['Missing rating; review required']:[]),...(a.rating===b.rating?['Equal ratings; alphabetical order is display only']:[])]}
  }))
  return {records,pairs}
}
