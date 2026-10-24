#!/usr/bin/env python3
"""Source-only AST/schema audit; no reviewed helper import/evaluation/execution."""
import ast,difflib,hashlib,json,pathlib,re
HERE=pathlib.Path(__file__).parent
CONTRACT={
 'capacity_objects15.py':{'--snapshot-sha256','--expected-head','--proof-sha256','--source60-parent-oracle-media-accepted','--source60-oracle-review-sha256','--source60-media-review-sha256'},
 'private_index_resume15.py':{'--round','--snapshot-sha256','--root-index-sha256','--prior-receipt-sha256','--private-index-sha256','--expected-head','--argv-json'},
 'restore_objects15.py':{'--snapshot-sha256','--expected-head','--root-index-sha256','--release-receipt-sha256'},
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
  if name in {'capacity_objects15.py','restore_objects15.py'}:
   for x in contract-{'--proof-sha256'}:need(d[x].get('required') is True,name+': missing required parser option '+x)
  else:need(d['--round'].get('required') is True,'round required')
  if name=='capacity_objects15.py':
   need(d['--source60-parent-oracle-media-accepted'].get('action')=='store_true' and d['--source60-oracle-review-sha256'].get('required') is True and d['--source60-media-review-sha256'].get('required') is True,'dual60review actions')
   need('audit_unused_round2' not in text and 'ABANDONED_BEFORE_STAGE' not in text and "r['round']==1" in text,'installedR1 baseline must not be abandoned')
  need('owned zero-byte lock replaced' in text,name+': missing owned lock cleanup')
  result[name]={'sourceSHA256':hashlib.sha256(text.encode()).hexdigest(),'declaredOptions':sorted(opts),'ARGSAccesses':sorted(uses),'hashlibAttributes':attrs};allopts.update(opts)
 guard=(HERE/'capacity_objects15.py').read_text();helper=(HERE/'private_index_resume15.py').read_text();restore=(HERE/'restore_objects15.py').read_text()
 need("len(m['skip'])==63" in guard and "'skipCount':64" in guard and 'old63AndPYC7Preserved' in guard,'63/64 guard contract')
 release=next(x for x in ast.parse(guard).body if isinstance(x,ast.FunctionDef) and x.name=='release')
 calls=[x for x in ast.walk(release) if isinstance(x,ast.Call)]
 intent=next(x.lineno for x in calls if isinstance(x.func,ast.Name) and x.func.id=='writejson' and isinstance(x.args[0],ast.Name) and x.args[0].id=='INTENT')
 unlink=next(x.lineno for x in calls if isinstance(x.func,ast.Attribute) and x.func.attr=='unlink')
 need(intent<unlink,'intent must precede target unlink')
 need("len(m['skip'])==64" in helper and 'evening-resume15-index-round-' in helper and 'continuation64-snapshot.json' in helper,'strict64 model/round mismatch')
 need('ARGS.root_index_sha256' in restore and "m['head']==r['head']" in restore,'restore actual current state gate')
 a=json.loads((HERE/'snapshot.json').read_bytes());b=json.loads((HERE/'continuation64-snapshot.json').read_bytes());m=json.loads((HERE/'target-proof.json').read_bytes())
 need(len(a['skip'])==63 and len(b['skip'])==64 and b['skip']==sorted(a['skip']+[m['path']]),'snapshot paths differ')
 need(a['pycs']==b['pycs'] and len(a['pycs'])==7,'PYC model differs')
 need(b['specialFlags']==sorted(a['specialFlags']+['S '+m['path']]),'full flag model differs')
 need(m['gzipCRCVerifiedByFullStreamingRead'] is True and m['decodedBytes']==227208579,'gzip provenance incomplete')
 need(json.loads((HERE/'restore-map.json').read_bytes())['dependencyProofSHA256']==hashlib.sha256((HERE/'dependency-proof.json').read_bytes()).hexdigest(),'source map proof seal differs')
 need('decodedcheck(b)' in guard and 'decodedcheck(data)' in restore and 'chunk=stream.read(1048576)' in guard,'streaming CRC/hash verification missing')
 dep=json.loads((HERE/'dependency-proof.json').read_bytes());need(dep['startupSourceCount']==105 and dep['legacyMapRows']==315 and len(dep['records'])==105,'dependency proof incomplete')
 need(all(x['fullCurrentHEADBlobEqual'] and x['gzipCRCAndRawHashSizeVerified'] for x in dep['records']),'retained snapshot byte proof missing')
 need('source60_context(m)' in guard and "'source60BothParentRawReviewsAccepted':True" in guard and "'source60HumanApproval':False" in guard and "'source60ProductAdmission':False" in guard and "'source60SavingBodyAccepted':False" in guard and "'source60FormalPerformanceAccepted':False" in guard,'dual60conditional proof gates missing')
 need("r['source60ProductAdmission'] is False" in helper and "r['source60FormalPerformanceAccepted'] is False" in restore,'dual60receipt truth chain missing')
 c=a['source60Context'];need(c['finalReviewPending'] is False and c['phases']['oracle']['review']['sha256']=='d439a7ab48a038b0ceb145bb9a880089fe91a9704a3dca4f4a3d7c7418aa25ad' and c['phases']['media']['review']['sha256']=='d4fbc13cca3c6b862620ad47640ffe68c1f70206c5c434cbefcdb696eb272598','bothactual60review seals required')
 need(c['phases']['oracle']['literalMembers']==995 and c['phases']['media']['literalMembers']==1018 and c['sourceFiles']==124 and b['source60Context']==c,'dual60context model differs')
 need(a['finalSourceReviewPending']==b['finalSourceReviewPending'] and "m['finalSourceReviewPending'] is False" in guard and "m['finalSourceReviewPending'] is False" in helper,'final15source gate missing')
 need(helper.endswith('\n') and not helper.endswith('\n\n'),'new helper excess blank EOF')
 for name in CONTRACT:
  prior=name.replace('objects15','objects14').replace('resume15','resume14')
  old=(HERE.parent/'avoid009-capacity-objects14'/prior).read_text();new=(HERE/name).read_text()
  expected=''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='accepted14/'+prior,tofile='prefreeze15/'+name))
  need((HERE/(name+'.diff')).read_text()==expected,'source diff differs:'+name)
 docs=(HERE/'README.txt').read_text();documented=set(re.findall(r'--[a-z][a-z0-9-]*',docs));need(documented<=allopts,'docs options undeclared')
 need(allopts<=documented,'undocumented parser options')
 for q in HERE.glob('*'):
  if q.suffix in {'.py','.json','.txt'}:need(not re.search(r'(?:sha|SHA)(?!256\b)[0-9]+\b',q.read_text()),q.name+': corrupted SHA identifier')
 return {'state':'PREFREEZE_SOURCE_STRUCTURE_PASS_NO_HELPER_IMPORT_OR_EXECUTION' if a['finalSourceReviewPending'] else 'FINAL_SOURCE_STRUCTURE_PASS_NO_HELPER_IMPORT_OR_EXECUTION','helpers':result,'oldSkipCount':63,'futureSkipCount':64,'PYCCount':7,'gzipCRCAndDecodedHashVerifiedReadOnly':True,'startupSourceCount':105,'legacyMapRows':315,'retainedReferenceCount':105,'oracleLiteralMemberCount':995,'mediaLiteralMemberCount':1018,'prefreezeFinalSourceReviewPending':a['finalSourceReviewPending'],'intentPrecedesUnlink':True,'documentedOptions':sorted(documented)}
if __name__=='__main__':print(json.dumps(audit(),indent=2))
