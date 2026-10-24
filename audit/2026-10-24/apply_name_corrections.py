"""Corrections to contests that were already in the guide, found when the county lists were read (Oct 24, 2026).
Names follow the ballot name printed on the county registrar's list (Alameda County ROV candidate list; Contra Costa
County Contests On Ballot list for the two EBMUD wards, which cross into Contra Costa). Ids are kept so links still work.
Run from the repo root after apply_local_contests.py."""
import json

ALA = {"label": "Alameda County Registrar of Voters, candidate list, November 3, 2026 General Election", "url": "https://alamedacountyca.gov/rov_app/candidatelist", "type": "Official"}
CCC = {"label": "Contra Costa County Elections, Contest/Candidate Proof List, Contests On Ballot (printed 8/27/2026)", "url": "https://www.contracostavote.gov/wp-content/uploads/8-27-26_candidatelist_detail_final.pdf", "type": "Official"}
P = '2026-11-03.'
NAMES = {  # id: (ballot name, designation or None to keep, source)
    P + 'ca-alameda-sd-berkeley-unified-school-district.school-board-director.ka-dijah-brown': ("Ka'Dijah A. Brown", None, ALA),
    P + 'ca-alameda-hayward-council-district-1.city-council.brian-m-schott': ("Brian M. Schott", None, ALA),
    P + 'ca-alameda-alameda.mayor.tracy-l-jensen': ("Tracy Jensen", "Councilmember/Nonprofit Director", ALA),
    P + 'ca-alameda-alameda.mayor.tony-daysog': ("Tony Daysog", "Councilmember/Urban Planner", ALA),
    P + 'ca-alameda-alameda.mayor.malia-vella': ("Malia Vella", "Businesswoman/Educator", ALA),
    P + 'ca-alameda-alameda.city-council.thushan-amarasiriwardena': ("Thushan Amarasiriwardena", "Software Product Manager", ALA),
    P + 'ca-alameda-alameda.city-council.maria-l-bondonno': ("Maria L. Bondonno", "Public Service Attorney", ALA),
    P + 'ca-alameda-alameda.city-council.marcie-johnson': ("Marcie Johnson", "Social Worker", ALA),
    P + 'ca-alameda-alameda.city-council.tyler-savage': ("Tyler Savage", "Technology Partner Manager", ALA),
    P + 'ca-alameda-alameda.city-council.steve-slauson': ("Steve Slauson", "Small Business Owner", ALA),
    P + 'ca-alameda-alameda.city-council.amos-white': ("Amos White", "Environmental Nonprofit Executive", ALA),
    P + 'ca-alameda-emeryville.city-council.kalimah-priforce': ("Kalimah Atreyu Priforce", None, ALA),
    P + 'ca-alameda-piedmont.city-council.n-sunny-bostrom-fleming': ("Sunny Bostrom-Fleming", None, ALA),
    P + 'ca-ebmud-ward-3.ebmud-board-of-directors.donald-gray': ("Don Gray", "Retired Wastewater Manager", CCC),
}
SEATS = {P + 'ca-alameda-alameda.mayor': 1, P + 'ca-alameda-alameda.city-council': 2}
# EBMUD designations from the Contra Costa on-ballot list, filled only where the record has none.
EBMUD = {"Marguerite Young": "EBMUD Director Ward 3", "Gary Wolff": "Licensed Civil Engineer", "April Chan": "Director, East Bay Municipal Utility District, Ward 7",
         "Luis Reynoso": "University Business Professor", "Joseph Grcar": "Retired Laboratory Scientist"}

cr = open('data/2026-11-03/candidates.json').read(); CD = json.loads(cr)
kr = open('data/2026-11-03/contests.json').read(); KD = json.loads(kr)
log = []
for p in CD['candidates']:
    if p['id'] in NAMES:
        name, des, src = NAMES[p['id']]
        if p['name'] != name: log.append(f"{p['id']}: name {p['name']!r} -> {name!r}"); p['name'] = name
        if des and p.get('designation') != des: log.append(f"{p['id']}: designation {p.get('designation')!r} -> {des!r}"); p['designation'] = des
        if not any(s['url'] == src['url'] for s in p.get('sources', [])): p.setdefault('sources', []).append(src)
        p['gaps'] = [g for g in p.get('gaps', []) if not (g == 'Ballot designation' and p.get('designation'))]
    if p['contest'].startswith(P + 'ca-ebmud-ward-') and not p.get('designation') and p['name'] in EBMUD:
        p['designation'] = EBMUD[p['name']]; log.append(f"{p['id']}: designation set from the Contra Costa list")
        if not any(s['url'] == CCC['url'] for s in p.get('sources', [])): p.setdefault('sources', []).append(CCC)
        p['gaps'] = [g for g in p.get('gaps', []) if g != 'Ballot designation']
for c in KD['contests']:
    if c['id'] in SEATS and c.get('seats') != SEATS[c['id']]:
        log.append(f"{c['id']}: seats {c.get('seats')!r} -> {SEATS[c['id']]}"); c['seats'] = SEATS[c['id']]
        if not any(s['url'] == ALA['url'] for s in c.get('sources', [])): c.setdefault('sources', []).append(ALA)
ind = lambda raw: 1 if raw.startswith('{\n "') else 2
open('data/2026-11-03/candidates.json', 'w').write(json.dumps(CD, indent=ind(cr), ensure_ascii=False) + '\n')
open('data/2026-11-03/contests.json', 'w').write(json.dumps(KD, indent=ind(kr), ensure_ascii=False) + '\n')
open('audit/2026-10-24/name-corrections.log', 'w').write('\n'.join(log) + '\n')
print('\n'.join(log))
