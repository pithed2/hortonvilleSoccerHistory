import { gamesBySeason } from '@/lib/games';
import { notFound } from 'next/navigation';

export const runtime = 'nodejs';
export const revalidate = 60;

export default function SeasonPage({ params }: { params: { year: string } }) {
  const year = Number(params.year);
  const games = gamesBySeason(year);
  if (!games.length) return notFound();

  const cols = "text-left px-3 py-2 border-b";
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{year} Season</h1>
        <p className="text-neutral-600">{games.length} games</p>
      </header>

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className={cols}>Date</th>
              <th className={cols}>Opponent</th>
              <th className={cols}>Venue</th>
              <th className={cols}>H/A</th>
              <th className={cols}>Competition</th>
              <th className={cols}>Result</th>
              <th className={cols}>Score</th>
              <th className={cols}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g, i) => (
              <tr key={i} className="odd:bg-white even:bg-neutral-50">
                <td className={cols}>{g.date}</td>
                <td className={cols}>{g.opponent}</td>
                <td className={cols}>{g.venue || ''}</td>
                <td className={cols}>{g.home_away || ''}</td>
                <td className={cols}>{g.competition || ''}</td>
                <td className={cols}>{g.result || ''}</td>
                <td className={cols}>{g.score || ''}</td>
                <td className={cols}>{g.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
