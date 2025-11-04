import { listSeasons, gamesBySeason } from '@/lib/games';

export const runtime = 'nodejs';
export const revalidate = 60; // optional

export default function SeasonsPage() {
  const seasons = listSeasons();
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">View Seasons</h1>
      <ul className="grid sm:grid-cols-2 gap-4">
        {seasons.map(y => {
          const cnt = gamesBySeason(y).length;
          return (
            <li key={y} className="rounded-xl p-4 border bg-white">
              <a href={`/seasons/${y}`} className="font-semibold">{y}</a>
              <div className="text-sm text-neutral-600">{cnt} games</div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
