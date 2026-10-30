import csv,json,re
from pathlib import Path
from pypdf import PdfReader
D=json.loads(Path('data/season-wrap-2026.json').read_text())
C=D['classOf2027'];assert (C['w'],C['l'],C['t'],C['gf'],C['ga'],C['shutouts'])==(63,10,12,283,61,44)
assert (C['postseason']['gp'],C['postseason']['w'])==(12,8)
assert len(D['windows'])==19 and len(D['seniors'])==12
for file in ['games.csv','games_2026.csv']:
 rs=[r for r in csv.DictReader(open('public/data/'+file,encoding='utf-8-sig')) if r['season_year']=='2026'];assert len(rs)==19 and all(r['result'] for r in rs)
 assert rs[-1]['opponent']=='De Pere' and rs[-1]['score']=='0-3'
 assert sum(int(r['score'].split('-')[1]) for r in rs)==19
assert Path('public/documents/class-of-2027-final-season-breakout.pdf').read_bytes()==Path('output/pdf/class-of-2027-final-season-breakout.pdf').read_bytes()
pdf=PdfReader('output/pdf/class-of-2027-final-season-breakout.pdf');assert len(pdf.pages)==3
text='\n'.join(p.extract_text() for p in pdf.pages)
for v in ['63W - 10L - 12T','283','44','60 goals','147 points','75 saves','16-2-1']:assert v in text,v
print('Final season, class aggregates, 19 comparison windows, 12 seniors and three-page PDF reconciled.')
