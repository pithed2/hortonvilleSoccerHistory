"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  COACH_COOKIE,
  COACH_SESSION_SECONDS,
  checkCoachLoginAttempt,
  clearCoachLoginAttempts,
  coachAuthConfigured,
  coachSessionToken,
  validCoachPassword,
} from "@/lib/coach-auth"

export type LoginState = { error?: string }

export async function coachLogin(_: LoginState, formData: FormData): Promise<LoginState> {
  if (!coachAuthConfigured()) return { error: "Coach’s Corner is not configured yet." }

  const requestHeaders = await headers()
  const clientKey = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
  const attempt = checkCoachLoginAttempt(clientKey)
  if (!attempt.allowed) {
    const minutes = Math.max(1, Math.ceil(attempt.retryAfterSeconds / 60))
    return { error: `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.` }
  }
  if (!validCoachPassword(String(formData.get("password") || ""))) return { error: "That password didn’t match." }

  clearCoachLoginAttempts(clientKey)
  const token = coachSessionToken()
  const jar = await cookies()
  jar.set(COACH_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/coachs-corner", maxAge: COACH_SESSION_SECONDS })
  redirect("/coachs-corner")
}

export async function coachLogout() {
  const jar = await cookies()
  jar.delete(COACH_COOKIE)
  redirect("/coachs-corner")
}
