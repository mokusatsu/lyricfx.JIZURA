/* Native vcols hold ownership, preserving repeat and split source branches. */
(() => {
'use strict';
const A=J.placement;
const union=bs=>({x0:Math.min(...bs.map(b=>b.x0)),x1:Math.max(...bs.map(b=>b.x1)),y0:Math.min(...bs.map(b=>b.y0)),y1:Math.max(...bs.map(b=>b.y1))});
function verticalUnits({W,H,cut,plan,sc,holdOnly=true,holdWindow}){
 if(cut.layout!=='vcols'||!holdOnly||!holdWindow||(cut.treat||'none')!=='none'||
    !['cut','flicker','invertBox'].includes(cut.enter)||!['cut','tyStrike'].includes(cut.exit)||
    !['still','knCounterRock'].includes(cut.hold)||
    !(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>d.id==='memphis'))return null;
 const P=cut.params,text=cut.text.replace(/\s+/g,''),n=J.glyphCount(text),repeat=P.variant==='repeat'&&n<=9;
 if(!n||!['repeat','split'].includes(P.variant)||
    repeat&&(!Number.isInteger(P.cols)||P.cols<1||P.cols>8||!['same','outline','dim'].includes(P.side))||
    !repeat&&!Number.isFinite(P.perCol))return null;
 const items=[],units=[],mains=[];let decorIndex=0;
 if(repeat){
  // These are the native repeat items, including the outline side columns,
  // alpha-only dim style, mi truncation and selected center-column bbox.
  const cols=P.cols,mid=(cols-1)/2,size=Math.min(H*.8/(n*1.04),W*.86/(cols*1.75));
  decorIndex=Math.round(mid);
  for(let i=0;i<cols;i++){
   const side=i!==decorIndex,item={text,font:P.font,size,x:W/2+(i-mid)*size*1.75,y:H/2,vertical:true,track:.04,mi:Math.abs(i-mid)*2};
   if(side&&P.side==='outline'){item.fill=false;item.stroke=Math.max(1.2,size*.012);}
   if(side&&P.side==='dim')item.alpha=.38;
   items.push(item);
  }
 }else{
  // Includes the native repeat-with->9-glyph fallback. Do not reinterpret it
  // as repeated columns, or resegment/reorder its right-to-left split columns.
  items.push(J.basicMainItem({W,H,cut,sc}));
 }
 const native=holdWindow.native,entry=cut.enter==='cut'?0:Math.max(.01,cut.inDur);
 if(native.start<cut.start+entry||native.end>cut.start+cut.dur-(cut.exit==='cut'?0:cut.outDur))return null;
 for(let i=0;i<items.length;i++){
  const item=items[i],partial=native.start<cut.start+(item.mi|0)*(cut.stagger||0)+entry;
  // A delayed outer column can still be entering during the global hold.
  // Existing sourceUnits bounds invertBox's full native plate and every
  // glyph subset. No vertical exit is evaluated: the admitted window ends
  // before tyStrike, and cut exit only reduces hold amplitude.
  const source={...cut,layout:'center',area:null,params:{},exit:'cut'},main=A.centerCircle.sourceUnits(item,source,plan,{holdOnly:!partial});
  if(!main)return null;
  mains.push({...main,partial});
  units.push(...main.units.map(u=>({...u,owner:'vcols.'+(repeat?'repeat.':'split.')+i+'.'+u.owner})));
 }
 const center=mains[decorIndex],cachedPartial=cut.exit==='cut'&&cut.outDur>0,partial=center.partial||cachedPartial;
 // vcols repeat returns the selected center bb, never the union of repeats.
 // Its delayed/null entrance or held cut-exit cache also permits centerBB.
 const bbRanges=partial?center.bbRangesAny:center.bbRanges;
 for(const d of cut.decor||[]){const parts=A.memphisUnits({W,H,P:d,bbRanges:[bbRanges],includeFallback:partial});if(!parts?.length)return null;units.push(...parts);}
 return {units,bbRanges,glyphBB:union(mains.map(m=>m.glyphBB)),scope:'native-hold',sourceBranch:repeat?'repeat':'split',decorMainIndex:decorIndex};
}
A.verticalUnits=verticalUnits;
})();
