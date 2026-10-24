# Fix plan and file ownership (integration lead, Oct 23, 2026)

All findings are in audit/reports/*.md. Each fix agent edits ONLY the files it owns. Anything else goes in its summary as a request to the integration lead. Do not commit; the integration lead reviews diffs and commits. Do not edit audit/reports/*.md.

| Agent | Owns (may edit) |
|---|---|
| Fix A, geography and coverage data | data/jurisdictions.json, data/region.json (new), docs/JURISDICTION-INVENTORY notes only through tools? NO: docs are generated; A writes audit/2026-10-23/fix-A-summary.md |
| Fix B, frontend | index.html, assets/guide.js, assets/guide.css, propositions.html (CSS, noscript, analytics tag only; do NOT edit the PROPS data or scoring code) |
| Fix C, validation and tests | tools/validate.mjs, tools/report.mjs, tools/build-ledger.mjs, tests/**, package.json, .htmlvalidate.json, README.md (setup section only) |
| Fix D, evidence | data/2026-11-03/local-measures.json, data/2026-11-03/contests.json, data/2026-11-03/candidates.json, data/evidence-claims.json, data/statewide-review.json, data/source-access.json, audit/2026-10-23/statewide_corrections_2.py (new, NOT applied), docs/INDEPENDENT-REVIEW.md is NOT D's; D writes audit/2026-10-23/fix-D-summary.md |

The integration lead applies statewide text corrections to propositions.html after Fix B finishes, then regenerates statewide.json, the ledger and docs.

## Data contract shared by A, B and C (A creates the data, B renders it, C validates it)

1. `data/region.json` (new):
```json
{ "schemaVersion": 1, "id": "bay-area", "name": "San Francisco Bay Area",
  "counties": ["ca-alameda","ca-contra-costa","ca-marin","ca-napa","ca-sf","ca-san-mateo","ca-santa-clara","ca-solano","ca-sonoma"],
  "countyCount": 9, "municipalityCount": 101,
  "facts": [ {"text": "...verbatim...", "url": "https://mtc.ca.gov/about-mtc/what-mtc", "publisher": "Metropolitan Transportation Commission", "retrieved": "2026-10-23"}, ... ],
  "note": "Regional facts describe the region. They are not a measure of this guide's coverage." }
```
   Verbatim statements already captured (Oct 23, 2026):
   - MTC, https://mtc.ca.gov/about-mtc/what-mtc : "The Bay Area is home to 101 cities and nine counties, each with its own transportation and housing needs."
   - ABAG, https://abag.ca.gov/about-abag/what-we-do/history : "the nine counties and 101 cities and towns of the San Francisco Bay region."
   - Bay Area census site, https://census.bayareametro.gov/cities-counties : lists the cities of each county (14, 19, 11, 5, 1, 20, 15, 7, 9) and one "Unincorporated <County>" entry for every county except San Francisco.
2. Each of the 9 Bay Area county records gets:
   - `cityInventory`: `{ "status": "complete", "count": <n>, "source": "https://census.bayareametro.gov/cities-counties", "checked": "2026-10-23", "note": "Matches the regional list of incorporated cities and towns." }` ONLY where the data matches the official list (the geography audit found all 9 match). Other 49 counties: `{ "status": "not-collected" }`.
   - `unincorporated`: `{ "listed": true|false, "source": "<url>" }` (true where the census site lists "Unincorporated <County>"; false for San Francisco).
   - San Francisco also gets `"consolidatedCity": "ca-sf-city"` (consolidated city and county; every SF voter is in the city).
3. City records get `"municipalityType": "city" | "town"` ONLY where an official source says so; otherwise omit (do not guess).
4. Coverage text must not contradict data (see VAL-11, VAL-16).

## UI requirements for Fix B (from the owner's brief)
- Home: compact Bay Area context near Find My Ballot. It says the region has 9 counties and 101 cities and towns, citing MTC/ABAG, with a visible source link. It says the guide's local coverage is growing county by county. It keeps regional facts separate from coverage. It shows a data-driven coverage indicator (counts computed from data, never hardcoded).
- Find: the county control is labeled "Select a Bay Area county", with the subtitle "Choose one of the nine counties in the San Francisco Bay Area." It shows only the 9 counties from region.json. Remove the "other California county" dropdown from this flow.
- City control is labeled "Select a city or town".
  - It shows only cities of the selected county.
  - If cityInventory is not complete, disclose it.
  - If no cities are collected, show: "City and town coverage for this county has not been fully collected yet. Check the official county election website for your complete ballot." (adapted).
  - "Unincorporated area of <County>" appears only if unincorporated.listed is true, and is separate from "I'm not sure of my city".
  - For a county with consolidatedCity (SF), select it automatically and show no unincorporated option. Its measures must show on #/ballot/ca-sf.
- Changing the county resets the city. Direct URLs and back/forward restore only valid selections. An invalid county or city id, or a city from another county, shows a clear message and a way back (no false headings).
- Outside the Bay Area: a separate statewide section/route says "Statewide California propositions are available here. Local city and district coverage outside the Bay Area is still being developed." with links to the statewide propositions. Existing #/ballot/<non-bay county> links keep working (statewide items + that message).
- District limitations: an accessible note on find and ballot pages says school, community college, special and legislative districts may not match city or county lines, with the official sample-ballot lookup link. Never claim county/city/ZIP identifies every contest.
- Fix the frontend and privacy findings: FE-01 to FE-12, GEO-01, GEO-05, GEO-06, GEO-08, PRD-01, PRD-02 (as far as possible without new services), PRD-03, PRD-07, PRD-08, PRD-09, PRD-11.
- Preserve the design, colors, typography, routes and the Ballot Weighing Tool's behavior and scoring (tests/scoring-regression.mjs must still report 0 differences).
