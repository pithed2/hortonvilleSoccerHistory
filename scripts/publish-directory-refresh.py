"""Maintain the working directory; never replace the published reader snapshot."""
from pathlib import Path
import csv, json, posixpath, shutil, zipfile
from lxml import etree as E
import openpyxl
ROOT=Path(__file__).resolve().parents[1]
BOOK=ROOT/'outputs/college-soccer-directory/College_Soccer_Recruiting_Directory_2026.xlsx'
NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
N={'s':NS}
before=openpyxl.load_workbook(BOOK)
values={s.title:list(s.values) for s in before};before.close()
with zipfile.ZipFile(BOOK) as z:parts={n:z.read(n) for n in z.namelist()}
rels=E.fromstring(parts['xl/_rels/workbook.xml.rels'])
targets={r.get('Id'):posixpath.normpath(posixpath.join('xl',r.get('Target'))) if not r.get('Target').startswith('/') else r.get('Target')[1:] for r in rels}
for s in E.fromstring(parts['xl/workbook.xml']).find('s:sheets',N):
 if s.get('name') not in ['D2','D3','NAIA','JUCO','Needs Review','Inactive Programs']:continue
 path=targets[s.get('{'+REL+'}id')]
 tree=E.fromstring(parts[path])
 relpath=posixpath.join(posixpath.dirname(path),'_rels',posixpath.basename(path)+'.rels')
 sheetrels=E.fromstring(parts[relpath]) if relpath in parts else E.Element('{'+PKG+'}Relationships',nsmap={None:PKG})
 for relationship in list(sheetrels):
  if relationship.get('Id','').startswith('urlRefresh'):sheetrels.remove(relationship)
 links=tree.find('s:hyperlinks',N)
 if links is None:
  links=E.Element('{'+NS+'}hyperlinks')
  after=tree.find('s:pageMargins',N)
  if after is not None:tree.insert(list(tree).index(after),links)
  else:tree.append(links)
 for link in list(links):
  if link.get('{'+REL+'}id','').startswith('urlRefresh') or link.get('ref','').rstrip('0123456789') in ['T','U']:links.remove(link)
 ids={r.get('Id') for r in sheetrels}
 for row_number,row in enumerate(values[s.get('name')][5:],6):
  columns=[('K',10),('R',17),('T',19),('U',20)] if s.get('name') in ['D2','Inactive Programs'] else [('T',19),('U',20)]
  for column,index in columns:
   value=row[index] if index<len(row) else None
   if not isinstance(value,str) or not value.startswith(('https://','http://')):continue
   key=f'urlRefresh{column}{row_number}'
   assert key not in ids
   E.SubElement(sheetrels,'{'+PKG+'}Relationship',Id=key,Type=REL+'/hyperlink',Target=value,TargetMode='External')
   link=E.SubElement(links,'{'+NS+'}hyperlink',ref=f'{column}{row_number}')
   link.set('{'+REL+'}id',key)
 parts[path]=E.tostring(tree,xml_declaration=True,encoding='UTF-8',standalone=True)
 parts[relpath]=E.tostring(sheetrels,xml_declaration=True,encoding='UTF-8',standalone=True)
temp=BOOK.with_suffix('.publishing.xlsx')
with zipfile.ZipFile(temp,'w',zipfile.ZIP_DEFLATED) as z:
 for name,data in parts.items():z.writestr(name,data)
after=openpyxl.load_workbook(temp)
for sheet in after:assert list(sheet.values)==values[sheet.title],sheet.title
assert any(c.hyperlink for row in after['D2'] for c in row if c.column==20)
after.close();temp.replace(BOOK)
working_folder=ROOT/'output/recruiting/working-downloads'
working_folder.mkdir(parents=True,exist_ok=True)
shutil.copy2(BOOK,working_folder/BOOK.name)
appendix=ROOT/'docs/recruiting-blueprint/program-coach-directory-appendix.md'
appendix_name='Program_and_Coach_Directory_2026.md'
shutil.copy2(appendix,working_folder/appendix_name)
package=working_folder/'HHS_Recruiting_Package_2026.zip'
if not package.exists():
 with zipfile.ZipFile(package,'w',zipfile.ZIP_DEFLATED):pass
with zipfile.ZipFile(package) as z:entries={n:z.read(n) for n in z.namelist()}
entries[BOOK.name]=BOOK.read_bytes()
entries[appendix_name]=appendix.read_bytes()
with zipfile.ZipFile(package,'w',zipfile.ZIP_DEFLATED) as z:
 for n,data in entries.items():z.writestr(n,data)
queue=list(csv.DictReader((ROOT/'output/recruiting/contact-verification-queue.csv').open(encoding='utf-8-sig')))
status=dict(checkedLabel='October 5, 2026',reviewed=sum(r['status'].startswith('reviewed') for r in queue),pending=sum(r['status'].startswith('pending') for r in queue))
status['queueMeaning']='Research tracking only. D1 and user-populated D3 are completed contact baselines; D3 pending queue entries do not mean population is unfinished.'
status['coverage']={}
for division in ['D1','D2','D3','NAIA','JUCO']:
 rows=[r for r in values[division][5:] if r[0]]
 schools={r[0] for r in rows}
 staff=[r for r in rows if r[6]]
 emails=[r for r in staff if r[8]]
 status['coverage'][division]=dict(listedPrograms=len(schools),programsWithStaff=len({r[0] for r in staff}),staffRecords=len(staff),staffWithEmail=len(emails),programsWithEmail=len({r[0] for r in emails}),programsWithoutStaff=len(schools-{r[0] for r in staff}),researchFollowupEntries=sum(r['division']==division and 'follow-up' in r['status'] for r in queue))
(ROOT/'output/recruiting/working-status.json').write_text(json.dumps(status,indent=2)+'\n',encoding='utf-8')
print(json.dumps(status));print('Working workbook and internal downloads updated; published snapshot unchanged.')

