"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { PLAYER_CARD_LIMIT, blankCardDesign, type CardDesign, type CardPhoto, type CardPlayer } from "@/lib/player-card-types"
import type { StoredCard } from "@/lib/card-studio-store"
import { PlayerCardPreview } from "@/components/player-card-preview"
import { prepareCardPhoto } from "@/lib/card-photo-client"
import { createMyStudioCard, deleteMyUnusedCard, listMyStudioCards, submitMyStudioCard, updateMyStudioCard } from "./actions"

function Upload({ label, value, change }: { label: string; value: CardPhoto; change: (photo: CardPhoto)=>void }) {
  const [notice, setNotice] = useState("")
  return <div className="rounded-xl border border-white/15 p-3">
    <label className="block text-sm font-semibold">{label}
      <input className="mt-2 block w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={async (event)=>{
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return
        setNotice("Loading photo...")
        try {
          const src = await prepareCardPhoto(file)
          change({src,x:50,y:50,zoom:1})
          setNotice("Photo loaded. Adjust the sliders to position it.")
        } catch (error) {
          setNotice(error instanceof Error ? error.message : "Could not open the photo.")
        }
      }}/>
    </label>
    {notice ? <p role="status" className="mt-2 text-xs text-amber-200">{notice}</p> : null}
    {value.src ? <div className="mt-3 space-y-3">
      <div className="overflow-hidden rounded-lg border border-white/20 bg-black/30 p-2">
        <img src={value.src} alt={label + " uploaded photo"} className="mx-auto max-h-52 w-full object-contain" />
        <p className="pt-2 text-center text-xs text-white/60">Your uploaded photo. The card previews show the final crop.</p>
      </div>
      {([["x","Horizontal",0,100,1],["y","Vertical",0,100,1],["zoom","Zoom",1,2,.01]] as const).map(([field,name,min,max,step])=>
        <label key={field} className="flex items-center gap-2 text-xs">
          <span className="w-[76px]">{name}</span>
          <input aria-label={label+" "+name} className="min-w-0 flex-1 accent-red-500" type="range" min={min} max={max} step={step} value={value[field]} onChange={e=>change({...value,[field]:Number(e.target.value)})}/>
        </label>)}
    </div> : null}
  </div>
}
export function MyCardStudio({ player, subjects, demoMode, coachRoster }: {player: CardPlayer; subjects: CardPlayer[]; demoMode: boolean; coachRoster: CardPlayer[]}) {
  const [cards,setCards]=useState<StoredCard[]>([])
  const [emptyPreviewDesign] = useState(blankCardDesign)
  const [coachPreviewId,setCoachPreviewId]=useState(player.id)
  const [selectedSubjectId,setSelectedSubjectId]=useState(player.id)
  const [selected,setSelected]=useState("")
  const [title,setTitle]=useState("My player card")
  const [design,setDesign]=useState<CardDesign>(blankCardDesign)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState("")
  const [dirty,setDirty]=useState(false)
  const active=cards.find(c=>c.id===selected)
  const previewPlayer = coachRoster.find(entry=>entry.id===coachPreviewId) ?? subjects.find(entry=>entry.id===selectedSubjectId) ?? player
  const canCreateForSelected = demoMode || subjects.some(entry=>entry.id===previewPlayer.id)
  function chooseCoachPreview(id: string) {
    if (dirty && !window.confirm("Discard unsaved changes to the current card?")) return
    setCoachPreviewId(id)
    setSelected("")
    setTitle("My player card")
    setDesign(blankCardDesign())
    setDirty(false)
    setMessage("")
  }
  function chooseSubject(id: string) {
    if (dirty && !window.confirm("Discard unsaved changes to the current card?")) return
    setSelectedSubjectId(id)
    setSelected("")
    setTitle("My player card")
    setDesign(blankCardDesign())
    setDirty(false)
    setMessage("")
  }
  async function refresh(nextId?:string) {
    const data=await listMyStudioCards()
    setCards(data.cards)
    const card=data.cards.find(c=>c.id===(nextId??selected))
    if(card){
      setSelected(card.id);setTitle(card.title);setDesign(card.draft)
      setSelectedSubjectId(card.draft.subjectId ?? player.id)
      if (demoMode && coachRoster.length) setCoachPreviewId(card.ownerId)
    }
    setDirty(false)
  }
  useEffect(()=>{
    if (demoMode) return
    listMyStudioCards().then(data=>setCards(data.cards)).catch(e=>setMessage(e instanceof Error?e.message:"Unable to load cards."))
  },[demoMode])
  function choose(id:string) {
    if(dirty&&!window.confirm("Discard unsaved changes?"))return
    const card=cards.find(c=>c.id===id)
    if(!card)return
    setSelected(card.id);setTitle(card.title);setDesign(card.draft);setDirty(false);setMessage("")
    setSelectedSubjectId(card.draft.subjectId ?? player.id)
    if (demoMode && coachRoster.length) setCoachPreviewId(card.ownerId)
  }
  function edit(patch:Partial<CardDesign>){setDesign(v=>({...v,...patch}));setDirty(true)}
  async function run(operation:()=>Promise<unknown>,success:string) {
    setBusy(true);setMessage("")
    try{await operation();await refresh();setMessage(success)}catch(e){setMessage(e instanceof Error?e.message:"Action failed.")}
    finally{setBusy(false)}
  }
  return <div className="mx-auto max-w-7xl space-y-8">
    <header><Link href="/jv/red/red-room" className="text-sm text-red-300 underline">Back to Red Room</Link><h1 className="mt-4 text-4xl font-black">Player Card Studio</h1><p className="mt-2 text-white/70">Signed in as {player.name}. Names and recorded statistics are locked to the selected player profile.</p></header>
    {demoMode?<div role="status" className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100"><strong>Demo mode:</strong> Create, edit and download a sample card without database writes. Demo cards exist only in this open page. Permanent saving and submitting will be enabled only after the database and approval workflow have been tested.</div>:null}
    {message?<p role="status" className="rounded-lg border border-red-400/40 p-3 text-sm text-red-100">{message}</p>:null}
    {subjects.length > 1 ? <section className="rounded-xl border border-white/20 bg-white/[.04] p-4">
      <label className="block text-sm font-semibold" htmlFor="card-subject-choice">Create a card for
        <select id="card-subject-choice" value={selectedSubjectId} onChange={event=>chooseSubject(event.target.value)} className="mt-2 block w-full rounded-lg border border-white/20 bg-[#191919] p-3">
          {subjects.map(subject=><option key={subject.id} value={subject.id}>{subject.name} · {subject.careerSpan} {subject.number?"· #"+subject.number:""}</option>)}
        </select>
      </label>
      <p className="mt-2 text-xs text-white/65">Ben can create Grant's card using his current JV White login. Every submission still requires coach approval. All cards share this login's three-card limit.</p>
    </section> : null}
    {coachRoster.length ? <section className="rounded-xl border border-white/20 bg-white/[.04] p-4">
      <label className="block text-sm font-semibold" htmlFor="coach-player-choice">Coach roster preview
        <select id="coach-player-choice" value={coachPreviewId} onChange={event=>chooseCoachPreview(event.target.value)} className="mt-2 block w-full rounded-lg border border-white/20 bg-[#191919] p-3">
          <option value={player.id}>My coach card · {player.name}</option>
          <optgroup label="2026 Varsity and JV players">
            {coachRoster.map(entry=><option key={entry.id} value={entry.id}>{entry.name} · {entry.careerSpan} {entry.number?"· #"+entry.number:""}</option>)}
          </optgroup>
        </select>
      </label>
      <p className="mt-2 text-xs text-white/65">
        Select any roster player to see their real card stats and test photos.
        {demoMode?" This is a browser-only coach preview. No player accounts or cards are changed.":" Saving cards for other players is disabled until coach-managed editing is enabled."}
      </p>
    </section> : null}
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-4">
        <button disabled={busy||cards.length>=PLAYER_CARD_LIMIT||!canCreateForSelected} onClick={async()=>{
          setBusy(true);setMessage("")
          try {
            if (demoMode) {
              const id = crypto.randomUUID()
              const newCard: StoredCard = {
                id, ownerId: previewPlayer.id, title: "My player card " + (cards.length + 1),
                draft: { ...blankCardDesign(), subjectId: previewPlayer.id }, submitted: null, approved: null,
                status: "draft", revision: 0, token: "",
              }
              setCards(current => [newCard, ...current])
              setSelected(id);setTitle(newCard.title);setDesign(newCard.draft);setDirty(false)
              setMessage("Demo card created. Changes exist only until you leave or refresh this page.")
              return
            }
            const id=await createMyStudioCard("My player card "+(cards.length+1),{...blankCardDesign(),subjectId:previewPlayer.id})
            await refresh(id)
            setMessage("New private card created.")
          } catch(e) {setMessage(e instanceof Error?e.message:"Cannot create card.")}
          finally {setBusy(false)}
        }} className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold disabled:opacity-50">Create new card</button>
        <p className="text-xs text-white/60">{cards.length}/{PLAYER_CARD_LIMIT} cards · You can change a card finish without creating another card.</p>
        <div className="space-y-2">{cards.map(c=><button key={c.id} onClick={()=>choose(c.id)} className={"w-full rounded-lg border p-3 text-left "+(selected===c.id?"border-red-500 bg-red-500/10":"border-white/20")}><span className="block font-semibold">{c.title}</span><span className="text-xs text-white/60">{c.status}{c.approved?" · Approved version available":""}</span></button>)}</div>
      </aside>
      {active ? <div className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(260px,370px)_1fr]">
          <section className="order-last space-y-4 xl:order-first">
            <label className="block text-sm font-bold">Card title<input maxLength={60} value={title} onChange={e=>{setTitle(e.target.value);setDirty(true)}} className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 p-3"/></label>
            <Upload label="Front portrait" value={design.portrait} change={portrait=>edit({portrait,rightsConfirmed:false})}/>
            <Upload label="Back action photo" value={design.action} change={action=>edit({action,rightsConfirmed:false})}/>
            <Upload label="Additional back image (optional)" value={design.highlight??{src:"",x:50,y:50,zoom:1}} change={highlight=>edit({highlight,rightsConfirmed:false})}/>
            <label className="block text-sm font-bold">Your player description<textarea rows={5} maxLength={500} value={design.overview} onChange={e=>edit({overview:e.target.value})} className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 p-3 font-normal"/></label>
            <label className="block text-sm font-bold">Card finish<select value={design.theme} onChange={e=>edit({theme:e.target.value as CardDesign["theme"]})} className="mt-2 w-full rounded-lg border border-white/20 bg-[#191919] p-3"><option value="red">Polar Red</option><option value="black">Black &amp; White</option><option value="ice">Cracked Ice</option><option value="gold">Championship Gold</option><option value="retro">Retro Print</option></select></label>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={design.rightsConfirmed} onChange={e=>edit({rightsConfirmed:e.target.checked})}/> I have permission to use these photos, including any required player or parent permission.</label>
            <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={()=>{if(demoMode){setCards(current=>current.map(card=>card.id===active.id?{...card,title,draft:design}:card));setDirty(false);setMessage("Saved in this preview page only. Refreshing will erase demo cards.");return}void run(()=>updateMyStudioCard(active.id,title,design),"Draft saved.")}} className="rounded-lg border border-white/30 px-4 py-3 font-bold disabled:opacity-50">Save draft</button><button disabled={demoMode||busy||active.status==="pending"||dirty} onClick={()=>run(()=>submitMyStudioCard(active.id),"Submitted for coach approval.")} className="rounded-lg bg-red-600 px-4 py-3 font-bold disabled:opacity-50">{demoMode?"Submission disabled in demo":"Submit for approval"}</button></div>
            {active.status === "draft" ? <button type="button" disabled={busy} className="text-xs text-red-300 underline disabled:opacity-50" onClick={async()=>{
              if (!window.confirm("Delete this unsubmitted card? This cannot be undone.")) return
              setBusy(true);setMessage("")
              try {
                if (!demoMode) await deleteMyUnusedCard(active.id)
                setCards(current=>current.filter(card=>card.id!==active.id))
                setSelected("");setTitle("My player card");setDesign(blankCardDesign());setDirty(false)
                setMessage("Draft deleted. Its card slot is available again.")
              } catch (e) {setMessage(e instanceof Error?e.message:"Could not delete the draft.")}
              finally {setBusy(false)}
            }}>Delete unsubmitted draft</button> : null}
            {dirty ? <p className="text-xs text-amber-200">Save your changes before submitting.</p>:null}
            {active.status==="pending"?<p className="text-sm text-amber-200">A submitted version is awaiting coach review. You can continue editing your personal draft.</p>:null}
            {active.approved?<p className="text-sm">Approved card: <a className="underline text-red-300" href={"/player-cards/c/"+active.token}>Open public card</a></p>:null}
            {busy?<p role="status" className="text-sm text-red-200">Working...</p>:null}
          </section>
          <section className="order-first xl:order-last">
            <p className="mb-3 text-sm font-semibold text-white/75">Live card preview: {previewPlayer.name}</p>
            <div className="grid grid-cols-2 gap-3"><PlayerCardPreview player={previewPlayer} design={design} side="front"/><PlayerCardPreview player={previewPlayer} design={design} side="back"/></div>
          </section>
        </div>
      </div> : <section className="space-y-4">
        <div className="rounded-xl border border-white/20 p-4 text-sm text-white/70">
          <p className="font-semibold text-white">Your player card is ready for a look.</p>
          <p className="mt-2">Here are the available {previewPlayer.season} stats for {previewPlayer.name}. Photos show placeholders until you create a card and upload your own. No saved card is needed to see the preview.</p>
        </div>
        <div className="grid grid-cols-2 gap-3"><PlayerCardPreview player={previewPlayer} design={emptyPreviewDesign} side="front"/><PlayerCardPreview player={previewPlayer} design={emptyPreviewDesign} side="back"/></div>
      </section>}
    </div>
  </div>
}
