# Domino all-native source invocation descriptor82b — unregistered

Supplies the complete native ground/tile invocation sequence from82a geometry/pose: ground line; JS-transformed shadow and side polygons; transformed rounded face; pips divider and every seed-selected pip; affine glyph with original miAt/hold/alpha/font/size. Ground remains independent of tile visibility. Source calls with zero alpha are retained as invocation descriptors, not counted as positive Canvas paints. Palette values must be supplied from unchanged native colour helpers. PIPS table is verbatim from unchanged native source.

All geometry and transform operation arguments preserve native order, including signed zero and JS polygon transform versus Canvas root*M paths. This does not implement/read actual Canvas CTM rounding, lineWidth setter readback, shadows, raster AA support, text metrics or source text delay gate: the glyph item is the exact argument to native drawAff, and its downstream mainDraw gate remains a separate requirement. No source render/HTML is modified and no descriptor/adapter is registered into rendering.

Rows/gi are supplied by native rowsOf iteration. Halfwidth space skips gi but preserves row j for exit delay/last-tile tests. No fixed109px or any offset/candidate exists. Native x clipping is left unchanged: no added clip, shrinking, source-X translation or disappearing parts. Future source-Y candidate and actual matrix verification must retain this behavior, all primary parts and clocks. Existing approved source75 upper-circle/one-row is not expanded; ordinary circles/two-row avoidance remain unqualified.

Run:

```
node parts-test.cjs /path/to/repo/src/11p_layoutsD.js /path/to/82a/native-geometry82.js
```

5040 checks execute the unchanged full native domino render function with test-only source primitives/colour/row/Canvas-operation stubs and compare complete invocation traces/matrix arguments plus RNG calls to these descriptors:4row patterns,spaces/duplicateJA/two-row arithmetic control,pips on/off,7seeds covering all pip counts,10entry/held/exit times,3pOut states. This is source arithmetic/ordering fidelity only; actual Canvas, Unicode segmentation, wholeclock support, readability, owner/certificate/frame/cache/UI and practical preparation are unqualified. No existing media is read or generated.
