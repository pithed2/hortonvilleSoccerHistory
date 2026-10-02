# Player cards

Player Cards is separate from the Red Room. `/player-cards` is the public landing page. Coaches use `/coachs-corner/player-cards` with existing Coach’s Corner sign-in.

## Preparing a card

1. Select a 2026 varsity player, Miles Montalbano (2021 alumni sample), or OG Andy (temporary example with supplied photos and Cracked Ice preselected). OG Andy appears only in the studio’s card choices, not the official roster or statistics; no historical season or stats are invented. Existing saved drafts take precedence over the example defaults.
2. Supply a portrait and action photo, plus an optional separate back photo (JPG, PNG, WebP; up to 20 MB input). The browser resizes and compresses each image before saving. Adjust horizontal position, vertical position, and zoom.
3. Enter a coach-supplied overview, up to 500 characters. Select Polar Red, Black & White, or Cracked Ice. Confirm permission to use the photos.
4. Save a private draft or publish. Publishing snapshots official stats on the server. Draft edits never change the published version until published again.
5. Copy the individual unlisted link or download its QR. Players download front and back PNGs at 1000 × 1400. Links use random 128-bit tokens, remain stable across updates, and stop working when a card is withdrawn. Anyone with a link can access it; there is no public player directory.

Stats use the existing varsity archive, verified spelling aliases, and dedicated goalkeeper records. Unknown fields remain `—`; partial career totals use `*`. No invented ratings or unrecorded clean-sheet figures. Miles uses 2021 and 2020–2021 career totals rather than 2026. Current cards say “Conference Champions”; alumni cards do not.

## Storage

`PLAYER_CARDS_DATABASE_URL` and optional `PLAYER_CARDS_AUTH_TOKEN` configure a dedicated libSQL/Turso database. If omitted, the existing `TURSO_DATABASE_URL` / `hhs_TURSO_DATABASE_URL` (and corresponding token) or `RED_ROOM_DATABASE_URL` can be reused with a separate `player_cards` table. No Red Room identities or game tables are used. Development defaults to `.player-cards.db`, ignored by Git. Production requires persistent database configuration.

The table is created automatically on first use. It stores compressed images and draft/published JSON separately. Server Actions are coach-authorized, input-validated, and limited to a 2 MB request body. Up to three photos are limited to 1.8 MB total of data URLs. Shared pages are dynamic and marked noindex; unpublished cards return not found.

## Branding

Hortonville Area School District (HASD): primary #E4002B, #000000, #FFFFFF; secondary #9D9D9D and #1E22AA. The three card finishes are Polar Red, Black & White, and Cracked Ice. Cracked Ice uses a reusable canvas texture with silver facets, red reflections, and a transparent center to preserve the photos. The same finish appears in previews, shared cards, and PNG downloads; no per-photo processing or additional image downloads are needed. Card typography reuses the site's self-hosted Poppins family, waiting for font loading before rendering; Arial is the approved fallback. Uses the existing Hortonville bear logo. Digital only; no print bleed or print production claims.
