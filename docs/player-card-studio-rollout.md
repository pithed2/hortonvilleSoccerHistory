# Player Card Studio: cloud rollout

This feature is developed only on `feature/player-card-studio-access`. Do not merge it into `main` until the checklist below is verified.

## Paths

- Player: `/jv/red/red-room/cards`
- Public approved card: `/player-cards/c/[token]`
- Coach review: `/coachs-corner/card-approvals`
- Existing Red Room game: `/jv/red/red-room` (unchanged)
- Original coach-only card editor: `/coachs-corner/player-cards` (unchanged)

A player may have up to 3 cards. The limit is enforced by the server in an atomic database write transaction, not only by a disabled browser button. Every card is owned by the Red Room account ID. Names, teams, jersey numbers, and recorded statistics come from trusted server-side roster data and cannot be provided by the browser. Varsity and JV identities are supported; undocumented JV statistics display as unknown.

## Card design options

Five interchangeable finishes share the same locked player identity and stats: Polar Red, Black & White, Cracked Ice, Championship Gold (metallic brass/gold foil), and Retro Print (burgundy/cream ink with halftone and sepia photo treatment). Switching the finish edits an existing card and does not use another card slot. All finishes render both sides using the same 1000 × 1400 PNG output and photo crop controls.

## Miles's temporary test login

Miles Montalbano already has an existing Red Room private account (`NR-Miles`). On the feature branch, the Player Card Studio permits that exact identity to preview his 2021 stats when running as a Vercel preview with card writes disabled. This exception is not enabled on production, and it does not change or recover his private login key.

A key reset **requires writing to the database** that holds the Red Room account. Do not assume the Vercel preview uses an isolated database. Do not add a hard-coded shared test password to the login endpoint or commit any proposed key or hash to the repository.

For a separate, seeded **local-only** test database, the guarded utility `scripts/reset-miles-test-key.mjs` rotates Miles's key. It uses only `file:.red-room/card-studio-test.db`, requires `--isolated-local-db`, asks for the new key in a terminal without echoing it, checks his account identity and type, and invalidates previous sessions. Run it from the repository root:

```sh
node scripts/reset-miles-test-key.mjs --isolated-local-db
```

It deliberately **does not reset a Vercel or Turso account**. A live preview reset is blocked until preview/database isolation and authorized DB access are verified. The selected test key is low entropy and must never be used for production authentication.

## Safety before enabling

`CARD_STUDIO_WRITES_ENABLED` must be set explicitly to `true`. All Studio database access fails closed otherwise. Do not set the switch until the preview environment's database is confirmed isolated from production. This is especially important because the existing Red Room documentation uses shared Turso connection settings. Make a database backup before enabling in production.

The feature creates new `card_studio_*` tables using the existing libSQL connection. It does not change Red Room identity or match tables, nor does it migrate or delete the existing coach-only `player_cards` table.

## Email delivery

Approval mail is optional but expected for release:
- Configure `RESEND_API_KEY` (secret) in Vercel.
- Configure `CARD_APPROVAL_FROM_EMAIL` with a verified sender, e.g. the site's email address.
- Configure `NEXT_PUBLIC_SITE_URL` with the site's URL.
- Notifications go to `pithed2@gmail.com`, with subject `HHS Card Studio Approval Waiting`.
- If email is not configured, the submission remains pending and a notification record stays queued. If delivery fails, the error is recorded. Automatic retry is not yet implemented.

Do not add secrets to GitHub or this document. Use the Vercel environment-variable UI directly.

## Approval model

- Any real Red Room coach account can approve or reject.
- Coach's Corner's shared password does not grant review permissions.
- Each submission contains an immutable review snapshot and a revision number.
- Editing a draft does not update a submitted or already-approved snapshot.
- An existing public approved version remains available while a new submission is pending or rejected.
- Coach withdrawal removes the public snapshot.
- Approved cards use unlisted links. These links are not confidential: recipients can redistribute them.

## Review tests before merging

1. Account JR-2 cannot read or modify other players' cards by changing IDs.
2. All varsity and JV accounts resolve to the correct roster records.
3. Coaches can approve or reject and other players cannot.
4. Two coaches cannot approve the same revision twice.
5. An edit after submission cannot alter the pending review version.
6. Existing approved card content remains unchanged until a later revision is approved.
7. Withdrawn public links no longer return the card.
8. Invalid uploads and inappropriate descriptions are rejected by the server.
9. Photo consent is verified and public content contains no student contact details.
10. Test the external email delivery and failed-delivery behavior.
11. Confirm the production and preview databases are isolated.
12. Verify legacy coach-only card links and the existing Red Room game.

## Game usage metrics

The coach dashboard calculates eligible real player accounts, claimed accounts, players with at least one completed match, and completed matches involving real players. This excludes bots, coaches, private test identities, and pending challenges. The counts are read-only and reflect the database connected to that deployment, not a snapshot taken during development.

## Known limitations

- The PG-13 filter is a first-pass text filter. It does not understand context or inspect photo content. Coach review is required.
- Client-side image processing normally removes metadata; the server checks file signatures but does not yet independently re-encode uploads.
- Automatic email retries, dedicated distributed rate limiting, and automated end-to-end tests still need to be completed before general release.
- Game-login brute-force protection should be assessed before promoting a larger player-facing workflow.
