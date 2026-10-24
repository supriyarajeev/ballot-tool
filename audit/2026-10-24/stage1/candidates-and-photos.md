# Stage 1 audit. Candidates and candidate photos

Date of checks 2026-10-23 (for the 2026-10-24 stage). Read only. No repository file was changed except this report. No image was downloaded, copied or rehosted.

Method note. Direct downloads (curl) to voterguide.sos.ca.gov, vig.cdn.sos.ca.gov and elections.cdn.sos.ca.gov were refused by this session's network proxy. All official pages below were read through the WebFetch tool, which returns a model-made reading of the page rather than raw bytes. The certified list was read twice with different questions and both readings agreed. A person should still eyeball the certified list PDF before any record is marked Verified.

## Summary table

### Part A. Statewide candidates (16)

| # | Office | Site name | Party | Designation | Order | Incumbent flag | statementUrl / statementNote | Result | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Governor | Xavier Becerra | match | match | 1 of 2, match | match (none) | null + note, match | No change | high |
| 2 | Governor | Steve Hilton | match | match | 2 of 2, match | match (none) | null + note, match | No change | high |
| 3 | Lieutenant Governor | Fiona Ma | match | match | 1, match | match | page exists, statement present | No change | high |
| 4 | Lieutenant Governor | Gloria Romero | match | match | 2, match | match | page exists, statement present | No change | high |
| 5 | Secretary of State | Shirley N. Weber | match | match | 1, match | true, match (*) | page exists, statement present | No change | high |
| 6 | Secretary of State | Donald P. (Don) Wagner | match | match | 2, match | match | page exists, statement present | No change | high |
| 7 | Controller | Malia M. Cohen | match | match | 1, match | true, match (*) | page exists, statement present | No change | high |
| 8 | Controller | Herb W Morgan | match | match | 2, match | match | page exists, statement present | No change | high |
| 9 | Treasurer | Eleni Kounalakis | match | match | 1, match | match | page exists, statement present | No change | high |
| 10 | Treasurer | Jennifer Hawks | match | match | 2, match | match | page exists, statement present | No change | high |
| 11 | Attorney General | Rob Bonta | match | match | 1, match | true, match (*) | null + note, match | No change | high |
| 12 | Attorney General | Michael E. Gates | match | match | 2, match | match | page exists, statement present | No change | high |
| 13 | Insurance Commissioner | Ben Allen | match | match | 1, match | match | page exists, statement present | No change | high |
| 14 | Insurance Commissioner | Jane Kim | match | match | 2, match | match | page exists, statement present | No change | high |
| 15 | Superintendent of Public Instruction | Richard Barrera | Non-Partisan, match | match | 1, match | match | page exists, statement present | No change | high |
| 16 | Superintendent of Public Instruction | Sonja Shaw | Non-Partisan, match | match | 2, match | match | page exists, statement present | No change | high |

Discrepancies found in statewide contests. **0.**

### Part A. Congressional and legislative spot check (26 candidates, 13 contests)

| Contest | Candidates checked | Name / party / designation / order vs certified list | Statement note | Result | Confidence |
|---|---|---|---|---|---|
| CD 10 | DeSaulnier, Frese | all match | Alameda note, not checked | No change | high |
| CD 11 | Chan, Wiener | all match | SF VIP p. 25, confirmed for both | No change | high (names), medium (page) |
| CD 12 | Joyce, Simon | all match | Alameda note | No change | high |
| CD 14 | Hernandez, Wahab | all match | Alameda note | No change | high |
| CD 15 | Mullin, Hoelter | all match | Mullin SF VIP p. 26 confirmed, Hoelter none found | No change | high (names), medium (statements) |
| CD 17 | Khanna, Tandon | all match | Alameda note | No change | high |
| SD 10 | Sakakihara, Price | all match | Alameda note | No change | high |
| AD 14 | Wicks*, Rendon | all match | Alameda note | No change | high |
| AD 16 | Bauer-Kahan*, Rubay | all match | Alameda note | No change | high |
| AD 17 | Haney*, Noris-Barrera | all match | Haney SF VIP p. 27 confirmed, Noris-Barrera none found | No change | high (names), medium (statements) |
| AD 18 | Bonta*, Sandford | all match | Alameda note | No change | high |
| AD 19 | Stefani*, Wing | all match | Stefani SF VIP p. 28 confirmed, Wing none found | No change | high (names), medium (statements) |
| AD 20 | Ortega*, Muga | all match | Alameda note | No change | high |
| AD 24 | Lee*, Hsia | all match | Alameda note | No change | high |

Discrepancies found in district contests. **0.** Two observations (not discrepancies) are in the details.

### Part B. Photos and permissions verdict

| Source | Candidate photos published | Reuse terms found | Verdict for third-party reuse |
|---|---|---|---|
| State Voter Information Guide web pages (voterguide.sos.ca.gov) | Yes for 13 of 16 statewide candidates. Placeholder "No Photo Submitted" for Becerra, Hilton, Bonta | Only "© California Secretary of State". No license, no permission text, nothing on photo rights | **Unclear.** Not shown to be permitted |
| sos.ca.gov main site | No candidate photos found | "Copyright © 2026 California Secretary of State". No conditions of use page for the main site | **Unclear** |
| SF Department of Elections (sf.gov, N26 VIP) | Not confirmed (text extraction could not show images) | sf.gov "reserves all rights to this content" | **Not permitted without permission** for sf.gov content |
| Alameda County ROV (acvote) | None found | No terms or copyright page found | **Unclear** (and nothing to reuse found) |

---

## Part A details

### Sources

- Certified list. https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/cert-list-candidates.pdf . Title "CERTIFIED LIST OF CANDIDATES FOR THE NOVEMBER 3, 2026, GENERAL ELECTION". Certification "Dated at Sacramento, California, this 27th day of August, 2026." Footer "Official Certified List of Candidates / 8/27/2026". Legend "* Incumbent." Statewide offices on pages 2 and 3, U.S. Representative on pages 6 and 7, State Senate District 10 on page 15, Assembly on pages 21 and 22.
- Candidate statements index. https://voterguide.sos.ca.gov/candidates/
- Statement pages, one per office, at https://voterguide.sos.ca.gov/candidates/{governor,lt-governor,sos,controller,treasurer,attorney-general,insurance-commissioner,superintendent}-candidate-statements.htm
- San Francisco Voter Information Pamphlet. https://media.api.sf.gov/documents/N26_EN_VIP.pdf (linked from the sf.gov news release for the November 3, 2026 pamphlet).
- Alameda County composite guide. https://acvote.alamedacountyca.gov/acvote-assets/02_election_information/PDFs/20261103/Voter%20Information%20Guide/vig_nov2026_eng.pdf

### Statewide, field by field

Every name, party preference and ballot designation in `data/2026-11-03/candidates.json` for the 8 statewide contests matches the certified list text, character for character on the points that were double checked.

- "Herb W Morgan". The certified list prints "Herb W Morgan Republican" with no period after W, and the controller statement page alt text is "Herb W Morgan". Site matches. No change. High.
- "Donald P. (Don) Wagner". Certified list prints "Donald P. (Don) Wagner Republican". Site matches. No change. High.
- Superintendent. Certified list prints "Non-Partisan" for both Richard Barrera and Sonja Shaw. Site has "Non-Partisan". Barrera's own statement begins "Democrat Richard Barrera led the reform effort..." The site correctly does not turn this into a party label, and per the brief it should not. No change. High.
- Incumbent flags. Certified list stars Weber, Cohen and Bonta. Site has `incumbent: true` for exactly those three. No change. High.
- Order. Site order equals certified-list order in all 8 contests (contest note says "Candidates in certified-list order"). Note for the owner. The voter guide's statement pages use a different order, "The order of the statements was determined by randomized drawing." (for example Wagner before Weber, Hawks before Kounalakis). The ballot itself uses the randomized alphabet. The site does not claim ballot order, so no change. High.

### Statewide statementUrl and statementNote

| Candidate | Site statementUrl | Site statementNote | Official page reading | Result |
|---|---|---|---|---|
| Becerra | null | "No candidate statement for this candidate appears in the official state voter guide." | governor-candidate-statements.htm prints "No candidate statement." | Match |
| Hilton | null | same | same page, "No candidate statement." | Match |
| Ma, Romero | lt-governor-candidate-statements.htm | null | statements present ("California is at a crossroads." / "California needs a real choice.") | Match |
| Weber, Wagner | sos-candidate-statements.htm | null | statements present | Match |
| Cohen, Morgan | controller-candidate-statements.htm | null | statements present | Match |
| Kounalakis, Hawks | treasurer-candidate-statements.htm | null | statements present | Match |
| Bonta | null | "No candidate statement for this candidate appears in the official state voter guide." | attorney-general-candidate-statements.htm prints "No candidate statement." | Match |
| Gates | attorney-general-candidate-statements.htm | null | statement present ("We need a new Attorney General.") | Match |
| Allen, Kim | insurance-commissioner-candidate-statements.htm | null | statements present | Match |
| Barrera, Shaw | superintendent-candidate-statements.htm | null | statements present | Match |

Optional improvement, not a discrepancy. For Becerra, Hilton and Bonta, add the official page that shows "No candidate statement." to `sources`, so readers can see the source of the note. Exact addition for Becerra and Hilton `{"label": "Governor candidate statements (official voter guide)", "url": "https://voterguide.sos.ca.gov/candidates/governor-candidate-statements.htm", "type": "Official"}`. For Bonta `{"label": "Attorney General candidate statements (official voter guide)", "url": "https://voterguide.sos.ca.gov/candidates/attorney-general-candidate-statements.htm", "type": "Official"}`. Keep `statementUrl` null, because `assets/guide.js` shows the note only when `statementUrl` is empty. Confidence high.

### District spot check

All 26 candidates in contests with jurisdiction ids starting `ca-cd-`, `ca-sd-` and `ca-ad-` match the certified list on name, party, designation and order. Spot details read twice: "Mia Bonta*, Democratic, California State Assemblymember, Assembly District 18", "Manuel Noris-Barrera, Republican, No Ballot Designation", "Mark Rendon, Green, Teacher", "Linda R. Price, Republican, Businesswoman".

Observation 1, incumbents in U.S. House contests. The certified list carries no asterisk for any U.S. Representative candidate checked. Raw lines "Mark DeSaulnier Democratic", "Lateefah Simon Democratic", "Kevin Mullin Democratic", "Ro Khanna Democratic". The site has `incumbent: false` for them, which matches "as the list marks them". `assets/guide.js` prints nothing when the flag is false, so readers are not told they are non-incumbents. No change. Medium. The owner may want a code comment or field note that `incumbent` means "starred on the certified list", not "currently holds the seat".

Observation 2, San Francisco statement notes. SF VIP readings confirmed statements on page 25 for both Connie Chan ("My occupation is San Francisco Supervisor.") and Scott Wiener, page 26 for Kevin Mullin, page 27 for Matt Haney, page 28 for Catherine Stefani. No statement found for Charles Hoelter, Manuel Noris-Barrera or Philip Louis Wing in the pages read. The reading was truncated after page 35, but those contests sit on pages 25 to 28. No change. Medium.

Alameda County notes ("could not be read for this guide") were not re-verified. The composite guide linked from the county election page lists these candidates in its party preference history pages but did not include the candidate statements section in the text that could be read. No change. Low.

---

## Part B details. Candidate photos

### B1. Where official photos are published

The State Voter Information Guide web pages publish a photo for each candidate who submitted one, next to the statement. The image URLs below were read from the page markup. Nothing was downloaded.

| Candidate | Official photo | Page URL | Image URL as shown in the page |
|---|---|---|---|
| Xavier Becerra | No. Placeholder, alt "No Photo Submitted" | https://voterguide.sos.ca.gov/candidates/governor-candidate-statements.htm | https://voterguide.sos.ca.gov/img/no-photo.jpg (placeholder) |
| Steve Hilton | No. Placeholder, alt "No Photo Submitted" | same | https://voterguide.sos.ca.gov/img/no-photo.jpg (placeholder) |
| Fiona Ma | Yes | https://voterguide.sos.ca.gov/candidates/lt-governor-candidate-statements.htm | https://voterguide.sos.ca.gov/img/lt-governor/ma.jpg |
| Gloria Romero | Yes | same | https://voterguide.sos.ca.gov/img/lt-governor/romero.jpg |
| Shirley N. Weber | Yes | https://voterguide.sos.ca.gov/candidates/sos-candidate-statements.htm | https://voterguide.sos.ca.gov/img/sos/weber.jpg |
| Donald P. (Don) Wagner | Yes | same | https://voterguide.sos.ca.gov/img/sos/wagner.jpg |
| Malia M. Cohen | Yes | https://voterguide.sos.ca.gov/candidates/controller-candidate-statements.htm | https://voterguide.sos.ca.gov/img/controller/cohen.jpg |
| Herb W Morgan | Yes | same | https://voterguide.sos.ca.gov/img/controller/morgan.jpg |
| Eleni Kounalakis | Yes | https://voterguide.sos.ca.gov/candidates/treasurer-candidate-statements.htm | https://voterguide.sos.ca.gov/img/treasurer/kounalakis.jpg |
| Jennifer Hawks | Yes | same | https://voterguide.sos.ca.gov/img/treasurer/hawks1.jpg |
| Rob Bonta | No. Placeholder, alt "No Photo Submitted" | https://voterguide.sos.ca.gov/candidates/attorney-general-candidate-statements.htm | https://voterguide.sos.ca.gov/img/no-photo.jpg (placeholder) |
| Michael E. Gates | Yes | same | https://voterguide.sos.ca.gov/img/attorney-general/gates.jpg |
| Ben Allen | Yes | https://voterguide.sos.ca.gov/candidates/insurance-commissioner-candidate-statements.htm | https://voterguide.sos.ca.gov/img/insurance/allen.jpg |
| Jane Kim | Yes | same | https://voterguide.sos.ca.gov/img/insurance/kim.jpg |
| Richard Barrera | Yes | https://voterguide.sos.ca.gov/candidates/superintendent-candidate-statements.htm | https://voterguide.sos.ca.gov/img/spi/barrera.jpg |
| Sonja Shaw | Yes | same | https://voterguide.sos.ca.gov/img/spi/shaw.jpg |

Totals. 13 photos, 3 placeholders. The 3 without photos are the same 3 without statements.

Other state locations. The certified list PDF has no photos. No candidate photos were found on sos.ca.gov. The printed guide PDF (https://vig.cdn.sos.ca.gov/2026/general/pdf/complete-vig.pdf) could only be read through about page 36, so whether it prints the photos could not be confirmed. The 2026 primary guidelines say "Photographs will be printed in grayscale.", so print photos are likely, but that is not confirmed for this guide.

### B2. Terms that apply, quoted

State Voter Information Guide pages (voterguide.sos.ca.gov)
- Footer, every page checked. "© California Secretary of State." No conditions of use, terms, or copyright link appears on the guide site (https://voterguide.sos.ca.gov/candidates/).
- On each statement page. "The views and opinions expressed by the candidates are their own and do not represent the views and opinions of the Secretary of State's office." "Statements on this page were supplied by the candidates and have not been checked for accuracy by any official agency." "Each statement was voluntarily submitted and paid for by the candidate." (Example https://voterguide.sos.ca.gov/candidates/governor-candidate-statements.htm.)
- "Information About Candidate Statements" (https://voterguide.sos.ca.gov/voter-info/info-about-candidate-statements.htm). Candidates who accept voluntary spending limits "may buy space for a candidate statement (up to 250 words) in this voter guide." "Candidates who did not accept the spending limits are not permitted to submit statements." Nothing about photos or reuse.

Candidate photo submission rules (state)
- 2026 primary guidelines, https://elections.cdn.sos.ca.gov/statewide-elections/2026-primary/candidate-statement-guidelines.pdf . The November 2026 version could not be fetched (not on this session's allowlist), so this is the nearest official text. Page 2 "Candidate statements may also include a recent photograph of the candidate." Page 3 "The photo must be submitted via email at candidate-statements@sos.ca.gov." Page 7 declaration "I, the undersigned author of the attached candidate statement, hereby declare ... that the candidate statement submitted herewith is true and correct to the best of my knowledge." The document says nothing about who owns the photo's copyright, any license to the state, or any permission for others to reuse it.

sos.ca.gov main site
- Footer "Copyright © 2026 California Secretary of State" (https://www.sos.ca.gov/). Footer links are Privacy Policy, Website Help, Accessibility, Contact Us. No conditions of use or copyright page is linked.
- Privacy Policy (https://www.sos.ca.gov/administration/privacy-policy/). "Copyright © 2026 California Secretary of State". On links "Our website includes links to other websites. We provide these links as a convenience." Nothing on reuse of content or images.
- Website Help (https://www.sos.ca.gov/website-help/) and Multimedia (https://sos.ca.gov/administration/multimedia/). Only the same copyright line.
- The only "Terms and Conditions of Use" in the sitemap is for bizfile (https://www.sos.ca.gov/business-programs/bizfile/privacy-warning-terms-and-conditions-use). Its scope is "the Internet website portal of the Business Programs Division of the California Secretary of State." It says "The content organization, graphics, design, computer code, compilation, and other materials" are protected and bars use "for advertising or commercial purposes." It does not apply to the voter guide by its own terms. Do not rely on it either way.

San Francisco Department of Elections
- VIP (https://media.api.sf.gov/documents/N26_EN_VIP.pdf). Page 23 "Submission of a statement is voluntary, and statements are printed at the candidates' expense." Pages 24 to 35 "Statements are volunteered by the candidates and have not been checked for accuracy by any official agency." "Statements are printed as submitted. Spelling and grammatical errors have not been corrected." No copyright or reuse notice was found in the text read. Whether candidate photos are printed could not be confirmed from the text extraction. Read the PDF visually before relying on it.
- sf.gov candidate pages (https://www.sf.gov/candidates-november-3-2026-general-election, https://www.sf.gov/candidates). No candidate photos. The first still said candidates "will be added to this list after the results of the June 2, 2026" primary are certified when read, so it may be stale.
- sf.gov Terms of Use (https://www.sf.gov/terms-of-use). "All editorial and creative assets on this web site" "are protected by US and international copyright laws." "The City and County of San Francisco reserves all rights to this content." The City "does not certify the authenticity of information that originates from third parties." Nothing specific on images.

Alameda County Registrar of Voters
- Election page (https://acvote.alamedacountyca.gov/election-information/elections?id=260) and candidate list (https://alamedacountyca.gov/rov_app/candidatelist). No candidate photos. Composite guide shows no photos in readable text.
- Web Policy (https://acvote.alamedacountyca.gov/webpolicy) covers accessibility only. No copyright, terms or reuse text was found.

### B3. Permission verdict

- State voter guide photos. **Unclear.** The only rights text is "© California Secretary of State." There is no license or grant of permission. The photos are candidate-submitted, and no page says who holds their copyright or whether the state may sublicense them. The statement-page disclaimers ("supplied by the candidates", "their own") say who is responsible for the content. They do not grant any reuse right. Public availability does not imply permission. Treat as not cleared.
- sos.ca.gov. **Unclear.** Copyright notice only. No conditions of use page for the main site.
- San Francisco (sf.gov). **Not permitted without permission.** "The City and County of San Francisco reserves all rights to this content." Photo presence in the VIP is unconfirmed.
- Alameda County. **Unclear**, and no candidate photos found to reuse.

Practical options for the owner (no action taken). Ask each campaign for a photo with written permission to use it on the site. Or write to the Secretary of State (the guide's contact page is https://voterguide.sos.ca.gov/voter-info/contact-us.htm) asking whether the state claims rights in the guide photos. Until then, link to the official statement page rather than showing the image. Confidence in the verdict medium. It rests on the absence of terms on pages read through a fetch tool, and the November guidelines and full guide PDF could not be read.

## Pages that could not be read

- https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/candidate-statement-guidelines.pdf (not on allowlist, and it is a guessed URL).
- https://vig.cdn.sos.ca.gov/2026/general/pdf/candidate-statements.pdf (not on allowlist, guessed URL).
- complete-vig.pdf beyond about page 36 (text extraction ended at 120,558 characters).
- Image content of the SF VIP (text extraction only).
