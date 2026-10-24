#!/usr/bin/env python3
"""Fixed four-file canonical native blocks release; parent appends flags and executes."""
import argparse,hashlib,json,os,pathlib,stat,subprocess
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA')
MANIFEST=pathlib.Path('/tmp/avoid009-afternoon-storage-native03/manifest.json')
MANIFEST_SHA='681493c2247362e92bfa875abd6f78b4855b1cd7db4f1d8f53c077ba4dfa7cfe'
PREFIX='tasks/evidence/AVOID-009/blocks-native01/'
NAMES={'native01.raw.json.gz','native02.raw.json.gz','native03.raw.json.gz','native03-thin.tar.gz'}

def need(ok,message):
 if not ok:raise SystemExit('REFUSED: '+message)

def digest(f):
 h=hashlib.sha256();size=0
 for b in iter(lambda:f.read(1048576),b''):h.update(b);size+=len(b)
 return size,h.hexdigest()

def regular(rel):
 p=pathlib.PurePosixPath(rel);need(not p.is_absolute() and '..' not in p.parts,'unsafe path')
 q=ROOT;need(not q.is_symlink(),'root symlink')
 for part in p.parts:q=q/part;need(not q.is_symlink(),'symlink')
 s=q.lstat();need(stat.S_ISREG(s.st_mode),'not regular')
 return q,s

def git(*args):return subprocess.check_output(['git','-C',str(ROOT),*args],text=True).strip()

def unchanged(m,skips):
 current=sorted(x[2:] for x in git('ls-files','-v').splitlines() if x.startswith('S '))
 need(current==skips,'skip flags changed')
 for p in m['originalSkip']:need(not os.path.lexists(ROOT/p),'original45 absent path changed')
 for pin in m['pycs']:
  p,_=regular(pin['path'])
  with p.open('rb') as f:need(digest(f)==(pin['bytes'],pin['sha256']),'PYC changed')

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('mode',choices=['VERIFY','RELEASE']);ap.add_argument('--reviewed-source-sha256');a=ap.parse_args()
 selfsha=hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest()
 if a.mode=='RELEASE':need(a.reviewed_source_sha256==selfsha,'exact parent-reviewed source SHA required')
 raw=MANIFEST.read_bytes();need(hashlib.sha256(raw).hexdigest()==MANIFEST_SHA,'manifest changed');m=json.loads(raw)
 need({x['canonical'] for x in m['items']}=={PREFIX+n for n in NAMES} and len(m['items'])==4,'fixed whitelist mismatch')
 need(len(m['originalSkip'])==45,'original45 count mismatch')
 expected=sorted(m['originalSkip']+[x['canonical'] for x in m['items']]);skips=sorted(x[2:] for x in git('ls-files','-v').splitlines() if x.startswith('S '))
 need(skips in [m['originalSkip'],expected],'unknown skip changes')
 if a.mode=='RELEASE':need(skips==expected,'parent must append exactly4flags first')
 unchanged(m,skips)
 need(git('rev-parse',m['commit'])==m['commit'],'exact proof commit absent')
 subprocess.run(['git','-C',str(ROOT),'merge-base','--is-ancestor',m['commit'],'HEAD'],check=True)
 receipt=json.loads(git('show','HEAD:tasks/evidence/AVOID-009/blocks-media03/publication-source-push03.json'))
 need(receipt['mainMediaEvidenceCommit']=='082d69f0' and receipt['mainMediaPushExit']==0,'durable successful push receipt missing')
 snapshots={};allocated=0
 for x in m['items']:
  need(git('rev-parse',m['commit']+':'+x['canonical'])==x['blob'],'exact blob mapping differs')
  proc=subprocess.Popen(['git','-C',str(ROOT),'cat-file','blob',x['blob']],stdout=subprocess.PIPE)
  actual=digest(proc.stdout);need(proc.wait()==0 and actual==(x['size'],x['sha256']),'full Gitblob proof failed')
  p,s=regular(x['canonical'])
  with p.open('rb') as f:need(digest(f)==actual,'canonical bytes differ')
  need(s.st_nlink==1 and s.st_blocks*512==x['allocated'],'physical allocation/link count changed')
  need(not os.path.lexists(ROOT/x['path']),'previously released work duplicate reappeared')
  snapshots[x['canonical']]=(s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_nlink)
  allocated+=s.st_blocks*512
 need(allocated==m['reclaimBytes']==5890048,'physical sum mismatch')
 unchanged(m,skips)
 for rel,pin in snapshots.items():
  _,s=regular(rel);need((s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_nlink)==pin,'target changed during verify')
 if a.mode=='RELEASE':
  for rel,pin in snapshots.items():
   p,s=regular(rel);need((s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_nlink)==pin,'target changed during release');p.unlink()
  unchanged(m,skips)
  need(all(not os.path.lexists(ROOT/p) for p in snapshots),'release incomplete')
 print(json.dumps({'mode':a.mode,'files':4,'reclaimBytes':allocated,'proofCommit':m['commit'],'sourceSHA256':selfsha,'newCanonicalSkips':sorted(snapshots),'original45AbsentsPreserved':True,'pycsPreserved':len(m['pycs']),'gitWrites':0,'publicChecks':0},indent=2))

if __name__=='__main__':main()
