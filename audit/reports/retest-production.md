# Retest 3. Production readiness, privacy and smoke test

Date. October 23, 2026. Auditor. Retest 3 (independent, did not write any fix). Scope follows audit/reports/QA-BRIEF.md. Code under test is commit 7b9b06e on branch `bay-area-guide`, no tracked file modified before or after any run (`git status --short` showed only untracked retest reports, including those of the other retest auditors). The only repository file written is this report. Nothing was committed. Scratch files are in /tmp/qa-retest3/.

Method
- Server. `python3 -m http.server 18932` serving /tmp/qa-retest3/root, where `ballot-tool` is a symlink to the site, so pages load from `/ballot-tool/` as on GitHub Pages.
- Browser. Playwright 1.56 Chromium (/opt/pw-browsers). Every external request was answered locally and logged. Nothing reached the internet.
- Scripts. /tmp/qa-retest3/gc.cjs (PRD-01 stand-in, 74 scenarios, output gc.out and gc-results.json), /tmp/qa-retest3/prd.cjs (PRD-03 to PRD-11, output prd.out), /tmp/qa-retest3/smoke.cjs (smoke matrix, output smoke.out and smoke.json).
- Repository test suite. `node tests/run-all.mjs` passed every non-browser step. Its browser step failed only with `EADDRINUSE` on port 8791 (another process held the port). Rerun as `PORT=18931 node tests/browser/run.mjs` gave `guide browser tests. 304 passed, 0 failed`, `weighing tool browser tests. 224 passed, 0 failed`, `goatcounter stand-in tests. 124 passed, 0 failed` (exit 0). Output in /tmp/qa-retest3/npm-test.out and browser-test.out.

## 1. Stand-in count.js for PRD-01

My stand-in is independent of tests/browser/goatcounter.test.cjs. It copies count.js behavior as documented at https://www.goatcounter.com/help/js (settings from `data-goatcounter-settings` merged into `window.goatcounter`, one automatic pageview unless `no_onload`, click events bound unless `no_onload` or `no_events`, `count()` defaults path to `location.pathname + location.search`, title to `document.title`, referrer to `document.referrer`). It then really fires the beacon as an image request to the `data-goatcounter` endpoint with `p, t, r, e, s, b, q, rnd`. Playwright captures that request, so each record is the full beacon URL plus the `Referer` header the browser attached, which is everything GoatCounter would receive apart from IP and User-Agent.

Because both pages pin count.v5.js with SRI, the stand-in only runs when the `integrity` attribute is removed from the served HTML. That is the only change made, in flight, for the leak scenarios. Two further scenarios keep the attribute to show that the browser refuses a substituted script.

Each beacon was checked two ways. (1) Exact allowlist, title must be `California Bay Area Ballot Guide` (guide), `Ballot Weighing Tool` (tool), or one of the two event pairs, path must be `/ballot-tool/`, `/ballot-tool/index.html`, `/ballot-tool/propositions.html` or an event name, `q` must be empty. (2) Word-boundary search of `p`, `t`, `r`, `q` and `Referer` for every jurisdiction id and name except the state (county names with and without "County"), every measure id, short title and identifier, every contest id and office, every candidate id and name, the answer labels (`Strongly for`, `Against`, `Not sure`, `Support`, `Oppose`, `Leans YES` and so on), `prop-` and `#`.

Scenarios (count.js arrival delay in brackets)
- 32 deep links at 0 s and 3 s. Home, `#/`, `#/find`, `#/find?county=ca-alameda`, `#/statewide`, `#/browse`, `#/contests`, Oakland, SF, SF Proposition A, Prop 40, Governor contest, a candidate, Los Angeles County, and all 9 Bay Area counties plus one city in each.
- In-app navigation before count.js arrived (6 s). Home, then Find, Alameda, Berkeley, submit, a measure, a contest, a candidate. The page title at the end was `Prop 1. Affordable housing and veterans bond · California Bay Area Ballot Guide`.
- In-app navigation after count.js ran (0 s). Find, Contra Costa, a city, submit.
- Very slow script. Oakland deep link at 25 s (counted once, fixed title) and at 32 s (not counted, the 30 s polling cap expired, nothing sent).
- Ballot Weighing Tool. `propositions.html#prop-40` at 0 s and 4 s. Answer all 14 "Strongly for", Clear my answers, answer all 14 "Strongly against".
- Cross-page. Oakland ballot page then the nav link to the tool, and the Prop 40 item page then "Open Prop 40 in the full proposition tool".
- SRI kept (stand-in served unchanged) on Oakland and on the tool with all 14 answered.

Result. 74 scenarios, 77 beacons, 0 allowlist failures, 0 leak matches, 0 page errors. Every beacon was one of these five (count, exact JSON from /tmp/qa-retest3/gc-results.json)

```
69 {"e": "false", "p": "/ballot-tool/index.html", "q": "", "r": "", "referer": "http://127.0.0.1:18932/", "t": "California Bay Area Ballot Guide"}
 2 {"e": "false", "p": "/ballot-tool/propositions.html", "q": "", "r": "", "referer": "http://127.0.0.1:18932/", "t": "Ballot Weighing Tool"}
 2 {"e": "false", "p": "/ballot-tool/propositions.html", "q": "", "r": "http://127.0.0.1:18932/ballot-tool/index.html", "referer": "http://127.0.0.1:18932/", "t": "Ballot Weighing Tool"}
 2 {"e": "true", "p": "used-tool", "q": "", "r": "", "referer": "http://127.0.0.1:18932/", "t": "Answered at least one question"}
 2 {"e": "true", "p": "finished-all-14", "q": "", "r": "", "referer": "http://127.0.0.1:18932/", "t": "Answered all 14 questions"}
```

Notes
- The referrer from guide to tool is the guide URL with the fragment removed by the browser, so the place in the hash is not carried over.
- The Find form never puts a choice in `location.search`. `q` was empty in every beacon, including after submitting Find.
- No element in either page carries `data-goatcounter-click`, so no click events could be bound even without `no_onload`.
- In the tool, each event was sent once per browser across Clear and re-answer (deduplicated through `ballot-gc-sent-v1`). With storage blocked this dedupe fails (R3-01). The content sent stays fixed, so that is a counting issue, not a leak.
- SRI kept. The browser refused the stand-in, and the only console message was `Failed to find a valid digest in the 'integrity' attribute for resource 'https://gc.zgo.at/count.v5.js' with computed SHA-384 integrity '...'. The resource has been blocked.` No beacon was sent and the pages worked normally.
- Limit. The real count.v5.js could not be loaded (gc.zgo.at is refused by the shell proxy and is not on the WebFetch allowlist). The stand-in follows the documentation, not the real file.

### Integrity hash on count.v5.js

- Markup on both pages (index.html line 34, propositions.html line 1038) is `async src="https://gc.zgo.at/count.v5.js" crossorigin="anonymous" integrity="sha384-atnOLvQb9t+jTSipvd75X2yginT4PjVbqDdlJAmxMm+wYElFmeR6EmLP5bYeoRVQ"`. Both carry `data-goatcounter-settings='{"no_onload": true}'`.
- That value is character for character the value the integration lead reported (sha384-atnOLvQb9t+jTSipvd75X2yginT4PjVbqDdlJAmxMm+wYElFmeR6EmLP5bYeoRVQ). The markup matches.
- It also matches what the WebFetch reader returned for https://www.goatcounter.com/help/countjs-versions under "v5 (9 June 2025)", `integrity="sha384-atnOLvQb9t+jTSipvd75X2yginT4PjVbqDdlJAmxMm+wYElFmeR6EmLP5bYeoRVQ"`. The reader is a model, not a byte copy.
- I could not hash the live file myself (WebFetch returned `URL_NOT_ON_ALLOWLIST` for https://gc.zgo.at/count.v5.js, and the shell has no route out). The lead's browser check is reported to me, not reproduced. If the value were wrong, counting would stop and nothing would leak (shown by the SRI-kept scenarios).

## 2. Privacy text compared with behavior

index.html line 29, sentence by sentence

| Sentence | Observed | Match |
|---|---|---|
| "You never need to enter an address, name or contact details." | Find uses county radio buttons and a city select. No text input is required anywhere. | yes |
| "Your county and city or town choices stay in the page address after the # sign." | Routes are `#/ballot/<county>/<city>` and `#/find?county=...`. `location.search` stayed empty. | yes |
| "This site does not save them or send them anywhere," | Guide pages after Oakland and `#/find?county=ca-marin` had `{"ls":{},"ss":{},"ck":""}`. Data fetches carry no parameters. No beacon contained a place. | yes |
| "but like any web page your browser history keeps the address and the page title." | `document.title` names the place or item (guide.js line 716), for example `Ballot choices for Oakland, Alameda County · California Bay Area Ballot Guide`. | yes |
| "Your answers in the statewide proposition tool are saved only in this browser." | `ballot-weighing-v2` in localStorage. No beacon carries it. | yes |
| "The pages load fonts from Google Fonts and a visitor counter from GoatCounter, which receive standard request details such as your IP address." | Hosts contacted were `fonts.googleapis.com` and `gc.zgo.at` (plus `fonts.gstatic.com` preconnect, and the goatcounter.com beacon when the script runs). | yes |
| "GoatCounter counts one visit each time a page loads, using only that page's fixed name and title," | One beacon per page load with `p` = the page path and `t` = the fixed title. Hash route changes do not add visits. If count.js arrives after 30 s, no visit is counted (understates, never overstates). | yes |
| "plus the referring site, browser, screen size, language and country." | `r` is `document.referrer` (empty, or the guide URL without fragment), `s` is screen size, and the Referer header is origin only. Language and country come from request headers and IP on GoatCounter's side, which I could not observe. | yes, as far as observable |
| "In the proposition tool it also counts whether someone answered at least one question and all 14." | Events `used-tool` and `finished-all-14` with fixed titles. | yes |
| "It is never sent the part of the address after the #, so it does not receive your county, city or town, the items you open, your answers or your results." | 77 beacons, no `#`, no place, item, candidate or answer text. | yes |

propositions.html line 392 (`#privacy`), sentence by sentence

| Sentence | Observed | Match |
|---|---|---|
| "Your answers and weights are saved only in this browser's local storage so they are there when you return." | `ballot-weighing-v2` = `{"w":{...},"g":{"1":-2,...,"40":2,...}}`. Answers persisted across reload. | yes |
| "They are never sent anywhere, and the tool asks for no name or contact details." | No beacon carries answers or weights. No input for name or contact. | yes |
| "Clear my answers removes saved answers. Weights stay until you change them or pick Standard." | After Clear every `g` value is `null` and `w` is unchanged. | yes |
| "The page loads fonts from Google Fonts and a visitor counter from GoatCounter, and like any web request these send your IP address and browser details to those services." | Same hosts as the guide. | yes |
| "GoatCounter records one visit each time this page loads, using only the page's fixed name and title, plus the referring site, browser, screen size, language and country." | `p` = `/ballot-tool/propositions.html`, `t` = `Ballot Weighing Tool`. `r` empty or the guide URL without fragment. | yes |
| "It also records two anonymous counts, when someone answers at least one question and when someone answers all 14." | Yes. Normally once per browser. With storage blocked, sent again on every answer change (R3-01). | yes, with R3-01 |
| "It is never sent which propositions you open or how you answer." | Deep link `#prop-40` and all answers produced only fixed values. | yes |
| "Its privacy policy says it does not store IP addresses or set cookies." | Not re-checked against GoatCounter's policy in this retest. The page sets no cookie (`document.cookie` empty). | not re-checked |
| "This page keeps a small note in local storage so each count is sent only once." | True when storage works (`ballot-gc-sent-v1` = `{"used-tool":1}`). False when storage is blocked. See R3-01. | partly |
| "Source links take you to other websites only when you click them." | No request to any source host during any run. | yes |

## 3. Findings table (PRD-01 to PRD-12)

| Old id | Severity then | Status now | Evidence |
|---|---|---|---|
| PRD-01 | high, blocker | Fixed | Section 1. 74 scenarios with count.js at 0 s, 3 s, 4 s, 6 s, 25 s and 32 s, deep links into every Bay Area county and one city each, items, contests, candidates, in-app navigation, cross-page navigation and all 14 tool answers. Every beacon had a fixed title and path. Example with the page title naming Oakland at the time of counting gave `"p": "/ballot-tool/index.html", "t": "California Bay Area Ballot Guide"`. Code. `no_onload` on both tags. guide.js lines 86-94 and propositions.html lines 1027-1037 call `count({path: location.pathname (sanitized), title: <fixed>})`. |
| PRD-02 | medium | Partly fixed | Pinned to `count.v5.js` with `crossorigin="anonymous"` and the SHA-384 value above, which matches the lead's value and the GoatCounter docs (via reader). SRI enforced (stand-in refused). Still no Content-Security-Policy. fix-B-summary.md states the reason (inline scripts in propositions.html would need `'unsafe-inline'`). Live file hash not reproduced by me. |
| PRD-03 | medium | Fixed | JavaScript disabled. index.html shows "This guide needs JavaScript, and so does the statewide Ballot Weighing Tool. Without JavaScript, use the official California voter guide and your county elections office." propositions.html shows "This tool needs JavaScript to show the 14 propositions and work out your leans. Without JavaScript, read every statewide proposition in the official California voter guide." |
| PRD-04 | low | Not fixed (owner decision) | `git grep -niE 'supriya|rajeev'` hits README.md 5, docs/RELEASE-CHECKLIST.md 67 and 73, index.html 34, propositions.html 1038, tests/browser/lib.cjs 9, and the old report. The test file location moved from guide.test.cjs to lib.cjs. Rendered text does not contain the name. |
| PRD-05 | low | Fixed | Both privacy paragraphs now say the site does not save choices, that browser history keeps address and title, and list referring site, browser, screen size, language and country. Section 2 table matches behavior, except R3-01. |
| PRD-06 | low | Not fixed (optional, owner decision) | After Clear, `ballot-weighing-v2` keeps weights and null answers, and `ballot-gc-sent-v1` = `{"used-tool":1}` stays. No "remove all saved data" control (0 matches). The text discloses this, so no mismatch. |
| PRD-07 | low | Fixed | `#/item/%E0%A4%A` and `#/find?county=%E0%A4%A` on direct load show h1 `Not found`, "That page address is not valid." Setting the same hash after load shows h1 `Not found`. No pageerror. guide.js line 689 `dec()` with try/catch. |
| PRD-08 | low | Fixed | `#/candidate/constructor`, `/toString`, `/__proto__`, `#/contest/constructor`, `#/item/hasOwnProperty`, `#/ballot/constructor` all show `Not found`. `#/ballot/ca-alameda/constructor` shows "City or town not found". `#/find?county=constructor` shows Find with no county chosen. `DB.byId` and `DB.jur` are `Object.create(null)` with `own()` reads. |
| PRD-09 | low | Fixed | Oakland with 404 on local-measures gives 43 rows plus "Some information could not be loaded. Missing right now. local measures. ..." (wording quoted in full in prd.out), 404 candidates 48 rows plus warning, 404 contests 19 rows plus warning, truncated local-measures 43 rows plus warning. 404 on statewide, local and contests, or on jurisdictions, gives "Something went wrong loading the guide". Every fetch has a 20 s timeout (guide.js 98-107). No retry button (optional in the original). |
| PRD-10 | low | Partly fixed | tools/validate.mjs now rejects non-https values. On a copy of the repo (/tmp/qa-retest3/copy) I injected `javascript:` values. Output `ERROR data/jurisdictions.json jurisdictions.48.electionsUrl. URL is malformed or not https (javascript:alert(2))` and `ERROR ... items.0.detailUrl. URL is malformed or not https (javascript:alert(1))` plus `detailUrl must look like propositions.html#prop-N` (validator wording, colon replaced by a period here). guide.js line 573 checks the `detailUrl` scheme at render time, but `ext()` (line 79) still writes any URL into `href` without a scheme allowlist. Two current `electionsUrl` values stay http (ca-alpine, ca-mariposa) as documented exceptions, and they are now labeled "(http, not a secure link)". Data is repository-controlled, so no current exposure. |
| PRD-11 | low | Fixed | `main` has no `aria-live`. Only live region in the shell is `#q-status` on Find. After a route change focus is on the h1 (`H1 Find your ballot`). Screen reader not tested. |
| PRD-12 | low | Not fixed | docs/RELEASE-CHECKLIST.md lines 67-72 still list the upload set without `.nojekyll`. No tracked path begins with `_`, no case collisions, so a Jekyll build would still succeed, but `.md` files would be converted. audit/ (1.6 MB) is still published in full and now also holds scratch paths and session ids (R3-02). |

## 4. New findings

### R3-01. With browser storage blocked, the tool sends its two usage events again on every answer change
- Severity. low
- Affected. propositions.html lines 957-968 (`trackUse`), called from `renderAll` (line 1021). Privacy text line 392 "This page keeps a small note in local storage so each count is sent only once."
- Reproduction. Playwright context with an init script that makes `window.localStorage` throw. Stand-in count.js (integrity removed). Open propositions.html, answer all 14, then change two answers (16 clicks).
- Evidence (exact, /tmp/qa-retest3/prd.out). `STORAGE-BLOCKED cards. 14` and `STORAGE-BLOCKED events sent after 16 answer clicks. 19 {"used-tool":16,"finished-all-14":3} errs []` (colons in the log label replaced by periods). With working storage the same flow gives `["used-tool","/ballot-tool/propositions.html","/ballot-tool/propositions.html"]` (one event across a reload). Cause. `sent` is re-read from storage on every call, and `setItem` throws after `sent[key] = 1`, so nothing remembers the send.
- Impact. Counts are inflated for visitors who block site data. The content sent is the same fixed path and title, so nothing personal leaks and PRD-01 is unaffected.
- Expected. Each event at most once per page load even without storage, as the text says.
- Recommended correction. Keep a page-level `sent` object outside `trackUse` and merge stored values into it, or stop counting when storage is unavailable. This touches propositions.html script, so it needs the owner's approval under the "must not change behavior" rule (scoring is not involved).
- Blocks release. No.

### R3-02. Published audit files and commit messages carry agent scratch paths and session identifiers
- Severity. low
- Affected. audit/2026-10-23/fix-B-summary.md lines 11 and 15 (`<session scratch folder, not in the repo>/fixB/...`). audit/logs/2026-10-23-integration-1.log line 54 (`<repo>/tests/browser/goatcounter.test.cjs`). audit/reports/*.md (`<repo>`, `/tmp/qa-*`). All 7 commit messages end with `Claude-Session: https://claude.ai/code/session_01XpjEv1yn9Qq4G3hQ2rUn5J`.
- Evidence. `git grep -n "claude-0\|8fdb0247"` returns the two fix-B lines. `git log --format=%B | grep -c Claude-Session` gives 7.
- Not found. No API keys, tokens, private keys or passwords (`git grep -inE` for ghp_, github_pat_, sk-, AKIA, xox, PRIVATE KEY, api key, bearer, password, token=, secret; "secret" only matches Secretary). No phone numbers outside official data. Emails only `i@izs.me` in package-lock.json and `noreply@anthropic.com` in the old report. Every commit author and committer is `Claude <noreply@anthropic.com>`. No personal names of the owner beyond the account name in PRD-04.
- Impact. The paths and session link reveal tooling details, not secrets. The session link needs the owner's login to open. Commit messages only become public if git history is pushed. The checklist's web upload does not push history.
- Recommended correction. Owner decision. Accept, or strip the scratch paths from fix-B-summary.md and the log before upload, and push without history if the session link should stay private.
- Blocks release. No.

### R3-03. Ballot page heading drops the county for cities that share the county's name
- Severity. low
- Affected. assets/guide.js line 515 (`city.name.indexOf(short) >= 0 ? city.name : city.name + ", " + county.name`).
- Reproduction. Open `#/ballot/ca-napa/ca-napa-napa`, `#/ballot/ca-alameda/ca-alameda-alameda`, `#/ballot/ca-santa-clara/ca-santa-clara-santa-clara`, `#/ballot/ca-san-mateo/ca-san-mateo-san-mateo`, `#/ballot/ca-sonoma/ca-sonoma-sonoma`.
- Evidence (h1, exact). `Ballot choices for Napa`, `Ballot choices for Alameda`, `Ballot choices for Santa Clara`, `Ballot choices for San Mateo`, `Ballot choices for Sonoma`. The county pages read `Ballot choices for Napa County`. Other cities read, for example, `Ballot choices for Novato, Marin County`.
- Expected. The heading says which place it is, for example `Ballot choices for Napa, Napa County` or `the city of Napa`. The rule exists so San Francisco does not repeat its name, and it also catches these five cities.
- Recommended correction. Apply the short form only when the city is the consolidated city and county (`ca-sf-city`) or when `city.name === county.name`.
- Blocks release. No.

## 5. Smoke-test matrix

Widths. phone 390 x 844 (mobile, touch), tablet 768 x 1024 (touch), desktop 1280 x 800. 31 checks per width, 93 of 93 passed (/tmp/qa-retest3/smoke.out). Overflow was measured (`scrollWidth - clientWidth`) after every navigation and after opening every `<details>` on a measure page and on the tool. External requests were answered with an empty body, so the browser refused the empty count.v5.js on SRI grounds (25 such messages per width, the expected result of blocking). No other console message of type error, no pageerror, no failed or 4xx local request.

| Check | Phone | Tablet | Desktop | Detail (phone run) |
|---|---|---|---|---|
| Home loads | pass | pass | pass | h1 California Bay Area Ballot Guide |
| Nav, brand (#/) | pass | pass | pass | h1 California Bay Area Ballot Guide |
| Nav, Find My Ballot (#/find) | pass | pass | pass | h1 Find your ballot |
| Nav, Ballot Weighing Tool (propositions.html) | pass | pass | pass | h1 Ballot Weighing Tool |
| Nav, Candidates (#/contests) | pass | pass | pass | h1 Candidates and contests |
| Nav, Browse (#/browse) | pass | pass | pass | h1 Browse all available ballots |
| Find, Alameda, Livermore | pass | pass | pass | Ballot choices for Livermore, Alameda County, 38 rows |
| Find, Contra Costa, Moraga | pass | pass | pass | Ballot choices for Moraga, Contra Costa County, 32 rows |
| Find, Marin, Novato | pass | pass | pass | Ballot choices for Novato, Marin County, 35 rows |
| Find, Napa, Napa | pass | pass | pass | Ballot choices for Napa, 24 rows (see R3-03) |
| Find, San Francisco | pass | pass | pass | Ballot choices for City and County of San Francisco, 50 rows, url #/ballot/ca-sf |
| Find, San Mateo, Menlo Park | pass | pass | pass | Ballot choices for Menlo Park, San Mateo County, 38 rows |
| Find, Santa Clara, Monte Sereno | pass | pass | pass | Ballot choices for Monte Sereno, Santa Clara County, 34 rows |
| Find, Solano, Rio Vista | pass | pass | pass | Ballot choices for Rio Vista, Solano County, 28 rows |
| Find, Sonoma, Rohnert Park | pass | pass | pass | Ballot choices for Rohnert Park, Sonoma County, 33 rows |
| Ballot (Oakland) to a local measure | pass | pass | pass | #/item/2026-11-03.ca-alameda-oakland.measure-ee, h1 Measure EE. Charter Amendment Measure ... |
| Ballot to a contest | pass | pass | pass | #/contest/2026-11-03.ca.governor, h1 Governor |
| Contest to a candidate | pass | pass | pass | #/candidate/2026-11-03.ca.governor.xavier-becerra, h1 Xavier Becerra |
| Browse | pass | pass | pass | 10 rows |
| Contests | pass | pass | pass | 71 rows |
| Statewide | pass | pass | pass | h1 Statewide California propositions, 14 rows |
| Prop 40 item to full tool link | pass | pass | pass | lands on propositions.html#prop-40 |
| Tool shows 14 cards | pass | pass | pass | 1, 2, 3, 4, 5, 37 to 45 |
| Tool, answer all 14, results update | pass | pass | pass | answered 14, all 14 verdicts changed, tally from "Not answered 14" to "Leans YES 6, Leans NO 5, Mixed 0, Not sure 3, Not answered 0" |
| Tool, verdict sample | pass | pass | pass | 1 Leans toward YES, 2 Leans toward YES, 3 Not sure, 4 Leans toward NO, 5 Leans toward NO |
| Tool, weight change updates score | pass | pass | pass | Net benefit weight to 0, Prop 1 quality 3.2 of 5 Fair to 3.3 of 5 Solid |
| Tool, Clear my answers | pass | pass | pass | Not answered 14 |
| Tool home link to guide | pass | pass | pass | h1 California Bay Area Ballot Guide |
| Console and page errors | pass | pass | pass | none apart from the expected SRI refusal of the blocked script |
| External hosts contacted | pass | pass | pass | fonts.googleapis.com, gc.zgo.at only |
| No horizontal page scroll | pass | pass | pass | 0 overflow at every step |

Observation outside this audit's scope, not a finding here. The Berkeley ballot lists San Lorenzo Unified Measure J and Sunol Glen Unified Measure K under School district measures, labeled "May apply, check your sample ballot". That is the geography design (district boundaries not mapped), for the geography auditor to judge.

## 6. Repository safety and GitHub Pages compatibility

- Secrets. None found (R3-02 lists the patterns). 108 tracked files. node_modules/ is ignored.
- Personal data. Account name only (PRD-04). Scratch paths and session ids (R3-02). No addresses, phone numbers or private emails.
- Relative paths. All `href`, `src` and `fetch` paths are relative (`assets/guide.css`, `assets/guide.js`, `propositions.html`, `./`, `data/...`). Every data file listed in data/elections.json, plus data/region.json and data/jurisdictions.json, is tracked. All pages and data loaded under `/ballot-tool/` with no 404.
- Underscore folders. None (`git ls-files | grep '^_\|/_'` is empty). `.nojekyll` is tracked but missing from the checklist upload list (PRD-12).
- File case. No two tracked paths differ only by case. `Propositions.html` returns 404 on the case-sensitive server, and every reference uses the real case.

## 7. Release blockers

None remaining from this retest. PRD-01, the only blocker from the production audit, is fixed in every scenario I could construct. Two items depend on things I could not reach and should be settled by the owner before release, without blocking on my evidence.
1. The live count.v5.js hash. The markup matches the reported and documented value, but I could not hash the file. A wrong value fails closed (no counting, no leak).
2. Real count.v5.js behavior with `no_onload`. Tested against a documented stand-in only.

## 8. Summary

| Severity | Count | IDs |
|---|---|---|
| blocker | 0 | |
| high | 0 | |
| medium | 0 new | (PRD-02 remains partly fixed) |
| low | 3 new | R3-01, R3-02, R3-03 |

Old findings. Fixed 7 (PRD-01, 03, 05, 07, 08, 09, 11). Partly fixed 2 (PRD-02, PRD-10). Not fixed 3, all owner decisions or optional (PRD-04, PRD-06, PRD-12). Regressed 0.

## 9. Not checked, and why

- Real GoatCounter traffic, the real count.v5.js source and its SHA-384. gc.zgo.at and goatcounter.com are unreachable from the shell, and gc.zgo.at is not on the WebFetch allowlist.
- GoatCounter's privacy policy wording. Not re-read in this retest.
- What GoatCounter derives on its side (language, country) from headers and IP. Not observable locally.
- Live GitHub Pages (headers, Jekyll behavior, 404 page). Simulated with a case-sensitive local server under `/ballot-tool/`.
- Screen reader behavior (PRD-11) and real mobile browsers. Playwright Chromium emulation only.
