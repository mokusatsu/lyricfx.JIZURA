# Burst83x compact frame model — source only

Compiler83x only accepts positive-zero device deltas. It retains every local shape box/pad, glyph measured ink/font/prefix transform/translate, clock/quality and source root; per-support screen bounds, previous glyph matrices and duplicate shifted root are omitted from resident rows. Source support union is accumulated using exact coordinate min/max, with fixed-size live union/key bookkeeping counted. No input text, seed or circle is fixed by the compiler.

Before appending each own row, it invokes the actual-prefix replay helper at zero and checks every removed bound coordinate/matrix component with Object.is against the fresh sampler output. Replay and temporary glyph-reference work are conservatively reserved along with the old sample, new compact row, existing resident data and caller bytes. Failure discards partial arrays. This extra replay can increase preparation time and must be measured; it is not declared a performance improvement.

```sh
python dev/avoidance/burst83/compact-frame83x/run-tests.py /path/to/repository
```

The runner independently regenerates the module/zero-context patch/boundary in a temporary directory before running762 synthetic checks with the real codec and mocked clock/sample/replay. Checks cover union/omitted fields, all727 zero-echo control calls, cancellation/input drift/quality/budget, nonzero delta rejection and reconstruction mismatch. These mocks establish no Canvas equality or private authority. The actual83u replay helper has separate85-check and3-time Canvas evidence; actual fullclock compact comparison remains next.

The source-only model is not an owner, safe certificate, candidate issuer or frame permission. Current circle binding and all-own actual destination evaluation still belong to a private owner/controller boundary. Preimage/negative/tail, final plan/cache, ordinary UI and practical preparation remain unqualified. Existing8MiB serialized cap is unchanged and distinct from Canvas backing memory/heap. The compact format is intended to leave enough live headroom for required owner/plan/issuer work, not to bypass its future combined budget checks.
