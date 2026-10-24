"""Independent parent JA/EN full-record comparison against accepted51 raw."""
from pathlib import Path
import json,gzip,hashlib,collections,urllib.parse
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/bulbs53-raw01');F=Path('/dev/shm/avoid009-evening-20261024/bulbs51.raw01');E=R/'tasks/evidence/AVOID-009/bulbs-canonical53';sha=lambda b:hashlib.sha256(b).hexdigest();m=json.loads((B/'manifest.json').read_bytes());ref=json.loads((R/'tasks/evidence/AVOID-009/bulbs-transport51/manifest51.json').read_bytes());assert sha((F/'manifest.json').read_bytes())==sha((R/'tasks/evidence/AVOID-009/bulbs-transport51/manifest51.json').read_bytes())=='3fedbc209e26cac78e12be16d2b87840b7e98dc77697dfe806c7fbcbba1b767e';refs={r['id']:r for r in ref['records']};stats=collections.Counter();locales=[];seen=set()
assert m['complete'] and not m['errors'] and not m['partialRecords'] and m['inFlight'] is None and m['postPins']['unchanged'];assert m['completed']==m['expected']=={'fixtures':30,'tuplePairs':900,'wholePairs':180,'controlPairs':30};assert not m['placementAdapterAdded'] and not m['safetyCertificate']
def read(row,base):
 pieces=[]
 for p in row['parts']:
  assert '/' not in p['path'] and '..' not in p['path'];z=(base/p['path']).read_bytes();b=gzip.decompress(z);assert len(z)==p['bytes'] and sha(z)==p['sha256'] and len(b)==p['JSONBytes']<=1048576 and sha(b)==p['JSONSHA256'];pieces.append(b);stats['fragmentsVerified']+=1
 b=b''.join(pieces);assert len(b)==row['JSONBytes'] and sha(b)==row['JSONSHA256'] and row['complete'] and row['budgetSplit']==(len(b)>8388608);return json.loads(b)
def plan(a,b,lang):
 if lang=='ja':assert a==b;return
 aa={**a,'style':{**a['style']}};bb={**b,'style':{**b['style']}}
 for k in ['name','desc']:
  if aa['style'].get(k)!=bb['style'].get(k):locales.append({'field':k,'actualEnglish':aa['style'].get(k),'referenceJapanese':bb['style'].get(k)})
  aa['style'].pop(k,None);bb['style'].pop(k,None)
 assert aa==bb

def fonts(a):
 a={**a,'faces':[dict(p) for p in a['faces']]}
 for p in a['faces']:
  u=urllib.parse.urlparse(p['url']);assert u.scheme=='http' and u.hostname=='127.0.0.1' and not u.query and not u.fragment;p['url']=u.path
 return a
for row in m['records']:
 assert row['id'] not in seen;seen.add(row['id']);v=read(row,B);lang=v['lang'];assert lang in ['ja','en'];key=row['id'][len(lang)+1:];reference=refs[key];assert v['reference']['id']==key and v['reference']['JSONSHA256']==reference['JSONSHA256'] and v['reference']['comparedFullValues'];w=read(reference,F);assert not v['status'].get('failed'),row['id']
 if key.endswith('.init'):
  assert v['spec']==w['spec'] and v['pair'][0]['sourcePlan']==v['pair'][1]['sourcePlan']
  for a,b in zip(v['pair'],w['pair']):
   plan(a['sourcePlan'],b['sourcePlan'],lang);assert fonts(a['fontAudit'])==fonts(b['fontAudit']);assert {k:x for k,x in a.items() if k not in ['sourcePlan','fontAudit']}=={k:x for k,x in b.items() if k not in ['sourcePlan','fontAudit']}
  stats[lang+'Fixtures']+=1
 elif '.tuple' in key:
  assert v['tuple']==w['tuple'] and v['pair']==w['pair'];t=v['pair'][1]['value']['transport'];assert t['program']['measurementSupported'] and not t['program']['diagnostics'] and t['error'] is None and t['destinationUnpainted'] and t['rootUnchanged'];stats[lang+'TuplePairs']+=1;stats['actualEvents']+=len(t['program']['events']);stats['actualReplayedPaints']+=len(t['zeroPaint'])
 elif '.whole' in key:
  assert v['time']==w['time'] and v['pair']==w['pair'];assert v['status']['wholeTransportInvoked'] is False;stats[lang+'NativeWholePairs']+=1
 elif key.endswith('.controls'):
  for a,b in zip(v['pair'],w['pair']):
   a=a['value'];b=b['value'];assert a['sourceUnchanged'] and b['sourceUnchanged'] and a['rows']==b['rows'] and len(a['otherD'])==len(b['otherD'])==3
   for x,y in zip(a['otherD'],b['otherD']):plan(x['sourcePlan'],y['sourcePlan'],lang);assert {k:p for k,p in x.items() if k!='sourcePlan'}=={k:p for k,p in y.items() if k!='sourcePlan'}
  assert v['pair'][0]['value']['otherD']==v['pair'][1]['value']['otherD'];assert len(v['pair'][1]['value']['rows'])==18 and all(p['destinationUnpainted'] and p['rootUnchanged'] and p['code'] not in ['Error','TypeError','UNEXPECTED_SUPPORTED'] for p in v['pair'][1]['value']['rows']);stats[lang+'TypedNegativeControls']+=18;stats[lang+'OtherDControls']+=3;stats[lang+'ControlFixtures']+=1
 else:raise AssertionError(key)
for lang in ['ja','en']:
 assert stats[lang+'Fixtures']==15 and stats[lang+'TuplePairs']==450 and stats[lang+'NativeWholePairs']==90 and stats[lang+'TypedNegativeControls']==270 and stats[lang+'OtherDControls']==45 and stats[lang+'ControlFixtures']==15
post=json.loads((E/'post-pins53.json').read_bytes())
for p in post['files']+post['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256']
assert sha((R/'.git/index').read_bytes())==post['index']['sha256'] and all(not(R/p).exists() for p in post['absent60']);unique={json.dumps(p,sort_keys=True,ensure_ascii=False) for p in locales};report={'state':'PARENT_CANONICAL53_FULL_NATIVE_AND_TRANSPORT_RAW_ACCEPTED_PENDING_AFTER6_BASELINE','manifestSHA256':sha((B/'manifest.json').read_bytes()),'fullAccepted51RawComparedNotHashOnly':True,'stats':dict(stats),'existingEnglishMetadataDifferences':[json.loads(p) for p in sorted(unique)],'sameLanguageSourcePlansExact':True,'PYC7Index60AndAllPostBuildPinsUnchanged':True,'supplied60HzTupleVsActual24HzNativeClockDistinguished':True,'fullRendererTransportInvoked':False,'placementAdapterAdded':False,'supportOrStaleCacheCertificate':False,'formalPerformanceAccepted':False,'saveBodyTested':False,'publicChecks':0,'parentImagesViewed':0};(E/'parent-review53.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2))
