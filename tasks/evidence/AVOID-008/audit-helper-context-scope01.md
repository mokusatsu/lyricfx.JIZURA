# C alpha audit context correction

The product replay normally receives the same environment/context whose drawing helpers were created by `Renderer.makeEnv`. The C audit fixture used a shallow `{...env,ctx:auditCtx}` override. Replay of `rrect`, `circle`, `arc`, and `blob` calls environment helpers, whose closures still referenced the original canvas. Those shapes therefore did not contribute to the audit canvas. This also could paint incidental shapes on the ordinary audit target; it does not affect captures or ordinary renders which do not install this audit hook.

The correction rebuilds the audit environment with `renderer.makeEnv(auditCtx,plan,cut,sc,{...env,ctx:auditCtx,placementRecorder:null})`. It changes test instrumentation only. Historical files remain untouched.

## Affected evidence scope

- `layouts-c-fixture.js` old `auditLayoutsCPrimary` and `auditLayoutsCStage`: item glyphs, raw paths, raw text, rects, and lines went to the intended audit canvas; the four helper shape kinds did not. Sticky acceptance01/02 and boundary01/03/04 actual circle counts cannot certify all owned plate pixels. Their source mappings, phase observations, parameter gates, explicit-size checks, and polygon geometry remain separate evidence.
- Sticky stage01/02 padded alpha counts cannot certify the entire note paper/pin. Independent source interval bounds and accepted sticky-preview02 video/frame bytes were not produced through those hooks.
- Clapper raster01/03 padded stage and circle counts have the same scope limitation. Its event-by-event native clip audits replay only `rect` and `nativePath` events (20 each across two fixtures); both use the supplied context directly and are unaffected. Their numeric values do not imply the high-level plate/hinge shapes were audited.
- Badge crop01 shallow replay has the same omission for owned shape counts. Main glyph and item metadata counts do target the audit canvas, but crop01 is superseded for full-object crop analysis by crop02; no full-object acceptance is carried from crop01.

## Unaffected drivers inspected

- `layouts-c-native-test.cjs`: native136 fidelity creates each destination environment with its own `makeEnv`, then replays into that same environment/context. OFF34 renders normally, without an audit hook. No shallow-context replay is used.
- `layouts-c-transport-test.cjs`: whole-program fidelity also creates matching destination environments. Its individual containment audit uses shallow context replacement, but filters strictly to `nativePath`, `nativeStrokeRect`, and `nativeText`, whose product replay branches draw directly through `env.ctx`. Transport06 raw145/nativeText24/curve/stroke containment remains limited to those stated raw kinds and is unaffected. B raw-fill program/pixel exact checks replay into matching environments.
- C native MP4/PNG generators, sticky/object frame-hash carries, registry controls, font parser tests, owned-font numeric probes, and cache order tests do not install the faulty C audit hook.
- Existing `layouts-a-fixture.js` explicitly reconstructs audit environments with `makeEnv` in both native and adapted paths. It does not share the C helper-binding error. No A/B source or old evidence bundle was changed.

## Replacement receipts

`sticky01/stage03`, `clapper01/raster04`, and `badge01/crop02` use the corrected helper bindings. Their results must be reviewed individually; starting these runs is not a success claim. Additional corrected C circle/boundary runs will be kept under new receipt names. Numeric source proofs, raw transport containment, real native captures, and whole-object alpha audits remain distinct evidence categories.
