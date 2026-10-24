from pathlib import Path
import gzip,lzma,json,hashlib,subprocess,shutil
r=Path('/workspace/lyricfx.JIZURA');b=Path('/dev/shm/avoid009-evening-20261024');dest=r/'tasks/evidence/AVOID-009/tiles-diagnostics41-42';dest.mkdir()
expected={41:'aa75ed331524e6cbb6cd962a16b9c07e1b4d039a41e2e492139f7aadf2201881',42:'22f50ee2ce7bc94356c3ccca2c59be2139f780f7ad028ba1bad28729d4d501bc'}
sha=lambda v:hashlib.sha256(v).hexdigest()
for n in [41,42]:
 src=r/f'work/avoid009-tiles{n}-diagnostic';shutil.copytree(src,dest/f'source{n}')
 original=(b/f'diagnostic{n}.raw.json.gz').read_bytes();assert sha(original)==expected[n];data=gzip.decompress(original);xz=lzma.compress(data,preset=6);assert lzma.decompress(xz)==data
 js='const z=require("zlib");const a=[];process.stdin.on("data",b=>a.push(b));process.stdin.on("end",()=>process.stdout.write(z.gzipSync(Buffer.concat(a),{level:9,mtime:0})))'
 assert subprocess.check_output(['node','-e',js],input=lzma.decompress(xz))==original
 name=f'diagnostic{n}.raw.json.xz';(dest/name).write_bytes(xz)
 (dest/f'storage{n}.json').write_text(json.dumps({'originalGzipSHA256':sha(original),'originalGzipBytes':len(original),'JSONBytes':len(data),'JSONSHA256':sha(data),'canonicalXZ':name,'canonicalXZSHA256':sha(xz),'canonicalXZBytes':len(xz),'exactDecodedJSONPreserved':True,'exactOriginalGzipReproductionVerified':True,'gzipReproduction':'pinned Node24 zlib.gzipSync(exactJSON,{level:9,mtime:0})','sourceRuntime':'Historical absolute source/runtime dependencies retained; not self-contained; recreate exact paths and verify seals before rerun','publicChecks':0},indent=2)+'\n')
 print(n,len(original),len(xz),sha(xz),flush=True)
shutil.copy2(r/'work/avoid009-tiles43-readonly/DESIGN43.md',dest/'DESIGN43.md');shutil.copy2(r/'work/avoid009-tiles43-readonly/handoff43.json',dest/'handoff43.json')
print('Complete source41failure/source42conditionaldiagnostic/rawJSON and exact gzip reproduction preserved')
