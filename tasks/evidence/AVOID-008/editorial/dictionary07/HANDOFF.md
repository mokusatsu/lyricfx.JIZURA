# Dictionary logical-copy column checkpoint

This extends the editorial prototype with dictionary-only source construction. No other 11p ID changed in this checkpoint. Native joint translation and earlier native recipes remain first. A new column recipe is tried only after those fail; explicit-size candidates exclude column type reduction.

## Fixed inputs and results

`results.json` pins 100 inputs (all JS source, compiled JA/EN, launcher, fixture/test/audit scripts, eight real font files and font manifest). All start/end hashes match. Compressed copies accompany the report. Node24 and local Chromium browser versions are recorded. External requests abort. No images were inspected and no visual PASS is claimed. JA source executed; EN compiled/build hashes are pinned but EN runtime acceptance remains separate.

- 20 positive cases: entry/page × six actual main faces plus portrait long Japanese, Latin r.45, square mixed copy, and corner r.02. 12 safe-hold / 8 insufficient / 0 unsupported; no runtime errors. Native avoidance-OFF pixels equal the immutable matrix04 compiled source for all20.
- Eight real faces loaded; actual emitted main/metadata corpus734 assigned glyphs all covered by their assigned face cmap; explicit symbol fallback0, system fallback0. Six distinct main faces exercised; loading eight faces is distinct from using eight as main outlines.
- 19 forged-mapping negatives reject column candidates: omitted/duplicated/reordered fragments, altered copy/font/style/point size/reveal clock, changed physical fragment order, missing/detached definition bullet/POS/highlight/tab, and missing main text. Actual .99-native secondary point reduction fails the absolute native floor independently of the .7 ratio. `font02.json/log` separately tests real CSS500/700/bold fastRow parsing and body-floor rejection with C pinned fixtures; nearest-face parser tests are distinct from the six real main-outline tests.
- 38 native-versus-column source observations compare actual emitted occurrence text, presence and opacity at entry/reveal/exit times. All match. This evaluates actual output, not only declarative clock tags.
- Corrected makeEnv-rebound full-plate raster: 36 hold samples,36 padded-stage samples and108 per-event early/exit samples; all margin collisions0 and all new crop0. Of36 hold samples,12 quantize just before global h0 and have strictPasses0; all36 `all.marginCollision` are0, and24 strict rasters are nonempty. Do not count the12 empty strict rasters as36 nonempty strict checks.
- Global matrix05 retains all170 native OFF equality checks and50 controls: ON102 safe /66 insufficient /2 unsupported, with306 hold/stage and918 early/exit raster samples. All306 all-primary hold rasters have margin collisions0;102 earliest samples quantize before h0 and204 strict rasters are nonempty. Eight source/compiled/test/font-manifest pins unchanged. Original matrix04/failed runs remain intact.
- boundary03 repeats existing80 epoch/ghost/aspect/short/explicit cases and five forged early-settled guard negatives with unchanged assertions; passes. Shared exact fitBlock cache namespace is not copied into this branch; integration with main requires separate pinned rerun.

## Source construction and proof

`dictionaryOwned` names header, context-top/bottom row occurrence, headword, mark/romaji, POS, each definition number/copy/bullet, highlight and thumb index. The source computes native context cpr, seeded row length, seed offsets and original row counts before constructing new print fields. Every original row remains a separate occurrence; it may split into consecutive Unicode codepoint ranges. The checker reconstructs exact full text per owner/occurrence, enforces [0,total] coverage without gap/overlap/reorder, keeps kind/font identity and point floors, and compares native owner reveal clocks.

The spread recipe retains the natural reading flow: guide header, left-column context-top, headword/POS/definitions, then right-column context-bottom. The index has a separate rail. In-column fragments retain x and increase y with at least1.2 actual point sizes between baselines. Body leading is1.4fs in the spread (native1.8fs), while its actual font size stays native. Main point size is .7 native and independently exceeds the actual main floor. Generic row wrapping of all layouts is not introduced.

For default mincho page, seven native context occurrences contain338 characters total. They remain338 characters across22 source fragments at native11px. Together with guide/mark/POS/definitions/index there are16 logical metadata occurrences; changed draw cardinality is explicitly proven rather than exempted. Definition number/plate/text anchors, POS glyph/bracket containment and non-overlap with main ink, thumb glyph/plate anchor and actual headword highlight rectangles are checked. Detached shape negatives fail even if text and shape-kind sequences are otherwise unchanged.

Highlight keeps the native global action start, duration, easing and `he * currentLineCount - lineIndex` source formula, mapped onto the new headword lines. This preserves the source action clock; it does not claim identical per-glyph highlight coverage at every instant after line breaks change. Main/metadata occurrence appearance and opacity are separately compared at38 times above. All real copy and owned shapes remain primary.

## Status and limits

Default central circle: 960×540, text風の先へ, input note遠い空の向こうへ, center(.5,.42), r.2. Entry succeeds across six tested main faces. Page succeeds for mincho/mincho_bold/round; gothic_med/gothic_bold/dot remain insufficient because this candidate's native full context-copy height/field constraints do not fit. These are candidate limitations, not mathematical impossibility. Long portrait and large central Latin cases also remain insufficient. Forced long Latin source poster/newspaper cases elsewhere remain unsupported as before.

The bridge functions live in09h's closure and are exposed as immutable dictionary-only source hooks; no generic recorder/header/shared helper was edited. The renderer is still the sealed stock source renderer. Actual reconstruction/caching budgets and all per-event circle/stage guards remain active. Existing OFF/manual/lock/emphasis/explicit behavior is preserved.

## Review bundle and history

`../dictionary-preview01/index.html` serves one representative mincho page central r.2 case: two96frame24fps MP4s at .5 output, six native960×540 PNGs, exact actual source/render plan/cut inputs, emitted copy/occurrence records, frame hashes and compiled/font/script pins. Manifest SHA256 e35dbd8e57430fd8560d1cea4011d9a955772dcafe0c523404f4751752b14b31. Actual text/note/stage are asserted against the fixture. Review is pending; no image inspection/public access occurred.

Raw dictionary01–03 exploration remains. dictionary04 is a fixture-negative FAIL: CSS default400 was serialized without a weight token, so a regex intended to change weight did nothing. dictionary05+ uses a real italic mutation and rejects it. dictionary06 added actual opacity parity; dictionary07 expands immutable pins to all100 inputs. No failed receipt was overwritten or counted as success. All generated JAEN and shared09g working copies are excluded from the integration commit.
