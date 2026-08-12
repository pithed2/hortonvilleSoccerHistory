import { Footer } from "@/components/footer";
import { HeadToHeadTable } from "@/components/head-to-head-table";
import { Navigation } from "@/components/navigation";
import { opponentRecords } from "@/lib/games";

export default async function HeadToHeadPage() {
  const records = await opponentRecords();
  return <main className="min-h-screen bg-background">
    <Navigation />
    <header className="bg-primary py-16 text-primary-foreground"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-4xl font-black md:text-5xl">Head to Head</h1>
      <p className="text-lg opacity-90">The program&apos;s documented record against every opponent</p>
    </div></header>
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <HeadToHeadTable records={records} />
    </section><Footer />
  </main>;
}
