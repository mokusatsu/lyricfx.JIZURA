# Independent local visual review 04

Reviewer: fresh-context independent agent `/root/accordion_visual04`. Scope: sampled visual inspection only of frozen `accordion-selected-20261024-01`; text-only findings returned to parent. Read `/workspace/lyricfx.JIZURA/AGENTS.md` and `tasks/implementation-review-policy.md`. No network/public URL access, public-result checks, source edits, Git operations, or security investigations performed. Public-result checks remain permanently prohibited.

## Evidence inspected

Manifest `review/manifest.json` SHA256 independently computed as `d21bf0e53ccc7c8fda51dfda5ed73a00f79634f405b18d12880c493575dfdd49`, matching the task and `review/local-verification.json`. Read those records and source-manifest metadata. Baseline is whole `90909a0e9873c703215541b72a55658abd3f2175`, without D finalization. The records describe matching fixture/font/params/text/camera/duration, native 60 fps, 240 frames/4 seconds, 240 distinct images per side, preserved native clocks, and after guard receipts. Those records are supporting evidence, not visual approval or an independent re-execution of every guard/hash check.

Viewed all twelve supplied native PNGs at their native dimensions:

- `review/images/d09-accordion-horizontal-before-15.png`
- `review/images/d09-accordion-horizontal-after-15.png`
- `review/images/d09-accordion-horizontal-before-90.png`
- `review/images/d09-accordion-horizontal-after-90.png`
- `review/images/d09-accordion-horizontal-before-228.png`
- `review/images/d09-accordion-horizontal-after-228.png`
- `review/images/d09-accordion-vertical-local-before-15.png`
- `review/images/d09-accordion-vertical-local-after-15.png`
- `review/images/d09-accordion-vertical-local-before-90.png`
- `review/images/d09-accordion-vertical-local-after-90.png`
- `review/images/d09-accordion-vertical-local-before-228.png`
- `review/images/d09-accordion-vertical-local-after-228.png`

These are frame 15 = 0.25 s, 90 = 1.5 s, 228 = 3.8 s. Also extracted and viewed exactly six local MP4 frames, without changing the review assets:

- `independent04-frames/horizontal-after-0.png`
- `independent04-frames/horizontal-after-45.png`
- `independent04-frames/horizontal-after-150.png`
- `independent04-frames/vertical-local-after-0.png`
- `independent04-frames/vertical-local-after-45.png`
- `independent04-frames/vertical-local-after-150.png`

Additional frame times: 0, 0.75, 2.5 s. MP4 frames are decoded video samples, not original PNGs. Frame 0 is blank in both after videos; visible text is complete in the later inspected samples. This alone is not a missing-glyph finding.

## Sampled findings

Horizontal: sampled-static pass. The former four-panel strip becomes two separated, contiguous two-panel strips at the right, each with a visible central hinge. The sloping top/bottom edges and alternating light/dark faces retain folded-paper identity. It reads as two short accordion sections rather than four independent flat cards. The reduction from three hinges to one per strip is visible and makes the accordion identity simpler, but does not erase it. Shadowing is subtle but consistent with the fold and underside; no detached shadow artifact seen. Glyphs sit convincingly on the corresponding faces with matching perspective, remain large and legible, and are fully present. The layout groups `風の` above `先へ`, giving a natural left-to-right, then top-to-bottom reading route. No sampled clipping, missing glyph, inter-strip overlap, seam gap, or stray artifact seen.

Vertical: sampled-static structural pass. The former four-panel vertical strip becomes two side-by-side two-panel strips below the central area. The alternating trapezoids, face brightness and joined horizontal hinge remain visibly folded. All four yellow covers stay attached to their own strip ends; none floats away or crosses a glyph. Glyphs follow the vertical panel compression/perspective and remain complete and readable. No sampled clipping, overlap, detached corner, or unexpected artifact seen. The change across inspected nonzero samples is consistent with breathing of the folds; static sampling cannot certify smooth phase evolution.

Vertical has a separate human reading-flow question. The visible columns are left `風`/`の`, then right `先`/`へ`. That preserves the intended string when following left-column-first order. Conventional Japanese vertical columns are often read right-to-left, which could instead suggest `先へ風の`. This is a user-facing ambiguity introduced by splitting the original single vertical strip into columns. It is not evidence that source indices/clocks changed, and I do not recommend an unrequested source fix based only on this review. It requires the user's visual/reading judgement.

## Publication/human-review recommendation

Recommend both horizontal and vertical examples in the batched human confirmation, with horizontal as the primary example and vertical as a short, distinct second example. Horizontal alone demonstrates fold retention and ordinary row reading well, but cannot resolve the vertical column-reading choice or judge the four re-created end covers. The vertical example is genuinely useful for that specific decision, not merely redundant axis coverage.

Suggested confirmation focus: horizontal — whether the two short folded sections still feel like the intended accordion and read naturally; vertical — whether the left-column-first continuation is natural for this effect, and whether the two pairs of yellow end covers feel attached and appropriate. Human confirmation remains unanswered; no acceptance is inferred. Keep the frozen candidate and batch the request at the already planned time.

## Limits

No real-time playback was visually watched. This is 18 still-frame inspections (12 native PNGs plus 6 decoded MP4 frames), not an all-frame visual pass. No claim is made about temporal smoothness, every intermediate fold phase, exact appearance chronology, comprehensive typography, broader matrix coverage, or performance. Source chronology and 480 after guards were reported in the supplied evidence; they are not substitutes for human motion/readability judgement. No images or video blocks were transmitted to the parent. No public result was inspected.
