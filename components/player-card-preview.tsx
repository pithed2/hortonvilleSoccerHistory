"use client"

import { useEffect, useRef, useState } from "react"
import type { CardDesign, CardPlayer } from "@/lib/player-card-types"
import { renderPlayerCard } from "@/lib/render-player-card"

export function PlayerCardPreview({ player, design, side }: { player: CardPlayer; design: CardDesign; side: "front" | "back" }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState<{ player: CardPlayer; design: CardDesign; side: string; url?: string; error?: string } | null>(null)
  const current = rendered?.player === player && rendered?.design === design && rendered?.side === side
  const error = current ? rendered?.error : ""
  const ready = current && !error
  useEffect(() => {
    let canceled = false
    const buffer = document.createElement("canvas")
    renderPlayerCard(buffer, player, design, side).then(() => {
      if (canceled || !canvas.current) return
      canvas.current.width = buffer.width; canvas.current.height = buffer.height
      canvas.current.getContext("2d")!.drawImage(buffer, 0, 0)
      setRendered({ player, design, side, url: buffer.toDataURL("image/png") })
    }).catch(() => { if (!canceled) setRendered({ player, design, side, error: "This preview could not load. Try selecting the photo again or refreshing." }) })
    return () => { canceled = true }
  }, [player, design, side])
  return <div className="min-w-0">
    <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-white/50">{side} / 1000 × 1400 PNG</p>
    <canvas ref={canvas} width={1000} height={1400} role="img" aria-label={`${player.name}, ${side} of ${player.season} Hortonville soccer card`} className={`w-full rounded-xl border border-white/20 shadow-2xl ${ready ? "" : "opacity-40"}`} />
    {error ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
    <a href={ready ? rendered?.url : undefined} download={`${player.id}-${player.season}-${side}.png`} aria-disabled={!ready} onClick={(event) => { if (!ready) event.preventDefault() }} className={`mt-4 block w-full rounded-lg bg-white px-4 py-3 text-center text-sm font-black text-black hover:bg-red-100 ${ready ? "" : "pointer-events-none opacity-40"}`}>Download {side}</a>
  </div>
}
