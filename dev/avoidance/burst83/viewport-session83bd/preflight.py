"""Read-only producer/dependency/process admission; emits a new sidecar, no Qt."""
from pathlib import Path
import os,json,hashlib,subprocess,sys,re,time
D=Path(sys.argv[1]).resolve();R=Path(__file__).resolve().parents[4];B=D.parent;sha=lambda b:hashlib.sha256(b).hexdigest()
pins=json.loads((D/'pins.json').read_text())
for p in pins:
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'],p['path']
subprocess.run([sys.executable,str(R/'dev/avoidance/burst83/normal-options83bc/check-dependencies.py'),str(D)],check=True,stdout=subprocess.DEVNULL)
s=(D/'probe.cjs').read_text();names=re.findall("'([^']+)'",s[s.index('for(const name of ['):s.index(']){const file=')])
for n in names:
 if n!='fixture':subprocess.run(['node','--check',str(D/(n+'.js'))],check=True,stdout=subprocess.DEVNULL)
assert names.index('private-controller83')<names.index('prepared-handoff83')<names.index('runtime83bd')<names.index('browser-test');assert names.index('session83bd')<names.index('browser-test')
rt=(D/'runtime83bd.js').read_text();assert rt.count('registerLayoutsDAdapter')==rt.count('unit.connect()')==1;assert "unit=A.burstPreparedHandoff83ap.create({viewport});unit.connect();A.registerLayoutsDAdapter('burst',unit.adapter);"in rt
rows=[]
for d in Path('/proc').iterdir():
 if d.name.isdigit():
  try:
   t=(d/'stat').read_text();j=t.rindex(')');f=t[j+2:].split()
   if 'Qt'in t[:j]:rows.append({'pid':int(d.name),'state':f[0],'ppid':int(f[1]),'startTicks':int(f[19])})
  except OSError:pass
assert len(rows)==1132 and all(x['state']=='Z'and x['ppid']==1 for x in rows)and max(x['startTicks']for x in rows)==20062245
history=[]
for path in sorted(B.glob('burst-viewport-session-actual83bd*-runtime/host.json')):
 h=json.loads(path.read_text());assert h['cleanup']['complete']and h['normalPageClosureConfirmed']and h['debugPortClosed']and all(not h['cleanup'][k]for k in ['signals','remaining','ownershipFailures','signalFailures']);assert all(not Path('/proc/'+str(x['pid'])).exists()for x in h['cleanup']['reaped']);history.append({'path':str(path),'sha256':sha(path.read_bytes()),'cleanupVerified':True})
stat=os.statvfs(B);available=stat.f_bavail*stat.f_frsize;assert available>1073741824+33554432
record={'producerPins':len(pins),'source':str(D),'observedUnixTime':time.time(),'qtCount':len(rows),'zombieCount':len(rows),'liveQtCount':0,'latestQtZombieStartTicks':20062245,'qtProcesses':rows,'history':history,'availableBytes':available,'minimumBytes':1073741824,'expectedBytes':33554432,'timeoutSeconds':180,'scope':'read-only admission; all current Qt zombies predate managed trials, no signals'}
out=B/(D.name.replace('-source','-preflight')+'.json');out.write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({k:v for k,v in record.items()if k not in ['qtProcesses','history']}))
