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
    const ranking = data.rankings?.find((row) => row.Team === team)
    // Hortonville's local schedule is updated after each match, so it remains
    // authoritative for the record while StatsPlus supplies rank/rating data.
    if (ranking && team !== "Hortonville") return { Team: team, GS: games.length, GP: ranking.GP, W: ranking.W, L: ranking.L, T: ranking.T, GF: ranking.GF, GA: ranking.GA, GD: ranking.GF - ranking.GA, Points: ranking.W * 3 + ranking.T, Group: teamGroups[team], Rank: ranking.Rank, Rating: ranking.Rating, SOS: ranking.SOS }
    return { Team: team, GS: games.length, GP: played.length, W, L, T, GF, GA, GD: GF - GA, Points: W * 3 + T, Group: teamGroups[team], Rank: ranking?.Rank ?? null, Rating: ranking?.Rating ?? null, SOS: ranking?.SOS ?? null }
  }
  const overall = data.teams.map(({ Team }) => summarize(Team))
  const groupPoints = (team: string) => schedule.filter((game) => game.Team === team && teamGroups[game.Opponent] === teamGroups[team])
    .reduce((points, game) => points + (game.Result === "W" ? 3 : game.Result && ["D", "T"].includes(game.Result) ? 1 : 0), 0)
  const seedGroup = (group: string) => {
    const rows = overall.filter((row) => row.Group === group).map((row) => {
      const GroupPoints = groupPoints(row.Team)
      return { Team: row.Team, Group: group, GroupPoints, HeadToHeadPoints: 0, HeadToHeadDetail: "", OverallPoints: row.Points, GD: row.GD, Rank: row.Rank, Rating: row.Rating, Seed: 0 }
    })
    for (const row of rows) {
      const tiedTeams = new Set(rows.filter((candidate) => candidate.GroupPoints === row.GroupPoints).map((candidate) => candidate.Team))
      const tiedGames = schedule.filter((game) => game.Team === row.Team && tiedTeams.has(game.Opponent) && game.Result)
      row.HeadToHeadPoints = tiedGames.reduce((points, game) => points + (game.Result === "W" ? 3 : game.Result && ["D", "T"].includes(game.Result) ? 1 : 0), 0)
      row.HeadToHeadDetail = tiedGames.map((game) => `${game.Result === "D" ? "T" : game.Result} vs ${game.Opponent}`).join(", ")
    }
    rows.sort((a, b) => b.GroupPoints - a.GroupPoints
      || b.HeadToHeadPoints - a.HeadToHeadPoints
      || b.OverallPoints - a.OverallPoints
      || b.GD - a.GD
      || (b.Rating ?? Number.NEGATIVE_INFINITY) - (a.Rating ?? Number.NEGATIVE_INFINITY)
      || a.Team.localeCompare(b.Team))
    let previous: typeof rows[number] | undefined
    rows.forEach((row, index) => {
      const tied = previous !== undefined
        && previous.GroupPoints === row.GroupPoints
        && previous.HeadToHeadPoints === row.HeadToHeadPoints
        && previous.OverallPoints === row.OverallPoints
        && previous.GD === row.GD
        && previous.Rating === row.Rating
      row.Seed = tied && previous ? previous.Seed : index + 1
      previous = row
    })
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
