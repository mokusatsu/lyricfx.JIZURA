# Equalizer repair02 — full native meter height, one native row

This candidate supersedes the proposed equalizer01 candidate only. The original01 bundle and all receipts remain immutable and **not accepted**: independent visual review found that its height .45 × font .8 made native vertical meters into shallow boxes. The old 25-layout/selected5 artifacts also remain unchanged. No public result verification is performed.

The new equalizer-specific order keeps native joint translation first, then tries horizontal pitch compression while preserving native font/height, then height .85 with widths reduced proportionally, then existing discrete font reductions. Width levels are 1/.7/.55/.45/.4. Invalid native row/per combinations remain rejected. Candidate enumeration uses actual `nativeGeometry` including whitespace slots; a worst-case horizontal glyph ink comparison plus minimum gap rejects colliding glyphs before geometry admission. Up to62 candidates stay within the existing64 region/128 cut limits; rejected-overlap candidates reduce this count. Native portrait two rows are retained, never increased.

Main/peak widths and thin widths follow pitch. Any .85 height fallback also multiplies main/peak and thin widths by .85. `prepareCandidate` checks every main/thin maximum height-to-width ratio is at least its native ratio. This prevents the shallow-box regression under different radius/location conditions. The actual signal function, beat/noise/energy/peak history, source occurrences, whitespace slot indices, clocks, common chart owner and baseline grouping remain unchanged. OFF retains original drawing arithmetic (all added factors equal1).

`equalizer-row03.json` passed11 focused conditions: 7 certified,1 portrait honest insufficiency,3 explicit/manual/lock legacy controls. Native row count remains1 for landscape/2 for the portrait example. There are21 rejected recipe mutations (per/row/shallow height),48 actual native-versus-adapted normalized signal comparisons,9 exact OFF/e96 RGBA comparisons and exact warm trajectory equality. This is a limited numeric regression, not all conditions/performance or visual acceptance.

The standard1920×1080 central radius.2, seed704, `風の先へ` example uses **font1, height1, pitch.4, one row** for default mirror and explicit bars/blocks/mirror. The native414.72px maximum main height stays414.72px. Main width174→99.072px, height/width2.385→4.186; thin ratio13.395→33.488. Minimum actual glyph ink gap18.12px exceeds the6.048px floor. The whole meter is translated[575.6054011444858,0] to the right. Radius.35 lower-position example now succeeds at font.8/height1/pitch.4; portrait native2row remains insufficient. Space/newline case succeeds at font.8/height.85/pitch.55 and keeps the native whitespace-dependent signal identities.

## Native bundle02

`work/avoid007-equalizer/equalizer-row-20261022-02/` has31 files totaling24,272,574 bytes including manifest. Both videos are1920×1080,24fps,96frames/4s;8 native key PNGs remain at3/15/36/90. The after stream is newly rendered directly from Canvas PNG into the unchanged H264 encoder. Before MP4/4keys/96hash records/initial are copied as exact raw bytes from01, which had already matched exact e96 original96PNG/RGBA frames; `inheritedBefore` records the original manifest SHA and no rerender/transcode. All same source/text/seed/fonts/clock conditions are retained.

Manifest SHA256: `88c6fa4f9f92d49edf404f4b34ee950494237e843706c810093b117608bbf30a`.

- `index.html`, `en.html`: small comparison pages explaining original font/height and40% pitch.
- `videos/equalizer-{before,after}.mp4`:2 videos.
- `images/equalizer-{before,after}-{3,15,36,90}.png`:8 native keys.
- `observations/*`: actual initial plans and192 native frame PNG/RGBA hash records.
- Pinned engines, fixture,8 font bytes, original-main manifest and numeric03 provenance.

Execution:

```
python3 -B build.py
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-equalizer-row-test.cjs > tasks/evidence/AVOID-007/equalizer-row03.log 2>&1
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-equalizer-review.cjs > tasks/evidence/AVOID-007/equalizer-native02.log 2>&1
node dev/avoidance/layouts-b-equalizer-files.cjs > tasks/evidence/AVOID-007/equalizer-native-files02.log 2>&1
```

All three receipts have prelaunch immutable gzip snapshots at their matching `*-snapshot/` paths, with all end inputs unchanged. Capture02 server cleanup succeeds. Files02 independently verifies all31 sealed bytes,192 native records,8 actual PNG records,2 codec probes and both decoded H264/native-key metrics. Existing cleanup01 failure is retained and not relabeled successful; its correction was separately qualified by `equalizer-close01.json`.

Implementation owner did not open images or videos. Parent source/numeric review and isolated visual review remain required. No commit/push/deploy, public URL check, broad25 recapture/performance, source changes beyond equalizer and generatedJAEN, or008 implementation was performed.
