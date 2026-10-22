from pathlib import Path
import subprocess,os,json,hashlib,gzip,shutil
MAIN=Path('/workspace/lyricfx.JIZURA');SOURCE=Path('/workspace/avoid008-hang');OUT=MAIN/'tasks/evidence/AVOID-008/hang-main01';COMMIT='0a480ec3d2a7962f627c4fa4a03ba133f866f962';PRODUCT='1f308631f99a5275a8115a08513bc821bae2ec1f';ENV={**os.environ,'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'}
sha=lambda b:hashlib.sha256(b).hexdigest()
def git(*args):return subprocess.check_output(['git','-c','gc.auto=0',*args],cwd=MAIN,env=ENV)
start=json.loads((OUT/'start.json').read_text());assert git('rev-parse','HEAD').decode().strip()==start['HEAD'];index=MAIN/git('rev-parse','--git-path','index').decode().strip();index_before=sha(index.read_bytes());initial=json.loads((SOURCE/'tasks/evidence/AVOID-008/hang01/start.json').read_text());assert all(sha((MAIN/p).read_bytes())==h for p,h in initial['inputs'].items());pyc='app/__pycache__/english.cpython-312.pyc';assert sha((MAIN/pyc).read_bytes())==start['source'][pyc]['sha256'];reserve=lambda:shutil.disk_usage(MAIN).free>=250*1024**2;assert reserve()
# Bounded tracked selection only; no worktree traversal or source prefix import.
paths=set()
for prefix in ['tasks/evidence/AVOID-008/hang01','dev/avoidance/layouts-c-hang-unit.cjs','dev/avoidance/layouts-c-hang-probe.cjs','dev/avoidance/layouts-c-hang-preview.cjs']:
 paths.update(git('ls-tree','-r','--name-only',COMMIT,'--',prefix).decode().splitlines())
freeze=json.loads((SOURCE/'tasks/evidence/AVOID-008/hang01/freeze03.json').read_text());delta=json.loads((SOURCE/'tasks/evidence/AVOID-008/hang01/freeze04-preview01.json').read_text());paths.update(freeze['inputs']);paths.update(delta['inputs']);paths.update(['tasks/evidence/AVOID-008/hang01/freeze03.json','tasks/evidence/AVOID-008/hang01/freeze04-preview01.json'])
raw=json.loads(gzip.decompress((SOURCE/'tasks/evidence/AVOID-008/hang01/probe03.json.gz').read_bytes()));support=[p for p in raw['sourceEnd'] if p.startswith('dev/')];paths.update(support)
source_paths=['src/09j_layoutsC_japanese.js','src/11p_layoutsC.js'];compiled=['index.html','en/index.html'];rows=[];validated={};collisions=[]
cat=subprocess.Popen(['git','-c','gc.auto=0','cat-file','--batch'],cwd=MAIN,env=ENV,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
def blob(commit,path):
 cat.stdin.write((commit+':'+path+'\n').encode());cat.stdin.flush();header=cat.stdout.readline().decode().strip().split();assert len(header)==3 and header[1]=='blob',(path,header);oid,_,size=header;n=int(size);data=cat.stdout.read(n);assert cat.stdout.read(1)==b'\n';assert hashlib.sha1(b'blob '+str(n).encode()+b'\0'+data).hexdigest()==oid;return oid,data
for path in sorted(paths):
 oid,data=blob(COMMIT,path);source=SOURCE/path;assert source.read_bytes()==data,('SourceGitBlobMismatch',path);expected=freeze['inputs'].get(path)or delta['inputs'].get(path);assert not expected or expected['sha256']==sha(data),('AcceptedPinMismatch',path)
 if path in source_paths+compiled:assert blob(PRODUCT,path)[1]==data
 target=MAIN/path;existing=target.read_bytes()if target.exists()else None
 if path not in source_paths+compiled and existing is not None and existing!=data:collisions.append(path)
 if path.startswith('src/') and path not in source_paths:assert existing==data,('Protected82Mismatch',path)
 validated[path]=(oid,data);rows.append({'path':path,'gitCommit':COMMIT,'gitBlob':oid,'sha256':sha(data),'bytes':len(data),'source':str(source),'beforeSHA256':sha(existing)if existing is not None else None})
(OUT/'preflight.json').write_text(json.dumps({'frozenEvidenceCommit':COMMIT,'testedProductCommit':PRODUCT,'paths':len(rows),'collisions':collisions,'indexSHA256':index_before,'sourceBefore':start['source'],'selected':rows},indent=2)+'\n');assert not collisions,collisions
# Actual locked package installation is reused read-only, never copied/rewritten.
package_proof=[]
for name,pkg in json.loads((SOURCE/'tasks/evidence/AVOID-008/hang01/package-pins.json').read_text()).items():
 for path,pin in pkg['files'].items():
  actual=Path(pkg['realpath'])/path;assert sha(actual.read_bytes())==pin['sha256'];package_proof.append({'package':name,'path':str(actual),'sha256':pin['sha256'],'bytes':actual.stat().st_size,'action':'verified-existing-read-only'})
# Capture former source bytes once, then replace only two approved source blobs.
for path in source_paths:
 old=(MAIN/path).read_bytes();archive=OUT/('before-'+Path(path).name+'.gz');archive.write_bytes(gzip.compress(old,mtime=0));target=MAIN/path;temp=target.with_name(target.name+'.hang-import-tmp');assert not temp.exists();temp.write_bytes(validated[path][1]);os.replace(temp,target)
# Avoid writing through any historical hardlink when build overwrites HTML.
broken_links=[]
for path in compiled:
 target=MAIN/path
 if target.stat().st_nlink>1:
  temp=target.with_name(target.name+'.hang-build-tmp');assert not temp.exists();temp.write_bytes(target.read_bytes());os.replace(temp,target);broken_links.append(path)
build=subprocess.run(['python3','build.py'],cwd=MAIN,env=ENV,capture_output=True,text=True);(OUT/'build.log').write_text(build.stdout+build.stderr);assert build.returncode==0
for path in compiled:assert (MAIN/path).read_bytes()==validated[path][1],('CompiledNotExactTested',path)
# Immutable evidence/helpers are hardlinked only when missing. Existing equal
# files are left at the same inode; a differing file is never overwritten.
for row in rows:
 path=row['path'];target=MAIN/path;oid,data=validated[path]
 if path in source_paths:action='replaced-two-approved-source-bytes'
 elif path in compiled:action='rebuilt-exact-tested-bytes'
 elif target.exists():assert target.read_bytes()==data;action='skipped-identical-existing'
 else:
  assert path.startswith('tasks/evidence/AVOID-008/hang01/')or path in ['dev/avoidance/layouts-c-hang-unit.cjs','dev/avoidance/layouts-c-hang-probe.cjs','dev/avoidance/layouts-c-hang-preview.cjs'],path
  target.parent.mkdir(parents=True,exist_ok=True)
  if path.startswith('dev/'):
   target.write_bytes(data);action='independent-live-helper-copy'
  else:
   os.link(SOURCE/path,target);action='hardlinked-frozen-tracked-file'
 assert target.read_bytes()==data;row.update({'action':action,'afterSHA256':sha(target.read_bytes()),'sameInodeAsFrozenSource':os.path.samefile(target,SOURCE/path)})
cat.stdin.close();cat.wait();assert cat.returncode==0
assert all((MAIN/p).read_bytes()==(SOURCE/p).read_bytes()for p in initial['inputs']);assert all(sha((MAIN/p).read_bytes())==v['sha256']for p,v in start['protected'].items());assert sha((MAIN/pyc).read_bytes())==start['source'][pyc]['sha256'];assert sha(index.read_bytes())==index_before;assert reserve()
(OUT/'import-manifest.json').write_text(json.dumps({'frozenEvidenceCommit':COMMIT,'testedProductCommit':PRODUCT,'baselineMainHEAD':start['HEAD'],'entries':rows,'entryCount':len(rows),'actions':{action:sum(r['action']==action for r in rows)for action in sorted({r['action']for r in rows})},'logicalBytes':sum(r['bytes']for r in rows),'packages':package_proof,'packageFiles':len(package_proof),'brokenMutableHTMLHardlinksBeforeBuild':broken_links,'collisions':[],'freshBrowserTests':0,'freshMediaCaptures':0,'publicChecks':0,'sourceAndCompiledWholeBytesExactTested':True,'other82AndProtectedDocsPycPreserved':True,'mainIndexSHA256':index_before,'mainIndexUnchanged':True,'freeBytes':shutil.disk_usage(MAIN).free},indent=2)+'\n')
print(json.dumps({'entries':len(rows),'actions':{action:sum(r['action']==action for r in rows)for action in sorted({r['action']for r in rows})},'packageFiles':len(package_proof),'compiledExact':True,'mainIndexUnchanged':True,'freeMiB':shutil.disk_usage(MAIN).free//1024**2}))
