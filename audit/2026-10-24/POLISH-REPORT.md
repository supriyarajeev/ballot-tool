# Professional polish and mobile pass (October 24, 2026)

## Changes

**Header and navigation (all guide pages)**
- On phones (below 640 px) the header is one row: the site name and a **Menu** button. The button opens the links as a two-column grid of 44 px targets. Escape closes it, choosing a link closes it, and the current section is marked (`aria-current`).
- Below 380 px the visible name shortens to "Bay Area Ballot Guide". Screen readers still hear the full name.
- Without JavaScript the links stay visible.
- The header respects the phone's safe-area insets.

**Home**
- The title breaks deliberately: "California Bay Area" on one line, "Ballot Guide" on the next.
- **Find My Ballot** and **Ballot Weighing Tool** now come right after the tagline, so they are visible without scrolling on a 360 px phone.
- Vertical spacing on phones is tighter.
- The three quick links are a tidy list with chevrons.
- The beta notice is smaller on phones, with the same wording.

**Candidate evaluation**
- The zero-score interface is gone. It showed weight percentages, "0 of 7 factors" and "Insufficient evidence" for every candidate.
- In its place is a status panel: "Candidate evaluation · **Research pending**". It says no candidate has a score or rating in this release, that missing information is not a low score, and what a future evaluation would rest on.
- The scoring code is kept behind a switch: `release.public` in `data/candidate-rubric.json`. It is now false.
- Even when the switch is on, a contest shows scores only if every candidate has all seven factors rated, sourced and reviewed by a named person. See docs/CANDIDATE-EVALUATION.md.

**Ballot Weighing Tool**
- On phones the sticky progress bar is one row (count, bar, **See my ballot**), 56 px tall. The lean tally is still shown in Step 3.
- "See my ballot" is a 44 px button.
- Jumping to a step leaves its heading below the bar. A test checks this.
- The screen reader announcement is limited to the progress count, instead of the whole bar.
- Each calculation table sits in its own labeled, keyboard-focusable scroll area.
- The contribution bar has a key with light and dark swatches for the two segments.
- No formula, weight, rating or lean changed. The scoring regression shows 0 differences in 1,008 cases.

**About**
- A four-item summary at the top: what it covers, what software checks, what a person has reviewed (nothing yet), and candidate scores (none).
- New sections:
  - "Evidence ratings and your preferences";
  - "What 'Insufficient evidence' means";
  - "Candidate evaluation" (the status and the future process);
  - "How sources are chosen".
- The photo note no longer mentions Legislature portraits, which were removed earlier.
- All existing limitations stay.

**Everywhere**
- Long names, offices and source links wrap instead of overflowing.
- Section summaries keep 44 px targets.
- The footer clears the iPhone home indicator.
- Animations and smooth scrolling respect reduced-motion settings.

**Validator**
- `release.public` must be true or false.
- `release.enableWhen` must list the conditions for turning candidate evaluation on.
- `reviewedBy`, when present, must name a person.

## Files changed

`index.html`, `propositions.html`, `assets/guide.js`, `assets/guide.css`, `data/candidate-rubric.json`, `tools/validate.mjs`, `tests/browser/guide.test.cjs`, `tests/browser/weighing-tool.test.cjs`; new `docs/CANDIDATE-EVALUATION.md`, this report, and the test log `audit/logs/2026-10-24-polish-npm-test.log`.

## Tests run (all after the changes)

Command `npm test`, exit 0. Full log in `audit/logs/2026-10-24-polish-npm-test.log`.

| Check | Result |
|---|---|
| Generated files match generators | Passed |
| Data validation | 0 errors, 0 warnings |
| Validator self-test | 207 of 207 |
| Scoring regression, all 14 propositions, presets, saved state, sliders | 1,008 cases, 0 differences |
| Percentage arithmetic | 25 of 25 |
| Static HTML validation | Passed |
| Guide browser tests | 527 of 527 |
| Weighing Tool browser tests | 278 of 278 |
| Visitor counter stand-in | 124 of 124 |

**New browser checks**
- Phone menu: open, close, Escape, current page, 44 px targets.
- The header title stays on one line, and the title breaks in the intended place.
- Find My Ballot is visible on first load at 360 px.
- Browser Back and Forward work.
- No horizontal overflow on 8 routes at 320, 360, 375, 390, 414, 430, 768, 1024 and 1280 px.
- The candidate panel has no scores, percentages, tables or controls.
- Candidates keep the official order.
- The switch stays off when false, stays off when any candidate is unreviewed, and turns on only with reviewed ratings for every candidate. The ratings in that test are test data and are not published.
- The tool's sticky bar height, the 44 px See my ballot button, and step headings landing below the bar.

**Separate sweep**
- 12 routes at the 9 widths found no overflow, no broken images and no console errors.
- axe-core ran at 360, 768 and 1280 px in light and dark on 13 routes, and on the tool. It found no violations.

**Not tested**
- External source links. The test machine cannot reach outside sites; internal links are tested.
- Safari and Firefox.
- 200% zoom. It is equivalent to the 640 px layout, which is covered by the width sweep.
- The live site, until you deploy.

## Remaining issues

- Candidate research has not started, so every contest shows the pending panel.
- Nothing has been reviewed by a person. See LIMITATIONS.md for the full list, which is unchanged.
- On a 390 px phone, "Ballot Weighing Tool" wraps to two lines inside its menu tile. It is readable but not elegant.
- WCAG compliance is not claimed. axe-core finds no violations, but that is not a full audit.

## Confirmations

- The candidate evaluation feature no longer shows zero scores, weight percentages or "Insufficient evidence" lists to the public.
- No candidate rating, candidate fact or election fact was added or changed in this pass.
- No proposition rating, weight or formula changed.
