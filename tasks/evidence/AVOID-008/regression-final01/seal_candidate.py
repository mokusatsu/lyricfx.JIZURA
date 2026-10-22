"""Snapshot a parent-accepted candidate later; never builds or runs it."""
from pathlib import Path
import argparse,json,hashlib,shutil,datetime
D=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
def main():
 p=argparse.ArgumentParser();p.add_argument('--accepted-source-root',required=True);p.add_argument('--parent-source-identity',required=True);p.add_argument('--parent-gate-reference',required=True);a=p.parse_args();R=Path(a.accepted_source_root).resolve();plan=json.loads((D/'plan02.json').read_text());B=D/'snapshots/baseline';C=D/'snapshots/candidate';assert not C.exists(),'Preserve earlier candidate snapshot';C.mkdir();files=[]
 for rel in ['index.html','en/index.html']+[str(p.relative_to(R))for p in sorted((R/'src').glob('*.js'))]:
  raw=(R/rel).read_bytes();dest=C/rel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw);files.append({'path':rel,'sha256':sha(raw),'bytes':len(raw)})
 (C/'dev').mkdir()
 for p in (B/'dev').iterdir():shutil.copyfile(p,C/'dev'/p.name)
 for rel in ['src/01_util.js','src/08_planner.js']:assert (C/'index.html').read_bytes().count((C/rel).read_bytes())==1,rel
 shutil.copytree(D/'common/assets',C/'assets')
 # Seal tests independently of product provenance; exact same frozen test bytes both sides.
 for x in plan['testInputs']:
  assert sha((C/x['path']).read_bytes())==x['sha256'];assert sha((B/x['path']).read_bytes())==x['sha256']
 result={'status':'SNAPSHOTTED_NOT_EXECUTED','timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'parentSourceIdentity':a.parent_source_identity,'parentGateReference':a.parent_gate_reference,'actualSourceRoot':str(R),'files':files,'sourceUnchangedDuringSnapshot':all(sha((R/x['path']).read_bytes())==x['sha256']for x in files)};assert result['sourceUnchangedDuringSnapshot'];(D/'candidate-manifest.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'manifest':str(D/'candidate-manifest.json'),'sha256':sha((D/'candidate-manifest.json').read_bytes()),'files':len(files),'status':result['status']}))
if __name__=='__main__':main()
