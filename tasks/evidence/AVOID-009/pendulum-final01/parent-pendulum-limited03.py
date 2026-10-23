import pathlib,json,math,hashlib,collections,copy
p=pathlib.Path('/tmp/avoid009-pendulum01/pendulum-physical01/limited03/raw.json');x=json.loads(p.read_text());C=collections.Counter();paper=[];assert not x['errors'];assert len(x['failures'])==3 and all(f['kind']=='nonimpact' and f['equalPixels'] and not f['equalFinalJSON'] for f in x['failures'])
def dist(p,a,b):
 d=[b[i]-a[i] for i in (0,1)];l=sum(v*v for v in d);t=max(0,min(1,sum((p[i]-a[i])*d[i] for i in (0,1))/l)) if l else 0;return math.hypot(*(p[i]-a[i]-t*d[i] for i in (0,1)))
def inside(p,poly):
 v=False
 for a,b in zip(poly,poly[1:]+poly[:1]):
  if (a[1]>p[1])!=(b[1]>p[1]) and p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]:v=not v
 return v
def safe(poly,spec,c):
 assert all(-1e-6<=v[0]<=spec['W']+1e-6 and -1e-6<=v[1]<=spec['H']+1e-6 for v in poly);cen=[c['cx'],c['cy']];assert not inside(cen,poly);assert min(dist(cen,poly[i-1],poly[i]) for i in range(len(poly)))>=c['r']+max(2,.005*min(spec['W'],spec['H']))-1e-6

def trig(a,b,lo,hi):
 rr=math.atan2(b,a);ts=[lo,hi]+[rr+k*math.pi for k in range(math.ceil((lo-rr)/math.pi),math.floor((hi-rr)/math.pi)+1)];vs=[a*math.cos(t)+b*math.sin(t) for t in ts];return min(vs),max(vs)
def rmargin(v,hw,hh,rho):return rho-math.hypot(max(abs(v[0])-(hw-rho),0),max(abs(v[1])-(hh-rho),0))
for r in x['cases']+x['extras']:
 assert r['sourceUnchanged'] and not r['errors'];tr=r.get('trajectory')
 if not tr:assert any(d['safety']=='unsupported' for d in r['diagnostics']);C['typedUnsupported']+=1;continue
 for s in tr['units'][0]['segments']:
  if s['status']!='safe':continue
  C['safeSegments']+=1;q=s['quality'];g=q['g'];guard=20*math.sqrt(2)/r['sourceCut']['contentScale']
  for poly in s['envelopes']:safe([[v[i]+s['from'][i] for i in (0,1)] for v in poly],r['spec'],s['circle']);C['certificatePolygons']+=1
  for a in q['attachments']:
   ink=a['ink'];theta=a['theta'];i=a['index'];C['completeAttachments']+=1
   if g['mode']=='cradle':
    aa=g['amp']*math.pi/180*(.6+.5*g['motion']);expected=[-aa,aa] if g['n']==1 else [-aa,0] if i==0 else [0,aa] if i==g['n']-1 else [0,0]
   else:
    aa=(7 if g['mode']=='fan' else 5)*math.pi/180*(.5+.7*g['motion']);ee=30*math.pi/180*(.5+i/g['k']);expected=[-aa,aa+ee] if g['side']==1 else [-aa-ee,aa]
   assert all(abs(a-b)<1e-12 for a,b in zip(theta,expected))
   if g['mode']!='chunks':
    radius=.985*g['r'] if g['mode']=='cradle' else g['fanRadius'];assert max(math.hypot(*v) for v in ink)+guard<=radius+1e-7
   else:
    i=a['index'] if 'index' in a else q['attachments'].index(a);hw=g['plateW'][i]/2;hh=g['paperHeights'][i]/2;rho=hh*.28;bx=trig(0,-.06*g['size'],*theta);by=trig(.06*g['size'],0,*theta)
    for v in ink:
     for dx in [-guard,guard]:
      for dy in [-guard,guard]:
       for ox in bx:
        for oy in by:assert rmargin([v[0]+dx+ox,v[1]+dy+oy],hw,hh,rho)>=-1e-6
    holeY=-hh*.76;holeR=max(2,g['size']*.06);gap=min(v[1] for v in ink)-guard+by[0]-holeY-holeR;assert gap>0;C['continuousPaperAttachments']+=1;paper.append({'id':r['spec']['id'],'hw':hw,'hh':hh,'rho':rho,'holeGap':gap,'theta':theta})
  for sup in q['support']:
   assert sup['complete'];C['supportCertificates']+=1
   if sup['kind']=='common-pivot-rounded-paper':
    i=sup['index'];dy=g['stringOffsets'][i];xx=trig(0,dy,*q['attachments'][i]['theta']);yy=trig(-dy,0,*q['attachments'][i]['theta']);hw=g['plateW'][i]/2;hh=g['paperHeights'][i]/2
    assert all(rmargin([a,b],hw,hh,hh*.28)>=-1e-6 for a in xx for b in yy);assert g['items'][i]['nativeLength']*(s['composition'] or {}).get('lengthScale',1)>=math.hypot(hw,hh)+max(3,.008*min(r['spec']['W'],r['spec']['H']))+max(2,g['size']*.15)-1e-6
 for row in r['rows']:
  s=next(s for s in tr['units'][0]['segments'] if s['start']<=row['t']<s['end'])
  for o in row['observations']:
   assert all(o[k] for k in ('envelopeCovered','stageContained','strictCircleClear'));C['actualObservations']+=1
   for poly in o['polygons']:safe(poly,r['spec'],s['circle']);C['actualPolygons']+=1
   for e in o['events']:
    assert e['role']=='primary' and e['owner'].startswith('pendulum.');C['actualPrimaryEvents']+=1
    if e['kind']=='item':
     it=e['args'][0];gg=o['geometry'];q=gg['items'][it['placementDSource']['index']];assert (q['text'],q['size'],q['mi'],q['bx'])==(it['text'],it['size'],it['mi'],it['x']);assert q['by']+(gg['size']*.06 if gg['mode']=='chunks' else 0)==it['y'];assert abs(it['rot']+q['th']*180/math.pi)<1e-12;C['actualCatalogItemMatches']+=1
 if r.get('exclusion'):
  e=r['exclusion'];assert e['eligibility']['eligibleDuringAvoidance'] is False and e['error']['code']=='PENDULUM_COMPOSITION_EXCLUDED' and e['before']==e['after'] and not e['observations'];C['typedExclusionNoPaint']+=1
for r in x['controls']:
 assert not r['after']['trajectory'] and not r['before']['trajectory'];assert [a['hash'] for a in r['after']['rows']]==[a['hash'] for a in r['before']['rows']];C['preservedControls']+=1
cache=next(r['cache'] for r in x['cases'] if 'cache' in r);assert all(v is True for k,v in cache.items() if k not in ('statsCold','statsWarm'));assert cache['statsWarm']['hits']>cache['statsCold']['hits'];assert cache['statsCold']['stores']>=1
exp=next(r for r in x['extras'] if r['spec']['id']=='explicit-auto-scale');assert exp['sourceCut']['contentScale']==1.25 and exp['sourceCut']['areaMode']=='auto';assert exp['trajectory']['sourceProof']['explicitSizePreserved'];assert all((a.get('recipe') or {}).get('fontScale',1)==1 for s in exp['trajectory']['units'][0]['segments'] for a in s['attempts'])
non=[]
for r in x['nonimpact']:
 a=json.loads(r['after']['finalJSON']);b=json.loads(r['before']['finalJSON']);revisions=[a['placementFinalization']['revision'],b['placementFinalization']['revision']];assert revisions==[6,4];a['placementFinalization'].pop('revision');b['placementFinalization'].pop('revision');a['cuts'][0]['placementTrajectory'].pop('revision');b['cuts'][0]['placementTrajectory'].pop('revision');assert a==b;ar=r['after']['rows'];br=r['before']['rows'];assert [v['hash'] for v in ar]==[v['hash'] for v in br];C['nonimpactFullFramePairs']+=len(ar)
 if not ar:
  ea,eb=r['after']['exclusion'],r['before']['exclusion'];assert ea['after']==eb['after'] and ea['before']==eb['before'] and ea['after']!=ea['before'];assert len(ea['observations'])==len(eb['observations'])==1;assert len(ea['observations'][0]['events'])==len(eb['observations'][0]['events'])>0;C['nonimpactDirectPaintPairs']+=1
 non.append({'id':r['spec']['id'],'actualFrames':len(ar),'revisionCounters':revisions})
report={'decision':'Bounded functional raw and continuous single-paper/support checks pass. Original invocation exit1 retained; cross-page nonimpact revision identity was invalid comparison. No main integration yet.','counts':dict(C),'paper':paper,'nonimpactScope':non,'revisionNormalization':'Only placementFinalization.revision and cuts[0].placementTrajectory.revision, process-local J.metrics generation. Every other field strictly equal; no product counter changes.','cache':{'coldHits':cache['statsCold']['hits'],'warmHits':cache['statsWarm']['hits']},'originalFailures':x['failures'],'rawSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'publicChecks':0,'imagesViewed':0};pathlib.Path('/tmp/parent-pendulum-limited03.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
