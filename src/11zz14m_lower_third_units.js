/* Native lower-third hold supports: main, its bar/label and attached decor. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0];
function lowerThirdUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 const p=cut.params;
 if(cut.layout!=='lowerThird'||!holdOnly||!holdWindow||cut.layoutARecipe||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    !(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !['left','right'].includes(p.side)||!['line','tab'].includes(p.bar)||
    !['romaji','no','copy'].includes(p.label)||
    !(cut.decor||[]).every(d=>d.id==='memphis'||d.id==='starburst')||
    /[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text))return null;
 const earliest=holdWindow.native.start-holdWindow.step-1.6/24;
 if(!Number.isFinite(earliest)||holdWindow.native.start<cut.start||
    holdWindow.native.end>cut.start+cut.dur-(cut.exit==='cut'?0:cut.outDur))return null;
 A.layoutsAFormulaDomain({...plan,W,H},cut,true);
 // Construct the known source primitive structure; time is not a frame proof.
 // 09c supplies the analytic lowerThird sweep for each captured auxiliary.
 const renderer=Object.create(J.Renderer.prototype),program=A.sourceFormulaBase.construct(renderer,{...plan,W,H},cut,{W,H,time:1.5,pass:'main'}),events=program.events,
       mains=events.filter(e=>e.kind==='item'&&e.args[0].placementMain);
 if(mains.length!==1||events.some(e=>e.clips?.length))return null;
 const event=mains[0],item=event.args[0];
 if(event.matrix.some((v,i)=>Math.abs(v-ID[i])>1e-9)||item.rot||item.skew||item.vertical)return null;
 const source={...cut,layout:'center',area:null,params:{}},main=A.centerCircle.sourceUnits(item,source,{...plan,W,H},{holdOnly:true});
 if(!main)return null;
 const ready=cut.start+(cut.enter==='cut'?0:Math.max(.01,cut.inDur));
 if(earliest<ready&&cut.enter==='invertBox'){
  const entry=A.centerCircle.sourceUnits(item,{...source,hold:'still',exit:'cut'},{...plan,W,H},{holdOnly:false});
  if(!entry)return null;
  main.units.push(...entry.units.filter(u=>u.owner==='center.invertBox'));
 }
 const units=main.units.map(u=>({...u,owner:'lowerThird.main.'+u.owner}));
 const others={...program,events:events.filter(e=>e!==event)};
 if(others.events.length){
  const sweeps=A.layoutsASourceEnvelopes(others,{...plan,W,H},program.sourceCut,true);
  for(let i=0;i<sweeps.length;i++)units.push({owner:'lowerThird.aux.'+i,kind:'native-sweep',bounds:A.bounds([sweeps[i]])});
 }
 // The leading square follows the extending bar. Its full path between the
 // edge and final reach is not covered by the endpoint square's 09c sweep.
 const m=J.measure(item),th=Math.max(3,item.size*.055),reach=W*.07+m.w+item.size*.45,
       by=H*((H>W*1.08?.8:.83)-p.lift),r=th*1.3+2;
 units.push({owner:'lowerThird.bar-path',kind:'native-sweep',bounds:p.side==='left'?{x0:-r,x1:reach+r,y0:by-r,y1:by+th+r}:{x0:W-reach-r,x1:W+r,y0:by-r,y1:by+th+r}});
 // Native returns its own nominal box when no glyph bbox exists, not centerBB.
 // Remember any partial bbox after a seek as well as that fallback.
 const fallback=J.itemBox(item),bbRanges=Object.fromEntries(['x0','x1','y0','y1'].map(k=>[k,[Math.min(main.bbRangesAny[k][0],fallback[k]),Math.max(main.bbRangesAny[k][1],fallback[k])]]));
 for(const d of cut.decor||[]){
  const args={W,H,P:d,cut,st,bbRanges:[bbRanges],includeFallback:true},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);
  if(!parts?.length)return null;
  units.push(...parts);
 }
 return {units,bbRanges,scope:'native-hold'};
}
A.lowerThirdUnits=args=>{try{return lowerThirdUnits(args);}catch(e){if(e.code&&(e.code.startsWith('UNSUPPORTED_')||e.code.startsWith('SOURCE_FORMULA_')||e.code==='GEOMETRY_LIMIT'))return null;throw e;}};
})();
