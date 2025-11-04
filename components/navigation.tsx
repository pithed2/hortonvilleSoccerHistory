"use client"

import { useState } from "react"
import Link from "next/link"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: "History", href: "#timeline" },
    { label: "Logo Evolution", href: "#logo-evolution" },
    { label: "Photos", href: "#gallery" },
    { label: "Coaches", href: "#coaches" },
    { label: "Stats", href: "#stats" },
    { label: "Stories", href: "#stories" },
    { label: "Contribute", href: "#contribute" },
  ]

  const secondaryNavItems = [
    { label: "Season Stats", href: "/stats" },
    { label: "Coaching Records", href: "/coaching-records" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <img src="/logos/modern-bear-logo.png" alt="Hortonville Soccer Logo" className="h-10 w-10 object-contain" />
            <span className="hidden sm:inline">HORTONVILLE SOCCER</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-medium hover:opacity-80 transition-opacity">
                {item.label}
              </a>
            ))}
            <div className="h-4 w-px bg-primary-foreground/30"></div>
            {secondaryNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium hover:opacity-80 transition-opacity"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden flex flex-col gap-1.5">
            <span
              className={`block h-0.5 w-6 bg-primary-foreground transition-transform ${isOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span className={`block h-0.5 w-6 bg-primary-foreground transition-opacity ${isOpen ? "opacity-0" : ""}`} />
            <span
              className={`block h-0.5 w-6 bg-primary-foreground transition-transform ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="my-2 mx-4 h-px bg-primary-foreground/30"></div>
            {secondaryNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-sm font-medium hover:bg-primary-foreground/10 rounded transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
