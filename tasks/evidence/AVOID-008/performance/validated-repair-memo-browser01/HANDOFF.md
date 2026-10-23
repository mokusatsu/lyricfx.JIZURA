# Validated repair memo browser01 — ONE normal40 complete

Candidate product remains fixed ccfe825 (source commit3166516); prepared driver fixed a00fa2a, SHA `5f8fb3506cf73d2a25a754f420cc624dfe082bc542098053fbe7331d83f0732a`. Product/main/source/JAEN were not modified. No performance result is claimed. Parent review required before any next step.

Executed once, with the parent-exclusive browser slot and loopback network permission:

```
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-c-validated-repair-memo-browser.cjs tasks/evidence/AVOID-008/performance/validated-repair-memo-browser01
```

`bootstrap.py` used fork → setsid → saved pre-exec PID/PGID/startTicks/stat → redirected complete stdout/stderr into unique `/tmp/jizura-repair-browser01-jvzztez5` files → exec Node. Supervisor obtained actual os.waitpid result and exit status; copies of all logs/identities are in `process-*`. No retry, optional mode, extra helper mutation, budget/schema, security audit, timing, CDP, image or public job ran.

## Actual results

- Runner exit0, kernel wait status0, PID373267 reaped by direct waitpid; after-wait `/proc` absent. Elapsed supervisor wall time12.815s is lifecycle evidence, not benchmark data.
- 40 original normal cold/warm pairs; additional80 completed reads. Each added pair has fullReads1/compiles1 and fastReads1 then2; total extra planning A.record calls0.
- Both fast reads compare complete JSON, alias graph, all ordered own descriptors, full frozen reachability, no shared object references with any earlier output, and source-plan immutability.
- 18 cold +18 warm +18 fast native Canvas frames =54. Full digest/observation/error arrays agree; native errors0. Each side has15 actual observation records (not inferred54 observations).
- errors[], changedInputs[], changedPackageInputs[], after live jobs[]. Awaited browser.close and server.close recorded. Separate existing zombie count1477 retained, not treated as live/cleaned.
- Gate consumed spec222/current observations, full86 product pins and actual173 localeCompare DFS package-file pins. All111 archived/referenced input entries were rehashed against live bytes;104 reference identical fixed prior gz archives,7 new archives. No duplicate pretty raw or schema HTML stored.

Full raw is `results.json.gz`; `summary01.json` is derived, not a replacement. Final fast full plan/alias graph is retained per row, with both read counters and comparison results; all original rows remain present.

## Comparison to old lazy-browser02

The initial offline strict comparison of every old40-row field failed and is preserved in `postprocess-failure01.json` / `postprocess01.cjs`. `old-field-differences01.json` retains all51 differing values. **Every difference is only edgeStats.generation** at afterWarm/afterColdRender/afterWarmRender: current = old + 2 × zero-based row index. Each prior pair now performs two extra reads, each causing the unchanged edgeRegisterFinal generation increment. Row0 has no difference. No actual values were removed or rewritten.

`postprocess02.cjs` independently checks every one of these paths and exact increments, then compares every other old field with util.isDeepStrictEqual. All other old fields match exactly. This is an explained internal generation progression caused by added executions; it is not a geometry/value/clock tolerance or relaxed product expectation. Raw is untouched, no browser recapture occurred. New memo counters and `row.fast` remain additive fields.

## Preservation and remaining work

All original parent input/gate/runtime files and old raw results remain untouched. Current86 product/package/input hashes match; archive paths and raw hashes are fixed in `archive-proof01.json`, manifest and report. Generic decoder/other83source/build reversal proofs remain in the accepted source checkpoint; this run did not rebuild or modify those inputs.

Previous28 helper controls and large budget/schema PASS history remain separate and were **not rerun** here. No claim of formal1000, performance pass, global visual review or AVOID-008 completion. Stopped after explicit owned-evidence commit; no next support preparation or timing starts without parent authorization.
