"""Parent-only one-pass extraction of accepted51 lossless raw into SHM."""
from pathlib import Path
import sys,os,json,hashlib,tarfile,argparse,datetime
sys.dont_write_bytecode=True
R=Path('/workspace/lyricfx.JIZURA');E=R/'tasks/evidence/AVOID-009/bulbs-transport51'
def sha(b):return hashlib.sha256(b).hexdigest()
def main():
 assert os.environ.get('BULBS53_VALIDATE_RELEASE')=='PARENT_REVIEWED_CANONICAL_BUILD'
 p=argparse.ArgumentParser();p.add_argument('--out',required=True);a=p.parse_args();out=Path(a.out);assert out.is_absolute()and str(out).startswith('/dev/shm/')and not out.exists();out.mkdir(parents=True)
 storage=json.loads((E/'storage51.json').read_text());archive=E/storage['archive'];assert archive.stat().st_size==storage['archiveBytes']and sha(archive.read_bytes())==storage['archiveSHA256'];rows={r['member']:r for r in storage['members']};seen=[]
 with tarfile.open(archive,'r|xz')as tf:
  for info in tf:
   assert info.isfile()and info.name in rows and info.name not in seen;row=rows[info.name];assert info.size==row['bytes'];dest=out/info.name;dest.parent.mkdir(parents=True,exist_ok=True);digest=hashlib.sha256();count=0
   with tf.extractfile(info)as src,dest.open('xb')as f:
    while True:
     b=src.read(65536)
     if not b:break
     f.write(b);digest.update(b);count+=len(b)
   assert count==row['bytes']and digest.hexdigest()==row['sha256'];seen.append(info.name)
 assert set(seen)==set(rows);manifest=(out/'original-metadata/manifest.json').read_bytes();assert sha(manifest)==storage['manifestSHA256']and manifest==(E/'manifest51.json').read_bytes();receipt={'kind':'SOURCE53-accepted51-fullraw-reference-extraction','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'archive':str(archive),'archiveSHA256':storage['archiveSHA256'],'verifiedMembers':len(seen),'decodedRawBytes':storage['decodedRawBytes'],'manifestSHA256':sha(manifest),'allValuesAvailableNotHashOnly':True,'browserExecuted':False,'publicChecks':0};(out/'reference53.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
if __name__=='__main__':main()
