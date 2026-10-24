"""Independent parent raw-byte/transport review. No browser, imagery or app edits."""
from pathlib import Path
import hashlib,json,gzip,collections,math,os
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/bulbs51.raw01');E=R/'tasks/evidence/AVOID-009/bulbs-transport51';m=json.loads((B/'manifest.json').read_bytes());stats=collections.Counter();sha=lambda b:hashlib.sha256(b).hexdigest();seen=set();plans={};all_functions=set();all_records=[];names=[]
assert m['complete'] and not m['errors'] and not m['partialRecords'] and m['inFlight'] is None and m['postPins']['unchanged'];assert m['completed']==m['expected']=={'fixtures':15,'tuplePairs':450,'wholePairs':90,'controlPairs':15};assert not m['placementAdapterAdded'] and not m['safetyCertificate']
def read(row,folder=B):
 chunks=[]
 for i,p in enumerate(row['parts']):
  name=p['path'];assert '/' not in name and '..' not in name;f=folder/name;z=f.read_bytes();b=gzip.decompress(z);assert len(z)==p['bytes'] and sha(z)==p['sha256'] and len(b)==p['JSONBytes']<=1048576 and sha(b)==p['JSONSHA256'];chunks.append(b);names.append(str(f.relative_to(B)));stats['rawFragments']+=1
 b=b''.join(chunks);assert len(b)==row['JSONBytes'] and sha(b)==row['JSONSHA256'] and row['complete'];assert row['budgetSplit']==(len(b)>8388608);stats['exactJSONBytes']+=len(b);stats['splitOver8MiBRecords']+=row['budgetSplit'];return json.loads(b)
s=m['storageSelfcheck'];assert s['JSONFragmentReassemblyExact'] and s['unicodeBoundaryAndOver8MiBBudgetSplit'] and not s['applicationExecuted'];small=read(s['small'],B/'storage51');large=read(s['large'],B/'storage51');assert small=={'unicode':'風😀x','values':[0,0,None,None,None,True,False,''],'nested':[{'x':1,'y':[2,3]}]};assert len(large['samples'])==2300 and all(p=={'i':i,'text':'風😀x'*512} for i,p in enumerate(large['samples']));assert s['large']['budgetSplit'];del large

def paint(p):
 st=p['state'];keep=['alpha','blend','filter','shadowColor','shadowBlur','shadowOffsetX','shadowOffsetY'];keep+=['strokeStyle','lineWidth','lineCap','lineJoin','miterLimit','dash','dashOffset'] if p['kind'].startswith('stroke') else ['fillStyle'];keep+=['font','textAlign','textBaseline','direction'] if p['kind'].endswith('Text') else []
 return {**{k:p[k] for k in ['kind','args','matrix','path','metrics']},'state':{k:st[k] for k in keep}}
def calls(a):return [{k:v for k,v in p.items() if k!='owner'} for p in a]
def near(a,b):assert math.isfinite(a) and math.isfinite(b) and abs(a-b)<=1e-10*max(1,abs(a),abs(b)),(a,b)
def catalog(c):
 assert c['complete'] and c['bounded'] and c['status']=='complete' and c['role']=='primary' and c['independentDecorOwners']==[];assert all(p['role']=='primary' and p['owner'].startswith('bulbs.sign.') for p in c['sourceCalls']);assert [p['ordinal'] for p in c['sourceCalls']]==list(range(len(c['sourceCalls'])));assert [p['owner'] for p in c['sourceCalls']]==c['primaryOwners'];stats['catalogs']+=1
 for ring in c['rings']:
  pts=ring['insetPoints'];lens=[math.hypot(pts[(i+1)%len(pts)][0]-p[0],pts[(i+1)%len(pts)][1]-p[1]) for i,p in enumerate(pts)];L=sum(lens);n=max(4,min(140,math.floor(L/(c['r']*3.3)+.5)));assert ring['N']==n==len(ring['points'])==len(ring['lights']);si=0;acc=0
  for i,p in enumerate(ring['points']):
   d=i*(L/n)
   while si<len(lens)-1 and acc+lens[si]<d:acc+=lens[si];si+=1
   a,b=pts[si],pts[(si+1)%len(pts)];q=(d-acc)/lens[si] if lens[si]>0 else 0;near(p[0],a[0]+(b[0]-a[0])*q);near(p[1],a[1]+(b[1]-a[1])*q);stats['independentResamplePoints']+=1

def walk(v):
 if isinstance(v,dict):
  if 'nativeFunctionSource' in v:assert v['serialization']=='live stock closure source only; not executable serialized program';all_functions.add(v['nativeFunctionSource'])
  for x in v.values():walk(x)
 elif isinstance(v,list):
  for x in v:walk(x)
for row in m['records']:
 assert row['id'] not in seen;seen.add(row['id']);v=read(row);walk(v)
 if row['id'].endswith('.init'):
  a,b=v['pair'];assert a['sourcePlan']==b['sourcePlan'];plans[v['spec']['id']]=a['sourcePlan'];assert a['candidate'] is False and b['candidate'] is True;stats['fixtures']+=1;continue
 if '.tuple' in row['id']:
  assert not v['status'].get('failed');a,b=[p['value'] for p in v['pair']];assert a['sourceUnchanged'] and b['sourceUnchanged'];assert a['transport'] is None;t=b['transport'];assert t and t['error'] is None and t['destinationUnpainted'] and t['rootUnchanged'];q=t['program'];assert q['measurementSupported'] and not q['diagnostics'];assert t['sameTurn']['recordToBothReplaysWithoutAwait'] and t['sameTurn']['helperKnownAfter'] and t['sameTurn']['fontRevisionUnchanged'] and t['sameTurn']['fontTableUnchanged']
  for k in ['native','directMoved']:
   x,y=a[k],b[k]
   for field in ['root','bb','pixelSHA256']:assert x[field]==y[field],(row['id'],k,field)
   assert [paint(p) for p in x['paint']]==[paint(p) for p in y['paint']];assert calls(x['sourceCalls'])==calls(y['sourceCalls']);stats['nativeIndependentPairs']+=1
  assert t['zeroSHA256']==a['native']['pixelSHA256'] and t['movedSHA256']==a['directMoved']['pixelSHA256'];assert [paint(p) for p in t['zeroPaint']]==[paint(p) for p in a['native']['paint']];assert [paint(p) for p in t['movedPaint']]==[paint(p) for p in a['directMoved']['paint']]
  plan=plans[v['spec']];cut={**plan['cuts'][0],**v['tuple'].get('cut',{})};expected=dict(cut.get('effectFx') or plan['fx']);scale=cut['motionScale'];baseMotion=expected['motion']
  if scale<1:expected['motion']=baseMotion*scale
  assert a['native']['effectiveFX']==b['native']['effectiveFX']==t['effectiveFX']==expected;binding=a['native']['sourceFXBinding'];assert binding['hasCutOverride']==(cut.get('effectFx') is not None);assert binding['motionScale']==scale and binding['inputIsPlanFX']==(cut.get('effectFx') is None and scale>=1) and binding['inputIsCutOverride']==(cut.get('effectFx') is not None and scale>=1)
  witness=q['nativeBulbsTransport51'];assert witness['effectiveFXIdentityPreserved'] and witness['inputEffectiveFX']==witness['recordedEffectiveFX']==expected and witness['actualRoot']==b['native']['root'] and not witness['safetyCertificate'];assert t['catalog']['effectiveFX']==expected and (t['catalog'].get('bb') or None)==b['native']['bb'];catalog(t['catalog']);assert q['nativeDGeometry']==t['catalog'];assert all(e['role']=='primary' and e['owner'].startswith('bulbs.sign.') and e['nativeTransform']['root']==b['native']['root'] for e in q['events']);stats['actualProgramEvents']+=len(q['events']);stats['actualReplayedPaints']+=len(t['zeroPaint']);stats['zeroAndMovedTransportPairs']+=1;stats['jitterNontrivialEffectiveFX']+=cut['hold']=='jitter' and scale==.5 and expected['motion']==.45;stats['fractionalRoots']+=bool(v['tuple'].get('fractional'));continue
 if '.whole' in row['id']:
  assert not v['status'].get('failed');a,b=v['pair']
  for k in ['zero','moved']:assert a[k]['pixelSHA256']==b[k]['pixelSHA256'] and a[k]['roots']==b[k]['roots'] and a[k]['wholeTransportNotInvoked'] and b[k]['wholeTransportNotInvoked']
  stats['nativeWholeAndDirectMovedPairs']+=1;continue
 if row['id'].endswith('.controls'):
  assert not v['status'].get('failed');a,b=[p['value'] for p in v['pair']];assert a['otherD']==b['otherD'] and a['sourceUnchanged'] and b['sourceUnchanged'];assert not a['rows']
  for p in b['rows']:
   assert p['destinationUnpainted'] and p['rootUnchanged'];code=p['code'];assert isinstance(code,str) and code not in ['Error','TypeError','AssertionError','UNEXPECTED_SUPPORTED'];expected='UNSUPPORTED_D_BULBS_CATALOG' if p['name']=='partial-catalog' else 'GEOMETRY_LIMIT' if p['name']=='event-budget' else 'UNSUPPORTED_DRAW_PROGRAM' if p['name'] in ['filter','shadow'] else 'UNSUPPORTED_D_BULBS_TRANSPORT';assert expected in code,(p['name'],code);stats['typedNegativeControls']+=1
  assert len(b['rows'])==18
  for p in b['otherD']:assert p['program']['measurementSupported'] and not p['error'] and p['nativeSHA256']==p['zeroSHA256'];stats['otherDNativeZeroPairs']+=1
  stats['controlFixtures']+=1;continue
 raise AssertionError(row['id'])
assert stats['fixtures']==15 and stats['zeroAndMovedTransportPairs']==450 and stats['nativeWholeAndDirectMovedPairs']==90 and stats['controlFixtures']==15 and stats['typedNegativeControls']==270
report={'state':'PARENT_ISOLATED51_RAW_TRANSPORT_ACCEPTED_NO_MAIN_ADAPTER_OR_CACHE_CAPABILITY','manifestSHA256':sha((B/'manifest.json').read_bytes()),'stats':dict(stats),'functionSourceDescriptors':len(all_functions),'pureStorageDataReassemblyAccepted':True,'effectiveFXIndependentlyDerivedFromOriginalMakeEnv':True,'supportOrNumericalSafetyCertificate':False,'fullRendererTransportInvoked':False,'canonicalProductChanged':False,'formalPerformanceAccepted':False,'humanMotionReviewRequired':False,'humanReviewReason':'Internal isolated fidelity/transport; no product placement or new appearance','publicChecks':0,'parentImagesViewed':0};(E/'parent-review51.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
