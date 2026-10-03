type GroupTeam = { Team: string; Group: string }
type GroupGame = { Date: string; Team: string; Opponent: string; Result: string | null; Score: string | null }

export function groupRecords(teams: GroupTeam[], schedule: GroupGame[], group: string) {
  const members = teams.filter(team => team.Group === group)
  const names = new Set(members.map(team => team.Team))
  // A fixture appears on both team schedules. Count it once, then credit both teams.
  // Prefer the main Hortonville schedule and scored entries over pending results.
  const fixtures = new Map<string, GroupGame>()
  for (const game of schedule) {
    if (!names.has(game.Team) || !names.has(game.Opponent) || game.Team === game.Opponent) continue
    const key = JSON.stringify([game.Date, ...[game.Team, game.Opponent].sort()])
    const previous = fixtures.get(key)
    if (!previous || game.Team === "Hortonville" || (previous.Team !== "Hortonville" && (!previous.Result || (!previous.Score && game.Score)) && game.Result)) {
      fixtures.set(key, game)
    }
  }
  const rows = members.map(({ Team }) => {
    let W = 0, L = 0, T = 0, GF = 0, GA = 0, scored = 0
    const opponents = new Set<string>()
    for (const game of fixtures.values()) {
      if ((game.Team !== Team && game.Opponent !== Team) || !["W", "L", "D", "T"].includes(game.Result || "")) continue
      const own = game.Team === Team
      opponents.add(own ? game.Opponent : game.Team)
      if (game.Result === "D" || game.Result === "T") T++
      else if ((game.Result === "W") === own) W++
      else L++
      if (game.Score && /^\d+-\d+$/.test(game.Score)) {
        const [gf, ga] = game.Score.split("-").map(Number)
        GF += own ? gf : ga
        GA += own ? ga : gf
        scored++
      }
    }
    const GP = W + L + T
    const Points = W * 3 + T
    return { Team, GP, W, L, T, Points, PPG: GP ? Points / GP : null, GF, GA, GD: GF - GA, scored, opponents: [...opponents].sort(), possibleOpponents: members.length - 1 }
  })
  return rows.sort((a, b) => (b.PPG ?? -1) - (a.PPG ?? -1) || b.Points - a.Points || a.Team.localeCompare(b.Team))
}
