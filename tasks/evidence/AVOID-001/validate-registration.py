"""Read-only validation of plan records; this does not test the new feature."""
from pathlib import Path
import argparse, collections, csv, hashlib, json, re, subprocess, zipfile

parser=argparse.ArgumentParser()
parser.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[3])
parser.add_argument('--skill-zip',type=Path)
args=parser.parse_args();repo=args.repo.resolve();tasks=repo/'tasks';e=tasks/'evidence/AVOID-001'
checks=[]
def check(name, condition, detail=None):
    checks.append({'check':name,'passed':bool(condition),'detail':detail})
def git(*argv):
    return subprocess.check_output(['git',*argv],cwd=repo,text=True).strip()

index=(tasks/'task-list.md').read_text();entries={}
for line in index.splitlines():
    if re.match(r'\| (?:AVOID|EDTM)-\d{3} \|',line):
        tid,title,status,dep,link=[x.strip() for x in line.strip('|').split('|')]
        check('unique index ID '+tid,tid not in entries)
        entries[tid]={'title':title,'status':status,'deps':re.findall(r'(?:AVOID|EDTM)-\d{3}',dep)}
        check('index link '+tid,link==f'[詳細]({tid}.md)')
check('19 records including 17 future implementation tasks',len(entries)==19)
check('record files match index',set(entries)=={p.stem for p in tasks.glob('*-???.md')})
for tid,row in entries.items():
    s=(tasks/(tid+'.md')).read_text()
    check('title '+tid,s.splitlines()[0]==f'# {tid} {row["title"]}')
    check('status '+tid,f'- 状態: {row["status"]}' in s)
    d=re.search(r'^- (?:技術依存|依存): (.*)$',s,re.M)
    check('dependencies '+tid,d is not None and list(dict.fromkeys(re.findall(r'(?:AVOID|EDTM)-\d{3}',d.group(1))))==row['deps'])
    if tid.startswith('AVOID-') and tid!='AVOID-001':
        check('six requirements '+tid,all('## '+h in s for h in ['目的','変更範囲','禁止事項','完了条件','テスト方法','停止条件']))
        check('future task not started '+tid,row['status']=='未着手' and '- [x]' not in s and '- [ ]' in s)
        check('auxiliary exemption '+tid,'大量反復歌詞' in s and '軌道再設計の対象外' in s)
    for dep in row['deps']:check('known dependency '+tid+' → '+dep,dep in entries)
seen=set();visiting=set();order=[]
def visit(tid):
    if tid in seen:return
    assert tid not in visiting,'dependency cycle '+tid
    visiting.add(tid)
    for d in entries[tid]['deps']:visit(d)
    visiting.remove(tid);seen.add(tid);order.append(tid)
try:
    for tid in entries:visit(tid)
    check('dependency graph has no cycles',True,order)
except AssertionError as exc:check('dependency graph has no cycles',False,str(exc))
check('at most one active',sum(v['status'] in ['調査中','実装中'] for v in entries.values())<=1)
check('mask integrated before group','AVOID-018' in entries['AVOID-012']['deps'])

for p in tasks.rglob('*.md'):
    for link in re.findall(r'\[[^\]]*\]\(([^\s)]+)\)',p.read_text()):
        if '://' not in link and not link.startswith('#'):
            check('link '+str(p.relative_to(repo))+' → '+link,(p.parent/link.split('#')[0]).exists())

inventory=list(csv.DictReader((e/'layout-inventory.csv').open()))
runtime=json.loads((e/'runtime-probe.json').read_text())
check('184 unique layouts',len(inventory)==len({r['id'] for r in inventory})==184)
check('inventory matches live registry snapshot',{r['id'] for r in inventory}=={r['id'] for r in runtime['inventory']})
expected={'AVOID-005':16,'AVOID-006':26,'AVOID-007':25,'AVOID-008':34,'AVOID-009':34,'AVOID-010':42,'AVOID-011':7}
check('all layout responsibility counts',dict(collections.Counter(r['task'] for r in inventory))==expected,expected)
for r in inventory:
    source=repo/r['source'];lines=source.read_text().splitlines()
    check('source registration '+r['id'],0<int(r['line'])<=len(lines) and r['id'] in lines[int(r['line'])-1])
check('20 auxiliary candidate reviews',sum(r['role_review']!='個別描画役割は後続で確認' for r in inventory)==20)
check('48 current-runtime probes',len(runtime['rows'])==48 and runtime['errors']==[])
baseline=json.loads((e/'baseline-results.json').read_text())
check('baseline result accounting',len(baseline)==7 and sum(r['exitCode']==0 for r in baseline)==6)
for row in baseline:check('baseline log '+row['test'],(e/row['log']).exists())
check('project file limitation recorded','ERR_CONNECTION_REFUSED' in (e/'project_file_test.cjs.log').read_text())
check('copy build succeeded',json.loads((e/'build-check.json').read_text())=={'exitCode':0,'identical':{'index.html':True,'en/index.html':True}})

# Validate literal source file references without treating abbreviated :line entries as paths.
refs=set()
for p in tasks.glob('*.md'):
    refs.update(re.findall(r'(?<![\w/])(?:src|app|ae|mcp|docs|dev)/[A-Za-z0-9_./-]+\.(?:jsx|cjs|mjs|js|html|css|py|md)(?![A-Za-z])',p.read_text()))
proposed={'src/08ca_lyric_avoidance.js'}
for ref in sorted(refs):
    if ref in proposed:
        check('proposed new file is explicitly a proposal '+ref,'新規' in (tasks/'AVOID-003.md').read_text())
    else:
        check('referenced source '+ref,(repo/ref).is_file())
base='b7c23bff8a04019b9b90357b433927995834ae62'
changed=git('diff','--name-only',base,'HEAD').splitlines()
check('commit contains only five skill files',len(changed)==5 and all(p.startswith('.agents/skills/evidence-driven-task-management/') for p in changed),changed)
check('tracked application and tests unchanged',git('diff','HEAD','--name-only')=='')
status=git('status','--short')
check('only task records untracked',status=='?? tasks/',status)
check('no whitespace error in tracked changes',subprocess.run(['git','diff','--check'],cwd=repo,capture_output=True).returncode==0)
for p in tasks.rglob('*'):
    if p.suffix in {'.md','.py','.cjs'}:
        check('no trailing whitespace '+str(p.relative_to(repo)),all(x==x.rstrip() for x in p.read_text().splitlines()))

if args.skill_zip:
    def norm(b):return b.decode('utf-8').replace('\r\n','\n').rstrip()+'\n'
    with zipfile.ZipFile(args.skill_zip) as z:
        files=[n for n in z.namelist() if not n.endswith('/')]
        check('ZIP has five skill files',len(files)==5)
        for n in files:
            rel=n.split('evidence-driven-task-management/',1)[-1]
            local=repo/'.agents/skills/evidence-driven-task-management'/rel
            check('skill source semantics '+rel,local.exists() and norm(z.read(n))==norm(local.read_bytes()))
result={'scope':'documentation consistency and existing evidence only; new feature not implemented',
        'branch':git('branch','--show-current'),'head':git('rev-parse','HEAD'),
        'passed':all(c['passed'] for c in checks),'checkCount':len(checks),
        'implementationTasks':17,'failed':[c for c in checks if not c['passed']],
        'applicationSha256':{p:hashlib.sha256((repo/p).read_bytes()).hexdigest() for p in ['index.html','en/index.html']},
        'checks':checks}
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(0 if result['passed'] else 1)
