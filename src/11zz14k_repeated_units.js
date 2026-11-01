/* Native marquee/tile main text with separately classified tiledAux output. */
(() => {
'use strict';
const A=J.placement;
function repeatedUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 const p=cut.params;
 if(!['marquee','tile'].includes(cut.layout)||!holdOnly||!holdWindow||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    !(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>d.id==='memphis'||d.id==='starburst')||
    /[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text))return null;
 const earliest=holdWindow.native.start-holdWindow.step-1.6/24;
 if(!Number.isFinite(earliest)||holdWindow.native.start<cut.start||
    holdWindow.native.end>cut.start+cut.dur-(cut.exit==='cut'?0:cut.outDur))return null;
 let item;
 if(cut.layout==='marquee'){
  if(![2,4].includes(p.rows)||!['outline','dim','box'].includes(p.rowStyle)||!(p.sx>0))return null;
  const size=Math.min(J.fitSize(cut.text,p.font,W*.84,H*.3,{sx:p.sx,track:.05}),H*.3);
  item={text:cut.text,font:p.font,size,x:W/2,y:H/2,sx:p.sx,track:.05};
 }else{
  if(!['box','stroke'].includes(p.knock))return null;
  const text=W<H?J.splitLines(cut.text,5):cut.text;
  const size=Math.min(J.fitSize(text,p.font,W*.8,H*.34,{track:.04,lead:1.15}),H*.3);
  item={text,font:p.font,size,x:W/2,y:H/2,track:.04,lead:1.15};
 }
 const source={...cut,layout:'center',area:null,params:{}},units=[];
 function addMain(it,owner){
  const part=A.centerCircle.sourceUnits(it,source,plan,{holdOnly:true});
  if(!part)return null;
  const ready=cut.start+(cut.enter==='cut'?0:Math.max(.01,cut.inDur));
  if(earliest<ready&&cut.enter==='invertBox'){
   const entry=A.centerCircle.sourceUnits(it,{...source,hold:'still',exit:'cut'},plan,{holdOnly:false});
   if(!entry)return null;
   part.units.push(...entry.units.filter(u=>u.owner==='center.invertBox'));
  }
  units.push(...part.units.map(u=>({...u,owner:owner+'.'+u.owner})));
  return part;
 }
 if(cut.layout==='tile'){
  if(p.knock==='box'){
   // The native width grows from zero to the final width; pOut=0 in hold.
   const m=J.measure(item),z=item.size;
   units.push({owner:'tile.knock.box',kind:'plate',ghost:false,bounds:{x0:W/2-m.w/2-z*.35-2,y0:H/2-m.h/2-z*.28-2,x1:W/2+m.w/2+z*.35+2,y1:H/2+m.h/2+z*.28+2}});
  }else{
   // This is a distinct mainDraw call, including its own entrance plate.
   if(!addMain({...item,fill:false,stroke:item.size*.16,ghost:false},'tile.knock.stroke'))return null;
  }
 }
 const main=addMain(item,cut.layout+'.main');if(!main)return null;
 // The native returned bbox is only the final mainDraw. Retain all visible
 // subsets and the fresh fallback for getBB's seek-dependent cache.
 const bbRanges=main.bbRangesAny;
 for(const d of cut.decor||[]){
  const args={W,H,P:d,cut,st,bbRanges:[bbRanges],includeFallback:true},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);
  if(!parts?.length)return null;
  units.push(...parts);
 }
 return {units,bbRanges,scope:'native-hold'};
}
A.repeatedUnits=repeatedUnits;
})();
