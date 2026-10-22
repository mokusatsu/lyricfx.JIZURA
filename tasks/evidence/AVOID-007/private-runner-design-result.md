# AVOID-007 private Sites public-validation runner

Status: synthetic/offline qualified; parent code/result review pending. No real
credential, request, browser, capture, publication or auth/audience change.
Implementation: gpt-6.1-sol / medium, isolated worktree. Start HEAD
`d61c0b9d394985e85e54ec18fedbe9263249e3cf`, clean. Parent approved the short design
before code. Only new runner, offline test and this evidence were added; shared
product, primary review tool, bridge, existing audit and source remain unchanged.
Search found no reusable stdin credential runner. Actual browser/proxy/CA/TLS
handling remains in the existing validator and its isolate/publicBrowserOptions.

## Invocation and credential boundary

```
node dev/avoidance/layouts-b-public-test.cjs \
  --validator /absolute/path/to/current/dev/avoidance/layouts-b-review.cjs \
  --bundle /absolute/path/to/immutable-bundle \
  --base-url https://ACTUAL-CANONICAL-HOST/review/AVOID-007/ACTUAL-BUILD/ \
  --report /absolute/fresh-parent/new-report.json
```

The command above is a template, not a real URL or executed publication. Supply
one JSON line containing only `token` through stdin from a memory-only outer
launcher. Do not put the token in shell text, argv, environment, URLs or files.
Terminal echo control is the outer PTY owner's responsibility. Credential input
is bounded to 64KiB and one JSON line (immediate trailing nonempty lines reject);
parsed token accepts the RFC bearer alphabet, minimum 16 characters. It stays in
memory. The callback is revoked on exit by clearing its captured token reference.

CLI recognizes exactly the four flag/value pairs; duplicates/unknown/missing
flags fail with fixed output, never stack/errors. HTTPS baseURL must be canonical,
end in `/`, and contain no credentials, query, fragment or encoded/traversal path.
No real URL has been substituted into this synthetic qualification.

`authorize({origin,url})` returns the OAI Sites bearer header only when both origin
and parsed URL origin exactly match the configured origin. Credentialed URLs and
an explicit redirectedFrom reject. The approved validator's existing isolate
rejects redirected requests before invoking the callback and blocks foreign
origins. This runner does not replace routing, browser launch or proxy settings,
set TLS options, or install a custom browser. It calls only
`validateBrowser(bundle,{baseURL,authorize,onProgress})`.

## Pins, artifacts and diagnostics

Before credential read/browser launch, stream SHA256 of runner, selected validator,
manifest and every manifest-indexed asset; compare asset digests to manifest.
Canonical paths, regular files and symlink rejection apply. Recheck all pins
immediately after requiring the validator and at the end, including exceptions.
Any changed/missing input forces `failure/input-mutated`. No metadata-only shortcut.
Validator dependencies outside these files are not independently pinned here;
portable bundle runtime/source/tool assets are included through manifest assets.

The report parent must already exist, with no symlink; outputs must be outside
the immutable bundle. Reserve three fresh 0600 files with exclusive creation:
`report`, `report.partial.json`, `report.log`. The partial is updated throughout;
the final is written even for caught credential/preflight/validator failures.
Interrupted processes can leave an incomplete partial/empty reserved final and
must never be treated as successful. Existing files are not overwritten.
Final stdout contains only controlled status and final report SHA256. Failure
exceptions use fixed reason codes; exception messages/stacks are never persisted.

Validator/dependency stdout/stderr are discarded during require, validation and
final input-integrity/report writes, then restored even if output closing fails.
No raw diagnostics are copied to logs. The runner projects explicit safe fields
instead of serializing a validator result, headers, errors or unknown objects:

- known asset paths, HTTP status/length, expected matching raw SHA256, fixed MIME
  allowlist, numeric Range status/bytes and constrained content-range;
- known manifest case IDs/sides, allowed stages, JA/EN page identifiers, numbers;
- seekedAt and decodedAfterSeek mediaTime/presentedFrames/ignored-frame numbers;
- ended/currentTime/decoded/dropped/corrupt and numeric start/end quality;
- UI counts/booleans, guide measurement count, native frame numbers, live canvas.

Unknown strings/fields/headers/failure.message are discarded. Runtime versions
currently record Node/platform/arch; source and runtime bundle identities are
hash-pinned. Progress log contains only controlled status/stage/counts. Report
schema is `avoid007-private-public-validation-v1`. Programmatic run is for this
isolated sequential test; CLI process use is intended because stdio suppression
is process-wide. Arbitrary validators are trusted code, not sandboxed plugins.

## Completion contract and actual validator shape

Main `avoid007-native-v1` requires the exact current success status, 25 unique
cases; each manifest/asset has exactly one matching 200 raw length/hash, expected
HTML/PNG/MP4 MIME, each MP4 has matching 206 0..31 Range bytes; four JA/EN desktop/
mobile UI rows; all 50 case/side playback and nativeParity rows; decoded seeks
at 1.5/.125/3.75 within 1/24s; ended at4s, >=92 decoded, zero drop/corrupt;
expected native key/reverse frame arrays. Live matches the real tool's
`m.cases[0]` only, after/before: TWO rows at frame90, width390, actual stage size.
Parent caught an initial incorrect all25 live expectation before submission; it
was corrected and fake fixtures now follow the actual two-row shape/order.
No requirement was added to inspect all25 through the live UI.

H03 `avoid007-h03-native-v1` uses the same exact success status by direct schema/API
agreement with its owner. Its explicit report completionContract says
`parent-qualified-supplemental-tool-success-status`; independent main-25 gates
are not imposed on supplemental outcomes/media subsets. Existing known numeric
fields are projected if present; unknown H03 fields are discarded. H03 is still
unimplemented/unqualified at this point; this agreement does not claim its success.
Actual source/group/media/native H03 qualification remains its tool/parent's job.

## Offline evidence

`node --check` on both new CJS files, `git diff --check`, and
`node dev/avoidance/layouts-b-public-offline-test.cjs`: six passed, zero failed.
The fake validators exercise exact-origin/URL/redirect rejection; proxy inheritance;
secret-bearing immediate/late console/error/progress/unknown objects; successful raw/seek evidence;
fresh files/modes; failure partial/final; runner/validator/asset mutations;
false success, missing playback/live, wrong decoded seek; malformed/extra/multiline
input, stale hash, exact H03 success status. Fake media are strings, not real MP4.

Node child stdin pipes did not deliver input in this sandbox, so these Node tests
use memory Readable input and copied-runner API. Separately a Python outer
subprocess launcher executed the actual CLI with a one-line synthetic credential
through stdin for both success/failure. It checked exit0/1, report/partial/log and
stdout/stderr for no sentinel/header/Bearer value, and verified final report SHA256.
It generated fake-validator fixtures from the offline test's setup function;
no token was written to any fixture/file. The initially temporary CLI harness is
now tracked at `dev/avoidance/layouts-b-public-cli-offline-test.py`; it generates a
fresh sentinel in runtime memory. Reproduce the two CLI checks with:

```
python3 dev/avoidance/layouts-b-public-cli-offline-test.py --report /existing-parent/fresh-receipt.json
```

The harness extracts the Node test's setup-definition prefix at its explicit
`test('canonical CLI` marker and calls `setup(root, mode)`; it depends on that
fixture interface and fails closed if the marker changes. Node and Python are
required; Git, old objects, connector credentials and browsers are not. See
`private-runner-cli-portability-result.md` and the new standalone receipt for the
tracked-script execution. The six Node tests were not rerun on unchanged bytes.

Raw final log: `private-runner-offline-test01.log`, six test results plus the two
actual-CLI qualification receipts. Source startup/end pins are asserted unchanged:

- runner: `3f6c983fd05669d48302a9cd420da1dc62335f55d8cf9ca90b4163d94723e53a`
- offline test: `07211cdcbac517d5e4406ef36551847d23d0a8639244d41c05bb802d36aee13f`
- unchanged audit: `8e67722fc662bd3fa14aabd85a30e0cfae71887024dab4f20d9f6c2797738a01`
- raw log: `16934d43be772ee9748ab10ff00782fd2c3687ef8d31d8bcbb6cf3a3344e20e9`

No actual private Sites success is asserted. Parent must review this runner and
the selected validator, then provide actual immutable paths/URL and memory-only
credential for a separately authorized real public validation run.
