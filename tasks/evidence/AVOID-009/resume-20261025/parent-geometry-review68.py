"""Independent exact-Fraction geometry review; no browser or application claim."""
import pathlib,random,math,json,subprocess,hashlib,gzip
from fractions import Fraction as F
R=pathlib.Path('/workspace/lyricfx.JIZURA'); E=R/'tasks/evidence/AVOID-009/resume-20261025'; src=R/'src/11p_layoutsEe_bulbs_geometry68.js'; before=hashlib.sha256(src.read_bytes()).hexdigest(); rng=random.Random(680125); cases=[]
for i in range(1000):
 x=rng.uniform(0,900); y=rng.uniform(0,480); w=rng.uniform(1,60); h=rng.uniform(1,60)
 if i%7==0:x=-math.ulp(1.0)
 cases.append({'supports':[{'owner':'independent.synthetic','bounds':{'x0':x,'y0':y,'x1':x+w,'y1':y+h}}], 'circle':{'cx':rng.uniform(0,960),'cy':rng.uniform(0,540),'r':rng.uniform(1,240),'margin':2.7}, 'delta':[rng.uniform(-12,12),rng.uniform(-12,12)]})
for x in [17.0,math.nextafter(17.0,math.inf),math.nextafter(17.0,-math.inf)]:
 cases.append({'supports':[{'owner':'tangent','bounds':{'x0':x,'y0':9,'x1':20,'y1':11}}],'circle':{'cx':10,'cy':10,'r':5,'margin':2},'delta':[0,0]})
script="const fs=require('node:fs'),vm=require('node:vm');let c={J:{placement:{}}};vm.createContext(c);vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c);let v=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(JSON.stringify(v.map(x=>c.J.placement.bulbsGeometry68.evaluation(x.supports,x.circle,x.delta))));"
q=subprocess.run(['node','-e',script,str(src)],input=json.dumps(cases).encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE);assert q.returncode==0,q.stderr.decode(); actual=json.loads(q.stdout); counts={'passing':0,'circleFail':0,'stageFail':0}
for case,row in zip(cases,actual):
 c=case['circle']; cx,cy=F(c['cx']),F(c['cy']); rr=(F(c['r'])+F(c['margin']))**2; fail=[]
 for i,s in enumerate(case['supports']):
  b=s['bounds'];x0,x1=F(b['x0'])+F(case['delta'][0]),F(b['x1'])+F(case['delta'][0]);y0,y1=F(b['y0'])+F(case['delta'][1]),F(b['y1'])+F(case['delta'][1]); nx=min(x1,max(x0,cx));ny=min(y1,max(y0,cy));circle=(cx-nx)**2+(cy-ny)**2<=rr;stage=x0<0 or y0<0 or x1>960 or y1>540
  if circle or stage:fail.append({'index':i,'owner':s['owner'],'circle':circle,'stage':stage,'conservativeEnvelope':True})
  counts['circleFail']+=circle;counts['stageFail']+=stage
 assert row['passed']==(not fail) and row['checked']==len(case['supports']) and row['failures']==fail,(case,row,fail)
 counts['passing']+=not fail
assert len(actual)==len(cases)==1003 and hashlib.sha256(src.read_bytes()).hexdigest()==before
payload={'scope':'captured-double support rectangle model only; not full paint/Canvas/adapter acceptance','sourceSHA256':before,'seed':680125,'cases':cases,'actual':actual}; raw=json.dumps(payload,separators=(',',':')).encode();out=E/'parent-geometry68-raw.json.gz';out.write_bytes(gzip.compress(raw,mtime=0));report={'state':'PARENT_INDEPENDENT_FRACTION_REVIEW_PASS','cases':len(cases),'counts':counts,'sourceSHA256':before,'rawBytes':len(raw),'archiveBytes':out.stat().st_size,'archiveSHA256':hashlib.sha256(out.read_bytes()).hexdigest(),'browserExecutions':0,'publicChecks':0,'parentImages':0,'fullAdapterAcceptance':False};(E/'parent-geometry68-review.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
