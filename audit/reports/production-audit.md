# Production readiness and privacy audit (Agent 5)

Date. October 23, 2026. Scope. Working tree of <repo> on branch `bay-area-guide` (HEAD 3d4a73f, same as tag `baseline-2026-10-23`; only `audit/logs/` and `audit/reports/` are untracked). Audit only. No repository file was changed except this report. Scratch files are in /tmp/qa-agent5/.

Method. Code reading of index.html, assets/guide.js, assets/guide.css, propositions.html, data/, docs/, tools/, tests/, audit/. Playwright 1.56 Chromium (/opt/pw-browsers) against a local static server that serves the site under `/ballot-tool/` (symlink /tmp/qa-agent5/root/ballot-tool). Every external request was logged and aborted. For the GoatCounter test, `https://gc.zgo.at/count.js` was replaced by a stub that records `location` and `document.title` at the moment the script runs, which is what the real script reads by default (see PRD-01). Script. /tmp/qa-agent5/audit.cjs. Full output. /tmp/qa-agent5/audit.out.

## 1. External requests at runtime

Observed with Playwright (requests aborted, URLs logged), identical for `index.html` (home and `#/ballot/ca-alameda/ca-alameda-oakland`) and `propositions.html`.

| Resource | URL | Seen how |
|---|---|---|
| Stylesheet | `https://fonts.googleapis.com/css2?family=Public+Sans:wght@500;700;800&family=Atkinson+Hyperlegible:wght@400;700&family=IBM+Plex+Mono:wght@500&display=swap` | Playwright log |
| Script | `https://gc.zgo.at/count.js` (unversioned, no `integrity`) | Playwright log |
| Preconnect | `https://fonts.googleapis.com`, `https://fonts.gstatic.com` | Code (index.html 8-9, propositions.html 7-8). The proxy reported `connect_rejected` for fonts.googleapis.com and gc.zgo.at, so connections were attempted. |
| Font files | `https://fonts.gstatic.com/s/...` | Code inference only. Not observed because the CSS was blocked. |
| Count beacon | `https://supriyarajeev.goatcounter.com/count?...` (from `data-goatcounter`) | Code only. The real count.js could not be loaded (blocked). |

No fetch/XHR to any other host. Local fetches are `data/elections.json`, `data/jurisdictions.json`, `data/2026-11-03/{statewide,local-measures,contests,candidates}.json`. No images, no other beacons. guide.css has no `url()` or `@import`.

## 2. Storage observed

| Page | localStorage | sessionStorage | Cookies |
|---|---|---|---|
| index.html (any route) | none | none | none |
| propositions.html | `ballot-weighing-v2` = `{"w":{"nb":5,...},"g":{"40":2,...}}` (weights and per-proposition support or opposition) | none | none |
| propositions.html after the first answer, with a GoatCounter stub present | adds `ballot-gc-sent-v1` = `{"used-tool":1}` | none | none |

`ballot-weighing-v2.g` is a political preference record (for example `"40":2` = Strongly support). It is disclosed in the privacy section (propositions.html line 383). After "Clear my answers" every `g` value becomes `null`, the key stays with the weights, and `ballot-gc-sent-v1` stays (see PRD-06). With localStorage throwing, the tool still renders all 14 cards (try/catch works).

## 3. Privacy text compared with behavior

index.html footer (line 29)
- "You never need to enter an address, name or contact details." Matches.
- "Your county and city choices stay in the page address after the # sign and are not stored." Not stored by the page, which matches. The browser history keeps the URL and the page title (which names the place). See PRD-05.
- "Your answers in the statewide proposition tool are saved only in this browser." Matches.
- "...load fonts from Google Fonts and a visitor counter from GoatCounter, which receive standard request details such as your IP address." Matches.
- "GoatCounter counts page visits and, in the proposition tool, whether someone answered at least one question and all 14." Matches (events `used-tool`, `finished-all-14`, propositions.html 955-958).
- "It is not set up to record your county, city, answers or results." Does not always hold. See PRD-01.

propositions.html privacy (line 383)
- Answers and weights only in local storage, never sent, no name or contact asked, Clear my answers removes answers, weights stay. All match.
- "GoatCounter records the page visit, referring site, browser, screen width and country, plus two anonymous counts". Matches the code paths. GoatCounter's own privacy page (https://www.goatcounter.com/help/privacy, read through the WebFetch reader, not verbatim) also lists language, and the JS API sends the page title. See PRD-05.
- "Its privacy policy says it does not store IP addresses or set cookies." The reader returned the policy sentence "doesn't store IP addresses, the full User-Agent header, or any tracker ID" and that it "doesn't store any information in the browser with cookies, localStorage, cache, or any other method". The page's statement is consistent. The excerpt came through the WebFetch reader and is not Verified.

## 4. Findings

### PRD-01. Page title sent to GoatCounter can contain the visitor's county, city or the measure they opened
- Severity. high
- Affected. index.html line 34 (GoatCounter tag), assets/guide.js line 441 (`document.title = h1.textContent + ...`).
- Reproduction. Open `index.html#/ballot/ca-alameda/ca-alameda-oakland` with count.js arriving 2 s after the page (stub, /tmp/qa-agent5/audit.cjs). Repeat with a measure deep link.
- Evidence (exact output)
  - count.js runs immediately: `{"path":"/ballot-tool/","hash":"#/ballot/ca-alameda/ca-alameda-oakland","title":"California Bay Area Ballot Guide","ref":""}`
  - count.js runs after 2 s: `{"path":"/ballot-tool/","hash":"#/ballot/ca-alameda/ca-alameda-oakland","title":"Ballot choices for Oakland, Alameda County · California Bay Area Ballot Guide","ref":""}`
  - Measure deep link, after 2 s: `"title":"Measure RTM. Regional transit sales tax (Public Transit Revenue Measure) · California Bay Area Ballot Guide"`
  - GoatCounter JS API documentation (https://goatcounter.com/help/js, read through the WebFetch reader): "Human-readable title. Default is `document.title`." Path default "`location.pathname + location.search`", so the hash itself is not sent.
- Why it happens. count.js is `async` and counts when it executes. The guide sets the title right after its JSON loads. Whichever finishes first decides the title. A cached count.js usually wins, a slow or blocked-then-retried count.js, a warm data cache, or a deep link from a share can lose the race.
- Expected. The footer says GoatCounter "is not set up to record your county, city". The title sent should never name a place or item.
- Recommended correction. Add `data-goatcounter-settings='{"no_onload":true}'` to both tags and count manually with a fixed title, for example `goatcounter.count({path: location.pathname, title: "Guide"})` once count.js loads (or set `window.goatcounter = {title: "California Bay Area Ballot Guide"}` style settings if supported by the pinned version). Retest with the stub at 0 s and 2 s.
- Blocks release. Yes. The published privacy statement is false in a reproducible case on a political information site.

### PRD-02. Unpinned third-party script runs with access to stored political preferences, no SRI, no CSP
- Severity. medium
- Affected. index.html line 34, propositions.html line 1018 (`src="https://gc.zgo.at/count.js"`, no `integrity`, no `crossorigin`). No Content-Security-Policy meta in either page.
- Reproduction. Read the tags. Any script on the origin can read `localStorage["ballot-weighing-v2"]`.
- Evidence. Section 2 shows the stored `g` preferences. GoatCounter docs (reader output): "there are a stable versions that can use subresource integrity."
- Expected. A third-party script that can read a visitor's stored support or opposition for each proposition should be pinned.
- Recommended correction. Use GoatCounter's versioned script with its published `integrity` hash and `crossorigin="anonymous"`, or self-host a pinned copy under `assets/`. Optionally add a CSP meta limiting `script-src` to `'self'` plus that file and `connect-src`/`img-src` to the GoatCounter endpoint.
- Blocks release. No (recommended before release).

### PRD-03. No-JavaScript visitors get no proposition content, and the index noscript message points them to a page that also needs JavaScript
- Severity. medium
- Affected. index.html line 25; propositions.html (no `<noscript>`; cards are built by script into `#props`).
- Reproduction. Playwright context with `javaScriptEnabled:false`, open both pages.
- Evidence. `== NOJS .../propositions.html len 7581 ...` then `props cards text present? false noscript: 0`. index.html shows "This guide needs JavaScript. You can still read the statewide propositions and use the official California voter guide."
- Expected. Either the proposition page states that it needs JavaScript, or the index noscript text does not promise readable propositions.
- Recommended correction. Add a `<noscript>` to propositions.html naming the official voter guide, and reword index.html line 25 (for example drop "You can still read the statewide propositions").
- Blocks release. No.

### PRD-04. Owner's account name appears in published files
- Severity. low
- Affected. index.html line 34 and propositions.html line 1018 (`data-goatcounter="https://supriyarajeev.goatcounter.com/count"`, page source, not rendered text); README.md line 5; docs/RELEASE-CHECKLIST.md lines 67 and 73; tests/browser/guide.test.cjs line 95. All are published by GitHub Pages because the whole repository is served.
- Evidence. `grep -niE 'supriya|rajeev'` over `git ls-files` returns exactly these lines. Rendered page text of both pages does not contain the name.
- Note. The `supriyarajeev.github.io` host and the repository URL expose the same account name regardless, so this can be reduced but not removed without a different account, organization or custom domain.
- Recommended correction. Owner decision. If the name must not appear, use a neutral GoatCounter site code and an organization or custom domain, and remove the account from README and docs.
- Blocks release. No (owner decision).

### PRD-05. Privacy wording is less precise than behavior
- Severity. low
- Affected. index.html line 29; propositions.html line 383.
- Evidence. (a) "are not stored" while the place name sits in browser history and in `document.title` (guide.js 441). (b) The propositions text lists "screen width and country" but not the page title (sent by default, see PRD-01) or language (listed by GoatCounter's privacy page per the reader).
- Recommended correction. After fixing PRD-01, say "are not saved by this site" and add "page title" and "language" to the GoatCounter list, or turn off what is not wanted.
- Blocks release. No.

### PRD-06. Stored preferences cannot be fully cleared from the page
- Severity. low
- Affected. propositions.html lines 927-933 (reset), 948-959 (`ballot-gc-sent-v1`).
- Evidence. Section 2. After "Clear my answers", `ballot-weighing-v2` remains with weights and null answers, and `ballot-gc-sent-v1` remains.
- Expected. On shared computers a visitor may want to remove everything. The text discloses the current behavior, so this is not a mismatch.
- Recommended correction. Optional "Remove all saved data" control that calls `localStorage.removeItem` for both keys. Would change propositions.html behavior, so it needs the owner's approval.
- Blocks release. No.

### PRD-07. Malformed percent-encoding in the hash breaks routing
- Severity. low
- Affected. assets/guide.js lines 428-429 (`decodeURIComponent` without try/catch).
- Reproduction. Load `index.html#/item/%E0%A4%A` directly, and set the same hash after the page has loaded.
- Evidence. Direct load shows `Something went wrong loading the guide / URI malformed. Please refresh the page.` After load, `pageerror: URI malformed` and the previous view stays while the address changed.
- Recommended correction. Wrap the decode in try/catch and call `viewNotFound`.
- Blocks release. No.

### PRD-08. Object prototype names resolve as records
- Severity. low
- Affected. assets/guide.js line 362 (`DB.byId` is a plain object).
- Reproduction. `#/candidate/constructor`, `#/candidate/toString`.
- Evidence. h1 `Object` and h1 `toString`, rendered as an "Incomplete" candidate page. `#/candidate/__proto__`, `#/contest/constructor` and `#/item/...` correctly show Not found. No script execution.
- Recommended correction. Use `Object.create(null)` for `DB.byId` and `DB.jur`, or check `hasOwnProperty`.
- Blocks release. No.

### PRD-09. One failed data file takes down the whole guide; no timeout
- Severity. low
- Affected. assets/guide.js lines 75-91, 445-448.
- Evidence. 404 on `local-measures.json` or `candidates.json` shows `Something went wrong loading the guide / data/2026-11-03/local-measures.json returned 404. Please refresh the page. The statewide proposition tool still works on its own.` Truncated JSON shows the parser message. Network failure shows `Failed to fetch`. Error text is escaped. With 4 s server delay per data request the page showed `Loading ballot information...` (role=status) and rendered after 8123 ms (two sequential fetch rounds). No timeout or retry.
- Recommended correction. Optional. Render statewide items when only local or candidate files fail, add a retry button. Messages are acceptable as is.
- Blocks release. No.

### PRD-10. Link schemes are not checked at render time; two http links
- Severity. low
- Affected. assets/guide.js lines 130, 137-138, 325 (only the candidate `block()` at line 365 checks `^https?:`). tools/validate.mjs enforces https for source, lookup, statement and finance URLs but not `detailUrl`. data/jurisdictions.json `ca-alpine` electionsUrl `http://www.alpinecountyca.gov/index.aspx?NID=388` and `ca-mariposa` `http://www.mariposacounty.org/87/Elections` (documented exceptions, validator INFO line in audit/logs/2026-10-23-baseline-npm-test.log).
- Evidence. Script /tmp/qa-agent5/urls.cjs. https 1059, http 2, relative 14 (`propositions.html#prop-N`), no `javascript:` or other schemes.
- Recommended correction. Add a scheme check for `detailUrl` in validate.mjs (relative or https only). Data is repository-controlled, so no current exposure.
- Blocks release. No.

### PRD-11. The whole main region is a live region
- Severity. low
- Affected. index.html line 24 (`<main ... aria-live="polite">`).
- Evidence. Code reading. Every route replaces `#app.innerHTML`, so assistive technology may read the entire new page, in addition to the focus moved to the h1 (guide.js 140-143). Not tested with a screen reader.
- Recommended correction. Remove `aria-live` from `main` and keep the dedicated status elements (`#q-status`, the loading `role=status`).
- Blocks release. No.

### PRD-12. Deploy procedure and published file set
- Severity. low
- Affected. docs/RELEASE-CHECKLIST.md lines 67-72.
- Evidence. The upload list omits `.nojekyll`. No folder or file starts with `_` and no tracked file contains `{{` or `{%`, so a Jekyll build would still succeed, but `.md` files would be converted. Web upload does not delete files removed from the repo. Everything tracked is published, including audit/ (1.3 MB, raw agent JSON and briefs), tools/, tests/, data/evidence.json (1.87 MB) and data/evidence-claims.json (1.14 MB). None of it is sensitive. `node_modules/` is in .gitignore.
- Recommended correction. Add `.nojekyll` to the upload list. Accept or exclude raw audit files by policy.
- Blocks release. No.

## 5. Checks with no finding

- XSS. Every `innerHTML` in guide.js (lines 76, 170, 195, 216, 293, 317, 345, 367, 391, 402, 420, 447) and propositions.html (843, 848, 872, 973, 991, 992, 994) builds data through `esc()`. guide.js `esc` escapes `& < > " '`. propositions.html `esc` escapes `& < > "` (no `'`), and every attribute there is double-quoted, so this is safe. Constant HTML (badges, `fw-status`, tally) contains no data. The `after` argument to `statusNote` is built from escaped parts.
- Hash payloads tried (all rendered as text, no dialog, zero injected `img/svg/script` in `#app`). `#/item/<img src=x onerror=alert(1)>`, `#/ballot/"><svg onload=alert(2)>`, `#/ballot/ca-alameda/"><img ...>` (ignored, county shown), `#/find?county="><img ...>`, `#/find?county=ca-alameda'">`, `#/contest/javascript:alert(5)`, `#/<script>alert(6)</script>`.
- Search box. `<img src=x onerror=alert(7)>` and `"><svg onload=alert(8)>` give `0 matching items`, no elements injected. The value is only compared with `data-search`.
- `target="_blank"`. All occurrences (index.html 1, propositions.html 3 static plus generated source links, guide.js 5) carry `rel="noopener"`. Cross-origin referrers send only the origin under the default policy.
- Paths for `/ballot-tool/`. No leading-slash `href`, `src` or `fetch` paths. All data paths in data/elections.json are relative. Asset names are lowercase and match references. Wrong case (`Propositions.html`, `assets/Guide.js`) returns 404, as on GitHub Pages. Hash routes never reach the server. A path-style URL (`/ballot-tool/ballot/ca-alameda`) returns 404 (no 404.html, acceptable).
- Secrets. No API keys, tokens, private keys or passwords in tracked files (grep for key, token, password, bearer, ghp_, github_pat_, sk-, AKIA, PRIVATE KEY, xox; "secret" only matches "secretary-of-state").
- Personal data. No phone numbers. Only email is `i@izs.me` in package-lock.json (public npm package metadata). No local filesystem paths (`/home/...` hits are URL paths of county sites). Commit author and committer on every commit are `Claude <noreply@anthropic.com>`. audit/logs/2026-10-23-baseline-npm-test.log (untracked) contains no paths or names.
- Storage disabled. propositions.html renders all 14 cards when `localStorage` throws.

## 6. Release blockers

1. PRD-01. The privacy statement "It is not set up to record your county, city" is contradicted when count.js runs after the guide sets a place or item page title. Fix the GoatCounter call to send a fixed title, then retest.

## 7. Summary

| Severity | Count | IDs |
|---|---|---|
| blocker | 0 | |
| high | 1 | PRD-01 (blocks release) |
| medium | 2 | PRD-02, PRD-03 |
| low | 9 | PRD-04 to PRD-12 |

## 8. Not checked, and why

- Real requests to Google Fonts and GoatCounter. External hosts are refused by the environment proxy (`connect_rejected`), so the real count.js, its beacon parameters and font file URLs were not observed. Behavior of count.js was taken from GoatCounter's documentation via the WebFetch reader. The raw count.js source URL was not on the fetch allowlist.
- GoatCounter's privacy policy wording was read through the WebFetch reader, which paraphrases. Not verbatim, not Verified.
- Live GitHub Pages deployment (headers, 404 page, Jekyll behavior) was not reachable. Behavior was simulated with a local case-sensitive server under `/ballot-tool/`.
- Screen-reader behavior for PRD-11 was not tested.
