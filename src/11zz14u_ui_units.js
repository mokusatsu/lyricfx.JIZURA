/* Native A26 UI objects and their one returned main text block. */
(()=>{'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],ids=new Set(['searchBar','notification','chat']),keys=['x0','x1','y0','y1'];
function uiUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 const p=cut.params;
 if(!ids.has(cut.layout)||!holdOnly||!holdWindow||cut.layoutARecipe||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    (cut.groupExit??cut.exit)!==cut.exit||!(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>d.id==='memphis'||d.id==='starburst')||
    /[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text))return null;
 // Search's native cut entrance is replaced by typewriter; it needs its own
 // glyph-prefix model rather than the ordinary mainDraw treatment here.
 if(cut.layout==='searchBar'&&cut.enter==='cut')return null;
 const earliest=holdWindow.native.start-holdWindow.step-1.6/24;
 if(!Number.isFinite(earliest)||earliest<cut.start||holdWindow.native.end>cut.start+cut.dur-cut.outDur)return null;
 A.layoutsAFormulaDomain({...plan,W,H},cut,true);
 if(cut.layout==='chat')return chatUnits({W,H,cut,plan,st,holdWindow,earliest});
 // Capture the complete fixed UI and all candidate rows after their individual
 // reveals, not an assertion that this source clock is a hold frame.
 const time=Math.max(2,cut.inDur*2+.7,cut.inDur+.05+(p.sugg||0)*.07+.7),renderer=Object.create(J.Renderer.prototype),program=A.sourceFormulaBase.construct(renderer,{...plan,W,H},cut,{W,H,time,pass:'main'}),events=program.events,
       mains=events.filter(e=>e.kind==='item'&&e.args[0].placementMain),norm=x=>String(x??'').replace(/\s/g,'');
 if(mains.length!==1||events.some(e=>e.role!=='primary'||e.clips?.length))return null;
 const mainEvent=mains[0],item=mainEvent.args[0];
 if(mainEvent.matrix.some((v,i)=>Math.abs(v-ID[i])>1e-9)||item.rot||item.skew||item.vertical||item.enter||norm(item.text)!==norm(cut.text))return null;
 const source={...cut,layout:'center',area:null,params:{}},main=A.centerCircle.sourceUnits(item,source,{...plan,W,H},{holdOnly:true});if(!main)return null;
 const ready=cut.start+(item.mi|0)*(cut.stagger||0)+(cut.enter==='cut'?0:Math.max(.01,cut.inDur));
 if(cut.enter==='invertBox'&&earliest<ready){const entry=A.centerCircle.sourceUnits(item,{...source,hold:'still',exit:'cut'},{...plan,W,H},{holdOnly:false});if(!entry)return null;main.units.push(...entry.units.filter(u=>u.owner==='center.invertBox'));}
 let dy0=0,dy1=0;
 if(cut.layout==='notification'){
  const d=mainEvent.nativeSweep?.dy/2;if(!(d>0&&Number.isFinite(d)))return null;
  const t=J.clamp((earliest-cut.start)/.45),a=J.E.outBack(t,1.1),peak=1-2*1.1/(3*2.1),qmax=t<=peak?1+4*1.1**3/(27*2.1**2):Math.max(a,1);
  dy0=(Math.min(a,1)-1)*d;dy1=(qmax-1)*d;
 }
 const units=main.units.map(u=>({...u,owner:cut.layout+'.main.'+u.owner,bounds:{...u.bounds,y0:u.bounds.y0+dy0,y1:u.bounds.y1+dy1}}));
 const others={...program,events:events.filter(e=>e!==mainEvent)};
 if(others.events.length){
  // 09c supplies the notification's source motion and all complete UI rows.
  // A search box's leading/trailing icons move as its width grows. Expanding
  // their x support by .35*bw covers their full travel; static text is kept.
  const sweeps=A.layoutsASourceEnvelopes(others,{...plan,W,H},program.sourceCut,false),pad=cut.layout==='searchBar'?W*(H>W*1.08?.9:.7)*.35:0;
  for(let i=0;i<sweeps.length;i++){const b=A.bounds([sweeps[i]]);units.push({owner:cut.layout+'.ui.'+i,kind:'native-sweep',bounds:{x0:b.x0-pad,x1:b.x1+pad,y0:b.y0,y1:b.y1}});}
 }
 let fallback;
 if(cut.layout==='searchBar'){
  const bw=W*(H>W*1.08?.9:.7),bh=item.size*2.1,by=H*(p.pos==='upper'?.28:.38);
  fallback={x0:W/2-bw/2,x1:W/2+bw/2,y0:by-bh/2,y1:by+bh/2};
 }else {fallback=J.itemBox(item);fallback={...fallback,y0:fallback.y0+dy0,y1:fallback.y1+dy1};}
 const ranges=Object.fromEntries(keys.map(k=>{const delta=k==='y0'||k==='y1'?[dy0,dy1]:[0,0],r=main.bbRangesAny[k];return [k,[Math.min(fallback[k],r[0]+delta[0]),Math.max(fallback[k],r[1]+delta[1])]];}));
 for(const d of cut.decor||[]){const args={W,H,P:d,cut,st,bbRanges:[ranges],includeFallback:true},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);if(!parts?.length)return null;units.push(...parts);}
 return {units,bbRanges:ranges,scope:'native-hold'};
}
function chatUnits({W,H,cut,plan,st,holdWindow,earliest}){
 const time=Math.max(2,cut.inDur*2+.7,cut.dur*.45+.8),renderer=Object.create(J.Renderer.prototype),program=A.sourceFormulaBase.construct(renderer,{...plan,W,H},cut,{W,H,time,pass:'main'}),events=program.events,mains=events.filter(e=>e.kind==='item'&&e.args[0].placementMain),norm=x=>String(x??'').replace(/\s/g,'');
 if(!mains.length||mains.length>8||events.some(e=>e.role!=='primary'||e.clips?.length)||norm(mains.map(e=>e.args[0].text).join(''))!==norm(cut.text))return null;
 const units=[],ranges=[],source={...cut,layout:'center',area:null,params:{}};
 for(let i=0;i<mains.length;i++){
  const event=mains[i],item=event.args[0],sweep=event.nativeSweep;
  if(event.matrix.some((v,j)=>Math.abs(v-ID[j])>1e-9)||item.rot||item.skew||item.vertical||!sweep?.pivot||!Array.isArray(sweep.scale)||!Number.isFinite(sweep.positiveY)||sweep.positiveY<0)return null;
  const part=A.centerCircle.sourceUnits(item,source,{...plan,W,H},{holdOnly:true});if(!part)return null;
  const ready=cut.start+(item.mi|0)*(cut.stagger||0)+(cut.enter==='cut'?0:Math.max(.01,cut.inDur));
  if(cut.enter==='invertBox'&&earliest<ready){const entry=A.centerCircle.sourceUnits(item,{...source,hold:'still',exit:'cut'},{...plan,W,H},{holdOnly:false});if(!entry)return null;part.units.push(...entry.units.filter(u=>u.owner==='center.invertBox'));}
  for(const u of part.units){const b=u.bounds,poly=[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]];units.push({...u,owner:'chat.main.'+i+'.'+u.owner,bounds:A.bounds([A.layoutsASweep(poly,sweep)])});}
  // Native returned glyph bbox is not transformed by the outer Canvas pop,
  // but the bubble's anchor rises as later messages appear.
  ranges.push(Object.fromEntries(keys.map(k=>[k,[part.bbRangesAny[k][0],part.bbRangesAny[k][1]+(k[0]==='y'?sweep.positiveY:0)]])));
 }
 const others={...program,events:events.filter(e=>!mains.includes(e))};
 if(others.events.length){const sweeps=A.layoutsASourceEnvelopes(others,{...plan,W,H},program.sourceCut,false);for(let i=0;i<sweeps.length;i++)units.push({owner:'chat.ui.'+i,kind:'native-sweep',bounds:A.bounds([sweeps[i]])});}
 const colW=W*(H>W*1.08?.86:W/H<1.5?.66:.52),bottom=H*(H>W*1.08?.78:.8),fallback={x0:W/2-colW/2,x1:W/2+colW/2,y0:bottom-H*.3,y1:bottom};
 const bbRanges=Object.fromEntries(keys.map(k=>[k,[Math.min(fallback[k],...ranges.map(r=>r[k][0])),Math.max(fallback[k],...ranges.map(r=>r[k][1]))]]));
 for(const d of cut.decor||[]){const args={W,H,P:d,cut,st,bbRanges:[bbRanges],includeFallback:true},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);if(!parts?.length)return null;units.push(...parts);}
 return {units,bbRanges,scope:'native-hold'};
}
A.uiUnits=args=>{try{return uiUnits(args);}catch(e){if(e.code&&(e.code.startsWith('UNSUPPORTED_')||e.code.startsWith('SOURCE_FORMULA_')||e.code==='GEOMETRY_LIMIT'||e.code==='UNMEASURED_INK'))return null;throw e;}};
})();
