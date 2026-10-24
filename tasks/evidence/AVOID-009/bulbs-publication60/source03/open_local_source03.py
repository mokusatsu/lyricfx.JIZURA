#!/usr/bin/env python3
"""Snapshot existing local Source checkout only. No fetch or remote-freshness claim."""
import argparse,hashlib,json,os,pathlib,re,sys
P=pathlib.Path;BASE=P('/dev/shm/avoid009-evening-20261024')
def boot_read(p):
 for q in [*reversed(p.parents),p]:assert not q.is_symlink()
 return p.read_bytes()
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--parent-gate-sha256',required=True);a=ap.parse_args()
 assert re.fullmatch('[0-9a-f]{64}',a.parent_gate_sha256)
 gatepath=BASE/'bulbs-publication60-open03-parent-gate.json';gb=boot_read(gatepath);assert hashlib.sha256(gb).hexdigest()==a.parent_gate_sha256;g=json.loads(gb)
 here=P(__file__).resolve().parent;common=here/'local_common03.py';assert hashlib.sha256(boot_read(common)).hexdigest()==g['localCommonSHA256']
 sys.dont_write_bytecode=True
 from local_common03 import need,read,sha,safe,config,clean,tree,git,prior_subset,output,PROJECT,REMOTE,SOURCE
 need(os.environ.get('BULBS_PUBLICATION60_OPEN03_RELEASE')=='PARENT_REVIEWED_LOCAL_SOURCE_SNAPSHOT_ONLY')
 need(g.get('localSourceSnapshotAccepted') is True and g['openScriptSHA256']==sha(read(P(__file__).resolve())))
 target=BASE/'bulbs-publication60-source-open.json';safe(target);need(not target.exists());config();clean()
 head=git(['rev-parse','HEAD']).decode().strip();need(re.fullmatch('[0-9a-f]{40}',head) and head==g['expectedSourceHEAD'])
 protected=tree();prior_subset(g,protected);tracked=git(['ls-tree','-rz','HEAD']);need(tracked)
 clean();need(git(['rev-parse','HEAD']).decode().strip()==head and tree()==protected)
 result={'state':'OPENED_ONLY_SOURCE_MANAGEMENT_NO_PUBLIC_CHECK','snapshotScope':'EXISTING_LOCAL_CHECKOUT_ONLY_NOT_REMOTE_FRESHNESS','project_id':PROJECT,'remote':REMOTE,'branch':'main','head':head,'protectedTree':protected,'protectedTotal':len(protected),'protectedDist':sum(k.startswith('dist/') for k in protected),'trackedTreeSHA256':sha(tracked),'trackedTreeHex':tracked.hex(),'openScriptSHA256':g['openScriptSHA256'],'localCommonSHA256':g['localCommonSHA256'],'parentGateSHA256':a.parent_gate_sha256,'publicChecks':0,'push':False,'publish':False}
 output(target,result);print(json.dumps({'state':result['state'],'head':head,'receiptSHA256':sha(read(target)),'protectedTotal':len(protected),'remoteFreshnessChecked':False,'publicChecks':0}),flush=True)
if __name__=='__main__':
 try:main()
 except BaseException:
  print('Local Source snapshot stopped; no retry, reset, network or publication.',flush=True);raise SystemExit(1)
