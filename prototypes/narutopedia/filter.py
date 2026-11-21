import json, re
M=json.load(open('out/match.json')); J=json.load(open('out/jutsu.json'))
def clean(s): return re.sub(r'<!--.*?-->|<ref.*?</ref>|<ref[^>]*/>|\[\[|\]\]','',s or '',flags=re.S)
def lines(c): return [x.strip() for x in clean(c).split(',') if x.strip()]
def kgs(c):
    out=set()
    for x in lines(c):
        if x.startswith('Kekkei') or x.startswith('Hiden') or x.startswith('Kekkei Mōra'):
            for part in x.split('~')[1:]: out.add(part.strip())
    return out
SKIP_WORDS=[('Summoning','summoning needs a contract'),('Reverse Summoning','summoning needs a contract'),('Sage Art','sage arts belong to the sage ladder'),('Sage Mode','sage arts belong to the sage ladder'),('Tailed Beast','tailed-beast powers are not modelled yet'),('Jinchūriki','tailed-beast powers are not modelled yet'),('Path','Six Paths and Rinnegan paths are perks or not modelled'),('Ten-Tails','Ten-Tails powers are not modelled'),('Six Paths','Six Paths powers are not modelled'),('Infinite Tsukuyomi','world-ending, not a fight technique'),('Sharingan','an eye is a perk, not a technique'),('Byakugan','an eye is a perk, not a technique'),('Rinnegan','an eye is a perk, not a technique'),('Mangekyō','an eye is a perk, not a technique'),('Regeneration','a body ability, not a technique'),('Reanimation','reanimation is a contract-like summons'),('Transformation','tailed or full-body transformations are not modelled'),('Curse Mark','curse marks are not modelled as techniques'),('Eight Gates','the Gates are the pack’s ladder'),('Gate of','the Gates are the pack’s ladder'),('Kuchiyose','summoning needs a contract')]
SKIP_CLASS=[('Senjutsu','sage arts belong to the sage ladder'),('Kekkei Mōra','Ōtsutsuki powers are not modelled'),('Dōjutsu','an eye power: a perk, or kept for fighters who already use that eye')]
out=[]; skipped=[]
for r in M:
    held_kgs=set(); held_classes=set()
    for c in r['canon']:
        if c['held']:
            held_kgs|=kgs(J[c['title']]['box'].get('jutsu classification'))
            held_classes|=set(x.split('~')[0] for x in lines(J[c['title']]['box'].get('jutsu classification')))
    for c in r['canon']:
        if c['held']: continue
        b=J[c['title']]['box']; cls=b.get('jutsu classification') or ''
        why=None
        need=kgs(cls)
        if need and not need<=held_kgs: why='a bloodline power they don’t use in the pack ('+', '.join(sorted(need-held_kgs))+')'
        if not why:
            for w,reason in SKIP_WORDS:
                if w.lower() in c['title'].lower(): why=reason; break
        if not why:
            for w,reason in SKIP_CLASS:
                if w in cls and w.split()[0] not in held_classes: why=reason; break
        if not why and not b.get('jutsu class type'): why='no fight role on the wiki (an ability or a passive)'
        (skipped if why else out).append({**c,'fighter':r['id'],'fighterName':r['name'],'why':why})
json.dump(out,open('out/keep.json','w'),indent=1); json.dump(skipped,open('out/skipped.json','w'),indent=1)
print('keep refs',len(out),'(in pack, just give:',sum(1 for o in out if o['inPack']),') new unique:',len({o['title'] for o in out if not o['inPack']}))
from collections import Counter
print(Counter(s['why'].split(' (')[0] for s in skipped).most_common())
