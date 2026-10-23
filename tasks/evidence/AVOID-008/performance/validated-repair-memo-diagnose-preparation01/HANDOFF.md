# Validated repair memo diagnose100 preparation — NOT EXECUTED

New evidence preload: `dev/avoidance/layouts-c-validated-repair-memo-perf-gate-support.cjs`, SHA-256 `3e87727f21ad951cf996bb2b2e077d08664e3a2d1136e4807d5d9d0cd47e8384`.

Derived from the accepted `layouts-c-immutable-edge-lazy-perf-gate-support.cjs` by four literal path/source substitutions plus an explicit spec222 and JA9579 assertion. Exact transformation list and lossless patch are stored alongside this report; reverse transformation reproduces every original preload byte. Only `node --check` ran successfully. No browser, correctness suite, timing, profile/CDP, security audit, image or public check ran. Main/docs/product/source/JAEN are unchanged.

## Fixed workload and inputs

The original runner, fixture and corpus remain byte unchanged:

- runner `dev/avoidance/layouts-c-perf-shadow-native.cjs`: `6cc4efdf4884dd84f80c3454218108f73bf702a40487a0e62400948fa48d6756`;
- fixture `dev/avoidance/layouts-c-perf-shadow-native-fixture.js`: `7650c0e2015ef6393334c7d05e121b5ee3de7202790e4f41bbfe01b76445a471`;
- corpus `dev/avoidance/layouts-c-perf-normalized-corpus.json`: `4add5fb9e1e7616b02a45aa6b72c3eb76f1acbbfe42a09e42ec3976dde204afc`.

Baseline `2bb3f864b5d40361961d8ad2aabeec24bfb5d1cb`; candidate `ccfe825b2d9df2f507cf55978be47f5183c9c0c9`, JA `957953970183081b330f715015fca0378a2a97edeab820d299487968d8733a8a`. All86 product bytes were checked against fixed candidate Git blobs. Input hashes, runtime, accepted browser raw and its parent gate hashes are in `input-pins.json` (references only; no HTML/raw duplication).

100 ON/OFF input workloads and four sides, three warmups plus one planning point, original80 render frames/16 warm frames, actual record/replay/observation pipeline and all timed bodies remain entirely in the unchanged runner/fixture. The 2× planning and +3ms rendering thresholds, original failures,300s bound and250MiB reserve remain unchanged. No1000 waiver or replacement workload is introduced.

## Parent gate required before execution

This preload requires newly parent-authored:

- `performance/validated-repair-memo-diagnose01-parent-gate.json`;
- existing fresh `performance/validated-repair-memo-runtime01.json` and `-raw.json`, exact spec222/current/observed-running/connected;
- accepted `performance/validated-repair-memo-browser01-parent-gate.json`, containing86 product and173 actual package pins.

The gate must authorize `--diagnose100` only, formal1000 false, candidate ccfe/JA9579 and baseline2bb above, with the unchanged runner/fixture/corpus hashes. The preload requires output `tasks/evidence/AVOID-008/performance/validated-repair-memo-diagnose01`. Parent creates/reviews gate and exclusive lease separately. Preparing this file does not authorize or execute that command.

Existing package/product hash validation, MainThread-aware before/after alone scan including profile token, disk reserve monitor and support receipt are unchanged. These are not continuous mechanical detection of every transient MainThread/profile process during the timed body; the parent must retain an explicit full-run exclusive lease. Spec222 differs from earlier215; no cross-environment speed claim is made. A later accepted run compares its own original baseline and candidate sides.

Proxy/CA/TLS and external-route abort behavior stays in the unchanged launcher/runner. The future run must preserve the same localhost permission and full pre-exec stdout/stderr/PID/waitpid logging; no new in-run monitor was added. Exit handler will preserve the new gate/runtime bytes and exact preload in support gzip/receipt as before.

Stopped at preparation checkpoint for parent review. No execution or subsequent work is authorized by this report.
