import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
const root = fileURLToPath(new URL("../", import.meta.url));
const edition = process.argv[2] === "en" ? "en/" : "";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.JIZURA_BROWSER
    ? { executablePath: process.env.JIZURA_BROWSER }
    : {}),
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", async (r) =>
    r.request().url() === "http://127.0.0.1/"
      ? r.fulfill({
          contentType: "text/html",
          body: await readFile(root + edition + "index.html"),
        })
      : r.abort(),
  );
  await page.goto("http://127.0.0.1/");
  await page.addScriptTag({ path: root + "mcp/browser-api.js" });
  const result = await page.evaluate(async () => {
    const api = JizuraMCP,
      checks = [];
    const check = (ok, message) => {
      if (!ok) throw Error(message);
      checks.push(message);
    };
    const reset = (title, lyrics, duration = 8) => {
      J.ui.project = J.defaultProject();
      Object.assign(J.ui.project, {
        title,
        lyrics,
        durationOverride: duration,
      });
      J.uiApi.syncUI();
      J.uiApi.replan();
      api.theme({ themes: ["pop"] });
      api.generate({ seed: 42 });
    };
    for (const theme of ["pop", "cute", "horror"]) {
      reset("Title", "[00:01]A\n[00:08]B", 16);
      api.theme({ themes: [theme] });
      api.generate({ seed: 42 });
      check(
        api.audit().errors.length === 0,
        theme + " structural audit: " + api.audit().errors.join(";"),
      );
    }
    // Include an interlude and an outro as well as a title.
    reset("Title", "[00:01]A\n[00:08]B", 16);
    const kinds = J.ui.plan.cuts.map(J.lyricCutKind);
    for (const kind of ["title", "lyric", "interlude", "outro"])
      check(kinds.includes(kind), "fixture includes " + kind);
    check(
      api.audit().errors.length === 0,
      "generated structural cuts pass theme audit: " +
        api.audit().errors.join(";"),
    );
    const favorite = api.favoriteSave({
      name: "Drawing",
      payload: {
        format: "jizura-cut-effects",
        version: 1,
        kind: "lyrics",
        native: {},
        details: { drawing: J.favoriteAPI.spec().drawing.example },
      },
    }).favorite;
    let lyricIndex = J.ui.plan.cuts.findIndex(
      (c) => J.lyricCutKind(c) === "lyric",
    );
    for (const [index, cut] of J.ui.plan.cuts.entries()) {
      if (J.lyricCutKind(cut) === "lyric") continue;
      const before = JSON.stringify(api.state());
      const operations = [
        () => api.effect({ layer: "lyrics", index, group: "layout", seed: 1 }),
        () => api.randomize({ layer: "lyrics", index }),
        () =>
          api.cut({
            layer: "lyrics",
            index,
            patch: { details: { layout: "center" } },
          }),
        () => api.remove({ layer: "lyrics", index }),
        () => api.timing({ layer: "lyrics", starts: [{ index, frame: 1 }] }),
        () => api.favoriteApply({ id: favorite.id, layer: "lyrics", index }),
        () => api.favoriteSave({ name: "Invalid", layer: "lyrics", index }),
        () =>
          api.copy({
            sourceLayer: "lyrics",
            sourceIndex: lyricIndex,
            layer: "lyrics",
            index,
          }),
        () =>
          api.copy({
            sourceLayer: "lyrics",
            sourceIndex: index,
            layer: "lyrics",
            index: lyricIndex,
          }),
        () =>
          api.favoritePreview({
            id: favorite.id,
            layer: "lyrics",
            index,
            time: 0.1,
            width: 320,
          }),
      ];
      for (const operation of operations) {
        let error;
        try {
          await operation();
        } catch (e) {
          error = e;
        }
        check(
          error?.message.includes("Unsupported"),
          "reject " + J.lyricCutKind(cut) + " operation",
        );
        check(
          JSON.stringify(api.state()) === before,
          "rejected operation preserves project and revision",
        );
      }
    }
    // Structural exceptions must not admit arbitrary or unknown effects.
    for (const invalid of [
      "missing_effect",
      Object.keys(J.LAYOUTS).find(
        (k) =>
          !api.candidates().lyrics.layout.includes(k) &&
          !J.structuralCutEffects("title").layout.includes(k),
      ),
    ]) {
      const c = J.ui.plan.cuts.find((c) => J.lyricCutKind(c) === "title"),
        old = c.layout;
      c.layout = invalid;
      check(
        api.audit().errors.some((e) => e.includes(invalid)),
        "audit rejects invalid structural layout " + invalid,
      );
      c.layout = old;
    }
    // Resolved indices include the title; explicit preview must resolve the same cut.
    const originalPaste = J.pasteCutEffects;
    let previewTarget;
    J.pasteCutEffects = (project, plan, layer, cut, payload) => {
      previewTarget = { line: cut.line, part: cut.part };
      return originalPaste(project, plan, layer, cut, payload);
    };
    try {
      for (const title of ["Title", ""])
        for (const lyrics of ["First\nSecond", "[00:00]First\n[00:02]Second"]) {
          reset(title, lyrics, 4);
          const saved = api.favoriteSave({
            name: "Drawing",
            payload: favorite.payload,
          }).favorite;
          lyricIndex = J.ui.plan.cuts.findIndex(
            (c) => J.lyricCutKind(c) === "lyric",
          );
          const expected = J.ui.plan.cuts[lyricIndex];
          const before = JSON.stringify(api.state());
          const preview = await api.favoritePreview({
            id: saved.id,
            layer: "lyrics",
            index: lyricIndex,
            time: 0.1,
            width: 320,
          });
          check(preview.data.length > 1000, "preview renders");
          check(
            previewTarget.line === expected.line &&
              previewTarget.part === expected.part,
            "preview uses resolved index",
          );
          check(JSON.stringify(api.state()) === before, "preview is read only");
          api.favoriteApply({
            id: saved.id,
            layer: "lyrics",
            index: lyricIndex,
          });
          check(
            !!J.ui.plan.cuts[lyricIndex].drawing,
            "favorite reaches selected lyric",
          );
          const roundtrip = JSON.parse(JSON.stringify(J.ui.project));
          check(
            J.plan(roundtrip).cuts.some(
              (c) =>
                c.line === expected.line &&
                c.part === expected.part &&
                c.drawing,
            ),
            "drawing survives project JSON round trip",
          );
          api.undo();
          check(
            JSON.stringify(api.state().project) ===
              JSON.stringify(JSON.parse(before).project),
            "undo restores project",
          );
        }
    } finally {
      J.pasteCutEffects = originalPaste;
    }
    reset("Title", "[00:00]First\n[00:02]Second", 4);
    api.insert({ layer: "lyrics", frame: 24, text: "Inserted" });
    const all = api.state().cuts.lyrics;
    const insertedIndex = all.findIndex((c) => c.text === "Inserted");
    check(insertedIndex >= 0, "inserted lyric is listed");
    const page = api.state({ offset: insertedIndex, limit: 1 });
    check(
      page.cuts.lyrics[0].text === "Inserted",
      "pagination retains resolved index",
    );
    const saved = api.favoriteSave({
      name: "Inserted drawing",
      payload: favorite.payload,
    }).favorite;
    api.favoriteApply({ id: saved.id, layer: "lyrics", index: page.offset });
    check(
      !!api.state().cuts.lyrics[insertedIndex].drawing,
      "paged index edits inserted lyric",
    );
    const beforeDelete = JSON.stringify(api.state().project);
    api.remove({ layer: "lyrics", index: insertedIndex });
    check(
      !api.state().cuts.lyrics.some((c) => c.text === "Inserted"),
      "delete removes selected lyric",
    );
    api.undo();
    check(
      JSON.stringify(api.state().project) === beforeDelete,
      "undo restores deleted lyric",
    );
    return checks.length;
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS special-cut regression checks (" + (edition || "ja") + "):",
    result,
  );
} finally {
  await browser.close();
}
