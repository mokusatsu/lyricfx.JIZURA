/* Local source-content supports for native mixed/scatter owner transport.
   Caller must retain the native clip and project each translated support,
   all eligible ghost passes and their offsets, camera and post effects. */
(()=>{'use strict';
const A=J.placement,ID=[1,0,0,1,0,0];
const union=xs=>xs.length?{x0:Math.min(...xs.map(b=>b.x0)),y0:Math.min(...xs.map(b=>b.y0)),x1:Math.max(...xs.map(b=>b.x1)),y1:Math.max(...xs.map(b=>b.y1))}:null;
function multirowSourceComponents({W,H,cut,plan,st,holdWindow}){
 if(!['mixed','scatter'].includes(cut.layout)||!holdWindow||cut.layoutARecipe||
    !(W>0&&H>0&&Number.isFinite(W+H))||typeof cut.text!=='string'||
    /[\s\p{Mark}\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text)||
    (cut.treat||'none')!=='none'||cut.enter!=='invertBox'||cut.exit!=='tyStrike'||
    !['still','knCounterRock'].includes(cut.hold)||
    (cut.groupExit??cut.exit)!==cut.exit||!(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !Array.isArray(cut.decor)||cut.decor.length!==1||cut.decor[0].id!=='memphis')return null;
 const earliest=holdWindow.native.start-holdWindow.step-1.6/24;
 if(!Number.isFinite(earliest)||earliest<cut.start||holdWindow.native.end>cut.start+cut.dur-cut.outDur)return null;
 A.layoutsAFormulaDomain({...plan,W,H},cut,true);
 const renderer=Object.create(J.Renderer.prototype),time=Math.max(2,cut.inDur*2+.7),program=A.sourceFormulaBase.construct(renderer,{...plan,W,H},cut,{W,H,time,pass:'main'}),events=program.events;
 const main=events.filter(e=>e.kind==='item'&&e.args[0].placementMain),chars=[...cut.text];
 if(main.length!==chars.length||main.length<2||main.length>16||events.some(e=>e.role!=='primary'||e.clips?.length))return null;
 const items=[],source={...cut,layout:'center',area:null,params:{}},sourcePlan={...plan,W,H};
 for(let i=0;i<main.length;i++){
  const e=main[i],item=e.args[0],angle=item.rot||0;
  if(item.mi!==i||item.text!==chars[i]||item.skew||item.vertical||e.matrix.some((v,j)=>Math.abs(v-ID[j])>1e-9)||!Number.isFinite(angle)||Math.abs(angle)>90||
     (item.enter&&item.enter!==cut.enter)||(item.exit&&item.exit!==cut.exit)||(item.hold&&item.hold!==cut.hold)||item.clip||item.clipY||item.clipFn||item.pieceFn||item.ghost===false)return null;
  const lay=J.layoutText({...item,_lay:null,_m:null});if(lay.length!==1||lay[0].ch!==chars[i])return null;
  // One call covers glyph, full native invertBox entrance and tyStrike exit.
  const part=A.centerCircle.sourceUnits({...item,rot:0},source,sourcePlan,{holdOnly:false});if(!part)return null;
  const c=Math.cos(angle*J.DEG),s=Math.sin(angle*J.DEG),rot=b=>A.bounds([[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]].map(([x,y])=>[item.x+(x-item.x)*c-(y-item.y)*s,item.y+(x-item.x)*s+(y-item.y)*c])]);
  const select=prefix=>union(part.units.filter(u=>u.owner.startsWith(prefix)).map(u=>rot(u.bounds)));
  const itemBounds=select('center.glyph.'),entryBounds=select('center.invertBox'),exitBounds=select('center.strike.');
  if(!itemBounds||!entryBounds||!exitBounds)return null;
  items.push({mi:i,itemBounds,bbRangesAny:part.bbRangesAny,entryBounds,exitBounds});
 }
 const others=events.filter(e=>!main.includes(e));
 // Scatter's extras are unshifted native background text. Reject any other
 // source event shape whose ownership cannot be established from the layout.
 if(others.some(e=>cut.layout!=='scatter'||e.kind!=='item'||!/^scatter\.extra\.\d+$/.test(e.owner)||e.args[0].ghost!==false))return null;
 const fixedFurniture=[];
 for(const e of others){const polygons=A.layoutsASourceEnvelopes({...program,events:[e]},sourcePlan,program.sourceCut,false);if(!polygons.length)return null;fixedFurniture.push({owner:e.owner,bounds:A.bounds(polygons),ghost:false});}
 return {items,fixedFurniture,nativeFallback:{x0:W*.35,x1:W*.65,y0:H*.4,y1:H*.6},scope:'native-source-all-clocks',requiresGhostCameraAndClipProjection:true};
}
A.multirowSourceComponents=args=>{try{return multirowSourceComponents(args);}catch(e){if(e.code&&(e.code.startsWith('UNSUPPORTED_')||e.code.startsWith('SOURCE_FORMULA_')||e.code==='GEOMETRY_LIMIT'))return null;throw e;}};
})();
