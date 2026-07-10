export function Footer() {
  return (
    <footer className="bg-foreground/95 text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-background/20">
          <img src="/logos/modern-bear-logo.png" alt="Hortonville Soccer Logo" className="h-12 w-12 object-contain" />
          <div>
            <h3 className="font-black text-lg">Hortonville Soccer</h3>
            <p className="text-sm text-background/80">The teams, fields, coaches, records, and stories that shaped the Hortonville Soccer Program</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#timeline" className="text-background/80 hover:text-background transition">
                  History
                </a>
              </li>
              <li>
                <a href="/history#kits" className="text-background/80 hover:text-background transition">
                  Kit History
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-background/80 hover:text-background transition">
                  Photos
                </a>
              </li>
              <li>
                <a href="#coaches" className="text-background/80 hover:text-background transition">
                  Coaches
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-background/80 hover:text-background transition">
                  Google Photos Album
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition">
                  Google Drive Archive
                </a>
              </li>
              <li>
                <a href="#" className="text-background/80 hover:text-background transition">
                  Looker Studio Dashboard
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-background/80">Email: info@hortonvillesoccer.com</li>
              <li className="text-background/80">Phone: (555) 123-4567</li>
              <li>
                <a href="#contribute" className="text-background hover:text-background/80 transition font-semibold">
                  Contribute
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Kit Archive</h4>
            <p className="text-sm text-background/80 leading-relaxed">
              We are documenting nearly 20 Hortonville soccer kits, from early uniforms to the modern home, away, warmup, and cold-weather sets.
            </p>
            <a href="/history#kits" className="inline-block mt-3 text-sm text-background hover:text-background/80 font-semibold">
              View kit history
            </a>
          </div>
        </div>
        <div className="border-t border-background/20 pt-8">
          <p className="text-center text-sm text-background/70">
            © 2026 Hortonville Soccer History. A living archive built by our community.
          </p>
        </div>
      </div>
    </footer>
  )
}
