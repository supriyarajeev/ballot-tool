"""Owner decision, Oct 24, 2026: show every candidate photo found on Wikimedia Commons with a
public-domain or Creative Commons tag, including the PD-CAGov photos of Legislature members
withdrawn earlier, and drop the rule that hid a photo when an opponent had none.
Inputs: Commons metadata read in the desktop browser (licence templates, artist, date,
description) and crops made from Commons thumbnails. Run from the repo root."""
import json, re, hashlib, shutil, sys, urllib.parse
SRC = sys.argv[1]  # folder with the cropped jpgs
CF = 'data/2026-11-03/candidates.json'
d = json.load(open(CF)); byid = {c['id']: c for c in d['candidates']}
man = json.load(open('audit/2026-10-24/photo-manifest.json'))
mrow = {r['candidateId']: r for r in man['candidates']}
meta = json.load(open(sys.argv[2]))  # commons metadata (title -> fields)
OWNER = ("Shown on the site owner's decision for this beta release (Oct 24, 2026). "
         "This is the license tag on Wikimedia Commons, not permission from the candidate or photographer.")
TPL = {
 'PD-CAGov': ('Public domain (PD-CAGov)', 'https://commons.wikimedia.org/wiki/Template:PD-CAGov',
   'Tagged PD-CAGov on Wikimedia Commons (works of California state and local government). That reading is Wikimedia Commons\' and is not a court ruling on this photo.'),
 'PD-USGov-Congress': ('Public domain (PD-USGov-Congress, U.S. federal work)', 'https://commons.wikimedia.org/wiki/Template:PD-USGov-Congress', 'Work of the U.S. Congress, in the public domain under U.S. copyright law (17 U.S.C. 105).'),
 'PD-USGov-HHS': ('Public domain (PD-USGov-HHS, U.S. federal work)', 'https://commons.wikimedia.org/wiki/Template:PD-USGov-HHS', 'Work of the U.S. Department of Health and Human Services, in the public domain under 17 U.S.C. 105.'),
 'PD-USGov-Military-Air National Guard': ('Public domain (PD-USGov-Military-Air National Guard, U.S. federal work)', 'https://commons.wikimedia.org/wiki/Template:PD-USGov-Military-Air_National_Guard', 'Photo by a U.S. Air National Guard member as part of official duties, in the public domain under 17 U.S.C. 105.'),
 'Cc-by-2.0': ('CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/', 'Creative Commons Attribution 2.0. Attribution required.'),
 'Cc-by-sa-2.0': ('CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/', 'Creative Commons Attribution-ShareAlike 2.0. Attribution required; the cropped copy is shared under the same license.'),
 'Cc-zero': ('CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/', 'Creative Commons Zero public domain dedication.'),
}
def orig_url(title):
    n = title[5:].replace(' ', '_'); h = hashlib.md5(n.encode()).hexdigest()
    return f'https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{urllib.parse.quote(n)}'
added = []
for title, m in meta.items():
    cid = m['cid']; c = byid[cid]; row = mrow[cid]
    key = next(k for k in TPL if k in m['templates'].split(', '))
    lic, licurl, ev = TPL[key]
    slug = cid.rsplit('.', 1)[1]
    dst = f'assets/candidates/{slug}.jpg'; shutil.copy(f"{SRC}/{m['file']}", dst)
    year = (re.search(r'(19|20)\d\d', m['date'] or '') or [None])[0] or ''
    q = re.search(r'Q\d+', row.get('note') or '')
    page = row['source']
    desc = re.sub(r'\s+', ' ', m['desc']).strip()
    if len(desc) > 140: desc = desc[:137].rsplit(' ', 1)[0] + '...'
    idc = ((f"Wikidata {q.group(0)} was matched to this candidate in the Oct 24, 2026 photo search; " if q else "")
           + f'the Commons file description reads "{desc}"' + (f"; the file comes from {m['credit']}" if m['credit'].startswith('https://sfbos.org') or m['credit'].startswith('https://lee.house.gov') else "")
           + ". Not compared with a photo in the official voter guide.")
    leg = 'PD-CAGov' == key and ('Assembly' in m['artist'] or 'Senate' in m['artist'])
    evid = ev + (" The California Public Records Act, on which that tag rests, does not cover the Legislature, so the legal basis for this Legislature photo is not settled." if leg else "") + " " + OWNER
    c['photo'] = {
        'src': dst, 'sourceUrl': orig_url(title), 'sourcePage': page, 'retrieved': '2026-10-24',
        'credit': f"{m['artist']}{', ' + year if year else ''}. {lic}. Via Wikimedia Commons.",
        'license': lic, 'licenseUrl': licurl, 'year': year or 'unknown',
        'modified': 'Cropped to a square and resized to 192 by 192 pixels for this guide.',
        'identityCheck': idc,
        'permission': {'grantedBy': 'License tag on the source file (no permission was requested from the candidate or photographer)', 'date': '2026-10-24', 'evidence': evid},
    }
    if m.get('event'): c['photo']['modified'] = 'Cropped from an event photo to a square around the candidate and resized to 192 by 192 pixels for this guide.'
    added.append(cid)
# restore the four withdrawn Legislature photos
w = json.load(open('audit/2026-10-24/photos-withdrawn.json'))
for cid, ph in w.items():
    ph = dict(ph); ph.setdefault('licenseUrl', 'https://commons.wikimedia.org/wiki/Template:PD-CAGov')
    ph['permission'] = dict(ph['permission']); ph['permission']['grantedBy'] = 'License tag on the source file (no permission was requested from the candidate or photographer)'
    ph['permission']['evidence'] = ph['permission']['evidence'] + " The California Public Records Act, on which that tag rests, does not cover the Legislature, so the legal basis for this Legislature photo is not settled. " + OWNER
    byid[cid]['photo'] = ph; added.append(cid)
json.dump(d, open(CF, 'w'), indent=1, ensure_ascii=False); open(CF, 'a').write('\n')
print(len(added), 'photos added or restored')
