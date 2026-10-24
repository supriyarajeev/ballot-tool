# Independent review: candidate photos and optional proposition corrections

Reviewer: independent agent (did not make these changes). Date: 2026-10-24. Scope: uncommitted working-tree changes in `/home/claude/site` (A: candidate photos; B: optional corrections O1 to O7 and gap closures O8). Read-only; this report is the only file written.

## Summary

No Blocker. One High-risk item could not be checked at all: the Wikimedia Commons file pages could not be fetched from this environment, so no photo license was confirmed against its source page. Everything that could be checked locally passed: the all-or-nothing photo rule, unchanged candidate order, rendering, alt text, image size attributes, credits and axe. The proposition corrections O1 to O7 are supported by the cited official or League pages. One Medium finding concerns the date and provenance of the Wagner photo. The other findings are Low.

## Findings

### PH-01 · High (unverified, not a confirmed defect) · Commons licenses could not be checked against the source pages
- Evidence: WebFetch refused all seven `sourcePage` URLs (`URL_NOT_ON_ALLOWLIST`). Commons URLs that appeared in search results then failed with `url_not_found`. Direct HTTPS from the container to `commons.wikimedia.org` and `upload.wikimedia.org` was refused by the egress proxy (CONNECT 403). No Commons page content was retrieved, so the following could not be confirmed for any of the seven files: the license template, the author or source field, the description text quoted in `identityCheck`, the FlickreviewR result claimed for `SupervisorJaneKim.png`, and the absence of deletion or "no permission" tags.
- Suggested fix: before publishing, have a person (or a session with Commons access) open each of the seven file pages and record the license template and its revision ID or date in `permission.evidence`. Until then, treat `license` and `identityCheck` as the author's own unconfirmed reading.

### PH-02 · Medium · Wagner photo is dated 2009 and credited to the Assembly Republican Caucus, but Wagner joined the Assembly in December 2010
- Evidence: the `candidates.json` record has `credit` "California State Assembly Republican Caucus, 2009", `year` "2009", and an identity check that quotes a Commons description of "California Assembly member Donald P. Wagner". The English Wikipedia article on Donald P. Wagner (fetched) gives his Assembly service as December 6, 2010 to November 30, 2016. A 2009 caucus portrait of a sitting Assembly member is not possible. Either the year is wrong, or the photo predates his service, perhaps as a campaign photo. If it is a campaign photo, it is not a state work and PD-CAGov would not apply.
- Suggested fix: check the Commons file's date, source and author. If the source is not an Assembly or Caucus page from his time in office, drop the photo. Dropping it would also remove Weber's photo under the all-or-nothing rule. Wikipedia's infobox caption reads "Official portrait, 2022", which suggests a more recent Orange County portrait exists. A county work would fall under PD-CAGov's local-agency basis and would match his ballot designation, Orange County Supervisor. Consider it as a replacement once its license is confirmed.

### PH-03 · Low · The PD-CAGov basis is weaker for legislative photos
- Evidence: six of the seven photos rely on PD-CAGov (Weber, Wagner, Allen, Wiener, Chan, Raju; Kim is CC BY 2.0). `permission.evidence` cites the California Public Records Act as read in County of Santa Clara v. Superior Court (2009). That case is about a local agency. My understanding is that the CPRA's definition of "state agency" excludes bodies created by Constitution Article IV, which is the Legislature, and the Legislature's records fall under the separate Legislative Open Records Act. If so, the CPRA reasoning does not clearly reach Assembly or Senate photos (Weber, Wagner, Allen, Wiener). This is a reviewer's legal reading, not verified against the Commons template text (see PH-01), and it is not legal advice. The records already say "This reading is Wikimedia Commons' and is not a court ruling on this photo." That disclaimer is good.
- Suggested fix: for the four legislative photos, add a sentence to `permission.evidence` noting that the basis is the Commons community's position and that the Legislature is outside the CPRA. Alternatively, ask the Assembly or Senate offices for written permission.

### PH-04 · Low · Inconsistent crop and photo age within contests
- Evidence (from viewing the seven 192×192 files):
  - CD-11: Chan's face fills most of the frame and the crown of her head is cut off. Wiener's head is about half that size, with flags around him. In a 48 px circle, Chan appears noticeably larger.
  - Insurance Commissioner: Allen (2021, grey studio background, tight crop) and Kim (2014, wood-panel background, more torso shown) differ somewhat in scale. Kim's photo is 12 years old and shows her as a former supervisor.
  - SoS: Weber (2012) and Wagner (2009) are well matched. Both are Assembly flag-backdrop portraits with similar head size.
  - All seven show a single person, head and shoulders (Raju closer to half-length), facing the camera, with neutral expressions.
- Suggested fix: re-crop Chan wider so her head is about the same share of the frame as Wiener's. Optionally record each photo's age in the visible credit (the year is already there) and prefer the most recent free portrait.

### PH-05 · Low · Duplicate name in the contest credit line
- Evidence: the Insurance Commissioner contest page renders "Jane Kim, Jane Kim (Flickr: supervisorjanekim), 2014. CC BY 2.0." The credits line prefixes the candidate name to a credit that already starts with the author's name. Every credit link has the same text, "source", which is acceptable in context but not distinctive.
- Suggested fix: change the credits template, for example to "Jane Kim: photo by Jane Kim (Flickr…)". Optionally make each link text "source for <name>".

### PH-06 · Low · CC BY 2.0 attribution does not link the license deed
- Evidence: the Kim credit shows "CC BY 2.0" as plain text. The license URI appears only in `permission.evidence`, not on the page. The "Source and license" link goes to the Commons page.
- Suggested fix: link "CC BY 2.0" to https://creativecommons.org/licenses/by/2.0/ in the credit.

### PH-07 · Low · DATA-MODEL.md says the validator checks more than it does
- Evidence: `docs/DATA-MODEL.md` says the validator "rejects a photo that is missing any of these", including `year` and `modified`. `tools/validate.mjs` checks src, file existence, sourceUrl, sourcePage, retrieved, permission (grantedBy, evidence, date), identityCheck, credit and license, but not `year` or `modified`. It also does not check that `license` is one of PD, CC0, CC BY or CC BY-SA, although the manifest rule requires that.
- Suggested fix: add checks for `year`, `modified` and an allow-list pattern for `license`, or reword the doc.

### OP-01 · Low · O5 cites a local League chapter's page for the state League's recommendation
- Evidence: https://my.lwv.org/node/73812 is hosted by the League of Women Voters of Diablo Valley. It does state "Each election, the League of Women Voters of California analyzes all statewide ballot measures and makes recommendations", and it lists "NO on PROP 45" with "The League opposes speeding projects by weakening environmental review, public input… and protections for affected communities." The attribution to LWVC is therefore supported. However, "in its own guide" points to a local chapter's relay of LWVC's guide, and the source was retitled "League of Women Voters of California, ballot recommendations" while its publisher field stays "my.lwv.org".
- Suggested fix: cite LWVC's own "Vote with the League" page as the source, or set the source title to "LWV Diablo Valley: Vote with the League! (LWVC recommendations)".

### OP-02 · Low · O8 closure "45b" relies on the same kind of reading the gap warned about
- Evidence: the gap said the LAO Figure 1 project types "were read from image descriptions; confirm against the printed figure". The Stage 1 report says the HTML analysis lists the types "in text". My fetch of https://voterguide.sos.ca.gov/propositions/45/analysis.htm returned the nine types but said the figure is an image and the text comes from its alt text. The nine types do match the site's `does` text. The site omits the figure's exclusions (Delta conveyance, nuclear, high-speed rail), which is acceptable for a summary. The substance holds, but the stated condition, "printed figure", was not shown to be met.
- Suggested fix: confirm against the printed figure in the prop45 PDF, or reword the closure note to "matched the figure's alt text twice".

### OP-03 · Low · The O8 gap closures are not traceable from the change log
- Evidence: `statewide-changes-4.json` `gapsClosed` gives no quote or URL. The basis is only in the `apply_statewide_4.py` comment and the Stage 1 reports (`audit/2026-10-24/stage1/props-1-5.md` lines 136 to 140, `props-42-45.md` lines 176 to 185). No evidence rows were added for the closures.
- Suggested fix: add `quote` and `url` to each `gapsClosed` entry.

## What checked out

### A. Photos
- A1, identity against the contest data. All seven names and offices match `contests.json` and `candidates.json`. SoS: Weber (designation "California Secretary of State") and Wagner ("Orange County Supervisor"). Insurance Commissioner: Allen ("California State Senator") and Kim ("Attorney/Consumer Advocate"). CD-11: Chan ("San Francisco Supervisor") and Wiener ("State Senator"). SF Public Defender: Raju. The office context in each `identityCheck` is consistent with these designations. Wikipedia confirms Wagner is the Republican nominee for SoS against Weber. Every recorded `license` is PD or CC BY 2.0, all of which are reusable, if the Commons pages say what the records claim (see PH-01). The manifest's handling of other doubtful files is sound: Romero is excluded, and the CC BY versus CC BY-SA mismatch on the Hilton crop is noted.
- A2, the image files. All seven are 192×192 baseline JPEGs, each showing a single person in a head-and-shoulders or close portrait (see PH-04 for consistency).
- A3, the script check:
  - 7 records have `photo`, and every one passes the guide's `hasPhoto` test.
  - All 7 files exist and all required fields are present.
  - The 4 contests with any photo (SoS, Insurance Commissioner, CD-11, SF Public Defender) have photos for every candidate. 0 contests are partial.
  - `contests.json` is unchanged from HEAD (`git diff --quiet` returns 0), and the candidate lists per contest are identical.
  - Candidate id order in `candidates.json` is unchanged, and no field other than `photo` changed.
- A4, rendering (Chromium via Playwright, port 8811, fonts.googleapis.com, fonts.gstatic.com and gc.zgo.at blocked, server stopped by PID). Results at 360 and 1280 px for SoS, Governor and the Jane Kim candidate page, plus Insurance Commissioner, CD-11, Public Defender and the Becerra candidate page:
  - Every image loaded (192×192 natural size).
  - Alt text reads "Photo of <name>".
  - Width and height attributes are present: 48/48 on contest pages, rendered at 48×48. On the candidate page they are 96/96, rendered at 72×72 by CSS. The aspect ratio is the same, so no image-caused shift.
  - Credits show source links to the Commons file pages, with `target=_blank` and `rel=noopener`.
  - Governor shows 2 placeholders with the "No candidate photos are shown in this contest…" note and a link to the official statements. The Becerra page shows a placeholder and its explanation.
  - No horizontal scroll.
  - axe-core: 0 violations on all 14 page and width combinations.
  - The only console error is the expected GoatCounter integrity block caused by test blocking.
  - Measured CLS was 0.25 to 0.53 on every page, including Governor, which has no photos. The shift therefore comes from the single-page app's initial render, not from the photos.
- Existing tests: `node tests/browser/run.mjs guide` (PORT=8812) passed 487 with 0 failed. `node tools/validate.mjs` reported 0 errors and 0 warnings. `node tests/check-generated.mjs` reported all 9 generated files matching.

### B. Optional corrections (each cited URL fetched)
- O1 (Prop 5 arguments link): the arguments-rebuttals page has the heading "ARGUMENT IN FAVOR OF PROPOSITION 5". Its signers are Plimier, Kemp and Schnur (for), and Jones and Patterson (against), matching the existing evidence excerpts. The link keeps its position in the list. Supported.
- O2 (Prop 37 price cap and residency): the official summary says "priced below about $1 million–$1.5 million, depending on county, adjusted annually" and "Borrowers must be California residents for one year, occupy the home". Supported and not overstated. The new text omits "adjusted annually", which is acceptable.
- O3 (Prop 37 United Nurses): the official listing reads "United Nurses Associations of California; California Conference of Carpenters; California State Treasurer Fiona Ma". Supported.
- O4 (Prop 40 risk): LAO Figure 1 says "If Proposition 41 or 42 on this same ballot receive more yes votes than Proposition 40, then Propostion 40 could be stopped from becoming law even if it gets yes votes from a majority of voters. This is because the courts could find that Proposition 41 or 42 conflict with 40." Supported. The new text keeps "could".
- O5 (Prop 45 LWV): supported. See OP-01 for the source nuance.
- O6 (Prop 42 PORAC): Brian R. Marvel (PORAC) signed only the rebuttal to the argument against. The listing names the Firefighters, the Building Trades and AMVETS. The argument signers are the CA Small Business Association, AMVETS and the CA Senior Alliance. Each organization in the sentence appears in at least one of listing, argument or rebuttal, so the collective parenthetical is accurate.
- O7 (Prop 45 opponents): the official listing reads "Coalition for Clean Air; CA Environmental Voters; Physicians for Social Responsibility, LA; National Wildlife Federation". Supported. Clean Water Action is correctly attributed to the argument (Jennifer Clary).
- O8 gap closures, spot-checked against official text:
  - Prop 3: the summary thresholds $371,000, $742,000 and $505,000 are 2025 levels, adjusted for inflation. The page does not give the bracket count, so that part of the gap correctly stays open.
  - Prop 4: §85300(h) says "The Commission is not responsible for the administration or enforcement of a system of public funding… of candidates established by a local governmental agency". The signers in prop4.pdf match the site's pro and con.
  - Prop 5: Art. V §10(b) "the Lieutenant Governor shall become Governor for the remainder of the unexpired term", plus the special election consolidated with the statewide primary.
  - Prop 42: §2(c)(2)(B) "expressly limited by the statute to responding to the fiscal emergency". The official PDF was readable.
  - Prop 45: the official listing was readable (O7). Figure 1: see OP-02.
- `node tests/scoring-regression.mjs`: "1008 scoring results compared, 0 differences" and "… 42 slider cases compared, 0 differences".

## Not checked
- The Commons license, author, description and tags for all seven photos (PH-01).
- Wikidata items Q7498880, Q5294972, Q19816391, Q6152446, Q105663114, Q7437504 and Q111457810 (not fetched).
- The by-eye comparison with official voter guide photos claimed in the records.
- Whether the Flickr account `supervisorjanekim` is Jane Kim's own account.

## Note on the working tree
During this review, untracked files appeared that I did not create: `UPLOAD-INSTRUCTIONS.md`, `audit/2026-10-24/PHOTO-MANIFEST.md` and `audit/logs/2026-10-24-final-npm-test.log`. I did not review them.

## Findings table

| ID | Severity | Item | Fix |
| --- | --- | --- | --- |
| PH-01 | High (unverified) | Commons license pages not reachable; no license confirmed | Human check of all 7 file pages, record revision |
| PH-02 | Medium | Wagner photo dated 2009, before his Dec 2010 Assembly start; PD-CAGov basis doubtful | Verify Commons source/date; replace (e.g., 2022 OC portrait) or drop SoS photos |
| PH-03 | Low | PD-CAGov/CPRA basis weaker for Legislature photos | Note caveat in evidence or get written permission |
| PH-04 | Low | Chan crop much tighter than Wiener; Kim photo 12 years old | Re-crop Chan; prefer recent portraits |
| PH-05 | Low | "Jane Kim, Jane Kim (Flickr…)" duplicate in credits | Adjust credit template |
| PH-06 | Low | CC BY 2.0 deed not linked | Link license URL |
| PH-07 | Low | Validator does not check year/modified/license allow-list as doc says | Add checks or reword doc |
| OP-01 | Low | O5 source is LWV Diablo Valley relay of LWVC | Cite LWVC page or retitle source |
| OP-02 | Low | Prop 45 Figure 1 closure still based on alt text | Confirm in PDF or reword note |
| OP-03 | Low | O8 closures lack quote/url in change log | Add quote and url per entry |
