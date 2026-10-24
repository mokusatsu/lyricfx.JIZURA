# Pure Python source-predicate algebra, not JS/helper/module/browser execution.
from pathlib import Path
import struct,json,gzip,hashlib,math
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-blocks-bounded01';rawpath=D/'evidence/diagnostic01.raw.json.gz';raw=json.loads(gzip.decompress(rawpath.read_bytes()));sha=lambda b:hashlib.sha256(b).hexdigest()
pin=next(p for p in raw['invocation']['pins']['files'] if p['path']=='dev/avoidance/layouts-b-fixture.js');assert sha((R/pin['path']).read_bytes())==pin['sha256'];assert 'outDur:.4' in (R/pin['path']).read_text()
def bits(x):return struct.unpack('>Q',struct.pack('>d',x))[0]
def value(x):return struct.unpack('>d',struct.pack('>Q',x))[0]
def previous(x):return value(bits(x)-1) if x else None
def clamp(x):return max(0,min(1,x))
def first_true(last,predicate):
 if not predicate(last):return None
 if predicate(0):return 0.
 lo=0;hi=bits(last)
 while hi-lo>1:
  mid=(lo+hi)//2
  if predicate(value(mid)):hi=mid
  else:lo=mid
 result=value(hi);assert predicate(result) and not predicate(previous(result));return result
cases=[];forced_checked=0;expired=0
for r in raw['results']:
 c=r['current'];g=c['diagnostic']['sourceCatalog'] if c['diagnostic'] else None
 if not g:continue
 duration=c['spec'].get('duration',4);out_dur=.4;last=previous(duration);table=[]
 for b in g['blocks']:
  when=.06+(b['order']+1)*g['gap'];f=lambda t:(t-when)/g['fd'];q=lambda t:clamp(clamp((t-(duration-out_dur))/out_dur)*1.4-(b['order']+1)/(g['n']+3)*.4)
  endpoints={k:first_true(last,p) for k,p in [('bodyStart',lambda t:f(t)>=0),('settledStart',lambda t:f(t)>=1),('movingStart',lambda t:q(t)>0),('tailStart',lambda t:q(t)==1)]}
  table.append({'sourceIndex':b['sourceIndex'],'when':when,**endpoints})
  for row in c['forcedDirect']['rows']:
   t=row['ownLt'];original=row['blocks'][b['sourceIndex']]
   assert f(t)==original['f'] and q(t)==original['q']
   if not 0<=t<duration:expired+=1;continue
   forced_checked+=1
   if f(t)<0:assert endpoints['bodyStart'] is None or t<endpoints['bodyStart'];continue
   fall='entry' if f(t)<1 else 'settled';exit='q0' if q(t)==0 else 'q1' if q(t)==1 else 'moving'
   assert t>=endpoints['bodyStart']
   assert (fall=='entry')==(endpoints['settledStart'] is None or t<endpoints['settledStart'])
   assert (exit=='q0')==(endpoints['movingStart'] is None or t<endpoints['movingStart'])
   assert (exit=='q1')==(endpoints['tailStart'] is not None and t>=endpoints['tailStart'])
 cases.append({'id':c['spec']['id'],'durationLiteral':duration,'outDurLiteral':out_dur,'lastActiveOwnLt':last,'endpoints':table})
out={'scope':'Offline source scalar algebra only; NO new JS/module/browser/helper run','inputRaw01SHA256':sha(rawpath.read_bytes()),'fixtureLiteralOutDur':out_dur,'fixtureSourceSHA256':pin['sha256'],'cases':cases,'forcedOriginalBlockPredicatesMatchedExactly':forced_checked,'expiredBlockProbesExcluded':expired,'newHelperExecuted':False,'geometrySafetyClaim':False}
(D/'evidence/branch02-source-algebra.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'cases':len(cases),'forcedBlockPredicatesExact':forced_checked,'expiredExcluded':expired}))
