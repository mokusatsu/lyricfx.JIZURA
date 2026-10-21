# Parent review: 26 representative native MP4 pairs

User scope: 26 representative layouts, not all 174 conditions. Implementation and fixes were delegated to gpt-6.1-sol / medium. The parent reviewed code and textual test evidence; image inspection is delegated to two isolated gpt-6.1-sol / medium reviewers, with no parent image viewing.

## Code and capture

- Reviewed `all-review.cjs` capture scheduling, source pinning, independent geometry assertions, native PNG stream/encoder, evidence and public projections, bounded paths/hashes, cancellation, controls and public byte verification. Final capture tool SHA-256: `84c3efa930cdaac70945a18b5e1139389a83dbe34d2cff112a648e47eb8cb7c6`.
- Parent independently reran all four focused unit tests (`parent-unit-tests.log`). Reviewed six corruption checks and HTTP206/full-body-hash negative cases. No acceptance weakening or product source change was needed.
- Formal capture `local-20261021-03`: 26 original old04 safeAnchor conditions; 52 MP4s, 4 seconds, 24 fps, 96 actual Canvas frames each (4,992 total). Original dimensions, no UI capture, old-WebM transcode, scaling or guide overlay. Before06b8745 and after88f270d are separately pinned; the focused film02 baseline differs.
- Parent independently compared all 96 native PNG hashes for each of the accepted18 before/after controls: all1,728 comparisons equal (`parent-accepted-controls.json`). This is byte evidence, not a claim of image inspection or renewed human acceptance.
- Public directory has exactly55 files, 7,143,943 bytes; its manifest SHA-256 is `ceab32d46c763775c407add084c04b610f0d41fef05b1fe63800f18558e6b474`. Source snapshots and native observation/PNG evidence remain under work; compact hashes and capture manifest are retained in this evidence directory.

## Publication preparation

- Exact public directory copied to fresh `review/AVOID-006/local-20261021-03/`. No existing public bundle changed.
- Official pinned Jekyll image build and actual-output audit passed: 2,911 URLs, all2,856 legacy URLs retained, nine manifests, 990,511,556 total bytes. Full source/output hashes and inventory are in `pages/`. The build began while snapshot completion was being observed; the subsequent complete projection/source/output audit verifies every final URL and byte, so no incomplete snapshot is accepted.
- Product JA/EN and docs/VERIFICATION remain unchanged. Existing unrelated Python bytecode and untracked work/prototypes are excluded from staging.
- Managed network observations current at revision157, matching desired/observed; unrestricted/enforced. Ordinary inherited-proxy HTTPS to the application returned200, TLS verification0, and JA hash `d780ca129dfe87868a8a448a90c02a2e6ba4f2398a4a7f522a91973bad62eda0`, equal to checkout. This preliminary connectivity check does not establish publication of the new bundle.
- Sites was registered but not published because official source helpers are absent. This26-case output fits Pages, so Sites publication is unnecessary.

## Pending gates

Isolated visual review subsequently completed: both reports and ledgers cover exactly13 disjoint layouts each, total26. Together they inspected52 original native anchors and312 six-time MP4 frame extracts in comparison montages; filmstrip additionally received12 original-size extracted-frame inspections. No new visible clipping, missing glyphs, lost composition or HTML UI contamination was identified in those samples. Continuous viewing and every-frame visual inspection are explicitly not claimed. Film horizontal window proportion and sequential reveal/motion were observed; the portrait film sample belongs to earlier focused02, not this26-case set. Ticker's lower repeated strip remains the already-classified tiledAux deferred to018; the parent checked the existing inventory rather than introducing an exemption to pass the review.

Formal local all52 playback/seek/anchor verification, commit/push, deployment and actual public all55-byte/all52-playback checks remain pending at this review checkpoint. Success will be recorded separately from this checkpoint. File-URL playback is blocked by managed Chromium policy and remains unverified; desktop/mobile HTTP is the supported verified path.

Old18 acceptance remains valid. New8 behavior acceptance remains unanswered; no new human approval is inferred, AVOID-007+ remains unstarted, default activation017 and auxiliary mask018 remain future work. The known save-test initial-cut mismatch remains deferred013 and is not a successful save test.

## First formal local validation failure

The first local run passed52 independent anchor rerenders and42 full-video tests, then failed the decoded seek-frame time assertion for ruler-before. Publication remains blocked. The original helper can combine a queued pre-seek frame callback with a later seeked event; this is a code-level race, but the failed frame metadata was not retained, so its exact original cause is not claimed as proven. A separate30-run real-browser investigation on the unchanged ruler MP4 did not reproduce the failure and ffprobe found all96 correct24fps timestamps. The implementer is correcting only validation callback handling and retaining the last attempted result before assertions. Target-time tolerance, timeout and all media/source/capture bytes must remain unchanged; a new complete run is required.

The parent reviewed the complete diff against the frozen capture-tool snapshot: only the new validator-specific seek helper, its call, last-attempt checkpoint and test export changed. SHA-256 `44181a677ca645ab09fdb3e831bf848774f6a71277b22c6f745b401cd25a1dab`. The helper retains the0.1s decoded-frame tolerance and10s deadline, ignores and records queued unrelated frames, and cleans up on success/error/timeout/setup exception. It cannot schedule more callbacks after settlement. Parent independently reran12 tests in the supported execution environment (`parent-seek-fix-tests-supported.log`): all passed, including deterministic old-helper race reproduction and corrected event order/timeout/error cases. The initial sandbox invocation only reported two file wrappers; only the supported12-case result establishes the detailed test count. Full retry is authorized after the targeted browser check; capture and public assets remain frozen.

## Local retry and publication approval

The parent independently inspected `validations/local-1792560732144-2501279b.json`: passed, all52 exact native anchors and52 complete native playback/pause/decoded-seek checks; all ended, duration4s, minimum92 reported decoded frames and zero corrupt frames. Observed dropped frames total89, maximum21 in one92-frame interval; these remain explicit measurements, not a zero-drop or universally smooth playback claim. All tests retain their original bounds. Desktop/390px pair start differences0.013385/0.003043s, pause/restart/filter behavior passed; initial JA/EN load is HTML only. Four targeted portrait seeks also passed after the validator-only fix. The parent approves the reviewed immutable bundle for authorized work commit/push and Pages publication. Actual remote hashes, native playback and app startup remain mandatory after deployment.
