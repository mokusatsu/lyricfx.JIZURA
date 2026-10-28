// Test-only synchronous source-Y binding. No frame/certificate authority.
(()=>{let active=null;const need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
const read=(env,rows)=>{if(!active)return 0;need(active.env===env&&rows===1,'DOMINO82J_BOUND_ONE_ROW');return active.dy;};
const withShift=(env,dy,run)=>{need(!active,'DOMINO82J_NESTED');need(env?.cut?.layout==='dominoes'&&Number.isFinite(dy)&&typeof run==='function','DOMINO82J_INPUT');active={env,dy};try{const out=run();need(!out||typeof out.then!=='function','DOMINO82J_SYNC_ONLY');return out;}finally{active=null;}};
Object.defineProperty(J.placement,'dominoSourceShift82j',{value:Object.freeze({read,withShift,sourceOnly:true,certificateIssuer:false})});})();
