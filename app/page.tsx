import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { Timeline } from "@/components/timeline"
import { FoundingStory } from "@/components/founding-story"
import { FieldLocations } from "@/components/field-locations"
import { PhotoGallery } from "@/components/photo-gallery"
import { CoachesSection } from "@/components/coaches-section"
import { StatsSection } from "@/components/stats-section"
import { StoriesSection } from "@/components/stories-section"
import { LogoEvolution } from "@/components/logo-evolution"
import { ContributeSection } from "@/components/contribute-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Timeline />
      <FoundingStory />
      <FieldLocations />
      <PhotoGallery />
      <CoachesSection />
      <StatsSection />
      <StoriesSection />
      <LogoEvolution />
      <ContributeSection />
      <Footer />
    </main>
  )
}
