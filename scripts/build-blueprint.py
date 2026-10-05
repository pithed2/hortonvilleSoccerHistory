"""Build the portable reader guide and its companion directory package."""
from pathlib import Path
import re
import shutil
import zipfile
root=Path(__file__).resolve().parents[1]/'docs/recruiting-blueprint'
chapters=[root/'start-here.md',*sorted(root.glob('[0-1][0-9]-*.md'))]
lines=["# Hortonville Men's College Soccer Recruiting Blueprint",'',"Updated October 4, 2026.",'',"For HHS players and their parents looking at men's college soccer. Rules can change. Confirm the requirements that apply to you with the school.",'','## Contents','']
for path in chapters:
 title=path.read_text(encoding='utf-8').splitlines()[0][2:]
 anchor=re.sub(r'[^\w\s-]','',title.lower()).replace(' ','-')
 lines.append(f'- [{title}](#{anchor})')
lines+=['- [Appendices](#appendices)','']
for path in chapters:lines.extend([path.read_text(encoding='utf-8').strip(),'','---',''])
lines.extend(['# Appendices','',"Use these when you need them. The AI prompts are included below. The full program and contact directory comes with this guide as a separate appendix so you don't have to scroll through thousands of contacts while reading.",'','- [AI prompt appendix](#ai-prompt-appendix)','- [Program and coach directory appendix](#program-and-coach-directory-appendix)','', (root/'ai-research-prompts.md').read_text(encoding='utf-8').strip(),'','---','','# Program and coach directory appendix','',"The companion file, **Program_and_Coach_Directory_2026.md**, contains the D1, D2, D3, NAIA and junior-college program and contact lists. **College_Soccer_Recruiting_Directory_2026.xlsx** contains the same directory in separate tabs you can filter and edit. Both are included in the recruiting package.",'',"Check the contact's verification date and the school's current official staff page before sending anything. Most D2 through junior-college contacts still need to be checked. An old address or a place in this list doesn't establish a current coach or an active team.",''])
content='\n'.join(lines)
for name in ['complete-blueprint.md','complete-blueprint-draft.md']:
 (root/name).write_text(content,encoding='utf-8')
out=root.parents[1]/'outputs/recruiting-blueprint'
out.mkdir(parents=True,exist_ok=True)
(out/'HHS_College_Soccer_Recruiting_Blueprint_2026.md').write_text(content,encoding='utf-8')
assert (out/'Program_and_Coach_Directory_2026.md').exists(), 'Prepare the published reader appendix first.'
assert (out/'College_Soccer_Recruiting_Directory_2026.xlsx').exists(), 'Prepare the published reader directory first; do not copy the working master.'
with zipfile.ZipFile(out/'HHS_Recruiting_Package_2026.zip','w',zipfile.ZIP_DEFLATED) as package:
 for name in ['HHS_College_Soccer_Recruiting_Blueprint_2026.md','Program_and_Coach_Directory_2026.md','College_Soccer_Recruiting_Directory_2026.xlsx']:
  package.write(out/name,name)
before=sum(len((root/'revisions/before-contractions-2026-10-04'/p.name).read_text(encoding='utf-8').split()) for p in chapters)
after=sum(len(p.read_text(encoding='utf-8').split()) for p in chapters)
print(f'Chapters: {before:,} -> {after:,} words ({(before-after)/before:.1%} shorter). Portable guide and directory package built.')

# Keep the PDF, served workbook and progress note in sync after every refresh.
import subprocess
import sys
subprocess.run([sys.executable, str(Path(__file__).with_name('build-recruiting-downloads.py'))], check=True)
