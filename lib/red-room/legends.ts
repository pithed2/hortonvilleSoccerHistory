export const LEGEND_REQUIREMENTS: Record<string, { wins: number; archiveAnswers: number; tier: number }> = {
  "LEGEND-1": { wins: 3, archiveAnswers: 1, tier: 1 },
  "LEGEND-9": { wins: 5, archiveAnswers: 2, tier: 2 },
  "LEGEND-7": { wins: 7, archiveAnswers: 3, tier: 3 },
  "LEGEND-14": { wins: 10, archiveAnswers: 4, tier: 4 },
  "LEGEND-10": { wins: 12, archiveAnswers: 5, tier: 5 },
  "LEGEND-MARCO13": { wins: 16, archiveAnswers: 6, tier: 6 },
  "LEGEND-PAUL": { wins: 20, archiveAnswers: 8, tier: 7 },
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
