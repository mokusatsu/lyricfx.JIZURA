# Bulbs native-first cold experiment 86cq — not adopted

Source-only experiment by gpt-6.1-sol / medium, based on product HEAD
`7a7952a69cb501a441cb500506872aee4e7daaa6`. Product src, bundles, Renderer and
UI are unchanged. The experiment is not a cold-performance fix for the product.

The original compiler eagerly builds all four recipes at all 250 owner clocks.
This experiment builds native first, retaining every clock/support and the
existing held-quality, destination replay and final admission checks. Native
insufficient-space revokes the stage and starts the original four recipes in
original order under a fresh generation. No representative-clock acceptance or
fixed-text branch was introduced. The normal frame-data minimum remains intact;
the source-only native trial explicitly permits only the known native singleton.

| Condition / mode | Wall ms | Max step ms | Recipe × owner | Glyph matrices | Ring points | Candidate count | Serialized peak B |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Success old01 | 10932.6 | 185.6 | 1000 | 5456 | 19884 | 2 | 3825235 |
| Success new01 | 7440.1 | 69.1 | 250 | 1364 | 4971 | 2 | 2989648 |
| Insufficient old02 | 4881.4 | 79.9 | 1000 | 5456 | 19884 | 0 | 3825235 |
| Insufficient new02 | 7796.9 | 68.8 | 1250 | 6820 | 24855 | 0 | 3825409 |

Each is one observation in fixed old→new order, not stable performance. Wall
starts before the bulbs UI replan and includes its font wait; a test observer
serializes each completed model inside that interval. Normal frame hashing and
native projection hashing run after the interval. Peaks are the existing exact
serialized accounting, not heap/RSS. New01 predates the explicit small
search/stage-mode accounting added for new02; source versions are kept separate.

Success removes three recipe computations (75% fewer recipe-owner evaluations),
with the same 250 clocks. Native geometry projection hash, exact selected delta,
all proof groups/held records/250 references and normal t=.5 RGBA frame hash match
old01. Final proof is not skipped: old/new proof step totals are 2768.8/2771.3 ms.
Model serialized size falls from 1071750 to 406171 B; resident bytes from 1114348
to 448769 B. Successful wall is 31.9% shorter in this single pair.

The insufficient condition instead compiles 250 native plus 1000 original
recipe-owner cases: 25% extra work, two models constructed sequentially, and
59.7% longer wall. Final full model counts/bytes/recipes and all original four
quality diagnostics exactly match old02, with the same typed
`BULBS86BJ_INSUFFICIENT_SPACE`, empty bitmap and released authority/resources.
Native failure is therefore a material regression. **This proposal is not
applied to product.** A successful alternate-recipe fallback and actual warm
fallback timing were not measured. Mock tests establish full retry/generation
routing, not their performance or all real inputs.

Inputs use the ordinary project/normal preview path: 480×270 actual viewport,
960×540 video, 60fps, JA lyrics, same seed/fonts/effect parameters in each pair.
Success circle center (.5,.1), radius .1; insufficient center (.5,.2), radius .2.
They are fixture measurements, not input-specific implementation branches.
All four managed runs completed with three normal page closes, owned children
reaped with exit0, zero cleanup signals and closed debug ports. No media or
public checks. Their result stage label is inherited from the existing builder;
this document and browser-test.js define the narrower actual CQ experiment.

## Independent read-only checks

From repository root:

```sh
python -B dev/avoidance/bulbs86/first-native86cq/check.py /workspace/jizura-logic-evidence-20261027
node dev/avoidance/bulbs86/first-native86cq/frame-test.cjs
node dev/avoidance/bulbs86/first-native86cq/adapter-test.cjs
node dev/avoidance/bulbs86/first-native86cq/warm-test.cjs
```

Checker validates all 187 source pins and two compressed/raw hashes per run,
normal lifecycle, work counters, limits, success proof/hash equality and
insufficient fallback equality/release. `historical-source-map.json` resolves
two changed source hashes to byte-identical sourceprep snapshots. Old result/raw
files were not rewritten. The three pure suites contain 4+6+4 checks. They cover
native singleton guard, cancellation/new generation, unrelated errors, cached
full failure without duplicate retry, and cached-native failure to original full.

Evidence base: `/workspace/jizura-logic-evidence-20261027`.
Historical raw/results: `bulbs-first-native-{old,new}-actual86cq{01,02}`;
lifecycle: same name plus `-runtime/host.json`; generated executable sources:
`bulbs-first-native-source86cq-{old,new}{01,02}`. Run01 source version is
`bulbs-first-native86cq-sourceprep01`, run02 is `...sourceprep02`. Keep both
sourceprep directories, all executable source dirs, four run dirs and lifecycle
dirs. Final source snapshot/pins are `bulbs-first-native86cq-sourceprep03-final`.
No completed experiment needs re-rendering to review this unit.

## Static follow-up only; no implemented early rejection

The compiler's existing `add()` unions groups monotonically; destination
selection later checks translated group rectangles against circle and stage.
A possible necessary-condition proof would bound all stage-fitting translations
from prefix support extents and prove a prefix group still intersects the circle
at every extremal translation. This could reject impossible native early and
then use the original full search. It must never accept a sampled subset.

This has not been implemented or measured. It still needs a precise argument
connecting prefix extents to the final replay's rounded bounds, outward-rounded
translation limits, and the exact Canvas-derived baseScale/circle used by the
controller. The compiler currently builds logical geometry while the controller
obtains actual scale after setTransform; scale assumptions must not replace that
contract. Four heuristic G.positions failures alone do not prove impossibility.
There is no claim that (.5,.2), r=.2 would be rejected cheaply, that the proposed
condition is sufficient for safe fallback, or that its overhead improves either
pair. Parent will decide the next experiment after reviewing these preserved
measurements. Cold preparation remains unresolved.
