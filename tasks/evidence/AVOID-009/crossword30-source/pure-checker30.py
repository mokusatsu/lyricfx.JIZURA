"""Pure/offline checker calibration; no candidate rendering, no network."""
import sys
sys.dont_write_bytecode=True
import ast,gzip,importlib.util,json,pathlib
B=pathlib.Path(__file__).parent
spec=importlib.util.spec_from_file_location('checker30_pure',B/'checker30.py');C=importlib.util.module_from_spec(spec);spec.loader.exec_module(C)
# Exact Fraction predicates: tangency remains failure, no moving-time exemptions.
c={'cx':480,'cy':226.8,'effectiveRadius':110.7}
def support(x0,y0,x1,y1):return [{'ordinal':0,'owner':'crossword28.rect.0','bounds':{'x0':x0,'y0':y0,'x1':x1,'y1':y1}}]
assert C.geometry(support(2,2,100,100),c)['passed']
assert not C.geometry(support(-.1,2,100,100),c)['passed']
assert not C.geometry(support(400,200,500,300),c)['passed']
# Integer-exact tangency fixture, distinct from rounded decimal circle coordinates.
assert not C.geometry(support(10,0,20,20),{'cx':0,'cy':10,'effectiveRadius':10})['passed']
assert C.geometry(support(10.0001,0,20,20),{'cx':0,'cy':10,'effectiveRadius':10})['passed']
assert not C.geometry(support(2,2,100,100),c,[-3,0])['passed']
# Reuse original raw solely to calibrate independent TextMetrics/cell/contact calculation.
# The copied shape descriptor below is an arithmetic fixture, never candidate fidelity evidence.
raw=B.parent/'run28-sparse02-20261025c/raw';m=json.loads((raw/'manifest.json').read_bytes());tables={k:[] for k in ['matrix','paint','catalog']};count=0;failed=0
for record in m['records']:
 d=json.loads(gzip.decompress((raw/record['file']).read_bytes()))
 for k,delta in d['tableDeltas'].items():
  for e in delta:assert e['id']==len(tables[k]);tables[k].append(e['value'])
 v=C.restore(d['binding'],tables)
 if v['caseId']!='cell60below':continue
 v['shape']={'scale':.6 if v['caseId']=='cell60below' else 1,'profile':'A'};v['delta']=v['mode']['delta'];passed=C.quality(v);failed+=not passed;count+=1
assert count==15 and failed==4
for f in B.glob('*.py'):ast.parse(f.read_text(),filename=str(f))
result={'state':'PASS_PURE_CHECKER30','exactFractionStrictCircleStagePredicates':6,'historicalSparseQualityCalibrationRows':count,'matchingHistoricalReducedQualityFailuresKept':failed,'originalAllModeQualityFailuresUnchanged':16,'historicalFidelityNotRerun':True,'PythonAST':'PASS','Canvas':0,'browser':0,'geometrySafetyCertified':False}
(B/'pure-checker-result30.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
