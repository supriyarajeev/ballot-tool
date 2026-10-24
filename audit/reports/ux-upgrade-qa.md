# UX upgrade QA report (branch ux-upgrade, working tree)

Tester. Independent QA, did not build the site.
Date of test. October 23, 2026 (device date used by the key dates timeline).
Build under test. `/home/claude/site`, branch `ux-upgrade`, HEAD `1d10a70` (same commit as tag `beta-live-2026-10-23`) plus uncommitted changes to `assets/guide.css`, `assets/guide.js`, `data/elections.json`, `index.html`, `tests/browser/guide.test.cjs`, `tests/validator.test.mjs`, `tools/validate.mjs`, and new `data/bay-map.json`, `tools/build-map.mjs`.
How. Served with `python3 -m http.server 8812 --bind 127.0.0.1` (stopped by PID afterwards). Playwright 1.56 Chromium, every request to a host other than 127.0.0.1 answered with an empty body and recorded. Scripts lived in a scratch folder, no repo file was edited except this report. Screenshots are in `/tmp/qa-ux/`.

## Summary

The new visuals work. All nine map counties, all nine coverage bar links, every nav link, the home buttons and quick links, the About links, Find My Ballot for six counties, and the Show sources button on item, contest and candidate pages behaved correctly with mouse and keyboard. No horizontal scroll at 360, 768 or 1280 px in light or dark on eight routes. axe-core 4.10.2 found 0 violations on 13 routes at 1280 and 360 px in light and dark. No page errors, no missing assets, no new third party hosts. The Ballot Weighing Tool is byte for byte unchanged against HEAD and the beta tag, its full flow passed, and `node tests/scoring-regression.mjs` reported 0 differences.

The most serious problem is not new in this branch. The "Skip to content" link points at `#app`, which the hash router treats as a route, so using it replaces any page with "Not found" (UX-01, High). The skip link is also invisible when focused (UX-02). Findings that are new in this branch are all Low and concern small map targets, faint bar tracks, the 768 px timeline, and wording or provenance details.

| Severity | Count | New in this branch |
|---|---|---|
| Blocker | 0 | 0 |
| High | 1 | 0 |
| Medium | 1 | 0 |
| Low | 9 | 8 |

## Findings

### UX-01 High. Skip link opens a "Not found" page (pre-existing, not introduced here)
- Where. Every route of `index.html`, all viewports.
- Steps. Load `index.html`, `index.html#/about` or `index.html#/item/2026-11-03.ca-bayarea-rtm.measure-rtm`. Click the empty top left corner, press Tab (focus lands on "Skip to content"), press Enter.
- Result. Hash becomes `#app`, the router renders h1 "Not found" with "That page does not exist." on all three routes. Screenshot `/tmp/qa-ux/skiplink-notfound.png`.
- Cause. `index.html` line 14 `<a class="vh" href="#app">` and `route()` in `assets/guide.js` sends any unknown hash to `viewNotFound`. Same markup in tag `beta-live-2026-10-23` and `master`, so this predates the branch.
- Fix. Handle the skip link in JS (preventDefault, then `app.setAttribute("tabindex","-1"); app.focus()`), or make `route()` ignore hashes that do not start with `#/` and focus the matching element instead.

### UX-02 Medium. Skip link is invisible when focused (pre-existing)
- Where. All routes, 1280 px light checked by screenshot.
- Result. With focus on the skip link the computed outline is 3px solid, but the element keeps the `.vh` clip (1 by 1 px), so nothing is visible. Screenshot `/tmp/qa-ux/focus-skip-visible.png` shows no skip link. `assets/guide.css` has no `.vh:focus` rule. WCAG 2.4.7.
- Fix. Add a `.vh:focus, .vh:focus-visible` rule that restores size, position and background.

### UX-03 Low. First Tab after page load skips skip link, brand, nav and beta link (pre-existing)
- Where. Every fresh load of `index.html` with any route.
- Result. `focusTop()` focuses the h1 on initial load as well as on route changes. Measured after load, focus is on H1, the first Tab goes to the "Find My Ballot" hero button. Shift+Tab does reach beta link, About, Browse, Candidates, Ballot Weighing Tool, Find My Ballot, brand and skip link, in that order.
- Fix. Call `focusTop()` only on `hashchange`, not on the first render.

### UX-04 Low. San Francisco is a tiny map target and its label is not clickable (new)
- Where. Home map, all widths.
- Result. Rendered SF shape is 25x18 px at 360, 32x23 at 768, 29x20 at 1280. Clicking the label text of the other eight counties navigates (the label sits over the shape), but clicking the offset "San Francisco" label (with leader line) does nothing because labels have `pointer-events: none` and lie over water. Equivalent links exist in the coverage table, so the WCAG 2.5.8 equivalent exception applies.
- Fix. Put each label inside its county `<a>` with pointer events enabled, or add a transparent larger hit area for SF.

### UX-05 Low. Map labels are small on phones (new)
- Where. Home map at 360 px.
- Result. Labels are 12px in viewBox units, scaled to about 9.8 px on screen (12.6 px at 768, 11.3 px at 1280). Readable in `/tmp/qa-ux/home-360-dark-part0.png` but small. Label contrast is fine (11.3:1 light, 8.3:1 dark).
- Fix. Raise label size for narrow screens (for example 14 to 15 viewBox units under 480 px) or let the map grow taller.

### UX-06 Low. Coverage bar track is nearly invisible (new)
- Where. Home, "Local items listed in this guide, by county", light and dark.
- Result. The grey "listed, ballot question not collected yet" segment and its legend swatch measure 1.33:1 against the card in light and 1.34:1 in dark. Napa (4 listed, 0 with ballot question) shows only a faint sliver. All numbers are repeated as text, so this is not a WCAG failure, but the visual does not carry its meaning.
- Fix. Use a neutral at 3:1 or better against the card, or an outlined or hatched track.

### UX-07 Low. Contra Costa "Local contests listed 2" reads as started coverage (new display, existing count)
- Where. Home coverage bars, third column, and the existing "3 / 9 counties with local candidate contests listed" tile.
- Result. Contra Costa shows "2". Both are EBMUD Board of Directors Wards 3 and 7, special districts shared with Alameda. No Contra Costa county, city or school contest is listed. Rows with zero say "not collected yet", so "2" suggests Contra Costa's own contests were collected.
- Fix. Show for example "2 (EBMUD only, county and city contests not collected yet)", or count only contests whose jurisdiction lies inside the county.

### UX-08 Low. Key date texts say more than their stored quotes (new data)
- Where. `data/elections.json` keyDates, home "Key dates for this election".
- Result. Four claims are not in the stored quote. Oct 5 "secure ballot drop-off locations open". Oct 19 "you can still register conditionally". Nov 3 "Polls are open 7 a.m. to 8 p.m." and "Mailed ballots must be postmarked on or before this day". I fetched both Secretary of State pages on Oct 23, 2026 and each claim is stated there (for example "Secure ballot drop-off locations open by October 5.", "Polls are open from 7:00 a.m. to 8:00 p.m.", "You can 'conditionally' register and vote at your county elections office after the 15-day voter registration deadline."). Content is correct. The provenance record is incomplete, and the validator only checks that each quote names the date.
- Fix. Allow several quotes per entry and store the extra sentences, or trim the texts to what is quoted.

### UX-09 Low. "Vote threshold not collected yet" on all 14 statewide propositions (new wording)
- Where. Item pages, for example `#/item/2026-11-03.ca.prop-1`.
- Result. The new line shows "Vote threshold not collected yet." for all 14 statewide propositions and 56 local measures. Before this branch the clause was omitted. Statewide propositions pass by simple majority, so this reads as a gap a voter might worry about.
- Fix. Record the threshold for the 14 statewide items with an official source, or show the threshold clause only for local measures.

### UX-10 Low. Timeline is cramped at tablet width (new)
- Where. Home key dates at 768 px.
- Result. The horizontal layout starts at 760 px, giving six columns of 106 px. Each item is 361 px tall and labels wrap mid phrase ("Ballots in the / mail Passed"). Screenshot `/tmp/qa-ux/home-768-light-part1.png`. Readable, no overlap or clipping.
- Fix. Use three columns by two rows between 760 and about 1000 px, or move the breakpoint up.

### UX-11 Low. Map wording "see its ballot" (new)
- Where. Map figcaption "Choose one to see its ballot." and each county's accessible name "X County, see its ballot".
- Result. County pages list what this guide has collected, which is incomplete (the page itself says so). The hero note right beside the map mitigates this.
- Fix. "see its ballot items in this guide" or "see what this guide lists".

## What passed

Navigation and links (1280 px light unless stated)
- Top nav. Find My Ballot to `#/find`, Ballot Weighing Tool to `propositions.html`, Candidates to `#/contests`, Browse to `#/browse`, About to `#/about`. Brand link to `#/`. Beta notice link to `#/about`. Focus moved to the new h1 each time.
- Home. Both hero buttons, the three quick links, "Open the Ballot Weighing Tool", "How information is checked" and the Before you vote "Find My Ballot" link all reached the right route.
- Map. All nine `a.cty` links by click and by keyboard focus plus Enter reached the matching `#/ballot/<county>` page with the right h1. Clicking eight of nine labels also works (see UX-04 for SF).
- Coverage bars. All nine county links reached the right ballot page.
- Show sources. Tested on prop 1, three Alameda school measures, Measure RTM, Governor, SF Public Defender, and two Oakland mayor candidates, by click, Enter and Space. With the section first collapsed, each press opened `#sources`, scrolled it to the top and moved focus to its summary. The hash did not change. Exactly one `#sources` per page. Counts matched data (RTM "9 sources, 6 official", matching 6 Official and 3 Independent types). All 418 records have at least one source.
- Back and Home. Back from an item reached the previous ballot page via history. Back on a deep linked item opened in a fresh tab went to `#/find` as designed. Home links on About, Browse, Find and Statewide reached `#/`.
- About. All five in-page links (Home, Ballot Weighing Tool twice, How information is checked, Find My Ballot) worked.
- Find My Ballot. Alameda plus Oakland, San Francisco (single option "City and County of San Francisco", no city step needed), Santa Clara plus Unincorporated, Marin plus "I'm not sure", Sonoma plus Unincorporated, Contra Costa plus Richmond. Each reached the expected route and h1, for example `#/ballot/ca-santa-clara/unincorporated` "Ballot choices for unincorporated Santa Clara County". City lists showed 14, 15, 11, 9 and 19 cities plus Unincorporated and Not sure.
- Browse, contests (71 contest links), statewide (14 items) and candidate pages rendered. The only filter control found is the one input on ballot pages, which is unchanged in this branch.
- Measure types. Title case types display in sentence case ("Parcel Tax Measure" to "Parcel tax measure", "Town Charter and Property Transfer Tax Measure" to "Town charter and property transfer tax measure"). Mixed strings with proper nouns are left as is. The 24 measures with no type show "Type not collected yet."

Deep links, reload, history
- 13 routes loaded directly and after reload with the same h1 and title, including Oakland ballot, Santa Clara unincorporated, an item, Governor, a candidate, browse, contests, statewide, about, `#/nope` and an unknown item (both "Not found").
- Back through six in-app routes and forward again returned the exact sequence. Ballot page to Ballot Weighing Tool and browser Back restored `#/ballot/ca-sf`.

Ballot Weighing Tool
- `git diff HEAD --stat -- propositions.html` and `git diff beta-live-2026-10-23 --stat -- propositions.html` are both empty. There is no `main` branch in this repo. Against `master` (the Oct 22 baseline) the file differs by 115 insertions and 92 deletions, which is older release work already in HEAD, not this branch.
- 14 cards. Answered all 14 across all five answers. With Standard, Results first, Cost watcher, Equal and a custom set (net benefit 0, evidence 5, fiscal clarity 1) every card label matched its summary chip and the rule (oppose gives Leans toward NO, not sure gives Not sure, support needs 3.0 and strong support 2.0 for Leans toward YES, else Mixed / uncertain). 0 mismatches in 6 runs. Preset buttons all unpressed after a custom change.
- Arrow keys moved a slider (3 to 1). Reload kept custom weights and all 14 answers. All weights at 0 showed the zero warning, "Evidence not weighted", no NaN, and leans from preference only. "Reset to standard weights" restored 5,5,4,3,3,2,2. "Clear my answers" gave Not answered 14 and survived reload.
- `node tests/scoring-regression.mjs` output
  - `1008 scoring results compared, 0 differences.`
  - `1008 reason and limited-flag lines, 81 quality words, 14 limited-flag sets, 8 saved-state cases, 42 slider cases compared, 0 differences.`
  - exit code 0.

Layout (screenshots in `/tmp/qa-ux/`, named `<page>-<width>-<scheme>.png`)
- Home, about, Oakland ballot, RTM item, Oakland mayor contest, statewide, browse and tool at 360, 768, 1280 px in light and dark. `scrollWidth - clientWidth` was 0 in all 48 cases. No clipped elements. Map labels never overlap each other or leave the map. Timeline is a vertical list under 760 px and a row of six above. Coverage table fits its card at every width.

Keyboard and accessibility
- Tab order on home after the hero is logical. Hero buttons, quick links, the nine map counties (in data order), Census link, key date sources, regional sources, summaries, coverage county links, tool link, next step links, footer links. 44 stops, every one with a visible indicator. Map shapes get a 3 px ink stroke (dark navy in light, near white in dark), checked in `/tmp/qa-ux/focus-map-ca-sf-1280-light.png` and `focus-map-ca-alameda-360-dark.png`. Show sources has a 3 px outline with 2 px offset (`focus-showsources-dark.png`).
- axe-core 4.10.2 on home, about, find, browse, contests, statewide, SF ballot, Oakland ballot, RTM item, prop 40 item, Oakland mayor contest, Barbara Lee candidate and propositions.html, at 1280 and 360, light and dark, with all details opened. 0 violations in 52 runs. Only "incomplete" items were 13 color-contrast checks on home (map labels and nav, background not determinable). Manual contrast for those is 11.3:1 and 8.3:1 for map labels, and 4.85 to 8.0:1 for timeline text and tags.
- `npx html-validate index.html propositions.html` exit 0. The repo's own `tests/browser/guide.test.cjs` against my server gave 457 passed, 0 failed, with no repo file changed.
- Fallbacks. With `data/bay-map.json` returning 404, or containing a path with injected markup, the home page showed the nine county text links instead of the map, no load warning and no error. With the device date set to Nov 4, 2026 the first five dates show Passed and Nov 10 shows Next.

Console, errors and requests
- No page errors. No failed or 4xx/5xx requests to the local server from the site (one 404 to `/undefined` was caused by my own test script and is not a site issue). All `?v=2026-10-24` CSS and JS loaded.
- The only console error is Chromium rejecting my empty stand-in for `https://gc.zgo.at/count.v5.js` because it fails the pinned integrity hash. That is the integrity check working.

Privacy
- External hosts requested across every test. `fonts.googleapis.com` (`/css2`) and `gc.zgo.at` (`/count.v5.js`). `fonts.gstatic.com` was never requested because the stubbed CSS was empty. No other host. `data/bay-map.json` is local and the Census link is only an href.
- `countVisit()` in `assets/guide.js` sends `location.pathname` with unsafe characters stripped, plus the fixed title "California Bay Area Ballot Guide". With a stub GoatCounter I loaded `#/ballot/ca-sf/ca-sf-city` and moved through three more routes. Exactly one call was made, `{"path":"/index.html","title":"California Bay Area Ballot Guide"}`, even though the tab title had become "Ballot choices for Oakland, Alameda County". The tool sent `{"path":"/propositions.html","title":"Ballot Weighing Tool"}` plus the two fixed events `used-tool` and `finished-all-14`, no answers. I could not observe what the real GoatCounter script adds on its own (referrer, screen size) because it was blocked.

External official links
- Distinct external hrefs on home. census.gov carto boundary page, sos.ca.gov general election Nov 3 2026 page, sos.ca.gov election dates and resources, mtc.ca.gov what-mtc, abag.ca.gov history, dof.ca.gov E-1 2026 press release PDF, elections.cdn.sos.ca.gov 60-day report of registration county PDF, sos.ca.gov county elections offices, voterguide.sos.ca.gov, sos.ca.gov voter hotlines, voterguide.sos.ca.gov disabilities page.
- Distinct external hrefs on About. sos.ca.gov county elections offices, voterguide.sos.ca.gov, sos.ca.gov voter hotlines, voterguide.sos.ca.gov disabilities page.
- Reached and matching their labels. Both SOS key date pages (all six dates and quotes confirmed), voterguide.sos.ca.gov (Nov 3, 2026 General Election), county elections offices directory, voter hotlines ("ten languages"), disabilities assistance page, the SOS registration PDF (state total 23,164,977 as of Sept 4, 2026, matching the home tile), MTC ("101 cities and nine counties", matching the region card).
- Not reachable with my tools (allowlist or proxy 403), so not checked and not called broken. census.gov, the SF Voter Information Pamphlet PDF, sf.gov election page, Alameda voter profile lookup and acvote election page, vote.santaclaracounty.gov, abag.ca.gov, dof.ca.gov.

Content
- Map counties in `data/bay-map.json` are exactly the nine in `data/region.json` (Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Solano, Sonoma), each once, each linking to its own ballot.
- All six key dates match their quotes and their SOS pages, in order, ending at Nov 10 (see UX-08 for the extra sentences).
- Coverage bars add up. Bar totals are 148 listed and 89 with ballot question against 143 and 84 in "What's covered". The difference of 5 is Measure RTM counted in each of its five counties (4 extra) and Sonoma County Junior College District Measure AB counted in Sonoma and Marin (1 extra). The legend explains multi-county counting using RTM as its example.
- No text claims verification. Hero, beta notice, About and the coverage section all say coverage is incomplete and nothing is Verified.
