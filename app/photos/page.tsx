import { Navigation } from "@/components/navigation"
import { PhotoGallery } from "@/components/photo-gallery"
import { Footer } from "@/components/footer"

export default function PhotosPage() {
  return (
    <><Navigation /><main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <PhotoGallery />
      </main><Footer /></>
  )
}
