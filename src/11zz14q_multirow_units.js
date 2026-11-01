/* A26 multi-block/character native hold supports. */
(()=>{'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],layouts=new Set(['corners','staircase','zigzag','gridCells','genkou']),keys=['x0','x1','y0','y1'];
function multirowUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 const p=cut.params;
 if(!layouts.has(cut.layout)||!holdOnly||!holdWindow||cut.layoutARecipe||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    (cut.groupExit??cut.exit)!==cut.exit||!(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>d.id==='memphis'||d.id==='starburst')||
    /[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text))return null;
 const earliest=holdWindow.native.start-holdWindow.step-1.6/24;
 if(!Number.isFinite(earliest)||earliest<cut.start||holdWindow.native.end>cut.start+cut.dur-cut.outDur)return null;
 A.layoutsAFormulaDomain({...plan,W,H},cut,true);
 // Construct the complete source furniture once after its deterministic reveal.
 // pOut remains zero; the time is not treated as a frame-by-frame certificate.
 const renderer=Object.create(J.Renderer.prototype),time=Math.max(2,cut.inDur*2+.7),program=A.sourceFormulaBase.construct(renderer,{...plan,W,H},cut,{W,H,time,pass:'main'}),events=program.events,
       mainEvents=events.filter(e=>e.kind==='item'&&e.args[0].placementMain),norm=x=>String(x??'').replace(/\s/g,'');
 if(mainEvents.length<2||mainEvents.length>16||events.some(e=>e.role!=='primary'||e.clips?.length)||norm(mainEvents.map(e=>e.args[0].text).join(''))!==norm(cut.text))return null;
 const units=[],mains=[],items=[],source={...cut,layout:'center',area:null,params:{}};
 for(let i=0;i<mainEvents.length;i++){
  const e=mainEvents[i],item=e.args[0],angle=item.rot||0;
  if(e.matrix.some((v,j)=>Math.abs(v-ID[j])>1e-9)||item.skew||item.vertical||!Number.isFinite(angle)||Math.abs(angle)>90)return null;
  const unrotated={...item,rot:0},part=A.centerCircle.sourceUnits(unrotated,source,{...plan,W,H},{holdOnly:true});if(!part)return null;
  const ready=cut.start+(item.mi|0)*(cut.stagger||0)+(cut.enter==='cut'?0:Math.max(.01,cut.inDur));
  if(cut.enter==='invertBox'&&earliest<ready){
   const entry=A.centerCircle.sourceUnits(unrotated,{...source,hold:'still',exit:'cut'},{...plan,W,H},{holdOnly:false});if(!entry)return null;
   part.units.push(...entry.units.filter(u=>u.owner==='center.invertBox'));
  }
  // drawItem bbox ignores outer item rotation; owned paint does not.
  const c=Math.cos(angle*J.DEG),s=Math.sin(angle*J.DEG),rot=b=>A.bounds([[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]].map(([x,y])=>[item.x+(x-item.x)*c-(y-item.y)*s,item.y+(x-item.x)*s+(y-item.y)*c])]);
  units.push(...part.units.map(u=>({...u,owner:cut.layout+'.main.'+i+'.'+u.owner,bounds:rot(u.bounds)})));
  mains.push(part);items.push(item);
 }
 // 09c retains partial connectors/rails, marks, captions and their fixed
 // source coordinates; never merge unrelated owners into the main bbox.
 const others={...program,events:events.filter(e=>!mainEvents.includes(e))};
 if(others.events.length){
  const sweeps=A.layoutsASourceEnvelopes(others,{...plan,W,H},program.sourceCut,false);
  for(let i=0;i<sweeps.length;i++)units.push({owner:cut.layout+'.furniture.'+i,kind:'native-sweep',bounds:A.bounds([sweeps[i]])});
 }
 // Actual native fallback when no mainDraw returns a bbox.
 let fallback;
 if(cut.layout==='corners'){
  if(items.length!==2)return null;
  const a=J.itemBox(items[0]),b=J.itemBox(items[1]);fallback={x0:Math.min(a.x0,b.x0),x1:Math.max(a.x1,b.x1),y0:a.y0,y1:b.y1};
 }else if(cut.layout==='staircase'){
  const boxes=items.map(it=>J.itemBox(it));
  fallback={x0:Math.min(...boxes.map(b=>b.x0)),x1:Math.max(...boxes.map(b=>b.x1)),y0:Math.min(...items.map(it=>it.y-it.size*.5)),y1:Math.max(...items.map(it=>it.y+it.size*.62))};
 }else if(cut.layout==='gridCells'){
  const n=[...cut.text.replace(/\s+/g,'')].length,port=H>W*1.08,maxCols=port?(n<=8?4:5):(n<=10?10:8),rows=Math.ceil(n/Math.min(n,maxCols)),cols=Math.ceil(n/rows),gap=p.gap||0,cell=Math.min(W*.86/(cols+(cols-1)*gap),H*.72/(rows+(rows-1)*gap),Math.min(W,H)*.3),gw=cols*cell+(cols-1)*cell*gap,gh=rows*cell+(rows-1)*cell*gap;
  fallback={x0:W/2-gw/2,x1:W/2+gw/2,y0:H/2-gh/2,y1:H/2+gh/2};
 }else if(cut.layout==='genkou'){
  const n=[...cut.text.replace(/\s+/g,'')].length,ind=p.indent?1:0,maxR=H>W*1.08?14:10,used=Math.ceil((n+ind)/maxR),R=Math.max(7,Math.ceil((n+ind)/used)+(used===1&&n+ind<maxR?1:0)),gap=.3,cell=Math.min(H*.78/R,W*.9/((used+2)*(1+gap))),colW=cell*(1+gap),C=Math.max(used+2,Math.min(Math.floor(W*.92/colW),used+p.pad*2)),gw=C*colW-cell*gap,gh=R*cell,gx0=W/2-gw/2,gy0=H/2-gh/2,cStart=Math.floor((C-used)/2),colX=c=>gx0+gw-cell-c*colW;
  fallback={x0:colX(cStart+used-1),x1:colX(cStart)+cell,y0:gy0,y1:gy0+gh};
 }else{
  const chars=/[A-Za-z]/.test(cut.text)?[...cut.text.trim().replace(/\s+/g,' ')]:[...cut.text.replace(/\s+/g,'')],n=chars.length,z=items[0].size,step=z*1.08,amp=z*p.amp;
  fallback=p.orient==='v'?{x0:W/2-amp-z/2,x1:W/2+amp+z/2,y0:H/2-step*n/2,y1:H/2+step*n/2}:{x0:W/2-step*n/2,x1:W/2+step*n/2,y0:H/2-amp-z/2,y1:H/2+amp+z/2};
 }
 // Every possible nonempty subset can become the bbox; the fallback is
 // separately included for a frame with no drawn main. The full-range box is
 // conservative without allocating exponential subset combinations.
 const ranges=Object.fromEntries(keys.map(k=>[k,[Math.min(fallback[k],...mains.map(m=>m.bbRangesAny[k][0])),Math.max(fallback[k],...mains.map(m=>m.bbRangesAny[k][1]))]]));
 for(const d of cut.decor||[]){const args={W,H,P:d,cut,st,bbRanges:[ranges],includeFallback:true},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);if(!parts?.length)return null;units.push(...parts);}
 return {units,bbRanges:ranges,scope:'native-hold'};
}
A.multirowUnits=args=>{try{return multirowUnits(args);}catch(e){if(e.code&&(e.code.startsWith('UNSUPPORTED_')||e.code.startsWith('SOURCE_FORMULA_')||e.code==='GEOMETRY_LIMIT'))return null;throw e;}};
})();
