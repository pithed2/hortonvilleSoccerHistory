import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { PlayerCardEditor } from "@/components/player-card-editor"
import { COACH_COOKIE, validCoachCookie } from "@/lib/coach-auth"
import { cardPlayers } from "@/lib/player-cards"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Player Card Studio", robots: { index: false, follow: false } }
export default async function PlayerCardStudio() {
  const authorized = validCoachCookie((await cookies()).get(COACH_COOKIE)?.value)
  return <><Navigation /><main id="main-content" tabIndex={-1} className="min-h-screen bg-[#0d1018] px-4 py-10 text-white sm:px-8"><div className="mx-auto max-w-7xl"><Link href="/coachs-corner" className="text-sm text-white/50">← Coach’s Corner</Link><p className="mt-8 text-xs font-bold uppercase tracking-[.3em] text-red-400">A gift from the Coaches</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Player Card Studio</h1><p className="mb-10 mt-4 max-w-2xl text-white/60">Their season. Their story. A keepsake worth saving.</p>{authorized ? <PlayerCardEditor players={cardPlayers()} /> : <section className="rounded-2xl border border-white/15 p-8"><h2 className="text-xl font-bold">Coach access</h2><p className="mt-3 text-white/60">Sign in to Coach’s Corner, then open Player Card Studio to prepare photos, write-ups, and player links.</p><Link href="/coachs-corner" className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-bold">Sign in</Link></section>}</div></main></>
}
