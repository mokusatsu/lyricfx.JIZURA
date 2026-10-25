#!/usr/bin/env python3
"""Source-only AST/schema audit; no reviewed helper import/evaluation/execution."""
import ast,difflib,hashlib,json,pathlib,re
HERE=pathlib.Path(__file__).parent
CONTRACT={
 'capacity_writing11.py':{'--snapshot-sha256','--expected-head','--proof-sha256','--old-round2-disposition','--source53-and-after6-postpins-reviewed'},
 'private_index_resume11.py':{'--round','--snapshot-sha256','--root-index-sha256','--prior-receipt-sha256','--private-index-sha256','--expected-head','--argv-json'},
 'restore_writing11.py':{'--snapshot-sha256','--expected-head','--root-index-sha256','--release-receipt-sha256'},
}
def need(ok,msg):
 if not ok:raise AssertionError(msg)
def declarations(tree):
 result={}
 for n in ast.walk(tree):
  if not isinstance(n,ast.Call) or not isinstance(n.func,ast.Attribute) or n.func.attr!='add_argument':continue
  names=[x.value for x in n.args if isinstance(x,ast.Constant) and isinstance(x.value,str)]
  kw={x.arg:ast.literal_eval(x.value) for x in n.keywords if x.arg in {'dest','required','choices','action'}}
  for name in names:result[name]={'dest':kw.get('dest',name.lstrip('-').replace('-','_')),**kw}
 return result
def audit():
 result={};allopts=set()
 for name,contract in CONTRACT.items():
  text=(HERE/name).read_text();tree=ast.parse(text,filename=name);compile(tree,name,'exec');d=declarations(tree)
  opts={x for x in d if x.startswith('--')};need(opts==contract,name+': CLI differs')
  uses={n.attr for n in ast.walk(tree) if isinstance(n,ast.Attribute) and isinstance(n.value,ast.Name) and n.value.id=='ARGS'}
  need(uses<={x['dest'] for x in d.values()},name+': undeclared ARGS access')
  attrs=[]
  for n in ast.walk(tree):
   if isinstance(n,ast.Attribute) and isinstance(n.value,ast.Name) and n.value.id=='hashlib':
    need(n.attr=='sha256' and callable(getattr(hashlib,n.attr,None)),name+': invalid hash constructor');attrs.append(n.attr)
  need(not re.search(r'(?:sha|SHA)(?!256\b)[0-9]+\b',text),name+': corrupted hash identifier')
  if name in {'capacity_writing11.py','restore_writing11.py'}:
   for x in contract-{'--proof-sha256'}:need(d[x].get('required') is True,name+': missing required parser option '+x)
  else:need(d['--round'].get('required') is True,'round required')
  if name=='capacity_writing11.py':
   need(d['--old-round2-disposition'].get('choices')==['ABANDONED_BEFORE_STAGE'],'oldround2 choices')
   need(d['--source53-and-after6-postpins-reviewed'].get('action')=='store_true','postpins review action')
  need('owned zero-byte lock replaced' in text,name+': missing owned lock cleanup')
  result[name]={'sourceSHA256':hashlib.sha256(text.encode()).hexdigest(),'declaredOptions':sorted(opts),'ARGSAccesses':sorted(uses),'hashlibAttributes':attrs};allopts.update(opts)
 guard=(HERE/'capacity_writing11.py').read_text();helper=(HERE/'private_index_resume11.py').read_text();restore=(HERE/'restore_writing11.py').read_text()
 need("len(m['skip'])==60" in guard and "'skipCount':61" in guard and 'old60AndPYC7Preserved' in guard,'60/61 guard contract')
 release=next(x for x in ast.parse(guard).body if isinstance(x,ast.FunctionDef) and x.name=='release')
 calls=[x for x in ast.walk(release) if isinstance(x,ast.Call)]
 intent=next(x.lineno for x in calls if isinstance(x.func,ast.Name) and x.func.id=='writejson' and isinstance(x.args[0],ast.Name) and x.args[0].id=='INTENT')
 unlink=next(x.lineno for x in calls if isinstance(x.func,ast.Attribute) and x.func.attr=='unlink')
 need(intent<unlink,'intent must precede target unlink')
 need("len(m['skip'])==61" in helper and 'evening-resume11-index-round-' in helper and 'continuation61-snapshot.json' in helper,'strict61 model/round mismatch')
 need('ARGS.root_index_sha256' in restore and "m['head']==r['head']" in restore,'restore actual current state gate')
 a=json.loads((HERE/'snapshot.json').read_bytes());b=json.loads((HERE/'continuation61-snapshot.json').read_bytes());m=json.loads((HERE/'target-proof.json').read_bytes())
 need(len(a['skip'])==60 and len(b['skip'])==61 and b['skip']==sorted(a['skip']+[m['path']]),'snapshot paths differ')
 need(a['pycs']==b['pycs'] and len(a['pycs'])==7,'PYC model differs')
 need(b['specialFlags']==sorted(a['specialFlags']+['S '+m['path']]),'full flag model differs')
 need(m['gzipCRCVerifiedByCompleteStreamingRead'] is True and m['decodedBytes']==248229761,'gzip provenance incomplete')
 need(json.loads((HERE/'restore-map.json').read_bytes())['historicalSourcePinCount']==105,'source map incomplete')
 need('decodedcheck(b)' in guard and 'decodedcheck(data)' in restore and 'chunk=stream.read(1048576)' in guard,'streaming CRC/hash verification missing')
 dep=json.loads((HERE/'dependency-proof.json').read_bytes());need(dep['sourcePinCount']==105 and len(dep['rows'])==105 and dep['all105Verified'] is True,'dependency proof incomplete')
 need(all(x['fullHEADBlobBytesEqual'] and x['gzipCRCAndFullDecodedSHA256Verified'] for x in dep['rows']),'retained snapshot byte proof missing')
 need('audit_unused_round2(m)' in guard and "evening-resume10-index-round-2" in guard,'unused oldround2 gate missing')
 need(dep['legacyMapTotalRows']==315,'legacy source map incomplete')
 need(helper.endswith('\n') and not helper.endswith('\n\n'),'new helper excess blank EOF')
 for name in CONTRACT:
  prior=name.replace('writing11','writing10').replace('resume11','resume10')
  old=(HERE.parent/'avoid009-capacity-writing10'/prior).read_text();new=(HERE/name).read_text()
  expected=''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='accepted10/'+prior,tofile='source11/'+name))
  need((HERE/(name+'.diff')).read_text()==expected,'source diff differs:'+name)
 docs=(HERE/'README.txt').read_text();documented=set(re.findall(r'--[a-z][a-z0-9-]*',docs));need(documented<=allopts,'docs options undeclared')
 need(allopts<=documented,'undocumented parser options')
 for q in HERE.glob('*'):
  if q.suffix in {'.py','.json','.txt'}:need(not re.search(r'(?:sha|SHA)(?!256\b)[0-9]+\b',q.read_text()),q.name+': corrupted SHA identifier')
 return {'state':'SOURCE_STRUCTURE_PASS_NO_HELPER_IMPORT_OR_EXECUTION','helpers':result,'oldSkipCount':60,'futureSkipCount':61,'PYCCount':7,'gzipCRCAndDecodedHashVerifiedReadOnly':True,'historicalSourcePinCount':105,'intentPrecedesUnlink':True,'documentedOptions':sorted(documented)}
if __name__=='__main__':print(json.dumps(audit(),indent=2))
