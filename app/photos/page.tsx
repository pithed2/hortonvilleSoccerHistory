import { Navigation } from "@/components/navigation"
import { PhotoGallery } from "@/components/photo-gallery"
import { ContributeSection } from "@/components/contribute-section"
import { Footer } from "@/components/footer"

export default function PhotosPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <PhotoGallery />
      <ContributeSection />
      <Footer />
    </main>
  )
}
