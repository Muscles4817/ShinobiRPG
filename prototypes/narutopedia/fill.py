"""Fill thin versus fighters' kits from what a person of the pack could have learned: shelved
techniques, their own clan's, and those of schools they already hold; usable now (within their
grades), with variety first (close, ranged, defence, control, utility), then fit by art and
element. Usage: fill.py <pack>-inv.json -> prints {pid: [ids]} as JSON."""
import json, sys, collections
inv = json.load(open(sys.argv[1]))
T = {t['id']: t for t in inv['techniques']}
GR = 'EDCBAS'
TARGET = {'Kage': 12, 'Jōnin': 9, 'Chūnin': 6, 'Genin': 5}
ok_g = lambda r, g: GR.index(r) <= GR.index(g)
WOUND = {'damage', 'area', 'break'}
CONTROL = {'pin', 'daze', 'seal', 'confuse', 'drain', 'trap', 'knock'}
DEFENCE = {'substitute', 'shroud', 'counter'}
UTILITY = {'conceal', 'sense', 'move', 'clone', 'empower', 'heal', 'field'}
BANNED_VERBS = {'summon'}


def role(t):
    verbs = {e['verb'] for e in t['effects']}
    reach = t.get('reach') or []
    if verbs & WOUND:
        return 'ranged' if reach and 'close' not in reach else ('close' if t['discipline'] in ('taijutsu', 'kenjutsu') or reach == ['close'] else 'ranged')
    if verbs & CONTROL: return 'control'
    if verbs & DEFENCE: return 'defence'
    if verbs & UTILITY: return 'utility'
    return 'other'


def schools_of(ids):
    return {T[i]['school'] for i in ids if i in T and T[i].get('school')}


# A shelved technique is generic when nobody fights with it or many do; one only a few named
# fighters use is theirs, never handed to someone else.
holders = collections.Counter(i for f in inv['roster'] for i in f['techniqueIds'])
# A pack may name its signatures outright (the fan pack's, read from Narutopedia's users).
SIGNATURES = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
SIGNATURE_UNDER = 3
out = {}
for f in inv['roster']:
    target = TARGET.get(f['group'], 6)
    have = list(f['techniqueIds'])
    if len(have) >= target: continue
    held_el = collections.Counter(T[i].get('element') for i in have if i in T and T[i].get('element'))
    elements = set(held_el) | ({f['nature']} if f['nature'] else set())
    schools = schools_of(have)
    held_roles = collections.Counter(role(T[i]) for i in have if i in T)
    def eligible(t):
        if t['id'] in have: return False
        src = t.get('source') or ''
        if t.get('clan'):
            if t['clan'] != f['clan']: return False
        elif t.get('school'):
            if t['school'] not in schools: return False
        elif not (src.startswith('academy') or src.startswith('library')):
            return False
        elif 0 < holders[t['id']] < SIGNATURE_UNDER:
            return False
        if not src: return False
        if t['id'] in SIGNATURES and f['pid'] not in SIGNATURES[t['id']]: return False
        if any(e['verb'] in BANNED_VERBS for e in t['effects']): return False
        if t.get('needsOpen') or t.get('needsCalls') or t.get('combo'): return False
        if (t.get('swarmCost') or 0) > 0: return False
        if (t.get('dustCost') or t.get('dustDraw')) and not f['dust']: return False
        if t.get('needs', {}).get('weapon') == 'blade' and t['discipline'] != 'kenjutsu': return False
        if not ok_g(t['rank'], f['grades'][t['discipline']]): return False
        nat = t.get('needs', {}).get('nature')
        if nat and nat not in elements: return False
        if t.get('element') and elements and t['element'] not in elements: return False
        return True
    pool = [t for t in T.values() if eligible(t)]
    def fit(t):
        art = GR.index(f['grades'][t['discipline']])
        rank = GR.index(t['rank'])
        el = 2 if t.get('element') and t['element'] in elements else 0
        own = 3 if t.get('clan') or t.get('school') else 0
        return art * 2 + rank + el + own
    picks = []
    while len(have) + len(picks) < target and pool:
        roles = held_roles + collections.Counter(role(t) for t in picks)
        best = max(pool, key=lambda t: (fit(t) - 3 * roles[role(t)], t['id']))
        picks.append(best)
        # A fighter of no element takes on the first element picked for them, and keeps to it.
        if best.get('element') and not elements:
            elements = {best['element']}
            pool = [t for t in pool if not t.get('element') or t['element'] in elements]
        pool = [t for t in pool if t['id'] != best['id'] and t['name'] != best['name']]
    if picks: out[f['pid']] = [t['id'] for t in picks]
json.dump(out, sys.stdout, indent=1)
