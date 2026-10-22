> Historical c3a implementation/capture handoff. Its formal performance gate failed. See [optimization-handoff.md](optimization-handoff.md) for the later source and current gate status; unpublished public04 is historical and must not be treated as the final bundle.

# AVOID-006 film band edges / ticket tear

Candidate source is frozen at JA `c3a03e4466138567b28b01e36ae6a6f6070e20c4ec0e815a8bcf2d43ed3adbdb`, EN `18f3233a887fbb1f363162f316abd188d7c5f5beac35677b58a65e91449e528f`. Starting HEAD/before is immutable `8193b0580a03f19472637807231685728d0718d7`. No 007+ work, default enablement, auxiliary-role reclassification, or ticket entry changes were made.

## Implementation

- `src/11p_layoutsA.js`: the adaptive film retains native along-axis band length `A*1.6`. Adaptive perforations cover all finite indices on that band, so replay offsets cannot remove a row at an edge. Native/OFF keeps its prior 120-column cap and viewport selection. Exposure aspect, native along-axis travel and sequential lyric reveal remain unchanged.
- `src/09d_adaptive_placement.js`: film along-axis fitting permits native band/perforation/edge-code cropping but includes swept exposure-window and non-code text envelopes. The complete primary band still participates in circle clearance. Ticket adaptive tear uses stage-derived native `[nativeW*.12,nativeH*.2]`, with 12-degree tear, and matching conservative sweep magnitude. Existing adaptive entry travel/turn remain unchanged.
- Regenerated JA/EN via `python3 -B build.py`. Existing dirty pyc and unrelated untracked files are excluded from this work. The earlier statement that this build regenerated the pyc was unsupported and corrected; parent confirmed its pre-existing mtime/hash.

## Completed functional evidence

- `before-test-report.json.gz`: pre-change nine-condition diagnostics.
- `after-test-report.json.gz` / `numeric21-summary.json`: 21 executed conditions (nine comparison inputs plus both orientations × directions ±1 × tilt -3/0/+3). Nineteen hold-certified, one full-interval certified, one pre-existing portrait r=.2 insufficient-space diagnostic. Maximum observed 88 perforation columns / 188 primary events, below recorder's 4096-event budget. The maximum is an observation for this matrix, not a bound for every input.
- `filmstrip-test.log`: 16 cases, 624 exposure checks; native aspect, movement, sequential positive-alpha text, analytic and independent alpha-1 safety pass.
- `parity.log`, `parity-report.json`: 43 existing native/OFF and accepted-adaptive conditions, 129 exact frames per side, 11 film reveal timestamps; no mismatch against fixed 8193.
- `film-ticket-off-parity.log`, `.json`: both film orientations × both directions × three tilts, plus horizontal/portrait ticket: 14 conditions / 70 frames per side; exact native/OFF PNG and observation hashes match.
- `adaptive.log`: eight anchors, 168 selected matrix rows, 32 controls, eight explicit scales, eight boundaries, 16 native-motion conditions / 80 motion frames, 576 anchor frames; passed.
- `final-candidate/fixtures/functional-summary.json`: all nine core suites pass, source/script/log hash pins and actual adaptive counts checked by existing `checkFunctionalReceipt`; see `final-candidate/functional-receipt-check.json`. Adaptive execution reused its identical-source successful log; its duration is explicitly a shell-redirection creation→last-write wall-clock approximation, not a recorded monotonic execution timer. Other eight suite durations were measured by the runner.

The first ticket-matrix assertion used 1e-6 pixel tolerance and stopped on a 1.46e-6 recorder-matrix rounding difference. The follow-up uses documented 1e-4 pixel tolerance. That first `after-test.log` was overwritten before the retention issue was noticed, so its original raw failure log is unavailable. The initial unsupported-sandbox before-capture failure remains in `before-capture.log`; supported execution then succeeded.

## Capture and public package

`before/` and `after/` contain approved native capture: nine rows × 96 frames each, directly rendering `n/24` to PNG→libx264, no HTML recording, prior-video input, resizing, transcode or diagnostic overlay. Both captures exited zero, use the same capture tool SHA `1197fe6f1dd2c5ca3f9afeeaf97b639a803af98097f2556e6ebbf4f434c0c4a8`, and preserve source/PNG hashes, observations and native keyframes 3/36/90. Every certified after frame checks strict clearance and independent polygon clearance. Each film frame classified as actual native hold also checks screen-edge band intersection, exposure/main-ink containment and perforation extent after camera and replay offsets. The numerical tilt/direction extension separately samples four hold times; it is not presented as an exhaustive animation audit.

Portrait film r=.2 remains insufficient-space on both sides. Its conflicts are diagnostic evidence and are never counted as an avoidance success. For the other five film cases, each capture has 72 sampled native hold frames; moving entry/exit alone may relax.

Public bundle is `review/AVOID-006/local-20261021-04`: 18 files / **5,927,801 bytes**, 15 unique native MP4s for 18 references, JA/EN HTML, manifest. Three existing font assets are referenced immutably, and all new PNGs/diagnostics remain private. Manifest SHA is `e86d1f4bbea73abd83ad0f9de89e6f8e8271bb30ce0f460dcd6207589058a2d5`. Initial unpublished packaging was preserved in `draft-public-04/` and `draft-private-04/` before the metadata/assets were regenerated. All captured movie bytes were kept. The page names each condition in user-facing language, states three review points, clearly labels the unsuccessful portrait diagnostic, and links the existing 26-layout comparison.

Private package `bundle-local-20261021-04/` holds all 120 pinned diagnostic assets (including 54 native PNGs, compressed key observations, both engine snapshots, compressed full capture reports and capture/review tools). Public `assets` remains the established relative-path→SHA string map; `assetBytes` is separate.

## Selective staging

Stage only the two changed source files, two generated HTMLs, three new `dev/avoidance/film-ticket-*` tools, final public bundle, final private package, this handoff/runner and selected test receipts/logs. Stage the canonical `after-test-report.json.gz` once; `numeric21-report.json.gz` duplicates it and need not be tracked. Preserve logs and small reports cited above. Huge raw `adaptive-report.json` (>100 MiB), `filmstrip-test-report.json`, before/after raw capture `report.json`, initial draft packages and duplicate raw diagnostics are local-only; **do not stage them**. Original raw files are retained locally, not deleted. Compressed copies may be created for archival if needed. Parent owns task docs, final selected staging, commits, push, Jekyll/site audit and publication.

## Remaining handoff checks

Formal unchanged performance gate, local native-frame/playback/UI validation and public validation are pending at this handoff draft. Run realtime checks after performance and extraction load finishes. CLI:

```sh
node dev/avoidance/film-ticket-edges-review.cjs validate review/AVOID-006/local-20261021-04
node dev/avoidance/film-ticket-edges-review.cjs validate review/AVOID-006/local-20261021-04 https://mokusatsu.github.io/lyricfx.JIZURA/review/AVOID-006/local-20261021-04/ FRESH_RECEIPT_PATH
```

The validator requires a fresh receipt path, records manifest and every raw asset hash/length/HTTP result, rerenders 54 private native keyframes locally, checks all 18 video references through seek/play/pause/full-duration ended/decoded/drop/corrupt measurements, and checks JA/EN pair controls at desktop/mobile sizes. Public verification checks the public bytes and playback and connects to the locally validated private source evidence; it does not repeat private rerendering. Application startup/source-public checks remain parent-owned. No local pass alone establishes publication or human approval.
