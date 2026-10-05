"""Render the published recruiting reader as a portable online page."""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parents[1]

def inline(text):
    text = html.escape(text)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<em>\1</em>', text)
    return re.sub(r'`([^`]+)`', r'<code>\1</code>', text)

lines = (ROOT / 'outputs/recruiting-blueprint/HHS_College_Soccer_Recruiting_Blueprint_2026.md').read_text(encoding='utf-8').splitlines()
parts = []
anchors = set()
i = 0
while i < len(lines):
    line = lines[i].strip()
    i += 1
    if not line or line == '---':
        continue
    heading = re.match(r'^(#{1,6})\s+(.*)', line)
    if heading:
        level, title = len(heading[1]), heading[2]
        anchor = re.sub(r'[^\w\s-]', '', title.lower()).replace(' ', '-')
        base = anchor
        suffix = 1
        while anchor in anchors:
            anchor = f'{base}-{suffix}'
            suffix += 1
        anchors.add(anchor)
        level = 1 if not parts else 2 if title == 'Contents' else min(level + 1, 6)
        parts.append(f'<h{level} id="{anchor}">{inline(title)}</h{level}>')
    elif line.startswith('|'):
        rows = [line]
        while i < len(lines) and lines[i].strip().startswith('|'):
            rows.append(lines[i].strip())
            i += 1
        table = []
        for row in rows:
            cells = [c.strip() for c in row.strip('|').split('|')]
            if all(re.fullmatch(r':?-+:?', c) for c in cells):
                continue
            tag = 'th' if not table else 'td'
            table.append('<tr>' + ''.join(f'<{tag}>{inline(c)}</{tag}>' for c in cells) + '</tr>')
        parts.append('<div class="table-scroll"><table>' + ''.join(table) + '</table></div>')
    elif re.match(r'^(?:[-*]|\d+\.)\s+', line):
        ordered = bool(re.match(r'^\d+\.', line))
        pattern = r'^\d+\.\s+' if ordered else r'^[-*]\s+'
        items = [re.sub(pattern, '', line)]
        while i < len(lines) and re.match(pattern, lines[i].strip()):
            items.append(re.sub(pattern, '', lines[i].strip()))
            i += 1
        tag = 'ol' if ordered else 'ul'
        parts.append(f'<{tag}>' + ''.join(f'<li>{inline(item)}</li>' for item in items) + f'</{tag}>')
    else:
        quote = line.startswith('>')
        text = line.lstrip('> ').strip() if quote else line
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#|\||---|[-*] |\d+\.|>)', lines[i].strip()):
            text += ' ' + lines[i].strip()
            i += 1
        parts.append(('<blockquote><p>' if quote else '<p>') + inline(text) + ('</p></blockquote>' if quote else '</p>'))

body = '\n'.join(parts)
for anchor in re.findall(r'href="#([^"]+)"', body):
    assert anchor in anchors, f'Missing contents target: {anchor}'
page = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>College Soccer Recruiting Blueprint | HHS Soccer</title>
<style>
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:#242424;background:#faf9f7;font:18px/1.7 system-ui,sans-serif}a{color:#a51d2d;text-underline-offset:3px}a:focus-visible{outline:3px solid #a51d2d;outline-offset:4px}header{background:#fff;border-bottom:1px solid #dedbd6;padding:20px max(20px,calc((100% - 900px)/2))}nav{display:flex;flex-wrap:wrap;gap:12px 28px;font-size:15px;font-weight:650}main{max-width:900px;margin:auto;padding:36px 24px 80px}h1{font-size:clamp(30px,5vw,46px);line-height:1.15;letter-spacing:-.035em}h2{font-size:30px;line-height:1.25;color:#a51d2d;border-top:1px solid #dedbd6;padding-top:30px;margin-top:60px}h3{font-size:23px;line-height:1.35;margin-top:32px}h4{font-size:20px}h1,h2,h3,h4{scroll-margin-top:24px}p,li{max-width:76ch}li{margin:8px 0}blockquote{margin:24px 0;padding:16px 24px;border-left:4px solid #a51d2d;background:#f1ece7;overflow-wrap:anywhere}blockquote p{margin:0}.table-scroll{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:15px}td,th{border:1px solid #d4d0cb;padding:12px;text-align:left;vertical-align:top}th{background:#eee8e3}footer{border-top:1px solid #dedbd6;padding:24px;text-align:center;font-size:15px}@media print{header,footer{display:none}body{background:white;font-size:11pt}main{max-width:none;padding:0}h2{break-before:page}a{color:inherit}blockquote,table{break-inside:avoid}}
</style></head><body>
<header><nav aria-label="Recruiting resources"><a href="/recruiting">College recruiting</a><a href="#contents">Jump to a section</a><a href="/recruiting/best-fit.html">Try the fit guide</a><a href="/recruiting/downloads/HHS_College_Soccer_Recruiting_Blueprint_2026.pdf">Download PDF</a><a href="/recruiting/downloads/College_Soccer_Recruiting_Directory_2026.xlsx">Programs and contacts</a></nav></header>
<main>''' + body + '''</main><footer><a href="#contents">Back to contents</a> · <a href="/recruiting">More recruiting resources</a></footer></body></html>'''
target = ROOT / 'public/recruiting/blueprint.html'
target.write_text(page, encoding='utf-8')
print(f'Built {target}: {len(anchors)} linked headings')
