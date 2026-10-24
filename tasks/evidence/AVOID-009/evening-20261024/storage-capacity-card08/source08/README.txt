AVOID-009 capacity-card08 SOURCE ONLY / parent review required

Applying repository .agents/skills/evidence-driven-task-management/SKILL.md and
 tasks/implementation-review-policy.md within existing AVOID-009.
Scope: ONLY historical card-fullscreen02/native-media01.tar.gz working copy;
Git blob remains canonical. No feature/media/browser/public operation here.
All previous57 absent paths, full special flags, seven actual PYC bytes (including
English dirty7390411f...), ROOT index inode554090/device27/mode0600/nlink1 remain
unchanged. No old3uploads, unrelated untracked, raw48/49 or source/main cleanup.

Frozen start HEAD e04537deb978de4c27422edaf346ea0715643bfa
ROOT index SHA256 2a4d551abf9fad564ebe1bec49865fbfe8ea416d3008308515c7a4faee1fb0ea
ROOT index bytes5676248. Installed07round2 receipt full SHA256
31ed38b2d86104f45e0c2bf71dc3d7ba0b5e1b6f3e3169e36b7d632707e4804e.
No07round3 is involved or reused. No installed round may be reused.

Sole target:
tasks/evidence/AVOID-009/revisions-20261024/fullscreen-and-motion01/card-fullscreen02/native-media01.tar.gz
bytes8872384 / allocated8876032 / device27 / inode536935 / mode0600 / nlink1
Git blob0b6f942dc32084d2ecc1e7f6d37f7b2e96fcd3de
SHA256 78d6c67331d1487b4588f4b7378e085fa3a39a8f0b2aab492b44117f02b81aa0.
Readonly refresh confirms CURRENT e045 HEAD blob == full target bytes and all28
regular archive members match canonical native-media-capsule01.json hashes.
archive-members.json records evidence; it is not an execution/release receipt.

Review EVERY source line, snapshots, member manifest, historical-source-pins.json,
restore-map.json, this README and source-structure-audit.json; independently
verify source-seal.json. Syntax/AST checks do not establish runtime correctness.
The only official execution namespace is parent keeper8802's
/dev/shm/avoid009-evening-20261024. It is invisible here. No alias/new namespace.
Parent must serialize keeper operations, wait RUN_DONE before another RUN,
refresh exact baseline if anything changes, and execute only after full review.

Illustrative parent-only commands, NOT executed. Supply actual full seals from
source-seal.json; variables below are explanatory placeholders, not authorization.
Use absolute script paths in official keeper, not these relative examples.

python work/avoid009-capacity-card08/capacity_card08.py VERIFY \
 --snapshot-sha256 SNAPSHOT_SHA256 --expected-head e04537deb978de4c27422edaf346ea0715643bfa

Inspect exact proof bytes and SHA256. RELEASE requires the SAME reviewed source,
snapshot, HEAD, whole index, old57/full flags/PYC7, target full bytes/blob/identity.

python work/avoid009-capacity-card08/capacity_card08.py RELEASE \
 --snapshot-sha256 SNAPSHOT_SHA256 --expected-head e04537deb978de4c27422edaf346ea0715643bfa \
 --proof-sha256 EXACT_PROOF_SHA256

Fresh08 proof/private/started/intent/receipt paths are exclusive. Release creates
private SHM index, adds only target skip, preserves stage entries, holds full old
index and target rollback bytes in RAM; zero-byte exclusive ROOT index.lock
coordinates same-inode pwrite/fsync. START records old/new seals before install.
After full index/target recheck, exclusive fsynced unlink INTENT receipt records
INDEX_INSTALLED_UNLINK_NOT_YET_CONFIRMED BEFORE the only unlink. It does not
claim release success. Target directory fsynced; full final58/PYC7 checks precede
exclusive fsynced RELEASED_GITBLOB_ONLY receipt. Owned lock inode/zero-size checked
before cleanup. The receipt is success only after command completion + independent
parent reread of exact index/absences/flags/PYC7. No append/overwrite/reuse.

The transaction is NONATOMIC under abrupt death. Caught inner failure attempts
exact target RAM restoration if removed, then exact old index RAM rollback.
Original inode536935 cannot survive recreation; a rollback requires fresh source
snapshot/review, never rerun stale08. Failure before inner write may leave only
SHM started/private files. Partial/failed receipts are retained, not trusted.
If killed or rollback fails, STOP: preserve namespace/owned lock/receipts/private
bytes; inspect actual HEAD/index full bytes/58flags/target/7PYC first. START and
INTENT identify intended state; neither is completion. Parent fresh recovery must
verify immutable Git blob and exact current index before bounded repair. Never
blind-rerun RELEASE/restore/PREPARE or remove a lock without identity review.
No automatic recovery, broad deletion, Git GC or index replacement is provided.

Parent then copies exact proof/START/INTENT/final receipt bytes EXCLUSIVELY and
fsyncs them into tasks/evidence/AVOID-009/evening-20261024/storage-capacity-card08/.
Independently compare full durable receipt bytes/SHA to official original, inspect
actual released state, and preserve sources/seals. New08 continuation is gated by
this exact durable NEW release receipt, never old07 receipt/installed rounds.

Future STRICT58 continuation (currently NOT prepared; future snapshot is a model):
python work/avoid009-capacity-card08/private_index_resume08.py PREPARE --round 1 \
 --snapshot-sha256 CONTINUATION58_SHA256 --root-index-sha256 CURRENT_ROOT_SHA256 \
 --prior-receipt-sha256 EXACT_NEW08_DURABLE_RELEASE_RECEIPT_SHA256

Round1 requires e045 release HEAD, same ROOT identity, exact current release index,
old-index chain, exact58 paths/flags/PYC7/stage, new receipt's target blob/SHA/bytes.
Only fresh evening-resume08-index-round-N paths, always positive consecutive N.
Later PREPARE requires immediate prior08 installed receipt + HEAD/private/index
chain and explicit current --root-index-sha256. Never use old57 helper after release.

RUN --round N --expected-head ACTUAL_CURRENT_HEAD --argv-json JSON_ARGV supports
only add with -- plus literal reviewed files; commit -m AVOID-009 message; exact
readonly status/diff variants in source. --expected-head required for mutations.
Parent independently reviews every staged byte before commit. No PYC/58 protected
path accepted by add. ROOT unchanged during RUN. Use only requested allowlist.
INSTALL --round N --expected-head EXACT_COMMITTED_HEAD \
 --private-index-sha256 EXACT_FULL_PRIVATE_SHA256
requires full seals, same-inode ROOT install with old bytes rollback and exact58
protections. Review durable round receipt before next consecutive PREPARE; never
reuse installed rounds. No PREPARE/RUN/INSTALL has been performed for08.

Immediate restore ONLY at release HEAD and exact release index (not after commits):
python work/avoid009-capacity-card08/restore_card08.py \
 --snapshot-sha256 SNAPSHOT_SHA256 --expected-head EXACT_CURRENT_E045_HEAD \
 --root-index-sha256 EXACT_CURRENT_RELEASE_INDEX_SHA256 \
 --release-receipt-sha256 EXACT_NEW08_DURABLE_RELEASE_RECEIPT_SHA256

Restore refuses stale old HEAD/index even if caller supplies those old values;
it compares actual current HEAD, actual whole index and exact receipt. Later
commits require freshly prepared/reviewed current-head/index restore source.
It verifies new receipt + guard source/snapshot + target Git blob/full bytes,
exclusive creates target and private restore-index, removes only target skip,
keeps original57/PYC7, same-inode ROOT, and records restore receipt. Exception
rolls back index and removes ONLY its newly created target inode. Restore also
NONATOMIC under abrupt death: stop and fresh recovery review, never blind rerun.

Provenance / reconstruction limits:
Archive contains28 files including16PNG/2MP4, full frames, capture script, historical
manifest and source pins. It is NOT a standalone runtime. historical-source-pins.json
contains all93 exact historical input references, including installed external
runtime. restore-map.json binds retained source-raw-capsule02.tar.gz Git blob
113b0a1db17247ef7af204023fd36fd7b2291794, its receipt, media capsule manifest and
historical product2c606bdb provenance. Source/raw capsule contains input-map02 and
embedded/Git referenced sources; its76 installed runtime dependencies remain
external and gitReferenceResolutionPendingParent remains true. Do not infer new
acceptance, substitute current source, or claim runtime embedded. Old inventory49
was dc9-only; new08 readonly evidence refreshed actuale045. No historical files
or their prior failures were altered. preparation-failure01.txt retains a corrected
preparer SHA transcription assertion failure before source generation.
