# AVOID-008 validated repair memo — candidate, pure only

Parent review requested. Browser, timing, CDP, image and public checks were not run. This does not establish performance compliance or complete AVOID-008. Prefreeze was not adopted; 09a ordinary freeze/signature is byte unchanged. No new security audit/fuzz/reproducer was performed, following the latest instruction.

## Scope and implementation

Start HEAD `d256228e650382e560ce941310490581837c079d`, product basis `3b0c995a2c912cf3edf6583f372c215c310e11f0`. Only `src/09g_layoutsC_placement.js` plus generated JA/EN HTML changed. The other 83 source files are exact to start. Main, parent documents/gates, other untracked output and pyc were not touched. Donor pyc was absent before and after; no new pyc generated.

The completed cache's private immutable entries are branded with a private WeakSet when stored. The first read of an entry uses the unchanged full `payloadDecode`; only after success is that same wire parsed once more to extract null-prototype paths, scalar repair kind/path/key and alias source/target paths. The memo retains no output graph references. It is bound to exact entry identity and payload string. Subsequent reads still parse fresh JSON, then apply those validated instructions in source order with captured defineProperty/setPrototypeOf. Every returned object is fresh; within-result alias topology is preserved. No public registration API was added.

The generic decoder's text is exactly unchanged (hash in `reverse-proof02.json`). Existing payload guards remain on each read and compilation. Unknown/unbranded entries use the old decoder and cannot compile a memo. A fast-path exception retires the memo and retries the unchanged full decoder. Compilation/cap failure returns the already successful full decode; it does not classify a layout unsupported or alter old cache hit/bypass counters.

Only the latest accessed completed entry has a memo. Reading another entry retires it. Same-key replacement, eviction of its entry and clear retire it. Brand retention is weak. No key/dependency/verification/dual-128MiB/LRU32 policy, ordinary freeze, edge predicate, render, geometry, clock or threshold changed.

The old decoder reserves all repaired slots before final installation. The memo can install scalar and alias repairs immediately because the identical wire has passed the old earlier-target/pending-path checks: no valid alias target path crosses an unresolved repair. DefineProperty overwrites existing placeholders without changing own-key order or descriptor flags. Null-prototype restoration still precedes scalar/alias repair application. Normal oracle comparisons cover full identity topology and ordered own descriptors, not merely JSON values.

## Bounds and additive stats

Memo caps: 8,192 operations; 131,072 logical retained indexed slots; 1,048,576 retained string characters. Slots count one outer operation-array slot plus four operation fields and each retained path element (repeated references counted conservatively). Array length/header overhead is separately bounded by operation count; fixed memo record fields are constant. String characters count string path elements, string repair keys and scalar markers; the already-owned payload string is referenced, not copied or charged again. These memo metrics are additional bounded storage, not a claim that old cache resident-string accounting measures total JS heap. Compilation checks caps before adding each operation; failure discards the local partial memo and falls back normally.

New flat numeric `layoutsCFinalCacheStats` fields:

- `repairMemoCompiles`: successful memo construction;
- `repairMemoFullReads`: calls to the old full decoder, including initial/capped/unbranded reads;
- `repairMemoFastReads`: successful fresh-parse instruction reads;
- `repairMemoFallbacks`: fast-read or compilation errors, excluding separately counted caps;
- `repairMemoCapped`, `repairMemoRetired`;
- live `repairMemoSlots`, `repairMemoStringChars`, `repairMemoRepairs` and corresponding `Max*` caps.

Counters reset on clear together with existing cache counters. No old counter or byte-accounting definition was changed.

## Executed normal pure checks

Helper: `dev/avoidance/layouts-c-validated-repair-memo-pure.cjs`. Product closure is evaluated in an isolated VM. Its only test bridge exposes internals; no product API added. Context verification is stubbed only for small cache lifecycle fixtures, so those tests prove keep/read/LRU/clear mechanics, not browser dependency correctness.

Final commands:

```
node --check src/09g_layoutsC_placement.js
node --check dev/avoidance/layouts-c-validated-repair-memo-pure.cjs
node --max-old-space-size=384 dev/avoidance/layouts-c-validated-repair-memo-pure.cjs
PYTHONDONTWRITEBYTECODE=1 python3 build.py
```

Final result is `pure05.raw.json.gz` / `pure05.summary.json` (stdout and stderr retained): **165 cases passed**: 160 normal DAG cases, saved 100-cut ON and OFF payloads, three independent caps. Each case compares first/full, second/fast and third/fast against the unchanged decoder. Checks include full values, ordered own descriptors, alias graph, null prototypes, undefined/-0, cross-read object independence and absence of output references in memo instructions. Actual saved payload source paths, raw SHA/bytes, candidate wire SHA and canonical graph SHA are recorded; large existing input raws are referenced rather than duplicated.

Saved ON: 100 cuts, 2,723 repairs, 62,149 logical slots, 268,219 string characters. Saved OFF: 100 cuts, zero repairs. Each obtains one full read and two fast reads. Report counters are cumulative across fixtures; their cumulative values are not per-target counts.

Three cap fixtures exceed operation count, retained path slots and key-string characters respectively; all three reads use the old full path and return equal results. Five lifecycle checks pass: replacement, actual LRU eviction, latest-entry switch, clear/reset, and unbranded generic fallback. No original expected value or threshold was weakened.

Historical evidence retained:

- `preparation-failure01.json`: attempted donor pyc pin was absent; failure before product writes, corrected scope records its absence.
- `pure01.stderr.log`: test-only missing closure terminator; VM never ran the suite. Fixed helper only.
- `pure02` and `pure03`: earlier passing two-read results; `pure04`: corrected slot/header accounting, two-read pass; `pure05`: final same source and explicit third-read coverage. No failed functional result is relabeled success.

## Build and reversal

Build succeeded with `PYTHONDONTWRITEBYTECODE=1`; generated JA/EN pins and all current input hashes are in final manifest/pure05 raw. `before-09g.js`, `after-09g.js` and lossless `source.patch` fix the source delta. Applying that patch backwards in a private temporary directory restores exact starting 09g bytes (`reverse-patch.log`, `reverse-proof02.json`). An isolated reverse build using starting 09g and the other 83 unchanged source files reproduces **both original HTML files byte exactly** (`reverse-build01.log`, `reverse-proof01.json`). `reverse-proof02.json` connects that unchanged baseline build to the final candidate hashes and proves generic decoder text equality. No redundant before/after HTML gzip archives were created.

Remaining: parent code/pure review, then separately authorized browser correctness and original performance workload if accepted. Existing performance failure remains unchanged; no speed gain is claimed from these pure checks.
