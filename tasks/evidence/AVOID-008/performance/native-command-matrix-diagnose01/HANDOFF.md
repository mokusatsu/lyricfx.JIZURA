# C command/line matrix reuse: ONE original100 diagnosis — performance unmet

Candidate product d298d6ab5227f0a6d5d984b05297a988580f53ed (09a ba667…); prepared preload HEAD95c653746cbb64d05c574881114b6d7248a6b8fa, preload SHA9b7f6438…. Actual JA SHA828555398f39df9178bdaaba6edddcae40162aff02c1c2f477cf43c5f584e309. Main/product/source/JAEN were unchanged during this run. All old failures and raw history remain intact.

Executed exactly once with parent-exclusive full-period lease:

```
JIZURA_BROWSER=/usr/bin/chromium node --require ./dev/avoidance/layouts-c-native-command-matrix-perf-gate-support.cjs dev/avoidance/layouts-c-perf-shadow-native.cjs --diagnose100 tasks/evidence/AVOID-008/performance/native-command-matrix-diagnose01
```

Original runner6cc4/fixture765/corpus4add,baseline2bb,100ON/OFF four sides,3warmups+1point,80render/16warm frames,all timed bodies/record/replay/observations and2×/+3ms requirements stayed unchanged. No retry,1000,CDP/profile,security test,image/public check or extra browser job.

## Actual result

| Side | Baseline planning point | Candidate planning point | Ratio | Additional render p95 |
|---|---:|---:|---:|---:|
| ON100 |51.299999997ms|112.699999988ms|2.196881092×|+4.399999991ms|
| OFF100 |48.100000009ms|65.799999982ms|1.367983367×|+1.800000012ms|

**Planning is one post-warm diagnostic point, not qualified p95.** No formal pass: formalExecuted false,formalThresholdsEvaluable false,passed false. ON planning point exceeds2× and rendering exceeds+3ms. OFF's observed values are not formal1000 acceptance. No causal speed improvement is inferred from comparisons against previous single diagnostic runs.

Measured candidate ON source58.699999988 + finalize54 =112.699999988ms. OFF source43.099999994 + finalize22.699999988 =65.799999982ms. Full raw unrounded values,all warmups,state/cut results and render timings remain in original pretty `results.json` and compact `results.json.gz` (JSON equality verified).

## Actual workload/ordinary correctness

Four sides each have actual100cuts/100regions/80frames. Candidate ON100staged; OFF0staged. Real candidate ON rendering retains80record+80replay+80observations and render errors0. All source/native34 IDs retained. No recording/direct-native substitution. Measured completed-hit planning records0 as before; original cold setup is still present in raw.

Both candidate cache states have fullReads1/compiles1/fastReads2, fallback/cap0. ON repair memo2723operations/62149logical slots/268219stringchars; OFF0operations. Source input parity,full pipeline,counts,coverage and pinned-font-corpus flags are all true. Font qualification details stay raw, without fabricating absent baseline qualification. This is not broader geometric/visual acceptance.

## Pins/space/lifecycle

`postprocess.py`,summary01 and archive-proof01 independently verify120 input archives against their pinned raw SHA and current bytes; immutable2bb native HTML equals its fixed Git blob.173actual dependency files and86product pins match. `support-proof01.json` verifies all3 support gate/runtime archives and captured preload against live SHA. All input/package/product/gate drift0,errors[],resource violations[],all runner concurrency foreign[]. Gate/runtime are fresh222/current=observed/running/connected and refer to the accepted b355/raw98bf correctness source.

To maintain250MiB reserve,121 identical input/baseline gzip files were replaced with hardlinks to fixed existing canonical archives after size/SHA comparison. Every byte/path is preserved, including original pretty/raw files. Receipt `archive-hardlink-dedup01.json` records each source/path/hash/inode and recovered space; no gzip content was edited and no old evidence path was removed. No new before/after HTML copy was added outside original runner outputs.

Pre-exec wrapper (`bootstrap.py`) saved PID/PGID377346 and actual startTicks/stat before exec, with full stdout/stderr in unique `/tmp/jizura-native-matrix-diagnose01-fz8fsyg_`, copied as process-* here. Actual os.waitpid returned kernel status0/WIFEXITED/exitCode0 and reaped own PID. Immediate afterProcStat null, no timeout/kill. Supervisor elapsed16.8367s is lifecycle duration, not a benchmark result. Runner post phase occurs after awaited browser.close/server.close; final live-job scan empty and1483 existing zombies recorded separately, not touched. Support before/after scan does not mechanically prove absence of every transient process; parent held the full lease.

Manifest/explicit stage list supplement complete original raw. Stopped after scoped evidence commit. No further implementation, measurement or preparation begins without parent instruction. AVOID-008 performance and formal1000 remain unmet/unexecuted respectively.
