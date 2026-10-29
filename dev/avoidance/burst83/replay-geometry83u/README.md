# Burst83u retained local geometry — source only

This unit retains shape local boxes/readback padding and native glyph prefix transforms so another device delta can be evaluated using actual Canvas operations. It adds no paint or text measurement to replay. It does not issue a candidate, certificate, owner handle or renderer lease. Arbitrary delta input to the numeric helper is not evidence of safety.

The generated sampler differs from83n only by geometry metadata, an exact shape-matrix/root assertion and its namespace/kind. The compiler retains those metadata and uses its own namespace/kind. Existing source arithmetic, sampling and coverage requirements remain. Shape support matrices must match the own root bit for bit. Glyph prefixes retain item translate/rotation and each source glyph translate; replay restores Canvas state, checks canonical font readback and reconstructs glyph bounds from the stored measured ink with unchanged 1fontpx/2devicepx guards.

```sh
python dev/avoidance/burst83/replay-geometry83u/prepare-source.py /path/to/repository
python dev/avoidance/burst83/replay-geometry83u/run-tests.py /path/to/repository
```

The 85 checks use actual source helpers and synthetic measurement/Canvas operations. Replay at zero/positive/negative deltas matches fresh sampler bounds and glyph matrices, with no additional measure/paint calls. Root/zero-base/missing geometry/missing glyph/budget rejection restores state. Compiler control checks remain751 using synthetic clock/sample data. These are not actual Canvas or geometric safety qualifications.

The helper counts caller reservation, retained entry, delta, output support/matrix arrays, temporary glyph lookup keys/entries, current affine work and return copies against8MiB serialized accounting. The appended geometry must also fit in a fresh full model; that actual budget is untested here. Native Canvas storage and heap are distinct.

Next: actual current-input geometry replay on the existing three-time oracle, then delta0 whole-clock model, input-derived finite candidates, all-own actual-CTM reevaluation and strict stage/circle checks before any private proof. A proof must bind the genuine owner, unchanged input/font/generation and plan-derived region. Clock preimages, pre-start/tail behavior, bitmap-before-paint refusal and official plan/cache/UI remain unqualified. Existing8-second preparation is not practical UI acceptance.
