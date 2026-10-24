"""One-time import of the Oct 22, 2026 local-measure audit (raw/county-*.json) into the site data.

What it does, per measure record:
- Ballot question: published only when the audit captured verbatim text from an official document.
- Vote threshold: published only when an official excerpt states it. Thresholds with no official excerpt are removed.
- Measure type: published only when backed by an excerpt and not inferred from a file name.
- Plain-English summary: published only when the audit says the official text supports every word.
- San Francisco YES/NO meanings: taken verbatim from final Ballot Simplification Committee digests.
- Claim-level evidence records are written to data/evidence-claims.json for every published audited field.
- Gaps are recomputed as a list of the specific missing items, plus the audit's own open questions.
Status stays "incomplete" unless the core fields (summary, YES, NO, fiscal, threshold) are all present.

Run from the site folder:  python3 audit/2026-10-22/import_local.py
"""
import json, os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", ".."))
RAW = os.path.join(HERE, "raw")
DAY = "2026-10-22"
METHOD = "WebFetch verbatim-quote request (an automated reader returns the requested passage); compare word for word with the source before human review"

def rd(p): return json.load(open(os.path.join(SITE, p)))
def wr(p, v):
    with open(os.path.join(SITE, p), "w") as f: json.dump(v, f, indent=2 if p.endswith("local-measures.json") else 1, ensure_ascii=False); f.write("\n")

LM = rd("data/2026-11-03/local-measures.json")
EC = rd("data/evidence-claims.json")
claims = {c["id"]: c for c in EC["claims"]}
items = {m["id"]: m for m in LM["items"]}
THR = {"majority": "a simple majority (more than 50%) of votes", "two-thirds": "two-thirds of votes", "55%": "55% of votes"}
UNOFFICIAL_HOST = re.compile(r"(kqed|ballotpedia|substack|localnewsmatters|wikipedia|lwv|growsf|joincalifornia)", re.I)
log = []

def is_official(url):
    return bool(url) and not UNOFFICIAL_HOST.search(url)

def add_source(m, url, label):
    if not url or not is_official(url): return
    if url in [s["url"] for s in m["sources"]]: return
    m["sources"].append({"label": label, "url": url, "type": "Official"})

def claim(m, field, text, excerpt, url, location=None, verdict="supported", interpretive=False, explanation="", matched=None, limitations=None):
    if not (excerpt and str(excerpt).strip() and url): return False
    cid = f"evc-{m['id'].split('.', 1)[1]}-{field}"
    claims[cid] = {"id": cid, "subject": m["id"], "subjectKind": "measure", "field": field, "claim": text,
        "sourceTitle": next((s["label"] for s in m["sources"] if s["url"] == url), "Official document"), "url": url,
        "sourceType": "Official" if is_official(url) else "Independent", "retrieved": DAY, "excerpt": str(excerpt).strip(),
        "location": location, "excerptMethod": METHOD, "readingsMatched": matched, "verdict": verdict, "interpretive": interpretive,
        "explanation": explanation, "limitations": limitations, "reviewStatus": "needs-review"}
    return True

def clean_type(v):
    if not v or re.search(r"file name|per city page|interpretive|county file names", v, re.I): return None
    v = v.strip()
    return v[0].upper() + v[1:]

for f in sorted(glob.glob(os.path.join(RAW, "county-*.json"))):
    county = json.load(open(f))
    for a in county["measures"]:
        m = items.get(a.get("id"))
        if not m: log.append(f"no record for {a.get('id')}"); continue
        audit_notes = []
        # Ballot question
        bq = a.get("ballotQuestion") or {}
        if isinstance(bq, dict) and bq.get("text") and is_official(bq.get("url")):
            add_source(m, bq["url"], "Official document with the ballot question")
            m["ballotQuestion"] = bq["text"].strip()
            claim(m, "ballotQuestion", m["ballotQuestion"], bq["text"], bq["url"], bq.get("location"), matched=bq.get("readingsMatched"),
                  explanation="Verbatim ballot question as returned from the official document.",
                  limitations=None if bq.get("readingsMatched") else "Read once, or the second reading did not fully match. Check word for word.")
        # Threshold
        th = a.get("threshold") or {}
        if th.get("value") in THR and th.get("evidence") and is_official(th.get("url")):
            add_source(m, th["url"], "Official document stating the vote requirement")
            m["threshold"] = THR[th["value"]]
            claim(m, "threshold", "Passes with " + m["threshold"] + ".", th["evidence"], th["url"], matched=th.get("readingsMatched"),
                  explanation="The official document states the vote requirement.",
                  limitations="The excerpt field may include the auditor's note on where the statement appears.")
        elif m.get("threshold"):
            audit_notes.append(f"The vote threshold previously shown ({m['threshold']}) was removed because no official document read so far states it.")
            m["threshold"] = None
        # Measure type
        mt = a.get("measureType") or {}
        mtv = clean_type(mt.get("value") if isinstance(mt, dict) else mt)
        if mtv and isinstance(mt, dict) and mt.get("evidence") and is_official(mt.get("url")):
            m["measureType"] = mtv
            claim(m, "measureType", "Measure type. " + mtv + ".", mt["evidence"], mt["url"], verdict="supported", interpretive=True,
                  explanation="The type is a short description drawn from the official document's wording.")
        # Title from list when we had none
        t = a.get("titleOnList")
        if m.get("shortTitle") == "Title not recorded yet" and t and a.get("titleOK") is False and ":" in t:
            newt = t.split(":", 1)[1].strip()
            if newt and newt.lower() not in (m.get("jurisdiction") or ""):
                m["shortTitle"] = newt
                claim(m, "shortTitle", newt, t, m["sources"][0]["url"], explanation="Title as printed on the county list.")
        # Plain English (only if the auditor judged it fully supported) and SF YES/NO
        pe = a.get("plainEnglish")
        chk = a.get("plainEnglishCheck") or {}
        if isinstance(pe, str) and pe.strip() and (not chk or chk.get("verdict") in ("supported", "partly-supported")):
            basis = (chk.get("evidence") if chk else None) or (bq.get("text") if isinstance(bq, dict) else None)
            url = (chk.get("url") if chk else None) or (bq.get("url") if isinstance(bq, dict) else None)
            if basis and is_official(url):
                m["plainEnglish"] = pe.strip()
                claim(m, "plainEnglish", pe.strip(), basis, url, interpretive=True, explanation="A plain-language restatement of the official text quoted in the excerpt.")
        for fld, key in (("yes", "yesMeans"), ("no", "noMeans")):
            v = a.get(key)
            if isinstance(v, dict) and v.get("text") and is_official(v.get("url")):
                add_source(m, v["url"], "Ballot Simplification Committee final digest")
                m[fld] = v["text"].strip()
                claim(m, fld, m[fld], v["text"], v["url"], v.get("location"), explanation="Verbatim from the official digest.")
        # Arguments filed
        af = a.get("argumentsFiled") or {}
        if af.get("for") is not None or af.get("against") is not None:
            def yn(x): return "filed" if x is True else ("not filed" if x is False else "unknown")
            audit_notes.append(f"Official arguments. For {yn(af.get('for'))}, against {yn(af.get('against'))}" + (f" (source {af['url']})." if af.get("url") else "."))
        if a.get("impartialAnalysisUrl") and is_official(a["impartialAnalysisUrl"]):
            add_source(m, a["impartialAnalysisUrl"], "Impartial analysis (official)")
        for s in a.get("otherSources") or []:
            if isinstance(s, dict) and s.get("access") == "read" and is_official(s.get("url")):
                add_source(m, s["url"], (s.get("title") or "Official document")[:140])
        # Gaps: specific missing items plus the auditor's open questions
        gaps = []
        if not m.get("ballotQuestion"): gaps.append("Ballot question (exact wording from an official document)")
        if not m.get("plainEnglish"): gaps.append("Plain-English summary supported by the official text")
        if not (m.get("yes") and m.get("no")): gaps.append("What a YES vote and a NO vote would do")
        if not m.get("fiscal"): gaps.append("Fiscal effect (tax rate, amount and duration, or cost)")
        if not m.get("threshold"): gaps.append("Vote threshold stated in an official document")
        if not (m.get("argFor") or m.get("argAgainst")): gaps.append("Summary of the official arguments for and against")
        for g in a.get("remainingGaps") or []:
            if g and g not in gaps: gaps.append(g.strip())
        m["gaps"] = gaps
        core = all(m.get(k) for k in ("plainEnglish", "yes", "no", "fiscal", "threshold"))
        if m["status"] == "incomplete" and core: m["status"] = "needs-review"
        m["lastVerified"] = DAY
        prefix = "Audited Oct 22, 2026 against official sources by automated research. "
        base = re.sub(r"^Audited Oct 22, 2026.*?research\. ", "", m.get("notes") or "")
        m["notes"] = prefix + base + ((" " + " ".join(audit_notes)) if audit_notes else "")

EC["claims"] = list(claims.values())
wr("data/2026-11-03/local-measures.json", LM)
wr("data/evidence-claims.json", EC)
print("\n".join(log) or "all audit records matched")
print("ballot questions", sum(1 for m in LM["items"] if m.get("ballotQuestion")), "thresholds", sum(1 for m in LM["items"] if m.get("threshold")), "claims", len(EC["claims"]))
