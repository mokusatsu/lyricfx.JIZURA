# H03 supplemental integration — approved plan, not results

The 25-pair native bundle has no fixture media and no retained group. Runtime02
tests camera/ghost/seek but does not establish H03's background/foreground video
and long retained-group requirement. `media_cut_compositing_test.cjs` uses Canvas
images and empty lyrics, so it is not a substitute either.

Parent approved a separate focused helper and prelaunch-pinned diagnostic on
2026-10-22. No frozen source, fixture, tool, config, or 25-pair output is changed.
Run after that bundle's capture and validation, without concurrent heavy work.

Use a real project with `{` scene grouping and three lyric lines at 0, 3, and 6
seconds, duration override 12. Let actual `J.plan` / `J.finishLyricPlan` generate
group IDs, retainedCutIndices, slotEnd, end, dur, displayEnd, groupExit and
groupOutDur. Record and assert these fields without manually extending them.
The native source at `08e_lyric_features.js:226` sets group displayEnd to the last
cut end, preserves original slots as slotEnd, and updates end/dur; the renderer
uses `J.lyricCutsAt` and `J.lyricRenderCut` for retained rendering.

Three fixed cases: rain/pan, bubbles/push, credits/dutch, seed704,
3200×1080, circle center(.5,.42), radius .2 of short side. Native project
overrides select layout/camera and supported ordinary effects. Before uses the
exact e96 engine and sources copied into the 25-pair bundle, not current code
with the B switch disabled. After uses the same frozen current engine. Fonts
and actual decoded media bytes match both sides. Full-stage original geometry
is explicit, as in the main comparison; this is not the legacy small-area ON
control.

The native `J.plan` params are deep-copied and retained exactly. Do not invoke
`layout.plan` again using the extended group duration. Explicit fixture geometry
changes only area/contentScale and common style/FX/camera conditions; retain all
native timing fields and compare params/lifetimes before and after the fixture
step. Record any finalizer params difference and recipe witness. An unsupported
or insufficient result is retained rather than replacing native params for a
more attractive result.

Generate two deterministic 12-second input MP4s from raw Canvas pattern frames
through ffmpeg. Both contain time-varying fiducials; background covers the stage,
foreground occupies a fixed small window. Register actual HTMLVideoElements in
`J.mediaAssets`, construct both media layers through `J.planMedia`, and await
`J.prepareMediaFrame` plus decoded frame readiness at each seek. Keep all media
geometry independent of the B placement result.

Historical proposal (withdrawn after native-plan inspection): .5, 3.5, 6.5, 9.5, 6.5, 3.5, 9.5, .5. Current approved seek order: .5, 2.5, 4.5, 6.5, 6.5, 4.5, 2.5, .5. Record decoded media times,
readiness, nonempty placement observations, retained source identities and
clocks. Compare repeated composite RGBA within each engine, and background and
foreground layer-only RGBA between engines. Assert each media layer is nonempty
and changes over time. Deliberately alter media position and time to show the
comparator rejects those changes. Report all three actual safe / insufficient /
unsupported outcomes, without silently adjusting or dropping a case.

Only after parent review of the focused results may successful cases become a
separate 3-pair native comparison: 96 frames at 24fps over absolute time[3,7) (the former [6,10) proposal is historical and withdrawn),
key PNGs, JA/EN HTML and manifest. Link this separate H03 bundle from the Sites /
Pages bridge; do not mutate the frozen 25-pair bundle. Do not generalize this
focused result to all retained-cut collisions or AVOID-012 completion.

Implementation prepared in `dev/avoidance/layouts-b-h03-fixture.js` and
`layouts-b-h03-test.cjs`: real group fields, same-origin isolation, per-video
decoded proof/target retained, native preparation checked not to reseek, and
actual emitted per-character font/cmap audit. The proposed three input lines
fit all seven non-symbol frozen faces without changing any font bytes.

Status: focused execution pending the main full browser gate. Supplemental
capture and publication are not yet authorized. Manifest schema is agreed with
the isolated bridge owner as `avoid007-h03-native-v1`, all three status rows
retained and media optional only for subsequently approved safe cases.

## Actual native-plan correction, approved before final H03 execution

`h03-native-plan01.json` records the exact e96 plan: three input lines produce eight cuts, all group0/retainedIDs0..7, native end/displayEnd7.5. No manual duration extension or params regeneration is permitted. Final focused expected source occurrence mapping must enumerate all eight parts/recaps and their original slot/end/clock metadata. Approved forward/reverse seeks are .5/2.5/4.5/6.5; capture is absolute[3,7). 9.5 is outside this native lifetime and cannot be required as a nonempty success. The first focused run failed its three-cut structural assumption and remains recorded. Final H03 execution awaits the new five-ID product freeze; existing input MP4 bytes may be reused only with prelaunch pins.

2026-10-22 execution checkpoint: the immutable main02 is manifest186580a8269d1b51f481f84001277f154722fee700226876ed0b82f3c80cbc4f. Full local phase-isolated browser04 passes independently of H03. H03 focused02 exposed a fixture selector mistake: raw J.plan contains8 lyric cuts plus2 empty native outro cuts. The original guard incorrectly included the outros in actualEffects. The helper now retains all10 in rawAllEffects and asserts that only index8/9,line−2,partoutro_1/2,group-null,text-empty cuts at[7.5,9.75)/[9.75,12) are excluded from the existing semantic8 selection. All8 retained clock/params/effects assertions remain strict.

Focused03 times were not logged, so no first-frame failure is claimed. Focused04 adds logging only and locates the timeout at the second consecutive6.5: first.5/2.5/4.5/6.5 succeeds for both videos, then a redundant paused same-target seek times out. The one direct.5 metadata diagnostic succeeds and does not prove compositor occlusion. Both original failures remain.

The H03-only decoded witness retains an unmodified clone of a successful seeked-plus-target-rVFC proof. It reuses it only for the same element/src/currentSrc, exact target/currentTime, paused/ready>=2/!seeking and unchanged seek/load/play generation, and labels this `reused-current-decoded-frame`. Source/time/seek/load/play changes and failures invalidate it. Both cache storage and every returned proof/witness are separate clones. General strict decoder, timeout/tolerance, order, product and main02 bytes remain unchanged; native media preparation must still not reseek. `h03-witness02.json` checks actual factory stale dependencies and fresh-return mutation attacks. Main B25 tool's90→90 renders no video; H03 tool's90→90 invokes this witness through the fixture.

Focused05 completed actual3cases but failed the runner's duplicate-row count6!=3; raw6rows and a derived pair-deepEqual explanation remain. Fresh focused06 fixes that bookkeeping only and passes all3 actual cases (rain/panL,bubbles/push,credits/dutch), all8 retained cuts/units/segments safe,8forward/reverse frames per engine,6negative records,warnings0,terminal inputs unchanged. Actual frame proofs are84fresh/12explicit reuse; negative operations add36fresh, yielding120fresh/12reuse total. Pre/post environment199/current is recorded; no environment continuity is inferred for05. Parent review and supplemental capture approval are separate, still pending at this checkpoint.

The parent accepted focused06 and authorized capture01. It stopped after rain-before96 native frames/oneMP4 at the after-initial pair guard: raw before media/foreground cut has own `placementSeed:undefined`, while the after finalizer's JSON clone omits that property. The source's Number.isFinite guard treats both reads asundefined; finite seeds remain meaningful. This is a tool raw-schema equality failure, not a proven media pixel difference. The unsealed capture01, all raw inputs and terminal pins remain (`h03-native-capture01-failure.json`). Parent has assigned a narrow tool-only optional-field equality fix with explicit difference witnesses and negative cases; shared product, fixture, generic decoder, original media and all clock/quality thresholds remain unchanged. Fresh capture02 awaits that tool patch review; no supplemental browser/public success is claimed.

Fresh H03 native02 completes under the parent-reviewed narrow tool guards. Manifest8f84ccb6b4f5c40156a86b91127dc541027bff89835a97426c25b2264073d32c indexes238assets/408,584,203total bytes,6original96frame MP4s/24native keys. Capture includes file qualification and terminal input checks. The optional placementSeed difference is explicitly indexed; known final slotEnd serialized/raw boundaries have separate strict guards. No general missing/undefined equality is inferred.

`h03-native-browser02` passes raw HTTP/JAEN4UI,6generated-video playback and2actual12-second input-video playback/seek/pause checks,6native parity and6live fixtures, all three owned browser phases closed and245startup inputs unchanged. Strict0drop/decoded/native/clock criteria remain unchanged. This acceptance is for the immutable raw02 local bundle only. Its largest JSON assets are114,774,078 and113,298,525bytes (`h03-native02-asset-sizes.json`), so the parent is preparing a separate lossless-gzip publication package with independent reader/roundtrip/browser/public gates. Raw02 JSON/MP4/PNG/source/fixture remain unchanged; local success is not transferred to an untested package. Independent H03 visual review and publication remain pending.


## Current blocking visual result (raw02)

Independent `h03-visual02-review.md` is FAIL for all3 cases: new cross-cut primary overlap and primary/video occlusion. Earlier numeric/local PASS is limited to its measured circle/source/media-clock conditions and is not visual or publication acceptance. Raw02 remains immutable and unpublished. See [scope analysis and proposed next step](h03-visual02-scope-proposal.md); no replacement control or product change has been approved/executed on that proposal.


### Separate native-control metadata01 outcome

The approved separate single:true/0,8,10 native-plan diagnostic completed all3 paired engines with281 prelaunch pins and unchanged end inputs. All3 are `native-retention-ineligible`: the actual first lyric is retained from slotEnd3.6 to11.5, but native J.plan also creates a visible interlude at3.6..8, so actual [4,8) owners are [0,1]. No interlude was removed or reclassified. No focused/capture/clearance qualification was run. See `h03-control-metadata01-summary.md` and raw receipt for the native4cut/source/clock proof; original raw02 visual FAIL remains blocked.


### Separate native-control metadata02: hold plus true retention

Parent clarified that the H03 contract does not require all4captured seconds to be after slotEnd; that was metadata01's additional proof form, and its ineligible result/guard remain unchanged. Metadata02 uses a distinct predeclared authored project (single:true, complete three lines at0/4.5/8) and proves actual membership[0] over[.5,3.6) and[3.6,4.5). All3 metadata-qualified: actual first slotEnd3.6, native end/displayEnd9.5, post-slot seeks4/4.25; all5native cuts (three full lines/two outros) and params stay present, no interlude generated.284prelaunch pins/end unchanged, paired e96/current exact, environment199pre/post. See `h03-control-metadata02-summary.md` and raw receipt. No finalization/decoded/render/foreground/visual/capture gate has been run on this control.

Original raw02 all3 visual FAIL remains an explicit012 cross-owner/media integration diagnostic, with actual cut identities in `h03-visual02-scope-proposal.md`. It is not replaced by the new control.007 remains incomplete,012 unimplemented,017 activation gate unreleased. Product/source/main02/old fixtures/tools and original raw media remain unchanged.


### Distinct control focused01 (not visual acceptance)

`h03-control-focused01-summary.md`/raw receipt record two measured-qualified cases (rain/panL,bubbles/push) and credits/dutch insufficient due actual primary support versus foreground-alpha bbox conflict. All3 native lyric cuts remain certified/present, including future lyrics; all3 source/native clocks and params match metadata02 and e96.48seek/revisit composite frames,6media position/time negatives pass;284prelaunch pins/end unchanged. No control MP4 capture or independent BG-content visual acceptance has occurred. Fixture/runner are frozen. Draft build `local-20261022-h03-control-01` proposes only the two safe cases for later parent approval; it does not omit credits' insufficient diagnosis from the focused receipt or replace old raw02 visual FAIL.007 remains incomplete;012 integration unimplemented/017 activation unreleased.


### Native retention control capture01 — files only

Fresh `work/avoid007-h03/control-native-local-20261022-01` manifest9788b3b3ac0efac2d403460baf94a09fecd5737537600f0b5fa2ea6917550934 has rain+bubbles2pairs/4MP4/384nativeframes and passed tool-integrated validateFiles.224assets/225exactclosure,289wrapper pins/end unchanged; current79source/JAEN freeze02 exact; env200fresh pre/postcurrent/enforced. Credits remains FG-insufficient without acquired media; old raw02 visual FAIL is unchanged. `h03-control-native-capture01-summary.md` records full receipt/size provenance. Browser/visual/public gates pending; no completion/activation claim.


### Control01 independent visual FAIL / rain-only control02 preparation

`h03-control-visual01-review.md` independently examined all384decoded frames/16nativekeys/24crops. Rain is observed-scope PASS with white-frame contact noted; bubbles is FAIL due new local contrast loss where『先』lower stroke meets the BG pale-yellow bar (not missing source or detached bubble). Thus the two-pair control01 is overallFAIL and stays immutable. Bubble BG-content contrast is an017 visual-quality residual, not a claimed automatic012 group/FG fix. Credits FG-insufficient and old raw02 cross-owner/media FAILs remain012 inputs.

Parent requested a new distinct rain-only publication candidate, build `local-20261022-h03-control-02`, config/capture02/browser02 wrappers and exact-comparison helper only. No source/fixture/focused/circle/font/media/time change, no capture/browser run yet. Intended freshdir `work/avoid007-h03/control-native-local-20261022-02`; newtool UI review must explicitly distinguish numeric feasibility from visual acceptance. If captured later, old/new rain2MP4 raw bytes +192nativePNG/RGBA record hashes +8nativekeys must match exactly before carrying the prior independent rain visual finding forward. Mismatch means no carry-forward and requires parent review/limited new visual evidence.007 incomplete/008 unstarted/017 activation unreleased.


### Rain-only native control02 files/comparison completed

`h03-control-native-capture02-summary.md` records approved rain-only fresh acquisition and exact carry comparison. Manifest9d16f11518628b28d64bb238ba6a764a5fc17bb262ca8a7446f572b809564b47,209assets/210closure,2MP4/192frames/8keys; capture289pins and comparison112snapshot+374raw input pins/end unchanged. Old/new rain192PNG/RGBA records,8keyPNG bytes,2MP4 bytes and conditions/source/font/fixture/media/clock all match exactly. Prior independent rain visual finding can be considered for carry-forward by parent; this is not a new visual review or public acceptance. Browser remains unperformed. Old2paircontrol01overallFAIL, bubbles BGcontrastFAIL, credits FGinsufficient and raw02old8cutFAIL stay unchanged. Env201fresh pre/postcurrent/enforced; product79source/JAEN remain freeze02 exact.


### Rain-only control02 full local browser02 PASS

`h03-control-native-browser02-summary.md`/raw receipt record a single full strict run:214rawHTTP/4JAENUI/2generatedMP4/2original12smedia/2nativeparity/2live,3owned phases closed;292wrapper pins+210asset inputs+216validator inputs unchanged. Each generated playback92decoded/0drop, each12s input284decoded/0drop; strict seek/play/pause/end and native reverse keys pass. Fresh env201pre/postcurrent/enforced, frozen source/fixture/tool/bundle unchanged, CPU released. Rain observed-scope visual carry was independently approved separately; public verification/final acceptance pending. OldallFAIL diagnoses remain unchanged;007 incomplete/008 unstarted/017 activation unreleased.
