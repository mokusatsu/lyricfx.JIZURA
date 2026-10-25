"""Small numeric checker probe from accepted30 records; no renderer/media execution."""
from pathlib import Path
import copy,gzip,json,runpy,collections
HERE=Path(__file__).parent;M=runpy.run_path(str(HERE/'checker31.py'));dec=M['dec'];raw=Path('/dev/shm/avoid009-contour30-source30-review-only-20261025c/raw');manifest=json.loads((raw/'manifest.json').read_bytes());init=None;clock=None;paints=[]
for pin in manifest['records']:
 v=dec(json.loads(gzip.decompress((raw/pin['file']).read_bytes())))
 if pin['phase']=='init':init=v
 if v.get('phase')=='clock':clock=v['clock']
 if v.get('phase')=='native' and v['n']==72:paints.append(v)
 if len(paints)==3:break
assert init and clock and len(paints)==3
passes=[]
for row in paints:
 r=copy.deepcopy(row['render'])
 for call in r['calls']:call['clock']['realTime']=1.2
 passes.append({**r,'finalRoot':r['root'],'clock':{'pass':row['own']['pass'],**r['calls'][0]['clock']}})
f={'n':72.,'time':1.2,'firstTime':next(s for s in clock['states'] if s['n']==72)['firstTime'],'mode':'native','spec':None,'passes':passes,'records':[r for p in passes for r in p['records']],'supports':[s for p in passes for s in p['supports']],'positivePaintCount':sum(r['state']['alpha']>0 for p in passes for r in p['records']),'frameFailure':None,'rgbaSHA256':'0'*64,'adapterRegistered':False}
packetInit={'plan':init['plan'],'clocks':clock};M['framecheck'](f,72,'native',packetInit,collections.Counter());rejected=[]
for field in ['lt','realTime']:
 bad=copy.deepcopy(f);bad['passes'][0]['calls'][0]['clock'][field]+=.125
 try:M['framecheck'](bad,72,'native',packetInit,collections.Counter())
 except AssertionError as e:assert str(e)=='actual sourcecall clock '+field;rejected.append(field)
 else:raise AssertionError('actual media clock change admitted '+field)
result={'state':'PASS_MEDIA31_MINIMAL_NUMERIC_CHECKER_PROBE','positive':1,'modifiedClockRejected':rejected,'basedOn':'accepted30 state72 records with explicit exact-j realTime substitution; synthetic checker input only','RendererFramesExecuted':0,'CanvasRuns':0,'mediaRun':False};(HERE/'pure31-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
