import { Navigation } from "@/components/navigation"
import { Timeline } from "@/components/timeline"
import { FoundingStory } from "@/components/founding-story"
import { KitHistory } from "@/components/kit-history"
import { StoriesSection } from "@/components/stories-section"
import { ContributeSection } from "@/components/contribute-section"
import { Footer } from "@/components/footer"

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Timeline />
      <FoundingStory />
      <KitHistory />
      <StoriesSection />
      <ContributeSection />
      <Footer />
    </main>
  )
}