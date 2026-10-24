# Geography and jurisdiction integrity audit (Agent 1)

Date: 2026-10-23. Auditor: Agent 1 (geographic and jurisdiction integrity). Scope per QA-BRIEF.md. No repository file was edited except this report. Scratch scripts and raw outputs are in /tmp/qa-geo/ (geo.cjs, geo2.cjs, geo3.cjs, geo4.cjs and matching geo-out*.txt).

Method. Parsed `data/jurisdictions.json` (246 records) and `data/2026-11-03/*.json` with Python; read `assets/guide.js` (applies, viewFind, fillCities, counties, allCounties, viewBallot, viewBrowse, viewContests); served the site with `python3 -m http.server 8811` and drove it with Playwright Chromium (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`). Web checks used WebFetch/WebSearch only. WebFetch returns a model summary with quotes capped near 125 characters, so the quotes below are what the tool returned from the page, not a raw page dump.

## Sources relied on

| # | URL | What was returned (verbatim from tool) |
| --- | --- | --- |
| S1 | https://mtc.ca.gov/about-mtc/what-mtc | "The Bay Area is home to 101 cities and nine counties, each with its own transportation and housing needs." and "The nine Bay Area counties are:" Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Solano, Sonoma |
| S2 | https://census.bayareametro.gov (home) | site covers "over 7 million residents across nine counties and 101 cities." |
| S3 | https://census.bayareametro.gov/cities-counties | full per-county list (used for the table below); 8 "Unincorporated ... County" entries, none for San Francisco |
| S4 | https://census.bayareametro.gov/cities-counties/san_francisco_county | only entry under "San Francisco County" is "San Francisco"; unincorporated entries listed are Alameda, Contra Costa, Marin, Napa, San Mateo, Santa Clara, Solano, Sonoma only |
| S5 | https://census.bayareametro.gov/cities-counties/alameda_county | 14 cities plus "Unincorporated Alameda County"; no count statement |
| S6 | https://abag.ca.gov/about-abag/what-we-do/history | "the nine counties and 101 cities and towns of the San Francisco Bay region." |
| S7 | https://www.sos.ca.gov/elections/voting-resources/county-elections-offices | 58 counties listed; "revised 3/11/2026" |
| S8 | https://www.boe.ca.gov/lieber/district.htm | District 2 counties: Alameda, Contra Costa, Del Norte, Humboldt, Lake, Marin, Mendocino, Monterey, Napa, San Benito, "San Francisco City & County", San Luis Obispo, San Mateo, Santa Barbara, Santa Clara, Santa Cruz, Sonoma, Trinity, Ventura |
| S9 | https://www.smcgov.org/ceo/intergovernmental-and-public-affairs | "Kevin Mullin (District 15): The district includes northern San Mateo County to East Palo Alto." ; "Catherine Stefani (District 19): The district includes parts of San Francisco and northern San Mateo County" ; also lists CD 16, SD 11, SD 13, AD 21, AD 23 for San Mateo County |
| S10 | https://wintersjusd.org/en/about-winters-jusd-b2ee1eb0 | district serves students "from the surrounding unincorporated areas of Yolo and Solano counties." |

Statement check. The "9 counties / 101 cities and towns" wording is confirmed verbatim only on ABAG (S6). MTC (S1) and the census site (S2) say "101 cities and nine counties" / "nine counties and 101 cities" (no "towns"). All three agree on 9 and 101. The site itself does not make the 9/101 claim in the UI; `docs/JURISDICTION-INVENTORY.md` reports `city | 101`.

## Per-county table (S3 vs data)

| County | Official count (S3) | Data count (type city, parent = county) | Differences |
| --- | --- | --- | --- |
| Alameda | 14 | 14 | none |
| Contra Costa | 19 | 19 | none |
| Marin | 11 | 11 | none |
| Napa | 5 | 5 | none (data "St. Helena" matches S3 spelling) |
| San Francisco | 1 | 1 | name only: S3 "San Francisco", data `ca-sf-city` "City and County of San Francisco" |
| San Mateo | 20 | 20 | none |
| Santa Clara | 15 | 15 | none |
| Solano | 7 | 7 | none |
| Sonoma | 9 | 9 | none |
| Total | 101 | 101 | no missing, no extra, no duplicate names or ids, no misspellings, every city under the county S3 lists it in |

Checked programmatically (exact set comparison per county). No city record is a census-designated place. No city record carries a `counties` field. Unincorporated areas have no records (S3 lists one per county except SF). Towns (for example Danville, Moraga, Corte Madera, Fairfax, Ross, San Anselmo, Tiburon, Atherton, Colma, Hillsborough, Portola Valley, Woodside, Los Altos Hills, Los Gatos, Yountville, Windsor) are all `type: "city"`; see GEO-08.

Cross-county municipalities. S3 places each of the 101 municipalities under exactly one county, and the data matches that. I found no official source stating that any Bay Area municipality spans two counties, and I did not find one stating that none does, so this is not verified either way. The data model has no way to put a city in two counties (`applies()` uses only `parent` for cities), which is consistent with S3.

County list (49 non-Bay). Data has 58 county records: 9 with `region: "bay-area"` (exactly the S1 nine) and 49 with `region: "other"`. The 58 names match the S7 list one for one. No region field errors found. The data's source label "revised 3/11/2026" matches S7.

## Findings

### GEO-01. San Francisco local measures are hidden on the default San Francisco ballot
- Severity: high. Blocks release: yes.
- Affected: `ca-sf`, `ca-sf-city`; `assets/guide.js` fillCities (line 216), applies (line 108), viewBallot emptyText (line 275); all 10 measures in `data/2026-11-03/local-measures.json` with `jurisdiction: "ca-sf-city"`.
- Reproduction: open `#/find`, pick San Francisco, leave the city select at its first option, submit. Or open `#/ballot/ca-sf` directly.
- Evidence (Playwright, /tmp/qa-geo/geo-out.txt):
  - City select for SF: `[':Unincorporated area or not sure', 'ca-sf-city:City and County of San Francisco']`
  - `SF submit no city -> #/ballot/ca-sf`
  - `#/ballot/ca-sf`: `County measures => None on the official list | No items of this type were found in the official measure list for this area.` and `City measures => Choose a city | Pick your city to see city measures. Choose a city.`
  - `#/ballot/ca-sf/ca-sf-city`: `City measures => 10 items · not yet verified`
  - S3/S4: San Francisco has no unincorporated area entry; the only place under San Francisco County is "San Francisco".
- Expected: SF is one consolidated city and county with no unincorporated area. Every SF voter should see the 10 SF measures without a second choice, and the county group must not say "None on the official list" while 10 city-and-county measures exist.
- Recommended correction: for a consolidated city-county, auto-select the single city (or treat `ca-sf-city` measures as applying when `countyId === "ca-sf"`), drop the "Unincorporated area or not sure" option for SF, and avoid the "None on the official list" county label for SF.

### GEO-02. San Mateo voters do not see their congressional and Assembly contests that the data already holds
- Severity: medium. Blocks release: no (the page says the list is not full), but should be fixed or labeled.
- Affected: `ca-cd-15` (`counties: ["ca-sf"]`, `countiesKnown: false`), `ca-ad-19` (`counties: ["ca-sf"]`); guide.js applies line 101.
- Reproduction: open `#/ballot/ca-san-mateo` or `#/ballot/ca-san-mateo/ca-san-mateo-daly-city`; open Candidate elections.
- Evidence (/tmp/qa-geo/geo-out4.txt): both pages list only the 8 statewide offices plus `State Board of Equalization, District 2`. S9 (San Mateo County official page): District 15 "includes northern San Mateo County to East Palo Alto"; AD 19 "includes parts of San Francisco and northern San Mateo County".
- Cause: when `countiesKnown` is false but `counties` is non-empty, applies() returns null for any county not listed, so an incomplete list behaves like a definitive one.
- Expected: CD 15 and AD 19 shown as "may apply" in San Mateo County (or, more generally, an unlisted county with `countiesKnown: false` should get "may apply" or an explicit "not checked" note, not silence).
- Recommended correction: add `ca-san-mateo` to both records' `counties` (S9); change applies() so `countiesKnown: false` never excludes. Similar gaps are likely for other partial lists (for example CD 10, CD 17, SD 10, AD 24 list only Alameda); I did not verify those with an official source.

### GEO-03. Board of Equalization: non-Bay voters never see their BOE contest; Districts 3 and 4 appear nowhere
- Severity: medium. Blocks release: no (statewide-only coverage is disclosed for non-Bay counties), but the record asserts something the source contradicts.
- Affected: `ca-boe-1..4` (`countiesKnown: true`; BOE 2 lists 8 Bay counties; BOE 3 and 4 `counties: []`), their 4 contests in `contests.json`.
- Reproduction: open `#/ballot/ca-humboldt` and `#/ballot/ca-los-angeles`; compare with `#/ballot/ca-marin`.
- Evidence (/tmp/qa-geo/geo-out3.txt): Humboldt and Los Angeles list the 8 statewide offices only; Marin adds `State Board of Equalization, District 2`; Solano adds `District 1`. S8 lists Humboldt (and Del Norte, Lake, Mendocino, Monterey, San Benito, San Luis Obispo, Santa Barbara, Santa Cruz, Trinity, Ventura) in District 2. With `countiesKnown: true`, applies() hides BOE 2 in those counties. BOE 3 and 4 contests apply to no county at all.
- Bay Area membership itself matches S8 (8 Bay counties in District 2; Solano not in District 2).
- Expected: `countiesKnown: true` only when the list is the full district list.
- Recommended correction: either record all counties from S8 (and the equivalent pages for Districts 1, 3, 4) or set `countiesKnown: false` so the contest shows as "may apply".

### GEO-04. Winters Joint Unified School District is recorded as Solano-only; its Yolo voters never see Measure B
- Severity: medium. Blocks release: no.
- Affected: `ca-solano-sd-winters-joint-unified-school-district` (no `counties` field), measure `2026-11-03.ca-solano-sd-winters-joint-unified-school-district.measure-b`.
- Evidence: the measure's own sources are Yolo County pages (`https://ace.yolocounty.gov/415/Measure-B---Winters-Joint-Unified-School`, `https://ace.yolocounty.gov/DocumentCenter/View/1017/`). S10: district serves "unincorporated areas of Yolo and Solano counties" and the city of Winters (Winters is not one of the 101 Bay cities, S3, so it is outside Solano). `#/ballot/ca-yolo` (geo-out2.txt): `School district measures => Not yet collected`. By contrast cross-county districts with `counties` (Sonoma County Junior College District, Coast Life Support District) do appear in Mendocino: `Community college district measures => 1 item`.
- Expected per `docs/DATA-MODEL.md` line 57: "A district that crosses county lines keeps one record ... and `counties` listing every county the official lists name."
- Recommended correction: add `counties: ["ca-solano", "ca-yolo"]` (and confirm the home county; the data's own evidence points to Yolo as the election office handling the measure).

### GEO-05. Ballot route accepts invalid, cross-county and non-city "city" ids without warning
- Severity: medium. Blocks release: no (requires a hand-edited or stale URL).
- Affected: guide.js viewBallot line 267 (`city = cityId ? J(cityId) : null`, no type or parent check); viewFind line 194.
- Evidence (/tmp/qa-geo/geo-out.txt, geo-out2.txt):
  - `#/ballot/ca-santa-clara/ca-alameda-fremont` → H1 `Ballot choices for Fremont, Santa Clara County`, shows Santa Clara items.
  - `#/ballot/ca-alameda/ca-sf-city` → H1 `Ballot choices for City and County of San Francisco, Alameda County`.
  - `#/ballot/ca-alameda/ca-alameda-oakland-council-district-2` → H1 `Ballot choices for Oakland City Council District 2, Alameda County`.
  - `#/ballot/ca-alameda/bogus-city` → H1 `Ballot choices for Alameda County` but school rows drop Dublin USD (2 rows vs 3 on `#/ballot/ca-alameda`), because the unknown id is still passed to applies() and filters districts that have `areas`.
  - `#/find?county=ca-alameda-fremont` → city select `City list not collected for this county yet`, button enabled, submit does nothing (hash unchanged).
  - Invalid county ids are handled: `#/ballot/bogus`, `#/ballot/ca-alameda-fremont`, `#/ballot/ca-bayarea-rtm`, `#/ballot/ca` all show `Not found`. `#/find?county=bogus` leaves the form disabled.
- Expected: a city id that does not exist, is not `type: "city"`, or whose parent is not the county should give Not found (or redirect to the county page with a notice), and must not alter which district items are shown.
- Recommended correction: in viewBallot, validate `city && city.type === "city" && city.parent === countyId`; in viewFind, ignore `county` params whose record is not a county.

### GEO-06. Unincorporated residents are told to pick a city
- Severity: low. Blocks release: no.
- Affected: fillCities option text "Unincorporated area or not sure" (line 216); viewBallot emptyText for `city` (line 275).
- Evidence: choosing that option leads to `#/ballot/<county>` where City measures reads `Choose a city | Pick your city to see city measures. Choose a city.` (for example Alameda, Solano in geo-out.txt). S3 lists an "Unincorporated ... County" entry for each county except SF. No unincorporated records exist in the data.
- Expected: separate "Unincorporated area" from "Not sure"; for unincorporated, say city measures do not apply and county or district items may.
- Recommended correction: split the option and the empty-state text.

### GEO-07. Districts with no recorded areas are shown as "may apply" for every city in the county
- Severity: low. Blocks release: no (labeled "may apply").
- Affected: 41 school, community college and special district records with `areas: []` (62 records of all types have an empty `areas`), for example `ca-alameda-sd-san-lorenzo-unified-school-district`, `ca-alameda-sd-sunol-glen-unified-school-district`.
- Evidence: `#/ballot/ca-alameda/ca-alameda-fremont` school rows: `San Lorenzo Unified School District · May apply` and `Sunol Glen Unified School District · May apply` (geo-out2.txt). I did not verify those districts' boundaries against an official source.
- Recommended correction: record `areas` for districts where the official list or district site names the cities served, or note in the row that boundaries are unrecorded.

### GEO-08. Towns are not distinguished from cities
- Severity: low. Blocks release: no.
- Affected: all 101 `type: "city"` records; UI label "3. Your city".
- Evidence: S6 says "101 cities and towns"; data has no town designation (for example Danville, Los Gatos, Windsor are `type: "city"`).
- Recommended correction: optional `municipalityType` field or label "Your city or town".

### GEO-09. San Francisco record inconsistencies (naming, source, cross-check text)
- Severity: low. Blocks release: no.
- Affected: `ca-sf`, `ca-sf-city`; guide.js coverageBox line 254.
- Evidence:
  - Two records for one government: county `ca-sf` "San Francisco (City and County)" and city `ca-sf-city` "City and County of San Francisco"; the city id does not follow the `<county>-<slug>` pattern used by the other 100 cities (expected slug `ca-sf-city-and-county-of-san-francisco`); S3 names the city "San Francisco". Functional, but see GEO-01.
  - `ca-sf.citySource` is the election page `https://www.sf.gov/november-3-2026-consolidated-general-election`, not a list of municipalities. (`ca-solano.citySource` is likewise the registrar home page `https://app.solanocounty.gov/depts/rov`, and `ca-sonoma.citySource` is a GIS layer index; I did not open these.)
  - Coverage box on `#/ballot/ca-sf`: `Cross-check. 4 of 4 city and district pages checked on October 22, 2026 could be read. Not every city and district was reached, so this county's list is not fully reconciled.` The second sentence is hard-coded and contradicts 4 of 4 (data `notReachable: 0`). The record's own `reconciliation.summary` repeats the same contradiction.
- Recommended correction: generate the sentence from `notReachable`; point `citySource` to a municipal list (for example S3).

### Observations, no finding
- Bay Area county records: 9 present, ids, names and `region` correct against S1. `parent` references for all 246 records resolve; every `areas` and `counties` reference resolves (script output `bad refs []`).
- Region record `ca-bayarea-rtm` lists Alameda, Contra Costa, San Mateo, Santa Clara, SF. I did not find an official source for the district's membership within the allowed fetches, so this is not verified. Invalid route to it gives Not found.
- District parents look plausible: council districts parented to their cities; EBMUD wards list Alameda and Contra Costa; Sonoma County Junior College District lists Sonoma, Marin, Mendocino; Coast Life Support District lists Sonoma and Mendocino; BART District 8 notes only the SF part is recorded. No CDP is treated as a city.
- Lists presented as complete: the Find county radios (9) and "another county" select (49) are complete against S1 and S7; Browse shows 9 Bay rows plus 49 others. For the 49 non-Bay counties the city select says `City list not collected for this county yet`; no non-Bay list is presented as complete. Alameda and SF have `coverage.listComplete: true`, which produces "None on the official list" labels (see GEO-01 for SF); whether Alameda's measure list is truly complete is outside this audit.

## Summary

| Severity | Count | Ids |
| --- | --- | --- |
| Blocker | 0 | |
| High | 1 | GEO-01 |
| Medium | 4 | GEO-02, GEO-03, GEO-04, GEO-05 |
| Low | 4 | GEO-06, GEO-07, GEO-08, GEO-09 |

Release-blocking: GEO-01 only.

## Not checked, and why
- Official per-county city lists from the counties' own `citySource` pages (acgov.org, contracosta.ca.gov, marincounty.gov, Napa LAFCO PDF, smcgov.org LAFCO, santaclaralafco.org, Solano, Sonoma GIS): not fetched to save the shared budget; S3 was used as the single regional authority.
- Whether any Bay Area municipality spans two counties: no official statement found either way (see above).
- RTM district membership, BART District 8 extent, EBMUD ward extents, Dublin USD, San Lorenzo USD and Sunol Glen USD boundaries: no official source fetched.
- County membership of CD 10, CD 17, SD 10, AD 24 and other partial `countiesKnown: false` lists beyond San Mateo (S9).
- Yolo County Measure B page and BOE Districts 1, 3, 4 pages: the Yolo URL was not on the fetch allowlist; BOE 1, 3, 4 pages were not attempted.
- Nothing here is marked Verified. A URL opening is reported separately from a fact being confirmed.
