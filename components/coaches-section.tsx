import Image from "next/image"

export function CoachesSection() {
  const coaches = [
    {
      name: "Gary Ruhle",
      years: "2003-2006",
      role: "Boys Head Coach",
      description: "Established the foundation for the soccer program in its early years",
      image: "/male-coach-portrait.jpg",
    },
    {
      name: "Andy Montalbano",
      years: "2007-2010",
      role: "Boys Head Coach",
      description: "Led the program through the transition to Akin Field and established varsity legitimacy",
      image: "/male-coach-portrait.jpg",
    },
    {
      name: "Paul Everett",
      years: "2011-Present",
      role: "Boys Head Coach",
      description: "Continuing to build excellence and advocate for program growth and development",
      image: "/male-coach-portrait.jpg",
    },
  ]

  return (
    <section id="coaches" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-balance">Our Coaches</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The visionary leaders who shaped Hortonville soccer
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {coaches.map((coach) => (
            <div key={coach.name} className="group">
              <div className="relative overflow-hidden rounded-lg bg-card border border-border mb-4 h-64">
                <Image
                  src={coach.image || "/placeholder.svg"}
                  alt={coach.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-black mb-1">{coach.name}</h3>
              <p className="text-sm font-semibold text-primary mb-2">{coach.years}</p>
              <p className="text-sm font-semibold text-muted-foreground mb-2">{coach.role}</p>
              <p className="text-sm text-muted-foreground">{coach.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
