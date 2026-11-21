"""Write the lantern techniques review sheet: every new technique by art and rank, where it is
learned, and who the fill widened. Usage: lantern_sheet.py <compiled> <inv> <fill> <out.md>"""
import json, sys
from collections import defaultdict

compiled, inv, fill, out = sys.argv[1:5]
techs = json.load(open(compiled))
inv = json.load(open(inv))
fill = json.load(open(fill))
src = {t['id']: t['source'] for t in inv['techniques']}
names = {t['id']: t['name'] for t in inv['techniques']}
people = {r['pid']: r for r in inv['roster']}
RANKS = 'ESABCD'
order = {r: i for i, r in enumerate('EDCBAS')}

def where(t):
    s = src.get(t['id']) or ''
    if s.startswith('academy'): return 'academy'
    if s.startswith('library'): return 'library'
    if s.startswith('teacher:'): return 'taught by ' + ', '.join(people[p]['name'] if p in people else p for p in s[8:].split('|'))
    return s or '?'

def effects(t):
    return ', '.join(e['verb'] + ' ' + str(e['power']) + (' ' + e['size'] if e.get('size') else '') for e in t['effects'])

lines = ['# Lantern techniques: review sheet', '',
  'New techniques for the `original` pack, drafted from what the fan pack\'s canon kits do (never',
  'their names) and from the pack\'s own clans, schools and village. They live in',
  '`src/content/packs/original/techniques/lantern/`, one file per art; where each is learned is',
  '`src/content/packs/original/kits/sources.ts` (the academy takes E–D, the lantern archive C–A,',
  'clan and school techniques go to a teacher of that clan or school). Every S-rank technique is',
  'once a fight with a price paid after it. Edit any of it by hand; nothing regenerates it.', '',
  f'{len(techs)} techniques.', '']
by = defaultdict(list)
for t in techs: by[(t['discipline'], t.get('element'))].append(t)
for (disc, el), ts in sorted(by.items(), key=lambda kv: (kv[0][0], kv[0][1] or '')):
    lines += [f'## {disc.capitalize()}' + (f', {el}' if el else ''), '', '| Technique | Rank | Does | Learned |', '| --- | --- | --- | --- |']
    for t in sorted(ts, key=lambda t: (order[t['rank']], t['name'])):
        lines.append(f"| {t['name']} | {t['rank']} | {effects(t)} | {where(t)} |")
    lines.append('')
lines += ['## Widened kits', '',
  'People of the pack under a target (Kage 12, jōnin 9, chūnin 6, genin 5) were given techniques',
  'they could have learned: shelved ones, their clan\'s and their school\'s, usable at their grades,',
  'variety first. `src/content/packs/original/kits/fill*.ts`.', '']
for pid, ids in fill.items():
    p = people[pid]
    lines.append(f"- **{p['name']}** ({p['group']}, {len(p['techniqueIds'])} before): " + ', '.join(names[i] for i in ids))
open(out, 'w').write('\n'.join(lines) + '\n')
