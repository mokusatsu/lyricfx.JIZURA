# Final04 verification retry helper: preserved code and mock evidence

These are archival copies for parent code/result review. **Do not execute the
copies here:** core/preload/tests use `__dirname` to locate the repository and
scratch siblings. Reproduce from the original `scratch/` paths shown below,
with the same reviewed hashes and existing runtime/dependencies. The originals
and the running public attempt03 were not changed while assembling this evidence.

The helper changes verification transport only. Original validator/browser
sources are copied for pin review and remain unchanged in their real locations.
Exact callback pin: `54c9d70f601dafa30e6d9de1e170bd8e3faed61c268a739a591df4690071805c`.
It wraps only that callback and exact allowed URLs:939raw manifest assets plus
174fixed-index case links (1113union). 503 alone may retry at most3attempts with
1/2second backoff, preserving the original function/URL and returned result/error
identity. Other HTTP/network/TLS/hash failures are not converted to success.
Every matched attempt is JSONL logged; runtime receipts are not validator passes.
See `review.md` and both actual preload receipts for the full policy and URL lists.

## Reproduction contexts and commands

Requested implementation assignment: gpt-6.1-sol / medium. Child execution agent:
`/root/pack006_schema4`; the parent independently reran the same21case mock suite.
No browser or HTTP requests run in these Node mock tests.

Working directory: `/workspace/lyricfx.JIZURA`. Preserve inherited Node24,
`NODE_PATH`, proxy/CA/TLS and installed locked dependencies. Child PASS and parent
independent PASS used the supported `sandbox_permissions: require_escalated`
execution context. The mock's own Node subprocesses set only fresh scratch retry
log paths. Use a fresh outer stdout log to preserve earlier evidence:

```sh
node scratch/avoid006-final04-retry-mock-test.cjs > scratch/avoid006-final04-retry-mock-run-NEW.log 2>&1
```

The parent first ran this same code under the normal sandbox. It waited at the
Python standard-library HTML parser subprocess with empty redirected output;
the parent terminated it and reported exit143. That is an interrupted run, not
a failed functional assertion or a PASS. `parent-default-sandbox.log` is the
unaltered zero-byte redirected file; `parent-context-attempt.json` attributes the
wait/termination observation to the parent. Supported execution then passed21.

A separate identical4byte stdin probe, command and exact tool-result context in
`context-stdin-probe.json`, reproduced normal-sandbox `spawnSync python ETIMEDOUT`
with a3second child timeout versus immediate supported stdout `4`. This probe
was not redirected originally; its JSON is an explicitly labelled transcription
of tool results. It identifies an execution-context dependency, not the internal
sandbox cause, a Python defect, or network reachability. No `/proc` restriction
was bypassed and no source was changed to work around the sandbox.

## Evidence scope

Child and parent results independently record21PASS, raw939/exact additional174,
original-source callback extraction/in-memory invocation, original result/error
identity, bounded attempts/backoff, failure passthrough and immutable log guards.
`inventory.json` lists every copied/generated file with origin, bytes and SHA256.

At preservation time public attempt03 was still in progress under parent CPU
ownership:939raw matches and native200/348 had been reported, but no final public
PASS was yet confirmed. **This directory does not establish publication success,
completion of348native/UI rerenders or completion of the live playback/startup
checks.** The final unchanged-validator result must be recorded separately by the
parent. This task ran no new Chrome, network test, commit or push.
