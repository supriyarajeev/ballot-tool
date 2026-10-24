"""Rewrite the local-contest sentence in each Bay Area county's coverage note from the merged data (Oct 24, 2026).
Counts are computed from contests.json; the source is each county file's first official source. Run after the merge."""
import json, re, glob
jr = open('data/jurisdictions.json').read(); JD = json.loads(jr)
J = {j['id']: j for j in JD['jurisdictions']}
C = json.load(open('data/2026-11-03/contests.json'))['contests']
SRC = {}
for f in glob.glob('audit/2026-10-24/local-contests/*.json'):
    R = json.load(open(f))
    for cty in R['county'].split('+'): SRC[cty] = R['officialSources'][0]['label'].split(',')[0]
SRC.update({'ca-alameda': 'Alameda County Registrar of Voters', 'ca-sf': 'San Francisco Department of Elections', 'ca-san-mateo': 'San Mateo County Elections Office',
            'ca-sonoma': 'Sonoma County Registrar of Voters', 'ca-contra-costa': 'Contra Costa County Elections', 'ca-marin': 'Marin County Elections',
            'ca-napa': 'Napa County Registrar of Voters', 'ca-santa-clara': 'Santa Clara County Registrar of Voters', 'ca-solano': 'Solano County Registrar of Voters'})

def county_of(j):
    while j and j['type'] != 'county': j = J.get(j.get('parent'))
    return j['id'] if j else None
def local(j): return j and j['type'] not in ('state', 'state-district', 'region')
for cty in ['ca-alameda', 'ca-contra-costa', 'ca-marin', 'ca-napa', 'ca-sf', 'ca-san-mateo', 'ca-santa-clara', 'ca-solano', 'ca-sonoma']:
    cs = [c for c in C if local(J.get(c['jurisdiction'])) and (county_of(J[c['jurisdiction']]) == cty or cty in (J[c['jurisdiction']].get('counties') or []))]
    nc = sum(len(c.get('candidates', [])) for c in cs); pend = sum(1 for c in cs if c.get('listStatus') == 'pending')
    nob = len(J[cty].get('notOnBallot', []))
    sent = (f"Local candidate contests: {len(cs)} contests with {nc} candidates, from the {SRC[cty]} official candidate list"
            + (" and, for contests added earlier, city clerk and district lists" if cty == 'ca-alameda' else "")
            + (f"; {pend} are not yet on a final official list" if pend else "")
            + (f". {nob} seats not on the ballot are listed separately" if nob else "")
            + ". The county lists were last read on October 24, 2026; contests have not been checked by a person against the sample ballot.")
    cov = J[cty].setdefault('coverage', {}); note = cov.get('note', '')
    note = re.sub(r'\s*Local (candidate )?contests (are not collected yet|are collected only for some cities and districts, from city clerk and district sources|come from the Department of Elections candidate page \(names only\))\.', '', note).strip()
    note = re.sub(r"\s*The county's own candidate contests \(city, school and other district races\) are not collected\. Two East Bay Municipal Utility District wards, recorded under Alameda County, cross into the county and are shown where they may apply\.", ' The two East Bay Municipal Utility District wards on the ballot are recorded under Alameda County and also apply here.', note)
    note = re.sub(r'\s*Local candidate contests: [^.]*(\.[^.]*listed separately)?\. (Contests were read|The county lists were last read)[^.]*\.', '', note).strip()
    cov['note'] = (note + ' ' + sent).strip()
    print(cty, '|', sent)
open('data/jurisdictions.json', 'w').write(json.dumps(JD, indent=1 if jr.startswith('{\n "') else 2, ensure_ascii=False) + '\n')
