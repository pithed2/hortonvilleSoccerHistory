import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { authenticatedPlayer } from "@/lib/red-room/auth"
import { pendingCards } from "@/lib/card-studio-store"
import { redRoomParticipation } from "@/lib/red-room/participation"
import { PlayerCardPreview } from "@/components/player-card-preview"
import { ReviewControls } from "./review-controls"
export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Card Approvals", robots: { index: false, follow: false, noimageindex: true } }
export default async function ApprovalsPage() {
  const coach = await authenticatedPlayer()
  if (!coach || coach.isBot || coach.accountType !== "coach") redirect("/jv/red/red-room")
  const [cards, usage] = await Promise.all([pendingCards(), redRoomParticipation()])
  return <main className="min-h-screen bg-[#090a0e] px-4 py-10 text-white"><div className="mx-auto max-w-6xl"><Link href="/coachs-corner" className="text-red-300">Coach's Corner</Link><h1 className="my-4 text-4xl font-black">Player Card Approvals</h1><p className="mb-8 text-sm text-white/70">{cards.length} card(s) awaiting review. Decisions are attached to your individual coach account.</p><section className="mb-8 grid gap-3 rounded-xl border border-white/20 p-5 sm:grid-cols-4"><div><p className="text-xs text-white/60">Eligible players</p><p className="text-2xl font-bold">{usage.eligible}</p></div><div><p className="text-xs text-white/60">Ever signed in</p><p className="text-2xl font-bold">{usage.signedIn}</p></div><div><p className="text-xs text-white/60">Actually completed a match</p><p className="text-2xl font-bold">{usage.played}</p></div><div><p className="text-xs text-white/60">Completed matches involving players</p><p className="text-2xl font-bold">{usage.completedMatchesWithPlayers}</p></div><p className="text-xs text-white/50 sm:col-span-4">These counts exclude coaches and bots. Created accounts and pending invitations are not counted as participation.</p></section><div className="space-y-8">{cards.map(card=><article key={card.id} className="rounded-xl border border-white/20 p-5"><h2 className="text-xl font-bold">{card.ownerName} · {card.title}</h2><p className="mb-4 text-xs text-white/60">{card.ownerTag} · Revision {card.revision}</p>{card.submitted?<><div className="mb-6 grid max-w-3xl gap-4 sm:grid-cols-2"><PlayerCardPreview player={card.submitted.player} design={card.submitted.design} side="front"/><PlayerCardPreview player={card.submitted.player} design={card.submitted.design} side="back"/></div><p className="mb-4 text-sm">{card.submitted.design.overview}</p><ReviewControls id={card.id} revision={card.revision}/></>:null}</article>)}{!cards.length?<p className="rounded-xl border border-white/20 p-6 text-white/70">No pending cards. Apparently the kids have behaved themselves so far.</p>:null}</div></div></main>
}
