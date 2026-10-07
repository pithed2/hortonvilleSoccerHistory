"use client"

import type { CSSProperties } from "react"
import styles from "./penalty-scene.module.css"

type Attempt = { shot: number; covered: number[]; goal: boolean }

export function PenaltyScene({ play, paused }: { play: Attempt; paused: boolean }) {
  const target = (zone: number) => ({ x: 18 + ((zone - 1) % 3) * 32, y: 20 + Math.floor((zone - 1) / 3) * 22 })
  const ball = target(play.shot)
  // A legend can turn a covered shot into a goal. Show the keeper reaching it,
  // then the ball continuing through; the server's result remains authoritative.
  const diveZone = !play.goal || play.covered.includes(play.shot) ? play.shot : (play.covered[0] ?? 5)
  const keeper = target(diveZone)
  const motion = { "--ball-x": `${ball.x}%`, "--ball-y": `${ball.y}%`, "--keeper-x": `${keeper.x}%`, "--keeper-y": `${keeper.y + 9}%`, "--lean": `${(keeper.x - 50) * 1.8}deg`, animationPlayState: paused ? "paused" : "running" } as CSSProperties
  return <div className={`${styles.scene} ${play.goal ? styles.goal : styles.save}`} style={motion} data-paused={paused} role="img" aria-label={`Shot to zone ${play.shot}. Keeper covers ${play.covered.join(" and ")}. ${play.goal ? "Goal" : "Saved"}.`}>
    <div className={styles.lights} />
    <div className={styles.net}>{Array.from({ length: 9 }, (_, i) => <span key={i} className={play.covered.includes(i + 1) ? styles.covered : ""}>{i + 1}</span>)}</div>
    <div className={styles.keeper}><svg viewBox="0 0 100 120" aria-hidden="true"><circle cx="50" cy="19" r="12" fill="#f1c7a5" /><path d="M34 38 L19 51 L8 29 M66 38 L81 51 L92 29" fill="none" stroke="#c4f54e" strokeWidth="12" strokeLinecap="round" /><path d="M35 35 L65 35 L69 76 L31 76 Z" fill="#c4f54e" /><path d="M38 79 L30 108 M62 79 L70 108" stroke="#e5e7eb" strokeWidth="13" strokeLinecap="round" /><path d="M7 28 L4 19 M93 28 L96 19" stroke="white" strokeWidth="12" strokeLinecap="round" /><text x="50" y="63" textAnchor="middle" fill="#16200a" fontSize="20" fontWeight="900">1</text></svg></div>
    <div className={styles.ball}>⚽</div>
    <div className={styles.impact}>{play.goal ? "NET. RIPPLE." : "DENIED."}</div>
    <p className={styles.caption}>Keeper coverage · {play.covered.join(" + ") || "none"}</p>
  </div>
}

export function MatchFinish({ won, draw, mark, celebrationId, winner, yell, action, taunt }: { won: boolean; draw: boolean; mark: string; celebrationId: string; winner: string; yell: string; action: string; taunt: string }) {
  return <div className={`${styles.finish} ${won ? styles.winner : styles.loser}`} data-celebration={celebrationId} role="status">
    {won && !draw ? <div className={styles.confetti} aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ left: `${i * 6.5}%`, animationDelay: `${i % 5 * .13}s`, background: i % 2 ? "#fff" : "#ef4444" }} />)}</div> : null}
    <p className={styles.verdict}>{draw ? "UNFINISHED BUSINESS" : won ? "YOU OWN THE ROOM" : "THE ROOM GOT LOUD"}</p>
    {celebrationId === "keyboard_warrior" && !draw ? <div className={styles.keyboard} aria-label="Computer Geek Keyboard Warrior typing celebration"><span>CTRL + ALT + DEFEAT</span><div aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ animationDelay: `${i % 7 * .09}s` }} />)}</div></div> : null}
    <div className={styles.emblem} aria-hidden="true">{draw ? "⚖" : mark}</div>
    <p className="text-xs font-black uppercase tracking-widest text-red-200">{draw ? "Level at the whistle" : `${winner} takes it`}</p>
    <p className="mt-2 text-2xl font-black italic">{draw ? "RUN IT BACK." : yell}</p>
    {!draw ? <p className="mt-3 rounded-lg bg-black/30 p-3 text-sm font-bold italic">“{taunt}”</p> : null}
    <p className="mt-2 text-sm text-white/65">{draw ? "Nobody gets the last word. Yet." : action}</p>
    {!won && !draw ? <p className="mt-3 text-xs font-bold text-red-200">Take the receipt. Come back for the rematch.</p> : null}
  </div>
}
