#!/usr/bin/env python3
"""Fixed AVOID-009 blocks duplicate release. VERIFY is read-only; no Git writes."""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import stat
import subprocess

HERE = Path('/tmp/avoid009-afternoon-storage01')
MANIFEST_SHA = 'f854ddcb4a50e5f52a85580350954248d47b10c6b6eb84eae9c71231c2936a81'


def require(test, message):
    if not test:
        raise SystemExit('REFUSED: ' + message)


def digest(stream):
    h = hashlib.sha256()
    size = 0
    while True:
        chunk = stream.read(1024 * 1024)
        if not chunk:
            return size, h.hexdigest()
        size += len(chunk)
        h.update(chunk)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('mode', choices=['VERIFY', 'RELEASE'])
    ap.add_argument('--reviewed-source-sha256')
    args = ap.parse_args()
    source_hash = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    if args.mode == 'RELEASE':
        require(args.reviewed_source_sha256 == source_hash, 'parent source-review SHA required')
    raw = (HERE / 'manifest.json').read_bytes()
    require(hashlib.sha256(raw).hexdigest() == MANIFEST_SHA, 'manifest changed')
    m = json.loads(raw)
    root = Path(m['repo'])
    require(root == Path('/workspace/lyricfx.JIZURA'), 'unexpected repository')

    def git(*argv):
        return subprocess.check_output(['git', '-C', str(root), *argv], text=True).strip()

    def regular(rel):
        pp = PurePosixPath(rel)
        require(not pp.is_absolute() and '..' not in pp.parts and '.' not in pp.parts,
                'unsafe path ' + rel)
        current = root
        require(not root.is_symlink(), 'repository symlink')
        for part in pp.parts:
            current = current / part
            require(not current.is_symlink(), 'symlink ' + str(current))
        s = current.lstat()
        require(stat.S_ISREG(s.st_mode), 'nonregular ' + rel)
        return current, s

    require(git('rev-parse', m['commit']) == m['commit'], 'missing exact proof commit')
    subprocess.run(['git', '-C', str(root), 'merge-base', '--is-ancestor', m['commit'], 'HEAD'], check=True)
    # Push receipt was committed after the evidence commit. Check its durable HEAD blob.
    receipt = json.loads(git('show', 'HEAD:tasks/evidence/AVOID-009/blocks-media03/publication-source-push03.json'))
    require(receipt['mainMediaEvidenceCommit'] == '082d69f0' and receipt['mainMediaPushExit'] == 0,
            'missing recorded successful push; no remote checks are performed')
    skips = sorted(line[2:] for line in git('ls-files', '-v').splitlines() if line.startswith('S '))
    original = m['originalSkip']
    added = sorted(x['canonical'] for x in m['items'] if x['removeCanonical'])
    expected = sorted(original + added)
    require(len(original) == 25, 'original skip count')
    require(skips in [original, expected], 'existing skip flags changed or unknown additions')
    for rel in original:
        require(not os.path.lexists(root / rel), 'original absent path changed: ' + rel)
    if args.mode == 'RELEASE':
        require(skips == expected, 'parent must append exactly the 19 canonical skip flags first')

    snapshots = {}
    reclaimed = 0
    whitelist = set(m['whitelist'])
    require(len(whitelist) == 42, 'whitelist count')
    for x in m['items']:
        require(git('rev-parse', m['commit'] + ':' + x['canonical']) == x['blob'], 'blob mapping changed')
        proc = subprocess.Popen(['git', '-C', str(root), 'cat-file', 'blob', x['blob']], stdout=subprocess.PIPE)
        proof = digest(proc.stdout)
        require(proc.wait() == 0 and proof == (x['size'], x['sha256']), 'Gitblob full-byte proof failed')
        for rel in [x['path'], x['canonical']]:
            p, s = regular(rel)
            with p.open('rb') as stream:
                require(digest(stream) == proof, 'local bytes differ: ' + rel)
            snapshots[rel] = (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_nlink)
        ws = snapshots[x['path']]
        cs = snapshots[x['canonical']]
        if x['removeCanonical']:
            require(ws[:2] == cs[:2] and ws[4] == 2, 'hardlink partner changed')
        else:
            require(ws[4] == 1, 'work duplicate link count changed')
        reclaimed += regular(x['path'])[1].st_blocks * 512
    require(reclaimed == m['reclaimBytes'], 'physical allocation changed')
    # Verify every deletion target before any deletion. Unknown paths are never accepted.
    for rel in whitelist:
        p, s = regular(rel)
        require((s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_nlink) == snapshots[rel], 'target changed during verify')
    if args.mode == 'RELEASE':
        for rel in sorted(whitelist):
            p, s = regular(rel)
            require((s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns) == snapshots[rel][:4], 'target changed during release')
            p.unlink()
    print(json.dumps({'mode': args.mode, 'proofCommit': m['commit'], 'proofFiles': len(m['items']),
                      'releasePaths': len(whitelist), 'newCanonicalSkips': added,
                      'physicalReclaimBytes': reclaimed, 'sourceSHA256': source_hash,
                      'publicChecks': 0, 'gitWrites': 0}, indent=2))


if __name__ == '__main__':
    main()
