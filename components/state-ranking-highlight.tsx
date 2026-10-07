import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function StateRankingHighlight() {
  return (
    <section className="border-b bg-muted/20 py-10 sm:py-12" aria-labelledby="state-ranking-title">
      <div className="site-container">
        <div className="surface-card overflow-hidden sm:flex sm:items-center">
          <div className="shrink-0 bg-black sm:w-60">
            <Image
              src="/images/Hortonville Soccer Ranking Week 6.png"
              alt="Hortonville boys soccer: state ranked No. 10 in Division 1, Week 6 of the 2026 WSCA poll"
              width={1254}
              height={1254}
              sizes="(min-width: 640px) 240px, 320px"
              className="mx-auto h-auto w-full max-w-80 sm:max-w-none"
            />
          </div>
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="section-eyebrow">WSCA Coaches Poll · Week 6 · 2026</p>
            <h2 id="state-ranking-title" className="section-title">No. 10 in Wisconsin Division 1</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              The committee got it right: Hortonville stays in the top 10. The Polar Bears hold No. 10 in the Week 6 WSCA Division 1 poll, earning continued recognition among Wisconsin’s best.
            </p>
            <Link href="/seasons/2026" className="action-primary mt-6 w-fit">
              Follow the 2026 season <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
