import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { CurrentSeasonSection } from "@/components/current-season-section"
import { Timeline } from "@/components/timeline"
import { StatsSection } from "@/components/stats-section"
import { ContributeSection } from "@/components/contribute-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <CurrentSeasonSection />
      <Timeline />
      <StatsSection />
      <ContributeSection />
      <Footer />
    </main>
  )
}
