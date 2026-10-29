"""Finite viewport candidate diagnostic on observed source rectangles; no issuer."""
import gzip,json,math,struct,sys
from fractions import Fraction as F
from pathlib import Path

def number(x):return struct.unpack('>d',bytes.fromhex(x['$f64']))[0] if isinstance(x,dict) else x

def evaluate(boxes,delta,circle,width,height):
 dx,dy=map(F,delta);cx,cy,r=map(F,circle);bad=[]
 for i,b in enumerate(boxes):
  x0,x1=F(b['x0'])+dx,F(b['x1'])+dx;y0,y1=F(b['y0'])+dy,F(b['y1'])+dy
  nx=max(x0,min(cx,x1));ny=max(y0,min(cy,y1));stage=x0<0 or y0<0 or x1>width or y1>height
  conflict=(cx-nx)**2+(cy-ny)**2<=r*r
  if stage or conflict:bad.append({'i':i,'stage':stage,'circle':conflict})
 return {'passed':not bad,'checked':len(boxes),'failureCount':len(bad),'witness':bad[:16]}

def candidates(boxes,circle,w,h):
 b={k:(min if k.endswith('0') else max)(x[k]for x in boxes)for k in ['x0','y0','x1','y1']}
 xlo,xhi=-b['x0'],w-b['x1'];ylo,yhi=-b['y0'],h-b['y1']
 if xlo>xhi or ylo>yhi:return []
 clamp=lambda x,a,z:max(a,min(z,x));dx=clamp(0,xlo,xhi);dy=clamp(0,ylo,yhi);cx,cy,r=circle
 gy=max(b['y0']+dy-cy,0,cy-b['y1']-dy);gx=max(b['x0']+dx-cx,0,cx-b['x1']-dx)
 hx=math.sqrt(max(0,r*r-gy*gy));hy=math.sqrt(max(0,r*r-gx*gx));spare=4 # device pixels, finite heuristic only
 ranges=[('right','x',max(xlo,cx+hx-b['x0']+spare),xhi,dy),('left','x',xlo,min(xhi,cx-hx-b['x1']-spare),dy),('bottom','y',max(ylo,cy+hy-b['y0']+spare),yhi,dx),('top','y',ylo,min(yhi,cy-hy-b['y1']-spare),dx)]
 out=[];seen=set()
 for side,axis,lo,hi,other in ranges:
  if lo>hi:continue
  for v in [clamp(0,lo,hi),lo+(hi-lo)/2]:
   delta=(v,other)if axis=='x'else(other,v)
   if delta in seen:continue
   seen.add(delta);out.append({'side':side,'delta':delta,'evaluation':evaluate(boxes,delta,circle,w,h)})
 return out

if __name__=='__main__':
 v=json.loads(gzip.decompress(Path(sys.argv[1]).read_bytes()));regions=v['before']['lyricAvoidanceIndex']['regions'];assert len(regions)==1;region=regions[0];out=[]
 for c in v['out']:
  w,h=c['width'],c['height'];margin=.005*h # scales existing canonical2.7 plan clearance; distinct from fixed2devicepx support pad
  circle=[number(region['center']['x'])*w,number(region['center']['y'])*h,number(region['radius'])*h+margin]
  boxes=[s['bounds']for row in c['rows']for s in row['supports']];cs=candidates(boxes,circle,w,h)
  out.append({'scale':c['scale'],'width':w,'height':h,'circle':circle,'margin':margin,'supports':len(boxes),'candidates':cs})
 print(json.dumps({'viewports':out,'scope':'t1 observed native supports plus ideal device translation only; no destination draw, whole-clock, private model or authority'},indent=2))
