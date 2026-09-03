import { createHash, timingSafeEqual } from "node:crypto"

export const JV_COOKIE = "hortonville-jv-access"
const DEFAULT_PASSWORD_HASH = "61ff6535116570c4abf2755b09da7b73ae2f6194651845fbb37c8b6bfe807d0d"

function passwordHash() {
  const configured = process.env.JV_SITE_PASSWORD
  return configured ? createHash("sha256").update(configured).digest("hex") : DEFAULT_PASSWORD_HASH
}

export function validJvPassword(value: string) {
  const received = createHash("sha256").update(value).digest("hex")
  const expected = passwordHash()
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected))
}

export function jvSessionToken() {
  return createHash("sha256").update(`hortonville-jv:${passwordHash()}`).digest("hex")
}

export function validJvCookie(value?: string) {
  const expected = jvSessionToken()
  if (!value || expected.length !== value.length) return false
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected))
}
