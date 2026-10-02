"use client"

import { useEffect, useRef, useState } from "react"
import { blankCardDesign, type CardDesign, type CardPhoto, type CardPlayer } from "@/lib/player-card-types"
import { cardImage } from "@/lib/render-player-card"
import { loadCardDraft, savePlayerCard, unpublishPlayerCard } from "@/app/coachs-corner/player-cards/actions"
import { PlayerCardPreview } from "./player-card-preview"
import { PlayerCardShare } from "./player-card-share"

async function preparePhoto(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPG, PNG, or WebP photo.")
  if (file.size > 20 * 1024 * 1024) throw new Error("Choose a photo smaller than 20 MB.")
  const url = URL.createObjectURL(file)
  try {
    const image = await cardImage(url), canvas = document.createElement("canvas")
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight))
    canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale)
    canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height)
    for (const quality of [.88, .75, .6, .45]) {
      const src = canvas.toDataURL("image/jpeg", quality)
      if (src.length <= 600_000) return src
    }
    throw new Error("That image is still too large. Please use a smaller photo.")
  } finally { URL.revokeObjectURL(url) }
}

export function PlayerCardEditor({ players }: { players: CardPlayer[] }) {
  const [id, setId] = useState(players.find((player) => player.id === "og-andy")?.id ?? players.find((player) => player.name === "Miles Montalbano")?.id ?? players[0]?.id ?? "")
  const [design, setDesign] = useState<CardDesign>(blankCardDesign)
  const [busy, setBusy] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState("")
  const [token, setToken] = useState("")
  const [published, setPublished] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const revision = useRef(0)
  const player = players.find((entry) => entry.id === id)!
  useEffect(() => {
    let canceled = false
    loadCardDraft(id).then((result) => {
      if (canceled) return
      if (result.error) { setLoadError(true); setMessage(result.error) }
      else { setDesign(result.draft?.design ?? blankCardDesign()); setToken(result.draft?.token ?? ""); setPublished(result.draft?.published ?? false); setDirty(false) }
    }).catch(() => { if (!canceled) { setLoadError(true); setMessage("Could not load this draft. Refresh to try again.") } }).finally(() => { if (!canceled) setBusy(false) })
    return () => { canceled = true }
  }, [id])
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])
  function edit(patch: Partial<CardDesign>) { setDesign((current) => ({ ...current, ...patch })); setDirty(true); setMessage("") }
  async function upload(kind: "portrait" | "action" | "highlight", file?: File) {
    if (!file) return
    const currentRevision = ++revision.current
    setBusy(true); setMessage("")
    try { const src = await preparePhoto(file); if (revision.current === currentRevision) edit({ [kind]: { src, x: 50, y: 50, zoom: 1 }, rightsConfirmed: false }) }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not read the photo.") }
    finally { setBusy(false) }
  }
  async function save(publish: boolean) {
    setBusy(true); setMessage("")
    try {
      const result = await savePlayerCard(id, design, publish)
      setMessage(result.error ?? result.success ?? "")
      if (!result.error) { setDirty(false); setToken(result.token ?? ""); if (publish) setPublished(true) }
    } catch { setMessage("Could not save. Your changes are still here; please try again.") }
    finally { setBusy(false) }
  }
  if (!player) return <p>No varsity players found.</p>
  return <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)]">
    <section className="space-y-5">
      <label className="block text-sm font-bold">Player<select value={id} disabled={busy} onChange={(event) => { if (dirty && !window.confirm("Discard unsaved changes to this card?")) return; revision.current++; setBusy(true); setLoadError(false); setMessage(""); setToken(""); setPublished(false); setId(event.target.value) }} className="mt-2 w-full rounded-lg border border-white/20 bg-[#181c26] p-3">{players.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} · #{entry.number}{entry.example ? " · Temporary example" : entry.season !== 2026 ? " · Alumni sample" : ""}</option>)}</select></label>
      <p className="text-xs leading-5 text-white/55">{player.example ? "Temporary example card. Your supplied photos are preloaded; stats have not been supplied." : "Stats are loaded from the varsity archive. Saving a review copy snapshots the stats. Public release awaits approval."}</p>
      <fieldset disabled={busy || loadError} className="space-y-5 disabled:opacity-50">
        <PhotoControls title="Portrait / front" photo={design.portrait} onFile={(file) => upload("portrait", file)} onCrop={(photo) => edit({ portrait: photo })} />
        <PhotoControls title="Action photo / back" photo={design.action} onFile={(file) => upload("action", file)} onCrop={(photo) => edit({ action: photo })} />
        <PhotoControls title="Back photo (optional)" photo={design.highlight ?? { src: "", x: 50, y: 50, zoom: 1 }} onFile={(file) => upload("highlight", file)} onCrop={(photo) => edit({ highlight: photo })} />
        <label className="block text-sm font-bold">Player overview<textarea value={design.overview} maxLength={500} rows={5} onChange={(event) => edit({ overview: event.target.value })} placeholder="Your words about what this player brings to the team…" className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 p-3 font-normal" /><span className="text-xs font-normal text-white/50">{design.overview.length}/500 characters · supplied by you or a coach</span></label>
        <label className="block text-sm font-bold">Card finish<select value={design.theme} onChange={(event) => edit({ theme: event.target.value as CardDesign["theme"] })} className="mt-2 w-full rounded-lg border border-white/20 bg-[#181c26] p-3"><option value="red">Polar Red</option><option value="black">Black &amp; White</option><option value="ice">Cracked Ice</option></select></label>
        <label className="flex items-start gap-3 text-xs leading-5 text-white/70"><input type="checkbox" checked={design.rightsConfirmed} onChange={(event) => edit({ rightsConfirmed: event.target.checked })} className="mt-1" />I have permission to use these photos for the player’s downloadable card.</label>
        <div className="flex gap-3"><button onClick={() => save(false)} className="flex-1 rounded-lg border border-white/25 px-3 py-3 text-sm font-bold">Save draft</button><button onClick={() => save(true)} className="flex-1 rounded-lg bg-[#E4002B] px-3 py-3 text-sm font-black hover:bg-[#E4002B]/90">{published ? "Update review copy" : "Save review copy"}</button></div>
        {published ? <button onClick={async () => { setBusy(true); try { const result = await unpublishPlayerCard(id); setMessage(result.error ?? result.success ?? ""); if (!result.error) setPublished(false) } catch { setMessage("Could not withdraw the card. Try again.") } finally { setBusy(false) } }} className="text-xs text-white/50 underline">Withdraw review copy</button> : null}
      </fieldset>
      <p role="status" className="text-sm text-red-200">{busy ? "Working…" : message || (dirty ? "Unsaved changes" : "")}</p>
      {published && token ? <PlayerCardShare token={token} /> : <p className="text-xs text-white/40">Drafts and review copies stay private to Coach’s Corner until public release is approved.</p>}
    </section>
    <section><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-red-400">{player.example ? "Throwback example" : player.season === 2026 ? "Championship collection" : "Alumni sample"}</p><h2 className="mt-2 text-3xl font-black">{player.name}</h2></div><span className="text-xs text-white/40">{published ? "Editing draft · review copy stays saved" : "Private draft"}</span></div><div className="grid gap-6 md:grid-cols-2"><PlayerCardPreview player={player} design={design} side="front" /><PlayerCardPreview player={player} design={design} side="back" /></div><p className="mt-5 text-xs text-white/50">Preview and PNG use the same artwork. Crop each photo with the controls, then download either side to inspect the full-size result.</p></section>
  </div>
}

function PhotoControls({ title, photo, onFile, onCrop }: { title: string; photo: CardPhoto; onFile: (file?: File) => void; onCrop: (photo: CardPhoto) => void }) {
  return <div className="rounded-xl border border-white/15 p-4"><label className="block text-sm font-bold">{title}<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:p-2 file:text-white" onChange={(event) => { onFile(event.target.files?.[0]); event.target.value = "" }} /></label>{photo.src ? <div className="mt-4 space-y-2">{([['x', 'Horizontal', 0, 100, 1], ['y', 'Vertical', 0, 100, 1], ['zoom', 'Zoom', 1, 2, .01]] as const).map(([key, label, min, max, step]) => <label key={key} className="flex items-center gap-3 text-xs text-white/60"><span className="w-16">{label}</span><input aria-label={`${title} ${label}`} type="range" min={min} max={max} step={step} value={photo[key]} onChange={(event) => onCrop({ ...photo, [key]: Number(event.target.value) })} className="min-w-0 flex-1 accent-[#E4002B]" /></label>)}</div> : null}</div>
}
