import concurrent.futures, datetime, html, json, pathlib, re, urllib.request

root = pathlib.Path('data/coachs-corner/seeding-2026.json')
data = json.loads(root.read_text(encoding='utf8'))
def fetch(url):
    return urllib.request.urlopen(url, timeout=30).read().decode()
def cells(text):
    def clean(c):
        value = html.unescape(re.sub(r'<[^>]*>', ' ', c)).strip()
        return {'D.C. Everest':'DC Everest','Stevens Point':'SPASH'}.get(value,value)
    return [[clean(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.S)] for row in re.findall(r'<tr[^>]*>(.*?)</tr>', text, re.S)]
names = {x['Team'] for x in data['teams']}

def rank_table(url):
    ranking_rows = [row for row in cells(fetch(url)) if len(row) >= 13 and row[7].isdigit()]
    ranks_by_team = {}
    records_by_team = {}
    for rank, row in enumerate(ranking_rows, 1):
        records_by_team[row[1]] = dict(Team=row[1], W=int(row[8]), L=int(row[9]), T=int(row[10]))
        if row[1] in names:
            ranks_by_team[row[1]] = dict(Team=row[1], Rank=rank, Rating=float(row[3]), SOS=float(row[4]), GP=int(row[7]), W=int(row[8]), L=int(row[9]), T=int(row[10]), GF=int(row[11]), GA=int(row[12]))
    return ranks_by_team, records_by_team

overall_ranks, opponent_records_by_team = rank_table(data['sourceUrl'])
d1_ranks, _ = rank_table(data['d1SourceUrl'])
assert len(overall_ranks) == len(names), 'Missing team on overall rankings page'
assert len(d1_ranks) == len(names), 'Missing team on D1 rankings page'
ranks = [dict(overall_ranks[team], OverallRank=overall_ranks[team]['Rank'], D1Rank=d1_ranks[team]['Rank']) for team in overall_ranks]
for row in ranks:
    del row['Rank']
opponent_records = list(opponent_records_by_team.values())
sources = {g['Team']: g['Source'] for g in data['schedule'] if g['Team'] != 'Hortonville' and g.get('Source','').startswith('https://soccer.statsplus.net/rankings/team/')}
assert set(sources) == names - {'Hortonville'}, 'Missing team schedule source'
def refresh(item):
    team, url = item
    matches = []
    for row in cells(fetch(url)):
        if len(row) < 7 or not re.fullmatch(r'\d\d-\d\d', row[1]): continue
        assert team in (row[3],row[5])
        home = row[5] == team
        score = re.fullmatch(r'(\d+)\s*-\s*(\d+)', row[4])
        pair = [int(score[1]),int(score[2])] if score else None
        if home and pair: pair.reverse()
        result = ('W' if pair[0]>pair[1] else 'L' if pair[0]<pair[1] else 'D') if pair else None
        matches.append(dict(Date='2026-'+row[1], Team=team, Opponent=row[3] if home else row[5], Location='H' if home else 'A', Result=result, Score='-'.join(map(str,pair)) if pair else None, Source=url, SourceTeam=team))
    assert len(matches)>0
    return matches
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    refreshed = [g for matches in pool.map(refresh,sources.items()) for g in matches]
old = {(g['Team'],g['Date'],g['Opponent']):g for g in data['schedule']}
refreshed_keys = {(g['Team'],g['Date'],g['Opponent']) for g in refreshed}
assert len(refreshed_keys) == len(refreshed), 'Duplicate schedule entries'
assert all(key in refreshed_keys for key, game in old.items() if game['Team'] != 'Hortonville' and game['Score']), 'A previously scored game disappeared; review before publishing'
changes = []
for g in refreshed:
    before = old.get((g['Team'],g['Date'],g['Opponent']))
    # Keep supplied results only until StatsPlus publishes a score.
    # Published scores use the fresh StatsPlus source and drop manual metadata.
    if before and before['Score'] and not g['Score']:
        g.update(Result=before['Result'],Score=before['Score'],Source=before['Source'])
        for key in ('SourceVerifiedAt', 'ManualResult', 'RankingResult', 'RankingScore'):
            if key in before: g[key] = before[key]
    if before and (before['Score'] != g['Score'] or before.get('Source') != g.get('Source')):
        changes.append({'team':g['Team'],'date':g['Date'],'opponent':g['Opponent'],'before':before['Score'],'after':g['Score'],'source':g['Source']})
data['schedule']=sorted([g for g in data['schedule'] if g['Team']=='Hortonville']+refreshed,key=lambda g:(g['Date'],g['Team']))
data['rankings']=ranks
data['opponentRecords']=opponent_records
# Preserve qualifying fixtures after their opponent's record changes.
records = {r['Team']: r for r in opponent_records}
highlights = set(data.get('weeklyHighlights', []))
today = datetime.date.today()
week_start = today - datetime.timedelta(days=(today.weekday() + 1) % 7)
week_end = week_start + datetime.timedelta(days=6)
for game in data['schedule']:
    record = records.get(game['Opponent'])
    if record and record['W'] > record['L'] and week_start.isoformat() <= game['Date'] <= week_end.isoformat():
        highlights.add('|'.join((game['Date'], game['Team'], game['Opponent'])))
data['weeklyHighlights'] = sorted(highlights)
data['sync']['weeklyPreparedFor'] = week_start.isoformat()
data['generatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
manual_results = [f"{g['Team']} {g['Score']} {g['Opponent']} ({g['Date']})" for g in refreshed if g.get('ManualResult')]
data['source']='StatsPlus rankings and team schedules refreshed.' + (' Supplied results retained where StatsPlus has no score yet.' if manual_results else '')
data['sync'].update(statsPlusAsOf=datetime.date.today().isoformat(),refreshedTeams=len(sources),refreshedRows=len(refreshed),manualResults=manual_results)
root.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(changes,indent=2))
