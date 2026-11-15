"use client"

import { useEffect, useRef, useState } from "react"
import type { CardDesign, CardPlayer } from "@/lib/player-card-types"
import { downloadCanvas, renderPlayerCard } from "@/lib/render-player-card"

type PreviewStatus = {
  player: CardPlayer
  design: CardDesign
  side: "front" | "back"
  error?: string
  warnings?: string[]
}

export function PlayerCardPreview({ player, design, side }: { player: CardPlayer; design: CardDesign; side: "front" | "back" }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState<PreviewStatus | null>(null)
  const current = rendered?.player === player && rendered?.design === design && rendered?.side === side
  const error = current ? rendered?.error : undefined
  const ready = Boolean(current && !error)
  const warnings = current ? rendered?.warnings ?? [] : []
  const missingPhoto = warnings.some(warning => /^(Portrait|Action|Highlight) photo/.test(warning))
  const photo = side === "front" ? design.portrait.src : design.highlight?.src || design.action.src

  useEffect(() => {
    let canceled = false
    const buffer = document.createElement("canvas")
    renderPlayerCard(buffer, player, design, side).then((warnings) => {
      if (canceled || !canvas.current) return
      const element = canvas.current
      element.width = buffer.width
      element.height = buffer.height
      const context = element.getContext("2d")
      if (!context) throw new Error("Canvas is not supported on this browser.")
      context.drawImage(buffer, 0, 0)
      // Do not generate an enormous PNG data URL after every crop-slider move.
      // Export a Blob only when the user taps Download.
      setRendered({ player, design, side, warnings })
    }).catch((reason: unknown) => {
      if (canceled) return
      const detail = reason instanceof Error ? reason.message : "Unknown image error"
      setRendered({ player, design, side, error: detail.slice(0, 200) })
    })
    return () => { canceled = true }
  }, [player, design, side])

  return <div className="min-w-0">
    <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-white/50">{side} / 1000 × 1400 PNG</p>
    <div className="relative overflow-hidden rounded-xl border border-white/20 bg-[#13151b] shadow-2xl">
      <canvas
        ref={canvas} width={1000} height={1400}
        role="img" aria-label={player.name + ", " + side + " of the " + player.season + " Hortonville soccer card"}
        className={"block h-auto w-full " + (!ready ? "opacity-30" : "") + (error ? " hidden" : "")}
      />
      {!current ? <div role="status" className="absolute inset-0 grid place-items-center p-2 text-center text-xs text-white/75">
        Rendering card preview...
      </div> : null}
      {error ? <div className="space-y-2 p-3 text-sm">
        <p className="font-semibold text-red-200">Card artwork could not render on this device.</p>
        {photo ? <img src={photo} alt="Uploaded photo, shown without card artwork" className="max-h-64 w-full rounded object-contain" /> : null}
        <p className="font-bold">{player.name} {player.number ? "#" + player.number : ""}</p>
        <div className="flex flex-wrap gap-3 text-xs">{player.metrics.map(item=>
          <span key={item.label}>{item.label}: {item.season}</span>)}</div>
        <p className="break-words text-xs text-white/60">{error}</p>
      </div> : null}
    </div>
    {warnings.length ? <div role="status" className="mt-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-2 text-xs text-amber-100">
      {warnings.join(" ")} {missingPhoto ? "Re-upload the photo before downloading." : "The rest of the card is ready."}
    </div> : null}
    <button
      type="button" disabled={!ready || missingPhoto}
      onClick={() => { if (ready && !missingPhoto && canvas.current) downloadCanvas(canvas.current, player.id + "-" + player.season + "-" + side + ".png") }}
      className="mt-3 block w-full rounded-lg bg-white px-3 py-3 text-center text-sm font-black text-black hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
    >Download {side}</button>
  </div>
}
