/* Source-only native burst scalar/star extraction. No Canvas/support/adapter. */
(()=>{'use strict';const A=J.placement,E=J.E,tout=env=>1-E.inCubic(env.pOut);
function motion(env){const Pm=env.cut.params,lt=env.lt;
    const out = tout(env);
    const q = E.outBack(J.clamp(lt / 0.3), 2.2) * (1 - 0.6 * E.inCubic(env.pOut)) * (1 + 0.015 * Math.sin(env.ltb * 7) * J.clamp(lt - 0.3));
    const rot = (Pm.tilt + (1 - E.outCubic(J.clamp(lt / 0.3))) * -25 + E.inCubic(env.pOut) * 20) * J.DEG;
    const boil = Math.floor(env.step / 3);
return{out,q,rot,boil};}
function star(env,geometry,scalar,k,scale,jit){const Pm=env.cut.params,s=env.cut.seed,{cx,cy,rx,ry}=geometry,{q,rot,boil}=scalar;
      const N = Pm.spikes, pts = [];
      for (let i = 0; i < N * 2; i++) {
        const a = i / (N * 2) * J.TAU + rot;
        const rr = i % 2 ? Pm.sharp + J.rs(s, i, k, boil) * 0.04 : 1 + J.r(s, i, k, boil) * jit;
        pts.push([cx + Math.cos(a) * rx * rr * scale * q, cy + Math.sin(a) * ry * rr * scale * q]);
      }
      return pts;

}
Object.defineProperty(A,'burstNativeGeometry83a',{value:Object.freeze({motion,star,sourceOnly:true,certificateIssuer:false})});})();
