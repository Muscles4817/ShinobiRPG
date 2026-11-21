import json, re, difflib
from match import norm
J=json.load(open('out/jutsu.json')); K=json.load(open('out/keep.json')); R={r['id']:r for r in json.load(open('out/roster2.json'))}; T=json.load(open('out/techfull.json'))
def unwiki(s):
    s=re.sub(r'<ref.*?</ref>|<ref[^>]*/>|<!--.*?-->','',s,flags=re.S)
    for _ in range(3): s=re.sub(r'\{\{[Tt]ranslation\|([^|}]*)\|[^}]*\}\}',r'\1',s)
    for _ in range(3): s=re.sub(r'\{\{[^{}]*\}\}','',s)
    s=re.sub(r'\[\[[^\]|]*\|([^\]]*)\]\]',r'\1',s); s=re.sub(r'\[\[([^\]]*)\]\]',r'\1',s)
    s=re.sub(r"'{2,}",'',s); s=re.sub(r'<[^>]+>','',s); s=re.sub(r'\n+',' ',s)
    s=re.sub(r'==+[^=]*==+',' ',s)
    return ' '.join(s.split())
packnames=[(norm(t['name']),t) for t in T]
tasks={}
for k in K:
    if k['inPack']: continue
    t=tasks.get(k['title'])
    if not t:
        b=J[k['title']]['box']
        lead=unwiki(J[k['title']]['lead'])[:700]
        n=norm(k['title'])
        sim=sorted(((difflib.SequenceMatcher(None,n,pn).ratio(),tt) for pn,tt in packnames),key=lambda x:-x[0])[:3]
        t={'title':k['title'],'englishTv':unwiki(b.get('english tv','')),'rank':unwiki(b.get('jutsu rank','')),'classification':unwiki(b.get('jutsu classification','')),
           'element':unwiki(b.get('jutsu type','')),'classType':unwiki(b.get('jutsu class type','')),'range':unwiki(b.get('jutsu range','')),'handSigns':bool(b.get('hand signs')),
           'lead':lead,'similarInPack':[{'id':tt['id'],'name':tt['name'],'score':round(sc,2)} for sc,tt in sim if sc>=0.6],'users':[]}
        tasks[k['title']]=t
    f=R[k['fighter']]
    t['users'].append({'fighter':f['pid'],'name':f['name'],'inWorld':f['inWorld'],'clan':f['clan'],'grades':{x:f['grades'][x] for x in ['taijutsu','ninjutsu','genjutsu','kenjutsu','fuuinjutsu','chakraControl']}})
L=sorted(tasks.values(),key=lambda t:t['title'])
json.dump(L,open('out/tasks.json','w'),indent=1,ensure_ascii=False)
print(len(L),'tasks; with similar:',sum(1 for t in L if t['similarInPack']))
print(json.dumps(L[30],ensure_ascii=False,indent=1)[:1500])
