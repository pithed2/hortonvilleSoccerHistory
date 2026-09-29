"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Check, Copy, LockKeyhole, Shield, Swords, Trophy } from "lucide-react"
import { RED_ROOM_TAUNTS, RED_ROOM_VICTORY_CELEBRATIONS, RED_ROOM_VICTORY_YELLS, tauntLabel, victoryCelebration, victoryYell } from "@/lib/red-room/persona"

type LegendUnlock = { wins: number; archiveAnswers: number; tier: number; currentWins: number; currentArchiveAnswers: number; unlocked: boolean; coachBypass: boolean }
type Player = { id: string; displayName: string; publicTag: string; rating: number; squads: string[]; accountType: "player" | "coach" | "legend"; isBot: boolean; specialAbility: string | null; specialAbilityLabel: string | null; legendUnlock?: LegendUnlock | null }
type ReplayPlay = { shooterId: string; keeperId: string; shot: number; covered: number[]; originalCovered?: number[]; goal: boolean; ability?: string }
type Challenge = { id: string; code: string; status: string; challengerId: string; opponentId: string; challengerName: string; opponentName: string; challengerVictoryId: string; opponentVictoryId: string; challengerCelebrationId: string; opponentCelebrationId: string; challengerScore: number | null; opponentScore: number | null; replay: ReplayPlay[] | null; isMineToAnswer: boolean }
type Leader = Player & { matches: number; wins: number; losses: number; draws: number }
type State = { authenticated: false } | { authenticated: true; me: Player & { matchCredits: number; tauntId: string; victoryId: string; celebrationId: string }; players: Player[]; challenges: Challenge[]; stats: { matches: number; wins: number; losses: number; draws: number; archiveAnswers: number }; leaderboard: Leader[]; question: null | { id: string; prompt: string; choices: string[]; hint: string; sourceHref: string; sourceLabel: string } }
type KeeperPick = [number, number]

const emptyShots = () => Array(5).fill(0) as number[]
const emptyKeeps = () => Array.from({ length: 5 }, () => [] as unknown as KeeperPick)

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
        <div><div className="grid grid-cols-3 gap-2 text-center"><MiniStat value={state.me.accountType === "coach" ? "∞" : state.me.matchCredits} label="Matches" /><MiniStat value={`${state.stats.wins}-${state.stats.losses}-${state.stats.draws}`} label="W-L-D" /><MiniStat value={state.me.rating} label="Rating" /></div><button onClick={async () => { await fetch("/api/red-room/logout", { method: "POST" }); await load() }} className="mt-2 w-full text-xs font-bold uppercase tracking-wider text-white/35 hover:text-white">Switch player</button></div>
      </header>

      {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
      {state.question ? <TriviaCard question={state.question} onDone={load} setError={setError} /> : null}
      <LegendLadder players={state.players} />

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
  const [instant, setInstant] = useState(false)
  const opponent = players.find((player) => player.id === opponentId)
  const ready = opponentId && shots.every(Boolean) && keeps.every((pick) => pick.length === 2)
  async function create() {
    setError(""); const response = await fetch("/api/red-room/challenges", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ opponentId, shots, keeps }) }); const result = await response.json()
    if (!response.ok) return setError(result.error)
    if (result.completed) { setInstant(true); setCode("") } else { setInstant(false); setCode(result.code) }
    await onDone()
  }
  return <Panel icon={<Swords />} eyebrow="Call your shot" title="Create a challenge"><select value={opponentId} onChange={(event) => { setOpponentId(event.target.value); setCode(""); setInstant(false) }} className="mb-4 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 font-bold"><option value="">Choose a roster player…</option>{players.map((player) => <option key={player.id} value={player.id} disabled={Boolean(player.legendUnlock && !player.legendUnlock.unlocked)}>{player.isBot ? player.legendUnlock?.unlocked ? "★ " : "🔒 " : ""}{player.displayName} · {player.publicTag} · {player.legendUnlock && !player.legendUnlock.unlocked ? `${player.legendUnlock.wins} wins + ${player.legendUnlock.archiveAnswers} archive` : player.squads.join("/")}</option>)}</select>{opponent?.specialAbilityLabel ? <p className="mb-4 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm font-bold text-amber-100">Legend ability · {opponent.specialAbilityLabel}</p> : null}<p className="mb-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-100">{tauntLabel(me.tauntId, me.displayName)}</p><MovePlanner shots={shots} keeps={keeps} setShots={setShots} setKeeps={setKeeps} />{code ? <CodeReveal code={code} /> : instant ? <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center"><p className="font-black uppercase text-emerald-300">The legend answered instantly.</p><p className="mt-1 text-xs text-white/50">Open the completed match below to watch the replay.</p></div> : <button disabled={disabled || !ready} onClick={create} className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-black uppercase hover:bg-red-500 disabled:opacity-30">{opponent?.isBot ? "Challenge legend · 1 match" : "Create challenge · 1 match"}</button>}</Panel>
}

function LegendLadder({ players }: { players: Player[] }) {
  const legends = players.filter((player) => player.legendUnlock).sort((a, b) => (a.legendUnlock?.tier || 0) - (b.legendUnlock?.tier || 0))
  return <Panel icon={<LockKeyhole />} eyebrow="Boss ladder" title="Earn the legends"><div className="grid gap-3 md:grid-cols-3">{legends.map((legend) => { const unlock = legend.legendUnlock!; return <article key={legend.id} className={`rounded-xl border p-4 ${unlock.unlocked ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-black/25"}`}><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-white/40">Tier {unlock.tier}</p><h3 className="mt-1 text-lg font-black">{legend.displayName}</h3></div><span className="text-xl">{unlock.unlocked ? "★" : "🔒"}</span></div><p className="mt-2 min-h-10 text-xs text-white/55">{legend.specialAbilityLabel}</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-black/30 p-2"><p className="font-black">{Math.min(unlock.currentWins, unlock.wins)}/{unlock.wins}</p><p className="text-white/40">Wins</p></div><div className="rounded-lg bg-black/30 p-2"><p className="font-black">{Math.min(unlock.currentArchiveAnswers, unlock.archiveAnswers)}/{unlock.archiveAnswers}</p><p className="text-white/40">Archive</p></div></div><p className={`mt-3 text-xs font-black uppercase ${unlock.unlocked ? "text-emerald-300" : "text-white/35"}`}>{unlock.coachBypass ? "Coach test access" : unlock.unlocked ? "Challenge unlocked" : "Complete both requirements"}</p></article> })}</div></Panel>
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
  const complete = shots.filter((shot, index) => Boolean(shot) && keeps[index]?.length === 2).length
  const shotReady = Boolean(shots[round])
  const defenseReady = keeps[round]?.length === 2
  return <div><div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-wider text-white/45">Five-round card <span className="text-white/25">· O offense · D defense</span></p><p role="status" className={`rounded-full px-3 py-1 text-xs font-black uppercase ${complete === 5 ? "bg-emerald-400 text-black" : "bg-white/10 text-white/60"}`}>{complete === 5 ? "All 5 frames complete" : `${complete}/5 frames complete`}</p></div><div className="mb-4 grid grid-cols-5 gap-2">{Array.from({ length: 5 }, (_, index) => { const offenseSet = Boolean(shots[index]); const defenseSet = keeps[index]?.length === 2; const frameComplete = offenseSet && defenseSet; return <button key={index} type="button" aria-label={`Round ${index + 1}: offense ${offenseSet ? "selected" : "not selected"}, defense ${defenseSet ? "selected" : "not selected"}`} onClick={() => setRound(index)} className={`rounded-xl border px-1 py-2 text-center transition ${round === index ? "border-red-400 bg-red-600" : frameComplete ? "border-emerald-400/60 bg-emerald-500/15" : "border-white/10 bg-white/5"}`}><span className="block text-xs font-black">R{index + 1}</span><span className="mt-1 flex justify-center gap-1 text-[9px] font-black"><span className={`rounded px-1 ${offenseSet ? "bg-emerald-400 text-black" : "bg-black/30 text-white/35"}`}>O{offenseSet ? "✓" : "—"}</span><span className={`rounded px-1 ${defenseSet ? "bg-emerald-400 text-black" : "bg-black/30 text-white/35"}`}>D{defenseSet ? "✓" : "—"}</span></span></button> })}</div><div className="grid gap-4 sm:grid-cols-2"><ZoneGrid title="Your shot" selected={shots[round] ? [shots[round]] : []} shot={shots[round] || undefined} onPick={(zone) => { const next = [...shots]; next[round] = zone; setShots(next) }} /><ZoneGrid title="Your save · pick 2" selected={keeps[round] || []} onPick={pickKeep} /></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold"><p className={`rounded-lg px-3 py-2 ${shotReady ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-white/40"}`}>Offense {shotReady ? `✓ Zone ${shots[round]}` : "— choose 1 zone"}</p><p className={`rounded-lg px-3 py-2 ${defenseReady ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-white/40"}`}>Defense {defenseReady ? `✓ ${keeps[round].join(" + ")}` : `— ${keeps[round]?.length || 0}/2 zones`}</p></div></div>
}

function ZoneGrid({ title, selected, shot, onPick }: { title: string; selected: number[]; shot?: number; onPick: (zone: number) => void }) { return <div><p className="mb-2 text-xs font-black uppercase tracking-wider text-white/50">{title}</p><div className="grid grid-cols-3 overflow-hidden rounded-xl border-2 border-white/40">{Array.from({ length: 9 }, (_, index) => index + 1).map((zone) => { const isShot = shot === zone; const isCovered = selected.includes(zone); return <button type="button" key={zone} aria-label={`Zone ${zone}${isShot ? ", shot placed here" : ""}${isCovered ? ", goalkeeper coverage" : ""}`} onClick={() => onPick(zone)} className={`relative grid aspect-[1.35] place-items-center border border-white/15 text-sm font-black transition ${isCovered ? "bg-red-600 text-white" : "bg-white/[.03] text-white/50 hover:bg-white/10"}`}><span className={isShot ? "absolute left-2 top-1 text-[10px] opacity-60" : ""}>{zone}</span>{isShot ? <Image src="/red-room/soccer-ball.svg" alt="Shot" width={38} height={38} className="relative z-10 size-8 drop-shadow-[0_3px_4px_rgba(0,0,0,.65)] sm:size-9" /> : null}</button> })}</div></div> }

function ChallengeList({ challenges, me }: { challenges: Challenge[]; me: Player }) {
  const [watching, setWatching] = useState<Challenge | null>(null)
  return <Panel icon={<Trophy />} eyebrow="Competition log" title="Your matches"><div className="space-y-2">{!challenges.length ? <p className="text-sm text-white/45">No challenges yet. Be the first to call someone out.</p> : challenges.map((challenge) => { const opponent = challenge.challengerId === me.id ? challenge.opponentName : challenge.challengerName; const mine = challenge.challengerId === me.id ? challenge.challengerScore : challenge.opponentScore; const theirs = challenge.challengerId === me.id ? challenge.opponentScore : challenge.challengerScore; return <button key={challenge.id} disabled={!challenge.replay} onClick={() => setWatching(challenge)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/25 p-3 text-left disabled:cursor-default"><span><span className="font-bold">{opponent}</span><span className="block font-mono text-xs text-white/40">{challenge.code} · {challenge.status}{challenge.isMineToAnswer ? " · your move" : ""}</span></span><span className="text-xl font-black">{mine == null ? "—" : `${mine}–${theirs}`}</span></button> })}</div>{watching?.replay ? <Replay challenge={watching} onClose={() => setWatching(null)} /> : null}</Panel>
}

function Replay({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const play = challenge.replay![Math.min(step, challenge.replay!.length - 1)]
  const names = useMemo(() => ({ [challenge.challengerId]: challenge.challengerName, [challenge.opponentId]: challenge.opponentName }), [challenge])
  useEffect(() => { if (step >= challenge.replay!.length - 1) return; const timer = setTimeout(() => setStep((value) => value + 1), 800); return () => clearTimeout(timer) }, [step, challenge.replay])
  const playerShot = challenge.replay!.slice(0, step + 1).filter((attempt) => attempt.shooterId === play.shooterId).length
  const winnerId = challenge.challengerScore === challenge.opponentScore ? null : (challenge.challengerScore || 0) > (challenge.opponentScore || 0) ? challenge.challengerId : challenge.opponentId
  const celebration = victoryCelebration(winnerId === challenge.challengerId ? challenge.challengerCelebrationId : challenge.opponentCelebrationId)
  const yell = victoryYell(winnerId === challenge.challengerId ? challenge.challengerVictoryId : challenge.opponentVictoryId)
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/90 p-4"><div className="my-auto w-full max-w-lg rounded-3xl border border-red-500/30 bg-[#111] p-5 text-center sm:p-6"><ReplayTracker challenge={challenge} step={step} names={names} /><p className="mt-5 text-xs font-black uppercase tracking-[.25em] text-red-500">Current shot · {names[play.shooterId]}</p><h3 className="mt-2 text-2xl font-black">Shot {playerShot} of 5 · Zone {play.shot}</h3><div className="mx-auto mt-4 max-w-xs"><ZoneGrid title={`Keeper covers ${play.covered.join(" + ")}`} selected={play.covered} shot={play.shot} onPick={() => {}} /></div>{play.ability ? <p className="mt-4 rounded-lg bg-amber-300/10 px-3 py-2 text-sm font-black text-amber-200">★ {play.ability}</p> : null}<p className={`mt-5 text-5xl font-black uppercase italic ${play.goal ? "text-emerald-400" : "text-red-500"}`}>{play.goal ? "Goal" : "Saved"}</p>{step === challenge.replay!.length - 1 ? <><p className="mt-4 text-2xl font-black">Final: {challenge.challengerScore}–{challenge.opponentScore}</p>{winnerId ? <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4"><p className="text-4xl" aria-hidden="true">{celebration.mark}</p><p className="mt-2 text-xs font-black uppercase tracking-[.2em] text-red-300">{names[winnerId]} · {celebration.label}</p><p className="mt-1 text-2xl font-black italic">{yell}</p><p className="mt-1 text-sm text-white/55">{celebration.action}</p></div> : <p className="mt-2 text-sm text-white/60">Dead even. Run it back.</p>}<button onClick={onClose} className="mt-5 rounded-xl bg-white px-5 py-3 font-black uppercase text-black">Close replay</button></> : null}</div></div>
}

function ReplayTracker({ challenge, step, names }: { challenge: Challenge; step: number; names: Record<string, string> }) {
  const replay = challenge.replay!
  const players = [challenge.challengerId, challenge.opponentId]
  return <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-left"><p className="mb-3 text-center text-[10px] font-black uppercase tracking-[.22em] text-white/35">Match tracker · ball marks the current shot</p><div className="space-y-3">{players.map((playerId) => { const attempts = replay.map((attempt, replayIndex) => ({ attempt, replayIndex })).filter(({ attempt }) => attempt.shooterId === playerId); const goals = attempts.filter(({ attempt, replayIndex }) => replayIndex <= step && attempt.goal).length; return <div key={playerId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div className="min-w-0"><p className="truncate text-xs font-black">{names[playerId]}</p><p className="text-[10px] font-bold uppercase text-white/35">{goals} {goals === 1 ? "goal" : "goals"}</p></div><div className="flex gap-1.5">{attempts.map(({ attempt, replayIndex }, index) => { const isCurrent = replayIndex === step; const isComplete = replayIndex < step; return <span key={replayIndex} title={`Shot ${index + 1}${isCurrent ? " · current" : isComplete ? attempt.goal ? " · goal" : " · saved" : " · waiting"}`} className={`grid size-8 place-items-center rounded-full border text-[10px] font-black ${isCurrent ? "border-white bg-white text-black ring-2 ring-red-500" : isComplete ? attempt.goal ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300" : "border-red-400/50 bg-red-500/20 text-red-300" : "border-white/10 bg-white/5 text-white/25"}`}>{isCurrent ? <Image src="/red-room/soccer-ball.svg" alt="Current shot" width={22} height={22} className="size-5" /> : isComplete ? attempt.goal ? "G" : "S" : index + 1}</span> })}</div></div> })}</div><div className="mt-3 flex justify-center gap-4 text-[9px] font-bold uppercase text-white/30"><span><b className="text-emerald-300">G</b> Goal</span><span><b className="text-red-300">S</b> Saved</span></div></div>
}

function TriviaCard({ question, onDone, setError }: { question: NonNullable<Extract<State, { authenticated: true }>["question"]>; onDone: () => Promise<void>; setError: (value: string) => void }) {
  const [feedback, setFeedback] = useState("")
  async function answer(value: string) { const response = await fetch("/api/red-room/trivia", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId: question.id, answer: value }) }); const result = await response.json(); if (!response.ok) return setError(result.error); if (result.correct) { setFeedback("Archive cracked. Three matches unlocked."); await onDone() } else setFeedback(`${result.hint} `) }
  return <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5"><div className="flex gap-4"><LockKeyhole className="mt-1 size-6 shrink-0 text-amber-300" /><div><p className="text-xs font-black uppercase tracking-[.25em] text-amber-300">The Archive Keeper</p><h2 className="mt-2 text-xl font-black">{question.prompt}</h2><div className="mt-4 flex flex-wrap gap-2">{question.choices.map((choice) => <button key={choice} onClick={() => answer(choice)} className="min-w-14 rounded-lg bg-white px-4 py-2 font-black text-black hover:bg-amber-200">{choice}</button>)}</div>{feedback ? <p className="mt-3 text-sm text-amber-100">{feedback}<Link href={question.sourceHref} className="underline">Find it in {question.sourceLabel}</Link></p> : null}</div></div></section>
}

function ProfileCard({ me, onDone, setError }: { me: Extract<State, { authenticated: true }>["me"]; onDone: () => Promise<void>; setError: (value: string) => void }) {
  const [tauntId, setTaunt] = useState(me.tauntId), [victoryId, setVictory] = useState(me.victoryId), [celebrationId, setCelebration] = useState(me.celebrationId)
  async function save() { const response = await fetch("/api/red-room/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tauntId, victoryId, celebrationId }) }); const result = await response.json(); if (!response.ok) return setError(result.error); await onDone() }
  const selectedCelebration = victoryCelebration(celebrationId)
  const availableTaunts = RED_ROOM_TAUNTS.filter((taunt) => !taunt.ownerTag || taunt.ownerTag === me.publicTag)
  return <Panel icon={<Check />} eyebrow="Match persona" title="Your setup"><Choice label="Taunt" value={tauntId} setValue={setTaunt} options={availableTaunts.map((taunt) => [taunt.id, tauntLabel(taunt.id, me.displayName)])} /><Choice label="Victory yell" value={victoryId} setValue={setVictory} options={RED_ROOM_VICTORY_YELLS.map((victory) => [victory.id, victory.label])} /><Choice label="Victory celebration" value={celebrationId} setValue={setCelebration} options={RED_ROOM_VICTORY_CELEBRATIONS.map((celebration) => [celebration.id, celebration.label])} /><div className="mt-3 rounded-xl bg-black/30 p-3 text-sm"><span className="mr-2 text-xl" aria-hidden="true">{selectedCelebration.mark}</span><span className="text-white/60">{selectedCelebration.action}</span></div><button onClick={save} className="mt-4 w-full rounded-xl border border-white/15 px-4 py-3 font-black uppercase hover:bg-white/10">Save setup</button></Panel>
}

function Leaderboard({ leaders }: { leaders: Leader[] }) {
  return <Panel icon={<Trophy />} eyebrow="All-program table" title="Red Room rankings"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs uppercase tracking-wider text-white/35"><tr><th className="pb-3">#</th><th className="pb-3">Player</th><th className="pb-3 text-center">W-L-D</th><th className="pb-3 text-right">Rating</th></tr></thead><tbody>{leaders.map((player, index) => <tr key={player.id} className="border-t border-white/10"><td className="py-3 font-black text-red-500">{index + 1}</td><td className="py-3"><span className="font-bold">{player.isBot ? "★ " : ""}{player.displayName}</span><span className="ml-2 font-mono text-xs text-white/35">{player.publicTag} · {player.squads.join("/")}</span></td><td className="py-3 text-center font-bold">{player.wins}-{player.losses}-{player.draws}</td><td className="py-3 text-right font-black">{player.rating}</td></tr>)}{!leaders.length ? <tr><td colSpan={4} className="py-5 text-center text-white/40">The table opens after the first match.</td></tr> : null}</tbody></table></div></Panel>
}

function Choice({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: ReadonlyArray<readonly [string, string]> }) { return <label className="mt-4 block text-xs font-black uppercase tracking-wider text-white/50">{label}<select value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm font-bold normal-case tracking-normal text-white">{options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label> }
function Panel({ icon, eyebrow, title, children }: { icon: React.ReactNode; eyebrow: string; title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[.035] p-5 sm:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-red-500">{eyebrow}</p><h2 className="mt-1 text-2xl font-black">{title}</h2></div><span className="text-red-500 [&>svg]:size-5">{icon}</span></div>{children}</section> }
function MiniStat({ value, label }: { value: string | number; label: string }) { return <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-xl font-black">{value}</p><p className="text-[10px] font-bold uppercase text-white/40">{label}</p></div> }
function CodeReveal({ code }: { code: string }) { const [copied, setCopied] = useState(false); return <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center"><p className="text-xs font-black uppercase tracking-wider text-emerald-300">Send this code to your opponent</p><button onClick={() => { void navigator.clipboard.writeText(code); setCopied(true) }} className="mt-2 inline-flex items-center gap-2 font-mono text-3xl font-black"><Copy className="size-4" />{code}</button><p className="mt-1 text-xs text-white/50">{copied ? "Copied." : "The code only works for the player you challenged."}</p></div> }
