/* Native single-block framed typography and its static/line furniture. */
(()=>{'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],layouts=new Set(['frameBox','quote','ruler']);
function framedUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 if(!layouts.has(cut.layout)||!holdOnly||!holdWindow||cut.layoutARecipe||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    (cut.groupExit??cut.exit)!==cut.exit||!(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>d.id==='memphis'||d.id==='starburst')||
    /[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text))return null;
 const earliest=holdWindow.native.start-holdWindow.step-1.6/24;
 if(!Number.isFinite(earliest)||earliest<cut.start||
    holdWindow.native.end>cut.start+cut.dur-cut.outDur)return null;
 A.layoutsAFormulaDomain({...plan,W,H},cut,true);
 const renderer=Object.create(J.Renderer.prototype),program=A.sourceFormulaBase.construct(renderer,{...plan,W,H},cut,{W,H,time:1.5,pass:'main'}),events=program.events,
       mains=events.filter(e=>e.kind==='item'&&e.args[0].placementMain);
 // Both sources have exactly one untransformed main block and return its bbox
 // or its nominal J.measure box. Other painted objects are retained below.
 if(mains.length!==1||events.some(e=>e.role!=='primary'||e.clips?.length))return null;
 const e=mains[0],item=e.args[0],norm=x=>String(x??'').replace(/\s/g,'');
 if(e.matrix.some((v,i)=>Math.abs(v-ID[i])>1e-9)||item.rot||item.skew||item.vertical||norm(item.text)!==norm(cut.text))return null;
 const source={...cut,layout:'center',area:null,params:{}},main=A.centerCircle.sourceUnits(item,source,{...plan,W,H},{holdOnly:false});
 if(!main)return null;
 const units=main.units.map(u=>({...u,owner:cut.layout+'.main.'+u.owner})),other={...program,events:events.filter(x=>x!==e)};
 if(other.events.length){
  // The existing A26 source sweep covers quote mark travel and complete
  // partial frame paths, without enumerating frames. Full source travel is
  // conservative for the requested hold, including lagged ghost passes.
  const sweeps=A.layoutsASourceEnvelopes(other,{...plan,W,H},program.sourceCut,false);
  for(let i=0;i<sweeps.length;i++)units.push({owner:cut.layout+'.furniture.'+i,kind:'native-sweep',bounds:A.bounds([sweeps[i]])});
 }
 const fallback=J.itemBox(item),ranges=Object.fromEntries(['x0','x1','y0','y1'].map(k=>[k,[Math.min(main.bbRangesAny[k][0],fallback[k]),Math.max(main.bbRangesAny[k][1],fallback[k])]]));
 for(const d of cut.decor||[]){
  const args={W,H,P:d,cut,st,bbRanges:[ranges],includeFallback:true},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);
  if(!parts?.length)return null;units.push(...parts);
 }
 return {units,bbRanges:ranges,scope:'native-hold'};
}
A.framedUnits=args=>{try{return framedUnits(args);}catch(e){if(e.code&&(e.code.startsWith('UNSUPPORTED_')||e.code.startsWith('SOURCE_FORMULA_')||e.code==='GEOMETRY_LIMIT'))return null;throw e;}};
})();
