AVOID-009 evening storage support, source review only. Nothing here has run.

ROOT /workspace/lyricfx.JIZURA. Official BASE /dev/shm/avoid009-evening-20261024.
Sources must be fully read and explicitly approved by parent before execution.
No network, product/task-record edits, Git writes, flags or old-file deletions were
performed by this child. All Python validation was ast.parse, not import/exec.

Keeper: after official filesystem grant, start python -B source_manager.py in an
owned PTY. It creates only official BASE, ECHO off and MANAGER_READY. No automatic
SOURCE OPEN/clone. Send one RUN JSON with all four fields action, argv, cwd and
envUpdates. Wait for RUN_DONE before another RUN. Reviewed nested push helpers
receive credentials only on hidden stdin after their READY; never argv/env.
Keeper shell-name and obvious auth-string rejection are guards, not a security
sandbox. Parent reviews every argv/env update, including Python/Node code flags.
Keep manager alive until all critical RAM files and receipts are durably saved.
EXIT destroys its private per-exec SHM namespace; old40524 cannot be resumed.
No symlink/proc aliases or other namespace bypass is supported.

Index sequence, parent only, inside keeper namespace:
PREPARE --round 1 --snapshot-sha256 EXACT_INITIAL_SNAPSHOT_SHA
 --root-index-sha256 EXACT_CURRENT_ROOT_INDEX_SHA
RUN --round 1 --expected-head EXACT_CURRENT_HEAD
 --argv-json '["add","--","explicit/relative/file"]'
RUN diff/status use only exact allowlisted arguments visible in source.
RUN commit accepts only ["commit","-m","AVOID-009 ..."], no -a/amend/paths.
Before commit parent must review intended staging; commit updates HEAD/objects.
INSTALL --round 1 --expected-head EXACT_FINAL_HEAD
 --private-index-sha256 EXACT_FINAL_PRIVATE_INDEX_SHA
SAVE receipt/state/private-index bytes or digest durably BEFORE keeper EXIT.
Each next round uses exclusive integer paths and PREPARE --round N with
--prior-receipt-sha256 EXACT_PREVIOUS_RECEIPT_SHA plus snapshot/root-index seals.
It requires previous installed ROOT/private byte equality and matching HEAD.
Every round has new state/index/receipt names; installed rounds cannot rerun.
No automatic HEAD rollback, reset, forcepush, prune or GC exists.

INSTALL holds old+final index in RAM, creates a zero-byte exclusive index.lock,
pwrite/fsyncs the original ROOT inode, verifies full bytes/inode/mode/52 flags,
52 absences and all7 PYC. Caught failures restore old RAM bytes. Abrupt process
death/power loss during pwrite is NONATOMIC and can leave a damaged ROOT index;
do not kill keeper during INSTALL. RAM rollback is unavailable after namespace
loss. An install receipt must be durable before teardown. If interrupted, STOP:
recover from independently saved exact index or reconstruct in a fresh official
SHM namespace from committed entries plus known staging/protected flag manifest;
compare independent stage listings and hashes; parent review before same-inode
installation. Never delete ROOT index or blindly rerun a completed helper.
The helper preserves ROOT inode/mode and leaves original HEAD on caught install
failure; no automatic commit rollback. Usual Git operations must stay serialized.

Snapshot actual HEAD8a13b3c1/index98194264.../5577544B/inode554090/mode0600,
52 special S flags/52absences/7PYC. Independent initial stage and full flag SHA
are in initial-snapshot.json. Actual PREPARE additionally compares separate ROOT
and private stage-entry listings. Parent read-only status can refresh ROOT index;
explicit current-root SHA is required. Recompute/record it before PREPARE.

Capacity-plan.json is PLAN ONLY; two pushed8a13 source snapshot duplicates have
full-byte/blob checks and176128 allocated bytes. No release helper or new flags
provided. Prefer none until needed. Any release needs parent review/new seals and
an explicitly enlarged protection model; current helper insists exact52.
Restore any approved candidate via git cat-file blob BLOB into an exclusive
canonical path; verify exact bytes/SHA before removing ONLY its newly added skip
flag through a separately reviewed private-index round. Preserve original52.
Old canonical recovery maps remain storage-native03/RESTORE.txt and old emergency
index06/07 docs; no old manager/private-index state may be treated as live.

Own scratch incident: initial full listings exceeded100KB and filled /tmp.
Parent expressly authorized removal of just-created initial-flags.z3226434B and
partial initial-stage.z552960B. Both removed, reclaimed3780608 allocated bytes.
All digests preserved in initial-snapshot.json. No old evidence was removed.
All helper source/docs/artifacts here remain under100KB. Public checks0.
