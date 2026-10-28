# Generalized G68 standalone work checkpoint

`geometry68-generalized.js` is an unconnected copy of the current source-only G68 candidate. It adds a bounded input-derived `recipesFor(text)` and an optional `recipeFamily` argument to pure finite selection. The legacy four fixtures and default selection behavior remain available for old tests. A table marked qualified by a test is synthetic input, not a real source certificate.

No build, HTML, D adapter or normal UI loads this file. Native D/proof69/adapter69 changes and their slow whole-paint runtime path are not included in this checkpoint. This does not qualify generalized rendering, destinations, cache behavior or performance. Product source/build alignment is a separate future step.

The input domain is1–16code points, each exactly one Intl.Segmenter grapheme, with no whitespace, marks, format/control/surrogate code points, regional indicators or emoji modifiers. Explicit rows/complex clusters are rejected with a typed reason; text is not silently flattened. The optional family preserves full character order, duplicates and the source's code-point indexing convention.

Run `node dev/avoidance/bulbs80/geometry68-generalized-test.cjs` for factory/domain/default-selection/optional-family checks. No native renderer, proof engine, browser or Canvas is required.
