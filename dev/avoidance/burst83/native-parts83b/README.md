# Burst native source-call descriptor83b

Source-only, unregistered. Layout dimensions/text and resolved native palette colors are synthetic inputs in this unit. Text fitting, actual palette resolution, Canvas state/CTM/metrics, positive paint support, quality, candidate safety, ownership and UI are not implemented or qualified here.

The generator copies native ring/ray/debris/star/glyph emission in source order, replacing only primitive/mainDraw calls with data records. The q<=.01 branch returns already emitted descriptors rather than discarding them. It preserves 28 ray attempts with RNG skip, twelve debris attempts with size gate, both k=1 star invocations (shadow then outer plate), the other two stars, and the full mainDraw item. Motion/star arithmetic comes from83a. Ring and rays retain line width/alpha/ghost arguments; all calls remain primary in future ownership. Dead alpha/ghost calls are potential source calls, not an actual paint count.

The API takes resolved A/B/dark/onA colors. It does not approximate palette logic; that upstream native dependency remains to be extracted. The source layout is likewise supplied, not refitted or guessed. A future two-line half-size recipe must derive size from the original native fit, then measure its own text and rebuild all plate/line/debris geometry. It must not remove pre-cull ring/rays/debris, freeze held q/boil, reorder glyphs or use a fixed text/seed/offset branch.

Regenerate with `python prepare-source.py /path/to/src/11p_layoutsD.js`.

Run `node parts-test.cjs /path/to/src/11p_layoutsD.js /path/to/src/01_util.js /path/to/native83a/native-geometry83.js`.

2597 checks compare every descriptor, cull result and RNG/easing trace against the original native body under actual utility math, with two synthetic dimensions/texts, entry/held/exit clocks, main/A/B, seeds, and line/debris toggles. A zero-q main case explicitly retains ring, rays and twelve debris calls with no star/glyph. These are numerical source-call tests, not native Canvas coverage. Independent generation is byte-identical.

Next connect native input/layout/palette and exact font metrics, then actual unbound fidelity and whole-clock supports. Old source77 runtime paint scans and frame-time model acquisition remain excluded from the new design.
