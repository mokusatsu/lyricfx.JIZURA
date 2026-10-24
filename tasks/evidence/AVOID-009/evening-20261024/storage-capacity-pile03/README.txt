PREPARATION ONLY. Parent must fully read scripts/snapshots and approve sources.
No script was imported/executed. Python AST parsing only. ROOT unchanged.
Read-only Git head/flags/stage/blob validation only; no public/network checks.

Fixed scope: one already committed pile-exit13 after-frames.json.gz only.
Snapshot current HEADc57fe73c481b1e11d27daf9d8556956470c9e064;
ROOTindex50c816f7ff3fc75f4516d51b838e7b27f18f86ab982f4c78397eee2bce82e309,
5591226B/inode554090/device27/mode0600. Old52 absent/flags and7PYC checked.
Current installed receipt SHA105aae22872f15580d1473032d69917d8652ad0feaab48e396cfec07b744b4ea.
Target bytes8236265, allocated8237056, full bytes equal committed blob
ea66a2ce7d23633a226959650bbcfbdc176b3a39 and SHA9871dbde2bdc8008773cab7f0cdc7738909f215221b7e0ab85a7b0826270ac68.
Capacity observed2,502,656B ROOT +8,237,056B release =10,739,712B theoretical;
less1,218,292B SOURCE28durable raw leaves9,521,420B before objects/docs overhead.
TMP2,322,432B stays untouched. No counting old44 releases again.

All runtime steps parent-owned, serialized inside existing official keeper86381,
BASE/dev/shm/avoid009-evening-20261024, exact four-field RUN protocol. No aliases.
1. capacity_pile03.py VERIFY --snapshot-sha256 EXACT_snapshotSHA --expected-head c57fe73c481b1e11d27daf9d8556956470c9e064
2. Parent read proof full, save its exact bytes durably, independently hash it.
3. capacity_pile03.py RELEASE --snapshot-sha256 EXACT_snapshotSHA --expected-head c57fe73c481b1e11d27daf9d8556956470c9e064 --proof-sha256 EXACT_reviewedProofSHA
VERIFY creates exclusive proof only. RELEASE rechecks source/proof/snapshot and
ROOT/source bytes, reads whole target8.2MB and ROOT5.6MB rollback copies into RAM,
creates exclusive SHM private copy, changes exact one skipflag, checks full stage
listing unchanged and exact53special flags, then creates zero-byte ROOTindex.lock.
It installs same-inode ROOTindex53, verifies target unchanged, unlinks exact file,
fsyncs parent directory and emits receipt. No HEAD/objects change and no GC.
Caught exceptions restore raw and oldindex from RAM; abrupt death during index
write/unlink remains NONATOMIC. START marker blocks automatic retry. Never kill
keeper during transaction. Any interruption requires fresh parent inspection.
No raw or index RAM backup is available after namespace loss.

4. Save proof/START/receipt and final index digest durably before keeper exit.
Canonical receipt exact planned destination:
tasks/evidence/AVOID-009/evening-20261024/storage-capacity-pile03/capacity-pile03-receipt.json
Parent owns all canonical docs/evidence copies. Do not call released until receipt.
5. Future53-skip Git uses private_index_resume03.py, not prior52 helper. Fresh
round names evening-resume03-index-round-N. It uses continuation53-snapshot.json,
whose state is FUTURE_POST_RELEASE_MODEL, not currently asserted state. PREPARE:
--round 1 --snapshot-sha256 EXACT_continuationSnapshotSHA
--root-index-sha256 EXACT_current53IndexSHA --prior-receipt-sha256 EXACT_durableReleaseReceiptSHA
Durable release receipt path above required. Bootstrap checks source-release
index chain, same inode/mode, exact HEAD, exact53flags/absent/7PYC and unchanged
stage listing. Subsequent rounds use new53 round receipt/private bytes. Generic
RUN/INSTALL allowlist and same-inode RAM rollback stay unchanged. Parent reviews
staging before commits; keep gc.auto0/maintenance.autofalse. Never reuse old52
helper on53 model, never standard5.6MB ROOTindex.lock contents.

RESTORE (reviewed source still needs parent approval): restore_pile03.py
--snapshot-sha256 EXACT_originalSnapshotSHA --expected-head c57fe73c481b1e11d27daf9d8556956470c9e064
--release-receipt-sha256 EXACT_durableReleaseReceiptSHA
Only valid immediately at exact release HEAD/index; after later index or HEAD
changes, it refuses and requires freshly sealed restore source/snapshot. Reads
committed8.2MB blob into RAM, exclusively restores canonical bytes+mode, builds
SHM privateindex clearing ONLYnew53rd skip, same-inode installs exact old52 model,
checks full stage/52/PYC, emits restore receipt. It deletes only newly created
restore inode on caught rollback. Restore also has abrupt-death NONATOMIC risk.
After successful restore, current53 helper must not be reused. Prepare a fresh52
helper from exact newly installed index/receipt. No blind rerun of either guard.

Existing untracked25/26/27, SOURCE28 RAM raw, old3 uploads, PYC and unrelated
untracked are excluded from release. Runtime remains SHM; durability evidence
must be independently copied and pinned before keeper shutdown.
