"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { COACH_COOKIE, coachSessionToken, validCoachPassword } from "@/lib/coach-auth"

export type LoginState = { error?: string }

export async function coachLogin(_: LoginState, formData: FormData): Promise<LoginState> {
  if (!validCoachPassword(String(formData.get("password") || ""))) return { error: "That password didn’t match." }

  const token = coachSessionToken()
  const jar = await cookies()
  jar.set(COACH_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/coachs-corner", maxAge: 60 * 60 * 12 })
  redirect("/coachs-corner")
}

export async function coachLogout() {
  const jar = await cookies()
  jar.delete(COACH_COOKIE)
  redirect("/coachs-corner")
}
