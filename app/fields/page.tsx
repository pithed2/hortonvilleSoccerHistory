import { Navigation } from "@/components/navigation"
import { FieldLocations } from "@/components/field-locations"
import { Footer } from "@/components/footer"

export default function FieldsPage() {
  return (
    <><Navigation /><main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <FieldLocations />
      </main><Footer /></>
  )
}
