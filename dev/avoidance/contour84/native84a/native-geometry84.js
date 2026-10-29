/* Native contour header/ring source extraction only. No actual Canvas/metrics/authority. */
(()=>{'use strict';const A=J.placement,E=J.E,U=env=>Math.min(env.W,env.H),isPort=env=>env.H>env.W*1.08,strip=t=>String(t||'').replace(/\s+/g,''),tout=env=>1-E.inCubic(env.pOut),tin=(env,d=0,len=.4,ease=E.outExpo)=>ease(J.clamp((env.lt-d)/Math.max(.01,len)));
function header(env){
    const { W, H, sc, ctx } = env, cut = env.cut, Pm = cut.params, u = U(env), lt = env.lt;
    const port = isPort(env);
    const out = tout(env);
    const t0 = strip(cut.text);
    const kan = [...t0].filter(c => J.isKanji(c));
    const big = kan.length ? kan[0] : [...t0].filter(c => !J.isPunct(c) && !J.isSmallKana(c))[0] || [...t0][0] || '';
    const bs = Math.min(H * 0.95, W * (port ? 1.05 : 0.7));
    const bx = W / 2 + Pm.side * W * (port ? 0.12 : 0.2), by = H * 0.5;
    const lineC = Pm.col === 'accent' ? sc.accent : sc.sub;
    // contour rings: a fat stroke in the line colour, then a slightly thinner one in the ground colour → one thin line per level
    const cin = tin(env, 0, 0.5, E.outCubic) * out;
return{port,out,t0,big,bs,bx,by,lineC,cin,u,lt};}
function rings(env){const{W,H,sc}=env,cut=env.cut,Pm=cut.params,{port,out,t0,big,bs,bx,by,lineC,cin,u,lt}=header(env),calls=[],ctx={save(){},restore(){},strokeText(text,x,y){calls.push({kind:'strokeText',text,x,y,font:this.font,align:this.textAlign,baseline:this.textBaseline,lineJoin:this.lineJoin,width:this.lineWidth,alpha:this.globalAlpha,color:this.strokeStyle})},fillText(text,x,y){calls.push({kind:'fillText',text,x,y,font:this.font,align:this.textAlign,baseline:this.textBaseline,alpha:this.globalAlpha,color:this.fillStyle})}};
    if (env.pass === 'main' && big && cin > 0.01) {
      const K = Pm.rings, gap = bs * 0.03, lw = Math.max(1.2, bs * 0.0028);
      const ph = ((env.ltb * Pm.speed) % 1 + 1) % 1;
      const grow = E.outCubic(J.clamp(lt / 0.9));
      ctx.save();
      ctx.font = J.fontCSS(Pm.fb, bs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (let k = K; k >= 1; k--) {
        const wk = 2 * gap * (k - 1 + ph) * grow + gap * 0.6;
        const a = (k === K ? 1 - ph : 1) * (1 - 0.1 * k) * cin;
        if (a <= 0.01) continue;
        ctx.globalAlpha = a * 0.8; ctx.strokeStyle = lineC; ctx.lineWidth = wk + lw; ctx.strokeText(big, bx, by);
        ctx.globalAlpha = 0.94 * cin; ctx.strokeStyle = sc.bg; ctx.lineWidth = Math.max(0.1, wk - lw); ctx.strokeText(big, bx, by);
      }
      ctx.globalAlpha = 0.94 * cin; ctx.fillStyle = sc.bg; ctx.fillText(big, bx, by);
      ctx.globalAlpha = cin; ctx.strokeStyle = lineC; ctx.lineWidth = lw * 1.6; ctx.strokeText(big, bx, by);
      ctx.restore();
    }
return{header:{port,out,t0,big,bs,bx,by,lineC,cin,u,lt},calls,sourceOnly:true,qualified:false};}
Object.defineProperty(A,'contourNativeGeometry84a',{value:Object.freeze({header,rings,sourceOnly:true,certificateIssuer:false})});})();
