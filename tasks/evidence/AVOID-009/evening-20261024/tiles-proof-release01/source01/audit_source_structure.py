#!/usr/bin/env python3
"""Read/AST/compile only; never imports or executes reviewed guard."""
import ast,hashlib,json,pathlib,re
H=pathlib.Path(__file__).parent
s=(H/'release_owned_proof01.py').read_text();t=ast.parse(s);compile(t,'release_owned_proof01.py','exec')
def need(ok,msg):
 if not ok:raise AssertionError(msg)
d={}
for n in ast.walk(t):
 if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr=='add_argument':
  for x in n.args:
   if isinstance(x,ast.Constant) and isinstance(x.value,str):d[x.value]={v.arg:ast.literal_eval(v.value) for v in n.keywords if v.arg in {'required','choices'}}
contract={'--snapshot-sha256','--expected-head','--root-index-sha256','--proof-sha256','--receipt-sha256'}
need({x for x in d if x.startswith('--')}==contract,'CLI options differ')
for x in ['--snapshot-sha256','--expected-head','--root-index-sha256']:need(d[x].get('required') is True,'missing required option')
need(d['action']['choices']==['VERIFY','RELEASE','RESTORE'],'actions differ')
uses={n.attr for n in ast.walk(t) if isinstance(n,ast.Attribute) and isinstance(n.value,ast.Name) and n.value.id=='ARGS'}
need(uses<={x.lstrip('-').replace('-','_') for x in d},'undeclared ARGS')
for n in ast.walk(t):
 if isinstance(n,ast.Attribute) and isinstance(n.value,ast.Name) and n.value.id=='hashlib':need(n.attr=='sha256' and callable(getattr(hashlib,n.attr,None)),'hash constructor corrupted')
need(not re.search(r'(?:sha|SHA)(?!256\b)[0-9]+\b',s),'SHA identifier corrupted')
need('GIT_INDEX_FILE' in s and 'GIT_OPTIONAL_LOCKS' in s,'Git environment guards missing')
need('update-index' not in s and 'os.pwrite' not in s and "INDEX.open" not in s,'index mutation source forbidden')
need(s.count('os.open(LOCK,')==1 and 'owned zero-byte lease replaced' in s,'ownedSHM lease missing')
r=next(n for n in t.body if isinstance(n,ast.FunctionDef) and n.name=='release');rt=ast.get_source_segment(s,r)
need(rt.index("writejson(BASE/('tiles-proof-release01-unlink-intent-")<rt.index("(ROOT/x['path']).unlink()"),'intent must precede target unlink')
need("present(x)==assets[x['archiveMember']]" in rt and 'baseline(m)' in rt and 'failures=[]' in rt,'release checks/rollback missing')
m=json.loads((H/'snapshot.json').read_bytes());m2=json.loads((H/'restore-map.json').read_bytes())
need(len(m['skip'])==59 and len(m['pycs'])==7 and len(m['releaseOnlyFiles'])==14 and m['archiveMemberCount']==16,'snapshot counts differ')
need(sum(x['allocated'] for x in m['releaseOnlyFiles'])==m['allocatedToRecover']==8040448,'allocation differs')
need(m2['noIndexOrFlagsChanges'] is True and len(m2['files'])==14 and m2['retained']==m['retained'],'restore map differs')
opts=set(re.findall(r'--[a-z][a-z0-9-]*',(H/'README.txt').read_text()));need(opts==contract,'docs/parser differ')
need(s.endswith('\n') and not s.endswith('\n\n'),'blank EOF')
print(json.dumps({'state':'SOURCE_STRUCTURE_PASS_NO_GUARD_IMPORT_OR_EXECUTION','sourceSHA256':hashlib.sha256(s.encode()).hexdigest(),'CLIOptions':sorted(contract),'ARGSAccesses':sorted(uses),'indexMutationSourceAbsent':True,'oldSkipCount':59,'futureSkipCount':59,'PYCCount':7,'ownedUntrackedPNGCount':14,'verifiedArchiveMemberCount':16,'allocatedToRecover':8040448,'intentBeforeUnlink':True},indent=2))
