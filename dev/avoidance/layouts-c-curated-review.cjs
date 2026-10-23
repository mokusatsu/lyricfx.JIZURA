'use strict';
// Byte-only curation of immutable local media. Never starts a browser/server,
// contacts a public URL, renders frames, encodes video, or mutates source evidence.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const runFile = require('node:util').promisify(execFile);
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'review/AVOID-008/local-20261023-01');
const evidence = path.join(root, 'tasks/evidence/AVOID-008');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const json = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const preparationStatus = { code: 'final-source-bound-human-review-pending-prepublication', label: '最終版に対応する4例・動作確認待ち', sourceGate: 'fdb7916329232885089119ba5023cca9aafc3d02' };
const specs = [
  {
    id: 'swiss', title: 'Swiss — 左の縦長ストリップ',
    repoRelative: 'tasks/evidence/AVOID-008/editorial/swiss-preview01',
    fallback: '/workspace/avoid008-editorial/tasks/evidence/AVOID-008/editorial/swiss-preview01',
    manifest: '9acec46fe34d3934019e1af77333f7e84bd269b49fa0d48af805709216bfc6e1',
    commit: 'c9e22a8', commitExact: false,
    caveat: 'Swiss media is the reviewed c9 checkpoint; generated HTML/shared09g differs from checked-in Git source. Parent-reviewed96-native-frame/clock carry connects this fixed representative to main. This is limited same-condition rendering correspondence, not whole-source or whole-version identity.',
    refs: ['parent-swissC9-main01.json', 'swiss-visual01-review.md', 'swiss-visual01-metadata.json', 'swissC9-main01/carry01.json'],
    carryRefs: ['swissC9-main01/carry01.json'],
    check: '左の細い縦ストリップでも、格子・欄番号・見出し・円の関係に組版らしさが残るか確認してください。'
  },
  {
    id: 'proofread', title: '校正 — 対象から注記への線',
    repoRelative: 'tasks/evidence/AVOID-008/editorial/proofread-preview02',
    fallback: '/workspace/avoid008-editorial/tasks/evidence/AVOID-008/editorial/proofread-preview02',
    manifest: '0fa1a1016d687ed4fa8f5a421cfb3bce3021cca93e6539fecdc50044fd67a4a9',
    commit: '4d72d23', commitExact: true,
    caveat: 'Fixed preview02 representative has parent-approved192-native-frame/clock and historical encoder/key carry on main. Limited visual02 remains one fixture; no whole-source or whole-version identity claim.',
    refs: ['parent-proofread09-review.json', 'proofread-visual02-review.md', 'proofread-visual02-metadata.json', 'parent-proofread4d72-main01.json'],
    carryRefs: ['proofread4d72-main01/carry01.json'],
    check: '大きな括弧状の線でも対象→「太字」を追え、灰色トンボとの交差を含む構図を許容できるか確認してください。'
  },
  {
    id: 'letter', title: '便箋 — 紙全体と二行の本文',
    repoRelative: 'tasks/evidence/AVOID-008/objects/writing-preview05',
    fallback: '/workspace/avoid008-objects/tasks/evidence/AVOID-008/objects/writing-preview05',
    manifest: '2213fd7d177a361d3b26662dd00676308414ffd39c7887f5d083610f95c53f53',
    commit: 'c86146d80e356c79adcbe099b8184a968627d572', commitExact: true,
    caveat: 'Original startup.implementation retains historical257 label; parent ties actual09i/11p pins to fixedc861. The original manifest remains unchanged. One portrait fixture only; parent-approved conditional native-frame/clock carry through paper-carry02 and exact paper geometry/source scope connects it to corrected main. The paper-carry02 is not a fresh384-frame capture or whole-source identity claim.',
    refs: ['parent-writingc861-review.json', 'writing-visual05-review.md', 'writing-visual05-metadata.json', 'parent-writingC861-main02.json'],
    carryRefs: ['writingC861-main01/paper-carry02.json', 'writingC861-main01/carry01.json'],
    check: '小さくなった紙全体に便箋らしさがあり、二重ヘッダー・本文罫線・主文4字・No署名を追えるか確認してください。'
  },
  {
    id: 'poster', title: 'ポスター — 右寄せの二行構図',
    repoRelative: 'tasks/evidence/AVOID-008/editorial/poster-preview01',
    fallback: '/workspace/avoid008-editorial/tasks/evidence/AVOID-008/editorial/poster-preview01',
    manifest: '696272d2965718df78c7b9b4ef02630e0e1a574b3035ad78a60c6c07191f29d1',
    commit: '4d0a25d', commitExact: true,
    caveat: 'Fixed poster-preview01 only; parent source/raw review plus independent192decoded/6native limited visual01. White の over yellow dot has locally low contrast, especially at reduced display size. Right-handbill composition leaves a large blank left field and reduces main text to .7 size. Parent-approved192-native-frame/clock carry connects this representative to main; no whole-source or whole-version identity claim.',
    refs: ['parent-poster04-review.json', 'poster-visual01-review.md', 'poster-visual01-metadata.json', 'parent-poster4d0-main01.json'],
    carryRefs: ['poster4d0-main01/carry02.json'],
    check: '二行・右寄せの構図にポスターらしさが残り、黄色のdotに重なる白い「の」の読みやすさを許容できるか確認してください（この重なりはコントラストが低く、縮小表示で弱く見えます）。'
  }
];
for (const def of specs) {
  def.refs.push('integration-owned-final01/' + def.id + '-binding.json');
  def.carryRefs.push('integration-owned-final01/' + def.id + '-carry.json');
  if (def.id === 'swiss') def.carryRefs.push('integration-owned-final01/swiss-before-carry.json');
}
function selectedFiles(m) {
  const selected = new Map();
  const record = m.records?.[0];
  if (record) {
    for (const a of record.assets) selected.set(a.file, a);
    for (const side of ['before', 'after']) for (const p of record.sides[side].planSnapshots) {
      selected.set(p.file, { sha256: p.gzipSHA256, restoredSHA256: p.sha256, restoredBytes: p.bytes });
    }
  } else {
    for (const side of ['before', 'after']) {
      const names = [m.sides[side].video, m.sides[side].actualInputs, `${side}-frames.json.gz`, ...m.sides[side].keys.map(k => k.file)];
      for (const file of names) {
        assert(m.assets[file], `Selected asset has no immutable pin: ${file}`);
        selected.set(file, m.assets[file]);
      }
    }
  }
  return selected;
}
function chooseSource(def) {
  const preferred = path.join(root, def.repoRelative);
  const attempts = [];
  for (const dir of [preferred, def.fallback]) {
    try {
      const bytes = fs.readFileSync(path.join(dir, 'manifest.json'));
      assert.equal(sha(bytes), def.manifest, 'immutable manifest hash');
      const m = JSON.parse(bytes), selected = selectedFiles(m);
      for (const [file, pin] of selected) {
        const b = fs.readFileSync(path.join(dir, file));
        assert.equal(sha(b), pin.sha256, `selected asset hash: ${file}`);
        if (pin.bytes !== undefined) assert.equal(b.length, pin.bytes, file);
        if (pin.restoredSHA256) {
          const raw = zlib.gunzipSync(b);
          assert.equal(sha(raw), pin.restoredSHA256, file);
          assert.equal(raw.length, pin.restoredBytes, file);
        }
      }
      return { dir, m, selected, selection: {
        preferredRepositoryDirectory: preferred,
        selectedDirectory: dir,
        usedChildWorktreeFallback: dir !== preferred,
        manifestSHA256: def.manifest,
        checkedSelectedAssets: selected.size,
        rejectedCandidates: attempts,
        policy: 'Repository first if immutable manifest and every selected media/plan pin match. Unselected engine/font/runner/old HTML are not required. Child worktree is temporary fallback only.'
      }};
    } catch (error) {
      attempts.push({ directory: dir, reason: error.code || error.message.split('\n')[0] });
    }
  }
  throw new Error(`No complete pinned selected source for ${def.id}: ${JSON.stringify(attempts)}`);
}
async function videoProbe(file, stage, fps, frames) {
  const p = JSON.parse((await runFile('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8' })).stdout);
  assert.equal(p.streams.length, 1);
  const s = p.streams[0];
  assert.equal(s.codec_name, 'h264'); assert.equal(s.pix_fmt, 'yuv420p');
  assert.equal(s.width, stage[0]); assert.equal(s.height, stage[1]);
  assert.equal(s.avg_frame_rate, `${fps}/1`); assert.equal(Number(s.nb_frames), frames);
  assert.equal(Number(s.duration), frames / fps);
  return p;
}
function pngDimensions(file, stage) {
  const b = fs.readFileSync(file);
  assert.equal(b.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const dims = [b.readUInt32BE(16), b.readUInt32BE(20)];
  assert.deepEqual(dims, stage); return dims;
}
async function main() {
fs.mkdirSync(out, { recursive: true });
const manifest = {
  version: 1, task: 'AVOID-008', build: 'local-20261023-01', status: preparationStatus.code, preparationStatus,
  sourceFixed: true, publicResultVerification: 'Permanently excluded by user instruction; no public requests made.',
  visualInspectionByGenerator: false, browserStarted: false, videoDecodedOrReencoded: false,
  frameHashSemantics: 'Editorial frame logs hash encoder-input PNG bytes, not decoded lossy H264 frames. Letter frameHashes are direct native Canvas PNG hashes; decoded frames are a separate historical visual-review artifact.',
  originalManifestSubset: 'Original manifests are copied unchanged; only selected review media/plan evidence are bundled. Original runner/HTML/engine/font assets remain in repository evidence and are not regenerated here.',
  claims: `${specs.length} fixed historical media candidates only. Independent visual findings stay limited to their original fixture. Human aesthetic/motion judgment pending. No C34 completion claim.`,
  cases: [], assets: []
};
for (const config of specs) {
  const chosen = chooseSource(config);
  assert.equal(chosen.selection.usedChildWorktreeFallback, false, 'All accepted main-carry media must now be repository local');
  const def = { ...config, dir: chosen.dir };
  const m = chosen.m;
  if (def.id === 'swiss') {
    const carry = json(path.join(evidence, 'swissC9-main01/carry01.json'));
    const row = carry.rows.find(r => r.folder === 'swiss-preview01');
    assert(carry.passed && row);
    assert.equal(row.manifestSHA256, def.manifest);
    assert.deepEqual(row.spec, m.actualFixtureSpec);
    assert.equal(carry.oldCompiledSHA256, m.compiled.after);
    assert.deepEqual(row.mismatches, []);
    assert.deepEqual(row.before.frames, row.after.frames);
    assert.equal(row.before.frames.length, 96);
    assert(row.before.sourceUnchanged && row.after.sourceUnchanged);
  }
  const record = m.records?.[0], capture = m.capture;
  const c = {
    id: def.id, title: def.title, confirmation: def.check,
    sourceCommit: def.commit, sourceCommitExactClaim: def.commitExact, sourceCaveat: def.caveat,
    sourceSelection: chosen.selection,
    originalDirectory: def.dir, originalManifest: `${def.id}/original/manifest.json`, originalManifestSHA256: def.manifest,
    spec: record?.spec || m.actualFixtureSpec,
    fps: record?.fps || capture.fps, frames: record?.frames || capture.frames,
    frameDPR: record?.DPR ?? 1,
    DPRBasis: record ? 'Original record.DPR=1' : 'Canvas intrinsic native-stage PNG dimensions verified; fixture renderer scale1, no CSS/viewport capture. Browser deviceScaleFactor was not explicitly pinned in original runner.',
    nativeStage: record ? [record.spec.W, record.spec.H] : capture.nativeStage,
    videoStage: record ? [record.spec.W, record.spec.H] : capture.video,
    sourceIdentity: record ? m.startup : { compiled: m.compiled, inputPins: m.inputPins },
    sides: {}, parentAndIndependentEvidence: [], mainCarry: []
  };
  // Copy only review media and exact plan inputs; engines and old HTML stay in repository evidence.
  const selected = new Set(['manifest.json', ...chosen.selected.keys()]);
  for (const rel of selected) {
    const bytes = fs.readFileSync(path.join(def.dir, rel)), file = `${def.id}/original/${rel}`;
    fs.mkdirSync(path.dirname(path.join(out, file)), {recursive:true});
    fs.writeFileSync(path.join(out, file), bytes);
    assert.equal(sha(fs.readFileSync(path.join(out, file))), sha(bytes));
    manifest.assets.push({file, bytes:bytes.length, sha256:sha(bytes)});
  }
  for (const ref of def.refs) {
    const p = path.join(evidence, ref), bytes = fs.readFileSync(p), file = `${def.id}/evidence/${path.basename(ref)}`;
    fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
    fs.writeFileSync(path.join(out, file), bytes);
    const pin = { file, bytes: bytes.length, sha256: sha(bytes) };
    manifest.assets.push(pin); c.parentAndIndependentEvidence.push(pin);
  }
  // Keep large carry raw in repository; bundle its exact identity and bounded summary only.
  for (const ref of def.carryRefs) {
    const raw = fs.readFileSync(path.join(evidence, ref)), carry = JSON.parse(raw);
    assert.equal(carry.passed, true, ref);
    if (carry.changed) assert.deepEqual(carry.changed, [], ref);
    if (carry.manifestSHA256) assert.equal(carry.manifestSHA256, def.manifest, ref);
    let rows = carry.rows || [];
    if (def.id === 'letter' && rows.length) rows = rows.filter(r => r.manifestSHA256 === def.manifest);
    for (const row of rows) {
      assert.deepEqual(row.mismatches, [], ref);
      if (row.originalMismatch) assert.deepEqual(row.originalMismatch, [], ref);
      const a = row.old || row.before, b = row.current || row.after;
      assert.equal(a.frames.length, 96, ref); assert.deepEqual(a.frames, b.frames, ref);
      if (a.observations) assert.deepEqual(a.observations, b.observations, ref);
      if (row.original96EncoderHashesExact !== undefined) assert.equal(row.original96EncoderHashesExact, true);
      if (row.original3NativeKeysExact !== undefined) assert.equal(row.original3NativeKeysExact, true);
      if (row.originalNativeEncoderHashesExact !== undefined) assert.equal(row.originalNativeEncoderHashesExact, true);
    }
    if (carry.oldCarry) {
      const original = fs.readFileSync(path.join(root, carry.oldCarry.path));
      assert.equal(sha(original), carry.oldCarry.sha256);
      assert.equal(carry.freshFullGeometry.allPaperExactCandidate01, true);
      for (const pin of [carry.freshFullGeometry, carry.sourceScope]) {
        assert.equal(sha(fs.readFileSync(path.join(root, pin.path))), pin.sha256);
      }
    }
    const summary = {
      repositoryPath: `tasks/evidence/AVOID-008/${ref}`, bytes: raw.length, sha256: sha(raw),
      scope: carry.scope, passed: true, selectedFixtureManifestSHA256: def.manifest,
      selectedRows: rows.map(r => ({ mode: r.mode || 'adapted', frames: 96, exactNativeFrameAndObservationClockCarry: true, originalEncoderHashesExact: r.original96EncoderHashesExact ?? r.originalNativeEncoderHashesExact ?? null, nativeKeysExact: r.original3NativeKeysExact ?? null })),
      conditionalCarry: carry.oldCarry ? { oldCarry: carry.oldCarry, freshFullGeometry: carry.freshFullGeometry, sourceScope: carry.sourceScope, noFresh384FrameRecapture: true } : undefined,
      limit: 'Only this fixed same-condition representative and accepted source-scope/clock correspondence. Not full main-source identity, C34 completion, realtime visual approval, or a new image inspection.'
    };
    c.mainCarry.push(summary);
  }
  const carryFile = `${def.id}/evidence/main-carry-summary.json`;
  const carryBytes = Buffer.from(JSON.stringify({ sourceGate: preparationStatus.sourceGate, carries: c.mainCarry }, null, 2) + '\n');
  fs.writeFileSync(path.join(out, carryFile), carryBytes);
  const carryPin = { file: carryFile, bytes: carryBytes.length, sha256: sha(carryBytes) };
  manifest.assets.push(carryPin); c.parentAndIndependentEvidence.push(carryPin);
  for (const side of ['before', 'after']) {
    let video, keys, identities;
    if (record) {
      const assets = record.assets.filter(a => a.side === side);
      video = assets.find(a => a.file.endsWith('.mp4')).file;
      keys = assets.filter(a => a.file.endsWith('.png')).map(a => ({ file: a.file, frame: a.frame, time: a.time }));
      identities = record.sides[side].planSnapshots.map(pin => {
        const gz = fs.readFileSync(path.join(def.dir, pin.file));
        assert.equal(sha(gz), pin.gzipSHA256);
        const bytes = zlib.gunzipSync(gz); assert.equal(sha(bytes), pin.sha256); assert.equal(bytes.length, pin.bytes);
        return { ...pin, parsedIdentitySHA256: sha(Buffer.from(JSON.stringify(JSON.parse(bytes)))) };
      });
    } else {
      video = m.sides[side].video; keys = m.sides[side].keys;
      const input = json(path.join(def.dir, m.sides[side].actualInputs));
      identities = Object.entries(input).map(([kind, value]) => ({ kind, actualInputs: m.sides[side].actualInputs, parsedIdentitySHA256: sha(Buffer.from(JSON.stringify(value))) }));
    }
    assert.equal(keys.length, 3);
    c.sides[side] = {
      video: `${def.id}/original/${video}`,
      probe: await videoProbe(path.join(def.dir, video), c.videoStage, c.fps, c.frames),
      keys: keys.map(k => ({ ...k, file: `${def.id}/original/${k.file}`, dimensions: pngDimensions(path.join(def.dir, k.file), c.nativeStage) })),
      planIdentities: identities
    };
  }
  assert.equal(c.sides.before.planIdentities.find(x => x.kind === 'sourcePlan').parsedIdentitySHA256, c.sides.after.planIdentities.find(x => x.kind === 'sourcePlan').parsedIdentitySHA256);
  manifest.cases.push(c);
}
function section(c) {
  const { W, H, cx, cy, radius } = c.spec;
  const geometry = { W, H, cx: W * cx, cy: H * cy, r: Math.min(W, H) * radius };
  assert.deepEqual([W, H], c.nativeStage);
  assert.equal(c.videoStage[0] / c.videoStage[1], W / H);
  c.circleGuide = { ...geometry, visibleByDefault: true, bakedIntoMedia: false, maxDisplayHeight: 680, maxDisplayWidth: 680 * W / H };
  const stage = content => `<div class="stage-media" style="--stage-aspect:${W} / ${H};--stage-width:${680 * W / H}px" data-stage-width="${W}" data-stage-height="${H}">${content}<svg class="circle-guide" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false" pointer-events="none"><circle cx="${geometry.cx}" cy="${geometry.cy}" r="${geometry.r}" /></svg></div>`;
  const pair = fn => `<div class="pair">${['before','after'].map(side => `<figure><figcaption>${side === 'before' ? '変更前：元の描画' : '変更後：回避ON・全主文字保持'}</figcaption>${fn(c.sides[side], side)}</figure>`).join('\n')}</div>`;
  return `<section id="${c.id}">
  <h2>${esc(c.title)}</h2>
  <p class="check">${esc(c.confirmation)}</p>
  <p>同条件：主文「${esc(c.spec.text)}」／${c.nativeStage.join('×')}／円中心：左から${c.spec.cx * 100}%・上から${c.spec.cy * 100}%／半径：短辺の${c.spec.radius * 100}%／${c.frames / c.fps}秒・${c.fps}fps。</p>
  <p>左右の標準コントロールで再生・シークできます。</p>
  ${pair((s, side) => stage(`<video data-side="${side}" controls preload="metadata" playsinline width="${c.videoStage[0]}" height="${c.videoStage[1]}"><source src="${s.video}" type="video/mp4"></video>`))}
  <div class="actions"><button type="button" data-action="play">両方を先頭から再生</button> <button type="button" data-action="pause">両方を一時停止</button> <button type="button" data-action="align">右を左の時刻へ合わせる</button> <span role="status" class="status"></span></div>
  <details><summary>原寸PNG：出現・保持・退出の3時刻を左右で比較</summary>
  ${c.sides.before.keys.map((k,i) => `<h3>${k.time.toFixed(3)}秒（frame ${k.frame}）</h3>${pair(s => stage(`<a href="${s.keys[i].file}"><img loading="lazy" src="${s.keys[i].file}" width="${c.nativeStage[0]}" height="${c.nativeStage[1]}" alt="${esc(c.title)} frame ${k.frame} 原寸PNG"></a>`))}`).join('\n')}
  <p>PNGは静止した原寸参照です。動作は上のMP4で確認してください。</p></details>
  <details><summary>固定版・検査根拠・確認範囲</summary>
  <p>動画の元候補版 ${esc(c.sourceCommit)}。最終実装版 ${esc(preparationStatus.sourceGate)} との同条件描画対応を別途記録しています。${esc(c.sourceCaveat)}</p>
  <p>seed ${c.spec.seed ?? 704}／font ${esc(c.spec.params.font)}／params <code>${esc(JSON.stringify(c.spec.params))}</code>。動画 ${c.videoStage.join('×')}（H.264）。</p>
  <p>独立担当の限定視覚判定を参照しています。このページの生成担当・親は画像を実見していません。実時間の速度感と構図の好みは未確認です。全字体・全variant・全34レイアウトの承認を意味しません。</p>
  <p>代替transport字体を使用。Swissと校正の動画は480×270、原寸の細部は960×540のPNGを参照してください。円は設定条件であり、動画内の円形装飾とは別です。</p>
  <p>原manifest SHA256：<code>${c.originalManifestSHA256}</code>。<a href="${c.originalManifest}">元manifest</a>。</p>
  <ul>${c.parentAndIndependentEvidence.map(p => `<li><a href="${p.file}">${esc(path.basename(p.file))}</a> — <code>${p.sha256}</code></li>`).join('\n')}</ul>
  </details>
</section>`;
}
const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AVOID-008 — 構図変更${manifest.cases.length}例のローカル比較候補</title>
<style>
  :root { color-scheme: light; font-family: system-ui, sans-serif; background: #f4f3ef; color: #20252a; }
  body { max-width: 1300px; margin: auto; padding: 24px; line-height: 1.7; }
  h1 { font-size: 1.7rem; } h2 { font-size: 1.4rem; }
  section { background: white; border: 1px solid #b8bdc1; border-radius: 10px; padding: 22px; margin: 28px 0; }
  .check { font-weight: 650; padding: 12px; background: #edf4f4; }
  .pair { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px; }
  figure { min-width: 0; margin: 0; } figcaption { font-weight: 650; margin: 8px 0; }
  .stage-media { position: relative; width: min(100%, var(--stage-width)); aspect-ratio: var(--stage-aspect); margin-inline: auto; background: #151923; }
  .stage-media > video, .stage-media > a { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
  .stage-media img { display: block; width: 100%; height: 100%; }
  .circle-guide { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .circle-guide circle { fill: rgba(255, 95, 105, .06); stroke: #ff5f69; stroke-width: 2; stroke-dasharray: 7 5; vector-effect: non-scaling-stroke; }
  .guides-hidden .circle-guide { display: none; }
  button { font: inherit; padding: 6px 12px; margin: 6px 0; cursor: pointer; }
  details { border-top: 1px solid #d8dadd; padding-top: 12px; margin-top: 18px; }
  summary { cursor: pointer; font-weight: 600; } code { overflow-wrap: anywhere; }
  nav a { margin-right: 22px; } .status { display: block; }
  @media(max-width: 620px) { body { padding: 12px; } section { padding: 12px; } .pair { gap: 8px; } }
</style>
</head>
<body>
<h1>AVOID-008：構図変更${manifest.cases.length}例の比較候補</h1>
<p>同じ主文・円条件・時刻で、変更前と回避ONを比べます。変更後も全主文字「風の先へ」を保持しています。</p>
<p>${esc(preparationStatus.label)}。4つの構図について、変更前後の動画を見比べてください。見え方・読みやすさの判断は未回答です。</p>
<button id="toggle-circle-guide" type="button" aria-pressed="true">円ガイドを非表示</button>
<p>円ガイドは動画・PNGに焼き込まれていない比較用の重ね表示です（原寸PNGリンク先はガイドなしの原本です）。</p>
<nav aria-label="比較対象">${manifest.cases.map(c => `<a href="#${c.id}">${esc(c.title)}</a>`).join('\n')}</nav>
${manifest.cases.map(section).join('\n')}
<p><a href="manifest.json">この比較ページのmanifest・全assetのbytes/hash・fixture/plan識別</a></p>
<script>
'use strict';
const guideButton = document.querySelector('#toggle-circle-guide');
guideButton.addEventListener('click', () => {
  const hidden = document.body.classList.toggle('guides-hidden');
  guideButton.setAttribute('aria-pressed', String(!hidden));
  guideButton.textContent = hidden ? '円ガイドを表示' : '円ガイドを非表示';
});
for (const section of document.querySelectorAll('section')) {
  const videos = [...section.querySelectorAll('video')];
  const status = section.querySelector('.status');
  let operation = false;
  // Native controls remain independent. The explicit buttons coordinate both sides.
  const ready = v => v.readyState >= 1 ? Promise.resolve() : new Promise((resolve, reject) => {
    v.addEventListener('loadedmetadata', resolve, {once:true});
    v.addEventListener('error', reject, {once:true});
    v.load();
  });
  section.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', async () => {
    if (operation) return;
    operation = true;
    status.textContent = '';
    try {
      const action = button.dataset.action;
      if (action === 'pause') videos.forEach(v => v.pause());
      else {
        videos.forEach(v => v.pause());
        await Promise.all(videos.map(ready));
        if (action === 'align') videos[1].currentTime = videos[0].currentTime;
        else {
          videos.forEach(v => { v.currentTime = 0; v.playbackRate = 1; });
          await Promise.all(videos.map(v => v.play()));
        }
      }
    } catch (error) {
      videos.forEach(v => v.pause());
      status.textContent = '同期操作を完了できませんでした。各動画の標準コントロールを使用してください。';
    } finally { operation = false; }
  }));
}
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(out, 'index.html'), html);
manifest.assets.push({ file: 'index.html', bytes: Buffer.byteLength(html), sha256: sha(Buffer.from(html)) });
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ output: out, cases: manifest.cases.length, assets: manifest.assets.length, copiedBytes: manifest.assets.reduce((n,a) => n+a.bytes,0), htmlSHA256: sha(Buffer.from(html)), manifestSHA256: sha(fs.readFileSync(path.join(out, 'manifest.json'))), method: 'byte/hash/PNG-IHDR/ffprobe metadata only; no browser, image view, decode, encode, public requests' }, null, 2));

}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
