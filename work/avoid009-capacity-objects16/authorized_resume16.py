#!/usr/bin/env python3
"""Storage-only authorized resume; CHECK is read-only, RELEASE requires parent source review.
Old official SHM is absent. New scratch is unrelated to the inaccessible RAW67 namespace.
Historical guard, snapshot and proof remain immutable; no old keeper availability is claimed.
"""
import argparse, hashlib, json, os, pathlib, types
P = pathlib.Path
ROOT = P('/workspace/lyricfx.JIZURA')
OLD = ROOT/'work/avoid009-capacity-objects16/capacity_objects16.py'
SNAP = OLD.with_name('snapshot.json')
PROOF = ROOT/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects16/capacity-objects16-proof.json'
DURABLE = PROOF.parent/'authorized-resume-20261025'
SCRATCH = P('/dev/shm/avoid009-capacity16-authorized-20261025')
SOURCE_SHA = '1a4a45b4292e6dada71341b7bc81dd0c1256b048137a180c04ebc6dab953050d'
SNAP_SHA = '277c8aeb5dce74fd7e0055e12261b92a4d761640e204fdb0e3dcc5f986bf18da'
PROOF_SHA = 'f62fbbc00180b1772007beb0b3ef61fa4020d06c8945afdef2ea14b403e112ae'
HEAD = '309a7c16b82e130ea92c966983576e4d6f770437'
def digest(b): return hashlib.sha256(b).hexdigest()
def require(ok, message):
    if not ok: raise RuntimeError(message)
def pinned(path, expected):
    for part in [*reversed(path.parents), path]:
        require(not part.is_symlink(), 'symlink refused: '+str(part))
    require(path.is_file() and path.stat().st_nlink == 1, 'regular single-link file required')
    data = path.read_bytes()
    require(digest(data) == expected, 'immutable evidence changed: '+str(path))
    return data

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['CHECK', 'RELEASE'])
    cli = parser.parse_args()
    seal = json.loads(pinned(OLD.with_name('source-seal.json'),
        '64a2ea5f6a43de30ad89b529f4da72b7cafe4244eaef7a55b11166144752497c'))
    for item in seal['files'] + seal['preservedDraft']:
        evidence = pinned(ROOT/item['path'], item['sha256'])
        require(len(evidence) == item['bytes'], 'sealed source size changed')
    code = pinned(OLD, SOURCE_SHA)
    model = json.loads(pinned(SNAP, SNAP_SHA))
    proof = json.loads(pinned(PROOF, PROOF_SHA))
    # Compile exact reviewed bytes without importing a module or creating a PYC.
    guard = types.ModuleType('capacity16_reviewed_guard')
    guard.__file__ = str(OLD)
    exec(compile(code, str(OLD), 'exec'), guard.__dict__)
    guard.ARGS = types.SimpleNamespace(snapshot_sha256=SNAP_SHA, expected_head=HEAD,
        proof_sha256=PROOF_SHA, source63_ja_en_raw_and_after6_accepted=True,
        source63_ja_review_sha256=model['source63Context']['phases']['ja']['review']['sha256'],
        source63_en_review_sha256=model['source63Context']['phases']['en']['review']['sha256'],
        after6_receipt_sha256=model['source63Context']['after']['receipt']['sha256'])
    # Only output locations change; all baseline/raw/transaction functions stay exact.
    guard.BASE = SCRATCH
    guard.PROOF = PROOF
    guard.PRIVATE = SCRATCH/'capacity-objects16-index'
    guard.START = DURABLE/'capacity-objects16-started.json'
    guard.INTENT = DURABLE/'capacity-objects16-unlink-intent.json'
    guard.RECEIPT = DURABLE/'capacity-objects16-receipt.json'
    require(not os.path.lexists(ROOT/'.git/index.lock'), 'ROOT locked')
    require(not os.path.lexists(DURABLE) and not os.path.lexists(SCRATCH),
            'new transaction already present: preserve and review recovery; never rerun')
    require(not os.path.lexists(P('/dev/shm/avoid009-evening-20261024')),
            'environment changed: review old namespace status separately')
    index = guard.baseline(model)
    data = guard.raw(model)
    require(proof['state'] == 'VERIFIED_NOT_RELEASED' and proof['sourceSHA256'] == SOURCE_SHA
            and proof['snapshotSHA256'] == SNAP_SHA and proof['head'] == guard.head()
            and proof['rootSHA256'] == digest(index) and proof['rawSHA256'] == digest(data),
            'retained proof does not match current full baseline')
    result = dict(state='AUTHORIZED_RESUME16_PREFLIGHT_PASS_NOT_RELEASED',
        head=HEAD, indexSHA256=digest(index), snapshotSHA256=SNAP_SHA,
        originalGuardSHA256=SOURCE_SHA, originalProofSHA256=PROOF_SHA,
        wrapperSHA256=digest(P(__file__).read_bytes()),
        releaseOnlyPath=guard.REL, targetBytes=len(data), targetSHA256=digest(data),
        old64AndPYC7Preserved=True, allOriginal63ContextGatesPassed=True,
        historicalSnapshotIdentitiesStillExact=True,
        oldKeeperStatus='UNKNOWN_PROCESS', oldOfficialNamespaceAccessible=False,
        raw67State='PREVIOUSLY_SHM_ONLY_NOW_UNAVAILABLE_NOT_RECREATED',
        durableTransactionDirectory=str(DURABLE), newScratchDirectory=str(SCRATCH),
        permission='Parent records explicit user authorization to remove ONLY this working copy; retain Git original and restoration evidence; add its skip-worktree flag.')
    if cli.action == 'CHECK':
        print(json.dumps(result, indent=2))
        return
    # Exclusive directories: a failed/abrupt run is never automatically resumed or removed.
    # Workspace cannot hold a private 5.8MB index before release; only it uses NEW SHM.
    require(os.statvfs(DURABLE.parent).f_bavail * os.statvfs(DURABLE.parent).f_frsize >= 131072,
            'durable journal needs at least 128KiB free')
    require(os.statvfs(SCRATCH.parent).f_bavail * os.statvfs(SCRATCH.parent).f_frsize >= len(index)*2,
            'new private index scratch needs capacity')
    DURABLE.mkdir(mode=0o700)
    SCRATCH.mkdir(mode=0o700)
    guard.writejson(DURABLE/'authorization-and-preflight.json', result)
    for directory in [DURABLE, DURABLE.parent, SCRATCH.parent]:
        fd = os.open(directory, os.O_RDONLY | os.O_DIRECTORY)
        try: os.fsync(fd)
        finally: os.close(fd)
    guard.release(model)

if __name__ == '__main__': main()
