# Owner-internal cooperative handoff 86c

Source-only proposal; no product/UI install, actual Canvas or genuine compiler qualification. Existing synchronous prepare remains same-context/same-renderer. Generator must load before this generated owner; it is captured once and checked every resume and consume. No external model admission API exists. The intended adapter must exclusively own the exact supplied canonical ctx and renderer. This prototype does not establish that private wiring by exposing a factory alone.

beginPreparation86c clones and freezes dense input privately, tracks exact whole input (including circle) during preparation, maintains dependency/font/source/generation checks and phase context readback. step retains outer Canvas save/state carry through the original generator. The first step is guarded against post-begin ctx changes. finish consumes a completed job once and returns an owner handle only. Existing withPreparedModel/prepare validate that exact context and renderer. Cancel/error discards partial input/model and returns the iterator; after consume, existing owner validation guards later reads. A failed old job cannot remove another job reservation.

Job key/context/dependency/progress metadata remain reserved in the existing 8 MiB owner account, including the completed-unconsumed interval. Model remains pending-accounted until resident-accounted. An over-budget request is rejected, not accepted; peak telemetry may include the rejected request (the mock 9 MB negative does so). Surface lifetime and stock source guards remain the caller's private canonical adapter contract; no new canvas is allocated or exposed by the job. No surface/RSS claim is made by serialized accounting.

Commands (repo root is explicit; no external source dependency):

```
python generate.py /path/to/repo /tmp/model-owner86.js
cmp /tmp/model-owner86.js model-owner86.js
node handoff-test.cjs /path/to/repo/src/11zz05_bulbs_renderer_time80.js
```

30 mock checks pass: completed opaque handoff and synchronous cache hit; unfinished/cancelled rejection; input/circle/revision/generation/source/context changes; first-step ctx mutation and permanent old-job rejection after restore; memory rejection and original exception preservation; later new job cannot lose its reservation to old cancellation. Mock renderer/compiler/DOM checks do not establish source or frame authority. Initial test invocation had an incorrect 11zz06 filename and exited ENOENT; corrected tracked 11zz05 path passed.

Remaining: genuine adapter-private begin/consume wiring; real J.plan/finalizer/cache and Canvas tests after review; combined finalizer reservations; cancellation/context cleanup under actual source; last-step duration/heartbeat. Existing ~9.44 s final-step observation and ~18.45 s synchronous current preparation remain unresolved performance constraints. This proposal is not ordinary UI completion.
