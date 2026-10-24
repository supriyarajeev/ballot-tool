"""Round 2 data fixes after the retest reports (audit/reports/retest-*.md), integration lead, Oct 23, 2026.
Run from the site folder:  python3 audit/2026-10-23/round2_data_fixes.py
- R2-06: Berkeley notice of nominees (Aug 19, 2026) rendered with pdf.js in the built-in browser and read visually. It is a two-column page:
  each office heading is underlined, and each candidate's ballot designation is printed on the line under the name. The notice also has a
  "Rent Stabilization Board Commissioner" heading at the top of the right column. Mari Mendonca, last in the District 8 column, has no
  designation line, so the designation previously recorded for her was wrong and is removed.
- R1-01 / FE-02: Contra Costa's contest and candidate inventory becomes "partial" (EBMUD Wards 3 and 7 cross into the county).
- R1-02: Board of Equalization Districts 1 and 4 list every county, with San Bernardino County split between them (the Secretary of State
  list prints it in both). countiesKnown is true and partialCounties names the split county.
- R2-04: stale statewide gaps removed; the Prop 39 rating-reason evidence row gets the LAO passage that supports the new wording.
- R2-07: the candidate-order fixture note says what it really records."""
import json, os
SITE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
def rd(p): return json.load(open(os.path.join(SITE, p)))
def wr(p, v, ind=1):
    with open(os.path.join(SITE, p), "w") as f: json.dump(v, f, indent=ind, ensure_ascii=False); f.write("\n")
K = rd("data/2026-11-03/candidates.json"); C = rd("data/2026-11-03/contests.json"); J = rd("data/jurisdictions.json"); E = rd("data/evidence-claims.json"); R = rd("data/statewide-review.json")
cands = {p["id"]: p for p in K["candidates"]}; contests = {c["id"]: c for c in C["contests"]}; jur = {j["id"]: j for j in J["jurisdictions"]}; claims = {c["id"]: c for c in E["claims"]}
NOTICE = "https://berkeleyca.gov/sites/default/files/Notice%20of%20Candidates%20Nov%203%202026%20-%20WEB%20Version.pdf"
NSRC = {"label": "Berkeley City Clerk, notice of nominees for public office, Aug 19, 2026", "url": NOTICE, "type": "Official"}
METHOD = "Rendered with pdf.js in the Claude desktop app's built-in browser on Oct 23, 2026 and read visually"
DES = {"ca-alameda-berkeley.city-auditor.jenny-wong": ("City Auditor", "Auditor"),
  "ca-alameda-berkeley-council-district-1.city-council.steve-kromer": ("Energy Efficiency Engineer", "City Council, District 1"),
  "ca-alameda-berkeley-council-district-1.city-council.daria-wrubel": ("Youth Therapist", "City Council, District 1"),
  "ca-alameda-berkeley-council-district-1.city-council.laura-babitt": ("Auditor/Operations Director", "City Council, District 1"),
  "ca-alameda-berkeley-council-district-1.city-council.ross-bernet": ("Environmental Program Manager", "City Council, District 1"),
  "ca-alameda-berkeley-council-district-1.city-council.moni-gangopadhyay": ("Consumer Protection Investigator", "City Council, District 1"),
  "ca-alameda-berkeley-council-district-4.city-council.majdi-gaith-abuhamdieh": ("Entrepreneur/Technologist/Parent", "City Council, District 4"),
  "ca-alameda-berkeley-council-district-4.city-council.igor-a-tregub": ("Berkeley City Councilmember, District 4", "City Council, District 4"),
  "ca-alameda-berkeley-council-district-7.city-council.aidan-hill": ("Medical Case Manager", "City Council, District 7"),
  "ca-alameda-berkeley-council-district-7.city-council.syrak-micael": ("Community Engagement Liaison", "City Council, District 7")}
for short, (d, office) in DES.items():
    p = cands["2026-11-03." + short]
    p["designation"] = d
    p["notes"] = "Ballot designation read visually from the rendered notice of nominees on Oct 23, 2026; the designation is printed on the line under the name, beneath the heading \"" + office + "\"."
    p["gaps"] = [g for g in p.get("gaps", []) if g != "Ballot designation"]
    if NOTICE not in [s["url"] for s in p["sources"]]: p["sources"].append(NSRC)
    k = "evc-desig-" + short
    claims[k] = {"id": k, "subject": p["id"], "subjectKind": "candidate", "field": "designation", "claim": d, "sourceTitle": NSRC["label"], "url": NOTICE,
        "sourceType": "Official", "retrieved": "2026-10-23", "excerpt": f"{office} / {p['name']} / {d}", "location": "Page 1, under the heading " + office,
        "excerptMethod": METHOD, "readingsMatched": None, "verdict": "supported", "interpretive": False,
        "explanation": "The notice says the candidates are listed in ballot order with their ballot designation included; the designation is the line under the name.",
        "limitations": "One visual reading; compare with the county sample ballot.", "reviewStatus": "needs-review"}
m = cands["2026-11-03.ca-alameda-berkeley-council-district-8.city-council.mari-mendonca"]
m["designation"] = None
m["notes"] = ("The Aug 19, 2026 notice of nominees prints no ballot designation under her name (she is last in the District 8 column; the next text, in the "
              "right column, is the Rent Stabilization Board heading). A designation recorded earlier from the PDF's text layer was wrong and was removed on Oct 23, 2026.")
for cid in [c for c in claims if c.startswith("evc-") and "mari-mendonca" in c and claims[c]["field"] == "designation"]: del claims[cid]
d1 = contests["2026-11-03.ca-alameda-berkeley-council-district-1.city-council"]; d7 = contests["2026-11-03.ca-alameda-berkeley-council-district-7.city-council"]
for c, name in ((d1, "Kelsea Jackson"), (d7, "John A. Espinoza")):
    if name not in c["notes"]:
        c["notes"] += f" The city's final roster also has a partly filled row for {name}; that name is not on the Aug 19 notice of nominees, so it is not listed here."
for cid in ("ca-contra-costa",):
    inv = jur[cid]["inventory"]; inv["contests"] = "partial"; inv["candidates"] = "partial"
    jur[cid]["coverage"]["note"] = jur[cid]["coverage"]["note"].replace("Local candidate contests are not collected yet.", "Local candidate contests are only partly collected: the two East Bay Municipal Utility District wards that cross into the county are listed; city, school and other district contests are not.")
for bid in ("ca-boe-1", "ca-boe-4"):
    b = jur[bid]; b["countiesKnown"] = True; b["partialCounties"] = ["ca-san-bernardino"]
    b["note"] = "Full county list from the Secretary of State. San Bernardino County is split between Districts 1 and 4, so in that county this contest may apply."
for n, drop in (("3", "rates end after 2030"), ("39", "rationale calls the ID rule clear"), ("44", "not yet labeled on the page")):
    g = R["props"].get(n, {}).get("gaps", []); R["props"][n]["gaps"] = [x for x in g if drop not in x]
r = claims.get("evc-prop39-r-oc-1")
if r: r["limitations"] = "The reasoning text was reworded on Oct 23, 2026; this row supports its first sentence."
claims["evc-prop39-r-oc-lao"] = {"id": "evc-prop39-r-oc-lao", "subject": "2026-11-03.ca.prop-39", "subjectKind": "measure", "field": "tool.r.oc",
    "claim": "Which IDs count is left for the Legislature to define.", "sourceTitle": "Proposition 39, official voter guide section (LAO analysis)",
    "url": "https://vig.cdn.sos.ca.gov/2026/general/pdf/prop39.pdf", "sourceType": "Official", "retrieved": "2026-10-23",
    "excerpt": "The Legislature would need to clarify several details that are not defined in the proposition, like which forms of identification could be used",
    "location": "Page 50", "excerptMethod": "WebFetch verbatim-quote request (read twice by Fix Agent D)", "readingsMatched": True, "verdict": "supported",
    "interpretive": False, "explanation": "LAO states the measure leaves accepted forms of identification undefined.", "limitations": None, "reviewStatus": "needs-review"}
E["claims"] = list(claims.values())
wr("data/2026-11-03/candidates.json", K); wr("data/2026-11-03/contests.json", C); wr("data/jurisdictions.json", J); wr("data/evidence-claims.json", E); wr("data/statewide-review.json", R)
f = os.path.join(SITE, "tests/fixtures/candidate-order.json"); o = json.load(open(f))
o["note"] = "Candidate order per contest as recorded in the data (taken from each contest's official source when the record was made). This catches accidental reordering; a deliberate change is re-recorded with --update-candidate-order after checking the source."
json.dump(o, open(f, "w"), indent=1, ensure_ascii=False); open(f, "a").write("\n")
print("round 2 data fixes applied")
