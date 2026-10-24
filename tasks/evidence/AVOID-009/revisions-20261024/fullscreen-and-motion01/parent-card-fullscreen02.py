from pathlib import Path
import json,gzip,math,hashlib
r=Path('/tmp/avoid009-card-fullscreen02');raw=r/'focused-raw02.json.gz';d=json.loads(gzip.decompress(raw.read_bytes()));assert not d['summary']['pageErrors'] and all(p['match'] for p in d['pinsAfter']);counts={'safeCases':0,'offImagePairs':0,'fieldRecords':0,'polygons':0,'vertices':0,'primaryPairs':0,'actualGlyphPairs':0,'negativeFullAAPairDiagnostics':0}
def distance(p,c):
 cross=[(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]) for a,b in zip(p,p[1:]+p[:1])]
 if all(v>=-1e-9 for v in cross) or all(v<=1e-9 for v in cross):return 0
 best=math.inf
 for a,b in zip(p,p[1:]+p[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];den=dx*dx+dy*dy;t=max(0,min(1,((c[0]-a[0])*dx+(c[1]-a[1])*dy)/den)) if den else 0;best=min(best,math.hypot(c[0]-a[0]-t*dx,c[1]-a[1]-t*dy))
 return best
for row,before in zip(d['rows'],d['offBefore']):
 assert row['nativeOff']==before['hashes'] and row['sourceUnchanged'] and row['cacheTrajectoryEqual'];counts['offImagePairs']+=len(before['hashes']);tr=row.get('trajectory')
 if not tr:assert any(v['safety']=='unsupported' for v in row['diagnostics']);continue
 if tr['safety']=='insufficient-space':assert not row['observations'] and all(e['code']=='FLIPCARDS_COMPOSITION_EXCLUDED' for e in row['failures']);continue
 assert tr['safety']=='certified-bounded-adapter' and not row['failures'];counts['safeCases']+=1;W,H=row['spec']['W'],row['spec']['H'];segs=tr['units'][0]['segments'];g=row['records'][0]['g'];assert row['cacheDecode']['trajectoryFresh'] and row['cacheDecode']['afterWarm']['hits']>row['cacheDecode']['beforeWarm']['hits']
 for seg in segs:
  assert seg['composition']==segs[0]['composition'] and seg['from']==seg['to']==[0,0];l=seg['fieldLedger'];assert len(l['cells'])==45;units={u['source']['index']:u['source'] for u in seg['unitProofs']};cells={c['id']:c for c in l['cells']}
  for p in l['primaryPairs']:
   a,b=cells[p['a']],cells[p['b']];assert a['y']==b['y'];dx=abs(a['x']-b['x']);core=lambda i:max(abs(v[0])*1.1 for poly in units[i]['fontOutlines'] for v in poly);fg=dx-core(a['assignedLyricIndex'])-core(b['assignedLyricIndex'])-20;pg=dx-g['k']*math.sqrt(1.01);assert abs(fg-p['fontGap'])<1e-10 and abs(pg-p['faceGap'])<1e-10 and fg>0 and pg>0;counts['primaryPairs']+=1
  counts['negativeFullAAPairDiagnostics']+=sum(p['gap']<=1e-7 for p in l['pairs'])
  for u in seg['unitProofs']:
   for poly in u['envelopes']:assert all(0<=x<=W and 0<=y<=H for x,y in poly) and distance(poly,(seg['circle']['cx'],seg['circle']['cy']))>=seg['circle']['r']+2.7-1e-7
 for rec in row['records']:
  counts['fieldRecords']+=1;g,n=rec['g'],rec['nativeG'];assert g['cardClocks']==n['cardClocks'] and (g['k'],g['cw'],g['chh'])==(n['k'],n['cw'],n['chh']);assert len(g['fieldDraws'])==len(set(g['fieldDraws']))==len(g['fieldCells'])==45
  cells=g['fieldCells'];sx=g['k']*1.16;sy=g['chh']+g['k']*.16;grid=g['fieldRecipe']['grid'];cols=sorted({c['column'] for c in cells});rows=sorted({c['row'] for c in cells});assert len(cols)*len(rows)==len(cells);assert cols==list(range(cols[0],cols[-1]+1)) and rows==list(range(rows[0],rows[-1]+1));assert min(c['x'] for c in cells)-g['cw']/2<=0 and max(c['x'] for c in cells)+g['cw']/2>=W;assert min(c['y'] for c in cells)-g['chh']/2<=0 and max(c['y'] for c in cells)+g['chh']/2>=H
  for c in cells:assert c['x']==grid['x']+c['column']*sx and c['y']==grid['y']+c['row']*sy
  items=[e for e in rec['events'] if e['kind']=='item' and e['role']=='primary'];paper=[i for i,e in enumerate(rec['events']) if e['kind']!='item'];first=next((i for i,e in enumerate(rec['events']) if e['kind']=='item' and e['role']=='primary'),None)
  if first is not None:assert not paper or max(paper)<first
  owners={e['owner'] for e in items}
  for a in owners:
   ca=[v[0] for e in items if e['owner']==a for p in e['inkPolygons'] for v in p]
   for b in owners-{a}:
    bb=[v[0] for e in items if e['owner']==b for p in e['polygons'] for v in p]
    assert min(bb)-max(ca)>-1e-7 or min(ca)-max(bb)>-1e-7;counts['actualGlyphPairs']+=1
 for o in row['observations']+row['cacheObservations']+sum([v['observations'] for v in row['records']],[]):
  seg=next(s for s in segs if s['start']<=o['realTime']<s['end']);assert o['stageContained'] and o['strictCircleClear'] and o['envelopeCovered']
  for p in o['polygons']:assert all(math.isfinite(x+y) and 0<=x<=W and 0<=y<=H for x,y in p) and distance(p,(seg['circle']['cx'],seg['circle']['cy']))>=seg['circle']['r']+2.7-1e-7;counts['polygons']+=1;counts['vertices']+=len(p)
result={'status':'PASS','rawSHA256':hashlib.sha256(raw.read_bytes()).hexdigest(),'counts':counts,'primaryGuard':'Unchanged full-AA stage/circle/attachment; AA halos may overlap, complete source cores protected from later glyph fullAA and all paper painted first','limits':'3 bounded safe fixtures, others typed insufficient/unsupported; no formal performance/human approval','parentImageViews':0,'publicResultChecks':0};Path('/tmp/parent-card-fullscreen02.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
