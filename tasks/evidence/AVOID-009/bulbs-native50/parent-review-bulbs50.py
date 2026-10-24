"""Parent native fidelity/source sampling review. No image viewing/safety certificate."""
from pathlib import Path
import json,lzma,hashlib,math,collections
R=Path('/workspace/lyricfx.JIZURA');D=R/'tasks/evidence/AVOID-009/bulbs-native50';data=lzma.decompress((D/'bulbs50.raw.json.xz').read_bytes());assert hashlib.sha256(data).hexdigest()=='0f9f49a99834b8b2e60722a4c3b816dbfbc6a9ce3f4e935a6333f67a02ecab0b';v=json.loads(data);assert not v['errors'] and len(v['results'])==15 and len(v['boundaries'])==30
stats=collections.Counter();Ns=set();owners=set();max_error=0.0;functions={}
clamp=lambda x:max(0,min(1,x))
def near(a,b,tol=1e-10):
 global max_error
 assert math.isfinite(a) and math.isfinite(b);e=abs(a-b);max_error=max(max_error,e);assert e<=tol*max(1,abs(a),abs(b)),(a,b,e)
def equal(a,b):
 for k in ['pixelSHA256','root','bb','traceCore','paintCore']:assert a[k]==b[k],k
 stats['independentNativePairs']+=1
def check_catalog(row):
 cat=row['catalog'];assert cat['kind']=='bulbs-native-catalog' and cat['role']=='primary' and cat['independentDecorOwners']==[] and not row['error'];assert all(x['role']=='primary' and x['owner'].startswith('bulbs.sign.') for x in row['paint']);assert cat['root']==row['root'];stats['catalogs']+=1;stats['actualPaintRecords']+=len(row['paint'])
 if row['variant'].get('expectPartial'):
  assert not cat['complete'] and not cat['bounded'] and cat['status']=='partial-budget' and cat['unsupported'];stats['explicitPartialBudget']+=1;return
 assert cat['complete'] and cat['bounded'] and cat['status']=='complete';W,H=cat['environmentSize'];u=min(W,H);assert cat['port']==(H>W*1.08);stats['portrait' if cat['port'] else 'nonportrait']+=1
 p=cat['clock']['pOut'];lt=cat['clock']['lt'];x=clamp(lt/.35);q=(1+2.4*math.pow(x-1,3)+1.4*math.pow(x-1,2))*(1-.1*p*p*p);near(cat['q'],q);near(cat['out'],1-p*p*p);assert cat['culled']==(cat['q']<=.01 or cat['out']<=0)
 if cat['culled']:assert not cat['sourceCalls'] and not row['paint'];stats['culled']+=1;return
 near(cat['r'],max(4,min(u*.022,cat['size']*.075)));assert cat['ringInsets']==([.95,.86]if cat['params']['shape']=='double' and not cat['arrow']else[.93 if cat['arrow']else.95]);assert len(cat['rings'])==len(cat['ringInsets']);expectedOwners=['bulbs.sign.shadow','bulbs.sign.face','bulbs.sign.outline'];traces=collections.defaultdict(list)
 for t in row['trace']:traces[(t['owner'],t['kind'])].append(t)
 face=traces[('bulbs.sign.face','poly')];assert len(face)==1 and face[0]['args'][0]==cat['sp'] and face[0]['args'][1]==cat['board'];near(face[0]['args'][2],cat['out'])
 shadow=traces[('bulbs.sign.shadow','poly')];assert len(shadow)==1
 for actual,(sx,sy)in zip(shadow[0]['args'][0],cat['sp']):near(actual[0],sx+u*.012);near(actual[1],sy+u*.016)
 near(shadow[0]['args'][2],.3*cat['out'])
 for ri,ring in enumerate(cat['rings']):
  pts=ring['insetPoints'];seg=[math.hypot(pts[(i+1)%len(pts)][0]-a[0],pts[(i+1)%len(pts)][1]-a[1])for i,a in enumerate(pts)];L=sum(seg);d=cat['r']*3.3;N=max(4,min(140,math.floor(L/d+.5)));assert ring['N']==N==len(ring['points'])==len(ring['lights']);assert ring['ri']==ri and ring['k']==cat['ringInsets'][ri];near(ring['spacing'],d);near(ring['totalLengthRecomputedMetadata'],L);assert len(seg)==len(ring['segmentsRecomputedMetadata'])
  for a,b in zip(seg,ring['segmentsRecomputedMetadata']):near(a,b)
  Ns.add(N);stats['rings']+=1;si=0;acc=0;step=L/N
  for i,point in enumerate(ring['points']):
   dist=i*step
   while si<len(seg)-1 and acc+seg[si]<dist:acc+=seg[si];si+=1
   a,b=pts[si],pts[(si+1)%len(pts)];f=(dist-acc)/seg[si]if seg[si]>0 else 0
   near(point[0],a[0]+(b[0]-a[0])*f);near(point[1],a[1]+(b[1]-a[1])*f);light=ring['lights'][i];assert light['i']==i and light['N']==N and light['fraction']==i/N and light['p']==point
   t=clamp((lt-.1-ri*.1)/.6);ease=4*t*t*t if t<.5 else 1-math.pow(-2*t+2,3)/2;on=i/N<ease and i/N>=p*p*p;assert light['on0']==on;lit=0
   if on:
    j=(i*cat['params']['dir']+N*4)%N;assert light['j']==j
    if cat['params']['chase']=='chase':lit=1 if(j+(0 if ri else 1)-math.floor(cat['clock']['ltb']*9)+900)%3==0 else .18
    elif cat['params']['chase']=='alt':lit=1 if(i+math.floor(cat['clock']['ltb']*3)+ri)%2 else .2
    else:lit=.2+.8*math.pow(.5+.5*math.sin(i/N*(2*math.pi)*3-cat['clock']['ltb']*5*cat['params']['dir']+ri),2)
    beat=cat['clock'].get('beat');lit=max(lit,1 if beat and beat['since']<.12 else 0)
   else:assert light['j']is None
   near(light['lit'],lit);assert light['halo']==light['glint']==(light['lit']>.5);base='bulbs.sign.ring.'+str(ri)+'.state.'+str(N)+'.'+str(i)
   for suffix in(['halo']if light['halo']else[])+['bulb']+(['glint']if light['glint']else[]):
    owner=base+'.'+suffix;expectedOwners.append(owner);trace=traces[(owner,'circle')];assert len(trace)==1;args=trace[0]['args'];r=cat['r'];expected=[point[0],point[1],r]
    if suffix=='halo':expected[2]=r*2.1;near(args[6],.16*light['lit']*cat['out'])
    elif suffix=='glint':expected=[point[0]-r*.25,point[1]-r*.3,r*.35];assert args[3]=='#FFFFFF';near(args[6],.7*light['lit']*cat['out'])
    else:near(args[6],cat['out'])
    for a,b in zip(args[:3],expected):near(a,b)
   stats['independentResampleAndLightPoints']+=1
 expectedOwners.append('bulbs.sign.lyric');lyric=traces[('bulbs.sign.lyric','mainDraw')];assert len(lyric)==1
 for k in ['text','font','size','x','y','track','lead']:assert lyric[0]['args'][0][k]==cat['lyric'][k]
 if cat['subT']:
  expectedOwners.append('bulbs.sign.subtitle');sub=cat['subtitle'];b=sub['original'].encode('utf-16-le','surrogatepass');text=(b[:54].decode('utf-16-le','surrogatepass')+'…')if len(b)//2>28 else sub['original'];assert sub['original']==cat['subT'] and sub['text']==text and sub['UTF16Length']==len(b)//2 and sub['truncated']==(len(b)//2>28);ss=traces[('bulbs.sign.subtitle','draw')];assert len(ss)==1
  for k in ['text','size','x','y']:assert ss[0]['args'][0][k]==sub[k]
  stats['subtitle']+=1;stats['truncatedSubtitle']+=sub['truncated']
 assert [c['owner']for c in cat['sourceCalls']]==expectedOwners==cat['primaryOwners'];assert [c['ordinal']for c in cat['sourceCalls']]==list(range(len(expectedOwners)));assert all(x['role']=='primary'for x in cat['sourceCalls']);assert {p['owner']for p in row['paint']}<=set(expectedOwners);owners.update(expectedOwners);stats['sourceOwnedCalls']+=len(expectedOwners)
for fixture in v['results']:
 assert len(fixture['pair'])==2 and all('value'in p for p in fixture['pair']);a,b=[p['value']for p in fixture['pair']];assert a['sourcePlan']==b['sourcePlan'] and a['params']==b['params'] and a['otherD']==b['otherD'] and a['wholeFrames']==b['wholeFrames'];assert not a['adapterRegistered'] and not b['adapterRegistered'] and a['sourceUnchanged'] and b['sourceUnchanged'];assert len(a['calls'])==len(b['calls'])==57;stats['wholeFramePairs']+=len(a['wholeFrames']);stats['unrelatedD']+=len(a['otherD']);functions[fixture['spec']['id']]=[hashlib.sha256(p['nativeSourceFunction'].encode()).hexdigest()for p in [a,b]]
 for x,y in zip(a['calls'],b['calls']):equal(x['off'],y['off']);equal(x['off'],y['on']);check_catalog(y['on'])
for row in v['boundaries']:
 if 'probes'in row:
  assert len(row['search'])==18 and len(row['probes'])==6 and row['lo']<row['hi']
  for p in row['probes']:equal(p['before'],p['after']);check_catalog(p['after']);stats['boundaryPairs']+=1
  stats['finiteQBrackets'if row['kind'].startswith('source q')else'finiteNBrackets']+=1
 else:stats['NTransitionNotObserved']+=1
assert stats['explicitPartialBudget']==15 and stats['wholeFramePairs']==120 and stats['unrelatedD']==45;assert len({x[0]for x in functions.values()})==len({x[1]for x in functions.values()})==1
report={'state':'PARENT_ISOLATED_NATIVE50_FIDELITY_ACCEPTED_NO_TRANSPORT_ADAPTER_OR_MAIN','exactJSONSHA256':hashlib.sha256(data).hexdigest(),'fixtures':15,'stats':dict(stats),'observedNMin':min(Ns),'observedNMax':max(Ns),'observedNDistinct':len(Ns),'ownerIDsAcrossObservedNStates':len(owners),'maxIndependentNumericResidual':max_error,'numericResidualMeaning':'samplednativeformula/resampledoublemath only, tolerance1e-10relative, NOT safetycertificate','actualPaintAndSourceCallsComparedToIndependentOriginal':True,'helpersAndSourcePlanUnchanged':True,'humanMotionReviewRequired':False,'humanReviewReason':'isolatedmetadata/ownership only; allsampledoriginalpixels/calls unchanged; no newappearance/mainintegration','transportTested':False,'adapterAdded':False,'canonicalProductChanged':False,'formalPerformanceAccepted':False,'publicChecks':0,'parentImagesViewed':0};(D/'parent-review50.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
