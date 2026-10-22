# AVOID-007 fail-closed playback marker follow-up

Parent review of627e795 found a possible false success: an exception snapshot with
failure plus otherwise ended/full/zero-drop counters could pass numeric gates.
This isolated incremental correction adds `failure === undefined` immediately
after raw snapshot save/progress and before all existing quality assertions.
The private runner rejects any defined raw playback failure marker before its
main/H03 completion contracts. Known failure marker whitelist projection remains;
unknown/free-text markers are rejected without being serialized.

No generating function, playback helper/window, phase lifecycle, existing seek/
zeroDrop/92/4s threshold, auth/proxy/secret handling or main live2 contract changed.
The core review tool differs from627e795 by exactly that single assertion line;
`browser-phase-generation-proof02.json` verifies this byte equality after removal,
plus the same original-baseline generation/seek prefix and35 unchanged exports.
Earlier proof01 and the original synthetic browser log remain historical bytes.

Minimal negative tests extract the ACTUAL validateBrowser acceptance block from
its function source. For timeout/media-error/play-rejected, a snapshot with
ended=true, decoded96, currentTime4, dropped0, corrupt0 is saved and progress is
called, then the failure assertion rejects it. The same valid counters with no
marker pass. The fake private-validator suite rejects those full-counter markers,
including an unknown secret-bearing marker (discarded from projection), and a
prospective H03 media-error marker; known markers remain in failure evidence.
This is synthetic interface qualification, not H03/browser/media success.

Commands: node syntax checks on changed CJS files; lifecycle mock suite9 passed;
private fake-validator suite6 passed; git diff check passed. Raw final logs:
`browser-phase-marker-mocks01.log`, `browser-phase-marker-private01.log`.
No browser, encode, actual sample/full50/full04/network/credential/publication run.
The parent explicitly deemed the previous synthetic browser run unnecessary to
repeat for this failure-only assertion change.

Final source pins, asserted unchanged during tests:

- review `6e829d8a4361480bc9f62f87f2886715ae1f6c6c0534e41cff0f1babcee6db03`
- private runner `2ae013f30050449db9e1ca72bf462af42f735a9d54d665c7f791ad7c4e3318f8`
- private test `edbbe16e0fa94f76da479006e4ce5c2389a7cc3b0b1e03855a6649a4c1b93e90`
- lifecycle test `c02d50515655ffb2212721689e329317ad3bb15755fe3d6e4884f2d5bbae95cb`

Start HEAD627e795 clean; gpt-6.1-sol / medium. Shared root remains read-only and
parent review/integration remains pending for this follow-up.
