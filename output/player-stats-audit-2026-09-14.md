# Player statistics reconciliation — September 14, 2026

Retallied every available varsity and JV player box score. Current-season coverage: 25 final results, with individual game statistics for 21. Also checked 313 historical varsity box scores (2007–2025). This is an audit of available records, not independent verification of every original score sheet or full match participation.

## Findings

- Current-season varsity, JV Red, and JV White goals, assists, and points match their game records. No scoring totals were changed.
- Black/Gray’s six reported player goals and three assists add up correctly. Five of the team’s eleven goals still lack player attribution: August 28 FVL (2), August 31 Appleton North (2), and September 8 Appleton East (1). The coach confirmed these details are not yet available.
- JV Red: Jaxon Wolff’s August 27 assist appears in both the source workbook Game Log and the website box score, but not in the Goal Log. His one assist is retained pending clarification.
- JV Red’s September 10 correction from Carson Sanford to Grayson Ackermann is already present on the website and matches the Goal Log. The source workbook Game Log still assigns those two goals to Carson. Commit b983412 documents the correction. A raw re-import would undo it; the updated import validation flags the conflict.
- The separate varsity player-game-stats.csv stops at September 8 and omits September 12. The public box scores and season scoring totals include September 12. The older player_game_stats.csv only covers the first two games; it was not added again to the public box scores.
- GP is not a uniform attendance measure: varsity reflects recorded stat appearances, Red/White use team participation, and Black/Gray player GP is unknown. Sparse scoring records cannot establish true individual appearances.

## Black/Gray goalkeeping

Ayden Lenth: two reported games, 160 minutes, and one recorded save. August 25: 80 minutes, one save. September 10: 80 minutes, saves unknown. Confirmed goals allowed: 3 at Appleton East and 2 at Little Chute, totaling 5 for the two reported games. Full season totals remain incomplete.

## Varsity 2026

| Date | Opponent | Final | Player goals | Assists |
| --- | --- | --- | --- | --- |
| 8/25 | West De Pere | 3-1 | 3 | 2 |
| 8/27 | Marshfield | 10-0 | 10 | 10 |
| 9/1 | Neenah | 3-3 | 3 | 3 |
| 9/3 | Oshkosh North | 3-2 | 3 | 3 |
| 2026-09-08 | Appleton East | 2-1 | 2 | 2 |
| 2026-09-12 | Bay Port | 6-0 | 6 | 4 |

| Player | Goals | Assists | Points |
| --- | --- | --- | --- |
| Fenton Hirschi | 1 | 6 | 8 |
| Roman Glad | 4 | 2 | 10 |
| Evan Langkan | 3 | 3 | 9 |
| Ben Diedrich | 4 | 1 | 9 |
| Eli Ryan | 0 | 0 | 0 |
| Mason Lyons | 1 | 0 | 2 |
| Noah Rindt | 6 | 2 | 14 |
| Jacob Plutz | 3 | 5 | 11 |
| Anthony Zanon | 3 | 4 | 10 |
| David Grasse | 0 | 0 | 0 |
| Connor Rindt | 1 | 0 | 2 |
| James Baker | 0 | 1 | 1 |
| Sawyer Davis | 1 | 0 | 2 |

## JV Red

| Date | Opponent | Final | Player goals | Assists |
| --- | --- | --- | --- | --- |
| 2026-08-25 | De Pere | 2-3 | 2 | 2 |
| 2026-08-27 | Marshfield | 8-0 | 8 | 6 |
| 2026-08-31 | Oshkosh West | 8-0 | 8 | 7 |
| 2026-09-01 | Neenah | 0-2 | 0 | 0 |
| 2026-09-03 | Oshkosh North | 1-0 | 1 | 1 |
| 2026-09-10 | St. Mary Central | 9-0 | 9 | 3 |

| Player | Goals | Assists | Points |
| --- | --- | --- | --- |
| #22 Amos Arndt | 6 | 1 | 13 |
| #6 Parker Anderson | 5 | 2 | 12 |
| #15 Sam Radle | 3 | 1 | 7 |
| #20 Beckett Feldbruegge | 3 | 0 | 6 |
| #12 Brody Schroeder | 3 | 0 | 6 |
| #16 Carson Sanford | 0 | 1 | 1 |
| #19 Timmy VanSchyndel | 2 | 1 | 5 |
| #9 Ben Parker | 1 | 3 | 5 |
| #14 Owen Pavich | 1 | 3 | 5 |
| #10 Hunter Hasseler | 1 | 1 | 3 |
| #18 Grayson Ackermann | 3 | 0 | 6 |
| #24 Ethen LaPlant | 0 | 1 | 1 |
| #23 Jaxon Wolff | 0 | 1 | 1 |
| #26 Leon Ryzhov | 0 | 1 | 1 |
| #8 Oliver Plamann | 0 | 1 | 1 |
| #2 Parker Rugotska | 0 | 1 | 1 |
| #4 Weston Ehr | 0 | 1 | 1 |
| #13 Aaron Young | 0 | 0 | 0 |
| #3 Dylan McFarlane | 0 | 0 | 0 |
| #21 Easton Slomski | 0 | 0 | 0 |
| #17 Henri Waite | 0 | 0 | 0 |
| #31 Henri Waite | 0 | 0 | 0 |
| #7 Isaac Reiland | 0 | 0 | 0 |
| #11 Jaxton Seefeldt | 0 | 0 | 0 |
| #5 Nolan Raaths | 0 | 0 | 0 |

## JV White

| Date | Opponent | Final | Player goals | Assists |
| --- | --- | --- | --- | --- |
| 2026-08-25 | West De Pere | 8-0 | 8 | 6 |
| 2026-09-01 | Green Bay Preble | 2-2 | 2 | 2 |
| 2026-08-27 | Neenah | 8-0 | 8 | 8 |
| 2026-08-22 | Wisconsin Rapids | 11-0 | 11 | 10 |
| 2026-08-22 | SPASH | 5-1 | 5 | 3 |
| 2026-09-08 | Appleton East | 2-1 | 2 | 1 |
| 2026-09-12 | Bay Port | 2-0 | 2 | 2 |

| Player | Goals | Assists | Points |
| --- | --- | --- | --- |
| #0 Ben Decker | 0 | 1 | 1 |
| #2 Riley Loewenhagen | 0 | 0 | 0 |
| #3 Riley Handevidt | 0 | 0 | 0 |
| #4 Isaac Reynolds | 1 | 1 | 3 |
| #5 Carter Possley | 0 | 4 | 4 |
| #6 Jack Lorge | 1 | 2 | 4 |
| #7 Wyatt Mauthepasch | 8 | 5 | 21 |
| #8 Adam Palmer | 0 | 0 | 0 |
| #9 Sam Larson | 1 | 1 | 3 |
| #10 Liam Evenson | 7 | 5 | 19 |
| #11 Bryce Draeger | 1 | 0 | 2 |
| #12 Connor Schmitt | 1 | 1 | 3 |
| #13 Bennett Froelich | 2 | 0 | 4 |
| #14 Matthew Racine | 3 | 1 | 7 |
| #15 Josh Petricca | 0 | 1 | 1 |
| #16 Liam Adkins | 0 | 1 | 1 |
| #17 Ollie Schmidt | 0 | 0 | 0 |
| #18 James Forsythe | 0 | 1 | 1 |
| #20 Nate Shaw | 2 | 1 | 5 |
| #21 Reno Brei | 9 | 4 | 22 |
| #22 Grayson Whitver | 1 | 0 | 2 |
| #23 Nate Diedrich | 0 | 1 | 1 |
| #24 Carter Halford | 0 | 0 | 0 |
| #25 Carter Hirschi | 1 | 2 | 4 |
| #26 Lachlan Elliott | 0 | 0 | 0 |

## JV Black/Gray

| Date | Opponent | Final | Player goals | Assists |
| --- | --- | --- | --- | --- |
| 2026-08-25 | Appleton East | 2-3 | 2 | 0 |
| 2026-08-26 | Green Bay Preble | 0-3 | Unknown | Unknown |
| 2026-08-28 | FVL | 2-4 | Unknown | Unknown |
| 2026-08-31 | Appleton North | 2-1 | Unknown | Unknown |
| 2026-09-08 | Appleton East | 1-1 | Unknown | Unknown |
| 2026-09-10 | Little Chute | 4-2 | 4 | 3 |

| Player | Goals | Assists | Points |
| --- | --- | --- | --- |
| Neel Patel | 2 | 0 | 4 |
| Ethan Nysse | 2 | 0 | 4 |
| Colton Daniels | 1 | 1 | 3 |
| Henri Biese | 1 | 0 | 2 |
| Aarav Patel | 0 | 1 | 1 |
| Ezekiel Hartjes | 0 | 1 | 1 |

## Current-season goalkeeper cross-check

Varsity: Eli Ryan’s 17 saves and 5 goals allowed, and David Grasse’s 11 saves and 2 goals allowed, match the public box scores. The detailed minutes file supports all 138 of David’s minutes and 242 of Eli’s stored 322 minutes; the September 12 game is absent from that file, so the remaining 80 minutes cannot be independently retallied there. No minute totals were changed.

JV Red: Henri Waite (#31) totals 20 saves in 430 minutes; Nolan Raaths totals 1 save in 5 minutes. JV White: Ben Decker totals 19 saves in 500 minutes. These match all available game lines. The two JV Red players named Henri Waite (#17 and #31) were kept separate using their source player keys.

## Historical varsity

After resolving unique abbreviated names against the season roster and totals, all recorded player goals, assists, and points reconcile to their season totals. Twelve games have a discrepancy between the sum of individual goals and the final score. These are unresolved source differences; changing a player’s total without an attribution would be speculative.

| Season | Date | Opponent | Final | Player goals |
| --- | --- | --- | --- | --- |
| 2011 | Thu Aug 18 | Waupaca | 5-1 | 6 |
| 2011 | Tue Aug 30 | West De Pere | 1-2 | 2 |
| 2012 | Thu Aug 16 | Waupaca | 5-0 | 4 |
| 2012 | Thu Sep 20 | Marinette | 3-5 | 2 |
| 2012 | Mon Sep 24 | Clintonville | 4-1 | 3 |
| 2013 | Tue Aug 20 | Clintonville | 11-0 | 10 |
| 2016 | Tue Oct 4 | Appleton West | 7-2 | 6 |
| 2017 | Tue Sep 19 | Neenah | 1-9 | 0 |
| 2018 | Sat Sep 15 | Freedom | 2-0 | 1 |
| 2020 | Sat Oct 3 | Wausau East | 5-0 | 6 |
| 2023 | Sat Sep 9 | Manitowoc Lincoln | 8-0 | 7 |
| 2023 | Tue Oct 17 | Green Bay West | 10-0 | 9 |

Historical goalkeeper GA for 2007–2010 cannot be reconciled as confirmed individual totals: the season import allocates team goals against in proportion to minutes, while the box-score source assigns game goals against to the goalkeeper with the most minutes. Both are estimates using different methods. These estimates were preserved; recorded saves were checked separately. Historical seasons without a box score for every match are not certified complete by this audit.

## Sources and method

Sources: public/data/boxscore-player-stats.csv, player-season-stats.csv, goalkeeper-season-stats.csv, player-game-stats.csv, rosters.csv; data/jv/red.json, white.json, black-gray.json; JV Red source workbook 2026_Season_Stats.xlsx (read only); and the prior JV Red correction in git history. Goals and assists were summed per player and game, with points recalculated as 2 × goals + assists. Repeated source representations were compared, not added together. Missing saves were kept unknown. Run node scripts/audit-player-stats.mjs --json for the detailed reconciliation data.
