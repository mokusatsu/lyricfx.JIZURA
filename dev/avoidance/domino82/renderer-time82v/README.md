# Domino primary pass time projection 82v

Unregistered source-only selector. No safe trajectory, CTM or model authority.

The range formula is copied from real09k.validate unchanged: min(start,renderStart)-stepDur through max(end,displayEnd)+reachTail. The trusted adapter must pass its real09k options; caller range/objects are not authority. Inside the existing model domain, select requires its exact preimage. Actual realTime and actualN are preserved.

Real09_render clamps every lyric pass (including main) with tp=Math.max(0,tq-lag). Negative realTime therefore paints initial state, not an empty frame. For the fixed start0 scope the selector verifies all3 current selector results and every pass/lag/tp/lt/ltb/step/active value against model state0, then reports sourceN0 independently of actualN. This is primary-pass arithmetic only: live CTM/source support still needs separate verification before frame admission.

At duration and later, it calculates the real3pass tp values and requires actual J.lyricCutsAt/J.lyricRenderCut to select no cuts; otherwise typed refusal. It does not extrapolate prior geometry. Outside the original09k range or with nonfinite times it refuses. Returned ephemeral pass data must be included in controller work accounting at integration.

Run `node time-test.cjs`:23 pure checks use mock selectors/preimage, negative endpoint/tiny/negativezero, duration/nextafter/tail, altered initial metadata/active tail and outer range boundaries. No actual Canvas or general-runtime time proof is claimed. Next is a small actual source/CTM comparison at these times, reusing already computed model/initial oracle rather than recompiling wholeclock.
