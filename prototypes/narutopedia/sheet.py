"""The review sheet (docs/research/canon-kits-review.md) from what compile.py wrote."""
import json, collections, sys
OUT = sys.argv[1]
R = {r['pid']: r for r in json.load(open('out/roster2.json'))}
P = {t['id']: t for t in json.load(open('out/techfull.json'))}
rep = json.load(open('out/compile-report.json'))
C = json.load(open('out/compiled.json'))
new = {t['id']: t for t in C['techniques']}


def eff(t):
    parts = []
    for e in t['effects']:
        extra = ' '.join(str(v) for k, v in e.items() if k not in ('verb', 'power') and not isinstance(v, (list, bool)))
        parts.append(f"{e['verb']} {e['power']}" + (f' {extra}' if extra else ''))
    return ', '.join(parts)


L = ['# Canon kits from Narutopedia: review sheet', '',
     "What `prototypes/narutopedia/` gave the `naruto` fan pack's versus fighters, to read and correct.",
     'The kits live in `src/content/packs/naruto/canonKits/kits*.ts` (drop an id to take a technique',
     'back off someone) and the drafted techniques in `src/content/packs/naruto/techniques/canon/wiki/`',
     '(edit them freely).', '',
     f"**{rep['techniques']} techniques drafted, {rep['grants']} additions across {rep['fighters']} fighters, "
     f"{rep['duplicates']} wiki jutsu found to be the pack's own under another name, {len(rep['skipped'])} jutsu skipped.**", '',
     '## Drafts to look at first (low confidence)', '', '| Technique | Rank | Effects | Why |', '|---|---|---|---|']
for t in sorted(C['techniques'], key=lambda t: t['name']):
    if t.get('confidence') == 'low':
        L.append(f"| {t['name']} | {t['rank']} | {eff(t)} | {(t.get('note') or '').replace('|', '/')} |")
L += ['', '## By fighter', '',
      'Drafted techniques are marked _new_; the rest are techniques the pack already had that the fighter',
      'lacked. People of the world grow into theirs; versus-only fighters can use all of theirs now.', '']
for pid in sorted(C['kits'], key=lambda p: R[p]['name']):
    items = []
    for tid in C['kits'][pid]:
        if tid in new:
            items.append(f"{new[tid]['name']} ({new[tid]['rank']}, _new_)")
        elif tid in P:
            items.append(f"{P[tid]['name']} ({P[tid]['rank']})")
    where = 'in the world' if R[pid]['inWorld'] else 'versus only'
    L.append(f"- **{R[pid]['name']}** ({where}): " + '; '.join(items))
L += ['', '## Skipped', '', '| Jutsu | Why |', '|---|---|']
L += [f"| {t} | {str(w).replace('|', '/')} |" for t, w in sorted(rep['skipped'])]
sk = json.load(open('out/skipped.json'))
c = collections.Counter(s['why'].split(' (')[0] for s in sk)
L += ['', f'Before drafting, {len(sk)} fighter–jutsu pairs were left out by rule:', '']
L += [f'- {n}: {w}' for w, n in c.most_common()]
open(OUT, 'w').write('\n'.join(L) + '\n')
print(len(L), 'lines')
