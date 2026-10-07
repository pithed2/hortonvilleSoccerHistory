"""Import visible Bound tables captured in the browser; retain missing stats as null."""
import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

root = Path(__file__).resolve().parents[1]
capture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
checked = sys.argv[2]
target = root / "data/coachs-corner/all-conference-2026.json"
data = json.loads(target.read_text(encoding="utf-8"))
old_names = {(p["team"], p["name"].casefold()): p["name"] for p in data["players"]}
players = {}
for team, scopes in capture.items():
    for scope in ("overall", "conference"):
        table = scopes[scope][0]
        assert table[0][:6] == ["Athlete", "GP", "GS", "AST", "G", "PTS"], (team, scope)
        for row in table[1:]:
            if row[0] == "Team":
                continue
            name = row[0].split(",", 1)[1].rsplit(",", 1)[0].strip()
            name = old_names.get((team, name.casefold()), name.title() if name.isupper() else name)
            key = f"{team}|{name}"
            player = players.setdefault(key, dict(id=key, name=name, team=team, overall=None, conference=None))
            goals, assists, points = int(row[4]), int(row[3]), int(row[5])
            assert points == 2 * goals + assists, (team, name, scope)
            player[scope] = dict(goals=goals, assists=assists, points=points)

def date(value):
    return value if value.startswith("2026-") else "2026-" + "-".join(f"{int(p):02}" for p in value.split("/"))

with (root / "public/data/games_2026.csv").open(encoding="utf-8-sig", newline="") as file:
    games = {g["date"]: g for g in csv.DictReader(file)}
totals = defaultdict(lambda: {s: dict(goals=0, assists=0, points=0) for s in ("overall", "conference")})
seen = set()
with (root / "public/data/boxscore-player-stats.csv").open(encoding="utf-8-sig", newline="") as file:
    for row in csv.DictReader(file):
        if row["season"] != "2026":
            continue
        game_date = date(row["date"])
        assert game_date in games, game_date
        key = (game_date, row["player_name"])
        assert key not in seen, key
        seen.add(key)
        scopes = ["overall"] + (["conference"] if games[game_date]["competition"] == "Fox Valley Association" else [])
        for scope in scopes:
            for metric in ("goals", "assists", "points"):
                totals[row["player_name"]][scope][metric] += int(row[metric] or 0)
# Include rostered players with recorded zero totals, as in the prior snapshot.
names = {p["name"] for p in data["players"] if p["team"] == "Hortonville"} | set(totals)
for name in sorted(names):
    key = f"Hortonville|{name}"
    players[key] = dict(id=key, name=name, team="Hortonville", **totals[name])

for coverage in data["coverage"]:
    coverage["checkedAt"] = checked
    if coverage["team"] == "Hortonville":
        coverage["resultsThrough"] = max(g["date"] for g in games.values() if g["score"])
    else:
        coverage["available"] = any(p["team"] == coverage["team"] for p in players.values())
        coverage["note"] = "Published Bound totals; individual game reporting may be incomplete." if coverage["available"] else "No individual athlete rows published; totals remain unavailable, not zero."
data["checkedAt"] = checked
data["resultsThrough"] = max(g["date"] for g in games.values() if g["score"])
data["freshnessNote"] = "All nine Bound schools checked October 7. Bound totals reflect posted individual stats, which may lag schedules. Hortonville box scores include October 6. Five schools still publish no individual rows."
data["players"] = sorted(players.values(), key=lambda p: (p["team"], p["name"]))
for p in data["players"]:
    for scope in ("overall", "conference"):
        s = p[scope]
        if s:
            assert s["points"] == 2 * s["goals"] + s["assists"]
    if p["overall"] and p["conference"]:
        assert all(p["overall"][m] >= p["conference"][m] for m in ("goals", "assists", "points")), p
target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
with (root / "output/fva-leaders-2026-10-07.csv").open("w", encoding="utf-8-sig", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Player", "School", "Conference goals", "Conference assists", "Conference points", "Overall goals", "Overall assists", "Overall points"])
    for p in sorted(data["players"], key=lambda p: -(p["conference"] or {}).get("points", 0)):
        writer.writerow([p["name"], p["team"]] + [(p[s] or {}).get(m, "") for s in ("conference", "overall") for m in ("goals", "assists", "points")])
print(f"Validated {len(players)} players; {sum(c['available'] for c in data['coverage'])}/10 schools publish individual stats.")
