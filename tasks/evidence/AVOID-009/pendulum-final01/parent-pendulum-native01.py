import json,pathlib,hashlib,math,collections
root=pathlib.Path('/tmp/avoid009-pendulum01');p=root/'pendulum-native01/run02/raw.json';x=json.loads(p.read_text());n=collections.Counter()
assert not x['failures'] and not x['errors'];assert not x['pending']['trajectory'];assert any(d['code']=='PENDULUM_SOURCE_PROOF_PENDING' for d in x['pending']['diagnostics'])
for off in x['off']:assert off['after']==off['before'];n['OFFpairs']+=1
for row in x['native']:
 for a,b in zip(row['after'],row['before']):
  assert a['hash']==b['hash'] and [c['item'] for c in a['calls']]==[c['item'] for c in b['calls']];assert a['frozen'] and a['ownershipRestored'];g=a['geometry'];n['nativePairs']+=1
  byid={q['index']:q for q in g['items']};assert list(byid)==list(range(g['k']));assert len({v['id'] for q in g['items'] for v in q['glyphs']})==sum(len(q['glyphs']) for q in g['items'])
  assert [q['index'] for q in g['items'] if q['visible']]==[c['source']['index'] for c in a['calls']]
  for c in a['calls']:
   q=byid[c['source']['index']];it=c['item'];assert q['glyphs']==c['source']['glyphs'];assert (q['text'],q['size'],q['mi'],q['bx'])==(it['text'],it['size'],it['mi'],it['x']);expected=q['by']+(g['size']*.06 if g['mode']=='chunks' else 0);assert expected==it['y'];assert abs(-q['th']*180/math.pi-it['rot'])<1e-12;n['catalogMatchedActualItems']+=1
  n['catalogItems']+=len(g['items']);n['catalogGlyphs']+=sum(len(q['glyphs']) for q in g['items'])
for row in x['transport']:
 for a in row['rows']:
  if a['kind']!='replay':continue
  b=next(z for z in row['rows'] if z['kind']=='native' and z['offset']==a['offset']);assert a['hash']==b['hash'] and a['geometry']==b['geometry'];assert a['ownershipRestored'] and a['program']['measurementSupported'];n['transportPairs']+=1
  for e in a['program']['events']:assert e['role']=='primary' and e['owner'].startswith('pendulum.');n['ownedEvents']+=1
baseline=json.loads((root/'parent-baseline5f6e771.json').read_text());unchanged=0
for f,h in baseline['srcSha256'].items():
 if f=='src/11p_layoutsD.js':continue
 assert hashlib.sha256((root/f).read_bytes()).hexdigest()==h;unchanged+=1
assert unchanged==93
report={'decision':'Native instrumentation/source-only gate accepted; no avoidance enabled or full support claim','counts':dict(n),'unchangedOtherJS':unchanged,'rawSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'imagesViewed':0,'publicChecks':0,'limitations':'Only bounded12cases; no geometry/body/support attachment/circle/performance/media certification. Stub remains disabled; no shared09a/transportchanges.'};pathlib.Path('/tmp/parent-pendulum-native01.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
