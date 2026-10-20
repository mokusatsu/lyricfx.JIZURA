# Final04 external503 retry: parent review, not yet executed publicly

Original validator `c9d732c2...` / browser module `cb0d19bc...` remain unchanged.
The external preload wraps only `dev/browser.cjs.launch → browser.newPage →
page.evaluate`, accepting only the exact original fetchBytes callback (SHA256
`54c9d70f601dafa30e6d9de1e170bd8e3faed61c268a739a591df4690071805c`) and an
exact listed URL. It forwards the same function and URL to the original evaluate
and returns that original result object. It changes no fetch/Response/router,
app/bundle, proxy, CA or TLS setting.

The pinned04 manifest supplies939 raw URLs, including the manifest. Its pinned
local index supplies174 additional exact case URLs; Python's standard HTML parser
extracts decoded href attributes. Tests independently extract the current literal
hrefs and run the original validator's actual DOM attribute-reader callback; the
lists agree. Live-link distinct URLs:726; union allowlist:1113. Additional-list SHA:
`9301ede28a7606d5fe83bf08fd6570c7037e1b8eeaf2bf801f47584e45fd78af`.
No prefix, arbitrary query, external-origin URL, page.goto or automatic resource
request is included by this mechanism.

503 alone retries, at most3attempts with1000/2000ms backoff. Any other HTTP
returns unchanged; network/TLS errors rethrow the original error without retry.
200 with a wrong hash returns unchanged and the original validator hash assert
fails. JSONL records every matched attempt, including all failures and recovered
successes; failed requests have URL/status(or null)/attempt/operationID/pageID.
The startup receipt holds helper/core hashes, source pins and exact URL lists.
The exit event counts unique raw URLs with expected hashes but does not replace
the original validator's complete success result or later348native/UI checks.

Node mocks:21PASS, including actual original-source fetchBytes invocation and
callback pin, result/error reference identity, identical fn/URL, actual1000ms
backoff, simulated1000/2000ms, exhausted503limit, non503/no-target/POST passthrough,
network/TLS failures, wrong200hash, approved fixed case URL and fresh-file guards.
`avoid006-final04-retry-mock-receipt.json` pins all test/code outputs. No Chrome,
HTTP request or real public validation was performed by these tests.

After parent review only, use the inherited environment from the public runbook
and a new directory. Existing failure01/02 and normal-UI/site-smoke evidence stay
unchanged. This command is a proposal and has not run:

```sh
cd /workspace/lyricfx.JIZURA
set -eu
export JIZURA_BROWSER=/usr/bin/chromium
export PLAYWRIGHT_BROWSERS_PATH=/workspace/work/avoid006-playwright-cache
export NODE_PATH="${NODE_PATH:-/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules}"
AVOID006_RETRY_OUT="$PWD/scratch/avoid006-final04-public-retry-01"
mkdir "$AVOID006_RETRY_OUT"
AVOID006_PUBLIC_RETRY_LOG="$AVOID006_RETRY_OUT/transport.jsonl" \
  node --require ./scratch/avoid006-final04-public-retry-preload.cjs \
  dev/avoidance/layouts-a-review.cjs validate local-20261020-04 \
  --base-url https://mokusatsu.github.io/lyricfx.JIZURA/ \
  > "$AVOID006_RETRY_OUT/validator.log" 2>&1
```

Core SHA256: `5319c2056e560698eecb00132a16beebfdb33c4c73a708ce0edd785917b81e92`.
Preload SHA256: `8b2ce5ec7992b1ad783e21535edcbbbbcd6a3d0bc9c758bf7cc933caa9e9f5ba`.
Tests SHA256: `bf6a098c2afd4312cbca3a3d1c70875e465c539366098a8f1c239a46fc6dca64`.
A pre-existing JSONL or receipt aborts via exclusive-create; pick a new directory
rather than overwrite. Passing requires the unchanged validator's939raw hashes,
174cases/348native+348UI/playback/audits/seeks/responsive/JAENstartup and final
fixed manifest SHA success, plus retained retry JSONL and receipt. No automatic
whole-run restart is implemented.
