import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { TeamSelector } from "@/components/team-selector"
import { CurrentSeasonSection } from "@/components/current-season-section"
import { SocialFeedSection } from "@/components/social-feed-section"
import { HistoryPreview } from "@/components/history-preview"
import { StatsSection } from "@/components/stats-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <TeamSelector />
      <CurrentSeasonSection />
      <SocialFeedSection />
      <HistoryPreview />
      <StatsSection />
      <Footer />
    </main>
  )
}
