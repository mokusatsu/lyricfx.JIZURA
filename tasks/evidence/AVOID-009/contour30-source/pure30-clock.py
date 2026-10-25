"""Only actual-clock helper positive and two single-field rejection checks. No Canvas."""
from pathlib import Path
import copy,gzip,json
HERE=Path(__file__).parent
ns={'__name__':'contour30_clock_pure','__file__':str(HERE/'checker30.py')};exec(compile((HERE/'checker30.py').read_text(),str(HERE/'checker30.py'),'exec'),ns)
raw=Path('/dev/shm/avoid009-contour29-source29-actual01-20261025c/raw');m=json.loads((raw/'manifest.json').read_bytes());rows=[ns['dec'](json.loads(gzip.decompress((raw/p['file']).read_bytes()))) for p in m['records']]
init=next(r for r in rows if isinstance(r,dict) and 'plan' in r and 'fontAudit' in r);r=next(r for r in rows if isinstance(r,dict) and r.get('t')==1.2 and r.get('own',{}).get('pass')=='main' and r.get('name')=='native')
row={'n':72.,'own':{**r['own'],'active':True},'realTime':r['t']};C={'states':[{'n':72.,'firstTime':r['t'],'passes':[row['own']]}]};actual=r['observed'];cut=init['plan']['cuts'][0]
ns['actual_clock'](row,actual,C,cut)
rejected=[]
for field in ['lt','realTime']:
 bad=copy.deepcopy(actual);bad['calls'][0]['clock'][field]+=.125
 try:ns['actual_clock'](row,bad,C,cut)
 except AssertionError as e:assert str(e)=='actual sourcecall clock '+field;rejected.append(field)
 else:raise AssertionError('single-field clock modification admitted '+field)
out={'state':'PASS_ACTUAL_CLOCK_MINIMAL_PURE','positive':1,'singleFieldRejected':rejected,'CanvasRuns':0,'fullClockRerun':False};(HERE/'pure30-clock-results.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
