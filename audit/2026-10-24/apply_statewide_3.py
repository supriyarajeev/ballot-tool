# Applies the owner-approved Stage 2 corrections P1 to P19 (audit/2026-10-24/stage1/STAGE1-REPORT.md) to propositions.html.
# Only PROPS text and source links change. Ratings (s), uncertainty flags (u), reasons (r) and reason-source indexes (rs) are untouched.
# Each change is logged with old text, new text, the official quote and its URL in statewide-changes-3.json.
import json, pathlib, re
root = pathlib.Path(__file__).resolve().parents[2]
p = root / "propositions.html"
s = p.read_text()
G = "https://voterguide.sos.ca.gov/propositions/"
changes = [
 ("P1","3","src (LAO link)",
  '["LAO analysis", "https://lao.ca.gov/BallotAnalysis/Proposition?number=3&year=2026", "Official"]',
  '["LAO analysis", LAO + "prop3-110326.pdf", "Official"]',
  "The old link returned the LAO page for Proposition 45 when fetched. The LAO PDF opens Prop 3: \"Provides Permanent Funding for Schools and Health Care by Extending Existing Tax on High Incomes.\"",
  "https://lao.ca.gov/ballot/2026/prop3-110326.pdf"),
 ("P2","4","argFor",
  'argFor: "Supporters\' official argument says California alone bans public financing, and this lets communities choose it, with safeguards."',
  'argFor: "Supporters\' official argument says elections should be won, not bought, and this lets communities choose public financing, with safeguards. Their rebuttal says California is the only state that bans it."',
  "Rebuttal to Argument Against: \"California is the ONLY state that bans public funding of campaigns.\" The Argument in Favor's theme is \"ELECTIONS SHOULD BE WON, NOT BOUGHT.\"",
  G+"4/arguments-rebuttals.htm"),
 ("P3","4","does",
  'does: "Repeals the 1988 ban, so governments',
  'does: "Repeals the state ban on public funding of campaigns, so governments',
  "LAO: \"The Political Reform Act bans the use of public funds for political candidates' campaigns.\" No year is given in the official guide.",
  G+"4/analysis.htm"),
 ("P4","1","acct",
  'acct: "An annual public report on the bond. Existing law it points to requires homes assisted, households served and where the homes are, plus cost per unit for the main rental program. A yearly',
  'acct: "An annual public report on the bond\'s investments, using the existing state housing annual report (Health and Safety Code Section 50408). A yearly',
  "Health and Safety Code Section 54088 (measure text): \"The administering entity shall publish in an annual report detailed information regarding the investments resulting from this bond.\" It points to Section 50408 only.",
  "https://vig.cdn.sos.ca.gov/2026/general/pdf/prop1-text-proposed-laws.pdf"),
 ("P5","2","pro",
  'pro: "California Professional Firefighters, Assembly Budget Chair Jesse Gabriel, Gov. Newsom."',
  'pro: "California Professional Firefighters, Assembly Budget Chair Jesse Gabriel, Los Angeles Area Chamber of Commerce (official argument). The official guide also lists Gov. Newsom."',
  "Argument in Favor signed by \"Darrell Roberts, President, California Professional Firefighters\", \"Jesse Gabriel, Chair, California State Assembly Budget Committee\" and \"Maria S. Salinas, CEO, Los Angeles Area Chamber of Commerce\".",
  G+"2/arguments-rebuttals.htm"),
 ("P6","37","acct",
  'acct: "Supporters\' official argument says it requires annual audits of the loans and the fund. An independent analysis (Hoover Institution) says program rules are exempt from normal state rulemaking. No target for homes or loans."',
  'acct: "The measure requires an independent annual audit of the program to confirm bond money is used as the law requires. Program rules are exempt from the state\'s normal rulemaking process, though CalHFA\'s board must approve them. No target for homes or loans."',
  "Legal text Sec. 51515.05(g) requires an \"independent annual audit of the program\"; Sec. 51515.05(a): rules \"shall not be subject to Chapter 3.5 (commencing with Section 11340)\", with board approval.",
  "https://vig.cdn.sos.ca.gov/2026/general/pdf/prop37-text-proposed-laws.pdf"),
 ("P7","38","money",
  'money: "LAO estimates taxpayers repay $500 million to $600 million a year for about 20 years. The state gets 10% of any revenue from resulting treatments."',
  'money: "LAO estimates taxpayers repay $500 million to $600 million a year for about 20 years. Funded researchers must pay the state 10% of revenue from licensing or selling their discoveries, which goes to the General Fund until the bond costs are covered. LAO says this could offset part or all of the cost, but it is uncertain and could take decades."',
  "AG summary: \"General Fund receives 10% of licensing royalties until bonds are repaid.\" LAO: \"The state could recover part or all of this cost in subsequent decades\" \"if the funded research leads to discoveries that generate revenue.\"",
  G+"38/title-summary.htm"),
 ("P8","38","src (legal text)",
  '["Official arguments", SOSPDF + "prop38.pdf", "Official, campaign arguments"], ["CalMatters on the institute"',
  None, "Official legal text exists: \"California Immunology Research and Cures Initiative\", pp. 123 to 132. Appended at the end of the source list so reason-source indexes are unchanged.",
  "https://vig.cdn.sos.ca.gov/2026/general/pdf/prop38-text-proposed-laws.pdf"),
 ("P9","39","pro",
  'pro: "Californians for Voter ID (official argument). LAist also lists the Howard Jarvis Taxpayers Association and the California Republican Party."',
  'pro: "Californians for Voter ID (official argument). The Transparency Foundation, California Women\'s Leadership Association and Latino American Political Association (official rebuttal). The official guide also lists the Howard Jarvis Taxpayers Association. LAist also lists the California Republican Party."',
  "Official supporters listing: \"The Transparency Foundation; Latino American Political Assn; Howard Jarvis Taxpayers Assn; CA Women's Leadership Assn\". Rebuttal signed by Johnathan Hale, Cynthia Kaui and Ed Cervantes.",
  G+"39/"),
 ("P10","40","pro",
  'pro: "SEIU-UHW (official argument). Wikipedia reports Sen. Bernie Sanders endorsed it.",',
  'pro: "SEIU-UHW (official argument and rebuttal). The official guide also lists U.S. Sen. Bernie Sanders as a supporter.",',
  "Official supporters listing: \"US Senator Bernie Sanders; SEIU United Healthcare Workers West\".",
  G+"40/"),
 ("P11","41","risk",
  'risk: "If it gets more yes votes than Prop 40, LAO says courts could find a conflict and Prop 40 could be stopped. Counting new taxes under the spending limit could also trigger rebates under existing spending-limit rules, leaving less for other programs."',
  'risk: "If it gets more yes votes than Prop 40, LAO says courts could find a conflict and Prop 40 could be stopped. LAO also says the state might not be able to exclude new special tax spending from the spending limit, and calls the net fiscal effect unknown."',
  "LAO: \"Under Proposition 41, the state might not be able to exclude new special tax spending from the limit.\" AG fiscal summary: \"Unknown net fiscal effect.\" No rebate statement in the official text.",
  G+"41/analysis.htm"),
 ("P12","41","src (legal text)",
  '["Legal text (GrowSF copy)", "https://growsf.org/voter-guide/san-francisco-voter-guide-november-2026-election/measures/prop-41/legal-text/", "Independent copy of official text"]',
  '["Legal text", SOSPDF + "prop41-text-proposed-laws.pdf", "Official"]',
  "Official legal text, pp. 147 to 150. Same position in the source list, so reason-source indexes are unchanged.",
  "https://vig.cdn.sos.ca.gov/2026/general/pdf/prop41-text-proposed-laws.pdf"),
 ("P13","44","con",
  'con: "California Medical Association, American Academy of Pediatrics California (official argument). News reports add',
  'con: "American Academy of Pediatrics California, California School Nurses Organization, California Medical Association (official argument). The official listing also names the California Academy of Family Physicians. News reports add',
  "Argument against signed by \"Eric Ball, MD, FAAP, President, American Academy of Pediatrics, California\", \"Katie Nilsson, RN, President, California School Nurses Organization\", \"René Bravo, M.D., President, California Medical Association\".",
  G+"44/arguments-rebuttals.htm"),
 ("P14","45","pro",
  'pro: "California Water Association, California Children\'s Hospital Association (official argument). News reports add',
  'pro: "California Children\'s Hospital Association, California Water Association, California Council on Affordable Housing (official listing and argument). News reports add',
  "Argument in favor signed by \"Ann-Louise Kuhns, President, California Children's Hospital Association\", \"Jennifer Capitolo, Executive Director, California Water Association\", \"Jenna Abbott, Executive Director, California Council on Affordable Housing\".",
  G+"45/arguments-rebuttals.htm"),
 ("P15","45","no / noE",
  'no: "Projects would continue to use existing review and court challenge procedures.", noE: "This includes CEQA exemptions the Legislature passed in 2025."',
  'no: "Public and private projects would continue to use existing project review and court challenge procedures.", noE: ""',
  "Official NO: \"Public and private projects would continue to use existing project review and court challenge procedures.\" The 2025 exemptions sentence is not in the guide or the LAO analysis.",
  G+"45/"),
 ("P16","45","unk",
  'A Holland & Knight study led by Jennifer Hernandez, who HousingWire reports helped write the measure, puts it at four to five years."',
  'A Holland & Knight report co-written by Jennifer Hernandez, who HousingWire reports helped write the measure, says CEQA trial and appellate proceedings typically take about five years."',
  "Holland & Knight: \"CEQA trial and appellate court proceedings typically take about five years to complete\". The report is added to the sources (appended).",
  "https://www.hklaw.com/en/insights/publications/2026/09/why-california-cant-build-reliable-and-affordable-essential-projects"),
 ("P17","44","does",
  'Any shortfall is paid as a penalty into escrow and returned only if the clinic reaches 90% within five years.',
  'Any shortfall is paid as a penalty into escrow. It is returned only if the clinic reaches 90% within five years and agrees with the Department of Public Health on a plan to spend it on patient services. The department can grant one-year waivers.',
  "Legal text H&S Sec. 1234.5: moneys \"held in escrow for a period of five years\", reimbursed only if the clinic meets 90 percent and agrees a spending plan with the Department of Public Health; (c) \"a temporary pause of the 90 percent requirement\".",
  "https://vig.cdn.sos.ca.gov/2026/general/pdf/prop44-text-proposed-laws.pdf"),
 ("P18","43","does",
  'It also bars citizen initiatives from adding local property taxes beyond what the state constitution already allows.',
  'It also says no local government, including voters using the initiative, may impose ad valorem taxes on real property except as Article XIII D, Section 3(a)(1) of the state constitution allows. The official analysis does not discuss this clause.',
  "Legal text Sec. 4.5(b): \"no local government, including the electorate of a local government exercising the initiative power, may impose ad valorem taxes on real property, except as provided in paragraph (1) of subdivision (a) of Section 3 of Article XIII D.\"",
  "https://vig.cdn.sos.ca.gov/2026/general/pdf/prop43-text-proposed-laws.pdf"),
 ("P19","44","yes",
  'yes: "Certain private nonprofit health clinics would have',
  'yes: "Certain private nonprofit health care clinics would have',
  "Official YES: \"Certain private nonprofit health care clinics would have to spend at least 90 percent of their revenue each year on providing health care services.\"",
  G+"44/"),
]
log = []
for cid, prop, field, old, new, quote, url in changes:
    if cid == "P8":
        # Append the legal text as the last source of Prop 38 (keeps rs indexes).
        i = s.index('n: "38"'); j = s.index("src: [", i); k = s.index("]] }", j)
        seg_old = s[j:k + 2]
        assert "prop38-text-proposed-laws" not in seg_old
        seg_new = s[j:k + 1] + ', ["Legal text", SOSPDF + "prop38-text-proposed-laws.pdf", "Official"]]'
        s = s[:j] + seg_new + s[k + 2:]
        log.append({"id": cid, "prop": prop, "field": field, "old": "(no legal text link)", "new": '["Legal text", SOSPDF + "prop38-text-proposed-laws.pdf", "Official"] appended', "officialQuote": quote, "url": url})
        continue
    assert s.count(old) == 1, (cid, s.count(old))
    s = s.replace(old, new)
    log.append({"id": cid, "prop": prop, "field": field, "old": old, "new": new, "officialQuote": quote, "url": url})
# P16: append the Holland & Knight report to Prop 45's sources.
hk = '["Holland & Knight report on CEQA litigation", "https://www.hklaw.com/en/insights/publications/2026/09/why-california-cant-build-reliable-and-affordable-essential-projects", "Independent"]'
i = s.index('n: "45"'); j = s.index("src: std(\"45\", [", i); k = s.index("]]) }", j)
assert "hklaw.com" not in s[j:k]
s = s[:j] + s[j:k + 1] + ", " + hk + "]" + s[k + 2:]
p.write_text(s)
out = {"date": "2026-10-24", "approvedBy": "the site owner, in chat on Oct 24, 2026 (items P1 to P19 of audit/2026-10-24/stage1/STAGE1-REPORT.md)",
       "note": "Text and source links only. Ratings, weights, reasons and scoring are unchanged; tests/scoring-regression.mjs must report 0 differences. Official text was read with an automated fetch tool; no person has reviewed it.",
       "changes": log}
(root / "audit/2026-10-24/statewide-changes-3.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print(len(log), "changes applied")

# ---- Evidence ledger: supersede rows that back the old wording, add one row per correction with the official quote. ----
def update_ledger():
    pe = root / "data/evidence-claims.json"
    d = json.loads(pe.read_text())
    claims = d["claims"]
    FIELD = {"acct": "evidence", "argFor": "argFor", "does": "plainEnglish", "pro": "supporters", "con": "opponents", "money": "fiscal", "risk": "risks", "no / noE": "no", "unk": "uncertain", "yes": "yes"}
    KEY = {"P2": "California alone bans", "P3": "1988 ban", "P4": "cost per unit", "P5": "Gov. Newsom.", "P6": "annual audits of the loans", "P7": "10% of any revenue",
           "P9": "LAist also lists the Howard", "P10": "Wikipedia reports", "P11": "trigger rebates", "P13": "American Academy of Pediatrics California (official",
           "P14": "California Water Association, California Children", "P15": "passed in 2025", "P16": "four to five years", "P17": "returned only if the clinic",
           "P18": "bars citizen initiatives", "P19": "health clinics would have"}
    ids = {c["id"] for c in claims}
    added, superseded = 0, 0
    for ch in log:
        if ch["id"] not in KEY: continue
        subj = "2026-11-03.ca.prop-" + ch["prop"]; field = FIELD[ch["field"]]
        nid = f"evc-prop{ch['prop']}-{field}-official-2026-10-24"
        assert nid not in ids, nid
        # Existing rows back other sentences of the same field, so they are kept: their claim text is updated to the
        # corrected wording and their excerpts stay as they were. The new row below backs the corrected sentence.
        body = lambda t: re.sub(r'^[A-Za-z]+: "', "", t).rstrip(',').rstrip('"')
        for c in claims:
            if c["subject"] == subj and c["field"] == field and KEY[ch["id"]] in (c.get("claim") or "") and c.get("reviewStatus") != "superseded":
                if ch["id"] == "P15":
                    c["claim"] = "Public and private projects would continue to use existing project review and court challenge procedures."
                    c["reviewStatus"] = "superseded"
                    c["limitations"] = ((c.get("limitations") or "") + f" Superseded on Oct 24, 2026 by {nid}: the 2025 exemptions sentence it backed was removed (correction P15).").strip()
                else:
                    ob, nb = body(ch["old"]), body(ch["new"])
                    assert ob in c["claim"], (c["id"], ob[:40])
                    c["claim"] = c["claim"].replace(ob, nb)
                    c["limitations"] = ((c.get("limitations") or "") + f" Claim text updated on Oct 24, 2026 after correction {ch['id']}; the excerpt is unchanged and backs the parts of the field it always backed.").strip()
                superseded += 1
        newtext = ch["new"].split(': "', 1)[1].rstrip('"') if ': "' in ch["new"] else ch["new"]
        claims.append({
            "id": nid, "subject": subj, "subjectKind": "measure", "field": field, "claim": newtext,
            "sourceTitle": "Proposition " + ch["prop"] + (" official voter guide or legal text" if "hklaw" not in ch["url"] else " (Holland & Knight report)"),
            "url": ch["url"], "sourceType": "Independent" if "hklaw" in ch["url"] else "Official", "documentDate": None, "retrieved": "2026-10-24",
            "excerpt": ch["officialQuote"], "location": None,
            "excerptMethod": "WebFetch verbatim-quote request during the Stage 1 audit (Oct 23 to 24, 2026); see audit/2026-10-24/stage1/",
            "readingsMatched": None, "verdict": "supported", "interpretive": False,
            "explanation": f"Correction {ch['id']} approved by the owner on Oct 24, 2026. The new wording follows the quoted official text.",
            "limitations": "Read with an automated fetch tool that returns short quotes. No person has reviewed this row.",
            "reviewStatus": "needs-review"})
        added += 1
    pe.write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n")
    print("ledger:", added, "rows added,", superseded, "existing rows updated")
update_ledger()
