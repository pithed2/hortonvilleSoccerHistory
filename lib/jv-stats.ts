export type PlayerBoxLine = { player: string; shots: number; sog: number; goals: number; assists: number; yc: number; rc: number; saves: number; gkMinutes: number }
export type BoxScore = {
  id: number; date: string; opponent: string; location: string; conference: boolean; result: string
  team: { shots: number; sog: number; saves: number; yc: number; rc: number; goals: number }
  opponentTotals: { shots: number; saves: number; goals: number }
  players: PlayerBoxLine[]
  scoring: Array<{ half: string; scorer: string; assist: string | null }>
}

type RawLine = [string, number, number, number, number, number, number, number, number]
const line = ([player, shots, sog, goals, assists, yc, rc, saves, gkMinutes]: RawLine): PlayerBoxLine => ({ player, shots, sog, goals, assists, yc, rc, saves, gkMinutes })

export const jvStats = {
  team: "JV Red",
  updated: "September 3, 2026",
  record: { wins: 3, losses: 2, ties: 0, conference: "2–1–0" },
  totals: { goalsFor: 19, goalsAgainst: 5, shots: 93, sog: 55, saves: 19 },
  goalkeepers: [
    { number: 31, name: "Henri Waite", games: 5, saves: 19, minutes: 375, goalsAgainst: 5 },
  ],
  recent: [
    { id: 5, date: "Sep 3", opponent: "Oshkosh North", location: "Away", score: "1–0", result: "W" },
    { id: 4, date: "Sep 1", opponent: "Neenah", location: "Home", score: "0–2", result: "L" },
    { id: 3, date: "Aug 31", opponent: "Oshkosh West", location: "Home", score: "8–0", result: "W" },
    { id: 2, date: "Aug 27", opponent: "Marshfield", location: "Home", score: "8–0", result: "W" },
    { id: 1, date: "Aug 25", opponent: "De Pere", location: "Home", score: "2–3", result: "L" },
  ],
  upcoming: [
    { date: "Sep 10", opponent: "St. Mary Central", location: "Home" },
    { date: "Sep 15", opponent: "Neenah", location: "Away" },
    { date: "Sep 17", opponent: "Shawano", location: "Away" },
    { date: "Sep 21", opponent: "Fox Valley Lutheran", location: "Home" },
    { date: "Sep 22", opponent: "Appleton North", location: "Home" },
    { date: "Sep 28", opponent: "Fox Valley Lutheran", location: "Away" },
    { date: "Oct 1", opponent: "Kimberly", location: "Home" },
    { date: "Oct 10", opponent: "DC Everest", location: "Home" },
  ],
  players: [
    { number: 22, name: "Amos Arndt", gp: 5, goals: 5, assists: 1, points: 11 },
    { number: 15, name: "Sam Radle", gp: 5, goals: 3, assists: 1, points: 7 },
    { number: 6, name: "Parker Anderson", gp: 5, goals: 2, assists: 1, points: 5 },
    { number: 19, name: "Timmy VanSchyndel", gp: 5, goals: 2, assists: 1, points: 5 },
    { number: 14, name: "Owen Pavich", gp: 5, goals: 1, assists: 3, points: 5 },
    { number: 12, name: "Brody Schroeder", gp: 5, goals: 2, assists: 0, points: 4 },
    { number: 20, name: "Beckett Feldbruegge", gp: 5, goals: 2, assists: 0, points: 4 },
    { number: 9, name: "Ben Parker", gp: 5, goals: 0, assists: 3, points: 3 },
    { number: 10, name: "Hunter Hasseler", gp: 5, goals: 1, assists: 1, points: 3 },
    { number: 18, name: "Grayson Ackermann", gp: 5, goals: 1, assists: 0, points: 2 },
    { number: 8, name: "Oliver Plamann", gp: 5, goals: 0, assists: 1, points: 1 },
    { number: 16, name: "Carson Sanford", gp: 5, goals: 0, assists: 1, points: 1 },
    { number: 23, name: "Jaxon Wolff", gp: 5, goals: 0, assists: 1, points: 1 },
    { number: 24, name: "Ethen LaPlant", gp: 5, goals: 0, assists: 1, points: 1 },
    { number: 26, name: "Leon Ryzhov", gp: 5, goals: 0, assists: 1, points: 1 },
    { number: 2, name: "Parker Rugotska", gp: 5, goals: 0, assists: 0, points: 0 },
    { number: 3, name: "Dylan McFarlane", gp: 5, goals: 0, assists: 0, points: 0 },
    { number: 4, name: "Weston Ehr", gp: 5, goals: 0, assists: 0, points: 0 },
    { number: 5, name: "Nolan Raaths", gp: 5, goals: 0, assists: 0, points: 0 },
    { number: 7, name: "Isaac Reiland", gp: 0, goals: 0, assists: 0, points: 0 },
    { number: 11, name: "Jaxton Seefeldt", gp: 5, goals: 0, assists: 0, points: 0 },
    { number: 13, name: "Aaron Young", gp: 5, goals: 0, assists: 0, points: 0 },
    { number: 17, name: "Henri Waite", gp: 5, goals: 0, assists: 0, points: 0 },
    { number: 21, name: "Easton Slomski", gp: 5, goals: 0, assists: 0, points: 0 },
    { number: 31, name: "Henri Waite", gp: 5, goals: 0, assists: 0, points: 0 },
  ],
}

export const boxScores: BoxScore[] = [
  {
    id: 1, date: "2026-08-25", opponent: "De Pere", location: "Home", conference: false, result: "L",
    team: { shots: 20, sog: 11, saves: 5, yc: 2, rc: 0, goals: 2 }, opponentTotals: { shots: 12, saves: 8, goals: 3 },
    players: ([
      ["15 - Sam Radle",3,2,1,0,0,0,0,0], ["31 - Henri Waite",0,0,0,0,0,0,5,80], ["19 - Timmy VanSchyndel",0,0,0,1,0,0,0,0],
      ["20 - Beckett Feldbruegge",2,2,1,0,0,0,0,0], ["22 - Amos Arndt",2,1,0,1,0,0,0,0], ["12 - Brody Schroeder",1,0,0,0,1,0,0,0],
      ["10 - Hunter Hasseler",2,0,0,0,1,0,0,0], ["4 - Weston Ehr",1,1,0,0,0,0,0,0], ["5 - Nolan Raaths",1,1,0,0,0,0,0,0],
      ["6 - Parker Anderson",3,2,0,0,0,0,0,0], ["14 - Owen Pavich",2,1,0,0,0,0,0,0], ["8 - Oliver Plamann",1,0,0,0,0,0,0,0],
      ["16 - Carson Sanford",1,1,0,0,0,0,0,0], ["18 - Grayson Ackermann",1,0,0,0,0,0,0,0],
    ] as RawLine[]).map(line),
    scoring: [{ half:"1st", scorer:"20 - Beckett Feldbruegge", assist:"19 - Timmy VanSchyndel" }, { half:"2nd", scorer:"15 - Sam Radle", assist:"22 - Amos Arndt" }],
  },
  {
    id: 2, date: "2026-08-27", opponent: "Marshfield", location: "Home", conference: false, result: "W",
    team: { shots: 29, sog: 18, saves: 1, yc: 0, rc: 0, goals: 8 }, opponentTotals: { shots: 2, saves: 10, goals: 0 },
    players: ([
      ["4 - Weston Ehr",1,0,0,0,0,0,0,0], ["6 - Parker Anderson",2,0,0,1,0,0,0,0], ["8 - Oliver Plamann",1,0,0,0,0,0,0,0], ["9 - Ben Parker",2,0,0,0,0,0,0,0],
      ["10 - Hunter Hasseler",1,1,1,1,0,0,0,0], ["11 - Jaxton Seefeldt",1,0,0,0,0,0,0,0], ["12 - Brody Schroeder",4,3,2,0,0,0,0,0], ["14 - Owen Pavich",1,1,0,2,0,0,0,0],
      ["15 - Sam Radle",2,2,0,0,0,0,0,0], ["16 - Carson Sanford",4,3,0,0,0,0,0,0], ["31 - Henri Waite",0,0,0,0,0,0,1,65], ["18 - Grayson Ackermann",2,2,1,0,0,0,0,0],
      ["19 - Timmy VanSchyndel",2,2,2,0,0,0,0,0], ["20 - Beckett Feldbruegge",1,1,1,0,0,0,0,0], ["21 - Easton Slomski",1,1,0,0,0,0,0,0], ["22 - Amos Arndt",2,1,1,0,0,0,0,0],
      ["23 - Jaxon Wolff",2,1,0,1,0,0,0,0], ["26 - Leon Ryzhov",0,0,0,1,0,0,0,0],
    ] as RawLine[]).map(line),
    scoring: [
      {half:"1st",scorer:"12 - Brody Schroeder",assist:"14 - Owen Pavich"}, {half:"1st",scorer:"19 - Timmy VanSchyndel",assist:null}, {half:"1st",scorer:"22 - Amos Arndt",assist:"14 - Owen Pavich"}, {half:"1st",scorer:"20 - Beckett Feldbruegge",assist:"10 - Hunter Hasseler"},
      {half:"2nd",scorer:"12 - Brody Schroeder",assist:null}, {half:"2nd",scorer:"18 - Grayson Ackermann",assist:null}, {half:"2nd",scorer:"19 - Timmy VanSchyndel",assist:"26 - Leon Ryzhov"}, {half:"2nd",scorer:"10 - Hunter Hasseler",assist:"6 - Parker Anderson"},
    ],
  },
  {
    id: 3, date: "2026-08-31", opponent: "Oshkosh West", location: "Home", conference: true, result: "W",
    team: { shots: 30, sog: 16, saves: 3, yc: 0, rc: 0, goals: 8 }, opponentTotals: { shots: 4, saves: 8, goals: 0 },
    players: ([
      ["2 - Parker Rugotska",1,0,0,0,0,0,0,0], ["6 - Parker Anderson",4,2,2,0,0,0,0,0], ["8 - Oliver Plamann",1,0,0,1,0,0,0,0], ["9 - Ben Parker",0,0,0,3,0,0,0,0],
      ["10 - Hunter Hasseler",3,1,0,0,0,0,0,0], ["11 - Jaxton Seefeldt",1,1,0,0,0,0,0,0], ["12 - Brody Schroeder",4,1,0,0,0,0,0,0], ["14 - Owen Pavich",1,1,1,1,0,0,0,0],
      ["15 - Sam Radle",3,2,1,1,0,0,0,0], ["16 - Carson Sanford",1,1,0,0,0,0,0,0], ["31 - Henri Waite",0,0,0,0,0,0,3,70], ["18 - Grayson Ackermann",1,1,0,0,0,0,0,0],
      ["20 - Beckett Feldbruegge",2,1,0,0,0,0,0,0], ["21 - Easton Slomski",1,1,0,0,0,0,0,0], ["22 - Amos Arndt",6,4,4,0,0,0,0,0], ["24 - Ethen LaPlant",0,0,0,1,0,0,0,0], ["26 - Leon Ryzhov",1,0,0,0,0,0,0,0],
    ] as RawLine[]).map(line),
    scoring: [
      {half:"1st",scorer:"22 - Amos Arndt",assist:"14 - Owen Pavich"}, {half:"1st",scorer:"14 - Owen Pavich",assist:"9 - Ben Parker"}, {half:"1st",scorer:"6 - Parker Anderson",assist:"8 - Oliver Plamann"}, {half:"1st",scorer:"22 - Amos Arndt",assist:"9 - Ben Parker"},
      {half:"2nd",scorer:"15 - Sam Radle",assist:"9 - Ben Parker"}, {half:"2nd",scorer:"6 - Parker Anderson",assist:"15 - Sam Radle"}, {half:"2nd",scorer:"22 - Amos Arndt",assist:null}, {half:"2nd",scorer:"22 - Amos Arndt",assist:"24 - Ethen LaPlant"},
    ],
  },
  {
    id: 4, date: "2026-09-01", opponent: "Neenah", location: "Home", conference: true, result: "L",
    team: { shots: 8, sog: 5, saves: 7, yc: 0, rc: 0, goals: 0 }, opponentTotals: { shots: 11, saves: 5, goals: 2 },
    players: ([
      ["4 - Weston Ehr",1,0,0,0,0,0,0,0], ["9 - Ben Parker",2,1,0,0,0,0,0,0], ["10 - Hunter Hasseler",1,1,0,0,0,0,0,0], ["12 - Brody Schroeder",1,1,0,0,0,0,0,0],
      ["14 - Owen Pavich",1,1,0,0,0,0,0,0], ["31 - Henri Waite",0,0,0,0,0,0,7,80], ["21 - Easton Slomski",1,1,0,0,0,0,0,0], ["22 - Amos Arndt",1,0,0,0,0,0,0,0],
    ] as RawLine[]).map(line),
    scoring: [],
  },
  {
    id: 5, date: "2026-09-03", opponent: "Oshkosh North", location: "Away", conference: true, result: "W",
    team: { shots: 6, sog: 5, saves: 3, yc: 0, rc: 0, goals: 1 }, opponentTotals: { shots: 4, saves: 5, goals: 0 },
    players: ([
      ["4 - Weston Ehr",1,1,0,0,0,0,0,0], ["6 - Parker Anderson",1,1,0,0,0,0,0,0], ["10 - Hunter Hasseler",1,0,0,0,0,0,0,0], ["14 - Owen Pavich",1,1,0,0,0,0,0,0],
      ["15 - Sam Radle",1,1,1,0,0,0,0,0], ["16 - Carson Sanford",0,0,0,1,0,0,0,0], ["22 - Amos Arndt",1,1,0,0,0,0,0,0], ["31 - Henri Waite",0,0,0,0,0,0,3,80],
    ] as RawLine[]).map(line),
    scoring: [{ half:"2nd", scorer:"15 - Sam Radle", assist:"16 - Carson Sanford" }],
  },
]

export function getJvBoxScore(id: number) { return boxScores.find((game) => game.id === id) }
