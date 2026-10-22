# AVOID-007 optional H03 bridge/hub implementation

Status: local synthetic/offline qualification; parent review pending. No real H03
capture, generation, remote verification, publication or audience change.
Implementation: gpt-6.1-sol / medium, isolated `/workspace/avoid007-media-tools`.
Start HEAD: `e30fe817edf2543d772c08e337eac6f41189ba40`; clean start.
Parent approved that design before implementation. The design's earlier isolated
`tasks/evidence/007/` location is historical; this result uses the canonical
`tasks/evidence/AVOID-007/` location requested by the parent.

## Changed interface

Only the bridge helper and its test changed. Existing main/native tool, product,
fixture, config, 25-pair output, Pages audit and shared tree remain untouched.

Optional `config.h03Supplement` contains the same five remote-reference fields
as `sites` plus `caseIDs`. Fields are `comparisonURL`, `englishComparisonURL`,
`manifestURL`, `manifestSHA256`, `audience:'owner-private'`, `caseIDs`. Real URLs
must be supplied later; `example.test` appears only in synthetic tests. Canonical
HTTPS validation rejects credentials, queries, fragments, encoded/traversal paths,
whitespace. English and manifest URLs
are fixed siblings. The supplement must differ from the main manifest reference.
No network or redirect following exists in this helper.

`generate(config, freshDir, {nativeManifestBytes, h03ManifestBytes})` verifies both
raw manifests before writing when a supplement is configured. `validate(dir,
{expectedConfig, nativeManifestBytes, h03ManifestBytes})` rechecks external linkage
when supplied. Supplemented validation with only one raw manifest fails. Local
`validate(dir)` still checks closure/hash/deterministic output and reports
`externalReferenceChecked:false`; it does not claim remote or external checks.
Unconfigured supplemental bytes are rejected. Existing no-supplement APIs remain.

CLI adds only optional final positional bytes paths:

```
node dev/avoidance/layouts-b-pages-bridge.cjs generate config.json fresh-dir main-manifest.json [h03-manifest.json]
node dev/avoidance/layouts-b-pages-bridge.cjs validate dir [main-manifest.json [h03-manifest.json]]
```

`sitesHubHTML(mainRelativeBundle, options)` and
`generateSitesHub(mainRelativeBundle, freshDistRoot, options)` accept optional:

```
{
  h03Supplement: {relativeBundle, caseIDs},
  nativeManifestBytes,
  h03ManifestBytes
}
```

Both paths must be distinct `review/AVOID-007/<buildID>` directories matching the
actual manifest buildIDs. The string helper verifies metadata only. The writer
also requires both existing deep JA/EN HTML files and exact raw manifest files;
HTML hashes must match each manifest's `assets`. It writes only a fresh root
index, never overwrites a root or deep file, and rejects symlinks. Supplemented
hub use is programmatic; legacy `hub` CLI remains the original two arguments.

## Final schema agreement with main implementation owner

Directly confirmed during this implementation; this is a schema agreement, not
an assertion that focused results or media have been acquired:

- `avoid007-h03-native-v1`, `taskID:'AVOID-007'`, distinct `buildID`, exact e96
  `baseline`, `mainBundle.manifestSHA256` over original main bytes.
- `sources.before/after:{html,sha256}` with canonical original source paths;
  `sources.products:{jaSHA256,enSHA256,en:'sources/after/en/index.html'}`.
- `fontManifest:{path,sha256}`, `fonts:[{path,sha256}]` for eight actual assets,
  `fixtureOptions.fonts.assignments`, `focusedReceipt:{path,sha256}`, `assets`.
- `capture:{absoluteStart:3,absoluteEnd:7,fps:24,frames:96,duration:4}` exactly
  under the later native-end-window amendment (see `bridge-h03-window03-result.md`).
- All three case IDs `h03-rain-panL`, `h03-bubbles-push`, `h03-credits-dutch`, each
  with H03 membership, `status:'safe'|'insufficient'|'unsupported'` and conditions
  layout/camera, 3200×1080, seed704, (.5,.42), radius.2, three joined text lines.
- Only acquired safe entries carry `media:{before:{video,keyImages},after:...}`.
  Video/PNG paths must be canonical indexed assets, nonempty and distinct.
  Config `caseIDs` must equal the full nonempty acquired-safe media subset.
- JA/EN pages expose global H03 and case anchors; both HTML assets are indexed.

This finalizes the tentative design's product-EN, role and receipt field names.
The optional bridge/pointer field is also named `h03Supplement`; existing schemas
and `remoteReference` remain unchanged. A four-file/three-local-assets closure
and 128KiB limit remain. Raw remote hashes are outside local `assets`; self-hash
remains in the external receipt. H03 links appear inside H03 while main links
remain. No supplemental URLs are fabricated for real output.

## Verification boundaries and self-review

Shared verifier matches original main raw hash to H03 linkage, exact e96 and
before/after source hashes, JA/EN product hashes, eight font path/rawhash pairs
against main runtime faces and complete role assignments. Receipt/font-manifest
references must be canonical and indexed. It validates all three outcomes,
reviewed conditions, capture clock and complete acquired-media subset. Parent
approval is the caller's explicit reviewed `caseIDs`, not inferred by this code.

The helper validates manifest declarations and indexed identities. It does not
read every remote/native asset, decode video, inspect receipt contents, certify
lifetime/grouping/safety, or prove runtime font loading. Native validators and
parent review retain those responsibilities. The finalized schema has no separate
executed-engine identity field; this helper checks declared original source HTML
bytes, not an invented executed-engine proof. Main and supplemental fixtures
intentionally differ. The actual H03 renderer/receipt is not yet qualified here.

Self-review covered optional-field reconstruction, fail-closed partial reference
inputs, old output compatibility, pre-write failure, relative/escaped links,
root/deep immutability, unchanged audit hash, and sensitive-input error redaction.
No auth hook/token/network handling was added.

## Local evidence

Commands: `node --check` on both changed CJS files; `git diff --check`;
`node dev/avoidance/layouts-b-pages-bridge-test.cjs`.
All pass. Raw final log: `bridge-h03-offline-test01.log` (13 tests, zero failures).
This retains the previous seven checks and adds supplemented audit, committed
no-supplement golden, mixed outcome JA/EN linkage, detailed negative mutations,
strict supplemental URL cases, and actual local deep-manifest/HTML hub tests.
Golden compares all four generated files plus hub/page HTML against committed
`fa05519ba574513ed803c2232661ecb39d8ab867` source bytes. No browser required.
Both original and supplemented synthetic Pages audits pass with two manifests,
respectively 34,111 / 35,547 bytes; both still reject changed old public bytes.
The audit script is unmodified, with SHA256
`8e67722fc662bd3fa14aabd85a30e0cfae71887024dab4f20d9f6c2797738a01`.

Start/end source pins appear in the raw log and are asserted unchanged:

- helper SHA256 `77eec2d43e62ec61f8b61330d663a306d8099697de5ca0d457ba2a09942a4e10`
- test SHA256 `452c949761bcca23c7aa17ab8ea5bdedd95a24de86eb20670eb91b3b7c3250f0`

These tests use explicitly synthetic metadata and placeholder media byte hashes.
They prove helper behavior only, never actual H03 media/remote success. Parent
must review the patch before integration, then supply real approved H03 bytes,
acquired safe subset and actual Sites URLs through the existing publication flow.
