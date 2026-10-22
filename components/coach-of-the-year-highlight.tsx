import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CoachOfTheYearHighlight() {
  return (
    <section id="coach-of-the-year" className="scroll-mt-20 border-b bg-muted/20 py-12 sm:py-16" aria-labelledby="coach-of-the-year-title">
      <div className="site-container grid items-center gap-8 md:grid-cols-[minmax(0,380px)_1fr] lg:gap-16">
        <a href="/images/paul-everett-fva-coach-of-the-year-2025-2026.webp" className="mx-auto block w-full max-w-[380px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label="Open Paul Everett’s Coach of the Year graphic at full size">
          <Image
            src="/images/paul-everett-fva-coach-of-the-year-2025-2026.webp"
            alt="Paul Everett holding the conference championship plaque, honored as FVA Boys Soccer Coach of the Year in 2025 and 2026"
            width={1145}
            height={1374}
            sizes="(min-width: 768px) 380px, (max-width: 412px) calc(100vw - 32px), 380px"
            className="h-auto w-full"
          />
        </a>
        <div>
          <h2 id="coach-of-the-year-title" className="section-title">Back-to-back FVA Coach of the Year.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Congratulations to Coach Paul Everett, named Fox Valley Association Boys Soccer Coach of the Year in <strong className="font-bold text-foreground">2025 and 2026.</strong>
          </p>
          <Link href="/coaches" className="action-primary mt-7 w-fit">
            Explore our coaching history <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
