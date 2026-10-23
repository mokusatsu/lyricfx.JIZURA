# AVOID-008 native local bounds memo — source/pure checkpoint

Candidate only; parent review required. Browser, native pixels, timing, CDP, images and public checks were not run. Previous performance FAIL remains unchanged; no speed claim. No new security audit or attack matrix was executed.

## Scope and exact behavior

Start HEAD 7a8f13c684ef3ccdfded90852d68e09d9a05d4d0; immutable product reference d298d6ab5227f0a6d5d984b05297a988580f53ed. Only 09a/09g and generated JA/EN changed; all other 82 source files exact. This caches only C nativePath's first local hull+bounds. Non-C and validationOnly use the original expression. Every miss executes the unchanged guardedPoints/flatMap/hull/bounds expression. Second world hull, CTM, events/snapshots, geometry validation, continuous proof, clocks, recorder/replay pipeline and thresholds remain unchanged. 09a replay/freeze/signature suffix is exact except the private installer return; all of 09g reverses exactly with three bridge edits.

A bounded fingerprint uses paint, stroke pad, length and first/last coordinates. Every potential hit compares every coordinate with Object.is, preserving -0 and exact float distinctions. Collisions miss and replace the matching fingerprint entry. Same coordinates in separate arrays can hit. Only scalar numeric copies in private Float64Array and four bounds scalars are retained; no input, program, plan or context references. Hits return a fresh bounds literal. Existing stroke guardedPoints construction still runs; its cost was not removed. Normal finite source-created paths and stock synchronous helpers are the intended domain. One stock helper/method guard per eligible paint returns changed helpers to the old algorithm; no new per-command guards or general arbitrary-JavaScript certification.

## Budget, stats, bridge

LRU caps: 512 entries; 1,048,576 retained coordinate scalar slots (8 MiB Float64 storage); 8,192 points/path; 192 characters/fingerprint (maximum 98,304 retained key characters), plus bounded entry headers and four scalar values/entry. Evict before allocating the new retained snapshot. This is additional bounded numeric cache memory, separate from the existing dual 128 MiB string ledgers; those ledgers and old counters/accounting are unchanged. Temporary original hull algorithm work is not counted as retained memo slots.

Additive flat numeric fields are nativeLocalBoundsHits, Misses, Bypasses, Evictions, Replacements, Caps, Entries, Slots, KeyChars, MaxEntries, MaxSlots, MaxPoints and MaxKeyChars. Hits/Misses count eligible exact reuse/computation. Caps records per-path/key cap bypass; coordinate pressure causes LRU eviction. Replacements count fingerprint collisions separately from LRU eviction. Non-C/validationOnly does not touch memo counters. Existing clear resets this cache/counters too. Caps or helper changes fall back to the old algorithm, never classify a feature unsupported.

The existing installer returns a private stats/clear closure pair, consumed lexically in 09g; installer remains deleted, no public memo callable is added. A private empty pair preserves standalone test installers returning undefined. Key/dependency/codec/double verify/LRU32/old admission/ordinary freeze/signature are unchanged.

## Executed checks and evidence

Final pure06: 46 full native-program/V8 alias/native-call-trace normal mock-Canvas cases, all getTransform counts unchanged versus fixed d298. Includes prior 40 normal command/line/transform/reset/reentry cases; repeated hits; middle-only fingerprint collision; separate arrays; -0/floats; fill/stroke/pad changes; normal nonstock hull/bounds fallbacks. Program and trace evidence are complete in compressed raw. This mock oracle is not native Canvas pixel evidence.

Direct private helper oracle computes the original hull/bounds on every test: input/result mutation independence, clear, 513-entry eviction, 65 x 8192-point slot pressure, 8193-point cap fallback. Full generation rules, per-input ordered Float64 hashes, four scalar results and actual counters are saved instead of duplicating huge programs. Actual 09g bridge clear/stats/install deletion tested. Final raw pure06 SHA equals parent independently rerun pure05 raw e96eff0f38f65e1943cc2f30d2ec9237095105ecf036da9f4dea7f2a7b04a7a1; the final fallback does not change real bridge output.

Existing layouts-c-validated-repair-memo-pure.cjs with its unchanged undefined-return installer stub: 165 normal cases and five lifecycle checks PASS, full raw saved as stub06. That run pins its own exact inputs before final build02; no claim its compiled HTML pins equal final build. Pure helper consumes source directly. No broader matrix rerun.

Commands: node --check for both owned source files and the new helper; node --max-old-space-size=384 dev/avoidance/layouts-c-native-local-bounds-memo-pure.cjs; node --max-old-space-size=384 dev/avoidance/layouts-c-validated-repair-memo-pure.cjs /tmp/avoid008-native-local-bounds-stub06; PYTHONDONTWRITEBYTECODE=1 python3 build.py. Final build02, reverse-build02, restore-build02 succeeded. In-place reverse temporarily restored only our two owned source files, produced original JA/EN byte exact, then restored candidate and rebuilt candidate byte exact. No duplicate HTML archive. Lossless source.patch reverses both source bytes exactly in a temporary /tmp tree. source-identity02.json and reverse-proof02.json fix hashes and all 82 protected source pins. Donor pyc absent before/after; main and its existing pyc untouched.

## Preserved history and remaining work

pure01 test-only truncated 09g extraction SyntaxError is preserved with failed helper/log, not successful evidence. pure02–05 history retained. pure03 metadata contained a deliberately mutated returned bounds reference; pure04 copied scalar metadata. Final pure06 authoritative. Historical source reverse-proof01 predates the undefined-stub fallback; reverse-proof02 is current. No failures or old performance evidence overwritten. No browser preparation or performance run authorized by this checkpoint. Parent must review source/pure before any next run.
