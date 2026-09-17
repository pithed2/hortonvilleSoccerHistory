export type WeeklyGame = { Date: string; Team: string; Opponent: string; Location: string; Result: string | null; Score: string | null }
export type TeamRecord = { Team: string; W: number; L: number; T: number }
export type WeeklyData = {
  overall: (TeamRecord & { Group: string })[]
  schedule: WeeklyGame[]
  opponentRecords?: TeamRecord[]
  weeklyHighlights?: string[]
}

export function weekStart(date: string) {
  const day = new Date(`${date}T12:00:00Z`)
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7)
  return day.toISOString().slice(0, 10)
}

export function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function weeklyMatchups(data: WeeklyData, start: string) {
  const end = shiftDate(start, 6)
  const records = new Map((data.opponentRecords ?? []).map(row => [row.Team, row]))
  for (const row of data.overall) records.set(row.Team, row)
  const groups = new Map(data.overall.map(row => [row.Team, row.Group]))
  const retained = new Set(data.weeklyHighlights ?? [])
  const games = data.schedule.filter(game => game.Date >= start && game.Date <= end)
    .sort((a, b) => a.Date.localeCompare(b.Date) || a.Team.localeCompare(b.Team))

  return ["Group B", "Group A"].flatMap(group => {
    const own = games.filter(game => groups.get(game.Team) === group)
    // Prefer a completed entry if only one team's schedule has the result.
    const unique = new Map<string, WeeklyGame>()
    for (const game of own.filter(game => groups.get(game.Opponent) === group)) {
      const key = [game.Date, ...[game.Team, game.Opponent].sort()].join("|")
      const previous = unique.get(key)
      if (!previous || (!previous.Result && game.Result) || (Boolean(previous.Result) === Boolean(game.Result) && game.Team === "Hortonville")) unique.set(key, game)
    }
    const keyMatches = own.filter(game => {
      if (groups.get(game.Opponent) === group) return false
      const record = records.get(game.Opponent)
      return retained.has([game.Date, game.Team, game.Opponent].join("|")) || Boolean(record && record.W > record.L)
    })
    return [
      { title: `${group} · Head-to-head`, detail: "Meetings between teams in this group", games: [...unique.values()] },
      { title: `${group} · Key matchups`, detail: "Other opponents with winning records when highlighted", games: keyMatches },
    ].map(section => ({ ...section, games: section.games.map(game => ({ ...game, opponentRecord: records.get(game.Opponent) })) }))
  })
}
