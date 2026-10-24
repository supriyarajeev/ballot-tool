"""Flag claim-level evidence rows whose own excerpt covers only part of the claim (EVD-03, EVD-05).

A row keeps verdict "supported" only when its excerpt plausibly states the whole claim. The checks are
deliberately simple and conservative; a flag means "a person should look", not "the claim is wrong".

  1. number   a number in the claim (amount, percent, year, count) does not appear in the excerpt
  2. name     a capitalized name in the claim (not at a sentence start) does not appear in the excerpt
  3. length   the claim is at least 12 words and more than 2.5 times as long as the excerpt
  4. listed   the row is in the auditor's sample of partly supported rows (/tmp/qa-agent2/sample.json judgments
              in audit/reports/evidence-audit.md section 2), listed below

Rows with verdict "attribution", "unsupported" or "not-found" are left alone. The interpretive flag is never
cleared. With --apply the changed rows are printed (one per line) so they can be recorded in the fix summary.

Usage:  python3 audit/2026-10-23/recheck_verdicts.py           (dry run, prints counts)
        python3 audit/2026-10-23/recheck_verdicts.py --apply   (writes data/evidence-claims.json)
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", ".."))
PATH = os.path.join(SITE, "data/evidence-claims.json")

# Auditor's 18 "partly" rows from the seeded 45-row sample (evidence-audit.md, section 2)
AUDITOR_PARTLY = {
    "evc-prop39-acct-1", "evc-ca-sf-city.e-measureType", "evc-prop2-argAgainst-1", "evc-prop3-acct-2", "evc-prop5-r-nb-1",
    "evc-prop2-tw-2", "evc-prop44-r-oc-2", "evc-prop1-argAgainst-1", "evc-prop1-r-nb-1", "evc-prop4-does-2", "evc-prop39-r-oc-1",
    "evc-prop5-who-2", "evc-prop45-con-1", "evc-prop2-does-1", "evc-prop43-con-2",
    "evc-ca-santa-clara-sd-los-gatos-saratoga-union-high-school-district.measure-n-plainEnglish", "evc-prop39-unk-2", "evc-prop3-acct-3",
}
# Capitalized words that are not names, or that name the source itself rather than a fact in the claim
NOT_NAMES = {"LAO", "SOS", "Prop", "Props", "Proposition", "California", "Californians", "State", "YES", "NO", "A", "An", "The", "It", "This",
             "If", "In", "Our", "We", "Its", "Measure", "Passes", "Official", "Supporters", "Opponents", "News", "No", "Not", "And", "Or",
             "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"}
WORDNUM = {"one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10",
           "eleven": "11", "twelve": "12", "twenty": "20", "thirty": "30", "forty": "40", "fifty": "50", "hundred": "100"}

def numbers(text):
    t = text.lower().replace(",", "")
    out = set(re.findall(r"\d+(?:\.\d+)?", t))
    return out

def excerpt_numbers(text):
    t = text.lower().replace(",", "")
    out = set(re.findall(r"\d+(?:\.\d+)?", t))
    for w, d in WORDNUM.items():
        if re.search(r"\b" + w + r"\b", t): out.add(d)
    if "majority" in t: out.add("50")
    if "two-thirds" in t or "2/3" in t: out.update({"2", "3"})
    # "$5,000,000" in an excerpt states "5 million" in a claim
    for n in list(out):
        if re.fullmatch(r"\d+000000", n): out.add(n[:-6])
        if re.fullmatch(r"\d+000000000", n): out.add(n[:-9])
        if "." in n: out.add(n.rstrip("0").rstrip("."))
    return out

def names(text):
    found = set()
    for sent in re.split(r"(?<=[.!?:;])\s+|\(|\)", text):
        toks = re.findall(r"[A-Za-z][A-Za-z'’\-]*", sent)
        for i, tok in enumerate(toks):
            if i == 0: continue
            if tok in NOT_NAMES or not tok[0].isupper(): continue
            if tok.isupper() and len(tok) <= 2: continue
            found.add(tok)
    return found

def norm(s):
    return re.sub(r"[^a-z0-9 ]", " ", s.lower().replace("’", "'"))

def check(c):
    claim, ex = c.get("claim") or "", c.get("excerpt") or ""
    reasons = []
    miss_n = sorted(n for n in numbers(claim) - excerpt_numbers(ex))
    if miss_n: reasons.append("number not in excerpt: " + ", ".join(miss_n))
    exn = norm(ex)
    subj = norm(c.get("subject", "").replace("-", " "))  # the measure's own jurisdiction name is not a missing fact
    miss_p = sorted(p for p in names(claim) if norm(p).strip() and norm(p).strip() not in exn and norm(p).strip() not in subj)
    if miss_p: reasons.append("name not in excerpt: " + ", ".join(miss_p))
    cw, ew = len(claim.split()), max(1, len(ex.split()))
    if cw >= 12 and cw > 2.5 * ew: reasons.append(f"claim {cw} words, excerpt {ew} words")
    if c["id"] in AUDITOR_PARTLY: reasons.append("auditor judged partly supported (EVD-05 sample)")
    return reasons

def main(apply):
    data = json.load(open(PATH))
    changed = []
    for c in data["claims"]:
        if c.get("verdict") != "supported": continue
        r = check(c)
        if r:
            changed.append((c["id"], r))
            if apply:
                c["verdict"] = "partly-supported"
                note = "Re-checked Oct 23, 2026 (recheck_verdicts.py): the excerpt covers only part of the claim (" + "; ".join(r) + ")."
                lim = c.get("limitations")
                c["limitations"] = (lim + " " + note) if lim else note
    by = {}
    for cid, r in changed:
        for x in r: by[x.split(":")[0].split(" ")[0]] = by.get(x.split(":")[0].split(" ")[0], 0) + 1
    print(f"{len(changed)} of {sum(1 for c in data['claims'] if c.get('verdict') in ('supported','partly-supported'))} rows flagged as partly supported; reasons {by}")
    if apply:
        json.dump(data, open(PATH, "w"), indent=1, ensure_ascii=False); open(PATH, "a").write("\n")
        for cid, r in changed: print(cid + "\t" + "; ".join(r))

if __name__ == "__main__":
    main("--apply" in sys.argv)
