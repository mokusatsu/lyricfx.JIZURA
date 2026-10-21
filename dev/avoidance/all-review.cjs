/* AVOID-006 full native animation review. No screen recording or WebM input. */
"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  cp = require("node:child_process"),
  crypto = require("node:crypto"),
  http = require("node:http"),
  zlib = require("node:zlib"),
  assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "../.."),
  OLD = "review/AVOID-006/local-20261020-04",
  HEAD = "88f270dc5377725dbb194553badd6c4fe6f6ead3",
  FPS = 24,
  FRAMES = 96,
  KEYS = [3, 15, 36, 90];
const film = require("./film-review.cjs"),
  layouts = require("./layouts-a-review.cjs");
const read = (p) => fs.readFileSync(p),
  sha = (b) => crypto.createHash("sha256").update(b).digest("hex"),
  json = (p, x) => fs.writeFileSync(p, JSON.stringify(x, null, 2) + "\n"),
  old = () => JSON.parse(read(path.join(ROOT, OLD, "manifest.json"))),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
function matrix() {
  return old()
    .cases.filter((c) => c.conditions.safeAnchor === true)
    .map((c) => ({
      id: c.id,
      label: c.label,
      hid: c.hid,
      group: "old04",
      conditions: c.conditions,
    }));
}
function checkSource() {
  for (const p of [
    "index.html",
    "en/index.html",
    ...cp
      .execFileSync("git", ["ls-tree", "-r", "--name-only", HEAD, "src"], {
        cwd: ROOT,
        encoding: "utf8",
      })
      .trim()
      .split("\n"),
  ])
    assert.equal(
      sha(read(path.join(ROOT, p))),
      sha(
        cp.execFileSync("git", ["show", HEAD + ":" + p], {
          cwd: ROOT,
          maxBuffer: 30e6,
        }),
      ),
      "candidate clean " + p,
    );
  assert.equal(
    sha(read(path.join(ROOT, "dev/avoidance/layouts-a-fixture.js"))),
    old().fixtureSHA256,
    "unchanged comparison fixture",
  );
}
function toolInputs() {
  return Object.fromEntries(
    [
      "dev/avoidance/film-review.cjs",
      "dev/avoidance/layouts-a-review.cjs",
      "dev/avoidance/oracle.cjs",
      "dev/avoidance/layouts-a-fixture.js",
      OLD + "/manifest.json",
      ...[
        "before-engine.html",
        "before.html",
        "font.otf",
        "font-symbols.ttf",
        "font-symbols.json",
      ].map((p) => OLD + "/fixtures/" + p),
    ].map((p) => [p, sha(read(path.join(ROOT, p)))]),
  );
}
function preflight() {
  assert.equal(
    sha(read(path.join(ROOT, OLD, "manifest.json"))),
    "2d9a87544a5a8b4818591b0daeb0b1ccd659c241d52d1383111422aca579e01d",
    "pinned old04 manifest",
  );
  checkSource();
  const cases = matrix(),
    fonts = ["font.otf", "font-symbols.ttf"].map((p) =>
      path.join(ROOT, OLD, "fixtures", p),
    );
  assert.equal(cases.length, 26);
  assert.equal(new Set(cases.map((c) => c.id)).size, 26);
  assert.equal(new Set(cases.map((c) => c.conditions.layout)).size, 26);
  layouts.fontCoverage(
    fonts,
    cases.map((c) => c.conditions.text || "").join(""),
  );
  return {
    pairs: cases.length,
    videos: cases.length * 2,
    layouts: new Set(cases.map((c) => c.conditions.layout)).size,
    fps: FPS,
    framesPerVideo: FRAMES,
    rendererFrames: cases.length * 2 * FRAMES,
    source: HEAD,
    baseline: old().before,
    fixture: old().fixtureSHA256,
    dimensions: [
      ...new Set(cases.map((c) => `${c.conditions.W}x${c.conditions.H}`)),
    ],
  };
}
async function server() {
  const s = http.createServer((req, res) => {
    try {
      const p = path.resolve(
        ROOT,
        "." + decodeURIComponent(new URL(req.url, "http://local").pathname),
      );
      assert.ok(p.startsWith(ROOT + path.sep));
      const b = read(p);
      res.setHeader(
        "Content-Type",
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".json": "application/json",
          ".otf": "font/otf",
          ".ttf": "font/ttf",
          ".mp4": "video/mp4",
        }[path.extname(p)] || "application/octet-stream",
      );
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Accept-Ranges", "bytes");
      const r = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (r) {
        const start = +r[1],
          end = r[2] ? Math.min(+r[2], b.length - 1) : b.length - 1;
        assert.ok(start <= end && end < b.length);
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${b.length}`,
          "Content-Length": end - start + 1,
        });
        res.end(b.subarray(start, end + 1));
      } else {
        res.setHeader("Content-Length", b.length);
        res.end(b);
      }
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  return { s, base: "http://127.0.0.1:" + s.address().port + "/" };
}
async function fixturePage(browser, base, c, side) {
  const page = await browser.newPage({
    viewport: {
      width: c.conditions.viewport?.[0] || 1100,
      height: c.conditions.viewport?.[1] || 1100,
    },
    deviceScaleFactor: 1,
  });
  try {
    await page.route("**/*", (r) =>
      r
        .request()
        .url()
        .startsWith(new URL(base).origin + "/")
        ? r.continue()
        : r.abort(),
    );
    await page.goto(new URL("evidence/" + side + "-engine.html", base).href);
    await page.addScriptTag({ url: new URL("evidence/fixture.js", base).href });
    await page.evaluate(
      async ({ spec, adaptive, font, symbols, range }) => {
        document.fonts.add(
          await new FontFace("Avoid006Fixture", `url(${symbols})`, {
            unicodeRange: range,
          }).load(),
        );
        window.result = await runLayoutsAFixture(J, spec, {
          newPath: true,
          adaptive,
          fontURL: font,
        });
        await document.fonts.ready;
        window.initialPlan = JSON.stringify(result.plan);
        if (!result.observation.fontLoaded) throw Error("font not loaded");
      },
      {
        spec: c.conditions,
        adaptive: side === "after",
        font: new URL("evidence/font.otf", base).href,
        symbols: new URL("evidence/font-symbols.ttf", base).href,
        range: JSON.parse(
          read(path.join(ROOT, OLD, "fixtures/font-symbols.json")),
        ).unicodeRange,
      },
    );
    return page;
  } catch (e) {
    await page.close();
    throw e;
  }
}
async function runPool(jobs, limit, fn) {
  let next = 0,
    failure = null;
  const workers = Array.from({ length: limit }, async () => {
    while (!failure && next < jobs.length) {
      const job = jobs[next++];
      try {
        await fn(job, () => !!failure);
      } catch (e) {
        failure ||= e;
      }
    }
  });
  await Promise.allSettled(workers);
  if (failure) throw failure;
}
function safety(frame) {
  let polygonCount = 0;
  const status = frame.diagnosis.segment?.status;
  if (["safe", "safe-hold"].includes(status))
    for (const p of frame.observations) {
      assert.equal(p.measurementSupported, true, "supported native geometry");
      assert.equal(p.envelopeCovered, true, "inside certified envelope");
      if (p.strictCircleClear !== undefined)
        assert.equal(p.strictCircleClear, true, "strict geometry clear");
      if (status === "safe" && p.rawCircleClear !== undefined)
        assert.equal(p.rawCircleClear, true, "full interval geometry clear");
      assert.ok(frame.circle, "certified active circle");
      for (const polygon of p.strictPolygons || p.polygons || []) {
        polygonCount++;
        assert.equal(
          require("./oracle.cjs").polygonClear(
            frame.circle,
            polygon,
            Math.max(2, 0.005 * frame.shortSide),
          ),
          true,
          "independent strict polygon clearance",
        );
      }
    }
  return {
    certified: ["safe", "safe-hold"].includes(status),
    strictPolygonCount: polygonCount,
    strictClear: ["safe", "safe-hold"].includes(status) ? true : null,
  };
}
async function render(page, time) {
  return page.evaluate((time) => {
    const observations = [];
    result.renderer.frame(result.canvas.getContext("2d"), result.plan, time, {
      noHud: true,
      noPost: true,
      placementObservation: (o) => observations.push(o),
    });
    if (JSON.stringify(result.plan) !== initialPlan)
      throw Error("capture mutated plan");
    const diagnosis = result.observationAt(time);
    delete diagnosis.attempts;
    delete diagnosis.composition;
    const region = J.resolveAvoidanceAt(result.plan, time);
    return {
      png: result.canvas.toDataURL(),
      time,
      diagnosis,
      observations,
      circle: region
        ? J.avoidanceCirclePixels(region, result.plan.W, result.plan.H)
        : null,
      shortSide: Math.min(result.plan.W, result.plan.H),
    };
  }, time);
}
function representativeIds(cases) {
  const seen = new Set();
  return new Set(
    cases
      .filter((c) => {
        if (seen.has(c.conditions.layout)) return false;
        seen.add(c.conditions.layout);
        return true;
      })
      .map((c) => c.id),
  );
}
function diagnosisLabel(c, side, en) {
  const d = c[side].diagnosis,
    status = d.segment?.status;
  if (status === "safe")
    return en ? "Avoidance for the full interval" : "全区間回避";
  if (status === "safe-hold")
    return en
      ? "Avoidance during hold; entry/exit may cross"
      : "保持中回避・入退場は通過可";
  if (d.decision === "excluded-during-avoidance")
    return en
      ? "Excluded candidate; not an avoidance success"
      : "候補除外・回避成功例ではありません";
  const controls = {
    off: ["回避OFF", "Avoidance OFF"],
    manual: [
      "手動指定・自動回避対象外",
      "Manual placement; automatic avoidance excluded",
    ],
    lock: [
      "位置ロック・自動回避対象外",
      "Locked placement; automatic avoidance excluded",
    ],
  };
  return (
    controls[c.conditions.control]?.[en ? 1 : 0] ||
    (en ? "Diagnostic; avoidance not guaranteed" : "診断表示・回避は未保証")
  );
}
function circleLabel(c, en) {
  const s = c.conditions,
    regions = s.regions || [
      { start: 0, end: 4, center: { x: s.cx, y: s.cy }, radius: s.radius },
    ];
  return regions
    .map(
      (r) =>
        `${r.start}–${r.end ?? 4}s: ${en ? "center" : "中心"} (${r.center.x}, ${r.center.y}), ${en ? "radius" : "半径"} ${r.radius}`,
    )
    .join(" / ");
}
function reviewControls() {
  const sections = [...document.querySelectorAll("section")],
    search = document.getElementById("search"),
    layout = document.getElementById("layout");
  let epoch = 0;
  function pauseAll() {
    epoch++;
    document.querySelectorAll("video").forEach((v) => v.pause());
  }
  function filter() {
    pauseAll();
    let n = 0;
    for (const s of sections) {
      s.hidden = !!(
        (layout.value && s.dataset.layout !== layout.value) ||
        (search.value &&
          !s.textContent.toLowerCase().includes(search.value.toLowerCase()))
      );
      if (!s.hidden) n++;
    }
    document.getElementById("count").textContent = n + " / " + sections.length;
  }
  search.addEventListener("input", () => {
    filter();
  });
  layout.addEventListener("change", filter);
  filter();
  const waitEvent = (v, name) =>
    new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        v.removeEventListener(name, done);
        v.removeEventListener("error", error);
      };
      const done = () => {
          cleanup();
          resolve();
        },
        error = () => {
          cleanup();
          reject(Error("video " + v.error?.code));
        },
        timer = setTimeout(() => {
          cleanup();
          reject(Error("timeout " + name));
        }, 15000);
      v.addEventListener(name, done, { once: true });
      v.addEventListener("error", error, { once: true });
    });
  document.addEventListener("click", async (e) => {
    if (!e.target.matches("[data-play],[data-pause]")) return;
    pauseAll();
    if (e.target.hasAttribute("data-pause")) return;
    const generation = epoch,
      section = e.target.closest("section"),
      videos = [...section.querySelectorAll("video")],
      message = section.querySelector("output");
    message.textContent = "";
    try {
      await Promise.all(
        videos.map(async (v) => {
          v.muted = true;
          if (v.readyState < 3) {
            const ready = waitEvent(v, "canplay");
            v.load();
            await ready;
          }
          if (v.currentTime !== 0) {
            const seeked = waitEvent(v, "seeked");
            v.currentTime = 0;
            await seeked;
          }
          if (v.readyState < 3) await waitEvent(v, "canplay");
        }),
      );
      if (epoch !== generation) return;
      await Promise.all(videos.map((v) => v.play()));
      if (epoch !== generation) videos.forEach((v) => v.pause());
    } catch (error) {
      if (epoch === generation) {
        pauseAll();
        message.textContent =
          (document.documentElement.lang === "ja"
            ? "再生できません: "
            : "Playback failed: ") + error.message;
      }
    }
  });
}
function pageHTML(m, en = false) {
  const title = en
      ? "All animation comparisons"
      : "全パターン・アニメーション比較",
    representatives = representativeIds(m.cases);
  const controls = {
    off: ["回避OFF", "Avoidance OFF"],
    manual: ["手動指定", "Manual placement"],
    lock: ["位置ロック", "Position locked"],
    "explicit-size": ["文字サイズ指定", "Explicit text size"],
    "explicit-scale": ["拡大率指定", "Explicit scale"],
  };
  return `<!doctype html><html lang="${en ? "en" : "ja"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="icon" href="data:,"><title>${title}</title>
<style>body{font:16px system-ui;background:#151923;color:#eee;max-width:1250px;margin:24px auto;padding:0 16px}a{color:#9ddcff}header{position:sticky;top:0;background:#151923;padding:8px;z-index:1}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}video{display:block;width:100%;max-height:65vh;background:#151923}section{margin:30px 0}button,input,select{font:inherit;margin:4px}section[hidden]{display:none}p{line-height:1.6}@media(max-width:650px){.pair{grid-template-columns:1fr}}</style>
<h1>${title}</h1><p>${esc(m.build)} · ${m.cases.length} ${en ? "pairs" : "組"} · 24 fps · 4 s · <a href="${en ? "index.html" : "en.html"}">${en ? "日本語" : "English"}</a> · <a href="manifest.json">${en ? "Capture details" : "撮影条件の詳細"}</a></p>
<p>${en ? "Only the animation is rendered at 24 fps, including entry, hold and exit. Before is the version preceding expanded circular avoidance; after includes the latest film correction. The baseline differs from the earlier film-only comparison. Play either video, or start both together. Native controls allow separate seeking." : "アニメ部分だけを24fpsで出力しました。入場・保持・退場を確認できます。変更前は円形回避の追加対応前、変更後はフィルム修正を含む最新版です。先のフィルム専用比較とは変更前の版が異なります。各動画の再生、または前後を一緒に再生できます。動画ごとにシークできます。"}</p>
<header><label>${en ? "Search" : "検索"} <input id="search" type="search"></label><label>${en ? "Layout" : "演出"} <select id="layout"><option value="">${en ? "All" : "全て"}</option>${[...new Set(m.cases.map((c) => c.conditions.layout))].map((x) => `<option>${esc(x)}</option>`).join("")}</select></label><output id="count"></output></header>
${m.cases.map((c) => `<section id="${esc(c.id)}" data-layout="${esc(c.conditions.layout)}" data-group="${c.group}" data-representative="${representatives.has(c.id)}"><h2>${esc(c.label)}</h2><p>${esc(c.conditions.text)} · ${c.conditions.W}×${c.conditions.H} · ${esc(controls[c.conditions.control]?.[en ? 1 : 0] || (en ? "Automatic avoidance" : "自動回避"))}<br>${esc(circleLabel(c, en))}<br><small>${esc(c.id)}</small></p><button type="button" data-play>${en ? "Play both from start" : "前後を最初から一緒に再生"}</button><button type="button" data-pause>${en ? "Pause both" : "前後を停止"}</button><output></output><div class="pair">${["before", "after"].map((side) => `<div><p>${side === "before" ? (en ? "Before" : "変更前") : en ? "After" : "変更後"} · ${en ? "at 1.5s" : "1.5秒時点"}: ${esc(diagnosisLabel(c, side, en))}</p><video controls playsinline preload="none" src="${c[side].path}"></video><a href="${c[side].path}">MP4</a></div>`).join("")}</div></section>`).join("")}
<script>(${reviewControls.toString()})();</script></html>`;
}

async function capture(build, { smoke = false } = {}) {
  assert.match(build, /^[\w.-]+$/);
  const audit = preflight(),
    all = matrix(),
    cases = smoke
      ? [
          all.find((c) => c.id === "lowerThird-native-anchor"),
          all.find((c) => c.id === "panels-native-anchor"),
        ]
      : all;
  assert.ok(cases.every(Boolean));
  const dir = path.join(ROOT, "work/all006-native-mp4", build);
  assert.ok(!fs.existsSync(dir), "immutable fresh capture directory");
  for (const p of ["public/videos", "evidence/images", "evidence/observations"])
    fs.mkdirSync(path.join(dir, p), { recursive: true });
  const started = Date.now(),
    m = {
      schema: 1,
      revision: "all-native-mp4-v1",
      scope: "26-layout-representatives-only",
      task: "AVOID-006",
      build,
      smoke,
      created: new Date().toISOString(),
      fps: FPS,
      frames: FRAMES,
      duration: 4,
      before: old().before,
      after: {
        commit: HEAD,
        execution: { newPath: true, adaptive: true },
        sourceSHA256: sha(read(path.join(ROOT, "index.html"))),
      },
      sourceManifestSHA256: sha(read(path.join(ROOT, OLD, "manifest.json"))),
      matrixSHA256: sha(Buffer.from(JSON.stringify(all))),
      audit,
      cases,
      assets: {},
      evidenceAssets: {},
      captureToolSHA256: sha(read(__filename)),
      captureGitHead: cp
        .execFileSync("git", ["rev-parse", "HEAD"], {
          cwd: ROOT,
          encoding: "utf8",
        })
        .trim(),
      toolInputs: toolInputs(),
      environment: {
        node: process.version,
        ffmpeg: cp
          .execFileSync("ffmpeg", ["-version"], { encoding: "utf8" })
          .split("\n")[0],
      },
      capture: {
        method:
          "actual native Canvas renderer.frame(n/24); PNG stream into libx264; no UI, recording, transcode, rescaling or overlays",
        noHud: true,
        noPost: true,
        temporalAccumulation: false,
        viewport: "per-case original conditions.viewport, otherwise 1100×1100",
        workers: 2,
        encoderThreads: 1,
        dpr: 1,
        keys: KEYS,
        fullObservation:
          "retained at key frames only; every frame retains hashes and pass summaries",
      },
    };
  const add = (p, b) => {
    fs.writeFileSync(path.join(dir, p), b);
    (p.startsWith("public/") ? m.assets : m.evidenceAssets)[
      p.replace(/^(public|evidence)\//, "")
    ] = sha(b);
  };
  for (const p of ["font.otf", "font-symbols.ttf", "font-symbols.json"])
    add("evidence/" + p, read(path.join(ROOT, OLD, "fixtures", p)));
  const before = read(path.join(ROOT, OLD, old().before.executedHTMLPath));
  assert.equal(sha(before), old().before.executedHTMLSHA256);
  add("evidence/before-engine.html", before);
  add(
    "evidence/before.html.gz",
    zlib.gzipSync(read(path.join(ROOT, OLD, "fixtures/before.html"))),
  );
  add(
    "evidence/after-engine.html",
    layouts.normalizeAppHTML(read(path.join(ROOT, "index.html"))),
  );
  add(
    "evidence/after.html.gz",
    zlib.gzipSync(read(path.join(ROOT, "index.html"))),
  );
  add(
    "evidence/after-en.html.gz",
    zlib.gzipSync(read(path.join(ROOT, "en/index.html"))),
  );
  add(
    "evidence/fixture.js",
    read(path.join(ROOT, "dev/avoidance/layouts-a-fixture.js")),
  );
  add("evidence/capture-tool.cjs", read(__filename));
  add(
    "evidence/source-provenance.json",
    Buffer.from(
      JSON.stringify(
        cp
          .execFileSync("git", ["ls-tree", "-r", "--name-only", HEAD, "src"], {
            cwd: ROOT,
            encoding: "utf8",
          })
          .trim()
          .split("\n")
          .map((p) => ({ path: p, sha256: sha(read(path.join(ROOT, p))) })),
        null,
        2,
      ),
    ),
  );
  const local = await server(),
    base = new URL(path.relative(ROOT, dir) + "/", local.base).href,
    browser = await require("../browser.cjs").launch();
  try {
    m.environment.browser = browser.version();
    await runPool(
      cases.flatMap((c) => ["before", "after"].map((side) => ({ c, side }))),
      2,
      async ({ c, side }, cancelled) => {
        const timeStart = Date.now(),
          page = await fixturePage(browser, base, c, side);
        let encoder;
        try {
          const dest = `videos/${c.id}-${side}.mp4`,
            args = film.encodeArgs(path.join(dir, "public", dest));
          args.splice(args.length - 2, 0, "-threads", "1");
          encoder = cp.spawn("ffmpeg", args, {
            stdio: ["pipe", "ignore", "pipe"],
          });
          let errors = "";
          encoder.stderr.on("data", (b) => (errors += b));
          const done = new Promise((resolve, reject) => {
            encoder.once("error", reject);
            encoder.once("close", (n) =>
              n === 0 ? resolve() : reject(Error(errors)),
            );
          });
          done.catch(() => {});
          encoder.stdin.on("error", () => {});
          const initial = await page.evaluate(() => ({
              plan: result.plan,
              project: result.project,
              observation: result.observation,
            })),
            frames = [];
          try {
            for (let n = 0; n < FRAMES; n++) {
              if (cancelled())
                throw Error("sibling capture failed; partial outputs retained");
              const f = await render(page, n / FPS);
              const safetyAudit = safety(f);
              const png = Buffer.from(f.png.split(",")[1], "base64");
              delete f.png;
              frames.push({
                frame: n,
                time: n / FPS,
                safetyAudit,
                nativePNGHash: sha(png),
                fullObservationSHA256: sha(Buffer.from(JSON.stringify(f))),
                diagnosis: f.diagnosis,
                passes: f.observations.map(film.summarizePass),
                ...(KEYS.includes(n) ? { fullObservation: f } : {}),
              });
              if (KEYS.includes(n))
                add(`evidence/images/${c.id}-${side}-${n}.png`, png);
              await new Promise((resolve, reject) =>
                encoder.stdin.write(png, (e) => (e ? reject(e) : resolve())),
              );
            }
            encoder.stdin.end();
            await done;
          } catch (e) {
            encoder.stdin.destroy();
            encoder.kill("SIGTERM");
            await done.catch(() => {});
            throw e;
          }
          const anchor = await render(page, c.conditions.time ?? 1.5),
            anchorPNG = Buffer.from(anchor.png.split(",")[1], "base64");
          delete anchor.png;
          add(`evidence/images/${c.id}-${side}-anchor.png`, anchorPNG);
          const observationPath = `observations/${c.id}-${side}.json.gz`;
          add(
            "evidence/" + observationPath,
            zlib.gzipSync(
              Buffer.from(JSON.stringify({ initial, frames, anchor })),
              { level: 9 },
            ),
          );
          m.assets[dest] = sha(read(path.join(dir, "public", dest)));
          c[side] = {
            path: dest,
            diagnosis: frames[36].diagnosis,
            anchor: {
              time: c.conditions.time ?? 1.5,
              path: `images/${c.id}-${side}-anchor.png`,
              sha256: sha(anchorPNG),
            },
            observationPath,
            seconds: (Date.now() - timeStart) / 1000,
            ...film.checkMP4(path.join(dir, "public", dest), {
              fps: FPS,
              duration: 4,
              frames: FRAMES,
            }),
          };
          json(path.join(dir, "progress.json"), {
            case: c.id,
            side,
            completed: cases.flatMap((c) =>
              ["before", "after"].filter((s) => c[s]),
            ).length,
            seconds: (Date.now() - started) / 1000,
          });
          json(path.join(dir, "partial-manifest.json"), m);
          process.stderr.write(`${c.id} ${side} ${c[side].seconds}s\n`);
        } finally {
          encoder?.kill("SIGTERM");
          await page.close();
        }
      },
    );
    checkSource();
    assert.equal(
      sha(read(__filename)),
      m.captureToolSHA256,
      "tool stable during capture",
    );
    assert.deepEqual(
      toolInputs(),
      m.toolInputs,
      "tool and source inputs stable",
    );
    m.seconds = (Date.now() - started) / 1000;
    m.publicBytes = Object.keys(m.assets).reduce(
      (s, p) => s + fs.statSync(path.join(dir, "public", p)).size,
      0,
    );
    add("public/index.html", Buffer.from(pageHTML(m)));
    add("public/en.html", Buffer.from(pageHTML(m, true)));
    json(path.join(dir, "manifest.json"), m);
    json(path.join(dir, "public/manifest.json"), publicManifest(m));
    return {
      dir,
      seconds: m.seconds,
      publicMP4Bytes: m.publicBytes,
      pagesBudget: 15000000,
      withinPagesBudget:
        fs
          .readdirSync(path.join(dir, "public"), { recursive: true })
          .reduce((sum, p) => {
            const f = path.join(dir, "public", p);
            return sum + (fs.statSync(f).isFile() ? fs.statSync(f).size : 0);
          }, 0) <= 15000000,
      videos: cases.length * 2,
      rendererFrames: cases.length * 2 * FRAMES,
    };
  } finally {
    await browser.close();
    await new Promise((r) => local.s.close(r));
  }
}
function publicManifest(m) {
  return {
    scope: m.scope,
    capture: {
      method:
        "Actual native Canvas renderer.frame(n/24), PNG stream into libx264; no screen recording or source-video transcode",
      fps: FPS,
      duration: 4,
      frames: FRAMES,
      resolution: "Original per-case conditions.W × conditions.H; no rescaling",
      overlays:
        "No UI, circle guides or other overlays are composited into the MP4 frames",
      beforeExecution: m.before.execution,
      afterExecution: m.after.execution,
      inheritedConditions:
        "Case conditions are retained verbatim from the old04 representative capture, including historical viewport/circleGuide fields. The new MP4 acquisition overrides the historical guide/UI capture method with native Canvas only. Viewport is retained per case; actual video resolution is W × H.",
      nativePNGAndSafetyEvidence:
        "Retained privately; not loaded by the comparison page",
    },
    schema: m.schema,
    revision: m.revision,
    build: m.build,
    smoke: m.smoke,
    fps: FPS,
    frames: FRAMES,
    duration: 4,
    before: m.before,
    after: m.after,
    matrixSHA256: m.matrixSHA256,
    sourceManifestSHA256: m.sourceManifestSHA256,
    cases: m.cases.map((c) => ({
      ...c,
      before: { path: c.before.path, diagnosis: c.before.diagnosis },
      after: { path: c.after.path, diagnosis: c.after.diagnosis },
    })),
    assets: m.assets,
  };
}
function validateFiles(dir) {
  const m = JSON.parse(read(path.join(dir, "manifest.json")));
  assert.equal(m.revision, "all-native-mp4-v1");
  assert.equal(m.scope, "26-layout-representatives-only");
  assert.equal(m.frames, FRAMES);
  assert.equal(m.fps, FPS);
  assert.equal(m.matrixSHA256, sha(Buffer.from(JSON.stringify(matrix()))));
  assert.deepEqual(
    m.cases.map(({ before, after, ...c }) => c),
    m.smoke
      ? [
          matrix().find((c) => c.id === "lowerThird-native-anchor"),
          matrix().find((c) => c.id === "panels-native-anchor"),
        ]
      : matrix(),
  );
  assert.deepEqual(m.before, old().before);
  assert.deepEqual(m.toolInputs, toolInputs());
  assert.equal(
    sha(zlib.gunzipSync(read(path.join(dir, "evidence/before.html.gz")))),
    m.before.sourceSHA256,
  );
  assert.equal(
    sha(zlib.gunzipSync(read(path.join(dir, "evidence/after.html.gz")))),
    m.after.sourceSHA256,
  );
  assert.equal(
    m.evidenceAssets["before-engine.html"],
    m.before.executedHTMLSHA256,
  );
  assert.equal(m.evidenceAssets["fixture.js"], old().fixtureSHA256);
  assert.equal(m.evidenceAssets["capture-tool.cjs"], m.captureToolSHA256);
  assert.equal(m.after.commit, HEAD);
  assert.equal(
    m.sourceManifestSHA256,
    "2d9a87544a5a8b4818591b0daeb0b1ccd659c241d52d1383111422aca579e01d",
  );
  assert.equal(
    m.after.sourceSHA256,
    sha(
      cp.execFileSync("git", ["show", HEAD + ":index.html"], {
        cwd: ROOT,
        maxBuffer: 30e6,
      }),
    ),
  );
  assert.equal(
    m.evidenceAssets["before-engine.html"],
    sha(
      layouts.normalizeAppHTML(
        zlib.gunzipSync(read(path.join(dir, "evidence/before.html.gz"))),
      ),
    ),
  );
  assert.equal(
    m.evidenceAssets["after-engine.html"],
    sha(
      layouts.normalizeAppHTML(
        zlib.gunzipSync(read(path.join(dir, "evidence/after.html.gz"))),
      ),
    ),
  );
  for (const name of ["font.otf", "font-symbols.ttf", "font-symbols.json"])
    assert.equal(
      m.evidenceAssets[name],
      m.toolInputs[OLD + "/fixtures/" + name],
    );
  for (const [group, assets] of [
    ["public", m.assets],
    ["evidence", m.evidenceAssets],
  ])
    for (const [p, h] of Object.entries(assets)) {
      assert.ok(!path.isAbsolute(p) && !p.split("/").includes(".."));
      const f = path.join(dir, group, p);
      assert.ok(fs.lstatSync(f).isFile() && !fs.lstatSync(f).isSymbolicLink());
      assert.equal(
        fs.realpathSync(f),
        path.resolve(f),
        "no symlink in asset path",
      );
      assert.equal(sha(read(f)), h, "asset " + group + "/" + p);
    }
  const pub = JSON.parse(read(path.join(dir, "public/manifest.json")));
  assert.deepEqual(pub, publicManifest(m), "exact publication projection");
  for (const c of m.cases)
    for (const side of ["before", "after"]) {
      const v = c[side];
      if (side === "before" && c.group === "old04") {
        const original = old().cases.find((x) => x.id === c.id).before.original;
        assert.equal(
          v.anchor.sha256,
          original.liveCanvasPNG_SHA256 || original.rawCapturePNG_SHA256,
          "same baseline native anchor " + c.id,
        );
      }
      const checked = film.checkMP4(path.join(dir, "public", v.path), {
        fps: FPS,
        frames: FRAMES,
        duration: 4,
      });
      assert.equal(checked.probe.streams[0].width, c.conditions.W);
      assert.equal(checked.probe.streams[0].height, c.conditions.H);
      const stored = JSON.parse(
        zlib.gunzipSync(read(path.join(dir, "evidence", v.observationPath)), {
          maxOutputLength: 128e6,
        }),
      );
      assert.equal(stored.frames.length, FRAMES);
      assert.deepEqual(stored.initial.project.videoSize, {
        w: c.conditions.W,
        h: c.conditions.H,
      });
      for (let n = 0; n < FRAMES; n++) {
        const f = stored.frames[n];
        assert.equal(f.frame, n);
        assert.equal(f.time, n / FPS);
        assert.ok(f.passes);
        assert.equal(
          f.safetyAudit?.strictClear,
          f.safetyAudit.certified ? true : null,
        );
        if (f.safetyAudit.certified)
          for (const pass of f.passes) assert.equal(pass.envelopeCovered, true);
        if (KEYS.includes(n)) {
          assert.deepEqual(safety(f.fullObservation), f.safetyAudit);
          assert.equal(
            sha(Buffer.from(JSON.stringify(f.fullObservation))),
            f.fullObservationSHA256,
          );
          assert.equal(
            sha(
              read(
                path.join(dir, "evidence/images", `${c.id}-${side}-${n}.png`),
              ),
            ),
            f.nativePNGHash,
          );
        }
      }
      assert.equal(
        sha(read(path.join(dir, "evidence", v.anchor.path))),
        v.anchor.sha256,
      );
    }
  return m;
}
function fullPlaybackIds(cases) {
  const picked = new Set(),
    seen = new Set();
  for (const c of cases) {
    const keys = [
      "layout:" + c.conditions.layout,
      "size:" + c.conditions.W + "x" + c.conditions.H,
    ];
    if (keys.some((k) => !seen.has(k))) picked.add(c.id);
    keys.forEach((k) => seen.add(k));
  }
  return picked;
}
async function validateUI(browser, url, m, width = 1100) {
  const page = await browser.newPage({ viewport: { width, height: 900 } }),
    errors = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  try {
    await page.goto(url, { waitUntil: "networkidle" });
    assert.equal(
      requests.length,
      1,
      "initial HTML only, including file delivery",
    );
    assert.equal(
      await page.locator("section:visible").count(),
      representativeIds(m.cases).size,
    );

    assert.equal(await page.locator("section:visible").count(), m.cases.length);
    await page.locator("#search").fill(m.cases[0].id);
    const section = page.locator("section:visible");
    assert.equal(await section.count(), 1);
    await section.locator("[data-play]").click();
    await page.waitForFunction(() =>
      [...document.querySelectorAll("section:not([hidden]) video")].every(
        (v) => !v.paused && v.currentTime > 0.3,
      ),
    );
    const first = await section
      .locator("video")
      .evaluateAll((v) => v.map((x) => x.currentTime));
    assert.ok(
      Math.abs(first[0] - first[1]) < 0.1,
      "bounded paired start clock difference",
    );
    await section.locator("[data-pause]").click();
    const paused = await section
      .locator("video")
      .evaluateAll((v) =>
        v.map((x) => ({ time: x.currentTime, paused: x.paused })),
      );
    await page.evaluate(
      () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        ),
    );
    assert.deepEqual(
      await section
        .locator("video")
        .evaluateAll((v) =>
          v.map((x) => ({ time: x.currentTime, paused: x.paused })),
        ),
      paused,
    );
    assert.ok(paused.every((x) => x.paused));
    await section.locator("[data-play]").click();
    await page.waitForFunction(() =>
      [...document.querySelectorAll("section:not([hidden]) video")].every(
        (v) => !v.paused && v.currentTime > 0.1 && v.currentTime < 0.6,
      ),
    );
    const restart = await section
      .locator("video")
      .evaluateAll((v) => v.map((x) => x.currentTime));
    assert.ok(Math.abs(restart[0] - restart[1]) < 0.1);
    await page.locator("#search").fill("no-matching-review-case");
    assert.equal(await page.locator("section:visible").count(), 0);
    assert.equal(
      await page.locator("video").evaluateAll((v) => v.every((x) => x.paused)),
      true,
      "filter stops hidden playback",
    );
    assert.deepEqual(errors, []);
    return {
      url,
      width,
      initialRequests: requests.slice(0, 1),
      initialMediaRequests: 0,
      initialRepresentativeCount: representativeIds(m.cases).size,
      pairStartTimes: first,
      pairStartDifference: Math.abs(first[0] - first[1]),
      restartTimes: restart,
      paused: true,
      filterPaused: true,
    };
  } finally {
    await page.close();
  }
}

async function publicRawAssets(browser, base, dir, m, report, checkpoint) {
  const page = await browser.newPage();
  report.publicHashes = [];
  try {
    await page.goto(new URL("index.html", base).href);
    const expected = {
      ...m.assets,
      "manifest.json": sha(read(path.join(dir, "public/manifest.json"))),
    };
    for (const [relative, expectedHash] of Object.entries(expected)) {
      report.active = { rawAsset: relative };
      checkpoint();
      const result = await page.evaluate(async (url) => {
        const response = await fetch(url, {
            cache: "no-store",
            signal: AbortSignal.timeout(30000),
          }),
          bytes = new Uint8Array(await response.arrayBuffer());
        let binary = "";
        for (let i = 0; i < bytes.length; i += 32768)
          binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
        return {
          status: response.status,
          bytes: bytes.length,
          base64: btoa(binary),
        };
      }, new URL(relative, base).href);
      const raw = Buffer.from(result.base64, "base64"),
        actual = sha(raw),
        record = {
          path: relative,
          status: result.status,
          bytes: raw.length,
          sha256: actual,
        };
      report.publicHashes.push(record);
      checkpoint();
      assert.equal(result.status, 200, "complete raw HTTP200, never206");
      assert.equal(raw.length, result.bytes);
      assert.equal(
        raw.length,
        fs.statSync(path.join(dir, "public", relative)).size,
      );
      assert.equal(
        actual,
        expectedHash,
        "complete Node raw-byte SHA256 " + relative,
      );
      if (relative === "manifest.json")
        assert.deepEqual(
          JSON.parse(raw),
          publicManifest(m),
          "canonical remote publication projection",
        );
    }
  } finally {
    await page.close();
  }
}

// Validation only: a queued pre-seek compositor callback is not proof of the
// requested decoded frame. Keep the same 0.1s target bound and 10s deadline.
function seekDecodedFrame(video, target) {
  return new Promise((resolve, reject) => {
    let seekedAt = null,
      decoded = null,
      callback = null;
    let settled = false;
    const ignoredFrames = [];
    const timer = setTimeout(
      () => finish("seek frame not decoded at " + target),
      10000,
    );
    function cleanup() {
      clearTimeout(timer);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      if (callback !== null) video.cancelVideoFrameCallback(callback);
    }
    function finish(message) {
      if (settled) return;
      if (message) {
        settled = true;
        cleanup();
        reject(
          Error(
            message +
              " " +
              JSON.stringify({
                target,
                seekedAt,
                decodedAfterSeek: decoded,
                ignoredFrames,
                currentTime: video.currentTime,
                seeking: video.seeking,
              }),
          ),
        );
      } else if (seekedAt !== null && decoded) {
        settled = true;
        cleanup();
        resolve({ seekedAt, decodedAfterSeek: decoded, ignoredFrames });
      }
    }
    function onSeeked() {
      seekedAt = video.currentTime;
      finish();
    }
    function onError() {
      finish("media seek error " + video.error?.code);
    }
    function onFrame(now, meta) {
      if (settled) return;
      callback = null;
      const frame = {
        mediaTime: meta.mediaTime,
        presentedFrames: meta.presentedFrames,
      };
      if (
        Number.isFinite(meta.mediaTime) &&
        Math.abs(meta.mediaTime - target) < 0.1
      ) {
        decoded = frame;
        finish();
      } else {
        ignoredFrames.push({
          ...frame,
          currentTime: video.currentTime,
          seeking: video.seeking,
        });
        callback = video.requestVideoFrameCallback(onFrame);
      }
    }
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    try {
      callback = video.requestVideoFrameCallback(onFrame);
      video.currentTime = target;
    } catch (error) {
      finish("seek setup failed " + error.message);
    }
  });
}

async function validate(dir, baseURL) {
  if (baseURL) {
    const url = new URL(baseURL);
    assert.ok(["http:", "https:"].includes(url.protocol));
    assert.ok(
      url.pathname.endsWith("/"),
      "public directory URL requires trailing slash",
    );
  }
  dir = path.resolve(dir);
  const m = validateFiles(dir),
    local = await server(),
    base = new URL(path.relative(ROOT, dir) + "/", local.base).href,
    browser = await require("../browser.cjs").launch(),
    publicBrowser = baseURL
      ? await require("../browser.cjs").launch(
          require("./review.cjs").publicBrowserOptions(baseURL),
        )
      : null,
    activeBrowser = publicBrowser || browser,
    reviewBase = baseURL || new URL("public/", base).href,
    report = {
      publicURL: baseURL || null,
      sourceRerender:
        "local pinned engine and fonts; not a public source rerender",
      created: new Date().toISOString(),
      build: m.build,
      initial: [],
      anchors: [],
      playback: [],
      validationToolSHA256: sha(read(__filename)),
      captureToolSHA256: m.captureToolSHA256,
    };
  const mode = baseURL ? "public" : "local",
    receiptDir = path.join(dir, "validations");
  fs.mkdirSync(receiptDir, { recursive: true });
  const receipt = path.join(
    receiptDir,
    mode +
      "-" +
      Date.now() +
      "-" +
      crypto.randomBytes(4).toString("hex") +
      ".json",
  );
  report.receiptPath = path.relative(dir, receipt);
  report.status = "running";
  fs.writeFileSync(receipt, JSON.stringify(report, null, 2) + "\n", {
    flag: "wx",
  });
  const checkpoint = () => json(receipt, report);
  try {
    for (const name of ["index.html", "en.html"]) {
      const page = await activeBrowser.newPage(),
        requests = [],
        errors = [];
      page.on("request", (r) => requests.push(r.url()));
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(new URL(name, reviewBase).href, {
        waitUntil: "networkidle",
      });
      assert.equal(requests.length, 1, "HTML only initial load");
      assert.equal(await page.locator("video").count(), m.cases.length * 2);
      assert.equal(
        await page.locator('video:not([preload="none"])').count(),
        0,
      );
      await page.locator("#search").fill(m.cases[0].id);
      assert.equal(await page.locator("section:visible").count(), 1);
      assert.deepEqual(errors, []);
      report.initial.push({
        name,
        requests,
        bytes: await page.evaluate(
          () => performance.getEntriesByType("navigation")[0].encodedBodySize,
        ),
      });
      await page.close();
    }
    for (const c of m.cases)
      for (const side of ["before", "after"]) {
        const page = await fixturePage(browser, base, c, side);
        try {
          const f = await render(page, c[side].anchor.time);
          assert.equal(
            sha(Buffer.from(f.png.split(",")[1], "base64")),
            c[side].anchor.sha256,
            "exact native rerender " + c.id + " " + side,
          );
          report.anchors.push({ id: c.id, side, matched: true });
        } finally {
          await page.close();
        }
      }
    report.ui = [];
    report.ui.push(
      await validateUI(
        activeBrowser,
        new URL("index.html", reviewBase).href,
        m,
      ),
    );
    report.ui.push(
      await validateUI(
        activeBrowser,
        new URL("index.html", reviewBase).href,
        m,
        390,
      ),
    );
    if (!baseURL) {
      try {
        report.fileDelivery = await validateUI(
          browser,
          require("node:url").pathToFileURL(path.join(dir, "public/index.html"))
            .href,
          m,
          390,
        );
      } catch (e) {
        if (!String(e).includes("ERR_BLOCKED_BY_ADMINISTRATOR")) throw e;
        report.fileDelivery = {
          tested: false,
          blockedBy: "Chromium managed policy ERR_BLOCKED_BY_ADMINISTRATOR",
          selfContainedRelativeAssets: true,
        };
      }
    }
    if (baseURL)
      await publicRawAssets(activeBrowser, reviewBase, dir, m, report, () =>
        checkpoint(),
      );
    const fullIds = fullPlaybackIds(m.cases);
    report.fullPlaybackIds = [...fullIds];
    const page = await activeBrowser.newPage();
    await page.addInitScript({
      content: "window.seekDecodedFrame=" + seekDecodedFrame.toString(),
    });
    await page.goto(new URL("index.html", reviewBase).href);
    for (const c of m.cases)
      for (const side of ["before", "after"]) {
        report.active = { id: c.id, side };
        checkpoint();
        report.lastAttempt = {
          ...report.active,
          src: c[side].path,
          status: "running",
        };
        checkpoint();
        const result = await page.evaluate(
          async ({ src, full }) => {
            const v = [...document.querySelectorAll("video")].find(
              (v) => v.getAttribute("src") === src,
            );
            v.closest("section").hidden = false;
            v.scrollIntoView({ block: "center" });
            v.muted = true;
            const event = (name) =>
              new Promise((resolve, reject) => {
                const timer = setTimeout(
                  () => reject(Error("timeout " + name)),
                  15000,
                );
                v.addEventListener(
                  name,
                  () => {
                    clearTimeout(timer);
                    resolve();
                  },
                  { once: true },
                );
                v.addEventListener(
                  "error",
                  () => reject(Error("video error " + v.error?.code)),
                  { once: true },
                );
              });
            const meta = event("loadedmetadata");
            v.load();
            await meta;
            await v.play();
            await new Promise((r) => setTimeout(r, 250));
            v.pause();
            const pausedAt = v.currentTime;
            const seek = await window.seekDecodedFrame(v, 2.6);
            if (!full)
              return {
                src,
                pausedAt,
                seek,
                duration: v.duration,
                fullPlayback: false,
              };
            const rewind = event("seeked");
            v.currentTime = 0;
            await rewind;
            const quality = v.getVideoPlaybackQuality(),
              ended = event("ended"),
              start = performance.now();
            await v.play();
            await ended;
            const q = v.getVideoPlaybackQuality();
            return {
              src,
              fullPlayback: true,
              pausedAt,
              seek,
              duration: v.duration,
              ended: v.ended,
              seconds: (performance.now() - start) / 1000,
              decoded: q.totalVideoFrames - quality.totalVideoFrames,
              dropped: q.droppedVideoFrames - quality.droppedVideoFrames,
              corrupt: q.corruptedVideoFrames - quality.corruptedVideoFrames,
            };
          },
          { src: c[side].path, full: fullIds.has(c.id) },
        );
        report.lastAttempt = { ...report.active, result, status: "returned" };
        checkpoint();
        assert.ok(result.pausedAt > 0);
        if (result.fullPlayback) assert.equal(result.ended, true);
        assert.ok(Math.abs(result.seek.seekedAt - 2.6) < 0.05);
        assert.ok(Math.abs(result.seek.decodedAfterSeek.mediaTime - 2.6) < 0.1);
        assert.equal(result.duration, 4);
        if (result.fullPlayback) {
          assert.ok(result.decoded >= 90);
          assert.equal(result.corrupt, 0);
          assert.ok(result.dropped / Math.max(1, result.decoded) < 0.25);
        }
        report.playback.push(result);
        checkpoint();
      }
    await page.close();
    report.passed = true;
    report.status = "passed";
    checkpoint();
    return report;
  } catch (e) {
    report.passed = false;
    report.status = "failed";
    report.failure = e.stack;
    checkpoint();
    throw e;
  } finally {
    await publicBrowser?.close();
    await browser.close();
    await new Promise((r) => local.s.close(r));
  }
}
module.exports = {
  matrix,
  runPool,
  fullPlaybackIds,
  seekDecodedFrame,
  server,
  publicRawAssets,
  publicManifest,
  preflight,
  safety,
  pageHTML,
  capture,
  validateFiles,
  validate,
};
if (require.main === module) {
  const [command, arg, ...flags] = process.argv.slice(2);
  (async () => {
    if (command === "preflight") return preflight();
    if (command === "capture")
      return capture(arg, { smoke: flags.includes("--smoke") });
    if (command === "validate") return validate(arg, flags[0]);
    throw Error(
      "Usage: all-review.cjs preflight | capture <fresh-build> [--smoke] | validate <capture-dir> [public-directory-URL/]",
    );
  })()
    .then((r) => process.stdout.write(JSON.stringify(r) + "\n"))
    .catch((e) => {
      console.error(e.stack);
      process.exitCode = 1;
    });
}
