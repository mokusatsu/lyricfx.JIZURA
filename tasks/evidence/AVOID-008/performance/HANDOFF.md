# AVOID-008 C performance harness / bounded diagnose100

Source baseline before this harness commit: `85928e6f75c2116d47c768481d6feba1a09b463b` on `avoid008-integrated`. Product source and JA/EN compiled files are unchanged. This branch has 23 C implementations, including the old nameTag; Japanese11 and newer numbered/swissGrid are not integrated here. This is not C34 acceptance.

The immutable comparison is Git `2bb3f864b5d40361961d8ad2aabeec24bfb5d1cb:index.html` (SHA256 `ad7257a257ff7bfc43c07fe06bc83490d3cdf8b7fcf716019eb9b3e70e67ce57`). Candidate JA SHA256 is `43bd766a974d9092de970090c14ad6ca35fd0c0b7911d574d1a3937a5111cb75`. The 116 start/end source, compiled, driver, contract, local-font and historical-procedure pins are in each results receipt, with exact gzip inputs. The whole source bundle is checked as embedded in candidate JA.

## Workload and provenance

`contract.json` requires 100 regions/100 cuts and 1000/1000, planning p95 at most 2 times baseline and additional render p95 at most 3ms. Formal configuration retains B's 3 planning warmups + 6 measurements and 80 render frames / 16 warmups; viewport1280x720/DPR1, stage3200x1080, canvas1600x540/scale.5, same browser and pinned nine-face font fixture. All 34 native IDs cycle through identical full project/normalized input on baseline and candidate, with ON/OFF, start1.25 and four-second cuts; unsupported C adapters are retained. Native planner time and candidate C finalization time are both included; common deterministic normalization is separately reported. Each condition uses a fresh document, native caches remain after cold clearing and identical warmups. Local HTTP only; all other origins abort.

B's formal script uses a current-source native-only variant, whereas this harness uses the parent-required immutable2bb native planner/render. Older004 (3+7 plans,30/10 render) and002 (2+12 native plans, no new regions) remain historical evidence and are not relabelled as this workload. Formal conditions were not relaxed to those older render samples.

`--prepare` records bytes/configuration without page or performance execution. prepare01 preserves sandbox `spawnSync git EPERM`; prepare02/03 are authorized read-only preparation retries, not performance successes. prepare03 is the final static preparation. Syntax checks passed for both harness files. No product rebuild or product modification was performed.

## One authorized diagnosis

Parent authorized one alone-only `--diagnose100` after all other browser owners confirmed closure. `diagnose100-01/results.json` contains raw measurements, profiles, per-cut diagnostics, exact input hashes, cache statistics and concurrency snapshots; `diagnostic-summary.json` is derived from it. The one run lasted **26.468 seconds**, 2026-10-22 18:42:38.257–18:43:04.725 UTC. Browser and loopback server closed in finally; pre/during/post foreign-job guard found none. All 116 start/end pins match. No public origin was contacted.

| Condition | Baseline plan point | Candidate plan point | Ratio | Additional render p95 |
|---|---:|---:|---:|---:|
| ON | 51.60ms | 4067.90ms | 78.84x | +4.60ms |
| OFF | 51.90ms | 63.50ms | 1.22x | +0.50ms |

These are **one post-warm full-plan point**, not planning p95 or a formal contract result. ON shows an early planning/render performance problem. Measured ON finalization is4005.20ms; clapper's three cuts account for3116.00ms/171 record calls (77.8% of finalization), followed by stampSheet196.20ms/21 calls and newspaper175.20ms/21 calls. Product optimization is returned to owners; source, limits and expectations were not changed.

Both conditions have actual100 cuts/100 normalized regions; baseline/candidate whole project and normalized-plan hashes match, all34 native IDs are rendered, render errors0 and candidate-budget violations0. Current C23 stages68/100 cuts; missing32 cuts are preserved, so full-coverage=false. Actual ON render record/replay each58/80 reflects the unsupported IDs retained in the cycle. Counts-valid=true is only a workload/budget observation, not safety or complete-C coverage.

The post-timing native corpus check emits no unknown glyph assignments under the pinned fixture. However 17 IDs at two sample times have unsupported raw measurement programs with raw diagnostics:4 `UNSUPPORTED_TEXT_STATE: Default letterSpacing required`,24 `UNSUPPORTED_DRAW_PROGRAM: Unadapted Canvas operation fill`,6 corresponding `stroke`. The check already constructs its environment with makeEnv, but uses native `placementLayoutsC:false`; it is not the corrected C measurement qualification. `pinnedFontCorpusQualified=false` is preserved; this check is not substituted for corrected measurement/cmap qualification. A stable-C34 formal run needs the full corrected corpus qualification, current source/font fixture, and parent review; no successful font qualification is claimed here. Only local1.5/3.2 corpus sampling is attempted, not all-time production-font coverage.

## Commands and gates

The executed command, from this worktree, was:

```sh
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-c-perf.cjs --diagnose100 tasks/evidence/AVOID-008/performance/diagnose100-01
```

Do not rerun without the parent's exclusive browser slot. Diagnose uses3warm+1point for all four ON/OFF/side conditions (16 full plans,320 render frames); its watchdog is5minutes. This run took26.468s; an initial unmeasured estimate was30–180s. Output directories must be new; no old FAIL/results are overwritten. The guard aborts before starting if another browser/test/encoder is active, and closes only its own browser on contamination.

Formal100/1000 is **not authorized and not executed**. A future command is:

```sh
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-c-perf.cjs --formal tasks/evidence/AVOID-008/performance/formal01 path/to/parent-authorization.json
```

The authorization must contain `authorizedByParent:true`, `allC34Stable:true`, exact current `candidateSHA256`, `baselineCommit`, `fontManifestSHA256`, and `runtimeIdentityFile`. The identity must carry current matching environment revision/observed revision, running phase and connected state; an OS snapshot or unavailable/older identity is not substituted. No authorized-true fixture has been invented. All34 actual coverage, same input, actual ON record/replay/observations, pinned corpus qualification, no contamination and unchanged contract thresholds are required for a formal pass. The current prepared source intentionally cannot pass those gates.

Formal has72 full plans (39,600 cut plans across both sizes) and640 render frames. Based on this diagnosis, elapsed time could be several minutes; this is an estimate, not a measured formal result. The hard watchdog is30minutes and an interruption is retained as failure. Formal execution remains blocked until all34 stable, corrected corpus qualification and explicit parent authorization.
