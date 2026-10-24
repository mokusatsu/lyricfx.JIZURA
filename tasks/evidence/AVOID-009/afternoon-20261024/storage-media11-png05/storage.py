#!/usr/bin/env python3
"""Manager40524 only: verify or release fixed14 shared PNG duplicates, retaining five public files."""
import argparse,hashlib,json,os,pathlib,stat,subprocess
P=pathlib.Path
OUT=P('/tmp/avoid009-storage-media11-png05');MANIFEST_SHA='adf8a345b7eba2fee05764d6ee84bab5c9971c43f3594c43329fee50c854ba9b'
BASE=P('/dev/shm/avoid009-afternoon-20261024');SOURCE=BASE/'source';ROOT=P('/workspace/lyricfx.JIZURA');VIEW=P('/tmp/avoid009-balloons-media11-view')
PREFIX='private-evidence/AVOID-009/balloons-media11/'
COMMIT='1de32441c1d00faac094f7b98d58e8fb4d11e30e'
RELATIVES={f'evidence/images/{side}-{n:03d}.png' for side in ['before','after'] for n in [6,24,60,120,216,231,244]}

def need(ok,msg):
 if not ok:raise SystemExit('REFUSED: '+msg)

def safe(p):
 p=P(p);need(p.is_absolute() and '..' not in p.parts,'unsafe path')
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink')
 s=p.lstat();need(stat.S_ISREG(s.st_mode),'regular file required');return s

def digest(f):
 h=hashlib.sha256();size=0
 for b in iter(lambda:f.read(1048576),b''):h.update(b);size+=len(b)
 return {'bytes':size,'sha256':h.hexdigest()}

def pin(p):
 safe(p)
 with P(p).open('rb') as f:return digest(f)

def git(repo,*args):return subprocess.check_output(['git','-C',str(repo),*args],text=True).strip()

def protected(m):
 need(sorted(x[2:] for x in git(ROOT,'ls-files','-v').splitlines() if x.startswith('S '))==m['originalSkip'],'49flags changed')
 for rel in m['originalSkip']:need(not os.path.lexists(ROOT/rel),'old49 absent changed')
 for x in m['pycs']:need(pin(ROOT/x['path'])=={k:x[k] for k in ['bytes','sha256']},'PYC changed')
 for rel,x in m['public'].items():need(pin(VIEW/'public'/rel)==x,'public mirror changed')


def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('mode',choices=['VERIFY','RELEASE']);ap.add_argument('--reviewed-source-sha256');ap.add_argument('--verified-manifest-sha256');a=ap.parse_args()
 source_sha=hashlib.sha256(P(__file__).read_bytes()).hexdigest()
 if a.mode=='RELEASE':need(a.reviewed_source_sha256==source_sha,'reviewed source SHA required')
 raw=(OUT/'manifest.json').read_bytes();need(hashlib.sha256(raw).hexdigest()==MANIFEST_SHA,'frozen manifest changed');m=json.loads(raw)
 need(len(m['items'])==14 and {x['relative'] for x in m['items']}==RELATIVES and len(m['originalSkip'])==49,'fixed whitelist differs')
 safe(SOURCE/'.git/HEAD');need(git(SOURCE,'rev-parse','HEAD')==COMMIT==m['commit'],'manager source HEAD differs')
 receipt=m['pushReceipt'];need(pin(P(receipt['path']))=={k:receipt[k] for k in ['bytes','sha256']},'durable push receipt changed')
 pushed=json.loads(P(receipt['path']).read_text());need(pushed['commit']==COMMIT and pushed['pushExit']==0,'push proof differs')
 preservation=json.loads(git(SOURCE,'show',COMMIT+':'+PREFIX+'preservation-manifest.json'))
 saved={x['relative']:x for x in preservation['items']}
 staging=json.loads(P(BASE/'public11-staging-receipt.json').read_text())
 need(staging['parentManifestSHA256']==m['public']['manifest.json']['sha256'],'public staging manifest differs')
 staged={x['relative']:{k:x[k] for k in ['bytes','sha256']} for x in staging['items']}
 need(staged==m['public'],'five public staging pins differ')
 protected(m);snapshots={};proof=[];allocated=0
 for x in m['items']:
  rel=x['relative'];expected={k:x[k] for k in ['bytes','sha256']}
  need({k:saved[rel][k] for k in ['bytes','sha256']}==expected,'committed preservation pin differs')
  blob=git(SOURCE,'rev-parse',COMMIT+':'+PREFIX+rel)
  proc=subprocess.Popen(['git','-C',str(SOURCE),'cat-file','blob',blob],stdout=subprocess.PIPE)
  actual=digest(proc.stdout);need(proc.wait()==0 and actual==expected,'full source Gitblob differs')
  p=VIEW/rel;s=safe(p);need(pin(p)==expected,'shared PNG differs')
  need(s.st_nlink==1 and s.st_blocks*512==x['allocated'],'link/allocation differs')
  snapshots[rel]=(s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_nlink);allocated+=s.st_blocks*512
  proof.append({'relative':rel,'blob':blob,**expected})
 need(allocated==m['reclaimBytes']==6082560,'physical sum differs')
 verified={'commit':COMMIT,'privatePrefix':PREFIX,'files':proof,'reclaimBytes':allocated}
 encoded=json.dumps(verified,sort_keys=True,separators=(',',':')).encode();proofsha=hashlib.sha256(encoded).hexdigest()
 if a.mode=='RELEASE':need(a.verified_manifest_sha256==proofsha,'parent verified manifest SHA required')
 target=OUT/(a.mode.lower()+'-receipt.json');need(not os.path.lexists(target),'exclusive receipt already exists')
 protected(m)
 for rel,snapshot in snapshots.items():
  s=safe(VIEW/rel);need((s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_nlink)==snapshot,'target changed during verify')
 if a.mode=='RELEASE':
  for rel,snapshot in snapshots.items():
   p=VIEW/rel;s=safe(p);need((s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_nlink)==snapshot,'target changed during release');p.unlink()
  protected(m);need(all(not os.path.lexists(VIEW/rel) for rel in RELATIVES),'release incomplete')
 result={'mode':a.mode,'sourceSHA256':source_sha,'verifiedManifestSHA256':proofsha,'proof':verified,'original49AndPYCAnd5PublicFilesPreserved':True,'gitWrites':0,'publicChecks':0}
 with target.open('x') as f:json.dump(result,f,indent=2);f.write('\n')
 print(json.dumps({'mode':a.mode,'verifiedManifestSHA256':proofsha,'receipt':str(target),'reclaimBytes':allocated,'publicChecks':0}))

if __name__=='__main__':main()
