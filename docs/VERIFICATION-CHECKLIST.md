# Verification checklist for local ballot content

Use this for every measure, contest and candidate before setting `status` to `verified`.

## Before you start
- [ ] Work from official sources first: county elections office, city clerk, school or special district, Secretary of State.
- [ ] Note the date you checked. Use it for `lastVerified`.

## Measures
- [ ] Measure letter or number and official ballot question match the county's official measure list.
- [ ] Jurisdiction is correct (county, city, school district or special district) and its id exists in `jurisdictions.json`.
- [ ] Vote threshold (majority, 55%, two-thirds) comes from the measure text or impartial analysis.
- [ ] Plain-English summary, YES and NO match the impartial analysis (county counsel or city attorney), not campaign material.
- [ ] Fiscal figures come from the official fiscal analysis or measure text, with their time period (one-time, yearly, how many years) and who pays.
- [ ] Arguments for and against paraphrase the official ballot arguments and name who signed them. If none was filed, say so.
- [ ] Supporters and opponents come from official arguments or a cited, reliable source.
- [ ] Every source URL loads and supports the sentence it is attached to.
- [ ] Anything you could not confirm is in `gaps`, and the status stays `needs-review` or `incomplete`.

## Candidate contests
- [ ] Office, district and candidate names match the official certified candidate list exactly, in list order.
- [ ] Party preference and ballot designation copied from the certified list.
- [ ] Candidate statement linked only if it appears in an official voter guide.
- [ ] Campaign finance links go to the official filing system (Cal-Access, SOS Power Search, or the local filing officer), with no totals unless dated.
- [ ] No ratings, rankings or endorsements by this guide.

## Before deploying
- [ ] `node tools/extract-statewide.mjs` if `propositions.html` changed.
- [ ] `node tools/validate.mjs` reports 0 errors.
- [ ] Open the site locally (`python3 -m http.server`) and check the county on a phone-width window.
