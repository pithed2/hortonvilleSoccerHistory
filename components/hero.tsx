export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-20 md:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <img
            src="/logos/modern-bear-logo.png"
            alt="Hortonville Soccer Bear Logo"
            className="h-24 md:h-32 w-auto drop-shadow-lg"
          />
        </div>

        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-balance">
            Decades of Passion & Excellence
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto text-balance text-primary-foreground/90">
            Celebrating the rich history, unforgettable moments, and incredible people of the Hortonville Soccer Program
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#gallery"
              className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Explore Photos
            </a>
            <a
              href="#logo-evolution"
              className="border-2 border-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary-foreground/10 transition-colors"
            >
              See Our Evolution
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
