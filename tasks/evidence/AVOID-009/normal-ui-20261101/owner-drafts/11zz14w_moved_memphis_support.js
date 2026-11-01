/* Source-local owner translation: complete owned supports and native decor.
 * Depends on multirowSourceComponents' documented source-coordinate output.
 * This helper does not draw, generate source programs, or mutate input.
 *
 * cacheRanges is mandatory: [] certifies that the actual drawing cut has a
 * fresh BBC identity; otherwise supply every reachable preexisting BBC bbox
 * range in this same source coordinate system. Candidate trials must not
 * draw into the eventual native cut's BBC identity.
 */
(()=>{'use strict';
const A=J.placement,keys=['x0','x1','y0','y1'];
const shift=(b,d)=>({x0:b.x0+d[0],y0:b.y0+d[1],x1:b.x1+d[0],y1:b.y1+d[1]});
const shiftedRange=(r,d)=>Object.fromEntries(keys.map(k=>[k,r[k].map(v=>v+d[k[0]==='x'?0:1])]));
function movedMemphisSupport({components,offsets,cacheRanges,plan,cut,scale,holdWindow}){
 if(!['mixed','scatter'].includes(cut.layout)||cut.enter!=='invertBox'||cut.exit!=='tyStrike'||!['still','knCounterRock'].includes(cut.hold)||!holdWindow||!cut.area||cut.area.angle||!Array.isArray(cacheRanges)||!(cut.decor||[]).length||!(cut.decor||[]).every(d=>d.id==='memphis'||d.id==='starburst'))return null;
 const W=plan.W,H=plan.H,a=cut.area,sw=W*a.w,sh=H*a.h,style={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},units=[],ranges=[];
 const project=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsBloom:true,allCutsChroma:true,activeRange:holdWindow.real,bloomSigma:4.5}),preClip=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsChroma:true,activeRange:holdWindow.real,preClip:true});
 const native={x0:a.x*W,y0:a.y*H,x1:(a.x+a.w)*W,y1:(a.y+a.h)*H};
 const projected=(u,which=project,body=false)=>A.bounds([which({bounds:u.bounds,body:u.bounds,renderScale:scale,ghost:u.ghost},{x:0,y:0},plan,cut,body)]);
 for(const it of components.items){
  const d=offsets[it.mi];if(!Array.isArray(d)||d.length!==2||!d.every(Number.isFinite))return null;
  ranges.push(shiftedRange(it.bbRangesAny,d));
  for(const [kind,b] of [['glyph',it.itemBounds],['entry',it.entryBounds],['exit',it.exitBounds]])if(b){
   const u={owner:cut.layout+'.main.'+it.mi+'.'+kind,kind,bounds:shift(b,d)},before=projected(u,preClip,false);
   // Require all moved owned ink to remain in the existing viewport, even if
   // source already had clip loss. This never admits additional truncation.
   if(before.x0<native.x0||before.y0<native.y0||before.x1>native.x1||before.y1>native.y1)return null;
   units.push(u);
  }
 }
 units.push(...components.fixedFurniture);
 // Any current or historical nonempty subset may determine the union bbox.
 // Independent edges over-enclose such subsets, including direct exit seeks.
 // Existing old-cache ranges and fallback are separate alternatives, rather
 // than being merged into the moved item bbox as a fictitious actual item.
 const range=Object.fromEntries(keys.map(k=>[k,[Math.min(...ranges.map(r=>r[k][0])),Math.max(...ranges.map(r=>r[k][1]))]]));
 const bbRanges=[range,components.nativeFallback,...cacheRanges];
 for(const d of cut.decor){const args={W:sw,H:sh,P:d,cut,st:style,bbRanges,includeFallback:true},parts=d.id==='memphis'?A.memphisUnits(args):A.starburstUnits(args);if(!parts?.length)return null;units.push(...parts);}
 return {units:units.map(u=>({owner:u.owner,kind:u.kind,bounds:projected(u),body:projected(u,project,true)})),bbRanges,scope:'all-source-cache-bboxes/native-hold',cacheContract:'fresh cut identity or complete supplied cache ranges'};
}
A.movedMemphisSupport=movedMemphisSupport;
})();
