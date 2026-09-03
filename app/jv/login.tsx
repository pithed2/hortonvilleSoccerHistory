"use client"

import { useActionState } from "react"
import { LockKeyhole, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jvLogin } from "./actions"

export function JvLogin() {
  const [state, action, pending] = useActionState(jvLogin, {})
  return <main id="main-content" className="min-h-[calc(100vh-5rem)] overflow-hidden bg-[#080c13] text-white">
    <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-14 px-6 py-12 lg:grid-cols-[1.1fr_.9fr] lg:px-10">
      <div className="max-w-2xl"><p className="mb-4 text-sm font-semibold uppercase tracking-[.22em] text-slate-400">Private team access</p><h1 className="text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-7xl">JV season,<span className="block text-red-500">inside the program.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">Follow scores, schedule, team totals, player leaders, and game box scores as the 2026 season unfolds.</p><div className="mt-9 flex gap-2 text-sm text-slate-400"><ShieldCheck className="size-4 text-red-400" /> Family and team access</div></div>
      <div className="w-full max-w-md justify-self-end rounded-[28px] border border-white/10 bg-slate-950/65 p-7 shadow-2xl sm:p-9"><div className="mb-7 grid size-12 place-items-center rounded-2xl bg-red-600"><LockKeyhole className="size-5" /></div><h2 className="text-2xl font-bold">Enter the JV site</h2><p className="mt-2 text-sm leading-6 text-slate-400">Use the season password shared with players and families.</p><form action={action} className="mt-7 space-y-4"><div><label htmlFor="jv-password" className="mb-2 block text-xs font-bold uppercase tracking-[.16em] text-slate-400">Season password</label><Input id="jv-password" name="password" type="password" autoComplete="current-password" required autoFocus className="h-12 border-white/10 bg-white/5 px-4 text-white" /></div>{state.error ? <p role="alert" className="text-sm font-medium text-red-400">{state.error}</p> : null}<Button disabled={pending} type="submit" size="lg" className="h-12 w-full bg-red-600 text-base font-bold text-white hover:bg-red-500">{pending ? "Checking…" : "Unlock season stats"}</Button></form></div>
    </section>
  </main>
}
