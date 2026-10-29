from pathlib import Path
from fractions import Fraction as F
import sys,json,gzip,hashlib,struct
assert len(sys.argv)==2,'Pass existing85j raw directory';O=Path(sys.argv[1])
def decode(v):
 if isinstance(v,dict):
  if list(v)==['$f64']:return struct.unpack('>d',bytes.fromhex(v['$f64']))[0]
  return{k:decode(x)for k,x in v.items()}
 if isinstance(v,list):return[decode(x)for x in v]
 return v
def load(root,name):
 r=json.loads((root/'result.json').read_text());assert r['complete'] and not r['errors'];row=next(x for x in r['raw']if x['file']==name+'.json.gz');g=(root/row['file']).read_bytes();b=gzip.decompress(g);assert len(g)==row['gzipBytes'] and hashlib.sha256(g).hexdigest()==row['gzipSHA256'];assert len(b)==row['jsonBytes'] and hashlib.sha256(b).hexdigest()==row['sha256'];return decode(json.loads(b))
samples=load(O,'destination');assert samples['beforeBitmapReadbackAccepted'] and samples['finalReadback']['accepted'] and samples['finalReadback']['requiredMargin']==2;actual=samples['actual'];circle=samples['circle'];cx,cy,rr=F(circle['cx']),F(circle['cy']),F(circle['r'])+F(circle['margin']);minSlack=None;counts={'fillRect':0,'stroke':0,'fillText':0};checks=0
for sample,row in zip(samples['samples'],actual['rows'],strict=True):
 assert sample['pass']==row['pass'] and sample['before']==sample['after'] and sample['postPristine'];v=sample['value'];assert len(v['records'])==len(row['paint'])==len(v['supports']);assert v['counts']['paintCalls']==0
 for s,support,p in zip(v['records'],v['supports'],row['paint'],strict=True):
  assert s['kind']==p['kind'] and s['matrix']==p['matrix'] and s['alpha']==p['state']['alpha'] and s['bounds']==support['bounds'];m=list(map(F,p['matrix']));kind=p['kind'];counts[kind]+=1
  if kind=='fillRect':
   assert s['args']==p['args'] and s['color']==p['state']['fillStyle'];x,y,w,h=map(F,p['args']);x0,x1=sorted([x,x+w]);y0,y1=sorted([y,y+h])
  elif kind=='stroke':
   assert len(p['path'])==2 and p['path'][0]['key']=='moveTo' and p['path'][1]['key']=='lineTo';assert all(q['matrix']==p['matrix']for q in p['path']);points=[q['args']for q in p['path']];assert s['points']==points and s['lineWidth']==p['state']['lineWidth'] and s['lineCap']==p['state']['lineCap']=='butt' and s['lineJoin']==p['state']['lineJoin']=='miter' and s['color']==p['state']['strokeStyle'];pad=F(p['state']['lineWidth'])/2;xs=[F(q[0])for q in points];ys=[F(q[1])for q in points];x0,x1=min(xs)-pad,max(xs)+pad;y0,y1=min(ys)-pad,max(ys)+pad
  else:
   assert kind=='fillText' and s['args']==p['args'] and s['font']==p['state']['font'] and s['ink']==p['metrics'] and s['color']==p['state']['fillStyle'];text,x,y=p['args'];assert x==0 and y==0;i=p['metrics'];x0=-F(i['actualBoundingBoxLeft'])-1;x1=F(i['actualBoundingBoxRight'])+1;y0=-F(i['actualBoundingBoxAscent'])-1;y1=F(i['actualBoundingBoxDescent'])+1
  bound=s['bounds'];bx0,bx1,by0,by1=[F(bound[k])for k in ['x0','x1','y0','y1']];assert 2<=bx0<=bx1<=958 and 2<=by0<=by1<=538;nx=max(bx0,min(cx,bx1));ny=max(by0,min(cy,by1));assert (nx-cx)**2+(ny-cy)**2>rr**2;slack=min(bx0,by0,960-bx1,540-by1);minSlack=slack if minSlack is None else min(minSlack,slack);corners=[(m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5])for x in[x0,x1]for y in[y0,y1]];bound=s['bounds'];assert F(bound['x0'])<=min(x for x,y in corners)-2;assert F(bound['x1'])>=max(x for x,y in corners)+2;assert F(bound['y0'])<=min(y for x,y in corners)-2;assert F(bound['y1'])>=max(y for x,y in corners)+2;checks+=4
print(json.dumps({'passed':True,'own':len(actual['rows']),'supports':sum(counts.values()),'counts':counts,'containmentChecks':checks,'minStageSlack':float(minSlack),'scope':'actual recorded rect/single butt-line/glyph ink Fraction outer envelope,1fontpx/2devicepx raster premise;1held actual destination/current input; stage/circle verified for these supports, no allclock/owner/UI'},indent=2))
