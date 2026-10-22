# AVOID-007 native capture configuration draft and execution runbook

Status: **draft inputs checked; source/performance freeze and parent capture approval pending**. This preparation has not launched a browser, rendered a frame, generated an MP4, contacted a remote service or published a page. The existing approved tools, product source and shared fixture are unchanged by this work.

Files: `dev/avoidance/layouts-b-capture.draft.json`, this runbook and `capture-draft-static01.json`. Paths in the draft point to `/workspace/lyricfx.JIZURA`; the isolated tooling owner only reads that root. The final capture should be run from the parent-integrated tree after review. The source-backed record used here is `tasks/evidence/AVOID-007/font-functional04.json`; it is historical multiface/source-occurrence and selected-frame evidence, not evidence for the eventual performance-adjusted candidate.

## Fixed representative inputs

The draft retains all recorded row.spec fields, including empty params, and adds only `seed:704`: the successful fixture already defaults an omitted seed to 704, while the review tool requires an explicit integer seed. No camera, ghost, region, scale, lineText, note or motion parameter has been added to make a case pass. In particular, the successful fixture defaults remain camera `push` with `{a:.022,dir:1}`, no ghost/chroma, start 0, duration 4, native font/layout parameter generation, no media/foreground, no events/beats and the same explicit palette/FX. The capture tool alone initializes/render-seeks at frame time 0 and then n/24; that acquisition path is separate from the historical functional test's initial 1.5s and sampled times.

All 25 have text `風の先へ`, center (.5,.42), radius .2 of the short stage side, explicit seed 704. Twenty-one use 1920×1080. Only elastic/stickerBomb/kanjiFocus/tape use 3200×1080. Both stages have short side 1080, so radius is 216px; centers are (960,453.6) or (1600,453.6). The 3200×1080 aspect reduces to 80:27; do not relabel it as 16:9 or crop/stretch it for comparison. typeSpecimen exactly preserves `grid:g3`, main gothic_bold and `[gothic_med,mincho_bold,mincho,round,dot]` from the successful spec.

Before is exact e96cbb2 Git source plus the shared full-stage original-composition fixture (`newPath:false`, area:null, no legacy small rectangle). The new B avoidance API is absent there. After is the parent's current root with `newPath:true`; its final source identity is **not known yet**. The draft has `buildID:null` and `after.identity` beginning `PENDING`. Existing capture rejects the null build ID before creating output or launching a browser. Passing the structural case/font guards below is deliberately not called capture readiness.

## Real fonts and historical audits

`fixtureOptions.fonts` is an exact copy of the successful b-fonts manifest, not a hand-recreated subset. It retains version, all face/codepoint/cmap/source metadata, role assignments, fallbackFamily, specimenParams and provenance. The manifest's original build scope still says its later emitted-glyph audit was pending; the separate bundled font-functional04 record supplies the subsequently executed historical audit. Neither old text nor provenance URLs are edited to pretend a final run happened.

Eight local font assets are bundled: Noto Sans CJK JP Regular/Bold, Noto Serif CJK JP Regular/Bold, Noto Sans Mono CJK JP Regular, actual DotGothic16, actual M PLUS Rounded 1c ExtraBold and explicit Noto Sans Symbols2 fallback. Before/after use identical bytes and assignments. Do not rename Noto as Dot/M PLUS, remove the symbol fallback, or reduce this to the old single-font transport mode. Runtime face URLs remain `fonts/<filename>` and the approved tool resolves them against the actual bundle root in memory. Source/font provenance HTTPS URLs and the historical audit's localhost URLs are metadata only, not runtime font dependencies.

`fontAuditPath` is `evidence/font-functional04.json`. supportFiles copy that original report, original b-fonts manifest, upstream-sources.json and the four original license/copyright files. The report includes per-ID face loads/assignments, 526 emitted-glyph coverage entries and six distinct actual specimen raster signatures. These are historical claims from that run; final source/capture font loading and native key parity must still pass. Additional pins retain the functional test, font builder and independent oracle. The existing tool automatically pins fixture, current candidate source/JAEN, baseline Git bytes, tool/test, actual fonts and runtime package identities at startup/end.

## Review routes and limits

The paths in the following table are **planned relative routes within the future native bundle**, not URLs already generated or opened here. Existing approved page generation creates each case anchor and live link from the case ID. After a successful capture, `index.html#<case>` / `en.html#<case>` open the comparison, and `live.html?case=<case>` opens the real source fixture. Each case has concrete Japanese/English focus, intended-change and preserve criteria in the draft.

| Layout | Stage | H IDs | Compare anchor | Live route |
|---|---|---|---|---|
| rain | 1920×1080 | H01, H02 | `#b25-rain` | `live.html?case=b25-rain` |
| hanging | 1920×1080 | H01 | `#b25-hanging` | `live.html?case=b25-hanging` |
| tunnel | 1920×1080 | H01, H02, H03 | `#b25-tunnel` | `live.html?case=b25-tunnel` |
| wordCloud | 1920×1080 | H01, H02 | `#b25-wordCloud` | `live.html?case=b25-wordCloud` |
| bounceLine | 1920×1080 | H01 | `#b25-bounceLine` | `live.html?case=b25-bounceLine` |
| elastic | 3200×1080 | H01 | `#b25-elastic` | `live.html?case=b25-elastic` |
| crossBands | 1920×1080 | H01, H02 | `#b25-crossBands` | `live.html?case=b25-crossBands` |
| stickerBomb | 3200×1080 | H01 | `#b25-stickerBomb` | `live.html?case=b25-stickerBomb` |
| neon | 1920×1080 | H01 | `#b25-neon` | `live.html?case=b25-neon` |
| keycaps | 1920×1080 | H01 | `#b25-keycaps` | `live.html?case=b25-keycaps` |
| bubbles | 1920×1080 | H01 | `#b25-bubbles` | `live.html?case=b25-bubbles` |
| slotMachine | 1920×1080 | H01 | `#b25-slotMachine` | `live.html?case=b25-slotMachine` |
| flipBoard | 1920×1080 | H01 | `#b25-flipBoard` | `live.html?case=b25-flipBoard` |
| credits | 1920×1080 | H01, H03 | `#b25-credits` | `live.html?case=b25-credits` |
| zoomRepeat | 1920×1080 | H01, H02, H03 | `#b25-zoomRepeat` | `live.html?case=b25-zoomRepeat` |
| splitHalves | 1920×1080 | H01 | `#b25-splitHalves` | `live.html?case=b25-splitHalves` |
| columnsBig | 1920×1080 | H01 | `#b25-columnsBig` | `live.html?case=b25-columnsBig` |
| dotMatrix | 1920×1080 | H01 | `#b25-dotMatrix` | `live.html?case=b25-dotMatrix` |
| depthStack | 1920×1080 | H01, H03 | `#b25-depthStack` | `live.html?case=b25-depthStack` |
| typeSpecimen | 1920×1080 | H01 | `#b25-typeSpecimen` | `live.html?case=b25-typeSpecimen` |
| kanjiFocus | 3200×1080 | H01 | `#b25-kanjiFocus` | `live.html?case=b25-kanjiFocus` |
| halfVertical | 1920×1080 | H01 | `#b25-halfVertical` | `live.html?case=b25-halfVertical` |
| curtain | 1920×1080 | H01 | `#b25-curtain` | `live.html?case=b25-curtain` |
| equalizer | 1920×1080 | H01 | `#b25-equalizer` | `live.html?case=b25-equalizer` |
| tape | 3200×1080 | H01 | `#b25-tape` | `live.html?case=b25-tape` |

H01 maps all 25 enter/hold/exit comparisons. H02 maps the approved auxiliary repetition set rain/tunnel/wordCloud/crossBands/zoomRepeat. Preserve those auxiliary paths and their full-stage presentation; do not treat them as new primary avoidance, and do not claim a hole is present: their circular gradient mask remains AVOID-018 work. The native source/core ownership mapping is independently evidenced in the historical inventory/functional test and must not be inferred merely from what is visible in one MP4.

H03 maps tunnel/credits/depthStack/zoomRepeat. On each live page choose before/after and frame 36 (1.5s), seek 90→3→36 and compare the same native frame; the native validator also rerenders keys 3/15/36/90 forward and backward. All representatives retain the existing push camera. **This single-cut, no-ghost/no-media fixture does not test long retention, ghost pass behavior or background/foreground video noninterference.** H03 is partial evidence for camera and seek only; do not mark the broader original H03 complete from these links. The runbook does not silently add untested ghost or retained-group parameters to a successful spec.

## No-render static check (already executed)

The static receipt lists every input hash and checks them unchanged at the end. It verifies exact source specs, dimensions, actual historical circle/cut text and certified rows, eight actual font byte hashes, actual fontTools cmap hashes, copied face/assignment metadata, role coverage and six historical specimen signatures. Five negative checks reject cy drift (.5 versus .42), seed drift, making a qualified wide ID 1920, fallback-family drift, and accepting the null draft build ID. It invokes only existing case/font guard functions and local file/fontTools reads; it does not call capture(), fixturePage(), launch() or any renderer.

To reproduce after integration, use a new receipt filename; the command refuses to replace a receipt. If fonts, fixture defaults or historical source record differ, investigate rather than updating expected values merely to pass. Current performance/source is not included in any final accepted identity here.

```bash
node - /workspace/lyricfx.JIZURA/dev/avoidance/layouts-b-capture.draft.json /workspace/lyricfx.JIZURA /tmp/avoid007-capture-draft-static-rerun.json <<'NODE'
'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const [draft,root,receipt]=process.argv.slice(2),read=p=>fs.readFileSync(p),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const toolPath=path.join(root,'dev/avoidance/layouts-b-review.cjs'),fixturePath=path.join(root,'dev/avoidance/layouts-b-fixture.js');
const review=require(toolPath),config=JSON.parse(read(draft)),historicalPath=path.join(root,'tasks/evidence/AVOID-007/font-functional04.json'),fontPath=path.join(root,'dev/avoidance/fixtures/b-fonts/manifest.json');
const historical=JSON.parse(read(historicalPath)),fonts=JSON.parse(read(fontPath)),wide=['elastic','stickerBomb','kanjiFocus','tape'];
const allInputs=[draft,toolPath,fixturePath,historicalPath,fontPath,...config.fonts.map(f=>f.path),...config.supportFiles.map(f=>f.path),...config.pins];
const pins=[...new Set(allInputs)].map(file=>({file,bytes:read(file).length,sha256:sha(read(file))}));
function check(c){
  assert.equal(c.buildID,null,'draft deliberately cannot pass capture build-ID guard');
  assert.equal(c.after.identity,'PENDING: performance/source freeze and parent capture approval; not an accepted candidate identity');
  assert.equal(c.before.commit,review.BASE);assert.equal(c.before.root,root);assert.equal(c.after.root,root);
  review.guardCases(c.cases);review.fontOptionsGuard(c);
  assert.equal(c.fontAuditPath,'evidence/font-functional04.json');
  assert.deepEqual(c.fixtureOptions,{fonts},'exact successful multi-face fixture options');
  assert.equal(c.fonts.length,8);assert.equal(new Set(c.fonts.map(f=>sha(read(f.path)))).size,8);
  for(const face of fonts.faces){
    const asset=c.fonts.find(f=>f.name===face.file);assert.ok(asset);
    assert.equal(face.url,'fonts/'+asset.name);assert.equal(sha(read(asset.path)),face.sourceSHA256);
    assert.equal(sha(Buffer.from(JSON.stringify(face.codepoints))),face.cmapSHA256);
  }
  for(const row of historical.rows){
    const sample=c.cases.find(x=>x.conditions.layout===row.layout);assert.ok(sample);
    const {seed,...original}=sample.conditions;assert.equal(seed,704);assert.deepEqual(original,row.spec,'recorded spec unchanged apart from explicit existing seed default');
    assert.deepEqual(row.stage,[row.spec.W,row.spec.H]);assert.equal(row.cutText,row.spec.text);
    assert.deepEqual(row.actualCircle.center,{x:.5,y:.42});assert.equal(row.actualCircle.radius,.2);
    assert.equal(row.safety,'certified-bounded-adapter');assert.equal(sample.conditions.W,wide.includes(row.layout)?3200:1920);
    assert.equal(sample.conditions.H,1080);assert.ok(sample.hids.includes('AVOID-007-H01'));
    assert.deepEqual(row.fontAudit.assignments,fonts.assignments);assert.equal(row.fontAudit.faces.length,8);
    for(const face of row.fontAudit.faces){assert.equal(face.status,'loaded');assert.equal(face.sha256,fonts.faces.find(f=>f.id===face.id).sourceSHA256);}
    for(const value of Object.values(sample.focus))assert.ok(value.length>10);
    for(const value of Object.values(sample.intent))assert.ok(value.length>10);
    for(const value of Object.values(sample.preserve))assert.ok(value.length>10);
  }
  assert.equal(c.cases.filter(x=>x.conditions.W===1920).length,21);
  assert.equal(c.cases.filter(x=>x.conditions.W===3200).length,4);
  for(const layout of ['rain','tunnel','wordCloud','crossBands','zoomRepeat'])assert.ok(c.cases.find(x=>x.conditions.layout===layout).hids.includes('AVOID-007-H02'));
  for(const layout of ['tunnel','credits','depthStack','zoomRepeat'])assert.ok(c.cases.find(x=>x.conditions.layout===layout).hids.includes('AVOID-007-H03'));
}
check(config);
assert.ok(read(fixturePath).toString().includes('project.seed=spec.seed??704'),'fixture seed default remains the successful default');
assert.ok(read(fixturePath).toString().includes("cam:spec.camera||'push'"),'same default push camera');
assert.ok(read(fixturePath).toString().includes('ghost:spec.ghost?.6:0'),'same absent-ghost default');
assert.equal(historical.signatures.length,6);assert.equal(new Set(historical.signatures.map(s=>s.rgbaSHA256)).size,6);assert.ok(historical.signatures.every(s=>s.loaded));
assert.deepEqual(historical.warnings,[]);
for(const glyph of historical.coverage)assert.ok(fonts.faces.find(f=>f.id===glyph.face).codepoints.includes(glyph.cp),'historical emitted-glyph coverage');
const cmap=JSON.parse(cp.execFileSync('python3',['-c',`import json,sys,hashlib
from fontTools.ttLib import TTFont
rows=[]
for face in json.load(open(sys.argv[2]))['faces']:
 f=TTFont(sys.argv[1]+'/'+face['file']);points=sorted(f.getBestCmap());f.close()
 rows.append({'id':face['id'],'cmapSHA256':hashlib.sha256(json.dumps(points,separators=(',',':')).encode()).hexdigest()})
print(json.dumps(rows))`,path.dirname(fontPath),fontPath],{encoding:'utf8',maxBuffer:1024*1024,timeout:15000}));
for(const face of cmap)assert.equal(face.cmapSHA256,fonts.faces.find(f=>f.id===face.id).cmapSHA256,'actual font cmap matches recorded manifest');
let negatives=0;
for(const mutate of [c=>c.cases[0].conditions.cy=.5,c=>c.cases[0].conditions.seed=705,c=>c.cases[5].conditions.W=1920,c=>c.fixtureOptions.fonts.fallbackFamily='wrong']){
 const changed=structuredClone(config);mutate(changed);assert.throws(()=>check(changed));negatives++;
}
assert.throws(()=>assert.match(config.buildID,/^[a-zA-Z0-9_-]+$/));negatives++;
for(const pin of pins)assert.equal(sha(read(pin.file)),pin.sha256,'static input unchanged during check');
const result={schema:'avoid007-capture-draft-static-v1',status:'draft-inputs-checked-source-freeze-pending',captureReady:false,
 performed:{staticOnly:true,browserLaunched:false,framesRendered:0,mp4Generated:0,remoteRequests:0,publication:false},
 cases:25,stages:{'1920x1080':21,'3200x1080':4},circle:{cx:.5,cy:.42,radius:.2},explicitExistingSeed:704,
 fonts:8,actualCmapsChecked:cmap.length,historicalGlyphCoverageEntries:historical.coverage.length,historicalDistinctSpecimenSignatures:6,
 negativeChecks:negatives,endInputsUnchanged:true,sourceIdentity:'PENDING — current perf/source is not frozen or accepted',
 historicalScope:historical.scope,links:config.cases.map(c=>({id:c.id,compare:'#'+c.id,live:'live.html?case='+c.id,hids:c.hids})),
 pins:pins.map(p=>({...p,file:p.file.startsWith(root+'/')?p.file.slice(root.length+1):path.basename(p.file)}))};
assert.ok(!fs.existsSync(receipt),'fresh static receipt');fs.writeFileSync(receipt,JSON.stringify(result,null,2)+'\n');
process.stdout.write(JSON.stringify({status:result.status,captureReady:false,cases:25,stages:result.stages,fonts:8,actualCmapsChecked:8,negativeChecks:negatives,endInputsUnchanged:true,receiptSHA256:sha(read(receipt))})+'\n');
NODE
```

## Finalization and actual execution (not executed; parent approval required)

1. Wait for the main owner's performance fix and the parent's code/result review. Confirm required functional, interval/raster/runtime and performance gates on the exact candidate. Review whether partial H03 needs separate qualified retention/ghost/media cases; do not change this 25-case spec and relabel it as the old successful input. Confirm before multiface startup and t=0 candidate observations through a separately approved small real-fixture qualification before an expensive full run; the historical font-functional04 run sampled frames 1,9,…,89 and did not prove every captured frame or the final baseline multiface path.
2. Build/synchronize product JA/EN from the candidate and freeze all source/fixture/font/tool bytes. Record actual hashes and source provenance. The current Git HEAD alone is insufficient: it is still e96 with uncommitted candidate code. The approved capture stores exact dirty candidate source-content hashes, so a self-referential commit/capture loop is unnecessary. A change to any frozen input requires a fresh build and review.
3. Create a separate final JSON from the draft. Set a genuinely unused immutable buildID, replace the PENDING identity with the actual frozen candidate source/JAEN identification, and replace the first draft-only limitation with an accurate approved capture-stage statement. Preserve the remaining limits. Pin the final JSON itself, this runbook, the static receipt and any accepted final functional/performance records through config.pins. Do not edit historical evidence or use arbitrary placeholder hashes as successful source identity. Assert buildID and identity have no PENDING marker before invoking capture. Keep the tracked draft blocked so it cannot accidentally become the executed config.
4. Confirm disk space for 50 MP4s, 200 key PNGs, source/audit snapshots and working overhead; this preparation does not estimate actual encoder sizes as fact. Use a fresh output directory, encode sequentially with the approved one-thread encoder, and avoid simultaneous performance benchmarks. Do not delete old public artifacts for capacity. Capture uses the current approved tool and real local fonts; do not substitute HTML recording, PNG slide files, an old video or a reduced/cropped stage.
5. After explicit parent authorization, run the commands below with real final paths. The values enclosed in angle brackets are instructions to fill, not an already existing build or successful output. First command acquires all 25 native before/after pairs. The later commands check the same bytes; none was run during this preparation.

```text
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-review.cjs capture <final-config.json> <fresh-native-bundle-directory>
node dev/avoidance/layouts-b-review.cjs validate-files <native-bundle-directory>
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-review.cjs validate-browser <native-bundle-directory>
```

Expected acquisition: 50 original-stage H264 MP4s, 96 frames / 24fps / 4s each; 200 original key PNGs (3/15/36/90), exact decoded-PNG/native-RGBA equality for those keys, and all 4,800 native PNG/RGBA hashes. The tool requires actual stage/circle/main text against source spec on both sides and nonempty certified units/segments for after. Unsupported/excluded/conflict/empty observation and unknown safe-hold/skip schemas fail closed. If a legitimate t=0 exterior skip or new certificate appears, stop for a reviewed tool/API extension rather than fabricating an observation. No MP4 lossy pixel equality is claimed: RGB MAE/PSNR are separate codec measurements.

The browser validator checks all raw assets, 96-frame metadata, JA/EN desktop/mobile controls, actual images, visible decoded seek/playback (at least 92 decoded, ended≈4, drop0/corrupt0), live fixture and forward/reverse native key parity. Store returned manifest self-hash in an external receipt. Numeric safety/source coverage/performance evidence is separate from visual comparison and remains required.

6. Have the parent review the exact acquired candidate and comparison behavior, then obtain a real private Sites URL through the existing hosting workflow. Preserve owner-private audience, `.openai/hosting.json` and old immutable deep URLs. The root hub links into a stable `review/AVOID-007/<native-build>/` subdirectory. Only after that real URL exists and remote raw asset/native checks pass should the small Pages bridge be generated with the approved bridge tool and original native manifest bytes. Remote authorization hooks stay in memory; never place tokens, query credentials or userinfo in config/manifest/logs. Public/private authorization and hosting actions remain parent-owned.
7. Run the unchanged full Pages/Jekyll old-byte/old-URL/1GB audit with the new bridge selected, then product JA/EN and public bridge checks. Keep the large native media on the permitted Sites destination. Do not replace the audit, weaken legacy preservation, or declare publication from synthetic tests. Human/visual reviewer acceptance and final H-item status remain the parent's responsibility.

## Self-review and status boundary

This owner reviewed all 25 IDs/dimension splits, exact row.spec retention plus the semantically identical explicit seed, real 8-face schema/fallback/provenance, support-file closure, historical/current evidence distinction, H02 primary/auxiliary boundary, partial H03, pending-identity launch block and the existing tool's actual-condition guards. No new tool change is required for this draft. Only the draft, runbook and static receipt are changed in the isolated worktree; no shared product/fixture/tool or historical report is modified. The final source, 25-pair capture, browser/visual/performance qualification and publication are pending, not passed by this static result.

## Executed static receipt

No-render command execution succeeded on 2026-10-22. Log: `/tmp/avoid007-capture-draft-static01.log`. The sandbox's Node-to-Python subprocess wait first stalled/failed with EPERM; the same local-only check was rerun outside that restriction and completed. No browser, rendering, media encoding, network or publication was introduced. The Python subprocess is bounded to 15 seconds and reads the existing font manifest directly from disk.

Result: 25 exact representative specs; 21 at 1920×1080 and 4 at 3200×1080; 8 distinct raw font assets and 8 actual fontTools cmap hashes; 526 historical emitted-glyph records; 6 historical distinct specimen signatures; 5 rejected counterexamples; all 21 pinned input files unchanged. `captureReady:false` and `sourceIdentity:PENDING` remain explicit.

Draft JSON SHA-256 at static01 (before the caption-only follow-up): `bd78d316a65d14352a9088b079d8c6cbe0b3cb6cabd03f751b26e32360de5750`. Static receipt SHA-256: `3bc997fabfffb402e2087c13b6fb27d0a6d5334bdd5549b8856ec09efe0a3104`. The receipt pins the current approved review tool, observed shared fixture, historical report, original font manifest/assets/licenses and supporting test/builder/oracle. It does not identify the still-changing product implementation as a frozen capture candidate.

## Caption-only disclosure follow-up (no browser/performance execution)

The parent requested explicit visible-change disclosure after reading the draft. Neon ON replaces raw native blur with finite measured stroke layers. The revised neon focus/intent/preserve captions state that finite layers preserve glow intent, primary copies and frame roles; they do not claim native blur shape, brightness distribution or RGBA identity. This is an authorized ON reconstruction, not a statement that original blur is unchanged. Before/OFF remains original.

Rain delivery leads, depthStack copies, kanjiFocus giant and keycaps/bubbles glyph entry have ON-only fixed fontCSS plus native continuous uniform scaling. Their effective size, position, rank/copy, clock and physical stroke remain native, while hinting/antialiasing can differ. Each of those five captions names its affected scope; a global limitation states the full set and the OFF/ON difference. Visual review should assess those declared differences rather than expecting pixel parity with variable-CSS native text.

`capture-draft-caption01.json` records the before/after raw draft hashes and a local JSON structural comparison. All 25 condition objects, fixture/font options, eight font references, support files, blocked build ID and pending candidate identity are unchanged. Only the six affected bilingual caption groups and two added limitations changed. The prior static01 receipt remains historical evidence for its original draft bytes; no full static/browser check is relabeled as executed on these revised bytes. No browser, fontTools, renderer, encoding, remote call or benchmark was run for this wording-only comparison, preserving the parent's dedicated performance run. The complete check in this runbook remains available for the final integrated source freeze.

## Plain display wording follow-up

The subsequent caption-only update keeps the technical scope in the preceding section and in caption01 evidence, while shortening the text shown to reviewers. Neon now asks reviewers to watch letters/frame/glow and notes the difference in light spread. The five continuous-size cases explain only that scaling text may have different edge smoothness while size and timing are retained. The short preamble covers pending capture, deferred auxiliary fading, the camera/seek sample boundary and these visible differences. Implementation terms, historical font URLs and source-identification details are no longer listed in display limitations; the full technical information remains in this runbook and fixed evidence.

`capture-draft-caption02.json` records an incremental comparison from commit 4713d60. Removing only the display caption fields and limitations makes the before/after configuration objects exactly equal: all conditions, fonts, options, pins, APIs and gates are unchanged. No browser, benchmark, renderer, fontTools or network process ran for this plain-wording change. The capture draft remains blocked and its final source identity remains pending. Apply this patch after 4713; the earlier root integration contained febf703 and 3bd345 only.

## Final scaling-caption precision

The final plain captions for rain/depthStack/kanjiFocus/keycaps/bubbles preserve **the scaling motion and its timing**, not an absolute baseline text size. They also briefly state that text size may be adjusted to fit around the circle. The fixed-CSS reconstruction preserves the effective-size curve of the **selected recipe**; that recipe may already use its declared fontScale below 1. Placement translation, reflow and permitted size adjustment are intentional candidate strategies. Neither these captions nor the reconstruction claim promise identical absolute sizes or stage positions to the original before image. The earlier technical statements about preserving effective size are read within this selected-recipe conversion scope, not as an absolute before/after equality guarantee.

`capture-draft-caption03.json` records the incremental change from 2dc999. Only those five JA/EN preserve captions changed; all other configuration fields and all other case captions compare exactly equal. No rendering, browser, performance, fontTools or remote work was executed. The configuration remains a blocked draft with pending source identity.
