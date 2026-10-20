# AVOID-006 final04: parent public verification runbook

Prepared by read-only inspection; **none of these network/browser commands has run**.
Run only after the parent reviews the scratch UI proposal, Pages deploys the exact
candidate, and the visual reviewer releases the Chrome CPU window. Run serially
with the supported browser/NSS permission context, retaining proxy/CA/TLS.

Fixed identities:

- Build: `local-20261020-04`; manifest: `2d9a87544a5a8b4818591b0daeb0b1ccd659c241d52d1383111422aca579e01d`.
- JA: `b2c230268f7731df2201093893397551b3265c8cad9984ef8b517cc1fe8bc696`.
- EN: `e4b4c31114221427eb86218e86deed3474395c52a627669c84c985b503f87de7`.
- Source fixture: `f8211cbf17b370ada86f68d32c5d6ba6bb0c5f3af4c379d71bad38e6c7d3a524`.

## Transport and CA preparation

Use Node24, the installed locked `dev/node_modules` image libraries and existing
Playwright runtimes. Observed `NODE_PATH` is
`/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules`;
`mcp/site-smoke-test.mjs` resolves its own `mcp/node_modules/playwright`.
The existing preload explicitly patches that same MCP Playwright instance.
The main validator and parent UI already pass `publicBrowserOptions`, so they do
not need this preload.

Keep inherited `HTTP(S)_PROXY`, lowercase proxy variables, `NO_PROXY` and
`NODE_EXTRA_CA_CERTS`. The current Node extra CA points to
`/usr/local/share/ca-certificates/environment-proxy-ca.crt`.
Read-only inspection confirmed that file and the existing NSS
`OpenAI-nebula-dns` certificate at `/home/agent/.pki/nssdb` have identical SHA256:
`C7:1B:4D:1E:9D:77:75:C5:38:C6:88:AB:10:CE:A9:CE:41:7D:73:12:E8:98:38:F9:D1:5F:F7:32:56:CD:7F:C3`.
NSS trust is `C,,`. **No CA import/addition is needed.** Chromium still needs
supported access to its existing NSS database; sandbox `EROFS` is not a missing CA.
A proxy CONNECT403 is a network-policy failure. Do not bypass proxy or TLS or use
certificate-ignore flags. These observations establish local trust configuration,
not current network reachability or deployed success.

## Serial commands after parent approval/deployment

The output is under excluded `scratch/`, preserving all previous public evidence.
Choose a fresh output directory for a retry; retain failed logs. Shell `set -e`
stops at the first failed command.

```sh
cd /workspace/lyricfx.JIZURA
set -eu
export JIZURA_BROWSER=/usr/bin/chromium
export PLAYWRIGHT_BROWSERS_PATH=/workspace/work/avoid006-playwright-cache
export NODE_PATH="${NODE_PATH:-/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules}"
AVOID006_PUBLIC_OUT="$PWD/scratch/avoid006-final04-public-01"
mkdir "$AVOID006_PUBLIC_OUT"

node dev/avoidance/layouts-a-review.cjs validate local-20261020-04 \
  --base-url https://mokusatsu.github.io/lyricfx.JIZURA/ \
  > "$AVOID006_PUBLIC_OUT/validator.log" 2>&1

node scratch/avoid006-final04-parent-ui.cjs local-20261020-04 \
  https://mokusatsu.github.io/lyricfx.JIZURA/ "$AVOID006_PUBLIC_OUT/normal-ui" \
  > "$AVOID006_PUBLIC_OUT/normal-ui.log" 2>&1

node --require ./tasks/evidence/AVOID-006/public-browser-preload.cjs \
  mcp/site-smoke-test.mjs --base-url https://mokusatsu.github.io/lyricfx.JIZURA/ \
  > "$AVOID006_PUBLIC_OUT/site-smoke.log" 2>&1
```

The main validator uses **default root source**, already locally hash-matched to
the fixed snapshot; it never reads the old850 root final-candidate receipt.
It must report939/939 public raw fetches:938 manifest asset entries **including
JA/EN HTML and every shared asset/source manifest**, plus the final04 manifest.
It then must rerender348 native frames and348 UI frames with exact original PNG
hash/byte counts, complete observations, all RGBA and color metadata checks, as
well as desktop/mobile comparison, actual playback/hold/passage audits, rapid
seeks and both deployed app renderer startups. Required final JSON:
`validated:true`, `cases:174`, `scope:candidate-evidence`, `unmetExpectations:0`,
the fixed manifest hash, and the actual public URL. Local success cannot replace it.

The UI proposal makes no request interceptions:26 anchor navigations plus six
normal playback/seek cases, storage/font-revision/time equality and mobile width;
page errors and external requests must be0. The separate site smoke intentionally
retains its existing external-font/model blocking and checks the exact JA/EN HTML
hashes, both requested lyric lines and actual Canvas drawing. It must emit one
`status:passed` row for each language. Do not describe that routed core smoke as
the normal-transport UI test.

## Scratch proposal and evidence handoff

`avoid006-final04-parent-ui.cjs` is a separate adaptation of
`/workspace/work/avoid006-parent-ui.cjs`; the original is unchanged. Required
adaptations: hydrate complete schema4 observations before selecting26 anchors;
pin build/manifest; assert public index/manifest identities; use a fresh scratch
output instead of overwriting the old `public-parent-ui` evidence. Existing six
playback/seek assertions remain. Syntax was checked; browser execution was not.

Proposal SHA256: `c98bba62a8d4b6b22fa7de42130a2642dea3dbd30f3cb9549bf590dc15660ed2`.
Existing preload SHA256: `ca012f7db08ea5d6680b32e1c0f60c73d8587f4e81f830c62c05872cbc23dd37`.
Existing site smoke SHA256: `3a9b69f869ee12fda10e47b15c81980baa03c81b78288bf6a73b37c44d3e641f`.

After all three succeed, the parent records exit codes, deployed commit/Pages run,
manifest/source hashes, all939 raw fetches,348+348 rerenders, UI results and
site-smoke JSON in a small new formal receipt. Keep screenshots in scratch unless
selected for review; account for any newly published evidence in the Pages size
budget. No publication, commit or push is performed by this runbook.
