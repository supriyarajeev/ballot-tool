# Fix Agent A summary (geography and coverage data), Oct 23, 2026

Files changed: `data/jurisdictions.json` (edited), `data/region.json` (new). No other file was touched. Nothing committed. Edit script (kept outside the repo, re-runnable on the original file) is `<session scratch folder, not in the repo>/fixA.cjs`. It asserts the city counts, that no existing county is dropped from a district, and that the four BOE lists cover all 58 counties exactly once plus San Bernardino twice. Output keeps the file's 1-space JSON format.

Method note. `curl` to these hosts is blocked by the proxy, so every web check used WebFetch, which returns a model reading of the page. Quotes below are what WebFetch returned. Two sources (the SOS Offices and Subdivisions PDF and the census list) were read twice with different prompts and gave the same answer both times.

## 1. data/region.json (new)

Exactly the contract shape. `counties` is the 9 Bay county ids, `countyCount` 9, `municipalityCount` 101 (script checks that the data holds 101 Bay city records). Two facts, both re-fetched today, `retrieved: "2026-10-23"`.

| Publisher | URL | Text (re-fetched today) |
|---|---|---|
| Metropolitan Transportation Commission | https://mtc.ca.gov/about-mtc/what-mtc | "The Bay Area is home to 101 cities and nine counties, each with its own transportation and housing needs." |
| Association of Bay Area Governments | https://abag.ca.gov/about-abag/what-we-do/history | "the nine counties and 101 cities and towns of the San Francisco Bay region." (this is a fragment of a longer sentence; WebFetch would not return the full sentence) |

The census site (https://census.bayareametro.gov/cities-counties) is not a fact entry because FIX-PLAN lists no verbatim sentence for it, only a description of its list. It is used as the `cityInventory.source` instead.

## 2. cityInventory, unincorporated, consolidatedCity

Re-fetched https://census.bayareametro.gov/cities-counties and all 9 county pages. City names and counts match the data exactly (script fails on any count mismatch).

| County | Official cities | Data cities | `unincorporated.listed` | `unincorporated.source` |
|---|---|---|---|---|
| Alameda | 14 | 14 | true ("Unincorporated Alameda County") | https://census.bayareametro.gov/cities-counties/alameda_county |
| Contra Costa | 19 | 19 | true | .../contra_costa_county |
| Marin | 11 | 11 | true | .../marin_county |
| Napa | 5 | 5 | true | .../napa_county |
| San Francisco | 1 ("San Francisco") | 1 | false (page has no "Unincorporated San Francisco County" entry) | .../san_francisco_county |
| San Mateo | 20 | 20 | true | .../san_mateo_county |
| Santa Clara | 15 | 15 | true | .../santa_clara_county |
| Solano | 7 | 7 | true | .../solano_county |
| Sonoma | 9 | 9 | true | .../sonoma_county |

Each Bay county gets `cityInventory: {status: "complete", count, source: "https://census.bayareametro.gov/cities-counties", checked: "2026-10-23", note: "Matches the regional list of incorporated cities and towns."}`, placed after `citySource`. `ca-sf` also gets `consolidatedCity: "ca-sf-city"`. The 49 other counties get `cityInventory: {status: "not-collected"}` and no `unincorporated` field. "complete" here means only that the city set matches the regional list. No `inventory` status was changed, and nothing is marked reconciled or verified.

## 3. municipalityType

Not added. I found no single official source that labels each of the 101 municipalities as city or town, and citing 101 separate municipal pages was out of scope. Per the contract, omitted rather than guessed. The UI label "Select a city or town" (Fix B) covers GEO-08 without the field.

## 4. GEO-02 and other state-district county lists

Main source: Secretary of State, Offices and Subdivisions, https://elections.cdn.sos.ca.gov/statewide-elections/2026-primary/offices-subdivisions.pdf. Its page footers name the June 2, 2026 primary and the November 3, 2026 general election, so it reflects the 2026 lines (including the congressional lines in effect for 2026). Lines quoted under "Counties Within Congressional Districts", "Counties Within State Senate Districts" and "Counties Within State Assembly Districts".

| Record | Before | After | SOS line |
|---|---|---|---|
| ca-cd-10 | Alameda | Alameda, Contra Costa | "Alameda, Contra Costa" |
| ca-cd-11 | SF | unchanged | "San Francisco" |
| ca-cd-12 | Alameda | unchanged | "Alameda" |
| ca-cd-14 | Alameda | unchanged | "Alameda" |
| ca-cd-15 | SF | SF, San Mateo | "15 San Francisco, San Mateo" |
| ca-cd-17 | Alameda | Alameda, Santa Clara | "Alameda, Santa Clara" |
| ca-sd-10 | Alameda | Alameda, Santa Clara | "Alameda, Santa Clara" |
| ca-ad-14 | Alameda | Alameda, Contra Costa | "Alameda, Contra Costa" |
| ca-ad-16 | Alameda | Alameda, Contra Costa | "Alameda, Contra Costa" |
| ca-ad-17 | SF | unchanged | "San Francisco" |
| ca-ad-18 | Alameda | Alameda, SF | "Alameda, San Francisco" (same answer on both reads) |
| ca-ad-19 | SF | SF, San Mateo | "19 San Francisco, San Mateo" |
| ca-ad-20 | Alameda | unchanged | "Alameda" |
| ca-ad-24 | Alameda | Alameda, Santa Clara | "Alameda, Santa Clara" |

San Mateo County source, https://www.smcgov.org/ceo/intergovernmental-and-public-affairs, re-fetched and added to CD 15 and AD 19:
- Kevin Mullin, District 15: "The district includes northern San Mateo County to East Palo Alto."
- Catherine Stefani, District 19: "The district includes parts of San Francisco and northern San Mateo County"

All 14 records keep `countiesKnown: false`, because these districts cover only part of most listed counties and `countiesKnown: true` makes guide.js show the contest as applying to the whole county. Each note now reads: "Counties from the Secretary of State's 2026 Offices and Subdivisions list. The district may cover only part of each listed county, so it shows as "may apply" there." This replaces the old note ("Only the counties checked so far are listed..."), which is no longer true. The SOS source was added to each record's `sources`; the existing certified-candidate-list source was kept.

Effect: San Mateo voters now see CD 15 and AD 19 as "may apply"; Contra Costa voters see CD 10, AD 14, AD 16; Santa Clara voters see CD 17, SD 10, AD 24; SF voters see AD 18. No county was removed from any list. The S9 page also names CD 16, SD 11, SD 13, AD 21, AD 23, but no records exist for those districts, so nothing was added for them (records and contests belong to Fix D).

## 5. GEO-03, Board of Equalization

Sources (all re-fetched today):
- SOS Offices and Subdivisions (URL above), "Counties Within Board of Equalization Districts". District 01 line includes "...PLACER, PLUMAS, SACRAMENTO, San" / "Bernardino, SAN JOAQUIN..."; District 02 "ALAMEDA, CONTRA COSTA, DEL NORTE, HUMBOLDT, LAKE, MARIN, MENDOCINO, MONTEREY, NAPA, SAN" / "BENITO, SAN FRANCISCO, SAN LUIS OBISPO, SAN MATEO, SANTA BARBARA, SANTA CLARA, SANTA" / "CRUZ, SONOMA, TRINITY, VENTURA"; District 03 "LOS ANGELES"; District 04 "IMPERIAL, ORANGE, RIVERSIDE, San Bernardino, SAN DIEGO".
- SOS 2026 Official Voter Information Guide, https://voterguide.sos.ca.gov/voter-info/boe-map.htm (page is for the November 3, 2026 election). Same four lists, with San Bernardino under both District 1 and District 4.
- BOE District 2 page, https://www.boe.ca.gov/lieber/district.htm. Same 19 counties, including "San Francisco City & County".
- BOE District 3 page, https://boe.ca.gov/vazquez/district.htm. District "made up of Los Angeles County."
- District 1 and 4 BOE pages (boe.ca.gov/gaines/, /schaefer/) were refused as not on the fetch allowlist.

Counts: D1 34, D2 19, D3 1, D4 5. That is 58 distinct counties, with San Bernardino in both D1 and D4. All existing Bay entries are kept (Solano in D1; the other 8 in D2).

| Record | counties | countiesKnown | Why |
|---|---|---|---|
| ca-boe-2 | 19 (full list) | true | Every county printed in capitals (whole county), confirmed by 3 sources |
| ca-boe-3 | Los Angeles | true | Whole county, confirmed by 3 sources |
| ca-boe-1 | 34 (full list) | **false** | Full list is known, but San Bernardino is split (printed in mixed case). With `true`, guide.js would show District 1 and District 4 both as applying ("yes") to every San Bernardino voter. |
| ca-boe-4 | 5 (full list) | **false** | Same reason |

Each note says why. The District 2 page source was removed from D1, D3 and D4, where it was not the right source. The SOS 2022 Statement of Vote source was kept on all four.

Side effect for Fix B and the integration lead: with `false`, D1 and D4 now show as "may apply" in their counties, with guide.js's fixed text "This district covers only part of the county." That text is wrong for the 33 D1 and 4 D4 counties that are wholly inside their district, including Solano, which used to show D1 as applying. Request: add a partial-county marker (for example `partialCounties: ["ca-san-bernardino"]`) to the data model and applies(). Then D1 and D4 can go back to `countiesKnown: true`, with "may apply" shown only in San Bernardino. I did not add the field, because it is not in the contract.

## 6. GEO-04, Winters JUSD

`ca-solano-sd-winters-joint-unified-school-district` now has `counties: ["ca-solano", "ca-yolo"]`, plus a source https://wintersjusd.org/en/about-winters-jusd-b2ee1eb0. The page says the district serves students "within the city of Winters and from the surrounding unincorporated areas of Yolo and Solano counties." The note was updated to say this. `parent` stays `ca-solano` (the id depends on it). I did not check which county runs the election (the measure's sources are Yolo pages).

## 7. GEO-09, VAL-11 and the coverage notes

- `ca-sf.citySource`: from the election page to https://census.bayareametro.gov/cities-counties/san_francisco_county. That page lists "San Francisco" as the only place under San Francisco County.
- `ca-sf.inventory.reconciliation.summary` used to say "Not every city and district was reached", which contradicted 4 of 4 pages reached. It now reads: "Cross-check of the sf.gov list of qualified measures against official San Francisco pages, including the Voter Information Pamphlet table of contents. Every page checked could be read. The pamphlet lists the same measure letters; three titles are worded slightly differently. The pamphlet's measure pages were not read, so the list is not marked reconciled." Basis: `audit/2026-10-22/raw/county-ca-sf.json` (reconciliation and blockers). The 4 pages are the VIP PDF (TOC only; measure pages after p. 44 were not reachable), two Department of Elections pages, and the sf.gov qualified-measures page. Titles C, G, H differ from the VIP.
- `ca-sf.coverage.note`: "from official city pages" became "from the official sf.gov list of qualified ballot measures; the regional transit measure, Measure RTM, is shown separately" (the raw file's listUrl is https://www.sf.gov/qualified-ballot-measures). The rest is unchanged.
- Contra Costa, Marin, Napa, San Mateo, Santa Clara, Solano notes said "The list has not yet been cross-checked against city and district records." Each of those records has a partial cross-check (pagesChecked 23/8/6/23/12/10). The sentence is now "On October 22, 2026 the list was partly cross-checked against city clerk and district pages; it is not reconciled."
- Checked, no change needed:
  - Measure counts in the notes match the data. Alameda 28 = 27 own + RTM. Contra Costa 12, San Mateo 28 and Santa Clara 19 each exclude RTM, as their notes say. Marin 20 = 19 own + Sonoma CCD Measure AB, which lists Marin in `counties`. Napa 4, Solano 11, Sonoma 12.
  - Alameda's "14 now have an official ballot question or vote threshold" matches 14 in the current local-measures.json. Fix D is editing that file, so recheck this count after D lands.
  - For the 8 counties with notReachable > 0, the reconciliation summaries ("Not every city and district was reached") are true. The script asserts pagesReached + notReachable == pagesChecked for all 9.
- Still open (Fix B): guide.js line 254 hardcodes "Not every city and district was reached..." regardless of the data. It must branch on `notReachable` (VAL-11). The data side is fixed.
- Not changed: `ca-solano.citySource` (registrar home page) and `ca-sonoma.citySource` (GIS layer index) are not municipal lists (GEO-09 aside). Their city sets are now backed by `cityInventory.source`. I left these fields as they were, since the original provenance is unknown and they were not part of the task.

## GEO findings status

| Finding | Status |
|---|---|
| GEO-01 | Data part done (`consolidatedCity`, `unincorporated.listed: false` for SF). Rendering is Fix B's. |
| GEO-02 | Fixed (CD 15, AD 19 plus 7 other district lists, all cited). |
| GEO-03 | Fixed for D2, D3 (full lists, `true`). D1, D4 have full lists but `countiesKnown: false` because of the San Bernardino split; needs the partial-county model change described above. |
| GEO-04 | Fixed. |
| GEO-05, GEO-06 | Frontend (Fix B). The data now supplies `unincorporated` for GEO-06. |
| GEO-07 | Not fixed. Needs official district boundary sources; out of scope. |
| GEO-08 | `municipalityType` not added (no citable source); label change is Fix B's. |
| GEO-09 | citySource and summary text fixed. The `ca-sf-city` id and name are left as they are, because renaming would break measure references and routes. |
| VAL-11 | Data text fixed; guide.js sentence is Fix B's. |
| VAL-16 | Contradicting note text fixed. The consistency rule itself is Fix C's. |

## Validator

`node tools/validate.mjs` gives `12 errors, 0 warnings, 654 ids checked`. All 12 are of the form `2026-11-03.ca-alameda-*.measure-*: published field "threshold" has no evidence record. Run tools/build-ledger.mjs`. They come from the concurrent Fix D edits to local-measures.json and the not-yet-rebuilt ledger, not from jurisdictions.json. No error or warning names a jurisdiction or region.json. Before my edits (and before D's edits landed) the run was 0 errors. region.json is not yet read by the validator (Fix C).
