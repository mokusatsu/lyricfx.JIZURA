from pathlib import Path
import gzip,json,math,hashlib
R=Path('/tmp/avoid009-pile-speed01')
paths={'revisionRaw':'/tmp/avoid009-pile-revision12/run01/raw.json.gz','old064Frames':'/tmp/avoid009-pile-media01/output02/after-frames.json.gz','newFrames':'/tmp/avoid009-pile-entry-20261024-01/output01/after-frames.json.gz'}
def read(p):return json.loads(gzip.decompress(Path(p).read_bytes()))
d=read(paths['revisionRaw'])['rows'][0];a=d['after'];g=next(o['geometry'] for f in d['before']['frames'] if f['t']==.9 for o in f['observations'] if o['pass']=='main');tr=a['finalPlan']['cuts'][0]['placementTrajectory'];seg=tr['units'][0]['segments'][0];r=seg['composition'];delta=r['entrance']['launchDelta'];offset=seg['from'];old=read(paths['old064Frames']);new=read(paths['newFrames']);native={u['owner']:u for u in a['controls'][0]['continuous'] if u['kind']=='main-glyph'};physical={u['owner']:u for u in a['controls'][1]['continuous'] if u['kind']=='main-glyph'}
fd=.34;outStart=3.6;outDur=.4
lag={'main':0,'A':.8/24,'B':1.6/24};chroma={'main':[0,0],'A':[.32,.19],'B':[-.34,-.13]}
def scale(t):return 1+.03*.65*t/4
def rise(t,Ain,Aout):return Ain*max(0,1-t/.5)**3+Aout*max(0,min(1,(t-outStart)/outDur))**3
def drise(t,Ain,Aout):return (-6*Ain*(1-2*t)**2 if t<.5 else 0)+(3*Aout/outDur*((t-outStart)/outDur)**2 if t>outStart else 0)
def d2rise(t,Ain,Aout):return (24*Ain*(1-2*t) if t<.5 else 0)+(6*Aout/outDur**2*((t-outStart)/outDur) if t>outStart else 0)
def nativeR0(q):
 x=q['nativeGxp'];b=math.sin(x/g['W']*17+g['seed']%7)*g['H']*.006+math.sin(x/g['W']*31+g['seed']%5)*g['H']*.004
 return g['yBase']-g['Hm']/(1+((x-g['cx'])/g['sig'])**4)+b-g['size']*(.47+q['layer']*.98)
def params(q,version):
 if version=='native_bc39':return q['originalLaunchY'],nativeR0(q),1.1*g['Hm'],.5*g['Hm']
 return q['launchY']-(delta if version=='ee5' else 0),q['restY'],r['Ain'],r['Aout']
def kin(q,version,t):
 L,R0,Ain,Aout=params(q,version);f=(t-q['when'])/fd;Rt=R0+rise(t,Ain,Aout);rp=drise(t,Ain,Aout);rpp=d2rise(t,Ain,Aout)
 return {'t':t,'f':f,'L':L,'R':Rt,'y':L+(Rt-L)*f*f,'v':2*(Rt-L)*f/fd+rp*f*f,'a':2*(Rt-L)/fd**2+4*rp*f/fd+rpp*f*f}
falls=[]
for q in g['slots']:
 falls.append({'owner':q['id'],'ch':q['ch'],'when':q['when'],'impact':q['when']+fd,'versions':{v:[kin(q,v,q['when']+f*fd) for f in [0,.25,.5,.75,1]] for v in ['native_bc39','old064','ee5']}})
# Final-frame native is source-derived, never an observed native callback.
final=[];newFinal={o['pass']:o for o in new[-1]['observations']};maxerr=0
for q in g['slots']:
 row={'owner':q['id'],'ch':q['ch'],'passes':{}}
 for p in ['main','A','B']:
  o=newFinal[p];t=o['lt'];s=scale(t);nativeMean=[sum(v[i] for v in native[q['id']]['settledSupport']['verticesAt1'])/4 for i in [0,1]];physicalMean=[sum(v[i] for v in physical[q['id']]['settledSupport']['verticesAt1'])/4 for i in [0,1]]
  nativeMean[1]+=rise(t,1.1*g['Hm'],.5*g['Hm']);physicalMean[1]+=rise(t,r['Ain'],r['Aout'])
  modeledNative=[g['W']/2+(nativeMean[0]-g['W']/2)*s+chroma[p][0],g['H']/2+(nativeMean[1]-g['H']/2)*s+chroma[p][1]]
  modeledPhysical=[g['W']/2+(physicalMean[0]-g['W']/2)*s+chroma[p][0]+offset[0],g['H']/2+(physicalMean[1]-g['H']/2)*s+chroma[p][1]+offset[1]]
  poly=next(poly for ev,poly in zip(o['actual'],o['polygons']) if ev['owner']==q['id']);observed=[sum(v[i] for v in poly)/len(poly) for i in [0,1]];err=max(abs(x-y) for x,y in zip(modeledPhysical,observed));maxerr=max(maxerr,err)
  row['passes'][p]={'lt':t,'cameraScale':s,'chromaOffset':chroma[p],'nativeSourceDerivedCentroid':modeledNative,'ee5ObservedGuardVertexMean':observed,'ee5ModeledCentroid':modeledPhysical,'modelError':err,'nativeRise':rise(t,1.1*g['Hm'],.5*g['Hm']),'physicalRise':rise(t,r['Ain'],r['Aout'])}
 for p in ['A','B']:
  m=row['passes']['main'];z=row['passes'][p];row['passes'][p]['nativeDeltaFromMain']=[z['nativeSourceDerivedCentroid'][i]-m['nativeSourceDerivedCentroid'][i] for i in [0,1]];row['passes'][p]['ee5DeltaFromMain']=[z['ee5ObservedGuardVertexMean'][i]-m['ee5ObservedGuardVertexMean'][i] for i in [0,1]]
 final.append(row)
print("modelerrors",maxerr,[(x["ch"],[(p,x["passes"][p]["modelError"],x["passes"][p]["ee5ModeledCentroid"],x["passes"][p]["ee5ObservedGuardVertexMean"]) for p in ["main","A","B"]]) for x in final])
assert maxerr<5e-5
# Numerical visibility uses complete font guard geometry, not observed ink/opacity.
visibility=[]
for q in g['slots']:
 row={'owner':q['id'],'ch':q['ch'],'versions':{}}
 for name,frames in [('old064',old),('ee5',new)]:
  hit=[];full=[]
  for f in frames:
   o=next(o for o in f['observations'] if o['pass']=='main')
   for ev,poly in zip(o['actual'],o['polygons']):
    source_f=ev.get('sourceF',next((z['f'] for z in o.get('geometry',{}).get('slots',[]) if z['id']==ev['owner']),-1))
    if ev['owner']==q['id'] and 0<=source_f<1:
     if max(v[1] for v in poly)>=0 and min(v[1] for v in poly)<=720:hit.append(f['time'])
     if min(v[1] for v in poly)>=0 and max(v[1] for v in poly)<=720:full.append(f['time'])
  row['versions'][name]={'observedGuardIntersectsStageFallingFrames':hit,'observedGuardFullyInsideFallingFrames':full}
 # Recover complete metric vertices from accepted native settled support, rotate back; guard reserve 2px.
 u=native[q['id']];tilt=u['settledSupport']['rotation']*math.pi/180;ct=math.cos(tilt);st=math.sin(tilt);r0=nativeR0(q);local=[]
 for x,y in u['settledSupport']['verticesAt1']:
  dx=x-q['nativeGxp'];dy=y-r0;local.append([ct*dx+st*dy,-st*dx+ct*dy])
 hit=[];full=[]
 for i in range(240):
  t=i/60;f=(t-q['when'])/fd
  if not 0<=f<1:continue
  k=kin(q,'native_bc39',t);angle=(q['launchRot']+(u['settledSupport']['rotation']-q['launchRot'])*f*f)*math.pi/180;s=scale(t);ys=[360+(k['y']+math.sin(angle)*x+math.cos(angle)*y-360)*s for x,y in local];lo=min(ys)-2;hi=max(ys)+2
  if hi>=0 and lo<=720:hit.append(t)
  if lo>=0 and hi<=720:full.append(t)
 row['versions']['native_bc39']={'sourceDerivedGuardIntersectsStageFallingFrames':hit,'sourceDerivedGuardFullyInsideFallingFrames':full};visibility.append(row)
# Preserve exact source inputs by hash and compact relevant source lines.
files=[*paths.values(),'/workspace/lyricfx.JIZURA/src/11p_layoutsD.js','/workspace/lyricfx.JIZURA/src/09v_layoutsD_pile_trial.js','/workspace/lyricfx.JIZURA/src/09x_layoutsD_pile_adapter.js','/workspace/lyricfx.JIZURA/src/09_render.js','/workspace/lyricfx.JIZURA/src/05b_registry.js','/workspace/lyricfx.JIZURA/src/01_util.js','/tmp/avoid009-pile-revision12/MATH12.md']
pins=[{'path':p,'bytes':Path(p).stat().st_size,'sha256':hashlib.sha256(Path(p).read_bytes()).hexdigest()} for p in files];(R/'sourcepins.json').write_text(json.dumps(pins,indent=2)+'\n')
result={'scope':'Readonly source / existing runtime raw; no product module/browser/media execution or image/video/public view','seed':704,'W':1280,'H':720,'fps':60,'text':'風の先へ','delta':delta,'deltaAccelerationVs064':2*delta/fd**2,'fallFormula':'y=L+(R(t)-L)*f^2; v=2*(R-L)*f/T+Rprime*f^2; a=2*(R-L)/T^2+4*Rprime*f/T+Rdoubleprime*f^2','nativeAin':1.1*g['Hm'],'physicalAin':r['Ain'],'nativeAout':.5*g['Hm'],'physicalAout':r['Aout'],'finalFrame':239,'finalTime':new[-1]['time'],'modelVsObservedAfterMaximumError':maxerr,'falls':falls,'finalFrameCentroids':final,'visibility':visibility,'limitations':['Native-before media has no observed geometry; native positions are source-derived using native-equivalent control metrics, sourcePlan clocks and stock push camera','Analytic camera vs copied runtime measurement-root centroids differ by at most 2.76e-5 px; this is disclosed numerical transport precision, not exact native observation','Guard intersection is neither exact ink visibility nor perceptual timing','No user conditional approval is recorded; source-only diagnosis does not accept identical physics','old064/new final geometry is already independently verified identical after settling; failures remain preserved']}
(R/'calculation.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['falls','finalFrameCentroids','visibility']},indent=2))
for z in final:print(z['ch'],[(p,z['passes'][p].get('nativeDeltaFromMain'),z['passes'][p].get('ee5DeltaFromMain')) for p in ['A','B']])
for z in falls:print(z['ch'],[(v,round(rows[-1]['v'],3),round(rows[-1]['a'],3)) for v,rows in z['versions'].items()])
