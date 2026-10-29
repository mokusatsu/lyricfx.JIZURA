# Contour native header/ring extraction84a

Unregistered source-only unit. Run `python3 run-tests.py /path/to/repository`.

The generator extracts the current unchanged contour render prefix and ring block literally. The helper selects the original hero character (first Kanji, then original nonpunctuation/non-small-kana fallback), keeps native dimensions/side/orientation, entry/exit/phase/grow arithmetic, and describes ordered requested strokeText/fillText operations with original font/anchors/width/alpha/material. It does not change or replace product rendering and makes no half-hero candidate yet. No text/seed/circle-specific branch or fixed movement is introduced. Native ring/header arithmetic uses no RNG.

The29,161 checks cover5,832 synthetic states and6,840 ring calls against the literal original native fragment, using actual01_util predicates/easing, synthetic fontCSS and a state recorder. Text includes Japanese, Latin/punctuation, small kana, emoji, whitespace and empty input; landscape/portrait/boundary dimensions, main/A/B, early/held/exit clocks and4/6 rings are exercised. The initial fixture stopped at a VM string newline escape SyntaxError, before checks; test-only String.raw fixed it without changing source or expectations.

This is not actual Canvas: font fields are requested strings, not native setter readback or metrics. Ring alpha/material/width are source values, not paint coverage. Body glyphs, underline and metadata have not been extracted or qualified, and the helper does not establish clip/stroke/font/quality/avoidance/support, whole-clock or authority guarantees. The approved half-hero/native-body layout remains the intended later candidate; existing human approval is not re-requested and no new video/image is produced.
