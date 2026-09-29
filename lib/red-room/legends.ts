export const LEGEND_REQUIREMENTS: Record<string, { wins: number; archiveAnswers: number; tier: number }> = {
  "LEGEND-1": { wins: 3, archiveAnswers: 1, tier: 1 },
  "LEGEND-7": { wins: 7, archiveAnswers: 3, tier: 2 },
  "LEGEND-10": { wins: 12, archiveAnswers: 5, tier: 3 },
}

export function legendProgress(tag: string, wins: number, archiveAnswers: number, coachBypass = false) {
  const requirement = LEGEND_REQUIREMENTS[tag]
  if (!requirement) return null
  return {
    ...requirement,
    currentWins: wins,
    currentArchiveAnswers: archiveAnswers,
    unlocked: coachBypass || (wins >= requirement.wins && archiveAnswers >= requirement.archiveAnswers),
    coachBypass,
  }
}
