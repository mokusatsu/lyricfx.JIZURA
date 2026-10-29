# Burst current-input compiler83q — source only

This unregistered low-level generator calls the fresh-input 83n sampler for every active own clock. It returns one canonical immutable row table, one clock table and a frame-to-row index. Each yield exposes only numeric progress and a pass name. It imports no observation raw and issues no runtime certificate.

Run from any directory:

```sh
python dev/avoidance/burst83/compiler83q/run-tests.py /path/to/repository
```

The 751 checks use synthetic clock/sample data and the tracked Float64 codec. They verify 250 states / 727 active own rows, immutable output/index coverage, fixed scalar-index encoded size, cancellation, changed input, early return, quality rejection and the 8 MiB serialized cap. The sampler is mocked: these checks establish no Canvas, glyph transform, geometry or owner authority. Real 83n Canvas evidence remains the separate three-time / nine-own comparison.

The compiler currently accepts a caller-owned plan/context and a synchronous validation callback. It checks the full plan key on resume; it does not adopt externally frozen objects as trusted owner data. A genuine private context/owner must invoke it internally and retain dependency and generation checks. It is not installed in the planner, finalizer, cache, renderer or UI.

Accounting includes caller reservation, plan/key/clock data, canonical append-only row bytes and array separators, full fixed-size frame index, current environment/sample plus compact entry, and final metadata. Immutable entries are encoded once when appended; partial arrays are discarded on cancellation or failure. Native Canvas surfaces, encoder buffers and JS heap are distinct from this serialized budget. No practical preparation or continuous-time claim is made. A real private-context whole-clock comparison and preparation/heartbeat measurement are next.

The initial pure checkpoint deliberately does not test scalar provenance: the mocked input has no scalar values. The real sampler/compiler integration must compare that field against current-input and actual-paint oracles before any runtime qualification.
