"""Photos for candidates in the 20 contests added on Oct 24, 2026. Each file is the Wikidata image (P18) of the item
matched to the candidate by name and office, read through the Commons API. Run from the repo root with the folder of
crops: python3 audit/2026-10-24/apply_photos_new_contests.py <crops>"""
import json, sys, shutil, urllib.parse, hashlib, re
SRC = sys.argv[1]
meta = json.load(open('audit/2026-10-24/photos-commons-meta-2.json'))
CF = 'data/2026-11-03/candidates.json'; d = json.load(open(CF))
byname = {}
for c in d['candidates']: byname.setdefault(c['name'], []).append(c)
TPL = {
 'PD-CAGov': ('Public domain (PD-CAGov)', 'https://commons.wikimedia.org/wiki/Template:PD-CAGov', "Tagged PD-CAGov on Wikimedia Commons (works of California state and local government). That reading is Wikimedia Commons' and is not a court ruling on this photo. The California Public Records Act, on which that tag rests, does not cover the Legislature, so the legal basis for this Legislature photo is not settled."),
 'PD-USGov-Congress': ('Public domain (PD-USGov-Congress, U.S. federal work)', 'https://commons.wikimedia.org/wiki/Template:PD-USGov-Congress', 'Work of the U.S. Congress, in the public domain under U.S. copyright law (17 U.S.C. 105).'),
 'Cc-by-sa-4.0': ('CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/', 'Creative Commons Attribution-ShareAlike 4.0. Attribution required; the cropped copy is shared under the same license.'),
}
OWNER = " Shown on the site owner's decision for this beta release (Oct 24, 2026). This is the license tag on Wikimedia Commons, not permission from the candidate or photographer."
n = 0
for title, m in meta.items():
    if 'file' not in m: continue  # skipped: description names another person, or uploader-authored PD-CAGov claim
    name, q = m['who'].split('|')
    cands = [c for c in byname.get(name, []) if c['lastVerified'] == '2026-10-24' and not c.get('photo')]
    assert len(cands) == 1, (name, len(cands))
    c = cands[0]
    lic, licurl, ev = TPL[m['tpl']]
    page = 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_'), safe=':,()_-.')
    year = (re.search(r'(19|20)\d\d', m['date'] or '') or [''])[0]
    artist = {'US Government': 'U.S. House of Representatives', 'State of California': 'State of California (Legislature)'}.get(m['artist'], m['artist'])
    dst = 'assets/candidates/' + m['file']; shutil.copy(f"{SRC}/{m['file']}", dst)
    c['photo'] = {
        'src': dst, 'sourceUrl': m['url'].split('?')[0], 'sourcePage': page, 'retrieved': '2026-10-24',
        'credit': f"{artist}{', ' + year if year else ''}. {lic}. Via Wikimedia Commons.",
        'license': lic, 'licenseUrl': licurl, 'year': year or 'unknown',
        'modified': 'Cropped from an event photo to a square around the candidate and resized to 192 by 192 pixels for this guide.' if 'Festival' in title else 'Cropped to a square and resized to 192 by 192 pixels for this guide.',
        'identityCheck': f'Wikidata {q} (the item for this candidate, found by name and office) uses this file as its image; the Commons description reads "{m["desc"][:140]}". The ballot designation and district match. Not compared with a photo in an official voter guide.',
        'permission': {'grantedBy': 'License tag on the source file (no permission was requested from the candidate or photographer)', 'date': '2026-10-24', 'evidence': ev + OWNER},
    }
    n += 1
json.dump(d, open(CF, 'w'), indent=1, ensure_ascii=False); open(CF, 'a').write('\n')
print(n, 'photos added')
