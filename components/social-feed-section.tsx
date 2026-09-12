import { Facebook, Instagram } from "lucide-react"

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61588501114059", icon: Facebook },
  { name: "Instagram", href: "https://www.instagram.com/hortonvillesoccer/", icon: Instagram },
]

export function SocialFeedSection() {
  return (
    <section className="border-t bg-muted/20 py-6" aria-label="Social media">
      <div className="site-container flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-bold">Follow Hortonville Boys Soccer</p>
        <div className="flex flex-wrap gap-3">
          {socialLinks.map(({ name, href, icon: Icon }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <Icon className="size-5" aria-hidden="true" />
              {name}<span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
