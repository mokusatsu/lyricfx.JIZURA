/* ============================================================
   JIZURA — planner: lyrics -> lines -> chunks -> timed cuts + events
   ============================================================ */
(() => {
'use strict';

// Structural cuts share the resolved timeline with lyrics, but have separate settings.
J.lyricCutKind = cut => cut.blank ? 'blank' : cut.line === -1 ? 'title'
  : cut.line === -2 ? 'outro' : cut.line >= 0 && cut.part === 'interlude' ? 'interlude'
  : cut.line >= 0 && Number.isInteger(cut.part) ? 'lyric' : 'unknown';
J.requireEditableCut = (cut, layer) => {
  if (!cut) throw Error('Cut not found');
  if (layer === 'lyrics' && J.lyricCutKind(cut) !== 'lyric')
    throw Error(`Unsupported ${J.lyricCutKind(cut)} cut: this operation requires a regular lyric cut`);
  return cut;
};
// Only these structural choices supplement the theme pools; other fields remain themed.
J.structuralCutEffects = kind => ({
  title: {layout: J.TITLE_LAYOUT_ORDER?.length ? J.TITLE_LAYOUT_ORDER : ['title'], enter:['blur','type','wipe','assemble','pop','drop'], exit:['blur','drift','wipe'], hold:['still']},
  outro: {layout:['outro'], enter:['blur','cut','zoom','wipe','pop'], exit:['blur','cut','shrink'], hold:['still','jitter','drift','wave'], cam:['push']},
  interlude: {layout:['interlude'], enter:['blur'], exit:['blur'], hold:['still'], cam:['push']},
}[kind] || {});

J.SAMPLE_LYRICS = `夜明けの色を/覚えてる
ほどけた声が遠くで鳴った
ねえ、まだ間に合うかな
*透明*なままじゃ終われない!`;

/* the original (After Effects-implemented) sets, captured before any expression pack registers */
J.CORE_ORDER = { layout: J.LAYOUT_ORDER.slice(), enter: J.ENTER_ORDER.slice(), exit: J.EXIT_ORDER.slice(), hold: J.HOLD_ORDER.slice(), decor: J.DECOR_ORDER.slice() };

/* animation step length: 'koma' = drawings per second on a 24fps timebase (12 = on twos, 8 = on threes, 0 = every output frame) */
J.komaOf = fx => (fx.koma != null ? +fx.koma : (fx.onTwos === false ? 0 : 12));
J.stepDur = (fx, fps) => { const k = J.komaOf(fx); return k > 0 ? 1 / k : 1 / (fps || 24); };

/* ---------------- lyric parsing ---------------- */
const lyricEscapes = { '\\': '\uE000', '#': '\uE001', '[': '\uE002', ']': '\uE003', '|': '\uE004', '!': '\uE005', '！': '\uE006', '*': '\uE007', '/': '\uE008', '{': '\uE009', '}': '\uE00A', '~': '\uE00B', ':': '\uE00C' };
const lyricUnescapes = Object.fromEntries(Object.entries(lyricEscapes).map(([literal, token]) => [token, literal]));
const protectLyricEscapes = s => s.replace(/\\([\\#\[\]|!！*\/{}~:n])/g, (_, literal) => literal === 'n' ? '\n' : lyricEscapes[literal]);
const restoreLyricEscapes = s => String(s).replace(/[\uE000-\uE00C]/g, token => lyricUnescapes[token]);
/**
 * Validates and parses Songcut-extended LRC format.
 * Format: [mm:ss.xx]<mm:ss.xx>LyricText<mm:ss.xx>
 * Rules:
 * - Only line start timestamp is used.
 * - Trailing timestamp tag <mm:ss.xx> is stripped from lyric text, but its value is ignored and never compared with start.
 * - Symbols, <tags> inside lyric text, escaped newlines (\n), and backslashes (\\) are preserved.
 * - All-or-nothing validation: Any invalid start timestamp or format error halts entire parsing and returns an error.
 */
J.parseSongcutLRC = (raw) => {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'LRC の内容が空または不正です。' };
  }

  const rawLines = raw.replace(/\r/g, '').split('\n');
  const parsedEntries = [];
  const meta = {};

  for (let i = 0; i < rawLines.length; i++) {
    const lineNum = i + 1;
    const originalLine = rawLines[i].trim();
    if (!originalLine) continue;
    if (originalLine.startsWith('#')) continue;

    const metaMatch = originalLine.match(/^\[(ti|ar|al|by|offset):(.*)\]$/i);
    if (metaMatch) {
      meta[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
      continue;
    }

    // Start tag: [mm:ss.xx] optionally followed by <mm:ss.xx>
    const startMatch = originalLine.match(/^\[(\d+):(\d+(?:[.:]\d+)?)\](?:<(\d+):(\d+(?:[.:]\d+)?)>)?/);
    if (!startMatch) {
      return {
        ok: false,
        error: `${lineNum}行目の形式が不正です（開始時刻タグ [mm:ss.xx] が見つかりません）: "${originalLine}"`
      };
    }

    const mins = parseInt(startMatch[1], 10);
    const secs = parseFloat(startMatch[2].replace(':', '.'));
    if (!Number.isFinite(mins) || !Number.isFinite(secs) || mins < 0 || secs < 0 || secs >= 60) {
      return {
        ok: false,
        error: `${lineNum}行目の開始時刻が無効です: "${startMatch[0]}"`
      };
    }
    const startTime = mins * 60 + secs;

    let body = originalLine.slice(startMatch[0].length);

    // Strip trailing <mm:ss.xx> tag if present (value ignored per specification)
    body = body.replace(/<(\d+):(\d+(?:[.:]\d+)?)>$/, '');

    // Songcut escapes: \n means newline within phrase, \\ means literal backslash.
    // In JIZURA's lyric editor (where 1 physical line = 1 phrase), a newline within a phrase
    // is represented as the escape sequence '\n' (backslash + 'n').
    // Emitting a real newline would split the phrase across lines and break timestamping.
    body = body.replace(/\\\\/g, '\uE000').replace(/\\n/g, '\uE00D');
    const specialChars = ['#', '[', ']', '|', '!', '！', '*', '/', '{', '}', '~', ':'];
    for (const ch of specialChars) {
      body = body.split(ch).join('\\' + ch);
    }
    body = body.replace(/\uE00D/g, '\\n').replace(/\uE000/g, '\\\\');

    parsedEntries.push({
      startTime,
      body,
      sourceLine: i
    });
  }

  if (parsedEntries.length === 0) {
    return { ok: false, error: '有効な歌詞行が含まれていません。' };
  }

  const jizuraLines = [];
  for (const entry of parsedEntries) {
    const m = Math.floor(entry.startTime / 60);
    const s = (entry.startTime % 60).toFixed(2).padStart(5, '0');
    const timeTag = `[${String(m).padStart(2, '0')}:${s}]`;
    jizuraLines.push(`${timeTag} ${entry.body}`);
  }

  return {
    ok: true,
    rawLrcText: jizuraLines.join('\n'),
    entries: parsedEntries,
    meta
  };
};

J.parseLyrics = (raw) => {
  const lines = []; const meta = {};
  let pendingGap = false, group = null, nextGroup = 0, avoidOverlap = false;
  const openGroup = text => {
    if (!text.startsWith('{')) return text;
    group = nextGroup++; avoidOverlap = text.startsWith('{-');
    return text.slice(avoidOverlap ? 2 : 1).trim();
  };
  for (const [sourceLine,src] of String(raw || '').replace(/\r/g, '').split('\n').entries()) {
    let s0 = protectLyricEscapes(src.trim());
    if (!s0) { if (lines.length) pendingGap = true; continue; }
    if (s0.startsWith('#')) continue;
    const mm = s0.match(/^\[(ti|ar|al|by|offset):(.*)\]$/i);
    if (mm) { meta[mm[1].toLowerCase()] = restoreLyricEscapes(mm[2].trim()); continue; }
    let lyricSize = null;
    const readSize = text => {
      const match=text.match(/^(\d+(?:\.\d+)?):\s*/);
      if(!match || lyricSize!==null || !Number.isFinite(+match[1]))return text;
      lyricSize=J.clamp(+match[1],0,1000);
      return text.slice(match[0].length);
    };
    s0 = openGroup(readSize(s0));
    let s = s0; const times = [];
    let m;
    while ((m = s.match(/^\[(\d+):(\d+(?:[.:]\d+)?)\](?:<(\d+):(\d+(?:[.:]\d+)?)>)?/))) { times.push(+m[1] * 60 + parseFloat(m[2].replace(':', '.'))); s = s.slice(m[0].length); }
    s = s.replace(/<(\d+):(\d+(?:[.:]\d+)?)>$/, '').trim();
    s = readSize(openGroup(readSize(s)));
    const closeGroup = s.endsWith(avoidOverlap ? '-}' : '}');
    if (closeGroup) s = s.slice(0, avoidOverlap ? -2 : -1).trim();
    let note = null;
    const bar = s.indexOf('|');
    if (bar >= 0) { note = restoreLyricEscapes(s.slice(bar + 1).trim()) || null; s = s.slice(0, bar).trim(); }
    let impact = false;
    if (/[!！]$/.test(s) && s.length > 1 && /!$/.test(s)) { impact = true; s = s.slice(0, -1).trim(); }
    const emph = [], soft = [], strengthSpans = [];
    let plain = '', pos = 0;
    const count = text => [...text.replace(/[\s/]/g, '')].length;
    s.replace(/\*([^*]+)\*|~([^~]+)~/g, (match, strong, quiet, offset) => {
      plain += s.slice(pos, offset);
      const word = strong ?? quiet, start = count(plain);
      plain += word;
      strengthSpans.push({ start, end: count(plain), strong: strong != null });
      (strong != null ? emph : soft).push(restoreLyricEscapes(word));
      pos = offset + match.length;
      return match;
    });
    s = plain + s.slice(pos);
    const effectsOnly = /^｜[ \t\u3000]+｜$/.test(s);
    if (effectsOnly) s = s.slice(1, -1);
    let manual = null;
    if (s.includes('/')) {
      manual = s.split('/').map(x => restoreLyricEscapes(x.trim())).filter(Boolean);
      const latin = manual.some(x => /[A-Za-z]/.test(x));
      s = manual.join(latin ? ' ' : '');
    }
    const lineGroup = group, lineAvoidOverlap = avoidOverlap;
    if (closeGroup) { group = null; avoidOverlap = false; }
    if (!s) continue;
    const base = { text: restoreLyricEscapes(s), sourceLine, lyricSize, effectsOnly, note, impact, emph, soft, strengthSpans, manual, group: lineGroup, avoidOverlap: lineAvoidOverlap, gapBefore: pendingGap };
    pendingGap = false;
    if (times.length) times.forEach(t => lines.push(Object.assign({}, base, { lrc: t })));
    else lines.push(Object.assign({}, base, { lrc: null }));
  }
  if (lines.length && lines.every(l => l.lrc != null)) lines.sort((a, b) => a.lrc - b.lrc);
  return { lines, meta };
};

/* ---------------- chunking (bunsetsu-ish) ---------------- */
const segmenters = {};   // one per lyric language (J.segLocale: ja / zh-Hant / zh-Hans / ko)
const segmenterOf = () => {
  if (typeof Intl === 'undefined' || !Intl.Segmenter) return null;
  const loc = J.segLocale ? J.segLocale() : 'ja';
  if (!(loc in segmenters)) { try { segmenters[loc] = new Intl.Segmenter(loc, { granularity: 'word' }); } catch (e) { segmenters[loc] = null; } }
  return segmenters[loc];
};
const segType = s => {
  if (/^\s+$/.test(s)) return 'S';
  if ([...s].every(c => J.isPunct(c))) return 'P';
  if ([...s].some(c => J.isKanji(c))) return 'K';
  if ([...s].every(c => J.isHira(c) || c === 'ー')) return 'H';
  if ([...s].every(c => J.isKata(c) || c === 'ー')) return 'T';
  if (/[A-Za-z0-9]/.test(s)) return 'L';
  return 'O';
};
J.segments = (text) => {
  const segmenter = segmenterOf();
  if (segmenter) return [...segmenter.segment(text)].map(x => x.segment);
  const out = []; let cur = '', ct = '';
  for (const c of text) {
    const t = segType(c);
    if (cur && t !== ct && !(ct === 'K' && t === 'H')) { out.push(cur); cur = ''; }
    cur += c; ct = t;
  }
  if (cur) out.push(cur);
  return out;
};
J.chunkText = (text) => {
  const segs = J.segments(text);
  const chunks = []; let cur = null;
  const close = () => { if (cur && cur.s.trim()) chunks.push(cur.s.trim()); cur = null; };
  for (const sg of segs) {
    const t = segType(sg);
    if (t === 'S') { close(); continue; }
    if (t === 'P') { if (cur) cur.s += sg; else if (chunks.length) chunks[chunks.length - 1] += sg; else cur = { s: sg, k: 'P', hasH: false }; continue; }
    if (!cur) { cur = { s: sg, k: t, hasH: t === 'H' }; continue; }
    if (t === 'H') {
      const len = [...sg].length;
      if (len <= 3 || (cur.k !== 'H' && !cur.hasH) || (cur.k === 'H' && [...cur.s].length + len <= 4)) { cur.s += sg; cur.hasH = true; continue; }
      close(); cur = { s: sg, k: 'H', hasH: true }; continue;
    }
    if (t === 'K' && cur.k === 'K' && !cur.hasH && [...(cur.s + sg)].length <= 6) { cur.s += sg; continue; }
    if (t === 'T' && cur.k === 'T') { cur.s += sg; continue; }
    if (t === 'L' && cur.k === 'L') { cur.s += sg; continue; }
    close(); cur = { s: sg, k: t, hasH: t === 'H' };
  }
  close();
  // split very long chunks, merge lonely single kana
  const out = [];
  for (const c of chunks) {
    const n = [...c].length;
    if (n > 10) { J.splitLines(c, Math.ceil(n / Math.ceil(n / 8))).split('\n').forEach(x => out.push(x)); }
    else out.push(c);
  }
  for (let i = out.length - 1; i > 0; i--) {
    if ([...out[i]].length === 1 && !J.isKanji(out[i])) { out[i - 1] += out[i]; out.splice(i, 1); }
  }
  return out.length ? out : [text];
};

/* ---------------- timing ---------------- */
J.computeTiming = (project, parsed, audio) => {
  const T = project.timing || {};
  const lines = parsed.lines;
  const beat = T.bpm > 0 ? 60 / T.bpm : 0;
  const starts = [];
  const allLrc = lines.length && lines.every(l => l.lrc != null);
  let t = T.offset ?? 0.4;
  lines.forEach((l, i) => {
    const man = T.lineTimes && T.lineTimes[i] != null ? +T.lineTimes[i] : null;
    let s;
    if (man != null && isFinite(man)) s = man;
    else if (allLrc) s = l.lrc;
    else {
      if (i > 0) {
        const n = [...lines[i - 1].text].length;
        let d = J.clamp(0.8 + n * 0.17, 1.3, 5.2) * (T.lineScale || 1);
        if (beat) d = Math.max(2, Math.round(d / beat)) * beat;
        s = starts[i - 1] + d + (l.gapBefore ? (beat ? beat * 2 : 0.8) : 0);
      } else s = t;
    }
    starts.push(s);
  });
  // Legacy playhead insertions kept an absolute end inside the previous line. It only applies while
  // it still leaves the line visible; after retiming it falls back to ordinary line timing.
  const insertionEnds = starts.map((s, i) => {
    const end = +project.overrides?.[i]?.insertionEnd;
    return Number.isFinite(end) && end > s + .3 ? end : null;
  });
  const ends = starts.map((s, i) => {
    const inserted=insertionEnds[i];
    if(inserted!=null)return inserted;
    const next=starts.findIndex((_,j)=>j>i && insertionEnds[j]==null);
    if(next>=0)return Math.max(s+.35,starts[next]);
    const n = [...lines[i].text].length;
    let d = J.clamp(0.8 + n * 0.17, 1.5, 5.2) * (T.lineScale || 1);
    if (beat) d = Math.max(2, Math.round(d / beat)) * beat;
    return s + d;
  });
  let duration = (ends.length ? ends[ends.length - 1] : 3) + (T.tail ?? 0.9);
  if (audio && audio.duration && T.useAudioLength !== false) duration = Math.max(audio.duration, ends.length ? ends[ends.length - 1] + 0.2 : 1);
  return { starts, ends, duration, insertionEnds };
};

/* ---------------- planning ---------------- */
const wkey = (obj, k, d = 1) => (obj && obj[k] != null ? obj[k] : d);
// カットの終了時間: with 「次カット再生まで」 (the default) a cut runs until the next one starts; with it off
// ({ untilNext: false, endTime }) the cut ends at its own time — earlier leaves a gap, later overlaps.
J.cutEndTime = options => options && options.untilNext === false && Number.isFinite(+options.endTime) ? Math.max(0, +options.endTime) : null;
J.lyricArea = area => {
  if (!area || !['x', 'y', 'w', 'h'].every(k => Number.isFinite(+area[k]))) return null;
  const w = J.clamp(+area.w, 0.04, 4), h = J.clamp(+area.h, 0.04, 4);
  return { x: +area.x, y: +area.y, w, h,
    angle: Number.isFinite(+area.angle) ? J.clamp(+area.angle, -180, 180) : 0,
    lockAspect: area.lockAspect !== false };
};

J.plan = (project, audio, chain) => {
  // Re-rolling one lyric of a 1シーン group changes only that lyric's effects: the plan is first made without those
  // re-rolls, and the lyrics that follow keep the effects (and the block's shared looks) that plan gave them.
  if (!chain) {
    const rerolled = new Set(Object.entries(project.overrides || {}).filter(([k, o]) => o.seed | 0).map(([k]) => +k)
      .filter(k => J.parseLyrics(project.lyrics).lines[k]?.group != null));
    if (rerolled.size) {
      const overrides = { ...project.overrides };
      for (const k of rerolled) overrides[k] = { ...overrides[k], seed: 0, lock: false };
      const log = { lines: [], blockLooks: null };
      J.plan({ ...project, overrides }, audio, { record: log });
      chain = { replay: log, rerolled };
    }
  }
  const st = J.resolveStyle(project);
  const fx = Object.assign({}, J.defaultProject().fx, project.fx || {});
  const parsed = J.parseLyrics(project.lyrics);
  const title = project.title || parsed.meta.ti || '';
  const artist = project.artist || parsed.meta.ar || '';
  const tm = J.computeTiming(project, parsed, audio);
  const fixedDuration = Number.isFinite(+project.durationOverride) && +project.durationOverride > 0 ? +project.durationOverride : null;
  if (fixedDuration != null) {
    const latestLine = tm.starts.length ? Math.max(...tm.starts) : 0;
    const latestBlank = 0;
    tm.duration = Math.max(0.1, fixedDuration, latestLine + 0.04, latestBlank + 0.04);
    tm.ends = tm.ends.map((end, i) => Math.max(tm.starts[i] + 0.04, Math.min(end, tm.duration)));
  }
  const [W, H] = J.designSize(project);
  // enabled map: anything not explicitly switched off is on (new pack entries appear enabled in old projects);
  // then the 追加分 / 和風 switches decide what random picks may use (a per-line override still works)
  const en = {};
  for (const g of J.GROUP_KEYS) { en[g] = {}; const src = (project.enabled || {})[g] || {}; for (const k of J.order(g)) en[g][k] = src[k] !== false && (!J.randomOk || J.randomOk(project, g, k)); }
  const plan = {
    layerVisibility: {...project.layerVisibility},
    version: 1, generator: 'JIZURA', title, artist, W, H, fps: project.fps || 24,
    duration: tm.duration, styleKey: project.style, style: st, fx, seed: project.seed,
    lines: [], cuts: [], events: [], beats: audio && audio.beats ? audio.beats.slice() : [],
    hud: fx.hud === 'on' ? true : fx.hud === 'off' ? false : !!st.hud,
    keyBg: J.keyMode ? J.keyMode(project) : null,   // 'green' | 'black' | null — 合成用の背景
    lang: J.resolveLang ? J.resolveLang(project) : 'ja',   // 歌詞の言語 (auto → detected)
  };
  if (J.setLang) J.setLang(plan.lang);                     // chunking + measuring below use this language
  const beats = plan.beats;
  const snap = (t) => {
    if (!beats.length || !(project.timing && project.timing.snap)) return t;
    let lo = 0, hi = beats.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (beats[mid] < t) lo = mid + 1; else hi = mid; }
    let best = t, bd = 0.13;
    for (const k of [lo - 1, lo]) if (k >= 0 && k < beats.length && Math.abs(beats[k] - t) < bd) { bd = Math.abs(beats[k] - t); best = beats[k]; }
    return best;
  };
  const history = [], bgHistory = [], fxHistory = [];
  const rerolled = li => !!chain?.rerolled?.has(li);
  // 統一感重視: lyrics of one block (a 1シーン group, or the lyrics between blank lines) that have the same
  // emphasis share their effects; repeats are favoured and fewer background / colour switches happen.
  const unified = project.themeBalance === 'unified';
  UNITY = unified;
  const blockLooks = new Map(), cutBlock = new Map();
  if (chain?.replay?.blockLooks) for (const [k, v] of chain.replay.blockLooks) blockLooks.set(k, { ...v });
  let paragraph = 0;
  let schemeIdx = 0;
  const nSchemes = st.schemes.length;
  const addEvent = (t, type, amp, dur) => plan.events.push({ t, type, amp, dur });

  // title card (decor, treat, cam, enter, exit フル装飾対応)
  const firstStart = tm.starts.length ? tm.starts[0] : 0;
  const showTitle = !!title;
  if (showTitle) {
    const ov = (project.overrides || {})[-1] || {};
    const titleSeed = ov.lock && ov.lockedSeed != null ? ov.lockedSeed : J.h(project.seed, 999, ov.seed | 0);
    const rng = J.rng(titleSeed);
    const manualTitleCut = (project.timing && project.timing.cutTimes) ? (Array.isArray(project.timing.cutTimes) ? project.timing.cutTimes.find(c => c.line === -1) : null) : null;
    const titleStart = manualTitleCut ? manualTitleCut.start : 0.1;
    const titleEnd = manualTitleCut ? manualTitleCut.end : (firstStart >= 1.2 ? Math.max(0.6, firstStart - 0.04) : 2.2);
    const titleEffects = J.structuralCutEffects('title');
    const candLayouts = titleEffects.layout;
    const layout = ov.layout && J.LAYOUTS[ov.layout] ? ov.layout : rng.pick(candLayouts);
    const LD = J.LAYOUTS[layout] || J.LAYOUTS.title;
    const enter = ov.enter && J.ENTER[ov.enter] ? ov.enter : rng.pick(titleEffects.enter);
    const exit = ov.exit && J.EXIT[ov.exit] ? ov.exit : rng.pick(titleEffects.exit);
    const hold = ov.hold && J.HOLD[ov.hold] ? ov.hold : 'still';
    const decor = Array.isArray(ov.decor) ? ov.decor.filter(id => J.DECOR[id]).map(id => decorParams(rng, id)) : pickDecor(rng, st, en, fx, layout, history);
    const treat = ov.treat && J.TREAT[ov.treat] ? ov.treat : pickTreat(rng, st, en, fx, LD, false, history);
    const treatP = (J.TREAT[treat] && J.TREAT[treat].plan) ? J.TREAT[treat].plan(rng, st) : {};
    const cam = ov.cam && J.CAMERA[ov.cam] ? ov.cam : pickCam(rng, st, en, fx, LD, false, history);
    const camP = (J.CAMERA[cam] && J.CAMERA[cam].plan) ? J.CAMERA[cam].plan(rng, st) : {};
    const params = LD.plan(rng, { text: title, n: [...title].length, W, H, dur: titleEnd - titleStart }, st);
    const titleCut = makeCut({
      text: title, note: artist, lineText: title, line: -1,
      start: titleStart, end: titleEnd, layout, enter, exit, hold,
      params, decor, treat, treatP, cam, camP, scheme: 0, seed: J.h(titleSeed, 17)
    });
    plan.cuts.push(titleCut);
    history.push({ layout, enter, exit, hold, treat, cam, trans: null, decor: decor.map(d => d.id) });
    plan.titleLine = { index: -1, text: title, note: artist, start: titleStart, end: titleEnd, seed: titleSeed, cut: titleCut };
  }

  parsed.lines.forEach((ln, li) => {
    if (li > 0 && ln.gapBefore) paragraph++;
    const s = tm.starts[li], e = tm.ends[li];
    const ov = (project.overrides || {})[li] || {};
    // Placement must not change effect selection or its random stream. Fit the chosen layout later.
    const area = J.lyricArea(ov.area), layoutW = W, layoutH = H;
    const lineSeed = ov.lock && ov.lockedSeed != null ? ov.lockedSeed : J.h(project.seed, li + 1, ov.seed | 0);
    const rng = J.rng(lineSeed);
    const chainMark = chain ? { h: history.length, b: bgHistory.length, f: fxHistory.length } : null;
    const n = [...ln.text.replace(/\s+/g, '')].length;
    const cutTimes = (project.timing && project.timing.cutTimes) || {};
    const interludeTime = cutTimes[`${li}:interlude`];
    const naturalVisEnd = ln.effectsOnly || tm.insertionEnds[li]!=null ? e : Math.min(e, s + Math.max(3.6, n * 0.5 + 1.2));
    const visEnd = ln.effectsOnly ? e : interludeTime != null && Number.isFinite(+interludeTime) && e - s > 1.81
      ? J.clamp(+interludeTime, s + 0.5, e - 1.31) : naturalVisEnd;
    const D = visEnd - s;
    plan.lines.push({ index: li, text: ln.text, start: s, end: e, visEnd, note: ln.note, impact: ln.impact, emph: ln.emph, soft: ln.soft, group: ln.group, avoidOverlap: !!ln.avoidOverlap, chunks: null, seed: lineSeed });
    const multiline = ln.text.includes('\n');
    const chunks = ln.manual || (multiline ? [ln.text] : J.chunkText(ln.text));
    plan.lines[li].chunks = chunks;
    const L = J.lerp(1.3, 0.5, ov.divisionDensity ?? fx.density);
    let nC = Math.round(D / L);
    const maxC = chunks.length + (chunks.length >= 2 && D > 2.0 ? 1 : 0);
    nC = J.clamp(nC, 1, Math.max(1, maxC));
    if (ov.single) nC = 1;
    // groups of chunks
    let groups;
    const nG = Math.min(nC, chunks.length);
    if (multiline && !ov.single) groups = chunks;
    else if (nG <= 1) groups = [ln.text];
    else groups = partition(chunks, nG).map(g => g.join(/[A-Za-z]/.test(g.join('')) ? ' ' : ''));
    // A locked line keeps the division it had when it was locked, as long as its text is unchanged.
    const lockedUnits = ov.lock && ov.lockedUnits?.text === ln.text && Array.isArray(ov.lockedUnits.groups) && ov.lockedUnits.groups.length ? ov.lockedUnits : null;
    if (lockedUnits) groups = lockedUnits.groups.slice();
    const recap = lockedUnits ? !!lockedUnits.recap : !multiline && nC > groups.length && groups.length >= 2;
    const units = groups.map(g => ({ text: g, w: [...g].length + 1.6 }));
    if (recap) units.push({ text: ln.text, w: (units.reduce((a, u) => a + u.w, 0) / units.length) * 1.25, recap: true });
    const tot = units.reduce((a, u) => a + u.w, 0);
    let acc = s; const bounds = [s];
    units.forEach((u, k) => { acc += D * u.w / tot; bounds.push(k === units.length - 1 ? visEnd : acc); });
    // Resolve all requested boundaries before limiting them; the next manual start
    // must not be replaced by its old, automatically distributed position.
    for (let k = 1; k < bounds.length - 1; k++) {
      const manual = cutTimes[`${li}:${k}`];
      bounds[k] = manual != null && Number.isFinite(+manual) ? +manual : snap(bounds[k]);
    }
    const gap = Math.min(0.22, D / units.length);
    for (let k = bounds.length - 2; k > 0; k--) bounds[k] = Math.min(bounds[k], bounds[k + 1] - gap);
    for (let k = 1; k < bounds.length - 1; k++) bounds[k] = Math.max(bounds[k], bounds[k - 1] + gap);
    // scheme per line
    if (nSchemes > 1 && li > 0 && rng.chance(fx.bgSwitch * (ln.impact ? 1.8 : 1) * (unified ? .4 : 1))) schemeIdx = (schemeIdx + 1 + rng.int(0, nSchemes - 2)) % nSchemes;
    const emphLine = ln.impact || ln.emph.length > 0;
    // background graphic: chosen per line, occasionally re-rolled per cut
    const blockNum = ln.group != null ? 1000 + ln.group : paragraph, blockBg = unified && !ov.bg && !rerolled(li) ? blockLooks.get('bg|' + blockNum) : null;
    let lineBg = ov.bg && J.BG[ov.bg] ? ov.bg : blockBg ? blockBg.name : pickBg(rng, st, en, fx, bgHistory);
    bgHistory.push(lineBg);
    let lineBgP = blockBg ? blockBg.P : J.BG[lineBg] && J.BG[lineBg].plan ? J.BG[lineBg].plan(rng, st) : {};
    if (unified && !ov.bg && !blockBg && !rerolled(li)) blockLooks.set('bg|' + blockNum, { name: lineBg, P: lineBgP });
    let textOffset = 0;
    units.forEach((u, k) => {
      const cs = bounds[k], ce = bounds[k + 1], dur = ce - cs;
      const txt = u.text;
      const nn = [...txt.replace(/\s+/g, '')].length;
      const begin = u.recap ? 0 : textOffset;
      const spans = ln.strengthSpans.filter(span => span.start < begin + nn && span.end > begin);
      const emphasis = spans.some(span => span.strong), suppressed = !emphasis && spans.some(span => !span.strong);
      textOffset += nn;
      const emph = ln.impact && (k === 0 || u.recap) || emphasis;
      const fx = suppressed ? Object.assign({}, plan.fx, { motion: plan.fx.motion * 0.25, glitch: plan.fx.glitch * 0.25, decor: plan.fx.decor * 0.4 }) : plan.fx;
      const eventStart = plan.events.length;
      // The effects this block already gave to lyrics of the same emphasis (統一感重視), reused when they still fit.
      const roleIdx = emph ? 1 : suppressed ? 2 : 0, shareKey = blockNum + '|' + roleIdx;
      const share = unified ? (blockLooks.get(shareKey) || (blockLooks.set(shareKey, {}), blockLooks.get(shareKey))) : {};
      const shareable = unified && !ln.effectsOnly && !txt.includes('\n') && !rerolled(li);
      const sharedLayout = shareable && share.layout && J.LAYOUTS[share.layout] && en.layout[share.layout] && J.LAYOUTS[share.layout].fits(nn)
        && J.layoutAllowsSharing(share.layout, dur) ? share.layout : null;
      const layout = ln.effectsOnly || txt.includes('\n') ? 'center' : ov.layout && J.LAYOUTS[ov.layout] ? ov.layout : sharedLayout || pickLayout(rng, st, en, nn, dur, history, emph, u.recap, layoutH > layoutW, ln.note);
      if (shareable && !share.layout && !ov.layout) share.layout = layout;
      const enterOk = shareable && share.enter && J.ENTER[share.enter] && en.enter[share.enter] !== false && !(J.ENTER[share.enter].minDur && dur < J.ENTER[share.enter].minDur) && !(J.ENTER[share.enter].maxChars && nn > J.ENTER[share.enter].maxChars);
      let enter = ov.enter && J.ENTER[ov.enter] ? ov.enter : enterOk ? share.enter : pickEnter(rng, st, en, layout, dur, history, emph, nn);
      if (shareable && !share.enter && !ov.enter) share.enter = enter;
      const exitOk = shareable && share.exit && J.EXIT[share.exit] && en.exit[share.exit] !== false && !(J.EXIT[share.exit].minDur && dur < J.EXIT[share.exit].minDur);
      let exit = ov.exit && J.EXIT[ov.exit] ? ov.exit : exitOk ? share.exit : pickExit(rng, st, en, layout, dur, k === units.length - 1, history);
      if (shareable && !share.exit && !ov.exit) share.exit = exit;
      const hold = ov.hold && J.HOLD[ov.hold] ? ov.hold : shareable && share.hold && J.HOLD[share.hold] && en.hold[share.hold] !== false ? share.hold : pickHold(rng, en, fx, history);
      if (shareable && !share.hold && !ov.hold) share.hold = hold;
      let inDur = J.clamp(dur * 0.36, 0.12, 0.6);
      if (J.ENTER[enter] && J.ENTER[enter].inDur) inDur = J.ENTER[enter].inDur(dur, nn);
      let outDur = J.clamp(dur * 0.3, 0.14, 0.55);
      if (J.EXIT[exit] && J.EXIT[exit].outDur) outDur = J.EXIT[exit].outDur(dur, nn);
      if (inDur + outDur > dur * 0.92) { const f = dur * 0.92 / (inDur + outDur); inDur *= f; outDur *= f; }
      let sch = schemeIdx;
      // the palette switch is rolled from its own seed: a hand-set layout / effect skips draws of `rng` and must not shift it
      if (nSchemes > 1 && k > 0) { const pSwitch = 0.12 * fx.bgSwitch * (unified ? .3 : 1); rng.chance(pSwitch); if (J.rng(J.h(lineSeed, k, 4407)).chance(pSwitch)) sch = (schemeIdx + 1) % nSchemes; }
      const LD = J.LAYOUTS[layout];
      const params = LD.plan(unified ? J.rng(J.h(project.seed | 0, blockNum, roleIdx, 6151)) : rng, { text: txt, n: nn, W: layoutW, H: layoutH, dur }, st);
      if (txt.includes('\n')) params.sx = 1;
      const decor = Array.isArray(ov.decor) ? ov.decor.filter(id => J.DECOR[id]).map(id => decorParams(rng, id)) : shareable && share.decor && share.layout === layout ? share.decor.map(d => ({ ...d })) : pickDecor(rng, st, en, fx, layout, history);
      if (shareable && !share.decor && !Array.isArray(ov.decor)) share.decor = decor.map(d => ({ ...d }));
      const treatOk = shareable && share.treat !== undefined && (share.treat === 'none' || (J.TREAT[share.treat] && LD.treat !== false && (LD.treat !== 'safe' || J.TREAT[share.treat].safe)));
      const treat = ov.treat && J.TREAT[ov.treat] ? ov.treat : treatOk ? share.treat : pickTreat(rng, st, en, fx, LD, emph, history);
      const treatP = treatOk && !ov.treat ? { ...share.treatP } : J.TREAT[treat].plan ? J.TREAT[treat].plan(rng, st) : {};
      if (shareable && share.treat === undefined && !ov.treat) { share.treat = treat; share.treatP = { ...treatP }; }
      if (!ov.bg && k > 0 && rng.chance((0.18 * fx.bgSwitch + 0.04) * (unified ? .15 : 1))) { lineBg = pickBg(rng, st, en, fx, bgHistory); lineBgP = J.BG[lineBg].plan ? J.BG[lineBg].plan(rng, st) : {}; }
      const bg = LD.busy && !(J.BG[lineBg] && J.BG[lineBg].subtle) ? 'none' : lineBg;
      const camOk = shareable && share.cam && J.CAMERA[share.cam] && en.cam?.[share.cam] !== false && !(LD.cam === false && share.cam !== 'push');
      const cam = ov.cam && J.CAMERA[ov.cam] ? ov.cam : camOk ? share.cam : pickCam(rng, st, en, fx, LD, emph, history);
      const camP = camOk && !ov.cam ? { ...share.camP } : J.CAMERA[cam].plan ? J.CAMERA[cam].plan(rng, st) : {};
      if (shareable && !share.cam && !ov.cam) { share.cam = cam; share.camP = { ...camP }; }
      // cut-to-cut transition (replaces the previous cut's exit and this cut's entrance)
      const prevCut = plan.cuts[plan.cuts.length - 1];
      // Emphasis is a lyric directive, including when an older cut saved OFF.
      const frontmost = emphasis || !!((project.lyricCutOptions || {})[`${li}:${k}`] || {}).frontmost;
      let trans = null, transP = {}, transDur = 0;
      const canTrans = prevCut && ln.group == null && prevCut.group == null && !!prevCut.frontmost === frontmost && Math.abs(prevCut.end - cs) < 0.06 && prevCut.layout !== 'interlude' && dur > 0.5;
      if (canTrans) {
        const transOk = shareable && share.trans !== undefined && (share.trans === null || (J.TRANS[share.trans] && en.trans?.[share.trans] !== false));
        trans = ov.trans && J.TRANS[ov.trans] ? ov.trans : transOk ? share.trans : pickTrans(rng, st, en, fx, emph, history);
        if (shareable && share.trans === undefined && !ov.trans) share.trans = trans;
        if (trans) {
          const TD = J.TRANS[trans];
          transDur = J.clamp(TD.dur || 0.35, 0.12, Math.min(0.6, dur * 0.45));
          transP = TD.plan ? TD.plan(rng, st) : {};
          enter = 'cut'; inDur = 0.12;
          prevCut.exit = 'cut'; prevCut.outDur = 0;
        }
      }
      // Avoid optional variants that hide a supplied annotation on automatic layouts.
      if (ln.note && !ov.layout) {
        if (layout==='labels') params.vertNote=false;
        if (layout==='lowerThird') params.label='copy';
        if (layout==='arcTop') params.under='copy';
      }
      const cut = makeCut({ text: txt, insertedAtPlayhead: tm.insertionEnds[li]!=null, lyricSize: ln.lyricSize, effectsOnly: !!ln.effectsOnly, lineText: ln.text, note: ln.note, line: li, part: k, group: ln.group, avoidOverlap: !!ln.avoidOverlap, start: cs, end: ce, layout, enter, exit, hold, inDur, outDur, params, decor, scheme: sch, seed: J.h(lineSeed, k, 17), area, frontmost: !!frontmost, emphasis, suppressed, motionScale: suppressed ? 0.25 : 1, contentScale: suppressed ? J.SUPPRESSED_TEXT_SCALE : emphasis ? J.EMPHASIS_TEXT_SCALE : 1, emph, recap: !!u.recap, words: J.chunkText(txt), stagger: rng.range(0.025, 0.06),
        treat, treatP, bg, bgP: bg === lineBg ? lineBgP : {}, cam, camP, trans, transP, transDur });
      plan.cuts.push(cut);
      if (shareable && !ov.layout) cutBlock.set(cut, { key: shareKey, W: layoutW, H: layoutH });
      history.push({ layout, enter, exit, hold, treat, cam, trans, decor: decor.map(d => d.id) });
      // events at cut start
      // events at cut start — durations are on a 24fps timebase so every output rate looks the same
      const g = fx.glitch * (st.glitchBoost || 1);
      const fxOn = k2 => en.fx == null || en.fx[k2] !== false;
      const F = 1 / 24;
      if (fxOn('chroma')) addEvent(cs, 'chroma', 1.4 + rng.range(0, 2) * fx.chroma + (emph ? 2.5 : 0), 0.25);
      if (fxOn('slice') && rng.chance(g * 0.5 + (emph ? 0.3 : 0))) addEvent(cs, 'slice', 0.6 + rng.range(0, 0.8) * g + (emph ? 0.5 : 0), rng.pick([2, 3, 4]) * F);
      if (fxOn('block') && rng.chance(g * 0.22)) addEvent(cs + rng.range(0, 0.05), 'block', 0.5 + g, rng.pick([2, 4]) * F);
      if (fxOn('shake') && (emph || rng.chance(fx.motion * 0.18))) addEvent(cs, 'shake', (emph ? 1 : 0.5) * fx.motion, 0.3);
      if (fxOn('flash') && fx.flash && (ln.impact && k === 0)) addEvent(cs, 'flash', 1, 3 * F);
      if (fxOn('invert') && rng.chance(0.035 * g)) addEvent(cs, 'invert', 1, 2 * F);
      if (fxOn('zoom') && (emph && rng.chance(0.6) || rng.chance(0.06 * fx.motion))) addEvent(cs, 'zoom', 0.7 + 0.5 * fx.motion, 0.22);
      if (fxOn('mosaic') && rng.chance(0.04 * g)) addEvent(cs, 'mosaic', 1, 3 * F);
      if (fxOn('slice') && dur > 0.8 && rng.chance(g * 0.4)) addEvent(cs + rng.range(0.35, 0.8) * dur, 'slice', 0.4 + g * 0.4, 2 * F);
      // the newer effect library: at most one per cut boundary (plus rare mid-cut accents)
      if (plan.cuts.length > 1 || k > 0 || li > 0) {
        const pick = pickFx(rng, st, en, fx, emph, fxHistory, 'edge');
        if (pick) { const D2 = J.FXE[pick]; const d = (D2.dur || 4) * F; addEvent(cs - (D2.pre ? D2.pre * F : 0), pick, (D2.amp || 1) * (0.7 + 0.5 * g + (emph ? 0.3 : 0)), d); fxHistory.push(pick); }
      }
      if (dur > 1.1) { const pick = pickFx(rng, st, en, fx, emph, fxHistory, 'mid'); if (pick) { const D2 = J.FXE[pick]; addEvent(cs + rng.range(0.4, 0.75) * dur, pick, (D2.amp || 1) * (0.5 + 0.4 * g), (D2.dur || 3) * F); } }
      for (let j = eventStart; j < plan.events.length; j++) plan.events[j].cutOwner = `${li}:${k}`;
      if (suppressed) for (let j = eventStart; j < plan.events.length; j++) plan.events[j].amp *= 0.25;
    });
    // interlude in long gaps
    const nextStart = li < parsed.lines.length - 1 ? tm.starts[li + 1] : null;
    if (nextStart != null && nextStart - visEnd > 1.3) {
      const r2 = J.rng(J.h(lineSeed, 404));
      plan.cuts.push(makeCut({ text: title || '', lineText: '', line: li, part: 'interlude', start: visEnd, end: nextStart, layout: 'interlude', enter: 'blur', exit: 'blur', hold: 'still', inDur: 0.3, outDur: 0.3, params: J.LAYOUTS.interlude.plan(r2), decor: pickDecor(r2, st, en, Object.assign({}, fx, { decor: 1 }), 'interlude'), scheme: schemeIdx, seed: J.h(lineSeed, 405) }));
    }
    if (chain?.record) chain.record.lines[li] = { h: history.slice(chainMark.h), b: bgHistory.slice(chainMark.b), f: fxHistory.slice(chainMark.f), scheme: schemeIdx };
    else if (chain?.replay && rerolled(li)) {
      const r = chain.replay.lines[li];
      if (r) { history.length = chainMark.h; history.push(...r.h); bgHistory.length = chainMark.b; bgHistory.push(...r.b); fxHistory.length = chainMark.f; fxHistory.push(...r.f); schemeIdx = r.scheme; }
    }
  });
  if (chain?.record) chain.record.blockLooks = blockLooks;
  const looksOf = c => ({ layout: c.layout, params: c.params, decor: c.decor, treat: c.treat, treatP: c.treatP });
  // 統一感重視, last touch: a layout only fits some text lengths, so a block may have had to leave its shared layout
  // for one cut. Give every lyric of the same block and emphasis the one layout (and decor / treatment) that fits them all.
  if (unified && !chain?.replay) {
    const groups = new Map();
    for (const [cut, info] of cutBlock) (groups.get(info.key) || groups.set(info.key, []).get(info.key)).push(cut);
    for (const [key, cuts] of groups) {
      if (cuts.length < 2) continue;
      const nOf = c => [...c.text.replace(/\s+/g, '')].length;
      const fitsAll = k => en.layout[k] && J.LAYOUTS[k] && cuts.every(c => J.LAYOUTS[k].fits(nOf(c)) && J.layoutAllowsSharing(k, c.dur));
      if (new Set(cuts.map(c => c.layout)).size > 1) {
        const counts = new Map(); for (const c of cuts) counts.set(c.layout, (counts.get(c.layout) || 0) + 1);
        let pick = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]).find(fitsAll);
        if (!pick) { const all = J.LAYOUT_ORDER.filter(fitsAll); if (all.length) pick = all[J.h(project.seed | 0, key.length, cuts.length, 6152) % all.length]; }
        if (pick) for (const c of cuts) if (c.layout !== pick) {
          const info = cutBlock.get(c), roleIdx = +key.split('|')[1];
          c.layout = pick;
          c.params = J.LAYOUTS[pick].plan(J.rng(J.h(project.seed | 0, +key.split('|')[0], roleIdx, 6151)), { text: c.text, n: nOf(c), W: info.W, H: info.H, dur: c.dur }, st);
          if (c.text.includes('\n')) c.params.sx = 1;
        }
      }
      // same decor and text treatment as the block's first lyric of this emphasis (when they suit the layout)
      const first = cuts[0], LD = J.LAYOUTS[first.layout] || {};
      if (cuts.every(c => c.layout === first.layout)) {
        const treatOk = first.treat === 'none' || (J.TREAT[first.treat] && LD.treat !== false && (LD.treat !== 'safe' || J.TREAT[first.treat].safe));
        for (const c of cuts.slice(1)) {
          c.decor = first.decor.map(d => ({ ...d }));
          if (treatOk) { c.treat = first.treat; c.treatP = { ...first.treatP }; }
        }
      }
    }
  }
  if (chain?.record) chain.record.cuts = new Map(plan.cuts.filter(c => c.line >= 0).map(c => [c.line + ':' + c.part, looksOf(c)])), chain.record.seeds = new Map(plan.cuts.filter(c => c.line >= 0).map(c => [c.line + ':' + c.part, c.seed]));
  else if (chain?.replay?.cuts) for (const c of plan.cuts) {
    if (c.group != null && chain.replay.seeds.has(c.line + ':' + c.part)) c.placementBase = chain.replay.seeds.get(c.line + ':' + c.part);
    const l = c.line >= 0 && !rerolled(c.line) && chain.replay.cuts.get(c.line + ':' + c.part);
    if (l) Object.assign(c, l);
  }
  for(const [line,end] of tm.insertionEnds.entries())if(end!=null){
    const start=tm.starts[line];
    for(const cut of plan.cuts)if(cut.line!==+line && cut.start<start && cut.end>start){cut.end=start;cut.dur=cut.end-cut.start;}
    plan.cuts=plan.cuts.filter(c=>c.line===+line || c.start<start || c.start>=end);
  }
  // Cuts with their own end time; a line's interlude starts after its lyrics end.
  const endedLines = new Map();
  for (const cut of plan.cuts) {
    if (cut.line < 0 || !Number.isInteger(cut.part)) continue;
    const end = J.cutEndTime(project.lyricCutOptions?.[`${cut.line}:${cut.part}`]);
    if (end != null) {
      cut.end = Math.max(cut.start + .04, end); cut.dur = cut.end - cut.start; cut.manualEnd = true;
      cut.inDur = Math.min(cut.inDur, cut.dur * .45); cut.outDur = Math.min(cut.outDur, cut.dur * .45);
    }
    endedLines.set(cut.line, Math.max(endedLines.get(cut.line) ?? 0, cut.end));
  }
  plan.cuts = plan.cuts.filter(cut => {
    if (cut.part !== 'interlude') return true;
    cut.start = Math.max(cut.start, endedLines.get(cut.line) ?? 0); cut.dur = cut.end - cut.start;
    return cut.dur >= .3;
  });

  // outro (後奏): 最後の歌詞終了時刻から楽曲終了時刻までの空隙を検出し、ビートに同期して複数サブカットに自動分割
  let maxLyricEnd = 0;
  for (const cut of plan.cuts) {
    if (cut.line >= 0 && Number.isInteger(cut.part)) {
      maxLyricEnd = Math.max(maxLyricEnd, cut.end);
    }
  }
  const outroGap = plan.duration - maxLyricEnd;
  if (maxLyricEnd > 0 && outroGap >= 0.8) {
    // 適切なサブカット数を算出 (1カットあたり約1.8秒〜2.5秒を理想とする)
    const nOutro = outroGap < 2.5 ? 1 : Math.min(8, Math.max(2, Math.round(outroGap / 2.1)));
    const bounds = [maxLyricEnd];
    if (nOutro > 1) {
      for (let k = 1; k < nOutro; k++) {
        const rawT = maxLyricEnd + (outroGap * k) / nOutro;
        bounds.push(snap(rawT));
      }
      bounds.push(plan.duration);
      // 境界の単調増加と最小間隔を保証
      for (let k = 1; k < bounds.length - 1; k++) {
        bounds[k] = Math.max(bounds[k - 1] + 0.45, Math.min(bounds[k], bounds[k + 1] - 0.45));
      }
    } else {
      bounds.push(plan.duration);
    }

    const VARIANTS = ['hex', 'ripple', 'star', 'arrows', 'bracket', 'cross'];
    const outroEffects = J.structuralCutEffects('outro');
    // Older unregistered pulse/shake/drift IDs all fell back to push in the renderer.
    const CAMS = outroEffects.cam;
    for (let i = 0; i < nOutro; i++) {
      const s = bounds[i], e = bounds[i + 1], dur = e - s;
      if (dur < 0.2) continue;
      const rOutro = J.rng(J.h(project.seed, 808, i));
      const curScheme = nSchemes > 1 ? (schemeIdx + i) % nSchemes : schemeIdx;
      const outroCut = makeCut({
        text: title || '',
        lineText: '',
        line: -2,
        part: nOutro > 1 ? `outro_${i + 1}` : 'outro',
        start: s,
        end: e,
        layout: 'outro',
        enter: i === 0 ? outroEffects.enter[0] : rOutro.pick(outroEffects.enter.slice(1)),
        exit: i === nOutro - 1 ? outroEffects.exit[0] : rOutro.pick(['cut', 'shrink', 'blur']),
        hold: rOutro.pick(outroEffects.hold),
        inDur: Math.min(0.25, dur * 0.35),
        outDur: Math.min(0.25, dur * 0.35),
        cam: CAMS[i % CAMS.length],
        params: {
          variant: VARIANTS[i % VARIANTS.length],
          outroIndex: i,
          outroCount: nOutro,
          isFinal: i === nOutro - 1
        },
        decor: pickDecor(rOutro, st, en, Object.assign({}, fx, { decor: 1 }), 'outro'),
        scheme: curScheme,
        seed: J.h(project.seed, 809, i)
      });
      plan.cuts.push(outroCut);
    }
  }

  plan.cuts.sort((a, b) => a.start - b.start);
  if (fixedDuration != null) {
    plan.cuts = plan.cuts.filter(c => c.start < plan.duration - 1e-3);
    for (const cut of plan.cuts) {
      cut.end = Math.min(cut.end, plan.duration);
      cut.dur = cut.end - cut.start;
      cut.inDur = Math.min(cut.inDur, cut.dur * 0.45);
      cut.outDur = Math.min(cut.outDur, cut.dur * 0.45);
    }
    plan.events = plan.events.filter(event => event.t < plan.duration);
  }
  plan.cuts = plan.cuts.filter(c => c.line < 0 || !project.lyricCutOptions?.[`${c.line}:${c.part}`]?.removed);
  plan.cuts.forEach((c, i) => { c.index = i; });
  plan.events.sort((a, b) => a.t - b.t);
  plan.energy = audio && audio.energy ? audio.energy : null;
  plan.energyRate = audio && audio.energyRate ? audio.energyRate : 0;
  if (J.finishLyricPlan) J.finishLyricPlan(project, plan, audio);
  // 先行着地（アンセティシペーション）補正: 各カットの歌い出しにアニメーション完了を着地させる (案A)
  const anticipation = project.anticipation !== false;
  plan.anticipation = anticipation;
  plan.ghostPreRoll = !!project.ghostPreRoll;
  let prevSequentialEnd = 0;
  for (let i = 0; i < plan.cuts.length; i++) {
    const cut = plan.cuts[i];
    if (cut.blank) continue;
    if (anticipation) {
      const lead = Math.min(cut.inDur || 0.3, 0.35);
      const idealStart = Math.max(0, cut.start - lead);
      const floor = (prevSequentialEnd <= cut.start) ? prevSequentialEnd : 0;
      const rStart = Math.min(cut.start, Math.max(idealStart, floor));
      cut.renderStart = rStart;
      cut.leadTime = Math.max(0, cut.start - rStart);
      prevSequentialEnd = cut.end;
    } else {
      cut.renderStart = cut.start;
      cut.leadTime = 0;
    }
  }
  return plan;
};

function makeCut(o) {
  const c = Object.assign({ hold: 'still', inDur: 0.3, outDur: 0.25, stagger: 0.04, decor: [], params: {}, scheme: 0, emph: false, words: [], note: null, treat: 'none', treatP: {}, bg: 'none', bgP: {}, cam: 'push', camP: {} }, o);
  c.dur = c.end - c.start;
  return c;
}
function partition(chunks, k) {
  const lens = chunks.map(c => [...c].length + 1);
  const tot = lens.reduce((a, b) => a + b, 0), target = tot / k;
  const groups = []; let cur = [], acc = 0, remainingGroups = k;
  chunks.forEach((c, i) => {
    const remainingChunks = chunks.length - i;
    if (cur.length && (acc + lens[i] / 2 > target || remainingChunks < remainingGroups) && groups.length < k - 1) { groups.push(cur); cur = []; acc = 0; remainingGroups--; }
    cur.push(c); acc += lens[i];
  });
  if (cur.length) groups.push(cur);
  return groups;
}
// 統一感重視 (themeBalance 'unified', set per plan): the same effect again is favoured instead of avoided.
let UNITY = false;
function noveltyWeights(history, key) {
  const weights = new Map();
  // Keep the newest-to-oldest multiplication order, including its rounding.
  for (let i = history.length - 1, d = 0; i >= 0 && d < 6; i--, d++) {
    const value = history[i][key], factor = UNITY ? (d < 2 ? 2.6 : 1.5) : (d < 2 ? 0.2 : 0.6);
    weights.set(value, (weights.get(value) ?? 1) * factor);
  }
  return weights;
}
function pickLayout(rng, st, en, n, dur, history, emph, recap, portrait, note) {
  const weights = noveltyWeights(history, 'layout');
  const cands = [];
  for (const k of J.LAYOUT_ORDER) {
    const L = J.LAYOUTS[k];
    if (!en.layout[k] || !L.fits(n)) continue;
    let w = wkey(st.bias.layout, k, L.w ?? 1) * (weights.get(k) ?? 1);
    if (portrait) w *= L.portrait ?? 1;
    if (emph && L.emph) w *= L.emph;
    if (emph && L.selection?.emphasis) w *= L.selection.emphasis;
    if (recap && L.selection?.recap) w *= L.selection.recap;
    if (dur < 0.5 && L.selection?.short) w *= L.selection.short;
    cands.push([k, w]);
  }
  if (!cands.length) return 'center';
  const withNote=note ? cands.filter(([key])=>J.LAYOUTS[key].supportsNote) : [];
  return rng.wpick(withNote.length ? withNote : cands);
}
function pickEnter(rng, st, en, layout, dur, history, emph, n) {
  const weights = noveltyWeights(history, 'enter');
  const cands = [];
  for (const k of J.ENTER_ORDER) {
    if (!en.enter[k]) continue;
    const D = J.ENTER[k]; if (!D) continue;
    const LD = J.LAYOUTS[layout] || {};
    let w = wkey(st.bias.enter, k, D.w ?? 1) * (weights.get(k) ?? 1) * wkey(LD.enterBias, k, 1);
    if (D.minDur && dur < D.minDur) w *= 0.15;
    if (D.maxChars && n > D.maxChars) w *= 0.2;
    if (D.selection?.weight) w *= D.selection.weight;
    if (dur < 0.45 && D.selection?.short) w *= D.selection.short;
    if (D.selection?.longTextAfter != null && n > D.selection.longTextAfter) w *= D.selection.longText;
    if (emph && D.selection?.emphasis) w *= D.selection.emphasis;
    cands.push([k, w]);
  }
  return cands.length ? rng.wpick(cands) : 'cut';
}
function pickExit(rng, st, en, layout, dur, lastOfLine, history) {
  const weights = noveltyWeights(history, 'exit');
  const cands = [];
  for (const k of J.EXIT_ORDER) {
    if (!en.exit[k]) continue;
    const D = J.EXIT[k]; if (!D) continue;
    let w = wkey(st.bias.exit, k, D.w ?? 1) * (weights.get(k) ?? 1);
    if (D.minDur && dur < D.minDur) w *= 0.15;
    if (D.selection?.weight) w *= D.selection.weight(dur,lastOfLine);
    else if (dur < 0.6) w *= 0.4;
    w *= wkey(J.LAYOUTS[layout]?.exitBias,k,1);
    cands.push([k, w]);
  }
  return cands.length ? rng.wpick(cands) : 'cut';
}
function pickHold(rng, en, fx, history) {
  const weights = noveltyWeights(history, 'hold');
  const cands = J.HOLD_ORDER.filter(k => en.hold[k] !== false && J.HOLD[k]).map(k => {
    const D = J.HOLD[k];
    let w = D.selection?.weight ?? D.w ?? 0.8;
    if (D.selection?.motion || (D.tags && D.tags.includes('glitch'))) w *= 0.4 + fx.motion;
    if (D.selection?.glitch) w *= fx.glitch;
    return [k, w * (weights.get(k) ?? 1)];
  });
  return cands.length ? rng.wpick(cands) : 'still';
}
function decorParams(rng, k) {
  return { id: k, seed: rng.int(1, 1e9), n: rng.int(1, 3) + (J.DECOR[k]?.countBonus || 0), right: rng.chance(0.5), low: rng.chance(0.5), accent: rng.chance(0.4), corner: rng.chance(0.5), big: rng.chance(0.4), mode: rng.pick(['count', 'index']), from: rng.int(0, 20), to: rng.int(30, 999), v: rng.int(0, 5), r: rng() };
}
function pickDecor(rng, st, en, fx, layout, history = []) {
  const count = Math.round(fx.decor * 2.8 * rng.range(0.45, 1.15));
  const recent = new Set(history.slice(-2).flatMap(h => h.decor || []));
  const LD = J.LAYOUTS[layout] || {};
  const cands = J.DECOR_ORDER.filter(k => en.decor[k] && J.DECOR[k] && !(LD.busy && J.DECOR[k].layer === 'back' && !J.DECOR[k].subtle))
    .map(k => [k, wkey(st.decor, k, J.DECOR[k].w != null ? J.DECOR[k].w * 0.5 : 0.35) * (recent.has(k) ? (UNITY ? 2.2 : 0.35) : 1)]);
  const out = [];
  for (let i = 0; i < count && cands.length; i++) {
    const k = rng.wpick(cands);
    cands.splice(cands.findIndex(c => c[0] === k), 1);
    out.push(decorParams(rng, k));
  }
  return out;
}
// text treatment: plain most of the time; the "decor" slider raises how often a treatment is used
function pickTreat(rng, st, en, fx, LD, emph, history) {
  if (LD.treat === false) return 'none';
  if (!rng.chance(0.18 + 0.42 * (fx.decor ?? 0.5) + (emph ? 0.15 : 0))) return 'none';
  const weights = noveltyWeights(history, 'treat');
  const cands = J.TREAT_ORDER.filter(k => k !== 'none' && en.treat && en.treat[k] !== false && J.TREAT[k] && (LD.treat !== 'safe' || J.TREAT[k].safe))
    .map(k => [k, wkey(st.bias && st.bias.treat, k, J.TREAT[k].w ?? 1) * (weights.get(k) ?? 1)]);
  return cands.length ? rng.wpick(cands) : 'none';
}
function pickBg(rng, st, en, fx, bgHist) {
  if (!rng.chance(0.2 + 0.35 * (fx.decor ?? 0.5) + 0.2 * (fx.bgSwitch ?? 0.35))) return 'none';
  const last = bgHist.slice(-3);
  const cands = J.BG_ORDER.filter(k => k !== 'none' && en.bg && en.bg[k] !== false && J.BG[k])
    .map(k => [k, wkey(st.bias && st.bias.bg, k, J.BG[k].w ?? 1) * (last.includes(k) ? (UNITY ? 2.4 : 0.25) : 1)]);
  return cands.length ? rng.wpick(cands) : 'none';
}
function pickCam(rng, st, en, fx, LD, emph, history) {
  const weights = noveltyWeights(history, 'cam');
  const cands = J.CAMERA_ORDER.filter(k => en.cam && en.cam[k] !== false && J.CAMERA[k]).map(k => {
    const D = J.CAMERA[k];
    let w = wkey(st.bias && st.bias.cam, k, D.w ?? 1) * (weights.get(k) ?? 1);
    if (D.strong) w *= 0.25 + 0.9 * (fx.motion ?? 0.7) + (emph ? 0.6 : 0);
    if (LD.cam === false && k !== 'push') w *= 0.05;
    return [k, w];
  });
  return cands.length ? rng.wpick(cands) : 'push';
}
function pickTrans(rng, st, en, fx, emph, history) {
  if (!J.TRANS_ORDER.length) return null;
  if (!rng.chance(0.1 + 0.22 * (fx.motion ?? 0.7) + (emph ? 0.08 : 0))) return null;
  const weights = noveltyWeights(history, 'trans');
  const cands = J.TRANS_ORDER.filter(k => en.trans && en.trans[k] !== false && J.TRANS[k])
    .map(k => [k, wkey(st.bias && st.bias.trans, k, J.TRANS[k].w ?? 1) * (weights.get(k) ?? 1)]);
  return cands.length ? rng.wpick(cands) : null;
}
// kind 'edge' = transition at a cut boundary, 'mid' = accent in the middle of a cut
function pickFx(rng, st, en, fx, emph, fxHist, kind) {
  const g = fx.glitch ?? 0.55;
  const p = kind === 'edge' ? 0.12 + 0.38 * g + 0.12 * (fx.motion ?? 0.7) + (emph ? 0.15 : 0) : 0.05 + 0.2 * g;
  if (!rng.chance(p)) return null;
  const last = fxHist.slice(-3);
  const cands = J.FXE_ORDER.filter(k => { const D = J.FXE[k]; return D && !D.builtin && en.fx && en.fx[k] !== false && (kind === 'edge' ? D.edge !== false : D.mid); })
    .map(k => { const D = J.FXE[k]; let w = wkey(st.bias && st.bias.fx, k, D.w ?? 1) * (last.includes(k) ? (UNITY ? 1.8 : 0.2) : 1); if (D.glitchy) w *= 0.3 + g * 1.4; return [k, w]; });
  return cands.length ? rng.wpick(cands) : null;
}

J.designSize = (input) => {
  const project = typeof input === 'object' && input ? input : null;
  if (project && project.videoSize && Number.isFinite(+project.videoSize.w) && Number.isFinite(+project.videoSize.h) && +project.videoSize.w >= 16 && +project.videoSize.h >= 16) {
    const w = +project.videoSize.w, h = +project.videoSize.h;
    return [1920 * w / Math.max(w, h), 1920 * h / Math.max(w, h)];
  }
  const aspect = project ? project.aspect : input;
  if (aspect === '9:16') return [1080, 1920];
  if (aspect === '1:1') return [1440, 1440];
  if (aspect === '4:5') return [1440, 1800];
  if (aspect === '21:9') return [2520, 1080];
  if (aspect === '4:3') return [1440, 1080];
  if (aspect === '3:4') return [1080, 1440];
  return [1920, 1080];
};
J.outputSize = (project) => {
  if (project.videoSize && Number.isFinite(+project.videoSize.w) && Number.isFinite(+project.videoSize.h) && +project.videoSize.w >= 16 && +project.videoSize.h >= 16) return [J.clamp(Math.round(+project.videoSize.w / 2) * 2, 16, 8192), J.clamp(Math.round(+project.videoSize.h / 2) * 2, 16, 8192)];
  const [W, H] = J.designSize(project.aspect);
  const k = (project.res || 1080) / Math.min(W, H);
  return [Math.round(W * k / 2) * 2, Math.round(H * k / 2) * 2];
};
})();
