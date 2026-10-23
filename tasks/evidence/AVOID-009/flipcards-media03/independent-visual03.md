# Independent local visual review — flipCards selected03

Decision: PASS for the sampled static intent/attachment comparison; suitable to retain as one representative for human motion review. No human approval, real-time motion pass, family-wide avoidance pass, or AVOID-009 completion is asserted.

Reviewed AGENTS.md and tasks/implementation-review-policy.md, including the permanent public-result-check ban. All work was local. No public URLs, network checks, source/product edits, staging, commits, or pushes.

## Evidence and conditions

- Local comparison: `/tmp/avoid009-flipcards-selected-20261024-01/review/index.html` (HTML read; not browser-played).
- Manifest SHA256 independently checked: `e507a484569a96d839ba2781b0d2ebf15c2ab68198ea4918dea97e8096711593`.
- Read manifest.json and verify01.log. They record native 960×540, text 風の先へ, seed704, ltr, table/peek/idx true, same pinned Noto font/conditions, 4 s at 60 fps, before whole 1b0d901 native/offD and after certified bounded adapter. Source manifest pin: `9c67a70625eb26d9bb3754b9255ddd510c9e649b3e9e329a5922cd04be9848fd`.
- Viewed all eight native PNGs: `images/d09-flipcards-table-ltr-{before,after}-{15,90,117,228}.png` (0.25, 1.5, 1.95, 3.8 s).
- Additionally extracted from each local MP4 and viewed native PNG frames 30,45,60,210 (0.5,0.75,1.0,3.5 s), stored as `visual03-extra/{before,after}-{30,45,60,210}.png`. Sixteen individual images viewed in total.
- Conditions match at the sampled clock phases: the same cards reveal/close in sequence and the same question-mark/star table peeks appear. The intended differences are main cards relocated into two columns at right and slightly smaller glyphs. Before/after do not claim identical composition.

## Observations

- Portrait card proportions and full card sizes read as retained. White faces, gray-blue backs, outlined inset back panels, diamonds, narrow turning edges, and dark cast shadows keep a clear paper/card feel. No horizontally flattened card panels appear in stable frames.
- Main black glyphs and amber upper-left/lower-right indices stay attached to their own faces. They move with the turning panel in the sampled reveal/close states; no new cut-off stroke, dangling corner text, detached card edge, or page-edge clipping is visible. The edge-on third card at frame228 also exists before and reads as a flip phase, not missing content.
- Stable after frames read naturally as 風 の on the top row, 先 へ on the bottom row. The sampled initial reveal follows that row-major order. The modest glyph reduction still leaves the central text readily legible at native size; tiny amber indices retain the baseline's lower contrast and small scale.
- The central circular subject area is visibly empty of the main cards. The right-shifted main block has ample visual separation from that central area. The retained native top/bottom table rows do not introduce a visible central obstruction in these samples. This is a visual observation, not a substitute for the numeric guards.
- Native table decoys and literal peek content are retained: top question-mark peek at frames90/117, bottom star peek at frame210. The right main block overlaps the native fourth top/bottom table positions. Consequently the lower star is partly hidden by the main lower-left card in after frame210, and some native rightmost backs are partially covered. This does not look like a detached glyph or an accidental card clip, but the asymmetric table/main-block relationship and partly obscured peek deserve human aesthetic review.
- Panel perspective/edge narrowing and moving shadows remain evident at frames15,30,45,90,210,228. These samples support preservation of flip intent. They cannot establish smoothness, pacing, comfort, perceived physical attachment throughout every transition, or real-time playback quality.

## Limits and next review

No real-time MP4 playback was observed. Local extraction and static comparison are insufficient to approve motion. Keep this single representative for human review of the two-row reading flow, flip timing, and whether unchanged table decor peeking behind the relocated main cards remains natural. No additional representative is required by the sampled evidence alone.

The reported 240/240 after-frame geometry guards and the broader 152 safe / 232 insufficient cases among 384 remain separate evidence; neither converts these selected static observations into full-family visual or geometry success. No public-result check was performed or is requested.
