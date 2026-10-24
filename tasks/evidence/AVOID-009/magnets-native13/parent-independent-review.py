import sys,gzip,json,math,re,hashlib,pathlib
raw=pathlib.Path(sys.argv[1]); p=json.load(gzip.open(raw)); counts={}; maxerr=0

def inc(k,n=1):counts[k]=counts.get(k,0)+n

def near(a,b):
 global maxerr
 e=abs(a-b);maxerr=max(maxerr,e);assert e<2e-9,(a,b,e)

def eq(a,b):assert a==b,(a,b)

def hh(a,b=0,c=0,d=0,e=0):
 mask=0xffffffff;h=(0x9e3779b9^int(a))&mask
 h=((h^(h>>16))*0x85ebca6b)&mask;h=(h+(int(b)+0x632be5ab)*0xc2b2ae35)&mask
 h=((h^(h>>13))*0xc2b2ae35)&mask;h=(h+(int(c)+0x5bd1e995)*0x27d4eb2f)&mask
 h=((h^(h>>15))*0x165667b1)&mask;h=(h+(int(d)+0x1b873593)*0x85ebca6b)&mask
 h=((h^(h>>16))*0x27d4eb2f)&mask;h=(h+(int(e)+0x68e31da4)*0x9e3779b1)&mask
 h^=h>>15;h=(h*0x2c1b3c6d)&mask;h^=h>>12;h=(h*0x297a2d39)&mask;h^=h>>15
 return h&mask

def rnd(s,q,k):return hh(s,q,k)/4294967296

def rs(s,q,k):return rnd(s,q,k)*2-1

def clamp(v):return max(0,min(1,v))

def ks(ch):
 if re.search('[㐀-鿿豈-﫿々〆ヶ]',ch):return 1
 if ch in '、。，．,.!?！？…‥・「」『』（）()【】〈〉《》〔〕［］[]\'"“”‘’ー〜～:：;；-—―':return .6
 if ch in 'ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ':return .7
 return .86

for rr in p['results']:
 a,o=rr['current'],rr['original'];spec=a['spec'];W,H=spec['W'],spec['H'];u=min(W,H);s=spec['seed']
 eq(rr['parity'],[]);eq(a['calls'],o['calls']);inc('fixtures')
 for cr,old in zip(a['rows'],o['rows']):
  inc('calls');eq(cr['off'],old['off']);inc('originalModulePairs')
  d=cr['direct'];native=old['off'];eq(d['hash'],native['hash']);eq(d['bb'],native['bb']);eq(d['staggerReads'],native['staggerReads']);inc('nativePixelBBGetterPairs')
  strip=lambda t:[{k:v for k,v in x.items() if k!='ownership'} for x in t]
  eq(strip(d['trace']),strip(native['trace']));inc('fullNativePaintTracePairs')
  g=d['catalog'];call=cr['call'];lt=call['t']
  if spec.get('empty'):eq(g,None);eq(native['trace'],[]);continue
  P=g['params'];base=g['base'];eq(g['port'],H>W*1.08);eq(g['per'],4 if H>W*1.08 else 8);eq(g['nR'],len(g['rows']))
  eq(''.join(x['ch'] for x in g['glyphs']),re.sub(r'\s+','',spec['text']));eq(g['n'],len(g['glyphs']))
  out=1-clamp(g['clock']['pOut'])**3;ba=(1-(1-clamp(lt/.45))**3)*out;near(g['out'],out);near(g['ba'],ba)
  mx,my=W*.04,H*.05;bw,bh=W-mx*2,H-my*2;scene=g['scene'];bo=scene['board'];ha=scene['handle']
  for k,v in {'x':mx,'y':my+(1-ba)*H*.04,'w':bw,'h':bh,'r':u*.03,'alpha':ba,'lineWidth':max(1,u*.002)}.items():near(bo[k],v)
  hh0=bh*.34;hx=mx+bw-u*.05 if P['handle']>0 else mx+u*.035
  for k,v in {'x':hx,'y':H/2-hh0/2,'w':u*.016,'h':hh0,'r':u*.008,'alpha':ba}.items():near(ha[k],v)
  shapes=[x for x in native['trace'] if x['key']=='rrect'];eq(len(shapes),2)
  for meta,ev in zip([bo,ha],shapes):
   for key,v in zip(['x','y','w','h','r','color','alpha','ghost'],ev['args']):
    if isinstance(v,(int,float)) and not isinstance(v,bool):near(meta[key],v)
    else:eq(meta[key],v)
  inc('nativeSceneShapes',2)
  grad=scene['gradient'];hasgrad=call['pass']=='main' and ba>0;eq(grad is not None,hasgrad)
  if grad:
   eq(grad['from'],[mx,my]);eq(grad['to'],[mx+bw,my+bh]);eq([x['offset'] for x in grad['stops']],[0,.45,.5,1]);eq([list(x.values()) for x in grad['stops']],[x['args'] for x in native['trace'] if x['key']=='addColorStop']);near(grad['path']['y'],bo['y']);inc('literalGradientBranches')
  glyphs=[]
  for ri,row in enumerate(g['rows']):
   eq(row['chars'],list(row['text']));near(row['totalAdvance'],sum(row['advances']));eq(row['ks'],[ks(c) for c in row['chars']]);x=W/2-row['totalAdvance']/2;y=H/2+(ri-(g['nR']-1)/2)*base*1.14
   for ch,k,ad in zip(row['chars'],row['ks'],row['advances']):
    cx=x+ad/2;x+=ad
    if ch==' ':continue
    q=len(glyphs);glyphs.append({'ch':ch,'q':q,'x':cx+rs(s,q,1)*base*.04,'y':y+rs(s,q,2)*base*.08+base*k*0,'size':base*k,'rot':rs(s,q,3)*P['tilt'],'col':g['colors'][(q*7+P['colOff'])%len(g['colors'])]})
  items=[x['args'][0] for x in native['trace'] if x['key']=='item'];di=0;D='ABCDEFGHKMNPRSTXYZ0123456789★♥♪?!'
  for i,dec in enumerate(g['decoys']):
   e=clamp((lt-(.05+i*.04))/.2);eq(dec['emitted'],e>0);near(dec['e'],e)
   if e<=0:continue
   top=i%2==0;half=math.ceil(P['decoys']/2);slot=math.floor(i/2);sz=min(base*(.36+(.58-.36)*rnd(s,i,14)),u*.09)
   b0,b1=H/2-g['nR']*base*.62,H/2+g['nR']*base*.62
   lo,hi=(my+bh*.08+sz*.6,max(my+bh*.1+sz*.6,b0-sz*.8)) if top else (min(my+bh*.9-sz*.6,b1+sz*.8),my+bh*.92-sz*.6)
   x=mx+bw*(.1+.8*(slot+.2+.6*rnd(s,i,12))/half);y=lo+(hi-lo)*rnd(s,i,11);k=1+.25*(1-(1-(1-e)**3))
   for key,v in {'size':sz,'k':k,'animatedSize':sz*k,'x':x,'y':y,'rot':rs(s,i,15)*25,'stroke':sz*.08}.items():near(dec[key],v)
   eq(dec['ch'],D[hh(s,i,13)%len(D)]);depth,body=items[di:di+2];di+=2
   for it,xx,yy,al in [(depth,x+sz*.05,y+sz*.07,.28*out*e),(body,x,y,.85*out*e)]:
    for key,v in {'x':xx,'y':yy,'alpha':al,'size':sz*k,'stroke':sz*.08,'rot':rs(s,i,15)*25}.items():near(it[key],v)
    eq(it['text'],dec['ch']);eq(it['font'],P['df'])
   inc('independentDecoyPairs')
  for m,expect in zip(g['glyphs'],glyphs):
   for k,v in expect.items():
    if isinstance(v,(float,int)):near(m[k],v)
    else:eq(m[k],v)
   t1=.18+m['q']*g['gap'];f=(lt-t1)/.16;near(m['t1'],t1);near(m['f'],f);eq(m['emitted'],f>=0);inc('seededGlyphStates')
   if f<0:continue
   snap=1.28-.28*clamp(f)**2 if f<1 else 1-.05*math.exp(-(f-1)*.16/.05)*math.cos((f-1)*3);lift=1-f if f<1 else 0;sz=m['size']*snap
   near(m['snap'],snap);near(m['animatedSize'],sz);depth,body=items[di:di+2];di+=2
   for it,x,y in [(depth,m['x']+m['size']*(.04+lift*.12),m['y']+m['size']*(.06+lift*.18)),(body,m['x'],m['y'])]:
    for key,v in {'x':x,'y':y,'size':sz,'stroke':sz*.08,'rot':m['rot']}.items():near(it[key],v)
    eq(it['text'],m['ch']);eq(it['font'],P['font'])
   near(depth['alpha'],(.3-lift*.15)*out);near(body['mi'],m['mi']);inc('originalNativeLyricDepthBodyPairs')
  eq(di,len(items));inc('nativePaintItems',len(items))
  if 'recordDiagnostic'in cr and call['pass']=='main':
   rd=cr['recordDiagnostic'];eq(rd['recordMeasurementSupported'],False);eq(rd['recordError'],{'code':'UNSUPPORTED_RECORDED_PROGRAM','diagnostics':[{'code':'UNSUPPORTED_DRAW_PROGRAM','message':'Unadapted Canvas operation fill'}]});inc('typedUnsupportedMainPrograms')
report={'raw':str(raw),'rawBytes':raw.stat().st_size,'rawSHA256':hashlib.sha256(raw.read_bytes()).hexdigest(),'sourceOnly':True,'counts':counts,'maximumNumericResidual':maxerr,'rawSummary':p['summary'],'rawErrors':p['errors'],'parentImages':0,'publicChecks':0,'circleOrReplayAccepted':False}
pathlib.Path(sys.argv[2]).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
