# Retest 1: geography and frontend findings after the fix commit

Date: 2026-10-23. Auditor: Retest 1 (independent; did not write any fix). Code under test: commit `7b9b06e` (working tree clean, `git status` empty before and after). Baseline: tag `baseline-2026-10-23`. Rules: audit/reports/QA-BRIEF.md. I edited no file in the repository except this report, and committed nothing.

## Method

- Server: `python3 -m http.server 8831` from <repo>. Browser: Playwright 1.56.0 Chromium from <repo>/node_modules (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`), axe-core 4.10.2. Every request to another host was answered with an empty body. Only fonts.googleapis.com and gc.zgo.at were requested.
- Scripts and raw output are in /tmp/qa-retest1/:
  - `retest.cjs` → `retest.out`: reruns the old reproductions and runs the end-to-end Find flow.
  - `matrix.cjs` → `matrix.out`: 18 routes × 360/390/768/1280 × light/dark, with every `<details>` opened. Screenshots are in `shots/`.
  - `mut.cjs`: the city-list disclosures with altered data, and a region.json 404.
  - `mendo.cjs`: local items outside the Bay Area.
  - `fp.cjs`: screenshots of the region card and the SF form, plus a keyboard check.
  - `census.json`: the regional city list I fetched.
- Expected values were computed from data/*.json with my own Python code, not taken from the site's code. I did not use the fix agents' claims (fix-A-summary.md, fix-B-summary.md) as evidence.
- Web checks used WebFetch only. Its quotes are a reader model's output, and it caps quotes at about 125 characters.
- For context only, `npm test` exited 0: validator 0 errors, scoring 0 differences, guide browser 304/0, weighing 224/0, goatcounter 124/0. A passing suite is not evidence that a fact is verified.

## Sources fetched (WebFetch, 2026-10-23)

| URL | Returned (verbatim from tool) |
|---|---|
| https://census.bayareametro.gov/cities-counties | Per-county lists. Alameda 14, Contra Costa 19, Marin 11, Napa 5, San Francisco 1 ("San Francisco"), San Mateo 20, Santa Clara 15, Solano 7, Sonoma 9, each plus "Unincorporated <County> County", except San Francisco. Full names are saved in /tmp/qa-retest1/census.json. |
| https://mtc.ca.gov/about-mtc/what-mtc | "The Bay Area is home to 101 cities and nine counties, each with its own transportation and housing needs." Counties: "Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Solano, Sonoma" |
| https://abag.ca.gov/about-abag/what-we-do/history | "for the nine counties and 101 cities and towns". When asked for the words that follow: "of the San Francisco Bay region." When asked for the words that precede: "regional planning agency and council of governments for" |

The site's quoted text, compared with these:

- MTC fact in data/region.json and on the page: identical to the MTC sentence.
- ABAG fact, "the nine counties and 101 cities and towns of the San Francisco Bay region.": consistent with the two ABAG fragments taken together. The site shows it as a lowercase fragment of a longer sentence, which is accurate but not a full sentence.

These checks confirm that the text matches. I am not marking the regional facts Verified.

## Old findings: status

| Old id | Status | Evidence (retest.out unless noted) |
|---|---|---|
| GEO-01 | **Fixed** | Find → San Francisco → submit gives `/ballot/ca-sf`, with h1 "Ballot choices for City and County of San Francisco". `#/ballot/ca-sf`, `/ca-sf-city` and `/not-sure` each show `city => 10 items`. The data has 10 measures with `jurisdiction: ca-sf-city`, and the rendered titles match them. The county group says "Listed under City and town measures", not "None on the official list". SF options are `[["ca-sf-city","City and County of San Francisco",selected]]`, with no unincorporated option. |
| GEO-02 | **Fixed** | `#/ballot/ca-san-mateo` and `/ca-san-mateo-daly-city` now list "U.S. Representative, District 15" and "Member of the State Assembly, District 19". `ca-cd-15` and `ca-ad-19` have `counties: [ca-sf, ca-san-mateo]` and `countiesKnown: false`. I did not re-fetch the SOS Offices and Subdivisions PDF that the other added counties depend on. |
| GEO-03 | **Partly fixed** | Non-Bay counties now see their BOE contest: Humboldt shows District 2 and Los Angeles shows District 3, both with no "may apply". Fresno, Alpine, Yolo, San Diego and San Bernardino show D1 or D4. But `ca-boe-1` and `ca-boe-4` have `countiesKnown: false`, so every D1 and D4 county shows "May apply, check your sample ballot", including counties wholly inside the district. Solano regressed: at baseline `ca-boe-1` was `countiesKnown: true, counties: [ca-solano]`. See R1-02. |
| GEO-04 | **Fixed** | `#/ballot/ca-yolo` school group: `1 item`, "Winters Joint Unified School District · May apply". The record has `counties: ["ca-solano","ca-yolo"]`. The row title is "Title not recorded yet", which is a data gap that was already there at baseline. |
| GEO-05 | **Fixed** | All of these give h1 "City or town not found" with links to `#/ballot/<county>` and `#/find?county=<county>`, and no county items are rendered: `#/ballot/ca-santa-clara/ca-alameda-fremont`, `ca-alameda/ca-sf-city`, `ca-alameda/ca-alameda-oakland-council-district-2`, `ca-alameda/bogus-city`, `ca-alameda/ca-alameda`, `ca-alameda/ca-alameda-sd-oakland-unified-school-district`, `ca-alameda/constructor`. `#/find?county=ca-alameda-fremont`-style params show the "Please choose again" notice, and the form stays disabled (`go: true` = disabled). |
| GEO-06 | **Fixed** | 8 counties show "Unincorporated area of <County>" separately from "I'm not sure of my city or town". SF does not. `#/ballot/ca-alameda/unincorporated` gives h1 "Ballot choices for unincorporated Alameda County", and the city group reads "City and town measures do not apply in unincorporated areas. County and district items may still apply." `#/ballot/ca-sf/unincorporated` gives "City or town not found". |
| GEO-07 | **Not fixed** | `#/ballot/ca-alameda/ca-alameda-fremont` school rows are still "San Lorenzo Unified School District · May apply" and "Sunol Glen Unified School District · May apply". Fix A says this is out of scope, since it needs boundary sources. |
| GEO-08 | **Fixed (wording only)** | The labels now read "Select a city or town", "City and town measures" and "I'm not sure of my city or town". No `municipalityType` field was added: the data has 0 records with it. The original recommendation offered either option. |
| GEO-09 | **Partly fixed** | Fixed: the hard-coded cross-check sentence. SF now reads "4 of 4 … could be read. Those pages are a sample, so this county's list is not marked as fully reconciled." Fixed: `ca-sf.citySource` is now the census SF page. Fixed: `ca-sf.inventory.reconciliation.summary` no longer contradicts itself. Not changed: the `ca-sf-city` id and name "City and County of San Francisco" (the census list says "San Francisco"). Not changed: `ca-solano.citySource` is still the registrar home page and `ca-sonoma.citySource` is still the GIS layer index. The new `cityInventory.source` covers the city sets. |
| FE-01 | **Fixed** | propositions.html passes at 360, 390, 768 and 1280, light and dark, with every `<details>` open (rubric included). There is no page overflow (for example `closed 360>360 open 360>360`), axe reports 0 violations, and there are 0 console errors (matrix.out). The baseline result was 504>360. |
| FE-02 | **Partly fixed** | BOE-2 is no longer counted. Marin, Napa, San Mateo, Santa Clara, Solano and Sonoma now say "local candidate contests not collected yet". Contra Costa still says "13 local measures listed · 2 local contests listed" on home and on `#/browse`. Those 2 are EBMUD Wards 3 and 7, whose records are parented to Alameda and list Contra Costa in `counties`. Yet Contra Costa's own page says "Local candidate contests. not collected yet." and "County, city, school and district contests for Contra Costa County have not been collected yet". `inventory.contests` is "not-collected". The contradiction the finding described for Contra Costa remains. It now also feeds the new indicator (R1-01). |
| FE-03 | **Fixed** | `#/ballot/ca-marin/ca-alameda-oakland` gives h1 "City or town not found" and the text "That city or town is not listed in Marin County in this guide. No ballot choices are shown for it". No false heading is shown. |
| FE-04 | **Fixed** (one gap, R1-05) | `#/ballot/ca-alameda/bogus-city` and `/ca-alameda-oakland/extra` give "City or town not found". `#/find?county=bogus`, `ca-alameda-oakland` and `constructor` show the notice, with the city select and submit disabled. `#/find?county=ca-fresno` explains that Fresno is not a Bay county and links to its statewide page. `#/find?county=ca-alameda&city=bogus` shows the notice and leaves the city blank. Remaining gap: `#/find?city=ca-alameda-berkeley` with no county is ignored silently. |
| FE-05 | **Fixed** | Home region card: "The nine counties are Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Solano and Sonoma. Elsewhere in California, this guide covers statewide items only so far." The sentence is built from `counties()`. It is visible without opening anything (shots/regioncard-360.png). For the "statewide only" part, see R1-03. |
| FE-06 | **Fixed** | SF options: `ca-sf-city` only, preselected, with the help text "San Francisco is a consolidated city and county … It is selected for you." (shots/find-sf-360.png). |
| FE-07 | **Fixed** | `grep -n "2026\|October" assets/guide.js` finds nothing outside the header comment. Audit dates come from `statewideDate()`. The `#/contests` intro is generated, and its places match the contest groups ("Alameda County 34 contests", "San Francisco (City and County) 11 contests"). |
| FE-08 | **Fixed** | `#/item/2026-11-03.ca-sf-city.a`: "Not yet researched" occurs 0 times. Empty fields read "Not collected yet. See "What is missing" above." The badge is still exactly "Incomplete (required info or evidence is missing)". |
| FE-09 | **Fixed** | The UI lists 4 gaps for SF Prop A, with no duplicates. The data is also clean: 0 measures have more than one "Ballot question…" gap (baseline: 67). Running guide.js's `dedupeGaps` over every measure, contest and candidate record drops 0 entries, so it hides nothing distinct. |
| FE-10 | **Fixed** | `main aria-live` is `null`. `#q-status` is still `role=status aria-live=polite`. Not tested with a real screen reader. |
| FE-11 | **Fixed** | On Berkeley, "Change place" links to `#/find?county=ca-alameda&city=ca-alameda-berkeley`. Following it, Alameda is checked and Berkeley is selected. Unincorporated is kept too: `#/find?county=ca-solano&city=unincorporated`. |
| FE-12 | **Partly fixed** | `ca-alpine` and `ca-mariposa` `electionsUrl` are still `http://`. They are now visibly labeled "Alpine County elections office (http, not a secure link)". The https availability was not checked. |

## UI requirements (FIX-PLAN "UI requirements"), end to end

| Requirement | Result | Evidence |
|---|---|---|
| County label and subtitle | Pass | legend `Select a Bay Area county`; `#county-sub` `Choose one of the nine counties in the San Francisco Bay Area.` |
| City label | Pass | `Select a city or town` |
| Only 9 counties | Pass | 9 radios, equal to `region.counties`. `#other` is absent, and the page has only one select (`city`). |
| City lists | Pass | For each county, the options equal the data's `type: city, parent = county` set, and the names equal the census list exactly: 14/19/11/5/20/15/7/9. SF is named "City and County of San Francisco"; the census list says "San Francisco". The help text "Lists all N incorporated cities and towns … matching the Bay Area regional list (checked October 23, 2026)" links to the census list. |
| Incomplete or uncollected city list disclosure | Pass (altered data) | Marin with `status: not-collected`, or Napa with a count mismatch, shows "City and town coverage for this county is not complete yet …" plus the elections link. Sonoma with 0 cities shows the exact required message. |
| Unincorporated options | Pass | Present for the 8 counties with `unincorporated.listed: true`, absent for SF, and separate from "not sure". |
| San Francisco | Pass | Selected automatically. `#/ballot/ca-sf` shows the 10 measures. A `consolidatedCity` set to a city in another county (altered data) is ignored, and the normal list is shown. |
| County change resets city | Pass | Alameda + Oakland, then Marin, gives `""`. SF then Napa gives `""`. The URL updates to `#/find?county=<new>`. |
| Invalid and mismatched ids | Pass | 22 ballot URLs and 14 find URLs tested (retest.out lines 147-182). No false headings. `#/ballot/ca-alameda/%E0%A4%A` gives "That page address is not valid." |
| Back and forward | Pass | Find(Alameda, Berkeley) → ballot → Back restores Alameda and Berkeley → Forward returns to the ballot. SF Back restores SF. Find uses `replaceState`, so Back from a county change skips the intermediate choices, which is by design. |
| Regional facts and links | Pass, with R1-04 | "The San Francisco Bay Area has 9 counties and 101 cities and towns, according to the Metropolitan Transportation Commission and the Association of Bay Area Governments." Both are visible links (new tab) to the exact fetched URLs. The quotes match the sources (see above). "Regional facts describe the region. They are not a measure of this guide's coverage." keeps them separate. |
| Coverage indicator equals my own counts | Pass on arithmetic, R1-01 on meaning | Page: 9/9 counties with local measures, 9/9 complete lists, 101 cities and towns, 3/9 counties with local contests. My Python: withMeasures 9, completeLists 9, cities 101, withContests 3 (Alameda 34, Contra Costa 2, SF 11). The numbers react to the data: with Marin set to not-collected, the page shows 8/9. |
| Outside-Bay message | Pass | `#/statewide`: exact message, 14 rows, 49 county links. `#/ballot/ca-fresno` (and LA, Humboldt, Yolo, San Diego, Alpine) show `[data-statewide-note]` with the exact message, and Change place goes to `#/statewide`. |
| District limitations note | Pass | `role="note"` on Find, `#/statewide` and every ballot page. It reads "School, community college, special and legislative districts may not match city or county lines. A county and a city or town cannot identify every contest on your ballot, and neither can a ZIP code." Find links to the SOS county offices and switches to the county's lookup when a county is picked. |
| Widths, themes, axe | Pass | 144 of 144 runs pass: 18 routes × 360/390/768/1280 × light/dark, with every `<details>` open. That means no horizontal overflow (closed or open), 0 axe violations and 0 console errors (matrix.out). |
| Console errors | Pass | 0 page errors. The only console error was the browser refusing the GoatCounter script because the test answered it with an empty body. That is the integrity check working, not a site defect. |
| region.json missing | Pass | Home falls back to "The Bay Area counties in this guide are listed below.", Find still has 9 counties, and there are no errors. |
| Keyboard | Pass (spot check) | Arrow keys move between county radios and fill the city list. Tab then reaches the statewide link. |

## New findings

### R1-01 · low · New coverage indicator and county rows count Contra Costa as having local contests while Contra Costa says none are collected
- Affected: `assets/guide.js` `countsFor()` (line 258) and `regionCard()` (line 281). Records `ca-ebmud-ward-3` and `ca-ebmud-ward-7` (parent `ca-alameda`, `counties: [ca-alameda, ca-contra-costa]`). `ca-contra-costa.inventory.contests` is "not-collected".
- Reproduction: open `#/` and read the indicator, then expand "Coverage by Bay Area county". Then open `#/ballot/ca-contra-costa` and expand "What has been checked".
- Evidence: the indicator reads `3 / 9 counties with local candidate contests listed` (screen reader: "3 of 9 Bay Area counties have local candidate contests listed"). The home row reads `Contra Costa County Measure list only 13 local measures listed · 2 local contests listed`. The Contra Costa page reads `Local candidate contests. not collected yet.` and `County, city, school and district contests for Contra Costa County have not been collected yet`. My count using the county's own `inventory.contests` gives 2/9 (Alameda, SF).
- Expected: the coverage claims on home and on the county page agree.
- Recommended correction: either base "counties with local candidate contests" on `inventory.contests !== "not-collected"`, or change Contra Costa's inventory and notes to say that two cross-county EBMUD contests are listed. This is the remainder of FE-02.
- Blocks release: no.

### R1-02 · low · Regression: Board of Equalization District 1 and 4 show "May apply" in counties wholly inside the district (Solano included)
- Affected: `data/jurisdictions.json` `ca-boe-1` and `ca-boe-4` (`countiesKnown: false`). `assets/guide.js` `applies()` line 179.
- Reproduction: open `#/ballot/ca-solano`, then Candidate elections. Repeat for `#/ballot/ca-fresno`, `ca-yolo`, `ca-alpine` and `ca-san-diego`.
- Evidence: `ca-solano candidates ["State Board of Equalization, District 1"] ["Board of Equalization District 1 · May apply, check your sample ballot"]`. Fresno, Yolo, Alpine and San Diego show the same. At baseline, `ca-boe-1` was `countiesKnown: True ['ca-solano']`, so Solano showed it as applying. Per Fix A's own SOS reading, only San Bernardino is split between D1 and D4.
- Expected: "May apply" only in San Bernardino. Every voter in the other D1 and D4 counties gets the contest.
- Recommended correction: add a split-county marker (for example `partialCounties: ["ca-san-bernardino"]`) and handle it in `applies()`, then restore `countiesKnown: true`. Fix A requested this change.
- Blocks release: no.

### R1-03 · low · "Elsewhere in California, this guide covers statewide items only so far" is contradicted by local items now shown outside the Bay Area
- Affected: `assets/guide.js` `regionCard()` line 310.
- Reproduction: open `#/ballot/ca-yolo` and `#/ballot/ca-mendocino`.
- Evidence: Yolo shows `school, 1 item, Winters Joint Unified School District · May apply`. This item is new, from the GEO-04 fix. Mendocino shows `Sonoma County Junior College District` and `Coast Life Support District`.
- Expected: wording that allows for cross-county districts, for example "Elsewhere in California, this guide covers statewide items, plus a few districts that extend from the Bay Area."
- Blocks release: no.

### R1-04 · low · The home sentence attributes "101 cities and towns" to MTC, which says "101 cities"
- Affected: `regionCard()` line 287 and `data/region.json` facts.
- Evidence: the page says "has 9 counties and 101 cities and towns, according to the Metropolitan Transportation Commission and the Association of Bay Area Governments." MTC's text (fetched) is "The Bay Area is home to 101 cities and nine counties". Only ABAG says "cities and towns".
- Expected: each publisher's wording is attributed accurately. For example, "9 counties and 101 cities and towns (ABAG; MTC counts the same 101 as cities)", or attribute "cities and towns" to ABAG alone. The numbers agree, so this is about precise wording only.
- Blocks release: no.

### R1-05 · low · Two Find notices are imprecise
- Affected: `viewFind()` lines 357-368.
- Evidence:
  - `#/find?county=ca-sf&city=unincorporated` shows "That city or town is not listed in San Francisco (City and County) in this guide." The ballot route for the same case says "has no unincorporated area listed".
  - `#/find?city=ca-alameda-berkeley` with no county shows no notice, and the city is dropped silently.
- Expected: consistent wording for the unincorporated case, and a notice when a city param arrives without a county.
- Blocks release: no.

## Summary

| Old id status | Count | Ids |
|---|---|---|
| Fixed | 16 | GEO-01, GEO-02, GEO-04, GEO-05, GEO-06, GEO-08 (wording), FE-01, FE-03, FE-04, FE-05, FE-06, FE-07, FE-08, FE-09, FE-10, FE-11 |
| Partly fixed | 4 | GEO-03, GEO-09, FE-02, FE-12 |
| Not fixed | 1 | GEO-07 |
| Regressed | 0 old ids. One behavior regressed (R1-02, from the GEO-03 data change). | |

| New finding severity | Count | Ids | Blocks release |
|---|---|---|---|
| Blocker | 0 | | |
| High | 0 | | |
| Medium | 0 | | |
| Low | 5 | R1-01, R1-02, R1-03, R1-04, R1-05 | No |

## Not checked, and why
- **SOS 2026 Offices and Subdivisions PDF and the BOE district pages.** These back the new county lists for the CD, SD, AD and BOE records. I did not re-fetch them, to save the shared web budget. Whether EBMUD Wards 3 and 7 actually reach into Contra Costa is also unverified.
- **The GoatCounter integrity hash and the real count.js behavior.** gc.zgo.at is not reachable from the shell, and this belongs to the production retest, not to this scope.
- **Real screen readers, Safari, Firefox and real devices.** Only Chromium was used. FE-10 is judged from the markup only.
- **Real web fonts.** Google Fonts was blocked, so the layout was tested with fallback fonts.
- **The census site's per-county pages.** I relied on the combined list page. The unincorporated entries came from that page.
- **District boundaries (GEO-07).** No official sources were fetched.
- Nothing in this report is marked Verified.
