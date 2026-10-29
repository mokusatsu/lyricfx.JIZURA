# Crossword approved58A family85c

Unregistered source-only semantic family. It applies the checked58A changes to current native source: nativeCell×0.58, native-sized number/clue text, lyric cell×0.65 and vertical anchor0.64, centered board and bottom clue arrangement. It preserves all native cells/end caps/RNG, lines, numbers, crossing glyphs, full lyric and four clue lines. No text, seed, circle or delta is hardcoded.

Run `python dev/avoidance/crossword85/family85c/run-tests.py /path/to/repository`. The portable runner verifies manifests, regenerates in a temporary directory and compares bytes.3601 checks/576 synthetic states/24114 requests compare exact ordered values, RNG and nominal return boxes with the tracked approved58A factory, plus family lyric order and size invariants. Utility RNG/color/easing are real; chunking/romaji/draw recorder are synthetic.

The old58A reference omits chunksK and throws on words longer than native maxRow. The initial portrait HELLO WORLD test exposed that reference limitation; the failed test is preserved outside Git. The reference comparison is therefore explicitly limited to texts within seven nonspace glyphs. Longer/multiline inputs are unqualified and must not gain safety authority from this test. Current-source extraction includes native chunking, but no current actual long-input rendering is certified here.

This family does not derive a translation, measure actual fonts, prove readable sizes, create supports or grant owner/frame/plan/UI authority. The next actual pilot compares this family to the approved semantic reference at current8fonts; subsequent input-derived support/placement must reject insufficient space conservatively.
