# AVOID-007 native MP4 comparison tooling

Status: tool qualification only; product B25 capture, performance, publication and visual acceptance have not been performed by this tooling change. Work is isolated in `/workspace/avoid007-media-tools`, detached at `e96cbb2f8379eb5895c36f1312f5083b0c583e75`. Only the new review tool, its test and this note are owned here. Shared product files and task records are unchanged.

The evidence-driven-task-management skill, implementation-review-policy and visual-review-comparison contract were read. The parent owns task status and publication decisions. The accepted `all-review.cjs` PNG-stream encoder/decoded-seek design, `film-review.cjs` H264/ffprobe/faststart checks, `layouts-a-review.cjs` engine-only DOM normalization and `review.cjs` environment-proxy policy were consulted. Their historical runs are reference material, not new B25 evidence.

## Interface and input contract

```js
const review = require('./dev/avoidance/layouts-b-review.cjs');
await review.capture(config, '/absolute/fresh/build-directory');
review.validateFiles('/absolute/build-directory');
await review.validateBrowser('/absolute/build-directory', {
  baseURL: 'https://private.example/build-id/', // omit for local range-capable server
  // Optional in-memory only. Called for the exact baseURL origin only.
  authorize: async ({ origin, url }) => ({ Authorization: memoryValue }),
});
```

The CLI provides `capture config.json fresh-directory`, `validate-files directory`, and `validate-browser directory [baseURL/]`. Authenticated review uses the programmatic callback; there is no token argument, token environment read, or persisted auth field. Do not put credentials in config, URL, manifest or receipt. Redirected requests and foreign origins are blocked before the authorization callback; raw fetch also uses `redirect: 'error'`. Site authentication/publication remains the parent's responsibility.

`config` has the following shape (the case below is a shape example, not a qualified safe representative):

```js
{
  buildID: 'fresh-generation-id',
  before: {root: '/repo-containing-e96-git-objects', commit: 'e96cbb2f8379eb5895c36f1312f5083b0c583e75'},
  after: {root: '/current-candidate-repo', identity: 'candidate source hashes; need not be committed'},
  fixture: '/candidate/dev/avoidance/layouts-b-fixture.js',
  fonts: [{name: 'sans-jp.ttf', path: '/actual/subset/sans-jp.ttf'}, /* all actual faces */],
  fixtureOptions: {
    fonts: {version: 1,
      faces: [{id: 'sans', family: 'Actual Fixture Family', url: 'fonts/sans-jp.ttf',
        weight: '400', style: 'normal', label: 'Actual face label',
        sourceSHA256: 'original-font-source-hash', cmapSHA256: 'subset-cmap-hash'}, /* ... */],
      assignments: {/* original native font key: actual face id */}
    }
  },
  supportFiles: [{name: 'font-coverage.json', path: '/actual/font-coverage.json'}],
  fontAuditPath: 'evidence/font-coverage.json',
  pins: ['/additional/source-or-test-or-dependency-input'],
  limitations: ['Auxiliary circular mask is deferred to AVOID-018.'],
  cases: [{id: 'rain-representative',
    conditions: {layout: 'rain', W: 1920, H: 1080, seed: 704, text: '風の先へ',
      cx: .5, cy: .42, radius: .2, start: 0, duration: 4, time: 0, camera: 'push'},
    hids: ['AVOID-007-H01', 'AVOID-007-H02'],
    focus: {ja: '見る箇所', en: 'Where to look'},
    intent: {ja: '意図した変化', en: 'Expected change'},
    preserve: {ja: '保持すべき表現', en: 'What to preserve'}}, /* exactly the B25 set */]
}
```

All 25 supported IDs must appear exactly once; arbitrary sets of 25 strings and orbit/circleWords are rejected. Cases must cover H01–H03. Text, seed, circle, stage, clock, camera/FX and all remaining spec fields are fixed in one shared case object. The before/after differences are the engine source bytes and `newPath:false/true`. Before is e96's original full-stage native composition with `area:null`; this explicitly removes the historical small-area UI rendering. It is not presented as an old ON switch with a new API. Baseline API absence is displayed. Candidate commit identity is optional; executed source-content hashes identify the candidate.

Final review requires the approved `fixtureOptions.fonts` API with at least six distinct font assets and byte identities. Single-font transport is not final acceptance. Bundle-root relative face URLs become absolute URLs only in memory at runtime; the saved config stays relative. Source-font/cmap identities and role assignments remain inspectable in config and the mandatory bundled font audit. Font generation, actual emitted-glyph coverage, font-role interpretation and acceptance of the audit remain with the main implementation. The tool checks actual browser FontFace loaded status and the fixture's font-loaded assertion; it does not invent a coverage result from those checks.

## Acquisition and portable files

The tool first snapshots before `index.html`, `en/index.html` and every e96 source JS directly from Git objects; the candidate gets current index/EN plus every current top-level `src/*.js`, including untracked new adapters. It also copies the fixture, actual font bytes, supporting audit files, tool/test, dev package metadata/lock/browser helper, Playwright package identity and explicit additional pins. `startup.json` records those byte hashes before browser startup. Original inputs with filesystem paths are checked again before launch and at completion, including failure cleanup. The existing strict DOM normalization disables app startup and removes only the two known font preconnect elements; raw source HTML remains alongside the normalized executed engine.

Each representative side creates an original-size Canvas. Frame `n=0..95` is rendered at exactly `n/24`, with `noHud:true,noPost:true`. `getImageData` RGBA SHA-256 is recorded on every frame and compared to a CRC-checked, fully inflated/defiltered original Canvas PNG on the four key frames. Every stream PNG's IHDR dimensions are checked. Non-key frames retain hashes without allocating and decoding all RGBA bytes again in Node. The original PNG is immediately written to ffmpeg stdin (`image2pipe`, libx264, CRF22, yuv420p, one encoder thread), with backpressure and encoder-exit checks. This is neither an HTML recording nor a file-based PNG slide sequence nor a source-video transcode. Only original key PNGs at 3/15/36/90 are saved. All 96 native PNG/RGBA hashes and safety observations remain in JSON records.

Before succeeds only without a staged trajectory or legacy area shrink. After requires a supported certified trajectory and safe segments; all rendered native placement observations must report supported measurement, covered envelope and safe status. Unsupported/conflict/excluded/empty observations fail closed. The current main implementation reports only full-interval `certified-bounded-adapter`/`safe`. Future safe-hold schemas, a legitimate externally skipped t=0 frame, or a different certificate require an explicit reviewed extension; they are currently rejected rather than fabricated as successful frames. This guard is not an independent all-time safety proof: the main implementation's numeric/sweep evidence remains separate.

ffprobe must find one H264 yuv420p video stream, original even dimensions, 96 encoded and decoded frames, both rates 24/1, and exact 4-second duration. MP4 atoms must have moov before mdat. Separately, decoded H264 key frames produce RGB MAE/error/PSNR measurements against native PNGs; alpha is excluded and nonopaque source pixels are counted. Lossy MP4 pixels are never required to equal native Canvas RGBA.

Each generation is a fresh immutable directory:

```text
index.html, en.html, live.html, controls.js, live.js, manifest.json, startup.json, config.json
sources/{before,after}/{index.html,en/index.html,src/*.js}
fixtures/{before-engine.html,after-engine.html,fixture.js}
fonts/*, evidence/*, runtime/*, pins/*, tools/*
videos/<case>-<side>.mp4
images/<case>-<side>-{3,15,36,90}.png
observations/<case>-<side>-{initial,frames}.json
```

Every asset reference is local and relative. All source, fonts, fixtures and generated controls needed by the browser are inside the generation directory; old immutable bundles are not required. Browser review needs no npm runtime or external network. Re-executing the captured Node tool requires Node, ffmpeg/ffprobe and an available Playwright/Chromium runtime. The Node PNG decoder itself uses core modules only and accepts the native 8-bit RGBA Canvas PNG format, failing closed for other encodings. Manifest self-hash is returned to an external receipt, never embedded in itself.

JA/EN review pages provide side-by-side native MP4s, play/pause, four original key-image pairs, keyboard-operable native toggle/overlay/zoom controls, original PNG links, H01–H03 anchors and live fixture links. Case labels show circle center percentages, short-side radius percentage/pixels and that native MP4/PNG pixels contain no circle guide. No guide is burned into the native source. Mobile layout stacks before/after and keeps overflowing zoom content inside scrollable image containers. The live fixture uses the exact local engine/fixture/font inputs and a frame slider; it is not used as a video acquisition source.

## Verification and boundaries

File validation checks every indexed raw asset hash, required asset closure, startup input identity, executed engine normalization, baseline source control, recorded identical conditions plus actual planned stage/cut text/layout/avoidance regions, native key PNG RGBA/CRC, 96 frame records, safety observations, MP4 metadata and separate lossy quality measurements. HTML/JS are reproduced from the manifest/tool and compared to stored bytes. Native key frames are rerendered and matched in forward and reverse order.

Browser validation fetches manifest and every asset as raw `ArrayBuffer` and checks SHA-256, records content type, checks MP4 Range 206/Content-Range, runs both languages at 1100px/390px, decodes all images and exercises actual pair play/pause/toggle/overlay/zoom controls. Every MP4 is tested for forward/reverse seeks with post-seek decoded-frame callbacks within one 24fps frame, then visible playback to ended/currentTime=4, at least 92 decoded frames (the accepted AVOID-006 threshold), zero dropped and zero corrupt frames. A dedicated visible video isolates decoder verification from long review-page scroll position. Local and optional private-origin checks share the same implementation. Proxy selection matches `review.cjs` and is applied only to remote browser launch; launch errors suppress runtime/proxy arguments.

The newly executed qualification uses a single 64×48 synthetic rectangle fixture, real local DejaVu FontFace load, two 96-frame native streams, local HTTP and Chromium. It is explicitly tool evidence, not B25 artwork, font intent, geometry, performance or publication evidence. Negative checks cover invalid paths/layout sets/dimensions/controls/fonts, origin/redirect authorization isolation, unsupported/conflict/empty observations, premature/wrong decoded seek callbacks, missing PNG, modified raw bytes/CRC, changed conditions, and a mismatched native RGBA hash. Historical AVOID-006 helpers are referenced above; none of their old successes is relabeled as this run's result.

For a full 25-pair capture the decode-to-RGBA equality check covers 200 original key PNGs (50 videos × 4 keys), while all 4,800 native frames retain both original PNG SHA-256 and native Canvas RGBA SHA-256. This is not a claim that all 4,800 PNGs were separately inflated in Node.

## Prior isolated qualification receipt (actual-condition guard version)

Command: `JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-review-test.cjs`, run on 2026-10-22, Node v24.19.0. Log: `/tmp/avoid007-media-tools-actual-conditions-test.log`. Result: 7 tests passed, 0 failed, 17.719 seconds. Chromium needed the approved execution outside the socket-restricted sandbox; the first sandbox launch failed before capture. No browser package was downloaded.

Source SHA-256 for that prior run:

- `layouts-b-review.cjs`: `3a04cc456ff5f9b0eaba7b0a3711ad558950e61b956cc41e3c739ebda9b7f96b`
- `layouts-b-review-test.cjs`: `0288581c5a54c5cb0263822fe4b3cd24f6297f7f0c55d0e1c7b6a49504b446b1`
- Playwright package identity: `ca170ec143a88ed3043ac953eb3b2377b2b97304104f4e1e23316684ce2c35af`
- Actual synthetic FontFace file DejaVuSans.ttf: `57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e`

These inputs were logged before the synthetic browser launch and compared unchanged at the end. Synthetic manifest SHA-256 was `26a72e4a8ca035d3d927ba2272a915a92d741e803f8be9da67aa0d8d5d5af2d8`; the temporary bundle is deliberately removed after the test. This hash identifies a tool-test run, not a retained product review build.

Observed synthetic results: both H264s had 64×48 pixels, 96 frames, 24fps and 4 seconds. Each visible browser playback reported exactly 96 decoded frames, ended at currentTime=4, dropped=0 and corrupt=0. Both sides decoded post-seek frames at 1.5/.125/3.75 seconds. Native key PNG/RGBA matched frames 3/15/36/90 in forward and reverse order. 31 HTTP entries covered all raw assets plus both Range responses. JA/EN controls passed at 1100/390px, including actual play/pause, PNG toggle/overlay/zoom. The mobile live fixture opened both engine sides and rendered slider frame 90 at native dimensions. Real-browser authorization hook calls and origin/redirect unit negatives passed. CRC/hash/asset/condition/native-RGBA negative cases failed as intended.

Full 25-case B capture, product browser/performance suites, Sites authentication/publication, Pages product consistency and visual review remain pending parent approval and main-fixture completion. Safe-hold and external skip-frame schemas remain explicit unsupported boundaries until their real APIs and evidence are reviewed. The parent must review the code and these test results before using the tool for product evidence.

## Parent follow-up: actual planned conditions

The parent identified that sharing a spec object does not establish that the fixture actually planned that circle. `actualConditionGuard(initial,spec)` now runs immediately after fixture evaluation and again during file validation, for both before and after. It requires the actual plan W/H and composed duration, the single cut's layout and main text, and an enabled version-1 `lyricAvoidanceIndex` whose normalized region center/radius/start/end matches source conditions. The source main-text rule is exactly the shared fixture's `String(spec.text || '風の先へ').split('|')[0]`; whitespace is preserved and a note is not substituted. Without `spec.regions`, the expected region is the explicit spec cx/cy/radius over 0..4. Explicit region arrays are sorted by start like the source normalizer. Null ends resolve to the next start or final `plan.duration` and are bounded by duration, matching the existing resolver. Region IDs/provenance are not geometric condition fields.

`safeInitial` additionally requires a nonempty units array and a nonempty segment array for every unit, preventing vacuous safety acceptance for the representative's active circle. Added negative tests reject actual stage, duration, text, layout, enabled flag, center (.5 versus .42), radius and interval differences, plus empty units/segments. A multi-region explicit/null-end positive and an untrimmed pipe-separated text positive establish the normalization rules. The synthetic fixture now includes its actual duration, main text/layout and avoidance index; no product plan is represented as executed. The browser-integrated bundle test also modifies the actual recorded baseline cy, recomputes its raw asset hash, and confirms that file validation still rejects the condition mismatch. The final 7-test source/receipt above includes these additions.

## Circle outline display guide (current UI-only change)

One common, keyboard-operable checkbox controls the same circle outline over both comparison videos and all four before/after key-image pairs. It defaults OFF. JA/EN labels explain that the outline is a page guide only and is absent from original MP4/PNG files. It is not the deferred AVOID-018 mask. The live source fixture and every native acquisition/condition/safety/hash/proxy/auth gate remain unchanged. No old bridge or Pages audit file is changed.

Each media wrapper contains a pointer-events:none, aria-hidden SVG with the original stage viewBox, `preserveAspectRatio="xMidYMid meet"`, center `(W*cx,H*cy)` and radius `min(W,H)*radius`. The outline has no fill and a non-scaling stroke. Videos use object-fit:contain; the SVG uses the same contain mapping, including letterbox offsets. Images and SVG scale together through one image wrapper. Before/after key figures synchronize scroll positions when zoomed. Pair/toggle/50% overlay/mobile modes preserve that common mapping; no circle is stretched to an ellipse. Original PNG links still open the unmodified files.

The browser validator measures actual SVG screen transforms against the actual painted media rectangle, rather than assuming the outer element has the source aspect. It checks center and both radius axes within .5 CSS pixel and equality of the radius axes within .01 pixel, actual intrinsic media dimensions, pointer-events:none, default-OFF visibility and keyboard ON/OFF. Scenarios cover video plus eight key-image guides in pair/overlay/before/after modes, 200% zoom, synchronized scrolling and deliberately forced video letterboxing. Final local asset hashes are checked again after UI interaction to establish that controls left all original files unchanged. The native acquisition, raw hashes, decoded PNG/native RGBA, ffprobe and playback checks are retained.

Current qualification command: `JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-review-test.cjs`. Executed once on the completed guide implementation, using the authorized single 64×48 synthetic fixture and no product B25 capture or remote connection. Log: `/tmp/avoid007-guide-ui-test.log`. Result: **8 passed, 0 failed, 18.490 seconds**. This includes the previous seven tests plus a wide-output short-side-radius test (3200×1080 gives center x=1600 and radius=216, not 640).

Current startup/end byte identities:

- Tool: `0645653678918dbe3e26be65bcc57454fb52e6e8a02629a2348f08a2f75bb8f9`
- Test: `5fee8dc4ad1ad962e9eecf009b360ef28923efaea04f710abbb87c287c71daf0`
- Synthetic manifest: `6ace3c44149d5f5c6331121779ccc5f39a24cbf997c32cdfa74f2000958344a8`

All pinned inputs were unchanged at the end. Real browser guide measurements passed 72 placements in each of JA/EN × 1100/390px, 288 total, including the forced letterbox and zoom/display scenarios above. Both synthetic video playbacks still decoded exactly 96 frames to ended/currentTime=4 with dropped=0 and corrupt=0; 31 raw HTTP entries, native key forward/reverse parity and existing live/auth/negative cases passed. These are synthetic tool/UI results, not actual representative artwork or visual acceptance. The already submitted capture draft retains `buildID:null` and pending identity; its static receipt identifies the earlier tool version and must be rerun when the final integrated source is frozen.
