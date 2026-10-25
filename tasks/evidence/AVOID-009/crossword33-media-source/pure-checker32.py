"""Actual media clock assertion pure plus AST/source reuse checks, no media render."""
import sys
sys.dont_write_bytecode=True
import ast,importlib.util,json,math,pathlib
B=pathlib.Path(__file__).parent;spec=importlib.util.spec_from_file_location('media_checker32_pure',B/'checker32.py');C=importlib.util.module_from_spec(spec);spec.loader.exec_module(C)
tree=ast.parse((B/'checker32.py').read_text());call=next(n for n in ast.walk(tree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='need' and len(n.args)>1 and isinstance(n.args[1],ast.Constant) and n.args[1].value=='actual independent pIn/pOut');code=compile(ast.fix_missing_locations(ast.Expression(call.args[0])),str(B/'checker32.py')+':actual-phase-condition','eval');tp=.3;c={'pIn':tp/.35,'pOut':0};env={**C.__dict__,'tp':tp,'c':c};assert eval(code,env) is True;c['pIn']=math.nextafter(c['pIn'],math.inf);assert eval(code,env) is False
for p in B.glob('*.py'):ast.parse(p.read_text(),filename=str(p))
s=(B/'checker32.py').read_text();assert "S['quality']" in s and 'support_check=S[\'support_check\']' in s and 'geometry=S[\'geometry\']' in s and 'v=restore(item,tables)' in s and 'current.clear()' in s
result={'state':'PASS_PURE_MEDIA32_CHECKER','actualPInNativeConditionAccepted':1,'singlePInNextFloatMutationRejected':1,'source31QualitySupportGeometryReused':True,'streamTripleReleasedAfterEachQualification':True,'PythonAST':'PASS','conditionalModelOnly':True,'fullPostFXQualified':False,'adapterRegistered':False,'Canvas':0,'browser':0,'encoder':0}
(B/'pure-checker-result32.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
