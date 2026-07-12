export const runtime = "nodejs";
export const revalidate = 60;

import Link from "next/link";
import { Fragment } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { gamesBySeason, listSeasons } from "@/lib/games";
import {
  boxscoreGamesBySeason,
  goalkeeperSeasonStatsBySeason,
  playerSeasonStatsBySeason,
  rosterBySeason,
} from "@/lib/player-stats"

type Props = { params: Promise<{ year: string }> };

export async function generateStaticParams() {
  // Prebuild all known seasons at build time
  const years = await listSeasons();
  return years.map((y) => ({ year: String(y) }));
}

export default async function SeasonYearPage({ params }: Props) {
  const { year: raw } = await params;
  const year = parseInt(raw, 10);

  if (!raw || !Number.isFinite(year)) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <Navigation />
        <h1 className="text-2xl font-bold">Invalid season</h1>
        <p className="mt-2 text-sm text-neutral-600">
          The URL must be like <code>/seasons/2005</code>.
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          Received: <code>{raw}</code>
        </p>
        <Footer />
      </main>
    );
  }

  const games = await gamesBySeason(year);
  const roster = rosterBySeason(year);
  const playerStats = playerSeasonStatsBySeason(year);
  const goalkeeperStats = goalkeeperSeasonStatsBySeason(year);
  const boxscoreGames = boxscoreGamesBySeason(year);
  
  
  if (!games.length) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <Navigation />
        <h1 className="text-2xl font-bold">{year} Season</h1>
        <p className="mt-2 text-sm text-neutral-600">
          No games found for {year}. Make sure <code>public/data/games.csv</code> (or <code>games_textscore.csv</code>) contains rows with <code>season_year = {year}</code>.
        </p>
        <p className="mt-4"><Link href="/seasons" className="underline">Back to seasons</Link></p>
        <Footer />
      </main>
    );
  }

  const cell = "text-left px-3 py-2 border-b";
  const boxscoresByGameNumber = new Map(boxscoreGames.map((game) => [game.game_number, game]));
  const statCell = (value: number, show: boolean) => (show && Number.isFinite(value) ? value : "");
  const statPill = (label: string, value: number) => (
    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200">
      {label} {value}
    </span>
  );

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <Navigation />
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{year} Season</h1>
        <Link href="/seasons" className="text-sm underline text-neutral-600">← All seasons</Link>
      </header>

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className={cell}>Date</th>
              <th className={cell}>Opponent</th>
              <th className={cell}>Venue</th>
              <th className={cell}>H/A</th>
              <th className={cell}>Competition</th>
              <th className={cell}>Result</th>
              <th className={cell}>Score</th>
              <th className={cell}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g, i) => {
              const boxscore = boxscoresByGameNumber.get(i + 1)
              const hasBoxscoreSaves = boxscore?.players.some((player) => player.has_saves) ?? false
              const hasBoxscoreGa = boxscore?.players.some((player) => player.has_ga) ?? false

              return (
                <Fragment key={`${g.date}-${g.opponent}-${i}`}>
                  <tr key={`${g.date}-${g.opponent}-${i}`} className="odd:bg-white even:bg-neutral-50">
                    <td className={cell}>{g.date}</td>
                    <td className={cell}>{g.opponent}</td>
                    <td className={cell}>{g.venue || ""}</td>
                    <td className={cell}>{g.home_away || ""}</td>
                    <td className={cell}>{g.competition || ""}</td>
                    <td className={cell}>{g.result || ""}</td>
                    <td className={cell}>{g.score || ""}</td>
                    <td className={cell}>{g.notes || ""}</td>
                  </tr>
                  {boxscore && (
                    <tr key={`${g.date}-${g.opponent}-${i}-boxscore`} className="bg-white">
                      <td colSpan={8} className="border-b px-3 py-3">
                        <details className="group rounded-lg border border-primary/20 bg-primary/5">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-neutral-800">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-primary">Box Score</span>
                              {statPill("G", boxscore.goals)}
                              {statPill("A", boxscore.assists)}
                              {hasBoxscoreSaves && statPill("Saves", boxscore.saves)}
                              {hasBoxscoreGa && statPill("GA", boxscore.ga)}
                            </span>
                            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-primary">
                              <span className="group-open:hidden">Show</span>
                              <span className="hidden group-open:inline">Hide</span>
                            </span>
                          </summary>
                          <div className="border-t border-primary/15 px-4 pb-4 pt-3">
                          <div className="overflow-x-auto rounded-lg border bg-white">
                            <table className="min-w-[520px] w-full text-sm">
                              <thead className="bg-neutral-50">
                                <tr>
                                  <th className={cell}>Player</th>
                                  <th className={cell}>G</th>
                                  <th className={cell}>A</th>
                                  <th className={cell}>Pts</th>
                                  <th className={cell}>Saves</th>
                                  <th className={cell}>GA</th>
                                </tr>
                              </thead>
                              <tbody>
                                {boxscore.players.map((player) => (
                                  <tr
                                    key={`${boxscore.season}-${boxscore.game_number}-${player.player_name}`}
                                    className="odd:bg-white even:bg-neutral-50"
                                  >
                                    <td className={cell}>{player.player_name}</td>
                                    <td className={cell}>{statCell(player.goals, !player.is_goalkeeper)}</td>
                                    <td className={cell}>{statCell(player.assists, !player.is_goalkeeper)}</td>
                                    <td className={cell}>{statCell(player.points, !player.is_goalkeeper)}</td>
                                    <td className={cell}>{statCell(player.saves, player.has_saves)}</td>
                                    <td className={cell}>{statCell(player.ga, player.has_ga)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          </div>
                        </details>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
        {roster.length > 0 && (
          <section className="rounded-xl border p-6">
            <h2 className="text-2xl font-bold mb-4">Roster</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className={cell}>Name</th>
                    <th className={cell}>Class</th>
                    <th className={cell}>Number</th>
                    <th className={cell}>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((player) => (
                    <tr key={`${player.season}-${player.player_name}`} className="odd:bg-white even:bg-neutral-50">
                      <td className={cell}>{player.player_name}</td>
                      <td className={cell}>{player.class}</td>
                      <td className={cell}>{player.number}</td>
                      <td className={cell}>{player.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {playerStats.length > 0 && (
        <section className="rounded-xl border p-6">
          <h2 className="text-2xl font-bold mb-4">Player Stats</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className={cell}>Player</th>
                  <th className={cell}>GP</th>
                  <th className={cell}>G</th>
                  <th className={cell}>A</th>
                  <th className={cell}>Pts</th>
                  <th className={cell}>Shots</th>
                  <th className={cell}>SOG</th>
                  <th className={cell}>YC</th>
                  <th className={cell}>RC</th>
                  <th className={cell}>Saves</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((player) => (
                  <tr key={`${player.season}-${player.player_name}`} className="odd:bg-white even:bg-neutral-50">
                    <td className={cell}>{player.player_name}</td>
                    <td className={cell}>{player.gp}</td>
                    <td className={cell}>{player.goals}</td>
                    <td className={cell}>{player.assists}</td>
                    <td className={cell}>{player.points}</td>
                    <td className={cell}>{player.shots}</td>
                    <td className={cell}>{player.sog}</td>
                    <td className={cell}>{player.yc}</td>
                    <td className={cell}>{player.rc}</td>
                    <td className={cell}>{player.saves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}
              {goalkeeperStats.length > 0 && (
        <section className="rounded-xl border p-6">
          <h2 className="text-2xl font-bold mb-4">Goalkeeper Stats</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className={cell}>Player</th>
                  <th className={cell}>GP</th>
                  <th className={cell}>Min</th>
                  <th className={cell}>GA</th>
                  <th className={cell}>Saves</th>
                  <th className={cell}>Save %</th>
                  <th className={cell}>GAA</th>
                  <th className={cell}>Opp SOG</th>
                </tr>
              </thead>
              <tbody>
                {goalkeeperStats.map((keeper) => (
                  <tr key={`${keeper.season}-${keeper.player_name}`} className="odd:bg-white even:bg-neutral-50">
                    <td className={cell}>{keeper.player_name}</td>
                    <td className={cell}>{keeper.gp}</td>
                    <td className={cell}>{keeper.minutes}</td>
                    <td className={cell}>{keeper.ga}</td>
                    <td className={cell}>{keeper.saves}</td>
                    <td className={cell}>{keeper.save_pct ? `${(keeper.save_pct * 100).toFixed(1)}%` : ""}</td>
                    <td className={cell}>{keeper.gaa ? keeper.gaa.toFixed(2) : ""}</td>
                    <td className={cell}>{keeper.opp_sog || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}  
      <Footer />
    </main>
  );
}
