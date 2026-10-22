# H03 native review helper: isolated implementation and offline qualification

Status: implementation prepared for parent code review. Only small pure Node
synthetic contracts have run. No H03 acquisition, font loading, ffmpeg/ffprobe,
Canvas rendering, browser, HTTP/network, private credential or publication ran.
No new-main identity, real focused safety outcome, actual media subset, public
URL, browser parity or playback success is asserted by this receipt.

Owner: gpt-6.1-sol / medium, isolated `/workspace/avoid007-media-tools`.
Shared product, H03 fixture/test, main review helper, private runner and bridge
remain unchanged. Existing helper qualification is historical; the attached
12-test log is qualification of this new adapter's synthetic contracts only.

## Interface and frozen conditions

`capture(config, freshDirectory)` accepts canonical real `mainBundleDir`, `root`,
`focusedReceiptPath`, an explicit `approvedCaseIDs` subset (empty is diagnostic
only), and `media: [{layer:'media',path,sha256},{layer:'foreground',path,sha256}]`.
`buildID` must be new. `fixturePath` defaults to the current root H03 fixture;
`fontManifest` defaults to main-relative `evidence/b-fonts-manifest.json`.
Inputs are local, never Site URLs. An actual future config must use actual
approved paths/hashes; there is no ready-to-capture placeholder config here.

The formal conditions are eight original native chunk/recap cuts, retained0..7,
end/displayEnd7.5, original params and source-occurrence ranges; three text lines
風の先へ / 光を越えて / 夢の続き, seed704, 3200x1080, circle(.5,.42,.2).
The three outcomes are rain/panL, bubbles/push and credits/dutch. All remain in
manifest even if only an approved safe subset gets media. The clip is absolute
[3,7), 96 frames/24fps/4s; key frame indices3/15/36/90 are clip-relative.
No three-cut reduction, lifetime extension, params re-layout, media translation
or re-timing is applied by this adapter. The fixture is external owned input.

Before raw compiled HTML must equal exact e96cbb2 bytes (a3c4d0e3…24ba7).
After raw JA/EN and every current root src JS must match the provided immutable
new main bundle. No old01 after engine or new source identity is hardcoded.
Main raw manifest, all source/font/fixture assets, focused receipt, two reused
input MP4s, original font descriptor/roles and tool/runtime bytes are raw pinned.
The focused receipt must be complete (`endInputsUnchanged`, no warnings) and its
existing `startup.pins` must include the same main/fixture/helper/media hashes.
Missing focused proof rejects; a status string alone never grants capture.

## Fixture adapter boundary

`runLayoutsBH03(J,{layout,camera,fonts,mediaURLs,newPath})` is called once per
page. `frame(absoluteTime)` is called once per requested frame; then that same
native Canvas is exported to PNG. Plans are observed, not repaired. Native
clocks/params/effects/media and retained indices are checked before/after frames.
Both decoded inputs must retain their original target clock and prove seeked+
rVFC decode, loaded dimensions, and no native-prepare re-seek. Layers and cuts
must stay equal across before/after. Repeat forward/reverse seeks must reproduce
native RGBA and show changing background/foreground layers.

The main owner has added actual draw-call `role`/`owner` evidence
(measurement recorder calls excluded); this was inspected read-only, not run. This adapter
requires explicit `primary` source span/offset text or matching native metadata
id/text/font. The only source-free auxiliary exception is explicit
`tiledAux`/`rain.background-grid` in a rain cut. Missing roles fail closed;
old fixture output is not inferred safe. This boundary awaits final fixture
bytes and the actual focused receipt. No formal fixture qualification is claimed.

## Native pipeline and validation

Acquired frames use the existing qualified main `encodeFrames` helper: original
Canvas PNG directly to ffmpeg stdin, H264 threads1, original 3200x1080. Four key
PNGs per video receive PNG-decoded RGBA parity; all96 source frames retain PNG
SHA/RGBA SHA/size records. Lossy codec quality is separate. Output MP4 probes
and codec-quality checks reuse the main helpers. No screen recording, PNG slide
capture or pre-existing video transcode creates comparison MP4s.

Fresh-directory closure includes JA/EN comparison HTML, controls, optional circle
page guides, all three outcome labels, actual seek fixture UI, indexed evidence,
source/engine/fixtures/fonts, reused inputs and newly captured media. Native
pixels never contain the DOM guide. Raw manifest self-hash remains external.
`validateFiles` verifies closure, all raw hashes, strict bridge-compatible
identity, font roles, startup/end evidence, native records, probes and HTML.
It invokes ffprobe/ffmpeg through qualified helpers, and has NOT been run on any
actual H03 bundle in this qualification.

`validateBrowser(dir,{baseURL,authorize,onProgress})` has owned fresh phases:
raw HTTP+JA/EN desktop/mobile controls -> close; all acquired video decoded seeks
and full playback with a fresh page per video -> close; every native key forward/
reverse and each acquired case/side mobile actual seek fixture -> close.
It reuses main proxy/CA/TLS launch, exact-origin/redirect isolation and authorized
page routing for raw/UI/MP4/native/live. All raw bytes/length/status/types and all
MP4 ranges are checked. Quality stays >=92 decoded frames, ended at4s, drop0,
corrupt0, decoded start at0, plus mandatory absence of failure marker. Progress
saves playback snapshots before assertions; incomplete/zero-media never returns
success. H03-specific completion is owned by this tool; the private runner's
supplemental contract trusts only its final exact main-compatible success status
and projects whitelisted fields. No arbitrary raw tool output is a secret-safe
report; use the approved private runner for credentials.

## Portability and dependencies

Captured `tools/layouts-b-h03-review.cjs`, sibling main/bridge helpers and
`browser.cjs` preserve their relative require tree. Root `package.json` and lock
are raw copies of the source dev package; exact external Playwright package
metadata is separately pinned. A temp-directory Node test imports the captured
three helper modules outside the repository, without launching a browser.
This proves relative helper import closure only. The source dev lock does not
include Playwright; the existing qualified external runtime/validator remains
the formal execution path. A standalone environment must separately provision
the pinned Playwright version, its matching browser, ffmpeg/ffprobe, and any
original locked dev dependencies. No dependency install or complete offline
runtime qualification is claimed. Captured tool bytes alone are not such proof.

## Offline test and handoff

Run `node dev/avoidance/layouts-b-h03-review-test.cjs` for pure Node contracts.
The attached `h03-review-offline01.json` pins startup/end tool/test/main-helper/
bridge bytes and records the actual log hash. Twelve tests cover exact native
identities/clocks/params, decoded proof/no-reseek/mapping, all focused outcomes,
main/EN/fonts/window linkage, zero-media diagnostic scope, reverse/stale layers,
the unchanged runtime function in a VM, failure markers and incomplete evidence,
JA/EN HTML, copied relative import closure, acquired-side completion, explicit
primary/aux roles, and focused raw input provenance. Negative cases mutate those
conditions rather than asserting fabricated MP4/browser success.

Next gates belong to parent: code/test review; final main bundle/focused receipt/
fixture bytes and approved safe subset; authorized capture and actual file,
browser and private public validation. Formal CPU work was left undisturbed.
