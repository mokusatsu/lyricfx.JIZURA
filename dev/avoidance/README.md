# AVOID-002 contract and reproducible evidence

Production `src/` and generated Japanese/English application HTML are unchanged.
The fixture page runs a frozen copy of the existing renderer. Its separate dashed
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
