import "server-only"

/**
 * The Card Studio stays in browser-only demo mode until its database is
 * explicitly approved. Production requires a separate, additional opt-in.
 * Do not enable either flag until the target database is isolated and backed up.
 */
export function cardStudioWritesEnabled() {
  if (process.env.CARD_STUDIO_WRITES_ENABLED !== "true") return false
  if (process.env.VERCEL_ENV === "production") {
    return process.env.CARD_STUDIO_PRODUCTION_WRITES_ENABLED === "true"
  }
  return true
}
