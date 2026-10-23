# Fixed immutable-edge CPU profile evidence import only

Fixed donor Git5007c71bfdf099f122a577c4c14578628672ca0e contains both selected directories: preparation7files/41,544B and profile136files/10,833,026B, total143files/10,874,570B. Preflight confirmed absent main destinations and fixed-tree helper existence. The selected commit delta is saved separately; unchanged preparation/helper blobs are included from the fixed tree regardless of whether that commit introduced them. No live donor product/source was read.

Every selected evidence file was checked against its GitblobSHA1 and SHA256; all donor evidence bytes matched, so143read-only immutable hardlinks were created. Original paths/bytes/blob/SHA and donor/main inode metadata are in manifest.json. Existing main files were not changed.

CPU driver immutable-edge-phases-profile.cjs SHA256e55b10826b34797e5549634be4b0a116cc6e735744283b0c00dde7af526b62da and aggregate immutable-edge-phases-aggregate.cjs SHA25664e0afdc1c621394bb894f72f2d2bb7d81b6b851a458fc5dab25ca78adcf7e16 are archived only as deterministic losslessgzip under helpers/, with raw/compressed hashes and Gitblob IDs. Main topdev/source/compiled were not applied. This is historical evidence transport, not new profiling/test execution or a new performance/008acceptance claim.

Main84source+JAEN2+dirty pyc1, all existing dirty tracked files, Gitindex and existing performance/root008flatJSON retain fullSHA-identical before/after records. Existing74,924untracked paths retain exact inode/mode/size/mtime/ctime/nlink/symlink metadata; compressed before/after metadata hashes match. No full-untracked-contentSHA claim is made.

Inspect preflight/protection-before/selected-commit-diff/manifest/receipt/import.py/support-hashes/final-verification. No Gitstage/commit/push, tests/browser/timing/media/image viewing/public actions or product application occurred. At least250MiB remains free. Complete; stopped for parent review.
