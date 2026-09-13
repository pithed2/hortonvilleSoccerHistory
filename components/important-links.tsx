import { ArrowUpRight, CalendarDays, GraduationCap, MessageCircle, Trophy } from "lucide-react"

const links = [
  {
    name: "SportsYou",
    description: "Team messages, calendars, and updates. Ask your coach for the access code.",
    href: "https://sportsyou.com/teams/te-fa383711-1dd1-407b-bbb0-a479a47d144a",
    icon: MessageCircle,
  },
  {
    name: "Hortonville Area School District",
    description: "District news, school information, and family resources.",
    href: "https://www.hasd.org/",
    icon: GraduationCap,
  },
  {
    name: "HASD Boys Soccer",
    description: "The district’s official Boys Soccer page.",
    href: "https://hortonvillesd.cms4schools.net/activities-athletics/athletics/boys-soccer.cfm",
    icon: Trophy,
  },
  {
    name: "Arbiter Scheduling",
    description: "School athletic schedules and event information.",
    href: "https://www.arbiterlive.com/Teams?entityId=10492",
    icon: CalendarDays,
  },
]

export function ImportantLinks() {
  return (
    <section id="important-links" aria-labelledby="important-links-title" className="scroll-mt-16 border-b bg-muted/20 py-10 sm:py-12">
      <div className="site-container">
        <div className="section-heading">
          <div><p className="section-eyebrow">For players &amp; families</p><h2 id="important-links-title" className="section-title">Important links</h2></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {links.map(({ name, description, href, icon: Icon }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="surface-card-interactive group flex flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
              <div className="flex items-center justify-between"><Icon className="size-6 text-primary" aria-hidden="true" /><ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></div>
              <h3 className="mt-5 text-lg font-bold">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
