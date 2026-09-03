"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { JV_COOKIE, jvSessionToken, validJvPassword } from "@/lib/jv-auth"

export type JvLoginState = { error?: string }

export async function jvLogin(_: JvLoginState, formData: FormData): Promise<JvLoginState> {
  if (!validJvPassword(String(formData.get("password") || ""))) return { error: "That password didn’t match." }
  const jar = await cookies()
  jar.set(JV_COOKIE, jvSessionToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/jv", maxAge: 60 * 60 * 12 })
  redirect("/jv")
}

export async function jvLogout() {
  const jar = await cookies()
  jar.delete(JV_COOKIE)
  redirect("/jv")
}
