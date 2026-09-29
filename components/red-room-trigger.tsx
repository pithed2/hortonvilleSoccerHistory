"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function RedRoomTrigger() {
  const router = useRouter()
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pressure, setPressure] = useState(0)

  function press() {
    if (resetTimer.current) clearTimeout(resetTimer.current)
    const next = pressure + 1
    setPressure(next)
    if (next >= 5) {
      localStorage.setItem("red-room-found", "true")
      router.push("/jv/red/red-room")
      return
    }
    resetTimer.current = setTimeout(() => setPressure(0), 2500)
  }

  return <button type="button" onClick={press} className="group relative grid size-20 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:scale-105 hover:border-primary/70" aria-label="JV Red crest">
    <Image src="/logos/modern-bear-logo-white-fill.png" alt="" width={56} height={56} className="h-14 w-14 object-contain transition group-active:scale-90" />
    {pressure > 0 ? <span className="absolute -bottom-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-white">{pressure}/5</span> : null}
  </button>
}
