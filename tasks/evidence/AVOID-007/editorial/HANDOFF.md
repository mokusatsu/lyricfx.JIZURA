# AVOID-007 isolated editorial implementation handoff

Status: local numeric verification passed; parent code/result review pending. No visual acceptance, six-face final fixture, shared integration, commit, push or publication performed. Model gpt-6.1-sol / medium as assigned. Working tree `/workspace/avoid007-editorial-tools`, detached immutable HEAD `e96cbb2f8379eb5895c36f1312f5083b0c583e75`.

## Isolation and exact patches

Sparse worktree excludes review assets. Initial read-only shared snapshot at `2026-10-22T06:06:59.386167+00:00` is recorded by `../editorial-snapshot.json`. Every snapshotted file except `src/11p_layoutsB.js` and prototype `src/09e_layoutsB_placement.js` still matches that initial hash. `09f` is new. The shared repository was never edited by this worker.

- New module: `../src/09f_layoutsB_editorial.js`, also `09f_layoutsB_editorial.patch`.
- Integration source hooks: `11p_layoutsB.patch`, only credits/typeSpecimen blocks. Do not copy the whole 11p file over the main worker's independent changes.
- Thin integration prototype: `09e_layoutsB_placement.patch`; main worker must adapt it to current budget/cache infrastructure, not replace their 09e file.
- `baseline-11p.js` SHA256 `ba893aa7379507f108b2f8d7bed8372b15c5ce29259a7a2a269deca1632b109a`; `baseline-09e.js` SHA256 `da31ee1cc993173f49fa35bc23eba73adf1391a26880d03e89edd787ead7bd39`. Both are proven equal to the initial snapshot hashes. Initial baseline was reconstructed from untouched blocks and verified against those hashes before making the delivery diffs.
- `final-manifest.json` pins final source and test hashes. Immutable e96 11p used by the independent oracle is `immutable-11p.js`, SHA256 `3cf4fd059e72d1748f96af01f9eedddd8a33e977bc88f2f887a727e4698ada82`.

## API and integration

`A.layoutsBEditorial`: `supports(id)`, `envelope(program,plan,cut)`, `fitBounds(program,plan,cut,envelopes)`, `candidates(plan,cut,program,explicitSize)`, `sourceMapping(native,prepared,cut)`, `quality(program,plan,cut,{native,explicitSize})`, `wrapLabel(text,font,size,width)`.

Load is lexical after 09e, before 11p; calls resolve at runtime. Route native envelopes and native credits fitBounds through the module. Existing native joint translation remains first. On its failure, for each candidate: record source-envelope; validate sourceMapping and quality with native original program plus explicitSize; compute envelope and fitBounds; run joint solve. Adopt only safe results. Do not reset scroll or derive a new scroll period. Native source-envelope must set pIn1/pOut0 and all late local events must be enumerated. `11p` proof flags enumerate all cells even when source lt is negative/short.

The prototype itself does not implement shared per-cut 128-unique reconstruction or common candidate reuse; main worker is responsible for inserting the hook into its existing bounded machinery. Module returns <=42 candidates per typeSpecimen region and 6 per credits region, <=64 each. Explicit typeSpecimen restricts enumeration to size1. Copies, labels and source-owned rules remain primary; unknown ownership is rejected.

## Source and geometry

Credits preserve native signed `scroll % block`, native floating-point arithmetic order `vals.length*rowH+rowH*2`, speed/off, rowH/block, dedup-by-trimmed-value and first winning label, rowID, rep<12 and all native alpha/viewport/band gates. Native phase gates use nativeFs even when candidate text is enlarged to readability floors. Candidates pair the separate main lyric and ordered scrolling records in opposite horizontal lanes. Main wraps at original main size. Semantic row values, all labels and repetitions are retained. Source geometry stores surviving original record origins (line/chunk/segment/note codepoint offsets, romaji transformation, generated LINE/TIME input fields). Unsupported source mapping rejects.

Analytic credits support: actual source yy passes edge fade only within [.02H,.98H], then each label/value retains its own exact baseline offset and measured glyph ink. Source-envelope records every finite row and rep with an analytic placementSweep covering that entire corridor, independently of any sampled visibility. All records use that same native clock. Camera/AA support uses the shared native bound. fitBounds permits only native scrolling records to cross the original Canvas screen y edges; x must fit. Fixed main and source-owned separator must fit on stage in both directions. No circle clipping, primary opacity change, or static-main cropping is introduced.

TypeSpecimen preserves actual native count g2=4/g3=6/list portrait=5/landscape=4, font per cell, main role/accent/thicker rule, caption num/name/weight and global index/delay .06+.07i. Rules bound their full [0,1] lengths. Secondary text has analytic [0,1.5cap] y drift; full main is separately protected. Ordered two-band packing first keeps every measured native face size; then only explicit discrete [.95,.90,.85,.80,.75,.70] scales are tried. Actual fontSize is fixed, not recomputed from candidate fitSize. Caption wrap preserves exact text and spaces, with inserted newlines only. `quality.nativeFaceSizes`, `actualFaceSizes`, `faceSizeChanges` and fontScale expose every reduction; native main-to-secondary actual size ratio is preserved. There is no invented universal 1.2 ratio: g2 native geometry itself is ~1.1946 in this fixture. Native main color/rule/role remains unchanged.

## Commands and final results

Runtime Node `v24.19.0`; Chromium `/usr/bin/chromium`; existing shared dev/node_modules symlink, existing lockfile only. Local server/browser calls used network-enabled permission; no external download, proxy/CA/TLS modification.

```
python3 build.py
node --check src/09f_layoutsB_editorial.js
node --check src/11p_layoutsB.js
node --check src/09e_layoutsB_placement.js
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-editorial-focused.cjs
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-editorial-controls.cjs
```

Final focused run: `focused07.log`, compact `focused.json.gz`: 16 cases = 13 safe, 2 honest insufficient-space (portrait list and very long lineText/note), 1 unsupported negative speed. 596 actual playback observations checked full envelope containment and safe circles where certified. Independent Node circle oracle checks all adopted analytic envelope polygons. Safe standard cases retain 1920x1080 r.2 at cy.42 and .5. g3 accepts .90 native face sizes; g2 .95; landscape list1.0. Short .15/.3/.6 durations at start7, late .8-second tail and negative offsets retain all source cells and pass actual frame checks. Portrait list still proves its original five source copies, but does not falsely certify a layout.

Independent expected records/cells use executable construction blocks extracted verbatim from immutable e96 11p (not current instrumentation). Original clean/romaji helper semantics are supplied; J.chunkText/J.segments/J.glyphCount/J.fmtTime are unmodified snapshot functions, no condition-altering stubs. Oracle independently builds raw codepoint occurrence offsets and expected full-copy ranges. Nine meaningful negative mutations rejected: credit origin duplicate offsets, missing row, wrong label, duplicate row copy, wrong row font, shifted specimen range, duplicated specimen copy, wrong specimen font and wrong caption. Exact per-face size ratio=declared discrete fontScale is also asserted.

Controls final run: `controls02.log`, `controls.json`: immutable e96 original handlers independently compiled via proxy J (register only captures, no source changes). Current non-opt-in render is byte-identical as canvas dataURL across credits center/side/single and typeSpecimen g2/g3/list, portrait+landscape = 12 branches, 96 frames. OFF/lock/manual = 6 controls preserve legacy behavior and stage. Explicit scale1.3 remains1.3: credits certified without reducing native main size; typeSpecimen honestly insufficient at scale1-only. Native actual row text/font/alpha and emission clock agree at 3,963 times (three variants, off=-9, duration20 includes negative remainder, zero crossing and multiple phases); no source-envelope override in that comparison.

## Failure history

Logs are retained as small gzip files. Early test01 had a test-generation extra parenthesis; fixed. Test02 lacked local listen permission (EPERM); reran with required network permission. Test03 had insufficient type strip due unwrapped long captions; fixed caption wrap. focused01's negative font mutation exposed an incomplete independent expected-font assertion; strengthened the oracle, then passed. Earlier strip prototypes passed geometry but used implicit fitSize; parent identified adopted discrete-scale contract violation, and those candidates were removed. focused04/05 then exposed native g2 hierarchy being below an invented1.2 ratio; quality now preserves the measured native ratio rather than changing source hierarchy. Final focused07 and controls02 are the accepted local numerical runs; earlier successes do not certify final behavior.

## Not verified / remaining integration

Single-Noto fixture is geometry only. Main worker's six real distinguishable loaded-face fixture and isolated visual reviewer must judge actual typeface meaning, natural layout and readability. No screenshots were inspected/sent by this worker. Actual-font raster coverage, all25 regression, performance, video, network font downloads and publication were outside scope. The per-cut128 budget/cache integration belongs to the main worker. Parent must review source and results before integration. No local commit was made; no cherry-pick/shared write/push/publication occurred.
