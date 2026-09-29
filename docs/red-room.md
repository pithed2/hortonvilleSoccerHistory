# Red Room database

The Red Room uses SQLite through libSQL. Local development writes to `.red-room/red-room.db`; production uses a Turso database connected through the Vercel Marketplace.

## Local setup

```powershell
npm install
npm run db:setup:red-room
npm run dev
```

The seed command creates one identity for every current Varsity and JV player. A player who appears on multiple rosters receives one identity with multiple roster memberships. Newly generated one-time Player Keys are exported to `output/red-room-player-keys-<timestamp>.csv`. That file and the local database are ignored by Git.

It also creates claimable coach identities for Andy Montalbano, Paul Everett, Seth Rogers, Alex Bonikowske, Shannon Everett, Marco Delbecchi, and Cooper Re. Coach accounts display unlimited test matches. Seven computer opponents form a progressive boss ladder. Players must meet both the win and correct-archive-answer requirement before the server accepts a challenge. Coaches receive bypass access for testing.

- Tier 1, Gianluigi Buffon: 3 wins and 1 correct archive answer; adds a third goalkeeper zone every round.
- Tier 2, Harry Kane: 5 wins and 2 correct archive answers; removes one keeper zone every round, but the Tottenham Tax rules out his first goal.
- Tier 3, Cristiano Ronaldo: 7 wins and 3 correct archive answers; removes one goalkeeper zone every round.
- Tier 4, Thierry Henry: 10 wins and 4 correct archive answers; removes one keeper zone every round, and the Arsenal Invincibles bonus overturns his first save.
- Tier 5, Lionel Messi: 12 wins and 5 correct archive answers; removes one goalkeeper zone every round.
- Tier 6, 2013 Coach Marco: 16 wins and 6 correct archive answers; removes one keeper zone when shooting and adds a third zone when saving.
- Tier 7, Prime Coach Paul: 20 wins and 8 correct archive answers; opens the equipment shed and produces a second ball after his first saved shot.

Ability choices are deterministic from the challenge ID, so a stored replay always produces the same outcome.

Regular players begin with three match credits. Creating a challenge or answering one costs one credit. At zero credits, both game paths stay disabled and the Archive Keeper presents a multiple-choice historical question. A correct answer atomically adds three credits; the API rejects trivia submissions while credits remain. Wrong answers return a hint and a link to the supporting archive page. The seed builds a 200-question library spanning individual games, player and goalkeeper totals, season records, coaching records, head-to-head history, fields and facilities, the program origin story, major milestones, and logo history. Players receive unseen questions first, then the least recently attempted review question after they have solved the full library. Legend progress counts distinct correctly answered active questions.

Seeding is idempotent: existing identities and keys are preserved. Keep the Player Key export private and distribute each row only to its matching player.

## Production setup

1. Add the free Turso Cloud integration to the Vercel project.
2. Connect the database to the Vercel project. The app accepts the integration's `hhs_TURSO_DATABASE_URL` and `hhs_TURSO_AUTH_TOKEN` names, as well as the standard unprefixed names.
3. Pull those variables into an ignored local environment file, then run the migration and seed scripts once against the hosted database with Node's `--env-file` option.
4. Save the generated Player Key export somewhere private before deleting the local copy.
5. Deploy the application normally.

The application falls back to local SQLite only outside production. Production remains unavailable until `TURSO_DATABASE_URL` is configured, preventing a deployment from silently writing to an ephemeral file.

## Current model

- `red_room_players`: one program identity, account type, bot/ability settings, claim credential, match credits, rating, and selected persona
- `red_room_roster_memberships`: Varsity/JV team and jersey history for each identity
- `red_room_sessions`: hashed, expiring device sessions
- `red_room_challenges`: roster-bound challenge codes, hidden picks, scores, and deterministic replay
- `red_room_trivia_questions` and `red_room_trivia_attempts`: Archive Keeper match-pack unlocks
- `red_room_credit_events`: auditable match-credit ledger

The historical game and player archive can move into additional SQLite tables later without changing the Red Room identity or competition data.
