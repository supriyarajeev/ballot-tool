# Candidate evaluation: status, switch and future research process

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
2. **Every** candidate in that contest has all seven factors rated (each with basis, note and https source) and `evaluation.reviewedBy` names the person who reviewed it.

Otherwise `evalPending()` renders the notice. The scoring code (`candidateEval`) is kept and tested behind this gate (`tests/browser/guide.test.cjs`, "gated" cases), so it can be turned on without new code.

`tools/validate.mjs` requires `release.public` to be a boolean and `release.enableWhen` to be listed. It also checks every recorded rating: a whole number from 1 to 5, a known basis, a note, an https source, and Evidence strength never resting on a campaign statement alone. `reviewedBy`, when present, must be a name.

## How to turn it on later

1. Research each candidate in a contest with the process below and record `evaluation.ratings` in `data/2026-11-03/candidates.json`.
2. Have a person review each candidate's ratings against the sources, then record `evaluation.reviewed` (date) and `evaluation.reviewedBy` (name).
3. Run `node tools/validate.mjs` and `npm test`.
4. Set `release.public` to `true`. Contests where any candidate is incomplete or unreviewed keep showing the pending notice.

## Research process (for when the work is done)

- Use the seven factors of the Ballot Weighing Tool: Net benefit, Evidence strength, Safety, Accountability, Feasibility, Fiscal clarity and Outcome clarity, with the office guidance in `candidate-rubric.json`.
- Apply the same rubric to every candidate in a contest.
- Keep a candidate's own claims apart from independently established facts. Each rating names its basis: official record, published proposal, attributable statement, or independent source.
- For each rating, record the source URL, its publication date, the access date, a short excerpt or summary, and the factor it supports.
- Give a written rationale for every rating.
- Never treat missing information as a poor rating. A factor without documented evidence shows Insufficient evidence and is left out of the calculation.
- Show no overall score for a candidate unless every factor the voter weights is documented.
- State on the page that ratings are judgments under a published rubric, not official government assessments.
- Keep candidates in the official ballot order. Never rank, predict or recommend.
