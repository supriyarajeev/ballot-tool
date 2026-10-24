# Statewide proposition audit brief

Read RULES.md in this folder first.

For each proposition assigned to you, the current published data is in prop-<n>.json in this folder. Fields: name, title (our short title), kind, type, ask, does, yes, yesE (YES effect detail), no, noE, money, who, out (outcomes), acct (accountability), argFor, argAgainst, pro (supporters), con (opponents), risk, unk (unknowns), tw (trade-off), r (one sentence of reasoning per rating factor: fc fiscal clarity, oc outcome clarity, ac accountability, if feasibility, ev evidence, lr low risk, nb net benefit), src (sources). Ignore s/u/rs (numeric ratings; do not propose rating changes, but flag if a reason sentence in r is factually wrong).

Sources to inspect for each proposition n (try each; record which worked):
- Official voter guide page https://voterguide.sos.ca.gov/propositions/<n>/ (official title and summary, YES/NO meaning, fiscal effect summary)
- Official LAO analysis: try https://lao.ca.gov/ballot/2026/prop<n>-110326.pdf and https://lao.ca.gov/BallotAnalysis/Proposition?number=<n>&year=2026
- Official arguments and rebuttals: https://voterguide.sos.ca.gov/propositions/<n>/arguments-rebuttals.htm
- Text of proposed law: https://vig.cdn.sos.ca.gov/2026/general/pdf/prop<n>-text-proposed-laws.pdf (check legal text whenever a claim depends on a requirement, deadline, threshold, exception, audit, reporting duty or legal consequence)
- Also check the URLs listed in the prop's src array.

Check every field. For each field, decide a verdict and capture the best excerpt(s). Check supporters/opponents against the signers of official arguments, and label other names as reported by an independent source with its URL.

Output one file per proposition: statewide-<n>.json with this shape:
{
 "n": "1",
 "officialTitle": "<exact official ballot title from SOS, verbatim>",
 "measureType": "<as stated by SOS, e.g. Legislative Constitutional Amendment>",
 "sources": [{"url": "...", "title": "...", "publisher": "...", "documentDate": "<only if shown>", "retrieved": "2026-10-23", "access": "read|partial|failed", "attempts": "what happened"}],
 "fields": [
   {"field": "does", "current": "<current text>", "verdict": "...", "interpretive": false,
    "evidence": [{"url": "...", "location": "<section/page if shown, else null>", "excerpt": "<verbatim>", "readingsMatched": true}],
    "explanation": "how the excerpt supports or contradicts the claim",
    "proposedText": "<corrected text if verdict is partly-supported or unsupported, else null>",
    "limitations": "<anything uncertain>"}
 ],
 "specificGaps": ["<concrete unresolved question, e.g. 'LAO gives no estimate of total interest cost; confirm whether the $12.5B to $15B repayment range in r.nb is our own arithmetic'>"],
 "conflicts": ["<source A says X, source B says Y>"]
}
Every field listed above (except s, u, rs) must appear in fields, including each r.<factor> as "r.fc" etc. In your final message, list the material corrections you propose (field, old, new, why) in no more than 25 lines.
