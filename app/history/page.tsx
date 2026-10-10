import { Navigation } from "@/components/navigation"
import { Timeline } from "@/components/timeline"
import { FoundingStory } from "@/components/founding-story"
import { Footer } from "@/components/footer"


export default function HistoryPage() {
  return (
    <><Navigation /><main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <Timeline />
      <FoundingStory />
      </main><Footer /></>
  )
}
