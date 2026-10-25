"""Independent canonical native regression review. No browser/images/network."""
import collections,gzip,hashlib,json,pathlib,runpy,time
from urllib.parse import urlparse
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');E=ROOT/'tasks/evidence/AVOID-009/resume-20261025'
PROGRESS={}
def review(folder,out):
 P=runpy.run_path(str(E/'parent-local-review69.py'));exact=P['exact'];restore=P['restore'];U=P['undefined'];m=json.loads((folder/'manifest.json').read_bytes());assert m['mode']=='canonical-JAEN-native70'
 def eq(a,b):assert exact(a)==exact(b)
 def logical_catalog(c):
  # Native live CTM and measurement-context CTM differ after setTransform.
  # Actual original roots, replay commands and RGBA remain exact checks below.
  return {**{k:v for k,v in c.items() if k not in ['root','sourceCalls']},'sourceCalls':[{k:v for k,v in call.items() if k not in ['matrixBeforeCall','matrixAfterCall']} for call in c['sourceCalls']]}
 def paint(p):
  s=p['state'];keys=['alpha','blend','filter','shadowColor','shadowBlur','shadowOffsetX','shadowOffsetY'];keys+=['strokeStyle','lineWidth','lineCap','lineJoin','miterLimit','dash','dashOffset'] if p['kind'].startswith('stroke') else ['fillStyle']
  if p['kind'].endswith('Text'):keys+=['font','textAlign','textBaseline','direction']
  return {**{k:p[k] for k in ['kind','args','matrix','path','metrics']},'state':{k:s.get(k,U) for k in keys}}
 def native(a,b):
  for k in ['pixelSHA256','bb','root']:eq(a[k],b[k])
  if 'effectiveFX' in a:eq(a['effectiveFX'],b['effectiveFX'])
  eq([paint(p) for p in a['paint']],[paint(p) for p in b['paint']]);eq([{k:v for k,v in c.items() if k!='owner'} for c in a['sourceCalls']],[{k:v for k,v in c.items() if k!='owner'} for c in b['sourceCalls']])
 counts=collections.Counter();phases=collections.Counter();seen=collections.defaultdict(set);tables={};case=None;epoch=None;lastseq={};keybytes=collections.Counter();total=0;started=time.monotonic();last=started
 for row in m['records']:
  z=(folder/row['file']).read_bytes();assert len(z)==row['bytes'] and hashlib.sha256(z).hexdigest()==row['sha256'];raw=gzip.decompress(z);assert len(raw)==row['JSONBytes'];total+=len(raw);assert total<=268435456;r=json.loads(raw)
  if r['case']!=case:
   case=r['case'];tables={k:[] for k in ['matrix','paint','catalog']};keybytes=collections.Counter()
   if epoch is not None:assert r['tableEpoch']==epoch+1
   epoch=r['tableEpoch']
  assert r['tableEpoch']==epoch and r['sequence']==row['sequence']==lastseq.get(case,-1)+1;lastseq[case]=r['sequence']
  for k,values in r['tableDeltas'].items():
   for v in values:assert v['id']==len(tables[k]);tables[k].append(v['value']);keybytes[k]+=len(json.dumps(v['value'],ensure_ascii=False,separators=(',',':')).encode('utf-8','backslashreplace'))
   assert len(tables[k])==r['tableStats'][k]['entries']<=100000 and keybytes[k]==r['tableStats'][k]['canonicalKeyBytes']<=67108864
  v=restore(r['binding'],tables);phase=v['phase'];assert phase==row['phase'];phases[phase]+=1;PROGRESS.update(records=sum(phases.values()),phase=phase,phases=dict(phases),counts=dict(counts),producerErrors=m.get('errors'))
  if phase=='init':
   assert v['lang'] in ['ja','en'] and len(v['pair'])==2
   for i,p in enumerate(v['pair']):
    assert p['actualLanguage']==p['planLanguage']==p['value']['sourcePlan']['lang']==p['expectedResolvedLanguage'];assert p['documentLanguage']==v['lang'];assert hashlib.sha256(p['value']['sourceNativeFunction'].encode()).hexdigest()==v['sourceWitnessSHA256'][i]
   a,b=[p['value'] for p in v['pair']];eq(a['sourcePlan'],b['sourcePlan']);audit=lambda p:{**p['fontAudit'],'faces':[{**f,'url':urlparse(f['url']).path} for f in p['fontAudit']['faces']]};eq(audit(a),audit(b));eq(a['spec'],b['spec']);key=(v['lang'],v['spec']['id']);assert key not in seen['init'];seen['init'].add(key);counts['init']+=1
  if phase=='tuple':
   a,b=v['pair'];eq(a['tuple'],b['tuple']);eq(a['tuple'],v['tuple']);assert a['sourceUnchanged'] and b['sourceUnchanged'];native(a['native'],b['native']);native(a['directMoved'],b['directMoved']);t=b['transport'];assert t['destinationUnpainted'] and t['rootUnchanged'] and (t['error'] is None or t['error'] is U)
   st=t['sameTurn'];assert st['recordToBothReplaysWithoutAwait'] and st['helperKnownAfter'] and st['fontRevisionUnchanged'] and st['fontTableUnchanged'];prog=t['program'];assert prog['measurementSupported'] and prog['nativeBulbsTransport51']['effectiveFXIdentityPreserved']
   for x in [prog['nativeBulbsTransport51']['inputEffectiveFX'],prog['nativeBulbsTransport51']['recordedEffectiveFX'],t['catalog']['effectiveFX'],a['native']['effectiveFX'],b['native']['effectiveFX']]:eq(x,t['effectiveFX'])
   eq(prog['nativeBulbsTransport51']['actualRoot'],b['native']['root']);eq(t['catalog'].get('bb'),b['native']['bb']);eq(logical_catalog(t['catalog']),logical_catalog(b['native']['catalog']));assert t['zeroSHA256']==a['native']['pixelSHA256'] and t['movedSHA256']==a['directMoved']['pixelSHA256'];eq([paint(p) for p in t['zeroPaint']],[paint(p) for p in a['native']['paint']]);eq([paint(p) for p in t['movedPaint']],[paint(p) for p in a['directMoved']['paint']])
   for e in prog['events']:assert e['role']=='primary' and e['owner'].startswith('bulbs.sign.') and exact(e['nativeTransform']['root'])==exact(b['native']['root'])
   key=(v['lang'],v['spec'],v['tuple']['id']);assert key not in seen['tuple'];seen['tuple'].add(key);counts['tuple']+=1;counts['transportPaints']+=len(t['zeroPaint'])
  if phase=='whole':
   a,b=v['pair']
   for kind in ['zero','moved']:eq(a[kind],b[kind]);assert a[kind]['wholeTransportNotInvoked'] and b[kind]['wholeTransportNotInvoked']
   key=(v['lang'],v['spec'],v['time']);assert key not in seen['whole'];seen['whole'].add(key);counts['whole']+=1
  if phase=='controls':
   a,b=v['pair'];assert a['sourceUnchanged'] and b['sourceUnchanged'] and not a['rows'] and len(b['rows'])==18 and len({r['name'] for r in b['rows']})==18
   for c in b['rows']:assert c['code'] and c['code']!='UNEXPECTED_SUPPORTED' and c['destinationUnpainted'] and c['rootUnchanged']
   assert len(a['otherD'])==len(b['otherD'])==3 and [c['layout'] for c in b['otherD']]==['tiles','balloons','magnets']
   for x,y in zip(a['otherD'],b['otherD']):
    for k in ['layout','sourcePlan','pixelSHA256','nativeSHA256','zeroSHA256','error']:eq(x[k],y[k])
   key=(v['lang'],v['spec']);assert key not in seen['controls'];seen['controls'].add(key);counts['controlGroups']+=1;counts['typedControls']+=18;counts['otherD']+=3
  if time.monotonic()-last>25:print(json.dumps({'canonicalRecords':sum(phases.values()),'phase':phase,'counts':dict(counts)}),flush=True);last=time.monotonic()
 if m['complete']:
  assert not m['errors'] and total==m['serializedBytes'];assert counts['init']==30 and counts['tuple']==900 and counts['whole']==180 and counts['controlGroups']==30 and counts['typedControls']==540 and counts['otherD']==90
  assert {k[0] for k in seen['init']}=={'ja','en'}
  for lang,spec in seen['init']:
   assert sum(k[:2]==(lang,spec) for k in seen['tuple'])==30 and sum(k[:2]==(lang,spec) for k in seen['whole'])==6 and (lang,spec) in seen['controls']
  six=json.loads((folder/'baseline6/baseline-results.json').read_bytes());sixctrl=json.loads((folder/'baseline6/controller-result.json').read_bytes());assert sixctrl['returnCode']==0 and sixctrl['unmodifiedBaselineScript'];expected_tests=['lyric_test.js','lyric_avoid_center_test.cjs','lyric_group_avoidance_test.cjs','lyric_scene_test.cjs','lyric_placement_stability_test.cjs','timeline_boundary_drag_test.cjs'];assert [r['test'] for r in six['results']]==expected_tests and all(r['exitCode']==0 for r in six['results'])
  seal=json.loads((folder.parent/'reviewed-seal.json').read_bytes());build=json.loads((folder.parent/'build/build-receipt.json').read_bytes());transition=json.loads((folder/'html-transition.json').read_bytes());outputs={r['path']:r['sha256'] for r in build['outputs']};new={'index.html':outputs['build/candidate-ja.html'],'en/index.html':outputs['build/candidate-en/index.html']};assert transition['initial']==seal['root']['oldHTML'] and transition['declaredNormalBuild']==transition['final']==new and seal['before6Reuse']['reusedNotRerun'];assert six['node']==seal['resolvedNodeDependency']['nodeVersion'];assert build['EnglishCompiledFromSource'] and build['normalBuildSourceUnmodified'] and build['PYC7Unchanged'] and build['ROOTIndexUnchanged']
  for name,digest in new.items():assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest
  for name,digest in seal['root']['PYC'].items():assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest
  active_root=seal['root'];recovery=folder.parent/'recovery-reviewed-seal.json'
  if recovery.exists():
   recovery_seal=json.loads(recovery.read_bytes());assert recovery_seal['sourceArchiveCommit']=='3cc4f6d0dcc89a992e22a67395aef1604489d04a';assert recovery_seal['historicalReviewedSealSHA256']==hashlib.sha256((folder.parent/'reviewed-seal.json').read_bytes()).hexdigest();assert recovery_seal['historicalSourceExceptions']==['tasks/evidence/AVOID-009/resume-20261025/parent-canonical-review70.py'];assert recovery_seal['root']['PYC']==seal['root']['PYC'];active_root=recovery_seal['root']
  assert hashlib.sha256((ROOT/'.git/index').read_bytes()).hexdigest()==active_root['indexSHA256']
 result={'state':'PASS_CANONICAL_JAEN_NATIVE_RAW_AND_AFTER6' if m['complete'] else 'PASS_CANONICAL_STORED_PREFIX_PRODUCER_FAILED','producerComplete':m['complete'],'producerErrors':m['errors'],'counts':dict(counts),'phases':dict(phases),'records':sum(phases.values()),'storedJSONBytes':total,'rendererSourceStringComparedAsPixelData':False,'nativeRendererSourceWitnessSHARecorded':True,'canonicalHTMLAndAfter6IndependentlyChecked':m['complete'],'before6ReuseSameProtectedInputs':m['complete'],'formalPerformanceAccepted':False,'saveBodyAccepted':False,'whole009Complete':False,'publicChecks':0,'postSaveReachabilityChecks':0,'parentImages':0};out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
