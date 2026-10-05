import { Navigation } from "@/components/navigation"
import { CoachesSection } from "@/components/coaches-section"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, GraduationCap } from "lucide-react"

export default function CoachesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <CoachesSection />
      <section aria-labelledby="recruiting-title" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <GraduationCap className="size-8 text-primary" aria-hidden="true" />
          <h2 id="recruiting-title" className="mt-4 text-2xl font-bold">College Recruiting</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">Explore college soccer with guidance from the HHS coaches. Find the recruiting blueprint, college fit guide and program contact directory, then bring your questions and school list to us.</p>
          <Link href="/recruiting" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">Explore college recruiting <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
