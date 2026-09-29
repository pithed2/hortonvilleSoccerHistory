"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Check, Copy, LockKeyhole, Shield, Swords, Trophy } from "lucide-react"

type Player = { id: string; displayName: string; publicTag: string; rating: number; squads: string[] }
type ReplayPlay = { shooterId: string; keeperId: string; shot: number; covered: number[]; goal: boolean }
type Challenge = { id: string; code: string; status: string; challengerId: string; opponentId: string; challengerName: string; opponentName: string; challengerScore: number | null; opponentScore: number | null; replay: ReplayPlay[] | null; isMineToAnswer: boolean }
type Leader = Player & { matches: number; wins: number; losses: number; draws: number }
type State = { authenticated: false } | { authenticated: true; me: Player & { matchCredits: number; tauntId: string; victoryId: string; celebrationId: string }; players: Player[]; challenges: Challenge[]; stats: { matches: number; wins: number; losses: number; draws: number }; leaderboard: Leader[]; question: null | { id: string; prompt: string; choices: string[]; hint: string; sourceHref: string; sourceLabel: string } }
type KeeperPick = [number, number]

const emptyShots = () => Array(5).fill(0) as number[]
const emptyKeeps = () => Array.from({ length: 5 }, () => [] as unknown as KeeperPick)
const taunts = { pressure: "Hope you like pressure.", guess: "Pick a corner. Any corner.", ice: "Cold enough in here?" }
const victories = { cold: "ICE COLD.", wall: "THE WALL HOLDS.", net: "BACK OF THE NET." }

export function RedRoomApp() {
  const [state, setState] = useState<State | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const load = async () => setState(await fetch("/api/red-room/state", { cache: "no-store" }).then((response) => response.json()))
  useEffect(() => {
    fetch("/api/red-room/state", { cache: "no-store" }).then((response) => response.json()).then(setState)
  }, [])

  if (!state) return <RoomFrame><p className="animate-pulse text-center text-sm uppercase tracking-[.3em] text-white/50">Entering the tunnel…</p></RoomFrame>
  if (!state.authenticated) return <RoomFrame><ClaimPanel onClaim={load} error={error} setError={setError} busy={busy} setBusy={setBusy} /></RoomFrame>

  return <RoomFrame>
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[.35em] text-red-500">Identity confirmed · {state.me.publicTag}</p><h1 className="mt-2 text-4xl font-black uppercase italic sm:text-6xl">The Red Room</h1><p className="mt-2 text-white/55">{state.me.displayName} · {state.me.squads.join(" · ")}</p></div>
        <div><div className="grid grid-cols-3 gap-2 text-center"><MiniStat value={state.me.matchCredits} label="Matches" /><MiniStat value={`${state.stats.wins}-${state.stats.losses}-${state.stats.draws}`} label="W-L-D" /><MiniStat value={state.me.rating} label="Rating" /></div><button onClick={async () => { await fetch("/api/red-room/logout", { method: "POST" }); await load() }} className="mt-2 w-full text-xs font-bold uppercase tracking-wider text-white/35 hover:text-white">Switch player</button></div>
      </header>

      {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
      {state.question ? <TriviaCard question={state.question} onDone={load} setError={setError} /> : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <ChallengeBuilder me={state.me} players={state.players} disabled={state.me.matchCredits <= 0} onDone={load} setError={setError} />
        <AcceptChallenge disabled={state.me.matchCredits <= 0} onDone={load} setError={setError} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <ChallengeList challenges={state.challenges} me={state.me} />
        <ProfileCard me={state.me} onDone={load} setError={setError} />
      </section>
      <Leaderboard leaders={state.leaderboard} />
    </div>
  </RoomFrame>
}

function RoomFrame({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#070708] text-white">
    <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,.22),transparent_42%),linear-gradient(135deg,transparent_48%,rgba(255,255,255,.025)_49%,transparent_50%)] bg-[length:auto,24px_24px]" />
    <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"><Link href="/jv/red" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white"><ArrowLeft className="size-4" /> JV Red</Link>{children}</div>
  </main>
}

function ClaimPanel({ onClaim, error, setError, busy, setBusy }: { onClaim: () => Promise<void>; error: string; setError: (value: string) => void; busy: boolean; setBusy: (value: boolean) => void }) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("")
    const form = new FormData(event.currentTarget)
    const response = await fetch("/api/red-room/claim", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tag: form.get("tag"), key: form.get("key") }) })
    const result = await response.json()
    if (!response.ok) setError(result.error); else await onClaim()
    setBusy(false)
  }
  return <div className="mx-auto max-w-md pt-12 text-center"><Image src="/coaches/andy-montalbano.jpg" alt="Coach Andy" width={112} height={112} className="mx-auto size-28 rounded-full border-4 border-red-600 object-cover grayscale" /><p className="mt-6 text-xs font-black uppercase tracking-[.35em] text-red-500">Archive Keeper</p><h1 className="mt-2 text-5xl font-black uppercase italic">You found it.</h1><p className="mt-4 text-white/60">The crest handles pressure. Pressure comes in fives. Your tag and Player Key prove who stepped into the room.</p><form onSubmit={submit} className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/[.04] p-5 text-left"><label className="block text-xs font-bold uppercase tracking-wider text-white/60">Player tag<input name="tag" required placeholder="JR-15" className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-lg font-black uppercase outline-none focus:border-red-500" /></label><label className="block text-xs font-bold uppercase tracking-wider text-white/60">Private Player Key<input name="key" required placeholder="BEAR-XXXX-XXXX" className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 font-mono uppercase outline-none focus:border-red-500" /></label>{error ? <p className="text-sm text-red-300">{error}</p> : null}<button disabled={busy} className="w-full rounded-xl bg-red-600 px-4 py-3 font-black uppercase tracking-wider hover:bg-red-500 disabled:opacity-50">{busy ? "Checking…" : "Claim identity"}</button></form></div>
}

function ChallengeBuilder({ me, players, disabled, onDone, setError }: { me: Player & { matchCredits: number; tauntId: string }; players: Player[]; disabled: boolean; onDone: () => Promise<void>; setError: (value: string) => void }) {
  const [opponentId, setOpponentId] = useState("")
  const [shots, setShots] = useState(emptyShots)
  const [keeps, setKeeps] = useState(emptyKeeps)
  const [code, setCode] = useState("")
  const ready = opponentId && shots.every(Boolean) && keeps.every((pick) => pick.length === 2)
  async function create() {
    setError(""); const response = await fetch("/api/red-room/challenges", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ opponentId, shots, keeps }) }); const result = await response.json()
    if (!response.ok) return setError(result.error)
    setCode(result.code); await onDone()
  }
  return <Panel icon={<Swords />} eyebrow="Call your shot" title="Create a challenge"><select value={opponentId} onChange={(event) => setOpponentId(event.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 font-bold"><option value="">Choose a roster player…</option>{players.map((player) => <option key={player.id} value={player.id}>{player.displayName} · {player.publicTag} · {player.squads.join("/")}</option>)}</select><p className="mb-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-100">{taunts[me.tauntId as keyof typeof taunts]}</p><MovePlanner shots={shots} keeps={keeps} setShots={setShots} setKeeps={setKeeps} />{code ? <CodeReveal code={code} /> : <button disabled={disabled || !ready} onClick={create} className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-black uppercase hover:bg-red-500 disabled:opacity-30">Create challenge · 1 match</button>}</Panel>
}

function AcceptChallenge({ disabled, onDone, setError }: { disabled: boolean; onDone: () => Promise<void>; setError: (value: string) => void }) {
  const [code, setCode] = useState("")
  const [shots, setShots] = useState(emptyShots)
  const [keeps, setKeeps] = useState(emptyKeeps)
  const ready = code && shots.every(Boolean) && keeps.every((pick) => pick.length === 2)
  async function accept() {
    const normalized = code.trim().toUpperCase(); const response = await fetch(`/api/red-room/challenges/${encodeURIComponent(normalized)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ shots, keeps }) }); const result = await response.json()
    if (!response.ok) return setError(result.error)
    setCode(""); setShots(emptyShots()); setKeeps(emptyKeeps()); await onDone()
  }
  return <Panel icon={<Shield />} eyebrow="Answer the call" title="Enter a challenge"><input value={code} onChange={(event) => setCode(event.target.value)} placeholder="PK-7M4Q" className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center font-mono text-2xl font-black uppercase outline-none focus:border-red-500" /><MovePlanner shots={shots} keeps={keeps} setShots={setShots} setKeeps={setKeeps} /><button disabled={disabled || !ready} onClick={accept} className="mt-5 w-full rounded-xl bg-white px-4 py-3 font-black uppercase text-black hover:bg-red-100 disabled:opacity-30">Play it out · 1 match</button></Panel>
}

function MovePlanner({ shots, keeps, setShots, setKeeps }: { shots: number[]; keeps: KeeperPick[]; setShots: (value: number[]) => void; setKeeps: (value: KeeperPick[]) => void }) {
  const [round, setRound] = useState(0)
  const pickKeep = (zone: number) => { const current = [...(keeps[round] || [])]; const next = current.includes(zone) ? current.filter((item) => item !== zone) : current.length < 2 ? [...current, zone] : [current[1], zone]; const all = [...keeps]; all[round] = next as KeeperPick; setKeeps(all) }
  return <div><div className="mb-4 flex gap-2">{Array.from({ length: 5 }, (_, index) => <button key={index} onClick={() => setRound(index)} className={`grid size-9 place-items-center rounded-lg text-xs font-black ${round === index ? "bg-red-600" : shots[index] && keeps[index]?.length === 2 ? "bg-emerald-600" : "bg-white/10"}`}>{index + 1}</button>)}</div><div className="grid gap-4 sm:grid-cols-2"><ZoneGrid title="Your shot" selected={shots[round] ? [shots[round]] : []} onPick={(zone) => { const next = [...shots]; next[round] = zone; setShots(next) }} /><ZoneGrid title="Your save · pick 2" selected={keeps[round] || []} onPick={pickKeep} /></div></div>
}

function ZoneGrid({ title, selected, onPick }: { title: string; selected: number[]; onPick: (zone: number) => void }) { return <div><p className="mb-2 text-xs font-black uppercase tracking-wider text-white/50">{title}</p><div className="grid grid-cols-3 overflow-hidden rounded-xl border-2 border-white/40">{Array.from({ length: 9 }, (_, index) => index + 1).map((zone) => <button type="button" key={zone} onClick={() => onPick(zone)} className={`aspect-[1.35] border border-white/15 text-sm font-black transition ${selected.includes(zone) ? "bg-red-600 text-white" : "bg-white/[.03] text-white/50 hover:bg-white/10"}`}>{zone}</button>)}</div></div> }

function ChallengeList({ challenges, me }: { challenges: Challenge[]; me: Player }) {
  const [watching, setWatching] = useState<Challenge | null>(null)
  return <Panel icon={<Trophy />} eyebrow="Competition log" title="Your matches"><div className="space-y-2">{!challenges.length ? <p className="text-sm text-white/45">No challenges yet. Be the first to call someone out.</p> : challenges.map((challenge) => { const opponent = challenge.challengerId === me.id ? challenge.opponentName : challenge.challengerName; const mine = challenge.challengerId === me.id ? challenge.challengerScore : challenge.opponentScore; const theirs = challenge.challengerId === me.id ? challenge.opponentScore : challenge.challengerScore; return <button key={challenge.id} disabled={!challenge.replay} onClick={() => setWatching(challenge)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/25 p-3 text-left disabled:cursor-default"><span><span className="font-bold">{opponent}</span><span className="block font-mono text-xs text-white/40">{challenge.code} · {challenge.status}{challenge.isMineToAnswer ? " · your move" : ""}</span></span><span className="text-xl font-black">{mine == null ? "—" : `${mine}–${theirs}`}</span></button> })}</div>{watching?.replay ? <Replay challenge={watching} onClose={() => setWatching(null)} /> : null}</Panel>
}

function Replay({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const play = challenge.replay![Math.min(step, challenge.replay!.length - 1)]
  const names = useMemo(() => ({ [challenge.challengerId]: challenge.challengerName, [challenge.opponentId]: challenge.opponentName }), [challenge])
  useEffect(() => { if (step >= challenge.replay!.length - 1) return; const timer = setTimeout(() => setStep((value) => value + 1), 800); return () => clearTimeout(timer) }, [step, challenge.replay])
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"><div className="w-full max-w-lg rounded-3xl border border-red-500/30 bg-[#111] p-6 text-center"><p className="text-xs font-black uppercase tracking-[.25em] text-red-500">Shot {step + 1} of 10</p><h3 className="mt-3 text-2xl font-black">{names[play.shooterId]} shoots zone {play.shot}</h3><div className="mx-auto mt-5 max-w-xs"><ZoneGrid title={`Keeper covers ${play.covered.join(" + ")}`} selected={play.covered} onPick={() => {}} /></div><p className={`mt-6 text-5xl font-black uppercase italic ${play.goal ? "text-emerald-400" : "text-red-500"}`}>{play.goal ? "Goal" : "Saved"}</p>{step === challenge.replay!.length - 1 ? <><p className="mt-4 text-2xl font-black">Final: {challenge.challengerScore}–{challenge.opponentScore}</p><p className="mt-2 text-sm text-white/60">{challenge.challengerScore === challenge.opponentScore ? "Dead even. Run it back." : victories.cold}</p><button onClick={onClose} className="mt-5 rounded-xl bg-white px-5 py-3 font-black uppercase text-black">Close replay</button></> : null}</div></div>
}

function TriviaCard({ question, onDone, setError }: { question: NonNullable<Extract<State, { authenticated: true }>["question"]>; onDone: () => Promise<void>; setError: (value: string) => void }) {
  const [feedback, setFeedback] = useState("")
  async function answer(value: string) { const response = await fetch("/api/red-room/trivia", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId: question.id, answer: value }) }); const result = await response.json(); if (!response.ok) return setError(result.error); if (result.correct) { setFeedback("Archive cracked. Three matches unlocked."); await onDone() } else setFeedback(`${result.hint} `) }
  return <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5"><div className="flex gap-4"><LockKeyhole className="mt-1 size-6 shrink-0 text-amber-300" /><div><p className="text-xs font-black uppercase tracking-[.25em] text-amber-300">The Archive Keeper</p><h2 className="mt-2 text-xl font-black">{question.prompt}</h2><div className="mt-4 flex flex-wrap gap-2">{question.choices.map((choice) => <button key={choice} onClick={() => answer(choice)} className="min-w-14 rounded-lg bg-white px-4 py-2 font-black text-black hover:bg-amber-200">{choice}</button>)}</div>{feedback ? <p className="mt-3 text-sm text-amber-100">{feedback}<Link href={question.sourceHref} className="underline">Find it in {question.sourceLabel}</Link></p> : null}</div></div></section>
}

function ProfileCard({ me, onDone, setError }: { me: Extract<State, { authenticated: true }>["me"]; onDone: () => Promise<void>; setError: (value: string) => void }) {
  const [tauntId, setTaunt] = useState(me.tauntId), [victoryId, setVictory] = useState(me.victoryId), [celebrationId, setCelebration] = useState(me.celebrationId)
  async function save() { const response = await fetch("/api/red-room/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tauntId, victoryId, celebrationId }) }); const result = await response.json(); if (!response.ok) return setError(result.error); await onDone() }
  return <Panel icon={<Check />} eyebrow="Match persona" title="Your setup"><Choice label="Taunt" value={tauntId} setValue={setTaunt} options={[["pressure", "Hope you like pressure."], ["guess", "Pick a corner."], ["ice", "Cold enough in here?"]]} /><Choice label="Victory yell" value={victoryId} setValue={setVictory} options={[["cold", "ICE COLD."], ["wall", "THE WALL HOLDS."], ["net", "BACK OF THE NET."]]} /><Choice label="Celebration" value={celebrationId} setValue={setCelebration} options={[["ice", "Ice burst"], ["fist", "Fist pump"], ["slide", "Knee slide"]]} /><button onClick={save} className="mt-4 w-full rounded-xl border border-white/15 px-4 py-3 font-black uppercase hover:bg-white/10">Save setup</button></Panel>
}

function Leaderboard({ leaders }: { leaders: Leader[] }) {
  return <Panel icon={<Trophy />} eyebrow="All-program table" title="Red Room rankings"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs uppercase tracking-wider text-white/35"><tr><th className="pb-3">#</th><th className="pb-3">Player</th><th className="pb-3 text-center">W-L-D</th><th className="pb-3 text-right">Rating</th></tr></thead><tbody>{leaders.map((player, index) => <tr key={player.id} className="border-t border-white/10"><td className="py-3 font-black text-red-500">{index + 1}</td><td className="py-3"><span className="font-bold">{player.displayName}</span><span className="ml-2 font-mono text-xs text-white/35">{player.publicTag} · {player.squads.join("/")}</span></td><td className="py-3 text-center font-bold">{player.wins}-{player.losses}-{player.draws}</td><td className="py-3 text-right font-black">{player.rating}</td></tr>)}{!leaders.length ? <tr><td colSpan={4} className="py-5 text-center text-white/40">The table opens after the first match.</td></tr> : null}</tbody></table></div></Panel>
}

function Choice({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: string[][] }) { return <label className="mt-4 block text-xs font-black uppercase tracking-wider text-white/50">{label}<select value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm font-bold normal-case tracking-normal text-white">{options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label> }
function Panel({ icon, eyebrow, title, children }: { icon: React.ReactNode; eyebrow: string; title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[.035] p-5 sm:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-red-500">{eyebrow}</p><h2 className="mt-1 text-2xl font-black">{title}</h2></div><span className="text-red-500 [&>svg]:size-5">{icon}</span></div>{children}</section> }
function MiniStat({ value, label }: { value: string | number; label: string }) { return <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-xl font-black">{value}</p><p className="text-[10px] font-bold uppercase text-white/40">{label}</p></div> }
function CodeReveal({ code }: { code: string }) { const [copied, setCopied] = useState(false); return <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center"><p className="text-xs font-black uppercase tracking-wider text-emerald-300">Send this code to your opponent</p><button onClick={() => { void navigator.clipboard.writeText(code); setCopied(true) }} className="mt-2 inline-flex items-center gap-2 font-mono text-3xl font-black"><Copy className="size-4" />{code}</button><p className="mt-1 text-xs text-white/50">{copied ? "Copied." : "The code only works for the player you challenged."}</p></div> }
