"""Check the reader edits, portable references, and packaged file consistency."""
from pathlib import Path
import re
import zipfile

repo = Path(__file__).resolve().parents[1]
root = repo / 'docs/recruiting-blueprint'
out = repo / 'outputs/recruiting-blueprint'
guide = (root / 'complete-blueprint.md').read_text(encoding='utf-8')
assert guide == (root / 'complete-blueprint-draft.md').read_text(encoding='utf-8')
assert guide == (out / 'HHS_College_Soccer_Recruiting_Blueprint_2026.md').read_text(encoding='utf-8')
prompt = re.search(r'### School-fit interview\n\n(> .*?)\n', (root / 'ai-research-prompts.md').read_text(encoding='utf-8')).group(1)
assert prompt in (root / '01-college-fit.md').read_text(encoding='utf-8')
assert guide.count(prompt) == 2  # Section 1 and the complete prompt appendix.
for forbidden in ['Review draft', 'for this draft', "We're not going to invent visit allowances", 'An official visit is paid for', 'Here is where the family', 'Here is an example', 'Designated-athlete exceptions', '\u2014']:
    assert forbidden not in guide, forbidden
for required in ['The school pays for some or all of an official visit.', 'A roster place does not mean playing time.', 'Loans are not discounts.', 'An unanswered email is definitely not an offer.', "a school you wouldn't attend", 'Wisconsin boys high school soccer runs in the fall.', 'MLS NEXT and ECNL', 'highest club level', 'https://wiacsports.com/sports/msoc', 'January 1 of junior year', 'December 23-25', '9.9 full-scholarship equivalents', '9.0 full-scholarship equivalents']:
    assert required in guide, required
links = re.findall(r'\]\(([^)]+)\)', guide)
assert all(link.startswith(('https://', 'http://', '#')) for link in links), 'Local dependency in reader links'
assert 'football-2026-wiac' not in guide
headings = re.findall(r'^#+ (.+)$', guide, re.M)
anchors = {re.sub(r'[^\w\s-]', '', h.lower()).replace(' ', '-') for h in headings}
assert all(link[1:] in anchors for link in links if link.startswith('#')), 'Broken internal section reference'
with zipfile.ZipFile(out / 'HHS_Recruiting_Package_2026.zip') as package:
    for name in package.namelist():
        assert package.read(name) == (out / name).read_bytes(), name
assert (out / 'College_Soccer_Recruiting_Directory_2026.xlsx').read_bytes() == (repo / 'outputs/college-soccer-directory/College_Soccer_Coach_Directory_Published_2026-10-05.xlsx').read_bytes()
print('Passed: requested wording, prompt parity, portability, contents anchors, package consistency, workbook preservation.')
