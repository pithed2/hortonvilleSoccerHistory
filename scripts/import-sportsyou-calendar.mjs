import fs from "node:fs"
import path from "node:path"

// Accept only explicit team game titles. Personal events are never imported.
export function parseTeamCalendar(ics) {
  if (!ics.includes("BEGIN:VCALENDAR")) throw new Error("Expected an iCalendar feed")
  const events = new Map()
  const decode = value => value.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1")
  for (const block of ics.replace(/\r?\n[ \t]/g, "").split("BEGIN:VEVENT").slice(1)) {
    const fields = Object.fromEntries(block.split(/\r?\n/).filter(line => line.includes(":")).map(line => { const i=line.indexOf(":");return [line.slice(0,i),decode(line.slice(i+1))] }))
    const match = fields.SUMMARY?.match(/^Boys Soccer - (Varsity|JV Red|JV White|JV Black|JV Gray) (at|vs) (.+)$/)
    if (!match || fields.STATUS === "CANCELLED") continue
    if (fields.RRULE) throw new Error("Recurring team games require recurrence expansion")
    const stamp=fields.DTSTART?.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
    if (!stamp) throw new Error("Expected UTC start time for team game")
    const [,y,m,d,h,min,s]=stamp
    const start=`${y}-${m}-${d}T${h}:${min}:${s}Z`
    const date=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Chicago",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(start))
    const time=new Intl.DateTimeFormat("en-US",{timeZone:"America/Chicago",hour:"numeric",minute:"2-digit"}).format(new Date(start))
    const [,team,side,opponent]=match
    const key=`${team}|${start}|${opponent.toLowerCase()}`
    events.set(key,{id:fields.UID,team,opponent,date,time,start,home:side==="vs",location:fields.LOCATION || "",bus:fields.DESCRIPTION?.match(/Bus loads?:\s*([^\n]+)/i)?.[1] || null})
  }
  return [...events.values()].sort((a,b)=>a.start.localeCompare(b.start)||a.team.localeCompare(b.team))
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/(\w:)/,"$1"))) {
  const input=process.argv[2]
  const url=process.env.SPORTSYOU_CALENDAR_URL
  let text
  if(input) text=fs.readFileSync(input,"utf8")
  else { if(!url) throw new Error("Provide an ICS file or SPORTSYOU_CALENDAR_URL"); const response=await fetch(url); if(!response.ok) throw new Error(`Calendar HTTP ${response.status}`); text=await response.text() }
  const events=parseTeamCalendar(text)
  if (!events.length) throw new Error("No team games found; existing calendar preserved")
  fs.writeFileSync("data/jv/calendar.json",JSON.stringify({events},null,2)+"\n")
  console.log(`Imported ${events.length} team games. Personal events and the duplicate JV Red calendar are excluded.`)
}
