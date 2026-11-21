"""Turn the reviewed drafts into the fan pack's files: technique defs, who fights with them,
where they are taught. Reads out/out*.json (drafts), out/keep.json (grants), out/tasks.json and
out/roster2.json, out/techfull.json (the pack as dumped by dumpPack.test.ts). Writes into the repo given as argv[1]."""
import json, os, re, sys, glob

REPO = sys.argv[1]
PACK = os.path.join(REPO, 'src/content/packs/naruto')
WIKI_DIR = os.path.join(PACK, 'techniques/canon/wiki')
KITS_DIR = os.path.join(PACK, 'canonKits')

GRADES = 'EDCBAS'
DIFFICULTY = {'E': 30, 'D': 55, 'C': 80, 'B': 105, 'A': 140, 'S': 175}
ARTS = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu']
ELEMENTS = ['fire', 'wind', 'lightning', 'earth', 'water']
BANDS = ['close', 'mid', 'far']
FIELDS = {  # verb -> allowed extra fields, as the engine's types have them
    'damage': {'hits'}, 'area': {'size'}, 'field': {'field'}, 'move': {'to'}, 'knock': {'to'},
    'afflict': {'harm'}, 'pin': {'channelled'}, 'drain': {'absorb', 'will'}, 'trap': {'dazes'},
    'substitute': {'spins'}, 'shroud': {'kind'}, 'empower': {'boosts', 'healthPerExchange'},
    'clone': {'strikes', 'kind'}, 'daze': set(), 'seal': set(), 'heal': set(), 'confuse': set(),
    'conceal': set(), 'sense': set(), 'break': set(), 'counter': set(),
}
BOOSTABLE = {'strength', 'speed', 'stamina', 'taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu',
             'fuuinjutsu', 'chakraControl', 'intellect', 'perception', 'willpower'}

drafts = [d for f in sorted(glob.glob('out/out*.json')) for d in json.load(open(f))]

# The review's corrections, by wiki title: a draft's fields replaced, or the draft made a
# duplicate of a pack technique, or of another draft (`SAME_AS`).
REVIEW = {
    'Kamui': {'decision': 'duplicate', 'duplicateOf': 'kamui-intangibility'},
    'Crow Clone Technique': {'effects': [{'verb': 'clone', 'power': 8, 'kind': 'illusion'}]},
    'Naruto Region Combo': {'discipline': 'taijutsu', 'rank': 'B',
                            'effects': [{'verb': 'damage', 'power': 18, 'hits': 4}]},
    'Successive Shots Sand Drizzle': {'id': 'successive-sand-drizzle'},
    'Ninja Art Creation Rebirth — Strength of a Hundred Technique': {
        'decision': 'duplicate', 'duplicateOf': 'creation-rebirth'},
    'Yin Seal: Release': {'decision': 'duplicate', 'duplicateOf': 'strength-of-a-hundred'},
}
# Techniques the wiki lists for someone only through a tailed beast's power (person, technique).
DROPPED = {('naruto', 'octopus-ink'), ('naruto', 'earth-flow-wall')}
SAME_AS = {'Wind Release: Great Sickle Weasel Technique': 'Great Sickle Weasel Technique'}
drafts = [{**d, **REVIEW.get(d['title'], {})} for d in drafts if d['title'] not in SAME_AS]
tasks = {t['title']: t for t in json.load(open('out/tasks.json'))}
keep = json.load(open('out/keep.json'))
roster = {r['pid']: r for r in json.load(open('out/roster2.json'))}
packdefs = json.load(open('out/techfull.json'))
pack_ids = {t['id'] for t in packdefs}
problems = []


def grade_ok(rank, grade):
    return GRADES.index(rank) <= GRADES.index(grade)


def clean_effect(e, title):
    verb = e.get('verb')
    if verb not in FIELDS:
        problems.append(f'{title}: unknown verb {verb}')
        return None
    out = {'verb': verb, 'power': max(1, min(40, int(round(e.get('power', 10)))))}
    for k in FIELDS[verb]:
        v = e.get(k)
        if v is None or v is False:
            continue
        out[k] = v
    if verb == 'damage' and 'hits' in out and not (2 <= out['hits'] <= 5):
        del out['hits']
    if verb == 'empower':
        out['boosts'] = [b for b in out.get('boosts', []) if b in BOOSTABLE] or ['strength']
        out['healthPerExchange'] = max(1, min(20, int(out.get('healthPerExchange', 3))))
    if verb in ('move',) and out.get('to') not in BANDS:
        out.pop('to', None)
    if verb == 'knock' and out.get('to') not in BANDS:
        out['to'] = 'mid'
    if verb == 'area' and out.get('size') not in ('small', 'wide', 'vast'):
        out.pop('size', None)
    for k, allowed in (('field', ('mist', 'smoke', 'dust')), ('harm', ('burn', 'bleed', 'poison')),
                       ('kind', None)):
        if k in out and allowed and out[k] not in allowed:
            problems.append(f'{title}: bad {k} {out[k]}')
            return None
    if verb == 'shroud' and out.get('kind') not in ('lightning', 'sand', 'earth', 'chakra'):
        out['kind'] = 'chakra'
    if verb == 'clone' and out.get('kind') not in (None, 'illusion', 'water', 'wind', 'earth', 'lightning', 'fire', 'shadow'):
        out.pop('kind', None)
    if verb in ('field',) and 'field' not in out:
        out['field'] = 'mist'
    if verb == 'afflict' and 'harm' not in out:
        out['harm'] = 'burn'
    return out


def technique(d, users):
    title = d['title']
    disc = d.get('discipline') if d.get('discipline') in ARTS else 'ninjutsu'
    rank = d.get('rank') if d.get('rank') in list(GRADES) else 'C'
    # Versus-only fighters never grow, so each must be able to fight with it now: cap the rank at
    # the lowest of their grades in its art. People of the world grow into their kit.
    for u in users:
        if roster[u]['inWorld']:
            continue
        g = roster[u]['grades'][disc]
        if not grade_ok(rank, g):
            rank = g
    el = d.get('element') if d.get('element') in ELEMENTS else None
    effects = [x for x in (clean_effect(e, title) for e in d.get('effects', [])) if x]
    if not effects:
        problems.append(f'{title}: no usable effects')
        return None
    t = {'id': d['id'], 'name': d['name'], 'description': d['description'], 'discipline': disc}
    if el:
        t['element'] = el
    needs = {}
    if disc == 'kenjutsu':
        needs['weapon'] = 'blade'
    if el and d.get('needsNature'):
        needs['nature'] = el
    if needs:
        t['needs'] = needs
    reach = d.get('reach')
    if isinstance(reach, list):
        reach = [b for b in BANDS if b in reach]
        if reach:
            t['reach'] = reach
    if d.get('accuracy') in ('sure', 'wild'):
        t['accuracy'] = d['accuracy']
    t['effects'] = effects
    t['chakraCost'] = 0
    x = d.get('extras') or {}
    for k in ('dustCost', 'dustDraw'):
        if isinstance(x.get(k), (int, float)) and x[k] > 0:
            t[k] = int(x[k])
    t['rank'] = rank
    t['difficulty'] = DIFFICULTY[rank]
    clan = x.get('clan')
    if clan and all(roster[u]['clan'] == clan for u in users):
        t['clan'] = clan
    for k in ('lethal', 'oncePerFight', 'moulded'):
        if x.get(k) is True:
            t[k] = True
    if x.get('needsTarget') == 'open':
        t['needsTarget'] = 'open'
    if t.get('moulded') and disc not in ('taijutsu', 'kenjutsu'):
        del t['moulded']
    if t.get('lethal') and not any(e['verb'] in ('damage', 'area', 'break') for e in effects):
        del t['lethal']
    return t


# Who uses each drafted title.
users_of = {}
for k in keep:
    users_of.setdefault(k['title'], []).append(k['fighter'].split(':', 1)[1])

techs, resolved, skipped, ids_seen = [], {}, [], set(pack_ids)
for d in drafts:
    title = d['title']
    if d.get('decision') == 'duplicate' and d.get('duplicateOf') in pack_ids:
        resolved[title] = d['duplicateOf']
        continue
    if d.get('decision') != 'draft':
        skipped.append((title, d.get('skipReason') or d.get('decision')))
        continue
    base, n = d['id'], 2
    while d['id'] in ids_seen:
        d['id'] = f'{base}-{n}'
        n += 1
    ids_seen.add(d['id'])
    t = technique(d, users_of.get(title, []))
    if t:
        techs.append(t)
        resolved[title] = t['id']
for alias, title in SAME_AS.items():
    if title in resolved:
        resolved[alias] = resolved[title]
new_ids = {t['id'] for t in techs}
by_id = {t['id']: t for t in techs}

# What each fighter gains: techniques the pack has, and the drafts (in wiki order).
kits = {}
for k in keep:
    pid = k['fighter'].split(':', 1)[1]
    tid = k['inPack'] or resolved.get(k['title'])
    if not tid:
        continue
    t = by_id.get(tid)
    if t and t.get('clan') and t['clan'] != roster[pid]['clan']:
        continue
    have = roster[pid]['techniqueIds']
    if tid in have or (pid, tid) in DROPPED:
        continue
    # A technique that needs a ladder step open or summons out comes with its ladder or contract.
    if any(t2['id'] == tid and (t2.get('needsOpen') or t2.get('needsCalls')) for t2 in packdefs):
        continue
    # A versus-only fighter never grows into a pack technique above their grade in its art.
    written = next((t2 for t2 in packdefs if t2['id'] == tid), None)
    if written and not roster[pid]['inWorld'] and not grade_ok(
        written['rank'], roster[pid]['grades'][written['discipline']]
    ):
        continue
    kits.setdefault(pid, [])
    if tid not in kits[pid]:
        kits[pid].append(tid)

# Where new techniques held by people of the world are learned: their own teaching when they
# teach, else the shelf their rank belongs on.
teaches, academy, library = {}, [], []
for pid, ids in kits.items():
    if not roster[pid]['inWorld']:
        continue
    for tid in ids:
        if tid not in new_ids:
            continue
        if roster[pid]['teacher']:
            teaches.setdefault(pid, [])
            if tid not in teaches[pid]:
                teaches[pid].append(tid)
for tid in sorted(new_ids):
    holders = [p for p, ids in kits.items() if tid in ids and roster[p]['inWorld']]
    if not holders or any(tid in teaches.get(p, []) for p in holders):
        continue
    t = by_id[tid]
    if t.get('clan'):
        del t['clan']
    if t['rank'] in 'ED':
        academy.append(tid)
    elif t['rank'] in 'CBA':
        library.append(tid)
    else:  # S, held only by someone who teaches nothing: shelved at the sealed archive's top.
        t['rank'] = 'A'
        t['difficulty'] = DIFFICULTY['A']
        library.append(tid)

# People of the world with no arsenal of their own keep the kit they fight with now.
arsenal_from_kit = sorted(p for p in kits if roster[p]['inWorld'] and not roster[p]['hasArsenal'])


def ts_value(v, indent):
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, str):
        return "'" + v.replace('\\', '\\\\').replace("'", '’') + "'"
    if isinstance(v, list):
        return '[' + ', '.join(ts_value(x, indent) for x in v) + ']'
    if isinstance(v, dict):
        return '{ ' + ', '.join(f'{k}: {ts_value(x, indent)}' for k, x in v.items()) + ' }'
    raise TypeError(v)


def ts_technique(t):
    lines = ['  {']
    for k, v in t.items():
        if k == 'effects':
            lines.append('    effects: [')
            lines += [f'      {ts_value(e, 6)},' for e in v]
            lines.append('    ],')
        else:
            lines.append(f'    {k}: {ts_value(v, 4)},')
    lines.append('  },')
    return lines


HEADER = '''import type {{ TechniqueDef }} from '@/systems/techniques';

/**
 * Canon {what} for the versus fighters who use them, drafted from Narutopedia's facts (rank,
 * art, element, range and users; `prototypes/narutopedia/`). The effects are a first reading
 * of what the wiki says each does, for review; the descriptions are our own words.
 */
export const {const}: readonly TechniqueDef[] = [
'''
MAX = 240
os.makedirs(WIKI_DIR, exist_ok=True)
for f in glob.glob(os.path.join(WIKI_DIR, '*.ts')):
    os.remove(f)
files = []
for art in ARTS:
    group = sorted((t for t in techs if t['discipline'] == art), key=lambda t: t['name'])
    chunk, part = [], 1
    def flush(chunk, part):
        stem = f'{art}{part if part > 1 else ""}'
        const = f'WIKI_{art.upper()}{part if part > 1 else ""}'
        body = HEADER.format(what=f'{art} techniques', const=const)
        body += '\n'.join(l for t in chunk for l in ts_technique(t)) + '\n];\n'
        open(os.path.join(WIKI_DIR, f'{stem}.ts'), 'w').write(body)
        files.append((stem, const))
    lines = 0
    for t in group:
        n = len(ts_technique(t))
        if chunk and lines + n > MAX:
            flush(chunk, part)
            chunk, part, lines = [], part + 1, 0
        chunk.append(t)
        lines += n
    if chunk:
        flush(chunk, part)

index = ["import type { TechniqueDef } from '@/systems/techniques';", '']
index += [f"import {{ {c} }} from './{s}';" for s, c in files]
index += ['', '/** Canon techniques drafted from Narutopedia for the versus fighters (`canonKits/`). */',
          'export const WIKI_TECHNIQUES: readonly TechniqueDef[] = /*#__PURE__*/ (() => [',
          *[f'  ...{c},' for _, c in files], '])();', '']
open(os.path.join(WIKI_DIR, 'index.ts'), 'w').write('\n'.join(index))


def ts_map(name, doc, m):
    out = [f'/** {doc} */', f'export const {name}: Readonly<Record<string, readonly string[]>> = {{']
    for k in sorted(m):
        key = k if re.match(r'^[a-z][a-zA-Z0-9]*$', k) else f"'{k}'"
        out.append(f'  {key}: {ts_value(m[k], 2)},')
    out.append('};')
    return out


os.makedirs(KITS_DIR, exist_ok=True)
kit_lines = ['/**', " * What each versus fighter gains of their canon kit (Narutopedia's users of each jutsu, read",
             ' * in `prototypes/narutopedia/`): techniques the pack had that they lacked, and the drafts in',
             ' * `techniques/canon/wiki/`. Laid over the people by `withCanonKits` (`apply.ts`). A bloodline',
             " * power a fighter doesn't use in the pack, summoning, sage arts and tailed-beast powers are",
             ' * left out on purpose; drop a line here to take a technique back off someone.', ' */', '']
kit_lines += ts_map('CANON_KITS', 'Technique ids added to each fighter (by person id), after what they fight with now.', kits)
kit_lines += ['']
kit_lines += ts_map('CANON_TEACHES', 'New techniques each teacher of the world now teaches, so they have a source.', teaches)
kit_lines += ['', '/** Techniques shelved in the home village for people of the world who teach nothing. */',
              f'export const CANON_SHELVED = {{ academy: {ts_value(academy, 0)}, library: {ts_value(library, 0)} }} as const;', '',
              '/** People of the world without an arsenal, who keep the kit they fight with now beside these. */',
              f'export const KIT_KEPT: Readonly<Record<string, readonly string[]>> = {{']
for p in arsenal_from_kit:
    key = p if re.match(r'^[a-z][a-zA-Z0-9]*$', p) else f"'{p}'"
    kit_lines.append(f'  {key}: {ts_value(roster[p]["techniqueIds"], 2)},')
kit_lines += ['};', '']
open(os.path.join(KITS_DIR, 'kits.ts'), 'w').write('\n'.join(kit_lines))

report = {'techniques': len(techs), 'files': len(files), 'fighters': len(kits),
          'grants': sum(len(v) for v in kits.values()), 'teaches': sum(len(v) for v in teaches.values()),
          'academy': len(academy), 'library': len(library), 'kitKept': len(arsenal_from_kit),
          'duplicates': sum(1 for d in drafts if d.get('decision') == 'duplicate'), 'skipped': skipped,
          'problems': problems}
json.dump(report, open('out/compile-report.json', 'w'), indent=1, ensure_ascii=False)
notes = {d.get('id'): {'confidence': d.get('confidence'), 'note': d.get('note')} for d in drafts}
json.dump({'techniques': [{**t, **notes.get(t['id'], {})} for t in techs], 'kits': kits},
          open('out/compiled.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k: v for k, v in report.items() if k not in ('skipped',)}, indent=1, ensure_ascii=False))
print('skipped', len(skipped))
