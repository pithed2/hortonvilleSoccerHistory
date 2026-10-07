# Red Room database

The Red Room uses SQLite through libSQL. Local development writes to `.red-room/red-room.db`; production and preview use the shared Turso master database `database-cyan-arrow`, provisioned through Vercel Marketplace.

## Local setup

```powershell
npm install
npm run db:setup:red-room
npm run dev
```

The seed command creates one identity for every current Varsity and JV player. A player who appears on multiple rosters receives one identity with multiple roster memberships. Newly generated one-time Player Keys are exported to `output/red-room-player-keys-<timestamp>.csv`. That file and the local database are ignored by Git.

It also creates claimable coach identities for Andy Montalbano, Paul Everett, Seth Rogers, Alex Bonikowske, Shannon Everett, Marco Delbecchi, and Cooper Re. Coach accounts display unlimited test matches. Seven computer opponents form a progressive boss ladder. Players must meet both the win and correct-archive-answer requirement before the server accepts a challenge. Coaches receive bypass access for testing.

Miles Montalbano (`NR-Miles`) and Dawson Montalbano (`NR-Dawson`) are private non-roster test identities. Only Coach Andy can see them from the regular program, and they can see and challenge only Coach Andy, one another, and the Celebrity Legends. Their completed matches and personal records persist, while any match involving a private identity is excluded from all-program leaderboard calculations and rating changes. Private identities receive immediate access to every Celebrity Legend for testing.

- Tier 1, Gianluigi Buffon: 3 wins and 1 correct archive answer; adds a third goalkeeper zone every round.
- Tier 2, Harry Kane: 5 wins and 2 correct archive answers; removes one keeper zone every round, but the Tottenham Tax rules out his first goal.
- Tier 3, Cristiano Ronaldo: 7 wins and 3 correct archive answers; removes one goalkeeper zone every round.
- Tier 4, Thierry Henry: 10 wins and 4 correct archive answers; removes one keeper zone every round, and the Arsenal Invincibles bonus overturns his first save.
- Tier 5, Lionel Messi: 12 wins and 5 correct archive answers; removes one goalkeeper zone every round.
- Tier 6, 2013 Coach Marco: 16 wins and 6 correct archive answers; removes one keeper zone when shooting and adds a third zone when saving.
- Tier 7, Prime Coach Paul: 20 wins and 8 correct archive answers; opens the equipment shed and produces a second ball after his first saved shot.

Ability choices are deterministic from the challenge ID, so a stored replay always produces the same outcome.

Regular players begin with 10 match credits. Creating a challenge or answering one costs one credit. At zero credits, both game paths stay disabled and the Archive Keeper presents a multiple-choice historical question. A correct answer atomically adds 10 credits; the API rejects trivia submissions while credits remain. Wrong answers return a hint and a link to the supporting archive page. The seed builds a 200-question library spanning individual games, player and goalkeeper totals, season records, coaching records, head-to-head history, fields and facilities, the program origin story, major milestones, and logo history. Players receive unseen questions first, then the least recently attempted review question after they have solved the full library. Legend progress counts distinct correctly answered active questions.

Seeding is idempotent: existing identities and keys are preserved. Keep the Player Key export private and distribute each row only to its matching player.

## Production setup

1. Provision a Turso database and set explicit `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` Vercel project variables to its master URL and credential, for both Production and Preview.
2. Keep the marketplace resource disconnected from the project. Its automatic deployment provisioning previously created separate databases and split match history. Disconnecting the project preserves the database and existing branches; do not remove the resource itself.
3. Pull the explicit variables into an ignored local environment file, then run the migration and seed scripts with Node's `--env-file` option for initial setup. Production must use the master URL rather than a `dpl-` branch URL.
4. Save the generated Player Key export somewhere private.
5. Deploy normally. Production ignores the legacy `hhs_` fallback, so it cannot silently return to an injected deployment database. Local SQLite fallback is available only outside production.

The credit migration adds seven credits to existing player/private balances exactly once and records the grant in the ledger. It preserves spent credits and leaves coaches and bots unchanged. New seeded identities explicitly receive 10 credits even on older databases whose original SQLite column default was three.

## Login persistence

The tag field uses `autocomplete="username"`; the private key is a password field with `autocomplete="current-password"`. The browser's password manager controls whether it offers to save and autofill those credentials. The app never puts the private key in local storage and stores only a salted scrypt hash in the database.

Successful login sets a Secure (production), HttpOnly, SameSite=Lax cookie valid for 180 days. Its hashed session token is stored in the shared master database, so a deployment does not invalidate it. Logout deletes that session and clears its cookie. Personalized state responses use `Cache-Control: private, no-store`.

## Current model

- `red_room_players`: one program identity, account type, bot/ability settings, claim credential, match credits, rating, and selected persona
- `red_room_roster_memberships`: Varsity/JV team and jersey history for each identity
- `red_room_sessions`: hashed, expiring device sessions
- `red_room_challenges`: roster-bound challenge codes, hidden picks, scores, and deterministic replay
- `red_room_trivia_questions` and `red_room_trivia_attempts`: Archive Keeper match-pack unlocks
- `red_room_credit_events`: auditable match-credit ledger

The historical game and player archive can move into additional SQLite tables later without changing the Red Room identity or competition data.

## Accepting challenges

Incoming pending challenges appear near the top of the page after login. Accept challenge selects the correct match and opens its five-round planner; the recipient never has to type a code. Pending incoming matches in Your matches open the same planner. The existing server authorization still restricts answers to the intended opponent, and credits are spent only when Play it out completes the match. Codes remain an optional lookup method. The state endpoint returns all personal matches so older pending challenges cannot fall outside a recent-history cutoff.

## Coach Andy welcome match

Run `node scripts/red-room-andy-welcome.mjs` against the master database to issue one randomized welcome challenge to every human account other than COACH-ANDY (including coaches and private accounts, excluding bots). The normal seed command also invokes this for newly added identities. Deterministic `andy-welcome:<player-id>` IDs prevent duplicates and preserve picks on reruns. Each creation spends one Coach Andy credit and writes its normal ledger event; recipients spend a credit only when answering.

Welcome matches retain the andy_chief, book_of_andy, and keyboard_warrior persona regardless of later profile edits. The opener reminder appears only while the welcome is pending and the recipient has never completed a match against Coach Andy. Existing match history is preserved.

`instructions_seen_at` records the first authenticated room visit. Migration initializes it from claimed_at for existing claimed accounts. Instructions open on the first visit and start collapsed on subsequent page visits, across devices. Users can always expand them manually.
