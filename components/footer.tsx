import { Facebook, Instagram } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-foreground/95 text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-background/20">
          <img src="/logos/modern-bear-logo-white-fill.png" alt="Hortonville Boys Soccer logo" className="h-12 w-12 object-contain" />
          <div>
            <h3 className="font-black text-lg">Hortonville Boys Soccer</h3>
            <p className="text-sm text-background/80">Current teams, schedules, results, statistics, and the archive of the program that came before.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/history" className="text-background/80 hover:text-background transition">
                  History
                </a>
              </li>
              <li>
                <a href="/coaches" className="text-background/80 hover:text-background transition">
                  Coaches
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Follow the Team</h4>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/hortonvillesoccer/" target="_blank" rel="noreferrer" aria-label="Hortonville Boys Soccer on Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-background/10 text-background transition hover:bg-background hover:text-foreground">
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61588501114059" target="_blank" rel="noreferrer" aria-label="Hortonville Boys Soccer on Facebook" className="flex h-11 w-11 items-center justify-center rounded-full bg-background/10 text-background transition hover:bg-background hover:text-foreground">
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-background/70">Current news, match-day updates, photos, and program announcements.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:AndrewMMontalbano@gmail.com"
                  className="text-background/80 hover:text-background transition"
                >
                  AndrewMMontalbano@gmail.com
                </a>
              </li>
              <li>
                <a href="/#contribute" className="text-background hover:text-background/80 transition font-semibold">
                  Contribute
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Current Season</h4>
            <p className="text-sm text-background/80 leading-relaxed">
              Follow the 2026 varsity team with the latest schedule, results, roster, and player statistics.
            </p>
            <a href="/seasons/2026" className="inline-block mt-3 text-sm text-background hover:text-background/80 font-semibold">
              View the 2026 season
            </a>
          </div>
        </div>
        <div className="border-t border-background/20 pt-8">
          <p className="text-center text-sm text-background/70">
            Copyright {currentYear} Hortonville Boys Soccer. Built for the program and its community.
          </p>
        </div>
      </div>
    </footer>
  )
}
