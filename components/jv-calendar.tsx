import calendar from "@/data/jv/calendar.json"
import { isJvConferenceOpponent } from "@/lib/jv-conference.mjs"

export function JvCalendar({ teams }: { teams: string[] }) {
  const events = calendar.events.filter(event => teams.includes(event.team))
  const months = [...new Set(events.map(event => event.date.slice(0, 7)))]
  return <section id="calendar" className="surface-card scroll-mt-36 p-5 sm:p-7">
    <p className="section-eyebrow">2026 season</p><h2 className="text-2xl font-black">Team calendar</h2>
    <p className="mt-2 text-sm text-muted-foreground">All times Central.</p>
    {months.map(month => <div key={month} className="mt-7">
      <h3 className="mb-3 text-lg font-bold">{new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T12:00:00Z`))}</h3>
      <ul className="divide-y rounded-xl border">{events.filter(event => event.date.startsWith(month)).map(event => <li key={event.id} className="grid gap-2 p-4 sm:grid-cols-[130px_1fr]">
        <div><p className="font-bold">{new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${event.date}T12:00:00Z`))}</p><p className="text-sm text-muted-foreground">{event.time}</p></div>
        <div><p className="text-xs font-bold text-primary">{event.team}{isJvConferenceOpponent(event.opponent) ? " · Conference" : ""}</p><p className="font-bold">{event.home ? "vs." : "at"} {event.opponent}</p><p className="text-sm text-muted-foreground">{event.home ? "Home" : "Away"}{event.location ? ` · ${event.location}` : ""}</p>{event.bus ? <p className="text-xs text-muted-foreground">Bus loads: {event.bus}</p> : null}</div>
      </li>)}</ul>
    </div>)}
    {!events.length ? <p className="mt-5 text-muted-foreground">No games scheduled.</p> : null}
  </section>
}
