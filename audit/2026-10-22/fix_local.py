"""Manual corrections from the Oct 22, 2026 audit that need judgment (see docs/INDEPENDENT-REVIEW.md).
Run after import_local.py:  python3 audit/2026-10-22/fix_local.py"""
import json, os
SITE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
P = os.path.join(SITE, "data/2026-11-03/local-measures.json"); L = json.load(open(P)); I = {m["id"]: m for m in L["items"]}
JP = os.path.join(SITE, "data/jurisdictions.json"); J = json.load(open(JP))
EP = os.path.join(SITE, "data/evidence-claims.json"); E = json.load(open(EP))
INDEP_FIELDS = ["plainEnglish", "yes", "no", "fiscal", "why", "affected", "uncertain", "argFor", "argAgainst", "benefits", "risks", "evidence", "supporters", "opponents"]

# Oakland EE and FF: their summaries rested only on independent reporting. Independent sources may not be the sole support
# for a published fact, so the summaries are withdrawn until official documents are read. Links stay as further reading.
for mid, note in [("2026-11-03.ca-alameda-oakland.measure-ee", "The official Charter Reform page cited before does not mention Measure EE, so it was removed as a source."),
                  ("2026-11-03.ca-alameda-oakland.measure-ff", "The June 18, 2026 Rules and Legislation Committee item is on the City of Oakland's official agenda platform and is now labeled Official.")]:
    m = I[mid]
    for f in INDEP_FIELDS: m[f] = None
    m["sources"] = [s for s in m["sources"] if "Charter-Reform" not in s["url"]]
    for s in m["sources"]:
        if "granicus" in s["url"]: s["type"] = "Official"; s["label"] = "Oakland Rules and Legislation Committee item 26-0691, June 18, 2026"
    m["status"] = "incomplete"
    m["notes"] = ("Audited Oct 22, 2026. The earlier summary relied only on independent news reporting, because the registrar's measure document is a scanned image "
                  "and Oakland's legislative records could not be opened. It was withdrawn under the rule that independent reporting cannot be the only support for a fact. "
                  "The independent links remain below as further reading. " + note)
    m["gaps"] = ["Ballot question (exact wording from an official document)", "Plain-English summary supported by the official text",
                 "What a YES vote and a NO vote would do", "Fiscal effect from the city's official financial analysis", "Vote threshold stated in an official document",
                 "Summary of the official arguments for and against"] + (["Whether the companion advisory question on spending the revenue has its own measure letter"] if mid.endswith("ff") else [])

# Regional Measure RTM: replace wording that went beyond the official ballot question; drop independent-only argument summaries.
r = I["2026-11-03.ca-bayarea-rtm.measure-rtm"]
r["plainEnglish"] = "Adds a 0.5% sales tax in Alameda, Contra Costa, San Mateo and Santa Clara counties and a 1% sales tax in San Francisco for 14 years. The ballot question says the money would preserve BART, Caltrain, VTA, SamTrans, AC Transit, Muni and other transit, support transit safety, cleanliness, affordability and reliability, and repair targeted roads and potholes."
r["yes"] = "A YES vote approves the regional sales tax for 14 years, at 0.5% in Alameda, Contra Costa, San Mateo and Santa Clara counties and 1% in San Francisco."
r["no"] = "A NO vote rejects the tax."
r["argFor"] = None; r["argAgainst"] = None
r["notes"] = ("Audited Oct 22, 2026. The ballot question, tax rates, 14-year term, revenue estimate and majority vote requirement come from official county documents "
              "(the Alameda County notice, read twice, and the Contra Costa and Santa Clara lists). The Alameda County memo says the majority is counted across all five counties combined. "
              "The impartial analysis and the official arguments could not be read. Earlier argument summaries that relied only on independent reporting were removed; the independent links remain as further reading.")
r["gaps"] = ["Impartial analysis text (county copies are scanned images or unreachable)", "Summary of the official arguments for and against",
             "Start date of the tax", "Share of revenue raised in and returned to each county", "How the measure qualified as an initiative"]

# Sonoma: the filed list misspells Old Adobe. Two county sources (final measures table and the measure document) say "Old Adobe".
old_j = "ca-sonoma-sd-old-adboe-union-school-district"; new_j = "ca-sonoma-sd-old-adobe-union-school-district"
for j in J["jurisdictions"]:
    if j["id"] == old_j:
        j["id"] = new_j; j["name"] = "Old Adobe Union School District"
        j["note"] = "Boundaries not recorded. The county's filed-measures list prints \"Old Adboe\"; the county's final measures table and the measure document say \"Old Adobe\"."
old_id = "2026-11-03." + old_j + ".measure-o"; new_id = "2026-11-03." + new_j + ".measure-o"
if old_id in I:
    m = I[old_id]; m["id"] = new_id; m["jurisdiction"] = new_j; m["shortTitle"] = "Old Adobe Union School District Bond"
    for c in E["claims"]:
        if c["subject"] == old_id: c["subject"] = new_id; c["id"] = c["id"].replace("adboe", "adobe")

# San Francisco: the Voter Information Pamphlet titles differ slightly from the sf.gov list for C, G and H. Use the pamphlet title as officialTitle and note the list wording.
VIP = {"c": "Contributions to the Housing Trust Fund", "g": "Allowing Private Vehicles on the Upper Great Highway in Sunset Dunes Park", "h": "Parcel Tax to Fund Muni Operations"}
for k, t in VIP.items():
    m = I["2026-11-03.ca-sf-city." + k]
    if m.get("officialTitle") != t:
        m["notes"] += f" The sf.gov measures list titles this \"{m.get('officialTitle')}\"; the Department of Elections Voter Information Pamphlet uses \"{t}\", which is shown here."
        m["officialTitle"] = t

json.dump(L, open(P, "w"), indent=2, ensure_ascii=False); open(P, "a").write("\n")
json.dump(J, open(JP, "w"), indent=1, ensure_ascii=False); open(JP, "a").write("\n")
json.dump(E, open(EP, "w"), indent=1, ensure_ascii=False); open(EP, "a").write("\n")
print("fixes applied")
# Claim-level evidence for the corrected RTM fields (excerpts from the audit's field verdicts).
RAW = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw", "county-ca-bayarea-rtm.json")))["measures"][0]
BQ = RAW["ballotQuestion"]
claims = {c["id"]: c for c in E["claims"]}
def rtm_claim(field, text, excerpt, expl, interp=True):
    cid = "evc-rtm-" + field
    claims[cid] = {"id": cid, "subject": r["id"], "subjectKind": "measure", "field": field, "claim": text, "sourceTitle": "Alameda County notice of election, Measure RTM",
        "url": BQ["url"], "sourceType": "Official", "retrieved": "2026-10-22", "excerpt": excerpt, "location": BQ.get("location"),
        "excerptMethod": "WebFetch verbatim-quote request (an automated reader returns the requested passage); compare word for word with the source before human review",
        "readingsMatched": True, "verdict": "supported", "interpretive": interp, "explanation": expl, "limitations": None, "reviewStatus": "needs-review"}
rtm_claim("plainEnglish", r["plainEnglish"], BQ["text"], "Rates, term and listed purposes are restated from the official ballot question.")
rtm_claim("yes", r["yes"], "shall the measure enacting a 0.5% (Alameda, Contra Costa, San Mateo, Santa Clara counties), and 1% (San Francisco) sales tax for 14 years generating approximately $980,000,000 annually, be adopted?", "A YES vote adopts the measure the ballot question describes.")
rtm_claim("no", r["no"], "shall the measure ... be adopted?", "A NO vote does not adopt the measure.")
E["claims"] = list(claims.values())
json.dump(E, open(EP, "w"), indent=1, ensure_ascii=False); open(EP, "a").write("\n")
print("rtm claims added")

