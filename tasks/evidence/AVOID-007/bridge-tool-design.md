# AVOID-007 small Pages bridge and Sites root hub

This change is limited to the new `layouts-b-pages-bridge.cjs`, its new test and this note. The approved native-media tools, shared product tree, existing Pages audit and old public assets are unchanged. No real Sites URL has been obtained or used here. Only synthetic metadata was generated in temporary directories and removed after testing. There was no network connection, publication, native B capture, authentication change or hosting-config update.

## Existing audit compatibility

The existing `dev/avoidance/pages-output-audit.py` was read before implementation. Its selected candidate bundle requires a local `manifest.json` containing `assets: {relativePath: rawSHA256}`. It follows those local asset paths and preserves all existing legacy URL, encoded-byte, 100MiB blob and 1,000,000,000-byte total-output checks. No schema relaxation is necessary for a bridge.

The generated Pages bridge has exactly four files:

```text
review/AVOID-007/<bridge-build>/
  index.html
  en.html
  sites-pointer.json
  manifest.json
```

Only the first three files appear in `manifest.assets`. The native Sites comparison manifest URL/SHA-256 are in the separate `remoteReference` field; remote URLs are never placed in the local `assets` map. The native manifest's existing `avoid007-native-v1` schema and bytes are not changed. The bridge manifest self-hash is returned in the external generation/validation receipt.

Every generated bridge is bounded to 128KiB and requires a previously nonexistent directory. The parent's recorded Pages total is 996,446,620 bytes; the bridge cap fits that recorded headroom, but this local test does not replace the parent's final full-output/Jekyll/old-URL/1GB audit. No existing file or URL is deleted, redirected or overwritten to gain space.

## APIs and fixed inputs

```js
const bridge = require('./dev/avoidance/layouts-b-pages-bridge.cjs');
const nativeManifestBytes = fs.readFileSync(actualLocalNativeManifest);
const receipt = bridge.generate(config, freshBridgeDirectory, {nativeManifestBytes});
bridge.validate(freshBridgeDirectory, {expectedConfig: config, nativeManifestBytes});
const hub = bridge.generateSitesHub('review/AVOID-007/<native-build>', freshDistRoot);
// Or obtain the same root HTML without a write:
const html = bridge.sitesHubHTML('review/AVOID-007/<native-build>');
```

`config` has strict known fields only:

- `buildID`: immutable bridge build ID.
- `sites`: actual `comparisonURL`, `englishComparisonURL`, `manifestURL`, `manifestSHA256`, and `audience:'owner-private'`. Real URLs must be supplied by the parent after Sites returns them. The implementation does not invent or probe a URL.
- `implementations.before`: exact e96 commit plus original `htmlSHA256`; `implementations.after`: candidate `htmlSHA256` and optional actual commit. Source-content hashes are mandatory; a candidate need not be recommitted merely to identify it.
- `product`: actual `jaSHA256`, `enSHA256` and optional commit. JA must match the captured candidate source hash. The product links are fixed to `https://mokusatsu.github.io/lyricfx.JIZURA/` and its `en/` page.
- `cases`: exactly the B25 layout set, one unique case ID per layout. Each includes `id`, `layout`, `stage:{W,H}`, `circle:{cx,cy,radius}`, reduced `aspect` such as `16:9`, and `hids`. H01 covers all cases and H02/H03 must be present. Metadata is normalized in the original B25 layout order.

Generation requires the original local native manifest bytes. Their raw SHA-256 must equal the actual Sites reference hash; their 25 case IDs/layouts/stages/circles/aspects/HIDs and source HTML JA/EN hashes must equal the bridge input. The bridge currently represents one static full-duration circle per representative and explicitly rejects flattening multiple native regions into one label. This establishes consistency with the local native manifest. It does not claim that the URL has been deployed or that its remote bytes were fetched: those checks remain with the parent and the native-media validator.

HTTPS URLs must already be canonical origin-plus-path URLs with no userinfo, query, input fragment, whitespace, backslash, percent escapes, dot traversal or doubled path separators. English/manifest URLs must resolve to `en.html`/`manifest.json` beside the comparison. Generated case/HID fragments are added only after validation. Strict unknown-field rejection prevents accidental auth fields from entering public metadata. The helper reads no credentials or environment tokens and has no network API. CLI errors suppress rejected input values so credential-bearing invalid URLs are not echoed.

CLI commands:

```text
node layouts-b-pages-bridge.cjs generate config.json fresh-directory actual-native-manifest.json
node layouts-b-pages-bridge.cjs validate directory [actual-native-manifest.json]
node layouts-b-pages-bridge.cjs hub review/AVOID-007/native-build fresh-dist-root
```

`validate directory` checks local closure, all raw hashes, deterministic HTML/pointer regeneration and the fixed configuration digest. Supplying the original native bytes adds the external-reference check; supplying `expectedConfig` programmatically also detects a self-consistent but changed input configuration.

## User-facing pages and root hub

The two Pages HTML files are small link pages with “変更前後のMP4を開く” / “Open before / after MP4s”, a brief login note, the existing product links, H01–H03 anchors and direct native case links. Technical source/condition details are in the manifest and pointer. There is no copied video, renderer, iframe, JavaScript or automatic redirect on the bridge page. All relative local links and generated external links are escaped.

Sites `static.directory=dist` can use the separate root hub. Its `index.html` contains two relative links into `review/AVOID-007/<immutable-native-build>/{index.html,en.html}`. It does not copy the comparison HTML to the root, so native asset references retain their base directory. It has no origin/token dependency and does not modify `.openai/hosting.json`. Existing root `index.html` is refused; existing old deep files are untouched. A future deployment may supply a fresh root pointing to a new generation while retaining the old generation directories and their deep URLs.

## Final synthetic qualification

Executed: `node dev/avoidance/layouts-b-pages-bridge-test.cjs`, 2026-10-22. Log: `/tmp/avoid007-pages-bridge-final-test.log`. Result: **7 passed, 0 failed**. Tests use the reserved `example.test` domain solely as synthetic metadata; no connection is made to it. This is not evidence of an actual Sites URL or a real bridge deployment.

Startup/end source identities:

- Tool: `d68a58e7b0ba5673a4843a40caaed947d31fb6ca186bd8e4d5535153c2049694`
- Test: `f32d56aee1763c9d631179fa0347cf97d5232c64c779d3b18b59486a87f27296`
- Unchanged existing Pages audit: `8e67722fc662bd3fa14aabd85a30e0cfae71887024dab4f20d9f6c2797738a01`

All three were pinned before test execution and verified unchanged afterward. The shared audit file has the same SHA as the isolated copy.

Coverage includes all 25 IDs/HID coverage, source/JAEN hashes, aspect and circle consistency against raw native-manifest bytes, mandatory private audience, forbidden credential/query/traversal URLs, HTML escaping, relative language links, H/case links, four-file closure, missing/raw-tampered/rehashed/extra/symlink assets, changed external conditions, immutable root/old deep URL preservation and sanitized CLI failure output. The existing Python `audit()` function accepted a synthetic source/output/projection containing both an old review manifest/asset and the new bridge, with two manifests and 34,111 total bytes. The same unchanged function rejected a changed old public asset even when source/output/projection were updated together. This invokes the real checker on synthetic copied output; it is not a real Jekyll build or the full 996MB Pages audit.

Pending parent work: code/result review and integration, actual native bundle completion, real Sites URL/remote hash/audience validation, real bridge generation, final Pages output audit, deployment and product JA/EN consistency checks. Nothing in these tests authorizes or records those operations as completed.
