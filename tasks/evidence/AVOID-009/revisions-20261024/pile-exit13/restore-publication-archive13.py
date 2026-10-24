"""Restore this one derived publication archive from its exact pushed source.

Usage: python restore-publication-archive13.py SOURCE_REPOSITORY OUTPUT_PATH
Use --verify-only instead of OUTPUT_PATH to regenerate in RAM without a disk copy.
No network, public verification, deployment operation or extraction is performed.
"""
import hashlib,io,json,pathlib,subprocess,sys,tarfile

SOURCE_COMMIT='8ef184fd3f60ee61ae4940425d3906f88ec8a1f3'
EXPECTED_SHA256='fb86c23889add28cb6045f7e424910dbeb76214d0c4c37fee12fee1c5e93162c'
EXPECTED_BYTES=33432884
repo=pathlib.Path(sys.argv[1]);target=sys.argv[2]
source=subprocess.check_output(['git','archive','--format=tar',SOURCE_COMMIT,'--','.openai/hosting.json','dist'],cwd=repo)
out=io.BytesIO()
with tarfile.open(fileobj=io.BytesIO(source),mode='r:') as incoming:
 with tarfile.open(fileobj=out,mode='w:xz') as packed:
  for member in incoming:
   assert member.name in ('.openai','.openai/hosting.json','dist') or member.name.startswith('dist/')
   if member.isdir():packed.addfile(member)
   else:
    assert member.isfile()
    packed.addfile(member,io.BytesIO(incoming.extractfile(member).read()))
data=out.getvalue();digest=hashlib.sha256(data).hexdigest()
assert digest==EXPECTED_SHA256 and len(data)==EXPECTED_BYTES
if target!='--verify-only':
 with pathlib.Path(target).open('xb') as output:output.write(data)
print(json.dumps({'sourceCommit':SOURCE_COMMIT,'sha256':digest,'bytes':len(data),'mode':'RAM verification only' if target=='--verify-only' else 'exact local restoration','publicChecks':0}))
