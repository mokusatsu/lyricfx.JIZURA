"""Single boundary regression evaluates actual controller AST expression; no import or RUN."""
import ast,json,pathlib
B=pathlib.Path(__file__).parent
source=(B/'controller30.py').read_text();tree=ast.parse(source)
call=next(n for n in ast.walk(tree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr=='need' and len(n.args)>1 and isinstance(n.args[1],ast.Constant) and n.args[1].value=='original273MiB cap')
expr=ast.fix_missing_locations(ast.Expression(call.args[0]));code=compile(expr,str(B/'controller30.py')+':actual-archive-cap','eval')
assert eval(code,{'g':{'archiveMaxBytes':286261248}}) is True
assert eval(code,{'g':{'archiveMaxBytes':286261249}}) is False
assert eval(code,{'g':{'archiveMaxBytes':0}}) is False
path=B.parent/'review30/strictgate30.DISABLED.json';gate=json.loads(path.read_bytes());assert gate['accepted'] is False and 0<gate['archiveMaxBytes']<=286261248
for p in B.rglob('*.py'):ast.parse(p.read_text(),filename=str(p))
result={'state':'PASS_SINGLE_ARCHIVE_CAP_BOUNDARY_REGRESSION','actualControllerASTEvaluated':True,'boundaryBytes':286261248,'boundaryAccepted':True,'boundaryPlus1Rejected':True,'zeroRejected':True,'gateArchiveMaxBytes':gate['archiveMaxBytes'],'gateAccepted':False,'PythonAST':'PASS','controllerImported':False,'Canvas':0,'browser':0,'productionChange':'archiveMaxBytes upper-bound numeric typo only'}
(B/'pure-cap-result30.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
