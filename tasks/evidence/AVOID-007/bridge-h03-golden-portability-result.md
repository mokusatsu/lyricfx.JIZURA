# AVOID-007 portable committed-source golden

Parent found the golden test's `git show fa05519` dependency unavailable in a
fresh work clone. Starting from clean `f429568e11b8c8860cd90e5e388ce1590a80af0d`,
this isolated follow-up replaces that subprocess with a tracked, original-source
fixture. Helper functionality and the audit/native review tools do not change.

Fixture: `dev/avoidance/fixtures/layouts-b-pages-bridge-fa05519.cjs`, 15,460 bytes.
It was extracted once from commit
`fa05519ba574513ed803c2232661ecb39d8ab867`, path
`dev/avoidance/layouts-b-pages-bridge.cjs`, Git blob
`30b138cff4383ae977fff1d5d4bc9262b805ab91`. `cmp` against the previously extracted
original returned equal. Its raw SHA256 is
`d68a58e7b0ba5673a4843a40caaed947d31fb6ca186bd8e4d5535153c2049694`.
The test asserts that literal hash before Module._compile and includes the fixture
in its startup/end byte pins. The same four-file, hub HTML and page HTML byte
comparisons remain. Test execution no longer invokes Git or needs the old object.

Qualification copied only helper, test, audit and fixture into a fresh temporary
source directory outside any worktree; no `.git` directory or objects were
copied. PATH contained only symlinks to the current Node and Python executables.
A `git --version` subprocess lookup was explicitly required to raise
FileNotFoundError/ENOENT before running the entire suite. Absolute Node then ran
`dev/avoidance/layouts-b-pages-bridge-test.cjs` from that copied snapshot, with that
restricted PATH. All 14 tests passed, including committed-source golden, both
unchanged audit checks, the child CLI process and source-end pins. Raw output:
`bridge-h03-offline-test03.log`. `node --check` and `git diff --check` also passed.
No separate regular-PATH test run was necessary; this full-suite run is stricter.

Source pins (same at startup/end in that execution):

- unchanged helper: `f276e579a638db00d61feead5d2d1e0c349ed2ab401888727e49acd900225ea1`
- test: `e9de759b5786306b0f1a521eed16df9fdd0e82fec443f9ddb8a63a10727f5051`
- unchanged audit: `8e67722fc662bd3fa14aabd85a30e0cfae71887024dab4f20d9f6c2797738a01`
- golden fixture: `d68a58e7b0ba5673a4843a40caaed947d31fb6ca186bd8e4d5535153c2049694`
- raw log: `3db0a1e835fb1e808d0e33574cb82b91edf81c04a7856253d73749bc4e44300b`

Scope: synthetic/offline helper qualification only. No shared-tree modification,
network/auth operation, actual H03 capture, browser/performance run or publication.
Implementation: gpt-6.1-sol / medium; parent review/integration pending.
