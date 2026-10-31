# Product scope

**California Bay Area Ballot Guide.** Your local and statewide ballot, explained with evidence.

## What it is

The guide is a free, static, nonpartisan website for the November 3, 2026 California General Election. It has two parts:

- **The ballot guide** (`index.html`). Voters pick a county and city and see the statewide propositions, local measures and candidate contests that may be on their ballot. Each item shows its status, its sources and what has not been researched yet.
- **The Ballot Weighing Tool** (`propositions.html`). This is the original standalone tool for the 14 statewide propositions. It uses the Standard Evaluation Framework, with fixed default weights since October 29, 2026: Evidence strength 5, Low risk of side effects 4, Accountability and results 3, Implementation readiness 3, Cost clarity 2. Each card also describes who could gain, who pays and how hard the measure is to change later. Optional custom weights are available. Its behavior is protected by `tests/scoring-regression.mjs`.

## Who it is for

Bay Area voters who want plain-English facts and official sources, and any California voter who wants the statewide propositions explained.

## In scope

- All 58 counties in the jurisdiction inventory for statewide items. The nine Bay Area counties (Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Solano and Sonoma) are the focus of the county and city selector. The Metropolitan Transportation Commission says the region has "101 cities and nine counties", and the Association of Bay Area Governments says "the nine counties and 101 cities and towns" (`data/region.json` keeps their wording, links and retrieval dates). Those are regional facts, not this guide's coverage, which is computed from the data and shown on the site.
- Statewide propositions, statewide contests and Board of Equalization districts.
- Bay Area local measures from each county's official list.
- Congressional, legislative and local candidate contests where an official roster has been read.
- Candidate comparisons for 54 contests (October 31, 2026). Each cell is a candidate's own words, matched to its linked source in a browser, or a plain statement that none was found. See `docs/CANDIDATE-EVALUATION.md`.
- An evidence ledger, a source register and status labels on every item.

## Out of scope

- Recommendations of any kind.
- Scores, rankings or endorsements of candidates.
- Address lookup. The guide never asks for an address. Voters are pointed to their county's official tools.
- Accounts, backends, databases, analytics beyond the existing page counter, and AI services at run time.
- Election results.

## Principles

1. Official sources come first. Every fact links to a source, and a link alone does not count as support.
2. The status labels are fixed: Verified; Needs review; Incomplete (required info or evidence is missing); Source unavailable; Not yet researched; Not applicable; Archived; Superseded. Nothing is Verified without meeting the rule in `docs/DATA-MODEL.md`.
3. Missing information is labeled as missing. It is never shown as a zero or as "none".
4. Arguments are attributed to the side that makes them.
5. Privacy: county and city choices stay in the page address after the `#` sign, and proposition answers stay in the browser.

## Name check

A web search on Oct 22, 2026 found no exact use of "California Bay Area Ballot Guide". Similar names exist:

- the KQED voter guide, which calls itself "the Bay Area's most comprehensive voter guide";
- the NBC Bay Area 2026 voter guide;
- SPUR's voter guide;
- a 2020 United Way Bay Area guide.

This is not a legal clearance. Trademark clearance has not been done.
