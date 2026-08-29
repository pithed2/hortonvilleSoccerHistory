"use client"

import { useActionState } from "react"
import { LockKeyhole } from "lucide-react"
import { coachLogin } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CoachLogin() {
  const [state, action, pending] = useActionState(coachLogin, {})
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center bg-[radial-gradient(circle_at_top,#fee2e2,transparent_45%)] px-4">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl">
        <div className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><LockKeyhole /></div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Hortonville Soccer</p>
        <h1 className="mt-2 text-3xl font-bold">Coach’s Corner</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">A private workspace for 2026 seeding, schedules, results, and head-to-head scouting.</p>
        <form action={action} className="mt-7 space-y-4">
          <label className="block text-sm font-semibold" htmlFor="coach-password">Shared coach password</label>
          <Input id="coach-password" name="password" type="password" autoComplete="current-password" required autoFocus />
          {state.error && <p role="alert" className="text-sm font-medium text-primary">{state.error}</p>}
          <Button className="w-full" size="lg" disabled={pending}>{pending ? "Checking…" : "Enter Coach’s Corner"}</Button>
        </form>
      </section>
    </main>
  )
}
