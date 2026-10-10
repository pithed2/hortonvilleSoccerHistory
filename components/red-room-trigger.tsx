"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function RedRoomTrigger() {
  const router = useRouter()
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressureRef = useRef(0)
  const [pressure, setPressure] = useState(0)
  const [showWhisper, setShowWhisper] = useState(false)

  useEffect(() => {
    try { if (localStorage.getItem("red-room-found") === "true") return } catch { /* Storage can be blocked. */ }
    const timer = setTimeout(() => setShowWhisper(true), 4500)
    return () => clearTimeout(timer)
  }, [])

  function press() {
    if (resetTimer.current) clearTimeout(resetTimer.current)
    const next = pressureRef.current + 1
    pressureRef.current = next
    setPressure(next)
    if (next >= 5) {
      try { localStorage.setItem("red-room-found", "true") } catch { /* Navigation still works without storage. */ }
      router.push("/jv/red/red-room")
      return
    }
    resetTimer.current = setTimeout(() => {
      pressureRef.current = 0
      setPressure(0)
    }, 2500)
  }

  return <div className="relative flex flex-col items-center">
    <button type="button" onClick={press} title="Don't poke the bear." className={`group relative grid size-20 place-items-center rounded-full border bg-white/5 transition hover:scale-105 hover:border-primary/70 ${showWhisper ? "border-primary/60 shadow-[0_0_28px_rgba(220,38,38,.28)] motion-safe:animate-pulse" : "border-white/15"}`} aria-label="Open Red Room game: activate the bear five times" aria-describedby="red-room-whisper">
      <Image src="/logos/modern-bear-logo-white-fill.png" alt="" width={56} height={56} className="h-14 w-14 object-contain transition group-active:scale-90" />
      {showWhisper && pressure === 0 ? <span className="absolute right-0 top-0 size-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.9)]" aria-hidden="true" /> : null}
      {pressure > 0 ? <span className="absolute -bottom-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-white">{pressure}/5</span> : null}
    </button>
    <span id="red-room-whisper" aria-live="polite" className={`absolute top-[5.7rem] w-40 text-center text-[10px] font-bold uppercase tracking-wider text-red-300 transition-opacity ${showWhisper || pressure > 0 ? "opacity-100" : "opacity-0"}`}>{pressure > 0 ? "You were warned. Keep going." : "Don't poke the bear."}</span>
  </div>
}
