import type { Metadata } from "next"
import Link from "next/link"
import { Trophy } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ContentContainer, PageHeader, SectionHeading } from "@/components/archive-ui"
import { varsityRecords, type VarsityRecord } from "@/lib/varsity-records"

export const metadata: Metadata = { title: "Single-Game & Season Records" }
export const runtime = "nodejs"
export const revalidate = 60

function RecordCard({ record }: { record: VarsityRecord }) {
  return <article className="surface-card min-w-0 p-6">
    <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-black">{record.title}</h3><Trophy aria-hidden="true" className="size-5 shrink-0 text-primary" /></div>
    {record.holders.length ? <>
      <p className="mt-4 text-5xl font-black tabular-nums text-primary">{record.holders[0].value}</p>
      {record.holders.length > 1 ? <p className="mt-2 text-xs font-bold uppercase text-muted-foreground">Tied record · {record.holders.length} holders</p> : null}
      <ul className="mt-4 space-y-3">{record.holders.map((holder, index) => <li key={`${holder.href}-${holder.name}-${index}`}><Link href={holder.href} className="font-bold underline decoration-primary/30 underline-offset-4 hover:text-primary">{holder.name} · {holder.season}</Link>{holder.detail ? <p className="mt-1 text-sm text-muted-foreground">{holder.detail}</p> : null}</li>)}</ul>
    </> : <p className="mt-4 text-sm text-muted-foreground">No qualifying records documented yet.</p>}
    <p className="mt-5 border-t pt-3 text-xs text-muted-foreground">{record.note}</p>
  </article>
}

export default async function RecordsPage() {
  const records = await varsityRecords()
  return <main className="min-h-screen bg-background"><Navigation />
    <PageHeader eyebrow="Varsity record book" title="Single-Game & Season Records" description="Standout individual performances and team seasons from the documented Hortonville boys varsity archive."><div className="flex flex-wrap gap-4"><a href="#single-game" className="underline">Single-game records</a><a href="#season-records" className="underline">Season records</a><Link href="/stats/leaders" className="underline">Career leaders</Link></div></PageHeader>
    <ContentContainer className="space-y-12 py-12">
      <p className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">Records reflect available varsity data and include all ties. Historical coverage varies; these are documented bests, not a guarantee of complete program history. Team assists and saves sum recorded player totals. Active seasons can set high records; the fewest-goals-conceded record requires a completed season with all listed games scored.</p>
      <section id="single-game" className="scroll-mt-24"><SectionHeading eyebrow="One match" title="Single-Game Records" description="Individual player records, with links to the match." /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{records.singleGame.map(record => <RecordCard key={record.title} record={record} />)}</div></section>
      <section id="season-records" className="scroll-mt-24"><SectionHeading eyebrow="One season" title="Season Records" description="Team and individual achievements across the varsity archive." /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{records.season.map(record => <RecordCard key={record.title} record={record} />)}</div></section>
    </ContentContainer><Footer /></main>
}
