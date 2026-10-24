# Test report (October 24, 2026 release, final run)

Commands are the project's own (`package.json`, `tests/run-all.mjs`). The full log is `audit/logs/2026-10-24-final-npm-test.log`; `npm test` took about 4 min 15 s (browser suites 215 s) on a 2-CPU machine with Node.js 22.22.0.

| Test | Command | Result |
|---|---|---|
| Generated files match their generators | `node tests/check-generated.mjs` | **Passed** (9 files) |
| Data validation (schemas, ids, duplicates, sources, dates, evidence backing, region figures, key dates, map, photo records) | `node tools/validate.mjs` | **Passed**: 0 errors, 0 warnings, 666 ids |
| Validator self-test (each rule must catch a planted defect) | `node tests/validator.test.mjs` | **Passed**: 207 of 207 (206 plants plus the baseline) |
| Scoring regression against the original tool (fixtures captured from the original commit 0ddb37d) | `node tests/scoring-regression.mjs` | **Passed**: 1,008 scoring results, 0 differences. Reasons, limited flags, quality words, saved state and sliders: 0 differences |
| Percentage arithmetic (shares, boundaries, missing ratings, rounding, points sum, agreement with `quality()` in 168 cases) | `node tests/weights.test.mjs` | **Passed**: 25 of 25 |
| Static HTML | `html-validate index.html propositions.html` | **Passed** |
| Guide in Chromium | `node tests/browser/run.mjs guide` | **Passed**: 494 of 494 (per-candidate photos, disclaimer, candidate evaluation mode) |
| Ballot Weighing Tool in Chromium | `node tests/browser/run.mjs weighing` | **Passed**: 268 of 268 (adds percentage shares, results, calculation table, saved state) |
| Visitor counter stand-in | `node tests/browser/run.mjs goatcounter` | **Passed**: 124 of 124 |

## What the browser suites cover

- **Guide.**
  - Every route at 360, 768 and 1280 px, in light and dark mode.
  - axe accessibility checks.
  - Keyboard focus, the skip link, back and forward, and deep links.
  - The county map, key dates, coverage bars and the "Show sources" button.
  - Status labels, beta notice and About page.
  - Official links in "Before you vote", the statewide page and the contests page.
  - Candidate photo rules:
    - photos appear only where every candidate in the contest has one (SF Public Defender);
    - placeholders appear for Secretary of State, Insurance Commissioner, U.S. House District 11, Controller and Governor;
    - every image has alt text and width and height attributes;
    - credits link to the source and the license;
    - candidate order is unchanged.
  - Rendered HTML validity, script injection, storage and external hosts.
- **Weighing tool.** All controls, presets, custom weights, reset and clear, saved state after reload, and lean labels.
- **Visitor counter.** The fixed path and title only. No route, county or answers are sent.

## Independent checks this round

- **Photos and the optional corrections.** An independent agent reviewed both (`audit/reports/photos-and-optional-review.md`).
  - It could not open the Wikimedia Commons file pages from its tools, so the photo licenses were checked once only, by the integration lead, through the Commons records in the desktop browser.
  - Its legal finding led to withdrawing four photos.
  - Its other findings were fixed: credit wording, license links, validator coverage, the League of Women Voters source, a review gap reopened, and quotes added to the gap log.
  - Those fixes were checked by the test suite, not by another agent.
- **Visual upgrade.** An independent functional and accessibility test, run earlier (`audit/reports/ux-upgrade-qa.md`), covered the visual upgrade.

## Not run, or only partly

- **External links.** No automated check of every external link was run, because this environment blocks most sites.
  - The official links added in this release were opened through a fetch tool, except registration status and early voting, which could not be reached from here.
  - Also unchecked: the LAO PDFs for Props 38 and 39, the Prop 2 budget summary and the Prop 3 SPUR page.
- **Real devices.** No test was run on real phones or tablets; layouts were tested in Chromium at phone, tablet and desktop widths.
- **Real visitor counter.** The live GoatCounter script was not run; a stand-in was used.
- **Page speed.** Not measured. The new candidate photo is a 17 KB file. The guide loads its stylesheet, its script and 8 data files.
