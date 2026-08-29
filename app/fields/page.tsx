import { Navigation } from "@/components/navigation"
import { FieldLocations } from "@/components/field-locations"
import { Footer } from "@/components/footer"

export default function FieldsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <FieldLocations />
      <Footer />
    </main>
  )
}
