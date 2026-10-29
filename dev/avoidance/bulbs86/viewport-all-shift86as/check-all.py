"""Host-only exact dyadic audit of native observed actual-CTM supports."""
import gzip,hashlib,json,sys,struct
from pathlib import Path
from fractions import Fraction as F

def restore_catalog(catalog):
 assert catalog['sourceCallProjection']=='f64-matrix-refs86ar'
 table=catalog['sourceCallMatrices']; assert len(table)<=2048
 keys=[]; restored=[]; used=set()
 for matrix in table:
  assert len(matrix)==6
  bits=[]
  for x in matrix:
   assert set(x)=={'$f64'} and len(x['$f64'])==16
   value=struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
   assert __import__('math').isfinite(value)
   bits.append(x['$f64'])
  keys.append(tuple(bits));restored.append([struct.unpack('>d',bytes.fromhex(x['$f64']))[0] for x in matrix])
 assert len(keys)==len(set(keys))
 calls=[]
 for i,call in enumerate(catalog['sourceCalls']):
  assert call['ordinal']==i and call['role']=='primary'
  out=dict(call)
  for suffix in ['Before','After']:
   index=out.pop('matrix'+suffix+'CallRef');assert type(index) is int and 0<=index<len(table);used.add(index)
   out['matrix'+suffix+'Call']=restored[index]
  calls.append(out)
 assert used==set(range(len(table)))
 return calls

def audit_projection(case):
 count=0
 assert case['diagnosticProjection']=='unique-records-and-source-matrix-refs86ar'
 for row in case['rows']:
  calls=restore_catalog(row['catalog']);restore_catalog(row['reference'])
  assert len(row['sourceCallIndexByRecord'])==len(row['records'])
  expected=[i for i,r in enumerate(row['records']) if r['state']['alpha']>0]
  assert [s['recordIndex'] for s in row['supports']]==expected
  assert len({c['owner'] for c in calls})==len(calls)
  previous=-1
  for record,index in zip(row['records'],row['sourceCallIndexByRecord']):
   assert type(index) is int and previous<=index<len(calls)
   call=calls[index];previous=index
   assert call['owner']==record['owner'] and call['role']==record['role']=='primary' and record['pass']==row['pass']
   assert record['kind'] in {'poly':['fill'],'outline':['stroke'],'circle':['fill'],'mainDraw':['fillText','strokeText'],'draw':['fillText','strokeText']}[call['kind']]
   count+=1
 return count

def check(directory):
 d=Path(directory); result=json.loads((d/'result.json').read_text()); assert result['complete'] and not result['errors']
 assert len(result['pins'])==51 and len(result['raw'])==251
 assert sum(p['jsonBytes'] for p in result['raw'])<=128*1024*1024
 assert sum(p['gzipBytes'] for p in result['raw'])<=32*1024*1024
 assert all(p['jsonBytes']<=8*1024*1024 and Path(p['file']).name==p['file'] for p in result['raw'])
 for p in result['pins']:
  b=Path(p['path']).read_bytes(); assert len(b)==p['bytes'] and hashlib.sha256(b).hexdigest()==p['sha256']
 values={}
 for p in result['raw']:
  g=(d/(p['file'])).read_bytes(); b=gzip.decompress(g)
  assert len(g)==p['gzipBytes'] and hashlib.sha256(g).hexdigest()==p['gzipSHA256']
  assert len(b)==p['jsonBytes'] and hashlib.sha256(b).hexdigest()==p['sha256']; values[p['file'].removesuffix('.json.gz')]=json.loads(b)
 reused=result['reused']['pilot']; g=Path(reused['path']).read_bytes(); b=gzip.decompress(g); assert len(g)==reused['gzipBytes'] and hashlib.sha256(g).hexdigest()==reused['gzipSHA256']; assert len(b)==reused['jsonBytes'] and hashlib.sha256(b).hexdigest()==reused['sha256']; pilot=json.loads(b); assert result['reused']['n']==60 and result['reused']['time']==1; assert all(row['catalog']['clock']['realTime']==1 for row in pilot['rows']); pilot['n']=60; pilot['time']=1
 cases=[v for k,v in values.items() if k.startswith('frame-')]+[pilot]
 assert len(cases)==250 and {v.get('n',60) for v in cases}==set(range(250))
 v=pilot; v['out']=cases
 mapping_count=0
 for case in cases:
  assert case['scale']==.75 and (case['width'],case['height'])==(720,405) and case['delta']==pilot['delta'] and case['recipe']==pilot['recipe'] and case['circle']==pilot['circle']
  assert case['before']==pilot['before']
  if 'diagnosticProjection' in case:mapping_count+=audit_projection(case)
  for row in case['rows']:
   assert row['catalog']['clock']['realTime']==case['time']
   assert row['catalog']['sourceInputs']==row['reference']['sourceInputs']
   assert row['catalog']['params']==row['reference']['params'] and row['catalog']['seed']==row['reference']['seed']
   assert row['quality']['neighborInventory']['preferredShortfalls']==0
   glyphs=[dict(owner=r['owner'],kind=r['kind'],text=r['args'][0],font=r['state']['font'],metrics=r['metrics']) for r in row['records'] if r['kind'].endswith('Text')]
   if 'diagnosticProjection' in case:assert glyphs==row['nativeGlyphOrder']
 count=0
 for case in v['out']:
  assert case['postPristine']; assert case['before']==case['after']; assert case['statsBefore']['owner']['compiles']==case['statsAfter']['owner']['compiles']; assert case['time']==case.get('n',60)/60
  for row in case['rows']:
   for support in row['supports']:
    if 'recordIndex' in support:support['record']=row['records'][support['recordIndex']]
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
 assert count==result['summary']['supports']
 region=v['before']['lyricAvoidanceIndex']['regions'][0]
 number=lambda x:struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
 w,h=v['width'],v['height'];circle=v['circle']['circle'];cx,cy=F(circle['cx']),F(circle['cy']);radius=F(circle['r'])+F(circle['margin']);base=F(v['circle']['baseScale']);canonical=v['circle']['canonical'];assert F(circle['r'])>=F(canonical['r'])*base+abs(cx-F(canonical['cx'])*base)+abs(cy-F(canonical['cy'])*base);assert F(circle['margin'])>=2 and F(circle['margin'])>=F(canonical['margin'])*base;slack=[]
 for row in [row for case in cases for row in case['rows']]:
  assert row['quality']['passed']
  if row['catalog']['culled']:
   assert not row['records'] and not row['supports'] and row['quality']['culledSource'] and not row['quality']['passes']
  else:assert not row['quality']['failures']
  assert row['reference']['sourceInputs']==row['catalog']['sourceInputs'] and row['reference']['clock']==row['catalog']['clock']
  for support in row['supports']:
   b={k:F(x)for k,x in support['bounds'].items()};x0,x1,y0,y1=b['x0'],b['x1'],b['y0'],b['y1']
   assert x0>=0 and y0>=0 and x1<=w and y1<=h
   nx=max(x0,min(cx,x1));ny=max(y0,min(cy,y1));assert (nx-cx)**2+(ny-cy)**2>radius**2
   slack.append(min(x0,y0,F(w)-x1,F(h)-y1))
 print(json.dumps({'stageCircleStrict':count,'projectedPaintCallMappings':mapping_count,'newFrames':249,'reusedFrames':1,'approximateStageSlack':float(min(slack)),'qualityPasses':sum(len(case['rows']) for case in cases),'scope':'250 finite j/60 samples; original per-phase quality retained; no authority'}))
 return dict(supports=count,checks=count*4,scope='normalized source compact shifted 250 j/60 viewport.75 only; 1fontpx plus fixed2devicepx; no placement authority')
if __name__=='__main__':print(json.dumps(check(sys.argv[1])))
