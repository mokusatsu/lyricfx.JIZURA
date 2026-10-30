/* Reuse declared continuous source sweeps through a geometry-only boundary. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]],ids=new Set([...A.layoutsA26,...A.layoutsB25,...A.layoutsC34,...Object.keys(A.sourceFormulaD||{}),'marquee','tile','scatter','huge','labels','gloss','diag','stack']),dedicated=new Set(['headlineDeck']);
const handles=(plan,cut)=>ids.has(cut.layout)&&!dedicated.has(cut.layout)&&(S.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false);
function prepare(plan,cut,{scale,region,previous}){
 if(cut.layout==='billboard')return A.knownSceneGeometry.prepareBillboard(plan,cut,{scale,region,previous});
 if(['tiles','magnets'].includes(cut.layout))return A.knownSceneGeometry.prepareNativeScene(plan,cut,{scale,region,previous});
 const W=plan.W,H=plan.H,area=cut.area,sw=area?W*area.w:W,sh=area?H*area.h:H,renderer=Object.create(J.Renderer.prototype),isB=A.layoutsB25.includes(cut.layout),isC=A.layoutsC34.includes(cut.layout),isD=!!A.sourceFormulaD?.[cut.layout],smallPlan={...plan,W:sw,H:sh},plain=cut.enter==='cut'&&cut.exit==='cut'&&cut.hold==='still'&&(cut.treat||'none')==='none';
 if(area?.angle)return {diagnostic:{cut:cut.index,status:'unsupported',reason:'UNSUPPORTED_NATIVE_VIEWPORT_ROTATION',layout:cut.layout}};
 const directB=new Set(['tunnel','wordCloud','crossBands','neon','zoomRepeat','curtain','columnsBig','halfVertical','tape']);
 if((isD||isB&&!directB.has(cut.layout)&&cut.treat!=='none')&&!plain)return {diagnostic:{cut:cut.index,status:'unsupported',reason:'SOURCE_FORMULA_COUPLED_GLYPH_FX',layout:cut.layout}};
 try{
  if(A.layoutsA26.includes(cut.layout))A.layoutsAFormulaDomain(smallPlan,cut,true);if(isB)A.layoutsBFormulaDomain(smallPlan,cut,true);if(A.layoutsCObjectsSource.ids.includes(cut.layout))A.layoutsCObjectsSource.domain(cut);if(A.layoutsCEditorialSource.ids.includes(cut.layout))A.layoutsCEditorialSource.domain(cut);const japanese=A.layoutsCJapaneseSource.ids.includes(cut.layout)&&!(cut.layout==='priceTag'&&cut.params.variant==='hang')?A.layoutsCJapaneseSource.domain(cut,smallPlan):null;
  const time=A.layoutsCLinkedSource.ids.includes(cut.layout)?A.layoutsCLinkedSource.clock(cut,smallPlan):A.layoutsCEditorialSource.ids.includes(cut.layout)?A.layoutsCEditorialSource.clock(cut,smallPlan):A.layoutsCObjectsSource.ids.includes(cut.layout)?A.layoutsCObjectsSource.clock(cut)+.0001:japanese?japanese.entry+.0001:isB?A.layoutsBSourceRestTime(cut)-cut.start:Math.max(1.5,cut.dur/2),programs=['main','A','B'].map(pass=>A.sourceFormulaBase.construct(renderer,plan,cut,{W:sw,H:sh,time,pass})),program=programs[0],sourceCut=program.sourceCut;const mainItems=programs.flatMap(p=>p.events.filter(e=>e.kind==='item'&&e.args[0].placementMain).map(e=>e.args[0]));if(mainItems.length&&mainItems.every(it=>it.noHold))sourceCut.hold='still';let polygons;
  function geometry(p){
   if(isD){const g=A.sourceFormulaD[cut.layout](renderer,smallPlan,sourceCut,p);return g.envelopes||g.units?.flatMap(u=>u.envelopes);}
   if(isB)return A.layoutsBSourceEnvelopes(p,smallPlan,sourceCut);
   if(A.layoutsCEditorialSource.ids.includes(cut.layout))return A.layoutsCEditorialSource.envelopes(p,smallPlan,sourceCut);
   if(A.layoutsCObjectsSource.ids.includes(cut.layout))return A.layoutsCObjectsSource.envelopes(p,smallPlan,sourceCut);
   if(A.layoutsCJapaneseSource.ids.includes(cut.layout))return A.layoutsCJapaneseSource.envelopes(p,smallPlan,sourceCut);
   if(A.layoutsCLinkedSource.ids.includes(cut.layout))return A.layoutsCLinkedSource.envelopes(p,smallPlan,sourceCut);
   if(A.basicLayouts.includes(cut.layout))return p.events.flatMap(e=>e.polygons);
   if(isC)throw Object.assign(Error('Source body model unavailable'),{code:'SOURCE_FORMULA_C_BODY_MODEL'});
   return A.layoutsASourceEnvelopes(p,smallPlan,sourceCut);
  }
  polygons=programs.flatMap(p=>p.events.length||p.nativeDGeometry?geometry(p):[]);
  if(!polygons?.length)return {diagnostic:{cut:cut.index,status:'unsupported',reason:'SOURCE_FORMULA_EMPTY',layout:cut.layout}};
  const bodyPrograms=programs.map(p=>({...p,events:p.events.map(e=>({...e,polygons:e.bodyPolygons||e.polygons}))}));let bodyPolygons=isD?polygons:bodyPrograms.flatMap(p=>p.events.length?geometry(p):[]);if(!bodyPolygons?.length)bodyPolygons=polygons;const bounds=A.bounds(polygons),local={bounds,body:A.bounds(bodyPolygons),renderScale:scale},domain=S.domain(plan,{...cut,simpleCircleClip:!!area},region,A.nativeBlockCircle.viewportProject(plan,cut,scale)),candidates=[];
  for(const r of domain.regions){const placed=domain.place(local,r);if(placed)candidates.push({...placed,region:r,fitness:Math.abs(Math.log(((bounds.x1-bounds.x0)/(bounds.y1-bounds.y0))/((r.x1-r.x0)/(r.y1-r.y0)))),distance:Math.hypot(placed.offset[0]/W,placed.offset[1]/H)});}
  const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;candidates.sort((a,b)=>b.region.score-a.region.score||a.fitness-b.fitness||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));const win=candidates[0];if(!win)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_SOURCE_SWEEP',layout:cut.layout,sourceBounds:bounds}};
  const prior=previous?.plan.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.sourceFormula;if(old?.direction===win.region.direction&&prior?.layout===cut.layout){const envelope=domain.fit(local,prior.offset,win.region);if(envelope){win.offset=prior.offset.slice();win.envelope=envelope;win.reusedPosition=true;}}
  // These source decorations attach to the body; the generic role renderer
  // keeps independentDecor at its native position. Preserve the zero move,
  // and reject translation until their coupled transport is modeled here.
  if(['chochin','tanzaku','ema','bookSpine','stampSheet'].includes(cut.layout)&&win.offset.some(v=>v!==0))return {diagnostic:{cut:cut.index,status:'unsupported',reason:'SOURCE_FORMULA_COUPLED_DECOR_TRANSLATION',layout:cut.layout}};
  return {area:area?{...area,x:area.x+win.offset[0]/W,y:area.y+win.offset[1]/H}:null,recipe:{layout:cut.layout,W:sw,H:sh,offset:win.offset,nativeViewport:!!area,sourceArea:area?{...area}:null},diagnostic:{cut:cut.index,status:'safe',method:'declared-continuous-source-sweep',direction:win.region.direction,score:win.region.score,region:win.region,envelope:win.envelope,reusedPosition:!!win.reusedPosition,allClockGeneration:false,structuralPasses:3,constructionTime:time}};
 }catch(e){if(!e.code||!(e.code.startsWith('UNSUPPORTED_')||e.code.startsWith('SOURCE_FORMULA_')||['GEOMETRY_LIMIT','C_OBJECT_DISC_INK','SHADOW_OUTPUT_SCOPE_REQUIRED','PAPER_ATTACHMENT_OVERFLOW','WRITING_FIELD_OVERFLOW','READABILITY_FLOOR'].includes(e.code)))throw e;return {diagnostic:{cut:cut.index,status:'unsupported',reason:e.code,details:e.message,layout:cut.layout}};}
}
A.sourceFormulaCircle=Object.freeze({ids,handles,prepare});
})();
