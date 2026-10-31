# Candidate evaluation: status, switch and future research process

## Candidate comparisons (October 31, 2026)

Comparisons are live for 54 contests. They are separate from the rating switch below, which stays off. No candidate is rated, ranked or endorsed.

- Data is `data/2026-11-03/candidate-quotes.json`, built by `node tools/build-quotes.mjs` from the research files in `research/2026-10-31/`.
- A quote is published only when `checks.json` records a browser match on its source page. Match codes are exact text, the same words with only quote marks or spacing different, the same words in PDF text with only extraction spacing different, and the same words in a PDF once the form's printed line numbers and line-end hyphens are set aside.
- `exclusions.json` lists quotes kept out even though they match, with the reason. These include review copies of statements, computer-generated transcripts, a sentence reused for two issues, and quotes that failed a separate pass for issue fit and readability.
- `site-checks.json` lists campaign websites that were opened and found to name the candidate. Only those are linked.
- `finance-checks.json` lists the campaign money links that were opened.
- One quote per candidate per issue. An official statement is preferred over any other source. Quotes with an ellipsis are dropped. Contests with no quote that passed are not shown as comparisons.
- The issue lists per office are in `build-quotes.mjs` and in the data file.
- `tools/validate.mjs` rule VAL-20 checks the file. The method text on About must say the guide does not rate, rank or endorse candidates.

To refresh, add research files, open each quote's source in a browser and record the result, run `apply_checks.py`, then `node tools/build-quotes.mjs`, `node tools/validate.mjs` and `npm test`.

## Status (October 24, 2026)

**Research pending. Turned off for the public.** No candidate has a rating. Contest pages show a "Candidate evaluation · Research pending" notice instead of the scoring interface. The notice has no scores, percentages, rating tables or weight controls, and it says that missing information is not a low score.

## The switch

`data/candidate-rubric.json` → `release`:

```json
"release": {
  "public": false,
  "status": "research-pending",
  "enableWhen": [ "...conditions..." ],
  "futureSources": [ "..." ]
}
```

`assets/guide.js` → `evalPublic(cands)` shows the full evaluation for a contest only when **both** of these hold:
1. `release.public` is `true`.
2. **Every** candidate in that contest has all five factors rated (each with basis, note and https source) and `evaluation.reviewedBy` is filled in.

Otherwise `evalPending()` renders the notice. The scoring code (`candidateEval`) is kept and tested behind this gate (`tests/browser/guide.test.cjs`, "gated" cases), so it can be turned on without new code.

`tools/validate.mjs` requires `release.public` to be a boolean and `release.enableWhen` to be listed. It also checks every recorded rating: a whole number from 1 to 5, a known basis, a note, an https source, and Evidence strength never resting on a campaign statement alone. `reviewedBy`, when present, must be a name.

## How to turn it on later

1. Research each candidate in a contest with the process below and record `evaluation.ratings` in `data/2026-11-03/candidates.json`.
2. Check each candidate's ratings against the sources, then record `evaluation.reviewed` (date) and `evaluation.reviewedBy` (name).
3. Run `node tools/validate.mjs` and `npm test`.
4. Set `release.public` to `true`. Contests where any candidate is incomplete or unreviewed keep showing the pending notice.

## Research process (for when the work is done)

- Use the five factors of the Ballot Weighing Tool: Evidence strength, Low risk of side effects, Accountability and results, Implementation readiness and Cost clarity, with the office guidance in `candidate-rubric.json`.
- Apply the same rubric to every candidate in a contest.
- Keep a candidate's own claims apart from independently established facts. Each rating names its basis: official record, published proposal, attributable statement, or independent source.
- For each rating, record the source URL, its publication date, the access date, a short excerpt or summary, and the factor it supports.
- Give a written rationale for every rating.
- Never treat missing information as a poor rating. A factor without documented evidence shows Insufficient evidence and is left out of the calculation.
- Show no overall score for a candidate unless every factor the voter weights is documented.
- State on the page that ratings are judgments under a published rubric, not official government assessments.
- Keep candidates in the official ballot order. Never rank, predict or recommend.
