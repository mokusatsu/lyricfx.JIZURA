# Validated repair memo: ONE original100 diagnostic — rendering still unmet

Source unchanged at accepted ccfe825 product (09g SHA7bd1bf38…); evidence/preload HEAD before run c377b982889501e5cdb0cc003420c4f00093e719. Actual candidate HTML SHA `957953970183081b330f715015fca0378a2a97edeab820d299487968d8733a8a`. No main/product/source/JAEN changes. Old failures and previous diagnostics remain intact.

Executed once with parent-exclusive lease and localhost network permission:

```
JIZURA_BROWSER=/usr/bin/chromium node --require ./dev/avoidance/layouts-c-validated-repair-memo-perf-gate-support.cjs dev/avoidance/layouts-c-perf-shadow-native.cjs --diagnose100 tasks/evidence/AVOID-008/performance/validated-repair-memo-diagnose01
```

No retry,1000,CDP/profile, security test, image or public check. `bootstrap.py` saves actual PID/PGID/startTicks/stat before exec and captures every stdout/stderr byte in unique `/tmp/jizura-repair-diagnose01-mlor627u`; exact log copies are retained locally. Node source/helper/fixture/inputs/thresholds/timed bodies are unchanged from the approved preparation.

## Actual performance result

| Side | Original baseline planning | Candidate planning | Ratio | Additional render p95 |
|---|---:|---:|---:|---:|
| ON100 |50.100000009ms|99.600000009ms|1.988023952×|+4.899999991ms|
| OFF100 |50.700000003ms|84.000000015ms|1.656804734×|+1.500000000ms|

**Planning is ONE post-warm point, not qualified p95.** The original three warmups+one planning point and80 render frames/16 warm frames remain unchanged. No formal threshold pass is claimed (`formalThresholdsEvaluable:false`, `formalExecuted:false`, `passed:false`). ON rendering exceeds the original+3ms requirement. The observed ON planning point is below2×, but is not formal performance acceptance. No cross-run causal speed claim is made: this spec222 run differs from prior spec215 environments; comparisons above use only its own original baseline/candidate sides.

Measured candidate ON source50.400000006 + finalize49.200000003 =99.600000009ms. OFF source60.300000012 + finalize23.700000003 =84.000000015ms. Full unrounded values, per-iteration warmups, native render timings and all actual states are retained in both original pretty `results.json` and compact `results.json.gz` (JSON equality checked).

## Workload and ordinary correctness retained

- Four sides, each requested/actual100cuts and100regions; candidate ON100staged, OFF0staged. Input parity/normalized project identity true. Complete34 native IDs retained.
- Candidate ON real rendering performs80 A.record +80 replay +80 observations; render errors0. Other sides retain their original native/control pipelines. No direct-native substitute or omitted rendering.
- Original cold setup remains present (candidate ON622 planning record calls on first warmup); measured completed-hit planning issues0 records.
- Both candidate ON/OFF end with memo compiles1/fullReads1/fastReads2, no memo fallback/cap. ON2723repairs/62149logical slots/268219stringchars; OFF0repairs. No new cache key or admission domain was substituted.
- All original font/input/fullstate/cut pipeline assertions passed. `pinnedFontCorpusQualified`, `actualPipelineValid`, `candidateFullCoverage`, `countsValid`, `inputParity` are true. Full font qualification remains in raw and derived side summaries; baseline lacks candidate font qualification normally and is not assigned a fabricated success object.

## Pins, lifecycle and evidence

`postprocess.py` independently verifies all120 input gzip archives against raw pinned SHA and live bytes, immutable2bb baseline HTML against its fixed Git blob,86 product pins and173 package-file pins. Support gate/runtime hashes, new preload bytes and resource samples are retained. The old runner SHA6cc4/fixture765/corpus4add and baseline2bb are unchanged. The parent gate, runtime01(spec222/current/running/connected) and accepted browser25da/raw9bd connection are archived by support. No new package install or dependency copying.

Runner errors[], changedInputs[], support changed package/product/gate[], violations[], all concurrency foreign[]. Runner reaches its `post` record only after awaited browser.close and server.close. Support after-scan has no live jobs and records1479 existing zombie PIDs separately.

Supervisor actual os.waitpid(374219) returned kernel status0, WIFEXITED true, exitCode0 and reaped own PID. `/proc/374219` was absent immediately after wait. No timeout or cleanup signal used. Supervisor elapsed16.4389s is lifecycle duration, not benchmark data. Complete identities/raw stat/wait/logs are in `process-*` and `cleanup-receipt01.json`; this is actual reaping, not an inference from a missing runner name.

The support scan is before/after, not continuous mechanical detection of all transient work; the parent held a full-period exclusive lease.250MiB reserve stayed satisfied. `summary01.json`, `archive-proof01.json`, manifest and explicit stage list supplement, not replace, original raw evidence.

Stopped after scoped evidence commit. No further optimization, rerun, timing or support preparation begins without parent instruction. Performance/global AVOID-008 acceptance remains unresolved.
