"""Host-only exact dyadic audit of native observed actual-CTM supports."""
import gzip,hashlib,json,sys,struct
from pathlib import Path
from fractions import Fraction as F

def check(directory):
 d=Path(directory); result=json.loads((d/'result.json').read_text()); assert result['complete'] and not result['errors']
 for p in result['pins']:
  b=Path(p['path']).read_bytes(); assert len(b)==p['bytes'] and hashlib.sha256(b).hexdigest()==p['sha256']
 values={}
 for p in result['raw']:
  g=(d/(p['file'])).read_bytes(); b=gzip.decompress(g)
  assert len(g)==p['gzipBytes'] and hashlib.sha256(g).hexdigest()==p['gzipSHA256']
  assert len(b)==p['jsonBytes'] and hashlib.sha256(b).hexdigest()==p['sha256']; values[p['file'].removesuffix('.json.gz')]=json.loads(b)
 v=values['shift-pilot']; v['out']=[v]; assert v['before']==v['after']; assert v['statsBefore']['owner']['compiles']==v['statsAfter']['owner']['compiles']
 count=0
 for case in v['out']:
  assert case['postPristine']; assert len(case['rows'])==3
  for row in case['rows']:
   for support in row['supports']:
    p=support['record']; kind=p['kind']; pad=F(0)
    if kind.endswith('Text'):
     m=p['metrics']; x,y=map(F,p['args'][1:3]); q=F(1)
     if kind=='strokeText': q+=F(p['state']['lineWidth'])*F(p['state']['miterLimit'])/2
     x0=x-F(m['actualBoundingBoxLeft'])-q;x1=x+F(m['actualBoundingBoxRight'])+q
     y0=y-F(m['actualBoundingBoxAscent'])-q;y1=y+F(m['actualBoundingBoxDescent'])+q
     points=[(x0,y0),(x1,y0),(x1,y1),(x0,y1)]
    elif kind.endswith('Rect'):
     x,y,w,h=map(F,p['args']);points=[(x,y),(x+w,y),(x+w,y+h),(x,y+h)]
     if kind=='strokeRect':pad=F(p['state']['lineWidth'])*F(p['state']['miterLimit'])/2
    else:
     arcs=[c for c in p['path'] if c['key']=='arc']
     if arcs:
      assert len(arcs)==1 and kind=='fill';arc=arcs[0]; assert arc['matrix']==p['matrix'];x,y,r=map(F,arc['args'][:3]);points=[(x-r,y-r),(x+r,y-r),(x+r,y+r),(x-r,y+r)]
     else:
      points=[]
      for c in p['path']:
       assert c['key'] in ['moveTo','lineTo','closePath']
       if c['key']!='closePath':assert c['matrix']==p['matrix'];points.append(tuple(map(F,c['args'][:2])))
      assert len(points)>=3
      if kind=='stroke':pad=F(p['state']['lineWidth'])*F(p['state']['miterLimit'])/2
    if pad:
     xs,ys=zip(*points);x0,x1=min(xs)-pad,max(xs)+pad;y0,y1=min(ys)-pad,max(ys)+pad;points=[(x0,y0),(x1,y0),(x1,y1),(x0,y1)]
    a,b,c,e,tx,ty=map(F,p['matrix']);actual=[(a*x+c*y+tx,b*x+e*y+ty)for x,y in points];xs,ys=zip(*actual)
    exact=dict(x0=min(xs)-2,x1=max(xs)+2,y0=min(ys)-2,y1=max(ys)+2);bounds={k:F(x)for k,x in support['bounds'].items()}
    assert bounds['x0']<=exact['x0'] and bounds['y0']<=exact['y0'] and bounds['x1']>=exact['x1'] and bounds['y1']>=exact['y1'];count+=1
 assert count==126
 region=v['before']['lyricAvoidanceIndex']['regions'][0]
 number=lambda x:struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
 w,h=v['width'],v['height'];circle=v['circle']['circle'];cx,cy=F(circle['cx']),F(circle['cy']);radius=F(circle['r'])+F(circle['margin']);base=F(v['circle']['baseScale']);canonical=v['circle']['canonical'];assert F(circle['r'])>=F(canonical['r'])*base+abs(cx-F(canonical['cx'])*base)+abs(cy-F(canonical['cy'])*base);assert F(circle['margin'])>=2 and F(circle['margin'])>=F(canonical['margin'])*base;slack=[]
 for row in v['rows']:
  assert row['quality']['passed'] and not row['quality']['failures']
  assert row['reference']['sourceInputs']==row['catalog']['sourceInputs'] and row['reference']['clock']==row['catalog']['clock']
  for support in row['supports']:
   b={k:F(x)for k,x in support['bounds'].items()};x0,x1,y0,y1=b['x0'],b['x1'],b['y0'],b['y1']
   assert x0>=0 and y0>=0 and x1<=w and y1<=h
   nx=max(x0,min(cx,x1));ny=max(y0,min(cy,y1));assert (nx-cx)**2+(ny-cy)**2>radius**2
   slack.append(min(x0,y0,F(w)-x1,F(h)-y1))
 print(json.dumps({'stageCircleStrict':count,'approximateStageSlack':float(min(slack)),'qualityPasses':len(v['rows']),'scope':'one sampled t1 only; original3pass quality/soft0 retained'}))
 return dict(supports=count,checks=count*4,scope='normalized source compact shifted t1 viewport.75 only; 1fontpx plus fixed2devicepx; no placement authority')
if __name__=='__main__':print(json.dumps(check(sys.argv[1])))
