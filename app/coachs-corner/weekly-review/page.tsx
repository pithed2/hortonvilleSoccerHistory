import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { COACH_COOKIE, validCoachCookie } from "@/lib/coach-auth"
import { getWeeklyReview, weeklyReviews } from "@/lib/weekly-reviews"
import { CoachLogin } from "../login"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Weekly Update Review | Coach’s Corner",
  robots: { index: false, follow: false, nocache: true },
}

export default async function WeeklyReviewPage({ searchParams }: { searchParams: Promise<{ version?: string }> }) {
  const jar = await cookies()
  if (!validCoachCookie(jar.get(COACH_COOKIE)?.value)) return <><Navigation /><CoachLogin /></>
  const { version } = await searchParams
  const review = version ? getWeeklyReview(version) : weeklyReviews[0]
  if (!review) notFound()

  return <><Navigation /><main className="min-h-screen bg-[#f7f7f5] pb-16">
    <header className="bg-neutral-950 text-white">
      <div className="site-container py-10 sm:py-14">
        <Link href="/coachs-corner" className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white"><ArrowLeft className="size-4" />Coach’s Corner</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-red-400">Hortonville Polar Bears · Version {review.version}</p>
        <h1 className="mt-3 text-3xl font-black sm:text-5xl">Weekly Update Review</h1>
        <p className="mt-3 text-lg text-white/80">{review.title}</p>
        <p className="mt-2 text-sm text-white/60">By {review.author}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a href={`/coachs-corner/weekly-review/${review.id}/download`} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-neutral-950 hover:bg-neutral-200"><Download className="size-4" />Download Word document</a>
          <span className="text-sm text-white/60">Added {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${review.published}T12:00:00Z`))}</span>
        </div>
      </div>
    </header>
    <div className="site-container space-y-8 py-8">
      <section aria-label="Review periods" className="grid gap-4 sm:grid-cols-2">
        <div className="surface-card p-5"><p className="section-eyebrow">Results reviewed</p><p className="mt-2 font-bold">{review.resultsPeriod}</p></div>
        <div className="surface-card p-5"><p className="section-eyebrow">Week ahead</p><p className="mt-2 font-bold">{review.upcomingPeriod}</p></div>
      </section>
      <nav aria-label="Weekly review sections" className="flex flex-wrap gap-2">
        {[["overview", "Hortonville overview"], ["key-games", "Key games"], ...review.sections.map((s, i) => [`region-${i}`, s.title]), ["versions", "Versions"]].map(([id, title]) => <a key={id} href={`#${id}`} className="rounded-full border bg-white px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary">{title}</a>)}
      </nav>
      <section id="overview" className="surface-card scroll-mt-24 border-t-4 border-t-primary p-6 sm:p-8">
        <h2 className="text-2xl font-black">{review.overview[0]}</h2>
        <div className="mt-5 max-w-4xl space-y-4 text-base leading-relaxed">{review.overview.slice(1).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
      </section>
      <section id="key-games" className="scroll-mt-24">
        <p className="section-eyebrow">In order, Tuesday through Saturday</p><h2 className="mt-2 text-2xl font-black">Key Games This Week</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">{review.games.map((game, i) => <article key={i} className="surface-card p-6"><p className="text-xs font-bold tracking-wide text-primary">{game.when}</p><h3 className="mt-2 text-lg font-bold">{game.matchup}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{game.review}</p></article>)}</div>
      </section>
      {review.sections.map((section, i) => <section key={section.title} id={`region-${i}`} className="scroll-mt-24">
        <h2 className="text-2xl font-black">{section.title}</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">{section.rows.map((row, j) => <article key={j} className="surface-card p-6">
          <div className="flex items-start justify-between gap-4"><h3 className="text-lg font-bold">{row[0]}</h3><div className="shrink-0 rounded-lg bg-primary/10 px-3 py-2 text-center"><p className="text-[10px] font-bold uppercase text-muted-foreground">{review.recordLabel}</p><p className="font-black text-primary">{row[2]}</p></div></div>
          <p className="mt-4 leading-relaxed">{row[1]}</p>
          <div className="mt-5 border-t pt-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Coming up</p><p className="mt-2 text-sm leading-relaxed">{row[3]}</p></div>
        </article>)}</div>
      </section>)}
      {review.sourceNote && <p className="text-sm leading-relaxed text-muted-foreground">{review.sourceNote}</p>}
      <section id="versions" className="surface-card scroll-mt-24 p-6">
        <h2 className="text-xl font-black">Review versions</h2>
        <p className="mt-2 text-sm text-muted-foreground">Read previous updates or download their original documents.</p>
        <ul className="mt-5 divide-y">{weeklyReviews.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <Link href={`/coachs-corner/weekly-review?version=${item.id}`} aria-current={item.id === review.id ? "page" : undefined} className="flex items-center gap-3 font-semibold text-primary hover:underline"><FileText className="size-5" />{item.resultsPeriod} · Version {item.version}{item.id === review.id ? " · Viewing" : ""}</Link>
          <a href={`/coachs-corner/weekly-review/${item.id}/download`} className="text-sm font-semibold underline">Download version {item.version}</a>
        </li>)}</ul>
      </section>
    </div>
  </main></>
}
