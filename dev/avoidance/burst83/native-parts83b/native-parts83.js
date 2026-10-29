/* Source-only burst call descriptors. Potential source calls, not paint count. */
(()=>{'use strict';const A=J.placement,G=A.burstNativeGeometry83a,E=J.E;
function describe(env,geometry,scalar,colors){const {W,H,sc}=env,cut=env.cut,Pm=cut.params,s=cut.seed,u=Math.min(W,H),lt=env.lt,{text,o,size,rx,ry,cx,cy}=geometry,{out,q,rot,boil}=scalar,{A,B}=colors,parts=[],emit=(kind,...args)=>parts.push({kind,args}),darkOf=()=>colors.dark,onCol=()=>colors.onA,gIn=e=>e.lt<.6&&e.pOut<=0,star=(k,scale,jit)=>G.star(env,geometry,scalar,k,scale,jit);
    // shock ring + speed lines + debris
    const ring = J.clamp(lt / 0.45);
    if (ring < 1) emit('circle',cx, cy, Math.max(rx, ry) * (0.6 + ring * 1.1), null, A, Math.max(2, u * 0.012) * (1 - ring), (1 - ring) * out, false);
    if (Pm.lines && env.pass === 'main') {
      const L = 28;
      for (let i = 0; i < L; i++) {
        if (J.r(s, i, env.step, 9) < 0.3) continue;
        const a = i / L * J.TAU + J.rs(s, i, 8) * 0.08;
        const r0 = 1.25 + J.r(s, i, env.step, 10) * 0.15, r1 = r0 + 0.2 + J.r(s, i, 11) * 0.25;
        emit('line',[[cx + Math.cos(a) * rx * r0 * q, cy + Math.sin(a) * ry * r0 * q], [cx + Math.cos(a) * rx * r1 * q, cy + Math.sin(a) * ry * r1 * q]], sc.sub, Math.max(1.5, u * 0.004), 0.7 * out, false);
      }
    }
    if (Pm.debris && lt < 0.9) {
      for (let i = 0; i < 12; i++) {
        const a = J.r(s, i, 21) * J.TAU, sp = J.rr(0.5, 1.1, s, i, 22), f = E.outCubic(J.clamp(lt / 0.8));
        const d = (1.05 + f * 0.6 * sp), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d + f * f * H * 0.05;
        const sz = u * 0.018 * (1 - f), rr = J.r(s, i, 23) * J.TAU + f * 6;
        if (sz > 0.5) emit('poly',[[x + Math.cos(rr) * sz, y + Math.sin(rr) * sz], [x + Math.cos(rr + 2.2) * sz, y + Math.sin(rr + 2.2) * sz], [x + Math.cos(rr + 4.1) * sz * 0.7, y + Math.sin(rr + 4.1) * sz * 0.7]], i % 2 ? A : B, out, false);
      }
    }
    if (q <= 0.01) return {parts,culled:true};
    emit('poly',star(1, 1.12, 0.22).map(([x, y]) => [x + u * 0.012, y + u * 0.016]), darkOf(sc), 0.3 * out, false);
    emit('poly',star(1, 1.12, 0.22), A, out, gIn(env));
    emit('poly',star(2, 0.93, 0.12), B, out, false);
    emit('poly',star(3, 0.86, 0.08), A, out, false);
    emit('glyph', Object.assign({ text, font: Pm.font, size: size * Math.min(1, q), x: cx, y: cy, rot: rot / J.DEG * 0.6, color: onCol(sc, A) }, o));
return{parts,culled:false};}
Object.defineProperty(A,'burstNativeParts83b',{value:Object.freeze({describe,sourceOnly:true,certificateIssuer:false})});})();
