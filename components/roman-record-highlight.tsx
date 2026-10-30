import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function RomanRecordHighlight() {
  return (
    <section className="border-b bg-background py-12 sm:py-16" aria-labelledby="roman-record-title">
      <div className="site-container grid items-center gap-8 md:grid-cols-[minmax(0,380px)_1fr] lg:gap-16">
        <a href="/images/roman-glad-career-records-2026.webp" className="mx-auto block w-full max-w-[380px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label="Open Roman Glad’s commemorative graphic at full size">
          <Image
            src="/images/roman-glad-career-records-2026.webp"
            alt="Roman Glad, number 17, on his Hortonville Polar Bears career record poster"
            width={1092}
            height={1440}
            sizes="(min-width: 768px) 380px, (max-width: 412px) calc(100vw - 32px), 380px"
            className="h-auto w-full"
          />
        </a>
        <div>
          <h2 id="roman-record-title" className="section-title">Roman Glad makes Hortonville history.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            A new standard for Polar Bear boys soccer. Roman is the program’s all-time leader in career goals and points, and ranks fifth in career assists.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Across his 2023–2026 career: <strong className="font-bold text-foreground">60 goals, 147 points, and 27 assists.</strong>
          </p>
          <Link href="/stats/leaders" className="action-primary mt-7 w-fit">
            Explore the all-time leaders <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a href="/images/roman-glad-career-records-2026.webp" className="mt-5 block w-fit text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            View the commemorative graphic (before the Regional final)
          </a>
        </div>
      </div>
    </section>
  )
}
