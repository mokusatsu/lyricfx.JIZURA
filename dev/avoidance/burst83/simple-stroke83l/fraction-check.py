from pathlib import Path
from fractions import Fraction as F
import json,gzip,hashlib,struct,sys
full,pilot,pre,corrected,approved,out=map(Path,sys.argv[1:]);data=json.loads(corrected.read_text());summary=json.loads((corrected.parent/'summary.json').read_text())
def load(result,name):
 r=json.loads(result.read_text());row=next(v for v in r['raw']if v['file']==name);g=(result.parent/name).read_bytes();a=gzip.decompress(g);assert len(g)==row['gzipBytes'] and hashlib.sha256(g).hexdigest()==row['gzipSHA256'];assert len(a)==row['jsonBytes'] and hashlib.sha256(a).hexdigest()==row['sha256'];return json.loads(a)
def decode(x):
 if isinstance(x,dict)and '$f64'in x:return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
 if isinstance(x,dict):return{k:decode(v)for k,v in x.items()}
 if isinstance(x,list):return[decode(v)for v in x]
 return x
prior=next(c for c in load(pilot,'candidate-pilot.json.gz')['cases']if c['text']=='風の先へ');old={round(f['t']*60):f for f in prior['frames']};byN={}
for s in data['supports']:byN.setdefault(s['stateN'],[]).append(s)
a=json.loads(approved.read_text());delta=list(map(F,a['delta']));circle={k:F(v)for k,v in summary['circle'].items()};checked=0;line=0;arc=0;checks=0
for n,rows in sorted(byN.items()):
 frame=old.get(n)or load(pre if n in[0,12,249]else full,'state-'+str(n).zfill(3)+'.json.gz')
 for s in rows:
  encoded=frame['rows'][s['rowIndex']]['paint'][s['ordinal']];p=decode(encoded);b={k:F(v)for k,v in s['bounds'].items()}
  if p['kind']=='stroke':
   assert all(v['matrix']==encoded['matrix']for v in encoded['path']);st=p['state'];assert st['lineCap']=='butt'and st['lineJoin']=='miter'and st['miterLimit']==10 and not st['dash'];pad=F(st['lineWidth'])/2
   if len(p['path'])==2 and [v['key']for v in p['path']]==['moveTo','lineTo']:
    points=[[F(v)for v in cmd['args'][:2]]for cmd in p['path']];line+=1
   else:
    assert len(p['path'])==1 and p['path'][0]['key']=='arc';x,y,r=map(F,p['path'][0]['args'][:3]);points=[[x-r,y-r],[x+r,y+r]];arc+=1
   x0=min(p[0]for p in points)-pad;x1=max(p[0]for p in points)+pad;y0=min(p[1]for p in points)-pad;y1=max(p[1]for p in points)+pad;m=list(map(F,p['matrix']));q=[(m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5])for x in[x0,x1]for y in[y0,y1]];exact=dict(x0=min(x for x,y in q)-2,x1=max(x for x,y in q)+2,y0=min(y for x,y in q)-2,y1=max(y for x,y in q)+2)
   for k,v in exact.items():assert b[k]<=v if k.endswith('0')else b[k]>=v;checks+=1
   checked+=1
  x0,x1=b['x0']+delta[0],b['x1']+delta[0];y0,y1=b['y0']+delta[1],b['y1']+delta[1];assert x0>=0 and y0>=0 and x1<=960 and y1<=540;nx=max(x0,min(circle['cx'],x1));ny=max(y0,min(circle['cy'],y1));assert (nx-circle['cx'])**2+(ny-circle['cy'])**2>(circle['r']+circle['margin'])**2;checks+=2
assert checked==4777 and line==4750 and arc==27
report=dict(passed=True,checkedStroke=checked,line=line,arc=arc,checks=checks,totalSupports=len(data['supports']),idealApprovedDelta=list(map(float,delta)),correctedSHA256=hashlib.sha256(corrected.read_bytes()).hexdigest(),scriptSHA256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),scope='independent exact Fraction half-width affine enclosure and ideal translation stage/circle; observed raster premise remains conditional; no new Canvas drawing or destination qualification')
out.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
