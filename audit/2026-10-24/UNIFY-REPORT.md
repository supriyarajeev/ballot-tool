# One experience for the 14 statewide propositions (October 24, 2026)

## Root cause

Each statewide proposition had two pages. Ballot lists linked every measure, statewide or local, to the guide's own item page (`index.html#/item/<id>`). For a statewide proposition, that page showed a text summary built from `statewide.json` and a link to "the full proposition tool". The tool (`propositions.html`) is where the framework, ratings, weights and leans live. So voters reached a second, thinner page first.

## What changed

**`assets/guide.js`**
- `toolAnchor()` and `toolHref()` route a measure into the tool only when all three hold:
  - its jurisdiction is the state;
  - its level is `state`;
  - its `detailUrl` names a tool card (`propositions.html#prop-N`).
  
  The tool card numbers come from that existing `detailUrl`, which `tools/extract-statewide.mjs` generates from the tool itself. Nothing is hand-mapped.
- `itemRow()` links those 14 rows to `propositions.html?from=<ballot page>&place=<place name>#prop-N`. Each row now says "Open in the Ballot Weighing Tool ›". Local measures keep `#/item/<id>`.
- A **"Go to Ballot Weighing Tool — All 14 Propositions"** button sits above the statewide list on every ballot page and on the statewide page. It opens the full tool, with the same way back.
- `route()` records which ballot, browse, statewide or contests page the voter is on, so the tool can link back to it.
- `viewItem()` forwards an old `#/item/<statewide prop>` link to the same card in the tool. It uses `location.replace`, so Back still works. Local item pages are unchanged.

**`assets/guide.css`**
- Styles for the button and the row cue.
- A visible focus outline on every row, and a pointer cursor.
- On phones the cue moves under the title and the button spans the width.

**`propositions.html`**
- A **"Back to your ballot: <place>"** link under the header, and a short **Ballot** link in the sticky progress bar. Both appear only when the voter arrives from a ballot page.
- The return address is accepted only if it matches the guide's own page pattern. It is kept for that browser tab, so moving between propositions, refreshing or answering questions keeps it. It is never sent anywhere; the visitor counter uses only the page path.
- A row of 14 "Prop N" jump links at the top of Step 2, with a line pointing to the Standard Evaluation Framework in Step 1.
- On arrival or on a jump, the chosen card is outlined, scrolled below the progress bar, and its heading takes focus.

**Unchanged**
- No rating, weight, formula, lean, saved answer or proposition text.
- The tool's data is still the single source. `statewide.json` is still generated from it.

**Tests**
- `tests/browser/guide.test.cjs`:
  - every Alameda statewide row points to its own card with the way back, and each record maps to its card;
  - local measures keep their pages;
  - the button is above the list, says the right thing, and opens all 14 with the way back;
  - rows show a focus outline and a pointer cursor;
  - Prop 1 opens with the framework present;
  - jumping to Prop 44 and refreshing keep the way back, and Back and Back again return to Prop 1 and then the ballot;
  - an old item link opens Prop 38;
  - the statewide page links all 14.

  Tests that used statewide item pages now use a local item.
- `tests/browser/weighing-tool.test.cjs`:
  - 14 jump links;
  - no back link without a ballot;
  - an unsafe return address is ignored;
  - on a phone the chosen card sits below the progress bar with no overflow, and the bar has the Ballot link;
  - answering still works after arriving from a ballot.

## Routes

| What | Address |
|---|---|
| One proposition, from a ballot | `propositions.html?from=%23%2Fballot%2F<county>[%2F<city>]&place=<name>#prop-N` |
| One proposition, direct | `propositions.html#prop-N` |
| Full tool, from a ballot | `propositions.html?from=...&place=...` |
| Full tool, direct | `propositions.html` |
| Old statewide item link | `index.html#/item/2026-11-03.ca.prop-N`, forwarded to `propositions.html#prop-N` |
| Local measure | `index.html#/item/<local id>`, unchanged |

## Tests run

Command `npm test`, exit 0. Log in `audit/logs/2026-10-24-unify-npm-test.log`.

| Check | Result |
|---|---|
| Data validation | 0 errors |
| Validator self-test | 207 of 207 |
| Scoring regression | 1,008 cases, 0 differences |
| Percentage arithmetic | 25 of 25 |
| Static HTML validation | Passed |
| Guide browser tests | 529 of 529 |
| Weighing Tool browser tests | 294 of 294 |
| Visitor counter stand-in | 124 of 124 |
| Width sweep (12 routes, 320 to 1280 px): overflow, broken images, console errors | None found |

**Not tested:** Safari and Firefox, and the live site, which is not deployed yet.

## Limitations

- The way back is kept per browser tab. A proposition link opened in a new tab or shared with someone shows no "Back to your ballot" link, only the usual link to the guide.
- The guide's old statewide item pages still exist in the code but are no longer reachable. Their links forward to the tool.
