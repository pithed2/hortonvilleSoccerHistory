import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = { title: "Player Cards | A Treat from Coach Andy" }
export default function PlayerCardsPage() {
  return <><Navigation /><main className="grid min-h-[85vh] place-items-center bg-[#0d1018] px-6 py-20 text-white"><section className="max-w-2xl text-center"><Image src="/logos/modern-bear-logo-white-fill.png" alt="Hortonville Polar Bears" width={130} height={130} className="mx-auto" /><p className="mt-8 text-xs font-black uppercase tracking-[.3em] text-red-400">The 2026 collection</p><h1 className="mt-4 text-5xl font-black leading-tight sm:text-7xl">You earned<br />your own card.</h1><p className="mt-6 text-xl text-white/75">Congrats on winning conference.</p><p className="mt-3 leading-7 text-white/55">A digital keepsake from Coach Andy, featuring your photos, your story, and your varsity stats. Open the personal link or scan the QR code Coach sends you to download both sides.</p><p className="mt-6 text-sm text-white/40">Your card will be ready once your photos and write-up are in.</p><Link href="/coachs-corner/player-cards" className="mt-10 inline-block rounded-full border border-white/20 px-6 py-3 text-sm font-bold hover:bg-white/10">Coach’s Card Studio →</Link></section></main></>
}
