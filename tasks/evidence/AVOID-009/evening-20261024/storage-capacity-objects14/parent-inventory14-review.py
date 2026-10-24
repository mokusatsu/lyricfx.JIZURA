from pathlib import Path
import json,hashlib,subprocess,gzip,io,time
R=Path.cwd();D=R/'work/avoid009-capacity-inventory14';H=lambda b:hashlib.sha256(b).hexdigest();start=time.monotonic();seal=json.loads((D/'seal.json').read_text());assert H((D/'seal.json').read_bytes())=='7f6dad25177f80380f75192ccf486888de3483cfe874f4e401509a798209a0b4';head=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();assert head==seal['head'];index=H((R/'.git/index').read_bytes());assert index==seal['indexSHA256']
for a in seal['files']:
 b=(R/a['path']).read_bytes();assert len(b)==a['bytes'] and H(b)==a['sha256']
v=json.loads((D/'inventory.json').read_text());proof=json.loads((D/'dependency-proof.json').read_text());restore=json.loads((D/'restore-map.json').read_text());candidate=v['preferredCandidate'];b=(R/candidate['path']).read_bytes();blob=subprocess.check_output(['git','rev-parse',head+':'+candidate['path']],text=True).strip();assert blob==candidate['blob'];assert b==subprocess.check_output(['git','cat-file','blob',blob]);assert len(b)==candidate['bytes'] and H(b)==candidate['sha256'];hh=hashlib.sha256();n=0
with gzip.GzipFile(fileobj=io.BytesIO(b)) as f:
 while chunk:=f.read(1024*1024):n+=len(chunk);hh.update(chunk)
assert n==candidate['decodedBytes'] and hh.hexdigest()==candidate['decodedSHA256'];stat=(R/candidate['path']).lstat();assert stat.st_ino==candidate['inode'] and stat.st_dev==candidate['device'] and stat.st_nlink==1 and stat.st_blocks*512==candidate['allocated']
assert len(proof['records'])==322
for a in proof['records']:
 p=R/a['snapshotPath'];assert p.is_file() and not p.is_symlink();b=p.read_bytes();assert len(b)==a['gzipBytes'] and H(b)==a['gzipSHA256'];blob=subprocess.check_output(['git','rev-parse',head+':'+a['snapshotPath']],text=True).strip();assert blob==a['blob'];assert b==subprocess.check_output(['git','cat-file','blob',blob]);raw=gzip.decompress(b);assert len(raw)==a['rawBytes'] and H(raw)==a['rawSHA256']
for a in v['relatedRetainedFiles']+restore['crossReferences']:
 b=(R/a['path']).read_bytes();assert len(b)==a['bytes'] and H(b)==a['sha256'];assert b==subprocess.check_output(['git','cat-file','blob',a['blob']]);assert subprocess.check_output(['git','rev-parse',head+':'+a['path']],text=True).strip()==a['blob']
base=R/'tasks/evidence/AVOID-008/objects859-main01';mf=json.loads((base/'freeze01/manifest.json').read_text());sp=json.loads((base/'start-pins.json').read_text());ep=json.loads((base/'end-pins.json').read_text());assert sp==ep and len(sp)==201;mapping={x['path']:x for x in mf['files']};assert len(mapping)==202
for k,h in sp.items():assert mapping[k]['rawSHA256']==h
for a in mf['files']:
 row=next(x for x in proof['records'] if x['category']=='freeze202-source' and x['sourcePath']==a['path']);assert row['snapshotPath']==a['snapshotRepoPath'] and row['rawSHA256']==a['rawSHA256'] and row['gzipSHA256']==a['gzipSHA256'] and row['rawBytes']==a['rawBytes']
assert H((R/'.git/index').read_bytes())==index and subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==head
report={'state':'PARENT_INVENTORY14_ALL322_FULL_HEAD_BLOB_GZIP_RAW_BYTES_INDEPENDENTLY_VERIFIED_NO_RELEASE','head':head,'indexSHA256':index,'candidate':candidate,'retainedReferences':322,'startEnd201Mapped':True,'crossReferencesFullBytesVerified':7,'runtimeExternalNotStandalone':True,'historicalCoverageReaderRequiresCompressedCanonicalMaterialization':True,'legacyDecoded244MBReaderRequiresSeparateReview':True,'active59ActualFullRawAcceptedButNoProductAdapter':True,'publicChecks':0,'imagesViewed':0,'releaseExecuted':False,'seconds':time.monotonic()-start};out=R/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects14';out.mkdir(exist_ok=True);(out/'parent-inventory-review01.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='candidate'},indent=2))
