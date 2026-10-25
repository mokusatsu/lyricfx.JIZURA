from pathlib import Path
import json,tarfile,hashlib,io,os
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/bulbs60.media01');E=R/'tasks/evidence/AVOID-009/bulbs-oracle60';H=lambda b:hashlib.sha256(b).hexdigest();mb=(B/'manifest.json').read_bytes();assert H(mb)=='b0ee649c9cb9a86cc3c8fc0ac7d9aa6b69db4ecca2fc288c81654999cc264a68';m=json.loads(mb);assert m['complete'] and not m['errors'];storage=json.loads((E/'storage60-media.json').read_text());assert storage['allLiteralMembersComparedToLiveOriginalBytes'];inventory={x['member']:x for x in storage['inventory']};D=R/'work/avoid009-bulbs60-visual-assets01';assert not D.exists();D.mkdir();rows=[]
for p in sorted((B/'images').glob('*.png')):
 b=p.read_bytes();entry=inventory[str(p.relative_to(B))];assert len(b)==entry['bytes'] and H(b)==entry['sha256'];out=D/p.name
 with out.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert out.read_bytes()==b;rows.append({'path':str(out),'file':p.name,'bytes':len(b),'sha256':H(b)})
assert len(rows)==14;(D/'assets.json').write_text(json.dumps({'state':'LOCAL_LITERAL_STILLS_EXPORTED_NO_IMAGES_VIEWED','mediaManifestSHA256':H(mb),'sampleFrames':[6,14,36,90,216,231,244],'images':rows,'publicChecks':0},indent=2)+'\n');names=['index.html','videos/before.mp4','videos/after.mp4','posters/before.png','posters/after.png'];assert {x['path'] for x in m['publicFiles']}==set(names);tar=B.parent/'bulbs60.public05.tar.gz';assert not tar.exists()
with tarfile.open(tar,'w:gz') as tf:
 for name in names:
  b=(B/'public'/name).read_bytes();p=next(x for x in m['publicFiles'] if x['path']==name);assert len(b)==p['bytes'] and H(b)==p['sha256'];info=tarfile.TarInfo(name);info.size=len(b);info.mode=0o600;info.mtime=0;tf.addfile(info,io.BytesIO(b))
with tarfile.open(tar,'r:gz') as tf:
 assert len(tf.getmembers())==5
 for name in names:assert tf.extractfile(name).read()==(B/'public'/name).read_bytes()
v={'state':'EXACT_FIVE_PUBLIC_ASSET_TAR_BYTE_VERIFIED_NOT_PUBLISHED','tarPath':str(tar),'tarBytes':tar.stat().st_size,'tarSHA256':H(tar.read_bytes()),'mediaManifestSHA256':H(mb),'members':m['publicFiles'],'allFiveFullByteEqualOriginals':True,'source14Stills':str(D/'assets.json'),'humanApproval':False,'publicChecks':0,'parentImages':0};(E/'public-assets60.json').write_text(json.dumps(v,indent=2)+'\n');print(json.dumps(v,indent=2))
