# AVOID-008 lazy-edge original100 diagnostic — performance still unmet

Exactly ONE authorized unprofiled original100 diagnostic ran. Product source3b0c995a2c912cf3edf6583f372c215c310e11f0; actual execution HEAD0efd254de624be2f49f50e4052fabc3c9dd6ae86 (helper/evidence-only descendants). No product/helper/fixture change, retry, CDP/profile,1000, image/public check or main write.

## Observed metrics (not qualified formal planning p95)

| State | Baseline plan ms | Candidate plan ms | Factor | Additional render p95 ms |
|---|---:|---:|---:|---:|
|ON|52.2|113.9|2.18199|5.20000|
|OFF|50.1|69.8|1.39321|1.10000|

ON remains above2x planning and+3ms render targets. The one measured candidate ON point is51.5ms source +62.4ms finalization; OFF47.1+22.7ms. Existing8ff source152.2/48 and+5.1ms and prior7bd source108/72.3 and+5.5ms remain distinct historical results; no statistical/causal improvement claim is made from one sample. The runner intentionally records formalExecuted=false and passed=false for diagnosis. No formal p95/1000 pass is inferred.

## Workload and guards

Unchanged runner6cc4efdf4884dd84f80c3454218108f73bf702a40487a0e62400948fa48d6756, fixture7650c0e2015ef6393334c7d05e121b5ee3de7202790e4f41bbfe01b76445a471, corpus4add5fb9e1e7616b02a45aa6b72c3eb76f1acbbfe42a09e42ec3976dde204afc. Same original2bb native baseline,100ON/OFF four sides,3warm+1planning point,80render frames/16warm,3200x1080 stage/1600x540 canvas/renderScale.5,1280x720 DPR1,seed704 and300s bound. External routes were aborted by the original runner, local assets/fonts served on loopback; proxy/CA/TLS were preserved.

All four sides have100cuts/100regions/all34 native/render IDs. Candidate ON has100staged and ACTUAL record80/replay80/observations80; no record/replay output was substituted. Counts, full C coverage, actual pipeline, input/project parity and pinned font qualification all true; errors/renderErrors/input drift/resource violations all empty. Baseline and OFF have their original native/no-C pipeline counts, not fabricated80 C calls. Original full states/cuts/profiles/inputs/font audits remain in complete raw and original reports, not replaced by summary hashes.

The fresh parent gate and runtime02 raw/pretty were consumed by unchanged preload53ad80f91ac5b3a74a6f6e7d617c3006a407aec3ce07840af5427f6e39e20db4. Actual environment revision215 was parent-qualified. The accepted lazy-browser02 gate's173package/86product map was checked. Start/end package/product/gate inputs are unchanged. The120 runner input gzip snapshots (including84source and JAEN) were independently decompressed and matched both recorded SHA and current file bytes; baseline gzip matched the runner's immutable2bb SHA. archive-check.json lists every gzip/raw identity. The three actual support gate/runtime inputs and preload bytes are also losslessly fixed.

## Actual terminal/cleanup evidence

Command was launched with stdout and stderr independently redirected in unique /tmp/jizura-lazy-diagnose01-3s1vzlsk. Before exec, childPID369130/startTicks9818602/PGID369130 were read from /proc/self/stat and saved. The bootstrap then exec'd the EXACT authorized Node command with JIZURA_BROWSER=/usr/bin/chromium. SamePID is recorded by actual support receipt. Raw pre-exec stat names python3 because it is BEFORE exec; it is not mislabeled a later Node stat.

The direct parent os.waitpid returned waitedPID369130/kernelWaitStatus0, WIFEXITED=true/actual child exitCode0, after16.8145s. This is the actual Node child's wait status, not merely the outer tool/Python exit code. After this parent waitpid reaped it, /proc/369130 was absent. No zombie was guessed to have vanished and no historical PID's exit status was substituted.

The original runner finally awaits browser.close AND server.close callback BEFORE writing its post concurrency record. The actual post record at2026-10-23T01:29:50.364Z has foreign[] and end is recorded; actual support exit-after has live jobs[]. Source path plus reached post record establishes completed close callbacks, not just a PID absence inference. Support zombieCount1475 is kept separate from live jobs; PID1 zombies were not touched or treated as live0/cleanup targets.

The parent held a full-interval exclusive lease. The original support's corrected profile token/pre/post node+MainThread checks and original runner during scan are retained. This still is NOT mechanical detection of every transient during-run MainThread/profile overlap; that previously disclosed limit remains in the gate and is not silently upgraded.

## Artifacts / postprocessing

Original results.json and compact results.json.gz are retained unchanged. results.raw.json.gz losslessly fixes the exact original pretty raw bytes (SHA734d42c172b955518ca618e831829969884ddb583019abff47b50b910a1db0ba). summary.json is derivative. stdout.log.gz/stderr.log.gz preserve BOTH complete streams, including empty stderr. pre-exec.json and wait-result.json preserve direct process evidence. support-receipt.json records package/product/gate hashes, reserve, live cleanup and zombie counts.

A summary-only first attempt treated baseline fontQualification=null as a dictionary and raised AttributeError. postprocess-failure01.json preserves it; the summary correction retains baseline null and changes no raw result, target, input or expectation. No performance command was rerun.

Disk reserve250MiB remained satisfied. Files here are the fresh diagnostic output and its explicit audit/summary; previous FAILs and parent live gate/runtime files are not overwritten. No new profile or expanded test run is authorized by this result. Parent performance review is next.
