/* Headline/deck native supports across entrance and hold.
 * Candidate only: caller must opt in and validate against native rendering. */
(() => {
'use strict';
const A=J.placement, ID=[1,0,0,1,0,0];
function editorialUnits({W,H,cut,plan,st,holdOnly=true,holdWindow}){
 if(!['headlineDeck','dictionary','contents','footnote','proofread','poster','numbered'].includes(cut.layout)||!holdOnly||!holdWindow||cut.placementLayoutsC||cut.layoutCRecipe||
    (cut.treat||'none')!=='none'||!['cut','flicker','invertBox'].includes(cut.enter)||
    !['cut','tyStrike'].includes(cut.exit)||!['still','knCounterRock'].includes(cut.hold)||
    !(cut.motionScale==null||cut.motionScale>=0&&cut.motionScale<=1)||
    !(cut.decor||[]).every(d=>['memphis','starburst'].includes(d.id)))return null;
 // Build once at the declared settled layout clock, then analytically
 // enlarge moving owners for the whole entrance. The native hold must end
 // before pOut begins; entry is allowed to overlap the hold window.
 const notes=['footnote','proofread'].includes(cut.layout),framed=['poster','numbered'].includes(cut.layout);
 if(framed&&(!Number.isFinite(cut.stagger??0)||(cut.stagger??0)<0||/[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text)))return null;
 if(notes){
  try{A.layoutsCEditorialSource.domain(cut);}
  catch(e){if(['SOURCE_COVERAGE','UNSUPPORTED_PARAMETER_RANGE'].includes(e?.code))return null;throw e;}
  if(J.glyphCount(cut.text)>256)return null;
 }
 const k=(cut.params.chunks?.length?cut.params.chunks:[cut.text.trim()]).filter(Boolean).length;
 if(!k)return null;
 const sourcePlan={...plan,W,H};
 const ready=notes||framed?A.layoutsCEditorialSource.clock(cut,sourcePlan):cut.layout==='contents'?Math.max(.8,.1+k*.1+.5):cut.layout==='dictionary'?Math.max(.8,cut.inDur*.8+.62):Math.max(.8,cut.inDur+.55,cut.inDur*.6+.64,cut.inDur*.8+.45);
 if(holdWindow.native.end>cut.start+cut.dur-cut.outDur)return null;
 const source={...cut,area:null,simpleCircleRecipe:null,enter:'cut',exit:'cut',hold:'still'},renderer=Object.create(J.Renderer.prototype);
 if(framed){try{A.layoutsCEditorialSource.domain(source);}catch(e){if(['SOURCE_COVERAGE','UNSUPPORTED_PARAMETER_RANGE'].includes(e?.code))return null;throw e;}}
 let programs;
 try{programs=['main','A','B'].map(pass=>A.sourceFormulaBase.construct(renderer,sourcePlan,source,{W,H,time:ready+.01,pass}));}
 catch(e){
  if(['SOURCE_FORMULA_CLIP','SOURCE_FORMULA_COUPLED_FIELD_CLIP','SOURCE_FORMULA_FILTER','SOURCE_FORMULA_GEOMETRY_BUDGET','SOURCE_FORMULA_ITEM_SHADER','SOURCE_FORMULA_NATIVE_RASTER','SOURCE_FORMULA_PATH'].includes(e?.code))return null;
  throw e;
 }
 const mains=programs.flatMap(p=>p.events.filter(e=>e.kind==='item'&&e.args[0].placementMain));
 if(!mains.length||mains.some(e=>e.matrix.some((v,i)=>v!==ID[i])||e.args[0].rot||e.args[0].skew)||programs.some(p=>p.events.some(e=>e.clips.length&&!(cut.layout==='numbered'&&e.kind==='item'&&!e.args[0].placementMain))))return null;
 if(framed){const norm=t=>String(t??'').replace(/\s/g,''),items=programs[0].events.filter(e=>e.kind==='item'&&e.args[0].placementMain);if(items.length>8||norm(items.map(e=>e.args[0].text).join(''))!==norm(cut.text))return null;}
 if(notes&&programs[0].events.filter(e=>e.kind==='item'&&e.args[0].placementMain).length!==1)return null;
 const units=[],ranges=[],first=mains[0].args[0],ds=J.clamp(Math.min(W,H)*.032,16,44);
 // Non-main owners move only along their source entrance axes. Keep
 // each owned primitive, extending only its own motion rather than adding
 // the maximum tab/definition travel to every rule and body glyph.
 for(const [pass,program] of programs.entries())for(const [i,e] of program.events.entries()){
  if(e.kind==='item'&&e.args[0].placementMain){
   const item=e.args[0],earliest=holdWindow.native.start-holdWindow.step-1.6/24,readyAt=cut.start+(item.mi|0)*(cut.stagger||0)+(cut.enter==='cut'?0:Math.max(.01,cut.inDur)),partial=cut.enter==='invertBox'&&earliest<readyAt,main=framed&&item.vertical?A.verticalSourceUnits?.(item,cut,sourcePlan,{partial}):A.centerCircle.sourceUnits(item,{...cut,layout:'center',area:null,params:{}},sourcePlan,{holdOnly:false});
   if(!main)return null;
   units.push(...main.units.map(u=>({...u,owner:'headline.'+pass+'.'+u.owner})));
   if(pass===0)ranges.push(main.bbRangesAny);
  }else {
   const polygons=notes||framed?A.layoutsCEditorialSource.envelopes({events:[e]},sourcePlan,source):e.polygons;
   // The source helper clips before sweeping; an empty settled numeral
   // cannot certify its partially entering pixels.
   if(cut.layout==='numbered'&&e.clips?.length&&!polygons.length)return null;
   for(const polygon of polygons){
   const b=A.bounds([polygon]),owner=e.nativeCBody?.dictionaryCopy?.owner;
   if(cut.layout==='dictionary'){
    if(owner==='definition')b.x1+=J.clamp(Math.min(W,H)*.028,14,36);
    if(owner==='thumb-plate'||owner==='thumb-glyph')b.x1+=Math.min(W,H)*.075;
   }else if(cut.layout==='headlineDeck'){
    if(e.nativeCBody?.kind==='editorial-phase'&&e.kind==='item')b.y1+=ds*.5;
    if(e.kind==='circle'){const extra=first.size*.012;b.x0-=extra;b.x1+=extra;b.y0-=extra;b.y1+=extra;}
   }
   if(notes&&e.nativeCBody?.proofOwner?.owner==='trim-marks'){const d=first.size*.55;b.x0-=d;b.x1+=d;b.y0-=d;b.y1+=d;}
   units.push({owner:'headline.'+pass+'.part.'+i,kind:e.kind,bounds:b,...(!notes&&!framed?{ghost:false}:{})});
   }
  }
 }
 // Native fallback uses the nominal measured block whenever mainDraw returns
 // no visible box. Include both that box and every possible visible subset:
 // decor may cache a box from a preceding entrance or exit frame.
 let fallback=null;
 if(cut.layout==='headlineDeck'){const m=J.measure(first);fallback={x0:first.x,x1:first.x+m.w,y0:first.y-m.h/2,y1:first.y+m.h/2};}
 if(cut.layout==='poster'){const ls=J.clamp(Math.min(W,H)*.024,14,34),my=H*.07;fallback={x0:W*.07,x1:W*.93,y0:my+ls*2.6,y1:H-my-ls*5};}
 if(cut.layout==='contents'){
  const ls=J.clamp(Math.min(W,H)*.024,14,34);
  if(cut.params.variant==='tate'){
   const cols=k+(cut.params.ctx?2:0),colW=Math.min(W*.86/(cols+1),Math.min(W,H)*.22),hTop=H*.14,hBot=H*.86,x0=W/2+(cols+1.2)*colW/2;
   fallback={x0:x0-colW*1.2-(cols-.5)*colW-colW/2,x1:x0,y0:hTop,y1:hBot};
   for(const e of mains.slice(0,k)){const x=e.args[0].x;units.push({owner:'contents.possible-marker',kind:'marker',bounds:{x0:x-colW*.5-2,x1:x+colW*.5+2,y0:hTop-ls*1.6-2,y1:hTop-ls*1.25+2}});}
  }else{
   const bw=W*(H>W*1.08?.84:.66),bx=(W-bw)/2,cxH=ls*2.6,rowH=Math.max(first.size*1.62,ls*2.4),blockH=k*rowH+(cut.params.ctx?cxH*2:0),y0=H/2-blockH/2+ls*1.8;
   fallback={x0:bx,x1:bx+bw,y0,y1:y0+blockH};
   // cur changes with the native clock; include a marker at every row.
   for(const e of mains.slice(0,k)){const y=e.args[0].y,z=e.args[0].size;units.push({owner:'contents.possible-marker',kind:'marker',bounds:{x0:bx-ls*1.35-2,x1:bx+2,y0:y-Math.max(z*.45,ls*.5)-2,y1:y+Math.max(z*.45,ls*.5)+2}});}
  }
 }
 // A returned contents bbox is the union of a nonempty subset of rows.
 // Keep each subset separately; combining unrelated x/y edge extrema into one
 // box invents decoration positions that no native row selection can produce.
 const keys=['x0','x1','y0','y1'],decorRanges=[];
 if(!ranges.length||ranges.length>8)return null;
 for(let mask=1;mask<(1<<ranges.length);mask++){
  const rs=ranges.filter((_,i)=>mask&(1<<i));
  decorRanges.push(Object.fromEntries(keys.map(key=>[key,[
   (key.endsWith('0')?Math.min:Math.max)(...rs.map(r=>r[key][0])),
   (key.endsWith('0')?Math.min:Math.max)(...rs.map(r=>r[key][1]))]])));
 }
 if(fallback)decorRanges.push(Object.fromEntries(keys.map(key=>[key,[fallback[key],fallback[key]]])));
 const bbRanges=Object.fromEntries(keys.map(key=>[key,[Math.min(...decorRanges.map(r=>r[key][0])),Math.max(...decorRanges.map(r=>r[key][1]))]]));
 for(const d of cut.decor||[]){const args={W,H,P:d,cut,st,bbRanges:decorRanges,includeFallback:true},parts=d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);if(!parts?.length)return null;units.push(...parts);}
 return units.length?{units,bbRanges,scope:'native-hold',sourceConstructionTime:ready+.01}:null;
}
A.editorialUnits=args=>{try{return editorialUnits(args);}catch(e){if(['poster','numbered'].includes(args?.cut?.layout)&&(e?.code?.startsWith('UNSUPPORTED_')||e?.code?.startsWith('SOURCE_FORMULA_')||['GEOMETRY_LIMIT','UNMEASURED_INK','SOURCE_COVERAGE'].includes(e?.code)))return null;throw e;}};
})();
