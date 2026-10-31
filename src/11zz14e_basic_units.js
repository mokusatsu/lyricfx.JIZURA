/* Native basic typography hold supports. No drawing or frame sampling. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],ids=new Set(['type','condensed']);
const union=bs=>({x0:Math.min(...bs.map(b=>b.x0)),x1:Math.max(...bs.map(b=>b.x1)),y0:Math.min(...bs.map(b=>b.y0)),y1:Math.max(...bs.map(b=>b.y1))});
function basicUnits({W,H,cut,plan,st,sc,holdOnly=true,holdWindow}){
 if(!ids.has(cut.layout)||!holdOnly||!holdWindow||(cut.treat||'none')!=='none'||
    !['cut','flicker','invertBox'].includes(cut.enter)||!['cut','tyStrike'].includes(cut.exit)||
    !['still','knCounterRock'].includes(cut.hold)||
    !(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>d.id==='memphis'))return null;
 const g=A.nativeBlockCircle.geometry({W,H,cut,plan,st,sc}),units=[],mains=[];
 // Type overrides cut's cut entrance with type. Condensed uses a native mi
 // delay for every repeat. A global hold label alone does not finish either.
 const entered=cut.layout==='type'||cut.enter!=='cut';
 const ready=cut.start+Math.max(...g.items.map(it=>(it.mi|0)*(cut.stagger||0)+(entered?Math.max(.01,cut.inDur):0)));
 if(holdWindow.native.start<ready||holdWindow.native.end>cut.start+cut.dur-(cut.exit==='cut'?0:cut.outDur))return null;
 for(let i=0;i<g.items.length;i++){
  const item=g.items[i],main=A.centerCircle.sourceUnits(item,{...cut,layout:'center',area:null,params:{}},plan,{holdOnly:true});
  if(!main)return null;
  units.push(...main.units.map(u=>({...u,owner:cut.layout+'.main.'+i+'.'+u.owner})));mains.push(main);
 }
 const addItem=(item,owner)=>A.itemGeometry(item,ID,{pass:'main',scale:1}).glyphs.forEach(glyph=>units.push({owner:owner+'.glyph.'+glyph.index,kind:'glyph',bounds:A.bounds([glyph.polygon])}));
 if(cut.layout==='type'){
  // geometry.plain's final item is only a widest-digit advance estimate.
  // Native fmtTime(t) changes every source clock: retain fixed prefix glyphs
  // and all digit/punctuation ink, over every possible suffix pen position.
  g.plain.slice(0,-1).forEach((item,i)=>addItem(item,'type.prompt.'+i));
  const label=g.plain[g.plain.length-1],prefix=`LINE ${String((cut.line|0)+1).padStart(2,'0')} ─ `;
  addItem({...label,text:prefix},'type.time.prefix');
  const chars=[...'0123456789:.'],length=Math.max(J.fmtTime(holdWindow.native.start).length,J.fmtTime(holdWindow.native.end).length),size=label.size,font=label.font;
  const prefixWidth=J.measure({...label,text:prefix}).w,maxAdvance=Math.max(...chars.map(ch=>J.metrics.adv(font,ch)*size));
  for(const ch of chars){
   const polygons=A.itemGeometry({...label,text:ch,x:0},ID,{pass:'main',scale:1}).polygons;
   if(!polygons.length)return null;
   const b=A.bounds(polygons);
   units.push({owner:'type.time.suffix.'+ch,kind:'glyph-range',bounds:{x0:label.x+prefixWidth+b.x0,x1:label.x+prefixWidth+(length-1)*maxAdvance+b.x1,y0:b.y0,y1:b.y1}});
  }
 }
 const ranges=Object.fromEntries(['x0','x1','y0','y1'].map(k=>[k,[
  (k.endsWith('0')?Math.min:Math.max)(...mains.map(m=>m.bbRanges[k][0])),
  (k.endsWith('0')?Math.min:Math.max)(...mains.map(m=>m.bbRanges[k][1]))
 ]]));
 // With every local entrance complete, every main exists for the hold.
 // A held cache from cut exit can still contain a visible subset on seeking.
 const cachedPartial=cut.exit==='cut'&&cut.outDur>0;
 const decorRanges=cachedPartial?Object.fromEntries(['x0','x1','y0','y1'].map(k=>[k,[Math.min(...mains.map(m=>m.bbRangesAny[k][0])),Math.max(...mains.map(m=>m.bbRangesAny[k][1]))]])):ranges;
 for(const d of cut.decor||[]){const parts=A.memphisUnits({W,H,P:d,bbRanges:[decorRanges],includeFallback:cachedPartial});if(!parts?.length)return null;units.push(...parts);}
 return {units,bbRanges:ranges,glyphBB:union(mains.map(m=>m.glyphBB)),scope:'native-hold'};
}
A.basicUnits=basicUnits;
})();
