import re, json, copy, zipfile, hashlib
from pathlib import Path
from lxml import etree as E

root = Path('data/coachs-corner/weekly-reviews')
source = Path('C:/Users/amontalbano/.codex/attachments/af0062dd-3c75-4be6-b7fe-523c16d0f3ed/Pasted text.txt').read_text(encoding='utf-8-sig')
lines = [s.strip() for s in source.splitlines() if s.strip()]
lines = [s for s in lines if s not in ['Wisconsin Sports Heroics','tournaments.wiaawi.org','Week 6'] and not re.fullmatch(r'\+\d+',s)]
parts = re.split(r'(?m)^([1-8]\. .+)\n', '\n'.join(lines))
blocks = {parts[i]: parts[i+1].splitlines() for i in range(1,len(parts),2)}
values = list(blocks.values())
overview = ['Our Week at Hortonville','13-1-1 overall · 8-0-1 FVA · Six straight wins · WSCA Division 1 #10 · WIAA Sectional 2 #2 seed']
overview += [s for s in values[0][9:] if s != 'Date\tResult']
games=[]
g=values[1]
for i,s in enumerate(g):
    if s in ['TUE','THU']:
        games.append(dict(when=f'{s} {g[i+1]} · {g[i+2]}',matchup=g[i+3],review=g[i+4].replace('four consecutive matches','five consecutive matches')))
post=g[g.index('The postseason is taking shape')+1:]
post=[s for s in post if s!='Seed\tMatchup']
games.append(dict(when='TUE Oct 20 · WIAA regionals',matchup='The postseason is taking shape',review=' '.join(s.replace('\t',': ') for s in post)))
sections=[]
for title,block in list(blocks.items())[2:7]:
    rows=[]; notes=[]
    for s in block:
        cells=s.split('\t')
        if len(cells)==4 and cells[0]!='Team':
            if 'Statewide' in title:
                rows.append([cells[0],cells[2]+' — '+cells[3], 'WSCA #'+cells[1], 'October 6 poll; before weekend results'])
            else:
                rows.append([cells[0],cells[1]+' — '+cells[2],cells[1],cells[3]])
        elif cells[0]!='Team': notes.append(s)
    sections.append(dict(title=title[3:],columns=['TEAM','LAST WEEK AND MY READ','WEEK RESULTS / POLL','COMING UP'],rows=rows,notes=notes))
sections.append(dict(title='My Overall Read',columns=['TEAM','ASSESSMENT','RECORD','NEXT STEP'],rows=[['Hortonville',' '.join(values[7][:-2]),'13-1-1','Tue Oct 13 at Notre Dame · Tue Oct 20 vs Bay Port']],notes=[values[7][-1]]))
review=dict(id='2026-10-11-v5',title='Weekly Regional Review',version=5,published='2026-10-11',author='Andy - Hortonville Polar Bears Statistician',resultsPeriod='Mon Oct 5 – Sat Oct 10',upcomingPeriod='Mon Oct 12 – Sat Oct 17',filename='2026-10-11-v5.docx',recordLabel='Week results / poll',overview=overview,games=games,sections=sections,sourceNote='Scores, schedules, October 6 WSCA rankings and published WIAA matchups are from the previously sourced weekly review. Unreported results remain unreported. Poll rankings precede the weekend games. '+values[7][-2])
reviews=json.loads((root/'reviews.json').read_text(encoding='utf-8'))
reviews=[review]+[r for r in reviews if r['id']!=review['id']]
(root/'reviews.json').write_text(json.dumps(reviews,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Clone the previous edition's actual OOXML components; preserve all other parts.
reference=root/'2026-10-04-v4.docx'
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W='{'+ns['w']+'}'
with zipfile.ZipFile(reference) as z:
    document=E.fromstring(z.read('word/document.xml')); body=document.find('w:body',ns)
    tables=body.findall('w:tbl',ns); paras=body.findall('w:p',ns)
    def text(node,value):
        runs=node.findall('.//w:t',ns)
        if runs:
            runs[0].text=value
            for r in runs[1:]:r.text=''
        else:
            p=node if node.tag==W+'p' else node.find('w:p',ns)
            E.SubElement(E.SubElement(p,W+'r'),W+'t').text=value
        return node
    def paragraph(template,value):return text(copy.deepcopy(template),value)
    heading=paras[1]; subheading=paras[2]; label=paras[3]; matchup=paras[4]; prose=paras[5]
    header=copy.deepcopy(tables[0]); cell=header.findall('.//w:tr/w:tc',ns)[1]
    hp=cell.findall('w:p',ns)
    for p,v in zip(hp,['FVA CHAMPIONS · BOYS SOCCER','Hortonville Polar Bears','Weekly Regional Review','Results: Oct 5–10, 2026 · Preview: Oct 12–17, 2026']):text(p,v)
    intro=copy.deepcopy(tables[1]); ic=intro.find('.//w:tc',ns); ip=ic.findall('w:p',ns)
    for p in ip:ic.remove(p)
    for i,v in enumerate(overview):ic.append(paragraph(ip[0] if i==0 else ip[min(1,len(ip)-1)],v))
    section_props=copy.deepcopy(body.find('w:sectPr',ns))
    for child in list(body):body.remove(child)
    body.extend([header,intro,paragraph(heading,'Key Games This Week'),paragraph(subheading,'October 12–17 and the regional opener')])
    for game in games:body.extend([paragraph(label,game['when']),paragraph(matchup,game['matchup']),paragraph(prose,game['review'])])
    for section in sections:
        body.append(paragraph(heading,section['title']))
        table=copy.deepcopy(tables[2]); tr=table.findall('w:tr',ns); sample=copy.deepcopy(tr[1])
        for row in tr[1:]:table.remove(row)
        for c,v in zip(tr[0].findall('w:tc',ns),section['columns']):text(c,v)
        for row in section['rows']:
            r=copy.deepcopy(sample)
            for c,v in zip(r.findall('w:tc',ns),row):text(c,v)
            table.append(r)
        body.append(table)
        for note in section['notes']:body.append(paragraph(prose,note))
    body.append(paragraph(prose,review['sourceNote'])); body.append(section_props)
    with zipfile.ZipFile(root/review['filename'],'w',zipfile.ZIP_DEFLATED) as out:
        for item in z.infolist():out.writestr(item,E.tostring(document,xml_declaration=True,encoding='UTF-8',standalone=True) if item.filename=='word/document.xml' else z.read(item.filename))
Path('output/weekly-review/artifact.md').write_text('Reference: '+str(reference.resolve())+'\nSHA256: '+hashlib.sha256(reference.read_bytes()).hexdigest()+'\nPage system: Letter portrait, 0.75 inch margins. Preserve sectPr and all package parts except document.xml.\nReuse title table, shaded overview table, game paragraph triplets and four-column regional tables. New notes use game prose formatting. Added regional opener and overall assessment reuse these components.\nRendering unavailable: bundled LibreOffice executable absent.\n',encoding='utf-8')
print('Created version 5 with',len(sections),'sections and',sum(len(s['rows']) for s in sections),'team assessments.')
