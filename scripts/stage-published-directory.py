"""Validate and stage a deliberate public snapshot, without deploying the site."""
from pathlib import Path
import hashlib, json, shutil, zipfile
import openpyxl
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'output/recruiting/published-directory-input.json').read_text())
master=ROOT/'outputs/college-soccer-directory/College_Soccer_Recruiting_Directory_2026.xlsx'
assert hashlib.sha256(master.read_bytes()).hexdigest()==data['source_sha256'],'Working master changed; prepare a new snapshot.'
snapshot=ROOT/'outputs/college-soccer-directory/College_Soccer_Coach_Directory_Published_2026-10-05.xlsx'
book=openpyxl.load_workbook(snapshot,read_only=True,data_only=True)
assert book.sheetnames==['Start here',*data['sheets']]
for name,expected in data['sheets'].items():
    rows=list(book[name].values)
    assert list(rows[4])==data['headers'],name
    normalize=lambda rs:[[None if v=='' else v for v in row] for row in rs]
    assert normalize(rows[5:])==normalize(expected),name
book.close()
backup=ROOT/'output/recruiting/before-published-split-2026-10-05'
backup.mkdir(exist_ok=True)
workbook_name='College_Soccer_Recruiting_Directory_2026.xlsx'
appendix_name='Program_and_Coach_Directory_2026.md'
warning="Before every email, verify the coach's name, current role and email on the school's official men's soccer staff page or athletics directory. Coaches change jobs. An old contact or incorrect name can make you look unprepared and keep your message from reaching the current staff. If no address is published, use the recruiting questionnaire or ask the athletics office. Don't guess an address."
lines=['# College soccer programs and coach contacts','','Published snapshot: October 5, 2026. This directory is incomplete.','',warning,'','Blank fields mean information is unavailable in this snapshot.','']
def cell(v):return str(v or '').replace('|','\\|').replace('\n',' ').replace('\r',' ')
for name,rows in data['sheets'].items():
    lines.extend([f'## {name}','','| '+' | '.join(data['headers'])+' |','| '+' | '.join(['---']*len(data['headers']))+' |'])
    lines.extend('| '+' | '.join(cell(v) for v in row)+' |' for row in rows)
    lines.append('')
appendix='\n'.join(lines)
for folder_name in ['outputs/recruiting-blueprint','public/recruiting/downloads']:
    folder=ROOT/folder_name
    for name in [workbook_name,appendix_name,'HHS_Recruiting_Package_2026.zip']:
        previous=folder/name
        saved=backup/(folder.parent.name+'-'+name)
        if previous.exists() and not saved.exists():shutil.copy2(previous,saved)
    shutil.copy2(snapshot,folder/workbook_name)
    (folder/appendix_name).write_text(appendix,encoding='utf-8')
    package=folder/'HHS_Recruiting_Package_2026.zip'
    with zipfile.ZipFile(package) as z:entries={n:z.read(n) for n in z.namelist()}
    entries[workbook_name]=snapshot.read_bytes();entries[appendix_name]=appendix.encode('utf-8')
    with zipfile.ZipFile(package,'w',zipfile.ZIP_DEFLATED) as z:
        for name,content in entries.items():z.writestr(name,content)
    assert (folder/workbook_name).read_bytes()==snapshot.read_bytes()
    with zipfile.ZipFile(package) as z:assert z.read(workbook_name)==snapshot.read_bytes()
manifest=dict(snapshotDate=data['snapshot_date'],checkedLabel='October 5, 2026',source_sha256=data['source_sha256'],published_sha256=hashlib.sha256(snapshot.read_bytes()).hexdigest(),schools={n:len({r[0] for r in rows}) for n,rows in data['sheets'].items()},emails={n:sum(bool(r[8]) for r in rows) for n,rows in data['sheets'].items()})
(ROOT/'outputs/college-soccer-directory/published-snapshot.json').write_text(json.dumps(manifest,indent=2)+'\n')
status_path=ROOT/'public/recruiting/downloads/status.json'
status=json.loads(status_path.read_text());status.update(checkedLabel=manifest['checkedLabel'],snapshotDate=manifest['snapshotDate'])
status_path.write_text(json.dumps(status,indent=2)+'\n')
assert hashlib.sha256(master.read_bytes()).hexdigest()==data['source_sha256'],'Working master was altered.'
print('Validated all reader rows; preserved working master; staged clean workbook, appendix and ZIP copies. No deployment.')
