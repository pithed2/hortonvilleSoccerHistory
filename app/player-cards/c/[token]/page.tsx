import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { publicCard } from "@/lib/card-studio-store"
import { cardStudioWritesEnabled } from "@/lib/card-studio-rollout"
import { PlayerCardPreview } from "@/components/player-card-preview"
export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "HHS Player Card", robots: { index: false, follow: false, noimageindex: true }, referrer: "no-referrer" }
export default async function CardPage({params}:{params:Promise<{token:string}>}) {
  if (!cardStudioWritesEnabled()) notFound()
  const {token}=await params
  const card=await publicCard(token)
  if(!card)notFound()
  return <main className="min-h-screen bg-[#090a0e] px-4 py-10 text-white"><div className="mx-auto max-w-4xl"><Link href="/" className="text-sm text-red-300">Hortonville Soccer History</Link><h1 className="my-5 text-3xl font-black">{card.player.name}</h1><p className="mb-6 text-white/70">{card.title} · Coach-approved card</p><div className="grid gap-6 sm:grid-cols-2"><PlayerCardPreview player={card.player} design={card.design} side="front"/><PlayerCardPreview player={card.player} design={card.design} side="back"/></div></div></main>
}