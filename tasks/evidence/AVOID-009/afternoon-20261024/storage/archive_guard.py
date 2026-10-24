#!/usr/bin/env python3
"""Fixed-scope offline verification/release/restore; SOURCE REVIEW REQUIRED first.

No network, Git mutation, extraction, or additional on-disk archive. The only
deletable object is TARGET after a fresh exact RAM regeneration and comparison.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tarfile

REPO = Path('/tmp/avoid009-motion2-sites-synced01')
COMMIT = '854df47ad7fbfb57995cb846e49c0cf6b4d7ddf6'
TARGET = Path('/tmp/avoid009-blocks-sites-pack01/publicationarchive.tar.xz')
MANIFEST = Path('/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/blocks-media03/publication-archive-manifest03.json')
EXPECTED_SHA = '8f7f9f1a92ad737521afbe6ebba0ce62ed19598cd9c5941f2bd454d2fc631bf4'
EXPECTED_BYTES = 33833708
OLD = tuple(Path('/tmp') / name / 'publicationarchive.tar.xz' for name in (
    'flipcards-field-sites-pack01', 'pile-entry12-sites-pack01',
    'fullscreen-card-sites-pack01'))


def sha(data):
    return hashlib.sha256(data).hexdigest()


def pin(path):
    assert not path.is_symlink() and path.is_file(), str(path)
    h = hashlib.sha256()
    with path.open('rb') as stream:
        while chunk := stream.read(1024 * 1024):
            h.update(chunk)
    return {'path': str(path), 'bytes': path.stat().st_size, 'sha256': h.hexdigest()}


def git(*args):
    return subprocess.check_output(['git', '-c', 'gc.auto=0', '-c',
                                    'maintenance.auto=false', *args], cwd=REPO)


def regenerate():
    manifest = json.loads(MANIFEST.read_text())
    assert manifest['commit'] == COMMIT
    assert manifest['archiveBytes'] == EXPECTED_BYTES
    assert manifest['archiveSHA256'] == EXPECTED_SHA
    expected = {p['file']: (p['bytes'], p['sha256']) for p in manifest['files']}
    assert len(manifest['files']) == len(expected) == 96
    assert git('rev-parse', COMMIT + '^{commit}').decode().strip() == COMMIT
    names = {s for s in git('ls-tree', '-rz', '--name-only', COMMIT, '--',
                           '.openai/hosting.json', 'dist').decode().split('\0') if s}
    assert names == set(expected)
    assert all(n == '.openai/hosting.json' or n.startswith('dist/') for n in names)
    source = git('archive', '--format=tar', COMMIT, '--', '.openai/hosting.json', 'dist')
    result = io.BytesIO()
    seen = {}
    with tarfile.open(fileobj=io.BytesIO(source), mode='r:') as incoming:
        with tarfile.open(fileobj=result, mode='w:xz') as outgoing:
            for member in incoming:
                if member.isdir():
                    assert member.name in ('.openai', 'dist') or member.name.startswith('dist/')
                    outgoing.addfile(member)
                    continue
                assert member.isfile() and member.name in expected and member.name not in seen
                data = incoming.extractfile(member).read()
                seen[member.name] = (len(data), sha(data))
                assert seen[member.name] == expected[member.name]
                outgoing.addfile(member, io.BytesIO(data))
    assert seen == expected
    data = result.getvalue()
    assert len(data) == EXPECTED_BYTES and sha(data) == EXPECTED_SHA
    # Independently inspect the generated compressed members, without extraction.
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:xz') as packed:
        packed_pins = {}
        for member in packed:
            if member.isdir():
                continue
            assert member.isfile() and member.name not in packed_pins
            content = packed.extractfile(member).read()
            packed_pins[member.name] = (len(content), sha(content))
    assert packed_pins == expected
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=('verify', 'release', 'restore'))
    parser.add_argument('--receipt', required=True, type=Path)
    args = parser.parse_args()
    # Restrict the small receipt to this new isolation, and never overwrite.
    root = Path(__file__).resolve().parent
    receipt_path = args.receipt.resolve()
    assert receipt_path.parent == root and not receipt_path.exists()
    before = [pin(p) for p in OLD]
    data = regenerate()
    expected_pin = {'path': str(TARGET), 'bytes': EXPECTED_BYTES, 'sha256': EXPECTED_SHA}
    if args.mode in ('verify', 'release'):
        assert pin(TARGET) == expected_pin
        # Equal size/hash is supplemented by byte-for-byte live/RAM equality.
        assert TARGET.read_bytes() == data
        target_before = expected_pin
        if args.mode == 'release':
            TARGET.unlink()  # The sole unlink in this utility; exact fixed TARGET only.
        target_after = None if args.mode == 'release' else pin(TARGET)
    else:
        assert TARGET.parent.is_dir() and not TARGET.parent.is_symlink()
        assert not TARGET.exists() and not TARGET.is_symlink()
        target_before = None
        with TARGET.open('xb') as stream:
            stream.write(data)
        assert TARGET.read_bytes() == data
        target_after = pin(TARGET)
        assert target_after == expected_pin
    after = [pin(p) for p in OLD]
    assert before == after
    receipt = {'mode': args.mode, 'sourceCommit': COMMIT,
               'canonicalManifest': pin(MANIFEST), 'verifiedSourceBlobCount': 96,
               'regeneratedBytes': len(data), 'regeneratedSHA256': sha(data),
               'targetBefore': target_before, 'targetAfter': target_after,
               'oldThreeBefore': before, 'oldThreeAfter': after,
               'publicChecks': 0, 'networkOperations': 0,
               'diskArchiveCopies': 0, 'gitMutations': 0}
    with receipt_path.open('x') as stream:
        json.dump(receipt, stream, indent=2)
        stream.write('\n')
    print(json.dumps(receipt, separators=(',', ':')))


if __name__ == '__main__':
    main()
