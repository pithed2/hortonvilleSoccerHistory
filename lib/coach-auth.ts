import { createHash, timingSafeEqual } from "node:crypto"

export const COACH_COOKIE = "hortonville-coach-access"
const DEFAULT_PASSWORD_HASH = "c4a1934a051d3d37e3c5028187a88682aed0c419aac400097b64904590dd5460"

function passwordHash() {
  const configured = process.env.COACH_CORNER_PASSWORD
  return configured ? createHash("sha256").update(configured).digest("hex") : DEFAULT_PASSWORD_HASH
}

export function validCoachPassword(value: string) {
  const received = createHash("sha256").update(value).digest("hex")
  const expected = passwordHash()
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected))
}

export function coachSessionToken() {
  return createHash("sha256").update(`hortonville-coach:${passwordHash()}`).digest("hex")
}

export function validCoachCookie(value?: string) {
  const expected = coachSessionToken()
  if (!value || expected.length !== value.length) return false
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected))
}
