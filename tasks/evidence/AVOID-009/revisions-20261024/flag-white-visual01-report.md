# AVOID-009: landscape flag white portion diagnosis

Finding: the missing white portion is the flag’s broad vertical hoist-side strip (a white fabric header/sleeve-like band), immediately to the right of the thin gray flagpole. It is not the thin pole itself. Confidence is high for the visible geometry and color; “header/sleeve” is a semantic interpretation from appearance, not source verification.

All eight requested 960×540 local PNGs were viewed. Coordinates below are approximate, with (0,0) at top left.

| Pair | Before | After |
| --- | --- | --- |
| 01 | Bright white vertical strip around x=154–173, from y≈411 to the bottom crop. Yellow fabric begins around x=174. One outlined attachment ring overlaps the left edge near (154,422). | Flag appears on the right; yellow starts at x≈626 and y≈199. The broad white band is absent. Outlined rings remain near (627,208) and (627,409). |
| 02 | White band around x=153–171, y≈114–394, spanning the fabric’s full height. Thin gray pole is around x=149–155 and extends above/below the flag. Rings near (154,124) and (154,383). | Thin gray pole remains around x=623–628, from y≈86 to492, with yellow finial and both rings. Yellow fabric begins directly against it; no broad white band appears between pole and yellow. |
| 03 | White band around x=150–168, y≈112–395, spanning full fabric height. Thin gray pole around x=147–152 is a separate object. | Pole, finial, and two rings remain; yellow starts at x≈624 with no broad white band. |
| 04 | Despite the dimmed yellow flag/background state, a clearly bright white strip around x=148–166 remains visible from y≈402 to the bottom crop. | The dimmed right-side flag has no comparable white strip. Pole and ring outlines remain visible. |

The before band is about 19–20 pixels wide, roughly 3.2% of the visible ~595–600-pixel flag width. The after flag is narrower (~260 pixels), so retaining that width proportion would make an approximately 8–9-pixel band. This proportional width is visual guidance only, not a verified implementation constant. The band should run from the cloth’s top edge to bottom edge on its hoist side and travel with the cloth; simply thickening the pole would reproduce a different object.

Severity: clear localized visual regression, corroborating the user’s observation. It occurs in every sampled after frame, so the supplied samples do not support explaining it as a single transient occlusion. The pole and attachment rings were preserved while the white fabric-side strip disappeared. The existing before sample also shows that this band remains bright in the dimmed 04 state; that contrast is part of the visible before appearance.

No source cause is claimed. These stills cannot establish whether the band was omitted, recolored, covered, or clipped. They establish the visible result. Preserve the user-approved portrait behavior: no portrait images were inspected here and no portrait correction is justified by this diagnosis alone.

Evidence receipt: `receipt.json` contains the eight exact paths, SHA-256 hashes, dimensions, file modification timestamps, and timestamp limits. Individual presentation timestamps could not be bound from these PNG filenames and are explicitly unknown. No new captures or media processing were performed.
