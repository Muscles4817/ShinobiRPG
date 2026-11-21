"""The lantern pack's new techniques, from the writers' drafts (np/lantern*.json) to the pack's
files: technique defs by art (techniques/lantern/), and where each is learned (kits/sources.ts):
shelves by rank for standard ones, the clan's or school's teacher for theirs.
Usage: lantern_compile.py <repo>"""
import json, os, re, sys, glob, collections, unicodedata
REPO = sys.argv[1]
PACK = os.path.join(REPO, 'src/content/packs/original')
OUT_T = os.path.join(PACK, 'techniques/lantern'); OUT_K = os.path.join(PACK, 'kits')
GR = 'EDCBAS'; DIFF = {'E': 30, 'D': 55, 'C': 80, 'B': 105, 'A': 140, 'S': 175}
ARTS = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu']
ELS = ['fire', 'wind', 'lightning', 'earth', 'water']; BANDS = ['close', 'mid', 'far']
FIELDS = {'damage': {'hits'}, 'area': {'size'}, 'field': {'field'}, 'move': {'to'}, 'knock': {'to'}, 'afflict': {'harm'},
          'pin': {'channelled'}, 'drain': {'absorb', 'will'}, 'trap': {'dazes'}, 'substitute': {'spins'}, 'shroud': {'kind'},
          'empower': {'boosts', 'healthPerExchange'}, 'clone': {'strikes', 'kind'}}
for v in ('daze', 'seal', 'heal', 'confuse', 'conceal', 'sense', 'break', 'counter'): FIELDS[v] = set()
BOOST = {'strength', 'speed', 'stamina', 'taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu', 'chakraControl', 'intellect', 'perception', 'willpower'}
inv = json.load(open('original-inv.json')); existing = inv['techniques']
fan_names = {n.lower() for n in json.load(open('np/fan-names.json'))}
taken_ids = {t['id'] for t in existing}; taken_names = {t['name'].lower() for t in existing}
problems = []

def norm(s): return re.sub(r'[^a-z0-9]+', ' ', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).strip()
fan_norm = {norm(n) for n in fan_names}

def teacher_of(group_key):
    c = collections.Counter()
    for t in existing:
        if (t.get('school') or t.get('clan')) == group_key and (t.get('source') or '').startswith('teacher:'):
            for p in t['source'][8:].split('|'): c[p] += 1
    return c.most_common(1)[0][0] if c else None

def effect(e, title):
    v = e.get('verb')
    if v not in FIELDS: problems.append(f'{title}: verb {v}'); return None
    out = {'verb': v, 'power': max(1, min(40, int(round(e.get('power', 10)))))}
    for k in FIELDS[v]:
        if e.get(k) not in (None, False): out[k] = e[k]
    if v == 'damage' and 'hits' in out and not 2 <= out['hits'] <= 5: del out['hits']
    if v == 'area' and out.get('size') not in ('small', 'wide', 'vast'): out.pop('size', None)
    if v == 'field' and out.get('field') not in ('mist', 'smoke', 'dust'): out['field'] = 'mist'
    if v in ('move',) and out.get('to') not in BANDS: out.pop('to', None)
    if v == 'knock' and out.get('to') not in BANDS: out['to'] = 'mid'
    if v == 'afflict' and out.get('harm') not in ('burn', 'bleed', 'poison'): out['harm'] = 'bleed'
    if v == 'shroud' and out.get('kind') not in ('lightning', 'sand', 'earth', 'chakra'): out['kind'] = 'chakra'
    if v == 'clone' and out.get('kind') not in (None, 'illusion', 'water', 'wind', 'earth', 'lightning', 'fire', 'shadow'): out.pop('kind', None)
    if v == 'empower':
        out['boosts'] = [b for b in out.get('boosts', []) if b in BOOST] or ['strength']
        out['healthPerExchange'] = max(1, min(20, int(out.get('healthPerExchange') or 3)))
    return out

techs, teaches, academy, library = [], collections.defaultdict(list), [], []
drafts = [d for f in sorted(glob.glob('np/lantern[0-9].json')) for d in json.load(open(f))]
# The review's corrections, by draft id and its element (or art, for one of none): fields replaced.
REVIEW = {
    'firecracker-string@lightning': {'id': 'snapping-sparks', 'name': 'Snapping Sparks'},
    'kiln-breath@taijutsu': {'id': 'bellows-breath', 'name': 'Bellows Breath'},
    'shimenawa-hundredfold-knot@fuuinjutsu': {
        'afterCost': {'kind': 'injury', 'stat': 'chakraControl', 'amount': 3, 'days': 7}},
}
drafts = [{**d, **REVIEW.get(f"{d['id']}@{d.get('element') or d['discipline']}", {})} for d in drafts]
for d in drafts:
    name = d['name'].strip(); title = name
    if name.lower() in taken_names or norm(name) in fan_norm:
        problems.append(f'name clash, dropped: {name}'); continue
    base = re.sub(r'[^a-z0-9-]', '', d['id'].lower()) or norm(name).replace(' ', '-'); tid, n = base, 2
    while tid in taken_ids: tid = f'{base}-{n}'; n += 1
    disc = d['discipline'] if d['discipline'] in ARTS else 'ninjutsu'
    el = d.get('element') if d.get('element') in ELS else None
    effs = [x for x in (effect(e, title) for e in d.get('effects', [])) if x]
    if not effs: problems.append(f'{title}: no effects'); continue
    home = d.get('home') or {'kind': 'shelf'}; rank = d['rank'] if d.get('rank') in list(GR) else 'C'
    if home['kind'] == 'shelf' and rank == 'S': rank = 'A'
    t = {'id': tid, 'name': name, 'description': d['description'].strip(), 'discipline': disc}
    if el: t['element'] = el
    needs = {}
    if disc == 'kenjutsu': needs['weapon'] = 'blade'
    if el and d.get('needsNature') and GR.index(rank) >= GR.index('B'): needs['nature'] = el
    if needs: t['needs'] = needs
    reach = [b for b in BANDS if b in (d.get('reach') or [])]
    if reach: t['reach'] = reach
    if d.get('accuracy') in ('sure', 'wild'): t['accuracy'] = d['accuracy']
    t['effects'] = effs; t['chakraCost'] = 0
    x = d.get('extras') or {}
    for k in ('swarmCost', 'dustCost', 'dustDraw'):
        if isinstance(x.get(k), (int, float)) and x[k] > 0: t[k] = int(x[k])
    t['rank'] = rank; t['difficulty'] = DIFF[rank]
    if home['kind'] == 'clan': t['clan'] = home['clan']
    if home['kind'] == 'school': t['school'] = home['school']
    for k in ('lethal', 'oncePerFight', 'moulded'):
        if x.get(k) is True: t[k] = True
    if x.get('needsTarget') == 'open': t['needsTarget'] = 'open'
    # This pack's rule: every S technique is a trump card with a price paid after the fight.
    if rank == 'S':
        t['oncePerFight'] = True
        t['afterCost'] = d.get('afterCost') or {'kind': 'exhaustion', 'days': 3}
    if t.get('moulded') and disc not in ('taijutsu', 'kenjutsu'): del t['moulded']
    if t.get('lethal') and not any(e['verb'] in ('damage', 'area', 'break') for e in effs): del t['lethal']
    if home['kind'] == 'shelf':
        (academy if rank in 'ED' else library).append(tid)
    else:
        who = teacher_of(home.get('clan') or home.get('school'))
        if not who: problems.append(f'{title}: no teacher for {home}'); continue
        teaches[who].append(tid)
    taken_ids.add(tid); taken_names.add(name.lower()); techs.append(t)

def ts(v):
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, str): return "'" + v.replace('\\', '\\\\').replace("'", '’') + "'"
    if isinstance(v, list): return '[' + ', '.join(ts(x) for x in v) + ']'
    return '{ ' + ', '.join(f'{k}: {ts(x)}' for k, x in v.items()) + ' }'

def block(t):
    L = ['  {']
    for k, v in t.items():
        if k == 'effects': L += ['    effects: ['] + [f'      {ts(e)},' for e in v] + ['    ],']
        else: L.append(f'    {k}: {ts(v)},')
    return L + ['  },']

os.makedirs(OUT_T, exist_ok=True); os.makedirs(OUT_K, exist_ok=True)
for f in glob.glob(os.path.join(OUT_T, '*.ts')): os.remove(f)
files = []
HEAD = ("import type {{ TechniqueDef }} from '@/systems/techniques';\n\n/**\n * {what}: new techniques of the lantern country, "
        "their mechanics drawn from proven shapes and their\n * names and words its own (`docs/research/lantern-techniques.md`).\n */\n"
        "export const {c}: readonly TechniqueDef[] = [\n")
for art in ARTS:
    group = sorted((t for t in techs if t['discipline'] == art), key=lambda t: (GR.index(t['rank']), t['name']))
    chunk, part, size = [], 1, 0
    def flush(chunk, part):
        stem = f'{art}{part if part > 1 else ""}'; c = f'LANTERN_{art.upper()}{part if part > 1 else ""}'
        open(os.path.join(OUT_T, f'{stem}.ts'), 'w').write(HEAD.format(what=art.capitalize(), c=c) + '\n'.join(l for t in chunk for l in block(t)) + '\n];\n')
        files.append((stem, c))
    for t in group:
        n = len(block(t))
        if chunk and size + n > 230: flush(chunk, part); chunk, part, size = [], part + 1, 0
        chunk.append(t); size += n
    if chunk: flush(chunk, part)
idx = ["import type { TechniqueDef } from '@/systems/techniques';", ''] + [f"import {{ {c} }} from './{s}';" for s, c in files]
idx += ['', '/** The lantern country’s newer techniques, by art (where each is learned: `kits/sources.ts`). */',
        'export const LANTERN_TECHNIQUES: readonly TechniqueDef[] = [', *[f'  ...{c},' for _, c in files], '];', '']
open(os.path.join(OUT_T, 'index.ts'), 'w').write('\n'.join(idx))
key = lambda k: k if re.match(r'^[a-z][a-zA-Z0-9]*$', k) else f"'{k}'"
src = ['/**', ' * Where the lantern country’s newer techniques are learned, so each has a source: a clan’s or a', ' * school’s new arts are taught by its teacher, standard ones shelved in the village by rank.', ' */', '',
       '/** New techniques each teacher now teaches, by person id. */', 'export const LANTERN_TEACHES: Readonly<Record<string, readonly string[]>> = {',
       *[f'  {key(k)}: {ts(v)},' for k, v in sorted(teaches.items())], '};', '',
       '/** Standard techniques shelved in the village: the academy rack (E–D) and the library (C–A). */',
       f'export const LANTERN_SHELVED = {{ academy: {ts(academy)}, library: {ts(library)} }} as const;', '']
open(os.path.join(OUT_K, 'sources.ts'), 'w').write('\n'.join(src))
json.dump(techs, open('np/lantern-compiled.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps({'techniques': len(techs), 'files': len(files), 'academy': len(academy), 'library': len(library),
                  'taught': {k: len(v) for k, v in teaches.items()}, 'problems': problems}, ensure_ascii=False, indent=1))
