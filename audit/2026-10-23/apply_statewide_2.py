"""Applies statewide_corrections.py to propositions.html (content strings only; ratings untouched).
Run from the site folder:  python3 audit/2026-10-22/apply_statewide.py"""
import re, os, json
HERE = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.abspath(os.path.join(HERE, "..", ".."))
ns = {}; exec(open(os.path.join(HERE, "statewide_corrections_2.py")).read(), ns)
path = os.path.join(SITE, "propositions.html"); html = open(path).read()
def js(s): return s.replace("\\", "\\\\").replace('"', '\\"')
changes = []
for n, field, new, why in ns["C"]:
    if new is None: continue
    start = html.index('{ n: "%s",' % n)
    nxt = html.find('{ n: "', start + 5); end = nxt if nxt > 0 else html.index("\n  ];", start)
    block = html[start:end]
    key = field.split(".")[-1]
    pat = re.compile(r'(\b%s: )"((?:[^"\\]|\\.)*)"' % re.escape(key))
    hits = list(pat.finditer(block))
    if field.startswith("r."):
        rs = block.index("r: {"); hits = [h for h in hits if h.start() > rs]
    else:
        hits = [h for h in hits if "r: {" not in block[:h.start()] or block.rfind("}", 0, h.start()) > block.rfind("r: {", 0, h.start())]
    assert len(hits) == 1, (n, field, len(hits))
    h = hits[0]; old = h.group(2)
    if old == js(new): continue
    block = block[:h.start()] + h.group(1) + '"' + js(new) + '"' + block[h.end():]
    html = html[:start] + block + html[end:]
    changes.append({"prop": n, "field": field, "old": json.loads('"' + old + '"'), "new": new, "reason": why})
open(path, "w").write(html)
json.dump(changes, open(os.path.join(HERE, "statewide-changes-2.json"), "w"), indent=1, ensure_ascii=False)
print(len(changes), "fields changed")
