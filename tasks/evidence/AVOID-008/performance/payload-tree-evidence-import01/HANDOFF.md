# Fixed payload-tree evidence import only

Fixed donor Git446ed00a8a9d42ca5d06d30603083142caf65386 selected15previously absent performance directories: all cache-payload-tree* plus payload-tree-browser01 and payload-tree-diagnose01. Preflight recorded275files/24,794,007B and confirmed each of the six explicitly named helper blobs exists. Every imported evidence file was compared to its fixed Gitblob and SHA; all current donor evidence matched, so275read-only immutable hardlinks were used. Mutable donor product09a/other source or later read-only reports were excluded.

Six requested dev helpers were archived only under helpers/ as deterministic losslessgzip, with original path, GitblobSHA1, rawSHA256/bytes, compressedSHA256/bytes and inode manifest. No top-level dev helper or mainproduct was applied, overwritten or removed. Historical raw FAIL/browser/pure/diagnostic labels are retained without reinterpretation. This import does not run or independently accept their test claims.

Main84source+JAEN2+dirty pyc1, Gitindex and all existing performance flatJSON have fullSHA-equal before/after records. The existing74,925untracked paths retain identical inode/mode/size/mtime/ctime/nlink/symlink metadata; before/after gzip metadata snapshots are identical. Unrelated untracked contents were not fully rehashed, and no fullcontentSHA claim is made for them. No existing untracked path was a permitted write target.

Inspect preflight.json, protection-before.json, manifest.json, receipt.json, import.py and support/final verification hashes. Main source/producthang and existing flat gate/runtime*.json remain unchanged. No mainGitstage/commit, browser/tests/timing/images/public operation occurred. Free space remains above250MiB. Import finished; stopped for parent review.
