# Frontend, UX and accessibility QA (Agent 3)

Date: Oct 23, 2026. Auditor: Agent 3 (frontend, UX, accessibility). Scope: `index.html`, `assets/guide.js`, `assets/guide.css`, `propositions.html`, rendered in Chromium (Playwright 1.56.0, `/opt/pw-browsers`) with axe-core 4.10.2. Audit only. No repository file was changed except this report.

## Method

- Server: `python3 -m http.server 8790` from `<repo>`.
- Every non-`127.0.0.1:8790` request was blocked with `page.route` (fulfilled empty). Only fonts.googleapis.com and gc.zgo.at were blocked; no other external host was requested.
- Scripts (all in `/tmp/qa-agent3/`, outputs saved next to them):
  - `crawl.cjs` → `crawl.out`: breadth-first crawl from `#/` over every `#/...` link at 1280px; per route records console errors and warnings, `pageerror`, local HTTP status ≥ 400, badge text, the string "Needs human review", Not found pages, empty sections, h1 count, and source anchors.
  - `find.cjs` → `find.out`: Find Your Ballot flow, the city list for each county, reset, invalid ids, back and forward, keyboard, and district messaging.
  - `matrix.cjs` → `matrix.out`: 14 routes × widths 360/390/768/1280 × light/dark (`colorScheme` emulation). All `<details>` were opened, then axe ran, then the page was checked for horizontal overflow (`scrollWidth > clientWidth`) and console errors. Screenshots: `/tmp/qa-agent3/<route>-<width>-<theme>.png` for 360/768/1280.
  - `ov.cjs`, `ov2.cjs`, `ov3.cjs`, `ov4.cjs`: isolate the propositions.html overflow. `props.cjs`, `deep.cjs`: weighing tool interaction, axe and deep links. `misc.cjs`: miscellaneous checks.
  - Run as `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node /tmp/qa-agent3/<script>.cjs`.

## Results that passed (no finding)

Crawl output (`crawl.out`, verbatim):
```
routes crawled: 434 {"home":1,"find":59,"contests":1,"browse":1,"contest":67,"ballot":58,"candidate":183,"item":64}
badge texts: {"Needs review":1836,"Incomplete (required info or evidence is missing)":101}
badges not in allowed list: []
routes with 'Needs human review': []
internal links that render Not found: []
routes with console errors: []
routes with short body (<200 chars): []
routes with empty sections: []
routes with h1 count != 1: []
source anchors with non-http href or blank label: []
local HTTP >=400: []
blocked external hosts: [ 'fonts.googleapis.com', 'gc.zgo.at' ]
```
- Badge wording: only two labels occur in the rendered data, and both are on the allowed list. Every label in the `STATUS` map in guide.js lines 16-25 matches the allowed list exactly. "Needs human review" appears on 0 of 434 routes. An unknown status falls back to the Incomplete label (`badge()`, line 61).
- Every internal link reachable from home resolved. All 14 `propositions.html#prop-N` links and `#method` exist (cards are built at runtime). `deep.cjs` confirmed that the guide's "Open Prop N in the full proposition tool" link lands with the card top at 76px, at 390 and 1280, for Props 1, 41 and 45.
- External links: 235 in total. All open in a new tab with "(opens in a new tab)" text. Two use plain http (noted in FE-09).
- axe: 0 violations on all 14 routes × 4 widths × 2 themes (112 runs), with every `<details>` open. This includes color-contrast in dark mode.
- Console: no errors on any guide route. propositions.html logs one warning, `Couldn't load preload assets`, which comes from the test blocking Google Fonts. Not a site defect.
- Find Your Ballot. There are exactly 9 radio choices: Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Solano and Sonoma. They come from data (`region === "bay-area"`, guide.js line 145). The other 49 counties are in a separate select labeled "Or another California county", followed by "Outside the Bay Area, this guide covers statewide items only so far." No Bay Area county appears in the select. Labels: fieldset legend "2. Your county", `<label for=other>`, `<label for=city>` "3. Your city".
- City lists per county (from `find.out`): Alameda 14, Contra Costa 19, Marin 11, Napa 5, SF 1, San Mateo 20, Santa Clara 15, Solano 7, Sonoma 9, for 101 in total. Every list has an "Unincorporated area or not sure" first option. The counts match the commonly cited number of incorporated cities per county. I did not check them against an official list in this audit, so they are not verified. Non-Bay counties show "City list not collected for this county yet". The current text contains no disclosure that a list is incomplete, which is acceptable only if the lists are confirmed complete.
- Changing the county resets the city: `RESET after Alameda/Oakland -> Marin: city value=''`. Clearing the other-county select disables the city select and the submit button again.
- Invalid ids: `#/ballot/bogus`, `#/ballot/<city id>`, `#/item/bogus`, `#/contest/bogus`, `#/candidate/bogus` and `#/nope` all render "Not found" with a link to Find, and the document title is "Not found · …". For problems with valid-looking ids, see FE-03 and FE-04.
- Back and forward. Find → Berkeley ballot → "Change place" → Back returns to the Berkeley ballot. Back again returns to `#/find`. Forward returns to the ballot. On each route change, focus moves to the h1.
- Keyboard-only use worked. Arrow keys move between county radios. ArrowDown chooses a city. Enter on "Show my ballot choices" opens `#/ballot/ca-contra-costa/ca-contra-costa-brentwood` with focus on the h1. Enter on a group summary opens it. The skip link is the first Tab stop after the body. Each tabbable element showed a 3px solid outline (the hidden county radios show it on their span).
- District messaging. Every ballot page shows "This is a guide, not your official ballot. Your exact ballot depends on your street address." along with the county lookup or elections office link. Find shows "School, special and some county districts do not follow city lines … marks district items as "may apply"". District rows show "May apply, check your sample ballot". Counts of "May apply" rows per county: Alameda 17, CC 5, Marin 11, Napa 0, SF 13, SM 7, SC 7, Solano 2, Sonoma 8. Empty groups say "None collected yet. This does not mean nothing is on your ballot." or "No items of this type were found in the official measure list" when `listComplete`. Non-Bay counties say "Not yet researched for <County>. This does not mean nothing is on your ballot." Candidate groups carry a note on how much has been collected (`candNote`).
- propositions.html (`props.cjs`). Clicking "Support" on Prop 38 changed `#v-38` from "Not answered" to "Leans toward YES", the summary chip to match, the tally to "Leans YES 1 … Not answered 13", and "Answered" to 1. axe found 0 violations at 390 light and 1280 dark in the answered state. No console errors.
- Homepage coverage indicators come from data: the proposition count is `state.length`, the per-county status comes from `coverage.status` through the `COVERAGE` map, and the counts come from `countsFor()`. Hardcoded exceptions are listed in FE-07.

## Findings

Format for each finding: severity · affected file or record · reproduction · evidence (exact output) · expected · recommended correction · whether it blocks release.

### FE-01 · medium · propositions.html horizontally overflows at phone widths
- Affected: `propositions.html`. `.wrap` (line 57) is a grid with an implicit `auto` column. `<table class="rules">` at line 350 has no scroll wrapper. The rubric table at line 368 sits in `.tablewrap`, but it still widens the grid track.
- Repro: open `propositions.html` at a 360px viewport. Separately, open it at 390px and expand "See the rating rubric".
- Evidence (`ov.cjs`, `ov4.cjs`, `ov2.cjs`):
  ```
  360 closed: {"sw":368,"vw":360}
  hiding SECTION#method.panel method -> sw=360
  390 rubric: HEADER right=504 w=488 … (scrollWidth 504 > 390)
  matrix: propositions|360|light|504>360 … FAIL (also 390 light, 360/390 dark; all details opened)
  ```
  In the screenshot `/tmp/qa-agent3/propositions-360-default-viewport.png`, the step cards and the "How it works" box are cut off at the right edge. See also `/tmp/qa-agent3/propositions-360-light.png`. 768 and 1280 pass.
- Expected: no horizontal page scroll at 360 to 1280, in every disclosure state.
- Correction (CSS only, no change in behavior): give `.wrap` `grid-template-columns: minmax(0, 1fr)` (or `min-width: 0` on its children), and wrap the line-350 table in `.tablewrap`. Then rerun the 360 and 390 checks with the rubric open.
- Blocks release: no. Content can still be reached by scrolling sideways. Fix it before release if possible, because the brief says the tool's behavior must not change, and this is a layout-only fix.

### FE-02 · medium · "local contests listed" counts include a statewide-district contest and overstate local coverage
- Affected: `assets/guide.js` `countsFor()` lines 146-153, used by the homepage "Coverage by Bay Area county" list and by `#/browse`. Record `2026-11-03.ca-boe-2.member-state-board-of-equalization-district-2` (jurisdiction type `state-district`).
- Repro: open `#/`, then expand "Coverage by Bay Area county". Or open `#/browse`.
- Evidence (`find.out`):
  ```
  Marin County Measure list only 20 local measures listed · 1 local contest listed
  Napa County … 1 local contest listed   San Mateo … 1   Santa Clara … 1   Solano … 1   Sonoma … 1
  Contra Costa County Measure list only 13 local measures listed · 3 local contests listed
  ```
  A data check shows the counted contests. Marin, Sonoma and the others count only `…ca-boe-2…` `[state-district]`. Contra Costa counts BOE-2 plus EBMUD wards 3 and 7. Yet each of these counties has `inventory.contests: "not-collected"`, and its ballot page says "County, city, school and district contests … have not been collected yet". The contest filter excludes only `type === "state"`, not `state-district`.
- Expected: the label "local contests" counts only county, city and district contests. When none are collected, it says "local candidate contests not collected yet", which agrees with the inventory.
- Correction: in `countsFor`, also exclude `state-district` (and consider using `inventory.contests` for the wording). Regenerate any docs that quote these numbers.
- Blocks release: no. Still, it is a visible coverage claim that contradicts the county's own disclosure, so fix it before release.

### FE-03 · medium · Ballot page accepts a city from a different county and shows a false place name
- Affected: `assets/guide.js` `viewBallot()` line 267 (`city = cityId ? J(cityId) : null`, with no check of type or parent).
- Repro: open `#/ballot/ca-marin/ca-alameda-oakland` or `#/ballot/ca-alameda/ca-sf-city`.
- Evidence (`find.out`, screenshot `/tmp/qa-agent3/crosscounty-marin-oakland-390.png`):
  ```
  INVALID #/ballot/ca-marin/ca-alameda-oakland -> h1="Ballot choices for Oakland, Marin County"
  CROSS-COUNTY city groups: ['state:14','county:1','city:0','school:2','college:1','special:8','candidates:9']
  INVALID #/ballot/ca-alameda/ca-sf-city -> h1="Ballot choices for City and County of San Francisco, Alameda County"
  ```
  The page lists Marin County items under an Oakland heading.
- Expected: if the city does not exist, is not `type: "city"`, or its parent is not the county, show Not found or a notice ("That city is not in Marin County"), with a link to `#/find?county=<county>`.
- Correction: validate `city && city.type === "city" && city.parent === countyId` before using it.
- Blocks release: no. It can only be reached with a hand-edited or stale shared URL, but the h1 states something false.

### FE-04 · low · Unknown or invalid ids fail silently on ballot and find
- Affected: `assets/guide.js` `viewBallot()` and `viewFind()`.
- Evidence (`find.out`):
  ```
  INVALID #/ballot/ca-alameda/bogus-city -> h1="Ballot choices for Alameda County"   (no notice; misc.cjs: mention of unknown city: false)
  INVALID #/ballot/ca-alameda/ca-alameda-oakland/extra -> h1="Ballot choices for Oakland, Alameda County"
  INVALID #/find?county=ca-alameda-oakland -> {"checked":null,"city":"false:City list not collected for this county yet","go":false}
     after clicking enabled 'Show my ballot choices': hash=#/find?county=ca-alameda-oakland   (button enabled but does nothing)
  INVALID #/find?county=bogus -> nothing selected, no notice
  ```
- Expected: a short notice for an unknown city or county in the URL. On Find, a `county` value that is not a county is ignored, so the city select and the submit button stay disabled.
- Correction: in `viewFind`, only accept `params.county` when `J(id).type === "county"`. In `viewBallot`, show a notice when `cityId` is given but rejected.
- Blocks release: no.

### FE-05 · low · Homepage never says the region is nine counties; the county list is collapsed
- Affected: `assets/guide.js` `viewHome()` lines 170-190.
- Evidence (`find.out`, `misc.cjs`): `HOME mentions 9/nine counties: false`. `home visible text names counties without opening details: 0 of 9 county rows visible`. Above the fold, the tagline says "Your local and statewide ballot, explained with evidence." and the lede says "Find the measures and candidates on your ballot". The qualification ("Bay Area local coverage is partial and growing") only comes later, in "What is covered so far". I found no claim of coverage beyond the nine counties. The meta description says "statewide and Bay Area ballot measures and candidate contests".
- Expected: one visible sentence that names the region, for example "Local items cover the nine Bay Area counties (Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Solano, Sonoma); elsewhere in California, statewide items only." Build it from `counties()` so it cannot drift.
- Blocks release: no.

### FE-06 · low · San Francisco city list offers "Unincorporated area or not sure"
- Affected: `assets/guide.js` line 216 and `ca-sf-city`.
- Evidence: `SF city options: [ 'Unincorporated area or not sure', 'City and County of San Francisco' ]`. San Francisco is a consolidated city and county with no unincorporated area.
- Expected: for SF, either preselect the single city or use the placeholder "Choose your city".
- Blocks release: no.

### FE-07 · low · Hardcoded coverage and audit text that can drift from data
- Affected: `assets/guide.js` line 185 (home: "audited … on October 22, 2026"), line 255 (coverage box: "Audited on October 22, 2026"), and line 392 (`#/contests` intro listing "San Francisco and … Oakland, Berkeley, Hayward, Alameda, Albany, Emeryville, Piedmont, San Leandro, Union City and two EBMUD wards").
- Evidence: in `misc.cjs`/data, the jurisdictions with local contests today are SF (including supervisorial districts, SFUSD, the SF community college district and BART District 8), Oakland, Berkeley (including BUSD), Hayward, Alameda, Albany (including AUSD), Emeryville, Piedmont, Union City, San Leandro, and EBMUD wards 3 and 7. The text matches the data today, but it is not derived from the data.
- Expected: derive these from data (for example `elections.json` or `statewide-review.json` for the audit date, and the contest jurisdictions for the list), or add a validator check.
- Blocks release: no.

### FE-08 · low · Incomplete items fill empty sections with the wording of a different status
- Affected: `assets/guide.js` `field()` line ~133 ("Not yet researched for this item."). Example: `#/item/2026-11-03.ca-sf-city.a`.
- Evidence (`misc.cjs`): `SF Prop A 'Not yet researched for this item.' count: 8 | badge: Incomplete (required info or evidence is missing)`.
- Expected: avoid reusing the label of another status ("Not yet researched") for missing fields on an Incomplete or Needs review item. For example, use "Not filled in yet. See What is missing above."
- Blocks release: no.

### FE-09 · low · Duplicate gap entries in the "What is missing" box (data)
- Affected: `data/2026-11-03/local-measures.json`. 67 measures have more than one "Ballot question…" gap. Example: `2026-11-03.ca-sf-city.a`.
- Evidence:
  ```
  "Ballot question (exact wording from an official document)", "Fiscal effect …", "Vote threshold stated in an official document",
  "Summary of the official arguments for and against", "Ballot question", "Vote threshold (not stated in documents read)"
  measures with >1 Ballot question gap: 67
  ```
  Both versions are rendered to users in the status note.
- Expected: one entry per missing field.
- Correction: deduplicate in the tool that builds `gaps` (build-ledger or report). The data owner should do this; the auditor did not.
- Blocks release: no.

### FE-10 · low · Whole `<main>` is an aria-live region that is re-rendered on every route
- Affected: `index.html` line 24 (`<main class="wrap" id="app" aria-live="polite">`).
- Evidence: `main aria-live: polite`. Each route replaces `app.innerHTML`, and focus also moves to the h1. Screen readers may read out the whole new page and also the focused heading. I did not test this with a real screen reader, so the effect is unverified. axe does not flag it.
- Expected: remove `aria-live` from `<main>`. Keep moving focus to the h1, and keep the small `#q-status` live region.
- Blocks release: no.

### FE-11 · low · "Change place" loses the chosen city
- Affected: `assets/guide.js` line 294.
- Evidence: `CHANGE PLACE link -> hash=#/find?county=ca-alameda county checked=ca-alameda city value=''` (came from Berkeley).
- Expected: pass `&city=<id>` and preselect it.
- Blocks release: no.

### FE-12 · low · Two county election links use plain http
- Affected: `data/jurisdictions.json` lines 1101 (`ca-alpine` electionsUrl `http://www.alpinecountyca.gov/index.aspx?NID=388`) and 1630 (`ca-mariposa` `http://www.mariposacounty.org/87/Elections`). They are shown on `#/ballot/ca-alpine` and `#/ballot/ca-mariposa`.
- Evidence: crawl `external link count: 235 non-https: [ 'http://www.alpinecountyca.gov/index.aspx?NID=388', 'http://www.mariposacounty.org/87/Elections' ]`. I did not check whether https versions exist, because the shell has no web access and I did not spend web budget on it.
- Expected: https URLs where the official site supports them.
- Blocks release: no.

## Route / width / theme matrix (`matrix.out`)

"pass" means all three of the following: no horizontal overflow with every `<details>` open, 0 axe violations, and 0 console errors. Routes: home `#/`; find `#/find`; find-alameda `#/find?county=ca-alameda`; ballot-oakland `#/ballot/ca-alameda/ca-alameda-oakland`; ballot-sf `#/ballot/ca-sf/ca-sf-city`; ballot-fresno `#/ballot/ca-fresno`; item-state `#/item/2026-11-03.ca.prop-1`; item-local-incomplete `#/item/2026-11-03.ca-sf-city.a`; contest `#/contest/2026-11-03.ca-alameda-oakland.mayor`; candidate `#/candidate/2026-11-03.ca-alameda-oakland.mayor.julius-robinson`; contests; browse; notfound `#/nope`; propositions `propositions.html`.

| Route | 360 light | 390 light | 768 light | 1280 light | 360 dark | 390 dark | 768 dark | 1280 dark |
|---|---|---|---|---|---|---|---|---|
| home | pass | pass | pass | pass | pass | pass | pass | pass |
| find | pass | pass | pass | pass | pass | pass | pass | pass |
| find-alameda | pass | pass | pass | pass | pass | pass | pass | pass |
| ballot-oakland | pass | pass | pass | pass | pass | pass | pass | pass |
| ballot-sf | pass | pass | pass | pass | pass | pass | pass | pass |
| ballot-fresno | pass | pass | pass | pass | pass | pass | pass | pass |
| item-state | pass | pass | pass | pass | pass | pass | pass | pass |
| item-local-incomplete | pass | pass | pass | pass | pass | pass | pass | pass |
| contest | pass | pass | pass | pass | pass | pass | pass | pass |
| candidate | pass | pass | pass | pass | pass | pass | pass | pass |
| contests | pass | pass | pass | pass | pass | pass | pass | pass |
| browse | pass | pass | pass | pass | pass | pass | pass | pass |
| notfound | pass | pass | pass | pass | pass | pass | pass | pass |
| propositions | FAIL (overflow) | FAIL (overflow) | pass | pass | FAIL (overflow) | FAIL (overflow) | pass | pass |

In addition, all 434 crawled routes passed at 1280 light: no console errors, no Not found pages, no empty sections, exactly one h1, and only allowed badge wording.

Screenshots: `/tmp/qa-agent3/` (89 PNGs), including `<route>-{360,768,1280}-{light,dark}.png`, `propositions-360-default-viewport.png`, `propositions-390-rubric-open.png`, `crosscounty-marin-oakland-390.png` and `deeplink-prop41-{390,1280}.png`.

## Summary of findings by severity

| Severity | Count | Ids | Blocks release |
|---|---|---|---|
| Blocker | 0 | none | |
| High | 0 | none | |
| Medium | 3 | FE-01, FE-02, FE-03 | No (fix before release recommended) |
| Low | 9 | FE-04 to FE-12 | No |

## What I could not check, and why
- Real screen reader behavior (NVDA, VoiceOver): none is available in the container. FE-10 is inferred from the markup.
- Real fonts: Google Fonts was blocked by design, so layout was tested with fallback fonts. Overflow with Public Sans or Atkinson may differ slightly.
- Safari, Firefox and real mobile devices: only Chromium was tested.
- Whether city lists, links and county lookup URLs are factually correct: these were checked only for presence and format. Web verification belongs to the data and geography auditors. Nothing here is marked Verified.
- External link liveness (235 URLs): not fetched. The shell has no web access, and the shared web budget is limited.
