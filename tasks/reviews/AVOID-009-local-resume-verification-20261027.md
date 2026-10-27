# AVOID-009 local resume verification — 2026-10-27

## Scope / status

- Implementation owner: `gpt-6.1-sol`, medium; parent source/results review required.
- Start: branch `work`, HEAD `2ef46713ee260cf9d3d62260d8a1a4cf9ce78371`, clean tree.
- Existing AVOID-009 verification support only. Product source, registration, layout,
  existing tests and compiled HTML unchanged. No AVOID-010 / seventh candidate.
- **Pure checks locally passed; new native diagnosis blocked before browser startup.**
  This is not AVOID-009 completion, adapter qualification or human motion approval.
- Existing six candidates remain human-unapproved. Human review aggregation is
  2026-10-28 12:00 JST. Old-environment unsaved 188 items and additional 51 pure
  tests are absent locally and were not fetched or counted here.

## Executed existing checks

Run from repository root; literal stdout is in
`work/resume-20261027-local-verification/`.

| Command | Log | Checks | Result |
|---|---|---:|---|
| `node dev/avoidance/layouts-d-bulbs68-source-test.cjs` | `bulbs68.log` | 31 | PASS |
| `node dev/avoidance/layouts-d-bulbs69-source-test.cjs` | `bulbs69.log` | 24 | PASS |
| `node dev/avoidance/layouts-d-bulbs70-source-test.cjs` | `bulbs70.log` | 11 | PASS |
| `node dev/avoidance/layouts-d-bulbs71-source-test.cjs` | `bulbs71.log` | 8 | PASS |
| `python dev/avoidance/layouts-d-bulbs71-source-test.py` | `bulbs71-python.log` | 4 | PASS |

Total: **78 checks**, browser / encoder executions zero. Python71 uses its existing
private RAM capacity/handoff test; `ROOTWritten:false` means the actual project
ROOT is not written by that test, not that temporary simulated files never exist.
Node v24.22.1; Playwright 1.62.1; Python 3.12.14 (see runtime.json for Node/package).
Python70 not run: its old 466-runtime pin requirements are not satisfied by this
recovered environment; no pin or criterion was relaxed.

## New independent diagnostic (not yet run on Canvas)

`dev/avoidance/renderer-callback-throw-native-diagnostic.cjs` characterizes the
known exception path at `src/09_render.js:278–279/321`, without fixing it.
It reads the work HTML and asserts that the unchanged renderer source appears
exactly once byte-for-byte. Only an instance's `drawCut` callback is injected;
Canvas prototypes/methods are never replaced, and adapter69 is not exercised.
The throw is deliberate fault injection, not evidence of a naturally occurring
product exception.

Planned matrix: direct / opacity layer × callback-own-save absent / present ×
normal / throwing = eight rows. Native CTM, alpha, blend and clipped pixel counts
are observed. `getImageData` supplies numeric counts only; no PNG, image/video
encoding or image viewing occurs. Manual native `restore()` calls then observe
whether caller state and clip return. The number of manual operations is **not
an independently measured stack depth**. Callback-not-reached has a distinct
fixture error. Normal controls must pass before any reproduction claim.

### Startup failures retained, not rewritten as passes

1. Normal command:
   `JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/renderer-callback-throw-native-diagnostic.cjs work/resume-20261027-local-verification/native-throw-attempt01.json`
   - Exit 1, Chromium startup `socket() failed: Operation not permitted`.
   - No page or Canvas execution. JSON includes original error and source pins.
   - `attempt01-source.cjs` preserves the exact then-executed source (pin checked).
2. Same diagnostic with fresh target `native-throw-attempt02.json` and
   `require_escalated`: exit 1 before command dispatch,
   `bwrap: Can't create file at /home/agent/.codex/sessions: Read-only file system`.
   - No attempt02 JSON was generated; no browser/page/Canvas execution.
   - No denied-path reads, access workaround or further permission retry.

Subsequent local diagnostic refinements (literal-source assertion, recovery
wording, intermediate-state assertions, explicit fixture error) are syntax and
source reviewed only. `node --check` passes. Native outcomes remain **unverified**.

## Boundaries / handoff

- Parent reviews actual diff and literal existing-test logs; user is not asked to
  review code. Parent may judge pure verification support human-review-unneeded,
  but that does not approve the existing visual candidates.
- No commit/push, Sites save/publish, public URL access, saved-result readback,
  image/video fetch or visual review. No product exception-recovery fix.
- Stop native execution until a usable authorized local browser environment is
  available. Then run the current diagnostic to a fresh report path and review
  all eight rows, normal controls and source pins before accepting reproduction.
- Shared renderer recovery remains outside this local scope; nested callback
  saves and separate layer/outer contexts are why a generic 'add two restores'
  conclusion is not justified.

## Parent review — local work coordinator

The local work coordinator read the new diagnostic source and existing literal
logs, independently reran all five existing commands (78 checks, all PASS),
confirmed the diagnostic syntax check, and confirmed no diff under `src/`,
`index.html` or `en/`. Review requested and obtained: manual-recovery operation
counts are not stack-depth measurements; missing callback context is explicitly
classified as a fixture failure. The native diagnosis remains startup-blocked,
not accepted as a Canvas reproduction. Final root-parent review remains pending.
