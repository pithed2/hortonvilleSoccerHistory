"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronDown, LockKeyhole } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navGroups = [
  {
    label: "Teams",
    links: [
      { label: "2026 Varsity", href: "/seasons/2026" },
      { label: "JV Teams", href: "/jv" },
    ],
  },
  {
    label: "History",
    links: [
      { label: "Program History", href: "/history" },
      { label: "Fields", href: "/fields" },
      { label: "Season Archive", href: "/seasons" },
    ],
  },
  {
    label: "Stats",
    links: [
      { label: "Season Statistics", href: "/stats" },
      { label: "All-Time Leaders", href: "/stats/leaders" },
      { label: "Head to Head", href: "/head-to-head" },
    ],
  },
  {
    label: "Coaches",
    links: [
      { label: "Coaching History", href: "/coaches" },
      { label: "Coaching Records", href: "/coaching-records" },
    ],
  },
] as const

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  function groupIsActive(links: readonly { href: string }[]) {
    return links.some((link) => isActive(link.href))
  }

  return (
    <>
      <nav aria-label="Primary navigation" className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-6">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex min-w-0 items-center gap-3 text-xl font-bold tracking-tight transition-opacity hover:opacity-85" aria-label="Hortonville Boys Soccer home">
              <Image src="/logos/modern-bear-logo-white-fill.png" alt="" width={40} height={40} className="size-10 shrink-0 object-contain" priority />
              <span className="hidden truncate sm:inline">HORTONVILLE BOYS SOCCER</span>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {navGroups.map((group) => {
                const active = groupIsActive(group.links)
                return (
                  <div key={group.label} className="group relative">
                    <button type="button" className={`flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-bold transition-colors ${active ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10 hover:text-white"}`} aria-haspopup="true">
                      {group.label}<ChevronDown className="size-4 transition-transform group-focus-within:rotate-180 group-hover:rotate-180" aria-hidden="true" />
                    </button>
                    <div className="invisible absolute left-0 top-full w-56 translate-y-1 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="rounded-xl border border-black/10 bg-white p-2 text-foreground shadow-xl">
                        {group.links.map((link) => (
                          <Link key={link.href} href={link.href} className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActive(link.href) ? "bg-primary/10 text-primary" : "hover:bg-muted"}`} aria-current={isActive(link.href) ? "page" : undefined}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="ml-2 h-6 w-px bg-white/30" aria-hidden="true" />
              <Link href="/coachs-corner" className={`ml-2 inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition-colors ${isActive("/coachs-corner") ? "border-white bg-white text-primary" : "border-white/40 text-white hover:border-white hover:bg-white/10"}`} aria-current={isActive("/coachs-corner") ? "page" : undefined}>
                <LockKeyhole className="size-4" aria-hidden="true" /> Coach’s Corner
              </Link>
            </div>

            <button type="button" onClick={() => setIsOpen((open) => !open)} className="flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden" aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isOpen} aria-controls="mobile-navigation">
              <span className="flex flex-col gap-1.5" aria-hidden="true">
                <span className={`block h-0.5 w-6 bg-white transition-transform ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
                <span className={`block h-0.5 w-6 bg-white transition-opacity ${isOpen ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-6 bg-white transition-transform ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
              </span>
            </button>
          </div>

          <div id="mobile-navigation" className={`${isOpen ? "block" : "hidden"} max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/20 pb-5 pt-3 lg:hidden`}>
            <div className="grid gap-4 sm:grid-cols-2">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-3 pb-1 text-xs font-black uppercase tracking-[0.16em] text-white/55">{group.label}</p>
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={`block rounded-lg border-l-4 px-3 py-2.5 text-sm font-semibold transition-colors ${isActive(link.href) ? "border-white bg-white/15 text-white" : "border-transparent text-white/85 hover:bg-white/10 hover:text-white"}`} aria-current={isActive(link.href) ? "page" : undefined}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-white/20 pt-4">
              <Link href="/coachs-corner" onClick={() => setIsOpen(false)} className="flex min-h-11 items-center gap-2 rounded-lg border border-white/40 px-4 text-sm font-bold text-white hover:bg-white/10">
                <LockKeyhole className="size-4" aria-hidden="true" /> Coach’s Corner
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <span id="main-content" tabIndex={-1} className="block scroll-mt-16 outline-none" />
    </>
  )
}
