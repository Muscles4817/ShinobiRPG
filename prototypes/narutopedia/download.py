import json, re, time
from fetch import *
titles=[]; cont={}
while True:
    d=get({'action':'query','list':'categorymembers','cmtitle':'Category:Jutsu','cmlimit':500,'cmnamespace':0,**cont})
    titles+=[m['title'] for m in d['query']['categorymembers']]
    if 'continue' not in d: break
    cont={'cmcontinue':d['continue']['cmcontinue']}
print('titles',len(titles))
out={}
for i in range(0,len(titles),50):
    batch=titles[i:i+50]
    for t,(r,text) in wikitext(batch).items():
        if not text: continue
        box=infobox(text,'Jutsu')
        if box is None: continue
        # first paragraph after infobox, for drafting
        j=text.find('}}\n', text.find('{{Infobox/Jutsu'))
        lead=text[j+3:j+3+1500] if j>0 else ''
        out[t]={'box':box,'lead':lead}
    time.sleep(0.3)
json.dump(out,open('out/jutsu.json','w'),indent=0)
print('with infobox',len(out))
