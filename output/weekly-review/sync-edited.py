"""Import the edited edition into site data without modifying the Word source."""
import hashlib
import json
from pathlib import Path
from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph

root = Path('data/coachs-corner/weekly-reviews')
source = root / '2026-10-11-v5.docx'
before = hashlib.sha256(source.read_bytes()).hexdigest()
reviews = json.loads((root / 'reviews.json').read_text(encoding='utf-8'))
review = next(r for r in reviews if r['id'] == '2026-10-11-v5')
original = json.loads(json.dumps(review))
doc = Document(source)
assert len(doc.tables) == 7
# Word merged the title and overview into a single table during editing.
review['overview'] = [p.text.strip() for p in doc.tables[0].rows[1].cells[0].paragraphs if p.text.strip()]
paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
first_section = paragraphs.index(review['sections'][0]['title'])
game_text = paragraphs[2:first_section]
assert len(game_text) % 3 == 0
review['games'] = [dict(when=game_text[i], matchup=game_text[i+1], review=game_text[i+2]) for i in range(0, len(game_text), 3)]
for section, table in zip(review['sections'], doc.tables[1:]):
    section['columns'] = [c.text.strip() for c in table.rows[0].cells]
    section['rows'] = [[c.text.strip() for c in row.cells] for row in table.rows[1:]]
    section['notes'] = []
titles = {s['title']: s for s in review['sections']}
current = None
for element in doc.element.body:
    if element.tag.endswith('}p'):
        value = Paragraph(element, doc).text.strip()
        if value in titles:
            current = titles[value]
        elif value and current is not None:
            if value.startswith('Scores, schedules,'):
                review['sourceNote'] = value
            else:
                current['notes'].append(value)
assert len(review['sections']) == 6
assert sum(len(s['rows']) for s in review['sections']) == 31
assert hashlib.sha256(source.read_bytes()).hexdigest() == before
(root / 'reviews.json').write_text(json.dumps(reviews, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for field in ['overview', 'games', 'sections', 'sourceNote']:
    print(f'{field}: {"updated" if original[field] != review[field] else "unchanged"}')
print('Imported all document text; Word source unchanged.')
