import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PlayerCardPreview } from "@/components/player-card-preview"
import { PlayerCardShare } from "@/components/player-card-share"
import { publishedCard } from "@/lib/player-card-store"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Your Hortonville Player Card", robots: { index: false, follow: false, noimageindex: true }, referrer: "no-referrer" }
export default async function PersonalCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const card = await publishedCard(token)
  if (!card) notFound()
  return <main className="min-h-screen bg-[#0d1018] px-5 py-12 text-white"><div className="mx-auto max-w-4xl"><Link href="/player-cards" className="text-sm text-white/50">Hortonville / Player Cards</Link><p className="mt-8 text-xs font-bold uppercase tracking-[.25em] text-red-400">A treat from Coach Andy</p><h1 className="mt-3 text-4xl font-black sm:text-6xl">{card.player.name}</h1><p className="mb-10 mt-4 text-white/60">{card.player.season === 2026 ? "Congrats on winning conference. This one’s yours." : "Once a Polar Bear, always a Polar Bear."} Save both sides and keep the memories.</p><div className="grid gap-8 sm:grid-cols-2"><PlayerCardPreview player={card.player} design={card.design} side="front" /><PlayerCardPreview player={card.player} design={card.design} side="back" /></div><section className="mt-8 rounded-xl border border-white/15 p-5"><h2 className="font-bold">{card.player.season} season &amp; varsity career</h2><p className="mt-2 text-sm text-white/60">{card.design.overview}</p><table className="mt-4 w-full text-left text-sm"><thead><tr><th>Season</th>{card.player.metrics.map((metric) => <th key={metric.label}>{metric.label}</th>)}</tr></thead><tbody><tr><th>{card.player.season}</th>{card.player.metrics.map((metric) => <td key={metric.label}>{metric.season}</td>)}</tr><tr><th>Career</th>{card.player.metrics.map((metric) => <td key={metric.label}>{metric.career}</td>)}</tr></tbody></table><p className="mt-3 text-xs text-white/40">Varsity career: {card.player.careerSpan}. Card prepared {card.publishedAt.slice(0, 10)}. Stats reflect the archive at publication.{card.player.incomplete ? " — Not recorded. * Documented totals; some seasons incomplete." : ""}</p></section><PlayerCardShare token={token} /></div></main>
}
