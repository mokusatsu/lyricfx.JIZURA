/* ================================================================== 11 magnets — マグネット文字 */
const DECOY = 'ABCDEFGHKMNPRSTXYZ0123456789★♥♪?!';
reg('magnets', {
  name: 'マグネット', tags: ['pop', 'graphic'], w: 0.7, treat: false, busy: true, ae: 'scatter', fits: n => n >= 1 && n <= 14,
  enterBias: { cut: 2.5, pop: 1.3, drop: 0.8, slice: 0.2, wipe: 0.2, stretch: 0.3 },
  plan(rng, cut, st) {
    return { font: rng.pick(fontsOf(st, ['display'])), df: rng.pick(fontsOf(st, ['display', 'body'])), decoys: rng.int(6, 11), handle: rng.pick([1, -1]), colOff: rng.int(0, 4), tilt: rng.range(6, 12) };
  },
  render(env) {
    const { W, H, sc, ctx } = env, cut = env.cut, Pm = cut.params, s = cut.seed, u = U(env), lt = env.lt;
    const nativeD = cut.placementLayoutsD === true;
    const owned = (role, owner, fn) => nativeD ? env.withDrawRole(role, 'magnets.' + owner, fn) : fn();
    const freeze = v => { if (v && typeof v === 'object' && !Object.isFrozen(v)) { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
    const port = isPort(env);
    const chs = slotsOf(cut.text), n = chs.filter(c => c !== ' ').length;
    if (!n) return null;
    const catalog = nativeD ? {kind:'magnets-native-catalog',version:1,nativeOnly:true,stage:[W,H],pass:env.pass,clock:{t:env.t,realTime:env.realTime,lt,ltb:env.ltb,pOut:env.pOut},seed:s,port,n,params:{font:Pm.font,df:Pm.df,decoys:Pm.decoys,handle:Pm.handle,colOff:Pm.colOff,tilt:Pm.tilt},scene:{classification:'independentDecor-source-inventory39',board:null,gradient:null,handle:null},rows:[],glyphs:[],decoys:[],primaryOwners:[],independentDecorOwners:['magnets.scene.board','magnets.scene.gradient','magnets.scene.handle'],painterOrder:'board,main-only-gradient,handle,main-only-each-decoy-depth-body,each-lyric-depth-body'} : null;
    if(nativeD)env.placementDGeometry=catalog;
    try {
    const out = tout(env);
    const ba = tin(env, 0, 0.45, E.outCubic) * out;
    // the board (fridge door)
    const mx = W * 0.04, my = H * 0.05, bw = W - mx * 2, bh = H - my * 2, rr = u * 0.03;
    const board = J.mix(sc.bg, sc.fg, J.lum(sc.bg) < 0.5 ? 0.07 : 0.06);
    const boardStroke=J.mix(sc.bg, sc.fg, 0.16),boardLW=Math.max(1, u * 0.002);
    if(nativeD){catalog.out=out;catalog.ba=ba;catalog.scene.board={owner:'magnets.scene.board',x:mx,y:my+(1-ba)*H*.04,w:bw,h:bh,r:rr,color:board,alpha:ba,ghost:false,stroke:boardStroke,lineWidth:boardLW};}
    owned('independentDecor','scene.board',()=>env.rrect(mx, my + (1 - ba) * H * 0.04, bw, bh, rr, board, ba, false, boardStroke, boardLW));
    if (env.pass === 'main' && ba > 0) {
      const g = ctx.createLinearGradient(mx, my, mx + bw, my + bh);
      if(nativeD)catalog.scene.gradient={owner:'magnets.scene.gradient',kind:'literal-linear-gradient-rounded-path',from:[mx,my],to:[mx+bw,my+bh],stops:[],path:{x:mx,y:my+(1-ba)*H*.04,w:bw,h:bh,r:rr},alpha:ba};
      const stop=(offset,color)=>{if(nativeD)catalog.scene.gradient.stops.push({offset,color});g.addColorStop(offset,color);};
      stop(0, J.rgba(lightOf(sc), 0.06)); stop(0.45, J.rgba(lightOf(sc), 0)); stop(0.5, J.rgba(lightOf(sc), 0.04)); stop(1, J.rgba(lightOf(sc), 0));
      owned('independentDecor','scene.gradient',()=>{ctx.save(); ctx.globalAlpha = ba; ctx.fillStyle = g; ctx.beginPath(); rrPath(ctx, mx, my + (1 - ba) * H * 0.04, bw, bh, rr); ctx.fill(); ctx.restore();});
    }
    const hx = Pm.handle > 0 ? mx + bw - u * 0.05 : mx + u * 0.035, hh = bh * 0.34;
    const handleColor=J.mix(board, sc.fg, 0.2);
    if(nativeD)catalog.scene.handle={owner:'magnets.scene.handle',x:hx,y:H/2-hh/2,w:u*.016,h:hh,r:u*.008,color:handleColor,alpha:ba,ghost:false};
    owned('independentDecor','scene.handle',()=>env.rrect(hx, H / 2 - hh / 2, u * 0.016, hh, u * 0.008, handleColor, ba, false));
    // lyric layout in rows
    const per = port ? 4 : 8;
    const rowsT = n > per ? chunksK(flat(cut.text), Math.ceil(n / per)) : [flat(cut.text)];
    const nR = rowsT.length;
    let base = Math.min(u * 0.22, H * 0.56 / (nR * 1.12));
    for (const r of rowsT) { let a = 0; for (const ch of r) a += adv(Pm.font, ch) * (J.isKanji(ch) ? 1 : 0.86) * 1.1; base = Math.min(base, bw * 0.8 / Math.max(1, a)); }
    const cols = objCols(sc);
    const items = [];
    rowsT.forEach((row, ri) => {
      const chars = [...row];
      const ks = chars.map(ch => (J.isKanji(ch) ? 1 : J.isPunct(ch) ? 0.6 : J.isSmallKana(ch) ? 0.7 : 0.86));
      const ads = chars.map((ch, i) => adv(Pm.font, ch) * base * ks[i] * 1.1), tot = ads.reduce((a, b) => a + b, 0);
      if(nativeD)catalog.rows.push({row:ri,text:row,chars:chars.slice(),ks:ks.slice(),advances:ads.slice(),totalAdvance:tot});
      let x = W / 2 - tot / 2;
      const y = H / 2 + (ri - (nR - 1) / 2) * base * 1.14;
      chars.forEach((ch, i) => {
        const cx = x + ads[i] / 2; x += ads[i];
        if (ch === ' ') return;
        const q = items.length;
        items.push({ ch, x: cx + J.rs(s, q, 1) * base * 0.04, y: y + J.rs(s, q, 2) * base * 0.08 + base * ks[i] * 0 , size: base * ks[i], rot: J.rs(s, q, 3) * Pm.tilt, col: cols[(q * 7 + Pm.colOff) % cols.length], q });
      });
    });
    if(nativeD){catalog.per=per;catalog.nR=nR;catalog.base=base;catalog.colors=cols.slice();catalog.glyphs=items.map(m=>({...m,font:Pm.font,emitted:false}));catalog.primaryOwners=items.flatMap(m=>['depth','body'].map(part=>'magnets.glyph.'+m.q+'.'+part));}
    // decoy magnets around the edges (never over the lyric band)
    const bandY0 = H / 2 - nR * base * 0.62, bandY1 = H / 2 + nR * base * 0.62;
    if(nativeD)catalog.band={y0:bandY0,y1:bandY1};
    if (env.pass === 'main') {
      for (let d = 0; d < Pm.decoys; d++) {
        const ta = 0.05 + d * 0.04, e = J.clamp((lt - ta) / 0.2);
        if(nativeD)catalog.decoys.push({d,ta,e,emitted:e>0});
        if (e <= 0) continue;
        const top = d % 2 === 0, half = Math.ceil(Pm.decoys / 2), slot = Math.floor(d / 2);
        const sz = Math.min(base * J.rr(0.36, 0.58, s, d, 14), u * 0.09);
        const y = top ? J.lerp(my + bh * 0.08 + sz * 0.6, Math.max(my + bh * 0.1 + sz * 0.6, bandY0 - sz * 0.8), J.r(s, d, 11)) : J.lerp(Math.min(my + bh * 0.9 - sz * 0.6, bandY1 + sz * 0.8), my + bh * 0.92 - sz * 0.6, J.r(s, d, 11));
        const x = mx + bw * (0.1 + 0.8 * (slot + 0.2 + 0.6 * J.r(s, d, 12)) / half);
        const ch = DECOY[J.h(s, d, 13) % DECOY.length], rot = J.rs(s, d, 15) * 25, col = cols[(d + 2 + Pm.colOff) % cols.length];
        const k = 1 + 0.25 * (1 - E.outCubic(e));
        if(nativeD){Object.assign(catalog.decoys[d],{ch,font:Pm.df,top,half,slot,size:sz,k,animatedSize:sz*k,x,y,rot,col,depth:{x:x+sz*.05,y:y+sz*.07,alpha:.28*out*e},body:{alpha:.85*out*e},stroke:sz*.08});catalog.independentDecorOwners.push('magnets.decoy.'+d+'.depth','magnets.decoy.'+d+'.body');}
        owned('independentDecor','decoy.'+d+'.depth',()=>env.draw({ text: ch, font: Pm.df, size: sz * k, x: x + sz * 0.05, y: y + sz * 0.07, rot, color: darkOf(sc), stroke: sz * 0.08, strokeColor: darkOf(sc), strokeUnder: true, alpha: 0.28 * out * e, ghost: false }));
        owned('independentDecor','decoy.'+d+'.body',()=>env.draw({ text: ch, font: Pm.df, size: sz * k, x, y, rot, color: col, stroke: sz * 0.08, strokeColor: col, strokeUnder: true, alpha: 0.85 * out * e, ghost: false }));
      }
    }
    let bb = null;
    const gap = J.clamp(cut.dur * 0.32 / n, 0.04, 0.1);
    if(nativeD)catalog.gap=gap;
    for (const m of items) {
      const t1 = 0.18 + m.q * gap;
      const f = (lt - t1) / 0.16;
      if(nativeD)Object.assign(catalog.glyphs[m.q],{t1,f,emitted:f>=0});
      if (f < 0) continue;
      const snap = f < 1 ? 1.28 - 0.28 * E.inQuad(f) : 1 - 0.05 * Math.exp(-(f - 1) * 0.16 / 0.05) * Math.cos((f - 1) * 3);
      const lift = f < 1 ? 1 - f : 0;
      const sz = m.size * snap;
      if(nativeD)Object.assign(catalog.glyphs[m.q],{snap,lift,animatedSize:sz,stroke:sz*.08,depth:{x:m.x+m.size*(.04+lift*.12),y:m.y+m.size*(.06+lift*.18),alpha:(.3-lift*.15)*out}});
      owned('primary','glyph.'+m.q+'.depth',()=>env.draw({ text: m.ch, font: Pm.font, size: sz, x: m.x + m.size * (0.04 + lift * 0.12), y: m.y + m.size * (0.06 + lift * 0.18), rot: m.rot, color: darkOf(sc), stroke: sz * 0.08, strokeColor: darkOf(sc), strokeUnder: true, alpha: (0.3 - lift * 0.15) * out, ghost: false }));
      const mi=miAt(env,t1);if(nativeD)catalog.glyphs[m.q].mi=mi;
      bb = UB(bb, owned('primary','glyph.'+m.q+'.body',()=>J.mainDraw(env, { text: m.ch, font: Pm.font, size: sz, x: m.x, y: m.y, rot: m.rot, color: m.col, stroke: sz * 0.08, strokeColor: m.col, strokeUnder: true, plain: true, mi })));
    }
    return bb;
    } finally {if(nativeD)freeze(catalog);}
  },
});

