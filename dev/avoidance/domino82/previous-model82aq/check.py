"""Read-only source/raw/history/geometry/result checker; no browser or media generation."""
from pathlib import Path
from fractions import Fraction as F
import json,gzip,hashlib,struct,sys
B=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest()
maps=[p for m in B.glob('domino-previous-model82aq-sourceprep*/pins.json')for p in json.loads(m.read_text())]
def pin(p):
 b=Path(p['path']).read_bytes()
 if len(b)==p['bytes']and sha(b)==p['sha256']:return False
 candidates=[x for x in maps if all(x[k]==p[k]for k in ['path','bytes','sha256'])];assert candidates,p['path'];b=Path(candidates[0]['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'];return True
def dec(x):
 if isinstance(x,dict):return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]if set(x)=={'$f64'}else{k:dec(v)for k,v in x.items()}
 if isinstance(x,list):return[dec(v)for v in x]
 return x
runs=[];data={}
for mode,i,complete in [('old','01',True),('new','01',False),('new','03',True),('old','04',True),('new','04',True),('new','05',True)]:
 d=B/('domino-previous-model-'+mode+'-actual82aq'+i);r=json.loads((d/'result.json').read_text());assert r['complete']==complete and r['postPinsUnchanged']and len(r['raw'])==2 and r['mediaOutputs']==r['publicChecks']==0
 historical=sum(pin(p)for p in r['pins']);raw={}
 for p in r['raw']:
  g=(d/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256']and len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw[p['file'][:-8]]=dec(json.loads(b))
 assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
 h=json.loads((B/(d.name+'-runtime')/'host.json').read_text());assert h['complete']==complete and h['probeExit']==(0 if complete else 1)and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==len(h['pages']['closed'])==3 and h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])
 for p in h['runtimeSources']:pin(p)
 x=raw['product-ui']
 if not complete:assert r['errors']and x['failure']['code']=='REUSE_MISSED';x=x['failure']['details']['partial']
 else:assert not r['errors']and x['cancelled']['clear']and x['cancelled']['state']['phase']=='cancelled'
 assert all(v['bitmapUnchanged']and v['code']for v in x['stale']);data[(mode,i)]=x
 runs.append({'mode':mode,'run':i,'complete':complete,'pins':len(r['pins']),'historicalPins':historical,'raw':2,'normalWindowsClosed':3,'cleanupComplete':True})
# Failed producer did not start Qt, no failed result is rewritten.
producer=json.loads((B/'domino-previous-model-producer82aq02.json').read_text());assert not producer['producerComplete']and not producer['qtStarted']
old=data['old','01']['cases'];new=data['new','03']['cases'];assert [x['label']for x in old]==[x['label']for x in new]==['initial','same-input-replan','circle-only']
for a,b in zip(old,new):
 for k in ['dy','modelHash','rowsHash','clockHash','frameHash','circle','coverage','proof']:assert a[k]==b[k],k
 assert a['coverage']=={'own':250,'supports':3064}and a['nativeSamples']==500 and a['shiftedSamples']==250
for b in new[1:]:assert b['nativeSamples']==b['shiftedSamples']==0 and b['stats']['nativeCompiles']==1
assert new[1]['stats']['sameReuse']==1 and new[2]['stats']['circleReuse']==1 and new[2]['stats']['recheckedOwn']==250 and new[2]['stats']['recheckedSupports']==3064
assert new[2]['dy']==new[0]['dy']and new[2]['rowsHash']==new[0]['rowsHash']
# Independent exact-rational circle/Y check of all unchanged support bounds.
reference=B/'domino-source-paint-actual82al02';ledger=json.loads((reference/'result.json').read_text());entry=next(p for p in ledger['raw']if p['file']=='product-ui.json.gz');g=(reference/entry['file']).read_bytes();b=gzip.decompress(g);assert sha(g)==entry['gzipSHA256']and sha(b)==entry['sha256'];m=dec(json.loads(b))['model'];circle=new[2]['circle'];cx,cy,r=map(F,[circle['cx'],circle['cy'],circle['r']+circle['margin']]);count=0;outsideX=0
for row in m['rows']:
 for support in row['supports']:
  q=support['bounds'];x0,x1,y0,y1=(F(q[k])for k in ['x0','x1','y0','y1']);assert 0<=y0<=y1<=270;x=max(x0,min(cx,x1));y=max(y0,min(cy,y1));assert(x-cx)**2+(y-cy)**2>r*r;count+=1;outsideX+=x0<0 or x1>480
assert count==3064 and outsideX==43
a=next(x for x in data['old','04']['cases']if x['label']=='circle-cold-fallback');cases=data['new','04']['cases'];b=next(x for x in cases if x['label']=='circle-cold-fallback')
for k in ['dy','modelHash','rowsHash','clockHash','frameHash','circle','coverage','proof']:assert a[k]==b[k],k
assert b['dy']!=new[0]['dy']and b['stats']['reuseRejected']==1 and b['stats']['recheckedSupports']==81 and b['stats']['recheckedOwn']==23
for x in cases:
 assert x['state']['ready']and x['nativeSamples']==500 and x['shiftedSamples']==250
assert data['new','04']['fontSelection']=='gothic_bold'
text=data['new','05'];changed=text['cases'][1];bad=text['cases'][2];assert text['actualText']=='風の先まで'and changed['nativeSamples']==552 and changed['shiftedSamples']==276 and changed['coverage']=={'own':276,'supports':4316}and changed['stats']['nativeCompiles']==2
assert text['requestedGlyphFont']=='gothic_bold'and bad['state']['phase']=='unsupported'and bad['error']=='DOMINO82AK_PARAMS'and bad['nativeSamples']==bad['shiftedSamples']==0
# Keep the original revision admission/live-job checks; no "ignore revision" path.
owner=(U/'owner82aq.js').read_text();original=(U.parent/'product-ui82ao/owner82ao.js').read_text()
for marker in ['const dynamicDependency=','function dependencyMatches(']:
 a=original.index(marker);z=original.index('\n',a);assert original[a:z]in owner
assert 'previous.shapeKey===shapeKey&&dependencyMatches(previous.dep)'in owner
assert "if(result.model){j.clock=old.clock;counters.circleReuse++;return result.model;}counters.reuseRejected++;attempt=null;result=null;next=null;old=null;}"in owner
assert "previous=null;dispose();"in owner and "candidate.width!==viewport.width||candidate.height!==viewport.height||candidate.scale!==viewport.scale)previous=null"in owner
font=(U/'font-wait-method.js').read_text();assert 'previous.revision===current.revision'in font and 'previous.faces.every((f,i)=>f===current.faces[i])'in font and 'if(!same){await ensureFonts()'in font
# Existing product work remains exactly preserved.
historicalProductPins=0
for p in json.loads((B/'domino-product-ui82ao-before-performance82ap/pins.json').read_text()):
 historicalProductPins+=pin(p);b=Path(p['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
for p in maps:
 b=Path(p['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
summary={'checked':True,'runs':runs,'warmComparison':[{'label':a['label'],'oldWallMs':a['wallMs'],'newWallMs':b['wallMs'],'oldMaxStepMs':a['state']['maxStepMs'],'newMaxStepMs':b['state']['maxStepMs'],'newNativeSamples':b['nativeSamples'],'newShiftedSamples':b['shiftedSamples']}for a,b in zip(old,new)],'newCircleCheckedOwn':250,'newCircleCheckedSupports':3064,'independentFractionCircleY':True,'nativeXOutsideRetained':43,'coldFallbackMatchesOld':True,'independentRevisionFontSettingViewportCold':True,'realTextColdAndGlyphFontUnsupported':True,'coldOutlier':{'wallMs':cases[0]['wallMs'],'maxStepMs':cases[0]['state']['maxStepMs'],'phaseProfile':cases[0]['state']['stepProfile']},'productBaselineHistoricalPins':historicalProductPins,'productUnchanged':historicalProductPins==0,'scope':'single observations at480 and cold240; cold17.84s/max1157ms unresolved; no product adoption'}
print(json.dumps(summary,indent=2,ensure_ascii=False))
