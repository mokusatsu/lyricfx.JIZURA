/* Isolated SOURCE-only seam; no registry, Canvas, renderer or product modification. */
const J={};
J.clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
J.h = function (a, b, c, d, e) {      // up to 5 numeric keys -> uint32
  let h = 0x9e3779b9 ^ (a | 0);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = (h + Math.imul((b | 0) + 0x632be5ab, 0xc2b2ae35)) | 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h = (h + Math.imul((c | 0) + 0x5bd1e995, 0x27d4eb2f)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x165667b1);
  h = (h + Math.imul((d | 0) + 0x1b873593, 0x85ebca6b)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x27d4eb2f);
  h = (h + Math.imul((e | 0) + 0x68e31da4, 0x9e3779b1)) | 0;
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return h >>> 0;
};
J.r = (a, b, c, d, e) => J.h(a, b, c, d, e) / 4294967296;          // 0..1
J.isSmallKana = c => 'ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ'.includes(c);
J.isPunct = c => /[、。，．,.!?！？…‥・「」『』（）()【】〈〉《》〔〕［］\[\]'"“”‘’ー〜～:：;；\-—―]/.test(c);
J.isLatin = c => /[A-Za-z0-9]/.test(c);
const U = env => Math.min(env.W, env.H);
const isPort = env => env.H > env.W * 1.08;
const strip = t => String(t || '').replace(/\s+/g, '');
const hasLatin = t => /[A-Za-z]/.test(t);
/* text as one run: latin keeps single word spaces, Japanese drops them */
const flat = t => (hasLatin(t) ? String(t || '').trim().replace(/\s+/g, ' ') : strip(t));
/* glyph slots keeping single word gaps (latin lyrics): a ' ' slot is left empty */
const slotsOf = t => [...flat(t)];
const smallSize = env => J.clamp(U(env) * 0.024, 13, 32);
const KANA = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
const _pool = new Map();
const poolOf = cut => {
  const key = (cut.lineText || '') + '|' + cut.text;
  let p = _pool.get(key);
  if (!p) {
    const own = [...strip((cut.lineText || '') + cut.text)].filter(c => !J.isPunct(c) && !J.isSmallKana(c) && c !== 'ー' && !J.isLatin(c));
    p = own.concat([...KANA].filter((c, i) => i % 3 === 0));
    if (_pool.size > 100) _pool.clear();
    _pool.set(key, p);
  }
  return p;
};

export function topology(env) {
 if(env.W!==960||env.H!==540||env.cut.text!=='風の先へ'||env.cut.seed!==1205||env.cut.params.font!=='dela'||env.cut.params.dens!==.18||env.cut.params.fill!==2||env.cut.params.clue!==true)throw Error('CROSSWORD26_INITIAL_FAMILY');
    const { W, H, sc } = env, cut = env.cut, Pm = cut.params, s = cut.seed, u = U(env), lt = env.lt;
    const port = isPort(env);
    const t0 = flat(cut.text);
    const chs = [...t0].filter(c => c !== ' ');
    const n = chs.length;
    if (!n) return null;
    const maxRow = port ? 7 : 12;
    const words = n > maxRow ? chunksK(t0, Math.ceil(n / maxRow)).map(w => [...w].filter(c => c !== ' ')) : [chs];
    const L = Math.max(...words.map(w => w.length));
    const C = Math.max(L + 2, port ? 7 : 9), R = words.length > 1 ? 7 : port ? 7 : 5;
    const below = Pm.clue && H > W * 0.7, clueW = Pm.clue && !below ? 0.24 : 0;
    const cell = Math.min(W * (0.88 - clueW) / C, H * (below ? 0.64 : 0.8) / R, u * 0.14);
    const gw = C * cell, gh = R * cell;
    const fsC = Math.max(smallSize(env) * 1.15, cell * 0.24);
    const gx = (W - gw - (clueW ? W * clueW : 0)) / 2, gy = (H - gh - (below ? fsC * 5 : 0)) / 2;
    const rowsW = words.length > 1 ? [1, 5] : [Math.floor(R / 2)];
    const c0 = words.map(w => Math.floor((C - w.length) / 2) - (J.h(s, w.length) % 2 && C - w.length > 2 ? 1 : 0));
    // black cells: symmetric scatter that keeps the lyric entries (and their end caps) intact
    const key = (r, c) => r * 64 + c;
    const lyr = new Map();
    words.forEach((w, wi) => w.forEach((ch, j) => lyr.set(key(rowsW[wi], c0[wi] + j), { ch, wi, j })));
    const black = new Set();
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const r2 = R - 1 - r, c2 = C - 1 - c;
      if (lyr.has(key(r, c)) || lyr.has(key(r2, c2))) continue;
      if (J.r(s, Math.min(key(r, c), key(r2, c2)), 3) < Pm.dens) { black.add(key(r, c)); black.add(key(r2, c2)); }
    }
    words.forEach((w, wi) => { const r = rowsW[wi]; if (c0[wi] > 0) black.add(key(r, c0[wi] - 1)); if (c0[wi] + w.length < C) black.add(key(r, c0[wi] + w.length)); });
    const isW = (r, c) => r >= 0 && c >= 0 && r < R && c < C && !black.has(key(r, c));
    // numbering
    const num = new Map(); let k = 1;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (!isW(r, c)) continue;
      const ac = !isW(r, c - 1) && isW(r, c + 1), dn = !isW(r - 1, c) && isW(r + 1, c);
      if (ac || dn) num.set(key(r, c), k++);
    }
    // pencilled crossing entries (down words through some lyric cells)
    const pool = poolOf(cut), NP = pool.length;
    const pencil = new Map();
    let fills = 0;
    words.forEach((w, wi) => w.forEach((ch, j) => {
      if (fills >= Pm.fill * words.length || J.r(s, wi, j, 5) > 0.45) return;
      const c = c0[wi] + j, r = rowsW[wi];
      let a = r, b = r; while (isW(a - 1, c)) a--; while (isW(b + 1, c)) b++;
      if (b - a < 2) return;
      fills++;
      for (let rr = a; rr <= b; rr++) if (!lyr.has(key(rr, c))) pencil.set(key(rr, c), pool[J.h(s, rr, c, 6) % NP]);
    }));
 return {W,H,text:t0,n,words,L,C,R,below,clueW,cell,gw,gh,fsC,gx,gy,rowsW,c0,lyr:[...lyr],black:[...black],num:[...num],pencil:[...pencil],fills,pool};
}
export const fixture=Object.freeze({W:960,H:540,cut:{text:'風の先へ',seed:1205,params:{font:'dela',dens:.18,fill:2,clue:true}}});
// Candidate geometry retains topology and cell square ratio. Does not certify ink/FX.
export function candidate(t,{clue='side',cellScale=1,dx=0,dy=0}={}) {
 if(!['side','below'].includes(clue)||![1,.8,.7,.6].includes(cellScale)||![dx,dy].every(Number.isFinite))throw Error('CROSSWORD26_RECIPE');
 const cell=t.cell*cellScale,gw=t.C*cell,gh=t.R*cell,fs=t.fsC;
 const gx=(t.W-gw-(clue==='side'?t.W*.24:0))/2+dx,gy=(t.H-gh-(clue==='below'?fs*5:0))/2+dy;
 const cxl=clue==='below'?gx:gx+gw+t.W*.035,cyl=clue==='below'?gy+gh+fs*1.6:gy+fs;
 return {cell,gw,gh,gx,gy,clue:clue,clues:Array.from({length:4},(_,i)=>[clue==='below'&&i>=2?cxl+gw*.55:cxl,clue==='below'?cyl+(i%2)*fs*1.7:cyl+i*fs*1.9+(i>=2?fs*.8:0)])};
}
