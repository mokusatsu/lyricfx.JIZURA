/* Native vcols hold ownership, preserving repeat and split source branches. */
(() => {
'use strict';
const A=J.placement;
const union=bs=>({x0:Math.min(...bs.map(b=>b.x0)),x1:Math.max(...bs.map(b=>b.x1)),y0:Math.min(...bs.map(b=>b.y0)),y1:Math.max(...bs.map(b=>b.y1))});
function verticalSourceUnits(item,cut,plan,{partial=false}={}){
 if(!item.vertical||!(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||cut.enter==='tyRubyDrop'&&cut.hold==='knCounterRock')return null;
 const ruby=cut.enter==='tyRubyDrop',scan=cut.hold==='scanBand',source={...cut,layout:'center',area:null,params:{},exit:'cut',...(ruby?{enter:'cut'}:{}),...(scan?{hold:'still'}:{})},main=A.centerCircle.sourceUnits(item,source,plan,{holdOnly:ruby||!partial});
 if(!main)return null;
 if(ruby||scan){
  const lay=J.layoutText(item),m=cut.motionScale??1,k=J.clamp(((cut.effectFx||plan.fx).motion??.7)/.7,0,1.6),dx=scan?item.size*.075*k:0,bbs=[];
  main.units=main.units.map(u=>{
   if(u.kind!=='glyph')return u;
   const index=Number(u.owner.split('.').pop()),g=lay.find(g=>g.i===index);
   if(!g)return null;
   const gx=item.x+(g.x+g.vx)*(item.sx||1),gy=item.y+(g.y+g.vy)*(item.sy||1),w=g.w*(item.sx||1),h=g.h*(item.sy||1),off=ruby?w*.8*m:0,s=ruby?1-.68*m:1,pad=(item.stroke||0)/2+3,b=u.bounds;
   bbs.push({x0:gx-w/2,x1:gx+off+w/2,y0:gy-h/2,y1:gy+h/2,leftMax:gx+off-w*s/2,rightMin:gx+w*s/2,topMax:gy-h*s/2,bottomMin:gy+h*s/2});
   // Vertical RubyDrop moves right, while all glyphs (including r90 Latin
   // and punctuation) shrink about their own source baseline. Include the
   // baseline stroke/AA guard without shrinking the native outline width.
   return {...u,bounds:{x0:Math.min(b.x0,ruby?gx-pad:b.x0)-dx,x1:Math.max(b.x1,ruby?gx+pad:b.x1)+off+dx,y0:Math.min(b.y0,ruby?gy-pad:b.y0),y1:Math.max(b.y1,ruby?gy+pad:b.y1)}};
  });
  if(main.units.some(u=>!u))return null;
  if(ruby){
   // A/B passes can still be in the entrance when main reaches its hold;
   // any visible subset can be the bbox returned to the native decoration.
   main.bbRanges=main.bbRangesAny={x0:[Math.min(...bbs.map(b=>b.x0)),Math.max(...bbs.map(b=>b.leftMax))],x1:[Math.min(...bbs.map(b=>b.rightMin)),Math.max(...bbs.map(b=>b.x1))],y0:[Math.min(...bbs.map(b=>b.y0)),Math.max(...bbs.map(b=>b.topMax))],y1:[Math.min(...bbs.map(b=>b.bottomMin)),Math.max(...bbs.map(b=>b.y1))]};
   main.glyphBB=union(bbs);
  }
  if(scan){
   // scanBand uses horizontal bands even on a vertical item. Its post rect
   // sweeps through dBox(item,size*.1); bands/post ignore motionScale.
   const b=J.itemBox({...item,_m:null}),pad=item.size*.1,h=b.y1-b.y0+2*pad,bh=Math.max(item.size*.24,h*.12),lw=Math.max(1,item.size*.012);
   main.units.push({owner:'center.scanBand',kind:'attached',bounds:{x0:b.x0-pad,x1:b.x1+pad,y0:b.y0-pad-lw,y1:b.y1+pad+bh}});
  }
 }
 return main;
}
function verticalUnits({W,H,cut,plan,st,sc,holdOnly=true,holdWindow}){
 if(cut.layout!=='vcols'||!holdOnly||!holdWindow||(cut.treat||'none')!=='none'||
    !['cut','flicker','invertBox','tyRubyDrop'].includes(cut.enter)||!['cut','tyStrike'].includes(cut.exit)||
    !['still','knCounterRock','scanBand'].includes(cut.hold)||
    !(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>['memphis','starburst'].includes(d.id))||
    cut.enter==='tyRubyDrop'&&cut.hold==='knCounterRock')return null;
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
  const main=verticalSourceUnits(item,cut,plan,{partial});
  if(!main)return null;
  mains.push({...main,partial});
  units.push(...main.units.map(u=>({...u,owner:'vcols.'+(repeat?'repeat.':'split.')+i+'.'+u.owner})));
 }
 const center=mains[decorIndex],cachedPartial=cut.exit==='cut'&&cut.outDur>0,partial=cut.enter==='tyRubyDrop'||center.partial||cachedPartial;
 // vcols repeat returns the selected center bb, never the union of repeats.
 // Its delayed/null entrance or held cut-exit cache also permits centerBB.
 const bbRanges=partial?center.bbRangesAny:center.bbRanges;
 for(const d of cut.decor||[]){const args={W,H,P:d,cut,st,bbRanges:[bbRanges],includeFallback:partial},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);if(!parts?.length)return null;units.push(...parts);}
 return {units,bbRanges,glyphBB:union(mains.map(m=>m.glyphBB)),scope:'native-hold',sourceBranch:repeat?'repeat':'split',decorMainIndex:decorIndex};
}
A.verticalSourceUnits=verticalSourceUnits;
A.verticalUnits=verticalUnits;
})();
