from pathlib import Path
from fontTools.ttLib import TTFont
import json,hashlib,math
R=Path('.');D=R/'tasks/evidence/AVOID-008/japanese0efd-main01';n=json.loads((D/'font01.json').read_text());o=json.loads(Path('tasks/evidence/AVOID-008/japanese/font-probe08.json').read_text());m=json.loads(Path('dev/avoidance/layouts-c-japanese-fonts/manifest.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest();faces={};pins=[]
for f in m['faces']:
 p=Path('dev/avoidance/layouts-c-japanese-fonts')/f['file'];cs=set(TTFont(p).getBestCmap());assert cs==set(f['codepoints']);assert sha(p.read_bytes())==f['sourceSHA256'];faces[f['id']]=cs;pins.append({'id':f['id'],'sha256':sha(p.read_bytes()),'actualCmapCount':len(cs)})
for c in n['coverage']:assert c['codepoint'] in faces[c['actualFace']]
assert n['coverage']==o['coverage'];counts={'safeCirclePolygons':0,'safeStagePolygons':0,'actualRasterSamples':0};rows=[]
def clear(poly,circle,margin):
 cx,cy=circle['cx'],circle['cy'];inside=False;dist=math.inf
 for i,a in enumerate(poly):
  b=poly[(i+1)%len(poly)];dx,dy=b[0]-a[0],b[1]-a[1];k=max(0,min(1,((cx-a[0])*dx+(cy-a[1])*dy)/(dx*dx+dy*dy))) if dx*dx+dy*dy else 0;dist=min(dist,math.hypot(cx-a[0]-k*dx,cy-a[1]-k*dy))
  if (a[1]>cy)!=(b[1]>cy) and cx<(b[0]-a[0])*(cy-a[1])/(b[1]-a[1])+a[0]:inside=not inside
 return not inside and dist+1e-6>=circle['r']+margin
for a,b in zip(o['rows'],n['rows']):
 equal={k:a.get(k)==b.get(k) for k in ['role','mainFace','spec','safety','sourceProof','segments','nativeGlyphs','nativeFieldWarnings','samples']};assert all(equal.values()),(a['role'],a['spec']['layout'],equal);rows.append({'role':b['role'],'layout':b['spec']['layout'],'safety':b['safety'],'fixed0efdProofGeometryRasterExact':True})
 for s in b.get('segments')or[]:
  if s['status']!='safe-hold':continue
  dx,dy=s['from'];W,H=b['spec']['W'],b['spec']['H'];margin=max(2,.005*min(W,H))
  for p in s['envelopes']:
   moved=[[x+dx,y+dy]for x,y in p];assert clear(moved,s['circle'],margin);counts['safeCirclePolygons']+=1
  for p in s['stageEnvelopes']:
   assert all(-1e-6<=x+dx<=W+1e-6 and -1e-6<=y+dy<=H+1e-6 for x,y in p);counts['safeStagePolygons']+=1
 counts['actualRasterSamples']+=len(b['samples'])
r={'scope':'Actual8font bytes/cmaps and66font-source proof/segment/raster exact fixed0efd; independent ray-crossing/point-edge circle and full-stage envelope checks only certified segments. Fonts remain explicit transport substitutes.','sourceJSONSHA256':sha((D/'font01.json').read_bytes()),'fontPins':pins,'coverageEntries':len(n['coverage']),'uniqueGlyphs':len({c['codepoint'] for c in n['coverage']}),'rows':rows,**counts,'passed':True};(D/'font-independent01.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({k:v for k,v in r.items() if k not in ['fontPins','rows']}))
