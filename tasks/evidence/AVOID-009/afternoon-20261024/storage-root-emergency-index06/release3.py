#!/usr/bin/env python3
"""Emergency three canonical raws only; release with exact49 flags, parent appends3 afterward."""
import argparse,hashlib,json,os,pathlib,stat,subprocess
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA')
MANIFEST=pathlib.Path('/tmp/avoid009-storage-ordered-magnets04/manifest.json')
MANIFEST_SHA='809036ee2f7705984f4e60df7ce44f932a728fbedde0d84ceaf727483e2e5d20'
PATHS={'tasks/evidence/AVOID-009/balloons-ordered06/ordered06.raw.json.gz','tasks/evidence/AVOID-009/magnets-native12/native12.raw.json.gz','tasks/evidence/AVOID-009/magnets-native13/native13.raw.json.gz'}

def need(ok,msg):
 if not ok:raise SystemExit('REFUSED: '+msg)

def digest(f):
 h=hashlib.sha256();size=0
 for b in iter(lambda:f.read(1048576),b''):h.update(b);size+=len(b)
 return size,h.hexdigest()

def regular(rel):
 p=pathlib.PurePosixPath(rel);need(not p.is_absolute() and '..' not in p.parts,'unsafe path')
 q=ROOT;need(not q.is_symlink(),'root symlink')
 for part in p.parts:q=q/part;need(not q.is_symlink(),'symlink')
 s=q.lstat();need(stat.S_ISREG(s.st_mode),'nonregular file');return q,s

def git(*args):return subprocess.check_output(['git','-C',str(ROOT),*args],text=True).strip()

def unchanged(m,skips):
 need(sorted(x[2:] for x in git('ls-files','-v').splitlines() if x.startswith('S '))==skips,'flags changed')
 for p in m['originalSkip']:need(not os.path.lexists(ROOT/p),'old49 absent path changed')
 for pin in m['pycs']:
  p,_=regular(pin['path'])
  with p.open('rb') as f:need(digest(f)==(pin['bytes'],pin['sha256']),'PYC changed')

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('mode',choices=['VERIFY','RELEASE']);ap.add_argument('--reviewed-source-sha256');ap.add_argument('--sealed49-run-closed',action='store_true');a=ap.parse_args()
 selfsha=hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest()
 if a.mode=='RELEASE':need(a.reviewed_source_sha256==selfsha and a.sealed49_run_closed,'reviewed SHA and parent sealed49 closure required')
 raw=MANIFEST.read_bytes();need(hashlib.sha256(raw).hexdigest()==MANIFEST_SHA,'manifest changed');m=json.loads(raw)
 need({x['path'] for x in m['items']}==PATHS and len(m['items'])==3,'whitelist differs')
 need(len(m['originalSkip'])==49,'original49 count differs')
 expected=sorted(m['originalSkip']+list(PATHS));skips=sorted(x[2:] for x in git('ls-files','-v').splitlines() if x.startswith('S '))
 need(skips == m['originalSkip'],'exact original49 flags required before release')
 receipt_path=pathlib.Path('/tmp/avoid009-root-emergency-index06/release-before-flags-receipt.json')
 if a.mode=='RELEASE':need(not os.path.lexists(receipt_path),'exclusive release receipt exists')
 unchanged(m,skips)
 need(git('rev-parse',m['commit'])=='303d63ad525f4bf536a0fc53f06979d13dcb0a4b','exact proof commit absent')
 subprocess.run(['git','-C',str(ROOT),'merge-base','--is-ancestor',m['commit'],'HEAD'],check=True)
 proof=m['pushEvidence'];need(proof['commit']==m['commit'] and proof['session']==22369 and proof['exit']==0,'parent-reported push evidence differs')
 snapshots={};allocated=0
 for x in m['items']:
  need(git('rev-parse',m['commit']+':'+x['path'])==x['blob'],'blob mapping differs')
  proc=subprocess.Popen(['git','-C',str(ROOT),'cat-file','blob',x['blob']],stdout=subprocess.PIPE)
  actual=digest(proc.stdout);need(proc.wait()==0 and actual==(x['bytes'],x['sha256']),'full Git proof failed')
  p,s=regular(x['path'])
  with p.open('rb') as f:need(digest(f)==actual,'canonical differs')
  need(s.st_nlink==1 and s.st_blocks*512==x['allocated'],'nlink/allocation differs')
  snapshots[x['path']]=(s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_nlink);allocated+=s.st_blocks*512
 need(allocated==m['reclaimBytes']==1871872,'physical sum differs');unchanged(m,skips)
 for rel,pin in snapshots.items():
  _,s=regular(rel);need((s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_nlink)==pin,'target changed during verify')
 if a.mode=='RELEASE':
  for rel,pin in snapshots.items():
   p,s=regular(rel);need((s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_nlink)==pin,'target changed during release');p.unlink()
  unchanged(m,skips);need(all(not os.path.lexists(ROOT/p) for p in PATHS),'release incomplete')
  with receipt_path.open('x') as receipt:json.dump({'mode':'RELEASE_BEFORE_FLAGS','sourceSHA256':selfsha,'proofCommit':m['commit'],'releasedPaths':sorted(PATHS),'reclaimBytes':allocated,'original49Preserved':True,'nextAction':'Parent appends exactly3 flags with reviewed private-index helper; no source run may start until52 sealed'},receipt,indent=2);receipt.write('\n')
 print(json.dumps({'mode':a.mode,'files':3,'reclaimBytes':allocated,'proofCommit':m['commit'],'sourceSHA256':selfsha,'newCanonicalSkips':sorted(PATHS),'old49AbsentsPreserved':True,'pycsPreserved':len(m['pycs']),'pushProvenance':'parent-reported session22369 exit0; no network checks','gitWrites':0,'publicChecks':0},indent=2))

if __name__=='__main__':main()
