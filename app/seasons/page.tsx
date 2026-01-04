import { listSeasons, gamesBySeason } from "@/lib/games";

export const runtime = "nodejs";
export const revalidate = 60;

export default async function SeasonsPage() {
  const seasonsRaw = await listSeasons();
  const seasons = seasonsRaw
  .map((y) => Number(y))
  .filter(Number.isFinite)
  .sort((a, b) => b - a);
  
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">View Seasons</h1>
      <ul className="grid sm:grid-cols-2 gap-4">
        {await Promise.all(seasons.map(async (y) => {
          const cnt = (await gamesBySeason(y)).length;
          const yy = Number(y);
          return (
            <li key={seasons} className="rounded-xl p-4 border bg-white">
              <a href={`/seasons/${yy}`} className="font-semibold"> -- {yy}</a>
              <div className="text-sm text-neutral-600">{cnt} games</div>
            </li>
          );
        }))}
      </ul>
    </main>
  );
}
