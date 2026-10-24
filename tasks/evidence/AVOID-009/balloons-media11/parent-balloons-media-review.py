from pathlib import Path
import json,gzip,hashlib,math,collections,struct,sys
root=Path('/workspace/lyricfx.JIZURA');base=Path(sys.argv[1]);factor=float(sys.argv[2]);dest=Path(sys.argv[3]);counts=collections.Counter();maxerr=0.;maxvel=0.
helper=Path('/tmp/parent-balloons-diagnostic03.py').read_text();exec(helper[helper.index('def incl('):helper.index('out=[]; counts=')]);old=(root/'tasks/evidence/AVOID-009/blocks-native01/parent-blocks-native03.py').read_text();exec(old[old.index('def h('):old.index('def close(')]);u32=lambda x:x&0xffffffff;rng=lambda s,q,k:h(s,q,k)/4294967296;clamp=lambda x:max(0,min(1,x))
s=Path('/tmp/parent-balloons-adapter05.py').read_text();exec(s[s.index('def hull('):s.index('def delta(')])
def close(a,b):
 global maxerr
 maxerr=max(maxerr,abs(a-b));assert abs(a-b)<2e-8,(a,b)
def dd(rec,q,f=None):
 d=rec['offset']if rec['kind']=='translation'else[0,0]if q is None else rec['left']if q<2 else rec['right']
 return d if f is None or rec['kind']=='translation'else[(1-f)*d[0]+f*factor*d[0],(1-f)*d[1]]
def shift(poly,d):return[[p[0]+d[0],p[1]+d[1]]for p in poly]
def move(e,rec):return hull([p for ps,f in zip(e['endpointPolygons'],e['fractions'])for p in shift(ps,dd(rec,e['q'],f))])if'endpointPolygons'in e else shift(e['polygon'],dd(rec,e['q']))
def world(M,p):return[M[0]*p[0]+M[2]*p[1]+M[4],M[1]*p[0]+M[3]*p[1]+M[5]]
m=json.loads((base/'manifest.json').read_text());assert not m['errors'];assert m['capture']['fps']==60 and m['capture']['frames']==249 and m['capture']['circleBurnedIn']==False
sides={}
for side in ['before','after']:
 pin=m['sides'][side];raw=base/pin['raw'];assert hashlib.sha256(raw.read_bytes()).hexdigest()==pin['rawSHA256'];data=json.load(gzip.open(raw,'rt'));sides[side]=data;assert len(data['frames'])==len(data['reference']['rows'])==249 and not data['pageErrors']
 video=base/'public'/pin['video'];assert hashlib.sha256(video.read_bytes()).hexdigest()==pin['videoSHA256'];v=pin['probe']['streams'][0];assert(v['width'],v['height'],v['r_frame_rate'],v['avg_frame_rate'],v['sample_aspect_ratio'],int(v['nb_read_frames']))==(960,540,'60/1','60/1','1:1',249);assert abs(float(pin['probe']['format']['duration'])-4.15)<1e-8;assert len(pin['probe']['streams'])==1
 for n,(f,ref)in enumerate(zip(data['frames'],data['reference']['rows'])):
  assert f['frame']==n and f['time']==n/60 and f['pixelHash']==ref['hash']==f['independentReferenceHash'];assert not f['errors']and not f['warnings'];counts['independentNativePaintPixelPairs']+=1
  if n in m['capture']['keys']:
   p=base/'evidence/images'/f'{side}-{n:03}.png';bs=p.read_bytes();assert hashlib.sha256(bs).hexdigest()==f['nativePNGHash'];assert struct.unpack('>II',bs[16:24])==(960,540);counts['selectedNativePNGs']+=1
 assert not data['tail']['errors'] and not data['tail']['observations']
a,b=sides['before'],sides['after'];assert a['initial']['sourceCut']==b['initial']['sourceCut'];pa,pb=a['initial']['plan'],b['initial']['plan'];assert set(k for k in set(pa)|set(pb)if pa.get(k)!=pb.get(k))=={'cuts','placementFinalization'}
cut=b['initial']['sourceCut'];assert cut['dur']==cut['end']==4 and cut['params']['tie']=='bunch';assert a['initial']['clocks']==b['initial']['clocks']=={'fps':60,'koma':0,'step':1/60,'horizon':4.150001,'cutDuration':4}
cert=pb['cuts'][0]['placementTrajectory']['certificate'];rec=cert['recipe'];assert rec['kind']=='two-group-stage';assert cert['version']==(2 if factor==0 else 1);c=cert['region']['circle'];R=c['r']+2.7;idx=collections.defaultdict(list)
for e in cert['ledger']:idx[(e['owner'],e['pass'])].append(e)
assert a['frames'][0]['pixelHash']==b['frames'][0]['pixelHash'];last={};prev={};actual_relaxed=0
for bf,af in zip(a['frames'],b['frames']):
 assert len(bf['observations'])==len(af['observations']);counts['framePairs']+=1
 for bo,ao in zip(bf['observations'],af['observations']):
  assert bo['pass']==ao['pass'];assert bo['nativeGeometry']==ao['nativeGeometry'];assert bo['root']==ao['originalRoot'];counts['sameNativeCatalogAndRootPassPairs']+=1;pass_=ao['pass'];last[pass_]=af['frame'];ng=ao['nativeGeometry'];M=ao['originalRoot'];lt=ao['lt'];lb=ao['ltb'];lag={'A':.8/24,'B':1.6/24,'main':0}[pass_];tq=math.floor(af['time']/(1/60)+1e-6)*(1/60);close(lt,max(0,tq-lag));close(lb,lt+lag);assert lt<4;N=ng['nativeSize'];pout=clamp((lt-3.6)/.4);fly=pout**3*540*.9;close(ng['fly'],fly)
  for q,g in enumerate(ng['glyphs']):
   phase=rng(ng['seed'],q,1)*2*math.pi;e=clamp((lt-g['t1'])/.45);xx=g['restX']+math.sin(lb*.9+phase)*N*.03;yy=g['yRow']-ng['params']['arc']*540*(1-g['u0']**2)+math.sin(lb*1.4+phase)*N*.05*(.4+ng['motion'])+(1-e)**3*540*.35-fly*(.8+.4*rng(ng['seed'],q,2));rot=math.sin(lb*.8+phase*1.3)*5*(.4+ng['motion'])+(rng(ng['seed'],q,3)*2-1)*4;close(g['x'],xx);close(g['y'],yy);close(g['rot'],rot);counts['independentNativeGlyphStates']+=1
  byowner={e['owner']:e for e in ao['events']};wa={w['owner']:w for w in ao['transportWitnesses']}
  for owner,w in wa.items():
   q=int(owner.split('.')[2]);assert w['originalPoints']==ng['glyphs'][q]['stringPoints']
   for k,(original,corr)in enumerate(zip(w['originalPoints'],w['corrections'])):
    oldp=world(M,original);newp=world(M,corr['next']);d=dd(rec,q,k/10);close(newp[0]-oldp[0],d[0]);close(newp[1]-oldp[1],d[1]);counts['constantStageStringPointChecks']+=1
    key=(pass_,q,k)
    if key in prev:
     oldprev,newprev=prev[key]
     for j in[0,1]:
      err=abs((newp[j]-newprev[j])-(oldp[j]-oldprev[j]));maxvel=max(maxvel,err);assert err<2e-8;counts['nativePointDisplacementChecks']+=1
    prev[key]=(oldp,newp)
   if factor==0:assert w['endpointPreserved']and w['nativeEndpointWorld']==w['correctedEndpointWorld']and w['corrections'][10]['next']==w['originalPoints'][10];counts['exactNativeBundleEnds']+=1
  anchor=byowner.get('balloons.anchor')
  if anchor:
   ag=ng['sharedAnchor'];assert anchor['args'][0]==ag['x']and anchor['args'][1]==ag['y'];counts['exactNativeAnchorSamples']+=1
  for ev in ao['events']:assert ev['callbackRetained']==(ev['kind']=='item'and ev['owner'].endswith('.gloss'));counts['originalPaintEvents']+=1
  for piece in ao['observations']:
   supports=[x for x in idx[(piece['owner'],pass_)]if x['sourceRange'][0]<=lt<=x['sourceRange'][1]];assert len(supports)==1;support=supports[0];bound=move(support,rec)
   if support['phase']['entry']:assert support['q']is not None and 0<ng['glyphs'][support['q']]['e']<1
   if support['phase']['exit']:assert 0<pout<1
   for poly in piece['polygons']:
    assert all(incl(p,bound)for p in poly);assert all(0<=p[0]<=960 and(p[1]>=0 or support['phase']['exit'])and(p[1]<=540 or support['phase']['entry'])for p in poly);clear=not intersects(poly,c['cx'],c['cy'],R);assert clear==piece['clear'];assert clear or not piece['circleStrict'];actual_relaxed+=not clear
    if '.string.'in piece['owner']:
     owner,ks=piece['owner'].rsplit('.',1);k=int(ks);pts=[t['next']for t in wa[owner]['corrections']];ev=byowner[owner];guard=ev['args'][2]*5;verts=[]
     for p in [pts[k],pts[k+1]]:
      for dx in [-guard,guard]:
       for dy in [-guard,guard]:
        wp=world(M,[p[0]+dx,p[1]+dy])
        for ax in[-1,1]:
         for ay in[-1,1]:verts.append([wp[0]+ax,wp[1]+ay])
     hh=hull(verts);assert all(incl(p,poly)for p in verts)and all(incl(p,hh)for p in poly);counts['independentPhysicalStringSegments']+=1
    counts['actualPhysicalVertices']+=len(poly)
   counts['actualPhysicalPieces']+=1
assert last=={'B':244,'A':241,'main':239},last
report={'kind':'parent-all-native60frames-review','inputRoot':str(base),'manifestSHA256':hashlib.sha256((base/'manifest.json').read_bytes()).hexdigest(),'endpointFactor':factor,'sourceProduct':m['sourceProduct'],'nativeSourceCutAllKeysEqual':True,'globalPlansDifferOnlyExpectedPlacement':True,'initialFramePixelsEqual':True,'counts':dict(counts),'lastSelectedFrameByPass':last,'maximumNumericResidual':maxerr,'maximumNativePointDisplacementResidual':maxvel,'actualMovingCircleIntersectionPieces':actual_relaxed,'numericReviewPassed':True,'visualState':'WITHHELD_VISUAL_ATTACHMENT_GAP_NOT_HUMAN_APPROVED'if factor else'NEW_VISUAL_REVIEW_PENDING','humanMotionApproved':False,'formalPerformanceAccepted':False,'parentImages':0,'publicChecks':0};dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
