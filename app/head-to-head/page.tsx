import { Footer } from "@/components/footer";
import { HeadToHeadTable } from "@/components/head-to-head-table";
import { Navigation } from "@/components/navigation";
import { opponentRecords } from "@/lib/games";
import { ContentContainer, PageHeader } from "@/components/archive-ui";

export default async function HeadToHeadPage() {
  const records = await opponentRecords();
  return <main className="min-h-screen bg-background">
    <Navigation />
    <PageHeader eyebrow="All-time matchups" title="Head to Head" description="The program's documented record against every opponent." />
    <ContentContainer className="py-12 md:py-16">
      <HeadToHeadTable records={records} />
    </ContentContainer><Footer />
  </main>;
}
