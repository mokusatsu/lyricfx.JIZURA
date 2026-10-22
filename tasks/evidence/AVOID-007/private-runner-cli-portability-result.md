# AVOID-007 tracked private CLI qualification

Parent reviewed the runner and requested that the temporary Python CLI harness
be made reproducible from tracked files. Start HEAD
`96d6f1dabd6acc7d1ab0479c94baca3a44137853`, clean isolated worktree.
Implementation: gpt-6.1-sol / medium. Only new harness/docs/receipt change;
runner, Node tests, audit, primary review tool and shared tree remain untouched.

New `dev/avoidance/layouts-b-public-cli-offline-test.py` uses a fresh runtime
`secrets.token_urlsafe` synthetic sentinel, held only in Python memory and sent
as JSON1line stdin. It does not use real credentials or put its sentinel into
argv/env/fixtures. It launches only the existing synthetic fake validator setup,
with the reserved example.test URL; no network/browser/connector operation.
Child/error text is never printed; failures use a fixed sanitized message.
Receipt output is a fresh exclusive 0600 file; no existing file is overwritten.

It depends on the tracked Node test's prefix marker `test('canonical CLI` and its
`setup(root, mode)` fixture interface. It verifies one exact marker, compiles only
that definition prefix and calls setup. Node/Python must be installed; no Git
object, temporary external harness or `.git` metadata is needed. Dependency/source
hashes (including harness itself) are recorded and rechecked at the end.

Executed:

```
python3 dev/avoidance/layouts-b-public-cli-offline-test.py --report tasks/evidence/AVOID-007/private-runner-cli-offline-receipt01.json
```

Both actual-CLI synthetic cases passed: success exit0, failure exit1, stdin JSON
one line, no credential/header/Bearer in stdout/stderr/final/partial/log, and final
report SHA256 independently recomputed. Receipt:
`private-runner-cli-offline-receipt01.json`, SHA256
`d7f8bad5cd42318d213ccd63ff4a60114799b1b44868fc96dc4682429c9fe745`.
Harness SHA256
`98c555be84f2826b0f906d5bd4b59c1f46b03656bee0171972a8ab7b41947437`.
Python AST parse and `git diff --check` pass. The existing six Node tests were not
rerun, as requested; their source bytes and evidence remain unchanged:

- runner `3f6c983fd05669d48302a9cd420da1dc62335f55d8cf9ca90b4163d94723e53a`
- Node test `07211cdcbac517d5e4406ef36551847d23d0a8639244d41c05bb802d36aee13f`
- audit `8e67722fc662bd3fa14aabd85a30e0cfae71887024dab4f20d9f6c2797738a01`

This qualifies the local runner interface only, not actual private Sites or H03
success. Parent review/integration remains pending for this incremental commit.
