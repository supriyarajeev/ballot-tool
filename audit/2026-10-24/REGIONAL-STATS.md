# Regional statistics: sources and method (October 24, 2026)

The home page card "The region at a glance" has two parallel sections with the same four cards in the same order: counties, incorporated cities, residents, registered voters. Every figure is stored in `data/region.json` with its publisher, title, link, reference date and retrieval date. The validator rejects a figure without them. A card whose figure is missing shows "Not available" rather than a guess.

## San Francisco Bay Area (nine counties)

| Card | Figure | Reference date | Source |
|---|---|---|---|
| Counties | 9 | current | MTC, "What MTC does" (https://mtc.ca.gov/about-mtc/what-mtc), and ABAG history page (https://abag.ca.gov/about-abag/what-we-do/history); quotes kept in region.json `facts` |
| Incorporated cities | 101 | current | The same MTC and ABAG pages ("101 cities", "101 cities and towns"). The guide's own city list has 101 entries matched to this list. |
| Residents | 7,679,604 | January 1, 2026, provisional estimate | California Department of Finance, E-1 (released May 1, 2026). Sum of the nine county rows. |
| Registered voters | 4,622,492 | September 4, 2026 | Secretary of State, Report of Registration (60-day report for the November 3, 2026 election), Registration by County. Sum of the nine county rows. |

County inputs, as printed in the source tables:

| County | Residents (Jan 1, 2026) | Registered (Sep 4, 2026) |
|---|---:|---:|
| Alameda | 1,666,136 | 979,046 |
| Contra Costa | 1,163,891 | 729,193 |
| Marin | 250,823 | 173,434 |
| Napa | 136,374 | 86,139 |
| San Francisco | 845,658 | 534,048 |
| San Mateo | 748,182 | 447,165 |
| Santa Clara | 1,932,468 | 1,077,082 |
| Solano | 452,050 | 276,817 |
| Sonoma | 484,022 | 319,568 |
| **Total** | **7,679,604** | **4,622,492** |

## California statewide

| Card | Figure | Reference date | Source |
|---|---|---|---|
| Counties | 58 | current | Secretary of State, County Elections Offices (https://www.sos.ca.gov/elections/voting-resources/county-elections-offices); the guide has 58 county records |
| Incorporated cities | 483 | January 1, 2026 | California Department of Finance E-1 press release (May 1, 2026). It reports 148 cities that grew, 333 that declined and 2 unchanged, which is 483. The League of California Cities (March 13, 2024) called Mountain House "the 483rd city in California". |
| Residents | 39,592,978 | January 1, 2026, provisional estimate | Department of Finance E-1 table (the press release rounds to 39,593,000) |
| Registered voters | 23,164,977 | September 4, 2026 | Secretary of State, Report of Registration, state total |

## Method and limits

- **Same geography.** All four Bay Area figures cover the same nine counties, Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Solano and Sonoma, as MTC and ABAG define the region. No metro-area or city figure is mixed in.
- **Same sources in both sections.** The Bay Area residents and voters are the nine county rows of the same state tables used for the statewide cards.
- **Different dates.** Residents are a January 1, 2026 provisional estimate; registered voters are as of September 4, 2026. The page says so. They are different counts and are not meant to be divided.
- **Latest registration report.** On October 24, 2026 the Secretary of State's statistics page listed only the 60-day report for this election; the 15-day report was not yet published. When it is, update `glance.registration`, and the page will follow.
- **Terminology.** "Incorporated cities" is used for both sections. Some California cities are named towns (for example Los Gatos), but in state law they are all cities.
- **The 483 count.** The Department of Finance release does not print the total directly; it is the sum of the three groups the release reports. The League of California Cities statement corroborates it. A person should confirm it against the E-1 table.

## Automated checks

`tools/validate.mjs` checks:
- the nine counties in each table;
- whole numbers;
- that the county sums stay below the state totals;
- that no county has more registered voters than eligible;
- 58 counties;
- a dated, sourced statewide city count no smaller than the region's.

The browser tests check:
- the four cards, in the same order, in both sections;
- every figure against `region.json`;
- the sources;
- the dates note.
