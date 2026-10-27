# Three-choice answers in the Ballot Weighing Tool (October 26, 2026)

## 1. How the scoring worked before the change (verified in `propositions.html`)

| Answer on the card | Stored in `state.g` | `lean()` result |
|---|---|---|
| Skipped | `null` | Not answered |
| Not sure | `0` | Not sure (counted neither way) |
| Against | `-1` | Leans toward NO, whatever the evidence |
| Strongly against | `-2` | Leans toward NO, identical to Against |
| For | `1` | Leans toward YES if the evidence score is 3.0 or more, else Mixed / uncertain |
| Strongly for | `2` | Leans toward YES if the evidence score is 2.0 or more, else Mixed / uncertain |

- **Evidence score.** `quality()` is the weighted average of the 1 to 5 ratings over factors with weight above 0 and a valid rating, rounded to one decimal. If no weighted factor is rated, there is no score and the result follows the answer alone.
- **One function for every view.** `renderAll()` calls `lean()` once per proposition. The card, the progress bar tally, the Step 3 "See my ballot" list, the Prop 40 conflict note and the guide's cheat sheet copy (`ballot-leans-v1`) all read that one result.

## 2. What removing the two strength levels loses

- **Strongly against.** Gave the same result as Against in every case, so nothing is lost.
- **Strongly for.** Only lowered the evidence line from 3.0 to 2.0. In the 1,008-case baseline (14 propositions, 12 weight settings, 6 answers), no proposition scores below 2.0 under any setting. Strongly for therefore always gave Leans toward YES, and 51 of the 168 Strongly for cases would have been Mixed under For.

## 3. Mapping chosen

| New answer | Stored as | Result |
|---|---|---|
| Yes | `1` | Leans toward YES at 3.0 or more, else Mixed / uncertain |
| Not sure | `0` | Not sure |
| No | `-1` | Leans toward NO |
| Skipped | `null` | Not answered |

**Alternative not taken.** Storing Yes as `2` would make every Yes a confident Leans toward YES, so the evidence would stop affecting any result. That conflicts with the requirement not to produce a confident lean the inputs do not support.

**Saved answers from the five-choice version.** These are converted on load:
- `2` (Strongly for) becomes `1` (Yes).
- `-2` (Strongly against) becomes `-1` (No).

Out-of-range, text and unknown values are still ignored. Under Standard weights, a voter who had chosen Strongly for on Prop 4, 39, 40, 42, 44 or 45 now sees Mixed / uncertain there instead of Leans toward YES.

**Formula unchanged.**
- `quality()` and `lean()` keep the same arithmetic and cutoffs, along with the ratings, weights and presets.
- The old `+2` branch in `lean()` is kept but can no longer be reached from the page.
- Only the reason sentences in `lean()` were reworded, for example "You would vote yes" instead of "You support the goal".

## 4. Interface

- **Question and buttons.** Each card asks "How would you vote on this proposition?" (the legend also names the Prop for screen readers) and offers three equal buttons, Yes | Not sure | No, in one row.
  - Each button is at least 48 px tall with a 2 px border and a pointer cursor, and gets hover and pressed states.
  - The selected button is filled and shows a check mark, so selection does not rely on color.
  - A 3 px outline marks keyboard focus.
  - The buttons are native radio buttons, so screen readers announce which one is selected and the arrow keys move between them.
- **Clearing.** A new "Clear answer" link on each answered card returns that proposition to Not answered. "Clear my answers" still clears all 14.
- **Wording.** The intro, step labels, the "How your result is worked out" table and the About page now describe Yes, Not sure and No.

## 5. Tests run (all after the change)

Command `npm test`. Log in `audit/logs/2026-10-26-three-choice-npm-test.log`.

| Check | Result |
|---|---|
| Scoring regression, Part 1 (score, lean class, label; 1,008 cases) | 0 differences, fixture not changed |
| Scoring regression, Part 2 | Recaptured. Before recapture, the only differences were 840 reworded reasons with nothing else changed, and the two saved-answer cases holding 2 or -2. The weights are identical. |
| New unit tests `tests/three-choice.test.mjs` | 24 of 24 |
| Weighing Tool browser tests | 474 of 474. They include, at 1280, 768 and 360 px in light and dark, and with touch at 320 and 390 px: one row, 44 px or taller, no clipped text, single selection, Yes then No, Not sure counted, Clear answer, refresh, keyboard and focus outline, not covered by the sticky bar, and card matching the Step 3 row. |
| Guide browser tests | 571 of 571 |
| GoatCounter stand-in | 124 of 124 |
| Data validation, validator self-test (207), percentage arithmetic (25), HTML validation | All pass |

**Not tested.** Safari and Firefox, and real phones. The live site is not updated until you push.

## 6. Follow-up, the same day: the answer is the result

**Problem.** Showing "Mixed / uncertain" after a voter chose Yes read as the tool overruling them, and only Yes answers were ever checked against the evidence.

**What each card shows now**
- **Your answer.** Yes, No or Not sure exactly as chosen, with a check mark, or "Not answered" in a dashed box.
- **Evidence check.** One neutral sentence that is the same for every answer, for example "On the factors you weigh, this measure rates Fair, 2.9 of 5, below the 3.0 midpoint." Below it is the bar with a marker at the 3.0 midpoint (the middle of the 1 to 5 scale), followed by the percentage, the strongest and weakest factors, and the limited-information caution.
- **Next step.** A link to the other side of the answer:
  - after Yes, the argument against and the biggest risk;
  - after No, the argument for;
  - after Not sure, both arguments.

  The link opens More facts at that argument.

**Elsewhere in the tool**
- **Step 3 and the progress bar.** Both count Yes, No, Not sure and Not answered. Each row shows the evidence beside the answer.
- **Cheat sheet.** Shows "Your answer in the Weighing Tool" with the evidence. It reads a new key, `ballot-answers-v1`, so older lean labels are never shown.
- **Prop 40 conflict note.** Appears when the voter answers Yes on 40 and on 41 or 42. This is the same condition as before, because every Yes used to show either Leans YES or Mixed.
- **Methods section.** Rewritten as "How your answer and the evidence are shown".

**Unchanged.** The ratings, weights, `quality()` and `lean()` all stay as they were. `lean()` still runs, and its regression still passes, but its YES, NO and Mixed labels are no longer displayed. "Mixed" remains one of the five evidence words (Weak, Mixed, Fair, Solid, Strong) for scores from 2.0 to 2.74.

**Tests after the follow-up.** `npm test` exited 0.

| Suite | Result |
|---|---|
| Weighing Tool browser tests | 502 of 502 |
| Guide | 571 of 571 |
| Unit tests | 24 of 24 |
| Scoring regression | 0 differences in both parts |
| GoatCounter stand-in | 124 of 124 |

Log in `audit/logs/2026-10-26-answer-display-npm-test.log`.

## 7. Hand-off from the tool to the cheat sheet (same day)

**In the tool**
- **Step 3 card.** Says how many propositions are still unanswered and that they will be blank on the sheet. Its button goes to the voter's own cheat sheet when they came from a ballot or cheat sheet page. Otherwise it goes to Find My Ballot with `next=sheet`, which opens the sheet once a place is chosen.
- **Completion message.** On the 14th answer, "That's all 14" appears under that card with an "Open my ballot cheat sheet" button, and the sticky bar button becomes "Next: my cheat sheet". Nothing navigates on its own. Clearing an answer hides the message again.

**On the cheat sheet**
- **Carried-over answers.** Yes and No from the tool are ticked for the voter. Not sure and unanswered stay blank. Each statewide row says where its tick came from, and a summary at the top counts what was carried over.
- **Sheet changes win.** A change made on the sheet, including unticking, is the voter's own and is kept. A later tool answer for that row does not replace it. "Use it", or "Use all my Weighing Tool answers", restores the tool answer.
- **Later tool answers.** Tool answers on rows not changed on the sheet keep flowing through.
- **Clear my marks.** Blanks every box, including the carried-over ticks.
- **Privacy.** Everything stays in this browser (`ballot-weighing-v2`, `ballot-answers-v1`, `ballot-sheet-v1`).

**Tests**
- 20 new guide browser checks cover the whole path, from tool to sheet, including an override, a refresh, a later tool change, Use it, Clear, Use all, and the Find My Ballot route.
- `npm test` exited 0:

| Suite | Result |
|---|---|
| Guide | 591 of 591 |
| Weighing Tool | 502 of 502 |
| Unit tests | 24 of 24 |
| Scoring regression | 0 differences |

Log in `audit/logs/2026-10-26-cheat-sheet-handoff-npm-test.log`.
