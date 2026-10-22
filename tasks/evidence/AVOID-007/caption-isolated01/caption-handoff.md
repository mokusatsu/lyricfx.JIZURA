# AVOID-007 caption handoff

Implementation: dedicated gpt-6.1-sol / medium sub-agent, isolated copy of current work source. Shared products and task docs were never written. No image review performed. Evidence-driven-task-management and implementation-review-policy were read before implementation.

## Apply

Review/apply `caption09f.patch` from `/workspace/avoid007-caption-tools` to shared `src/09f_layoutsB_editorial.js` only. Do not copy isolated index.html or en/index.html. The before raw SHA must equal `3798fb3602e21d8445cd895ffd51cb7d76a26e21768fcd6f95307ce0cd70a670`; after is `31108fa9f158043cbe28977e518f43be736b913a588ae3fa259fceb3cb6e7410`.

## Change

Caption wrapping inserts newlines only between whole semantic atoms, retaining all source spaces and characters in the original order. The final face style and 3/4-digit weight remain one atom. All number/font words remain whole. The widest measured mono caption atom contributes to each cell width, alongside the actual glyph ink width. Oversized atoms remain intact and overflow the candidate rather than secretly shrink. The existing envelope/solver must then accept/reject the candidate honestly.

Existing sourceMapping byte/space/font/copy/shape checks remain, with an extra guard rejecting newlines inside any caption number, word or style+weight atom. Existing default discrete [1,.95,.9,.85,.8,.75,.7], explicit-size [1], metadata floor, main hierarchy, native clocks, six faces and OFF path are unchanged.

## Verification

Exact command from the isolated root: `JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-caption-test.cjs > caption01.log 2>&1`. Exit 0. The small test reuses the existing layouts-b fixture, actual font manifest, and shared pin/open/hash-verification harness. `caption01.json` contains before/after data and startup pins; `caption01-snapshot/` captures all 104 source/font/helper inputs before launching Chromium, followed by terminal hash verification. Raw output is `caption01.log`; raw baseline copy is `09f-baseline.js`; initial shared-copy pins are `baseline-pins.json`.

1920x1080 before reproduces label16 REGULAR 40 + 0 and label17 EXTRABOLD + 800. After uses REGULAR  400 and EXTRABOLD  800 atomic lines; all six full lyric faces remain, selected scale stays .85 and metadata size stays 21.6. 960x1080 also has six actual faces, exact non-newline metadata, unbroken words, .85 scale, glyph bounds inside cells, cells inside screen, and each line width <= cell width. SourceMapping rejects deliberately split number, word, numeric weight, and style/weight pair in all three tested prepared cases (12 negatives total).

A compact Latin `I` specimen already fits natively, so its selected trajectory has no reflow composition. The test explicitly inspects a generated candidate (`candidateOnly:true`) to exercise metadata-driven minimum widths; it does not claim this candidate was selected/certified by the trajectory. Its six candidate cells use scale 1 and at least one exceeds glyph-ink width+padding because of the caption atom. All candidate APIs invoked with explicit-size=true retain scale 1 and exact native glyph sizes.

An explicitScale=.85 1920 fixture remains insufficient-space before/after, rather than reducing sizes. The 30px direct wrapper case keeps a too-wide REGULAR  400 intact. All actual font loads pass, all six assigned faces are distinct, and browser warnings/errors are empty.

## Honest limitations / historical failures

The isolated first attempt could not bind localhost (EPERM), then an approved local-browser escalation exposed a missing default Playwright bundled executable. Using installed /usr/bin/chromium resolved the launch prerequisite. Early focused test attempts assumed every fixture has a sourceProof/selected composition; lyricSize=100 is correctly preserved as legacy and compact `I` uses native fit. These were helper assumptions, not product failures; prior startup snapshots and the earlier successful receipts remain beside the final evidence, clearly named. No source result was weakened to certify an insufficient case.

Still pending: parent code review/integration/build, full25/final sourceMapping/cell/interval regression, updated performance if parent requires it, immutable final capture, separate independent visual review and public/runtime gates. No completion/publication claim is made. Existing prior native bundle was never edited.
