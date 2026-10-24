# California Bay Area Ballot Guide

Your local and statewide ballot, explained with evidence.

This is a plain-English, nonpartisan guide to the November 3, 2026 California ballot, with a Bay Area focus. It is published with GitHub Pages at https://supriyarajeev.github.io/ballot-tool/

## What is in the repository

- `index.html` is the guide. You find your ballot by county and city, then read each measure and candidate contest with its status and sources.
- `propositions.html` is the **Ballot Weighing Tool**. It covers the 14 statewide propositions with the Standard Evaluation Framework and optional weights.
- `assets/` holds the guide's CSS and JavaScript. There is no framework, no build step and no backend.
- `data/` holds every election, jurisdiction, measure, contest and candidate as JSON. It also holds the source register (`sources.json`) and the evidence ledger (`evidence.json`). See `docs/DATA-MODEL.md`.
- `tools/` holds four scripts:
  - `validate.mjs` checks the data.
  - `build-ledger.mjs` builds the source register and the evidence ledger.
  - `report.mjs` writes the audit docs.
  - `extract-statewide.mjs` copies the proposition facts from `propositions.html` into the data.
- `tests/` holds the scoring regression test and the browser tests.
- `docs/` holds the scope, independent review, inventory, coverage, source register, evidence ledger, measure and candidate audits, data model, verification checklist and release checklist.
- `audit/` keeps raw audit outputs and the scripts that applied them.

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

See `docs/RELEASE-CHECKLIST.md` for what each step checks and for the release decision. `docs/INDEPENDENT-REVIEW.md` records the October 22, 2026 audit.

The guide never recommends how to vote and never scores or ranks candidates. Nothing is marked Verified until a person has reviewed it. Items that are not fully researched are labeled as such, never presented as complete.
