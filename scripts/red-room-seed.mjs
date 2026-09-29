import { createHash, randomBytes, scryptSync } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createClient } from "@libsql/client"

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"))
const [red, white, blackGray] = await Promise.all([readJson("data/jv/red.json"), readJson("data/jv/white.json"), readJson("data/jv/black-gray.json")])
const csvRows = (source) => {
  const lines = source.replace(/\r/g, "").trim().split("\n")
  const split = (line) => {
    const values = []; let value = ""; let quoted = false
    for (let index = 0; index < line.length; index++) {
      const char = line[index]
      if (char === '"' && quoted && line[index + 1] === '"') { value += '"'; index++ }
      else if (char === '"') quoted = !quoted
      else if (char === "," && !quoted) { values.push(value); value = "" }
      else value += char
    }
    values.push(value); return values
  }
  const columns = split(lines[0])
  return lines.slice(1).map((line) => Object.fromEntries(split(line).map((value, index) => [columns[index], value])))
}
const normalized = (name) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US")
const stableId = (name) => `player_${createHash("sha256").update(normalized(name)).digest("hex").slice(0, 20)}`
const cleanJersey = (number) => number.split("/")[0].replace(/[^a-z0-9]/gi, "") || "X"
const makeClaimKey = () => {
  const chunk = () => randomBytes(3).toString("base64url").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "7")
  return `BEAR-${chunk()}-${chunk()}`
}

const varsityCsv = await readFile("public/data/rosters.csv", "utf8")
const entries = [
  ...csvRows(varsityCsv).filter((row) => row.season === "2026").map((row) => ({ name: row.player_name, number: row.number, squad: "Varsity", prefix: "V" })),
  ...red.stats.players.map((player) => ({ name: player.name, number: String(player.number), squad: "JV Red", prefix: "JR" })),
  ...white.stats.players.map((player) => ({ name: player.name, number: String(player.number), squad: "JV White", prefix: "JW" })),
  ...blackGray.squads.black.roster.map((player) => ({ name: player.name, number: String(player.number), squad: "JV Black", prefix: "JB" })),
  ...blackGray.squads.gray.roster.map((player) => ({ name: player.name, number: String(player.number), squad: "JV Gray", prefix: "JG" })),
]

const coaches = [
  { name: "Andy Montalbano", tag: "COACH-ANDY" },
  { name: "Paul Everett", tag: "COACH-PAUL" },
  { name: "Seth Rogers", tag: "COACH-SETH" },
  { name: "Alex Bonikowske", tag: "COACH-ALEX" },
  { name: "Shannon Everett", tag: "COACH-SHANNON" },
  { name: "Marco Delbecchi", tag: "COACH-MARCO" },
  { name: "Cooper Re", tag: "COACH-COOPER" },
]

const legends = [
  { name: "Gianluigi Buffon", tag: "LEGEND-1", jersey: "1", rating: 1300, ability: "third_keeper_zone", label: "The Wall: adds a third goalkeeper zone every round" },
  { name: "Harry Kane", tag: "LEGEND-9", jersey: "9", rating: 1275, ability: "tottenham_tax", label: "Golden Boot: removes one keeper zone every round · Tottenham Tax: first goal is ruled out. When you think of 💩, I think of Tottenham." },
  { name: "Cristiano Ronaldo", tag: "LEGEND-7", jersey: "7", rating: 1325, ability: "ronaldo_erase", label: "Siuuu Surge: removes one goalkeeper zone every round" },
  { name: "Thierry Henry", tag: "LEGEND-14", jersey: "14", rating: 1375, ability: "arsenal_invincibles", label: "Va Va Voom: removes one keeper zone every round · Arsenal Invincibles: first save is overturned. Arsenal is the best football club of all time. Bow down to the Invincibles." },
  { name: "Lionel Messi", tag: "LEGEND-10", jersey: "10", rating: 1400, ability: "messi_erase", label: "La Pulga: removes one goalkeeper zone every round" },
  { name: "Prime Coach Paul", tag: "LEGEND-PAUL", jersey: "PE", rating: 1425, ability: "second_ball", label: "The Shed Is Open: produces a second ball when his first shot is saved" },
  { name: "2013 Coach Marco", tag: "LEGEND-MARCO13", jersey: "13", rating: 1500, ability: "time_machine", label: "Bay Conference Time Machine: removes one keeper zone when shooting and adds one when saving" },
]

const url = process.env.TURSO_DATABASE_URL || process.env.RED_ROOM_DATABASE_URL || "file:.red-room/red-room.db"
await mkdir(".red-room", { recursive: true })
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
const exported = []
const usedTags = new Set()
const now = Date.now()

for (const entry of entries) {
  const playerId = stableId(entry.name)
  const existing = await client.execute({ sql: "SELECT public_tag FROM red_room_players WHERE id = ?", args: [playerId] })
  let tag = existing.rows[0]?.public_tag || `${entry.prefix}-${cleanJersey(entry.number)}`
  let suffix = 2
  while (usedTags.has(tag) && tag !== existing.rows[0]?.public_tag) tag = `${entry.prefix}-${cleanJersey(entry.number)}-${suffix++}`
  usedTags.add(tag)
  if (!existing.rows.length) {
    const key = makeClaimKey()
    const salt = randomBytes(16).toString("hex")
    const hash = scryptSync(key, salt, 64).toString("hex")
    await client.execute({
      sql: "INSERT INTO red_room_players (id, display_name, normalized_name, public_tag, claim_key_salt, claim_key_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [playerId, entry.name, normalized(entry.name), tag, salt, hash, now, now],
    })
    exported.push({ name: entry.name, tag, key })
  }
  const count = await client.execute({ sql: "SELECT COUNT(*) AS count FROM red_room_roster_memberships WHERE player_id = ?", args: [playerId] })
  await client.execute({
    sql: "INSERT OR IGNORE INTO red_room_roster_memberships (player_id, squad, jersey, is_primary, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [playerId, entry.squad, entry.number, Number(count.rows[0].count) === 0 ? 1 : 0, now, now],
  })
}

for (const coach of coaches) {
  const playerId = stableId(coach.name)
  const existing = await client.execute({ sql: "SELECT id FROM red_room_players WHERE id = ?", args: [playerId] })
  if (!existing.rows.length) {
    const key = makeClaimKey()
    const salt = randomBytes(16).toString("hex")
    const hash = scryptSync(key, salt, 64).toString("hex")
    await client.execute({
      sql: "INSERT INTO red_room_players (id, display_name, normalized_name, public_tag, account_type, claim_key_salt, claim_key_hash, match_credits, created_at, updated_at) VALUES (?, ?, ?, ?, 'coach', ?, ?, 999, ?, ?)",
      args: [playerId, coach.name, normalized(coach.name), coach.tag, salt, hash, now, now],
    })
    exported.push({ name: coach.name, tag: coach.tag, key })
  } else {
    await client.execute({ sql: "UPDATE red_room_players SET account_type = 'coach', match_credits = MAX(match_credits, 999), updated_at = ? WHERE id = ?", args: [now, playerId] })
  }
  await client.execute({
    sql: "INSERT OR IGNORE INTO red_room_roster_memberships (player_id, squad, jersey, is_primary, created_at, updated_at) VALUES (?, 'Coaches', 'C', 1, ?, ?)",
    args: [playerId, now, now],
  })
}

for (const legend of legends) {
  const playerId = stableId(legend.name)
  const salt = randomBytes(16).toString("hex")
  const lockedHash = scryptSync(randomBytes(32).toString("hex"), salt, 64).toString("hex")
  await client.execute({
    sql: "INSERT INTO red_room_players (id, display_name, normalized_name, public_tag, account_type, is_bot, special_ability, special_ability_label, claim_key_salt, claim_key_hash, match_credits, rating, created_at, updated_at) VALUES (?, ?, ?, ?, 'legend', 1, ?, ?, ?, ?, 999, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET public_tag = excluded.public_tag, account_type = 'legend', is_bot = 1, special_ability = excluded.special_ability, special_ability_label = excluded.special_ability_label, rating = CASE WHEN red_room_players.rating = 1000 THEN excluded.rating ELSE red_room_players.rating END, updated_at = excluded.updated_at",
    args: [playerId, legend.name, normalized(legend.name), legend.tag, legend.ability, legend.label, salt, lockedHash, legend.rating, now, now],
  })
  await client.execute({
    sql: "INSERT OR IGNORE INTO red_room_roster_memberships (player_id, squad, jersey, is_primary, created_at, updated_at) VALUES (?, 'World Legends', ?, 1, ?, ?)",
    args: [playerId, legend.jersey, now, now],
  })
}

await client.execute({
  sql: "INSERT OR IGNORE INTO red_room_trivia_questions (id, prompt, answer, choices, hint, source_href, source_label, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
  args: ["2015-09-14-jake-buhler-goals", "How many goals did Jake Buhler score against St. Mary Catholic on September 14, 2015?", "0", JSON.stringify(["0", "1", "2", "3"]), "The Polar Bears won 5–0. Look at the individual box score, not the team total.", "/seasons/2015#game-7", "2015 St. Mary Catholic box score", now, now],
})

const archiveRows = csvRows(await readFile("public/data/boxscore-player-stats.csv", "utf8"))
  .filter((row) => Number(row.season) >= 2008 && Number(row.season) <= 2025 && row.player_name && row.opponent && Number(row.goals) <= 4 && (Number(row.goals) > 0 || Number(row.assists) > 0))
const picked = []
for (const row of archiveRows) {
  const gameKey = `${row.season}-${row.game_number}`
  if (picked.some((item) => item.gameKey === gameKey)) continue
  picked.push({ ...row, gameKey })
  if (picked.length === 30) break
}
for (const row of picked) {
  const answer = String(Number(row.goals))
  const choices = [...new Set([answer, "0", "1", "2", "3", "4"])].slice(0, 4).sort((a, b) => Number(a) - Number(b))
  await client.execute({
    sql: "INSERT OR IGNORE INTO red_room_trivia_questions (id, prompt, answer, choices, hint, source_href, source_label, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
    args: [`archive-${row.season}-${row.game_number}-${stableId(row.player_name).slice(-8)}`, `How many goals did ${row.player_name} score against ${row.opponent} on ${row.date}?`, answer, JSON.stringify(choices), `Hortonville's result was ${row.score}. Check the individual box score line.`, `/seasons/${row.season}#game-${row.game_number}`, `${row.season} ${row.opponent} box score`, now, now],
  })
}

if (exported.length) {
  await mkdir("output", { recursive: true })
  const target = `output/red-room-player-keys-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`
  const escape = (value) => `"${value.replaceAll('"', '""')}"`
  await writeFile(target, ["player_name,public_tag,private_key", ...exported.map((row) => [row.name, row.tag, row.key].map(escape).join(","))].join("\n") + "\n")
  console.log(`Created ${exported.length} player identities. Private keys: ${target}`)
} else console.log("Player identities already exist; no private keys were regenerated.")
client.close()
