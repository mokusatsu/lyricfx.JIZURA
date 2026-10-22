# AVOID-007 H03 hub fail-closed follow-up

Parent review of `1151d2f8fc1bf3721045c0707b5896a70071d6cd` found that explicit
falsy hub options were silently treated as missing. This isolated incremental
change makes legacy mode require `h03Supplement === undefined`. Unused manifest
inputs must also be exactly `undefined`. Other values reach validation and fail.
No source/product/native review tool, Pages audit, publication or auth change.

The new pure Node/fs test covers all three input fields separately with null,
false, 0, empty string and NaN; both HTML and writer APIs reject them before
creating output. Explicit undefined retains original legacy bytes. Existing
committed-source golden and all previous tests remain in place.

`node --check` on both CJS files, `git diff --check`, and
`node dev/avoidance/layouts-b-pages-bridge-test.cjs` pass. Raw final log:
`bridge-h03-offline-test02.log`: 14 passed, zero failed. Startup/end source pins
are asserted unchanged during that run:

- helper: `f276e579a638db00d61feead5d2d1e0c349ed2ab401888727e49acd900225ea1`
- test: `7851c05139fc4d3bc1c50660f209c87f0b8044fe3eeed616084e010288722b05`
- unchanged audit: `8e67722fc662bd3fa14aabd85a30e0cfae71887024dab4f20d9f6c2797738a01`

Scope remains synthetic/offline helper qualification. No real supplement media,
Sites URL, browser/performance, remote validation or publication was performed.
Implementation: gpt-6.1-sol / medium. Start HEAD was 1151d2f, clean worktree;
parent review/integration remains pending for this incremental commit.
