"""Compare streaming representative report with previously accepted report; no old rerun/full replay."""
import sys
sys.dont_write_bytecode=True
import ast,hashlib,json,pathlib
BASE=pathlib.Path('/dev/shm/avoid009-crossword26');B=BASE/'source32';old=BASE/'run30-representative02-20261025c/parent-local-review.json';new=BASE/'review32/representative-stream32.json';prior=json.loads(old.read_bytes());actual=json.loads(new.read_bytes());metrics=actual.pop('streamingReview');assert actual==prior
assert metrics['maximumRestoredRowsHeld']==1 and metrics['rowsValidated']==1 and metrics['valuesRestored']==2 and metrics['codecRecordsRead']==1 and metrics['noRetainedRGBAOrPaintOrCalls'] and metrics['producerRerendered'] is False and metrics['formalPerformanceAccepted'] is False;assert metrics['peakRSSBytes']>0
source=(B/'stream-checker32.py').read_text();tree=ast.parse(source);restores=[n for n in ast.walk(tree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='restore'];assert len(restores)==1 and isinstance(restores[0].args[0],ast.Name) and restores[0].args[0].id=='item'
assert not any(isinstance(n,ast.Name) and isinstance(n.ctx,ast.Store) and n.id in ['values','tuples'] for n in ast.walk(tree));assert 'del v' in source;assert "tuple_check=S['tuple_check']" in source
for p in B.glob('*.py'):ast.parse(p.read_text(),filename=str(p))
result={'state':'PASS_PURE_SOURCE32_STREAMING_EQUIVALENCE','acceptedRepresentativeResultAllFieldsExact':True,'oldReportSHA256':hashlib.sha256(old.read_bytes()).hexdigest(),'streamingRepresentativeReportSHA256':hashlib.sha256(new.read_bytes()).hexdigest(),'actualTuples':1,'values':2,'allRGBAAndPaintSourcecallClockQualitySupportComparedByUnchangedPredicates':True,'restorationGranularity':'one codec array item','noFullRowCollectionsAssigned':True,'peakRSSBytesRepresentative':metrics['peakRSSBytes'],'formalPerformanceAccepted':False,'full1533RawReplayExecuted':False,'producerRerendered':False,'Canvas':0,'encoder':0,'PythonAST':'PASS'}
(B/'pure-result32.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
