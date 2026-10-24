SOURCE PREPARATION ONLY. Parent full review required before execution.
No import/run, ROOT write, flags, release, Git mutation or network occurred.
Only read-only HEAD/flags/stage/blob/stat/SHA and Python AST parsing performed.

Exact target tasks/evidence/AVOID-009/tiles-native35/native35.raw.json.gz
bytes1500269, allocated1503232, blob5cbc5d02cb0978fba9246949a7589a44757534d7
SHAbd6be20cac19bc87f097afa19a7fdd55db25f7305c6dfa84658f4f3dedabe9c3.
Full canonical bytes independently equal currentHEADblob; nlink1 pinned.
Current HEAD66c95cd5dc8b6d4a679c2f730363370afbbcb7ac, ROOTindex932bccc14fce3435ad78328d846798eef877a143ec039f3a3958f2d61e392219/5625764B/inode554090.
Durable resume04round2receipt SHA51aebcc32a17980a71d09f48efa18197849e4b9f80f2ceb10f61dbfffe14781c.
All54 absent/skip/fullspecial flags and7PYC rechecked. Gain exactly1503232B;
ROOT runtime remains constrained. Old releases/cache deletions not counted again.

Parent executes only in official keeper8802 BASE/dev/shm/avoid009-evening-20261024:
python3 -B /tmp/avoid009-evening-capacity-tiles05/capacity_tiles05.py VERIFY --snapshot-sha256 EXACT_snapshotSHA --expected-head 66c95cd5dc8b6d4a679c2f730363370afbbcb7ac
Parent reviews entire proof, durably copies exact bytes and hashes independently.
Then same command RELEASE with --proof-sha256 EXACT_reviewedProofSHA.
Proof includes sourceSHA and snapshotSHA. RELEASE preserves whole raw+oldindex in
RAM, checks committed blob/path identity, full stages/54flags/PYC, creates exact
SHM privateindex55, uses empty ROOTindex.lock and same-inode installation, then
unlinks ONLYtarget last after full55index validation. Directory fsync+receipt.
Caught errors attempt raw and ALWAYS index rollback. Abrupt death NONATOMIC;
never kill keeper during transaction. START marker forbids blind retry.
No HEAD/objects change; gc.auto0/maintenancefalse. No unrelated cleanup.
Save proof/START/receipt/indexdigest durably before any keeper teardown.
Required canonical release receipt (parent writes after actual success):
tasks/evidence/AVOID-009/evening-20261024/storage-capacity-tiles05/capacity-tiles05-receipt.json

After release ONLY use private_index_resume05.py with continuation55-snapshot.json
(future55 state, not current assertion). Fresh evening-resume05-index-round-N.
PREPARE --round 1 --snapshot-sha256 EXACT_continuation55SnapshotSHA --root-index-sha256 EXACT_final55IndexSHA --prior-receipt-sha256 EXACT_durableReleaseReceiptSHA
Checks exact release index chain/head/inode/nlink,55flags/absences/PYC/stages.
Later rounds require previous resume05private bytes+receipt. Old resume04 cannot
operate55. RUN/INSTALL parent staging review and exact currentSHA gates retained.

Immediate restore: python3 -B /tmp/avoid009-evening-capacity-tiles05/restore_tiles05.py --snapshot-sha256 EXACT_originalSnapshotSHA --expected-head 66c95cd5dc8b6d4a679c2f730363370afbbcb7ac --release-receipt-sha256 EXACT_durableReleaseReceiptSHA
Restorer uses sibling capacity_tiles05 common functions; BOTH sources must be
reviewed/sealed. -B avoids pycache. Exact releaseHEAD/index only; later changes
require fresh restore source/snapshot. Restores exclusive canonical fullGitblob
and clears ONLYnew55th flag through SHM index/sameinode install. Old54/PYC remain.
Caught rollback removes only just-created restore inode and reinstalls55index;
new restore marker/receipt prevent replay. Same abrupt-death NONATOMIC caveat.
After restore prepare fresh54 helper from actual installed bytes, never blindrerun.

SOURCE36 historical54/raw35ref remain historical. CanonicalGitblob fully retains
raw35; any rerun needing path must restore exact blob through fresh reviewed gate.
Report Gitblob-only storage, not data loss. Math37 futurepins55 only after actual
release. SourceGit/private backups/user untracked/old3uploads/other files untouched.
