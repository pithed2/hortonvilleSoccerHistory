import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Download } from "lucide-react"
import wrap from "@/data/season-wrap-2026.json"

export function SeniorClassHighlight() {
  const seniors = wrap.classOf2027
  return (
    <section id="class-of-2027" className="scroll-mt-24 border-b bg-background py-14 sm:py-20" aria-labelledby="senior-class-title">
      <div className="site-container grid items-center gap-9 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)] lg:gap-16">
        <div className="min-w-0">
          <h2 id="senior-class-title" className="section-title max-w-2xl">Class of 2027.<br />A class that changed the program.</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">From freshmen to seniors, this group helped build the strongest four-year record in the documented Hortonville boys soccer archive: <strong className="text-foreground">{seniors.w} wins, {seniors.l} losses and {seniors.t} ties.</strong> They leave with back-to-back FVA titles, three Regional championships and a standard for the next generation to chase.</p>
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-y py-6 sm:grid-cols-4">
            {[[String(seniors.w), "Wins · most of any class"], [String(seniors.gf), "Goals · most of any class"], [String(seniors.shutouts), "Shutouts · tied for most"], ["27", "Straight FVA games unbeaten"]].map(([value, label]) => <div key={label}><dt className="text-sm leading-5 text-muted-foreground">{label}</dt><dd className="mt-2 text-3xl font-black tabular-nums text-primary">{value}</dd></div>)}
          </dl>
          <p className="mt-6 max-w-2xl leading-7 text-muted-foreground">Four seniors hold eight places across the career top tens. Roman Glad finishes as the career goals and points leader; Jacob Plutz, Noah Rindt and Eli Ryan leave their own marks on the boards. Every senior helped make these four seasons possible.</p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Final edition · all 2026 postseason results included. Compared with 19 documented graduating classes, 2009–2027. Class totals cover the team’s four seasons, 2023–2026.</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <a href="/documents/class-of-2027-final-season-breakout.pdf" className="action-primary"><Download className="size-4 shrink-0" aria-hidden="true" />Read the senior tribute <span className="shrink-0 whitespace-nowrap text-xs">PDF · 3 pages</span></a>
            <Link href="/stats/leaders" className="inline-flex items-center gap-2 font-bold text-primary underline underline-offset-4">Career leaders <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </div>
        <a href="/documents/class-of-2027-final-season-breakout.pdf" className="mx-auto block w-full max-w-[370px] border focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label="Open the updated Class of 2027 tribute PDF">
          <Image src="/images/class-of-2027-final-season-breakout.png" alt="Class of 2027 final-season tribute: 63 wins, 283 goals and 44 clean sheets over four seasons" width={918} height={1188} sizes="(min-width: 768px) 370px, (max-width: 402px) calc(100vw - 32px), 370px" className="h-auto w-full" />
        </a>
      </div>
    </section>
  )
}
