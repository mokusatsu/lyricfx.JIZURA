# Contour body/underline/metadata no-paint support84f

Unregistered source-only unit. Run `python3 run-tests.py /path/to/repository`.

For the fixed plain source profile, the sampler takes fresh84b body arguments, uses the original layout→item translate→glyph translate sequence, native font readback and actual ink. Nominal boxes use the original drawItem arithmetic/order, so the bodybb feeds native underline and metadata requests without substituting an ink bbox. Body and metadata glyphs receive1fontpixel/2devicepixel outward support; the singlebutt underline receives actual readback half-width/2devicepixel support. Metadata and underline retain ghost=false; requests remain declared even when ghost passes skip paint. No paint methods are called by the sampler.

Supported input is960×540, cut/still/none, scale1/filter-off/plain unmasked source, current dela body and mono metadata, native parameter ranges and at most16 nonspace codepoints/64UTF16 characters (the native contour planning fit range). Other input is typedunsupported. Numeric delta is caller-supplied at this low level and grants no circle safety. Underline joins are not assumed miter-safe for arbitrary polylines: only the source's two-point line is accepted.

Serialized accounting includes source/body/request data, layoutW/H/N properties that JSON arrays otherwise omit, append outputs, retained bodybb/after work, current glyph/layout work and result copy, plus4096 control. The ceiling stays8MiB; native surfaces, global metrics cache and JS/encoder heap are separate. Source helpers can populate metrics cache without revision changes; no side-effect-free claim is made.

15 pure checks use real codec/affine with synthetic requests/layout/Canvas and verify bb/ordered roles, ghost/empty branches, delta, exceptions/restoration and budget. Actual84g uses fresh current input/ctx against existing84c remaining20paint (19glyphs/one line), with no new Contour frame. Source-only sampler outputs and supplied contexts cannot grant owner/frame authority. Half painting, input-derived placement, wholeclock/circle/quality, owner/plan/UI remain unqualified.
