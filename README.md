# California Bay Area Ballot Guide

Your local and statewide ballot, explained with evidence.

This is a plain-English, nonpartisan guide to the November 3, 2026 California ballot, with a Bay Area focus. It is published with GitHub Pages at https://supriyarajeev.github.io/ballot-tool/

## What is in the repository

- `index.html` is the guide. You find your ballot by county and city, then read each measure and candidate contest with its status and sources.
- `propositions.html` is the **Ballot Weighing Tool**. It covers the 14 statewide propositions with the Standard Evaluation Framework and optional weights.
- `assets/` holds the guide's CSS and JavaScript. There is no framework, no build step and no backend.
- `data/` holds every election, jurisdiction, measure, contest and candidate as JSON. It also holds the source register (`sources.json`) and the evidence ledger (`evidence.json`). See `docs/DATA-MODEL.md`.
- `tools/` holds five scripts:
  - `validate.mjs` checks the data.
  - `build-ledger.mjs` builds the source register and the evidence ledger.
  - `report.mjs` writes the audit docs.
  - `extract-statewide.mjs` copies the proposition facts from `propositions.html` into the data.
  - `build-map.mjs` made `data/bay-map.json` once from U.S. Census Bureau county outlines. It is not part of the normal build, and the comment at its top says how to rerun it.
- `tests/` holds the scoring regression test and the browser tests.
- `docs/` holds the scope, independent review, inventory, coverage, source register, evidence ledger, measure and candidate audits, data model, verification checklist and release checklist.
- `audit/` keeps raw audit outputs and the scripts that applied them.

## Release reports (October 24, 2026)

- `CHANGELOG.md`: what changed.
- `UPLOAD-INSTRUCTIONS.md`: how to upload to GitHub Pages.
- `audit/2026-10-24/FINAL-QA-REPORT.md`: findings, tests run, remaining issues and the quality score.
- `audit/2026-10-24/REGIONAL-STATS.md`: sources and method for the region at a glance.
- `audit/2026-10-24/PHOTO-AUDIT.md`: candidate photo coverage and rights. Regenerate it with `python3 audit/2026-10-24/photo_audit.py`.
- `audit/2026-10-24/PROPOSITION-CHANGELOG.md`: proposition source checks and rating changes.
- `audit/2026-10-24/SCORING-REPORT.md`: the scoring formula, percentages and all 14 results.
- `audit/2026-10-24/OWNER-REVIEW.md`: items that need a person.
- `audit/2026-10-24/COVERAGE-MATRIX.md`: local contests by county, with sources and gaps. Regenerate with `python3 audit/2026-10-24/coverage_matrix.py`.
- `audit/2026-10-24/LIMITATIONS.md`: known limitations.
- `audit/2026-10-24/local-contests/`: the county research files. `apply_local_contests.py`, `apply_name_corrections.py` and `update_coverage_notes.py` merged them into `data/`.

Tests: `npm test` runs everything. Single steps:
- `node tests/weights.test.mjs`: percentage arithmetic.
- `node tests/scoring-regression.mjs`: scoring regression.
- `node tests/validator.test.mjs`: validator self-test.
- `PORT=8799 node tests/browser/run.mjs guide`: the guide browser tests (`weighing` runs the Weighing Tool tests).

## Setup and testing

Needs Node.js 18 or later. The test tools are dev-only; the site itself has no dependencies.

```
npm ci                                   # once: html-validate, axe-core, Playwright
npx playwright install --with-deps chromium   # once on a clean machine: the browser the tests drive
```

On a machine where browsers are already installed in a shared folder, point Playwright at it instead of downloading, for example `export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` (and `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` so `npm ci` does not try to download one). Without either, the browser tests stop with `browserType.launch: Executable doesn't exist`.

Commands:

```
npm run build       # writes the generated files: data/2026-11-03/statewide.json (from propositions.html),
                    # data/sources.json and data/evidence.json (the ledger), and the reports in docs/
npm test            # runs every check below and prints a summary; it never writes tracked files
npm run check       # regenerates the generated files into a temporary folder and fails if they differ from the committed ones
npm run validate    # data rules (tools/validate.mjs)
npm run test:validator   # validator self-test: plants one defect at a time and expects the matching error
npm run test:scoring     # Ballot Weighing Tool scoring, reasons, limited flags, saved-weight clamp, sliders
npm run test:html        # static HTML of index.html and propositions.html
npm run test:browser     # guide, weighing tool and GoatCounter stand-in suites (starts a local server)
```

- After editing data, `propositions.html` or `data/statewide-review.json`, run `npm run build`, then `npm test`, and commit the regenerated files with the change.
- A change in a contest's candidate order fails validation until it is recorded on purpose with `npm run fixtures:candidate-order`, after checking the official source.
- `node tests/scoring-regression.mjs path/to/propositions.html` compares another copy of the tool with the baseline fixtures.
- `node tests/browser/run.mjs guide` (or `weighing`, `goatcounter`) runs one browser suite. `PORT=9000` changes the local server port (default 8765).
- `LINKS_OUT=links.txt node tests/browser/run.mjs weighing` writes the weighing tool's source links to a file; nothing is written by default.

### How long the tests take

Measured on October 23, 2026 on a 2-CPU Linux machine with Node.js 22.22.0 (the same steps also pass on Node.js 18.20.8):

| Step | Time |
|---|---|
| `npm run check`, `npm run validate`, `npm run test:scoring`, `npm run test:html` | under 1 second each |
| `npm run test:validator` | about 20 to 30 seconds (200 sandboxes) |
| `npm run test:browser` | about 3 minutes |
| `npm test` (all of the above) | about 3 to 4 minutes (3 min 31 s on October 24, 2026) |

The validator self-test copies the data into a fresh temporary folder for every plant and runs the validator there. It runs `VALIDATOR_TEST_JOBS` plants at once (default: the number of CPUs, at most 8) and prints progress every 25 plants. If your tool or CI stops commands after a fixed time (for example two minutes), run the steps one at a time instead of `npm test`, or raise the limit. A stopped run is not a pass.

See `docs/RELEASE-CHECKLIST.md` for what each step checks and for the release decision. `docs/INDEPENDENT-REVIEW.md` records the October 22 and 23, 2026 reviews and the beta-release changes.

The guide never recommends how to vote and never scores or ranks candidates. Nothing is marked Verified until a person has reviewed it. Items that are not fully researched are labeled as such, never presented as complete.
