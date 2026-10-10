import type { ReactNode } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
export function PolicyPage({ title, children }: { title: string; children: ReactNode }) {
  return <><Navigation /><main id="main-content" tabIndex={-1} className="site-container max-w-3xl py-12"><h1 className="text-4xl font-black">{title}</h1><p className="mt-3 text-sm text-muted-foreground">Updated October 9, 2026</p><div className="mt-8 space-y-6 text-base leading-7 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_a]:underline [&_a]:underline-offset-4">{children}</div></main><Footer /></>
}
