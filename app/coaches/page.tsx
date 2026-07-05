import { Navigation } from "@/components/navigation"
import { CoachesSection } from "@/components/coaches-section"
import { Footer } from "@/components/footer"

export default function CoachesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <CoachesSection />
      <Footer />
    </main>
  )
}