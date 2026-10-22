# AVOID-007 review browser phase isolation

Status: isolated implementation and limited local qualification; parent review
pending. No full50/full04, actual four-video sample, private/public network,
product capture or publication. Full03's real drop3 failure and target02's fresh
sample successes remain unexplained history; this patch does not establish the
cause or claim that full04 will pass.

Owner: gpt-6.1-sol / medium. Initial isolated HEAD a4dea478; parent-authorized
shared baseline copied into isolated commit `89534b0`. Do NOT integrate that
copy commit: the submitted implementation patch is its child delta. Baseline:

- review `81bf50e17fdc0079f81826c2548a2ff07e9ba6e57e432b6da81332f210128b58`
- review-test `53c562191e73332b60a40369a081bd2c55f735fa0a12f30fb57b42be7356689a`
- playback-window-test `b1edd8230dfe3a72cda01b1da86f627ea6d01ceb1708eb5698533b1aa5a49362`

The parent-approved `browser-phase-isolation-plan.md` is the specification.
Shared product/source/fixture were read only; no shared files changed.

## Behavior

The ordinary validator now owns three sequential browser lifecycles:

1. raw-ui: all raw HTTP/hash/range checks and four JA/EN desktop/mobile controls.
2. playback: fresh page per video, same-origin locally fulfilled minimal blank,
   then only that native MP4. No preceding comparison-page PNG/UI workload.
3. native-live: all native key frames forward/reverse, then both sides of the
   first case's mobile live controls (the existing TWO live rows).

A complete `await browser.close()` precedes the next launch. Records expose
fixed phase/lifecycle/status enums and ISO start/acquire/close timestamps. Every
outcome closes the active owned browser and local server; per-video finally
pauses/removes src/loads/disposes its handle and closes its page. Isolate installs
inside page try/finally, including raw/UI/live. On close failure the owner can
retry in outer finally; observer errors cannot bypass an owned close attempt.

A provided browser is never closed, and is explicitly labelled
`provided-shared-diagnostic`/`released-shared` with release timestamps. It does
not claim production process isolation. Exact-helper lifecycle mocks verify that
next-phase acquisition fails while previous close is pending and that caller
ownership is retained. Existing launch/proxy/CA/TLS/origin routing remains byte
identical. The same authorize hook is passed to every phase's page/fixture;
three-phase mock routing exercises same-origin continuation plus foreign/redirect
aborts. The real synthetic run also exercised the authorization callback.

Before launch, source/tool/manifest/all indexed asset/package/browser-helper/test
hashes are pinned; asset pins match the validated manifest. At exit, all pins are
rechecked even on failure. Existing final all-asset rehash remains. Pins cover
active validator, Playwright package metadata and available shared browser helper;
they are not a recursive hash of the entire external browser installation.

`playNativeVideo` retains decoded0 seek proof before baseline quality. It adds
rVFC callback/observed monotonic timestamps, mediaTime, presentedFrames,
currentTime, quality counters, window times, callback count/monotonic flags and
media-time gap diagnostics. Timeout/media error/play rejection cancel callback,
timer and handlers and preserve numeric failure diagnostics. The page wrapper
returns those diagnostics for pre-assert recording. Ended/currentTime≈4,
decoded>=92/drop0/corrupt0 and all existing seek/native/HTTP assertions remain.
New callback diagnostics do not replace or relax any acceptance gate.

The private runner now projects only fixed phase enums/ISO timestamps and the
explicit numeric/boolean callback diagnostic fields. Unknown/free text/headers
and credential-bearing objects remain discarded. Its main live completion gate
remains the real first-case two rows. Memory-only secret handling is unchanged.

## Generation and source proof

`browser-phase-generation-proof01.json` compares the exact shared baseline to
candidate. Entire prefix before playNativeVideo (generation and seek code) is
byte-identical. 35 original exported functions are byte-identical; only playNativeVideo and
validateBrowser change among existing exports. Unchanged functions include
capture/render/encode/probe/PNG/
HTML/controls/proxy/isolate. Three lifecycle/pin helpers are new. An incidental
capture initialization substitution was caught by this comparison and restored
before final source qualification. No generation change remains in the patch.

## Qualification actually executed

- `browser-phase-mocks01.log`: 8 pure helper/lifecycle tests, including flush
  drops excluded before baseline, true playback drop still rejected, timeout/
  media/play rejection cleanup, source disposal, phase auth, pin mutation.
- `browser-phase-synthetic01.log`: existing eight-test suite, one synthetic
  64×48 case only. Tiny production PNG/stdin encoding path is unchanged; no
  product capture() or B25 fixture/product HTML. Default-owned three-browser
  path exercised; all8 pass in19.5s. Both video sides: ended4s, decoded92,
  drop0/corrupt0, playbackRate1,95callbacks, no >1frame media-time gap. All three
  phases closed, next starts at/after prior closedAt, inputIntegrity unchanged.
- `browser-phase-private01.log`: all6 pure memory fake-validator tests pass,
  including new phase/timestamp/callback whitelist checks and token redaction.
- `browser-phase-cli-offline-receipt02.json`: tracked Python actual-CLI stdin
  qualification success/failure, runtime-generated synthetic sentinel only.
- `browser-phase-bridge01.log`: all14 offline bridge tests pass. Approved H03
  [3,7) amendment and unchanged main-only byte golden; see separate window note.
- Node syntax checks on edited CJS files and git diff check pass. Existing
  playback-window file's helper mock was updated for rVFC/performance interface;
  its actual four-video shared-bundle section was NOT executed here.

Initial browser attempts failed before test work: default Playwright headless
binary absent, then system Chromium blocked by sandbox setsockopt EPERM. Existing
JIZURA_BROWSER=/usr/bin/chromium plus approved tool sandbox escalation permitted
the localhost-only test. No browser download, proxy/TLS bypass or new launch
flags. Final synthetic source-byte run passed; earlier attempt logs remain at
/tmp/avoid007-phase-synthetic01.log and02.log, and an intermediate passed run03
preceded the capture-prefix restoration. Only the final byte run is acceptance
for this patch. CPU release was reported to parent after tests.

Final pins/log hashes are in `browser-phase-qualification01.json`. Parent must
review and integrate only the child patch while the shared tool is unused.
Any future full04 remains separately authorized and must pass all original gates
in one complete run; do not assemble success from earlier partial reports.
