# Correction to dictionary2943460

Parent source review found two real guarantee defects in2943460. The immutable old compiled reproduction is `checkpoint01/dictionary-review-defects01.json/log`: mincho page was certified but16 context fragments exceeded their inferred print fields by up to13.966px; short Latin entry was certified with native `Hold on to\nthe light` changed into `Hold o\nn tothe \nlight`, losing a meaningful source word space. Preserve294/dictionary07/matrix05/old preview as superseded for these guarantees, not as complete typography/semantic acceptance.

## Source changes

Context fragments now use Canvas measureText with the same J.fontCSS, actual serialized letterSpacing(fs*.04 to two decimals), alignment and baseline as rendering. Wrapping accounts for actual ink bearings and3px conservative AA bounds, with explicit inner padding. Each fragment carries its allocated column field. Quality independently checks both recorded preclip polygons and freshly measured same-CSS/letterSpacing ink inside that fixed field. Field bounds are not used to clip/hide text. Height includes field padding; actual native font size and copy/reveal remain unchanged.

The main logical source is cut.text.trim(), retaining internal spaces. Native soft line breaks are aligned back to the original source: a break may correspond to a source gap, while a Japanese internal break may consume no gap. Native missing characters/word spaces fail. Reflow fragments have ordered codepoint ranges and must reconstruct the exact original logical main including spaces; inserted visual line breaks are separate. Latin wrapping prefers source word boundaries and rejects a word that cannot fit at the allowed point size. This recipe rejects explicit hard main-line breaks rather than silently deleting them; native translation/fallback is preserved. The global norm check is no longer the dictionary semantic-space proof.

## Pinned evidence

`dictionary10/results.json` plus compressed inputs pins100 source/compiled/fixture/launcher/test/font inputs, start=end changed[]. Product hashes:09h42fda55319cf73064e6bfd47c4298bd7a51420b72f2440a858d82dfa4c4ac1c0;11pb3ec63dfdaea3c7b1cd4f256cf7d3fc7ea5366e82d9cc629b2b861a04380b727;JA484617d1ce4566c8230e355d9f33eb196b6eee98f9669f15b859a7956290da9f;EN545769053284368bf041591970ed328b3e44f8ef50cee59bb546f6fee8b11f4f. JA runtime only; EN build/hash pin is not EN runtime acceptance.

- 22 cases = previous20 plus short Latin soft-gap and double-space source.17safe /5insufficient, no runtime error; all22 native OFF comparisons equal immutable matrix04. Old conditions/results remain unchanged in prior folders.
-138 explicit context print-field records include emitted text/range/font/actual letterSpacing/allocated field/recorded preclip bbox; all contained.17 column arrangements reconstruct the exact logical main spaces. Both single-gap and double-gap Latin cases succeed.
-22 structural negatives include new narrow-field, shifted-body and changed-letterSpacing cases, all rejected. Two additional word-gap negatives reject native soft-gap deletion (unsupported DICTIONARY_MAIN_COPY) and column word-space deletion (candidate rejected/insufficient). Neither is counted as a successful arrangement.
-38 actual metadata occurrence appearance/text/opacity observations still match native. Eight real faces loaded;813 actual assigned-face corpus glyphs all covered by their actual cmap, symbol fallback0/system fallback0. Real six main faces remain separate from CSS weight parser tests.
-51 corrected full-plate hold/stage and153 per-event early/exit raster samples have no collision/new crop. As before, earliest17 hold samples quantize before global h0; all51 all-primary rasters are collision-free and34 global-strict rasters are nonempty. Source event guards, not empty strict raster counts, enforce early-settled ink.
- font03 repeats unchanged six CSS500/700/bold parser/floor assertions using the dedicated C pinned fixture; passes. Typeface-nearest parser scope remains distinct from actual real-face coverage.

No second170case matrix was run for this dictionary-only correction; matrix05 is retained as prior full-group evidence. Main integration with its exact fitBlock namespace requires its own pinned rerun, avoiding duplicate full matrices. Generated JAEN/shared09g are excluded from this correction commit.

## Corrected review materials

`../dictionary-preview02/index.html`: corrected mincho page central r.2, two96frame24fps MP4s and six native960×540 PNGs. Actual source/render plans remain unchanged across all frames; cut text/note/stage asserted. Manifest726441ee41074fd998c183eaaeb3f2606896f4331ad99796ff8fbb169953c870. A post-run runner archive matches the original manifest input hash and is explicitly labelled as post-run archival.

`../dictionary-wordgap-preview02/index.html`: corrected Latin entry, same stage/clock/actual input capture, two MP4s and six native PNGs; after main must reconstruct exact source spaces. Manifestac22c6dd20481803fdf8d5f44869b484f21327064299c300ebe8f333daa0a00b. The partial wordgap-preview01 is retained as a fixture assertion FAIL (glyph comparison stripped only one side); it is not a valid review bundle. No images were viewed and no visual PASS/public verification is claimed.

This is still a bounded editorial prototype. Remaining font/aspect/long-copy insufficiencies are candidate limitations, not physical impossibility. It does not complete all10ID acceptance.
