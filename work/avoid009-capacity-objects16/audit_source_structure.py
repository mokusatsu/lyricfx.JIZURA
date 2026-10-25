#!/usr/bin/env python3
"""Source-only AST/CLI/hash/schema checks; never imports or executes reviewed helpers."""
import ast,difflib,hashlib,json,pathlib,re
H=pathlib.Path(__file__).parent
C={'capacity_objects16.py':{'--snapshot-sha256','--expected-head','--proof-sha256','--source63-ja-en-raw-and-after6-accepted','--source63-ja-review-sha256','--source63-en-review-sha256','--after6-receipt-sha256'},'restore_objects16.py':{'--snapshot-sha256','--expected-head','--root-index-sha256','--release-receipt-sha256'},'private_index_resume16.py':{'--round','--snapshot-sha256','--root-index-sha256','--prior-receipt-sha256','--private-index-sha256','--expected-head','--argv-json'}}
def need(x,m):
 if not x:raise AssertionError(m)
result={};allopts=set()
for name,options in C.items():
 s=(H/name).read_text();tree=ast.parse(s);compile(tree,name,'exec');decl={}
 for n in ast.walk(tree):
  if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr=='add_argument':
   kw={x.arg:ast.literal_eval(x.value) for x in n.keywords if x.arg in {'required','action','choices'}}
   for x in n.args:
    if isinstance(x,ast.Constant) and isinstance(x.value,str):decl[x.value]=kw
 uses={n.attr for n in ast.walk(tree) if isinstance(n,ast.Attribute) and isinstance(n.value,ast.Name) and n.value.id=='ARGS'}
 need(uses<={x.lstrip('-').replace('-','_') for x in decl},name+' undeclaredARGS');need({x for x in decl if x.startswith('--')}==options,name+' CLI')
 for n in ast.walk(tree):
  if isinstance(n,ast.Attribute) and isinstance(n.value,ast.Name) and n.value.id=='hashlib':need(n.attr=='sha256','SHA corruption')
 need(not re.search(r'(?:sha|SHA)(?!256\b)[0-9]+\b',s),'hashidentifier');need('owned zero-byte lock replaced' in s,'ownedlock');need(s.endswith('\n') and not s.endswith('\n\n'),'EOF')
 if name=='capacity_objects16.py':
  for x in options-{'--proof-sha256'}:need(decl[x].get('required') is True,'requiredguardflag')
  need("len(m['skip'])==64" in s and "'skipCount':65" in s and "r['round']==2" in s,'64→65/bootstrapR2')
  need("c['freshSnapshotAfter63CompleteRequired'] is False" in s and "c['after']" in s,'freshfinal63gate')
  f=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='release');calls=[n for n in ast.walk(f) if isinstance(n,ast.Call)];intent=next(n.lineno for n in calls if isinstance(n.func,ast.Name) and n.func.id=='writejson' and isinstance(n.args[0],ast.Name) and n.args[0].id=='INTENT');unlink=next(n.lineno for n in calls if isinstance(n.func,ast.Attribute) and n.func.attr=='unlink');need(intent<unlink,'INTENT beforeunlink')
 if name.startswith('private'):need("len(m['skip'])==65" in s and 'evening-resume16-index-round-' in s,'strict65stem')
 oldname=name.replace('objects16','objects15').replace('resume16','resume15');old=(H.parent/'avoid009-capacity-objects15'/oldname).read_text();need((H/(name+'.diff')).read_text()==''.join(difflib.unified_diff(old.splitlines(True),s.splitlines(True),fromfile='accepted15/'+oldname,tofile='draft16/'+name)),'exactdiff')
 result[name]={'SHA256':hashlib.sha256(s.encode()).hexdigest(),'CLI':sorted(options),'ARGS':sorted(uses)};allopts|=options
m=json.loads((H/'snapshot.json').read_bytes());f=json.loads((H/'continuation65-snapshot.json').read_bytes());target=json.loads((H/'inventory16.json').read_bytes())['candidate'];need(len(m['skip'])==64 and f['skip']==sorted(m['skip']+[target['path']]) and len(f['skip'])==65,'models');need(m['pycs']==f['pycs'] and len(m['pycs'])==7,'PYC7')
d=json.loads((H/'dependency-proof.json').read_bytes());need(d['sourceCount']==107 and len(d['records'])==107 and all(x['fullHEADBlobAndGzipRawVerified'] for x in d['records']),'107sourceproof');b=json.loads((H/'before-baselines-literal.json').read_bytes());need(len(b['files'])==9 and all(x['base64'] for x in b['files']),'literalALLbefore');need(m['source63Context']==f['source63Context'],'contextcoupling');ctx=m['source63Context'];need(m['finalSourceReviewPending'] is False and ctx['freshSnapshotAfter63CompleteRequired'] is False and ctx['finalReviewPending'] is False and ctx['after']['literalBaselineFileCount']==9 and len(ctx['after']['files'])==11,'finalcontexts/freshsnapshot incomplete');need(ctx['after']['integrationReview']['sha256']=='4d3352f65402ec3051b1ea34e344bdcb3b397945a5d0a24dc9c4cf8e606eff0b','parentfinalreviewseal');need(ctx['after']['receipt']['sha256']=='d3ccd2d97701082e423c994e4fc9e645311ee15ebd4d447def4110f7b68f166f','AFTER6seal')
need(set(re.findall(r'--[a-z][a-z0-9-]*',(H/'README.txt').read_text()))==allopts,'docsCLI')
print(json.dumps({'state':'FINAL16_SOURCE_STRUCTURE_PASS_NO_HELPER_IMPORT_EXECUTION','helpers':result,'oldAbsent':64,'futureAbsent':65,'sourceSnapshots':107,'literalBeforeFiles':9,'after6Pending':False,'freshFinalSnapshotCompleted':True,'parentFinalIntegrationReviewBound':True,'actions':0},indent=2))
