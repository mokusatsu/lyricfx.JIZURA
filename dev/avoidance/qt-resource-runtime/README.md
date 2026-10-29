# Managed offline Qt probe lifecycle

This is the maintained entry point for **future** generated/frozen Qt probe directories. Existing evidence, `run-probe.py`, service bytes, source pins, media and old results are untouched. The latest old host (`bulbs-design-native-source86bv/run-probe.py`) waited for Node but then terminated Qt without normally closing its three windows; orphaned Qt children could reach PID1. This runner first asks the service to close only its own tracked windows using `window.destroy()`, then waits and reaps its own children.

Use this entry point instead of running a copied historical `run-probe.py`:

```sh
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py \
  /workspace/jizura-logic-evidence-20261027/NEW-FROZEN-SOURCE \
  /workspace/jizura-logic-evidence-20261027/NEW-OUTPUT
```

The source must contain the existing `probe.cjs` and `qt-service-visible.py`. Output and its sibling `NEW-OUTPUT-runtime` must be fresh. The original service runs with its original protected Qt/browser flags and fixed fonts; the wrapper tracks its windows (maximum three) and listens for `shutdown` or stdin EOF. No sandbox flag, global OS setting, existing process, or existing page is modified. The historical host file is not executed. Pin the three maintained Python files in new trial inputs as well as the source service/probe. The runner's sidecar `host.json` includes their exact byte/hash list, and its `startup.json`, `pages.json`, `service.log` are new runtime diagnostics. Old checkers expecting historical source-directory host paths must explicitly consume this new sidecar; no old-runtime acceptance is inherited.

One cross-process `flock` at `/tmp/jizura-managed-qt-test.lock` covers startup through cleanup, so managed tests cannot overlap. An occupied local debugging port also refuses startup, covering an older service that does not use this lock. The source/probe still expects its original three pages. No additional pages can be created through pywebview's normal `create_window` API. Tests must reuse/close their existing pages instead of extending the count.

Before creating the runtime sidecar or a child, statvfs must show at least 1 GiB spare plus the declared expected output (default 256 MiB). The CLI refuses a spare floor below 1 GiB. Capacity is checked again before generation and while the owned Node probe runs; crossing the spare floor stops this run and enters cleanup. Original per-record/total evidence caps remain each probe's responsibility. This gate does not delete anything or claim to reserve filesystem space. Use `--expected-bytes` to state a tighter reviewed output estimate, not to bypass the spare floor.

The standalone supervisor sets Linux `PR_SET_CHILD_SUBREAPER` **only on itself** before spawning. Each initial child enters a new session. The supervisor tracks its Popen handles before fallible identity checks, then start-time identities and the actual OS parent chain, including orphan descendants adopted directly by this dedicated supervisor. A descendant that creates a new session still needs this ownership ancestry; its changed session is not permission to signal another process. PID1 and unrelated processes are excluded. A registration failure cleans up the Popen direct child but fails resource acceptance. If waitpid still reports children that cannot be observed, resource acceptance also fails. Normal page shutdown gets five seconds, then remaining owned children receive TERM with three seconds and KILL with three seconds. Direct and adopted descendants are waited/reaped. A denied signal is recorded, not retried with a stronger signal. Signal/timeout/startup/probe failure all enter the same bounded cleanup. An incomplete cleanup, missing normal page-close confirmation or open debugging port makes the resource result fail; a numeric probe's own acceptance is separate.

Existing zombies already adopted by PID1 cannot be reaped by this new process. They need their actual parent/runtime to call wait; killing zombies cannot release them. Abrupt termination of the whole supervisor/environment can still interrupt cleanup. These are limitations requiring environment-side process supervision; this code is not a claim that every host disconnection is fixed.

Lightweight checks, without Qt/browser/media:

```sh
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/test_runtime.py -v
```

Six tests cover six real process cases (normal, startup exit7, orphan grandchild, session-escaping orphan, timeout-like termination and exception), adopted-child reap, a separate external child left alive, failed identity registration cleanup, lock conflict/release, pre-generation low-space refusal, and mocked pywebview normal destroy for shutdown/EOF. Actual supervisor flow additionally runs normal, service failure, node failure and timeout cases with tiny Python payloads. The first service-fixture run caught a concurrent diagnostic-file replace race; a service-local report lock and bounded control-thread join corrected it. No actual Qt service was launched in this verification.

The parent-reviewed real Qt lifecycle probe uses `lifecycle-source/` and a fresh output, `--expected-bytes 1048576 --timeout 30`. It opens exactly three 160×90 plain pages and reads only local CDP page metadata. There is no Canvas, font, screenshot, video, public URL or product comparison. The runner must confirm all three normal close events, service return, owned-process reap and closed local port. The fixture's resource success is never product/render acceptance.

That reviewed one-run check completed at `/workspace/jizura-logic-evidence-20261027/qt-lifecycle-only-20261029-01`. Runtime report: three normal close events, service return, service/Node exit0, three waitpid-reaped children (service and two adopted Qt descendants) exit0, no forced signals/ownership failures/remaining children and closed local port. Node had already been reaped by its normal Popen poll. Initial free space was2,105,081,856B with the unchanged1GiB floor plus1MiB expected output. Runtime was Qt6.11.0/WebEngine6.11.2/Chromium140. The five executed source pins remain unchanged. `python dev/avoidance/qt-resource-runtime/check_lifecycle.py OUTPUT` verifies saved lifecycle/source hash data without starting processes. This confirms the local plain-page lifecycle once; it does not promise cleanup after supervisor/host death, existing PID1 zombies, future renderer crashes or product rendering.
