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
    // Simulate a delayed font-set completion after fallback glyphs were cached.
    // The paused preview must redraw once, and normal frames must reuse placement.
    const fontRefresh = await page.evaluate(async () => {
      J.uiApi.pause();
      await new Promise(requestAnimationFrame);
      const glyph = J.glyphs.get('gothic_bold', 'A', 64);
      const revision = J.metrics.revision;
      const oldCircle = J.circleAvoidanceForCut, oldItemBox = J.itemBox, oldMainDraw = J.mainDraw;
      const ctx = document.createElement('canvas').getContext('2d');
      const cut = { layout: 'fontRefreshTest', seed: 1, text: 'A', params: { size: 20 }, dur: 2 };
      const env = { cut, plan: { W: 1000, H: 1000 }, W: 1000, H: 1000, t: 0, ctx, st: { fonts: {} } };
      J.circleAvoidanceForCut = () => ({ enabled: true, cx: 500, cy: 500, r: 100, pad: 0, R: 100 });
      J.itemBox = it => ({ x0: it.x, y0: it.y, x1: it.x + it.size, y1: it.y + it.size });
      J.mainDraw = () => null;
      J.LAYOUTS.fontRefreshTest = { render: e => J.mainDraw(e, { x: 20, y: 20, size: e.cut.params.size }) };
      const draw = () => J.drawCutWithCircleAvoidance({}, env);
      draw();
      const placement = cut._circleSol;
      J.ui.need = false;
      document.fonts.dispatchEvent(new Event('loadingdone'));
      const requested = J.ui.need;
      const updatedGlyph = J.glyphs.get('gothic_bold', 'A', 64);
      const updatedRevision = J.metrics.revision;
      draw();
      const updatedPlacement = cut._circleSol;
      env.t = 1; draw();
      const placementReused = cut._circleSol === updatedPlacement;
      delete J.LAYOUTS.fontRefreshTest;
      J.circleAvoidanceForCut = oldCircle; J.itemBox = oldItemBox; J.mainDraw = oldMainDraw;
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      return { requested, glyphChanged: glyph !== updatedGlyph,
        revisionChanged: updatedRevision > revision, placementChanged: placement !== updatedPlacement,
        placementReused, drawn: !J.ui.need };
    });
    assert.deepEqual(fontRefresh, { requested: true, glyphChanged: true,
      revisionChanged: true, placementChanged: true, placementReused: true, drawn: true }, `${language}: delayed font refresh`);
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
