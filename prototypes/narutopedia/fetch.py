import json, re, time, urllib.request, urllib.parse, sys, os
API='https://naruto.fandom.com/api.php'
CACHE='out'
def get(params):
    params={**params,'format':'json','formatversion':'2'}
    url=API+'?'+urllib.parse.urlencode(params)
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'shinobi-rpg-content-script/0.1'}),timeout=30) as r:
                return json.load(r)
        except Exception as e:
            time.sleep(2**i)
    raise RuntimeError(url)
def wikitext(titles):
    """titles list (<=50) -> {title: (resolved, text)}"""
    d=get({'action':'query','prop':'revisions','rvprop':'content','rvslots':'main','titles':'|'.join(titles),'redirects':1})
    q=d['query']; out={}
    norm={n['from']:n['to'] for n in q.get('normalized',[])}
    red={n['from']:n['to'] for n in q.get('redirects',[])}
    pages={p['title']:p for p in q['pages']}
    for t in titles:
        r=norm.get(t,t); r=red.get(r,r); p=pages.get(r)
        if p and 'revisions' in p: out[t]=(r,p['revisions'][0]['slots']['main']['content'])
        else: out[t]=(r,None)
    return out
def infobox(text, kind):
    i=text.find('{{Infobox/'+kind)
    if i<0: return None
    depth=0; j=i
    while j<len(text):
        if text.startswith('{{',j): depth+=1; j+=2; continue
        if text.startswith('}}',j):
            depth-=1; j+=2
            if depth==0: break
            continue
        j+=1
    body=text[i:j]
    fields={}; cur=None
    # split top-level on newline-pipe
    for line in body.split('\n|')[1:]:
        k,_,v=line.partition('=')
        fields[k.strip()]=v.strip().rstrip('}').strip()
    return fields
