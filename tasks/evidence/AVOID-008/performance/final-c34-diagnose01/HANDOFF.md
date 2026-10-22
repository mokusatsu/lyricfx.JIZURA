# One bounded unprofiled combined C34 diagnose100

Parent gate final-c34-diagnose01-parent-gate.json and actual runtime214 raw/wrapped files are copied byte-exact from parent. Fixed product/source/JAEN fd6; runner4946/6cc4 and audit fixture7650 use unchanged original100 corpus/2bb baseline and original3warm+1point,80frames/16warmup schedule. Exactly one --diagnose100 run,2026-10-22T22:52:19.970Z–22:52:36.953Z, exit0. No CDP,1000,formal, automatic rerun or optimization. Git operations were disabled from automatic GC via GIT_CONFIG_COUNT during the run. Parent held other agents idle; all runner concurrency observations have no foreign jobs.

Actual comparisons (planning is ONE post-warm point, NOT formalp95):

| state | baseline planning ms | candidate planning ms | ratio | baseline render p95 ms | candidate render p95 ms | added ms |
|---|---:|---:|---:|---:|---:|---:|
| ON |45.3999999911|126.4999999851|2.7863436126|2.5|7|4.5|
| OFF |230.7000000030|112.2999999970|0.4867793671|14.5|3.9000000060|-10.5999999940|

ON exceeds2× planning and+3ms render reference limits. OFF baseline point and render p95 are substantially larger than earlier runs; they remain original measured values without causal attribution, replacement or repetition. This diagnostic is not a formal pass. passed:false/formalExecuted:false preserved.

ON cold source68ms+finalize6104.200000003ms=6172.200000003ms,622actual planning A.record calls. Its subsequent three finalizations are whole-result hits with0actual planning record; final measured source54.099999994+final72.399999991=126.499999985ms. OFF cold144.399999991ms/0actual planning record; subsequent three whole-result hits/0record, measured source79.900000006+final32.399999991=112.299999997ms. All cold/history/stats retained. Historical candidateBudget is proof history, not newly reconstructed warm work.

Mandatory paths are independently recorded, not inferred: ON100/100actual cuts staged,100regions,budget violations0; actual render record80/replay80;80actual observation entries all measurementSupported and envelopeCovered!=false;34plan IDs/34render IDs; native-font qualification complete with unknown[]; input/project parity true, all4iteration normalized hashes stable on all4sides. OFF100cuts/100regions is intentionally0staged,0C record/replay/observations. CountsValid/candidateFullCoverage/actualPipelineValid/pinnedFontCorpusQualified/inputParity all true; errors0/renderErrors0/inputdrift0. This establishes these100conditions only, not all1000 or allconditions safety.

120actual consumed pins match start/end/live and archived input gzips. All84src/JAEN exact fd6; original runner/B1/corpus preserved and both derived resources pinned. Only consumed support imports expanded from exactGit305; preflight-and-gate.json lists paths/bytes/donors, gate/runtime identities and reserve. All173actual Playwright1.62.1/core package files match prior correctness preflight pins. No install/full evidence expansion. Actual OS/browser/node/resource snapshots remain in raw and summary; runtime214 retains its explicit control-plane qualification.

Driver finally closed owned browser and server, session exited0; cleanup process scan finds no live Chromium/encoder, old PID1zombies excluded. No main/index/product writes. End reserve exceeds250MiB. Original pretty raw681881bytes SHA9acba5ce4ff5b8175c36f5f043a34761b9e77709385bac3815888cf603674df2 is losslessly preserved as results.raw.json.gz with identity receipt; only own duplicate pretty raw removed. Compact results.json.gz is separate. Old FAILs remain untouched. Stop for parent review; no next measurement or optimization authorized.
