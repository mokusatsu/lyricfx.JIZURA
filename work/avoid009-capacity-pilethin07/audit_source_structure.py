#!/usr/bin/env python3
"""Source-only AST/schema audit. Never imports or executes a reviewed helper."""
import ast,hashlib,json,pathlib,re
HERE=pathlib.Path(__file__).parent
CONTRACT={
 'capacity_pilethin07.py':{'--snapshot-sha256','--expected-head','--proof-sha256','--old-round3-disposition','--source47-postpins-reviewed'},
 'private_index_resume07.py':{'--round','--snapshot-sha256','--root-index-sha256','--prior-receipt-sha256','--private-index-sha256','--expected-head','--argv-json'},
 'restore_pilethin07.py':{'--snapshot-sha256','--expected-head','--release-receipt-sha256'},
}
def need(ok,message):
 if not ok:raise AssertionError(message)
def declarations(tree):
 result={}
 for node in ast.walk(tree):
  if not isinstance(node,ast.Call) or not isinstance(node.func,ast.Attribute) or node.func.attr!='add_argument':continue
  names=[x.value for x in node.args if isinstance(x,ast.Constant) and isinstance(x.value,str)]
  kw={x.arg:ast.literal_eval(x.value) for x in node.keywords if x.arg in {'dest','required','choices','action'}}
  for name in names:
   dest=kw.get('dest',name.lstrip('-').replace('-','_'));result[name]={'dest':dest,**kw}
 return result
def audit():
 result={};all_options=set()
 for name,contract in CONTRACT.items():
  text=(HERE/name).read_text();tree=ast.parse(text);declared=declarations(tree)
  options={x for x in declared if x.startswith('--')};need(options==contract,name+': CLI contract differs')
  uses={n.attr for n in ast.walk(tree) if isinstance(n,ast.Attribute) and isinstance(n.value,ast.Name) and n.value.id=='ARGS'}
  destinations={x['dest'] for x in declared.values()};need(uses<=destinations,name+': undeclared ARGS access '+str(uses-destinations))
  constructors=[]
  for n in ast.walk(tree):
   if isinstance(n,ast.Attribute) and isinstance(n.value,ast.Name) and n.value.id=='hashlib':
    need(hasattr(hashlib,n.attr) and callable(getattr(hashlib,n.attr)),name+': nonexistent hashlib constructor')
    need(n.attr=='sha256',name+': unexpected hash constructor');constructors.append(n.attr)
  need(not re.search(r'(?:sha|SHA)(?!256\b)[0-9]+\b',text),name+': non-SHA256 identifier remains')
  result[name]={'declaredOptions':sorted(options),'ARGSAccesses':sorted(uses),'hashlibAttributesValidated':constructors,'sourceSHA256':hashlib.sha256(text.encode()).hexdigest()}
  all_options.update(options)
  if name=='capacity_pilethin07.py':
   need(declared['--old-round3-disposition'].get('required') is True,'disposition must be required')
   need(declared['--old-round3-disposition'].get('choices')==['ABANDONED_BEFORE_STAGE'],'disposition choices differ')
   need(declared['--source47-postpins-reviewed'].get('required') is True and declared['--source47-postpins-reviewed'].get('action')=='store_true','Source47 postpins flag must be required true')
   need("len(m['skip'])==56" in text and "'skipCount':57" in text,'old56/new57 guard differs')
  if name=='private_index_resume07.py':need("len(m['skip'])==57" in text and "'skipCount':57" in text,'strict57 continuation differs')
 original=json.loads((HERE/'snapshot.json').read_bytes());future=json.loads((HERE/'continuation57-snapshot.json').read_bytes())
 target='tasks/evidence/AVOID-009/revisions-20261024/pile-entry12/pile-entry12-thin.tar.xz'
 need(len(original['skip'])==56 and len(future['skip'])==57 and future['skip']==sorted(original['skip']+[target]),'snapshot protection counts/target differ')
 need(original['pycs']==future['pycs'] and len(original['pycs'])==7,'PYC model differs')
 need(future['specialFlags']==sorted(original['specialFlags']+['S '+target]),'future flag model differs')
 for name in ['snapshot.json','continuation57-snapshot.json','README.txt']:
  text=(HERE/name).read_text();need(not re.search(r'(?:sha|SHA)(?!256\b)[0-9]+\b',text),name+': corrupted schema remains')
 docs=(HERE/'README.txt').read_text();documented=set(re.findall(r'--[a-z][a-z0-9-]*',docs));external={'--include-history','--repo','--out'}
 need(documented<=all_options|external,'documented CLI option absent from parsers: '+str(documented-all_options-external))
 need({'--snapshot-sha256','--proof-sha256','--old-round3-disposition','--source47-postpins-reviewed'}<=documented,'guard documentation incomplete')
 return {'state':'SOURCE_STRUCTURE_PASS_NO_HELPER_IMPORT_OR_EXECUTION','helpers':result,'documentedOptions':sorted(documented),'oldSkipCount':56,'futureSkipCount':57,'PYCCount':7}
if __name__=='__main__':print(json.dumps(audit(),indent=2))
