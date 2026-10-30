# Product connection86ch — bounded design audit, integration held

Read-only continuation at HEAD1a62d403 after the parent saved endpoint evidence/restore v125. The goal remains ordinary UI integration. This audit finds that main-view routing can be separated locally, but current preparation responsiveness remains unaccepted. Product source/build/index and frozen prototypes are unchanged. No new Qt run, media, screenshot, rendering, public access or performance micro-optimization was added. Existing source/raw and wall measurements are sufficient for this decision. Parent owns review/commit and the next independent effect selection.

## Build and ownership dependencies

| Product integration point | Required bounded change / dependency | Current source evidence |
|---|---|---|
| build.py | Preserve sorted src load order, replace the old registered implementation rather than append a second adapter | src/11zz10 currently registers bulbs-owned-source80-v1; original conflict guard and once-only renderer issuer refuse duplicate registration |
| src/11zz03_bulbs_frame_data80.js | Use86cc pure generator plus unchanged sync wrapper | variable-ui86cc/frame-data86.js; endpoint proof uses this exact module |
| Before cooperative owner | Load compose-scope86bu, actual layout-accounting86j account86.js, design root, scalar generator, post/fast scopes | Existing src/11zz04 compiler remains codec authority;86cc owner calls the separate generator, not old synchronous C.compile |
| src/11zz07_bulbs_owner80.js | Replace owner with86cc cooperative owner and exact source/font/input/viewport accounting | Original O.prepare is synchronous;86cc explicitly refuses that path and needs generator installed first |
| Before controller / src/11zz09 | Load variable geometry and candidate replay, replace controller with86cc | Old normal destination module remains a dependency; viewport replay is a separate private helper, not a substitute source-paint oracle |
| src/11zz10 | Replace with cooperative model→proof→complete adapter; insert UI runtime before connectRenderer; attached private preparation Canvas | Use full adapter source plus runtime fragment; do not import old diagnostic facades from historical assembled HTML |
| src/09a_placement.js | Apply the one already-qualified bulbs-only neutralMissingGlow equivalence | Historical candidate uses design-viewport86bv/09a_placement.js; all other finalizer bytes match product. Missing glow is not generically accepted for other techniques |
| src/12_ui.js | Install coordinator before UI use, then invalidation at input/debounce/replan/resize and scoped main drawing | Current generated hook runs before area-draft handling and ignores alternate renderer; it is not a drop-in product patch |
| Other rendering entry points | Explicitly handle screenshot, export, short preview, warm/detail paths | They do not all call drawPreviewFrame. Main-only acceptance does not qualify them |

The machine-readable dependency-profile.json records hashes, exact module occurrences in the frozen86cc host and the source files not present verbatim. The 11t_effect_preview.js mismatch is the ordinary build's embedded preview-image placeholder expansion, not an additional avoidance source change. The inherited static account module is layout-accounting86j/account86.js, not the older final-accounting86g file. Modules can be ordered within existing source slots; no broad new build platform is needed. The build change has not been implemented or qualified.

## A small main-view routing design is possible

A future limited connection can keep the following explicit routes. Routing itself does not require a large shared renderer redesign, and does not solve the responsiveness blocker below.

| Request | Intended route | Observable result |
|---|---|---|
| Plan contains no bulbs | Stop/revoke any old bulbs session, execute the entire existing drawPreviewFrame path unchanged | Other techniques retain their own draft/renderer/render flags; no global interception |
| Bulbs, ctx is exactly view's context, renderer is S.renderer, no area editor | Run restricted coordinator only if source domain is proved by its current checks | Fonts/preparation show a clear pending state and empty main view; ready publishes only the current formal plan |
| Unsupported input or stale plan/font/viewport | Typed unsupported / existing failure state, revoke all old authority, clear main view and show reason | No old result or unrelated effect is substituted; endpoint fixtures are not a whitelist or all-input proof |
| Area editor for bulbs | Separate typed unsupported route before draft handling | Do not ignore its draft or show an unchanged safe formal result as the draft; no silent stock fallback |
| Alternate renderer / snapshot Canvas | Throw a typed unsupported error before entering the main coordinator | Existing screenshot catch/toast handles it, so it must not continue to save a blank Canvas |
| Export / short / detail / warm callers | Explicit per-entry unsupported handling for this preview-only source domain | Do not pass editable S.plan to old stock rendering and imply export equality. Refuse export before any file picker/output operation. Other techniques remain unchanged |

This is a concrete proposed routing boundary, not implemented behavior. In the old prototype, a mismatched snapshot Canvas would reach session.frame, whose catch clears the target and returns true; the caller could then continue its save path. That is a source-derived integration risk, not a newly executed screenshot test. No screenshot was generated. Area editing similarly reaches the early return before its draft is applied. The proposed routes address those boundaries locally, but implementing them now would not make the overall preview ready for product use.

## Preparation response, cancellation and failure

| Existing86cc single wall trial | 720×405 | Natural480×270 small circle |
|---|---:|---:|
| Ready interval | 10,539.7ms | 8,756.0ms |
| Maximum session step | 108.1ms | 80.9ms |
| Steps | 538 | 538 |
| Scalar phase outer work | 4,669.2ms | 2,938.5ms |
| Destination proof outer work | 2,766.5ms | 2,805.8ms |
| Scalar + proof | 7,435.7ms | 5,744.3ms |
| Sum of profiled outer work | 7,917.7ms | 6,153.8ms |
| Scalar + proof share | 93.9% | 93.3% |
| Elapsed minus profiled work | 2,622.0ms | 2,602.2ms |

These are single wall observations, not CPU attribution, percentile latency, a guaranteed cancellation bound or an invented product threshold. Elapsed minus work includes scheduling/other unprofiled time and cannot be treated as entirely removable idle time. Removing every profiled phase outside scalar/proof would remove under0.5second of measured work. Another small tail split does not fix9–11seconds.

Input invalidation immediately increments generation before target/debounce handlers can publish old results; jobs recheck plan/dependencies/context on each resumed step and before publication. The DOM event loop cannot dispatch a new input during an executing synchronous step, so cancellation is effective at the next yield, not in the middle of the observed80–108ms step. There is no dedicated user cancel control in the prototype; automatic input/font/circle/resize revocation is proved, including real font-value change/resize in86cf/cg. Closing the managed trial reaps pages/processes. A product cancel action would need an explicit coordinator stop plus a policy for when automatic replanning may restart, not merely preparationApi.cancel while a font await is still current.

Ordinary compilation/proof failure revokes prepared state and leaves typed unsupported/ready false;86cc480same-circle and86cf/cg old-plan refusal evidence confirm the normal cleanup boundaries. The coordinator hides the old result while waiting and does not fall back to the last success. Non-bulbs stop uses the stock UI path. The prior center07/08 failure results remain failures;86bz explains their specific random-grain difference but is not an all-technique regression certificate. A product build's non-bulbs regression is still required after any real integration. No new unsupported input is accepted by this audit.

The existing renderer's broad abnormal post-write exception/Canvas-stack restoration guarantee is not newly established. There is no evidence here that a broad shared redesign is necessary to express main-only routing; such a redesign remains separately pending and has not been attempted. The present hold is already justified by response and unconnected entry-point semantics, without manufacturing an exception-safety approval blocker.

## Structural choices for later work

| Choice | Evidence-supported limit / prerequisite |
|---|---|
| Continue splitting tiny tail blocks | At most about0.48/0.41second measured outer work lies outside scalar/proof; does not address the dominant phases or repeated full preparation |
| Retain immutable geometry for circle-only edits | Geometry key already omits circle center/radius, but current UI cancellation drops the model and owner fullKey/current-generation binds the old plan. Reuse needs an explicit new-generation source binding plus unchanged font/context/budget guards. It might avoid the scalar phase on genuine hits; current proof still costs roughly2.8seconds. No cache hit benefit or new safe transition has been measured |
| Reduce repeated full-key/dependency/accounting work |720 model-output iterator17.9ms versus outer95.3ms shows material outer work, but subtraction is not CPU diagnosis. Reusing only immutable dependency data would require a sound mutation/identity contract; simply skipping per-step guards is not permitted |
| Move heavy geometry/proof off the UI thread | Could separate input handling from heavy synchronous computation, but DOM-connected font metrics already differ from detached measurements. A worker would need main-thread metrics/context provenance and budgeted immutable transfer, with the same full-clock/all-owner proof and generation publication rules. No worker design or compatibility qualification exists; this is separate structural work, not a small drop-in speedup |
| Change the preparation algorithm | Must retain source clocks, all owned support/quality and actual font/source guard semantics, or undergo a distinct design review. Sampling fewer clocks/parts or relaxing margins is not an option |

Product integration is therefore held. Frozen prototypes and endpoint evidence remain usable; no half-connected main UI or new ad hoc verification framework was installed. This unit is ready to save, so the parent can select the next already-approved independent effect without depending on bulbs performance work. The next effect should reuse its own source evidence/typed failure boundaries rather than inherit bulbs' two-input endpoint qualification.
