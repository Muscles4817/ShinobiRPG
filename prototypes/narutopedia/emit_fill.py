"""Write a fill (person id -> technique ids) and the kit kept by people of the world without an
arsenal as TypeScript, in files short enough for the line limit.
Usage: emit_fill.py <fill.json> <inv.json> <out dir> <const prefix> <doc line>"""
import json, os, re, sys, glob
fill = json.load(open(sys.argv[1])); inv = json.load(open(sys.argv[2])); out_dir = sys.argv[3]; prefix = sys.argv[4]; doc = sys.argv[5]
roster = {r['pid']: r for r in inv['roster']}
key = lambda k: k if re.match(r'^[a-z][a-zA-Z0-9]*$', k) else f"'{k}'"
val = lambda ids: '[' + ', '.join(f"'{i}'" for i in ids) + ']'
lines_of = lambda ids: 1 if len(val(ids)) + 20 <= 100 else len(ids) + 2
kept = {p: roster[p]['techniqueIds'] for p in fill if roster[p]['inWorld'] and not roster[p]['hasArsenal']}
for f in glob.glob(os.path.join(out_dir, f'{prefix.lower()}*.ts')):
    os.remove(f)
parts, part, size = [], [], 0
for k in sorted(fill):
    n = lines_of(fill[k])
    if part and size + n > 230:
        parts.append(part); part, size = [], 0
    part.append(k); size += n
if part: parts.append(part)
names = []
for i, keys in enumerate(parts, 1):
    name = f'{prefix.upper()}_KITS_{i}'
    names.append((f'{prefix.lower()}{i}', name))
    body = ['/**', f' * {doc}', ' * By person id, in parts of the alphabet to keep each file short.', ' */',
            f'export const {name}: Readonly<Record<string, readonly string[]>> = {{']
    body += [f'  {key(k)}: {val(fill[k])},' for k in keys] + ['};', '']
    open(os.path.join(out_dir, f'{prefix.lower()}{i}.ts'), 'w').write('\n'.join(body))
index = [f"import {{ {n} }} from './{f}';" for f, n in names]
index += ['', f'/** {doc} */', f'export const {prefix.upper()}_KITS: Readonly<Record<string, readonly string[]>> = {{',
          *[f'  ...{n},' for _, n in names], '};', '',
          '/** People of the world without an arsenal, who keep the kit they fight with now beside these. */',
          f'export const {prefix.upper()}_KEPT: Readonly<Record<string, readonly string[]>> = {{',
          *[f'  {key(p)}: {val(kept[p])},' for p in sorted(kept)], '};', '']
open(os.path.join(out_dir, f'{prefix.lower()}.ts'), 'w').write('\n'.join(index))
print(len(parts), 'parts;', len(kept), 'kept')
