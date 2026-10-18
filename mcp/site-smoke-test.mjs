import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
assert(
  args.length === 0 ||
    (args.length === 1 && args[0] === "--local") ||
    (args.length === 2 && args[0] === "--base-url"),
  "Usage: node site-smoke-test.mjs [--local | --base-url URL]",
);
const editions = [
  ["ja", "", await readFile(root + "index.html")],
  ["en", "en/", await readFile(root + "en/index.html")],
];
let server, browser;
const hash = (data) => createHash("sha256").update(data).digest("hex");
try {
  let base =
    args[0] === "--base-url"
      ? args[1]
      : "https://mokusatsu.github.io/lyricfx.JIZURA/";
  if (args[0] === "--local") {
    server = createServer((req, res) => {
      const edition = editions.find(([, path]) => req.url === "/" + path);
      if (!edition) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(edition[2]);
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    base = `http://127.0.0.1:${server.address().port}/`;
  }
  const baseURL = new URL(base);
  assert(
    ["http:", "https:"].includes(baseURL.protocol),
    "HTTP(S) URL required",
  );
  assert(baseURL.pathname.endsWith("/"), "Base URL must end in /");
  browser = await chromium.launch({
    headless: true,
    ...(process.env.JIZURA_BROWSER
      ? { executablePath: process.env.JIZURA_BROWSER }
      : {}),
  });
  for (const [language, path, expected] of editions) {
    const page = await browser.newPage(),
      errors = [];
    page.setDefaultTimeout(20000);
    page.on("pageerror", (e) => errors.push(e.message));
    // Test the self-contained core; fonts and optional remote models are separate checks.
    await page.route("**/*", (r) =>
      new URL(r.request().url()).origin === baseURL.origin
        ? r.continue()
        : r.abort(),
    );
    const url = new URL(path, baseURL).href;
    let response;
    try {
      response = await page.goto(url, { waitUntil: "load", timeout: 30000 });
    } catch (e) {
      throw new Error(
        `Cannot open ${url}: ${e.message}. Keep TLS verification enabled; distinguish proxy policy failures from Chromium CA trust errors.`,
        { cause: e },
      );
    }
    assert.equal(response.status(), 200, `${language}: HTTP status`);
    assert.equal(
      hash(await response.body()),
      hash(expected),
      `${language}: deployed HTML differs from this checkout`,
    );
    await page.waitForFunction(() => window.J?.uiApi && J.ui.plan);
    const rendered = await page.evaluate(async () => {
      const p = J.defaultProject();
      Object.assign(p, {
        lyrics: "[00:00]公開確認\n[00:02]Hello JIZURA",
        durationOverride: 4,
      });
      J.ui.project = p;
      J.uiApi.syncUI();
      J.uiApi.replan();
      J.uiApi.seek(1);
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      const canvas = document.getElementById("view");
      const pixels = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height).data;
      let hasColorVariation = false;
      for (let i = 4; i < pixels.length; i += 4) {
        if (
          pixels[i] !== pixels[0] ||
          pixels[i + 1] !== pixels[1] ||
          pixels[i + 2] !== pixels[2]
        ) {
          hasColorVariation = true;
          break;
        }
      }
      return {
        lyricLines: [
          ...new Set(
            J.ui.plan.cuts
              .filter((c) => c.line >= 0 && Number.isInteger(c.part))
              .map((c) => c.line),
          ),
        ].sort(),
        hasColorVariation,
        cuts: J.ui.plan.cuts.length,
        width: canvas.width,
        height: canvas.height,
        pngBytes: canvas.toDataURL("image/png").length,
      };
    });
    assert.deepEqual(
      rendered.lyricLines,
      [0, 1],
      `${language}: both requested lyric lines generated`,
    );
    assert(
      rendered.width > 0 &&
        rendered.height > 0 &&
        rendered.pngBytes > 1000 &&
        rendered.hasColorVariation,
      `${language}: rendered canvas`,
    );
    assert.deepEqual(errors, [], `${language}: JavaScript errors`);
    console.log(
      JSON.stringify({
        status: "passed",
        language,
        url,
        sha256: hash(expected),
        ...rendered,
      }),
    );
    await page.close();
  }
} finally {
  await browser?.close();
  if (server)
    await new Promise((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
}
