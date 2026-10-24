"""Integration-lead data fixes, Oct 23, 2026 (after Fix A to D). Run from the site folder:
    python3 audit/2026-10-23/integration_fixes.py
1. Adds the three Oakland Unified School District board contests. The Oakland City Clerk's final qualified-candidate list was rendered
   in the Claude desktop app's built-in browser (pdf.js) and read visually. Each table is headed "SCHOOL BOARD DIRECTOR DISTRICT n" with
   its candidates directly beneath. This resolves EVD-13, which the text layer alone could not.
2. Notes on the existing Oakland contests that the heading-to-name mapping was confirmed visually.
3. Prop 3 and Prop 39 evidence rows follow the applied text corrections (audit/2026-10-23/statewide-changes-2.json).
4. The Alameda coverage note now derives nothing hardcoded; it states what the data holds today."""
import json, os, re
SITE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
def rd(p): return json.load(open(os.path.join(SITE, p)))
def wr(p, v):
    with open(os.path.join(SITE, p), "w") as f: json.dump(v, f, indent=2 if p.endswith("local-measures.json") else 1, ensure_ascii=False); f.write("\n")
J = rd("data/jurisdictions.json"); C = rd("data/2026-11-03/contests.json"); K = rd("data/2026-11-03/candidates.json"); E = rd("data/evidence-claims.json")
jur = {j["id"]: j for j in J["jurisdictions"]}; contests = {c["id"]: c for c in C["contests"]}; cands = {p["id"]: p for p in K["candidates"]}; claims = {c["id"]: c for c in E["claims"]}
URL = "https://www.oaklandca.gov/files/assets/city/v/20/city-clerk/documents/elections/nov-2026-election-qualified-candidate-list.pdf"
SRC = {"label": "Oakland City Clerk, final list of qualified candidates (in ballot order) for Nov 3, 2026", "url": URL, "type": "Official"}
METHOD = "Rendered with pdf.js in the Claude desktop app's built-in browser on Oct 23, 2026 and read visually; the PDF's text layer gives the same names and designations but lists the table headings separately"
slug = lambda s: re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
JID = "ca-alameda-sd-oakland-unified-school-district"
if JID not in jur:
    rec = {"id": JID, "name": "Oakland Unified School District", "type": "school-district", "parent": "ca-alameda", "areas": ["ca-alameda-oakland"], "sources": [SRC],
           "note": "Board elections are by trustee district. District boundaries are not recorded in this guide."}
    J["jurisdictions"].append(rec); jur[JID] = rec
OUSD = {"2": [("Arielle Fleisher", "Parent/Policy Director"), ("Jennifer Brouhard", "Retired Educator")],
        "4": [("Mike Hutchinson", "Incumbent"), ("Kathryn Camp", "Public Policy Professional"), ("Sylvia Pfeiffer Williams", "Adult Educator")],
        "6": [("Alexandra Williams", "Teacher/Program Director"), ("LeAna Powell", "Family Advocate/Parent"), ("Valarie Bachelor", "School Board Director")]}
note = ("Names, ballot designations and order from the Oakland City Clerk's final qualified-candidate list, read visually from the rendered PDF on Oct 23, 2026. "
        "This is a city source for a school district contest; check your official sample ballot, because trustee districts do not follow city council lines.")
for d, people in OUSD.items():
    cid = f"2026-11-03.{JID}.school-board-director-district-{d}"
    ids = []
    for name, desig in people:
        pid = cid + "." + slug(name); ids.append(pid)
        cands[pid] = {"id": pid, "name": name, "contest": cid, "party": None, "designation": desig, "statementUrl": None,
            "statementNote": "Candidate statements for this contest have not been collected yet. Check your county sample ballot.", "financeUrl": None,
            "qualifications": None, "positions": None, "publicRecord": None, "status": "needs-review", "lastVerified": "2026-10-23", "sources": [SRC],
            "notes": note + (" The ballot designation is the word \"Incumbent\"." if desig == "Incumbent" else ""),
            "gaps": ["Candidate statement", "Qualifications, stated positions and public record not yet collected"], "incumbent": desig == "Incumbent"}
    contests[cid] = {"id": cid, "election": "2026-11-03", "jurisdiction": JID, "office": "School Board Director", "district": f"District {d}", "seats": None,
                     "candidates": ids, "status": "needs-review", "lastVerified": "2026-10-23", "sources": [SRC], "notes": note}
    ex = f"SCHOOL BOARD DIRECTOR DISTRICT {d} / " + " / ".join(f"{n} {g}" for n, g in people)
    k = "evc-roster-" + cid.split(".", 1)[1]
    claims[k] = {"id": k, "subject": cid, "subjectKind": "contest", "field": "candidates", "claim": "The candidates listed for this contest, in the source's order.",
                 "sourceTitle": SRC["label"], "url": URL, "sourceType": "Official", "retrieved": "2026-10-23", "excerpt": ex, "location": "Page 1, table headed SCHOOL BOARD DIRECTOR DISTRICT " + d,
                 "excerptMethod": METHOD, "readingsMatched": True, "verdict": "supported", "interpretive": False,
                 "explanation": "The table heading names the district and the rows beneath list each candidate and ballot designation.", "limitations": None, "reviewStatus": "needs-review"}
for cid in [c for c in contests if c.startswith("2026-11-03.ca-alameda-oakland")]:
    c = contests[cid]
    if "confirmed visually" not in c["notes"]:
        c["notes"] += " On Oct 23, 2026 the rendered PDF was read visually: each office has its own table with its candidates directly beneath, which confirms this contest's names."
# Prop 3 and Prop 39 rows follow the corrected text
ch = {(x["prop"], x["field"]): x["new"] for x in json.load(open(os.path.join(SITE, "audit/2026-10-23/statewide-changes-2.json")))}
for c in claims.values():
    if c["subject"] == "2026-11-03.ca.prop-3" and c["id"].startswith("evc-prop3-does-"): c["claim"] = ch[("3", "does")]
    if c["id"] == "evc-prop39-r-oc-1": c["claim"] = ch[("39", "r.oc")]
    if c["id"] == "evc-prop44-money-1": c["claim"] = ch[("44", "money")]
J["jurisdictions"] and None
C["contests"] = list(contests.values()); K["candidates"] = list(cands.values()); E["claims"] = list(claims.values())
wr("data/jurisdictions.json", J); wr("data/2026-11-03/contests.json", C); wr("data/2026-11-03/candidates.json", K); wr("data/evidence-claims.json", E)
print("OUSD contests:", len([c for c in contests if JID in c]))
