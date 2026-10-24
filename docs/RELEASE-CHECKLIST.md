# Release checklist

There are two gates.
- **Technical readiness** means the site works, is accessible and protects privacy. Automated tests decide it.
- **Factual readiness** means the content meets the verification rule in `docs/DATA-MODEL.md` for the scope being published.

## Technical gate

From the site folder:

```
npm ci            # installs playwright, axe-core and html-validate (dev only; nothing ships to users)
npm run build     # regenerates statewide.json, the evidence ledger and the docs reports
git status        # commit any regenerated files before testing
npm test
```

`npm test` (`tests/run-all.mjs`) runs these steps in order, runs every step even after a failure, and prints a summary. Each must pass:

| Step | Command | Pass condition |
|---|---|---|
| Generated files are current | `node tests/check-generated.mjs` (also `npm run check`) | every generated file matches its generator |
| Data validation | `node tools/validate.mjs` | 0 errors |
| Validator self-test | `node tests/validator.test.mjs` | every planted error is caught (178 plants on Oct 23, 2026) |
| Scoring regression | `node tests/scoring-regression.mjs` | 0 differences on both fixtures |
| HTML | `html-validate index.html propositions.html` | no errors |
| Browser | `node tests/browser/run.mjs` | 0 failures in the guide, weighing tool and GoatCounter stand-in suites |

The browser suite starts its own local server. It covers:
- axe accessibility checks at phone and desktop widths, in light and dark mode;
- routes, back and forward, focus, keyboard, search and selectors;
- status badge wording and the explanations on Incomplete pages;
- every internal link;
- script injection through routes and search;
- storage and cookies;
- external hosts;
- the Ballot Weighing Tool's own behavior.

Also check by hand at 390 px and in dark mode.

## Factual gate

| Scope | Requirement | State on Oct 23, 2026 |
|---|---|---|
| Statewide propositions | Verified per the rule, or published clearly as Needs review with sources | Audited twice (Oct 22 and 23), all Needs review. Three ratings are flagged for the owner (Prop 44 accountability; Props 37 and 38 evidence strength) |
| Statewide and legislative candidates | Roster checked against the certified list | Matches in every automated reading; no human review yet |
| Local measures | Each county list reconciled; each item's ballot question and threshold from an official document | Not reconciled; 84 of 143 have the ballot question and 87 the threshold |
| Local candidates | Official roster for each contest shown | San Francisco plus part of Alameda (71 contests, 190 candidates in all) |
| Region | The nine counties and 101 cities and towns match the MTC/ABAG sources | Matches; counts are checked by the validator |

## Release decision (October 23, 2026)

**Ready for limited publication.**
- The technical gate passes (log: `audit/logs/2026-10-23-round3.log`).
- Every item shows its status, its sources and what is missing.
- The guide says on every ballot page that a missing item does not mean it is not on the ballot, and points to the county's official sample ballot lookup.
- No item claims to be Verified.
- Independent retests found no blocker after the fixes.

**Not ready for full publication.**
- No record has had the required human review (0 of 2,007 evidence records).
- No county's local list is reconciled.
- Local candidate coverage is partial, and district boundaries are not mapped, so most districts show as "may apply".
- The Alameda ballot questions rest on OCR checked visually, not on a person's review.

## Deploying (needs the owner's authorization)

This does not change the public link.

1. On GitHub, open `supriyarajeev/ballot-tool` and choose **Add file**, then **Upload files**.
2. Upload these, keeping the folder paths:
   - `index.html`, `propositions.html`, `assets/`, `data/`, `docs/`, `tools/`, `tests/`, `audit/`
   - `package.json`, `package-lock.json`, `.htmlvalidate.json`, `.gitignore`, `.nojekyll`, `README.md`

   Do not upload `node_modules/`.
3. Commit to `main`. GitHub Pages republishes https://supriyarajeev.github.io/ballot-tool/ within a few minutes, and the TinyURL still points there.
4. Open the live site. Check the home page, a ballot page, an Incomplete item and the Ballot Weighing Tool on a phone.
