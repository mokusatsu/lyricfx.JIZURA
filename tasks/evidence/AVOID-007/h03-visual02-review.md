# Independent H03 raw02 visual review

**FAIL — new visible overlap/occlusion remains in the reviewed after captures.** This is a visual reading/overlay result, not a failure or re-evaluation of the separate numeric circle-safety gate. The existing native grouped-text overlaps are substantial; they do not explain away the new collisions below.

Target: `work/avoid007-h03/native-local-20261022-02`, build `local-20261022-h03-02`. Manifest SHA256 independently read and matched: `8f84ccb6b4f5c40156a86b91127dc541027bff89835a97426c25b2264073d32c`. Linked main02 manifest: `186580a8269d1b51f481f84001277f154722fee700226876ed0b82f3c80cbc4f`. All 238 manifest asset entries were independently hashed and matched, including actual six MP4s, 24 native PNGs, before/after source HTML and JS, eight font files, two original input MP4s and font/focused evidence. Full actual/expected hashes are in `h03-visual02-metadata.json`. This verifies linkage/integrity, not the truth of every bundled numeric conclusion.

## Examined scope

All six 3200×1080 H264 MP4s were independently decoded, 96 frames each, 576 frames total. I visually examined every relative index 0–95 for rain/panL, bubbles/push and credits/dutch, before and after. Absolute time is `3 + frame/24`: the window is [3,7), final sample 6.95833s, and f90 is 6.75s. Eighteen paired bounded sheets show 16 before/after frame pairs each. Sheet generation retained a 640×216 thumbnail per frame; the image tool displayed 2560×1904 sheets at 1824×1356. This is an explicit thumbnail inspection limit.

I also opened all 24 original native PNG keys (f3,15,36,90 on all six videos). The renderer displayed full 3200×1080 images at 2048×691. Six unscaled crops, both before and after, supplemented those views:

| Case/key | Native crop x0,y0,x1,y1 | Purpose |
|---|---|---|
| rain/panL f3 | 600,0,1500,290 | New lyric/clock intersection |
| bubbles/push f90 | 2220,60,3020,600 | Foreground panel occluding a newly relocated glyph/bubble |
| credits/dutch f3 | 450,370,1350,680 | New recap/primary collision |

Extraction and crop derivatives are only in fresh `scratch/avoid007-h03-visual02-sol`. Original media, sources, tests, Git and publication were not changed. The two report files are the only authored evidence outputs.

## Findings

1. **Rain: new lyric/clock collision.** The after upper serif `風の先へ` recap crosses the large `BACKGROUND` heading/time near the top. Native f3 confirms the white `先` over the clock heading, whereas before has only the much smaller rain decoration there and the main text near the center. The same upper recap collision remains visible in native f15,36,90 and the decoded sequence. This is a new overlay intersection even though the underlying media rectangle/clock itself stays put. The after center becomes a left/right arrangement; at f15 the left `風の` also shares space with incoming `を`, and later frames accumulate multiple fragments on each side. Before already has severe central fragment/recap overlap; those inherited overlaps prevent a general reading PASS, but are separate from the new upper clock collision.

2. **Credits: new relative placement collapses previously separated primary/recap occurrences.** At native f3/f15, before has a left serif `風の` recap and a separate central bold run. After puts the bold `風の先へ` start over that left serif occurrence. The unscaled f3 crop shows the two `風の` occurrences superimposed. This is not merely a pre-existing central overlap translated as a rigid group: the relative relationship of those visible occurrences changes. From roughly f20 onward, later serif fragments (`越えて`) also occupy the left cluster, and from f45 onward more retained native cuts accumulate. At f90 both versions are heavily overprinted, with after split into a dense left pile and a smaller right pile. A claim that every primary occurrence remains legible would be unsupported.

3. **Bubbles: new foreground occlusion target and new visual stacking.** After places the first retained characters/bubbles into a compact left column rather than the before horizontal row. At native f3/f15/f36 the white `先` lies against/over the cream media bar, reducing its contrast; before that `先` sits clear of the bar. Glyphs stay associated with their enclosing bubble shapes in the examined frames; I did not see a shape detach and continue independently. At native f90, the newly right-positioned `越` and the upper part of its owned bubble intersect the foreground panel's bottom edge and are visibly cut off there. The exact crop confirms the panel covers their upper parts. Before already has proximity/occlusion of a different upper ring/`へ` around the panel, and extensive central glyph overlap; it does not put this `越` at this edge. Thus some overlay problems are inherited, but the changed affected occurrence is a new consequence of the after placement. Later text is more spread out overall, yet local retained-fragment overlaps still prevent a blanket reading PASS.

These are visible reading/placement concerns. I do **not** classify an obscured glyph as deleted from the engine, and I did not identify a definite new entire-cut disappearance. Likewise I found no definite detached owned component or new one-frame teleport in the examined discrete sequence. Dense overprinting limits confidence in tracking each individual occurrence; absence of a detected deletion is not proof that every occurrence is independently readable.

## Motion, clocks and media

The brown background frame, green block, cream bar, blue foreground panel, pink moving block and foreground cream bar continue through all examined sheets. Their before/after positions and progression look consistent at matching frames; I saw no new blank frame, source-animation restart or abrupt media jump. The large background and small foreground clock labels agree at the native keys (3.125, 3.625, 4.500, 6.750). Decoded adjacent frames sometimes repeat a source timestamp (for example f1 still shows 3.000, f2 shows 3.042); this appears on both sides and is not evidence of new after clock drift. The upper rain lyric makes portions of that clock harder to read after.

The lyric/decorative motion progresses across the sequence (rain falling entries, gently moving bubble rings, credits drift/tilt), with the same broad reveal transitions around the matching frame ranges. Contact sheets can reveal gross changes but are not real-time playback, optical-flow proof, a subframe timing audit or proof that camera transforms are numerically equal. Native PNGs were judged separately from lossy MP4 pixels; no exact PNG/video RGB or before/after equality is asserted by this review.

## Limits and disposition

Only these three actual conditions were examined: 3200×1080, seed704, circle(.5,.42,.2), the supplied eight fonts, and absolute [3,7) at 24fps. The eight native fragment/recap cuts were treated as retained native group content, not three manually extended lyric cuts. Times before3s or at/after7s, other radii/aspects/seeds/fonts/groups, the eventual7.5s retention endpoint, UI/audio, continuous subframe motion, and all288 frames of the input sources were not visually audited here. Source MP4 integrity was checked by hash. Product circle safety and exact media geometry/RGBA proofs remain separate numeric evidence. Group collision012 and auxiliary mask018 remain uncompleted; neither was used to excuse the new regressions above.

This review covers the actual sealed raw02 manifest/native media only. No future package that losslessly gzips JSON has been reviewed or accepted here.

All extraction processes completed. A final `pgrep -af '[f]fmpeg'` returned no processes: ffmpeg/CPU released before subsequent playback work.
