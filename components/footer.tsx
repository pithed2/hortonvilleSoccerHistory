export function Footer() {
  return (
    <footer className="bg-foreground/95 text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-background/20">
          <img src="/logos/modern-bear-logo.png" alt="Hortonville Soccer Logo" className="h-12 w-12 object-contain" />
          <div>
            <h3 className="font-black text-lg">Hortonville Soccer</h3>
            <p className="text-sm text-background/80">Celebrating decades of passion, excellence, and community</p>
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
                <a href="#logo-evolution" className="text-background/80 hover:text-background transition">
                  Logo Evolution
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
              <li>
                <a href="#stories" className="text-background/80 hover:text-background transition">
                  Stories
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
            <h4 className="font-semibold mb-4 text-sm">Our Heritage</h4>
            <div className="flex gap-3">
              <img
                src="/logos/vintage-soccer-logo.png"
                alt="Vintage logo"
                className="h-8 w-8 object-contain opacity-80 hover:opacity-100 transition"
              />
              <img
                src="/logos/junior-polar-bears-logo.png"
                alt="Junior Bears logo"
                className="h-8 w-8 object-contain opacity-80 hover:opacity-100 transition"
              />
              <img
                src="/logos/h-bear-logo.png"
                alt="H-Bear logo"
                className="h-8 w-8 object-contain opacity-80 hover:opacity-100 transition"
              />
              <img
                src="/logos/modern-bear-logo.png"
                alt="Modern logo"
                className="h-8 w-8 object-contain opacity-80 hover:opacity-100 transition"
              />
            </div>
            <p className="text-xs text-background/70 mt-3">Four decades of visual identity</p>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <p className="text-center text-sm text-background/70">
            © 2025 Hortonville Soccer History. A living archive built by our community.
          </p>
        </div>
      </div>
    </footer>
  )
}
