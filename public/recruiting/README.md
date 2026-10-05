# Recruiting resources

The public College Recruiting page is `/recruiting`. It links to the fit guide at `/recruiting/best-fit.html` and the files under `downloads/`.

After updating the blueprint or directory, run these from the repository root with the Python environment that has ReportLab installed:

```
python docs/recruiting-blueprint/build-directory-appendix.py
python scripts/build-blueprint.py
python scripts/check-blueprint-reader-copy.py
```

The blueprint build generates the PDF, rebuilds the ZIP and copies the current reader files into `public/recruiting/downloads`. It derives the directory progress counts from the verification queue. The workbook is copied without modifying its contents. Commit the refreshed public files with the page changes when preparing a deployment.

The fit guide runs in the player's browser. It doesn't call an AI service, transmit answers or save them between visits. Nine school-fit questions are followed by six athletic-evidence questions for varsity, reserve or undecided players. Club-only players skip the athletic questions. Results provide a provisional research range, stretch questions and follow-up tasks, not an ability score or an offer prediction.

`fit-assessment.js` contains the original HHS guidance rules. Specific, recent coach assessment takes priority over broad competition and match-role categories. An offer or evaluated coach interest identifies a program to follow up with; it doesn't establish a division-wide playing level. Missing evidence prompts assessment rather than a confident recommendation. School costs and academics must still be verified. These are transparent coaching heuristics, not a validated statistical model or recruiting odds.

Run `node --test scripts/check-fit-assessment.cjs` after changing the guidance rules. Also check the complete browser flow, editing, export and the club-only branch.
