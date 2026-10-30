/* Source typography blocks, with small analytic bounds for their moving annotations.
 * Glyph order, type sizes, source clocks and native clipping stay in the source renderer. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,ID=[1,0,0,1,0,0],rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]],ids=new Set('tyKeySplit tyCropGiant tyCross tyBandHide tyRuby tyBaseline tyScaleSteps tyJustify tyIndexTable tySplitType tyErode tyVRuler tyFullTrack tyStatCount tyMargin tyRotBlock tySquare tyLineFocus'.split(' '));
const handles=(plan,cut)=>ids.has(cut.layout)&&(S.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false);
const unsupported=(cut,reason)=>({diagnostic:{cut:cut.index,layout:cut.layout,status:'unsupported',reason}});
function geometry(renderer,plan,cut,W,H,scale){
 // Every source annotation is settled by .6 + .08 * its glyph index.
 // This constructs source primitives once per structural pass; it is not a clock scan.
 const count=J.glyphCount(cut.text),time=2+count*.08,programs=['main','A','B'].map(pass=>A.sourceFormulaBase.construct(renderer,plan,cut,{W,H,scale,time,pass})),polygons=[],bodies=[];
 for(const program of programs){
  const main=program.events.filter(e=>e.kind==='item'&&e.args[0].placementMain).map(e=>e.args[0]);
  if(!main.length)throw Object.assign(Error('No declared main typography'),{code:'SOURCE_FORMULA_TYPO_EMPTY'});
  const maxSize=Math.max(...main.map(it=>it.size));
  for(const e of program.events){
   let ps=e.polygons,body=e.bodyPolygons||ps;
   if(cut.layout==='tyVRuler'&&e.kind==='poly'){
    // The playhead translates between the first and last laid-out glyph centres.
    const it=main[0],ys=J.layoutText(it).filter(g=>g.ch.trim()).map(g=>it.y+g.y*(it.sy||1)),b=A.bounds(ps),points=e.args[0],cy=points[0][1];
    if(!ys.length)throw Object.assign(Error('No ruler glyph centres'),{code:'SOURCE_FORMULA_TYPO_EMPTY'});
    ps=[rect({...b,y0:b.y0+Math.min(...ys)-cy,y1:b.y1+Math.max(...ys)-cy})];body=ps;
   }
   if(cut.layout==='tyStatCount'&&e.kind==='item'&&!e.args[0].placementMain&&e.args[0].font===cut.params.nf&&/^\d{2,}$/.test(e.args[0].text)){
    // Numeric states, not times: a proportional font may make an intermediate
    // counter wider than its final value. The displayed value is in [0,count].
    const it=e.args[0];ps=[];for(let value=0;value<=count;value++)ps.push(...A.itemGeometry({...it,text:String(value).padStart(2,'0'),_lay:null,_m:null},ID,{pass:'main',scale:1}).polygons);body=ps;
   }
   polygons.push(...ps);bodies.push(...body);
  }
  if(cut.layout==='tyRuby'){
   // Ruby rises from rest + rs/2 to rest; the maximum is independent of opacity.
   const rise=Math.max(10,maxSize*.3)/2,b=A.bounds(program.events.flatMap(e=>e.polygons));polygons.push(rect({...b,y1:b.y1+rise}));bodies.push(rect({...b,y1:b.y1+rise}));
  }
  if(cut.layout==='tySquare'){
   // Empty-cell crosses use outBack(...,2), whose exact maximum is 1+32/243.
   const pad=maxSize/.9*.08*32/243,b=A.bounds(program.events.flatMap(e=>e.polygons));polygons.push(rect({x0:b.x0-pad,y0:b.y0-pad,x1:b.x1+pad,y1:b.y1+pad}));bodies.push(rect({x0:b.x0-pad,y0:b.y0-pad,x1:b.x1+pad,y1:b.y1+pad}));
  }
 }
 const bounds=A.bounds(polygons),body=A.bounds(bodies);
 if(![bounds.x0,bounds.y0,bounds.x1,bounds.y1,body.x0,body.y0,body.x1,body.y1].every(Number.isFinite)||bounds.x0>=bounds.x1||bounds.y0>=bounds.y1)throw Object.assign(Error('Invalid typography bounds'),{code:'SOURCE_FORMULA_TYPO_BOUNDS'});
 return {bounds,body,renderScale:scale};
}
function prepare(plan,cut,{scale=1,region,previous}){
 if(cut.layout==='tySplitType')return unsupported(cut,'UNSUPPORTED_TYPO_SPLIT_CLIP_SWEEP');
 if(cut.area?.angle)return unsupported(cut,'UNSUPPORTED_NATIVE_VIEWPORT_ROTATION');
 // The shared item envelope explicitly supports these native text effects.
 if(!['cut','flicker','inkBleed','magnet','neonOn','cursorSweep','resolve'].includes(cut.enter)||!['cut','overexposeOut'].includes(cut.exit)||!['still','flashBox'].includes(cut.hold)||!['none','hardShadow','outlineOffset','kerningWide'].includes(cut.treat||'none'))return unsupported(cut,'UNSUPPORTED_TYPO_GLYPH_FX');
 if(J.glyphCount(cut.text)>256)return unsupported(cut,'UNSUPPORTED_GLYPH_BUDGET');
 const area=cut.area,W=plan.W,H=plan.H,sw=area?W*area.w:W,sh=area?H*area.h:H,renderer=Object.create(J.Renderer.prototype);let local;
 try{local=geometry(renderer,plan,cut,sw,sh,scale);}catch(e){if(!e.code||!e.code.startsWith('SOURCE_FORMULA_')&&!e.code.startsWith('UNSUPPORTED_'))throw e;return unsupported(cut,e.code);}
 const domain=S.domain(plan,{...cut,simpleCircleClip:!!area},region,A.nativeBlockCircle.viewportProject(plan,cut,scale)),candidates=[];
 for(const r of domain.regions){const placed=domain.place(local,r);if(placed)candidates.push({...placed,region:r,fitness:Math.abs(Math.log(((local.body.x1-local.body.x0)/(local.body.y1-local.body.y0))/((r.x1-r.x0)/(r.y1-r.y0)))),distance:Math.hypot(placed.offset[0]/W,placed.offset[1]/H)});}
 const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;
 candidates.sort((a,b)=>b.region.score-a.region.score||a.fitness-b.fitness||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));
 const win=candidates[0];if(!win)return {diagnostic:{cut:cut.index,layout:cut.layout,status:'insufficient-space',reason:'NO_SAFE_TYPO_BLOCK',sourceBounds:local.bounds}};
 const prior=previous?.plan.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.typo;
 if(old?.direction===win.region.direction&&prior?.layout===cut.layout){const envelope=domain.fit(local,prior.offset,win.region);if(envelope){win.offset=prior.offset.slice();win.envelope=envelope;win.reusedPosition=true;}}
 return {area:area?{...area,x:area.x+win.offset[0]/W,y:area.y+win.offset[1]/H}:null,recipe:{layout:cut.layout,W:sw,H:sh,offset:win.offset,nativeViewport:!!area,sourceArea:area?{...area}:null},diagnostic:{cut:cut.index,layout:cut.layout,status:'safe',method:'native-typography-source-formula',direction:win.region.direction,score:win.region.score,region:win.region,envelope:win.envelope,reusedPosition:!!win.reusedPosition,allClockGeneration:false,structuralPasses:3}};
}
A.typoCircle=Object.freeze({ids,handles,prepare});
for(const id of ids){
 const render=J.LAYOUTS[id].render;
 J.LAYOUTS[id].render=function(env){
  const recipe=env.cut.simpleCircleRecipe?.typo;
  if(recipe){const renderer=Object.create(J.Renderer.prototype);return A.sourceFormulaBase.render(renderer,{...env,cut:{...env.cut,simpleCircleRecipe:null}},recipe);}
  if(!env.sourceGeometryItem&&!env.formulaRole)return render(env);
  // Repeated auxiliary lyrics retain their native field and clocks. Source main
  // text and its local annotations keep the primary role and move together.
  if(id==='tyCropGiant'){
   // 11p_typo1 draws gi directly before its first mainDraw and all labels.
   let first=true;const draw=env.draw;
   return render({...env,draw:it=>{if(!first)return draw(it);first=false;return env.withDrawRole('independentDecor',id+'.giant',()=>draw(it));}});
  }
  // mainDraw's placementLayoutsA boundary (06_layouts.js) temporarily selects
  // primary even inside independentDecor. Both construct and render set that
  // flag. The remainder is the source's band rect, clip and repeated text.
  if(id==='tyBandHide')return env.withDrawRole('independentDecor',id+'.tiledAux',()=>render(env));
  return render(env);
 };
}
})();
