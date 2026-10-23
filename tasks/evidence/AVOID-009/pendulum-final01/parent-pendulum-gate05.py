import pathlib,json,math,hashlib,collections
p=pathlib.Path('/tmp/avoid009-pendulum01/pendulum-physical01/gate05/raw.json');x=json.loads(p.read_text());C=collections.Counter();margins=[]
def segdist(p,a,b):
 dx,dy=b[0]-a[0],b[1]-a[1];l=dx*dx+dy*dy;u=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)) if l else 0;return math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dy)
def inside(p,poly):
 hit=False
 for a,b in zip(poly,poly[1:]+poly[:1]):
  if (a[1]>p[1])!=(b[1]>p[1]) and p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]:hit=not hit
 return hit
def check(poly,spec,circle):
 assert all(-1e-6<=a<=spec['W']+1e-6 and -1e-6<=b<=spec['H']+1e-6 for a,b in poly);c=[circle['cx'],circle['cy']];assert not inside(c,poly);margin=min(segdist(c,poly[i-1],poly[i]) for i in range(len(poly)))-circle['r']-max(2,.005*min(spec['W'],spec['H']));assert margin>=-1e-6,margin;margins.append(margin)
assert not x['failures'] and not x['errors']
for off in x['off']:
 assert off['after']==off['before'];C['OFFconditions']+=1;C['OFFframePairs']+=len(off['after']['rows'])
for case in x['cases']:
 assert case['sourceUnchanged'] and not case['errors'];s=case['trajectory']['units'][0]['segments'][0];spec=case['spec'];circle=s['circle'];assert s['status']=='safe';g=s['quality']['g'];q=s['quality'];recipe=s['composition'];lam=(recipe or {}).get('lengthScale',1)
 for poly in s['envelopes']:check([[v[i]+s['from'][i] for i in (0,1)] for v in poly],spec,circle);C['certificatePolygons']+=1
 guard=20*math.sqrt(2)
 for a in q['attachments']:
  assert g['mode']!='chunks';r=.985*g['r'] if g['mode']=='cradle' else g['fanRadius'];assert max(math.hypot(*v) for v in a['ink'])+guard<=r+1e-7;C['completeDiscAttachments']+=1
 nativeQ=case['trajectory']['sourceProof']['nativeQuality'];ng=nativeQ['g'];shapeGuard=10*math.sqrt(2)
 for pair in q['overlap']['pairs']:
  i,j=pair['earlier'],pair['later'];gr=max(math.hypot(*v) for v in q['attachments'][i]['ink'])+guard;ngr=max(math.hypot(*v) for v in nativeQ['attachments'][i]['ink'])+guard;br=(.985*g['r']+g['lw']/2 if g['mode']=='cradle' else g['fanRadius'])+shapeGuard;nbr=(.985*ng['r']+ng['lw']/2 if ng['mode']=='cradle' else ng['fanRadius'])+shapeGuard;assert abs(gr-pair['glyphRadius'])<1e-9 and abs(br-pair['laterBodyRadius'])<1e-9;assert abs(ngr-pair['nativeGlyphRadius'])<1e-9 and abs(nbr-pair['nativeLaterBodyRadius'])<1e-9
  if g['mode']!='cradle':assert lam*(ngr+nbr)-gr-br>=-1e-7
  dist=(pair['later']-pair['earlier'])*g['anchorPitch'] if g['mode']=='cradle' else lam*abs(g['items'][pair['later']]['nativeLength']-g['items'][pair['earlier']]['nativeLength']);assert abs(dist-pair['postEntryDistance'])<1e-9;assert dist-pair['glyphRadius']-pair['laterBodyRadius']>=-1e-7;assert pair['entryRelativeMargin']>=-1e-7;C['continuousPostEntryPairCertificates']+=1
 for row in case['rows']:
  for o in row['observations']:
   assert all(o[k] for k in ('envelopeCovered','measurementSupported','stageContained','strictCircleClear'));C['observations']+=1;gg=o['geometry'];inds={it['index']:it for it in gg['items']}
   for it in gg['items']:
    expected=gg['period'] if gg['mode']=='cradle' else gg['period']*1.6*math.sqrt(it['nativeLength']/gg['Lmax']);assert abs(it['nativePeriod']-expected)<1e-13;C['nativePeriods']+=1
   for poly in o['polygons']:check(poly,spec,circle);C['actualPolygons']+=1
   for e in o['events']:
    assert e['role']=='primary' and e['owner'].startswith('pendulum.');C['primaryEvents']+=1
    if e['kind']=='item':
     it=e['args'][0];idx=it['placementDSource']['index'];source=inds[idx];assert source['text']==it['text'] and source['size']==it['size'] and source['mi']==it['mi'];assert source['bx']==it['x'];assert source['by']+(gg['size']*.06 if gg['mode']=='chunks' else 0)==it['y'];assert abs(it['rot']+source['th']*180/math.pi)<1e-12;C['actualItemCatalogMatches']+=1
report={'decision':'Independent first physical gate checks pass; only tested cradle/fan, no chunks or full-domain/integration acceptance','counts':dict(C),'minimumStageCircleExtraMargin':min(margins),'rawSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'entryLimit':'Source-relative normalized radial overlap threshold, NOT identical pixel occlusion or zero entry overlap; visual judgment pending','imagesViewed':0,'publicChecks':0};pathlib.Path('/tmp/parent-pendulum-gate05.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
