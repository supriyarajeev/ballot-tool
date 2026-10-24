"""Merge the nine-county local contest research (Oct 24, 2026) into the guide's data.
Inputs: audit/2026-10-24/local-contests/<county>.json, one per county, each read from the county registrar's official
lists (see officialSources and unavailable in each file for how it was read). Run from the repo root: python3 audit/2026-10-24/apply_local_contests.py
Rules:
- An existing jurisdiction id is reused; otherwise a new jurisdiction record is created with the official source.
- A contest already in contests.json (same jurisdiction, office and district) is skipped.
- The same contest reported by two counties (cross-county districts) is added once and the jurisdiction lists both.
  Two records are the same contest when the jurisdiction name, office and district match, or when the candidate
  surnames match exactly (two or more candidates) or the full name matches (one candidate). This also catches a
  contest already in contests.json under another id (for example EBMUD wards).
- A district whose home county is outside the nine Bay Area counties is filed under the Bay Area county that lists
  it, with both counties recorded.
- Names, designations and seat counts are copied as researched; nothing is inferred.
- Contest listStatus is "confirmed" when the official on-ballot list shows it, "pending" otherwise.
- Contests not on the ballot (appointed in lieu of election) are stored on the county record, not as contests."""
import json, re, glob, collections

TODAY = '2026-10-24'
def slug(s): return re.sub(r'[^a-z0-9]+', '-', (s or '').lower().replace('.', '').replace("'", '')).strip('-')
def load(p):
    raw = open(p).read(); return raw, json.loads(raw)
def save(p, raw, obj):
    ind = 1 if raw.startswith('{\n "') else 2
    open(p, 'w').write(json.dumps(obj, indent=ind, ensure_ascii=False) + ('\n' if raw.endswith('\n') else ''))

jr, JD = load('data/jurisdictions.json'); cr, CD = load('data/2026-11-03/contests.json'); pr, PD = load('data/2026-11-03/candidates.json')
J = {j['id']: j for j in JD['jurisdictions']}; pre_ids = set(J)
existing = {(c['jurisdiction'], slug(c['office']), slug(c.get('district') or '')) for c in CD['contests']}
cids = {c['id'] for c in CD['contests']}; pids = {p['id'] for p in PD['candidates']}
TYPES = {"county", "city", "supervisor-district", "school-district", "community-college-district", "special-district", "council-district"}
report = collections.OrderedDict(); seen = {}
import unicodedata
def nm(n): return re.sub(r'[^a-z ]', '', unicodedata.normalize('NFD', n.lower()).encode('ascii', 'ignore').decode()).split()
def ckey(names):
    if not names: return None
    if len(names) == 1: return ('one', ' '.join(nm(names[0])))
    return ('many', frozenset(nm(x)[-1] for x in names if nm(x)))
def clean_office(office, jname, district):
    # Shorten office titles to the office alone; the jurisdiction and district are shown beside them.
    o = re.sub(r'^For ', '', office.strip()); d = district
    for nm_ in sorted({jname, re.sub(r'^(City|Town) of ', '', jname)}, key=len, reverse=True):
        if nm_ and len(nm_) > 3: o = re.sub(r',?\s*' + re.escape(nm_) + r'\b', '', o, flags=re.I)
    o = re.sub(r',\s*(City|Town) of [A-Z][\w .-]+$', '', o)
    term = re.search(r'(Short|Full) Term', o)
    o = re.sub(r',?\s*\(?(Short|Full) Term\)?', '', o)
    m = re.search(r',?\s*\b(Trustee Area|Area|Ward|District|Division)\s*#?\s*([0-9]+|[A-Z])$', o) or re.search(r'\s*#(\d+)', o)
    if m:
        if not d: d = (m.group(1) + ' ' + m.group(2)) if m.lastindex == 2 else ('District ' + m.group(1))
        o = (o[:m.start()] + o[m.end():]).strip()
    o = o.strip(' ,-')
    o = {'Members Of City Council': 'City Council Member', 'Member Of City Council': 'City Council Member', 'Member, City Council': 'City Council Member',
         'Councilmember': 'City Council Member', 'City Council': 'City Council Member', 'Member, Town Council': 'Town Council Member',
         'Member of Town Council': 'Town Council Member', 'Governing Board Members': 'Governing Board Member', 'Member, Governing Board': 'Governing Board Member',
         'Member, Board of Directors': 'Director', 'Directors': 'Director', 'Director - Short Term': 'Director', 'Elected City Clerk': 'City Clerk',
         'Member, Board of Supervisors': 'Supervisor', 'County Supervisor': 'Supervisor', 'Member, County Board of Education': 'County Board of Education Member',
         'Member,': 'County Board of Education Member', 'Board of Education Member': 'Board of Education Member'}.get(o, o) or office
    o = re.sub(r',\s*(City|Town) of$', '', o)
    if re.match(r'^(Members? Of City Council|Member, City Council)', o, re.I): o = 'City Council Member'
    elif re.search(r'\bTrustee$', o): o = 'Trustee'
    elif re.search(r'\bDirectors?\b|Recreation & Park$', o) and not o.startswith('Director ('): o = 'Director'
    if term and d and term.group(0) not in d: d = f"{d} ({term.group(0)})"
    elif term and not d: o = f"{o} ({term.group(0)})"
    if 'Short Term' in office and 'Short' not in (o + (d or '')): o += ' (Short Term)'
    return o, d
BAY = {'ca-alameda', 'ca-contra-costa', 'ca-marin', 'ca-napa', 'ca-sf', 'ca-san-mateo', 'ca-santa-clara', 'ca-solano', 'ca-sonoma'}
pnames = {p['id']: p['name'] for p in PD['candidates']}
byc = {}
for c in CD['contests']:
    k = ckey([pnames[x] for x in c.get('candidates', []) if x in pnames])
    if k: byc[k] = c['jurisdiction']
def add_county(jid, cty):
    j = J[jid]
    base = j.get('counties') or [j['parent'] if j.get('parent') in BAY else None]
    j['counties'] = sorted({x for x in base + [cty] if x})
added_c = added_p = 0

for path in sorted(glob.glob('audit/2026-10-24/local-contests/*.json')):
    R = json.load(open(path))
    counties = [x for x in re.split(r'\+', R['county'])]
    for cty in counties: report.setdefault(cty, {'sources': R.get('officialSources', []), 'checked': R.get('jurisdictionsChecked', []), 'added': 0, 'cands': 0, 'skippedExisting': 0, 'duplicates': 0, 'pending': 0, 'notOnBallot': R.get('notOnBallot', []) if cty == counties[0] else [], 'unavailable': R.get('unavailable', [])})
    for c in R['contests']:
        j = dict(c['jurisdiction']); jid = j.get('id'); typ = j.get('type'); parent = j.get('parent')
        home = parent if parent in J and J[parent]['type'] == 'county' else (J[parent]['parent'] if parent in J else counties[0])
        if typ == 'county' and jid != home:
            typ = 'school-district' if re.search(r'education|school', j.get('name', ''), re.I) else 'county'
            if typ == 'county': jid = home
        if typ == 'trustee-area': typ = 'school-district'
        if parent and parent not in BAY and parent in J and J[parent]['type'] == 'county':
            j['counties'] = sorted({parent, counties[0]}); parent = counties[0]
        if typ not in TYPES: raise SystemExit(f'unknown type {typ} in {path}')
        if jid not in J:
            if parent not in J: raise SystemExit(f'parent {parent} missing for {jid} in {path}')
            J[jid] = {"id": jid, "name": j['name'], "type": typ, "parent": parent, **({"counties": j['counties']} if j.get('counties') else {}), "areas": [a for a in (j.get('areas') or []) if a in J],
                      "sources": [{"label": c['source']['label'], "url": c['source']['url'], "type": "Official"}],
                      "note": "Added Oct 24, 2026 from the county registrar's official candidate list. Boundaries not recorded."}
            hc = parent if J[parent]['type'] == 'county' else J[parent].get('parent')
            if hc in BAY and hc != counties[0] and 'counties' not in J[jid]: J[jid]['counties'] = sorted({hc, counties[0]})
            JD['jurisdictions'].append(J[jid])
        c = dict(c); c['office'], c['district'] = clean_office(c['office'], J[jid]['name'] if jid in J else j.get('name', ''), c.get('district'))
        key = (jid, slug(c['office']), slug(c.get('district') or ''))
        if key in existing: report[counties[0]]['skippedExisting'] += 1; continue
        ck = ckey([p['name'] for p in c['candidates']])
        if ck in byc:
            report[counties[0]]['duplicates'] += 1
            report[counties[0]].setdefault('sameAs', []).append(f"{j.get('name')} {c['office']} {c.get('district') or ''}".strip() + ' = ' + byc[ck])
            if byc[ck] in J: add_county(byc[ck], counties[0])
            continue
        dkey = (slug(J[jid]['name']), key[1], key[2])
        if dkey in seen:
            report[counties[0]]['duplicates'] += 1
            add_county(seen[dkey], counties[0])
            continue
        seen[dkey] = jid; existing.add(key)
        cid = f"2026-11-03.{jid}.{slug(c['office'] + (' ' + c['district'] if c.get('district') else ''))}"
        n = 2
        while cid in cids: cid = re.sub(r'(-\d+)?$', f'-{n}', cid, count=1); n += 1
        cids.add(cid)
        status = 'pending' if c.get('status') != 'confirmed' else 'confirmed'
        note = ("Candidates and ballot designations as printed on the county's official list named in the sources"
                + ("" if c.get('status') == 'confirmed' else " or, where noted, a secondary source") + ". Not yet checked by a person against the official sample ballot."
                + (" " + c['note'] if c.get('note') else ""))
        src = [{"label": c['source']['label'], "url": c['source']['url'], "type": "Official"}]
        ids = []
        for p in c['candidates']:
            pid = cid + '.' + slug(p['name']); m = 2
            while pid in pids: pid = cid + '.' + slug(p['name']) + f'-{m}'; m += 1
            pids.add(pid); ids.append(pid)
            st = p.get('statementUrl') if (p.get('statementUrl') or '').startswith('https://') else None
            PD['candidates'].append({"id": pid, "name": p['name'], "contest": cid, "party": None, "designation": p.get('designation'),
                "statementUrl": st, "statementNote": None if st else "No official candidate statement link was found. The county voter information guide may include one.",
                "financeUrl": None, "qualifications": None, "positions": None, "publicRecord": None, "status": "needs-review", "lastVerified": TODAY,
                "sources": src, "notes": note,
                "gaps": [g for g in ["Ballot designation" if not p.get('designation') else None, None if st else "Candidate statement", "Qualifications, stated positions and public record not yet collected"] if g],
                "incumbent": p.get('incumbent') is True})
            added_p += 1; report[counties[0]]['cands'] += 1
        rec = {"id": cid, "election": "2026-11-03", "jurisdiction": jid, "office": c['office'], "district": c.get('district'), "seats": c.get('seats') if isinstance(c.get('seats'), int) and c['seats'] >= 1 else None,
               "candidates": ids, "status": "needs-review", "lastVerified": TODAY, "listStatus": status, "sources": src, "notes": note}
        if not ids: rec["noQualifiedCandidates"] = True
        if ck: byc[ck] = jid
        CD['contests'].append(rec); added_c += 1; report[counties[0]]['added'] += 1
        if status == 'pending': report[counties[0]]['pending'] += 1

# Drop jurisdictions created here whose only contest turned out to be a duplicate.
created = {j['id'] for j in JD['jurisdictions']} - pre_ids
used = {c['jurisdiction'] for c in CD['contests']} | {j.get('parent') for j in JD['jurisdictions']}
JD['jurisdictions'] = [j for j in JD['jurisdictions'] if j['id'] not in created or j['id'] in used]

# County records: inventory and the contests that are not on the ballot.
for cty, r in report.items():
    if cty not in J: continue
    inv = J[cty].setdefault('inventory', {})
    inv['contests'] = 'collected'; inv['candidates'] = 'collected'; inv['lastChecked'] = TODAY
    if r['notOnBallot']:
        J[cty]['notOnBallot'] = [{"jurisdiction": x.get('jurisdiction'), "office": x.get('office'), "reason": x.get('reason'), "source": x.get('source')} for x in r['notOnBallot']]

save('data/jurisdictions.json', jr, JD); save('data/2026-11-03/contests.json', cr, CD); save('data/2026-11-03/candidates.json', pr, PD)
json.dump(report, open('audit/2026-10-24/local-contests-merge-report.json', 'w'), indent=1, ensure_ascii=False)
print('contests added', added_c, 'candidates added', added_p)
for k, v in report.items(): print(k, {x: v[x] for x in ('added', 'cands', 'skippedExisting', 'duplicates', 'pending')}, 'notOnBallot', len(v['notOnBallot']))
