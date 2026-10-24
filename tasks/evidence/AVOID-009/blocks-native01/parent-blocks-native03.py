import pathlib,json,gzip,math,hashlib
repo=pathlib.Path('/workspace/lyricfx.JIZURA');d=repo/'work/avoid009-blocks-native01';rawpath=d/'evidence/native03.raw.json.gz';r=json.loads(gzip.decompress(rawpath.read_bytes()))
assert not r['errors'] and r['summary']['failures']==0 and len(r['results'])==7
counts={'rows':0,'pixelPairs':0,'sourceBlocks':0,'emittedBlocks':0,'primaryEvents':0,'eventVertices':0,'exactLiveRoots':0,'originalPaintCommands':0}
maximum=0.0;clamp=lambda x:max(0,min(1,x));u32=lambda x:x&0xffffffff
def h(a,b=0,c=0,d=0,e=0):
 q=u32(0x9e3779b9^a);q=u32((q^(q>>16))*0x85ebca6b);q=u32(q+u32((b+0x632be5ab)*0xc2b2ae35));q=u32((q^(q>>13))*0xc2b2ae35)
 q=u32(q+u32((c+0x5bd1e995)*0x27d4eb2f));q=u32((q^(q>>15))*0x165667b1);q=u32(q+u32((d+0x1b873593)*0x85ebca6b));q=u32((q^(q>>16))*0x27d4eb2f)
 q=u32(q+u32((e+0x68e31da4)*0x9e3779b1));q=u32((q^(q>>15))*0x2c1b3c6d);q=u32((q^(q>>12))*0x297a2d39);return u32(q^(q>>15))
def close(a,b,tol=2e-10):
 global maximum
 maximum=max(maximum,abs(a-b));assert abs(a-b)<tol,(a,b)
for case in r['results']:
 c=case['current'];o=case['original'];assert not c['failures'] and not o['failures'] and not case['parity'] and c['sourceState']['unchanged'] and o['sourceState']['unchanged']
 assert c['sourceState']['before']==c['sourceState']['after']
 for row,old in zip(c['rows'],o['rows']):
  call=row['call'];counts['rows']+=1;assert row['off']==old['off']
  direct,zero,shifted,moved=row['direct'],row['zero'],row['shifted'],row['moved']
  assert direct['hash']==row['off']['hash']==zero['hash'] and shifted['hash']==moved['hash'];counts['pixelPairs']+=4
  assert direct['bb']==row['off']['bb']
  clean=lambda trace:[{k:v for k,v in e.items() if k!='ownership'} for e in trace]
  assert clean(direct['trace'])==clean(row['off']['trace']);counts['originalPaintCommands']+=len(direct['trace'])
  g=direct['catalog'];assert g==zero['catalog']==shifted['catalog']
  if c['spec'].get('empty'):
   assert g is None and direct['bb'] is None and not zero['events'];continue
  W,H=g['stage'];lt=call['t'];seed=c['spec']['seed'];n=g['n'];params=g['params'];k=g['k'];rows=len(g['rows'])
  close(k,min(W*.84/(g['per']*1.07+(2 if g['deco'] else 0)*.95+.34),H*.7/(rows*1.02+.34+.2),min(W,H)*.26))
  assert g['port']==(H>W*1.08);close(g['floorY'],H/2+rows*k/2+k*.1)
  hop=-1;hf=0
  if params['hop'] and lt>.3+(n+2)*g['gap']+.3:
   beat=g['hop']['beat']
   if beat and beat['len']>.2:hop=h(seed,beat['index'],4)%n;hf=beat['since']/.32
   else:
    kk=math.floor(g['clock']['ltb']/.65);hop=h(seed,kk,4)%n;hf=(g['clock']['ltb']-kk*.65)/.32
  assert g['hop']['index']==hop;close(g['hop']['fraction'],hf)
  assert sorted(b['painterIndex'] for b in g['blocks'])==list(range(len(g['blocks'])))
  for i,b in enumerate(g['blocks']):
   assert b['sourceIndex']==i and b['id']=='block.'+str(i);counts['sourceBlocks']+=1
   t1=.06+(b['order']+1)*g['gap'];f=(lt-t1)/.3;close(b['t1'],t1);close(b['f'],f);assert b['emitted']==(f>=0)
   if f<0:continue
   counts['emittedBlocks']+=1;kz=k*b['sz'];y=b['y'];sq=1
   if f<1:
    launch=-2*kz-(H-b['y'])*.2;y=launch+(b['y']-launch)*clamp(f)**2
   else:
    tau=(f-1)*.3;y=b['y']-kz*.1*abs(math.sin(tau*14))*math.exp(-tau/.1);sq=1-.1*math.exp(-tau/.05)
   if i==hop and hf<1:y-=kz*.16*math.sin(math.pi*clamp(hf))
   y+=clamp(g['clock']['pOut']*1.4-(b['order']+1)/(n+3)*.4)**2*H*.7
   rot=(h(seed,i,3)/4294967296*2-1)*3 if params['tilt'] and b['r']==0 and rows>1 else 0
   close(b['yNow'],y);close(b['sq'],sq);close(b['rot'],rot);close(b['fontSize'],kz*.6)
   if b['ch'] is not None:
    rad=rot*math.pi/180;matrix=[math.cos(rad),math.sin(rad),-math.sin(rad)*sq,math.cos(rad)*sq,b['x'],y+kz/2]
    for a,z in zip(b['glyphMatrix'],matrix):close(a,z)
   else:assert 'mi' not in b
  for e in zero['events']:
   assert e['role']=='primary' and e['owner'].startswith('blocks.')
   assert e['nativeTransform']['root']==direct['root'];counts['exactLiveRoots']+=1;counts['primaryEvents']+=1
   for polygon in e['polygons']:
    assert len(polygon)>=3 and all(math.isfinite(v) for p in polygon for v in p);counts['eventVertices']+=len(polygon)
assert counts['rows']==147
for c in r['controls']:
 assert c['equal'] and c['parity'] and c['original']==c['current']
 assert c['current']['direct']==c['current']['zero'] and c['current']['shifted']==c['current']['moved']
report={'scope':'Native catalogue/ownership/fidelity ONLY, not avoidance or adapter acceptance','rawSHA256':hashlib.sha256(rawpath.read_bytes()).hexdigest(),'runSession':63389,'exit':0,'counts':counts,'maximumPythonSourceFormulaResidual':maximum,'otherDControls':[x['layout'] for x in r['controls']],'oldFailures':'font01/root02 retained; same original32 root pixel assertions now pass','humanMotionReviewRequired':False,'reason':'Exact native OFF/direct and replay pixel/paint/motion equality; no appearance change to judge','safeAdapterCountIncrement':0,'codeIntegrated':False,'parentImages':0,'publicChecks':0}
out=repo/'tasks/evidence/AVOID-009/blocks-native01';(out/'parent-native03-review.json').write_text(json.dumps(report,indent=2)+'\n');import shutil;shutil.copy2(__file__,out/pathlib.Path(__file__).name);print(json.dumps(report))
