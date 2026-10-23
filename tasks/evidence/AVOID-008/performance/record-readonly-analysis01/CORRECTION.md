# AVOID-008 read-only proposal correction and seal

This note supersedes the relevant recommendations in the historical files below; those seven files remain byte-for-byte unchanged. No new execution was performed for this seal.

## Correction: native invocation boundary

The proposal to repeat live descriptor guards at every contains call is withdrawn. With standard native intrinsics captured at bootstrap, accepted product `8ff3dd8487a4fb4193d00ef9caa296372c751b4f` constructs private bound native WeakMap get/set using captured Reflect.apply/Function.call/bind, then directly invokes the resulting functions. Later runtime replacements of `.call`/`.apply`/`.bind`, Reflect.apply, WeakMap methods, descriptor helpers or numeric prototype setters are not read or called by this path. The former leak example required invoking a live replacement with private records; it does not apply to these captured direct calls. This conclusion depends on the recorded standard-native bootstrap premise, not a claim about arbitrary compromised bootstrap code.

The reader therefore performs one private map lookup, an initial immutable snapshot proof for a registered native parsed polygon, then the complete edge loop. No per-call live descriptor scan or argument-array allocation is required. Private registration/edges are not publicly exposed. The old cumulative counter proposal is also superseded by the accepted latest-successful-decode generation registry; old/cold/unregistered polygons use the unchanged predicate.

## Actual state

- Source/pure correctness was accepted by the parent. [Source/pure/build handoff](../immutable-edge01/HANDOFF.md), [exact reverse and all84 bundle proof](../immutable-edge01/proof.json), and retained [old](../immutable-edge01/pure02-old-target.json.gz)/[candidate](../immutable-edge01/pure02-candidate-target.json.gz) comparison artifacts distinguish implementation evidence from the earlier proposals.
- [Browser02](../immutable-edge-browser02/HANDOFF.md) correctness was accepted:40cold/warm whole-value/alias pairs and28negative controls, all original nonC/schema/budget assertions, selected warm25,008edge hits/176first validations/reject0. These are browser02 observations, not inferred timing-run counters.
- [Original100 diagnosis](../immutable-edge-diagnose01/HANDOFF.md) remains **performance unmet**:ON planning single post-warm point48→152.200000003ms=3.1708333334×; renderp95 2.700000003→7.800000012ms, additional5.100000009ms. Planning is not formalp95. Counts/font/input parity and actual80record/replay/observations remained valid. No formal1000, repeat, acceptance or causal speed claim follows from this result. Parent raw review was in progress when this note was sealed.
- [Browser01 startup failure](../immutable-edge-browser01/startup-failure-receipt.json) remains a preserved pre-browser loopback EPERM capability failure. Browser02 was separately authorized; the old attempt is not retroactively successful.
- Direct certified native rendering remains ineligible for the current benchmark; its actual record/replay guards were never replaced or faked.

Product source remains isolated, with source commit8ff3dd8 and no main product merge. AVOID-008 is not complete. No source, runner, fixture, parent root gate/runtime or main changes accompany this note.

## Historical reports retained

|File|Bytes|SHA256|
|---|---:|---|
|EDGE-GENERATION-ADDENDUM.md|4901|36534bfb8fbbc902d2c4d8007031e86713c2c181596fbc04acde669d0450e4e1|
|EDGE-PRECOMPUTE-PROPOSAL.md|7684|c86171279e5d154eac5d60b25fd7d0a0e802c6a6c3793f8b6a3adeab45510042|
|REPORT.md|7631|1d266b4b1c950cb74a058bb24c221be57bc76142fa7050e470090ca4f9c26aa9|
|edge-counts01-receipt.json|410|3b53c0712b96c1d86d97062a33a8a3beb59fc6925996a92b13fcb867e4222272|
|edge-counts01.json|2650|0e4aaab9dbccea78377e7cdd74a4c9b4a9dbd5f8afbf8a6c46bd7096741fc7ea|
|existing-raw-analysis.json|82037|f05d0f1aeb5765c4a8042520daa52eff78016383e56eecd0ebdc4752e2fc9600|
|receipt.json|2430|337346673c0607111aa27557d0f31317743f27ab921ba03acad3456c66ed8ccd|

Evidence sequence:source8ff3dd8;pure/buildbeb793e;browser preparation3291ceb;pre-browser failure00fed34;browser02 result1ebd00e;diagnostic preload9db2596;diagnosis resultffc1da2. The source oracle and browser/performance helper paths are recorded in those handoffs.
