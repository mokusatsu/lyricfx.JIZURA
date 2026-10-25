import sys,json,gzip,runpy,pathlib,collections,hashlib
sys.dont_write_bytecode=True
base=pathlib.Path('/dev/shm/avoid009-burst26');raw=pathlib.Path('/dev/shm/avoid009-burst26-fullclock-source02-actual01-20261025/raw');R=runpy.run_path(str(base/'fullclock-source02/checker26.py'));restore=R['restore'];m=json.loads((raw/'manifest.json').read_bytes());tables={};epoch=-1;values=[]
for row in m['records']:
 data=(raw/row['file']).read_bytes();assert hashlib.sha256(data).hexdigest()==row['sha256'];v=json.loads(gzip.decompress(data))
 if v['tableEpoch']!=epoch:epoch=v['tableEpoch'];tables={k:[] for k in ['matrix','paint','catalog']}
 for k,delta in v['tableDeltas'].items():
  for e in delta:assert e['id']==len(tables[k]);tables[k].append(e['value'])
 values.append(restore(v['binding'],tables))
init=values[0]['init'];out={'sourceManifestSHA256':hashlib.sha256((raw/'manifest.json').read_bytes()).hexdigest(),'nativeSize':init['nativeSize'],'recipes':init['recipes'],'quality':[],'families':[],'witnesses':[],'nativeRing':[],'conditionalEstimatesOnly':True,'canvasFrames':0}
for v in values:
 phase=v['phase']
 if phase=='recipe-rejected':out['quality'].append(v)
 if phase=='candidate-family':out['families'].append({'circle':v['circle']['id'],'recipe':v['recipe']['id'],'candidates':len(v['family']['candidates'])})
 if phase=='candidate-frame' and not v['evaluation']['passed']:
  f=v['frame'];kinds=collections.Counter();rings=[]
  for failure in v['evaluation']['failures']:
   s=f['supports'][int(failure['index'])];p=f['records'][int(s['ordinal'])];isring=any(c['key']=='arc' for c in p['path']);label='ring' if isring else p['kind'];kinds[label]+=1
   if isring:rings.append({'ordinal':s['ordinal'],'pass':p['pass'],'radius':p['path'][0]['args'][2],'bounds':s['bounds'],'failure':failure})
  out['witnesses'].append({'circle':v['circle']['id'],'recipe':v['recipe']['id'],'n':f['n'],'delta':f['delta'],'failKinds':dict(kinds),'rings':rings})
 if phase=='native-frame':
  for s in v['frame']['supports']:
   p=v['frame']['records'][int(s['ordinal'])]
   if any(c['key']=='arc' for c in p['path']):out['nativeRing'].append({'n':v['frame']['n'],'pass':p['pass'],'radius':p['path'][0]['args'][2],'bounds':s['bounds']})
maxring=max(out['nativeRing'],key=lambda r:r['radius']);out['nativeMaximumRing']=maxring
(base/'source03/diagnosis03.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'nativeSize':out['nativeSize'],'recipes':[{'id':r['recipe']['id'],'size':r['dimensions']['size'],'rx':r['dimensions']['rx'],'ry':r['dimensions']['ry'],'fits':r['dimensions']['writingFieldFits']} for r in out['recipes']],'qualityCount':len(out['quality']),'families':out['families'],'witnesses':out['witnesses'],'nativeMaximumRing':maxring},ensure_ascii=False))
