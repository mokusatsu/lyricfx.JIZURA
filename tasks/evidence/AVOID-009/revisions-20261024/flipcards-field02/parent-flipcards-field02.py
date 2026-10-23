import gzip,json,math,hashlib
from pathlib import Path
r=Path('/tmp/avoid009-flipcards-revision02');raw=r/'focused-raw02.json.gz';d=json.loads(gzip.decompress(raw.read_bytes()))
counts=dict(safeCases=0,offHashes=0,polygons=0,vertices=0,continuousUnitEnvelopes=0,pairs=0,fieldRecords=0)
def distance(p,c):
 x,y=c;cross=[];best=math.inf
 for a,b in zip(p,p[1:]+p[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];cross.append(dx*(y-a[1])-dy*(x-a[0]));q=dx*dx+dy*dy;t=max(0,min(1,((x-a[0])*dx+(y-a[1])*dy)/q)) if q else 0
  best=min(best,math.hypot(x-a[0]-t*dx,y-a[1]-t*dy))
 return 0 if all(v>=-1e-9 for v in cross) or all(v<=1e-9 for v in cross) else best
for row,before in zip(d['rows'],d['offBefore']):
 assert row['nativeOff']==before['hashes'];counts['offHashes']+=len(before['hashes']);assert row['sourceUnchanged'] and row['cacheTrajectoryEqual']
 tr=row.get('trajectory');W,H=row['spec']['W'],row['spec']['H'];margin=max(2,.005*min(W,H))
 if not tr:
  assert any(v['safety']=='unsupported' for v in row['diagnostics']);continue
 if tr['safety']=='insufficient-space':
  assert len(row['failures'])==11 and not row['observations'];assert all(v['code']=='FLIPCARDS_COMPOSITION_EXCLUDED' for v in row['failures']);continue
 assert tr['safety']=='certified-bounded-adapter' and not row['failures'];counts['safeCases']+=1
 segs=tr['units'][0]['segments'];comp=segs[0]['composition']
 for s in segs:
  assert s['composition']==comp and s['from']==s['to']==[0,0]
  circle=s['circle'];c=(circle['cx'],circle['cy'])
  for unit in s['unitProofs']:
   for p in unit['envelopes']:
    assert all(0<=x<=W and 0<=y<=H for x,y in p);assert distance(p,c)>circle['r']+margin-1e-7;counts['continuousUnitEnvelopes']+=1
  ledger=s['fieldLedger'];support={v['cellId']:v['bounds'] for v in ledger['supports']}
  for pair in ledger['pairs']:
   a,b=support[pair['a']],support[pair['b']];gap=max(b[0]-a[2],a[0]-b[2],b[1]-a[3],a[1]-b[3]);assert gap==pair['gap'] and gap>0;counts['pairs']+=1
 for rec in row['records']:
  assert not rec['error'] and rec['measurementSupported'];g,ng=rec['g'],rec['nativeG'];counts['fieldRecords']+=1
  assert g['cardClocks']==ng['cardClocks'];assert g['k']==ng['k'] and g['cw']==ng['cw'] and g['chh']==ng['chh'];assert len(set(g['fieldDraws']))==len(g['fieldDraws'])==len(g['fieldCells'])
  native={(v['r'],v['j']):v for v in ng['cards']};nr=max(v['r'] for v in ng['cards'])+1;per=max(v['cnt'] for v in ng['cards']);sx=g['k']*(1+.16);sy=g['chh']+g['k']*.16
  for cell in g['fieldCells']:
   if cell['origin']=='native-middle':assert (cell['x'],cell['y'])==(native[cell['row'],cell['column']]['x'],native[cell['row'],cell['column']]['y'])
   elif cell['origin']=='native-table':assert (cell['x'],cell['y'])==(W/2+(cell['column']-(per-1)/2)*sx,H/2+(cell['row']-(nr-1)/2)*sy)
   if cell['contentKind']=='literal-blank-back':assert not any(e['kind']=='item' and e['owner']=='flipCards.blank.'+str(cell['row'])+'.'+str(cell['column']) for e in rec['events'])
 for obs in row['observations']+row['cacheObservations']+sum([v['observations'] for v in row['records']],[]):
  assert obs['offset']==[0,0] and obs['envelopeCovered'] and obs['stageContained'] and obs['strictCircleClear'];s=next(s for s in segs if s['start']<=obs['realTime']<s['end']);circle=s['circle']
  for p in obs['polygons']:
   assert all(math.isfinite(x) and math.isfinite(y) and -1e-7<=x<=W+1e-7 and -1e-7<=y<=H+1e-7 for x,y in p)
   assert distance(p,(circle['cx'],circle['cy']))>=circle['r']+margin-1e-7;counts['polygons']+=1;counts['vertices']+=len(p)
assert not d['summary']['pageErrors']
result={'status':'PASS','rawSha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'counts':counts,'limitations':['3 bounded safe cases; table-false/portrait/explicit1/large circle insufficient','Native pixels compared at48 sample times, not full animation','No formal performance qualification','No parent image viewing or public result checks']}
Path('/tmp/parent-flipcards-field02.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
