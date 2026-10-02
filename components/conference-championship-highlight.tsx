import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Trophy } from "lucide-react"

export function ConferenceChampionshipHighlight() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-zinc-950 py-12 text-white sm:py-16" aria-labelledby="conference-championship-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(220,38,38,0.3),transparent_65%)]" />
      <div className="site-container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-red-200">
            <Trophy className="size-4 text-amber-300" aria-hidden="true" />
            2026 · Varsity Boys Soccer
          </p>
          <h2 id="conference-championship-title" className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
            Outright
            <span className="mt-2 block text-red-500">FVA Champions.</span>
          </h2>
          <div className="mt-6 h-1 w-20 bg-red-500" aria-hidden="true" />
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-200">
            Congratulations to our Varsity players and coaches on winning the 2026 Fox Valley Association conference title outright!
          </p>
          <p className="mt-4 text-xl font-bold text-white">Back-to-back banners. One proud Polar Bear family.</p>
          <Link href="/seasons/2026" className="mt-8 inline-flex items-center gap-3 rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            Celebrate the 2026 season <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <figure className="overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_20px_70px_rgba(220,38,38,0.2)]">
          <Image
            src="/images/fva-championship-banners-2025-2026.png"
            alt="Hortonville boys soccer FVA conference championship banners for 2025 and 2026"
            width={1536}
            height={1024}
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="h-auto w-full"
          />
          <figcaption className="border-t border-zinc-200 bg-zinc-100 px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-zinc-800">
            Hortonville Soccer · A tradition worth raising
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
