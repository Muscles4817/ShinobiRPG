import json, re, unicodedata
J=json.load(open('out/jutsu.json')); R=json.load(open('out/roster2.json')); T=json.load(open('out/techfull.json'))
def norm(s):
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
    s=re.sub(r'<br\s*/?>',' ',s)
    s=s.replace(' release',' style')
    s=re.sub(r'\b(the|technique|jutsu|no jutsu|art|of)\b',' ',s)
    s=re.sub(r'[^a-z0-9]+',' ',s)
    return ' '.join(s.split())
def names_of(title,box):
    alts=[title]
    for k in ('english tv','viz manga','other names','literal english'):
        v=box.get(k)
        if v: alts+=re.split(r'<br\s*/?>|,|;',re.sub(r'<ref.*?</ref>|<ref[^>]*/>|\[\[|\]\]|\'\'','',v))
    out={norm(a) for a in alts if a.strip()}
    return out | {strip_el(a) for a in out}
def strip_el(n): return re.sub(r'^(fire|wind|lightning|earth|water|wood|lava|ice|storm|boil|scorch|explosion|magnet|dust|yin|yang|crystal|swift|blaze) style ','',n)
pack={}
for t in T:
    pack[norm(t['name'])]=t; pack.setdefault(strip_el(norm(t['name'])),t)
def wiki_name(n): return re.sub(r' of the (Sands|Dunes|Red Sand|Cutting Wind|Scorch)$','',n)
def users(box):
    u=re.sub(r'<!--.*?-->|<ref.*?</ref>|<ref[^>]*/>','',box.get('users',''),flags=re.S)
    out={}
    for x in u.split(','):
        x=x.strip()
        if not x: continue
        name,_,tag=x.partition('~')
        out[re.sub(r'\[\[|\]\]','',name).strip()]=tag.strip()
    return out
def canon_jutsu(box):
    media=box.get('jutsu media','')
    return 'Manga' in media and bool(box.get('debut manga','').strip())
result=[]
for f in R:
    wn=wiki_name(f['name'])
    mine=set(norm(n) for n in f['techniques']) | set(strip_el(norm(n)) for n in f['techniques'])
    canon=[]
    for title,v in J.items():
        b=v['box']; u=users(b)
        if wn in u and u[wn]=='' and canon_jutsu(b):
            alts=names_of(title,b)
            have = next((pack[a]['id'] for a in alts if a in pack), None)
            held = bool(alts & mine)
            canon.append({'title':title,'inPack':have,'held':held,'rank':b.get('jutsu rank'),'class':b.get('jutsu classification'),'type':b.get('jutsu type'),'classType':b.get('jutsu class type'),'range':b.get('jutsu range')})
    result.append({'id':f['id'],'name':f['name'],'canon':canon})
json.dump(result,open('out/match.json','w'),indent=1)
tot=sum(len(r['canon']) for r in result); held=sum(c['held'] for r in result for c in r['canon']); inpack=sum(bool(c['inPack']) and not c['held'] for r in result for c in r['canon']); missing=[c['title'] for r in result for c in r['canon'] if not c['inPack']]
print('fighters with canon jutsu',sum(1 for r in result if r['canon']),'/',len(result))
print('canon refs',tot,'held',held,'in pack not held',inpack,'missing refs',len(missing),'missing unique',len(set(missing)))
for r in sorted(result,key=lambda r:-len(r['canon']))[:15]:
    print(r['name'],len(r['canon']),'held',sum(c['held'] for c in r['canon']),'missing',sum(not c['inPack'] for c in r['canon']))
