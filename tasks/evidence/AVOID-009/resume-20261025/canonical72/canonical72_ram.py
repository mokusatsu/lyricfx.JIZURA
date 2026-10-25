"""Bounded billboard72 RAM normal-build + unchanged paired six controller.
Parent source review precedes --prepare/--run. No network, Git writes, publish,
ROOT HTML installation, image capture, storage helper, or new fixture matrix.
"""
import sys
sys.dont_write_bytecode = True
import argparse, hashlib, importlib.util, io, json, os, re, subprocess, tarfile, traceback
from pathlib import Path

ROOT = Path('/workspace/lyricfx.JIZURA')
BASE = '3912178bebb4aa458906665a91d5e87f21c44d4e'
INDEX = '2b656c245e9d19c7f92ddc5fc5187beb407d43dee8d3ea48374a21bb0b95e1d9'
INODE = 568861
HELPER = ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py'
HELPER_SHA = '601bfc906aa2cf313d740667acd2ebc2dc95abcb4b60ac6dc338b7dbb826faae'
OWN = ROOT/'work/avoid009-billboard72-isolated'
DELTA = OWN/'source72.delta.patch'
DELTA_MANIFEST = OWN/'delta72-manifest.json'
MODULE = OWN/'src/11zc_billboard_native72.js'
DELTA_SHA = 'd0e86f2df1dd5fc32dffd26723a63521143da33b9ae3e6bd537d289f9952c960'
MODULE_SHA = '6bfa5aa66a557b3fc3fe82127ede18e6602bcf6984939f71a9b176df74c77e82'
NODE = Path('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node')
NODE_MODULES = NODE.parent.parent/'node_modules'
LAUNCHER = Path('/usr/bin/chromium')
ENGINE = Path('/usr/lib/chromium/chromium')
RUNTIME_SHA = {
 str(NODE):'bc17c508ffeed0ec622934f9b7fa72f8e78da65350e63c3eceb56fa688aa5e12',
 str(LAUNCHER):'2c8d32d29dc6781c35ae196ea83299d507ac88fc339301abe74672feda299779',
 str(ENGINE):'4dc9f9f9b20e9bd95bf201f43d2d643f48938f36a70ddcb6fce3dd611a178180'}
TESTS = ['lyric_test.js','lyric_avoid_center_test.cjs','lyric_group_avoidance_test.cjs',
         'lyric_scene_test.cjs','lyric_placement_stability_test.cjs','timeline_boundary_drag_test.cjs']
TEN = ['dev/'+n for n in TESTS]+['dev/browser.cjs','dev/avoidance/baseline.py','src/01_util.js','src/08_planner.js']
PATHS = ['src','app','build.py','vendor','assets',*['dev/'+n for n in TESTS],'dev/browser.cjs','dev/avoidance/baseline.py']
EXPECTED = {
 'before':{'index.html':'c048eb396d8d025c7233fc52fdfdacc70e2ae78d42846f9147e1096ab4be746b',
           'en/index.html':'fb57f5d925c58897df5f5206d1800f5d5bed851f308f821bcb5a08a913f501b8'},
 'after':{'index.html':'aedb149665ffbef9ab96d055ae243cf9ee2490efd121da7d6be8778a3cde2253',
          'en/index.html':'3e89ace327b72a35924943775b108f3da8e4a96007a3938f01878911f975d5bf'}}


def need(ok, message):
    if not ok: raise RuntimeError(message)

def sha(data): return hashlib.sha256(data).hexdigest()

def file_pin(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return {'path':str(path),'bytes':path.stat().st_size,'sha256':h.hexdigest()}

def read(path):
    need(path.is_file() and not path.is_symlink(),'regular source file: '+str(path)); return path.read_bytes()

def write_json(path, value):
    path.parent.mkdir(parents=True,exist_ok=True)
    with path.open('x',encoding='utf-8') as f:
        json.dump(value,f,ensure_ascii=False,indent=2); f.write('\n')

def environment(run):
    env=os.environ.copy()
    env.update(PATH=str(NODE.parent)+os.pathsep+env.get('PATH',''), NODE_PATH=str(NODE_MODULES),
               JIZURA_BROWSER=str(LAUNCHER), TMPDIR=str(run/'t'), PYTHONDONTWRITEBYTECODE='1', GIT_OPTIONAL_LOCKS='0')
    return env

def root_guard(latest):
    need(sha(read(HELPER))==HELPER_SHA,'existing RootGuard helper changed')
    spec=importlib.util.spec_from_file_location('billboard72_readonly_root_guard',HELPER)
    mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    guard=mod.RootGuard(BASE,INDEX); need(guard.stat.st_ino==INODE,'ROOT index inode changed')
    guard.latestKnownCodeCommit=latest  # metadata supplied by parent, never a fetched/queried remote claim
    guard.check(); return guard

def runtime(env):
    pins=[file_pin(p) for p in (NODE,LAUNCHER,ENGINE)]
    need(all(p['sha256']==RUNTIME_SHA[p['path']] for p in pins),'qualified Node/launcher/engine changed')
    js="const m=require('module'),p=require.resolve('playwright/package.json'),r=m.createRequire(p),c=r.resolve('playwright-core/package.json');console.log(JSON.stringify({node:process.version,pw:p,pwVersion:require(p).version,core:c,coreVersion:require(c).version}));"
    cp=subprocess.run([str(NODE),'-e',js],env=env,cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    need(cp.returncode==0,'runtime module resolution failed: '+cp.stderr.decode(errors='replace'))
    info=json.loads(cp.stdout); need(info['node']=='v24.19.0' and info['pwVersion']==info['coreVersion']=='1.62.1','qualified Node/PW version')
    need(Path(info['pw'])==NODE_MODULES/'playwright/package.json','explicit NODE_PATH resolution')
    packages=[file_pin(Path(info[k])) for k in ('pw','core')]
    need(packages[0]['sha256']=='ca170ec143a88ed3043ac953eb3b2377b2b97304104f4e1e23316684ce2c35af','qualified Playwright package bytes')
    return {'binaries':pins,'packages':packages,'versions':info,'JIZURA_BROWSER':str(LAUNCHER),
            'enginePinnedSeparately':True,'NODE_PATH':str(NODE_MODULES)}

def inputs(guard):
    rows=[]; excluded=[]
    for entry in guard.command(['ls-tree','-r','-z',BASE,'--',*PATHS]).split(b'\0'):
        if not entry: continue
        header,name=entry.split(b'\t',1); mode,kind,oid=header.decode().split(); name=os.fsdecode(name)
        need(kind=='blob' and mode in ('100644','100755'),'only normal selected Git files: '+name)
        need(not Path(name).is_absolute() and '..' not in Path(name).parts,'safe Git path')
        if '__pycache__' in Path(name).parts or name.endswith('.pyc'):
            excluded.append({'path':name,'blob':oid,'reason':'runtime cache omitted; fresh app source compile'}); continue
        data=guard.command(['cat-file','blob',oid])
        rows.append({'path':name,'mode':mode,'blob':oid,'bytes':len(data),'sha256':sha(data)})
    names={r['path'] for r in rows}
    need(all(p in names for p in TEN) and 'build.py' in names,'all ten unchanged assertion/runtime sources selected')
    return {'base':BASE,'files':rows,'omittedCaches':excluded}

def seal(guard, run, env):
    need(sha(read(DELTA))==DELTA_SHA and sha(read(MODULE))==MODULE_SHA,'accepted delta/final module changed')
    return {'kind':'BILLBOARD72_NORMAL_BUILD_PAIRED_SIX_SEAL','root':guard.summary(),
            'latestKnownCodeCommit':guard.latestKnownCodeCommit,'latestCodeMetadataSource':'parent-provided; not queried remotely; core remains391',
            'controller':file_pin(Path(__file__)),'helper':file_pin(HELPER),
            'overlay':[file_pin(DELTA),file_pin(DELTA_MANIFEST),file_pin(MODULE)],
            'inputs':inputs(guard),'runtime':runtime(env),'tests':TESTS,'expectedHTML':EXPECTED,
            'RAMroot':str(run),'TMPDIR':str(run/'t'),'pairedBeforeAfter':True,
            'historical70':'reference only; its engine-direct browser value is not treated as the same launcher condition',
            'ROOTWrites':0,'GitWrites':0,'networkActions':0,'publicChecks':0,'postSaveReadback':0}

def same_seal(a,b):
    a=dict(a); b=dict(b)
    a.pop('latestKnownCodeCommit',None); b.pop('latestKnownCodeCommit',None)
    return a==b

def extract(guard, mini, manifest):
    wanted={r['path']:r for r in manifest['files']}; seen=set(); mini.mkdir()
    data=guard.command(['archive','--format=tar',BASE,'--',*PATHS])
    with tarfile.open(fileobj=io.BytesIO(data)) as archive:
        for member in archive:
            name=member.name.rstrip('/')
            if member.isdir(): continue
            if name not in wanted:
                need('__pycache__' in Path(name).parts or name.endswith('.pyc'),'unlisted archive input: '+name); continue
            need(member.isfile(),'normal archive member: '+name)
            body=archive.extractfile(member).read(); ref=wanted[name]
            need(len(body)==ref['bytes'] and sha(body)==ref['sha256'],'Git archive source bytes: '+name)
            target=mini/name; target.parent.mkdir(parents=True,exist_ok=True)
            with target.open('xb') as f: f.write(body)
            seen.add(name)
    need(seen==set(wanted),'complete selected RAM tree')

def unchanged_ten(mini, manifest):
    refs={r['path']:r for r in manifest['files']}
    for name in TEN:
        data=read(mini/name); need(len(data)==refs[name]['bytes'] and sha(data)==refs[name]['sha256'],'unchanged test/browser/baseline/planner source: '+name)

def normal_build(mini, out, env, phase, guard):
    guard.check(); out.mkdir(parents=True)
    cp=subprocess.run([sys.executable,'-B','build.py'],cwd=mini,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    (out/'stdout.txt').write_bytes(cp.stdout); (out/'stderr.txt').write_bytes(cp.stderr)
    need(cp.returncode==0,'normal '+phase+' build failed')
    rows={name:file_pin(mini/name) for name in ('index.html','en/index.html')}
    need({n:r['sha256'] for n,r in rows.items()}==EXPECTED[phase],'normal '+phase+' JAEN SHA differs from accepted reference')
    write_json(out/'result.json',{'normalBuildExit':cp.returncode,'phase':phase,'outputs':rows,'generatedHTMLRuntimeOnly':True})
    guard.check(); return rows

def six(mini, out, env, guard, input_manifest, fixed_runtime):
    guard.check(); unchanged_ten(mini,input_manifest)
    need(runtime(env)==fixed_runtime,'paired runtime/launcher changed')
    out.mkdir(parents=True)
    command=[sys.executable,'-B',str(mini/'dev/avoidance/baseline.py'),'--out',str(out)]
    write_json(out/'invocation.json',{'argv':command,'cwd':str(mini),'JIZURA_BROWSER':str(LAUNCHER),'NODE_PATH':str(NODE_MODULES),'TMPDIR':env['TMPDIR'],'scriptsUnchanged':True})
    process=subprocess.Popen(command,cwd=mini,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    with (out/'controller.log').open('xb') as log:
        for line in iter(process.stdout.readline,b''):
            log.write(line); log.flush(); print(line.decode(errors='replace'),end='',flush=True)
    code=process.wait(); guard.check(); unchanged_ten(mini,input_manifest)
    need(runtime(env)==fixed_runtime,'runtime/launcher drift after six')
    result_path=out/'baseline-results.json'
    result=json.loads(read(result_path)) if result_path.exists() else None
    write_json(out/'controller-result.json',{'exitCode':code,'resultPresent':result is not None,'RootUnchanged':True})
    need(code==0 and result is not None and [r['test'] for r in result['results']]==TESTS
         and len(result['results'])==6 and all(r['exitCode']==0 for r in result['results']), 'unchanged paired six failed')
    need(result['browser']==str(LAUNCHER) and result['node']=='v24.19.0','actual paired browser/Node condition')
    return {'exitCode':code,'results':result,'literalFiles':[file_pin(p) for p in sorted(out.iterdir()) if p.is_file()]}

def overlay(mini, env):
    need(sha(read(DELTA))==DELTA_SHA and sha(read(MODULE))==MODULE_SHA,'overlay drift')
    manifest=json.loads(read(DELTA_MANIFEST))
    for row in manifest['files']:
        body=read(mini/row['path']); need(len(body)==row['beforeBytes'] and sha(body)==row['beforeSHA256'],'exact delta before source')
    cp=subprocess.run(['patch','--batch','--forward','-p1','-d',str(mini),'-i',str(DELTA)],env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    need(cp.returncode==0,'exact source patch failed: '+cp.stderr.decode(errors='replace'))
    for row in manifest['files']:
        body=read(mini/row['path']); need(len(body)==row['bytes'] and sha(body)==row['sha256'],'exact delta after source')
    with (mini/'src/11zc_billboard_native72.js').open('xb') as f: f.write(read(MODULE))
    return {'deltaSHA256':DELTA_SHA,'moduleSHA256':MODULE_SHA,'patchStdout':cp.stdout.decode(),'onlySourceOutputs':manifest['files']}

def main():
    ap=argparse.ArgumentParser(description=__doc__); mode=ap.add_mutually_exclusive_group(required=True)
    mode.add_argument('--prepare',action='store_true'); mode.add_argument('--run',action='store_true')
    ap.add_argument('--ram-root',type=Path,default=Path('/dev/shm/b72c01'))
    ap.add_argument('--reviewed-seal',type=Path)
    ap.add_argument('--latest-known-code-commit',required=True)
    args=ap.parse_args(); run=args.ram_root
    need(re.fullmatch(r'/dev/shm/b72c[0-9]{2}',str(run)) is not None,'short own RAM root only')
    if args.prepare:
        need(not run.exists(),'fresh RAM preparation path required'); run.mkdir(); (run/'t').mkdir()
    else:
        need(run.is_dir() and args.reviewed_seal is not None,'prepared RAM root/reviewed seal required')
    env=environment(run); guard=root_guard(args.latest_known_code_commit)
    current=seal(guard,run,env); guard.check()
    if args.prepare:
        write_json(run/'seal-proposed.json',current)
        print(json.dumps({'state':'SOURCE_GATE_PREPARED_BUILD_AND_TESTS_NOT_RUN','seal':str(run/'seal-proposed.json'),'sealSHA256':sha(read(run/'seal-proposed.json')),'latestKnownCodeCommit':guard.latestKnownCodeCommit},ensure_ascii=False)); return
    approved=json.loads(read(args.reviewed_seal)); need(same_seal(approved,current),'reviewed seal differs; no render/build/test started')
    write_json(run/'RUN_STARTED.json',{'reviewedSealSHA256':sha(read(args.reviewed_seal)),'currentLatestKnownCodeCommit':guard.latestKnownCodeCommit,'sealLatestKnownCodeCommit':approved['latestKnownCodeCommit']})
    mini=run/'a'; result={'kind':'BILLBOARD72_NORMAL_JAEN_UNCHANGED_PAIRED_SIX','complete':False,'root':guard.summary(),'latestKnownCodeCommit':guard.latestKnownCodeCommit,'before6RerunReason':'historical70 recorded direct engine; paired current launcher condition must be tested freshly','publicChecks':0,'GitWrites':0,'networkActions':0,'ROOTWrites':0,'newNativeOrFullGeometryMatrix':False,'formalPerformanceAccepted':False,'independentCandidateRGBAOracle':False,'humanMotionReview':False,'evidencePolicy':'Only source deltas/refs and literal minimal results/logs; generated HTML/checkout stay RAM, never GitHub review assets.'}
    try:
        extract(guard,mini,current['inputs']); unchanged_ten(mini,current['inputs'])
        result['beforeHTML']=normal_build(mini,run/'result/build-before',env,'before',guard)
        result['before6']=six(mini,run/'result/before6',env,guard,current['inputs'],current['runtime'])
        result['overlay']=overlay(mini,env); unchanged_ten(mini,current['inputs'])
        result['afterHTML']=normal_build(mini,run/'result/build-after',env,'after',guard)
        result['after6']=six(mini,run/'result/after6',env,guard,current['inputs'],current['runtime'])
        need(all(sha(read(mini/n))==h for n,h in EXPECTED['after'].items()),'after6 HTML changed')
        result['complete']=True
    except Exception as error:
        result['error']={'message':str(error),'traceback':traceback.format_exc()}
    finally:
        try: guard.check(); result['RootGuardAfter']='unchanged'
        except Exception as error: result['RootGuardAfter']={'error':str(error)}; result['complete']=False
        write_json(run/'result/minimal-result.json',result)
        print(json.dumps({'complete':result['complete'],'result':str(run/'result/minimal-result.json'),'error':result.get('error'),'ROOTWrites':0},ensure_ascii=False),flush=True)
    if not result['complete']: raise SystemExit(1)


if __name__=='__main__': main()
