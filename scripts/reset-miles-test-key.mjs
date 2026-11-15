// Rotate Miles's Red Room claim key in an isolated local test database only.
// This utility never connects to Turso and never writes to the live site.
import { createHash, randomBytes, scryptSync } from "node:crypto"
import { stdin, stdout } from "node:process"
import { createClient } from "@libsql/client"

const TEST_DB = "file:.red-room/card-studio-test.db"
const NAME = "miles montalbano"
const ID = "player_" + createHash("sha256").update(NAME).digest("hex").slice(0, 20)
const TAG = "NR-Miles"

function secretPrompt(prompt) {
  if (!stdin.isTTY || !stdin.setRawMode) {
    throw new Error("Run this interactively in a terminal. Never pass the key on the command line.")
  }
  return new Promise((resolve, reject) => {
    let text = ""
    stdout.write(prompt)
    stdin.setRawMode(true)
    stdin.setEncoding("utf8")
    stdin.resume()
    function cleanup() {
      stdin.off("data", onData)
      stdin.setRawMode(false)
      stdin.pause()
      stdout.write("\n")
    }
    function onData(chars) {
      for (const char of chars) {
        if (char === "\u0003") {
          cleanup()
          reject(new Error("Canceled."))
          return
        }
        if (char === "\r" || char === "\n") {
          cleanup()
          resolve(text.trim().toUpperCase())
          return
        }
        if (char === "\u007f" || char === "\b") text = text.slice(0, -1)
        else if (char >= " " && char <= "~") text += char
      }
    }
    stdin.on("data", onData)
  })
}

if (process.argv.length !== 3 || process.argv[2] !== "--isolated-local-db") {
  throw new Error("Usage: node scripts/reset-miles-test-key.mjs --isolated-local-db")
}
const key = await secretPrompt("New Miles test key (input hidden): ")
if (!/^BEAR-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)) {
  throw new Error("Expected BEAR-XXXX-XXXX. No change made.")
}
const salt = randomBytes(16).toString("hex")
const hash = scryptSync(key, salt, 64).toString("hex")
const client = createClient({ url: TEST_DB })
try {
  // Require an existing seeded test identity. Never create/replace real accounts.
  const result = await client.execute({
    sql: "SELECT id, display_name, normalized_name, public_tag, account_type, is_bot FROM red_room_players WHERE id = ?",
    args: [ID],
  })
  const row = result.rows[0]
  if (!row || row.display_name !== "Miles Montalbano" || row.normalized_name !== NAME
      || row.public_tag !== TAG || row.account_type !== "private" || Number(row.is_bot) !== 0) {
    throw new Error("Miles's test identity was not found in the isolated local database. No change made.")
  }
  const transaction = await client.transaction("write")
  try {
    const update = await transaction.execute({
      sql: "UPDATE red_room_players SET claim_key_salt=?, claim_key_hash=?, updated_at=? WHERE id=? AND normalized_name=? AND public_tag=? AND account_type='private' AND is_bot=0",
      args: [salt, hash, Date.now(), ID, NAME, TAG],
    })
    if (update.rowsAffected !== 1) throw new Error("Miles's test identity changed. No key reset performed.")
    // An existing session must not remain valid after a key rotation.
    await transaction.execute({
      sql: "DELETE FROM red_room_sessions WHERE player_id=?",
      args: [ID],
    })
    await transaction.commit()
    stdout.write("Miles's isolated local test key was reset. Existing test sessions were invalidated.\n")
  } catch (error) {
    await transaction.rollback()
    throw error
  } finally {
    transaction.close()
  }
} finally {
  client.close()
}
