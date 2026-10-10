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
            <p className="text-sm text-background/80">Independent community website with team information and program history. Not an official school or district website.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#important-links" className="text-background/80 hover:text-background transition">
                  Important Links
                </a>
              </li>
              <li>
                <a href="/jv" className="text-background/80 hover:text-background transition">
                  JV Teams
                </a>
              </li>
              <li>
                <a href="/history" className="text-background/80 hover:text-background transition">
                  History
                </a>
              </li>
              <li>
                <a href="/fields" className="text-background/80 hover:text-background transition">
                  Fields
                </a>
              </li>
              <li>
                <a href="/seasons" className="text-background/80 hover:text-background transition">
                  Season Archive
                </a>
              </li>
              <li>
                <a href="/stats" className="text-background/80 hover:text-background transition">
                  Season Statistics
                </a>
              </li>
              <li>
                <a href="/stats/leaders" className="text-background/80 hover:text-background transition">
                  All-Time Leaders
                </a>
              </li>
              <li>
                <a href="/head-to-head" className="text-background/80 hover:text-background transition">
                  Head to Head
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Coaches</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/coaches" className="text-background/80 hover:text-background transition">Coaching History</a></li>
              <li><a href="/coaching-records" className="text-background/80 hover:text-background transition">Coaching Records</a></li>
              <li><a href="/recruiting" className="text-background/80 hover:text-background transition">College Recruiting</a></li>
              <li><a href="/recruiting#downloads" className="text-background/80 hover:text-background transition">Recruiting Guide &amp; Directory</a></li>
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
            <h4 className="font-semibold mb-4 text-sm">Contact</h4><p className="mb-3 text-sm text-background/80">Site operator: Andrew Montalbano<br />Hortonville, WI 54944</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:andrewmmontalbano@gmail.com"
                  className="text-background/80 hover:text-background transition"
                >
                  andrewmmontalbano@gmail.com
                </a>
              </li>
              <li>
                <a href="mailto:andrewmmontalbano@gmail.com?subject=Contributing%20to%20the%20archive" className="text-background hover:text-background/80 transition font-semibold">
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
          <nav aria-label="Policies and contact" className="mb-5 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm underline underline-offset-4">
            <a href="/privacy">Privacy Policy</a><a href="/terms">Terms and Conditions</a><a href="/cookies">Cookie Policy</a><a href="/accessibility">Accessibility</a><a href="/contact">Contact and corrections</a>
          </nav>
          <p className="text-center text-sm text-background/70">
            © {currentYear} Site content; third-party materials belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  )
}
