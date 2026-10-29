# Contour sampled-clock union 84l

Unregistered source-only compiler. It samples 250 clock states and their 727 active selected passes using each state.firstTime as actual realTime. This is not j/60 rendering, continuous-time safety, an owner certificate, or UI qualification. Actual fixture states 245..249 have no active pass; the pure mock has a different empty-state distribution.

Run from any working directory:

```sh
python dev/avoidance/contour84/clock84l/run-tests.py /path/to/repository
```

The runner verifies the manifest and uses tracked dependencies. The pure test has synthetic selector/clock/Canvas samplers and real codec/geometry: 745 checks. It verifies streaming unions, immutable copied input, stale/cancel paths, dense descriptors, budget rejection, and diagnostic-copy independence. It does not establish actual Canvas fidelity.

The compiler makes a private deep dense data copy, with null-prototype records and frozen arrays. The caller must supply a current-input/generation/dependency validator and an exclusively owned context. Validation runs around copying, each own, and publication. A public result or callback is not authority. Fixed camera/profile constraints remain typed unsupported outside scope.

The serialized 8MiB limit includes caller reservation, original/copy/input key/clock, current samples, streaming unions, proposals and publication copies. Native backing stores and process heap are separate. Normal mode retains no detailed catalog. Diagnostic detail copies are counted while produced; a caller retaining batches must separately reserve their simultaneous live storage. Cancellation/failure discards partial unions; the context/surface lifecycle belongs to the caller.
