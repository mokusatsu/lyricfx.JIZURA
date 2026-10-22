# Editorial source-native prototype checkpoint

10 IDs have registered source-native adapters: magazine, headlineDeck, contents, footnote, proofread, numbered, poster, swissGrid, dictionary, newspaper. This is an initial candidate family, not completion of general composition placement or visual acceptance. W/H stay fixed. Native joint translation is tried first; source-owned page/measure/margins follow. All real main/copy/metadata/owned plates remain primary. No public access or image inspection occurred.

## Pinned validation

- `matrix04.json`, `matrix04.log`, `matrix04-startup-pins.json`, matching startup `.gz` files, and `matrix04-end-integrity.json` pin the final source/compiled/test inputs; 8 checked inputs unchanged. Earlier matrix raw results remain intact. JA/EN compiled files were built locally; this matrix executes JA compiled source. EN runtime acceptance is not claimed.
- Node24 / local `/usr/bin/chromium`; browser requests restricted to the exact local origin. Same source-native clock, stage and pinned fonts on both sides. `index.html.before.gz` is the immutable pre-adapter compiled baseline.
- Command: `JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-c-editorial-matrix.cjs`. 170 cases: 110 variant/aspect/text/radius (.02/.1/.2/.45)/location cases plus 60 actual-face cases. Native avoidance-OFF pixel identity 170/170 is separate from ON: 99 safe-hold, 69 insufficient, 2 unsupported. 297 sampled hold raster audits and 891 per-event early/exit raster audits found no strict margin collision or new moved-stage crop. Samples supplement the source envelope argument; they do not prove all-time visual quality.
- Controls: 40 OFF/manual/lock/emphasis unchanged; 10 explicit-size cases preserve type and disallow reduction candidates. 30 short/nonfinite/external persistent-hold negatives remain unstaged.
- `boundary02.json/log`: 80 additional epoch/ghost/aspect-threshold/short/explicit-scale cases, no unexpected runtime errors, source pins unchanged. Epoch test uses eight radii .02 through .45 and seeks immediately around boundaries. Five forged zero-offset solver certificates collide with already-settled actual glyphs before aggregate hold starts; all five throw `EDITORIAL_STRICT_CIRCLE_VIOLATION` before replay. This is a fail-closed guard negative, not a successful arrangement.
- `font01.json/log`: magazine/dictionary raw fastRow CSS500/700/bold parses actual px, keeps semantic CSS identity, and rejects secondary-font floor reductions. CSS500 nearest-matches pinned regular outline; it is not an independently supplied medium outline.
- `layouts-c-editorial-fonts/manifest.json` pins eight real-face sources/subsets/licenses. New dedicated 444-codepoint corpus subset uses the original pinned source outlines; shared B fixture unchanged. Matrix actual emitted corpus: 4632 per-case/role/face glyph assignments, all assigned-face cmap-covered; symbol fallback 0, system fallback 0. Six distinct real main faces exercised. Loading a face alone is not considered corpus coverage.

## Normal central circle remains limited

Conditions: 960×540, `風の先へ`, real note `遠い空の向こうへ`, center (.5,.42), radius .2 of short side. These statuses describe the current candidate family, not physical impossibility.

| ID | Result |
| --- | --- |
| magazine | All 3 variants insufficient |
| headlineDeck | top/bottom measure .5 safe; split joint translation safe |
| contents | rows insufficient; tate measure .75 safe |
| footnote | measure .6, note margin42 safe |
| proofread | insufficient |
| numbered | All 3 variants insufficient |
| poster | All 3 variants insufficient |
| swissGrid | Both variants insufficient |
| dictionary | Both variants insufficient |
| newspaper | Both variants insufficient |

Other matrix positions/aspects do certify examples across all ten IDs. Forced long Latin poster-block and newspaper-tate violate their original source writing field and are unsupported. They retain fallback and are not counted as successful avoidance. Candidate budget is enforced before reconstruction (max16) and records (max128); successes and thrown quality errors are cached. Reconstructed/unique/cache-hit/reject counts are real instrumentation.

## Proof scope and known limits

`09h` retains exact ordered main/copy occurrences, source style/font identity, clock, shape-kind ownership, and source physical writing zones. Its present metadata event-count/per-line text/shape topology correspondence is a prototype restriction. A later ID-specific logical-owner reflow may legitimately change rows/columns while proving full copy, occurrence/order, typography/readability, ownership and clock correspondence; merely loosening validation is insufficient. Normal central-circle failures need that composition work.

All source motion uses a conservative hold/stage envelope, including contents active-state changes, magazine fold and newspaper pose. Newspaper independent x/y interval bounds include all four Cartesian corners. Circle strictness is per emitted source event, not aggregate page timing: already-settled titles/copy/plates stay strict during another unit's entrance/exit. Native stage crop is preserved only for exact native recipe/zero translation; moved candidates prohibit new crop. Source-owned planned entrance crop is distinguished from reading-phase crop. Explicit size, actual main floor and secondary floor apply independently of geometric measure changes.

Shared source fitBlock memoization has integer geometry keys. Boundary tests around the source aspect threshold passed; this checkpoint does not claim exhaustive immunity to arbitrary native cache interleavings. Runtime envelopes/strict-circle guards fail closed on contradictions. Shared helper changes belong to main.

## Failure history retained

- matrix01 found an actual dictionary moving-tab rectangle envelope omission; fixed by sweeping its full rect width.
- matrix02 field constraints were too restrictive for natural source overhang. Its immutable reconstructed inputs are explicitly labelled in `matrix02-immutable-inputs.json`; no fake capture timestamp is claimed.
- matrix03 predates per-event strict handling, actual C corpus fonts, and four-corner newspaper hull repair; it is superseded, not silently overwritten.
- boundary01 normal80 cases passed; its negative fixtures selected not-yet-visible/not-settled glyph frames and the fixture assertion failed. boundary02 targets actual glyph geometry and retains boundary01 raw failure.
- probes using end-of-run hashes are exploratory; pinned matrix04/boundary02 are the checkpoint evidence.

## Review materials and integration

`../preview01/` contains three meaningful same-condition before/after pairs: contents tate central r.2, footnote real-note central r.2, magazine mixed-script square edge r.1. Full stage rendered natively at 24fps, 96 frames; encoding output resized exactly .5 on both sides. MP4/PNG/comparison HTML are review inputs only; no agent here inspected images or claims visual PASS. All other IDs/default-circle shortages remain listed above.

Only owned source, dedicated tests/font fixtures and this evidence are checkpointed. Generated JA/EN, parent-copied09g, dependency symlinks and pycache are excluded. Parent integrates then rebuilds; no push/cherry-pick/public verification from this branch. Independent source/numeric/visual review remains required.
