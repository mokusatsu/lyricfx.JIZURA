from pathlib import Path
import json,gzip,hashlib,math,collections
root=Path('/workspace/lyricfx.JIZURA');w=root/'work/avoid009-balloons-native01';raw=w/'evidence/native02.raw.json.gz';j=json.load(gzip.open(raw,'rt'));assert j['summary']=={'fixtures':8,'calls':222,'controlCases':3,'failures':0,'publicChecks':0} and not j['errors']
count=collections.Counter();maximum=0.;clamp=lambda x:max(0,min(1,x));u32=lambda x:x&0xffffffff
old=(root/'tasks/evidence/AVOID-009/blocks-native01/parent-blocks-native03.py').read_text();exec(old[old.index('def h('):old.index('def close(')])
rng=lambda seed,q,k:h(seed,q,k)/4294967296

def close(a,b):
 global maximum
 maximum=max(maximum,abs(a-b));assert abs(a-b)<3e-10,(a,b)
def samepoints(a,b):
 assert len(a)==len(b)
 for x,y in zip(a,b):
  if isinstance(x,list):samepoints(x,y)
  else:close(x,y)
cleantrace=lambda t:[{k:v for k,v in e.items() if k!='ownership'} for e in t]
for f in j['results']:
 c=f['current'];o=f['original'];assert not c['failures'] and not o['failures'] and not f['parity'];assert c['calls']==o['calls'];spec=c['spec'];seed=spec['seed']
 for row,origin in zip(c['rows'],o['rows']):
  count['rows']+=1;assert row['off']==origin['off'];d,z,s,m=[row[x] for x in ['direct','zero','shifted','moved']];assert not z['recordError'] and not m['recordError'];assert row['off']['hash']==d['hash']==z['hash'] and s['hash']==m['hash'];count['pixelPairs']+=4;assert row['off']['bb']==d['bb'];assert row['off']['staggerReads']==d['staggerReads'];assert cleantrace(row['off']['trace'])==cleantrace(d['trace']);count['nativePaintCommands']+=len(d['trace']);g=d['catalog'];assert g==z['catalog']==s['catalog']
  if spec.get('empty'):assert g is None and d['bb'] is None and not z['events'];count['emptyRows']+=1;continue
  W,H=g['stage'];lt=row['call']['t'];ltb=lt+{'A':.8/24,'B':1.6/24,'main':0}[row['call']['pass']];size=g['nativeSize'];n=g['n'];nr=g['nR'];p=g['params'];assert g['clock']['lt']==lt and g['clock']['ltb']==ltb;assert nr==len(g['rows']) and n==len(g['glyphs'])==len(g['text'].replace(' ',''));assert g['port']==(H>W*1.08);assert size==c['discovery']['catalog']['nativeSize'];close(g['motion'],.65*spec.get('motionScale',1));pout=clamp((lt-(4-.4))/.4);fly=pout*pout*pout*H*.9;close(g['fly'],fly);close(g['out'],1-pout*pout*pout)
  for q,b in enumerate(g['glyphs']):
   count['glyphStates']+=1;assert b['q']==q and b['id']=='balloon.'+str(q);r=g['rows'][b['row']];assert b['ch']==r['chars'][b['slot']];close(r['totalAdvance'],sum(r['advances']));rest=W/2-r['totalAdvance']/2+sum(r['advances'][:b['slot']])+r['advances'][b['slot']]/2;close(b['restX'],rest);yr=H*.4+(b['row']-(nr-1)/2)*size*1.3;close(b['yRow'],yr);ph=rng(seed,q,1)*math.pi*2;close(b['phase'],ph);u0=(rest-W/2)/(r['totalAdvance']/2) if r['totalAdvance']>0 else 0;close(b['u0'],u0);when=.05+q*clamp(4*.3/n) if False else .05+q*max(.03,min(.08,4*.3/n));close(b['t1'],when);e=clamp((lt-when)/.45);close(b['e'],e);assert b['emitted']==(e>0)
   bob=math.sin(ltb*1.4+ph)*size*.05*(.4+g['motion']);x=rest+math.sin(ltb*.9+ph)*size*.03;y=yr-p['arc']*H*(1-u0*u0)+bob+(1-(1-(1-e)**3))*H*.35-fly*(.8+.4*rng(seed,q,2));rot=math.sin(ltb*.8+ph*1.3)*5*(.4+g['motion'])+(rng(seed,q,3)*2-1)*4
   for a,v in [(b['bob'],bob),(b['x'],x),(b['y'],y),(b['rot'],rot)]:close(a,v)
   assert b['col']==g['colors'][p['colOff']%len(g['colors']) if p['mono'] else (q+p['colOff'])%len(g['colors'])]
   if not b['emitted']:continue
   count['emittedGlyphStates']+=1;growth=1+3.2*(e-1)**3+2.2*(e-1)**2;sz=size*(.3+.7*growth);close(b['growth'],growth);close(b['size'],sz);angle=rot*math.pi/180;bx=x-math.sin(angle)*size*.58;by=y+math.cos(angle)*size*.58;samepoints(b['neck'],[bx,by]);ex=W/2+(x-W/2)*.06 if p['tie']=='bunch' else bx+math.sin(ltb*1.1+q)*size*.2;ey=H*.93-fly if p['tie']=='bunch' else min(H*1.05,by+H*.3);samepoints(b['endpoint'],[ex,ey]);points=[]
   for k in range(11):
    t=k/10;wig=math.sin(t*7+ltb*2+q)*size*.05*t*(1-t)*4;points.append([bx+(ex-bx)*t+wig,by+(ey-by)*t+math.sin(t*math.pi)*size*.25])
   samepoints(b['stringPoints'],points);samepoints(b['knotPoints'],[[bx-size*.05,by+size*.07],[bx+size*.05,by+size*.07],[bx,by-size*.02]]);close(b['stringStyle']['alpha'],.85*g['out']*e);close(b['knotStyle']['alpha'],g['out']*e)
   for kind in ['rimItem','bodyItem','glossItem']:
    item=b[kind];assert item['text']==b['ch'] and item['font']==p['font'];close(item['size'],sz);close(item['rot'],rot);close(item['x'],x-(sz*.02 if kind=='glossItem' else 0));close(item['y'],y-(sz*.03 if kind=='glossItem' else 0))
   close(b['rimItem']['stroke'],sz*.13);close(b['bodyItem']['stroke'],sz*.065);assert b['bodyItem']['mi']==b['mi'];samepoints([b['highlight']['x'],b['highlight']['y'],b['highlight']['radius']],[x-sz*.22,y-sz*.26,sz*.045])
  assert len(set(g['primaryOwners']))==len(g['primaryOwners'])==n*6+(p['tie']=='bunch')
  if g['sharedAnchor']:samepoints([g['sharedAnchor']['x'],g['sharedAnchor']['y'],g['sharedAnchor']['radius']],[W/2,H*.93-fly,size*.05])
  for ev in z['events']:
   assert ev['role']=='primary' and ev['owner'] in g['primaryOwners'];assert ev['nativeTransform']['root']==d['root'];count['primaryEvents']+=1
   if row['call']['pass']!='main':assert ev['owner'].endswith('.body')
   for poly in ev['polygons']:assert len(poly)>=3 and all(math.isfinite(v) for xy in poly for v in xy);count['eventVertices']+=len(poly)
  for cb in z['callbacks']:assert cb['live']==cb['owner'].endswith('.gloss');count['liveGlossCallbacks']+=cb['live']
assert count['rows']==222
for c in j['controls']:assert c['equal'] and c['replayEqual'] and c['current']==c['original'];count['otherDControls']+=1
report={'scope':'Native catalog+source fidelity only, not circle avoidance; exact originalstyle/geometry/motion preserved','parentSession':89887,'exit':0,'rawSHA256':hashlib.sha256(raw.read_bytes()).hexdigest(),'counts':dict(count),'maximumIndependentSourceFormulaResidual':maximum,'oldFailuresRetained':'native01 run57194 124 failed assertions; native02 same222calls plus3otherDcontrols pass','humanMotionReviewRequired':False,'humanUnnecessaryReason':'No new placement or visual change; source/native/replay zero and shifted actual pixel equality, original paint/BB/callcounts and independent source formulas sufficient for internal foundation','safeAdapterCountIncrement':0,'codeIntegrated':False,'formalPerformanceAccepted':False,'parentImages':0,'publicChecks':0};dest=root/'tasks/evidence/AVOID-009/balloons-native01';(dest/'parent-native02-review.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
