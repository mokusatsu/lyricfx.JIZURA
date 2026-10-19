# AVOID-002 contract and reproducible evidence

For the historical AVOID-002 stage, production `src/` and generated
Japanese/English application HTML were unchanged. Later-stage scope and commands
are documented in the sections below.
The 002 fixture page runs a frozen copy of the existing renderer. Its separate dashed
circle is an **unimplemented specification example**, never a generated safe path.
Use a private browser session for live fixtures: the frozen application runs in a
same-origin iframe and can access its usual application storage. The fixture does
not assign its test project to the app UI or save over a user project.

## Commands

From any directory (substitute the repository path):

```sh
export NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
export JIZURA_BROWSER=/usr/bin/chromium
cd /workspace/lyricfx.JIZURA
node dev/avoidance/test.cjs
python dev/avoidance/inventory.py tasks/evidence/AVOID-002/inventory.json
python dev/avoidance/baseline.py --out tasks/evidence/AVOID-002
JIZURA_TEST_FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf python dev/avoidance/saved-project.py
node dev/avoidance/fx-perf.cjs
node dev/avoidance/review.cjs capture NEW-UNUSED-BUILD-ID
node dev/avoidance/review.cjs validate NEW-UNUSED-BUILD-ID
node dev/avoidance/negative.cjs review/AVOID-002/NEW-UNUSED-BUILD-ID
node dev/avoidance/review.cjs validate NEW-UNUSED-BUILD-ID --base-url https://mokusatsu.github.io/lyricfx.JIZURA/
```

Chromium needs local sockets. If the managed sandbox rejects `setsockopt`, use the
platform permission mechanism; do not disable TLS or bypass outbound policy.
No downloads are required. Capture additionally requires Python fontTools, system
NotoSansCJK-Regular.ttc and its Debian copyright file. The generator subsets those
fonts, retains its license, and waits for the bundled font to load; all registered
font families are overridden only inside the verification iframe. Normal
application fonts and font appearance are not validated by these captures.

`capture` refuses an existing build directory and verifies the current Japanese
HTML equals `git show HEAD:index.html`. For 002, old/new production bytes must
match; the after image adds a new confirmation page. A future task that changes
production must extend this with a separate fixed baseline checkout and production
result input instead of weakening the equality assertion. The original stage PNG
is saved separately from the same-size UI pair. No old image is silently replaced.
Capture rows cover H01 positions (center/default/upper/lower), H02 3 layouts × 5
aspects, H03 current enter/hold/exit frames. Region boundary/gap results remain
explicit expected values until 003 connects the real resolver.

`validate` checks the 22-row matrix, H-IDs, source/fixture/PNG hashes, dimensions,
conditions, original-stage equality, every local asset/link, browser naturalWidth,
all comparison modes, overlay geometry, responsive widths 1500/390 and sample
startup. `negative` first validates an unmodified clone then requires each mutation
to fail for its expected reason. Public mode fetches every manifest asset,
manifest itself, and Japanese/English root HTML using the local hashes, then opens
the public comparison and sample. It never substitutes local success for a public
failure. A network denial is a failed public check, not a product pass.

## Manifest v1

`task`, `build`, `comparisonVersion`, `hids`, `before.commit`,
`after.baseCommit/sourceSHA256`, browser/UTC acquisition fields, all asset SHA-256s,
and `cases` are mandatory. Each case has unique ID/H-ID, conditions (seed, stage
aspect, frame time, viewport, DPR, font/media/color/alpha), before/after records
with PNG path/size/hash, implementation/source/fixture identity, acquisition method
and measured observation. Each side has an `original` unscaled renderer PNG.
`assets` covers public HTML, scripts (in frozen app HTML), fonts/license, fixtures
and every PNG; the manifest's own hash belongs in the external publication log.
Relative assets work under the repository subpath. Public commit/deployment URL
must be recorded externally by the parent; a candidate cannot embed its own commit.

## Verification boundary

`oracle.cjs` is verification-only, imports no production generator, tests final
stage polygons against circles, treats contact as collision and rejects malformed
or unmeasured geometry. It does not prove arbitrary continuous animation from
sampled frames. Adapters must provide conservative swept bounds or documented
subdivision error. The fixture deliberately rejects a center-crossing line,
center-only glyph tests, filled ring bboxes, and anisotropic normalized geometry.

`contract.json` separates explicit user requirements, adopted numeric/design
choices, and future owner tasks. `cases.json` freezes old inputs and expected
boundary/invalid/manual cases. It is not a resolver implementation. 003 must test
those expectations against the actual pure resolver with transactional rejection.
`inventory.py` reconciles all 184 registrations/owners with historical inventory
and current render hashes. It establishes conservative primary responsibility for
all lyric-bearing draw units, and exempts only 13 named repetitive units. This is
not a claim that all individual units, attached plates or FX are implemented or
visually reviewed; pending unit discovery remains with the explicit adapter owner.

`fx-perf.cjs` is a small independent Canvas feasibility experiment. Eight checks
cover alpha monotonicity, primary/media preservation, painter-order multiply,
and rejection of a naive full-stage mask. Flattened role-mixing blur is deliberately
unsupported until 004/018 retain provenance or implement role-aware recomposition.
It is not evidence that product post-FX are already compatible. Old-planner p95s
measure warmups and 12 samples for 100/1000 lyric lines; current regions evaluated
is zero. Run alone, after other browser jobs stop. New-region overhead, bounded
buffers and continuous trajectory performance remain 004/017/018 work.

## Public validation network transport

The public validator uses browser `fetch` and its raw `arrayBuffer()` bytes for
asset/hash and link checks, so these checks share Chromium's navigation transport.
Raw bytes cross the browser boundary as base64, avoiding text re-encoding when
a server omits a charset. It does not use `page.request`, whose separate APIRequest transport did not inherit
the managed environment proxy and failed with `EAI_AGAIN` in the initial public
attempt. That initial failure remains historical evidence; it is not a deployment
result.

For a public target, the validator passes the existing `HTTPS_PROXY`/`HTTP_PROXY`
(or lowercase equivalents, then `ALL_PROXY`) to Chromium without logging their
values or credentials. Loopback and configured `NO_PROXY` destinations retain
local/bypass behavior; capture and ordinary local validation launch policy is
unchanged. Chromium keeps its existing CA/NSS trust configuration. No TLS checking
is disabled, and a proxy rejection remains a failed public validation.

Use the inherited environment in the platform-approved browser execution context:

```sh
node dev/avoidance/review.cjs validate local-20261018-06 --base-url https://mokusatsu.github.io/lyricfx.JIZURA/
# The same public-mode byte/browser checks against a repository-root local server:
node dev/avoidance/review.cjs validate local-20261018-06 --base-url http://127.0.0.1:8892/
```

Do not unset the proxy or replace CA trust to make a public check pass. The
validator rejects invalid proxy configuration with a redacted error and does not
fall back to a local or direct request after a public error.

## AVOID-003 production control model and resolver

`src/08ca_lyric_avoidance.js` is the shared production validator, normalizer and
pure resolver. Production lyric rendering and the three product tracks continue
using their existing implementation; the added index neither creates cuts nor
extends duration. The 002 bundle and its validator remain immutable and strict.

- `J.defaultLyricAvoidance()` returns detached version-1 default control data.
- `J.normalizeLyricAvoidance(value)` validates one model, clones it and sorts by
  start. `J.projectLyricAvoidance(project)` supplies the deterministic default only
  when the project field is **absent**. Explicit empty arrays remain empty;
  null/undefined fields and unknown versions reject with
  `code: INVALID_LYRIC_AVOIDANCE`.
- `J.buildLyricAvoidanceIndex(project)` creates a detached sorted plan index. It
  retains original null ends and all future regions. `J.plan` attaches it as
  `plan.lyricAvoidanceIndex`; final compose may change `plan.duration` afterward.
- `J.resolveAvoidanceAt(finalPlan, stageTime)` performs binary lookup and returns
  null or a fresh `{id,cx,cy,r,source?}`. The `source` object is detached too.
  Supply the **final composed plan for automatic duration**. A raw project can be
  passed only with finite numeric `durationOverride`; an enabled automatic-duration
  raw project raises an explicit error, since final media duration cannot be
  inferred here. OFF / autoPlacement=false and out-of-range query times return null.
- `J.avoidanceCirclePixels(resolved,W,H)` converts center to original stage pixels
  and radius to `min(W,H)` pixels. It does not normalize x/y distances separately.

The accepted 002 contract is unchanged: 1000 regions, radius .02–.45, center 0–1,
non-overlapping `[start,end)` intervals, minimum .04 seconds. Only minimum-length
validation permits one magnitude-scaled machine epsilon
`Number.EPSILON * max(.04,abs(start),abs(end))`, to accept representable decimal
pairs such as `.07,.11`. Lookup boundaries and overlap comparisons remain exact;
there is no time snapping or temporal epsilon in evaluation. Final output clipping
may expose less than .04 seconds without rewriting saved data.

003 adopts optional opaque `source` provenance: a JSON object with finite values,
maximum 4096 UTF-8 bytes and maximum nesting depth 16. Semantic keys are not
inferred. Blob, Date, typed-array, executable, cyclic, undefined and non-finite
values reject. This is metadata, never a model binary, media Blob or executable
`positionAt`. The private fixed-position evaluator is the replacement boundary for
a future schema; callers and saved version 1 do not gain functions.

Validation happens before merge/replace side effects, portable pack/unpack,
import asset/font restoration and the save UI's JSON clone. An invalid stored
avoidance model preserves the original localStorage value, stops autosave and
pending asset cleanup (including pagehide), and displays the reason. A valid
explicit replacement/new project resumes autosave. This protective fallback does
not silently repair or overwrite the rejected project.

```sh
node dev/avoidance/model-test.cjs
# Optional fixed-baseline directory (default shown):
JIZURA_BEFORE=/workspace/work/avoid003-before node dev/avoidance/model-test.cjs
PYTHONDONTWRITEBYTECODE=1 python build.py
node dev/avoidance/model-review.cjs capture NEW-UNUSED-BUILD-ID
node dev/avoidance/model-review.cjs validate NEW-UNUSED-BUILD-ID
node dev/avoidance/model-negative.cjs NEW-UNUSED-BUILD-ID
node dev/avoidance/model-review.cjs validate NEW-UNUSED-BUILD-ID --base-url https://mokusatsu.github.io/lyricfx.JIZURA/
```

The baseline directory must be a fixed archive of commit
`c930c0977e1247865dcd5e45c4e9eb064b89f0fe`; capture verifies its HTML against Git.
The before iframe observes resolver absence. The after iframe calls the actual
production functions; neither side claims a generated safe lyric trajectory.
All 42 cases cover H01 boundaries/gap, H02 legacy/empty/OFF/malformed inputs and
H03 six dimensions × original/shortened/extended duration. Captures use a font
subset generated from the sample, all dynamic cases and model error text; each
captured panel's actual characters must exist in its cmap. Panels and result tables
must fit fully. Native PNGs are unscaled **control diagrams**, separate from the
full confirmation-panel screenshots. The validator checks exact canonical inputs,
resolved coordinates, source/asset/PNG hashes, local/public raw bytes, all sample
cases, comparison controls, desktop/mobile geometry and link/image loading.
Mutation tests serve a temporary cloned bundle through an overlay server, keeping
root application references intact. They require a passing unmodified clone and
specific rejection reasons; published bundles are never mutated.

The inherited full `project_file_test.cjs` still fails at its initial cut-count
assertion (expected 0, actual 1), before saving. 003's scoped portable model
roundtrip and malformed-input save guards pass; they do not turn that historical
failure into a full save-test pass. AVOID-013 retains the complete persistence work.

## AVOID-004 staged trajectory / drawing foundation

The [internal API](STAGE-API.md) documents supported bounds, ownership, font/final
plan lifecycle and explicit unsupported cases. Normal product generation remains
on the legacy path. New APIs are exercised by real center/tile layouts in the
versioned verification sample; auxiliary masking remains AVOID-018.

```sh
node dev/avoidance/stage-test.cjs
node dev/avoidance/stage-perf.cjs
node dev/avoidance/stage-review.cjs capture NEW-UNUSED-BUILD-ID
node dev/avoidance/stage-compositing-test.cjs NEW-UNUSED-BUILD-ID
node dev/avoidance/stage-review.cjs validate NEW-UNUSED-BUILD-ID
node dev/avoidance/stage-negative.cjs NEW-UNUSED-BUILD-ID
node dev/avoidance/stage-review.cjs validate NEW-UNUSED-BUILD-ID --base-url https://mokusatsu.github.io/lyricfx.JIZURA/
```

Use the runtime/browser variables above and the fixed
`/workspace/work/avoid004-before` archive of `9a3d43e`. The 004 scripts do not alter
002/003 bundles or validators. Validation checks canonical source/input, actual
live measured offsets/font width and re-rendered original PNGs in addition to all
asset hashes. Public raw-byte fetching reuses the approved browser transport;
manifest, every image/font/fixture and root JA/EN are required to match. Negative
tests validate an unmodified cloned bundle first, then require specific rejection
reasons. Failed attempts retain their original build directories and logs.

Managed capture environment note: browser video recording used the already installed
`/usr/bin/ffmpeg`, with Playwright's expected `ffmpeg-1011/ffmpeg-linux` path pointing
to it under `/workspace/work/avoid004-playwright`. Capture used
`PLAYWRIGHT_BROWSERS_PATH=/workspace/work/avoid004-playwright`; Chromium still used
`JIZURA_BROWSER=/usr/bin/chromium`. No home directory, CA trust, proxy or system
package was changed. Normal environments can use their installed Playwright ffmpeg.
The final sample serializes font/replan requests and adopts only the latest token;
manual seek/case/font changes stop playback. Validation exercises rapid changes.


## AVOID-005 basic-layout routes and comparison evidence

The sixteen basic adapters are a limited opt-in through
`J.finalizePlacementPlan(plan,{basicLayouts:true})`; ordinary application generation
keeps its legacy path. Read the [adapter ownership/proof/limits table](../../tasks/evidence/AVOID-005/adapter-contract.md)
and [internal API](STAGE-API.md) before interpreting a certificate. Primary text,
owned plates and actual pipe notes move together. Exactly four named repeated
auxiliary groups retain native motion; their masking belongs to018. Explicit
insufficient-space and unsupported results are not successful placements.

Using the existing Node/browser environment above, run from the repository root:

```sh
PYTHONDONTWRITEBYTECODE=1 python build.py
node dev/avoidance/basic-test.cjs
node dev/avoidance/basic-acceptance.cjs
# Run performance alone, after other browser jobs have stopped:
node dev/avoidance/basic-perf.cjs
node dev/avoidance/basic-review.cjs capture NEW-UNUSED-BUILD-ID
node dev/avoidance/basic-review.cjs validate NEW-UNUSED-BUILD-ID
node dev/avoidance/basic-negative.cjs review/AVOID-005/NEW-UNUSED-BUILD-ID
node dev/avoidance/basic-review.cjs validate NEW-UNUSED-BUILD-ID --base-url https://mokusatsu.github.io/lyricfx.JIZURA/
```

`basic-test` checks144 native spatial conditions (16IDs ×3aspects ×3circle
positions), each at five times, plus64 zero-offset native pixel replay cases,
24 actual huge glyph-split/gradient/stroke replay cases and five rejected clip
paths. The JSON distinguishes certified/insufficient/unsupported/error and per-ID
counts. `basic-acceptance` adds continuous-route counterexamples and independent
geometry, actual primary alpha-pixel bounds, real parsed note/suppression/size
notation/multiline behavior, compatibility controls, source/refinalization/seek
and cache/font lifecycle checks. Sampled frames corroborate the serialized
whole-interval certificates; they do not prove arbitrary continuous motion.
`basic-perf` uses all16IDs across100/100 and1000/1000 cuts/regions, reports cold
first samples as well as warmed p95, and enforces the existing2× planning and
+3ms drawing limits. Bounded cache and shared1px-buffer stats remain observable.

Capture uses the fixed `/workspace/work/avoid005-before` archive of
`3d8f52c7ce3f8efec25f5f0d7ad4c71bdb225173` and checks those bytes against Git.
It copies the exact final native report from
`tasks/evidence/AVOID-005/final-candidate/basic-test.log`. Core acceptance and parent
review must precede capture. Each immutable build contains123 representative
before/after screenshot pairs, separate native PNGs and four actual playback
videos (marquee/wave/scatter/diag). `basic-cases.fullMatrix()` defines449
conditions; this is not a claim that449 pairs were captured or all ran. The
manifest's actual rows establish screenshot coverage, independently of the144
native test conditions. Capture refuses an existing build directory. Use a new
ID after any failed attempt; do not rewrite an older review bundle.

The sample supplies Japanese case-specific見る箇所/変化/不変 guidance and real
legacy-small-area/fullstage/OFF/manual/lock/emphasis controls. H02 shows tile's
native main knock box, marquee's repeated-row boxes and gloss's actual pipe note;
it does not invent supplied note rendering for marquee or tile. The before side
uses the frozen baseline and the same conditions/palette/font as after.

The fixture runs an engine-only DOM (renaming the sole app root), avoiding editor
font jobs and saved-storage side effects while preserving raw app source and a
separately hashed executed fixture. Validation checks both source identities,
every PNG/font/fixture/video asset, expected safety outcomes, original-render
replay, desktop/mobile geometry, synchronized playback and current seek state.
`basic-negative` runs focused guard checks without an argument; with a bundle
path it first validates an unmodified temporary clone, then requires corrupted
source/hash/condition/count/image/video/path inputs to fail. It never mutates the
published bundle. Public validation uses inherited proxy/CA/TLS and raw browser
response bytes; local success cannot substitute for deployment checks.

The candidate core is locally verified and parent-reviewed. Public raw-asset,
native-render and JA/EN startup validation is recorded in [AVOID-005](../../tasks/AVOID-005.md);
human H01–H03 behavior acceptance remains pending. Do not infer either from a local
capture or from the presence of a bundle directory. Existing002/003/004 bundles
and validators remain immutable.
