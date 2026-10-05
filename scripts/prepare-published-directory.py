"""Prepare an explicit reader snapshot; never change the working workbook."""
from pathlib import Path
import hashlib, json
import openpyxl
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'outputs/college-soccer-directory/College_Soccer_Recruiting_Directory_2026.xlsx'
book=openpyxl.load_workbook(SOURCE,read_only=True,data_only=True)
headers=['School','City','State / territory','School type','Conference','Association / division','Coach','Role','Email','Phone','Program website']
sheets={}
for name in ['D1','D2','D3','NAIA','JUCO']:
    rows=[]
    for row in list(book[name].values)[5:]:
        if not row[0]:continue
        rows.append([*row[:10],row[19] or row[10]])
    sheets[name]=rows
other=[]
for row in list(book['Needs Review'].values)[5:]:
    if row[0] and str(row[11] or '').startswith('Active USCAA program'):
        other.append([*row[:10],row[19] or row[10]])
if other:sheets['Other programs']=other
book.close()
data=dict(snapshot_date='2026-10-05',source_sha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),headers=headers,sheets=sheets)
(ROOT/'output/recruiting/published-directory-input.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
print({name:len(rows) for name,rows in sheets.items()})
