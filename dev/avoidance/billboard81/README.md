# Billboard81 native helper source unit — no product registration

Baseline is exact product94023781 src/11p_layoutsD.js, stored once under baseline/ for offline reproducibility. Three candidate source snapshots are byte-identical to the reviewed81a/81b/81c proposals. They are development source artifacts, not product src; build.py does not load this directory. No generatedHTML/media/nativepaint raw is included. Historical source provenance paths are evidence labels only.

81a extracts initial native stage/board/pose/colour arithmetic verbatim at the original render point.81b extracts native font size/main item, source lamp RNG/clock and tag size/items. Native font is still the original fitSize result and brk5/9; no recipe/refit/scale change. Main/tag helpers stay inside original owned callbacks. Lamp values are computed in original RNG order; catalogue-only state recording then reads those same values with no intervening paint.

81c shares19 primitive argument factories: posts, two braces, deck/11uprights/rail, ground, frame/face, lamp arms/bodies/lenses, original main-only clip, gradient args/four cone vertices, illumination; plus scalar placement/lineWidth/beam helpers. Original methods, callback ownership, paint order, clip scope, gradient creation/stops/alpha and glyph/tag placement remain. Raw lineWidth is not a Canvas support certificate: future descriptor must honor actual native setter/readback/stroke state and antialias conditions. Source shared env is the stock plain record; no getter/custom callback side-effect guarantee is claimed.

Each generator verifies inverse whole-source byte equality for its layer. Patches are zero-context serialization of those source differences (apply with --unidiff-zero). Source candidate JS is unchanged by portable bootstrap/patch formatting. Pure81b896/81c2024 compare original source expressions and RNG/colour/helper call traces under synthetic functions;81c includes the prior896 checks. These are not actual font/Canvas/geometry/envelope/recipe/quality/frame/adapter/UI qualification.

Reproduce without external services, from any directory:

    python3 /path/to/unit/81a/prepare-initial.py
    python3 /path/to/unit/81b/prepare-text-lamps.py
    python3 /path/to/unit/81c/prepare-parts.py
    node /path/to/unit/81b/helper-test.cjs
    node /path/to/unit/81c/helper-test.cjs
    python3 /path/to/unit/verify-unit.py

Next: old stock source versus81c on the same protected visibleQt, short native timer/rAF preflight, fullRGBA/clock/material/path/clip/gradient/line state/catalog and native text-size comparison. Dedicated old72 observer is test-only, not generic record capability. Proposed offline raw cap8MiBrecord/512MiBtotal/128MiBgzip requires separate parent source/pin review/release. Fresh generalized7recipes, allprimary support model and actual input/circle proof come after native extraction verification; no fixed text/seed candidate is promoted as generalized logic here. UI preparedness is independent and still blocked by the measured9.44s final synchronous compiler step.
