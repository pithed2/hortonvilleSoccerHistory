"use client"

import { useEffect, useRef, useState } from "react"
import { downloadCanvas } from "@/lib/render-player-card"

export function PlayerCardShare({ token }: { token: string }) {
  const qr = useRef<HTMLCanvasElement>(null)
  const [url, setUrl] = useState("")
  const [message, setMessage] = useState("")
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let canceled = false
    const link = `${window.location.origin}/coachs-corner/player-cards/${token}`
    import("qrcode").then(async (QR) => { if (!canceled && qr.current) { setUrl(link); await QR.toCanvas(qr.current, link, { width: 400, margin: 4, errorCorrectionLevel: "M" }); if (!canceled) setReady(true) } }).catch(() => { if (!canceled) { setUrl(link); setMessage("QR unavailable. You can still copy the link.") } })
    return () => { canceled = true }
  }, [token])
  return <section className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5">
    <h2 className="font-black">Private review link</h2>
    <p className="mt-2 text-sm text-white/60">Unlisted, with no player directory. Only signed-in coaches with this link can view and download the card.</p>
    <input aria-label="Player card link" readOnly value={url} onFocus={(event) => event.target.select()} className="mt-4 w-full rounded-lg border border-white/20 bg-black/30 p-3 text-xs" />
    <div className="mt-3 flex flex-wrap gap-3"><button className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-black" onClick={async () => { try { await navigator.clipboard.writeText(url); setMessage("Link copied.") } catch { setMessage("Select and copy the link above.") } }}>Copy link</button><button disabled={!ready} className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold disabled:opacity-40" onClick={() => qr.current && downloadCanvas(qr.current, "player-card-qr.png")}>Download QR</button><a href={url || `/coachs-corner/player-cards/${token}`} className="px-2 py-2 text-sm underline">Open card</a></div>
    <canvas ref={qr} className="mt-4 max-w-40 rounded-lg" role="img" aria-label="QR code linking to this player card" />
    <p role="status" className="mt-2 text-sm text-white/70">{message}</p>
  </section>
}
