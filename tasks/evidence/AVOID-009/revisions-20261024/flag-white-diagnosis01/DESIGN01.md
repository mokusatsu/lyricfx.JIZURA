# AVOID-009 landscape flag: finite white hoist restoration proposal

Status: READ-ONLY diagnosis and tiny design. No product/source edits, browser, image viewing, media, Git or network work. Parent card revision remains the sequential implementation owner. Portrait is user-approved and must retain exact accepted rendering. This proposal awaits parent implementation authorization.

## Source cause

Both exact selected landscape plans set `mode=raise`, `trim=none`, `side=1`, wind=.7, motion=.65. This is not an edge-trim selection or a missing pole/ring. The independent visual report establishes a broad white fabric-side strip; this packet independently establishes why the original source paints it.

Original renderer: at material node0, u=0 and `zf(-.01)` contains `pow(-.01,.85)`, hence NaN. This makes only S[0].sl nonfinite in raise mode: node0 physical z=0 and its coordinates remain finite, while xAcc advances only for i>0, using each subsequent node's finite slope. The first shading polygon therefore has finite S0/S1 vertices, even though its shading value is NaN.

The original shading loop computes `v=J.clamp(-(S0.sl+S1.sl)/2*side*.9,-.4,.2)`. J.clamp uses comparisons and returns NaN unchanged. Consequently `abs(v)<.02` is false, `v<0` is false, and the source selects lightOf(sc), which is #ffffff in the selected scheme. Its requested alpha `abs(v)*.8*out` is NaN. The native env.poly guard `a<=0` is also false; the Canvas globalAlpha setter ignores a nonfinite value. The preceding cloth polygon reset globalAlpha to1 and trim=none paints nothing between it and strip0. Thus strip0 paints white at the retained alpha1, inside the original cloth clip. It even ignores source out fade: at t3.8 out=.875 but the invalid assignment retains1. This last Canvas step is established platform setter behavior, not a fresh browser experiment in this read-only task.

The accepted D-only endpoint correction uses zf(max(0,u-.01)), making S0.sl finite. At t.25 and1.5 the finite strip0 shading has abs(v)<.02 and is skipped; at3.8 it has only.0314 alpha. That removes the opaque white band while retaining pole/rings. Restoring NaN would reintroduce a numeric defect and is excluded.

## Concrete width

This is one native material strip, not a new fixed-pixel object. For raise/ext=1:

    width = Wf / (30 * sqrt(1 + S1.sl^2))

Exact selected plans and pinned-source algebra yield:

| Clock | Native before width | Accepted D width |
| --- | ---: | ---: |
| .25 | 19.83948px | 8.72487px |
| 1.5 | 19.83709px | 8.72158px |
| 3.8 | 19.82725px | 8.70813px |

Before Wf=595.2; after Wf=261.76740874177233. These are design calculations in source coordinates, before the unchanged live camera. They match the independently reported approximate19–20px versus8–9px proportions. They are not claims about unknown timestamps of the eight visual-review PNGs.

## Minimal proposed change after authorization

Modify only the flag source's first shading slot, with a predicate limited to D-enabled landscape raise: `nativeD && W>H && Pm.mode==='raise' && i===0`. Strict W>H limits this correction to landscape and leaves square/portrait untouched; the existing isPort geometry threshold is not changed. Keep all other slots unchanged.

For that slot, paint the exact same S0/S1 quad already used by native shading (top-4/bottom+4), with finite lightOf(sc) color and alpha=out, then continue to strip1. The existing source-owned cloth silhouette clips the quad, preserving its physical top/bottom shape. This is a finite explicit first-material hoist band, not restored malformed shading. It follows cloth wave/raise/lower, physical width, side, out fade and existing trim-before-shading painter order. Pole/finial are still below cloth and rings/glyphs still follow it. The normal first-strip shading is replaced, not layered over or under a second independent patch.

Use the existing `cloth.poly` wrapper, `flag.surface` primary ownership and `withDSourcePolygonClip('flag-cloth-v1',sil,paintCloth)` scope. No generic recorder/clip/camera/guard changes. No extra canvas, mask, text-only movement, pole thickening, new geometry scale, recipe ordering or font/cloth/raise/position changes. The existing full surface bounds include every S-node top/bottom plus6px, already covering the same +/-4 quad and recorder guard. Thus the analytic owner envelope/search should remain exactly the accepted one; raw validation will establish actual event coverage.

OFF retains the original source branch, including its historic NaN artifact. User-approved portrait never enters the new predicate, so its native source drawing operations, selected recipe, clock catalog and RGBA must remain exact. Unfurl stays unsupported; the new branch does not broaden it.

## Required narrow regression before media

1. Freeze current main source/JAEN and the accepted selected landscape/portrait input plans. No full tree copy needed on low disk.
2. Exact new landscape strip event: finite S0/S1 polygon, lightOf color, alpha=out, existing clip and flag.surface primary owner, same painter slot. Verify no second normal strip0 shade and no geometry/recipe/offset/font/clock changes. Test t0,.25,.8,1.5,3.8,3.99 and terminal4; both sides, rect/swallow, all three trims, native cameras and selected scales.1/1/4, main/A/B; no band in ghost passes that previously suppress cloth paint.
3. Against frozen accepted source: exact portrait selected 240-frame60fps RGBA parity, plus OFF landscape/portrait representative RGBA+metric parity. Controls/manual/lock/emphasis remain preserved. Direct finite ON source versus record/replay equality must include a nonzero offset and selected camera roots.
4. Recompute every new actual primary polygon against the existing continuous owner envelope, stage and circle; verify analytic recipe/envelope/offset and full glyph/pole attachment signatures stay unchanged. This is a sampled regression of unchanged analytic bounds, not a sampled proof substitute.
5. Parent source/raw review first. Only after authorization, one necessary local native60fps landscape comparison MP4 and fresh-context sol visual review of its new white fabric strip. Do not regenerate approved portrait media or perform any public result checks.

## Reproduction and pins

`node calculate.cjs` computes `calculation.json` from the exact copied selected input plans. Arithmetic is a direct transcription of pinned source; it does not render or mock a Canvas. `source-pins.json` records source, review and input SHA256 values; source snapshots are compressed under pins/. Visual report/receipt are text-only provenance copies. No image files were opened or copied.
