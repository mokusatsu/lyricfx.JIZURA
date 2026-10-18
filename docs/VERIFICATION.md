# Browser and MCP verification

## Reproduce the checks

Use Node.js 24, Python 3.12 and pnpm 11.25.0. From the repository root:

```sh
pnpm --dir mcp install --frozen-lockfile
(cd mcp && pnpm exec playwright install --with-deps chromium)
PYTHONDONTWRITEBYTECODE=1 python3 build.py
git diff --exit-code -- index.html en/index.html
node dev/lyric_test.js
node mcp/site-smoke-test.mjs --local
node mcp/special-cuts-test.mjs
node mcp/special-cuts-test.mjs en
node mcp/favorites-test.mjs
node mcp/custom-effects-test.mjs
(cd mcp && pnpm test)
```

Run each command only after the preceding command succeeds. On a managed Linux
machine with an existing Chromium installation, set
`JIZURA_BROWSER=/usr/bin/chromium` for the Node test commands instead of downloading
another browser. Configure package-manager caches in a writable location if the
home directory is read only. Do not modify lockfiles to install dependencies.

`.github/workflows/verify.yml` runs these build and test checks on pull requests,
pushes to `main`, and manual workflow dispatch. It needs only repository read
access. It does not deploy or change GitHub Pages settings. Its first hosted run
is required before claiming that GitHub Actions itself has been verified.

The build check catches generated HTML that was not refreshed after source
changes. The local site smoke test serves only the Japanese and English pages,
compares their SHA-256 hashes with the checkout, then generates two timed lyric
lines and checks canvas rendering and JavaScript exceptions. It blocks external
fonts and optional models so those services cannot hide or break the core check.
The MCP integration suite additionally exercises audio import and MP4 output.
These checks do not validate visual quality, real After Effects, optional remote
models, or every browser.

## Check an actual deployment

After deployment, run from the matching checkout:

```sh
node mcp/site-smoke-test.mjs
# Or another deployment whose HTML must match this checkout exactly:
node mcp/site-smoke-test.mjs --base-url https://example.com/project/
```

The default target is `https://mokusatsu.github.io/lyricfx.JIZURA/`. The command
checks Japanese and English HTTP responses, exact HTML hashes, initialization,
lyric generation and drawing. A stale deployment, HTTP error, JavaScript error,
or TLS error fails the command. Do not turn off TLS verification to get a pass.
A feature branch with changed HTML is expected to fail the hash comparison until
that exact HTML has been deployed. Local smoke success is not deployment success.

## Certificate incident: managed cloud Chromium

Investigated on 2026-10-18. This is a development-environment issue, not a request
to replace GitHub Pages certificates or configure certificates for site visitors.

Observed evidence:

1. Python could verify HTTPS to `registry.npmjs.org` using the system trust store.
   The observed leaf certificate had an OpenAI issuer, showing that the managed
   outbound proxy terminated TLS. This is not GitHub's public certificate chain.
2. The leaf verified against the platform-provided
   `/usr/local/share/ca-certificates/environment-proxy-ca.crt` with OpenSSL's
   default CA path and store disabled for the comparison.
3. The identical root certificate was already in
   `/home/agent/.pki/nssdb`, under the nickname `OpenAI-nebula-dns`. A nickname alone
   is not sufficient: the SHA-256 fingerprints matched and that exported root
   also verified the observed leaf. The earlier suspicion of an absent root was
   therefore incorrect.
4. System Chromium 154, launched normally by Playwright, failed with
   `ERR_CERT_AUTHORITY_INVALID` inside the workspace sandbox. File-access tracing
   showed `access(.../.pki/nssdb/cert9.db, W_OK) = -1 EROFS` when Chromium initialized
   its certificate database.
5. The same executable, URL, user and Playwright launch options succeeded with
   HTTP 200 outside that filesystem sandbox. TLS checking stayed enabled. The
   SHA-256 of `cert9.db` was identical before and after this comparison.

Together, these observations isolate the failure to Chromium's access to its NSS
trust database under the read-only sandbox. A root already trusted by the system
and present in NSS did not make that database usable by the sandboxed process.
There is no evidence here of a defective GitHub-managed `github.io` certificate.
The proxy prevents this environment from directly inspecting GitHub's original
public certificate chain; ordinary visitor TLS is a separate connection.

For an HTTPS browser check, use the platform's supported permission mechanism to
allow Chromium the required trust-database access, or run that check in an
approved execution context where the existing database is accessible. Then retry
the unchanged check. Do not add duplicate CAs, edit the site's certificate,
use `ignoreHTTPSErrors`, use `--ignore-certificate-errors`, or bypass the proxy.
The diagnostic comparison made no CA or site configuration changes.

Networking is a separate prerequisite. In the replacement cloud instance,
`api.github.com` and `mokusatsu.github.io` requests were rejected by the proxy
with CONNECT 403 before TLS could start. This does not indicate a certificate
failure. Those destinations must be permitted in the active environment before
checking Pages settings or running the public-site command. Saved configuration,
runtime policy observations and successful requests are distinct evidence.

## Circular avoidance contract and visual evidence (AVOID-002)

The production avoidance behavior is unchanged in 002. The reusable contract,
independent geometry oracle, 184-ID responsibility reconciliation, portable
baseline runner, save-test server/font prerequisites and immutable review bundle
commands are documented in [dev/avoidance/README.md](../dev/avoidance/README.md).
Set `JIZURA_BROWSER` for the six baseline tests; assertions are unchanged. A
managed sandbox may require the supported approval context for Chromium sockets.
Public validation uses `review.cjs validate BUILD --base-url URL`, checks every
manifest asset and app HTML against local hashes, and never falls back to local
success when networking fails. Local captures alone do not establish deployment.

## AVOID-003 model validation

See the [003 API and evidence commands](../dev/avoidance/README.md#avoid-003-production-control-model-and-resolver).
Run `model-test.cjs` with the existing browser runtime and fixed c930c09 baseline.
Use `model-review.cjs` and `model-negative.cjs` for the 003 bundle; the 002 validator
continues to enforce its original unchanged-production contract. Public 003
validation supports `--base-url` and uses Chromium's existing proxy/CA transport.
Neither local evidence nor an unpublished comparison establishes a deployed pass.
