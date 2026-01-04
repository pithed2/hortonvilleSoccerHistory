export const runtime = "nodejs";
export const revalidate = 60;

import Link from "next/link";
import { gamesBySeason, listSeasons } from "@/lib/games";

type Props = { params: { year: string } };

export async function generateStaticParams() {
  // Prebuild all known seasons at build time
  const years = await listSeasons();
  return years.map((y) => ({ year: String(y) }));
}

export default async function SeasonYearPage({ params }: { params: Record<string, string | undefined> }) {
  return <pre>{JSON.stringify(params, null, 2)}</pre>;
}

//export default async function SeasonYearPage({ params }: { params: { year?: string } }) {
export function SeasonYearPage_old({ params }: { params: { year?: string } }) {
  const raw = params?.year ?? "";
  const year = parseInt(raw, 10);

  if (!raw || !Number.isFinite(year)) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Invalid season</h1>
        <p className="mt-2 text-sm text-neutral-600">
          The URL must be like <code>/seasons/2005</code>.
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          Received: <code>{String(raw)}</code>
        </p>
      </main>
    );
  }

  const games = await gamesBySeason(year);
  
  
  if (!games.length) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold">{year} Season</h1>
        <p className="mt-2 text-sm text-neutral-600">
          No games found for {year}. Make sure <code>public/data/games.csv</code> (or <code>games_textscore.csv</code>) contains rows with <code>season_year = {year}</code>.
        </p>
        <p className="mt-4"><Link href="/seasons" className="underline">Back to seasons</Link></p>
      </main>
    );
  }

  const cell = "text-left px-3 py-2 border-b";

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
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
            {games.map((g, i) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
