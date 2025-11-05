export const runtime = "nodejs";
export const revalidate = 60;

import Link from "next/link";
import { gamesBySeason, listSeasons } from "@/lib/games";

type Props = { params: { year: string } };

export async function generateStaticParams() {
  const years = listSeasons();         // returns number[]
  return years.map((y) => ({ year: String(y) })); // prebuild all seasons
}

export default function SeasonYearPage({ params }: Props) {
  // Strip any BOM/whitespace just in case
  const yearStr = (params.year ?? "").replace(/^\uFEFF/, "").trim();
  const year = Number.parseInt(yearStr, 10);

  if (!Number.isFinite(year)) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Invalid season</h1>
        <p className="mt-2 text-sm text-neutral-600">
          The URL must be like <code>/seasons/2014</code>.
        </p>
        <p className="mt-4">
          <Link href="/seasons" className="underline">← Back to seasons</Link>
        </p>
      </main>
    );
  }

  const games = gamesBySeason(year);

  // ... render your table using `games`
}