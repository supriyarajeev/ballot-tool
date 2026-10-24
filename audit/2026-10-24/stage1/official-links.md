# Official voter-resource links, Stage 1 (read only)

Scope. Official California Secretary of State (SOS) voter-resource pages for the November 3, 2026 General Election that the site should link to, checked against the links the site already has.
Pages fetched October 23 to 24, 2026 with WebFetch. `curl` from this container is refused by the proxy for every sos.ca.gov host (CONNECT 403), so all checks below come from WebFetch or WebSearch.
No repository file was changed except this report.

## Summary table

| # | Resource | Proposed URL | Verified | Already on site | Proposed placement | Confidence |
|---|---|---|---|---|---|---|
| 1a | Official Voter Information Guide home | https://voterguide.sos.ca.gov/ | yes (Nov 3, 2026) | yes | keep as is | high |
| 1b | Propositions index | https://voterguide.sos.ca.gov/propositions/ | yes (Nov 3, 2026) | per-prop pages yes, index no | Statewide page, propositions.html header | high |
| 1c | Candidate statements index | https://voterguide.sos.ca.gov/candidates/ | yes (Nov 3, 2026) | per-office pages in candidates.json, index no | Contests page, About | high |
| 1d | Audio, large print, PDF and other languages | https://voterguide.sos.ca.gov/en/alt-versions/ | yes (Nov 3, 2026) | no | Before you vote, About, propositions.html | high |
| 1e | American Sign Language guide | https://voterguide.sos.ca.gov/asl/ | yes (Nov 3, 2026) | no | About only | medium |
| 2a | Register to vote online | https://registertovote.ca.gov/ | unreachable | no | Before you vote, About | medium |
| 2b | Same Day (Conditional) Voter Registration | https://www.sos.ca.gov/elections/voter-registration/same-day-reg | yes (evergreen) | no | Before you vote, About | high |
| 2c | Registration deadline and same-day window | https://www.sos.ca.gov/elections/upcoming-elections/general-election-november-3-2026/key-dates-deadlines | yes (Nov 3, 2026) | no (site links two other dated SOS pages) | Key dates card (optional) | medium |
| 3 | Check voter registration status | https://voterstatus.sos.ca.gov/ | unreachable | no | Before you vote, About | medium |
| 4a | Early voting and drop-off locations | https://caearlyvoting.sos.ca.gov/ | unreachable | no | Before you vote, About | medium |
| 4b | Find your polling place (county lookups) | https://www.sos.ca.gov/elections/polling-place | yes (partly stale county links) | no | Before you vote, About | medium |
| 4c | Where and how to vote | https://www.sos.ca.gov/elections/voting-resources/voting-california/where-and-how-vote | yes (mostly evergreen, Nov 3 dates) | no | About only | medium |
| 5 | Ballot tracking, Where's My Ballot? | https://www.sos.ca.gov/elections/ballot-status/wheres-my-ballot | yes (evergreen) | no | Before you vote, About | high |
| 6 | Assistance for voters with disabilities | https://voterguide.sos.ca.gov/voter-info/assistance-for-voters-w-disabilities.htm | yes (Nov 3, 2026 header) | yes | keep as is | high |
| 7a | Certified List of Candidates (PDF) | https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/cert-list-candidates.pdf | yes (Nov 3, 2026) | yes, in candidate sources | Contests page header, About | high |
| 7b | Candidate statements | see 1c | yes | partly | see 1c | high |
| 8 | Voter hotlines in ten languages | https://www.sos.ca.gov/elections/voting-resources/voting-california/voter-hotlines | yes (evergreen) | yes | keep as is | high |
| 9 | County elections offices | https://www.sos.ca.gov/elections/voting-resources/county-elections-offices | yes (58 counties) | yes | keep as is | high |

Net result. 4 of the 9 resources are fully linked now (guide home, disabilities, hotlines, county offices). 2 are partly linked (candidate statements and the certified list appear only inside candidate source lists). 3 are missing entirely (registration and same-day registration, registration status, ballot tracking) and voting locations is missing too. Alternate formats and languages are missing.

## Hosts not reachable from here

These are reported as "not reachable from here". They are not broken. Each is linked by name from at least one verified SOS page, quoted below.

| Host | What happened | Official page that links it |
|---|---|---|
| registertovote.ca.gov | WebFetch got `302` from `https://` to `http://`, and WebFetch upgrades `http` back to `https`, so the fetch loops. WebSearch lists the result title "California Online Voter Registration" at https://registertovote.ca.gov/. | General election page ("Register to vote") and Registering to Vote page |
| voterstatus.sos.ca.gov | Returned an Imperva Incapsula bot-check stub with no page content | General election page ("My Voter Status") and Registering to Vote page |
| caearlyvoting.sos.ca.gov | Same `https` to `http` redirect loop as registertovote | Find Your Polling Place page and Same Day Registration page |
| california.ballottrax.net | Not on this session's fetch allowlist | Where's My Ballot? page (labeled "WheresMyBallot.sos.ca.gov") |
| any sos.ca.gov host via curl | Proxy CONNECT 403 | not applicable |

## Verified pages, with title and identifying sentence

All quotes are as returned by WebFetch.

### 1. Official Voter Information Guide

- **Home**, https://voterguide.sos.ca.gov/
  - Title "Official Voter Information Guide | California Secretary of State"
  - Sentence "Official Voter Information Guide, November 3, 2026, General Election."
  - Specific to Nov 3, 2026. Main menu links Propositions, Candidates, Justices, Quick Reference Guide, Voter Information, Audio/PDF/Large Print, American Sign Language, and "Find Your Polling Place" (https://www.sos.ca.gov/elections/polling-place).
- **Propositions**, https://voterguide.sos.ca.gov/propositions/
  - Title "Propositions | Official Voter Information Guide | California Secretary of State"
  - Sentence "Official Voter Information Guide, November 3, 2026, General Election."
  - Specific. Lists 14 measures, Props 1 to 5 and 37 to 45, matching the 14 in `propositions.html`.
- **Quick Reference Guide**, https://voterguide.sos.ca.gov/quick-reference-guide/
  - Title "Quick Reference Guide | Official Voter Information Guide | California Secretary of State"
  - Sentence "Official Voter Information Guide, November 3, 2026, General Election."
  - Specific. Short summary of each of the 14 propositions. Optional link.
- **Candidates**, https://voterguide.sos.ca.gov/candidates/
  - Title "Candidates | Official Voter Information Guide | California Secretary of State"
  - Sentence "Official Voter Information Guide, November 3, 2026, California General Election."
  - Specific. Nine offices, Governor through Superintendent of Public Instruction.
- **Information About Candidate Statements**, https://voterguide.sos.ca.gov/voter-info/info-about-candidate-statements.htm
  - Title "Information About Candidate Statements | Official Voter Information Guide | California Secretary of State"
  - Sentence "Voluntary spending limits for the following offices for the November 3, 2026, General Election are:"
  - Specific.
- **Other formats (audio, PDF, large print, languages)**, https://voterguide.sos.ca.gov/en/alt-versions/
  - Title "Other Formats | Official Voter Information Guide | California Secretary of State"
  - Sentence "Official Voter Information Guide, November 3, 2026, California General Election."
  - Specific. Offers audio, large print and PDF, with language versions in Spanish, Chinese, Hindi, Japanese, Khmer, Korean, Tagalog, Thai and Vietnamese, plus order forms at https://www.sos.ca.gov/elections/voting-resources/large-print-order-form and https://www.sos.ca.gov/elections/voting-resources/audio-order-form.
  - Braille is not mentioned on this page, so the site should not promise braille.
  - WebFetch reported that the header banner reads "California Primary Election June 2, 2026", which does not match the rest of the page. This is an SOS template issue. It is not a reason to skip the link. Low confidence on the banner detail.
  - The page's own text says the English audio "will be available after September 15, 2026". That date has passed.
- **American Sign Language**, https://voterguide.sos.ca.gov/asl/
  - Title "American Sign Language | Official Voter Information Guide | California Secretary of State"
  - Sentence "Official Voter Information Guide, November 3, 2026, California General Election."
  - Specific.
- **Complete guide PDF (English)**, https://vig.cdn.sos.ca.gov/2026/general/pdf/complete-vig.pdf, linked from the guide home. Language PDFs follow the pattern `https://vig.cdn.sos.ca.gov/2026/general/{es,ch,hi,ja,km,ko,tl,th,vi}/pdf/complete-vig.pdf`. These come from the home page link list. The PDFs themselves were not opened.

### 2. Voter registration, deadline, same-day registration

- **Register online**, https://registertovote.ca.gov/. Not reachable from here (see above). Official SOS pages link it as "Register to vote".
- **Same Day Voter Registration (Conditional Voter Registration)**, https://www.sos.ca.gov/elections/voter-registration/same-day-reg
  - Title "Same Day Voter Registration (Conditional Voter Registration) :: California Secretary of State"
  - Sentence "Same Day Voter Registration, known as Conditional Voter Registration in state law, is a safety net for Californians"
  - Evergreen. It covers registering within 14 days of an election at a county elections office, polling place or vote center.
- **Registering to Vote**, https://www.sos.ca.gov/elections/voting-resources/voting-california/registering-vote
  - Title "Registering to Vote :: California Secretary of State"
  - Sentence "Californians must be registered to vote at least 15 days before Election Day."
  - Evergreen.
- **Key Dates and Deadlines (Nov 3, 2026)**, https://www.sos.ca.gov/elections/upcoming-elections/general-election-november-3-2026/key-dates-deadlines
  - Title "Key Dates and Deadlines :: California Secretary of State"
  - Registration line "Last day to register to vote for the general election." (October 19, 2026)
  - Same-day line "Same Day Registration available. Voters can "conditionally" register and vote a provisional ballot during this time" (October 20 to November 3, 2026)
  - Specific.

Timing note. The October 19 online deadline has passed as of this audit. From today the useful link is Same Day (conditional) Registration, not online registration. Proposed link text below reflects that.

### 3. Check registration status

- https://voterstatus.sos.ca.gov/. Not reachable from here (bot check). SOS pages link it as "My Voter Status".
- Do **not** link https://voterguide.sos.ca.gov/voter-info/voter-status.htm. WebFetch returned title "Check Your Voter Status Online" and sentence "Visit voterstatus.sos.ca.gov for important voter details.", but the page refers to an October 20, 2025 registration deadline. It is stale and is not in the guide's Voter Information index. Medium confidence.

### 4. Voting options and locations

- **Find Your Polling Place**, https://www.sos.ca.gov/elections/polling-place
  - Title "Find Your Polling Place :: California Secretary of State"
  - Sentence "To see additional locations you may visit your county elections official's website or visit CaEarlyVoting.sos.ca.gov."
  - Mixed. It is a list of county lookup links. Some county PDFs are still dated for June 2, 2026 (San Joaquin "polling-places---june-2-2026-primary-election.pdf", Siskiyou "list_of_polling_places.060226.pdf"). Others are for Nov 3 (Yuba "110326PollingPlaces.pdf"). Those three counties are outside the Bay Area. Safe to link, but phrase it as a county lookup list.
- **Early voting and drop-off locations**, https://caearlyvoting.sos.ca.gov/. Not reachable from here. The polling-place page and the same-day page link it as "Early Voting and Vote-by-Mail Drop-Off Locations".
- **Where and How to Vote**, https://www.sos.ca.gov/elections/voting-resources/voting-california/where-and-how-vote
  - Title "Where and How to Vote :: California Secretary of State"
  - Sentence "Any registered voter in California can decide whether to vote at a polling place or vote by mail."
  - Mostly evergreen, with Nov 3, 2026 drop-box dates.

### 5. Ballot tracking

- **Where's My Ballot?**, https://www.sos.ca.gov/elections/ballot-status/wheres-my-ballot
  - Title "Where's My Ballot? :: California Secretary of State"
  - Sentence "Tracking your vote-by-mail ballot—when it is mailed, received, and counted—has never been easier."
  - Evergreen. Its sign-up link goes to https://california.ballottrax.net/voter/ (not reachable from here). Link the sos.ca.gov page, which is reachable and explains the service.

### 6. Voters with disabilities

- https://voterguide.sos.ca.gov/voter-info/assistance-for-voters-w-disabilities.htm
  - Title "Assistance for Voters with Disabilities | Official Voter Information Guide | California Secretary of State"
  - Sentence "California is committed to ensuring every voter is able to cast their ballot privately and independently."
  - The header names Nov 3, 2026. The body is general. Already on the site. No change.

### 7. Certified list of candidates and candidate statements

- **Certified List of Candidates**, https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/cert-list-candidates.pdf
  - Heading "CERTIFIED LIST OF CANDIDATES FOR THE NOVEMBER 3, 2026, GENERAL ELECTION"
  - Certification "Dated at Sacramento, California, this 27th day of August, 2026."
  - Specific. Already used 52 times as a source in `data/2026-11-03/candidates.json`, but it is not offered as a general link.
- **Candidate statements**, https://voterguide.sos.ca.gov/candidates/ (see 1). `candidates.json` links eight of the nine per-office statement pages. It does not link Governor. The fetched Governor page (title "Governor Candidate Statements | Official Voter Information Guide | California Secretary of State") shows "No candidate statement." for both candidates, Xavier Becerra and Steve Hilton, so leaving it out is consistent. The data owner may still want to link it so voters can see that no statement was filed. Low priority.
- The general election page also lists https://www.sos.ca.gov/elections/candidate-statements ("Candidate Statements"). This was not fetched separately. Use the guide's candidates page instead.

### 8. Language assistance and hotlines

- **Voter Hotlines**, https://www.sos.ca.gov/elections/voting-resources/voting-california/voter-hotlines
  - Title "Voter Hotlines :: California Secretary of State"
  - Sentence "The Secretary of State's office provides voting-related materials and assistance in ten languages."
  - Evergreen. English (800) 345-8683, Spanish (800) 232-8682, Chinese (800) 339-2857, Hindi (888) 345-2692, Japanese (800) 339-2865, Khmer (888) 345-4917, Korean (866) 575-1558, Tagalog (800) 339-2957, Thai (855) 345-3933, Vietnamese (800) 339-8163, TTY/TDD 711.
  - Already on the site. The site's label "Voter hotlines in ten languages" matches the page. No change.
- No separate SOS "language assistance" page was found by search. Translated guides are covered by the Other Formats page (1d). Where and How to Vote confirms "Voting locations offer voter registration, replacement ballots, accessible voting machines, and language assistance."

### 9. County elections offices

- https://www.sos.ca.gov/elections/voting-resources/county-elections-offices
  - Title "County Elections Offices :: California Secretary of State"
  - Sentence "A list of county elections offices and their contact information is listed below."
  - Lists all 58 counties. It is a standing directory (revision date "3/11/2026"). Already on the site. No change.

### Other dated pages the site already uses (re-checked)

- https://www.sos.ca.gov/elections/upcoming-elections/general-election-november-3-2026. Title "General Election - November 3, 2026 :: California Secretary of State". Sentence "The last day to register to vote online for November 3, 2026, General Election is October 19." Verified, already linked from the Key dates card.
- https://www.sos.ca.gov/elections/voting-resources/voting-california/election-dates-and-resources. Title "Election Dates and Resources :: California Secretary of State". Line "Online or Postmark by October 19, 2026". Verified, matches `data/elections.json` quote exactly. Already linked.

Note for the dates reviewer (outside this scope, no change proposed). The Key Dates and Deadlines page lists "Early Voting sites open" on October 5, 2026. The site's key date "First vote centers open" on October 24 quotes the general election page ("The first vote centers open for early in-person voting in all Voter's Choice Act counties on October 24."). Both are official. They describe different things (early voting at county offices from Oct 5, Voter's Choice Act vote centers from Oct 24). Not a discrepancy, but a voter could read "first vote centers open Oct 24" as "no early voting before Oct 24". Low confidence that a wording change is needed.

## External links currently in voter-facing code

| Location | Link text | URL |
|---|---|---|
| `assets/guide.js` line 22 `SOS_OFFICES`, `OFFICIAL.offices` | "County elections offices" | https://www.sos.ca.gov/elections/voting-resources/county-elections-offices |
| `assets/guide.js` line 485 `OFFICIAL.guide` | "Official California voter information guide" | https://voterguide.sos.ca.gov/ |
| `assets/guide.js` line 487 `OFFICIAL.hotlines` | "Voter hotlines in ten languages" | https://www.sos.ca.gov/elections/voting-resources/voting-california/voter-hotlines |
| `assets/guide.js` line 488 `OFFICIAL.access` | "Assistance for voters with disabilities" | https://voterguide.sos.ca.gov/voter-info/assistance-for-voters-w-disabilities.htm |
| `assets/guide.js` line 491 to 495 `nextSteps()` (homepage "Before you vote" card) | offices (inline), then guide · hotlines · access | as above |
| `assets/guide.js` line 360 `keyDatesCard()` | "general election page" and "election dates and resources" | the two dated SOS pages above, from `data/elections.json` |
| `assets/guide.js` line 341 map caption | Census Bureau | https://www.census.gov/ (fallback) |
| `assets/guide.js` line 713 `viewStatewide()` empty state | "Official California voter guide" | https://voterguide.sos.ca.gov/ |
| `assets/guide.js` line 903 to 904 About "Confirm your ballot" | offices, guide, hotlines, access | as above |
| `assets/guide.js` line 950 load-error message | "California voter guide" | https://voterguide.sos.ca.gov/ |
| `assets/guide.js` line 722 onward `viewItem()` | per-item `sources` from data | per-prop SOS pages, LAO, legal text PDFs, cert list, candidate statement pages, powersearch.sos.ca.gov |
| `index.html` line 30 noscript | "California voter guide", "county elections office" | guide home, county offices |
| `index.html` line 35 footer | "official California voter guide" | https://voterguide.sos.ca.gov/ |
| `propositions.html` line 271 noscript | "California voter guide" | https://voterguide.sos.ca.gov/ |
| `propositions.html` line 274 onward header | "California Bay Area Ballot Guide" home link only | none external |
| `propositions.html` line 391 "Last checked" paragraph | "official voter guide" | https://voterguide.sos.ca.gov/ |
| `propositions.html` lines 447 to 452 `std(n)` | "LAO analysis", "Official voter guide page", "Legal text" | lao.ca.gov PDFs, voterguide.sos.ca.gov/propositions/N/, vig.cdn.sos.ca.gov text PDFs |
| `propositions.html` per-prop extras | news and think-tank links | not official, out of scope |

## Proposed changes (exact text, compact)

All new links go through the existing `ext()` helper so they keep `target="_blank"`, `rel="noopener"` and the "(opens in a new tab)" text. Rank order is by voter impact in the final 10 days.

### P1. Extend `OFFICIAL` in `assets/guide.js` (line 484). High confidence.

Add these keys and keep the four existing ones unchanged.

```js
sameday: ["https://www.sos.ca.gov/elections/voter-registration/same-day-reg", "Same day registration"],
register: ["https://registertovote.ca.gov/", "Register to vote"],
status: ["https://voterstatus.sos.ca.gov/", "Check your registration"],
where: ["https://caearlyvoting.sos.ca.gov/", "Early voting and drop-off locations"],
polls: ["https://www.sos.ca.gov/elections/polling-place", "Polling place lookup by county"],
track: ["https://www.sos.ca.gov/elections/ballot-status/wheres-my-ballot", "Track your ballot"],
formats: ["https://voterguide.sos.ca.gov/en/alt-versions/", "Audio, large print and other languages"],
cands: ["https://voterguide.sos.ca.gov/candidates/", "Statewide candidate statements"],
certlist: ["https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/cert-list-candidates.pdf", "Certified list of candidates (PDF)"]
```

Owner to confirm the three unreachable URLs (register, status, where) in a normal browser before publishing.

### P2. Homepage "Before you vote" card, `nextSteps()` lines 491 to 495. High confidence.

Keep the two existing paragraphs. Insert one paragraph between them, then add `formats` to the existing small line.

Insert after the first `<p>`

```
<p>Not registered? You can still register and vote at a vote center or your county elections office through Election Day. [Same day registration] · [Check your registration] · [Early voting and drop-off locations] · [Track your ballot]</p>
```

Replace the existing small line array `[OFFICIAL.guide, OFFICIAL.hotlines, OFFICIAL.access]` with `[OFFICIAL.guide, OFFICIAL.formats, OFFICIAL.hotlines, OFFICIAL.access]`.

Wording basis. Same Day Registration page ("register or re-register within 14 days of an election at their county elections office, polling place, or vote center") and Key Dates page ("Same Day Registration available ... October 20 - November 3, 2026"). Leave out `register` here because the online deadline has passed. If the card is reused for a future election, swap `sameday` for `register` before that election's deadline.

### P3. About page "Confirm your ballot", line 903 to 904. High confidence.

Replace the list array with

```js
[OFFICIAL.offices, OFFICIAL.guide, OFFICIAL.formats, OFFICIAL.sameday, OFFICIAL.status, OFFICIAL.where, OFFICIAL.polls, OFFICIAL.track, OFFICIAL.cands, OFFICIAL.certlist, OFFICIAL.hotlines, OFFICIAL.access]
```

That is 12 one-line items in the existing `srclist`, still one short list. If that is too long, drop `polls` and `certlist` first.

### P4. Statewide page and Ballot Weighing Tool. Medium confidence.

- `viewStatewide()` (line 707 onward). After the `.cta` div add `<p class="small">Official sources: [Official list of propositions] · [Audio, large print and other languages]</p>`, using `https://voterguide.sos.ca.gov/propositions/` and `OFFICIAL.formats`.
- `propositions.html` "Last checked" paragraph (line 391). After "...in the official voter guide (opens in a new tab)." add the sentence `The guide also comes in <a href="https://voterguide.sos.ca.gov/en/alt-versions/" target="_blank" rel="noopener">audio, large print and other languages<span class="vh"> (opens in a new tab)</span></a>.`
- Proposition item pages already list the SOS proposition page, LAO analysis and legal text through `std(n)` and `sources`. No change.

### P5. Candidates and contests page. Medium confidence.

Under the contests page heading add `<p class="small">Official sources: [Statewide candidate statements] · [Certified list of candidates (PDF)]</p>`, using `OFFICIAL.cands` and `OFFICIAL.certlist`. This gives voters the full official list in one place instead of only per-candidate source rows.

### No change

- `OFFICIAL.guide`, `OFFICIAL.offices`, `OFFICIAL.hotlines`, `OFFICIAL.access`. All verified, labels accurate. High confidence.
- Footer and noscript links in `index.html` and `propositions.html`. Verified. High confidence.
- Do not link https://voterguide.sos.ca.gov/voter-info/voter-status.htm (stale, 2025 deadline). Medium confidence.
- Do not mention braille. The Other Formats page does not offer it. Medium confidence.
