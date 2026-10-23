# C matrix reuse paired browser preparation — NOT EXECUTED

New helper: `dev/avoidance/layouts-c-native-command-matrix-browser.cjs`, SHA `b818ef8757a989df7e4cd157b4215bb689cca47305ee3e7cba1ea99c6e3fc87f`.
Basis: accepted `layouts-c-validated-repair-memo-browser.cjs` SHA5f8fb350…; candidate product fixed d298d6ab5227f0a6d5d984b05297a988580f53ed. No product/source/main/docs/runtime/gate changes. Syntax check only passed; no browser, functional suite, timing, CDP, image, public or security matrix ran.

## Scope and complete change list

1. Old complete ccfe HTML is loaded by reference from fixed `performance/validated-repair-memo-browser01/input-index.html.gz` (decoded SHA95795397…). New complete d298 HTML is current index.html (SHA82855539…). No omitted-module/synthetic document is generated. `full-html-proof.json` independently verifies **all84 modules embedded in both**, old09a=e22e/current09a=ba667 and other83 unchanged, accounting for the build's effect-image substitution. Old HTML is not rearchived.
2. One `exercise` function is serialized unchanged between two pages/realms in the same browser: old `/baseline.html`, then new `/`. Same fixture/font URLs, viewport, rendering flags and clocks. The original40 normal conditions remain in original order. Original cold/warm/ledger/2fast snapshots retain their order and old row fields; no performance timer is added.
3. Only two extra fixtures run after40: stampSheet and newspaper, text風の先へ,cx=.05,cy=.05,radius=.02. They are stored in separate `targets`, never counted as normal rows or ordinary-radius successes.
4. Original18cold/18warm/18fast frames remain. Targets add6cold+6warm+6fast, giving **72 frames per realm** (40 normal rows plus2targets),144 total across both realms. Every frame uses the same native Canvas renderer at `.65,1.5,3.7`, not screenshots/video. Both realms must match pixel digest, full observations, errors and recorded program hashes.
5. The original A.record counter wrapper still calls the original recorder once. Only during rendering, it also captures each returned program's complete JSON string and alias-graph string, hashes both after rendering, and counts every event kind. No record/replay is replaced or skipped. Captures are per real returned program; all per-frame program hash/kind arrays are retained. Targets require aggregated actual nativePath(stampSheet) and line(newspaper) counts>0 over their native frames; empty paths cannot pass as coverage.
6. Host compares **both entire result objects** with deep strict equality, complete ordered JSON equality and complete sorted-key canonical JSON equality. This includes40rows,2targets,counters,all frames and program captures. On success candidate full raw is saved once, reference full-result SHA and each reference row/target SHA/count retained. On comparison failure both completed full bodies are saved as separate gzip failure evidence; no retry. If an exercise itself throws, its failure is recorded and later stages are not treated as executed.
7. Removed inactive helper mutation/budget/schema code, which the basis had already skipped. No such additional tests are scheduled or claimed. Old accepted evidence remains intact.
8. New gate/runtime/output/candidate pins, paired result metadata, baseline archive drift check and compressed-only output. Unchanged input gzip archives are referenced from existing fixed browser01 or lazy-browser02 archives after byte-hash verification. New input archives (including candidate JA/EN) are made once, no schema/old HTML duplication.

`exercise-changes.json` describes the limited body edits (wrapper,program capture,render target condition,target storage). `driver.patch` shows every host/body change. Reverse applying this complete patch reproduces original5f8 bytes exactly (`reverse-patch.log`). `derivation.json` confirms the original173package localeCompare DFS, MainThread-aware scan and300s/250MiB monitor blocks are retained byte-for-byte. The original exercise's validations/normal selection/ledger and2fast checks remain; hashes do not replace those full within-realm comparisons.

## Required future parent gate

Parent must author `performance/native-command-matrix-browser01-parent-gate.json`:

- authorizedByParent true; authorizedMode `one-paired-normal40-plus2-native-matrix-correctness`; formal1000Authorized false;
- candidateSource `d298d6ab5227f0a6d5d984b05297a988580f53ed`;
- candidateSHA256 `828555398f39df9178bdaaba6edddcae40162aff02c1c2f477cf43c5f584e309`;
- baselineSHA256 `957953970183081b330f715015fca0378a2a97edeab820d299487968d8733a8a` plus baselineArchiveSHA256 from full-html-proof;
- exact driverSHA256, output `tasks/evidence/AVOID-008/performance/native-command-matrix-browser01` (must not exist);
- expectedSpecRevision string222,86current productPins and173actual packagePins.

Fresh parent-owned runtime paths: `performance/native-command-matrix-runtime01.json` and `-raw.json`; current/observed revision equality, running/connected and exact gate revision required. No authority/freshness is inferred from this preparation.

Original loopback/external-abort rules, proxy/CA/TLS launcher path, alone checks,300s watchdog,250MiB disk monitor, awaited per-page and browser/server cleanup, terminal input/package rehash checks remain. Failure evidence/full stdout/stderr and actual bootstrap waitpid logging must be supplied by the separately authorized execution wrapper, as before. No in-run performance changes or1000 work authorized.

Stopped at fixed preparation commit. Parent must review before any launch.
