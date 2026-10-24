#!/usr/bin/env python3
"""Explicit copy-only evidence stager. Run only inside the reviewed persistent SHM manager."""
import argparse,hashlib,json,os,pathlib,shutil,stat
P=pathlib.Path
BASE=P('/dev/shm/avoid009-afternoon-20261024'); SOURCE=BASE/'source'
REPO=P('/workspace/lyricfx.JIZURA'); STATE=BASE/'evidence-stage-baseline.json'
PLAN=P('/tmp/avoid009-afternoon-storage-source02/private-stage-plan.json')
PLAN_SHA='6f530908f11ec049fd0c50dd8c55b53e55d806a199c693d7bcf0794aec7a10f9'
PUBLIC='dist/review/AVOID-009/balloons-native-stage-20261024-03'
KEYS=[6,24,60,120,216,231,244]
PUB=['index.html','en.html','manifest.json','videos/before.mp4','videos/after.mp4']
IMAGES=[f'evidence/images/{side}-{n:03d}.png' for side in ['before','after'] for n in KEYS]

def need(ok,msg):
 if not ok: raise RuntimeError(msg)

def safe(p,exists=True):
 p=P(p);need(p.is_absolute() and '..' not in p.parts,'unsafe path')
 for parent in [*reversed(p.parents),p]: need(not parent.is_symlink(),'symlink refused')
 if exists: need(p.is_file() and stat.S_ISREG(p.stat().st_mode),'regular file required: '+str(p))
 return p

def pin(p):
 p=safe(p);h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return {'bytes':p.stat().st_size,'sha256':h.hexdigest()}

def inventory(root):
 safe(root,False);need(root.is_dir(),'directory missing')
 result={}
 for p in root.rglob('*'):
  need(not p.is_symlink(),'inventory symlink')
  if p.is_file():result[str(p.relative_to(root))]=pin(p)
 return result

def write_json(path,data):
 safe(path,False);path.parent.mkdir(parents=True,exist_ok=True)
 with path.open('x') as f:json.dump(data,f,indent=2);f.write('\n')

def baseline():
 need(not os.path.lexists(STATE),'baseline already exists')
 hosting=SOURCE/'.openai/hosting.json';cfg=json.loads(safe(hosting).read_text())
 need(cfg['project_id']=='appgprj_6adbafe9f07c8191ab0b404c53caab16' and cfg['static']['directory']=='dist','hosting mismatch')
 dist=inventory(SOURCE/'dist');need(len(dist)==95,'expected exactly95 existing dist files')
 data={'hosting':pin(hosting),'dist':dist,'publicChecks':0}
 write_json(STATE,data);print(json.dumps({'baselineFiles':len(dist),'state':str(STATE)}))

def unchanged():
 b=json.loads(safe(STATE).read_text())
 need(pin(SOURCE/'.openai/hosting.json')==b['hosting'],'hosting changed')
 need(inventory(SOURCE/'dist')==b['dist'],'existing dist inventory changed')
 return b

def item(source,relative,expected=None):
 pp=pathlib.PurePosixPath(relative);need(not pp.is_absolute() and '..' not in pp.parts and '.' not in pp.parts,'unsafe relative')
 actual=pin(source)
 if expected is not None:need(actual==expected,'source pin mismatch: '+str(source))
 return {'source':str(source),'relative':relative,**actual}

def copy_set(dest,items,status):
 unchanged();safe(dest,False);need(not os.path.lexists(dest),'fresh destination required')
 need(len({x['relative'] for x in items})==len(items),'duplicate destination')
 # Verify all bytes before creating destination; only fixed enumerated sources accepted.
 for x in items:need(pin(P(x['source']))=={k:x[k] for k in ['bytes','sha256']},'source changed')
 dest.mkdir(parents=True,exist_ok=False)
 for x in items:
  target=safe(dest/x['relative'],False);target.parent.mkdir(parents=True,exist_ok=True)
  with safe(P(x['source'])).open('rb') as src,target.open('xb') as dst:shutil.copyfileobj(src,dst,1024*1024)
  expected={k:x[k] for k in ['bytes','sha256']}
  need(pin(target)==expected and pin(P(x['source']))==expected,'copy verification failed')
 # Private receipt does not imply capture/visual/human acceptance.
 write_json(dest/'preservation-manifest.json',{'status':status,'humanApproval':'pending','parentReview':'pending','items':items,'publicChecks':0})
 unchanged()
 receipt=BASE/(dest.name+'-staging-receipt.json')
 write_json(receipt,{'destination':str(dest),'files':len(items),'bytes':sum(x['bytes'] for x in items),'status':status,'publicChecks':0})
 print(json.dumps({'destination':str(dest),'files':len(items),'bytes':sum(x['bytes'] for x in items),'receipt':str(receipt)}))

def old07():
 need(pin(PLAN)['sha256']==PLAN_SHA,'immutable07plan changed')
 plan=json.loads(PLAN.read_text());items=[]
 for x in plan['items']:items.append(item(P(x['source']),x['relative'],{k:x[k] for k in ['bytes','sha256']}))
 items += [item(REPO/'work/avoid009-balloons-media07/evidence/parent-allframes07.json','evidence/parent-allframes07.json'),item(P('/tmp/parent-balloons-media-review.py'),'parent-review/parent-balloons-media-review.py')]
 copy_set(SOURCE/'private-evidence/AVOID-009/balloons-media07',items,'WITHHELD_VISUAL_ATTACHMENT_GAP_NOT_HUMAN_APPROVED')

def capture_items(n,failed):
 capture=BASE/f'balloons-media{n}';work=REPO/f'work/avoid009-balloons-media{n}'
 allowed=set(IMAGES+['manifest.json',f'evidence/invocation{n}.json',f'evidence/view-mirror{n}.json','evidence/before.frames.json.gz','evidence/after.frames.json.gz']+['public/'+p for p in PUB])
 actual=inventory(capture);need(set(actual)<=allowed,'unknown capture extras')
 if failed:
  need('manifest.json' not in actual and 'public/manifest.json' not in actual,'failed capture unexpectedly finalized')
  required={'evidence/before.frames.json.gz',f'evidence/invocation{n}.json','public/videos/before.mp4'}|{p for p in IMAGES if '/before-' in p}
 else:required=allowed-{f'evidence/view-mirror{n}.json'}
 need(required<=set(actual),'required capture evidence missing')
 items=[item(capture/p,p,actual[p]) for p in sorted(actual)]
 work_names=[f'runner/capture{n}.cjs',f'evidence/SOURCE-MEDIA{n}.md',f'evidence/pins{n}.json',f'evidence/seal{n}.json',f'evidence/parent-source-gate{n}.json',f'evidence/integrate{n}.py',f'evidence/main-integration{n}.json',f'evidence/parent-main-integration{n}.json','public/index.html','public/en.html',f'evidence/parent-allframes{n}.json']
 known=set(work_names);present=inventory(work);need(set(present)<=known,'unknown work extras')
 need(set(work_names[:5])<=set(present),'required source/pin/seal/gate missing')
 items += [item(work/p,'capture-source/'+p,present[p]) for p in sorted(present)]
 return capture,items

def final11(sha):
 capture,items=capture_items('11',False)
 need(sha and pin(capture/'manifest.json')['sha256']==sha,'explicit parent manifest SHA required')
 need(pin(capture/'manifest.json')==pin(capture/'public/manifest.json'),'public/capture manifests differ')
 manifest=json.loads((capture/'manifest.json').read_text())
 need(manifest.get('errors')==[] and manifest.get('humanMotionReview')=='pending','capture status mismatch')
 for name in ['videos/before.mp4','videos/after.mp4']:
  entry=manifest['assets'][name];expected=entry if isinstance(entry,str) else entry['sha256']
  need(pin(capture/'public'/name)['sha256']==expected,'manifest asset mismatch')
 copy_set(SOURCE/'private-evidence/AVOID-009/balloons-media11',items,'CAPTURE_COMPLETE_PARENT_AND_VISUAL_REVIEW_PENDING_NOT_HUMAN_APPROVED')

def public11(sha):
 unchanged();capture=BASE/'balloons-media11';need(sha and pin(capture/'manifest.json')['sha256']==sha,'explicit parent manifest SHA required')
 private=SOURCE/'private-evidence/AVOID-009/balloons-media11'
 evidence=json.loads(safe(private/'preservation-manifest.json').read_text());pins={x['relative']:x for x in evidence['items']}
 dest=SOURCE/PUBLIC;safe(dest,False);need(not os.path.lexists(dest),'fresh public destination required')
 items=[item(capture/'public'/p,p,{k:pins['public/'+p][k] for k in ['bytes','sha256']}) for p in PUB]
 dest.mkdir(parents=True,exist_ok=False)
 for x in items:
  target=safe(dest/x['relative'],False);target.parent.mkdir(parents=True,exist_ok=True)
  with P(x['source']).open('rb') as src,target.open('xb') as dst:shutil.copyfileobj(src,dst,1024*1024)
  expected={k:x[k] for k in ['bytes','sha256']};need(pin(target)==expected and pin(P(x['source']))==expected,'public copy mismatch')
 b=json.loads(STATE.read_text());after=inventory(SOURCE/'dist');expected=dict(b['dist'])
 for x in items:expected[str((dest/x['relative']).relative_to(SOURCE/'dist'))]={k:x[k] for k in ['bytes','sha256']}
 need(after==expected and pin(SOURCE/'.openai/hosting.json')==b['hosting'],'public staging changed unrelated files')
 write_json(BASE/'public11-staging-receipt.json',{'destination':str(dest),'items':items,'parentManifestSHA256':sha,'humanApproval':'pending','publicChecks':0,'publicationWhitelist':['.openai/hosting.json','dist']})
 print(json.dumps({'publicFiles':5,'existingDistPreserved':len(b['dist']),'publicChecks':0,'humanApproval':'pending'}))

if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['BASELINE','OLD07','FAILED09','FINAL11','PUBLIC11']);ap.add_argument('--manifest-sha256');a=ap.parse_args()
 if a.action=='BASELINE':baseline()
 elif a.action=='OLD07':old07()
 elif a.action=='FAILED09':
  _,files=capture_items('09',True);copy_set(SOURCE/'private-evidence/AVOID-009/balloons-media09',files,'FAILED_SIGNED_ZERO_ASSERTION_NOT_APPROVED')
 elif a.action=='FINAL11':final11(a.manifest_sha256)
 else:public11(a.manifest_sha256)
