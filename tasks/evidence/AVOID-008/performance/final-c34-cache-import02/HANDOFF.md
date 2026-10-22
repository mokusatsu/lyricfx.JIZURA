# Final C34 source cache correctness and size checkpoint

Base gate: `f828ff234d8f45659734af58397233a9fdf71c50`. Dedicated branch/tree: `avoid008-cache-final`, `/workspace/avoid008-cache-final`. This is cache correctness and non-timed sizing on the parent's final source gate; it is not all34-safe qualification, formal performance, or AVOID-008 completion.

## Exact import and protected source

Fresh worktree was created with --no-checkout and worktree-local non-cone sparse patterns. Only all src/app, build/vendor/JAEN, exact asset, explicit prerequisites and consumed fixtures were materialized; no historical evidence was checked out. Gate ls-tree has84 source modules /3,455,414 bytes, matching every materialized source byte before application, with no additional source files. All29 prerequisite hashes matched; no fallback or donor fixture replacement was needed. Existing lock-matched dev/node_modules is a symlink, excluded from commit.

The57f2dbb strict once prepare/reverse method applied09a's3 seams and09g's single cache insertion. Reversing restores every gate source byte. The other82 sources stay exact, including09h26564f10…,09i64d18deb…,09j d7c82dd5…, whole11p37662700… (all34 blocks/header), and11z d7dd51df…. `cache-applied.patch`, before source snapshots, source-before.json, apply-receipt and final verifier record this scope. The cap remains32entries/16MiB in both serialized and resident-string ledgers.

Four owned imports (full commits/SHA/bytes in import-manifest): correctness21eebb; size6c2302e; fixture21eebb (accepted352 bytes); perf runnercffdb38. No whole donor09a/09g or donor compiled HTML was copied. JA/EN rebuilt using `PYTHONDONTWRITEBYTECODE=1 python3 build.py`:

- JA SHA256 `30e704c8432a3804cb1b3e7475e2d833b2b63383830926116bfc13f71ee65430`
- EN SHA256 `62086cbab4cd4ad8ff42c0b75d55446497d1c15c79c9a721ed95e34cb5f0b84f`

## Fresh correctness

`JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-c-final-cache-test.cjs tasks/evidence/AVOID-008/performance/final-c34-cache-correctness01` exited0.104 actual source/compiled/driver/font pins match start=end and archived input bytes. Normal product page has84 modules, all34 native IDs and31 external adapters.40 cold/warm pairs preserve complete output and graph/alias identity, immutable detached copies and original input. Cold actual record410 / warm0; historical candidateBudget is retained proof, not new reconstruction.23 dependency mutations miss;4 nonC controls, bounds, eviction and oversize checks pass.

18 native frame pairs have equal RGBA digest/trace, no render errors:15 pairs have one observation each;3 invalid tilt99 preserved-native pairs have no placement observation. This is selected native equality, not whole34 geometry certification. Normal34 outcomes remain13 certified-hold-adapter /19 insufficient-space /2 unsupported-preserved. Unsupported shoji is `UNSUPPORTED_SHOJI_FILTER_SUPPORT`; priceTag is `UNSUPPORTED_PRICE_PENDULUM`. No failed/unsupported/insufficient result is promoted.

Independent schema page omits exactly09j's38,061 bytes (hash recorded),84→83 modules, external registry20→21 after one failing synthetic chochin adapter. Normal page never receives it. Registration misses the cached old result; failed original/diagnosis restore is exact and warm reuse adds no synthetic finalization (actual total1). Schema geometryCases0 / acceptanceC34Cases0.

## One non-timed full-input size preflight

After correctness passed, `JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-c-final-cache-size.cjs tasks/evidence/AVOID-008/performance/final-c34-cache-size01` ran once and exited0.105 pins match start=end. Both full inputs retain34 IDs and all100/1000 regions/cuts; actual registry31/sourceKnown34. No warmup, repeat, baseline, render workload, p95, timing or performance pass was measured. Read-only meter stays128MiB; product stays16MiB.

| input | actual records | key UTF8 / UTF16 bytes | payload UTF8 / UTF16 bytes | total+512 header / resident | product store/bypass |
|---|---:|---:|---:|---:|---:|
|100|595|507417 /1002690|4572143 /9101510|5080072 /10104712|1 /0|
|1000|5998|2636270 /5181820|46328110 /92230472|48964892 /97412804|0 /1|

n1000's product lastAttemptPayloadBytes0 means its bounded encoder declined the oversized payload, not a zero-sized result. The independent read-only same encoder measures the full graph; raw UTF8 hash/bytes and native JS UTF16 length are verified from lossless gzip. n100 actual stored payload matches that meter and both ledgers exactly. Statuses are100:65hold/29insufficient/6preserved;1000:648hold/294insufficient/58preserved.

Observed combined100+1000 resident charge107,517,516 bytes exceeds64MiB and fits128MiB with26,700,212 bytes headroom. This supports reviewing a bounded128MiB proposal, not applying it or promising fit for every input/heap. Product16MiB remains unchanged. Management overhead, transient encoding/copies and caller plans are additional to charged strings/header. Formal100/1000, timed diagnostic and cap changes require a new parent gate.

## Evidence and verification

`verify-final.cjs` independently checks gate restoration, all protected files/build inputs/import hashes,104/105 archived pins, full cold/warm values/graph strings/native frames, exact09j omission, separate schema counts/failed restore, normalized inputs, graph raw hashes/bytes/UTF16 length and both size charges. It passes with no live non-zombie Chromium/ffmpeg after execution. Both drivers completed finally browser.close/server.close; no processes were killed. A receipt-helper root-path typo was corrected before its first successful verification; product and browser results were unchanged.

`results.raw.json.gz` is the lossless canonical original pretty JSON for each new run, with raw-result-identity.json storing exact SHA/bytes/roundtrip receipt. Driver compact results.json.gz remains semantically identical. Only our redundant newly generated raw JSON duplicates were removed; old evidence/FAILs and other agents' files were untouched. Source-map-before also has lossless gzip+raw identity. No image was viewed. Public checks and external origins were never accessed (runner routing aborts non-loopback origins). Main worktree/Git/index were never edited. All remaining decisions are parent review/cap/runtime/alone gates, not authorization implied by this checkpoint.
