from pathlib import Path
import json,collections,hashlib,sys
out=Path(__file__).parent
raw=Path('/tmp/avoid006-ca1f21-profile-raw')

def analyze(path):
 d=json.loads(path.read_text());nodes={n['id']:n for n in d['nodes']};parents={c:n['id'] for n in d['nodes'] for c in n.get('children',[])};own=collections.Counter();inc=collections.Counter();total=sum(d['timeDeltas'])
 def key(n):
  f=n['callFrame'];return (f['functionName'] or '<anonymous>',f.get('lineNumber',-1)+1,f.get('url',''))
 for node,t in zip(d['samples'],d['timeDeltas']):
  own[key(nodes[node])]+=t;seen=set()
  while node in nodes:
   k=key(nodes[node])
   if k not in seen:inc[k]+=t;seen.add(k)
   node=parents.get(node)
 def rows(c):return [{'function':k[0],'line':k[1],'url':k[2],'ms':v/1000,'percent':v/total*100} for k,v in c.most_common()]
 names=['decodeProof','cachedProof','keepProof','encodeProof','unpackPolygons','packPolygons','immutable','(garbage collector)','solveBasicRaw','A.record','cameraEnvelope','push','hull','A.convexHull','nativeEnvelopes','A.itemGeometry','A.renderLayoutsA','A.replay']
 return {'file':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sampledMs':total/1000,'sampleCount':len(d['samples']),'topSelf':rows(own)[:45],'topInclusive':rows(inc)[:45],'focused':{name:{'selfMs':sum(v for k,v in own.items() if k[0]==name)/1000,'inclusiveMs':sum(v for k,v in inc.items() if k[0]==name)/1000,'inclusivePercent':sum(v for k,v in inc.items() if k[0]==name)/total*100} for name in names},'note':'Inclusive percentages overlap and must not be added. CPU sampling and counters are diagnostic, not formal acceptance.'}

def allocation(path):
 d=json.loads(path.read_text());nodes={};parents={}
 def visit(n,parent=None):
  nodes[n['id']]=n
  if parent is not None:parents[n['id']]=parent
  for child in n.get('children',[]):visit(child,n['id'])
 visit(d['head']);own=collections.Counter();inc=collections.Counter();total=sum(n.get('selfSize',0) for n in nodes.values())
 def key(n):
  f=n['callFrame'];return (f['functionName'] or '<anonymous>',f.get('lineNumber',-1)+1,f.get('url',''))
 for node,info in nodes.items():
  value=info.get('selfSize',0);own[key(info)]+=value;seen=set()
  while node in nodes:
   k=key(nodes[node])
   if k not in seen:inc[k]+=value;seen.add(k)
   node=parents.get(node)
 def rows(c):return [{'function':k[0],'line':k[1],'url':k[2],'estimatedBytes':v,'percent':v/total*100 if total else 0} for k,v in c.most_common()]
 names=['decodeProof','cachedProof','keepProof','encodeProof','unpackPolygons','packPolygons','immutable','solveBasicRaw','A.record','cameraEnvelope','push','hull','A.convexHull','nativeEnvelopes','A.itemGeometry','A.renderLayoutsA','A.replay']
 return {'file':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'estimatedAllocatedBytes':total,'allocationSampleCount':len(d.get('samples',[])),'topSelf':rows(own)[:45],'topInclusive':rows(inc)[:45],'focused':{name:{'selfBytes':sum(v for k,v in own.items() if k[0]==name),'inclusiveBytes':sum(v for k,v in inc.items() if k[0]==name),'inclusivePercent':sum(v for k,v in inc.items() if k[0]==name)/total*100 if total else 0} for name in names},'note':'32KiB allocation samples include collected objects. Estimated total allocations, not live heap or cache accounting. Inclusive attribution overlaps.'}

if len(sys.argv)>1:
 paths=[Path(s) for s in sys.argv[1:]];dest=out/'prior-profile-analysis.json'
else:
 paths=list(out.glob('*.cpuprofile'))+list(raw.glob('*.cpuprofile'));dest=out/'current-profile-analysis.json'
result={'diagnosticOnly':True,'profiles':[analyze(p) for p in paths],'runtimeByLayout':{},'decodeCounters':{},'allocations':[]}
if len(sys.argv)==1:result['allocations']=[allocation(p) for p in list(out.glob('*.heapprofile'))+list(raw.glob('*.heapprofile'))]
for mode in ['planning','runtime']:
 p=out/(mode+'-report.json')
 if not p.exists():continue
 d=json.loads(p.read_text());result['decodeCounters'][mode]={s:x.get('proofDecodeCounters') for s,x in d['sides'].items()}
 if mode=='runtime':
  for side,data in d['sides'].items():
   for r in data['results']:
    groups=collections.defaultdict(list)
    for row,total in zip(r['runtimeProfile'],r['renderSamples']):groups[row['layout']].append((row,total))
    result['runtimeByLayout'][side]={name:{'frames':len(rows),'totalMeanMs':sum(x[1] for x in rows)/len(rows),'totalMaxMs':max(x[1] for x in rows),'nestedTimerMeanMs':{key:sum(x[0].get(key,0) for x in rows)/len(rows) for key in ['record','replay','clear','renderLayoutsA']}} for name,rows in groups.items()}
dest.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'path':str(dest),'profiles':len(paths)}))
