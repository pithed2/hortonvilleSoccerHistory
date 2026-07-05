import { Navigation } from "@/components/navigation"
import { Timeline } from "@/components/timeline"
import { FoundingStory } from "@/components/founding-story"
import { LogoEvolution } from "@/components/logo-evolution"
import { StoriesSection } from "@/components/stories-section"
import { ContributeSection } from "@/components/contribute-section"
import { Footer } from "@/components/footer"

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Timeline />
      <FoundingStory />
      <LogoEvolution />
      <StoriesSection />
      <ContributeSection />
      <Footer />
    </main>
  )
}