# Parent review: bounded writing candidates

Main retains fixed859/257, committed as a5ebcd6. These new writing candidates are isolated and are not accepted merely because a stored safety field is certified.

- writing03: corrected whole-paper stage bounds, but isolated sol found heavy body rules crossing actual main glyphs. Returned for a font/leading-based primary ruling pattern.
- writing04: actual body/ruling relationship improves, but isolated sol found the original close upper double rule becoming a single header plus distant body rule. The original first thin body rule at `top` is the thick `top-5lw` header's mate. Returned for explicit same-owner header-pair preservation while regenerating only body pattern. The old FAIL/media remains immutable.
- Parent code review also found `norm(text)` dropping all meaningful whitespace in the new reflow comparison and a whole source-pixel field tolerance. Returned for strict logical text scope/softbreak correspondence, fault injection and exact measured ink placement/epsilon. These are implementation/verification issues, distinct from geometric candidate insufficiency.
- Parent initially hypothesized that `arcText` emitted separate timestamp items. Actual helper source (11p lines358–372 at the reviewed candidate) has one item and a per-glyph `charFn`, then one `env.draw(it)`. That hypothesis is withdrawn. Timestamp fragmentation is not a defect, and no fragment-mapping rewrite is required. Preserve the actual one-item/complete-copy/print-shape positive and negative proofs.
- writing05: independent sol has limited PASS over192 decoded frames and6native keys for the portrait letter fixture, with all37 asset/source/plan pins verified. It preserves all paper edges, close header pair, ruled main and No signature. The original faint fold crosses the enlarged text and paper presence/whitespace changes considerably. This is single pinned-font fixture evidence, not full-font/fold/clock/overall C acceptance. Final raw code/result review and main integration remain pending.
- Postcard remains a native fallback diagnostic for the wide test case, with94/96 PNG equality and tiny RGB-only differences on f2/f5; never recorded as96pixel-exact or avoidance success. A separate finite round/postmark true positive is not conflated with this fallback.

Parent did not view images. Image findings come from context-isolated gpt-6.1-sol / medium. Full plan snapshots for05 are now preserved as pinned lossless gzip; the old04 lacked full renderPlan bytes, and its independent planSHA recomputation remains unconfirmed.

No public-result verification is performed or requested.

## c861親の実raw受入

315startup原本、323/405/276最終条件、独立safe interval536poly/actual strict84087poly、9actualcmap、375owned/574ruling/287header、21fault/101postmarkを照合し、[限定結合候補として受入](parent-writingc861-review.json)。writing05独立sol限定PASSを接続する。折り畳み専用成功は未実証、reviewed postcard wide/gothicは不足/nativeであり成功化しない。main結合・最終C性能/回帰/必要な人間判断は未完。
