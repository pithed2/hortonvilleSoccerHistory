import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shared W/L/T color mapping. Loss intentionally avoids the red family so it
 * doesn't compete with the Hortonville brand red used for emphasis/actions.
 */
export function resultTone(result?: string | null) {
  const value = (result || "").toUpperCase()
  if (value === "W") return "bg-emerald-100 text-emerald-800"
  if (value === "L") return "bg-slate-200 text-slate-700"
  if (value === "T" || value === "D") return "bg-amber-100 text-amber-800"
  return "bg-muted text-muted-foreground"
}
