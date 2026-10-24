#!/usr/bin/env python3
"""Package only committed hosting/dist, without an extracted disk copy."""
import hashlib, io, json, pathlib, subprocess, sys, tarfile

repo, output = map(pathlib.Path, sys.argv[1:])
def git(*args):
    return subprocess.check_output(['git', *args], cwd=repo)
def sha(data):
    return hashlib.sha256(data).hexdigest()

commit = git('rev-parse', 'HEAD').decode().strip()
assert not git('status', '--porcelain', '--untracked-files=no').strip()
names = git('ls-tree', '-rz', '--name-only', commit, '--', '.openai/hosting.json', 'dist').decode().split('\0')
names = {name for name in names if name}
assert '.openai/hosting.json' in names and any(n.startswith('dist/') for n in names)
assert all(n == '.openai/hosting.json' or n.startswith('dist/') for n in names)
source = git('archive', '--format=tar', commit, '--', '.openai/hosting.json', 'dist')
output.mkdir(parents=True, exist_ok=False)
target = output / 'publicationarchive.tar.xz'
pins, seen = [], set()
with tarfile.open(fileobj=io.BytesIO(source), mode='r:') as incoming:
    with target.open('xb') as stream, tarfile.open(fileobj=stream, mode='w:xz') as outgoing:
        for member in incoming:
            if member.isdir():
                assert member.name in ('.openai', 'dist') or member.name.startswith('dist/')
                outgoing.addfile(member)
                continue
            assert member.isfile() and member.name in names and member.name not in seen
            data = incoming.extractfile(member).read()
            assert len(data) == member.size
            outgoing.addfile(member, io.BytesIO(data))
            seen.add(member.name)
            pins.append({'file':member.name, 'bytes':len(data), 'sha256':sha(data)})
assert seen == names
# Inspect this local archive once; this is not a public deployment check.
with tarfile.open(target, 'r:xz') as packed:
    got = {m.name:sha(packed.extractfile(m).read()) for m in packed if m.isfile()}
assert got == {p['file']:p['sha256'] for p in pins}
receipt = {'commit':commit, 'files':pins, 'archive':target.name,
           'archiveBytes':target.stat().st_size, 'archiveSHA256':sha(target.read_bytes()),
           'method':'committed git archive in memory; no extracted temporary tree',
           'publicResultChecks':0}
(output/'archive-manifest.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k!='files'}))
