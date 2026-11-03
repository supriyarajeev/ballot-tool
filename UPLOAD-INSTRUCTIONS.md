# Upload instructions (November 2, 2026, local measures)

GitHub Pages settings, the domain and the public link (https://supriyarajeev.github.io/ballot-tool/) do not change.

## 1. Push with the terminal (recommended)

```
cd ~/Desktop/ballot-tool
git pull
git status                      # should say "nothing to commit". If not, run: git checkout .
unzip -o ~/Downloads/ballot-guide-nov2b.zip
git add -A
git status                      # expect the changed files plus research/2026-11-01 and audit/2026-11-02
git commit -m "Local measures filled in from official documents, Change place fix"
git push
```

Check the ZIP first: `unzip -l ~/Downloads/ballot-guide-nov2b.zip | tail -1` should show the file count given in the chat. If your browser saved it with a number, such as "(1)", use that exact name.

## 2. Or upload on the website

Upload the changed files: `index.html`, `propositions.html`, `CHANGELOG.md`, `UPLOAD-INSTRUCTIONS.md`, the `assets` folder, and the `data`, `docs`, `tools` and `tests` folders. Then upload the `research` folder and, from inside the repository's `audit` folder, `2026-11-02`. Commit each with "Commit directly to the main branch".

## 3. Wait for the deploy

Open the **Actions** tab and wait for the newest "pages build and deployment" to show a green check, usually 1 to 3 minutes.

## 4. Hard refresh

Cmd+Shift+R on a computer. On a phone, close the tab and open the link again.

## 5. Post-deployment checklist

On a phone (about 390 px wide):
- [ ] Open My ballot cheat sheet for Sunnyvale. Tap "Details and sources" on Measure H. "In plain English", "A yes vote means" and "A no vote means" are filled in. Research notes end with "Nov 2, 2026. Added from the official measure documents".
- [ ] Open a Marin measure, for example Larkspur Measure S. Arguments for and against shows the argument in favor and its signers, and says no argument against was filed.
- [ ] Pick a county outside the Bay Area, for example Amador, then tap Change place. The county and city picker opens.
- [ ] The Ballot Weighing Tool opens with Guide default, Equal and Set my own.
- [ ] Nothing scrolls sideways.

## 6. If something is wrong

Open the repository's commit list and revert the latest release commit. The site returns to the previous version within a few minutes.
