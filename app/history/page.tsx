import { Navigation } from "@/components/navigation"
import { Timeline } from "@/components/timeline"
import { FoundingStory } from "@/components/founding-story"
import { Footer } from "@/components/footer"


export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Timeline />
      <FoundingStory />
      <Footer />
    </main>
  )
}
