import Link from "next/link";
import { ArrowRight, CalendarDays, Swords, Trophy } from "lucide-react";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { seasonRows } from "@/lib/games";
import { ContentContainer, PageHeader, SectionHeading } from "@/components/archive-ui";

export const runtime = "nodejs";
export const revalidate = 60;

export default async function SeasonsPage() {
  const seasons = await seasonRows();
  const latestYear = seasons[0]?.season_year;
  const firstYear = seasons.at(-1)?.season_year;

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <PageHeader eyebrow="Program archive" title="Seasons" description="Explore every documented varsity season, from schedules and results to rosters, player statistics, and box scores.">
        <span>{seasons.length} seasons</span>
        {firstYear && latestYear && <span>{firstYear}–{latestYear}</span>}
      </PageHeader>

      <ContentContainer className="py-12 md:py-14">
        <Link
          href="/head-to-head"
          className="surface-card-interactive group mb-14 flex flex-col gap-6 overflow-hidden border-primary/20 bg-primary/5 p-6 md:flex-row md:items-center md:justify-between md:p-8"
        >
          <div className="flex items-start gap-5">
            <span className="rounded-xl bg-primary p-3 text-primary-foreground shadow-sm"><Swords className="h-7 w-7" /></span>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">All-time matchups</p>
              <h2 className="text-2xl font-black md:text-3xl">Head-to-Head Records</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                See Hortonville&apos;s complete W-L-D record against every opponent, then open any matchup for the game-by-game history.
              </p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-2 font-bold text-primary">
            Explore opponents <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <SectionHeading eyebrow="Year by year" title="Season Archive" aside={<p className="hidden text-sm text-muted-foreground sm:block">Select a season for the full record</p>} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {seasons.map((season) => (
            <Link
              key={season.season_year}
              href={`/seasons/${season.season_year}`}
              className="surface-card-interactive group p-6"
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Boys varsity</p>
                  <h3 className="mt-1 text-4xl font-black tracking-tight text-primary">{season.season_year}</h3>
                </div>
                <span className="rounded-full bg-muted p-2.5 text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <CalendarDays className="h-5 w-5" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Record</p>
                  <p className="mt-1 text-xl font-black">{season.played ? `${season.wins}-${season.losses}-${season.ties}` : "Incomplete"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Goals</p>
                  <p className="mt-1 text-xl font-black">{season.played ? `${season.gf}-${season.ga}` : "-"}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{season.coach ? `Coach ${season.coach}` : `${season.played} games`}</span>
                <span className="flex items-center gap-1.5 font-bold text-primary">
                  View season <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
              {season.notes && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-sm font-semibold">
                  <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {season.notes}
                </div>
              )}
            </Link>
          ))}
        </div>
      </ContentContainer>
      <Footer />
    </main>
  );
}
