# AVOID-009 center / split-vcols limited unit — 2026-10-30

Status: LIMITED UNIT REVIEWED. Not general completion of ordinary effects, AVOID-009, formal performance, AE avoidance, or human visual acceptance. Owner: delegated gpt-6.1-sol / medium. Base HEAD `93dac4d5246ca220b228a93ba62b954dffe5085a`. No public result checks/media generation. Existing unrelated untracked experiments were preserved.

## Implemented scope

`src/11zz14_simple_circle.js` separates direction, free region and arrangement. Direction scores are down=-dy, up=dy, right=-dx, left=dx with dx=2cx/W-1, dy=2cy/H-1. Descending score precedes shape fitness, normalized displacement, then previous direction. Per-direction row/column lengths come directly from available dimensions and current font size; at most three candidates per direction. Original glyph sequence/font size/spacing and explicit newlines remain; there is no stretch-to-fill. Previous positions are reused only after current geometry, selected region, body containment and circle checks pass again. Active multiple regions are unsupported, keeping one fixed placement through the cut.

Native main-item and animation construction are shared in `06_layouts.js`. The new path uses actual TextMetrics geometry primitives, not A.record, whole-clock generation, prepared ownership models or frame atlases. `09_render.js` renders only the reflowed main item once per pass; source decor retains its original area, camera, clocks and source main-item bbox. Readable held body stays inside the stage. Effect tails may naturally cross the existing canvas boundary; their intersection with that bitmap is used for circle checks. No new clip/mask is added.

Supported combinations: enter cut/flicker/inkBleed/magnet; hold still/flashBox; exit cut/overexposeOut; treatment none/hardShadow; camera push/panL/panR/dutch/dollyIn/beatPunch; no decor or verticalStrip/dataColumns/sonarArcs; global events chroma/shake/rgbSplit. Other combinations, center subtitle/underline, masks/drawings/effectsOnly, transitions and multiple active circles remain unsupported. This is a limited independent unit, not an all-effects adapter. Manual/notation/lock/emphasis and disabled avoidance keep priority; vcols repeat is unchanged and outside adaptation.

## Preserved operations and explicit results

Supported inputs use a private prepared preview plan. Input debounce blocks old-plan preparation/display until replan; font/viewport changes invalidate the private result, with dirty state preserved across resize. Unsupported cuts retain original drawing and show the persistent message **円回避未対応・元の配置** while active. Insufficient-space remains visibly excluded and never reports successful avoidance.

PNG/MP4 and screenshots use the same lightweight preparation entry with their own render scale. Unsupported combinations retain native placement with explicit onWarning/status=partial. MP4 results expose `circleAvoidance`; PNG ZIP Blob exposes the same property, and partial ZIPs contain `circle-avoidance.json`. The export UI retains the warning in its progress/completion text. Genuine insufficient space throws `SIMPLE_CIRCLE_INSUFFICIENT_SPACE` rather than silently exporting unavoided text. Full MP4/PNG encoding was deliberately not run; the prepared output frame and entry wiring were checked.

AE JSON output remains available using its existing native format. The UI says **AE出力には円回避配置が反映されません**; JSON includes `circleAvoidanceExport.status=not-applied`. AE avoidance/reflow is not implemented or claimed; AE independently rebuilds typography and shares content/decor precomps, so exact support would require separate AE work.

## Blur/light support policy

One engineering bound was fixed without coefficient tuning: six Gaussian standard deviations plus raster/resampling guards. WHATWG Canvas shadows specifies sigma=shadowBlur/2 and bitmap-coordinate filter/shadow composition: https://html.spec.whatwg.org/multipage/canvas.html#shadows . Filter blur sigma and shadow sigma are added when concurrent; nonoverlapping entry/exit phases use a maximum. Crisp flash/post rectangles are included separately, without applying text blur to those rectangles. Known source formulas bound glyph growth, magnet translation/rotation, hard-shadow offsets, flashBox rectangle overshoot, overexpose tracking/size and three light strips.

The 8-bit contract includes alpha1, so the engineering accumulation comparison uses pre-rounding0.5/255. Input cap256 glyphs, three passes and the supported source paint family give a conservative bound3*(8*N+16)<=8192 paints. The rough two-sided six-sigma tail estimate2*exp(-18)*8192 is about0.00025, below0.5/255. This is a declared conservative engineering policy with representative Qt checks, not a proof for every browser/kernel or full continuous raster audit.

Render scale is explicit. The two bitmap-pixel guard is converted to stage units. Post bloom derives actual canvas width, rounded quarter-size scratch width, blur sigma and upscaling ratio before division by render scale. Preview and output prepare for their own actual target dimensions; geometry can reflow when target size changes. They are not claimed pixel-identical across resolutions.

## Representative verification

Final functional source/evidence: `/workspace/jizura-logic-evidence-20261027/simple-circle-source12` and `simple-circle-actual12`, plus `simple-circle-actual12-runtime`. Local Qt6.11/WebEngine6.11/Chromium140 runtime; no public pages. Normal project FX were retained; only layout/single was selected for center/vcols, using the ordinary default circle(.5,.42,r=.2), seed1205, blueprint, Japanese text. Both prepared/rendered visibly, glyph sizes75.7478569/40.0753398 retained, 10 candidates, three mainDraw calls exactly once each for B/A/main in the960x540 output frame. AE not-applied metadata was present.

One observed UI preparation time after fonts: center16.0ms, vcols15.1ms. These are single observations, not initial-page/font-loading latency, p95 or formal performance acceptance. The raw includes wider probe elapsed values with its direct preparation/draw/wait overhead.

Actual12 additionally confirmed: large circle plus explicit contentScale8 => insufficient-space, empty preview, typed output failure; unsupported drop => native nonempty preview, persistent unsupported/original-placement label, partial output status. Input debounce plus real bitmap480→720 resize => dirty remained true, no pending/private old result, blank old frame. Both ordinary cases also retained original source plan bytes during the probe. Earlier source02 confirmed manual/lock/emphasis/repeat and explicit break behavior, but those are earlier evidence and not represented as fresh final all-effect regressions.

Resource result: probe complete/errors0 and postpins unchanged; runtime complete, all three pages normally closed, owned service/adopted descendants reaped exit0, no forced signals, no remaining owned children, debugging port closed. The unchanged1GiB floor and1MiB declared output were used. Node syntax checks and git diff --check passed.

The final parent-requested region-containment guard was added after actual12. It rejects any clipped candidate envelope outside its selected direction region, matching the reuse check. Saved actual12 center/vcols envelopes satisfy this extra guard numerically. Product HTML was rebuilt; no additional Qt run was performed as requested. Parent source review is still required.

## Preserved failures and limits

All trial source01..12/actual01..12 directories remain outside the repo. Old probes inherit a misleading Bulbs stage-description string; that metadata is not a Bulbs qualification. Early `failure` fixtures actually fit and were not counted as insufficient-space evidence. Earlier normal r=.12 and r=.2 rejections, the transient unsupported fallback/lineage bug, and the blur bitmap-unit bug remain in their historical raw. They are not relabeled successes. The old unadopted prototype is preserved at `simple-circle-unadopted-20261030`.

No whole-clock proof, raster equality, actual alpha-support oracle, all-effects regression, formal performance, AE host execution or human visual approval is claimed. Independent decor retains original behavior and is not newly certified for circle clearance by this main-item unit.

## Parent review

Reviewed the direction ranking, chosen-region containment, font-size and source-order handling, preservation priorities, unsupported/native warning and insufficient-space paths, preview invalidation, output wiring and explicit AE limitation. Independently checked the actual12 summary and normal Qt process cleanup, plus JavaScript syntax and `git diff --check`. The post-actual12 region guard is supported by numerical checks against the saved normal envelopes, not a new browser run. The supported effects and engineering blur bounds remain limited as stated above; this review accepts the independent unit rather than claiming all automatic effects or full visual safety.
