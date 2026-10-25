/* Isolated SOURCE73 row translation seam, no adapter/safe flag. */
(()=>{'use strict';
const need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c});};
let active=null;
function withRecipe(recipe,fn){
 need(!active,'DOMINO73_NESTED_BINDING');
 need(recipe&&['native','joint-translation','row-translation'].includes(recipe.kind),'DOMINO73_RECIPE_UNSUPPORTED');
 const deltas=recipe.kind==='native'?[]:recipe.deltas;
 need(Array.isArray(deltas)&&deltas.length<=3&&deltas.every(d=>Array.isArray(d)&&d.length===2&&d.every(Number.isFinite)),'DOMINO73_DELTAS');
 if(recipe.kind==='joint-translation')need(deltas.length===1,'DOMINO73_JOINT_DELTA');
 if(recipe.kind==='row-translation')need(deltas.length>=2,'DOMINO73_ROWS_REQUIRED');
 active={kind:recipe.kind,deltas:deltas.map(d=>d.slice()),rows:[]};
 try {const result=fn();return{result,rows:active.rows};}finally{active=null;}
}
function enter(env,model){
 if(!active)return null;
 need(env.W===960&&env.H===540,'DOMINO73_VIEWPORT_UNSUPPORTED');
 need(model.rowsD.length>=1&&model.rowsD.length<=3,'DOMINO73_ROW_SCOPE');
 // Initial family deliberately excludes spaces, explicit line breaks and non-BMP
 // graphemes. Original row/gi semantics are retained, never repaired silently.
 need(/^[\u3040-\u30ff\u3400-\u9fff]{2,14}$/.test(env.cut.text),'DOMINO73_TEXT_UNSUPPORTED');
 need(env.cut.lyricSize==null&&(env.cut.contentScale??1)===1,'DOMINO73_EXPLICIT_SIZE_UNSUPPORTED');
 if(active.kind==='row-translation')need(active.deltas.length===model.rowsD.length,'DOMINO73_ROW_DELTA_COUNT');
 const delta=active.kind==='native'?[0,0]:active.deltas[active.kind==='joint-translation'?0:model.r];
 const old=Object.getOwnPropertyDescriptor(env,'drawOwnership');
 const row={...model,rowsD:model.rowsD.map(r=>r.slice()),delta:delta.slice(),pass:env.pass,lt:env.lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut};
 active.rows.push(row);env.drawOwnership={role:'primary',owner:'dominoes.row.'+model.r};
 return{dx:delta[0],dy:delta[1],restore(){if(old)Object.defineProperty(env,'drawOwnership',old);else delete env.drawOwnership;}};
}
J.domino73=Object.freeze({withRecipe,enter,status:'isolated-source-seam-only',scaleSupported:false});
})();
