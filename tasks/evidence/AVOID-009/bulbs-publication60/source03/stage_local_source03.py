#!/usr/bin/env python3
"""Parent-gated local exact-five Source stage/commit; no network or publication."""
import argparse,hashlib,json,os,pathlib,re,sys,tarfile
P=pathlib.Path;BASE=P('/dev/shm/avoid009-evening-20261024');MEDIA=BASE/'bulbs60.media01'
def boot_read(p):
 for q in [*reversed(p.parents),p]:assert not q.is_symlink()
 return p.read_bytes()
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--parent-gate-sha256',required=True);a=ap.parse_args();assert re.fullmatch('[0-9a-f]{64}',a.parent_gate_sha256)
 gb=boot_read(BASE/'bulbs-publication60-stage03-parent-gate.json');assert hashlib.sha256(gb).hexdigest()==a.parent_gate_sha256;g=json.loads(gb)
 here=P(__file__).resolve().parent;assert hashlib.sha256(boot_read(here/'local_common03.py')).hexdigest()==g['localCommonSHA256'];sys.dont_write_bytecode=True
 from local_common03 import need,safe,read,sha,output,tree,git,config,clean,prior_subset,SOURCE,PROJECT,REMOTE,REL,NAMES
 need(os.environ.get('BULBS_PUBLICATION60_STAGE03_RELEASE')=='PARENT_REVIEWED_LOCAL_EXACT_FIVE_STAGE_COMMIT')
 need(all(g.get(k) is True for k in ['sourceRawAccepted','nativeMediaAccepted','freshVisualAccepted','assetTarVerified']))
 need(g['humanMotionReview']=='PENDING' and g['stageScriptSHA256']==sha(read(P(__file__).resolve())))
 targetreceipt=BASE/'bulbs-publication60-local-receipt.json';safe(targetreceipt);need(not targetreceipt.exists())
 openedbytes=read(BASE/'bulbs-publication60-source-open.json');need(sha(openedbytes)==g['openReceiptSHA256']);opened=json.loads(openedbytes)
 need(opened['state']=='OPENED_ONLY_SOURCE_MANAGEMENT_NO_PUBLIC_CHECK' and opened['snapshotScope']=='EXISTING_LOCAL_CHECKOUT_ONLY_NOT_REMOTE_FRESHNESS' and opened['project_id']==PROJECT and opened['remote']==REMOTE and opened['branch']=='main')
 head=opened['head'];need(re.fullmatch('[0-9a-f]{40}',head) and head==g['expectedSourceHEAD']);config();clean();need(git(['rev-parse','HEAD']).decode().strip()==head)
 protected=opened['protectedTree'];need(tree()==protected and len(protected)==opened['protectedTotal']);prior_subset(g,protected)
 tracked=git(['ls-tree','-rz','HEAD']);need(sha(tracked)==opened['trackedTreeSHA256'] and tracked.hex()==opened['trackedTreeHex'])
 mb=read(MEDIA/'manifest.json');need(sha(mb)==g['mediaManifestSHA256']==g['assetManifestSHA256']);m=json.loads(mb)
 need(m['complete'] is True and not m['errors'] and m['postPins']['unchanged'] is True and m['inFlight'] is None)
 need(m['completed']=={'freshNativeReferences':250,'beforeFrames':250,'afterFrames':250})
 c=m['capture'];need((c['frames'],c['fps'],c['width'],c['height'],c['sourceCutDuration'],c['nominalEncodedDuration'],c['circleBurnedIn'])==(250,60,960,540,4,250/60,False))
 need(m['routeProposal']=='bulbs-native-reflow-20261025-01')
 assetrows=m['publicFiles'];need(len(assetrows)==5 and {r['path'] for r in assetrows}==set(NAMES))
 assets={r['path']:{'bytes':r['bytes'],'sha256':r['sha256']} for r in assetrows};need(len(assets)==5)
 for n,v in assets.items():need(set(next(r for r in assetrows if r['path']==n))=={'path','bytes','sha256'} and isinstance(v['bytes'],int) and v['bytes']>0 and re.fullmatch('[0-9a-f]{64}',v['sha256']))
 expectedfive={REL+n:assets[n] for n in NAMES};need(g['finalFiveFiles']==expectedfive)
 payload={n:read(MEDIA/'public'/n) for n in NAMES}
 publicnodes=list((MEDIA/'public').rglob('*'))
 for p in publicnodes:safe(p);need(p.is_dir() or p.is_file())
 need({str(p.relative_to(MEDIA/'public')) for p in publicnodes if p.is_file()}==set(NAMES))
 for n,b in payload.items():need(len(b)==assets[n]['bytes'] and sha(b)==assets[n]['sha256'])
 # Verify a five-file TAR by bytes without extracting or changing local media.
 tarpath=P(g['assetTarPath']);need(tarpath.is_absolute() and tarpath.is_relative_to(BASE));safe(tarpath);need(sha(read(tarpath))==g['assetTarSHA256'])
 prefix=g.get('assetTarPrefix','');need(prefix in ['', 'public/'])
 with tarfile.open(tarpath,'r:*') as archive:
  members=archive.getmembers();need(len(members)==5 and all(r.isfile() for r in members))
  need({r.name for r in members}=={prefix+n for n in NAMES})
  for r in members:
   n=r.name[len(prefix):];f=archive.extractfile(r);need(f is not None);b=f.read();need(b==payload[n] and r.size==assets[n]['bytes'])
 for side in ['before','after']:
  v=m['videos'][side];p=v['probe'];need(len(p['streams'])==1);s=p['streams'][0]
  need((s['codec_name'],s['width'],s['height'],s['avg_frame_rate'],s['r_frame_rate'],s['sample_aspect_ratio'],s['pix_fmt'],int(s['nb_read_frames']))==('h264',960,540,'60/1','60/1','1:1','yuv420p',250))
  need(abs(float(s['duration'])-250/60)<=1e-6 and 250/60-1e-6<=float(p['format']['duration'])<=250/60+.001001)
  need(v['path']=='videos/'+side+'.mp4' and v['sha256']==assets[v['path']]['sha256'] and v['bytes']==assets[v['path']]['bytes'])
 target=SOURCE/REL;safe(target);need(not target.exists());need(tree()==protected and git(['rev-parse','HEAD']).decode().strip()==head);clean()
 for n in NAMES:
  p=target/n;safe(p);p.parent.mkdir(parents=True,exist_ok=True)
  with p.open('xb') as f:f.write(payload[n]);f.flush();os.fsync(f.fileno())
 expected={**protected,**expectedfive};need(tree()==expected)
 added=[p.decode() for p in git(['ls-files','--others','--exclude-standard','-z']).split(b'\0') if p];need(sorted(added)==sorted(expectedfive))
 need(not git(['diff','--name-only']).strip() and not git(['diff','--cached','--name-only']).strip())
 git(['add','--',*sorted(expectedfive)])
 want=[v.encode() for n in sorted(expectedfive) for v in ['A',n]]+[b'']
 need(git(['diff','--cached','--name-status','-z']).split(b'\0')==want);need(tree()==expected)
 git(['commit','--no-gpg-sign','-m','Add native bulbs reflow comparison for review'])
 newhead=git(['rev-parse','HEAD']).decode().strip();need(git(['rev-parse','HEAD^']).decode().strip()==head)
 need(git(['diff-tree','--no-commit-id','--name-status','-r','-z',head,newhead]).split(b'\0')==want)
 aftertracked=git(['ls-tree','-rz','HEAD']);preserved=b'\0'.join(r for r in aftertracked.split(b'\0') if r and r.split(b'\t',1)[1].decode() not in expectedfive)+b'\0';need(preserved==tracked)
 clean();need(tree()==expected and sha(read(MEDIA/'manifest.json'))==g['mediaManifestSHA256'])
 for n,b in payload.items():need(read(MEDIA/'public'/n)==b)
 result={'state':'LOCAL_SOURCE_FIVE_FILE_COMMIT_ONLY','project_id':PROJECT,'priorHEAD':head,'head':newhead,'openReceiptSHA256':g['openReceiptSHA256'],'mediaManifestSHA256':g['mediaManifestSHA256'],'assetManifestSHA256':g['assetManifestSHA256'],'assetTarSHA256':g['assetTarSHA256'],'fiveFiles':expectedfive,'expectedProtectedTree':expected,'protectedCountsBefore':len(protected),'protectedCountsAfter':len(expected),'fullTrackedPrivateTreePreserved':True,'stageScriptSHA256':g['stageScriptSHA256'],'localCommonSHA256':g['localCommonSHA256'],'parentGateSHA256':a.parent_gate_sha256,'humanMotionReview':'PENDING','visualReview':'PASS-static-only','push':False,'publish':False,'publicChecks':0}
 output(targetreceipt,result);print(json.dumps({'state':result['state'],'head':newhead,'receiptSHA256':sha(read(targetreceipt)),'addedFiles':5,'publicChecks':0}),flush=True)
if __name__=='__main__':
 try:main()
 except BaseException:
  print('Local Source staging stopped; no automatic retry/reset/cleanup/network/publication.',flush=True);raise SystemExit(1)
