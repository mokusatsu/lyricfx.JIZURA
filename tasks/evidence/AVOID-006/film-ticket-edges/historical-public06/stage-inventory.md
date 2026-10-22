# Selective staging inventory

[stage-inventory.json](stage-inventory.json) is the explicit path/size/SHA list. It separates product/tools/public06/private evidence from all excluded local-only raw/draft files. The inventory is an implementation handoff, not a claim that parent-owned Pages/local/public/visual review has completed.

Select the listed files only, then these two inventory control files. Parent owns the final selection. Required current evidence includes `final-candidate-v2` functional/performance/numeric receipts and raw-log hash provenance, the 121-asset private06 bundle, current focused guards, parent numeric/functional reviews, source/performance histories and the archived historical04 and05 manifests. Compressed full reports preserve detailed diagnostics; raw files remain locally and are excluded from Git. No selected file exceeds Git's 100 MiB ceiling.

Public output is only 5,928,462 bytes; private evidence/inventory size is unrelated to Pages output. Existing private/draft04/05 and before/old-after/optimized-after MP4/PNG copies are not selected because final06 already pins the needed assets and historical-c3a parity reference. The withdrawn immutable test source is archived under `immutable-snapshots-candidate/test-tool.cjs`, not selected under `dev/`.

This list intentionally excludes the pre-existing dirty pyc and unrelated untracked files. Parent may add later local/public/Pages/visual receipts separately and must avoid interpreting absent future receipts as passes.
