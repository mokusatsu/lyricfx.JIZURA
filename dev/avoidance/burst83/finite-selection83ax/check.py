"""Source/pin/raw, changed-circle exact-box proof and prior-right numeric audit."""
from pathlib import Path
from fractions import Fraction as F
import gzip,json,hashlib,struct,sys,math
D=Path(sys.argv[1]);R=Path(__file__).resolve().parents[4];U=Path(__file__).resolve().parent;r=json.loads((D/'result.json').read_text());assert r['complete']and not r['errors']and r['postPinsUnchanged']
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert(len(b),hashlib.sha256(b).hexdigest())==(p['bytes'],p['sha256'])
def raw(root,p):
 g=(root/p['file']).read_bytes();b=gzip.decompress(g);assert(len(g),hashlib.sha256(g).hexdigest(),len(b),hashlib.sha256(b).hexdigest())==(p['gzipBytes'],p['gzipSHA256'],p['jsonBytes'],p['sha256']);return json.loads(b)
def decode(v):
 if isinstance(v,list):return[decode(x)for x in v]
 if isinstance(v,dict):
  if set(v)=={'$f64'}:return struct.unpack('>d',bytes.fromhex(v['$f64']))[0]
  return{k:decode(x)for k,x in v.items()}
 return v
values={p['file']:decode(raw(D,p))for p in r['raw']};x=values['formal.json.gz'];p=x['ready']['proof'];selection=p['selection'];b=selection['sourceUnion'];circle=p['circle'];delta=p['delta'];assert selection['side']=='left'and selection['zeroClear']is False and circle=={'cx':672,'cy':.42*540,'r':108,'margin':2.7};assert x['ready']['counts']=={'states':250,'own':727,'supports':9047,'glyphs':2872,'zeroReplayOwn':727};assert p['checkedOwn']==727 and p['checkedSupports']==9047 and x['ready']['peak']<=8388608
# Exact rational rectangle containing the captured all-clock source supports.
q={k:F(v)for k,v in b.items()};dx,dy=map(F,delta);q={k:v+(dx if k[0]=='x'else dy)for k,v in q.items()};assert 0<=q['x0']<=q['x1']<=960 and 0<=q['y0']<=q['y1']<=540;cx,cy=F(circle['cx']),F(circle['cy']);nx=max(q['x0'],min(cx,q['x1']));ny=max(q['y0'],min(cy,q['y1']));distance2=(nx-cx)**2+(ny-cy)**2;radius=F(circle['r'])+F(circle['margin']);assert distance2>radius**2
old=D.parent/'burst-formal-binding83aw-actual01';rr=json.loads((old/'result.json').read_text());assert rr['complete']and not rr['errors'];old_values={p['file']:decode(raw(old,p))for p in rr['raw']};before=old_values['formal.json.gz'];assert values['fresh-input.json.gz']['planCore']==old_values['fresh-input.json.gz']['planCore'],'CURRENT_SOURCE_INPUT_CORE_CHANGED'
old_delta=before['formal']['trajectory']['sourceProof']['deviceDelta'];old_circle={'cx':480,'cy':.42*540,'r':108,'margin':2.7};gy=max(b['y0']-old_circle['cy'],0,old_circle['cy']-b['y1']);hx=math.sqrt(max(0,(old_circle['r']+old_circle['margin'])**2-gy**2));right=max(-b['x0'],old_circle['cx']+hx-b['x0']+4);assert [right,0]==old_delta
# The previous valid right proposal wins before the remaining finite order.
assert b['x1']+right<=960 and b['y0']>=0 and b['y1']<=540
assert [f['n']for f in x['rows']]==[6,60,231]and all(f['t']==f['n']/60 for f in x['rows']);assert all(len(f['hash'])==64 for f in x['rows']);assert x['formal']['admitted']and x['formal']['placementUnitsAbsent'];tr=x['formal']['trajectory'];assert tr['sourceProof']['deviceDelta']==delta and tr['sourceProof']['checkedOwn']==727 and tr['sourceProof']['checkedSupports']==9047 and not tr['sourceProof']['formalPerformanceAccepted']and not tr['sourceProof']['uiConnected'];assert tr['evaluationRange']==[-1/60,4.77]
assert [v['code']for v in x['rejects']]==['STALE_PLACEMENT_PLAN','BURST83AG_FRAME_SCOPE','BULBS80T_OWNED_PLAN_REQUIRED','BULBS80T_OWNED_PLAN_REQUIRED'];assert all(v['before']==v['after']for v in x['rejects']);s=x['afterStats'];assert not s['staged']and not s['preparing']and not s['ready']and s['formal']['bindings']==s['formal']['certificates']==0
old_source=(R/'dev/avoidance/burst83/formal-binding83av/private-controller83.js').read_text();new=(U/'private-controller83.js').read_text();a=new.index('// Input-derived proposal only.');z=new.index('let installed83ag=null;',a);back=new[:a]+new[z:];back=back.replace("const selection=chooseDestination83ax(model.sourceUnion,circle);choices=selection.choices;const chosen=selection.chosen;need(chosen,'BURST83AX_FINITE_CANDIDATE_INSUFFICIENT');","choices=G.positions([{bounds:model.sourceUnion}],circle,{evaluate:false});const chosen=choices.find(x=>x.side==='right');need(chosen,'BURST83Z_FINITE_RIGHT_INSUFFICIENT');");back=back.replace("selection:{side:chosen.side,sourceUnion:selection.sourceUnion,zeroClear:selection.zeroClear,finiteCount:choices.length,policy:selection.policy},",'');back=back.replace('+C.serializedBytes(selection)+4096;',';');assert back==old_source,'UNEXPECTED_CONTROLLER_SOURCE_CHANGE'
h=json.loads(D.with_name(D.name+'-runtime').joinpath('host.json').read_text());assert h['complete']and h['probeExit']==0 and h['normalPageClosureConfirmed']and h['cleanup']['complete']and not h['cleanup']['remaining']and not h['cleanup']['signals']and h['debugPortClosed']
print(json.dumps({'passed':True,'pins':len(r['pins']),'raw':len(r['raw']),'wholeOwner':727,'wholeSupports':9047,'selection':selection['side'],'delta':delta,'strictFractionCircleAndStage':True,'originalCircleRightDeltaNumericallyEqual':old_delta,'originalCircleRedrawn':False,'formalFrames':3,'atomicRefusals':4,'prepareMs':x['prepareMs'],'maxStepMs':max(x['steps']),'finalizeMs':x['finalizeMs'],'scope':'new circle finite selection and unchanged whole-owner replay; sourceUnion Fraction containment; no new all-paint observer/continuous-time/UI/performance or actual zero-frame qualification'}))
