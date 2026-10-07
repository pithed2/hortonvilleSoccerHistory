import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { Navigation } from "@/components/navigation"
import { COACH_COOKIE, validCoachCookie } from "@/lib/coach-auth"
import snapshot from "@/data/coachs-corner/all-conference-2026.json"
import standings from "@/data/coachs-corner/fva-conference-2026.json"
import { CoachLogin } from "../login"
import { AllConferenceBoard } from "./board"
import { boxscoreGamesBySeason } from "@/lib/player-stats"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "FVA All-Conference | Coach’s Corner",
  robots: { index: false, follow: false, nocache: true },
}

export default async function AllConferencePage() {
  if (!validCoachCookie((await cookies()).get(COACH_COOKIE)?.value)) {
    return <><Navigation /><CoachLogin /></>
  }
  const candidates = ["Noah Rindt", "Fenton Hirschi", "Ian Baetke"].map(name => snapshot.players.find(player => player.name === name)!)
  const missedOpponents = ["Oshkosh North", "Appleton East", "Bay Port", "Fond du Lac", "Green Bay Preble"]
  const conferenceOpponents = new Set(["Oshkosh North", "Appleton East", "Fond du Lac"])
  const withoutRoman = boxscoreGamesBySeason(2026).filter(game => missedOpponents.includes(game.opponent)).map(game => ({ ...game, noah: game.players.find(player => player.player_name === "Noah Rindt") }))
  const totals = withoutRoman.reduce((sum, game) => ({ goals: sum.goals + (game.noah?.goals ?? 0), assists: sum.assists + (game.noah?.assists ?? 0), points: sum.points + (game.noah?.points ?? 0) }), { goals: 0, assists: 0, points: 0 })
  return <><Navigation /><main className="min-h-screen bg-[#f7f7f5] pb-16">
    <header className="bg-neutral-950 text-white"><div className="site-container py-10">
      <Link href="/coachs-corner" className="text-sm text-white/75">← Coach’s Corner</Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-widest text-red-400">2026 · Selection preparation</p>
      <h1 className="mt-2 text-4xl font-black">FVA All-Conference</h1>
      <p className="mt-4 max-w-3xl text-white/75">Build the case for conference recognition: production, team success, and the roles that the scoring sheet misses.</p>
      <p className="mt-4 text-sm text-white/75">Stats checked {snapshot.checkedAt} · Hortonville box scores through {snapshot.resultsThrough} · Working nominations</p>
    </div></header>
    <section className="site-container space-y-6 py-8" aria-labelledby="poy-review-title"><div className="surface-card space-y-4 p-6">
      <h2 id="poy-review-title" className="text-2xl font-bold">Player of the Year: three arguments</h2>
      <p className="text-sm text-muted-foreground">Private selection preparation · October 7, 2026. {snapshot.freshnessNote}</p>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left font-bold">Updated candidate comparison · points = 2 × goals + assists</caption><thead><tr className="border-b">{["Player", "School", "Conference G", "A", "Pts", "Overall G", "A", "Pts"].map((label, index) => <th className="p-3" scope="col" key={`${label}-${index}`}>{label}</th>)}</tr></thead><tbody>{candidates.map(player => <tr className="border-b" key={player.id}><th className="p-3" scope="row">{player.name}</th><td className="p-3">{player.team}</td>{[player.conference, player.overall].flatMap((stats, index) => ["goals", "assists", "points"].map(metric => <td className="p-3" key={`${index}-${metric}`}>{stats?.[metric as "goals" | "assists" | "points"] ?? "—"}</td>))}</tr>)}</tbody></table></div>
      <p><strong>The shared Hortonville case:</strong> Hortonville spreads its scoring across Fenton, Noah, Jacob Plutz and Roman Glad. Shared production makes individual totals an incomplete measure of influence. The Polar Bears finished 8–0–1 in the 2026 FVA; coaches report that Hortonville has not lost a conference game in three years. Sustained team success supports individual cases, without automatically deciding the award.</p>
    </div>
    <article className="surface-card space-y-4 p-6" aria-labelledby="noah-case-title">
      <h3 id="noah-case-title" className="text-xl font-bold">1. For Noah Rindt: the engine who took the lead</h3>
      <p>Noah’s case rests on influence across the entire game. Coaches describe him as the team’s engine: playing nearly every minute, setting the offensive and defensive tone, and taking on more responsibility when Roman was unavailable. Exact minutes have not been verified.</p>
      <p><strong>When Roman was out, Noah delivered:</strong> a goal or assist in all five identified games, with Hortonville winning all five. In the three conference wins, Noah recorded 1 goal, 2 assists and 4 points. Across all five, he contributed {totals.goals} goals, {totals.assists} assists and {totals.points} points, including four goals at Bay Port.</p>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left font-bold">Noah’s production in games Roman missed</caption><thead><tr className="border-b">{["Date", "Opponent", "Scope", "Result", "G", "A", "Pts"].map(label => <th className="p-3" scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{withoutRoman.map(game => <tr className="border-b" key={game.game_number}><td className="p-3">{game.date}</td><th className="p-3" scope="row">{game.opponent}</th><td className="p-3">{conferenceOpponents.has(game.opponent) ? "Conference" : "Non-conference"}</td><td className="p-3">{game.result} {game.score}</td><td className="p-3">{game.noah?.goals ?? "—"}</td><td className="p-3">{game.noah?.assists ?? "—"}</td><td className="p-3">{game.noah?.points ?? "—"}</td></tr>)}</tbody></table></div>
      <blockquote className="border-l-4 border-red-600 pl-4 font-semibold">“When our returning Player of the Year was unavailable, Noah took the lead. He produced in every game, helped us win all five, and set our standard on both sides of the ball. His value extends well beyond the scoring column.”</blockquote>
      <p><strong>Challenge to answer:</strong> Baetke and Fenton have stronger conference scoring totals. Support Noah’s broader impact with film and coach evaluations of pressing, recoveries, transitions and chance creation. The Bay Port and Preble performances add context; they are not conference points.</p>
      <p className="text-sm text-muted-foreground">Roman’s absences, Noah’s workload and two-way role, and Roman’s 2025 FVA Player of the Year and All-State honors are coach-supplied context. Game production comes from the Hortonville box-score archive. Roman’s three missed conference games also put his own lower totals in context.</p>
    </article>
    <article className="surface-card space-y-4 p-6" aria-labelledby="fenton-case-title">
      <h3 id="fenton-case-title" className="text-xl font-bold">2. For Fenton Hirschi: scoring and creation for the champion</h3>
      <p>Fenton combines 9 conference goals with 7 assists for 25 points—just one point behind Baetke, with three more assists. His 30 overall points include 12 assists. He supplies scoring and creates goals for teammates within a balanced attack that finished unbeaten in the FVA.</p>
      <blockquote className="border-l-4 border-red-600 pl-4 font-semibold">“Fenton gives us both goals and the final pass. He finished one conference point behind Baetke while sharing production with several other threats on the unbeaten champion. His case is the combination of finishing, creation and sustained team success.”</blockquote>
      <p><strong>Challenge to answer:</strong> Baetke leads in goals and points with one fewer team game played. Fenton’s statistical case is close, not superior in every category. Use specific examples of decisive contributions and chance creation to explain why his fuller attacking contribution deserves the award.</p>
    </article>
    <article className="surface-card space-y-4 p-6" aria-labelledby="baetke-case-title">
      <h3 id="baetke-case-title" className="text-xl font-bold">3. Against Baetke: the scoring lead does not settle Player of the Year</h3>
      <p>Baetke’s 11 conference goals and 26 points lead the reporting teams. The argument against selecting him is that a narrow scoring advantage should not automatically outweigh playmaking, two-way influence and impact on the unbeaten champion. Fenton is one point behind with more assists; Noah’s case adds responsibility, availability and leadership through Roman’s absence. Hortonville spreads its scoring, so comparing only individual totals understates the shared contributions behind its success.</p>
      <blockquote className="border-l-4 border-red-600 pl-4 font-semibold">“Baetke has the scoring lead. The question is whether that one-point edge over Fenton outweighs creation and championship impact—or whether Noah’s influence on both sides of the game makes him the more complete choice. Player of the Year should reflect the whole contribution.”</blockquote>
      <p><strong>Neenah’s strongest reply:</strong> Baetke scored 11 of Neenah’s 22 conference goals and leads in points after eight team games versus Hortonville’s nine. He scored twice against Hortonville and once in each loss to Appleton North and Oshkosh West. Do not argue that he disappeared against strong opposition, lacks defensive effort or depends on easy goals; the evidence does not establish those claims.</p>
      <p><strong>Selection context:</strong> Neenah is 5–2–1 with Appleton West still to play as of this snapshot. Five schools lack individual rows. Missing stats exclude neither their players nor defenders and goalkeepers from consideration. These are competing nomination arguments, not official selections.</p>
      <p className="text-sm">Sources: <a className="text-primary underline" href="https://www.gobound.com/wi/wiaa/bsc/2026-27/neenah/v/stats?competitor=athlete&amp;range=conference&amp;block=total">Neenah conference stats</a> · <a className="text-primary underline" href="https://www.gobound.com/wi/wiaa/bsc/2026-27/neenah/v/schedule">Neenah schedule and game stats</a> · <Link className="text-primary underline" href="/seasons/2026">Hortonville archive</Link></p>
    </article></section>
    <AllConferenceBoard data={snapshot} standings={standings} />
  </main></>
}
