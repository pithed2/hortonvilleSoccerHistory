export function Timeline() {
  const eras = [
    {
      period: "1980s",
      title: "The Beginning",
      description: "The founding of Hortonville Soccer, establishing the first fields and coaching staff",
      milestone: "Inaugural Season",
      logo: "/logos/vintage-soccer-logo.png",
      logoAlt: "Vintage Hortonville Soccer Logo",
    },
    {
      period: "1990s",
      title: "Growth Years",
      description: "Expansion to multiple age groups and the establishment of core program values",
      milestone: "First Championship",
      logo: "/logos/junior-polar-bears-logo.png",
      logoAlt: "Junior Polar Bears Logo",
    },
    {
      period: "2000s",
      title: "Golden Era",
      description: "Peak performance years with multiple championship runs and record participation",
      milestone: "5 State Titles",
      logo: "/logos/h-bear-logo.png",
      logoAlt: "H-Bear Badge Logo",
    },
    {
      period: "2010s",
      title: "Modern Era",
      description: "Modernization of facilities, coaching methods, and community engagement",
      milestone: "New Field Complex",
      logo: "/logos/modern-bear-logo.png",
      logoAlt: "Modern Bear Logo",
    },
    {
      period: "2020s",
      title: "The Future",
      description: "Building on legacy with next generation of players and coaches",
      milestone: "Continuing Excellence",
      logo: "/logos/modern-bear-logo.png",
      logoAlt: "Modern Bear Logo",
    },
  ]

  return (
    <section id="timeline" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-balance">Our Journey Through Time</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From the founding vision to today's thriving community
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 md:gap-4">
          {eras.map((era, index) => (
            <div key={era.period} className="relative flex flex-col">
              {/* Connecting line */}
              {index < eras.length - 1 && (
                <div className="hidden md:block absolute top-24 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-0.5 bg-primary/20" />
              )}

              <div className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 transition-colors relative z-10">
                <div className="flex justify-center mb-4">
                  <img src={era.logo || "/placeholder.svg"} alt={era.logoAlt} className="h-16 w-16 object-contain" />
                </div>

                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm mb-4 mx-auto">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-black text-primary mb-2 text-center">{era.period}</h3>
                <h4 className="font-semibold text-foreground mb-2 text-center">{era.title}</h4>
                <p className="text-sm text-muted-foreground mb-3 text-center">{era.description}</p>
                <div className="pt-3 border-t border-border text-center">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">{era.milestone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
