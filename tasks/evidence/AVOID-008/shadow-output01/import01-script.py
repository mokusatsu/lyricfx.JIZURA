from pathlib import Path
import os,subprocess,json,hashlib,gzip,shutil,datetime
child=Path('/workspace/avoid008-shadow');main=Path('/workspace/lyricfx.JIZURA');prefix='tasks/evidence/AVOID-008/shadow-output01/';commit='05faefc';source='1214044';base='f828ff234d8f45659734af58397233a9fdf71c50'
def git(*args):return subprocess.check_output(['git','-c','gc.auto=0',*args],cwd=child)
def sha(b):return hashlib.sha256(b).hexdigest()
def pins(paths):return {str(p.relative_to(main)):sha(p.read_bytes()) for p in paths}
protected=sorted((main/'src').glob('*.js'))+[main/'index.html',main/'en/index.html']+sorted((main/'app').rglob('*.pyc'))
index=main/'.git/index';before=pins(protected);indexBefore=sha(index.read_bytes());start=datetime.datetime.now(datetime.timezone.utc).isoformat();assert shutil.disk_usage(main).free>300*1024**2
paths=git('ls-tree','-r','--name-only',commit,'--',prefix).decode().splitlines();assert len(paths)==118
helpers=['dev/avoidance/layouts-c-shadow-output-node.cjs','dev/avoidance/layouts-c-shadow-browser.cjs','dev/avoidance/layouts-c-shadow-native-shoji.txt','dev/avoidance/layouts-c-shadow-native-placement.txt']
for rel in paths+helpers:assert not (main/rel).exists(), 'Existing destination '+rel
manifest=[]
for rel in paths:
 blob=git('rev-parse',commit+':'+rel).decode().strip();data=git('cat-file','blob',blob);src=child/rel;assert src.read_bytes()==data;dst=main/rel;dst.parent.mkdir(parents=True,exist_ok=True)
 # Immutable committed evidence only. Neither link is an editable product file.
 os.chmod(src,0o444)
 try:os.link(src,dst);method='immutable-hardlink'
 except OSError:dst.write_bytes(data);os.chmod(dst,0o444);method='verified-independent-copy'
 assert dst.read_bytes()==data;manifest.append({'path':rel,'originCommit':commit,'gitBlob':blob,'sha256':sha(data),'bytes':len(data),'method':method})
for rel in helpers:
 blob=git('rev-parse',commit+':'+rel).decode().strip();data=git('cat-file','blob',blob);dst=main/rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(data);assert dst.read_bytes()==data;manifest.append({'path':rel,'originCommit':commit,'gitBlob':blob,'sha256':sha(data),'bytes':len(data),'method':'independent-Git-blob-copy'})
archive=main/prefix/'candidate1214044';assert not archive.exists();archive.mkdir()
def pack(name,data,origin):
 packed=gzip.compress(data,compresslevel=9,mtime=0);dst=archive/name;assert not dst.exists();dst.write_bytes(packed);assert gzip.decompress(dst.read_bytes())==data;os.chmod(dst,0o444);manifest.append({'path':str(dst.relative_to(main)),'sha256':sha(packed),'bytes':len(packed),'rawSHA256':sha(data),'rawBytes':len(data),'method':'lossless-gzip-mtime0','origin':origin})
for f in ['09a_placement.js','09g_layoutsC_placement.js','09j_layoutsC_japanese.js','09_render.js','11p_layoutsC.js']:
 rel='src/'+f;blob=git('rev-parse',source+':'+rel).decode().strip();pack(f+'.gz',git('cat-file','blob',blob),{'commit':source,'path':rel,'gitBlob':blob})
actual=json.loads((child/prefix/'browser07.json').read_text());assert actual['passed'] and actual['sourceStart']==actual['sourceEnd']
for rel,name in [('index.html','index.html.gz'),('en/index.html','en-index.html.gz')]:
 data=(child/rel).read_bytes();assert sha(data)==actual['sourceStart'][str(child/rel)];pack(name,data,{'actualTest':'browser07.json','testedSHA256':actual['sourceStart'][str(child/rel)],'path':rel})
# Base Git objects plus these five snapshots reconstruct the tested child source.
inputs={str(p.relative_to(child)):sha(p.read_bytes()) for p in sorted((child/'src').glob('*.js'))}
for rel in ['build.py','app/body.html','app/style.css','app/english.py','app/english.js','vendor/mp4-muxer.min.js','assets/effect-preview.png']:
 data=(child/rel).read_bytes();assert data==git('show',base+':'+rel);inputs[rel]=sha(data)
for rel,h in inputs.items():
 if rel.startswith('src/'):assert h==actual['sourceStart'][str(child/rel)]
build={'baseCommit':base,'sourceCheckpoint':source,'sourceFileCount':len(list((child/'src').glob('*.js'))),'snapshotFiles':['09a_placement.js','09g_layoutsC_placement.js','09j_layoutsC_japanese.js','09_render.js','11p_layoutsC.js'],'reconstruction':'Checkout base f828; replace only the five source files from these gz files; verify all input SHA256; PYTHONDONTWRITEBYTECODE=1 python3 build.py. Compiled gz files are the actual tested outputs, not newly rebuilt outputs.','inputs':inputs,'compiledSource':'Actual browser07 sourceStart/sourceEnd and child build05','productApplication':False};bp=archive/'build-inputs.json';bp.write_text(json.dumps(build,indent=2)+'\n');manifest.append({'path':str(bp.relative_to(main)),'sha256':sha(bp.read_bytes()),'bytes':bp.stat().st_size,'method':'reconstruction-receipt'})
end=pins(protected);indexAfter=sha(index.read_bytes());assert before==end,'Main product/compiled/pyc changed';assert indexBefore==indexAfter,'Main Git index changed';assert shutil.disk_usage(main).free>=250*1024**2
out=main/prefix;mp=out/'import01-manifest.json';assert not mp.exists();mp.write_text(json.dumps({'importedGitEvidenceFiles':len(paths),'independentDevHelpers':len(helpers),'entries':manifest},indent=2)+'\n')
handoff=out/'IMPORT-HANDOFF01.md';assert not handoff.exists();handoff.write_text('''# Evidence-only child import\n\nParent accepted source1214044/browser07 for the bounded conflict-only shadow transport.118 committed evidence files from05faefc, including every historical FAIL/runner/PNG/HTML, were imported exactly from Git-verified immutable bytes. Four dedicated dev helpers were copied independently into previously absent paths. No product patch was applied.\n\n`candidate1214044/` contains the five final changed source snapshots and actual tested JA/EN compiled outputs as lossless deterministic gzip, with raw/compressed hashes and build-input reconstruction receipt. Basef828 plus these five snapshots reconstructs the child source without child-branch ancestry. This isolated candidate contains the old base priceTag/cache path; it does not claim to be the combined main source. The integration owner must separately review/test the combined source.\n\nMain source/JAEN/dirty pyc and Git index bytes were hashed before/after and are unchanged. No staging, commit, push, browser, image viewing, public access or whole-tree restoration occurred. Existing unrelated files were preserved; all selected paths were new. Immutable evidence hardlinks are read-only and verified against fixed Git blobs, while dev helpers are independent copies.\n\nBounded accepted scope:120exactRGBApairs,40guards,82assigned cmap records,34fontURLhash checks, exact default PNG pairs and owned cleanup. Native Cfalse/staged Ctrue use the same new source; this is not actual full f828 baseline pixel comparison or a performance/allC/safe-avoidance/human composition acceptance. Four separate compositions remain a parent task.\n''')
receipt={'start':start,'end':datetime.datetime.now(datetime.timezone.utc).isoformat(),'evidenceCommit':commit,'sourceCheckpoint':source,'protectedBefore':before,'protectedAfter':end,'protectedMainCount':len(before),'mainIndexBefore':indexBefore,'mainIndexAfter':indexAfter,'mainBytesPreserved':True,'mainIndexPreserved':True,'manifestSHA256':sha(mp.read_bytes()),'handoffSHA256':sha(handoff.read_bytes()),'importedGitEvidenceFiles':len(paths),'independentDevHelpers':helpers,'archiveRawBytes':sum(e.get('rawBytes',0) for e in manifest),'destinationBytes':sum(e['bytes'] for e in manifest),'freeBytesAfter':shutil.disk_usage(main).free,'mainProductApplied':False,'mainGitStageCommitPush':False,'jobsStarted':False}
rp=out/'import01-receipt.json';assert not rp.exists();rp.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k not in ['protectedBefore','protectedAfter']},indent=2))
