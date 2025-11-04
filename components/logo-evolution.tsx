export function LogoEvolution() {
  const logos = [
    {
      era: "1998-2004",
      title: "H-Bear Badge",
      description: "The early athletic design combining the 'H' for Hortonville with the bear mascot.",
      image: "/logos/h-bear-logo.png",
      alt: "H-Bear Badge Logo",
    },
    {
      era: "2005-2018",
      title: "Vintage Soccer Logo",
      description:
        "The classic soccer ball design with elegant script lettering representing the program's established identity.",
      image: "/logos/vintage-soccer-logo.png",
      alt: "Vintage Hortonville Soccer Logo",
    },
    {
      era: "2018-Present",
      title: "Modern Bear Logo",
      description:
        "The current fierce bear mascot with soccer ball detail, representing competitive growth and evolution.",
      image: "/logos/modern-bear-logo.png",
      alt: "Modern Hortonville Bear Logo",
    },
    {
      era: "One-Time Camp Logo",
      title: "Junior Polar Bears",
      description: "A special mascot designed for youth development camps.",
      image: "/logos/junior-polar-bears-logo.png",
      alt: "Junior Polar Bears Logo",
    },
  ]

  return (
    <section id="logo-evolution" className="py-12 md:py-16 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Logo Evolution</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {logos.slice(0, 3).map((logo, index) => (
            <div key={index} className="flex flex-col items-center bg-muted/30 rounded-lg p-6 border border-border/50">
              <div className="mb-4 flex-shrink-0">
                <img src={logo.image || "/placeholder.svg"} alt={logo.alt} className="h-24 w-24 object-contain" />
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{logo.era}</p>
              <h3 className="text-lg font-bold text-foreground mb-2 text-center">{logo.title}</h3>
              <p className="text-muted-foreground text-xs text-center leading-relaxed">{logo.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-xs mx-auto bg-muted/20 rounded-lg p-4 border border-border/50 text-center">
          <div className="mb-3">
            <img
              src={logos[3].image || "/placeholder.svg"}
              alt={logos[3].alt}
              className="h-20 w-20 object-contain mx-auto"
            />
          </div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{logos[3].era}</p>
          <h3 className="text-base font-bold text-foreground mb-1">{logos[3].title}</h3>
          <p className="text-muted-foreground text-xs">{logos[3].description}</p>
        </div>
      </div>
    </section>
  )
}
