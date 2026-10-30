import csv,json,collections,re,html
from pathlib import Path
rows=list(csv.DictReader(open('public/data/games.csv',encoding='utf-8-sig')))
rows=[r for r in rows if r['result'] in ['W','L','D','T']]
def aggregate(rs):
 out=dict(w=0,l=0,t=0,gf=0,ga=0,shutouts=0)
 for r in rs:
  out[{'W':'w','L':'l','T':'t','D':'t'}[r['result']]]+=1
  if re.fullmatch(r'\d+-\d+',r['score']):
   gf,ga=map(int,r['score'].split('-'));out['gf']+=gf;out['ga']+=ga;out['shutouts']+=int(ga==0)
 out['gp']=out['w']+out['l']+out['t'];out['winPct']=100*out['w']/out['gp'] if out['gp'] else 0
 return out
windows=[]
for grad in range(2009,2028):
 rs=[r for r in rows if grad-4<=int(r['season_year'])<=grad-1]
 a=aggregate(rs);a['classYear']=grad
 a['conference']=aggregate([r for r in rs if r['competition'] in ['Fox Valley Association','Bay Conference','Wisconsin Valley Conference','Eastern Valley Conference']])
 a['postseason']=aggregate([r for r in rs if r['competition'] in ['Post Season','Playoffs']])
 windows.append(a)
current=windows[-1]
for k in ['w','winPct','gf','ga','shutouts']:
 ordered=sorted(windows,key=lambda r:r[k],reverse=k!='ga');print(k,[(r['classYear'],r[k]) for r in ordered[:3]])
print('postseason',[(r['classYear'],r['postseason']['gp'],r['postseason']['w']) for r in sorted(windows,key=lambda r:r['postseason']['gp'],reverse=True)[:3]])
players=collections.defaultdict(lambda:dict(goals=0,assists=0,points=0,saves=0,seasons=set()))
for filename,keys in [('player-season-stats.csv',['goals','assists','points']),('goalkeeper-season-stats.csv',['saves'])]:
 for r in csv.DictReader(open('public/data/'+filename,encoding='utf-8-sig')):
  n={'Fenton Hershi':'Fenton Hirschi'}.get(r['player_name'],r['player_name']);p=players[n];p['seasons'].add(int(r['season']))
  for k in keys:p[k]+=int(float(r[k] or 0))
seniors=[r for r in csv.DictReader(open('public/data/rosters.csv',encoding='utf-8-sig')) if r['season']=='2026' and r['class']=='Sr.']
leaders=[]
for name in ['Roman Glad','Jacob Plutz','Noah Rindt','Eli Ryan']:
 p=players[name];out={'name':name}
 for k in ['goals','assists','points','saves']:
  out[k]=p[k];out[k+'Rank']=1+sum(x[k]>p[k] for x in players.values())
 leaders.append(out)
print('current',current);print('leaders',leaders);print('seniors',len(seniors))
seasonRows=[]
for year in range(2023,2027):
 rs=[r for r in rows if r['season_year']==str(year)];a=aggregate(rs);a['year']=year;a['conference']=aggregate([r for r in rs if r['competition']=='Fox Valley Association']);a['postseason']=aggregate([r for r in rs if r['competition'] in ['Post Season','Playoffs']]);seasonRows.append(a)
conf=[r for r in rows if r['competition']=='Fox Valley Association'];streak=[]
for r in sorted(conf,key=lambda r:r['date'],reverse=True):
 if r['result']=='L':break
 streak.append(r)
program=aggregate(rows)
data={'updatedAt':'2026-10-30','finalResult':{'date':'2026-10-29','opponent':'De Pere','score':'0-3','stage':'WIAA Division 1 sectional semifinal','source':'https://www.maxpreps.com/print/contest_stats.aspx?ContestId=25d4cb0f-4d27-4903-826c-58d0f53df8b7&ssid=ca5a6045-d072-443c-85de-08ce0e287273'},'classOf2027':current,'seasons':seasonRows,'windows':windows,'leaders':leaders,'seniors':seniors,'conferenceStreak':aggregate(streak),'program':program,'playerStatsNote':'Scoring totals through October 24; Hortonville scored no goals October 29, so career goals, assists and points are final. Goalkeeper saves include the October 29 box score.'}
Path('data/season-wrap-2026.json').write_text(json.dumps(data,indent=2)+'\n',encoding='utf8')
raw=Path('output/season-wrap-2026/maxpreps-final.html').read_text(encoding='utf8')
for tr in re.findall(r'<tr[^>]*>.*?</tr>',raw,re.S):
 txt=html.unescape(re.sub('<[^>]+>',' | ',tr))
 if 'PK' in txt or 'Ryan' in txt:print(re.sub(r'\s+',' ',txt))

