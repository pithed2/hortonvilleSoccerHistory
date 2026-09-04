import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto"

export const COACH_COOKIE = "hortonville-coach-access"
export const COACH_SESSION_SECONDS = 60 * 60 * 12

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_ATTEMPT_LIMIT = 5
const attempts = new Map<string, { count: number; resetAt: number }>()

function coachPassword() {
  return process.env.COACH_CORNER_PASSWORD?.trim() || null
}

function sessionSecret() {
  return process.env.COACH_SESSION_SECRET?.trim() || null
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export function coachAuthConfigured() {
  return Boolean(coachPassword() && sessionSecret())
}

export function validCoachPassword(value: string) {
  const configured = coachPassword()
  if (!configured) return false
  const received = createHash("sha256").update(value).digest("hex")
  const expected = createHash("sha256").update(configured).digest("hex")
  return safeEqual(received, expected)
}

export function coachSessionToken() {
  const secret = sessionSecret()
  if (!secret) throw new Error("COACH_SESSION_SECRET is not configured")
  const expiresAt = Math.floor(Date.now() / 1000) + COACH_SESSION_SECONDS
  const payload = `${expiresAt}.${randomBytes(16).toString("hex")}`
  const signature = createHmac("sha256", secret).update(payload).digest("hex")
  return `${payload}.${signature}`
}

export function validCoachCookie(value?: string) {
  const secret = sessionSecret()
  if (!value || !secret) return false
  const [expiresAt, nonce, receivedSignature, ...extra] = value.split(".")
  if (!expiresAt || !nonce || !receivedSignature || extra.length) return false
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false
  const expectedSignature = createHmac("sha256", secret).update(`${expiresAt}.${nonce}`).digest("hex")
  return safeEqual(receivedSignature, expectedSignature)
}

export function checkCoachLoginAttempt(clientKey: string) {
  const now = Date.now()
  const current = attempts.get(clientKey)
  if (!current || current.resetAt <= now) {
    attempts.set(clientKey, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return { allowed: true, retryAfterSeconds: 0 }
  }
  if (current.count >= LOGIN_ATTEMPT_LIMIT) {
    return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) }
  }
  current.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

export function clearCoachLoginAttempts(clientKey: string) {
  attempts.delete(clientKey)
}
