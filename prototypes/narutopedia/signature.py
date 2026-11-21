"""Which of the fan pack's techniques are someone's signature, by Narutopedia's users: a pack
technique matched to a jutsu page with fewer than SIGNATURE_USERS named users (any medium), and
who those users are (as the pack's person ids where they match). Writes np/signatures.json."""
import json, re
from match import norm, names_of, strip_el, users as users_of
SIGNATURE_USERS = 6
J = json.load(open('out/jutsu.json')); inv = json.load(open('out/naruto-inv.json'))
by_name = {}
for title, v in J.items():
    for n in names_of(title, v['box']):
        by_name.setdefault(n, title)
def wn(n): return re.sub(r' of the (Sands|Dunes|Red Sand|Cutting Wind|Scorch)$', '', n)
pid_of = {wn(r['name']): r['pid'] for r in inv['roster']}
out = {}
for t in inv['techniques']:
    n = norm(t['name']); title = by_name.get(n) or by_name.get(strip_el(n))
    if not title: continue
    u = users_of(J[title]['box'])
    if len(u) < SIGNATURE_USERS:
        out[t['id']] = sorted({pid_of[x] for x in u if x in pid_of})
json.dump(out, open('out/signatures.json', 'w'), indent=1)
print(len(out), 'signature techniques;', sum(1 for v in out.values() if not v), 'with no versus user')
