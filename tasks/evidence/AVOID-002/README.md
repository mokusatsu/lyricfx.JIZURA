# AVOID-002 local evidence

Implementation agent: gpt-6.1-sol / medium; parent performs code/test review and
completion decision. No production `src/`, `index.html` or `en/index.html` changes.
Historical AVOID-001 evidence was not overwritten.

- `baseline-results.json` and six logs: 6 scripts passed, browser tests Japanese
  and English, scene test 1296 cases per language. Existing assertions unchanged.
- `baseline-sandbox-blocked.json`: first sandbox attempt (5 browser launch
  failures from setsockopt, unit test passed). Successful baseline reran through
  the supported execution context; no network policy was bypassed.
- `saved-project-results.json` / `project_file_test.cjs.log`: HTTP8765 and local TTF
  prerequisites supplied, then existing assertion at line14 failed: newly created
  project has one lyric cut, old expected zero. This is a preexisting behavior/test
  mismatch, not successful save coverage; actual portable-save assertions remain
  unexecuted. AVOID-013 owns resolution. No expected value was weakened.
- `inventory.json`: 184 unique registrations/owners, source hashes and historical
  render hashes checked against current code/runtime. Owner counts 005:16,
  006:26, 007:25, 008:34, 009:34, 010:42, 011:7. Thirteen named repetitive units
  exempted; unresolved semantic unit/FX verification remains with each owner.
- `fx-perf.json`: eight Canvas feasibility checks and old-planner baseline.
  Regions evaluated=0; this is not new resolver/trajectory performance coverage.
- `capture-06.log` and final bundle: 22 cases, 44 UI captures + 44 original stage
  PNGs. Same-size old/new UI screenshots retain absence explicitly; original
  current renderer PNGs must be byte-identical. Unimplemented circle specification
  is a separate dashed diagram. No invented future trajectory is shown.
- `review-validation.log`: local asset/image/hash/conditions/link, desktop/mobile,
  pair/toggle/overlay/original modes and live sample startup checks.
- `negative-validation.log`: positive clone passes, seven deliberate corruptions
  reject for expected reason (including broken link after updating HTML hash).

Final bundle: `review/AVOID-002/local-20261018-06/index.html`.
Unpublished drafts 01–05 are moved to `/workspace/work/avoidance-002` and are not
publication candidates. Logs retain their provisional status; they are not final
validation evidence.

See [commands and schema](../../../dev/avoidance/README.md). Pages checks require
allowed external networking and are pending parent execution. A local pass is not
a public deployment pass. Parent-review evidence belongs to `parent-review.md`.

Parent final transport review: `parent-proxy-options.json` (13 checks),
`parent-url-mode-final.log` (22 cases/88 images),
`negative-validation-final.log` (positive control + 7 expected rejections).
`publication.json` records the pushed artifact commit and successful Pages run.
`public-validation.log` is the historical direct-DNS failure; the corrected
`public-validation-proxy.log` and `public-site-smoke.log` both show proxy tunnel
failure. Public page identity/rendering remains unverified. Parent's completion
and human-review decision are in `parent-review.md` and the task review record.

Scheduled resume check (2026-10-18 23:12 JST):
`scheduled-recheck-environment.json`, `scheduled-recheck-time.json`, and
`scheduled-recheck-https.log` record active revision 20 with the Pages host absent
and a proxy HTTP 403. Public validator/smoke were not rerun after that failed
prerequisite; no dependent implementation was started.

## 2026-10-19 再開・公開成功

[再開検証の要約](resumed-verification.json)、[実行中環境](resumed-environment.json)、[通常HTTPS](resumed-https.log)、[全画像/manifest/HTMLの公開validator](resumed-public-validation.log)、[日英本体smoke](resumed-public-site-smoke.log)、[親の公開操作](resumed-parent-ui.json)。既存の失敗ログは履歴として保持する。
