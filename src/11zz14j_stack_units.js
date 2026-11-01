/* Native stack: separate mainDraw supports; only copy zero returns decor bb. */
(() => {
'use strict';
const A=J.placement;
function stackUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 const p=cut.params;
 if(cut.layout!=='stack'||!holdOnly||!holdWindow||(cut.treat||'none')!=='none'||
    !['cut','flicker','invertBox'].includes(cut.enter)||!['cut','tyStrike'].includes(cut.exit)||
    !['still','knCounterRock'].includes(cut.hold)||
    !(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !Number.isInteger(p.copies)||p.copies<1||p.copies>5||![1,-1].includes(p.dir)||
    !['fade','outline'].includes(p.style)||!Number.isFinite(p.gap+p.xs)||
    !(cut.decor||[]).every(d=>d.id==='memphis'||d.id==='starburst')||
    /[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text))return null;
 const earliest=holdWindow.native.start-holdWindow.step-1.6/24;
 if(!Number.isFinite(earliest)||holdWindow.native.start<cut.start||
    holdWindow.native.end>cut.start+cut.dur-(cut.exit==='cut'?0:cut.outDur))return null;
 const size=Math.min(J.fitSize(cut.text,p.font,W*.8,H*.22,{track:.03}),H*.19),step=size*p.gap,
       y0=H/2-p.dir*(p.copies-1)*step/2,source={...cut,layout:'center',area:null,params:{}},units=[];
 let main;
 for(let k=p.copies-1;k>=0;k--){
  const item={text:cut.text,font:p.font,size,x:W/2+p.xs*W*k,y:y0+p.dir*k*step,track:.03,mi:k*1.2};
  if(k>0&&p.style==='outline')Object.assign(item,{fill:false,stroke:Math.max(1.2,size*.014)});
  const part=A.centerCircle.sourceUnits(item,source,plan,{holdOnly:true});
  if(!part)return null;
  const ready=cut.start+(item.mi|0)*(cut.stagger||0)+(cut.enter==='cut'?0:Math.max(.01,cut.inDur));
  if(earliest<ready&&cut.enter==='invertBox'){
   const entry=A.centerCircle.sourceUnits(item,{...source,hold:'still',exit:'cut'},plan,{holdOnly:false});
   if(!entry)return null;
   part.units.push(...entry.units.filter(u=>u.owner==='center.invertBox'));
  }
  units.push(...part.units.map(u=>({...u,owner:'stack.'+k+'.'+u.owner})));
  if(k===0)main=part;
 }
 // Only k=0 is returned by the native layout. A cached partial bbox or the
 // fresh fallback may survive a seek even after the current hold starts.
 const bbRanges=main.bbRangesAny;
 for(const d of cut.decor||[]){
  const args={W,H,P:d,cut,st,bbRanges:[bbRanges],includeFallback:true},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);
  if(!parts?.length)return null;
  units.push(...parts);
 }
 return {units,bbRanges,scope:'native-hold'};
}
A.stackUnits=stackUnits;
})();
