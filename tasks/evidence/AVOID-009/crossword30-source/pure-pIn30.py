"""Minimal regression of actual tuple_check source through new independent pIn gate. No Canvas."""
import sys
sys.dont_write_bytecode=True
import ast,copy,gzip,importlib.util,json,math,pathlib
B=pathlib.Path(__file__).parent
spec=importlib.util.spec_from_file_location('checker30_pin_pure',B/'checker30.py');C=importlib.util.module_from_spec(spec);spec.loader.exec_module(C)
# Run the actual checker function prefix, not a duplicated pIn expression.
tree=ast.parse((B/'checker30.py').read_text());function=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='tuple_check');prefix=[]
for statement in function.body:
 prefix.append(statement)
 if isinstance(statement,ast.Expr) and isinstance(statement.value,ast.Call) and len(statement.value.args)>1 and isinstance(statement.value.args[1],ast.Constant) and statement.value.args[1].value=='own pIn':break
else:raise AssertionError('actual independent pIn condition missing')
function.body=prefix;module=ast.fix_missing_locations(ast.Module(body=[function],type_ignores=[]));namespace=dict(C.__dict__);exec(compile(module,str(B/'checker30.py')+':actual-clock-prefix','exec'),namespace);check=namespace['tuple_check']
raw=B.parent/'run28-sparse02-20261025c/raw';tables={k:[] for k in ['matrix','paint','catalog']};record=None
for row in json.loads((raw/'manifest.json').read_bytes())['records']:
 value=json.loads(gzip.decompress((raw/row['file']).read_bytes()))
 for key,delta in value['tableDeltas'].items():
  for entry in delta:assert entry['id']==len(tables[key]);tables[key].append(entry['value'])
 v=C.restore(value['binding'],tables)
 if v['caseId']=='cell60below' and v['n']==18 and v['own']['pass']=='main':record=v;break
assert record is not None
record['time']=record['actual']['clock']['realTime']
policy=json.loads((B/'policy30.json').read_bytes());record['shape']=policy['shapes'][0];check(record,policy)
changed=copy.deepcopy(record);old=changed['actual']['clock']['pIn'];changed['actual']['clock']['pIn']=math.nextafter(old,math.inf)
try:check(changed,policy)
except AssertionError as error:assert str(error)=='own pIn'
else:raise AssertionError('single pIn mutation must be rejected')
assert changed['expected']==record['expected'];reference=copy.deepcopy(changed);reference['actual']['clock']['pIn']=old;assert reference==record
result={'state':'PASS_PURE_ACTUAL_CHECKER_PIN30','normalActualClockAccepted':1,'singlePInNextFloatMutationRejected':1,'sourcePrefixEndsAt':'actual tuple_check own pIn assertion','nativeFormula':'clamp(tp/.35) fixed inDur.35/no prelead fixture','oldPIn':old,'changedPIn':changed['actual']['clock']['pIn'],'otherFieldsUnchanged':True,'Canvas':0,'browser':0,'actualPaint':0,'qualityGeometryNotEvaluated':True}
(B/'pure-pIn-result30.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
