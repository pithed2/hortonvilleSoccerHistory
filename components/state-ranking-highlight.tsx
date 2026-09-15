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
              src="/images/hortonville-wsca-week-3-2026.png"
              alt="Hortonville boys soccer: state ranked No. 8 in Division 1, Week 3 of the 2026 WSCA poll"
              width={1122}
              height={1402}
              sizes="(min-width: 640px) 240px, 320px"
              className="mx-auto h-auto w-full max-w-80 sm:max-w-none"
            />
          </div>
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="section-eyebrow">WSCA Coaches Poll · Week 3 · 2026</p>
            <h2 id="state-ranking-title" className="section-title">No. 8 in Wisconsin Division 1</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              The Polar Bears earned the No. 8 spot in the 2026 Week 3 WSCA Division 1 Coaches Poll.
              Congratulations to the players and coaches on the statewide recognition!
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
