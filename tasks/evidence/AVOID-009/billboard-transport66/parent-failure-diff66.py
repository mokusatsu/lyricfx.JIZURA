from pathlib import Path
import json,gzip,hashlib,struct
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/billboard66.raw01');E=R/'tasks/evidence/AVOID-009/billboard-transport66';U=object();H=lambda b:hashlib.sha256(b).hexdigest()
def dec(v):
 if isinstance(v,list):return [dec(x) for x in v]
 if isinstance(v,dict):
  if set(v)=={'$undefined'}:return U
  if set(v)=={'$f64'}:return struct.unpack('>d',bytes.fromhex(v['$f64']))[0]
  return {k:dec(x) for k,x in v.items()}
 return v
def exact(v):
 if v is U:return 'UNDEFINED'
 if isinstance(v,(float,int)) and not isinstance(v,bool):return ['f64',struct.pack('>d',v).hex()]
 if isinstance(v,list):return [exact(x) for x in v]
 if isinstance(v,dict):return {k:exact(x) for k,x in v.items()}
 return v
def diffs(a,b,path='$'):
 if exact(a)==exact(b):return []
 if isinstance(a,dict) and isinstance(b,dict):return [y for k in sorted(set(a)|set(b)) for y in diffs(a.get(k,U),b.get(k,U),path+'.'+k)]
 if isinstance(a,list) and isinstance(b,list) and len(a)==len(b):return [y for i,(x,z) in enumerate(zip(a,b)) for y in diffs(x,z,path+'['+str(i)+']')]
 return [{'path':path,'actual':exact(a),'native':exact(b)}]
m=json.loads((B/'manifest.json').read_text());assert not m['complete'] and len(m['errors'])==1;row=next(x for x in m['records'] if x['id']=='fatal-partial');parts=[]
for p in row['parts']:
 z=(B/p['path']).read_bytes();assert H(z)==p['sha256'];b=gzip.decompress(z);assert H(b)==p['JSONSHA256'];parts.append(b)
b=b''.join(parts);assert H(b)==row['JSONSHA256'];j=dec(json.loads(b)['data']);v=j['lastSamples'];z=v['zero'];n=v['on'];delta=diffs(z['paintCore'],n['paintCore']);assert delta and all(x['path'].endswith(('.state.letterSpacing','.state.wordSpacing')) and x['actual']=='' and x['native']=='0px' for x in delta);assert z['pixelSHA256']==n['pixelSHA256'] and exact(z['root'])==exact(n['root']);out={'state':'FAILED66_PARENT_LITERAL_PARTIAL_DELTA_REVIEWED_NOT_ACCEPTED','manifestSHA256':H((B/'manifest.json').read_bytes()),'completedPrefix':m['completed'],'failedTuple':{k:z[k] for k in ['lt','pass','scale']},'failedTupleFullRGBAEqualsNative':True,'failedTupleRootExact':True,'allPaintCoreDeltas':delta,'differenceCount':len(delta),'sourceCause':'Bounded actual Canvas diagnostic66 proves extra save/restore changes default spacing getters0px to empty inside save; native billboard primitive helpers do not save, generic replay does. Source67 operation-order correction pending; no field waiver.','stageAccepted':False,'transportAccepted':False,'publicChecks':0,'parentImages':0};(E/'parent-failure-diff66.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='allPaintCoreDeltas'}))
