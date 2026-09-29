# Red Room database

The Red Room uses SQLite through libSQL. Local development writes to `.red-room/red-room.db`; production uses a Turso database connected through the Vercel Marketplace.

## Local setup

```powershell
npm install
npm run db:setup:red-room
npm run dev
```

The seed command creates one identity for every current Varsity and JV player. A player who appears on multiple rosters receives one identity with multiple roster memberships. Newly generated one-time Player Keys are exported to `output/red-room-player-keys-<timestamp>.csv`. That file and the local database are ignored by Git.

It also creates claimable coach identities for Andy Montalbano, Paul Everett, Seth Rogers, Alex Bonikowske, Shannon Everett, Marco Delbecchi, and Cooper Re. Coach accounts display unlimited test matches. Three starred computer opponents answer challenges immediately:

- Lionel Messi removes one goalkeeper zone on every shot.
- Cristiano Ronaldo converts his first saved shot into a goal.
- Gianluigi Buffon adds a third goalkeeper zone every round.

Ability choices are deterministic from the challenge ID, so a stored replay always produces the same outcome.

Seeding is idempotent: existing identities and keys are preserved. Keep the Player Key export private and distribute each row only to its matching player.

## Production setup

1. Add the free Turso Cloud integration to the Vercel project.
2. Confirm Vercel created `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for Production and Preview.
3. Pull or set those variables locally, then run `npm run db:setup:red-room` once against the hosted database.
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
