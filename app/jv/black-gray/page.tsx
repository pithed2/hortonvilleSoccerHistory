import type { Metadata } from "next"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { JvCalendar } from "@/components/jv-calendar"
import { JV_CONFERENCE_NOTE } from "@/lib/jv-conference.mjs"

export const metadata: Metadata = { title: "JV Black & Gray 2026" }

export default function JvBlackGrayPage() {
  return <main id="main-content" className="min-h-screen bg-background">
    <Navigation />
    <header className="page-header"><div className="site-container"><Link href="/jv" className="text-sm font-semibold">Back to all JV teams</Link><p className="page-eyebrow mt-5">Hortonville Boys Soccer · 2026</p><h1 className="page-title">JV Black &amp; Gray</h1><p className="page-description">Follow Coach Seth’s JV Black and JV Gray teams throughout the season.</p></div></header>
    <div className="site-container space-y-6 py-10"><p className="text-sm leading-6 text-muted-foreground">{JV_CONFERENCE_NOTE}</p><JvCalendar teams={["JV Black", "JV Gray"]} /></div>
    <Footer />
  </main>
}
