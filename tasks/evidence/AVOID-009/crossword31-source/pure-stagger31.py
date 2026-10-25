"""Actual accepted source29 mi records + actual old/new checker predicates. No paint."""
import sys
sys.dont_write_bytecode=True
import ast,copy,gzip,hashlib,importlib.util,json,pathlib
B=pathlib.Path(__file__).parent;raw=B.parent/'run28-sparse02-20261025c/raw';receipt=raw/'host-receipt.json';originalBytes=receipt.read_bytes();host=json.loads(originalBytes);cut=copy.deepcopy(host['init']['plan']['cuts'][0]);cutBefore=copy.deepcopy(cut)
spec=importlib.util.spec_from_file_location('checker31_stagger_pure',B/'checker30.py');C=importlib.util.module_from_spec(spec);spec.loader.exec_module(C)
def predicate(path):
 tree=ast.parse(path.read_text());call=next(n for n in ast.walk(tree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='need' and len(n.args)>1 and isinstance(n.args[1],ast.Constant) and n.args[1].value=='original stagger/read order');return compile(ast.fix_missing_locations(ast.Expression(call.args[0])),str(path)+':actual-mi-predicate','eval')
old=predicate(B.parent/'source30/checker30.py');fixed=predicate(B/'checker30.py');tables={k:[] for k in ['matrix','paint','catalog']};examples=[]
for row in json.loads((raw/'manifest.json').read_bytes())['records']:
 r=json.loads(gzip.decompress((raw/row['file']).read_bytes()))
 for key,delta in r['tableDeltas'].items():
  for entry in delta:assert entry['id']==len(tables[key]);tables[key].append(entry['value'])
 v=C.restore(r['binding'],tables)
 if v['caseId']=='off' and v['n'] in [18,90,231] and v['own']['pass']=='main':
  mains=[c['item'] for c in v['actual']['calls'] if c['kind']=='main'];env={**C.__dict__,'cut':cut,'mains':mains};assert eval(old,env) is False;assert eval(fixed,env) is True;examples.append({'n':v['n'],'pass':v['own']['pass'],'nativeMi':[it['mi'] for it in mains],'oldFixed04Mi':[max(0,.25+i*.11)/.04 for i in range(4)],'oldRejected':True,'nativeFormulaPassed':True})
assert len(examples)==3 and cut==cutBefore and receipt.read_bytes()==originalBytes
for path in B.rglob('*.py'):ast.parse(path.read_text(),filename=str(path))
result={'state':'PASS_PURE_STAGGER31_ACTUAL_RAW','naturalStagger':cut['stagger'],'effectiveNativeDenominator':max(.005,cut.get('stagger') or .04),'oldFixed04MismatchReproduced':3,'nativeFormulaExactPass':3,'examples':examples,'actualInputPlanBytesUnchanged':True,'actualInputReceiptSHA256':hashlib.sha256(originalBytes).hexdigest(),'PythonAST':'PASS','Canvas':0,'browser':0,'newPaint':0,'geometryQualityNotEvaluated':True}
(B/'pure-stagger-result31.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False))
