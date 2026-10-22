# AVOID-008 focused final core: preparation only

Status: baseline/harness prepared; candidate unknown and not captured; zero browser/test/build/Git/index jobs executed. This directory does not overwrite regression01. It must remain idle until the parent explicitly authorizes candidate sealing and later test execution. No product files, original assertions, expected values, or pyc were changed.

## Frozen scope

Ten original suites, same bytes on both sides: lyric_test.js; drawing_frames_test.cjs; palette_stability_test.cjs; cut_detail_audit_test.cjs; effect_copy_fidelity_test.cjs; lyric_area_effects_test.cjs; lyric_compositing_test.cjs; lyric_placement_stability_test.cjs; lyric_avoid_center_test.cjs; lyric_group_avoidance_test.cjs. No unconditional media/MCP/export expansion.

One additional independent EN derivative changes only `for(const locale of ['', 'en/'])` to `for(const locale of ['en/'])` in lyric_area_effects. Exact source hash, one-line diff and reverse-restoration proof are in language-selection-proof.json and language-selection-only.diff. All assertion/fixture bytes are restored exactly by reversing that selector. Original JA failure is never skipped. Two variants × eleven entry points = 22 planned jobs, sequential, 240 seconds/job. Every nonzero exit remains FAIL; the runner continues with other jobs.

## Baseline identity

Baseline compiled JA/EN are copied from the existing immutable regression01 baseline, matching its saved manifest for 2bb3f864b5d40361961d8ad2aabeec24bfb5d1cb. No Git command was used. The two source files actually loaded by lyric_test, 01_util.js and 08_planner.js, match that archived source manifest and each appears byte-exactly once in the baseline JA compiled HTML. Thus source-reading parser assertions do not accidentally use current source as baseline. This baseline source claim covers those two files only, not an invented full 2bb source export.

Common preparation-time tests/helpers/assets are copied unchanged. Candidate source/compiled bytes remain absent. seal_candidate.py will copy an explicitly parent-accepted source root later without building, preserve all current JS files plus JA/EN, verify the directly read two source files are embedded in JA, and copy exactly the same frozen tests. All input hashes are captured before future browser startup.

## Environment and isolation

Existing Playwright 1.62.1 packages are reused through exactly two package-directory symlinks. Their 62+111 actual file hashes match the prior immutable regression01 installation. No node_modules traversal or installation occurs. Environment-pins records the realpaths and all file hashes; execution fails on drift. Existing dependency location is an explicit environmental dependency, not a newly archived package copy. Missing dependencies are a blocker, never silently replaced.

Installed font/fontconfig dependencies are hash-pinned, not copied or recompressed. No forced font substitutions are introduced. Optional remote fonts/models are aborted, so these tests do not establish production font appearance/load success. No TLS, CA or proxy setting is changed.

The preload forces the same installed Chromium executable while retaining suite options. It blocks external requests on page routes and context defaults, permits loopback, and permits `http://test/` only when fulfilled by the suite in memory (continue/fallback is blocked). A snapshot-only loopback8765 server supports suites that perform real local navigation. Actual compiled/source reads, Node/browser versions and redirected screenshot paths are logged per job. Screenshots can only write beneath the new job directory; no images are viewed. No public URL checks, default public smoke invocations, or source-mutating screenshot paths are used.

The runner kills a timed-out job's process group, preserves logs/exit/timeouts and writes results after every job. Input integrity failure is distinct from a functional known failure. Results remain pending review if failure signatures differ; no known-failure exception converts an exit1 into PASS.

## Known failures and coverage limits

regression01 completed all five original suites at runner level. lyric_area_effects itself stopped in JA at line35 (withoutMedia actual0/expected1), leaving subsequent assertions and EN unexecuted. The new EN-only derivative attempts EN independently but still stops at a real failing assertion. Downstream coverage is never inferred from launching a suite. Actual read logs show which edition was loaded.

Historical lyric_compositing RGB failure is `30,105,214 vs 60,103,137`. It is known only if the actual frozen baseline and candidate produce the matching signature. Any different failure remains unresolved; raw logs and exit codes are authoritative.

project_file_test/save is outside this focused10. Its initial cut-count expected0/actual1 failure occurs before the save body and remains AVOID-013, not AVOID-012 and not a save success. No expectation is relaxed.

## Later gated commands (not run)

From this directory, only after separate explicit parent acceptance:

```
PYTHONDONTWRITEBYTECODE=1 python3 seal_candidate.py --accepted-source-root <accepted-root> --parent-source-identity <accepted-identity> --parent-gate-reference <receipt>
PYTHONDONTWRITEBYTECODE=1 python3 run.py --execute-parent-gate <explicit-execution-receipt> --candidate-manifest-sha256 <actual-sealed-manifest-sha>
```

No command in preparation starts a browser or tests. run.py requires an absent-until-gated candidate-manifest and exact SHA, and refuses an existing runs01 directory.

## Preparation failure retained

The first dependency copy followed an old node_modules→`.` self-link and hit ENOSPC. Only the newly created failed-copy subtree was immediately removed. preparation-copy-failure.json records the bounded error and correction, all173 original dependency hashes,12 unchanged source tests/helpers,86 unchanged accepted main product hashes and unchanged pyc. Explicit two-package reuse replaced the copy. More than250MiB reserve remained (about505MiB at correction); no historical source/dependency path was deleted or modified.
