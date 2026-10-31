# Upload instructions (October 31, 2026, candidate comparisons)

GitHub Pages settings, the domain and the public link (https://supriyarajeev.github.io/ballot-tool/) do not change.

## 1. Push with the terminal (recommended)

```
cd ~/Desktop/ballot-tool
git pull
git status                      # should say "nothing to commit". If not, run: git checkout .
unzip -o ~/Downloads/ballot-guide-comparisons-oct31.zip
git add -A
git status                      # expect the changed files plus the new research/2026-10-31 and audit/2026-10-31 folders
git commit -m "Candidate comparisons for 54 contests, quotes matched to their sources"
git push
```

Check the ZIP first: `unzip -l ~/Downloads/ballot-guide-comparisons-oct31.zip | tail -1` should show the file count given in the chat. If your browser saved it with a number, such as "(1)", use that exact name.

## 2. Or upload on the website

Upload the changed files: `index.html`, `propositions.html`, `CHANGELOG.md`, `UPLOAD-INSTRUCTIONS.md`, the `assets` folder, and the `data`, `docs`, `tools` and `tests` folders. Then upload the `research` folder and, from inside the repository's `audit` folder, `2026-10-31`. Commit each with "Commit directly to the main branch".

## 3. Wait for the deploy

Open the **Actions** tab and wait for the newest "pages build and deployment" to show a green check, usually 1 to 3 minutes.

## 4. Hard refresh

Cmd+Shift+R on a computer. On a phone, close the tab and open the link again.

## 5. Post-deployment checklist

On a phone (about 390 px wide):
- [ ] The menu says "Candidates and races". It opens a page that starts with the compared contests and a grey line "Comparisons cover 54 of ... contests in this guide."
- [ ] Open Mountain View City Council. "Where they stand" lists seven issues. Tap "Open all issues". Each cell is a quote with a source link and "Quote matched its source on Oct 31, 2026", or "No public statement found in our sources."
- [ ] Open a US House race, for example District 16. Candidates are in ballot order and nothing scrolls sideways.
- [ ] About this guide has a "Candidate comparisons" section that says the guide does not rate, rank or endorse candidates.
- [ ] Open the Ballot Weighing Tool. Step 1 shows a short summary and a Details button. Tap Details. It lists five factors and a "How these ratings behave" box that says the 14 range from 2.3 to 3.9. "How scoring works" is folded.
- [ ] Step 2 is a list of 14 rows, each with Yes, Not sure and No. Tap "One-time billionaire tax". Prop 40 opens with "Who could gain", "Who pays or gives something up" and "How hard to change later".
- [ ] Answer Prop 40 Yes. The evidence check shows Strong on, Weak on, In the middle, then "46% 2.3 of 5 · Mixed".
- [ ] Tap another name. It opens and Prop 40 folds.
- [ ] Nothing scrolls sideways.

- [ ] Home page. Key dates start with "Election Day is Tuesday, November 3". The region, coverage and official tools sections each show a Show details button.

On a computer:
- [ ] Prop 44, More facts. "Campaign money" opens the Secretary of State page for Proposition 44. "Other measures on this ballot" is there.
- [ ] Prop 2 ratings show "Accountability and results" with a half-filled dot and "Checks on the work 2, measurable results 3".
- [ ] Step 3 shows answers only. Tick "Show evidence scores in this list" and the scores appear.
- [ ] Hard refresh once (Cmd+Shift+R) so the browser loads the new weights file.
- [ ] Every page ends with "Developed by Supriya Rajeev for educational purposes." and the Secretary of State link.

## 6. If something is wrong

Open the repository's commit list and revert the latest release commit. The site returns to the previous version within a few minutes.
