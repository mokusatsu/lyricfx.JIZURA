#!/usr/bin/env python3
"""Parent-gated local Source stage/commit only; no push, publish, polling or network."""
import argparse,hashlib,json,os,pathlib,re,stat,subprocess
P=pathlib.Path
BASE=P('/dev/shm/avoid009-evening-20261024');SOURCE=BASE/'source';MEDIA=BASE/'magnets-media02'
PROJECT='appgprj_6adbafe9f07c8191ab0b404c53caab16'
REMOTE='https://git.chatgpt-team.site/ca6227f0-be34-40d7-9800-d5b531e94bab/'+PROJECT+'.git'
REL=P('dist/review/AVOID-009/magnets-native-20261024-01')
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
def public_projection(m):
 sides={}
 for name in ['before','after']:
  s=m['sides'][name];need(s['video']=='videos/'+name+'.mp4','Fixed native video path required')
  probe=s['probe'];need(len(probe['streams'])==1,'One video stream required');v=probe['streams'][0]
  need((v['width'],v['height'],v['r_frame_rate'],v['avg_frame_rate'],v['sample_aspect_ratio'],int(v['nb_read_frames']),v['codec_name'])==(960,540,'60/1','60/1','1:1',249,'h264'),'Native video conditions differ')
  need(abs(float(probe['format']['duration'])-4.15)<1e-6,'Native duration differs')
  need(re.fullmatch('[0-9a-f]{64}',s['videoSHA256']),'Video hash required')
  sides[name]={'video':s['video'],'sha256':s['videoSHA256'],'width':960,'height':540,'fps':'60/1','frames':249,'duration':4.15,'sampleAspectRatio':'1:1','codec':'h264'}
 need(not m.get('errors'),'Capture errors present')
 return {'schema':1,'build':'magnets-native-20261024-01','sourceProduct':m['sourceProduct'],'sourceSealSHA256':m['sealSHA256'],'sourceGateSHA256':m['gateSHA256'],
  'fixture':{'layout':'magnets','text':'風の先へ','seed':1205,'width':960,'height':540,'sourceCutStart':0,'sourceCutEnd':4,'sourceCutDuration':4,'fps':60,'koma':0,'observationHorizon':4.150001},
  'capture':{'frames':249,'encodedDuration':4.15,'clock':'j/60 for j=0..248','noHud':True,'noPost':True,'scale':1,'circleBurnedIn':False,'guide':{'htmlOverlayOnly':True,'cx':480,'cy':226.8,'r':108},'proofFrameIndices':[6,24,60,120,216,231,244]},
  'quality':{'policy':'native-moving-entry-ornament-diagnostic-v1','allPhaseOrnamentClear':False,'heldOrnamentClear':True,'movingEntryOrnamentQualityPending':True,'note':'Entry overlaps with the original scene handle or decorative magnets remain a motion-review consideration.'},
  'sides':sides,'publicFiles':NAMES,'visualReview':'PASS14','humanMotionReview':'PENDING','formalPerformanceAccepted':False,'wholeAVOID009Complete':False,'publicChecks':0}
def main():
 ap=argparse.ArgumentParser(description=__doc__)
 for name in ['expected-head','open-receipt-sha256','media-manifest-sha256','parent-gate-sha256']:ap.add_argument('--'+name,required=True)
 a=ap.parse_args()
 need(re.fullmatch('[0-9a-f]{40}',a.expected_head),'Full expected Source HEAD required')
 for value in [a.open_receipt_sha256,a.media_manifest_sha256,a.parent_gate_sha256]:need(re.fullmatch('[0-9a-f]{64}',value),'Full SHA256 required')
 need(os.environ.get('MAGNETS_PUBLICATION04_RELEASE')=='PARENT_REVIEWED_LOCAL_SOURCE_STAGE_COMMIT','Explicit parent release required')
 safe(BASE);safe(SOURCE);safe(MEDIA);need((SOURCE/'.git').is_dir() and not (SOURCE/'.git').is_symlink(),'Owned Source checkout required')
 safe(BASE/'magnets-publication04-local-receipt.json');need(not (BASE/'magnets-publication04-local-receipt.json').exists(),'Fresh local publication receipt required')
 gate_bytes=regular(BASE/'magnets-publication04-parent-gate.json');need(sha(gate_bytes)==a.parent_gate_sha256,'Parent gate SHA differs');gate=json.loads(gate_bytes)
 need(gate.get('sourceRawAccepted') is True and gate.get('media498Accepted') is True and gate.get('freshVisual14Accepted') is True,'Prior acceptance gates required')
 need(gate.get('humanMotionReview')=='PENDING','Human motion acceptance must remain pending')
 need(gate.get('expectedSourceHEAD')==a.expected_head and gate.get('mediaManifestSHA256')==a.media_manifest_sha256 and gate.get('openReceiptSHA256')==a.open_receipt_sha256,'Parent gate bindings differ')
 need(gate.get('stageScriptSHA256')==sha(regular(P(__file__).resolve())),'Parent must bind exact stage script')
 receipt_bytes=regular(BASE/'source-open-evening03.json');need(sha(receipt_bytes)==a.open_receipt_sha256,'Source-open03 receipt SHA differs');r=json.loads(receipt_bytes)
 need(r['state']=='OPENED_ONLY' and r['project_id']==PROJECT and r['remote']==REMOTE and r['branch']=='main','Wrong Source-open receipt')
 protected=r['protectedTree'];need(len(protected)==101 and sum(p.startswith('dist/') for p in protected)==100 and sum(p.startswith('.openai/') for p in protected)==1,'Expected protected tree total101 = dist100 + .openai1')
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
 need(git(['rev-parse','HEAD']).decode().strip()==a.expected_head,'Source HEAD advanced; no retry/reset');clean()
 target=SOURCE/REL;safe(target);need(not target.exists(),'New comparison destination must be absent')
 actual_names=sorted(str(p.relative_to(MEDIA/'public')) for p in (MEDIA/'public').rglob('*') if p.is_file());need(actual_names==sorted(NAMES),'Exactly five source public files required')
 mb=regular(MEDIA/'manifest.json');need(sha(mb)==a.media_manifest_sha256,'Full private media manifest SHA differs');m=json.loads(mb)
 need(regular(MEDIA/'public/manifest.json')==mb,'Initial full public/source manifest differs')
 projection=public_projection(m);payload={name:regular(MEDIA/'public'/name) for name in NAMES if name!='manifest.json'};payload['manifest.json']=(json.dumps(projection,ensure_ascii=False,indent=2)+'\n').encode()
 for side in ['before','after']:need(sha(payload['videos/'+side+'.mp4'])==m['sides'][side]['videoSHA256'],'Reviewed video SHA differs')
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
 git(['commit','--no-gpg-sign','-m','Add native magnets motion comparison for review'])
 head=git(['rev-parse','HEAD']).decode().strip();need(git(['rev-parse','HEAD^']).decode().strip()==a.expected_head,'Commit parent differs');clean();need(tree()=={**protected,**expected},'Final protected tree differs')
 need(sha(regular(MEDIA/'manifest.json'))==a.media_manifest_sha256 and regular(MEDIA/'public/manifest.json')==mb,'Original full media manifests changed')
 result={'state':'LOCAL_SOURCE_FIVE_FILE_COMMIT_ONLY','project_id':PROJECT,'priorHEAD':a.expected_head,'head':head,'openReceiptSHA256':a.open_receipt_sha256,'mediaManifestSHA256':a.media_manifest_sha256,'fiveFiles':expected,'originalProtected101Dist100Openai1ByteExact':True,'visualReview':'PASS14','humanMotionReview':'PENDING','push':False,'publish':False,'publicChecks':0}
 with (BASE/'magnets-publication04-local-receipt.json').open('x') as f:json.dump(result,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 print(json.dumps(result),flush=True)
if __name__=='__main__':
 try:main()
 except Exception as e:
  print('Local Source staging failed; no automatic retry, reset, cleanup, push or publication. Failure type: '+type(e).__name__,flush=True)
  raise SystemExit(1)
