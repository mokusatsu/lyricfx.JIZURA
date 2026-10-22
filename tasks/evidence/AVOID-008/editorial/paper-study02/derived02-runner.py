"""Derive a source-corpus audit and finite-capacity table; never modifies raw results."""
import json,hashlib,datetime
from pathlib import Path
root=Path(__file__).resolve().parents[2]
d=root/'tasks/evidence/AVOID-008/editorial/paper-study02'
output=d/'derived.json'
assert not output.exists()
r=json.loads((d/'results.json').read_text());m=json.loads((root/'dev/avoidance/layouts-c-editorial-fonts/manifest.json').read_text());faces={f['id']:f for f in m['faces']};corpus=set()
for row in r['rows']:
 for e in row['sourceEvents']:
  if e['kind']=='item':
   item=e['args'][0];face=m['assignments'][item['font']];text=item['text'];role='main' if item.get('placementMain') else 'actual-metadata'
  elif e['kind']=='nativeText':
   text=e['args'][0];css=e['args'][3]['font'];face=next(f['id'] for f in m['faces'] if f['family'] in css);role='actual-fastRow'
  else: continue
  for ch in text:
   if not ch.isspace():corpus.add((role,face,ch))
fallback=[];uncovered=[]
for role,face,ch in sorted(corpus):
 if ord(ch) not in faces[face]['codepoints']:
  (fallback if ord(ch) in faces['symbols']['codepoints'] else uncovered).append({'role':role,'face':face,'char':ch})
# Study-only fallback is reported, never accepted as named-face proof.
# Axis-aligned page capacity is a necessary idealized container condition only.
def paper(w,h):
 W,H,cx,cy,rad=960,540,480,226.8,108
 choices=[]
 for x in [0,W-w]:
  for y in [0,H-h]:
   dx=max(x-cx,0,cx-(x+w));dy=max(y-cy,0,cy-(y+h));choices.append((dx*dx+dy*dy)**.5)
 return {'w':w,'h':h,'maxCornerSeparation':max(choices),'requiredRadius':rad,'necessaryIdealizedContainerPossible':max(choices)>=rad,'scope':'No camera, margin, shadow, stage motion or ink proof; failure applies only to this complete rectangular paper topology.'}
ph=540*.84;pw=ph*.72
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rawSHA256':hashlib.sha256((d/'results.json').read_bytes()).hexdigest(),'corpusObservations':len(corpus),'corpus':[dict(zip(['role','face','char'],v)) for v in sorted(corpus)],'symbolFallback':fallback,'uncovered':uncovered,'mainFaceScope':['serif-regular'],'loadedFaceScope':'Eight pinned faces available; this source extraction uses only the actual assigned faces in corpus. It is not a six/eight-main-face acceptance matrix.','idealizedPaperNecessary':[paper(2*pw,ph),paper(2*pw*.50,ph),paper(2*pw*.48,ph),paper(960*.9,540*.9),paper(960*.31,540*.9)],'capacityCounts':{},'unchangedSourceAfterStudy':{}}
for row in r['rows']:
 for p in row['proposals']:out['capacityCounts'][p['capacityStatus']]=out['capacityCounts'].get(p['capacityStatus'],0)+1
for p,h in r['pins'].items():
 actual=hashlib.sha256((root/p).read_bytes()).hexdigest();assert actual==h,p;out['unchangedSourceAfterStudy'][p]=actual
output.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:out[k] for k in ['corpusObservations','symbolFallback','uncovered','capacityCounts','idealizedPaperNecessary']},ensure_ascii=False))
