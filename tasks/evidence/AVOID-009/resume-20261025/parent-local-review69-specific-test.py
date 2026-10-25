"""Parent checker schema tests only, not product/browser certification."""
import copy,hashlib,json,pathlib,runpy,sys
E=pathlib.Path(__file__).resolve().parent;source=E/'parent-local-review69.py';r=runpy.run_path(str(source));checks=0
def check(v):
 global checks
 assert v;checks+=1
def rejected(fn):
 try:fn()
 except (AssertionError,KeyError):check(True)
 else:raise AssertionError('incorrect schema accepted')
c={'cx':480.,'cy':226.8,'r':108.,'margin':2.7};empty={'supports':[],'reference':{'culled':True},'quality':{'passed':True}}
r['destination_equal'](empty,c,{'passed':True});check(True)
bad=copy.deepcopy(empty);bad['reference']['culled']=False;rejected(lambda:r['destination_equal'](bad,c,{'passed':True}))
support={'owner':'unit','bounds':{'x0':0.,'x1':1.,'y0':0.,'y1':1.}};nonempty={**empty,'supports':[support]};rejected(lambda:r['destination_equal'](nonempty,c,{'passed':True}))
evaluation={'passed':True,'checked':1,'failures':[]};r['destination_equal'](nonempty,c,evaluation);check(True)
tables={str(i):{'recipe':str(i),'supports':[support]} for i in range(4)}
selection={'outcomes':[{'recipe':'0','zero':{'evaluation':evaluation}}],'winner':{'recipe':{'id':'0'},'delta':[0.,0.]}}
proof=[{'phase':'recipe-complete','table':copy.deepcopy(t),'resource':{'serializedWorkingBytes':100}} for t in tables.values()]+[{'phase':'complete','atlas':{'selection':selection,'region':{'circle':c},'bytes':100}}]
r['repeated_proof'](proof,tables);check(True)
bad=copy.deepcopy(proof);bad[0]['table']['supports'][0]['bounds']['x1']=2.;rejected(lambda:r['repeated_proof'](bad,tables))
bad=copy.deepcopy(proof);bad[-1]['atlas']['bytes']=8388609;rejected(lambda:r['repeated_proof'](bad,tables))
out=E/sys.argv[1];assert not out.exists();result={'status':'PASS','checks':checks,'checkerSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'scope':'parent local checker schema only; synthetic boxes, no product qualification','browserExecutions':0,'networkRequests':0,'publicChecks':0,'parentImages':0};out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
