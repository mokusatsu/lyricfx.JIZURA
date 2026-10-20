# Browser and MCP verification

## Reproduce the checks

Use Node.js 24, Python 3.12 and pnpm 11.25.0. From the repository root:

```sh
pnpm --dir mcp install --frozen-lockfile
(cd mcp && pnpm exec playwright install --with-deps chromium)
PYTHONDONTWRITEBYTECODE=1 python3 build.py
git diff --exit-code -- index.html en/index.html
node dev/lyric_test.js
node mcp/site-smoke-test.mjs --local
node mcp/special-cuts-test.mjs
node mcp/special-cuts-test.mjs en
node mcp/favorites-test.mjs
node mcp/custom-effects-test.mjs
(cd mcp && pnpm test)
```

Run each command only after the preceding command succeeds. On a managed Linux
machine with an existing Chromium installation, set
`JIZURA_BROWSER=/usr/bin/chromium` for the Node test commands instead of downloading
another browser. Configure package-manager caches in a writable location if the
home directory is read only. Do not modify lockfiles to install dependencies.

`.github/workflows/verify.yml` runs these build and test checks on pull requests,
pushes to `main`, and manual workflow dispatch. It needs only repository read
access. It does not deploy or change GitHub Pages settings. Its first hosted run
is required before claiming that GitHub Actions itself has been verified.

The build check catches generated HTML that was not refreshed after source
changes. The local site smoke test serves only the Japanese and English pages,
compares their SHA-256 hashes with the checkout, then generates two timed lyric
lines and checks canvas rendering and JavaScript exceptions. It blocks external
fonts and optional models so those services cannot hide or break the core check.
The MCP integration suite additionally exercises audio import and MP4 output.
These checks do not validate visual quality, real After Effects, optional remote
models, or every browser.

## Check an actual deployment

After deployment, run from the matching checkout:

```sh
node mcp/site-smoke-test.mjs
# Or another deployment whose HTML must match this checkout exactly:
node mcp/site-smoke-test.mjs --base-url https://example.com/project/
```

The default target is `https://mokusatsu.github.io/lyricfx.JIZURA/`. The command
checks Japanese and English HTTP responses, exact HTML hashes, initialization,
lyric generation and drawing. A stale deployment, HTTP error, JavaScript error,
or TLS error fails the command. Do not turn off TLS verification to get a pass.
A feature branch with changed HTML is expected to fail the hash comparison until
that exact HTML has been deployed. Local smoke success is not deployment success.

## Certificate incident: managed cloud Chromium

Investigated on 2026-10-18. This is a development-environment issue, not a request
to replace GitHub Pages certificates or configure certificates for site visitors.

Observed evidence:

1. Python could verify HTTPS to `registry.npmjs.org` using the system trust store.
   The observed leaf certificate had an OpenAI issuer, showing that the managed
   outbound proxy terminated TLS. This is not GitHub's public certificate chain.
2. The leaf verified against the platform-provided
   `/usr/local/share/ca-certificates/environment-proxy-ca.crt` with OpenSSL's
   default CA path and store disabled for the comparison.
3. The identical root certificate was already in
   `/home/agent/.pki/nssdb`, under the nickname `OpenAI-nebula-dns`. A nickname alone
   is not sufficient: the SHA-256 fingerprints matched and that exported root
   also verified the observed leaf. The earlier suspicion of an absent root was
   therefore incorrect.
4. System Chromium 154, launched normally by Playwright, failed with
   `ERR_CERT_AUTHORITY_INVALID` inside the workspace sandbox. File-access tracing
   showed `access(.../.pki/nssdb/cert9.db, W_OK) = -1 EROFS` when Chromium initialized
   its certificate database.
5. The same executable, URL, user and Playwright launch options succeeded with
   HTTP 200 outside that filesystem sandbox. TLS checking stayed enabled. The
   SHA-256 of `cert9.db` was identical before and after this comparison.

Together, these observations isolate the failure to Chromium's access to its NSS
trust database under the read-only sandbox. A root already trusted by the system
and present in NSS did not make that database usable by the sandboxed process.
There is no evidence here of a defective GitHub-managed `github.io` certificate.
The proxy prevents this environment from directly inspecting GitHub's original
public certificate chain; ordinary visitor TLS is a separate connection.

For an HTTPS browser check, use the platform's supported permission mechanism to
allow Chromium the required trust-database access, or run that check in an
approved execution context where the existing database is accessible. Then retry
the unchanged check. Do not add duplicate CAs, edit the site's certificate,
use `ignoreHTTPSErrors`, use `--ignore-certificate-errors`, or bypass the proxy.
The diagnostic comparison made no CA or site configuration changes.

Networking is a separate prerequisite. In the replacement cloud instance,
`api.github.com` and `mokusatsu.github.io` requests were rejected by the proxy
with CONNECT 403 before TLS could start. This does not indicate a certificate
failure. Those destinations must be permitted in the active environment before
checking Pages settings or running the public-site command. Saved configuration,
runtime policy observations and successful requests are distinct evidence.

## Circular avoidance contract and visual evidence (AVOID-002)

The production avoidance behavior is unchanged in 002. The reusable contract,
independent geometry oracle, 184-ID responsibility reconciliation, portable
baseline runner, save-test server/font prerequisites and immutable review bundle
commands are documented in [dev/avoidance/README.md](../dev/avoidance/README.md).
Set `JIZURA_BROWSER` for the six baseline tests; assertions are unchanged. A
managed sandbox may require the supported approval context for Chromium sockets.
Public validation uses `review.cjs validate BUILD --base-url URL`, checks every
manifest asset and app HTML against local hashes, and never falls back to local
success when networking fails. Local captures alone do not establish deployment.

## AVOID-003 model validation

See the [003 API and evidence commands](../dev/avoidance/README.md#avoid-003-production-control-model-and-resolver).
Run `model-test.cjs` with the existing browser runtime and fixed c930c09 baseline.
Use `model-review.cjs` and `model-negative.cjs` for the 003 bundle; the 002 validator
continues to enforce its original unchanged-production contract. Public 003
validation supports `--base-url` and uses Chromium's existing proxy/CA transport.
Neither local evidence nor an unpublished comparison establishes a deployed pass.

## AVOID-004 staged drawing verification

Run `stage-test.cjs`, `stage-perf.cjs`, `stage-review.cjs` and `stage-negative.cjs`
as documented in [the avoidance README](../dev/avoidance/README.md#avoid-004-staged-trajectory--drawing-foundation).
The [API scope](../dev/avoidance/STAGE-API.md) explicitly separates measured geometry,
whole-interval certificates and unsupported adapters. Tests include independent
actual raster ink containment, ordered record/replay pixel equality, full-stage
camera/ghost/transition seeks, controlled font states and fixed-before legacy
controls. This does not enable the new path for ordinary application generation.


## AVOID-005 basic-layout route verification

Use the [005 commands and evidence boundaries](../dev/avoidance/README.md#avoid-005-basic-layout-routes-and-comparison-evidence):

```sh
node dev/avoidance/basic-test.cjs
node dev/avoidance/basic-acceptance.cjs
# Run alone for controlled timing:
node dev/avoidance/basic-perf.cjs
node dev/avoidance/basic-review.cjs capture NEW-UNUSED-BUILD-ID
node dev/avoidance/basic-review.cjs validate NEW-UNUSED-BUILD-ID
node dev/avoidance/basic-negative.cjs review/AVOID-005/NEW-UNUSED-BUILD-ID
node dev/avoidance/basic-review.cjs validate NEW-UNUSED-BUILD-ID --base-url https://mokusatsu.github.io/lyricfx.JIZURA/
```

Set the existing `NODE_PATH`/`JIZURA_BROWSER` runtime variables documented in the
avoidance README. The fixed before archive is commit
`3d8f52c7ce3f8efec25f5f0d7ad4c71bdb225173`, not the moving HEAD. The sixteen
adapters remain limited to explicit `basicLayouts:true`; ordinary generation is
legacy. [Ownership and limits](../tasks/evidence/AVOID-005/adapter-contract.md)
separate analytic whole-interval proof from independent sampled/raster checks
and retain honest insufficient/unsupported outcomes.

The native suite covers144 spatial conditions,64 native replay cases and24
actual huge glyph-split replay cases. The independent acceptance suite covers
actual pixels, parsed lyric semantics, controls, time/source/font/cache lifecycle.
The comparison capture selects123 before/after pairs and four playback videos
(marquee/wave/scatter/diag) from a449-condition definition. These are distinct
coverage sets;449 definitions do not mean449 executed comparisons. Validation
requires the actual manifest rows, exact source/asset hashes, re-rendered native
PNGs, synchronized playback and desktop/mobile behavior. Negative tests operate
on a temporary cloned bundle.

The core has local verification and parent code/test review. Public checks have
passed and are recorded in [AVOID-005](../tasks/AVOID-005.md). The user accepted the
Stack correction; the parent recorded why no further human checks were needed
for the remaining conditions, and completed 005. Capture success alone does not
establish acceptance. Public validation keeps inherited proxy/CA/TLS, fetches raw bytes and
fails on missing/stale assets; it never falls back to local evidence.

## AVOID-006 native layouts-A verification (original comparison history)

The original comparison through immutable `local-20261019-02` used the baseline,
187 inputs and evidence paths described below. Its eight small corner-circle
examples were diagnostic inputs; they are not the revised primary safety examples.
Keep those bundles unchanged. Current tools follow the adaptive procedure after
this historical section.

AVOID-006 adds an explicit `layoutsA:true` staging option for 26 native layouts.
It keeps each composition's primary lyrics, owned frames and meaningful captions
together. Ordinary application generation stays on the existing path until 017;
the auxiliary circular mask belongs to 018. Source ownership and admitted native
motion bounds are recorded in `dev/avoidance/layouts-a-inventory.json`.

```sh
node dev/avoidance/layouts-a-test.cjs
node dev/avoidance/layouts-a-acceptance.cjs
node dev/avoidance/layouts-a-scales.cjs
node dev/avoidance/layouts-a-contrast.cjs
node dev/avoidance/layouts-a-font-test.cjs --browser
node dev/avoidance/layouts-a-review.cjs capture NEW-UNUSED-BUILD-ID
node dev/avoidance/layouts-a-review.cjs validate NEW-UNUSED-BUILD-ID
node dev/avoidance/layouts-a-negative.cjs review/AVOID-006/NEW-UNUSED-BUILD-ID /workspace/lyricfx.JIZURA --playback
node dev/avoidance/layouts-a-review.cjs validate NEW-UNUSED-BUILD-ID --base-url https://mokusatsu.github.io/lyricfx.JIZURA/
node mcp/site-smoke-test.mjs
```

Use the existing runtime variables above. The immutable before archive is
`b64ee11e9a762942643babd4f637ded8efdd8b42` at `/workspace/work/avoid006-before`.
Capture requires the final candidate's `layouts-a-test.log` under
`tasks/evidence/AVOID-006/final-candidate/`. The comparison has 187 selected pairs;
this definition is not proof that capture or public validation has run. In its
26 anchor conditions, eight use a diagnostic corner circle with radius 0.02;
those do not demonstrate avoidance of a standard central circle. Input and
native parameter differences are disclosed per case.

Validation checks every raw asset and both deployed application pages, native
PNG re-rendering, responsive comparisons, actual playback, rapid seeks and app
startup. `--playback` additionally verifies that a real renderer failure after
playback starts is detected. Sampled raster checks do not replace the analytic
whole-interval envelope. Keep proxy, CA and TLS verification enabled; a Pages
workflow success alone is not a public verification pass. The current state and
actual completed evidence remain in [AVOID-006](../tasks/AVOID-006.md).


### Adaptive revision: current comparison procedure

The revised comparison enables the existing staged A26 path **on both sides**.
Before is commit `06b87459822ac5bc6395e20b8eeb4a47cf12cb57`, archived at
`/workspace/work/avoid006-adaptive-before`; after alone adds
`layoutsAAdaptive:true`. Both engines execute the same candidate compatibility
fixture with identical text, native parameters, seed, font and real timestamp.
The manifest preserves both original HTML documents, the original before fixture,
the executed fixture and explicit options. HTML normalization only renames the
editor mount and removes its two font preconnects; engine scripts are unchanged.
Use a new build ID after `local-20261019-02`; an existing ID cannot be overwritten.

The current definition has 174 selected pairs, rather than an exhaustive matrix.
The 18 accepted native examples retain their exact original inputs and require
certified staged before/after results with identical native PNGs and font sizes.
The eight revised primary examples use `1920×1080`, circle center `(0.5,0.42)`,
radius `0.2` and multiple characters (`風の先へ`); `panels` explicitly uses
`fx:none`. These dimensions, position and parameters appear in the labels. Each
must actually certify full-interval safety or the qualified hold safety below.
The smaller `960×540` central-circle cases remain explicit limit cases; candidate
exclusion there is not counted as a primary safe example. Variable radii, aspect
ratios, text amounts, entry/exit frames, region boundaries and H01–H03 controls are
selected observations, not a claim of support for every input combination.

Full-interval safety and `stationary-strict-moving-entry-exit-relaxed` are separate
outcomes. In the latter, stationary events and every hold frame stay strictly
clear; only source-tagged moving native events may cross during declared entry or
exit windows. Native `motionTime` classifies each event/pass, while project real
time selects the circle region. The quote body and source remain strict; moving
quotation marks can relax. Dedicated quote-left exit and ticket-bottom entry examples explicitly change the
circle position and include a same-input hold frame. Videos must contain both actual alpha-1 circle passage
and a strict hold audit in the same recording. Validation re-renders those audit
frames at their exact native timestamps, as well as every comparison PNG.

Manual placement, lock, real `72:` notation and avoidance OFF remain unchanged
controls. Real explicit `contentScale` can use same-size composition changes but
cannot receive extra shrink. Actual stage text size is checked after that scale.
Noto CJK and a licensed, disjoint DejaVu symbol subset are pinned before UI and
Canvas measurement; coverage includes all current comparison branches, decoded
runtime source escapes and actual native text draws.

Before capture, the parent must inspect the new adaptive suite's actual results
under `tasks/evidence/AVOID-006/adaptive-revision/final-candidate/`:
`layouts-a-adaptive-test.log` and `functional-summary.json`. The summary identifies
the executed script, log, compiled JA/EN, fixture and all `src` files by SHA-256,
records exit status, actual counts, failures and unrun checks, and identifies the
implementation model/effort. Capture requires candidate hashes to match and
counts to match the suite's final raw JSON. Capture requires the nine core suites (adaptive, native A26, acceptance, scales,
contrast, basic native/acceptance, stage and stack), rejects duplicate suite names,
and verifies script and raw log hashes for every supplied additional suite as well.
Logs use canonical safe relative paths `fixtures/SUITE-NAME.log`; missing or altered
logs block capture and validation. Every suite log is included in the raw asset
manifest. These receipts are bundled under the same names; the original native-suite log is not presented as an adaptive-suite
result. A successful receipt does not replace actual geometry and raster checks.

```sh
JIZURA_TEST_REPORT=work/avoid006-adaptive-report.json node dev/avoidance/layouts-a-adaptive-test.cjs
node dev/avoidance/layouts-a-negative.cjs
node dev/avoidance/layouts-a-font-test.cjs --browser
# Prepare and review the candidate-matched final log/summary receipt above.
node dev/avoidance/layouts-a-review.cjs capture NEW-UNUSED-ADAPTIVE-BUILD-ID
node dev/avoidance/layouts-a-review.cjs validate NEW-UNUSED-ADAPTIVE-BUILD-ID
node dev/avoidance/layouts-a-negative.cjs review/AVOID-006/NEW-UNUSED-ADAPTIVE-BUILD-ID /workspace/lyricfx.JIZURA --playback
node dev/avoidance/layouts-a-review.cjs validate NEW-UNUSED-ADAPTIVE-BUILD-ID --base-url https://mokusatsu.github.io/lyricfx.JIZURA/
```

`--source-root CHECKOUT` reads a candidate without editing it. `--smoke` writes
isolated tooling evidence under `work/`, labels it as incomplete, permits an
explicit missing-receipt marker and cannot be publicly validated as acceptance
evidence. A pre-freeze snapshot, a matrix definition or a local pass does not
establish that the final bundle was captured, published or publicly verified.
Final completion and public build identity remain in the task/review records.

### Compressed adaptive comparison evidence (schema 3)

Current tooling writes `schema:3`, revision
`adaptive-v2-compressed-observations`. Every case side retains its complete
observation as a canonical `observations/CASE-SIDE.json.gz` asset. Its reference
pins encoded and raw SHA-256 and byte counts. Validation requires the exact
case-side path, rejects symlinks, limits decompression to 32 MiB per observation,
and hydrates the original JSON before running the same geometry, raster,
composition and live observation checks. Every gzip asset remains in the public
raw-byte fetch inventory. The comparison HTML shows strategy, variant, font
scale, quality, glyph coverage counts and native event clocks/phases, with full
attempt reasons and links to the complete gzip observations; polygon vertices
are not expanded into HTML.

An existing schema-2 capture can be repackaged without repeating photography:

```sh
node dev/avoidance/layouts-a-review.cjs repack SOURCE-BUILD NEW-UNUSED-BUILD
node dev/avoidance/layouts-a-review.cjs validate NEW-UNUSED-BUILD
node dev/avoidance/layouts-a-negative.cjs review/AVOID-006/NEW-UNUSED-BUILD /workspace/lyricfx.JIZURA --playback
```

Repack first executes the exact captured schema-2 validator, including tool
identity, generated HTML and every raw asset check. Its three capture-era tool
snapshots are preserved under `fixtures/capture-tool-*`. The repack receipt pins
the source build and manifest hash, records that photography was reused, and
lists every reused asset hash. The original large manifest stays in the immutable
source bundle; the new bundle carries its hash rather than a second copy.
Original images, videos, source documents, fixture, cases, fonts and samples are
copied byte-for-byte. The current tool snapshots describe packaging and validation;
the captured snapshots describe photography. The existing font subsets must cover
the entire new index. Both new index and manifest must be below 100 MiB.

The compressed transport negative suite covers missing/corrupt gzip data,
case-side reference substitution, paths, encoding, byte counts, hashes and size
limits. It also recomputes all transport hashes after semantic raster/envelope
changes and requires the original oracle to reject those observations. A local
repack pass does not establish public deployment; the usual public raw-byte,
348 native-frame rerender, playback and application startup checks still apply.

### Lossless PNG storage and immutable sharing (schema 4)

New captures use `schema:4`, revision `adaptive-v3-lossless-shared-png`. Install
its exact image dependencies with `cd dev && npm ci`; the helper resolves that
local installation directly. The package and lock snapshots, PNG helper and
capture tools are raw inventory assets. The manifest records Node, pngjs, sharp
and libvips versions; each PNG receipt records the encoder settings and selection.

All 174 case pairs, 696 PNG references, original pixel dimensions, full compressed
observations and four actual playback videos remain required. Each UI/native
receipt preserves the original capture hash/bytes, saved encoded hash/bytes and
decoded RGBA hash/bytes. Native receipts additionally preserve
`liveCanvasPNG_SHA256`, the exact hash of the original Canvas `toDataURL()` bytes.
A lossless sharp candidate uses compression level 9, adaptive filtering, no palette
and effort 10. Every candidate must decode to the same dimensions and every RGBA
byte as its original; choose the smaller encoding. If the original bytes already
exist in a whitelisted immutable published bundle, reuse those bytes with zero
new storage instead. Identical saved bytes within the new bundle use one hash
named PNG. This changes storage references, never case counts or image sizes.

Shared PNG references must use the helper's exact canonical relative URL and
pinned source manifest SHA-256. The original manifest's asset hash and actual raw
file must agree. Symlinks, traversal, unlisted builds and non-image source
substitution fail. Both every referenced PNG and its source manifest belong to
the public raw-fetch inventory. Sharing never writes the old asset. Current JA/EN
application source hashes and the actual font coverage checks remain mandatory.

Live validation first checks the original Canvas PNG exact hash and byte count, then compares
all decoded RGBA bytes against its saved encoding. It also compares each live UI
screenshot's original raw hash/byte count and compares its saved UI by every RGBA byte. Capture and validation use the same
1500×1500 viewport, DPR1, zero scroll, settled pinned fonts and stopped playback;
UI screenshots are full-page with the same screenshot options. A UI mismatch
must be investigated; it cannot be resolved by silently replacing the expectation.
The independent observation oracle still receives the complete hydrated JSON.

Run `node dev/avoidance/layouts-a-negative.cjs` for small synthetic transport and
PNG guards. These are tooling tests, not photographed acceptance evidence. The
bundle negative command additionally checks a cloned bundle and playback failure
injection. Existing schema-2/3 evidence dispatches to its captured validator when
its tool differs, with the supplied `--source-root` still enforced. Use its actual
historical checkout when validating historical source identities. Existing bundles
are immutable; schema 4 does not rewrite or upgrade them. A new capture still
requires the candidate-matched functional receipt and parent release for the full
capture/browser workload. Public validation and actual app startup remain required.

Color interpretation is checked separately from RGBA equality. The receipt pins
all original/saved ICC, gamma, sRGB, chromaticity, HDR color and EXIF chunks by
hash/length and requires them to agree. If recompression would drop or change
those chunks, retain the original encoding. A PNG without these chunks is
explicitly recorded as using the default sRGB interpretation. Live UI and native
checks also compare the metadata. Representative browser-decoded pixel checks
remain part of the parent review before release.
