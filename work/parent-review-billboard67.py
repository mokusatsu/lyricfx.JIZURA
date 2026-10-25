"""Parent independent SOURCE67 full raw/program reconstruction, no images or apps."""
from pathlib import Path
import json,hashlib,gzip,struct,collections,math,os,ast,time
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/billboard67.raw01');E=R/'tasks/evidence/AVOID-009/billboard-transport67';H=lambda b:hashlib.sha256(b).hexdigest();U=object();N='62';stat=collections.Counter();tables={};started=time.monotonic()
helper=R/'work/parent-review-billboard61.py';tree=ast.parse(helper.read_text());names={'dec','key','eq','ix','unpack','put','restore','read','fontCheck','crossCheck'};nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in names];assert len(nodes)==len(names);exec(compile(ast.Module(body=nodes,type_ignores=[]),str(helper),'exec'),globals())
def copy(v):
 if isinstance(v,dict):return {k:copy(x) for k,x in v.items()}
 if isinstance(v,list):return [copy(x) for x in v]
 return v
def rootFree(c):
 x=copy(c);x.pop('root',None)
 if x.get('sourceOwnClip'):x['sourceOwnClip'].pop('matrix',None)
 for s in x['sourceCalls']:
  for k in ['matrixBeforeCall','matrixAfterCall','fillMatrix']:s.pop(k,None)
  if s.get('gradient'):s['gradient'].pop('creationMatrix',None)
  for p in s.get('path',[]):p.pop('matrix',None)
 return x
def zeroCheck(j):
 z=j['zero'];n=j['nativeReference'];p=z['program'];assert not p['measurementSupported'] and p['transportSupported'];q=p['nativeBillboardTransport64'];assert q['scope']=='synchronous-zero-only' and q['geometryUnsupported'] and q['initiallyUnclippedContextAssumed'] and not q['safetyCertificate'] and q['effectiveFXIdentityPreserved'];assert not z['geometrySupported'] and z['transportOnly'];eq(z['root'],q['originalLiveRoot']);eq(n['root'],z['root']);eq(p['nativeDGeometry']['root'],q['actualMeasuredRoot']);eq(rootFree(p['nativeDGeometry']),rootFree(n['catalog']))
 for k in ['pixelSHA256','root','paintCore','gradients','clips']:eq(z[k],n[k])
 assert len(z['actualForwardedPaint'])==len(n['paint']);assert z['RNGCallSequenceDuringQualifiedRecord'].startswith('not independently observed');events=p['events'];assert all(e['role']=='primary' and e['owner'].startswith('billboard.') and 'billboardPaintState64' in e for e in events)
 for i,e in enumerate(events):assert e['order']==i and not e['nativeTransform']['ops'] and not e['clips'];eq(e['nativeTransform']['root'],q['originalLiveRoot'])
 mats=[e for e in events if e['kind']=='nativeBillboardClippedMaterial64'];assert len(mats)==(1 if z['pass']=='main' else 0)
 for e in mats:
  material=e['args'][0];c=p['nativeDGeometry'];eq(material['originalLiveRoot'],q['originalLiveRoot']);eq(material['actualMeasuredRoot'],q['actualMeasuredRoot']);eq(material['clipRect'],c['sourceOwnClip']['rectangle']);eq(c['sourceOwnClip']['matrix'],q['actualMeasuredRoot']);assert material['complete'];source=[s for s in c['sourceCalls'] if s['kind']=='source-clipped-radial-path' or s['owner']=='billboard.board.illumination'];assert len(source)==len(material['paints'])
  for member,s in zip(material['paints'],source):
   assert member['sourceOrdinal']==s['ordinal'] and member['owner']==s['owner'] and member['role']==s['role']=='primary';eq(member['alpha'],s['alphaAtFill']);eq(member['actualMeasuredPaintMatrix'],q['actualMeasuredRoot']);eq(s['matrixBeforeCall'],q['actualMeasuredRoot']);eq(s['matrixAfterCall'],q['actualMeasuredRoot'])
   if member['kind']=='cone':
    g=member['gradient'];eq(g['args'],s['gradient']['arguments']);eq(g['stops'],s['gradient']['stops']);eq(g['creationMatrix'],s['gradient']['creationMatrix']);eq(g['creationMatrix'],q['actualMeasuredRoot']);eq(member['commands'],[[v['kind'],v['arguments']] for v in s['path']]);assert all(key(v['matrix'])==key(q['actualMeasuredRoot']) for v in s['path']);eq(s['fillMatrix'],q['actualMeasuredRoot']);stat['materialConeMembers']+=1
   else:assert member['kind']=='illumination';eq(member['args'],s['arguments']);stat['materialIlluminationMembers']+=1;stat['materialZeroAlphaIllumination']+=member['alpha']==0
  assert material['paints'][-1]['kind']=='illumination';stat['materialGroups']+=1
 stat['zeroPairsFullPaintRGBACTMClipGradientAndProgramCompared']+=1
mb=(B/'manifest.json').read_bytes();m=json.loads(mb);assert m['complete'] and not m['errors'] and not m['inFlight'] and not m['partialRecords'] and m['postPins']['unchanged'];assert m['kind']=='SOURCE67_BILLBOARD_SYNCHRONOUS_ZERO_TRANSPORT';expected={'fixtures':2,'nativeTriples':201,'wholeFramePairs':16,'partialControls':2,'contextTriples':4,'otherD':3,'zeroPairs':205,'typedNegatives':14};assert m['completed']==expected;assert m['expectedNativeTriples']==201;total=0;native=context=partial=whole=negative=0;keybytes=collections.Counter();inventories=[]
for row in m['records']:
 raw=read(row);j=dec(raw['data']);rid=row['id'];total+=row['JSONBytes']
 if rid.endswith('.init'):
  tables={k:[] for k in ['data','catalog','matrix']};keybytes=collections.Counter();eq(j['before']['sourcePlan'],j['after']['sourcePlan']);eq(j['before']['times'],j['after']['times']);eq(j['before']['boundaries'],j['after']['boundaries']);stat['fixtures']+=1
 if isinstance(j,dict) and 'tables' in j and all(isinstance(x,list) for x in j['tables'].values()):
  for k,items in j['tables'].items():
   for x,original in zip(items,raw['data']['tables'][k]):assert ix(x['id'])==len(tables[k]);tables[k].append(x['value']);keybytes[k]+=len(json.dumps(original['value'],ensure_ascii=False,separators=(',',':')).encode())
 if isinstance(j,dict) and 'refs' in j:
  a,b,c=[restore(j['refs'][k]) for k in ['before','off','on']]
  for k in ['pixelSHA256','root','bb','traceCore','paintCore','gradients','clips','rng']:eq(a[k],b[k]);eq(a[k],c[k])
  assert a['catalog'] is None and b['catalog'] is None;crossCheck(c,'.partial' in rid)
  if '.native' in rid:native+=1
  elif '.context' in rid:context+=1
  else:assert '.partial' in rid;partial+=1
 if isinstance(j,dict) and 'zero' in j:zeroCheck(j)
 if '.whole' in rid:
  for k in ['time','pixelSHA256','requestedLang','actualLang']:eq(j['before'][k],j['after'][k])
  fontCheck(j['before']['fontState']);fontCheck(j['after']['fontState']);whole+=1
 if rid.endswith('.typednegatives'):
  assert len(j)==7;assert {x['kind'] for x in j}=={'unsupported-enter','nonfinite-effectiveFX','helper-drift','environment-energy','cloned-effectiveFX','nonzero-offset','context-state'}
  for v in j:assert v['code'].startswith('UNSUPPORTED_D_BILLBOARD64_') and v['before']==v['after'] and v['destinationBitmapUnchanged'];negative+=1
 if rid.endswith('.inventory'):
  for state in j['fontStates']:fontCheck(state)
  for k,t in j['tables'].items():assert t['entries']==len(tables[k])<=100000 and t['canonicalKeyBytes']==keybytes[k]<=67108864
  inventories.append(j['tables'])
 if rid=='otherD-controls':eq(j['before'],j['after']);assert len(j['before'])==3
 if rid=='parent-pure-data-storage-regression':assert j['rootCases']==128;stat['dataOnlyRootCases']=128
assert (native,context,partial,whole,negative)==(201,4,2,16,14);assert stat['zeroPairsFullPaintRGBACTMClipGradientAndProgramCompared']==205;assert total==m['serializedJSONBytes']<=268435456;assert stat['materialConeMembers']>0 and stat['materialZeroAlphaIllumination']>0 and stat['weakPointOneStates']>0
p=m['pins']
for x in p['files']+p['pycache']:assert H((R/x['path']).read_bytes())==x['sha256']
for x in p['protectedAbsent']:assert not(R/x).exists()
assert H((R/p['index']['path']).read_bytes())==p['index']['sha256'];report={'state':'PARENT_SOURCE67_SCOPED_SYNCHRONOUS_ZERO_TRANSPORT_RAW_ACCEPTED','manifestSHA256':H(mb),'completed':m['completed'],'counters':dict(stat),'serializedJSONBytes':total,'allFullNativeOriginalOffOnPaintRGBAAndSourceCatalogsReconstructed':True,'all205ActualForwardedZeroFullPaintRGBACTMClipGradientAndMemberOrderCompared':True,'actualMAndMeasuredMprimeBothRetainedNotRelabeled':True,'stockRecordRNGCallSequenceIndependentlyObserved':False,'typedNegativesFullBitmapUnchanged':14,'initiallyUnclippedFreshDefaultContextAssumption':True,'geometrySupported':False,'adapterAccepted':False,'generalOrNonzeroTransportAccepted':False,'canonicalIntegrated':False,'allTimeOrNumericalCertificate':False,'formalPerformanceAccepted':False,'saveBodyTested':False,'sourcePinsPostVerified':True,'parentHumanMotionReviewRequired':False,'reason':'Isolated zero-only fidelity foundation preserving sampled original native paint, no new layout or product adapter.','product63StillUncommitted':True,'capacity16UserPermissionPending':True,'publicChecks':0,'parentImages':0,'elapsedSeconds':time.monotonic()-started};(E/'parent-raw-review67.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
