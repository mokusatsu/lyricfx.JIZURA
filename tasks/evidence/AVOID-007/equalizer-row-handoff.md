# Equalizer native-row repair — local candidate, independent review pending

The latest user rejected turning a horizontal level meter into two rows. This equalizer-only change keeps `nativeGeometry.nativeRows/nativePer` from actual `slotsOf(text)` including whitespace slots, the original baseline grouping, frequency keys, source occurrence order, native noise/beat/energy/peak clock, and the whole chart's common placement owner. It does not change the other 24 layout draw blocks. The old 25-layout/selected5/rain artifacts remain immutable history; this candidate is a new source identity.

Product changes are confined to `src/09e_layoutsB_placement.js` and equalizer's block in `src/11p_layoutsB.js`, plus rebuilt JA/EN HTML (`python3 -B build.py`). Native joint translation remains first. Subsequent candidates keep native rows, try native font with bounded height levels 1/.85/.65/.45 and slot-width levels 1/.9, then the existing discrete font levels .95 through .70. Height adjustment precedes font reduction. No new baseline, disordered wrapping, glyph-only displacement, circle mask, or explicit-size override is added. This deliberately adjusts maximum meter height; it does not claim unchanged amplitude.

`equalizer-row02.json` is the successful local focused run: 11 conditions, 6 certified automatic conditions, 2 honest insufficient automatic conditions, manual/lock/explicit legacy preservation, 12 invalid per/row recipe rejections, warm/cold trajectory equality, 48 actual normalized main-band signal comparisons across native clock/beat conditions, and 9 OFF raw RGBA comparisons against exact e96. All 8 staged conditions retain native row count, including the insufficient portrait native two-row example. The default 1920×1080, central radius .2 case uses one row, fontScale .80, widthScale 1 and heightScale .45. Bars and blocks examples retain full native font. Radius .35 at low position and the portrait long-line example remain insufficient. This is a limited numeric gate, not all durations, camera variants, performance or independent appearance acceptance.

The first focused run `equalizer-row01` failed because its negative comparator expected A.record to throw; A.record actually converts draw errors to explicit unsupported diagnostics. The corrected comparator in run02 checks `measurementSupported=false` and `NATIVE_EQUALIZER_ROWS`. No product change was needed for this correction.

## Native comparison

Fresh local candidate: `work/avoid007-equalizer/equalizer-row-20261022-01/`.

- `index.html` / `en.html`: comparison UI; no public URL used or checked.
- `videos/equalizer-before.mp4` and `videos/equalizer-after.mp4`: original native 1920×1080 animation only, 96 Canvas PNG frames directly piped to the unchanged shared H264 encoder at 24fps, 4 seconds.
- 8 original native key PNGs at frames 3/15/36/90, 192 frame PNG/RGBA hashes, pinned fixture/engines/eight fonts and numeric provenance.
- Before is exact e96 normalized full-stage native rendering. Its entire 96-frame PNG/RGBA stream matches original main02's equalizer before. After uses the new one-row adapter with the same conditions/fonts/source clock.
- Manifest SHA256 `b98ce4c11cd3f6fe84b67e3d357ce7db3d1dfffde53ea32836a571b573cc78a9`.
- 31 files including manifest, 24,167,224 bytes. Original assets were not transcoded or replaced.

`equalizer-native01` rendered and sealed both streams/HTML/manifest, then failed in cleanup because its original executable called nonexistent `local.close` instead of closing `local.server`. Its browser had already closed; the remaining loopback server was terminated. Preserve this failed wrapper receipt and prelaunch executable snapshot. `equalizer-native-files01.json` separately verifies all its original prelaunch pins unchanged, all sealed raw bytes, 192 native frame records, 8 actual PNG records, both codec probes and decoded H264/native-key quality results. It qualifies the sealed capture without rerendering or pretending the wrapper passed. The current reusable capture wrapper corrects only server cleanup; that correction was syntax-checked, not used to produce this existing bundle. The actual executed version remains in the capture01 gzip snapshot.

## Current product identity

79 source files, SHA256 of sorted JSON `[{file,sha256},...]`: `c3734ff3bb54d59f78268b3bc2eb917df0d727b2f5810aeff721cf6fe40ba826`.

- JA `5b611a6dfd44f344a4709d2cf0f2e0666a8b74c1db621e64dea1cc2a7131ace1`
- EN `1876e7d14ca0f0cd6ec61498f5e1484cec78eb43605b54977ab1e0f6ae9ec40a`
- 09e `8fc75546ecd1cb6dce8e70551df8f60a1fb677ee7dd8379a6476ab8c2834fc0a`
- 11p layoutsB `15fc85a786d8667ca6c0b0e822d010215506506f109feb08e87e43349a410ff8`

No images or videos were opened by the implementation owner. Parent code review and isolated visual review remain pending. No public result verification, commit/push/deploy, all25 recapture/performance, or AVOID-008 work was performed.

Cleanup correction qualification: `equalizer-close01.json` / `.log` records two real shared `T.serve` loopback servers, normal and intentional-error branches; both close via the same corrected `server.close` callback and end with `listening=false/address=null`. No HTTP request, browser or MP4 rerender was involved. It records exact old-executed snapshot SHA and current corrected wrapper SHA separately.
