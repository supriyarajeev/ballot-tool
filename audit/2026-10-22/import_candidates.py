"""Applies the Oct 22, 2026 candidate audit (raw/candidates-audit-a.json and -b.json) to the site data.
- Records candidate statement locations found in the San Francisco Voter Information Pamphlet.
- Corrects contest fields the audit found missing (district, seats) and adds source notes.
- Adds contests from official city rosters that name each candidate's office. Leaves out rosters that are not final,
  that do not say which office each name runs for, or whose district assignment had to be inferred.
- Writes contest-level claim evidence with the roster excerpt.
Run from the site folder:  python3 audit/2026-10-22/import_candidates.py"""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.abspath(os.path.join(HERE, "..", ".."))
DAY = "2026-10-22"; EL = "2026-11-03"
def rd(p): return json.load(open(os.path.join(SITE, p)))
def wr(p, v):
    with open(os.path.join(SITE, p), "w") as f: json.dump(v, f, indent=1, ensure_ascii=False); f.write("\n")
C = rd("data/2026-11-03/contests.json"); K = rd("data/2026-11-03/candidates.json"); J = rd("data/jurisdictions.json"); E = rd("data/evidence-claims.json")
contests = {c["id"]: c for c in C["contests"]}; cands = {p["id"]: p for p in K["candidates"]}; jur = {j["id"]: j for j in J["jurisdictions"]}
claims = {c["id"]: c for c in E["claims"]}
slug = lambda s: re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
METHOD = "WebFetch verbatim-quote request (an automated reader returns the requested passage); compare word for word with the source before human review"
VIP = "https://media.api.sf.gov/documents/N26_EN_VIP.pdf"

def roster_claim(cid, excerpt, url, matched, note=""):
    if not excerpt: return
    k = "evc-roster-" + cid.split(".", 1)[1]
    claims[k] = {"id": k, "subject": cid, "subjectKind": "contest", "field": "candidates", "claim": "The candidates listed for this contest, in the source's order.",
                 "sourceTitle": next((s["label"] for s in contests[cid]["sources"] if s["url"] == url), "Official candidate list"), "url": url, "sourceType": "Official",
                 "retrieved": DAY, "excerpt": excerpt, "location": None, "excerptMethod": METHOD, "readingsMatched": matched, "verdict": "supported",
                 "interpretive": False, "explanation": "Roster excerpt from the official source. " + note, "limitations": None, "reviewStatus": "needs-review"}

# ---- Audit A: statewide, legislative and San Francisco
A = json.load(open(os.path.join(HERE, "raw", "candidates-audit-a.json")))
for ac in A["contests"]:
    c = contests.get(ac["id"])
    if not c: continue
    roster_claim(c["id"], ac.get("excerpt"), ac.get("source") or c["sources"][0]["url"], ac.get("readingsMatched"))
    if ac.get("seats") and not c.get("seats"): c["seats"] = ac["seats"]
    if c["id"].endswith("bart-board") and not c.get("district"): c["district"] = "District 8"
    for ap in ac["candidates"]:
        p = cands.get(ap.get("id")) or next((x for x in cands.values() if x["contest"] == c["id"] and x["name"] == ap["name"]), None)
        if not p: continue
        ev = ap.get("statementEvidence") or ""
        if ap.get("statementUrl") == VIP:
            m = re.search(r"page (\d+)", ev)
            p["statementUrl"] = VIP
            p["statementNote"] = "Candidate statement in the San Francisco Voter Information Pamphlet" + (f", page {m.group(1)}." if m else ".")
            if p["sources"][0]["url"] != VIP and VIP not in [s["url"] for s in p["sources"]]:
                p["sources"].append({"label": "San Francisco Voter Information Pamphlet, November 3, 2026", "url": VIP, "type": "Official"})
            p["gaps"] = [g for g in p.get("gaps", []) if g != "Candidate statement"]
        elif "No statement" in ev and "Pamphlet" in ev:
            p["statementNote"] = "No statement for this candidate appears in the San Francisco Voter Information Pamphlet (one reading)."
            p["gaps"] = [g for g in p.get("gaps", []) if g != "Candidate statement"]
        elif "Alameda County composite Voter Information Guide" in ev:
            p["statementNote"] = "Candidate statements for this contest, if any, are in the Alameda County voter information guide, which could not be read for this guide."
        note = ap.get("notes") or ""
        hm = re.search(r'heading reads "([^"]+)"', note)
        if hm:
            p["notes"] = (p.get("notes") or "") + f" The pamphlet's statement heading reads \"{hm.group(1)}\"; the name shown here follows the sf.gov candidate list."
for cid in ("2026-11-03.ca-sf.assessor-recorder", "2026-11-03.ca-sf.public-defender", "2026-11-03.ca-sf-sd-san-francisco-unified-school-district.board-of-education"):
    c = contests[cid]
    if "filed for candidacy" not in c["notes"]:
        c["notes"] += " The sf.gov page says these candidates \"have filed for candidacy\". The Voter Information Pamphlet lists this contest on the ballot and prints the candidates' statements."
for c in contests.values():
    if c["jurisdiction"].startswith("ca-sf") or c["jurisdiction"] == "ca-bart-district-8":
        if VIP not in [s["url"] for s in c["sources"]]:
            c["sources"].append({"label": "San Francisco Voter Information Pamphlet, November 3, 2026 (contest list, page 5)", "url": VIP, "type": "Official"})

# ---- Audit B: Oakland, Berkeley, Hayward and new Alameda contests
B = json.load(open(os.path.join(HERE, "raw", "candidates-audit-b.json")))
for bc in B["contests"]:
    c = contests.get(bc["id"])
    if not c: continue
    roster_claim(c["id"], bc.get("excerpt"), bc.get("source") or c["sources"][0]["url"], bc.get("readingsMatched"))
    if bc.get("seats") and not c.get("seats"): c["seats"] = bc["seats"]
    if c["id"].endswith("oakland.mayor") and "write-in" not in c["notes"]:
        c["notes"] += " The city list also shows a qualified write-in candidate, Bro Ayinde, who will not be printed on the ballot."
    if "hayward-council" in c["id"]:
        c["notes"] += " The city page shows the current councilmember's photo labeled as incumbent; this guide marks incumbency only where an official list states it."

TITLE = {"ROBIN D. LÓPEZ": "Robin D. López", "KATHERINE ENOS": "Katherine Enos", "JON DESTIN": "Jon Destin", "AARON TIEDEMANN": "Aaron Tiedemann",
         "CHRIS McDANIELS": "Chris McDaniels", "MARGARET ALLEN": "Margaret Allen", "MELISSA BOYD": "Melissa Boyd", "BECKY HOPWOOD": "Becky Hopwood",
         "JOSH MAHONEY": "Josh Mahoney", "DAVID McKINNEY": "David McKinney", "ANNE HSU": "Anne Hsu"}
CITY = {"City of Alameda": "ca-alameda-alameda", "City of Albany": "ca-alameda-albany", "City of Emeryville": "ca-alameda-emeryville", "City of Piedmont": "ca-alameda-piedmont",
        "Union City": "ca-alameda-union-city", "City of San Leandro": "ca-alameda-san-leandro"}
added = []; skipped = []
def add_j(rec):
    if rec["id"] not in jur: J["jurisdictions"].append(rec); jur[rec["id"]] = rec
    return rec["id"]
for nc in B["newContests"]:
    jname = nc.get("jurisdiction") or ""; office = nc["office"]; url = nc["source"]
    if "Oakland Unified" in jname: skipped.append(("Oakland school board " + str(nc.get("district")), "district assignment inferred from list order")); continue
    if "Write-In" in office: continue
    if "Newark" in jname: skipped.append(("Newark " + office, "filing notice, not a final roster")); continue
    if "Pleasanton" in jname: skipped.append(("Pleasanton", "list does not say which office each name seeks")); continue
    label = {"content.govdelivery.com": "City of Alameda City Clerk, roster of candidates (final)", "albanyca.gov": "City of Albany, notice of nominees",
             "emeryville.org": "City of Emeryville, November 2026 candidates", "piedmont.ca.gov": "City of Piedmont, 2026 election page",
             "unioncityca.gov": "Union City, November 3, 2026 general municipal election", "sanleandro.org": "City of San Leandro City Clerk, candidate list",
             "ebmud.com": "East Bay Municipal Utility District, press release on Board of Directors elections"}
    src = {"label": next((v for k, v in label.items() if k in url), "Official candidate list"), "url": url, "type": "Official"}
    dist = nc.get("district")
    if "EBMUD" in office:
        w = dist.split()[-1]
        jid = add_j({"id": f"ca-ebmud-ward-{w}", "name": f"EBMUD Ward {w}", "type": "special-district", "parent": "ca-alameda", "counties": ["ca-alameda", "ca-contra-costa"], "areas": [],
                     "sources": [src], "note": "East Bay Municipal Utility District ward. Crosses county lines; boundaries not recorded."})
        office_name = "EBMUD Board of Directors"; dist_label = f"Ward {w}"
    elif "Board of Education" in office:
        jid = add_j({"id": "ca-alameda-sd-albany-unified-school-district", "name": "Albany Unified School District", "type": "school-district", "parent": "ca-alameda", "areas": ["ca-alameda-albany"], "sources": [src]})
        office_name = "Board of Education"; dist_label = None
    else:
        city = CITY[next(k for k in CITY if k in jname)]
        if dist:
            n = dist.split()[-1]
            jid = add_j({"id": f"{city}-council-district-{n}", "name": f"{jur[city]['name']} City Council District {n}", "type": "council-district", "parent": city, "areas": [], "sources": [src]})
        else: jid = city
        office_name = "Mayor" if office.startswith("Mayor") else ("City Council, partial two-year term" if "Partial" in office else "City Council")
        dist_label = dist
    cid = f"{EL}.{jid}.{slug(office_name)}"
    if cid in contests: skipped.append((cid, "already present")); continue
    note = f"Names read from the {src['label']} by automated research on Oct 22, 2026. This is a city or district source, not the county's final ballot; check your official sample ballot."
    if "Anne Hsu" in json.dumps(nc, ensure_ascii=False) or "ANNE HSU" in json.dumps(nc, ensure_ascii=False):
        note += " The city's notice of nominees lists Anne Hsu; the city's candidates page does not. The notice is the later document and is followed here."
    if "EBMUD" in office:
        note = "Names, incumbency and occupations from an EBMUD press release (official district source), not the county ballot. Occupations in the press release are not recorded as ballot designations."
    ids = []
    for p in nc["candidates"]:
        name = TITLE.get(p["name"], p["name"])
        pid = cid + "." + slug(name); ids.append(pid)
        cands[pid] = {"id": pid, "name": name, "contest": cid, "party": None, "designation": None if "EBMUD" in office else p.get("designation"),
                      "statementUrl": None, "statementNote": "Candidate statements for this contest have not been collected yet. Check your county sample ballot.",
                      "financeUrl": None, "qualifications": None, "positions": None, "publicRecord": None, "status": "needs-review", "lastVerified": DAY,
                      "sources": [src], "notes": note, "gaps": ["Ballot designation", "Candidate statement", "Qualifications, stated positions and public record not yet collected"],
                      "incumbent": bool(p.get("incumbentMarked"))}
    contests[cid] = {"id": cid, "election": EL, "jurisdiction": jid, "office": office_name, "district": dist_label, "seats": nc.get("seats"), "candidates": ids,
                     "status": "needs-review", "lastVerified": DAY, "sources": [src], "notes": note}
    roster_claim(cid, nc.get("excerpt"), url, nc.get("readingsMatched"))
    added.append(cid)

C["contests"] = list(contests.values()); K["candidates"] = list(cands.values()); E["claims"] = list(claims.values())
wr("data/2026-11-03/contests.json", C); wr("data/2026-11-03/candidates.json", K); wr("data/jurisdictions.json", J); wr("data/evidence-claims.json", E)
print(len(added), "contests added;", len(C["contests"]), "contests,", len(K["candidates"]), "candidates")
for s in skipped: print("left out:", s)
