# Balloons native parity correction02 — SOURCE only

Run01 is preserved unchanged: 8 fixtures, 222 calls, 124 failures, errors[], gzip
2670526B SHA2565ae886e69361b021ffaab5f6dffb3b013d741c1412b2f1d93b710d8d1b7dc67a.
Original HTML OFF / modified HTML OFF / D direct pixels, paint, return BB, timing
getter counts and input alias/freeze checks matched. Original-before/OFF parity0.
Failures were50 zero replay pixels,44 nonzero replay pixels,30 direct/record
catalogs (all catalog failures belong to seed808 motionScale.5).

Only isolated 09a is changed in02. No native11p source or fixture/exercise is
changed. Old source01/raw01/seal01/pins01 remain immutable. There is no generic
makeEnv or all-layout record fix, no adapter or reflow, and no main integration.

1. Add strict stock dBalloonsCut alongside dBlocksCut: only placementLayoutsD true,
   no A/B/C flags, exact balloons sourceKnown, cut/cut/still/none, no drawing,
   effectsOnly or decor. Include it only in the existing nativeDOriginalRoot OR
   list under original main/A/B and known-renderer conditions. This retains the
   actual fractional Canvas root instead of its measurement-canvas round trip.
2. Immediately after record creates its proxy environment with makeEnv, assign
   recorder.fx=env.fx only under strict dBalloonsCut, main/A/B, known transport.
   The original caller's FX already includes motionScale. In makeEnv, Object.assign
   options supplies env.fx, then cut.motionScale<1 multiplies its motion again.
   Run01 source seed808 thus had direct motion.325 and recorder motion.1625,
   causing its observed bob/rotation/catalog differences. Exact binding restores
   the caller's EFFECTIVE FX, including any permitted caller overrides, without
   dividing by motionScale or inferring raw plan/cut FX. The original object is
   never mutated. Catalog captures only numeric motion; no FX alias is exposed.

Read entire makeEnv(src/09_render.js332..416): FX appears only in initial env
construction and immediate damping assignment. Drawing helpers capture env/ctx,
not a separate fx or motion variable. The post-construction binding is therefore
sufficient for native balloons and J.mainDraw/J.drawItem, which read the passed env.
It cannot leave an old captured motion in the helper closures. Source draw order,
helper callcounts, timing and original live gloss callback remain unchanged.
The broader already-existing record/makeEnv double-application issue for other
layouts remains outside02 and should be handed to AVOID-019 or an appropriate
tracked follow-up by the parent. This scope does not claim that issue resolved.

Runner02 differs only in explicit release/raw/invocation/seal names, replacing
09a in the after HTML in RAM, and asserting all actual generated calls equal the
preserved222 run01 calls before each original comparison. Balloons specs and browser-side
exercise bytes are identical to01. Three small other-D controls (blocks/pile/flag,
main clock1.5, fractional root, motionScale1) compare original/new direct/replay
pixels, native catalog, BB and events. They cover branch noninterference only;
the existing motionScale.5 issue in other layouts is not tested or declared fixed. All 8 fixtures, motionScale.5, scales.5/1/2,
main/A/B, exact boundaries and expected equalities remain intact. All outside
browser requests abort. The same existing fixed font/runtime inputs are reused.
Source02 has not executed JavaScript/modules/browser/build/media/Git. Parent must
review then authorize one local rerun. No passing outcome is assumed in advance.
