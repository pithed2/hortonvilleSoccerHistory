import { randomBytes, randomInt } from "node:crypto"
import { pathToFileURL } from "node:url"
import { createClient } from "@libsql/client"

// The deterministic ID makes this a once-per-person campaign, including reruns.
export async function addAndyWelcomeChallenges(client) {
  const tx = await client.transaction("write")
  try {
    const andy = (await tx.execute("SELECT id FROM red_room_players WHERE public_tag = 'COACH-ANDY' AND is_bot = 0")).rows[0]
    if (!andy) throw new Error("Coach Andy identity is missing; seed identities first.")
    const recipients = (await tx.execute({ sql: "SELECT id FROM red_room_players WHERE is_bot = 0 AND account_type IN ('player', 'coach', 'private') AND id <> ?", args: [andy.id] })).rows
    let created = 0
    for (const recipient of recipients) {
      const id = `andy-welcome:${recipient.id}`
      if ((await tx.execute({ sql: "SELECT id FROM red_room_challenges WHERE id = ?", args: [id] })).rows.length) continue
      const shots = Array.from({ length: 5 }, () => randomInt(1, 10))
      const keeps = Array.from({ length: 5 }, () => {
        const first = randomInt(1, 10)
        const second = randomInt(1, 9)
        return [first, second >= first ? second + 1 : second]
      })
      let code
      do { code = `PK-${randomBytes(3).toString("hex").toUpperCase()}` }
      while ((await tx.execute({ sql: "SELECT id FROM red_room_challenges WHERE code = ?", args: [code] })).rows.length)
      const now = Date.now()
      await tx.execute({ sql: "INSERT INTO red_room_challenges (id, code, challenger_id, opponent_id, challenger_shots, challenger_keeps, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [id, code, andy.id, recipient.id, JSON.stringify(shots), JSON.stringify(keeps), now + 365 * 86400000, now, now] })
      await tx.execute({ sql: "INSERT INTO red_room_credit_events (id, player_id, delta, reason, reference_id, created_at) VALUES (?, ?, -1, 'challenge_created', ?, ?)", args: [id, andy.id, id, now] })
      created++
    }
    if (created) await tx.execute({ sql: "UPDATE red_room_players SET match_credits = match_credits - ?, taunt_id = 'andy_chief', victory_id = 'book_of_andy', celebration_id = 'keyboard_warrior', updated_at = ? WHERE id = ?", args: [created, Date.now(), andy.id] })
    await tx.commit()
    return { eligible: recipients.length, created, alreadyPresent: recipients.length - created }
  } catch (error) {
    await tx.rollback()
    throw error
  } finally {
    tx.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const url = process.env.TURSO_DATABASE_URL || process.env.hhs_TURSO_DATABASE_URL || process.env.RED_ROOM_DATABASE_URL || "file:.red-room/red-room.db"
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.hhs_TURSO_AUTH_TOKEN
  const client = createClient({ url, authToken })
  try { console.log(JSON.stringify(await addAndyWelcomeChallenges(client))) }
  finally { client.close() }
}
