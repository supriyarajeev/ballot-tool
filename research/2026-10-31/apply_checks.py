"""Adds browser match results to checks.json.
   python3 apply_checks.py <quotes-index.json> <web-checks.json>
quotes-index.json is the list of quotes the checker was given (index i = position). Only results with
result "match" become checks. Quotes listed in exclusions.json are never added, whatever the result."""
import json, sys, os
here = os.path.dirname(os.path.abspath(__file__))
allq = json.load(open(sys.argv[1]))
web = json.load(open(sys.argv[2]))
exc = json.load(open(os.path.join(here, 'exclusions.json')))['exclusions']
excl = {(e['candidate'], e['issue']) for e in exc if e.get('issue')} | {('*url*', e['url']) for e in exc if e.get('url')}
ck = json.load(open(os.path.join(here, 'checks.json')))
have = {(c['candidate'], c['issue'], c['quote']) for c in ck['checks']}
CODE = {1: 'exact text', 2: 'same words, differing only in quote marks or spacing', 3: 'same words in the PDF text, differing only in spacing from PDF extraction', 4: 'same words in the PDF text once the form\'s printed line numbers and line-end hyphen breaks are set aside'}
added = skipped = 0
for r in web['results']:
    q = allq[r['i']]
    if r.get('url') and r['url'] != q['sourceUrl']:
        raise SystemExit('index mismatch at %d' % r['i'])
    if r['result'] != 'match':
        continue
    if (q['candidate'], q['issue']) in excl or ('*url*', q['sourceUrl']) in excl:
        skipped += 1; continue
    k = (q['candidate'], q['issue'], q['quote'])
    if k in have: continue
    ck['checks'].append(dict(candidate=q['candidate'], issue=q['issue'], quote=q['quote'], sourceUrl=q['sourceUrl'], result='match',
        method='Source page reopened in a browser and the quote found on it (' + CODE[r['code']] + ')', date=r.get('date') or web.get('checkedOn', '2026-10-30')))
    have.add(k); added += 1
json.dump(ck, open(os.path.join(here, 'checks.json'), 'w'), indent=1, ensure_ascii=False)
print('added', added, 'excluded', skipped, 'total checks', len(ck['checks']))
