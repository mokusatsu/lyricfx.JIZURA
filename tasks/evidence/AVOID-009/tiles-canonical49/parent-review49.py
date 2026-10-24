"""Parent independent review: transfer exact accepted48 raw to actual JA/EN builds."""
from pathlib import Path
import json,lzma,hashlib,collections,datetime
R=Path('/workspace/lyricfx.JIZURA');D=R/'tasks/evidence/AVOID-009/tiles-canonical49';P=R/'tasks/evidence/AVOID-009/tiles-adapter48'
sha=lambda b:hashlib.sha256(b).hexdigest()
base=lzma.decompress((P/'tiles48.raw.json.xz').read_bytes());assert sha(base)=='10984f19687011df723418b6ab9f06262924ac7729426f229d76453cff970fa5';ref=json.loads(base)
storage=json.loads((D/'storage49.json').read_text());data=lzma.decompress((D/'tiles49.raw.json.xz').read_bytes());assert sha(data)==storage['exactJSONSHA256'];v=json.loads(data);assert not v['errors'];assert len(v['results'])==64
review=json.loads((P/'parent-review48.json').read_text());assert review['statistics']['movingPolicyConflicts']==review['statistics']['stageFailures']==0
rw={x['n']:x for batch in ref['results'] for x in batch['before']['whole']};rb={(x['n'],x['pass']):x for batch in ref['results'] for x in batch['before']['rows']};ra={(x['n'],x['pass']):x for batch in ref['results'] for x in batch['after']['rows']}
reports=[]
for lang in ['ja','en']:
 batches=[b for b in v['results'] if b['lang']==lang];assert len(batches)==32
 meta=next(m for m in v['metadata'] if m.get('lang')==lang);a=meta['after'];b=meta['before'];assert a['sourcePlan']==b['sourcePlan'] and a['nativeFunction']==b['nativeFunction']==ref['metadata']['after']['nativeFunction'];assert a['clocks']==ref['metadata']['after']['clocks'];assert a['canvasAttrs']==b['canvasAttrs']==ref['metadata']['after']['canvasAttrs'];cert=a['cache']['firstPlan']['cuts'][0]['placementTrajectory']['certificate'];priorcert=ref['metadata']['after']['cache']['firstPlan']['cuts'][0]['placementTrajectory']['certificate'];assert {k:x for k,x in cert.items() if k!='sourceSignature'}=={k:x for k,x in priorcert.items() if k!='sourceSignature'};signature=json.loads(cert['sourceSignature']);priorSignature=json.loads(priorcert['sourceSignature']);assert signature==b['sourcePlan'];localizedStyle={k:signature['style'][k] for k in ['name','desc']};assert localizedStyle==({'name':'ノワール・クロマ','desc':'黒地・白文字・シアン/琥珀の色ズレ'} if lang=='ja' else {'name':'Noir Chroma','desc':'Black and white with cyan and amber color offsets'});assert {k:x for k,x in signature['style'].items() if k not in ['name','desc']}=={k:x for k,x in priorSignature['style'].items() if k not in ['name','desc']};signature['style']=priorSignature['style'];assert signature==priorSignature
 whole_before=[x for batch in batches for x in batch['before']['whole']];whole_after=[x for batch in batches for x in batch['after']['whole']];before=[x for batch in batches for x in batch['before']['rows']];after=[x for batch in batches for x in batch['after']['rows']];assert len(whole_before)==len(whole_after)==250 and len(before)==len(after)==727
 paint_count=0
 for before_w,after_w in zip(whole_before,whole_after):
  assert before_w==rw[before_w['n']]
  assert before_w['n']==after_w['n'];assert before_w['time']==after_w['time'];assert before_w['zeroSHA256']==after_w['zeroSHA256'];assert before_w['movedSHA256']==after_w['actualSHA256']
 for native,actual in zip(before,after):
  key=(native['n'],native['pass']);assert native==rb[key],(lang,key,'entire independent native source row differs')
  assert actual['n']==native['n'] and actual['pass']==native['pass'];o=actual['observation'];expected=ra[key]['observation']
  # Counter identity is incidental; all actual paint/support/policy/source-clock fields must match.
  assert {k:x for k,x in o.items() if k!='frameGeneration'}=={k:x for k,x in expected.items() if k!='frameGeneration'},(lang,key,'actual observation differs')
  assert isinstance(o['frameGeneration'],int) and o['frameGeneration']>0
  paint_count+=len(o['actualForwardedPaint'])
 assert paint_count==9638
 reg=next(x for x in v['regressions'] if x['lang']==lang);assert reg['before']==reg['after'];normalized=json.loads(json.dumps(reg['before']));assert len(normalized)==len(ref['regressions']['before'])==3
 for localized,prior in zip(normalized,ref['regressions']['before']):
  assert {k:localized['sourcePlan']['style'][k] for k in ['name','desc']}==localizedStyle
  for k in ['name','desc']:localized['sourcePlan']['style'][k]=prior['sourcePlan']['style'][k]
 assert normalized==ref['regressions']['before']
 control=next(x for x in v['controls'] if x['lang']==lang);rows=control['rows'];assert len(rows)==42 and [x['name'] for x in rows]==[x['name'] for x in ref['controls']['rows']];atomic=[x for x in rows if 'rootUnchanged' in x];assert len(atomic)==19
 for x in atomic:assert x['error'] and all(x[k] for k in ['bitmapUnchanged','rootUnchanged','langUnchanged','metricsRevisionUnchanged','budgetUnchanged','methodsRestored']) and x['observationCalls']==0
 for x,tag in zip(rows[:2],['A','main']):assert x['error']['details']['preflightPass']==tag and any(d['code']=='GEOMETRY_LIMIT' for d in x['error']['details']['diagnostics'])
 assert next(x for x in rows if x['name']=='serialized-source-requires-replanning')['code']=='SOURCE_PLAN_REQUIRED';clip=next(x for x in rows if x['name']=='preexisting-clip');assert clip['pixelSHA256']==control['clipReference']['pixelSHA256'] and clip['postClipProbeSHA256']==control['clipReference']['postClipProbeSHA256'];assert control['sourceUnchanged'];assert next(x for x in rows if x['name']=='changed-loaded-font-fresh-proof')['stats']['proofRuns']>=2;assert next(x for x in rows if x['name']=='fresh-font-revision-replanned')['stats']['proofRuns']>=3
 reports.append({'languageUI':lang,'qualifiedLyricLanguage':'ja','sourceSignatureMatchesOwnBeforePlan':True,'sourceSignatureLocalizedStyleMetadata':localizedStyle,'wholeNativeZeroPairs':250,'wholeNativeMovedPairs':250,'nativeSourceRowsExactlyMatchAccepted48':727,'actualCompletePaintSupportPolicyClockRowsExactlyMatchAccepted48':727,'actualPaintRecords':paint_count,'priorIndependentExactVerticesTransferred':review['statistics']['exactAffineVertices'],'controls':42,'atomicRejections':19,'unrelatedD':3})
build=json.loads((D/'build49.json').read_text());assert build['buildComplete'] and build['normalBuilderUnmodified'] and build['actualEnglishSourceCompiled'] and build['all7PYCBytesPreserved'];assert all(p['inverseMatchesParentFrozen'] and p['normalBuildOnlyAcceptedModules'] for p in build['outputs']);post=json.loads((D/'post-pins49.json').read_text());assert len(post['files'])==123
for p in post['files']+post['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
assert sha((R/'.git/index').read_bytes())==post['index']['sha256'];assert all(not (R/p).exists() for p in post['absent57']);assert v['invocation']['pins']==post
baseline=json.loads((D/'baseline-after49'/'baseline-results.json').read_text());receipt=json.loads((D/'baseline-after49'/'baseline49-receipt.json').read_text());assert len(baseline['results'])==6 and all(x['exitCode']==0 for x in baseline['results']);assert receipt['exitCode']==0 and receipt['postPinsError'] is None and receipt['beforeReferenceReusedNotRerun']
report={'state':'PARENT_CANONICAL49_SOURCE_RAW_BASELINE_ACCEPTED_FIXED_SCOPE_MEDIA_HUMAN_PENDING','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rawExactJSONSHA256':sha(data),'languages':reports,'sourceInventory':107,'preservedExistingSources':104,'preservedPYC':7,'preservedAbsents':57,'beforeBaselineReference':'acceptedactualafter66six; sameproduct66 beforeintegration, notrerun','afterBaselinePassed':6,'canonicalIntegrationAccepted':True,'humanMotionApproval':False,'mediaOrVisualChecked':False,'formalPerformanceAccepted':False,'savingBodyTested':False,'ordinaryUIExportSupportExpanded':False,'publicChecks':0,'parentImagesViewed':0,'foundation':review['foundation']};(D/'parent-review49.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
