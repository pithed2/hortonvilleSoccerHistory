import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { gamesByOpponentSlug, opponentRecords } from "@/lib/games";
import { boxscoreGamesBySeason } from "@/lib/player-stats";

type Props = { params: Promise<{ opponent: string }> };
export async function generateStaticParams() {
  return (await opponentRecords()).map((record) => ({ opponent: record.slug }));
}

export default async function OpponentPage({ params }: Props) {
  const { opponent: slug } = await params;
  const { opponent, games } = await gamesByOpponentSlug(slug);
  if (!opponent || !games.length) notFound();
  const boxscores = new Set<string>();
  for (const year of new Set(games.map((game) => game.season_year))) {
    for (const boxscore of boxscoreGamesBySeason(year)) boxscores.add(`${year}-${boxscore.game_number}`);
  }
  const wins = games.filter((game) => game.result === "W").length;
  const losses = games.filter((game) => game.result === "L").length;
  const ties = games.filter((game) => game.result === "T" || game.result === "D").length;
  const cell = "border-b px-3 py-2 text-left";
  return <main className="min-h-screen bg-background"><Navigation />
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6 lg:px-8"><div>
      <Link href="/head-to-head" className="text-sm text-muted-foreground underline">← All opponents</Link>
      <h1 className="mt-4 text-3xl font-black md:text-4xl">Hortonville vs. {opponent}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{games.length} games · {wins}-{losses}-{ties}</p>
    </div><div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[850px] text-sm">
      <thead className="bg-muted/50"><tr><th className={cell}>Season</th><th className={cell}>Date</th><th className={cell}>Venue</th><th className={cell}>Competition</th><th className={cell}>Result</th><th className={cell}>Score</th><th className={cell}>Notes</th></tr></thead>
      <tbody>{games.map((game) => <tr key={`${game.season_year}-${game.gameNumber}`} className="odd:bg-background even:bg-muted/20">
        <td className={cell}><Link className="underline decoration-dotted" href={`/seasons/${game.season_year}`}>{game.season_year}</Link></td>
        <td className={cell}>{game.date}</td><td className={cell}>{game.venue || game.home_away || ""}</td><td className={cell}>{game.competition || ""}</td>
        <td className={cell}>{game.result || ""}</td><td className={cell}>{game.score || ""}</td>
        <td className={cell}>{game.notes || ""}{boxscores.has(`${game.season_year}-${game.gameNumber}`) && <Link className="ml-2 whitespace-nowrap font-semibold text-primary underline decoration-dotted" href={`/seasons/${game.season_year}`}>Box score</Link>}</td>
      </tr>)}</tbody>
    </table></div></section><Footer />
  </main>;
}
