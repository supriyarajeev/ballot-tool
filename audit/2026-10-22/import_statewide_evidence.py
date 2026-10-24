"""Turns the statewide audit (raw/statewide-<n>.json) into claim-level evidence records in data/evidence-claims.json.
Fields of propositions.html map to fields of data/2026-11-03/statewide.json; rating reasons map to "tool.r.<factor>".
Corrected fields take their new text from statewide-changes.json. Fields the audit could not support (not-found) get no claim record.
Run from the site folder:  python3 audit/2026-10-22/import_statewide_evidence.py"""
import json, os, re
from urllib.parse import urlparse
HERE = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.abspath(os.path.join(HERE, "..", ".."))
EP = os.path.join(SITE, "data/evidence-claims.json"); E = json.load(open(EP)); claims = {c["id"]: c for c in E["claims"]}
changes = {(c["prop"], c["field"]): c for c in json.load(open(os.path.join(HERE, "statewide-changes.json")))}
MAP = {"title": "officialTitle", "type": "measureType", "does": "plainEnglish", "yes": "yes", "yesE": "yes", "no": "no", "noE": "no", "out": "benefits",
       "risk": "risks", "tw": "risks", "who": "affected", "money": "fiscal", "acct": "evidence", "unk": "uncertain", "argFor": "argFor",
       "argAgainst": "argAgainst", "pro": "supporters", "con": "opponents", "ask": "tool.ask", "name": "tool.name"}
OFFICIAL = re.compile(r"(\.ca\.gov|\.gov)$")
n_added = 0
for n in ["1", "2", "3", "4", "5", "37", "38", "39", "40", "41", "42", "43", "44", "45"]:
    d = json.load(open(os.path.join(HERE, "raw", f"statewide-{n}.json")))
    titles = {s["url"]: s for s in d.get("sources", [])}
    subj = f"2026-11-03.ca.prop-{n}"
    for f in d["fields"]:
        fld = f["field"]
        if fld.startswith("src") or f["verdict"] == "not-found": continue
        target = ("tool." + fld) if fld.startswith("r.") else MAP.get(fld)
        if not target: continue
        ch = changes.get((n, fld))
        if ch and ch["new"] == "": continue
        text = ch["new"] if ch else f.get("current")
        if not text: continue
        verdict = "supported" if (ch and f["verdict"] in ("partly-supported", "unsupported")) else f["verdict"]
        for i, ev in enumerate([e for e in (f.get("evidence") or []) if e.get("excerpt") and e.get("url")][:3]):
            host = urlparse(ev["url"]).hostname or ""
            src = titles.get(ev["url"], {})
            cid = f"evc-prop{n}-{fld.replace('.', '-')}-{i + 1}"
            claims[cid] = {"id": cid, "subject": subj, "subjectKind": "measure", "field": target, "claim": text,
                "sourceTitle": src.get("title") or host, "url": ev["url"], "sourceType": "Official" if OFFICIAL.search(host) else "Independent",
                "documentDate": src.get("documentDate"), "retrieved": src.get("retrieved") or "2026-10-22", "excerpt": ev["excerpt"], "location": ev.get("location"),
                "excerptMethod": ev.get("excerptMethod") or "WebFetch verbatim-quote request", "readingsMatched": ev.get("readingsMatched"),
                "verdict": verdict, "interpretive": bool(f.get("interpretive")),
                "explanation": (("Corrected after the audit: " + ch["reason"] + " ") if ch else "") + (f.get("explanation") or ""),
                "limitations": f.get("limitations"), "reviewStatus": "needs-review"}
            n_added += 1
E["claims"] = list(claims.values())
json.dump(E, open(EP, "w"), indent=1, ensure_ascii=False); open(EP, "a").write("\n")
print(n_added, "statewide claim records;", len(E["claims"]), "claims in total")
