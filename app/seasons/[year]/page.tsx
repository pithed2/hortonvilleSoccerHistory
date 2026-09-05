export const runtime = "nodejs";
export const revalidate = 60;

import Link from "next/link";
import { CalendarDays, Goal, Shield, Trophy, Users } from "lucide-react";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { gamesBySeason, listSeasons, seasonRows } from "@/lib/games";
import { resultTone } from "@/lib/utils";
import type { Game } from "@/lib/types";
import {
  boxscoreGamesBySeason,
  goalkeeperSeasonStatsBySeason,
  playerSeasonStatsBySeason,
  rosterBySeason,
  type BoxscoreGame,
} from "@/lib/player-stats";

type Props = { params: Promise<{ year: string }> };

export async function generateStaticParams() {
  return (await listSeasons()).map((year) => ({ year: String(year) }));
}

function ResultBadge({ result }: { result?: string }) {
  const value = (result || "-").toUpperCase();
  return <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${resultTone(value)}`}>{value}</span>;
}

function BoxScore({ boxscore }: { boxscore: BoxscoreGame }) {
  const hasSaves = boxscore.players.some((player) => player.has_saves);
  const hasGa = boxscore.players.some((player) => player.has_ga);
  const cell = "border-b px-3 py-2 text-left tabular-nums";
  return (
    <details className="group mt-3 rounded-xl border border-primary/20 bg-primary/5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-primary">Box Score</span>
          <span className="rounded-full bg-background px-2.5 py-1 text-xs ring-1 ring-border">G {boxscore.goals}</span>
          <span className="rounded-full bg-background px-2.5 py-1 text-xs ring-1 ring-border">A {boxscore.assists}</span>
          {hasSaves ? <span className="rounded-full bg-background px-2.5 py-1 text-xs ring-1 ring-border">Saves {boxscore.saves}</span> : null}
        </span>
        <span className="text-xs uppercase tracking-wide text-primary"><span className="group-open:hidden">Show</span><span className="hidden group-open:inline">Hide</span></span>
      </summary>
      <div className="overflow-x-auto border-t border-primary/15 bg-background">
        <table className="w-full min-w-[520px] text-sm">
          <caption className="sr-only">Individual player box score for {boxscore.opponent}</caption>
          <thead className="bg-muted/50"><tr><th scope="col" className={cell}>Player</th><th scope="col" className={cell}>G</th><th scope="col" className={cell}>A</th><th scope="col" className={cell}>Pts</th><th scope="col" className={cell}>Saves</th><th scope="col" className={cell}>GA</th></tr></thead>
          <tbody>{boxscore.players.map((player) => <tr key={player.player_name} className="even:bg-muted/20">
            <td className={`${cell} font-semibold`}>{player.player_name}</td><td className={cell}>{player.is_goalkeeper ? "" : player.goals}</td>
            <td className={cell}>{player.is_goalkeeper ? "" : player.assists}</td><td className={cell}>{player.is_goalkeeper ? "" : player.points}</td>
            <td className={cell}>{player.has_saves ? player.saves : ""}</td><td className={cell}>{hasGa && player.has_ga ? player.ga : ""}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </details>
  );
}

function GameRow({ game, number, boxscore }: { game: Game; number: number; boxscore?: BoxscoreGame }) {
  return <article id={`game-${number}`} className="scroll-mt-36 rounded-2xl border bg-card p-4 shadow-sm target:border-primary target:ring-4 target:ring-primary/10 md:rounded-none md:border-0 md:border-b md:p-0 md:shadow-none">
    <div className="grid gap-4 md:grid-cols-[110px_minmax(150px,1.3fr)_120px_minmax(150px,1fr)_70px_80px_minmax(180px,1.4fr)] md:items-center md:gap-0">
      <div className="flex items-start justify-between gap-4 md:contents"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground md:order-1 md:px-3 md:py-4 md:text-sm md:normal-case">{game.date}</p><h3 className="text-lg font-black md:order-2 md:px-3 md:py-4 md:text-sm">{game.opponent}</h3><span className="md:order-5 md:px-3 md:py-4"><ResultBadge result={game.result} /></span></div>
      <div className="grid grid-cols-2 gap-3 border-y py-3 text-sm md:contents"><div className="md:order-6 md:px-3 md:py-4"><p className="text-xs font-semibold text-muted-foreground md:hidden">Score</p><p className="font-black">{game.score || "-"}</p></div><div className="md:order-3 md:px-3 md:py-4"><p className="text-xs font-semibold text-muted-foreground md:hidden">Venue</p><p className="font-semibold">{game.venue || game.home_away || "-"}</p></div></div>
      <p className="text-sm text-muted-foreground md:order-4 md:px-3 md:py-4">{game.competition || "-"}</p>
      <div className="text-sm md:order-7 md:px-3 md:py-4">{game.notes ? <p className="font-semibold">{game.notes}</p> : null}</div>
    </div>
    {boxscore ? <div className="md:px-3 md:pb-4"><BoxScore boxscore={boxscore} /></div> : null}
  </article>;
}

export default async function SeasonYearPage({ params }: Props) {
  const { year: raw } = await params;
  const year = Number.parseInt(raw, 10);
  const [games, rows] = await Promise.all([gamesBySeason(year), seasonRows()]);
  const summary = rows.find((row) => row.season_year === year);
  if (!Number.isFinite(year) || !summary) {
    return <main className="min-h-screen bg-background"><Navigation /><div className="mx-auto max-w-4xl px-4 py-20"><h1 className="text-3xl font-black">Season not found</h1><p className="mt-3 text-muted-foreground">No documented season was found for this year.</p><Link href="/seasons" className="mt-6 inline-block font-bold text-primary underline">Back to seasons</Link></div><Footer /></main>;
  }

  const roster = rosterBySeason(year);
  const playerStats = playerSeasonStatsBySeason(year);
  const goalkeeperStats = goalkeeperSeasonStatsBySeason(year);
  const boxscores = new Map(boxscoreGamesBySeason(year).map((game) => [game.game_number, game]));
  const cell = "border-b px-3 py-3 text-left tabular-nums";
  const sections = [{ id: "schedule", label: "Schedule", show: true }, { id: "roster", label: "Roster", show: roster.length > 0 }, { id: "players", label: "Player Stats", show: playerStats.length > 0 }, { id: "goalkeepers", label: "Goalkeepers", show: goalkeeperStats.length > 0 }];

  return <main className="min-h-screen bg-background"><Navigation />
    <header className="relative overflow-hidden border-b border-white/10 bg-[#0b0d10] py-10 text-white md:py-12"><div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[48px] border-primary/10" /><div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Link href="/seasons" className="text-sm font-semibold text-white/60 hover:text-white">Back to all seasons</Link>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Boys varsity</p><h1 className="mt-1 text-4xl font-black tracking-tight md:text-5xl">{year} Season</h1>{summary.notes ? <p className="mt-3 flex items-center gap-2 text-base font-bold text-white/70">{summary.played ? <Trophy className="h-5 w-5 text-primary" /> : null}{summary.notes}</p> : null}</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-xl border border-white/10 bg-white/[0.06] p-3"><p className="text-xs font-bold uppercase text-white/50">Record</p><p className="mt-1 text-xl font-black">{summary.played ? `${summary.wins}-${summary.losses}-${summary.ties}` : "Incomplete"}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.06] p-3"><p className="text-xs font-bold uppercase text-white/50">Goals For</p><p className="mt-1 text-xl font-black">{summary.played ? summary.gf : "-"}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.06] p-3"><p className="text-xs font-bold uppercase text-white/50">Goals Against</p><p className="mt-1 text-xl font-black">{summary.played ? summary.ga : "-"}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.06] p-3"><p className="text-xs font-bold uppercase text-white/50">Coach</p><p className="mt-1 text-base font-black">{summary.coach || "-"}</p></div></div>
      </div>
    </div></header>
    <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur"><nav aria-label="Season sections" className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">{sections.filter((section) => section.show).map((section) => <a key={section.id} href={`#${section.id}`} className="whitespace-nowrap rounded-full border bg-card px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary">{section.label}</a>)}</nav></div>
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
      <section id="schedule" className="scroll-mt-36"><div className="mb-6 flex items-center gap-3"><CalendarDays className="h-6 w-6 text-primary" /><h2 className="text-3xl font-black">Schedule & Results</h2></div>
        {!games.length ? <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center"><h3 className="text-xl font-black">Records incomplete</h3><p className="mt-2 text-muted-foreground">The {year} season is part of the known program history, but its schedule and results have not yet been added to the archive.</p></div> : null}
        <div className="space-y-4 md:space-y-0 md:overflow-hidden md:rounded-2xl md:border md:bg-card md:shadow-sm">
          <div className="hidden grid-cols-[110px_minmax(150px,1.3fr)_120px_minmax(150px,1fr)_70px_80px_minmax(180px,1.4fr)] bg-muted/60 text-sm font-bold md:grid"><span className="px-3 py-4">Date</span><span className="px-3 py-4">Opponent</span><span className="px-3 py-4">Venue</span><span className="px-3 py-4">Competition</span><span className="px-3 py-4">Result</span><span className="px-3 py-4">Score</span><span className="px-3 py-4">Notes / Box Score</span></div>
          {games.map((game, index) => <GameRow key={`${game.date}-${game.opponent}-${index}`} game={game} number={index + 1} boxscore={boxscores.get(index + 1)} />)}
        </div>
      </section>
      {roster.length ? <section id="roster" className="scroll-mt-36"><div className="mb-6 flex items-center gap-3"><Users className="h-6 w-6 text-primary" /><h2 className="text-3xl font-black">Roster</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{roster.map((player) => <div key={player.player_name} className="flex items-center gap-4 rounded-xl border bg-card p-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-black text-primary">{player.number || "-"}</span><div><p className="font-bold">{player.player_name}</p><p className="text-sm text-muted-foreground">{[player.class, player.position].filter(Boolean).join(" / ") || "Rostered player"}</p></div></div>)}</div></section> : null}
      {playerStats.length ? <section id="players" className="scroll-mt-36"><div className="mb-6 flex items-center gap-3"><Goal className="h-6 w-6 text-primary" /><h2 className="text-3xl font-black">Player Stats</h2></div><div className="overflow-x-auto rounded-2xl border bg-card shadow-sm"><table className="w-full min-w-[820px] text-sm"><caption className="sr-only">{year} player season statistics</caption><thead className="bg-muted/60"><tr><th scope="col" className={cell}>Player</th><th scope="col" className={cell}>GP</th><th scope="col" className={cell}>G</th><th scope="col" className={cell}>A</th><th scope="col" className={cell}>Pts</th><th scope="col" className={cell}>Shots</th><th scope="col" className={cell}>SOG</th><th scope="col" className={cell}>YC</th><th scope="col" className={cell}>RC</th></tr></thead><tbody>{playerStats.map((player) => <tr key={player.player_name} className="even:bg-muted/20"><td className={`${cell} font-bold`}>{player.player_name}</td><td className={cell}>{player.gp}</td><td className={cell}>{player.goals}</td><td className={cell}>{player.assists}</td><td className={`${cell} font-black text-primary`}>{player.points}</td><td className={cell}>{player.shots}</td><td className={cell}>{player.sog}</td><td className={cell}>{player.yc}</td><td className={cell}>{player.rc}</td></tr>)}</tbody></table></div></section> : null}
      {goalkeeperStats.length ? <section id="goalkeepers" className="scroll-mt-36"><div className="mb-6 flex items-center gap-3"><Shield className="h-6 w-6 text-primary" /><h2 className="text-3xl font-black">Goalkeepers</h2></div><div className="overflow-x-auto rounded-2xl border bg-card shadow-sm"><table className="w-full min-w-[720px] text-sm"><caption className="sr-only">{year} goalkeeper season statistics</caption><thead className="bg-muted/60"><tr><th scope="col" className={cell}>Player</th><th scope="col" className={cell}>GP</th><th scope="col" className={cell}>Minutes</th><th scope="col" className={cell}>GA</th><th scope="col" className={cell}>Saves</th><th scope="col" className={cell}>Save %</th><th scope="col" className={cell}>GAA</th></tr></thead><tbody>{goalkeeperStats.map((keeper) => <tr key={keeper.player_name} className="even:bg-muted/20"><td className={`${cell} font-bold`}>{keeper.player_name}</td><td className={cell}>{keeper.gp}</td><td className={cell}>{keeper.minutes}</td><td className={cell}>{keeper.ga}</td><td className={cell}>{keeper.saves}</td><td className={cell}>{keeper.save_pct ? `${(keeper.save_pct * 100).toFixed(1)}%` : "-"}</td><td className={cell}>{keeper.gaa ? keeper.gaa.toFixed(2) : "-"}</td></tr>)}</tbody></table></div></section> : null}
    </div><Footer />
  </main>;
}
