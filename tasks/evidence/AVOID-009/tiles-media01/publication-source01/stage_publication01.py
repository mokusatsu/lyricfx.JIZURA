#!/usr/bin/env python3
"""Parent-gated local Source stage/commit only; no push, publish, polling or network."""
import argparse,hashlib,json,os,pathlib,re,stat,subprocess
P=pathlib.Path
BASE=P('/dev/shm/avoid009-evening-20261024');SOURCE=BASE/'source';MEDIA=BASE/'tiles-media01'
PROJECT='appgprj_6adbafe9f07c8191ab0b404c53caab16'
REMOTE='https://git.chatgpt-team.site/ca6227f0-be34-40d7-9800-d5b531e94bab/'+PROJECT+'.git'
REL=P('dist/review/AVOID-009/tiles-native-20261025-01')
NAMES=['index.html','en.html','manifest.json','videos/before.mp4','videos/after.mp4']
def need(ok,message):
 if not ok:raise RuntimeError(message)
def sha(b):return hashlib.sha256(b).hexdigest()
def safe(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'Symlink alias rejected')
def regular(p):
 safe(p);need(stat.S_ISREG(p.stat().st_mode),'Regular file required');return p.read_bytes()
def tree():
 result={}
 for folder in ['dist','.openai']:
  top=SOURCE/folder;safe(top);need(top.is_dir(),'Protected tree required')
  for p in sorted(top.rglob('*')):
   safe(p);s=p.lstat();need(stat.S_ISREG(s.st_mode) or stat.S_ISDIR(s.st_mode),'Unexpected protected node')
   if p.is_file():result[str(p.relative_to(SOURCE))]={'bytes':s.st_size,'sha256':sha(p.read_bytes())}
 return result
def public_projection(m,gate):
 projection_path=P(__file__).resolve().parent/'public-manifest-projection01.cjs'
 need(sha(regular(projection_path))==gate['projectionScriptSHA256'],'Reviewed projection bytes differ')
 node=P(gate['nodePath']);need(node.is_absolute() and sha(regular(node))==gate['nodeSHA256'],'Pinned Node required')
 # Status changes affect an isolated JSON copy; original capture manifests stay byte-exact.
 copy=json.loads(json.dumps(m));copy['visualReview']='PASS14-static-only';copy['humanMotionReview']='PENDING'
 code="const fs=require('fs');const p=require(process.argv[1]);process.stdout.write(JSON.stringify(p(JSON.parse(fs.readFileSync(0,'utf8')))));"
 result=subprocess.run([str(node),'-e',code,str(projection_path)],input=json.dumps(copy).encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
 p=json.loads(result.stdout)
 def keys(obj,allowed):need(isinstance(obj,dict) and set(obj)==set(allowed),'Unexpected public manifest schema')
 keys(p,['schema','build','sourceProduct','sourceSealSHA256','sourceGateSHA256','fixture','capture','quality','sides','publicFiles','humanMotionReview','visualReview','formalPerformanceAccepted','publicChecks'])
 keys(p['fixture'],['layout','text','seed','width','height','sourceCutStart','sourceCutEnd','sourceCutDuration','fps','koma','observationHorizon','baseline'])
 keys(p['capture'],['frames','encodedDuration','clock','noHud','noPost','scale','circleBurnedIn','guide','proofFrameIndices'])
 keys(p['capture']['guide'],['htmlOverlayOnly','cx','cy','r'])
 keys(p['quality'],['policy','entryExitTileAndOwnedPointsCircleRelaxation','rackScoreAndHeldStrict','humanMotionApproval'])
 keys(p['sides'],['before','after'])
 for name in ['before','after']:
  v=p['sides'][name];keys(v,['video','sha256','width','height','codec','fps','frames','duration','sampleAspectRatio'])
  need((v['video'],v['width'],v['height'],v['codec'],v['fps'],v['frames'],v['duration'],v['sampleAspectRatio'])==('videos/'+name+'.mp4',960,540,'h264','60/1',249,4.15,'1:1'),'Native media metadata differs')
  need(re.fullmatch('[0-9a-f]{64}',v['sha256']),'Native video SHA required')
 need(p['fixture']['layout']=='tiles' and p['build']=='tiles-native-20261025-01' and p['publicFiles']==NAMES,'Exact fixed tiles publication required')
 need(p['visualReview']=='PASS14-static-only' and p['humanMotionReview']=='PENDING' and p['formalPerformanceAccepted'] is False and p['publicChecks']==0,'Review scope differs')
 def private_free(x):
  if isinstance(x,dict):
   for k,v in x.items():need(k not in ['seal','files','pins','path','root','requests','invocation','protectedAbsent'],'Private provenance key');private_free(v)
  elif isinstance(x,list):
   for v in x:private_free(v)
  elif isinstance(x,str):need(not any(t in x for t in ['/workspace/','/dev/shm/','/tmp/','file://','/proc/']),'Private path leak')
 private_free(p);need(not m.get('errors'),'Capture errors present');return p
def main():
 ap=argparse.ArgumentParser(description=__doc__)
 for name in ['expected-head','open-receipt-sha256','media-manifest-sha256','parent-gate-sha256']:ap.add_argument('--'+name,required=True)
 a=ap.parse_args()
 need(re.fullmatch('[0-9a-f]{40}',a.expected_head),'Full expected Source HEAD required')
 for value in [a.open_receipt_sha256,a.media_manifest_sha256,a.parent_gate_sha256]:need(re.fullmatch('[0-9a-f]{64}',value),'Full SHA256 required')
 need(os.environ.get('TILES_PUBLICATION01_RELEASE')=='PARENT_REVIEWED_LOCAL_SOURCE_STAGE_COMMIT','Explicit parent release required')
 safe(BASE);safe(SOURCE);safe(MEDIA);need((SOURCE/'.git').is_dir() and not (SOURCE/'.git').is_symlink(),'Owned Source checkout required')
 safe(BASE/'tiles-publication01-local-receipt.json');need(not (BASE/'tiles-publication01-local-receipt.json').exists(),'Fresh local publication receipt required')
 gate_bytes=regular(BASE/'tiles-publication01-parent-gate.json');need(sha(gate_bytes)==a.parent_gate_sha256,'Parent gate SHA differs');gate=json.loads(gate_bytes)
 need(gate.get('sourceRawAccepted') is True and gate.get('media498Accepted') is True and gate.get('freshVisual14Accepted') is True,'Prior acceptance gates required')
 need(gate.get('humanMotionReview')=='PENDING','Human motion acceptance must remain pending')
 need(gate.get('expectedSourceHEAD')==a.expected_head and gate.get('mediaManifestSHA256')==a.media_manifest_sha256 and gate.get('openReceiptSHA256')==a.open_receipt_sha256,'Parent gate bindings differ')
 need(gate.get('stageScriptSHA256')==sha(regular(P(__file__).resolve())),'Parent must bind exact stage script')
 receipt_bytes=regular(BASE/'tiles-publication01-source-open.json');need(sha(receipt_bytes)==a.open_receipt_sha256=='9cdc14383c319f27116857042930c0b0f4061b6ea15a902ae62d1f950a5f2fd8','Source-open receipt SHA differs');r=json.loads(receipt_bytes)
 need(r['state']=='OPENED_ONLY_SOURCE_MANAGEMENT_NO_PUBLIC_CHECK' and r['project_id']==PROJECT and r['remote']==REMOTE and r['branch']=='main','Wrong Source-open receipt')
 protected=r['protectedTree'];protected_total=len(protected);protected_dist=sum(p.startswith('dist/') for p in protected);protected_openai=sum(p.startswith('.openai/') for p in protected);need(protected_total==r['protectedTotal'] and protected_dist==r['protectedDist'] and protected_total==protected_dist+protected_openai and protected_openai==1,'Protected counts differ from exact Source-open receipt');need(r['head']==a.expected_head,'Source-open HEAD differs')
 need(tree()==protected,'Existing dist/.openai bytes differ from source-open03')
 hosting=json.loads(regular(SOURCE/'.openai/hosting.json'));need(hosting['project_id']==PROJECT and hosting['static']['directory']=='dist','Hosting config differs')
 env=os.environ.copy()
 for k in list(env):
  if k.startswith('GIT_TRACE') or k.startswith('GIT_CONFIG_') or k in ['GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES','GIT_CURL_VERBOSE']:env.pop(k,None)
 env['GIT_TERMINAL_PROMPT']='0';env['GIT_OPTIONAL_LOCKS']='0'
 def git(args):
  return subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=false','-c','core.hooksPath=/dev/null',*args],cwd=SOURCE,env=env,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
 def clean():need(not git(['status','--porcelain=v1','--untracked-files=all']).strip(),'Source checkout must be clean')
 need(git(['symbolic-ref','--short','HEAD']).decode().strip()=='main','Source branch differs');need(git(['config','--get-all','remote.origin.url']).decode().strip()==REMOTE,'Source remote differs')
 need(git(['rev-parse','HEAD']).decode().strip()==a.expected_head,'Source HEAD advanced; no retry/reset');clean();original_tracked=git(['ls-tree','-rz','HEAD'])
 target=SOURCE/REL;safe(target);need(not target.exists(),'New comparison destination must be absent')
 actual_names=sorted(str(p.relative_to(MEDIA/'public')) for p in (MEDIA/'public').rglob('*') if p.is_file());need(actual_names==sorted(NAMES),'Exactly five source public files required')
 mb=regular(MEDIA/'manifest.json');need(sha(mb)==a.media_manifest_sha256,'Full private media manifest SHA differs');m=json.loads(mb)
 public_capture_bytes=regular(MEDIA/'public/manifest.json');need(sha(public_capture_bytes)==gate['capturePublicManifestSHA256'],'Capture public manifest SHA differs');need(len(public_capture_bytes)==2156,'Expected separately projected capture public manifest');need(len(mb)==675823,'Expected full private capture manifest');need(sha(mb)=='b83f939e5185e52d6fac46fcc1821023934549b0af1e86740875760b033a150a','Fixed media manifest differs')
 projection=public_projection(m,gate);payload={name:regular(MEDIA/'public'/name) for name in NAMES if name!='manifest.json'};payload['manifest.json']=(json.dumps(projection,ensure_ascii=False,indent=2)+'\n').encode()
 need(sha(payload['manifest.json'])==gate['projectedPublicManifestSHA256'],'Parent-reviewed projected manifest SHA differs')
 for side,size in [('before',570488),('after',578834)]:need(len(payload['videos/'+side+'.mp4'])==size==int(m['sides'][side]['probe']['format']['size']) and sha(payload['videos/'+side+'.mp4'])==m['sides'][side]['videoSHA256'],'Reviewed video side bytes/probe/SHA differ')
 need(tree()==protected,'Protected bytes changed before staging');need(git(['rev-parse','HEAD']).decode().strip()==a.expected_head,'Source HEAD changed before staging')
 for name in NAMES:
  p=target/name;safe(p);p.parent.mkdir(parents=True,exist_ok=True)
  with p.open('xb') as f:f.write(payload[name]);f.flush();os.fsync(f.fileno())
 expected={str(REL/name):{'bytes':len(payload[name]),'sha256':sha(payload[name])} for name in NAMES}
 need(tree()=={**protected,**expected},'Only five new protected-tree files allowed')
 changed=[x.decode() for x in git(['ls-files','--others','--exclude-standard','-z']).split(b'\0') if x];need(sorted(changed)==sorted(expected),'Unexpected untracked Source changes')
 need(not git(['diff','--name-only']).strip() and not git(['diff','--cached','--name-only']).strip(),'Unexpected tracked/index changes')
 git(['add','--',*sorted(expected)])
 diff=[x.decode() for x in git(['diff','--cached','--name-status','-z']).split(b'\0') if x];need(diff==[y for x in sorted(expected) for y in ['A',x]],'Index must add exactly five whitelisted files')
 need(tree()=={**protected,**expected},'Protected bytes changed before commit')
 git(['commit','--no-gpg-sign','-m','Add native tiles motion comparison for review'])
 head=git(['rev-parse','HEAD']).decode().strip();new_tracked=git(['ls-tree','-rz','HEAD']);preserved=b'\0'.join(row for row in new_tracked.split(b'\0') if row and row.split(b'\t',1)[1].decode() not in expected)+b'\0';need(preserved==original_tracked,'Full original tracked tree including private files differs');need(git(['diff-tree','--no-commit-id','--name-status','-r','-z',a.expected_head,head]).split(b'\0')==[y.encode() for x in sorted(expected) for y in ['A',x]]+[b''],'Commit must add only five files');need(git(['rev-parse','HEAD^']).decode().strip()==a.expected_head,'Commit parent differs');clean();need(tree()=={**protected,**expected},'Final protected tree differs')
 need(sha(regular(MEDIA/'manifest.json'))==a.media_manifest_sha256 and regular(MEDIA/'public/manifest.json')==public_capture_bytes,'Original full media manifests changed')
 result={'state':'LOCAL_SOURCE_FIVE_FILE_COMMIT_ONLY','project_id':PROJECT,'priorHEAD':a.expected_head,'head':head,'openReceiptSHA256':a.open_receipt_sha256,'mediaManifestSHA256':a.media_manifest_sha256,'capturePublicManifestSHA256':sha(public_capture_bytes),'projectedPublicManifestSHA256':sha(payload['manifest.json']),'parentGateSHA256':a.parent_gate_sha256,'stageScriptSHA256':gate['stageScriptSHA256'],'projectionScriptSHA256':gate['projectionScriptSHA256'],'fiveFiles':expected,'originalProtectedTreeByteExact':True,'protectedCountsBefore':{'total':protected_total,'dist':protected_dist,'openai':protected_openai},'protectedCountsAfter':{'total':protected_total+5,'dist':protected_dist+5,'openai':protected_openai},'expectedProtectedTree':{**protected,**expected},'fullTrackedPrivateTreePreserved':True,'visualReview':'PASS14-static-only','humanMotionReview':'PENDING','push':False,'publish':False,'publicChecks':0}
 with (BASE/'tiles-publication01-local-receipt.json').open('x') as f:json.dump(result,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 print(json.dumps(result),flush=True)
if __name__=='__main__':
 try:main()
 except Exception as e:
  print('Local Source staging failed; no automatic retry, reset, cleanup, push or publication. Failure type: '+type(e).__name__,flush=True)
  raise SystemExit(1)
