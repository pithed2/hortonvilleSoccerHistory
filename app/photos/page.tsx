import { Navigation } from "@/components/navigation"
import { PhotoGallery } from "@/components/photo-gallery"
import { Footer } from "@/components/footer"

export default function PhotosPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <PhotoGallery />
      <Footer />
    </main>
  )
}
