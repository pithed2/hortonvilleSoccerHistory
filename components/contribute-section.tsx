import { BarChart3, Camera, PenLine } from "lucide-react"

export function ContributeSection() {
  return (
    <section id="contribute" className="py-20 md:py-32 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-balance">Help Build Our Living Archive</h2>
        <p className="text-lg font-light mb-8 max-w-2xl mx-auto text-balance text-primary-foreground/90">
          Share your photos, stories, and memories to help preserve the history of Hortonville Soccer. Your
          contributions make this a true community project.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-primary-foreground/10 rounded-lg p-6 border border-primary-foreground/20">
            <Camera className="mx-auto mb-3 h-7 w-7" aria-hidden="true" />
            <h3 className="text-xl font-black mb-2">Share Photos</h3>
            <p className="text-primary-foreground/90 text-sm">
              Upload photos from any era or event in our program's history
            </p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-6 border border-primary-foreground/20">
            <PenLine className="mx-auto mb-3 h-7 w-7" aria-hidden="true" />
            <h3 className="text-xl font-black mb-2">Tell Your Story</h3>
            <p className="text-primary-foreground/90 text-sm">
              Share memorable moments, achievements, and lessons learned
            </p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-6 border border-primary-foreground/20">
            <BarChart3 className="mx-auto mb-3 h-7 w-7" aria-hidden="true" />
            <h3 className="text-xl font-black mb-2">Contribute Data</h3>
            <p className="text-primary-foreground/90 text-sm">
              Help us compile statistics, rosters, and historical records
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-primary-foreground/80">To contribute, please fill out our Google Form:</p>
          <span className="inline-block cursor-not-allowed rounded-lg border border-primary-foreground/25 bg-primary-foreground/10 px-8 py-3 font-semibold text-primary-foreground/75">
            Contribution Form Coming Soon
          </span>
          <p className="text-xs text-primary-foreground/70 mt-4">
            Or email us directly at:{" "}
            <a className="font-semibold underline underline-offset-2" href="mailto:AndrewMMontalbano@gmail.com">
              AndrewMMontalbano@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
