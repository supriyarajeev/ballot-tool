# Fix B summary (frontend and selector), Oct 23, 2026

Files edited. Only `index.html`, `assets/guide.js`, `assets/guide.css` and `propositions.html`. In propositions.html I changed only the CSS, a new noscript, the privacy paragraph (`#privacy`, as PRD-01 requires) and the GoatCounter tag and call. PROPS, FACTORS, PRESETS, scoring and `trackUse` are unchanged. Nothing was committed. Nothing in data/ or tests/ was written.

Data. Fix A's `data/region.json` and the new county fields (`cityInventory`, `unincorporated`, `consolidatedCity`) were already on disk when I tested, so I tested against the real files. No mock was needed. `municipalityType` is not in the data, so the UI says "city or town" everywhere.

Line numbers refer to the current files. guide.js is 727 lines.

## Verification (all run on the final files)

- Playwright script `<session scratch folder, not in the repo>/fixB/test.cjs`, run against `python3 -m http.server 8797` with every external request aborted. Result: `PASS 220 FAIL 0`.
- Matrix: 18 routes × 360/768/1280 × light/dark = 108 runs. Every `<details>` was opened before each check. All 108 had no horizontal overflow, 0 axe violations (axe-core 4.10.2) and 0 console errors.
  - Guide routes: home, find (plain, prefilled, SF, invalid), statewide, Oakland, SF, unincorporated Alameda, Fresno, cross-county invalid, a statewide item, an incomplete local item, contests, browse and Not found.
  - propositions.html was tested with the rubric both closed and open.
  - Screenshots: `<session scratch folder, not in the repo>/fixB/shots/`.
- `node tests/scoring-regression.mjs`: "... 0 differences."
- `npx html-validate index.html propositions.html`: no output, exit 0.

## Owner UI requirements (FIX-PLAN)

| Requirement | Change | Where |
|---|---|---|
| Home regional context | New card "The Bay Area in this guide", placed right after the Find My Ballot hero. It reads: "The San Francisco Bay Area has 9 counties and 101 cities and towns, according to the Metropolitan Transportation Commission and the Association of Bay Area Governments." Both publishers are visible links taken from `region.facts`. A "What the regional sources say" disclosure shows the verbatim quotes and retrieval dates, followed by `region.note`. The numbers come from `region.countyCount` and `region.municipalityCount`. If region.json fails, the sentence is not shown and a small "could not be loaded" line appears instead. | guide.js `regionCard()` 281 |
| Coverage indicator kept separate | Under the heading "This guide's local coverage is growing county by county", four counts are computed from data on every load. Current values: counties with local measures 9/9, counties with a complete city and town list 9/9, cities and towns listed 101, counties with local candidate contests 3/9. Each count has screen-reader text ("3 of 9 Bay Area counties have …"). | guide.js 281-352, CSS `.stats` guide.css 153 |
| Load region.json in loadData | `load()` is renamed `loadData()`. It fetches elections, jurisdictions and region in parallel. region uses `soft()`, so a failure is recorded and nothing breaks. If region.json is missing, `counties()` falls back to `region === "bay-area"`. | guide.js 116-136, 148 |
| Find labels | The county fieldset legend is "Select a Bay Area county", with subtitle `#county-sub` "Choose one of the nine counties in the San Francisco Bay Area." (exact text). The 9 radios come from `region.counties`. The "Or another California county" select (`#other`) is removed and replaced by the link "See statewide California propositions". The city label is "Select a city or town". "1. Election" became "Election" so the numbering doesn't clash. | guide.js `viewFind` 355 |
| City options | Shows only the cities of the selected county, then "Unincorporated area of <County>" (only when `unincorporated.listed === true`), then a separate "I'm not sure of my city or town". | `fillCities` 395 |
| City-list disclosure | Complete list: "Lists all N incorporated cities and towns in X County, matching the Bay Area regional list (checked …)", with a link to `cityInventory.source`. A list counts as complete only if `status === "complete"` and `count` equals the number of city records. Partial list: the adapted message plus the county elections link. No cities: the exact message "City and town coverage for this county has not been fully collected yet. Check the official county election website for your complete ballot." plus the link. | guide.js 20-21, 395-420 |
| Consolidated city (SF) | `consolidatedCity` is selected automatically as the only option, and there is no unincorporated option. Submitting goes to `#/ballot/ca-sf`. See GEO-01. | 395-405, `resolvePlace` 163 |
| County change, URL restore, back/forward | Changing the county rebuilds the city list, which resets the city. The form keeps `#/find?county=&city=` current with `history.replaceState`, so Back returns to the same valid choices. Params are restored only when valid. Anything else shows a notice (see FE-04). | `syncUrl` 390 |
| Outside the Bay Area | New route `#/statewide` with h1 "Statewide California propositions" and the exact message "Statewide California propositions are available here. Local city and district coverage outside the Bay Area is still being developed." It also has the 14 statewide rows, a link to the Weighing Tool and a list of 49 counties linking to `#/ballot/<id>`. Existing `#/ballot/<non-Bay county>` pages keep the statewide items and add the same message (`statewideNote`). Linked from home, Find and every non-Bay ballot. | `viewStatewide` 538, `statewideNote` 247 |
| District limitations | `districtNote()` (`role="note"`) appears on Find, `#/statewide` and every ballot page. It says "School, community college, special and legislative districts may not match city or county lines. A county and a city or town cannot identify every contest on your ballot, and neither can a ZIP code." It adds the county's official lookup link and elections office, or the SOS county-offices link when no county is chosen. On Find it updates when a county is picked. | 244 |
| Defensive loading (PRD-09) | See PRD-09 below. | |

## Findings

| Id | What changed | File:line | How tested |
|---|---|---|---|
| GEO-01 | `resolvePlace()` treats an SF ballot without a city as `ca-sf-city`, so `#/ballot/ca-sf` and `#/ballot/ca-sf/ca-sf-city` both show the 10 SF measures. The empty county group now says "Listed under City and town measures" instead of "None on the official list". | guide.js 163, 486-508 | Both routes give `10 items`, h1 "Ballot choices for City and County of San Francisco". Find → SF → submit lands on `#/ballot/ca-sf`. |
| FE-01 | CSS only. `.wrap` gets `grid-template-columns: minmax(0,1fr)` and `min-width:0` on its children. The method table is a scroll block at wider sizes. At ≤520px both rule tables wrap (smaller padding, chips wrap, `overflow-wrap:anywhere`), so neither the page nor the table scrolls. Pure scroll containers would have created a new axe `scrollable-region-focusable` violation, and CSS cannot add tabindex. Above 520px nothing visible changes. | propositions.html 57-60, 258-262 | Overflow and axe pass at 360/768/1280 in both themes, with the rubric closed and open. Table scrollWidth equals clientWidth at 360, 390, 520 and 768. |
| FE-02 | `countsFor` excludes `state-district` contests (`isLocalJur`). | guide.js 256-266 | Marin row: "20 local measures listed · local candidate contests not collected yet". |
| FE-03, FE-04, GEO-05 | A city must be `type:"city"` with `parent === county`, or `unincorporated` when listed. Otherwise the h1 is "City or town not found" and the page links to the county ballot and back to Find. A non-county id gives "Not found". Extra path segments are rejected. Find accepts `county` only if it is one of the nine. Any other value shows a "Please choose again" notice and leaves the form disabled. A non-Bay county explains itself and links to its statewide page. A bad `city` param shows a notice. | guide.js 163, 355-372, 468-484 | 7 cross-county, bogus, council-district and extra-segment URLs give "City or town not found". 6 invalid Find params show the notice under h1 "Find your ballot". |
| FE-05 | Visible sentence built from `counties()`: "The nine counties are Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Solano and Sonoma. Elsewhere in California, this guide covers statewide items only so far." | regionCard | Asserted on home. |
| FE-06 | SF has no "Unincorporated area or not sure" option. Its single city is preselected. | fillCities | SF options are exactly `["ca-sf-city"]`. |
| FE-07 | The audit date comes from `statewideDate()`, the latest `lastVerified` of statewide measures and statewide contests. It is used on home and in the coverage box. The `#/contests` intro is built from contest records by `localContestPlaces()`. I also fixed the hardcoded cross-check sentence (GEO-09 text): it now uses `notReachable`. | guide.js 273, 444-466, 632 | Home shows "October 22, 2026". The contests intro lists Alameda County (Oakland … EBMUD Ward 7) and San Francisco (…), matching the data. |
| FE-08 | `field()` defaults to "Not collected yet." On items with a status note it adds 'See "What is missing" above.' Badge labels are unchanged. Non-Bay empty groups say "Not collected yet for X County". | guide.js 232, viewItem | SF Prop A has 0 occurrences of "Not yet researched". The badge reads exactly "Incomplete (required info or evidence is missing)". |
| FE-09 | `dedupeGaps()` drops exact duplicates and bare field names ("Ballot question", "Vote threshold", "Fiscal", "X (not stated…)") when a fuller entry for the same field already exists. Gaps that carry their own note are kept, for example "Ballot question not found; …" and "(use the revised one)". The data still has the duplicates, so Fix D or C should still clean them at the source. | guide.js 207 | SF Prop A now lists 4 gaps instead of 6. |
| FE-10, PRD-11 | `aria-live` is removed from `<main>`. Route changes still move focus to the h1 (`focusTop`), and `#q-status` is kept. | index.html 24 | Asserted that main has no aria-live. |
| FE-11 | "Change place" links to `#/find?county=X&city=Y`, including `city=unincorporated`, and the city is preselected. | guide.js 517 | Berkeley → Change place → Back. The city select value is `ca-alameda-berkeley`. |
| FE-12 | `ext()` labels plain-http links visibly as "(http, not a secure link)". Used for every external link. | guide.js 79 | `#/ballot/ca-alpine` shows the label. |
| GEO-06 | "Unincorporated area of X" is a separate option from "not sure". New route `#/ballot/<county>/unincorporated` has the h1 "Ballot choices for unincorporated X County". The city group says "City and town measures do not apply in unincorporated areas. County and district items may still apply." | guide.js 163, 486-512 | Asserted. |
| GEO-08 | "city or town" wording in the Find label, options, help text, empty states and home steps. The group title is "City and town measures". `data-group="city"` is unchanged. | guide.js 51, passim | Asserted. |
| PRD-01 (blocker) | Both tags now carry `data-goatcounter-settings='{"no_onload": true}'`. index.html: `countVisit()` polls for `goatcounter.count` for up to 30 s, following GoatCounter's documented setInterval pattern. It then counts once with `title: "California Bay Area Ballot Guide"` and `path: location.pathname` (sanitized). The hash, where every route lives, is never sent. propositions.html does the same in a small inline script before the tag, with title "Ballot Weighing Tool". The two events `used-tool` and `finished-all-14` are unchanged. The privacy text on both pages now describes this exactly, including browser history and the page title (PRD-05). | guide.js 86, index.html 29/33-34, propositions.html 392, 1026-1038 | A stub counter is defined after 0 ms and after 2500 ms, on `#/ballot/ca-alameda/ca-alameda-oakland` and the RTM item. In all 4 runs there is exactly 1 call `{"path":"/index.html","title":"California Bay Area Ballot Guide"}`, even though `document.title` at that moment named Oakland or Measure RTM. propositions: `{"path":"/propositions.html","title":"Ballot Weighing Tool"}`, then `{"path":"used-tool","title":"Answered at least one question","event":true}`. |
| PRD-02 | Pinned to `https://gc.zgo.at/count.v5.js` with `crossorigin="anonymous"` and `integrity="sha384-atnOLvQb9t+jTSipvd75X2yginT4PjVbqDdlJAmxMm+wYElFmeR6EmLP5bYeoRVQ"`. See the provenance note below. No CSP was added, because propositions.html relies on inline scripts and a CSP would need `'unsafe-inline'`. | index.html 34, propositions.html 1038 | html-validate passes. The real script could not be loaded (see below). |
| PRD-03 | propositions.html noscript: "This tool needs JavaScript to show the 14 propositions and work out your leans. Without JavaScript, read every statewide proposition in the official California voter guide." The index noscript no longer promises readable propositions. It points to the SOS voter guide and county offices. | propositions.html 271, index.html 25 | With JavaScript disabled, the noscript text is present. |
| PRD-07 | `dec()` wraps `decodeURIComponent`. A malformed path or query gives Not found "That page address is not valid." | guide.js 689-700 | `#/item/%E0%A4%A` on direct load and after load, and `?x=%E0%A4%A`. No pageerror. |
| PRD-08 | `DB.jur`, `DB.byId` and the query params use `Object.create(null)`. Every read goes through `own()` (hasOwnProperty), including STATUS, COVERAGE, INV and STATUS_HELP. | guide.js 59-73 | `#/candidate/constructor`, `/toString`, `#/contest/constructor`, `#/item/hasOwnProperty`, `__proto__`, `#/ballot/constructor` and `#/find?county=constructor` are all rejected. |
| PRD-09 | Measure, contest and candidate files load through `soft()`, with a 20 s timeout on every fetch. A failed file is listed in a warning at the top of every page ("Some information could not be loaded. Missing right now: local measures …"), and the rest renders. If both measures and contests fail, the page shows the error, which now includes the SOS link. | guide.js 103-145, route 711 | A 404 on local-measures, contests or candidates leaves 14 statewide rows plus the warning. Truncated local-measures JSON gives `#/statewide` with 14 rows. A 404 on region.json gives no warning, home renders without regional numbers, and Find still has 9 counties. No console errors. |

## PRD-02 provenance (quote)

The raw page and script could not be fetched from the shell, because the proxy returned `CONNECT tunnel failed, response 403` for both goatcounter.com and gc.zgo.at. Two separate WebFetch reads of https://www.goatcounter.com/help/countjs-versions returned the same values. The second asked for a character-for-character copy:

```
//gc.zgo.at/count.v5.js
sha384-atnOLvQb9t+jTSipvd75X2yginT4PjVbqDdlJAmxMm+wYElFmeR6EmLP5bYeoRVQ
```

The first read gave "v5 (9 June 2025)" as the latest version. It also gave the example tag with `crossorigin="anonymous"` and the same integrity value. The value is 64 base64 characters, which is the correct length for SHA-384. WebFetch is a reader model, not a byte copy, and I could not compute the hash from the real file. If the value is wrong, the browser refuses the script and counting stops. Nothing leaks. **Before release, the integration lead should confirm it**, for example with `curl -s https://gc.zgo.at/count.v5.js | openssl dgst -sha384 -binary | base64` on a machine with access. The same WebFetch of /help/js confirmed `no_onload` ("Don't do anything on page load, for cases where you want to call `count()` manually") and that `title` defaults to `document.title`.

## Not fixed, or left for others

- PRD-02 hash: not computed locally (see above).
- I did not check how the real count.js behaves with `no_onload`, because gc.zgo.at is blocked. I relied on the documentation plus the stub test.
- FE-09 at the source: the duplicate gaps are still in `data/2026-11-03/local-measures.json`. The UI hides them. This belongs to Fix D or the ledger builder.
- FE-12 data: the Alpine and Mariposa URLs are still http. They are now labeled. Finding https versions belongs to Fix A.
- At 320px (below the 360px floor), with "Customize" open, the preset buttons on propositions.html still overflow by about 22px. With everything closed the page fits at 320, where before it overflowed by 48px.
- PRD-04, PRD-06, PRD-10 (validator) and PRD-12 are not in my scope.
- GEO-02, GEO-03, GEO-04 and GEO-07 are data issues. No UI change was made.

## What Fix C's tests should check (the old guide.test.cjs breaks)

The old tests use `#other` and expect 50 options. That control is removed. `Not yet researched for` became `Not collected yet for`. "Unincorporated area or not sure" is now split into two options.

1. Find:
   - `legend` is "Select a Bay Area county".
   - `#county-sub` is "Choose one of the nine counties in the San Francisco Bay Area."
   - There are 9 `input[name=county]` and they equal `region.json.counties`.
   - `#other` does not exist.
   - `label[for=city]` starts with "Select a city or town".
   - `#go` and `#city` are disabled before a county is chosen.
2. Alameda options: 14 cities + `unincorporated` ("Unincorporated area of Alameda County") + `not-sure`. `#city-help` says "Lists all 14". Changing the county resets `#city` to "".
3. SF:
   - The options are exactly `[ca-sf-city]`, preselected, with no `unincorporated`.
   - Submitting goes to `#/ballot/ca-sf`.
   - `#/ballot/ca-sf` and `#/ballot/ca-sf/ca-sf-city` both show `.group[data-group=city] .counts` starting "10 items".
   - The county group shows "Listed under City and town measures".
   - `#/ballot/ca-sf/unincorporated` has the h1 "City or town not found".
4. `#/ballot/ca-alameda/unincorporated`: the h1 is "Ballot choices for unincorporated Alameda County", and the city group text contains "do not apply in unincorporated areas".
5. Invalid places have the h1 "City or town not found": `#/ballot/ca-marin/ca-alameda-oakland`, `ca-alameda/ca-sf-city`, `ca-alameda/bogus-city`, `ca-alameda/ca-alameda-oakland-council-district-2`, `ca-alameda/ca-alameda-oakland/extra`.
6. These have the h1 "Not found": `#/ballot/bogus`, `#/candidate/constructor`, `#/contest/constructor`, `#/item/hasOwnProperty`, `#/item/%E0%A4%A` (no pageerror).
7. `#/find?county=bogus|ca-alameda-oakland|ca-fresno` shows `[data-find-notice]`, and the form stays disabled.
8. `#/statewide`: `[data-statewide-msg]` exactly equals the statewide message, and there are 14 rows. `#/ballot/ca-fresno` has `[data-statewide-note]` containing the message and 14 statewide rows.
9. `[data-district-note]` is present on `#/find` and every ballot page.
10. Home:
    - It contains "has 9 counties and 101 cities and towns, according to".
    - The MTC and ABAG links are visible.
    - `[data-coverage-indicator] li` has 4 items, and its numbers equal values computed from data.
    - `main` has no `aria-live`.
    - Marin's coverage row contains "local candidate contests not collected yet".
11. "Change place" on Berkeley has the href `#/find?county=ca-alameda&city=ca-alameda-berkeley`.
12. On `#/item/2026-11-03.ca-sf-city.a`, "Not yet researched" does not appear and no gap is listed twice.
13. GoatCounter. Use `addInitScript` to define `window.goatcounter.count` after a delay, then check:
    - Exactly one call, with `title === "California Bay Area Ballot Guide"`, whose path does not contain "#".
    - On propositions.html the title is "Ballot Weighing Tool", plus the `used-tool` event.
    - Both script tags have `data-goatcounter-settings` containing `no_onload`, `src` ending in `count.v5.js`, and `integrity` plus `crossorigin`.
    - Update the network allowlist accordingly. gc.zgo.at is still the host.
14. Data failure: fulfill local-measures.json with 404. `[data-load-warning]` appears and 14 statewide rows still render. A region.json 404 gives no warning and still 9 counties.
15. propositions.html at 360 with `details.rubric` open: `scrollWidth <= clientWidth` and axe clean.
16. With JavaScript disabled, propositions.html has a `noscript` containing "needs JavaScript".
