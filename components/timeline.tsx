export function Timeline() {
  const eras = [
    {
      period: "1998-2002",
      title: "Pickup Games Become a Program",
      description:
        "Hortonville soccer grew from pickup games, student interest, staff support, club connections, and the push toward a school team.",
      milestone: "Early story from Patrick Koss",
      logo: "/logos/vintage-soccer-logo.png",
      logoAlt: "Vintage Hortonville Soccer Logo",
    },
    {
      period: "2003",
      title: "Polar Bear Camp Begins",
      description:
        "The Polar Bear Camp tradition began with Jean Wagner and Lorie Claybaugh at Greenville Middle School Field, later continuing through Fox West YMCA support and newer Hortonville facilities.",
      milestone: "Youth camp tradition established",
      logo: "/logos/junior-polar-bears-logo.png",
      logoAlt: "Junior Polar Bears Logo",
    },
    {
      period: "2003-2012",
      title: "Varsity Records and Facilities Growth",
      description:
        "The current boys game archive begins in 2003. These years built varsity legitimacy through competition, field changes, Akin Stadium access, and growing equipment needs.",
      milestone: "Game records begin",
      logo: "/logos/h-bear-logo.png",
      logoAlt: "H-Bear Badge Logo",
    },
    {
      period: "2013-2020",
      title: "Conference and Postseason Breakthroughs",
      description:
        "The boys program won the 2013 Bay Conference championship, added regional titles in 2019 and 2020, and came within one game of state in both 2019 and 2020.",
      milestone: "2013 Bay Conference champions",
      logo: "/logos/modern-bear-logo-red-fill.png",
      logoAlt: "Modern Bear Logo",
    },
    {
      period: "2021-2025",
      title: "FVA Success and a Living Archive",
      description:
        "The boys program added regional championships in 2023 and 2025, won the 2025 Fox Valley Association championship, and reached as high as seventh in the WSCA Division 1 rankings.",
      milestone: "2025 FVA champions",
      logo: "/logos/modern-bear-logo-red-fill.png",
      logoAlt: "Modern Bear Logo",
    },
  ]

  return (
    <section id="timeline" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-balance">Our Journey Through Time</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A working timeline built from verified records, remembered stories, and the archive still being gathered
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

        <p className="mt-10 text-sm text-muted-foreground text-center max-w-3xl mx-auto">
          This archive currently has the deepest verified records for the boys program. Girls program history and records
          are still being gathered and will be expanded as more complete information becomes available.
        </p>
      </div>
    </section>
  )
}
