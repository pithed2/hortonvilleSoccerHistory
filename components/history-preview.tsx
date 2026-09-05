import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const milestones = [
  {
    year: "1998–2002",
    title: "A program takes shape",
    detail: "Pickup games, student interest, and community support laid the foundation.",
    logo: "/logos/vintage-soccer-logo.png",
    logoAlt: "Vintage Hortonville Soccer logo",
  },
  {
    year: "2013",
    title: "Conference champions",
    detail: "Hortonville captured the Bay Conference championship and began a new competitive era.",
    logo: "/logos/h-bear-logo.png",
    logoAlt: "Hortonville H-Bear logo",
  },
  {
    year: "2025–2026",
    title: "The tradition continues",
    detail: "An FVA championship, another regional title, and a new season moving the program forward.",
    logo: "/logos/modern-bear-logo-white-fill.png",
    logoAlt: "Modern Hortonville Bear logo",
  },
] as const

export function HistoryPreview() {
  return (
    <section className="relative overflow-hidden bg-[#0b0d10] py-16 text-white sm:py-20" aria-labelledby="history-preview-title">
      <div className="absolute -left-36 -top-56 size-[32rem] rounded-full border-[72px] border-primary/10" aria-hidden="true" />
      <div className="site-container relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-eyebrow">Our history</p>
            <h2 id="history-preview-title" className="section-title">Built one generation at a time</h2>
            <p className="mt-4 text-base leading-7 text-white/65 sm:text-lg">From the program’s earliest pickup games to conference championships and today’s teams, every season adds to the story.</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-white/70">
              <Link href="/fields" className="transition hover:text-white">Fields</Link>
              <Link href="/coaches" className="transition hover:text-white">Coaches</Link>
              <Link href="/coaching-records" className="transition hover:text-white">Records</Link>
            </div>
          </div>
          <Link href="/history" className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-primary/90">
            Explore Our History <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ol className="relative mt-10 grid gap-4 lg:grid-cols-3">
          {milestones.map((milestone, index) => (
            <li key={milestone.year} className="surface-card-dark relative p-6">
              {index < milestones.length - 1 ? <span className="absolute left-[calc(100%+1px)] top-9 hidden h-px w-4 bg-primary/50 lg:block" aria-hidden="true" /> : null}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-black uppercase tracking-[0.16em] text-primary">{milestone.year}</span>
                <Image src={milestone.logo} alt={milestone.logoAlt} width={44} height={44} className="size-11 object-contain" />
              </div>
              <h3 className="mt-6 text-xl font-black">{milestone.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{milestone.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
