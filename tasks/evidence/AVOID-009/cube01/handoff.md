# Cube isolated functional checkpoint

Implementation owner: gpt-6.1-sol / medium, isolated `/tmp/avoid009-cube-worktree-01`, start detached `6e016f7` with parent-pinned integration APIs. No main-tree edits, commits, push, public checks, visual review, media generation or extra cyber/proxy investigation.

## Transfer scope

- `src/09m_layoutsD_cube.js` (new)
- ONLY cube registration block in `src/11p_layoutsD.js`. Apply `cube-source.patch`, whose baseline is the actual integration snapshot `src__11p_layoutsD.js.before.gz`; do not copy the full file over current integration work.
- `dev/avoidance/layouts-d-cube-test.cjs`, `dev/avoidance/layouts-d-cube-parity.cjs`.
- Scoped evidence below. Parent task documents were not edited.

## Final proof and behavior

The source declares every face-local item before visibility culling: ordered lyric chunks, alternate copy, side numeral and top No. label. Every body face, edge, text copy and contact shadow remains one protected primary physical solid, owner `cube.solid`. Source output has no primary mask or auxiliary exemption.

For a side face, `x=cx+pop*(u*cos(yaw)+h*sin(yaw))` and `y=cy+pop*(v*cos(pitch)+(-u*sin(yaw)+h*cos(yaw))*sin(pitch))`. Thus horizontal support is `hypot(u,h)` and vertical support is `abs(v)*cos(pitch)+hypot(u,h)*abs(sin(pitch))` for every real yaw. The top face has horizontal support `hypot(u,v)` and vertical support `h*cos(pitch)+hypot(u,v)*abs(sin(pitch))`. The contact shadow uses its exact native 1.04 local expansion, floor offset and 0.14h downward offset. All native cube-edge stroke/miter support is included. Pop has exact maximum `1+4*1.3^3/(27*2.3^2)` and exit multiplier lies in [.85,1]. Stock cameraEnvelope adds camera/contentScale/ghost/event support and 20 design pixels of reserve for admitted .1..4 render scales. This is analytic continuous support, not a sampled union.

Candidates try native joint translation, then uniform physical edge changes with unchanged nominal text size and source wrapping, then discrete local type reductions. W/H and viewport never change. Every physical cube has equal three edge lengths. Native pitch, yaw/pop/sway, turn/chunk/arrival schedules and face attachment are retained. Top No. font size is never reduced, and its affine singular values `[1,sin(native pitch)]` remain unchanged. Complete pre-clip measured local text must fit the physical face; source face/text/font coverage and primary/secondary readable floors are checked. Explicit content size forbids local type reductions.

Render callbacks verify exact actual source-event support, stage containment and circle clearance for every certified call; insufficient-space segments retain original native source, no recipe/offset, and are not labeled safe. Empty-visible frames have no ink and are treated vacuously clear. Scope is cut/cut/still, no treatment or attached decor; other variants receive explicit unsupported diagnostics. All-yaw support is intentionally conservative.

The relative native writing fields are protected: primary lyric half-width/height .82h/.75h; alternate copy .75h/.6h; numeral/top metadata .9h/.9h. A measured original font-outline overhang beyond those native fields is recorded per axis and allowed proportionally, still capped inside the physical face at h−1. Candidates try coherent wraps 2/3/4/6/8 and cannot trade padding for an edge-touching glyph. A physical face cannot shrink around unprotected missing ink. Chunk indices explicitly map source text to faces and are checked in chronological chunk order, including negative-dir pair and turn3/4. Source drawOwnership is scoped with try/finally. Hidden face catalog computation and native outline snapshots occur only for D; OFF computes content lazily after original face visibility tests.

## Final tests

Commands (local localhost only, inherited proxy/CA/TLS retained):

```
PYTHONDONTWRITEBYTECODE=1 python3 build.py
CUBE_REPORT=run08.json JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-d-cube-test.cjs
CUBE_REPORT=parity06.json JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-d-cube-parity.cjs
```

`run08.json`: 132 matrix cases, 24 certified full-interval / 108 insufficient-space / 0 unsupported, zero failures. Covers single/pair/turn, Japanese/Latin, 4 aspects, radius .02/.12/.2/.32/.45, position-changing exact region chronology and negative dir/ghost. The final additions cover negative-dir pair, both dirs of turn3/4, and explicit gothic_med/mincho/mono fonts. Independent Node oracle checks every certified analytic envelope's clearance/stage. Seventeen actual frame times per matrix case, including early no-ink, pop, held turns and exit. Additional CERTIFIED portrait turn/negative-dir/ghost cases at scales .1/.5/2/4, 14 boundary times × 3 passes each, zero errors. Four negative domain/source-coverage cases decline staging. OFF/manual/locked/emphasis controls decline staging with input unchanged, explicit contentScale .8/1/1.2 preserves requested scale and has no font reduction. Native-size structural candidates precede local text reductions; maximum candidate schedule is116.

At actual default circle (.5,.42,.2), 960x540 and portrait Japanese single certify via equal-edge scale .6, native25-degree pitch, wrap2 and local type .9, native top font. Wide Japanese single certifies with wrap2 and unchanged native type at physical edge .8; wide Latin single uses local type .75. Pair/turn at the default circle and square cases remain truthful insufficient-space under preserved writing insets. Portrait pair/turn do certify at radius .02/.12. This is not an all-D34 or all-cube-variant completion claim.

`parity06.json`: true-before OFF pixels exactly match across 12 mode/language/dir cases × 6 times; same-final-cut direct native and D zero-offset replay match all 108 probes (3 modes, dir±, scales .5/1/2, 6 times). Hashes and roots preserved; source ownership sentinel is restored after native render. OFF benchmark three repeats of120 frames has exactly220 fitSize calls per repeat before and after; median13.8ms after vs16.2ms before, informational only and not a formal performance claim. No media was opened or viewed. The before source was frozen before implementation; baseline HTML is reconstructed from that exact source in memory, same loaded fonts and other runtime source.

`run08-pins/invocation.json` and gzip snapshots pin every source module, index, test, fixture and oracle used in the final gate before invocation. `parity06-invocation.json` pins its invocation and true-before source/HTML hashes. Shared APIs used: 09a `2c2767719f26a93f8aeaa1685ee008af10499c272b42825f7a9f9b1c9be3ca80`; 09k `d5776c9ad249b83b2fb75065168de6e089622e28c28662fc31e13b46c0afbc5a`; 11za `3abd1b35040a83861a5328797fc41f78f6730f2e8a72c4d95348491dbdec67f1`. Only shared09a was refreshed since initial receipt (original `baf7315...`); refresh obtained parent owner's zero-offset root precision fix. Full original receipt is `../cube-isolated-start01.json`.

## History and limits

Earlier raw logs are retained: run01 failed actual empty-visible frames because A.clear rejects empty polygon lists; fixed in subsequent runs. Run01 also used exploratory cuboid-height candidates. Run02 removed cuboid changes; run03 avoided zero pitch; run04 preserved native pitch/top projected label; run05 increased AA reserve to20 for certified .1-scale support. run06 preserves native writing insets and scoped ownership, adds narrow wraps and lazy OFF content. run07 adds a physical-face cap on original-outline overhang; its certified scale probes pass. run08 fixes chronological source coverage for negative-dir pair/turn3/4 and pins font files, adds explicit-font coverage. Earlier scale extras marked insufficient in run06 were not certified-scale evidence; final run08 extras are certified. Intermediate success counts are not final acceptance. No intermediate cuboid/flat recipe is in the final candidate source.

Parent source/functional review and separate visual intent review remain pending. Human/native-controls animation examples should only be produced after functional review and only as required. No image/video has been inspected by this implementation owner.
