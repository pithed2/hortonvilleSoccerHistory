type CoachGame = { Date: string; Team: string; Opponent: string; Location: string; Result: string | null; Score: string | null; Source?: string; SourceTeam?: string }
type Ranking = { Team: string; Rank: number; Rating: number; SOS: number; GP: number; W: number; L: number; T: number; GF: number; GA: number }
type CoachData = { generatedAt: string; sourceUrl?: string; teams: { Team: string; Group: string }[]; rankings?: Ranking[]; schedule: CoachGame[]; [key: string]: unknown }

function parseCsv(text: string) {
  const [header, ...rows] = text.trim().split(/\r?\n/)
  const columns = header.split(",")
  return rows.map((row) => Object.fromEntries(row.split(",").map((value, index) => [columns[index], value])))
}

export function withMainHortonvilleSchedule(data: CoachData, csvText: string) {
  const teamGroups = Object.fromEntries(data.teams.map(({ Team, Group }) => [Team, Group]))
  const hortonville = parseCsv(csvText).filter((row) => row.season_year === "2026").map((row) => ({
    Date: row.date,
    Team: "Hortonville",
    Opponent: row.opponent,
    Location: row.venue === "Home" ? "H" : row.venue === "Away" ? "A" : "N",
    Result: row.result || null,
    Score: row.score || null,
    Source: "Main 2026 schedule",
    SourceTeam: "Hortonville",
  }))
  const schedule = [...data.schedule.filter((game) => game.Team !== "Hortonville"), ...hortonville]
    .sort((a, b) => a.Date.localeCompare(b.Date) || a.Team.localeCompare(b.Team))

  function summarize(team: string) {
    const games = schedule.filter((game) => game.Team === team)
    const played = games.filter((game) => game.Result && ["W", "L", "D", "T"].includes(game.Result))
    let W = 0, L = 0, T = 0, GF = 0, GA = 0
    for (const game of played) {
      if (game.Result === "W") W++
      else if (game.Result === "L") L++
      else T++
      if (game.Score) { const [gf, ga] = game.Score.split("-").map(Number); GF += gf; GA += ga }
    }
    // Hortonville's local schedule is updated after each match, so it is the
    // authoritative source for the current record and scoring totals.
    const ranking = team === "Hortonville" ? undefined : data.rankings?.find((row) => row.Team === team)
    if (ranking) return { Team: team, GS: games.length, GP: ranking.GP, W: ranking.W, L: ranking.L, T: ranking.T, GF: ranking.GF, GA: ranking.GA, GD: ranking.GF - ranking.GA, Points: ranking.W * 3 + ranking.T, Group: teamGroups[team], Rank: ranking.Rank, Rating: ranking.Rating, SOS: ranking.SOS }
    return { Team: team, GS: games.length, GP: played.length, W, L, T, GF, GA, GD: GF - GA, Points: W * 3 + T, Group: teamGroups[team], Rank: null, Rating: null, SOS: null }
  }
  const overall = data.teams.map(({ Team }) => summarize(Team))
  const groupPoints = (team: string) => schedule.filter((game) => game.Team === team && teamGroups[game.Opponent] === teamGroups[team])
    .reduce((points, game) => points + (game.Result === "W" ? 3 : game.Result && ["D", "T"].includes(game.Result) ? 1 : 0), 0)
  const seedGroup = (group: string) => {
    const rows = overall.filter((row) => row.Group === group).map((row) => {
      const GroupPoints = groupPoints(row.Team)
      return { Team: row.Team, Group: group, GroupPoints, OverallPoints: row.Points, GD: row.GD, Rank: row.Rank, Rating: row.Rating, Seed: 0, Composite: GroupPoints * 10 + row.Points * 2 + row.GD }
    }).sort((a, b) => b.Composite - a.Composite || a.Team.localeCompare(b.Team))
    let previous: typeof rows[number] | undefined
    rows.forEach((row, index) => { row.Seed = previous?.Composite === row.Composite ? previous.Seed : index + 1; previous = row })
    return rows
  }
  const teamNames = data.teams.map(({ Team }) => Team)
  const headToHead = teamNames.map((team) => ({ team, group: teamGroups[team], opponents: Object.fromEntries(teamNames.map((opponent) => {
    if (opponent === team) return [opponent, null]
    const matches = schedule.filter((game) => game.Team === team && game.Opponent === opponent)
    const played = matches.filter((game) => game.Result)
    if (played.length) return [opponent, played.reduce((points, game) => points + (game.Result === "W" ? 3 : game.Result && ["D", "T"].includes(game.Result) ? 1 : 0), 0)]
    return [opponent, matches.length ? "Scheduled" : "No Match"]
  })) }))
  return { ...data, schedule, overall, seedings: { "Group A": seedGroup("Group A"), "Group B": seedGroup("Group B") }, headToHead, sync: { ...(data.sync as object), hortonvilleSource: "public/data/games_2026.csv", hortonvilleRows: hortonville.length } }
}
