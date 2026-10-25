'use strict';
// Pure source proposal only. No Canvas, registration, certificate or implicit fallback.
const POLICY='burst26-oneplate-fullprimary-v1';
const need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c,status:'unsupported'});};
const box=b=>b&&['x0','x1','y0','y1'].every(k=>Number.isFinite(b[k]))&&b.x0<=b.x1&&b.y0<=b.y1;
function family(input){
 const {W,H,cut,knownSourceFX}=input||{};
 need(W===960&&H===540&&cut?.text==='風の先へ'&&cut.seed===1205,'BURST26_FAMILY');
 const p=cut.params;need(p?.font==='dela'&&p.spikes===15&&p.sharp===.72&&p.tilt===4&&p.lines===true&&p.debris===true&&p.order==='accent','BURST26_PARAMS');
 need(cut.lyricSize==null&&(cut.contentScale??1)===1&&(cut.motionScale??1)===1&&!cut.area&&!cut.lockedAreas&&!cut.lockedEffects,'BURST26_EXPLICIT_OR_LOCK');
 need(knownSourceFX===true,'BURST26_UNKNOWN_SOURCE_FX');
 return{policy:POLICY,status:'scope-only-unproven',requiresFreshSourceFontClockBinding:true,primary:['plate-shadow','plate-outer','plate-inner','plate-core','lyric-fulltext','ring','rays','debris']};
}
function circleScope(c){need(c&&c.cx===480&&(c.cy===540*.42||c.cy===540*.2)&&c.r===108&&c.margin===2.7,'BURST26_CIRCLE');}
function recipes(){
 const out=[{id:'native',kind:'native',text:'風の先へ',fontRatio:1,padEm:.15,minAspect:.55}];
 // Natural contiguous reading rows, never split the plate or reorder glyphs.
 out.push({id:'two-row',kind:'oneplate-reflow',text:'風の\n先へ',fontRatio:1,padEm:.15,minAspect:.55});
 out.push({id:'two-row-pad',kind:'oneplate-reflow-padding',text:'風の\n先へ',fontRatio:1,padEm:.1,minAspect:.55});
 for(const text of ['風の先へ','風の\n先へ'])for(const fontRatio of [.9,.8,.72])out.push({id:(text.includes('\n')?'two':'one')+'-local-'+fontRatio,kind:'oneplate-local-font',text,fontRatio,padEm:.1,minAspect:.55});
 // source03: append only; preserve all nine previous recipes and their choice order.
 for(const text of ['風の先へ','風の\n先へ'])for(const fontRatio of [.6,.5,.4,.32])out.push({id:(text.includes('\n')?'two':'one')+'-local-'+fontRatio,kind:'oneplate-local-font',text,fontRatio,padEm:.1,minAspect:.55});
 return out.map(r=>({...r,wholeStageScale:1,onePlate:true,status:'not-evaluated'}));
}
function dimensions(recipe,nativeSize,m){
 need(recipes().some(r=>r.id===recipe.id&&Object.keys(r).every(k=>r[k]===recipe[k])),'BURST26_RECIPE');
 need(Number.isFinite(nativeSize)&&nativeSize>0&&m&&Number.isFinite(m.w)&&m.w>0&&Number.isFinite(m.h)&&m.h>0,'BURST26_SOURCE_METRICS');
 const size=nativeSize*recipe.fontRatio;need(size>=Math.max(18,540*.035),'BURST26_FONT_MINIMUM');
 // m must be independently measured at this size/text; no uniform stage scaling.
 const rxM=960*.355,ryM=Math.min(540*.355,rxM*1.1);
 const rx=Math.min(rxM,m.w/2/.54+size*recipe.padEm),ry=Math.min(ryM,Math.max(m.h/2/.54+size*recipe.padEm,rx*recipe.minAspect));
 return{size,rx,ry,requiresMeasuredTextAt:{text:recipe.text,size,track:.02,lead:1.05},writingFieldFits:m.w<=rx*1.08&&m.h<=ry*1.08,primaryMinPx:Math.max(18,540*.035),geometryCertified:false};
}
function candidates(recipe,heldSupports,circle,G){
 need(recipes().some(r=>r.id===recipe?.id&&Object.keys(r).every(k=>r[k]===recipe[k])),'BURST26_RECIPE');
 circleScope(circle);need(Array.isArray(heldSupports)&&heldSupports.length>0&&heldSupports.every(s=>s.role==='primary'&&box(s.bounds)),'BURST26_HELD_SUPPORTS');
 need(G&&typeof G.positions==='function','BURST26_GEOMETRY68');
 const out=[{recipe:recipe.id,delta:[0,0],kind:recipe.id==='native'?'native':'recipe-at-native-center'}],seen=new Set(['0,0']);
 for(const p of G.positions(heldSupports,circle,{evaluate:false})){need(p.delta.length===2&&p.delta.every(Number.isFinite),'BURST26_POSITION');const key=p.delta.join(',');if(seen.has(key))continue;seen.add(key);out.push({recipe:recipe.id,delta:p.delta.slice(),kind:'joint-translation'});}
 need(out.length<=9,'BURST26_POSITION_BUDGET');return{policy:POLICY,candidates:out,maximumPerRecipe:9,maximumTotal:153,status:'heuristic-source-coordinate-seeds',requiresActualDestinationProof:true};
}
function evaluate(supports,circle,G,{sourcePositivePaintCount}={}){
 circleScope(circle);need(Array.isArray(supports)&&supports.length<=2048&&supports.every(s=>s.role==='primary'&&s.owner==='burst.native-plate'&&box(s.bounds)),'BURST26_PRIMARY_SUPPORT');
 need(Number.isInteger(sourcePositivePaintCount)&&sourcePositivePaintCount>=0&&sourcePositivePaintCount===supports.length,'BURST26_COMPLETE_SOURCE_PAINTS');
 need(G&&typeof G.evaluation==='function','BURST26_GEOMETRY68');
 const result=supports.length?G.evaluation(supports,circle,[0,0]):{passed:true,checked:0,failures:[]};
 return{...result,policy:POLICY,circlePolicy:'strict-all-materialized-own-clocks',entryExitRelaxation:false,allClockCoverageEstablished:false,certificateIssued:false};
}
module.exports={POLICY,family,recipes,dimensions,candidates,evaluate};
