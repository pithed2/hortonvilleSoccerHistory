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
            <h3 className="text-xl font-black mb-2">📸 Share Photos</h3>
            <p className="text-primary-foreground/90 text-sm">
              Upload photos from any era or event in our program's history
            </p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-6 border border-primary-foreground/20">
            <h3 className="text-xl font-black mb-2">📝 Tell Your Story</h3>
            <p className="text-primary-foreground/90 text-sm">
              Share memorable moments, achievements, and lessons learned
            </p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-6 border border-primary-foreground/20">
            <h3 className="text-xl font-black mb-2">📊 Contribute Data</h3>
            <p className="text-primary-foreground/90 text-sm">
              Help us compile statistics, rosters, and historical records
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-primary-foreground/80">To contribute, please fill out our Google Form:</p>
          <a
            href="#"
            className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Open Contribution Form
          </a>
          <p className="text-xs text-primary-foreground/70 mt-4">
            Or email us directly at: hortonville.soccer@example.com
          </p>
        </div>
      </div>
    </section>
  )
}
