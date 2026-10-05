"""Publish current recruiting reader files and a paginated PDF to public/.

Run build-blueprint.py first. No workbook authoring: the verified master is copied.
"""
from pathlib import Path
import csv, html, json, re, shutil, zipfile
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'outputs/recruiting-blueprint'
DEST = ROOT / 'public/recruiting/downloads'
DEST.mkdir(parents=True, exist_ok=True)
PDF = 'HHS_College_Soccer_Recruiting_Blueprint_2026.pdf'
for name, font in [('Reader', 'arial.ttf'), ('ReaderBold', 'arialbd.ttf'), ('ReaderItalic', 'ariali.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts') / font)))
pdfmetrics.registerFontFamily('Reader', normal='Reader', bold='ReaderBold', italic='ReaderItalic', boldItalic='ReaderBold')
styles = getSampleStyleSheet()
for style in styles.byName.values():
    style.fontName = 'Reader'
styles['BodyText'].fontSize = 10
styles['BodyText'].leading = 15
styles['BodyText'].spaceAfter = 8
for level in range(1, 4):
    styles[f'Heading{level}'].fontName = 'ReaderBold'
    styles[f'Heading{level}'].textColor = colors.HexColor('#a51d2d')
    styles[f'Heading{level}'].spaceBefore = 12
    styles[f'Heading{level}'].spaceAfter = 9
styles.add(ParagraphStyle('Cell', parent=styles['BodyText'], fontSize=8.5, leading=12, spaceAfter=0))
styles.add(ParagraphStyle('Quote', parent=styles['BodyText'], leftIndent=12, borderColor=colors.HexColor('#a51d2d'), borderWidth=0, backColor=colors.HexColor('#f5f2ef'), borderPadding=8, spaceBefore=6))
styles.add(ParagraphStyle('Cover', parent=styles['Heading1'], fontSize=30, leading=36, spaceAfter=22))

def inline(text):
    text = text.replace('\u2013', '-').replace('\u2014', '-').replace('\u2011', '-')
    text = html.escape(text)
    def link(match):
        label, url = match.groups()
        return label if url.startswith('#') else f'<link href="{url}" color="#8f1826"><u>{label}</u></link>'
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link, text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<i>\1</i>', text)
    return re.sub(r'`([^`]+)`', r'\1', text)

story = []
lines = (SOURCE / 'HHS_College_Soccer_Recruiting_Blueprint_2026.md').read_text(encoding='utf-8').splitlines()
i = 0
while i < len(lines):
    line = lines[i].strip()
    if not line or line == '---':
        i += 1
        continue
    heading = re.match(r'^(#{1,6})\s+(.*)', line)
    if heading:
        level, title = len(heading[1]), heading[2]
        if level == 1 and story:
            story.append(PageBreak())
        story.append(Paragraph(inline(title), styles['Cover' if i == 0 else f'Heading{min(level,3)}']))
        i += 1
        continue
    if line.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].strip().startswith('|'):
            cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r':?-+:?', c) for c in cells):
                rows.append([Paragraph(inline(c) or ' ', styles['Cell']) for c in cells])
            i += 1
        count = len(rows[0])
        table = Table(rows, colWidths=[504/count]*count, repeatRows=1, hAlign='LEFT')
        table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#f0e8e7')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#d5d5d5')),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
        story.extend([table, Spacer(1,10)])
        continue
    bullet = re.match(r'^(?:[-*]|\d+\.)\s+(.*)', line)
    quote = line.startswith('>')
    text = bullet[1] if bullet else line.lstrip('> ').strip() if quote else line
    i += 1
    if not bullet:
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#|\||---|[-*] |\d+\.)', lines[i].strip()):
            text += ' ' + lines[i].strip().lstrip('> ')
            i += 1
    story.append(Paragraph(inline(text), styles['Quote' if quote else 'BodyText'], bulletText='•' if bullet else None))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#d5d5d5'))
    canvas.line(54,42,558,42)
    canvas.setFont('Reader',8)
    canvas.setFillColor(colors.HexColor('#555555'))
    canvas.drawString(54,29,'HHS | College Soccer Recruiting | October 2026')
    canvas.drawRightString(558,29,str(doc.page))
    canvas.restoreState()

pdf_path = SOURCE / PDF
SimpleDocTemplate(str(pdf_path), pagesize=(612,792), rightMargin=54, leftMargin=54, topMargin=48, bottomMargin=60, title="HHS Men's College Soccer Recruiting Blueprint", author='Hortonville Boys Soccer').build(story, onFirstPage=footer, onLaterPages=footer)
names = [PDF,'HHS_College_Soccer_Recruiting_Blueprint_2026.md','Program_and_Coach_Directory_2026.md','College_Soccer_Recruiting_Directory_2026.xlsx']
with zipfile.ZipFile(SOURCE/'HHS_Recruiting_Package_2026.zip','w',zipfile.ZIP_DEFLATED) as package:
    for name in names:
        package.write(SOURCE/name, name)
for name in names + ['HHS_Recruiting_Package_2026.zip']:
    shutil.copy2(SOURCE/name, DEST/name)
status = json.loads((DEST/'status.json').read_text(encoding='utf-8'))
print(json.dumps({'downloads': names, 'status': status}))
import subprocess, sys
subprocess.run([sys.executable, str(ROOT / 'scripts/build-blueprint-online.py')], check=True)
