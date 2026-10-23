from pathlib import Path
import gzip,json,hashlib,math
r=Path('/tmp/avoid009-pile-revision12');raw=r/'run01/raw.json.gz';d=json.loads(gzip.decompress(raw.read_bytes()));end=json.loads((r/'run01/end-pins.json').read_text());assert end['allInputsUnchanged'] and all(x['sha256']==x['actualSHA256'] for x in end['files'])
count={'cases':0,'fullFrames':0,'directProbes':0,'actualPolygons':0,'vertices':0,'waivedTopPolygons':0,'unchangedOwnerHulls':0,'freshMainHulls':0,'settledFramesExact':0,'sourceClockComparisons':0}
def bounds(p):return [min(v[0] for v in p),min(v[1] for v in p),max(v[0] for v in p),max(v[1] for v in p)]
def inside(v,p):
 cr=[(b[0]-a[0])*(v[1]-a[1])-(b[1]-a[1])*(v[0]-a[0]) for a,b in zip(p,p[1:]+p[:1])];return all(x>=-1e-5 for x in cr) or all(x<=1e-5 for x in cr)
def distance(p,c):
 if inside(c,p):return 0
 best=math.inf
 for a,b in zip(p,p[1:]+p[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];q=dx*dx+dy*dy;t=max(0,min(1,((c[0]-a[0])*dx+(c[1]-a[1])*dy)/q)) if q else 0;best=min(best,math.hypot(c[0]-a[0]-t*dx,c[1]-a[1]-t*dy))
 return best
def cam_bounds(src,plan,cut):
 W,H=plan['W'],plan['H'];fx=plan['fx'];motion=cut.get('motionScale',1);base=cut.get('contentScale',1);K=max(0,min(1.25,fx.get('motion',.7)*1.25));S=base*max(1,1+.03*max(K,fx.get('motion',.7))*motion,1.02);assert cut['cam']=='push';chroma=fx.get('chroma',.7)*plan['style'].get('ghost',1)*1.9;dx=20.25+3.4*chroma*H/1080*motion;dy=20.25+1.9*chroma*H/1080*motion
 pts=[(W/2+(x-W/2)*s,H/2+(y-H/2)*s) for x in src['x'] for y in src['y'] for s in [base,S]];return [min(v[0] for v in pts)-dx,min(v[1] for v in pts)-dy,max(v[0] for v in pts)+dx,max(v[1] for v in pts)+dy]
for pair in d['rows']:
 count['cases']+=1;a,b=pair['after'],pair['before'];assert not a['failures'] and not b['failures'];plan=a['finalPlan'];cut=plan['cuts'][0];tr=cut['placementTrajectory'];oldtr=b['finalPlan']['cuts'][0]['placementTrajectory'];delta=tr['sourceProof']['launchDelta'];assert delta>0;assert a['controls']==b['controls'];W,H=plan['W'],plan['H'];original={u['owner']:u for u in a['controls'][1]['continuous']};g=next(o['geometry'] for f in a['frames'] if f['t']==.9 for o in f['observations'] if o['pass']=='main');slots={s['id']:s for s in g['slots'] if not s['gap']}
 for s,old in zip(tr['units'][0]['segments'],oldtr['units'][0]['segments']):
  recipe=s['composition'].copy();recipe.pop('entrance');assert recipe==old['composition'] and s['from']==old['from'] and s['quality']==old['quality'];assert s['entryProof']['launchDelta']==delta
  for admission in s['entryProof']['launchAdmission']:assert admission['newCeiling']<=admission['nativeCeiling']<0
  oldunits={u['owner']:u for u in old['unitProofs']}
  for u in s['unitProofs']:
   if 'entryRule' not in u:assert u==oldunits[u['owner']];count['unchangedOwnerHulls']+=1
   else:
    q=original[u['owner']];slot=slots[u['owner']];assert u['settledEnvelope']==q['circleStrictEnvelope']['polygon'];assert u['launch']==q['launch']-delta;assert u['entryRule']['when']==q['when'] and u['entryRule']['fd']==.34
    f=u['sourceFall'];fs=q['fallSupport'];assert abs(f['x'][0]-(slot['gxp']+fs['x'][0]))<1e-9;assert abs(f['x'][1]-(slot['gxp']+fs['x'][1]))<1e-9;assert abs(f['y'][0]-(u['launch']+fs['y'][0]))<1e-9;assert abs(f['y'][1]-(q['fallCenter'][1]+fs['y'][1]))<1e-9
    src={'x':[min(f['x'][0],q['sourceCircleStrict']['x'][0]),max(f['x'][1],q['sourceCircleStrict']['x'][1])],'y':[min(f['y'][0],q['sourceCircleStrict']['y'][0]),max(f['y'][1],q['sourceCircleStrict']['y'][1])]};expect=cam_bounds(src,plan,cut);actual=bounds(u['envelope']);assert all(abs(x-y)<1e-9 for x,y in zip(expect,actual)),(u['owner'],expect,actual);count['freshMainHulls']+=1
   dx,dy=s['from'];poly=[[x+dx,y+dy] for x,y in u['envelope']];assert all(0<=x<=W and y<=H for x,y in poly);assert distance(poly,(s['circle']['cx'],s['circle']['cy']))>=s['circle']['r']+3.6-1e-7
   settled=u.get('settledEnvelope',u['envelope']);assert all(0<=x+dx<=W and 0<=y+dy<=H for x,y in settled)
 for f,ref in zip(a['frames'],b['frames']):
  count['fullFrames']+=1;assert f['t']==ref['t'] and not f['error'];assert len(f['observations'])==3
  if all(o['lt']>=.5 and all(s.get('gap') or s['f']>=1 for s in o['geometry']['slots']) for o in f['observations']):assert f['hash']==ref['hash'];count['settledFramesExact']+=1
 assert a['frames'][0]['hash']==a['off'][0]['hash'];assert all(f['hash']==q['hash'] for f,q in zip(a['off'],b['off']));assert a['warm']['newSegmentIdentity'] and a['warm']['frame']['hash']==next(f['hash'] for f in a['frames'] if f['t']==.9)
 observations=[o for f in a['frames'] for o in f['observations']]+[a['warm']['frame']['observations'][i] for i in range(3)]
 for o in observations:
  s=next(s for s in tr['units'][0]['segments'] if s['start']<=o['realTime']<s['end']);units={u['owner']:u for u in s['unitProofs']};assert o['stagePolicySatisfied'] and o['strictCircleClear'] and o['envelopeCovered'];assert o['geometry']['entrance']['materialAlpha']==1-(1-max(0,min(1,o['lt']/.5)))**3
  for q,p in zip(o['actual'],o['polygons']):
   u=units[q['owner']];assert all(inside(v,u['envelope']) for v in q['polygon']);assert p==[[x+o['offset'][0],y+o['offset'][1]] for x,y in q['polygon']];fall='entryRule' in u and 0<=q.get('sourceF',-1)<1
   assert all(math.isfinite(x+y) and 0<=x<=W and y<=H and (y>=0 or fall) for x,y in p);assert distance(p,(s['circle']['cx'],s['circle']['cy']))>=s['circle']['r']+3.6-1e-7
   count['actualPolygons']+=1;count['vertices']+=len(p)
   if any(y<0 for x,y in p):assert fall and any(v['owner']==q['owner'] and v['pass']==o['pass'] for v in o['entryLedger']);count['waivedTopPolygons']+=1
 for p,ref in zip(a['probes'],b['probes']):
  count['directProbes']+=1;assert (p['lt'],p['pass'])==(ref['lt'],ref['pass']);ga,gb=p['geometry'],ref['geometry'];assert all(ga[k]==gb[k] for k in ['mound','heap','heapDecisions','order','dust'])
  for q,old in zip(ga['slots'],gb['slots']):
   if q['gap']:assert q==old;continue
   aa=q.copy();bb=old.copy();aa.pop('launchY');bb.pop('launchY');assert q['launchY']==old['launchY']-delta
   if 0<=q['f']<1:
    for k in ['y','itemY']:aa.pop(k);bb.pop(k)
    assert abs(q['y']-(old['y']-(1-q['f']**2)*delta))<=1e-9
   assert aa==bb;count['sourceClockComparisons']+=1
  if 'directHash' in p:assert p['directHash']==p['replayHash']
  s=next(s for s in tr['units'][0]['segments'] if s['start']<=max(0,p['lt']+({'main':0,'A':.8/24,'B':1.6/24}[p['pass']]))<s['end'])
  for q in p['actual']:
   poly=q['polygon'];fall=q['owner'].startswith('pile.glyph.') and 0<=q.get('sourceF',-1)<1;assert all(0<=x<=W and y<=H and (y>=0 or fall) for x,y in poly);assert distance(poly,(s['circle']['cx'],s['circle']['cy']))>=s['circle']['r']+3.6-1e-7;count['actualPolygons']+=1;count['vertices']+=len(poly)
   if q.get('sourceF')==0:assert all(y<0 for x,y in poly)
 assert a['fontDrift']['code']=='PILE_STALE_DEPENDENCY' and a['helperDrift']['code']=='PILE_STALE_DEPENDENCY'
assert not d['errors'] and all(q['equal'] for p in d['comparisons'] for q in p['checks'])
result={'status':'PASS','rawSHA256':hashlib.sha256(raw.read_bytes()).hexdigest(),'counts':count,'endPinCount':len(end['files']),'parentImageViews':0,'publicResultChecks':0,'limitations':['Two bounded fixtures only; no formal performance or fullD acceptance','Fade follows original .5s rise clock but does not recreate native geometric emergence','Human entrance motion approval pending']};Path('/tmp/parent-pile-entry12.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
