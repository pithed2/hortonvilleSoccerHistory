export function KitHistory() {
  const kitEras = [
    {
      era: "Early Years",
      title: "Getting The Program Outfitted",
      description:
        "The earliest uniforms reflected a young program still building its resources, identity, and equipment base.",
    },
    {
      era: "Growth Years",
      title: "Home And Away Identity",
      description:
        "As the program matured, the kit collection began to better support varsity competition, travel, and a clearer team identity.",
    },
    {
      era: "Modern Era",
      title: "A Full Program Kit Room",
      description:
        "The program now has enough equipment depth to support up to four teams, including home and away kits, warmups, and cold-weather gear.",
    },
    {
      era: "Archive In Progress",
      title: "Documenting 20+ Years of Kits",
      description:
        "Photos and details from past uniforms are still being gathered. This section will grow as more kits are photographed and dated.",
    },
  ]

  return (
    <section id="kits" className="py-12 md:py-16 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Kit History</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From early uniforms to a deep modern kit collection, Hortonville soccer’s look has changed with the program.
            <br /><br />Plan here is to give a visual walk through of all the kits over the course of the program.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {kitEras.map((kit) => (
            <div key={kit.title} className="bg-muted/30 rounded-lg p-6 border border-border/50">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{kit.era}</p>
              <h3 className="text-lg font-bold mb-2">{kit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{kit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}