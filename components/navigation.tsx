"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const navItems = [
  { label: "History", href: "/history" },
  { label: "Fields", href: "/fields" },
  { label: "Coaches", href: "/coaches" },
  { label: "Stats", href: "/stats" },
  { label: "Seasons", href: "/seasons" },
]

const secondaryNavItems = [{ label: "Coaching Records", href: "/coaching-records" }]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => setIsOpen(false), [pathname])

  function isActive(href: string) {
    if (href === "/seasons" && pathname.startsWith("/head-to-head")) return true
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  function navLinkClass(href: string, mobile = false) {
    const active = isActive(href)
    return mobile
      ? `block rounded-lg border-l-4 px-4 py-3 text-sm font-semibold transition-colors ${active ? "border-white bg-white/15 text-white" : "border-transparent hover:bg-white/10"}`
      : `relative py-2 text-sm font-semibold transition-opacity after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-white after:transition-transform ${active ? "text-white after:scale-x-100" : "text-white/85 after:scale-x-0 hover:text-white hover:after:scale-x-100"}`
  }

  return (
    <>
    <nav aria-label="Primary navigation" className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-xl font-bold tracking-tight transition-opacity hover:opacity-80" aria-label="Hortonville Soccer home">
            <img src="/logos/modern-bear-logo-white-fill.png" alt="" className="h-10 w-10 object-contain" />
            <span className="hidden sm:inline">HORTONVILLE SOCCER</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => <Link key={item.href} href={item.href} className={navLinkClass(item.href)} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>)}
            <div className="h-5 w-px bg-white/30" aria-hidden="true" />
            {secondaryNavItems.map((item) => <Link key={item.href} href={item.href} className={navLinkClass(item.href)} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>)}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            <span className="flex flex-col gap-1.5" aria-hidden="true">
              <span className={`block h-0.5 w-6 bg-white transition-transform ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-opacity ${isOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-transform ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>

        <div id="mobile-navigation" className={`${isOpen ? "block" : "hidden"} space-y-1 border-t border-white/20 pb-4 pt-3 md:hidden`}>
          {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={navLinkClass(item.href, true)} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>)}
          <div className="my-2 h-px bg-white/20" aria-hidden="true" />
          {secondaryNavItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={navLinkClass(item.href, true)} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>)}
        </div>
      </div>
    </nav>
    <span id="main-content" tabIndex={-1} className="block scroll-mt-16 outline-none" />
    </>
  )
}
