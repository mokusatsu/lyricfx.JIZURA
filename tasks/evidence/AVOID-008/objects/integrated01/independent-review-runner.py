from pathlib import Path
from fontTools.ttLib import TTFont
import hashlib,json,math
root=Path(__file__).resolve().parents[5];here=Path(__file__).resolve().parent
source=here/'matrix01.json';r=json.loads(source.read_text());fontdir=root/'dev/avoidance/layouts-c-objects-fonts-v2';m=json.loads((fontdir/'manifest.json').read_text());faces={};fontpins=[]
for f in m['faces']:
 p=fontdir/f['file'];actual=set(TTFont(p).getBestCmap());assert actual==set(f['codepoints']),f['id'];assert hashlib.sha256(p.read_bytes()).hexdigest()==f['sourceSHA256'];faces[f['id']]=actual;fontpins.append({'face':f['id'],'sha256':f['sourceSHA256'],'actualCmap':len(actual)})
def polygon_clear(poly,circle,margin):
 cx,cy,rad=circle['cx'],circle['cy'],circle['r']+margin;inside=False;dist=math.inf
 for i,a in enumerate(poly):
  b=poly[(i+1)%len(poly)];dx,dy=b[0]-a[0],b[1]-a[1];k=max(0,min(1,((cx-a[0])*dx+(cy-a[1])*dy)/(dx*dx+dy*dy)))if dx*dx+dy*dy else 0
  dist=min(dist,math.hypot(cx-a[0]-k*dx,cy-a[1]-k*dy))
  if (a[1]>cy)!=(b[1]>cy) and cx<(b[0]-a[0])*(cy-a[1])/(b[1]-a[1])+a[0]:inside=not inside
 return not inside and dist>=rad-1e-6
polygons=samples=glyphs=fallbacks=epochs=phase_observations=0;byLayout={}
for row in r['rows']:
 assert row['inputUnchanged']and not row['error']
 byLayout.setdefault(row['spec']['layout'],{}).setdefault(row['safety'],0);byLayout[row['spec']['layout']][row['safety']]+=1
 for c in row['corpus']:
  assert ord(c['char'])in faces[c['actualFace']],c
  glyphs+=1;fallbacks+=bool(c['fallback'])
 for o in row['observations']:
  assert o['phaseCorrect'];phase_observations+=1
 margin=max(2,.005*min(row['spec']['W'],row['spec']['H']))
 for s in row.get('segments')or[]:
  if s['status']!='safe-hold':continue
  for poly in s['envelopes']:
   moved=[[x+s['from'][0],y+s['from'][1]]for x,y in poly];assert polygon_clear(moved,s['circle'],margin);polygons+=1
  for o in row['observations']:
   if s['start']<=o['realTime']<s['end']:
    for poly in o['polygons']:assert polygon_clear(poly,s['circle'],margin);samples+=1
 if row['spec'].get('regions'):
  epochs+=1;assert len(row.get('segments')or[])==8
for x in r['budgetCases']:assert x['nativeCalls']==1 and x['trialCalls']==6 and x['budget']['cacheHits']==12 and x['budget']['reconstructed']==6 and x['budget']['rejected']==6
assert len(r['controls'])==50 and len(r['negatives'])==6 and not r['summary']['failures']
out={'runnerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'matrixSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'fontCmaps':fontpins,'actualAssignedGlyphs':glyphs,'explicitFallbackAssignments':fallbacks,'safeSegmentEnvelopePolygons':polygons,'safeSegmentStrictPolygonsIncludingPartialEpochTrajectories':samples,'localBodyPhaseObservations':phase_observations,'shiftedEightRadiusEpochCases':epochs,'byLayout':byLayout,'budgetCases':r['budgetCases'],'passed':True}
p=here/'independent-review01.json';assert not p.exists();p.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items()if k not in ['fontCmaps','budgetCases']}))
