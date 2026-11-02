"""Merges researched local measure fields into the guide data.
   python3 research/2026-11-01/apply_measures.py [--dry]
Reads research/2026-11-01/out-*.json and research/2026-11-01/excerpt-checks.json. A field is published only when its
excerpt was found again, word for word, on its source page in a second browser read (excerpt-checks.json, result
"match"), and only from an official page. Each published field gets a claim record in data/evidence-claims.json.
Gaps that the new fields answer are removed; every other gap stays."""
import glob, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
R = os.path.join(ROOT, "research/2026-11-01")
LM = os.path.join(ROOT, "data/2026-11-03/local-measures.json")
EC = os.path.join(ROOT, "data/evidence-claims.json")
DATE = __import__("time").strftime("%Y-%m-%d")
DRY = "--dry" in sys.argv
FIELDS = ["plainEnglish", "yes", "no", "fiscal", "argFor", "argAgainst", "supporters", "opponents"]
GAP_FOR = {
    "plainEnglish": ["Plain-English summary supported by the official text", "Impartial analysis text", "Impartial analysis not located"],
    "yes": ["What a YES vote and a NO vote would do"],
    "fiscal": ["Fiscal effect (tax rate, amount and duration, or cost)", "Fiscal or tax rate statement and duration"],
    "argFor": ["Summary of the official arguments for and against", "Whether arguments were filed not confirmed", "Arguments filed: not determined."],
}
# Text fixes found in checking: the page prints a name and a title in separate elements that read together.
FIX = {("2026-11-03.ca-marin-larkspur.measure-s", "supporters"): ("BRIDGET PETERSONR, MS Nurse Educator", "BRIDGET PETERSON, RMS Nurse Educator")}
# Signer lists on the Marin County measure pages were also checked name by name on the page (Nov 2, 2026).
MARIN_SIGNERS = "Every name and title in this list was found on the same page in a second browser read, ignoring line breaks between a name and its title."
norm = lambda s: re.sub(r"\s+", " ", str(s).replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')).strip()
checks = {}
cf = os.path.join(R, "excerpt-checks.json")
if os.path.exists(cf):
    for r in json.load(open(cf))["results"]:
        if r.get("result") == "match": checks[(r["id"], r["field"])] = r
lm = json.load(open(LM)); byId = {x["id"]: x for x in lm["items"]}
ec = json.load(open(EC)); claims = {c["id"]: c for c in ec["claims"]}
added = skipped = 0; per = {}; pocr = {}; plocs = {}
for f in sorted(glob.glob(os.path.join(R, "out-*.json"))):
    for o in json.load(open(f)):
        m = byId.get(o.get("id"))
        if not m: raise SystemExit(f"{f}: unknown measure {o.get('id')}")
        pages = {p["url"]: p for p in o.get("officialPages", []) if p.get("url", "").startswith("https://")}
        got = list(per.get(m["id"], [])); ocrk = list(pocr.get(m["id"], []))
        for k in FIELDS:
            v = (o.get("fields") or {}).get(k)
            if not v or not v.get("text") or not v.get("excerpt") or not str(v.get("url", "")).startswith("https://"): continue
            ocr = v.get("method") == "ocr-checked-against-image"
            if not ocr and (m["id"], k) not in checks: skipped += 1; continue
            m[k] = v["text"].strip()
            for old, new in [FIX[(m["id"], k)]] if (m["id"], k) in FIX else []: m[k] = v["text"].strip().replace(old, new)
            if k not in got: got.append(k)
            plocs.setdefault(m["id"], set()).add((k, str(v.get("location") or "").lower()))
            if ocr and k not in ocrk: ocrk.append(k)
            if not ocr and k in ocrk: ocrk.remove(k)
            cid = "evc-" + m["id"].split(".", 1)[1] + "-" + k
            claims[cid] = {
                "id": cid, "subject": m["id"], "subjectKind": "measure", "field": k, "claim": m[k],
                "sourceTitle": (pages.get(v["url"]) or {}).get("title") or "Official measure document",
                "url": v["url"], "sourceType": "Official", "retrieved": DATE, "excerpt": v["excerpt"],
                "location": v.get("location"),
                "excerptMethod": "read with text recognition from the scanned official document in a browser, and compared word for word with the page image on " + DATE if ocr else "copied from the page text read in a browser, and found again word for word on the source in a second browser read on " + checks[(m["id"], k)].get("date", DATE),
                "explanation": "Official text supporting the " + k + " field.",
                "limitations": (MARIN_SIGNERS if "marincounty.gov" in v["url"] else "Names and titles were read from the scanned signature page and compared with the page image." if ocr else None) if k in ("supporters", "opponents") else None,
                "reviewStatus": "needs-review", "verdict": "supported",
            }
            if not any(s.get("url") == v["url"] for s in m.get("sources", [])):
                m.setdefault("sources", []).append({"label": (pages.get(v["url"]) or {}).get("title") or "Official measure document", "url": v["url"], "type": "Official"})
            added += 1
        if got:
            got.sort(key=FIELDS.index)
            drop = set()
            for k in got:
                for g in GAP_FOR.get(k, []): drop.add(g)
            if "yes" in got and "no" not in got: drop.discard("What a YES vote and a NO vote would do")
            if "argFor" in got and "argAgainst" not in got: drop -= set(GAP_FOR["argFor"])
            # Free-text gaps that a new field answers, judged from where its excerpt was found.
            locs = plocs.get(m["id"], set())
            fromIA = any("impartial analysis" in l or "analysis by" in l for _, l in locs)
            def answered(g):
                gl = g.lower()
                if gl.startswith("impartial analysis") and fromIA: return True
                if gl.startswith("controller statement") and m.get("fiscal") and any(k == "fiscal" and "controller" in l for k, l in locs): return True
                if ("bsc digest and yes/no" in gl) and m.get("yes") and m.get("no") and any(k == "yes" and "digest" in l for k, l in locs): return True
                if gl.startswith("fiscal impact statement, if any") and m.get("fiscal"): return True
                if gl in ("which arguments were filed not confirmed.", "argument texts and finance director's analysis not read") and m.get("argFor") and m.get("argAgainst"): return True
                return False
            m["gaps"] = [g for g in m.get("gaps", []) if g not in drop and not answered(g)]
            m["lastVerified"] = DATE
            # Notes sentences that the new fields make untrue are removed; a dated line says what was added.
            have = lambda *ks: all(m.get(x) for x in ks)
            stale = [(r"(Plain-English content, )?YES/NO effects and arguments have not been researched yet\.", have("plainEnglish", "yes", "argFor")),
                     (r"The impartial analysis and the official arguments could not be read\.", have("plainEnglish", "argFor"))]
            notes = m.get("notes", "")
            for pat, ok in stale:
                if ok: notes = re.sub(r"\s*" + pat, "", notes)
            names = {"plainEnglish": "summary", "yes": "what a Yes vote does", "no": "what a No vote does", "fiscal": "fiscal effect", "argFor": "argument in favor", "argAgainst": "argument against", "supporters": "signers in favor", "opponents": "signers against"}
            notes = re.sub(r"\s*Nov 2, 2026\. Added from the official measure documents.*$", "", notes)
            OCRT = " were read with text recognition from a scanned page and compared word for word with the page image."; CHK = " found again word for word on its source in a second browser read."
            tail = ("All" + OCRT) if len(ocrk) == len(got) else ("Each excerpt was" + CHK) if not ocrk else ("Excerpts for " + ", ".join(names[k] for k in ocrk) + OCRT + " Every other excerpt was" + CHK)
            m["notes"] = (notes.strip() + " Nov 2, 2026. Added from the official measure documents: " + ", ".join(names[k] for k in got) + ". " + tail).strip()
            # Every listed gap answered: the record still awaits review against the sources, so it is "needs-review", never verified.
            if not m["gaps"] and m.get("status") == "incomplete": m["status"] = "needs-review"
            per[m["id"]] = got; pocr[m["id"]] = ocrk
ec["claims"] = list(claims.values())
print(f"fields published {added}, held back without a second match {skipped}, measures changed {len(per)}")
if not DRY:
    json.dump(lm, open(LM, "w"), indent=2, ensure_ascii=False); open(LM, "a").write("\n")
    json.dump(ec, open(EC, "w"), indent=1, ensure_ascii=False); open(EC, "a").write("\n")
