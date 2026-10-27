# Upload instructions (October 26, 2026, Yes | Not sure | No)

GitHub Pages settings, the domain and the public link (https://supriyarajeev.github.io/ballot-tool/) do not change.

## 1. Push with the terminal (recommended)

```
cd ~/Desktop/ballot-tool        # your clone; if it is gone: git clone https://github.com/supriyarajeev/ballot-tool.git
git pull
unzip -o ~/Downloads/ballot-guide-release-oct26.zip
git add -A
git status                      # expect about 14 changed or new files
git commit -m "Release readiness: neutral wording, trust signals, landing page"
git push
```

Check the ZIP first: `unzip -l ~/Downloads/ballot-guide-release-oct26.zip | tail -1` should show 231 files. If your browser saved it with a number, such as "(1)", use that exact name.

## 2. Or upload on the website

Upload the changed files: `index.html`, `propositions.html`, `README.md`, `CHANGELOG.md`, `UPLOAD-INSTRUCTIONS.md`, the `assets` folder, and the `data`, `docs`, `tools` and `tests` folders. Then, from inside the repository's `audit` folder, upload `logs` and `2026-10-24`. Commit each with "Commit directly to the main branch".

## 3. Wait for the deploy

Open the **Actions** tab and wait for the newest "pages build and deployment" to show a green check, usually 1 to 3 minutes.

## 4. Hard refresh

Cmd+Shift+R on a computer. On a phone, close the tab and open the link again.

## 5. Post-deployment checklist

On a phone (about 390 px wide):
- [ ] The header shows "California Bay Area Ballot Guide" on one line and a **Menu** button. Menu opens the five links; choosing one closes it.
- [ ] The home title reads "California Bay Area" then "Ballot Guide". **Find My Ballot** shows without scrolling.
- [ ] Open the Ballot Weighing Tool and scroll. The progress bar is one slim row with **See my ballot**. Tap step 2 at the top; its heading is not hidden under the bar.
- [ ] Answer one question; a lean appears. Open "How this score is calculated"; the table fits or scrolls inside its box.

On a computer:
- [ ] Open the Ballot Weighing Tool, Prop 1, More facts. Source [1] "LAO analysis" opens the official voter guide's analysis page, and "LAO PDF" beside it opens the LAO's PDF.
- [ ] Find My Ballot, Alameda. Open Statewide propositions. A "Go to Ballot Weighing Tool — All 14 Propositions" button is above the list. Click Prop 1: the tool opens at Prop 1 with "Back to your ballot: Alameda County". Click it to return.
- [ ] Open a local measure on the same page; it opens the guide's own measure page, not the tool.
- [ ] The links show in the header with no Menu button.
- [ ] Candidates, then Governor. Both photos show. Below them is "Candidate evaluation · Research pending" with no percentages or "Insufficient evidence" lists.
- [ ] Prop 44 in the tool shows 52% with standard weights.
- [ ] About opens with four summary boxes, including "Candidate scores. None assigned."
- [ ] Find My Ballot, Contra Costa, Concord. Candidate elections include Concord contests, and "What has been checked" lists 61 seats not on the ballot.
- [ ] Every page ends with "Developed by Supriya Rajeev for educational purposes." and the Secretary of State link.

## 6. If something is wrong

Open the repository's commit list and revert the latest release commit. The site returns to the previous version within a few minutes.
