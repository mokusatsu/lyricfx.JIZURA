from pathlib import Path
import json,gzip,hashlib,math,collections,struct
root=Path('/workspace/lyricfx.JIZURA');p=Path('/tmp/avoid009-balloons-zero10/evidence/zero10.raw.json.gz');b=p.read_bytes();assert hashlib.sha256(b).hexdigest()=='56685470948bb6f3e7bcc62cfdacc80bd9f1ba5e97b8b74a2091969895fd0780';d=json.loads(gzip.decompress(b));assert not d['errors']
old=(root/'tasks/evidence/AVOID-009/blocks-native01/parent-blocks-native03.py').read_text();exec(old[old.index('def h('):old.index('def close(')])
u32=lambda x:x&0xffffffff;rng=lambda s,q,k:h(s,q,k)/4294967296;clamp=lambda x:max(0,min(1,x));cnt=collections.Counter();maxerr=0
base=Path('/tmp/parent-balloons-diagnostic03.py').read_text();exec(base[base.index('def first('):base.index('out=[]; counts=')])
def close(a,b):
 global maxerr
 maxerr=max(maxerr,abs(a-b));assert abs(a-b)<2e-8,(a,b)
def hull(ps):
 ps=sorted(set(tuple(p) for p in ps))
 def cross(o,a,b):return(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
 def half(ps):
  q=[]
  for p in ps:
   while len(q)>1 and cross(q[-2],q[-1],p)<=0:q.pop()
   q.append(p)
  return q
 return half(ps)[:-1]+half(ps[::-1])[:-1]
def delta(recipe,q,f=None):
 dg=recipe['offset'] if recipe['kind']=='translation' else [0,0] if q is None else recipe['left'] if q<2 else recipe['right']
 return dg if f is None or recipe['kind']=='translation' else [(1-f)*dg[0],(1-f)*dg[1]]
def shift(poly,v):return [[p[0]+v[0],p[1]+v[1]]for p in poly]
def moved(e,rec):
 return hull([p for pp,f in zip(e['endpointPolygons'],e['fractions']) for p in shift(pp,delta(rec,e['q'],f))]) if 'endpointPolygons'in e else shift(e['polygon'],delta(rec,e['q']))
reports=[]
for row in d['results']:
 cur=row['current'];cert=cur['certificate'];g=cert['sourceCatalog'];cut=cert['sourceCut'];rec=cert['recipe'];W,H=g['stage'];led=cert['ledger'];cnt['cases']+=1
 assert not cur['errors'];assert cut['dur']==cut['end']==4 and cur['clock']['duration']==4.150001
 assert cur['clock']['step']==1/cur['clock']['fps'];assert cur['clock']['koma']==0
 assert cert['domain']['rootOperationBudget']==128 and cert['zeroDeltaSupportExact'];assert cert['version']==2 and cert['revision']=='balloons-native-stage-v2' and cert['nativeBundleEndPolicy']
 mn=math.floor(g['nativeSize']*.3*100)-1;mx=math.ceil(g['nativeSize']*1.1078356481481482*100)+1
 assert cert['metricKeys']==(mx-mn+1)*len(set(v['ch']for v in g['glyphs']))
 for m in cert['metricReceipts']:assert m['digestSHA256'] is None and m['digestOmitted'] and m['count']==mx-mn+1 and m['minBin']==mn and m['maxBin']==mx
 cnt['metricKeys']+=cert['metricKeys'];rs=cert['branches']['ranges'];assert rs[0]['lo']==0 and rs[-1]['hi']==math.nextafter(4,-math.inf)
 for a,z in zip(rs,rs[1:]):assert math.nextafter(a['hi'],math.inf)==z['lo']
 for v,br in zip(g['glyphs'],cert['branches']['branches']):
  ee=lambda t:clamp((t-v['t1'])/.45);assert br['onset']==first(lambda t:ee(t)>0) and br['held']==first(lambda t:ee(t)>=1)
  delay=int(max(0,v['t1'])/max(.005,cut['stagger'] or .04))*(cut['stagger']or 0);assert br['body']==first(lambda t:t-delay>=0)
 cc=cert['region']['circle'];rad=cc['r']+max(2,.005*min(W,H));idx=collections.defaultdict(list);full=relaxed=0
 for e in led:
  idx[(e['owner'],e['pass'])].append(e);poly=moved(e,rec)
  assert all(0<=p[0]<=W and(p[1]>=0 or e['phase']['exit'])and(p[1]<=H or e['phase']['entry'])for p in poly)
  if intersects(poly,cc['cx'],cc['cy'],rad):
   full+=1;assert rec['circleMode']!='full' and(e['phase']['entry']or e['phase']['exit']);relaxed+=1
 assert cert['retentionTail']['remainingSupports']==0 and cert['retentionTail']['endExpired']
 for q in cert['retentionTail']['selectorAtEnd']:
  tq=math.floor(cert['region']['end']/cur['clock']['step']+1e-6)*cur['clock']['step'];close(q['tq'],tq);close(q['tp'],tq-q['lag']);assert q['tp']>=4 and not q['active']
 for f,ref in zip(cur['frames'],row['independentReference']['rows']):
  assert f['hash']==ref['hash'] and not f['error'];cnt['framePixelPairs']+=1
  if f['t']>=4.125:assert f['counts']['passes']==0,(cur['spec'],f['t'])
  cnt['testedSourcePasses']+=f['counts']['passes'];cnt['testedPhysicalPieces']+=f['counts']['pieces']
  for ob in f['detailed']:
   cnt['detailedPasses']+=1;lt=ob['lt'];lb=ob['ltb'];lag={'A':.8/24,'B':1.6/24,'main':0}[ob['pass']];tq=math.floor(f['t']/cur['clock']['step']+1e-6)*cur['clock']['step'];close(lt,max(0,tq-lag));close(lb,lt+lag);assert lt<4
   ng=ob['nativeGeometry'];N=ng['nativeSize'];pout=clamp((lt-3.6)/.4);fly=pout**3*H*.9;close(ng['fly'],fly)
   for q,v in enumerate(ng['glyphs']):
    src=g['glyphs'][q];assert v['ch']==src['ch'] and v['row']==src['row'] and v['slot']==src['slot'];e=clamp((lt-v['t1'])/.45);phase=rng(g['seed'],q,1)*2*math.pi;close(v['phase'],phase)
    xx=v['restX']+math.sin(lb*.9+phase)*N*.03;yy=v['yRow']-ng['params']['arc']*H*(1-v['u0']**2)+math.sin(lb*1.4+phase)*N*.05*(.4+ng['motion'])+(1-e)**3*H*.35-fly*(.8+.4*rng(g['seed'],q,2));rot=math.sin(lb*.8+phase*1.3)*5*(.4+ng['motion'])+(rng(g['seed'],q,3)*2-1)*4
    close(v['x'],xx);close(v['y'],yy);close(v['rot'],rot);assert v['emitted']==(e>0);cnt['nativeGlyphStates']+=1
    if e<=0:continue
    bx=xx-math.sin(rot*math.pi/180)*N*.58;by=yy+math.cos(rot*math.pi/180)*N*.58;ex=W/2+(xx-W/2)*.06;ey=H*.93-fly
    for k,pt in enumerate(v['stringPoints']):
     ff=k/10;px=bx+(ex-bx)*ff+math.sin(ff*7+lb*2+q)*N*.05*ff*(1-ff)*4;py=by+(ey-by)*ff+math.sin(ff*math.pi)*N*.25;close(pt[0],px);close(pt[1],py);cnt['nativeStringPoints']+=1
   for ev in ob['events']:
    assert ev['callbackRetained']==(ev['kind']=='item' and ev['owner'].endswith('.gloss'));cnt['sourcePaintEvents']+=1
   rootm=ob['originalRoot'];scale=ob['renderScale'];wa={w['owner']:w for w in ob['transportWitnesses']}
   for owner,w in wa.items():
    q=int(owner.split('.')[2]);assert len(w['originalPoints'])==len(w['corrections'])==11
    assert w['originalPoints']==ng['glyphs'][q]['stringPoints']
    assert w['nativeEndpointWorld']==w['correctedEndpointWorld'] and w['endpointPreserved'];assert w['corrections'][10]['next']==w['originalPoints'][10];
    for k,(p,corr)in enumerate(zip(w['originalPoints'],w['corrections'])):
     dd=delta(rec,q,k/10);close(corr['stage'][0],dd[0]);close(corr['stage'][1],dd[1]);n=corr['next'];local=[n[0]-p[0],n[1]-p[1]]
     close((rootm[0]*local[0]+rootm[2]*local[1])/scale,dd[0]);close((rootm[1]*local[0]+rootm[3]*local[1])/scale,dd[1]);assert max(map(abs,n))<=8*max(W,H);cnt['correctedStringPoints']+=1
   for piece in ob['observations']:
    support=[e for e in idx[(piece['owner'],ob['pass'])] if e['sourceRange'][0]<=lt<=e['sourceRange'][1]];assert len(support)==1;bound=moved(support[0],rec)
    for poly in piece['polygons']:
     if '.string.' in piece['owner']:
      lineOwner,ks=piece['owner'].rsplit('.',1);k=int(ks);ev=next(v for v in ob['events'] if v['owner']==lineOwner);q=int(lineOwner.split('.')[2]);pts=[z['next'] for z in wa[lineOwner]['corrections']] if lineOwner in wa else ev['args'][0];guard=ev['args'][2]*5;expectedPts=[];off=delta(rec,q) if rec['kind']=='translation' else [0,0]
      for pt in [pts[k],pts[k+1]]:
       for ax in [-guard,guard]:
        for ay in [-guard,guard]:
         xx=rootm[0]*(pt[0]+ax)+rootm[2]*(pt[1]+ay)+rootm[4];yy=rootm[1]*(pt[0]+ax)+rootm[3]*(pt[1]+ay)+rootm[5]
         for aa in [-1,1]:
          for ab in [-1,1]:expectedPts.append([(xx+aa)/scale+off[0],(yy+ab)/scale+off[1]])
      expectedHull=hull(expectedPts);assert all(incl(v,poly) for v in expectedPts) and all(incl(v,expectedHull) for v in poly);cnt['independentPhysicalStringSegments']+=1
     assert all(incl(p,bound)for p in poly);assert all(0<=p[0]<=W and(p[1]>=0 or support[0]['phase']['exit'])and(p[1]<=H or support[0]['phase']['entry'])for p in poly)
     clear=not intersects(poly,cc['cx'],cc['cy'],rad);assert clear==piece['clear'];assert clear or not piece['circleStrict'];cnt['actualPieceVertices']+=len(poly)
    cnt['actualPieces']+=1
 for z in cur['zero']:assert z['native']['hash']==z['replay']['hash'];cnt['zeroPixelPairs']+=1
 assert row['nativeOriginal']==row['nativeAfter'];cnt['nativeNoAdapterPixelPairs']+=1
 assert cur['decoded']['valuesEqual'] and cur['decoded']['error'] is None and cur['decoded']['tamperCode']=='BALLOONS_DECODED_PROOF';assert cur['decoded']['cacheAfter']['hits']>cur['decoded']['cacheBefore']['hits']
 assert cur['stale']['identitySame'] and cur['stale']['staleLabel']==cur['stale']['staleHelper']=='BALLOONS_STALE_DEPENDENCY' and cur['stale']['restoredCode'] is None
 assert cur['stale']['fontControl']['newCertificate'] and cur['stale']['fontControl']['newRenderCode']is None
 assert cur['decoded']['oldRevisionCode']=='STALE_D_ADAPTER';assert cur['attachmentChecks']['maximumEndpointResidual']==cur['attachmentChecks']['maximumAnchorResidual']==0
 reports.append({'fixture':cur['spec']['id'],'attachmentChecks':cur['attachmentChecks'],'recipe':rec,'continuousSupports':len(led),'fullCircleSupportIntersections':full,'sourceMovingOnlySupportIntersections':relaxed,'metricScanMilliseconds':cur['metricScanMilliseconds'],'coldFinalizeMilliseconds':cur['finalizeMilliseconds'],'formalPerformanceAccepted':False})
assert len(d['negative'])==4 and not any(x['hasCertificate']for x in d['negative']);assert d['negative'][-1]['safety']=='insufficient-space' and d['negative'][-1]['runtimeCode']=='BALLOONS_COMPOSITION_EXCLUDED' and d['negative'][-1]['blankAfter']
report={'kind':'parent-independent-zero10-review','rawSHA256':hashlib.sha256(b).hexdigest(),'parentRun':92285,'exit':0,'counts':dict(cnt),'maximumNumericResidual':maxerr,'results':reports,'negativeControls':4,'limits':['Bounded1cut/onewholeextendedregion/nativebunch1or4 only; originalfree4 unsupported.','Declared128binary32 numerical model, not universal Canvas theorem.','No fullmetric digest; allbins rebuild and freshsupport equality exercised in reviewed runner.','Detailed raw contains selected frames; alltested123frame pixels compare independent nativepaint; all249mediaframes pending.','Formalperformance/savebody/humanmotion/mainintegration not accepted.'],'publicChecks':0,'parentImages':0}
p=root/'work/avoid009-balloons-zero10/evidence/parent-independent-raw10.json';p.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
