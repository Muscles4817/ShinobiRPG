import json,sys,collections,glob,os
p=json.load(open(sorted(glob.glob('*.cpuprofile'))[-1]))
nodes={n['id']:n for n in p['nodes']}
parent={}
for n in p['nodes']:
    for c in n.get('children',[]): parent[c]=n['id']
dt=collections.Counter()
for s,d in zip(p['samples'],p['timeDeltas']): dt[s]+=d
total=sum(dt.values())
def name(n):
    cf=n['callFrame']; u=cf['url'].split('/src/')[-1].split('/prototypes/')[-1].split('?')[0]
    return cf['functionName'] or '(anon)', u
# self by file
byfile=collections.Counter(); byfn=collections.Counter()
for i,t in dt.items():
    fn,u=name(nodes[i]); byfile[u]+=t; byfn[(fn,u)]+=t
# inclusive for selected functions: walk ancestors
incl=collections.Counter()
for i,t in dt.items():
    seen=set(); j=i
    while j is not None:
        fn,u=name(nodes[j])
        key=(fn,u.split('/')[-1])
        if key not in seen: incl[key]+=t; seen.add(key)
        j=parent.get(j)
# time inside plan(), the test's real work
planT=incl[('plan','beam.ts')]
print('total sampled ms',total/1000,'inside plan()',planT/1000)
print('\nINCLUSIVE share of plan() time:')
for k in [('score','beam.ts'),('rollout','forward.ts'),('playExchange','forward.ts'),('resolveExchange','round.ts'),('endOfRound','roundEnd.ts'),('rollIntents','intent.ts'),('withLoadout','forward.ts'),('forced','forward.ts'),('believed','forward.ts'),('value','beam.ts'),('actionsOf','forward.ts'),('fromSlot','slots.ts'),('createRng','rng.ts'),('takeTurn','round.ts'),('choosePlay','round.ts'),('plannedPlay','priority.ts'),('chooseCard','choose.ts'),('intentOf','intent.ts'),('patch','state.ts'),('say','state.ts'),('tell','telling.ts'),('told','fresh.ts'),('cardWorth','worth.ts'),('avoidOdds','avoid.ts'),('harmLine','narration.ts'),('statTier','tiers.ts')]:
    if incl[k]: print(f'  {k[0]:20s} {k[1]:16s} {100*incl[k]/planT:5.1f}%')
print('\nSELF time by file (top 25):')
for u,t in byfile.most_common(25): print(f'  {100*t/planT:5.1f}%  {u}')
print('\nSELF time by function (top 30):')
for (fn,u),t in byfn.most_common(30): print(f'  {100*t/planT:5.1f}%  {fn}  {u}')

CATS = {
 'narration (story lines, voices, staging, status text)': ['telling.ts','narration.ts','staging.ts','fresh.ts','english.ts','hitVoice.ts','statusView.ts','voice.ts','sceneVoice.ts','chainVoice.ts','falls.ts','wording.ts','causes.ts','summary.ts','RegExp'],
 'decisions (plans, instinct, intents, slot checks)': ['priority.ts','slots.ts','choose.ts','intent.ts','needed.ts','worth.ts','adapt.ts','conditions.ts','judgement.ts','targeting.ts','survival.ts','setups.ts','calling.ts','climbing.ts','pacing.ts','shelter.ts','resting.ts','foeTeam.ts','roles.ts','repertoire.ts','stepping.ts','finishers.ts','pouch.ts','prep.ts','sight.ts','reads.ts','moment.ts','defaults.ts','kitSlots.ts','readiness.ts'],
 'rules maths (hits, avoid, damage, conditions)': ['avoid.ts','react.ts','damage.ts','avoidance.ts','defence.ts','jutsu.ts','lingering.ts','wounding.ts','wound.ts','tiers.ts','verbs','rules/','daze.ts','breath.ts','effort.ts','distance.ts','rows.ts','commitment.ts','gather.ts','blast.ts','pairMoves.ts'],
 'exchange bookkeeping (turn order, state patching)': ['round.ts','state.ts','roundEnd.ts','cards.ts','senses.ts','field.ts','lostTurn.ts','play.ts'],
 'prototype (forward model, beam)': ['forward.ts','beam.ts'],
 'runtime (idle, GC, program)': ['(idle)','(garbage collector)','(program)','(root)'],
}
cat=collections.Counter()
for i,t in dt.items():
    fn,u=name(nodes[i]); key=fn+' '+u; placed=False
    for c,pats in CATS.items():
        if any(pt in key for pt in pats): cat[c]+=t; placed=True; break
    if not placed: cat['other '+(u.split('/')[-1] or fn)]+=t
print('\nSELF time by kind of work (share of all sampled time):')
for c,t in cat.most_common(14): print(f'  {100*t/total:5.1f}%  {c}')
