# Domino current-input sampler82d

Unregistered experimental source unit. The accessor is inserted immediately before native domino registration; removing that exact fragment restores the unchanged native source. Original native render is untouched. Reproduce with `python prepare-source.py /path/to/native/11p_layoutsD.js` (expected SHA in boundary.json).

Dependencies: native-geometry82.js from82a, parts82.js from82b, affine-support82.js from82c, existing tilesProof48 and exact codec. Load those before scalar-support82.js. sample(env) uses current input, native private rows/palette helpers, native transform operation order, actual Canvas matrices/lineWidth/TextMetrics, and outward affine support. It performs no paint. Serialized working accounting has an8MiB cap, includes caller reservation and current row/tile/layout/metric work; this is not JS heap/RSS.

Executed82e used these exact sampler/accessor bytes. Its held n60 JA seed1206 three-own comparison matched normal native paint/root/clock/RNG and12 glyph matrices/font/metrics; parent independently contained40 positive paints with Fraction. No other clock, whole-clock model, displacement/circle solution, quality certificate, owner, runtime or UI qualification follows. Source-X clipping remains native; no fixed109px offset, new clipping or ordinary-circle/two-row avoidance is provided. Potential source supports are not actual paint counts.

The82d initial observer failure and82e measured-gradient correction are retained outside this source unit.82e recorded real frame-prefix gradient creation/CTM/stops and exact identity before layout, preserving unknown-material rejection and restoring wrappers. No product guard was relaxed.
