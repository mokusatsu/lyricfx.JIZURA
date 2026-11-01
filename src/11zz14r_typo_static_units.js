/* Native typography text, growing rules and labels in the hold interval. */
(()=>{'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],keys=['x0','x1','y0','y1'];
function typoStaticUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 if(!['tyMargin','tyBaseline','tyJustify','tyRuby','tyIndexTable','tySquare','tyLineFocus','tyVRuler','tyFullTrack','tyStatCount','tyScaleSteps'].includes(cut.layout)||!holdOnly||!holdWindow||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    !(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>['memphis','starburst'].includes(d.id))||
    holdWindow.native.end>cut.start+cut.dur-cut.outDur)return null;
 const extra=['tyIndexTable','tySquare','tyLineFocus','tyVRuler','tyFullTrack','tyStatCount','tyScaleSteps'].includes(cut.layout),earliest=holdWindow.native.start-holdWindow.step-1.6/24;
 if(extra&&((cut.groupExit??cut.exit)!==cut.exit||!Number.isFinite(cut.stagger??0)||(cut.stagger??0)<0||!Number.isFinite(cut.outDur)||!Number.isFinite(earliest)||earliest<cut.start||/[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text)))return null;
 const source={...cut,area:null,simpleCircleRecipe:null,enter:'cut',exit:'cut',hold:'still'},renderer=Object.create(J.Renderer.prototype);
 // Bound the last source glyph's annotation clock, and construct once per pass.
 const count=J.glyphCount(cut.text);if(count>256||extra&&(count<1||count>6))return null;
 let programs;
 const time=['tyMargin','tyBaseline'].includes(cut.layout)?1.4:2+count*.08;
 try{programs=['main','A','B'].map(pass=>A.sourceFormulaBase.construct(renderer,{...plan,W,H},source,{W,H,time,pass}));}
 catch(e){if(['SOURCE_FORMULA_CLIP','SOURCE_FORMULA_COUPLED_FIELD_CLIP','SOURCE_FORMULA_FILTER','SOURCE_FORMULA_GEOMETRY_BUDGET','SOURCE_FORMULA_ITEM_SHADER','SOURCE_FORMULA_NATIVE_RASTER','SOURCE_FORMULA_PATH'].includes(e?.code))return null;throw e;}
 const units=[],ranges=[],mainItems=programs[0].events.filter(e=>e.kind==='item'&&e.args[0].placementMain);
 if(!mainItems.length)return null;
 if(extra){const norm=t=>String(t??'').replace(/\s/g,'');if(mainItems.length>6||norm(mainItems.map(e=>e.args[0].text).join(''))!==norm(cut.text))return null;}
 const rubyRise=cut.layout==='tyRuby'?Math.max(10,mainItems[0].args[0].size*.3)/2:0;
 for(const [pass,program] of programs.entries()){
  if(program.events.some(e=>e.clips.length))return null;
  // tyMargin's accent square follows the rule endpoint from either end.
  const lines=program.events.filter(e=>e.kind==='line').flatMap(e=>e.polygons),line=lines.length?A.bounds(lines):null;
  for(const [i,e] of program.events.entries()){
   // Every counter value is a distinct static label, not a clock sample.
   if(cut.layout==='tyStatCount'&&e.kind==='item'&&!e.args[0].placementMain&&e.args[0].font===cut.params.nf&&/^\d{2,}$/.test(e.args[0].text)){
    for(let value=0;value<=count;value++)for(const poly of A.itemGeometry({...e.args[0],text:String(value).padStart(2,'0'),_lay:null,_m:null},ID,{pass:'main',scale:1}).polygons)units.push({owner:cut.layout+'.counter.'+value,kind:'item',bounds:A.bounds([poly])});
    continue;
   }
   if(e.kind==='item'&&e.args[0].placementMain){
    const it=e.args[0];if(it.rot||it.skew||extra&&it.noHold||e.matrix.some((v,j)=>v!==ID[j]))return null;
    const ready=cut.start+(it.mi|0)*(cut.stagger||0)+(cut.enter==='cut'?0:Math.max(.01,cut.inDur)),partial=extra&&cut.enter==='invertBox'&&earliest<ready;
    const main=extra&&it.vertical?A.verticalSourceUnits?.(it,cut,{...plan,W,H},{partial}):A.centerCircle.sourceUnits(it,{...cut,layout:'center',area:null,params:{}},{...plan,W,H},{holdOnly:false});
    if(!main)return null;
    units.push(...main.units.map(u=>({...u,owner:cut.layout+'.'+pass+'.'+u.owner})));
    if(pass===0)ranges.push(main.bbRangesAny);
   }else for(const poly of e.polygons){
    const b=A.bounds([poly]);
    // Native playhead sweeps between the first and last glyph center.
    if(cut.layout==='tyVRuler'&&e.kind==='poly'){
     const it=mainItems[0].args[0],ys=J.layoutText(it).filter(g=>g.ch.trim()).map(g=>it.y+g.y*(it.sy||1));
     if(!ys.length)return null;
     const y=e.args[0][0][1];b.y0+=Math.min(...ys)-y;b.y1+=Math.max(...ys)-y;
    }
    // Ruby annotations rise from rest+rs/2; growing brackets stay inside
    // their settled rectangles. Enclosing every annotation is conservative.
    if(rubyRise&&e.kind==='item')b.y1+=rubyRise;
    if(cut.layout==='tyMargin'&&e.kind==='rect'&&line){const half=(b.x1-b.x0)/2;b.x0=Math.min(b.x0,line.x0-half);b.x1=Math.max(b.x1,line.x1+half);}
    if(cut.layout==='tySquare'&&e.kind==='line'){const dx=(b.x1-b.x0)*.14,dy=(b.y1-b.y0)*.14;b.x0-=dx;b.x1+=dx;b.y0-=dy;b.y1+=dy;}
    units.push({owner:cut.layout+'.'+pass+'.part.'+i,kind:e.kind,bounds:b});
   }
  }
 }
 if(!ranges.length||ranges.length>6)return null;
 // Native mainDraw returns a union of the visible rows; preserve each possible
 // subset for decoration rather than one unrelated edge-wise bounding box.
 const decorRanges=[];
 for(let mask=1;mask<(1<<ranges.length);mask++){
  const rs=ranges.filter((_,i)=>mask&(1<<i));
  decorRanges.push(Object.fromEntries(keys.map(k=>[k,[(k.endsWith('0')?Math.min:Math.max)(...rs.map(r=>r[k][0])),(k.endsWith('0')?Math.min:Math.max)(...rs.map(r=>r[k][1]))]])));
 }
 if(cut.layout==='tyLineFocus')decorRanges.push({x0:[W*.3,W*.3],x1:[W*.7,W*.7],y0:[H*.4,H*.4],y1:[H*.6,H*.6]});
 const bbRanges=Object.fromEntries(keys.map(k=>[k,[Math.min(...decorRanges.map(r=>r[k][0])),Math.max(...decorRanges.map(r=>r[k][1]))]]));
 for(const d of cut.decor||[]){const args={W,H,P:d,cut,st,bbRanges:decorRanges,includeFallback:true},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);if(!parts?.length)return null;units.push(...parts);}
 return {units,bbRanges,scope:'native-hold'};
}
A.typoStaticUnits=args=>{try{return typoStaticUnits(args);}catch(e){if(['tyIndexTable','tySquare','tyLineFocus','tyVRuler','tyFullTrack','tyStatCount','tyScaleSteps'].includes(args?.cut?.layout)&&(e.code==='UNMEASURED_INK'||e.code==='GEOMETRY_LIMIT'||e.code?.startsWith('UNSUPPORTED_')))return null;throw e;}};
})();
