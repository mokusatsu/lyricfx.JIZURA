"""Independent parent raw/geometry review in the producer namespace, before push.
No network, browser, images, product writes, or remote readback.
"""
import ast,collections,gzip,hashlib,json,math,pathlib,re,runpy,struct,sys,time,traceback
from fractions import Fraction as F
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');E=ROOT/'tasks/evidence/AVOID-009/resume-20261025'
BASE=ROOT/'tasks/evidence/AVOID-009/bulbs-diagnostic56/parent-review-bulbs56.py'
assert hashlib.sha256(BASE.read_bytes()).hexdigest()=='4a13e3019c1f9b7240f706029d56097f0c91df9c2103b56dc144829cb2fdc60c'
Q=F.from_float;stats=collections.Counter();U=object()
names={'geom','hull','cross','clock','numericID'};tree=ast.parse(BASE.read_text());nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in names];assert len(nodes)==len(names)
exec(compile(ast.Module(body=nodes,type_ignores=[]),str(BASE),'exec'),globals())
R=runpy.run_path(str(E/'parent-read-raw69.py'));restore=R['restore'];undefined=R['UNDEFINED']
def exact(v):
 if v is undefined:return ('$undefined',)
 if isinstance(v,(int,float)) and not isinstance(v,bool):return ('$f64',struct.pack('>d',v).hex())
 if isinstance(v,list):return tuple(exact(x) for x in v)
 if isinstance(v,dict):return tuple(sorted((k,exact(x)) for k,x in v.items()))
 return v
def box(poly):return {k:f(v[i] for v in poly) for k,i,f in [('x0',0,min),('y0',1,min),('x1',0,max),('y1',1,max)]}
def directed(x,up):
 v=float(x)
 if (Q(v)<x if up else Q(v)>x):v=math.nextafter(v,math.inf if up else -math.inf)
 return v
def owner(s,p):
 m=re.fullmatch(r'bulbs\.sign\.ring\.(\d+)\.state\.\d+\.\d+\.(bulb|halo|glint)',s)
 if m:return p+':bulbs.sign.ring.'+m[1]+'.'+m[2]
 assert re.fullmatch(r'bulbs\.sign\.(shadow|face|outline|lyric|subtitle)',s);return p+':'+s
def evaluate(supports,circle,delta):
 cx,cy=map(Q,[circle['cx'],circle['cy']]);r=Q(circle['r'])+Q(circle['margin']);dx,dy=map(Q,delta);fail=[]
 for i,s in enumerate(supports):
  b=s['bounds'];x0,x1=Q(b['x0'])+dx,Q(b['x1'])+dx;y0,y1=Q(b['y0'])+dy,Q(b['y1'])+dy
  nx=min(max(cx,x0),x1);ny=min(max(cy,y0),y1);hit=(cx-nx)**2+(cy-ny)**2<=r*r;stage=x0<0 or y0<0 or x1>960 or y1>540
  if hit or stage:fail.append({'index':i,'owner':s['owner'],'circle':hit,'stage':stage,'conservativeEnvelope':True})
 return {'passed':not fail,'checked':len(supports),'failures':fail}
def evaluation_equal(a,b):
 for k in ['passed','checked','failures']:assert exact(a[k])==exact(b[k]),k
def disk(p):
 M=list(map(Q,p['matrix']));arc=next(c for c in p['path'] if c['key']=='arc');x,y,r=map(Q,arc['args'][:3]);assert M[1]==M[2]==0 and M[0]==M[3]
 return (M[0]*x+M[4],M[3]*y+M[5],abs(M[0])*r)
def neighbor_quality(sample):
 q=sample['quality']
 if sample['reference'].get('culled'):assert q['passed'] and not q['passes'];return
 for own in q['passes']:
  if not own['held']:assert own['passed'] is None and not own['failures'];continue
  records=[p for p in sample['direct']['records'] if p['state']['alpha']>0 and p['owner'].endswith('.bulb')];expected=[];short=[];hardfail=0
  for ring in sample['direct']['catalog']['rings']:
   prefix='bulbs.sign.ring.'+str(int(ring['ri']))+'.state.'+str(int(ring['N']))+'.';bulbs={int(p['owner'].split('.')[-2]):p for p in records if p['owner'].startswith(prefix)}
   if not bulbs:assert own['pass']!='main';continue
   assert len(bulbs)==ring['N']
   for i in range(len(bulbs)):
    a,b=disk(bulbs[i]),disk(bulbs[(i+1)%len(bulbs)]);d2=(a[0]-b[0])**2+(a[1]-b[1])**2;rs=a[2]+b[2];v=own['neighborRecords'][len(expected)]
    dy=lambda z:F(int(z['n']))*F(2)**int(z['e'])
    assert v['ri']==ring['ri'] and v['N']==ring['N'] and v['i']==i and v['next']==(i+1)%len(bulbs)
    assert dy(v['squaredCenterDistance'])==d2 and dy(v['sumLogicalRadii'])==rs
    hard=d2>=(rs+Q(v['hardMinimumLogicalGap']))**2;preferred=d2>=(rs+Q(4.86))**2
    assert v['hardMinimumLogicalGap']==3 and v['preferredMinimumLogicalGap']==4.86 and v['hardPassed']==hard and v['preferredMet']==preferred
    if not preferred:short.append(len(expected))
    hardfail+=not hard;expected.append(v)
  assert len(expected)==len(own['neighborRecords']) and short==own['preferredShortfalls'];assert hardfail==sum(f['criterion']=='neighbor-bulb-body-gap' for f in own['failures']);stats['neighborPairs']+=len(expected)
def main(folder,out):
 m=json.loads((folder/'manifest.json').read_bytes());tables={};case=None;lastseq={};native={};groups=collections.defaultdict(dict);counts=collections.defaultdict(collections.Counter);summaries={};circle=None;phases=collections.Counter();atlas=None;product={};oracle={};previous_epoch=None;total=0;started=time.monotonic();lastlog=started
 for row in m['records']:
  z=(folder/row['file']).read_bytes();assert len(z)==row['bytes'] and hashlib.sha256(z).hexdigest()==row['sha256'];raw=gzip.decompress(z);assert len(raw)==row['JSONBytes'];total+=len(raw);r=json.loads(raw)
  if r['case']!=case:
   case=r['case'];tables={k:[] for k in ['matrix','paint','catalog']};keybytes=collections.Counter()
   if previous_epoch is not None:assert r['tableEpoch']==previous_epoch+1
   previous_epoch=r.get('tableEpoch')
  elif 'tableEpoch' in r:assert r['tableEpoch']==previous_epoch
  assert r['sequence']==row['sequence']==lastseq.get(case,-1)+1;lastseq[case]=r['sequence']
  for k,delta in r['tableDeltas'].items():
   for v in delta:
    assert v['id']==len(tables[k]);tables[k].append(v['value']);keybytes[k]+=len(json.dumps(v['value'],ensure_ascii=False,separators=(',',':')).encode())
   assert len(tables[k])==r['tableStats'][k]['entries']<=100000 and keybytes[k]==r['tableStats'][k]['canonicalKeyBytes']<=67108864
  v=restore(r['binding'],tables);phase=v['phase'];assert phase==row['phase'];phases[phase]+=1;stats['records']+=1
  if phase=='init':
   clock(v['clocks']);region=v['plan']['lyricAvoidanceIndex']['regions'][0];circle={'cx':region['center']['x']*960,'cy':region['center']['y']*540,'r':region['radius']*540,'margin':2.7}
  if phase=='native-frame':
   if atlas is None:native.setdefault(case,[]).append((v['n'],v['hash'],v['time']))
   else:oracle[int(v['n'])]=v['hash']
  samples=v.get('samples',[]) if phase=='historical59A-fresh-control' else [v] if phase in ['untranslated','destination'] else []
  for entry in samples:
   sample=entry['sample'];own=entry['own'];reference=sample['reference'];direct=sample['direct'];assert exact(sample['native']['catalog'])==exact(reference)
   for k in ['clock','params','sourceInputs','q','out']:assert exact(reference[k])==exact(direct['catalog'][k]),k
   assert len(reference['rings'])==len(direct['catalog']['rings'])
   for a,b in zip(reference['rings'],direct['catalog']['rings']):
    assert a['N']==b['N'];light=lambda x:[{k:t for k,t in y.items() if k not in ['p','r']} for y in x];assert exact(light(a['lights']))==exact(light(b['lights']))
   for k in ['pass','lt','ltb','step','pIn','pOut']:assert exact(sample['clock'][k])==exact(own[k]),k
   paints=[p for p in direct['records'] if p['state']['alpha']>0];assert len(paints)==len(sample['supports']);neighbor_quality(sample)
   for i,(paint,support) in enumerate(zip(paints,sample['supports'])):
    assert paint['role']=='primary' and support['owner']==paint['owner'] and support['ordinal']==i
    poly=geom(paint);b=box(poly);expected={k:directed(x,k.endswith('1')) for k,x in b.items()};assert exact(expected)==exact(support['bounds']);stats['independentPaintSupports']+=1
    if phase=='untranslated':
     key=owner(support['owner'],own['pass']);g=groups[v['recipe']].setdefault(key,{'owner':key,'bounds':dict(expected),'sourceMemberCount':0});g['sourceMemberCount']+=1
     for k in expected:g['bounds'][k]=(min if k.endswith('0') else max)(g['bounds'][k],expected[k])
   if phase=='untranslated':counts[v['recipe']]['passes']+=1;counts[v['recipe']]['paints']+=len(direct['records']);counts[v['recipe']]['supports']+=len(paints)
   if phase=='destination':evaluation_equal(evaluate(sample['supports'],circle,[0,0]),v['evaluation']);assert v['evaluation']['passed'] and sample['quality']['passed'];stats['destinationPasses']+=1
  if phase=='recipe-complete':
   table=v['table'];rid=table['recipe'];assert table['complete'] and table['sourceVerified'];assert counts[rid]['passes']==table['counts']['passes']==727 and table['counts']['states']==250 and counts[rid]['paints']==table['counts']['paints'];assert len(table['supports'])==len(groups[rid])
   for s in table['supports']:
    g=groups[rid][s['owner']];assert exact(s['bounds'])==exact(g['bounds']) and s['sourceMemberCount']==g['sourceMemberCount'] and s['allMembersContained']
   assert sum(s['sourceMemberCount'] for s in table['supports'])==counts[rid]['supports']==table['counts']['positivePaintSupports'];assert v['resource']['serializedWorkingBytes']<=8388608;summaries[rid]=table;stats['recipesComplete']+=1
  if phase=='complete':
   atlas=v['atlas'];assert len(summaries)==4
   for o in atlas['selection']['outcomes']:
    if 'zero' in o:evaluation_equal(evaluate(summaries[o['recipe']]['supports'],circle,[0,0]),o['zero']['evaluation'])
    for p in o.get('positions',[]):
     if p['status']=='evaluated':evaluation_equal(evaluate(summaries[o['recipe']]['supports'],circle,p['delta']),p['evaluation'])
   winner=atlas['selection']['winner']
   if winner:assert evaluate(summaries[winner['recipe']['id']]['supports'],circle,winner['delta'])['passed'] and atlas['destination']['complete'] and stats['destinationPasses']==727
   assert atlas['bytes']<=8388608
  if phase=='product-frame':product[int(v['n'])]=v['hash']
  if phase=='independent-native-closure-oracle':oracle[int(v['n'])]=v['result']['oracleSHA256'];assert not v['result'].get('wrapperErrors')
  if time.monotonic()-lastlog>25:print(json.dumps({'parentLocalReviewRecords':stats['records'],'phase':phase,'independentPaintSupports':stats['independentPaintSupports']}),flush=True);lastlog=time.monotonic()
 a=native.get('baseline-original',[]);b=native.get('candidate-default',[]);assert len(a)<=250 and b==a[:len(b)]
 if m['complete']:
  assert len(a)==len(b)==250 and atlas and len(product)==250
  assert product==oracle
 for f in m['failedRequests']:
  z=(folder/f['file']).read_bytes();assert len(z)==f['bytes'] and hashlib.sha256(z).hexdigest()==f['sha256'];assert len(gzip.decompress(z))==f['rawBytes']
 result={'state':'PASS_DEFAULT_LIMITED_GEOMETRY' if m['complete'] else 'PASS_STORED_PREFIX_ONLY_PRODUCER_FAILED','producerComplete':m['complete'],'producerErrors':m['errors'],'stats':dict(stats),'phases':dict(phases),'storedJSONBytes':total,'nativeFramesEqual':len(b),'metadataCodecAllValuesRestored':True,'allPositivePaintSupportBoundsIndependentFraction':True,'semanticUnionsIndependent':stats['recipesComplete'],'whole009Complete':False,'allQualityCriteriaIndependentlyRecomputed':False,'staleNegativeCanonicalAndScopeExpansionPending':True,'formalPerformanceAccepted':False,'saveBodyAccepted':False,'publicChecks':0,'parentImages':0,'networkRequests':0};out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':
 out=pathlib.Path(sys.argv[2])
 try:main(pathlib.Path(sys.argv[1]),out)
 except BaseException as e:
  result={'state':'PARENT_LOCAL_REVIEW_FAILED','type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc(),'stats':dict(stats),'publicChecks':0,'parentImages':0};out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(1)
