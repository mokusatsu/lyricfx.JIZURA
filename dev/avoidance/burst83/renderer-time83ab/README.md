# Burst83ab time/selector projection — source only

The helper maps finite actual times to the source clock while preserving actualRealTime, and distinguishes actualN from sourceN. The range derives from the current cut/clock: one clock step before zero through one step after max(plan duration, cut end plus the slowest primary lag). Positive times must lie in a real reachable Q.clock preimage. Negative times must reproduce all three actual selectors and the initial state's pass/lag/tp/lt/ltb/step/active values. Tail selectors must all be empty. Range or correspondence failures are typed.

```sh
node dev/avoidance/burst83/renderer-time83ab/time-test.cjs
```

The25 checks use mocked selectors and preimage endpoints. This is not a geometric or camera/realTime equivalence proof, does not import Domino geometry, and issues no frame permission/trajectory/certificate. Burst initial main has positive paint; unlike other effects, initial geometry must actually be checked. Negative sourceN0 does not mean actualN0, and negative-zero actualRealTime must remain signed.

Current source dataflow:09_render quantizes tq, forms tp=max(0,tq-lag), and passes t=tp/lt/ltb/step to makeEnv; pIn/pOut derive from these and the fixed cut. CAMERA.push reads quantized lt and fixed motion/cut duration. The burst motion/parts and cut/still/none mainDraw/drawItem path use those fields. Actual-t event/beat/energy paths must be excluded, as must cut FX/style overrides, masks/layers/post and unsupported options. realTime metadata is not a free geometric guarantee. Source identity and dependency guards plus actual Renderer first/last/negative/tail comparisons are still required before connecting any frame issuer.

The source-only helper is a renamed/restricted adaptation of Domino82v selector arithmetic. The source dependency is tracked; prior Domino actual results confer no Burst qualification. Ordinary UI and practical preparation remain incomplete.
