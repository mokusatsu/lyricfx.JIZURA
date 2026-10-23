import pathlib,json,hashlib,math
p=pathlib.Path('/tmp/avoid009-pile01/run02/raw.json');j=json.loads(p.read_text());near=lambda a,b:math.isclose(a,b,rel_tol=2e-12,abs_tol=2e-8)
def eq(a,b):assert near(a,b),(a,b)
def clamp(v,a=0,b=1):return max(a,min(b,v))
def h(a,b=0,c=0,d=0,e=0):
 mask=2**32-1;x=(0x9e3779b9^(int(a)&mask))&mask;x=((x^(x>>16))*0x85ebca6b)&mask;x=(x+(int(b)+0x632be5ab)*0xc2b2ae35)&mask;x=((x^(x>>13))*0xc2b2ae35)&mask;x=(x+(int(c)+0x5bd1e995)*0x27d4eb2f)&mask;x=((x^(x>>15))*0x165667b1)&mask;x=(x+(int(d)+0x1b873593)*0x85ebca6b)&mask;x=((x^(x>>16))*0x27d4eb2f)&mask;x=(x+(int(e)+0x68e31da4)*0x9e3779b1)&mask;x^=x>>15;x=(x*0x2c1b3c6d)&mask;x^=x>>12;x=(x*0x297a2d39)&mask;x^=x>>15;return x
r=lambda *a:h(*a)/2**32
rs=lambda *a:2*r(*a)-1
counts={'offPairs':0,'directPixelTracePairs':0,'nativeCatalogs':0,'moundVertices':0,'heapGlyphs':0,'slots':0,'dust':0,'actualHeapGlyphMapMatches':0,'retainedReplayPixelFailures':0}
for q in j['off']:
 assert q['equal'] and q['after']==q['before'];counts['offPairs']+=1
for row in j['native']:
 for a,b in zip(row['after'][:2],row['before']):
  assert a['hash']==b['hash'] and a['trace']==b['trace'];assert a['frozen'] and a['ownershipRestored'] and a['sourceBefore']==a['sourceAfter'];counts['directPixelTracePairs']+=1
 g=row['after'][0]['geometry'];W,H,size,nR,seed=g['W'],g['H'],g['size'],g['nR'],g['seed'];lt=g['lt'];pm=g['params'];counts['nativeCatalogs']+=1
 eq(g['yBase'],1.04*H);eq(g['Hm'],g['yBase']-(H*(.5+pm['hgt']*.25)+nR*size*.49));eq(g['rise'],(1-clamp(lt/.5))**3*g['Hm']*1.1+clamp(g['pOut'])**3*g['Hm']*.5);eq(g['out'],1-clamp(g['pOut'])**3);eq(g['cell'],clamp(.045*min(W,H),16,60));eq(g['sig'],max(.26*W,.68*g['maxTot']));eq(g['cx'],clamp(W*(.5+pm['peak']*(.2 if g['port'] else .6)),.06*W+g['maxTot']/2,.94*W-g['maxTot']/2))
 def surf(x):return g['yBase']+g['rise']-g['Hm']/(1+((x-g['cx'])/g['sig'])**4)+math.sin(x/W*17+seed%7)*H*.006+math.sin(x/W*31+seed%5)*H*.004
 for i,v in enumerate(g['mound'][:49]):x=-.02*W+1.04*W*i/48;eq(v[0],x);eq(v[1],surf(x)+g['cell']*1.2);counts['moundVertices']+=1
 assert g['mound'][49:]==[[1.02*W,H+4],[-.02*W,H+4]];counts['moundVertices']+=2
 expected=[];decisions=[];cell=g['cell'];cols=math.ceil(W/cell)+2;depth=max(3,min(5,200//cols));assert (cols,depth)==(g['colsN'],g['depth'])
 for gx in range(-1,cols-1):
  if len(expected)>=200:break
  x=(gx+.5)*cell;top=surf(x)
  for gy in range(depth):
   if len(expected)>=200:break
   y=top+(gy+.5)*cell*.82;decisions.append((gx,gy,y<=H+cell,len(expected)))
   if y>H+cell:break
   v=g['heap'][len(expected)];assert (v['gx'],v['gy'],v['ordinal'],v['id'],v['role'])==(gx,gy,len(expected),f'pile.heap.{gx}.{gy}','primary');eq(v['x'],x+rs(seed,gx,gy,3)*cell*.3);eq(v['y'],y+rs(seed,gx,gy,4)*cell*.2);eq(v['r'],rs(seed,gx,gy,5)*70);eq(v['a'],(.35+.5*r(seed,gx,gy,8))*(1-gy/(depth+1)));assert v['c']==int(r(seed,gx,gy,7)<.14) and v['poolIndex']==h(seed,gx,gy,6)%len(g['pool']) and v['ch']==g['pool'][v['poolIndex']];expected.append(v['id']);counts['heapGlyphs']+=1
 assert len(expected)==len(g['heap']);assert decisions==[(v['gx'],v['gy'],v['accepted'],v['ordinal']) for v in g['heapDecisions']]
 order=[]
 for ri in reversed(range(nR)):
  slots=list(range(len(g['rows'][ri])));
  if pm['order']=='random':slots.sort(key=lambda i:r(seed,ri,i,21))
  order.extend((ri,i) for i in slots)
 assert order==[(v['row'],v['slot']) for v in g['order']]
 clocks={key:.08+i*g['gap'] for i,key in enumerate(order)}
 for i,v in enumerate(g['slots']):
  counts['slots']+=1;ri,k=v['row'],v['slot'];assert v['sourceOrdinal']==i and v['id']==f'pile.glyph.{ri}.{k}' and v['ch']==g['rows'][ri][k];eq(v['when'],clocks[(ri,k)]);eq(v['mi'],max(0,v['when'])/max(.005,g['stagger']));eq(v['f'],(lt-v['when'])/.34)
  if v['gap']:continue
  ys=surf(v['gxp']);slope=math.atan2(surf(v['gxp']+.5*size)-surf(v['gxp']-.5*size),size);tilt=slope/math.pi*180*.7+rs(seed,ri,k,9)*6;rest=ys-size*(.47+v['layer']*.98);launch=-1.2*size-r(seed,ri,k,10)*H*.2;eq(v['ys'],ys);eq(v['slope'],slope);eq(v['tilt'],tilt);eq(v['restY'],rest);eq(v['launchY'],launch)
  f=v['f'];assert v['phase']==('not-started' if f<0 else 'falling' if f<1 else 'settled')
  if f<0:continue
  if f<1:e=clamp(f)**2;y=launch+(rest-launch)*e;rot=rs(seed,ri,k,11)*50+(tilt-rs(seed,ri,k,11)*50)*e;sy=1
  else:tau=(f-1)*.34;eq(v['tau'],tau);y=rest-size*.14*abs(math.sin(16*tau))*math.exp(-tau/.09);rot=tilt;sy=1-.16*math.exp(-tau/.05)
  eq(v['y'],y);eq(v['rot'],rot);eq(v['sy'],sy);eq(v['itemY'],y+size*.47*(1-sy))
 for v in g['dust']:counts['dust']+=1;eq(v['sp'],.6+.6*r(seed,v['row'],v['slot'],v['q']));assert v['id']==f"pile.glyph.{v['row']}.{v['slot']}.dust.{v['q']}"
 for a in row['after'][2:]:
  assert a['program']['supported'] and a['sourceBefore']==a['sourceAfter'];assert a['geometry']==g
  direct=next(v for v in row['after'][:2] if v['offset']==a['offset'])
  if a['hash']!=direct['hash']:counts['retainedReplayPixelFailures']+=1
  for v in a['heapSamples']:assert v['index']==v['nativeOrdinal']==v['measured']['index'] and v['ch']==v['nativeCharacter']==v['measured']['ch'] and v['value']==v['expected'];counts['actualHeapGlyphMapMatches']+=1
assert counts['retainedReplayPixelFailures']==0
assert not j['failures'] and not j['errors']
assert len(j['nonPile'])==3
for q in j['nonPile']:
 assert q['equal'] and q['after']==q['before'] and all(a['supported'] and a['events'] for a in q['after'])
counts['nonPileExactOffsetPairs']=6
out={'decision':'Native source/catalog/OFF/direct/replay exact fidelity and6 nonpile comparisons accepted. No avoidance adapter/continuous circle proof or canonical integration accepted.','counts':counts,'rawSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'knownFailures':j['failures'],'imagesViewed':0,'publicChecks':0};pathlib.Path('/tmp/parent-pile-native02.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
