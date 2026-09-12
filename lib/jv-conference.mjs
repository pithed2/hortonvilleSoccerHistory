export const JV_CONFERENCE_NOTE = "All JV teams belong to the FVA (Fox Valley Association). Conference games identify FVA opponents; JV teams play across competitive tiers, so these records do not represent a single conference standing."

export const FVA_OPPONENTS = [
  "Appleton West", "Appleton East", "Appleton North", "Neenah", "Kimberly",
  "Oshkosh West", "Oshkosh North", "Fond du Lac", "Kaukauna",
]

/** @param {string} opponent */
export function isJvConferenceOpponent(opponent) {
  const name = opponent.toLowerCase().replace(/\s+/g, " ").trim().replace(/ high school$/, "")
  return FVA_OPPONENTS.some(team => team.toLowerCase() === name)
}

/** @param {Array<{ opponent: string, result: string }>} games */
export function jvConferenceRecord(games) {
  const conference = games.filter(game => isJvConferenceOpponent(game.opponent))
  return ["W", "L", "T"].map(result => conference.filter(game => game.result.toUpperCase() === result).length).join("–")
}
