# Focused core harness revision02: job-owned cleanup

This revision supersedes README.md's process-group-kill description. Scope is unchanged: ten original suites plus one selector-only independent EN derivative, two variants, 22 planned jobs. Candidate remains absent; no browser/product/core suite has run. The separately authorized synthetic self-test is not a core or browser PASS.

## Spawn ownership and cleanup

spawn-registry.cjs loads before Playwright. It intercepts ChildProcess.prototype.spawn and records only real children spawned by this job's Node process, with the unique per-job token and parent/child PID, PGID, session and Linux start-tick identities. It does not log environment contents or change app/test data.

process_cleanup.py creates a fresh token and captures pre-existing process identities. A bounded monitor tracks direct spawn records, live-identity descendant relationships, and new detached/reparented children with the exact inherited token. It cannot adopt an identity present before the job. Python enables process-local subreaper mode so orphaned owned descendants can be reaped. No foreign process group is signalled or indiscriminately waited on.

Each adopted identity obtains a pidfd and is rechecked after opening it. Signals use pidfd_send_signal, never killpg or a PID-only kill. Adopted descendants are reaped with waitid(P_PIDFD); Popen retains its root wait status. Finally runs on normal exit, timeout, launch/run exceptions, and cleans live owned survivors with bounded TERM→KILL phases. Receipts include ownership proof, PGID/start identity, signals, adopted-child reaping, remaining identities and errors. Incomplete cleanup turns a successful job into a runner failure. Lack of pidfd/subreaper support is a blocker, never an unsafe fallback.

stdout goes directly to the job log file; a detached process cannot keep a communicate pipe open indefinitely. The 240-second core timeout remains unchanged. Core run.py delegates every launched process to the same execute_process helper used by the synthetic proof; a separate server-only exception launches no child and is recorded as an environment failure.

## Authorized synthetic proof, not product execution

cleanup-selftest01/result.json records three actual harness-only cases: timeout (exit124), injected after-launch exception (exit97), and normal exit (exit0). Each creates a detached Node child and detached grandchild, with distinct groups from the root. All three owned processes are tracked and reaped; remainingOwnedIdentities is empty in every cleanup receipt. A separately launched unrelated sentinel retains its original PID/start identity and remains alive after all three job cleanups, then the self-test removes its own sentinel using its original pidfd.

No browser, app, production assertion, build or Git command was executed. The self-test ran only after the parent's explicit timed-diagnostic STOP authorization. All synthetic processes are closed. Original suites/selector/body proof, baseline compiled/source bytes, product source and pyc remain unchanged.

plan02.json and preparation-manifest02.json are the current frozen preparation. Original plan.json/preparation-manifest.json remain historical preparation01, whose run/preload hashes were superseded by this required harness fix. Candidate sealing and all22 core jobs still require separate parent gates.
