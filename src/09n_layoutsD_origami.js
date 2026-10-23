/* Native origami source interval adapter. No sampled face union: every hinge
   vertex is bounded analytically for its complete cosine/sine domain. */
(() => {
'use strict';
const A=J.placement,fail=(code,message)=>{const e=Error(message);e.code=code;throw e;},rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],norm=t=>String(t||'').replace(/\s/g,'');
// Attachment is checked in untransformed native sheet coordinates, separately
// from the stage/circle certificate. Nominal advances alone cannot establish it.
function attachment(g,polygons,plan,nativeAllowance){
 const cx=plan.W/2,cy=plan.H/2,padding=g.mode==='gate'?g.size*.25:0,hx=g.mode==='gate'?g.sw/2-padding:g.rx*.42,hy=g.mode==='gate'?g.sh/2-padding:g.ry*.42,vertices=polygons.flat().map(p=>[p[0]-cx,p[1]-cy]);
 if(!vertices.length||hx<=0||hy<=0)fail('WRITING_FIELD_OVERFLOW','Nonempty actual glyph ink and positive sheet writing field required');
 const b=A.bounds([vertices]),overhang={left:Math.max(0,-hx-b.x0)/g.size,right:Math.max(0,b.x1-hx)/g.size,top:Math.max(0,-hy-b.y0)/g.size,bottom:Math.max(0,b.y1-hy)/g.size},allowance=nativeAllowance||overhang,eps=1e-7;
 const physicalPaperContained=vertices.every(([x,y])=>g.mode==='gate'?Math.abs(x)<=g.sw/2+eps&&Math.abs(y)<=g.sh/2+eps:Math.abs(x)/g.rx+Math.abs(y)/g.ry<=1+eps),writingFieldContained=b.x0>=-hx-allowance.left*g.size-eps&&b.x1<=hx+allowance.right*g.size+eps&&b.y0>=-hy-allowance.top*g.size-eps&&b.y1<=hy+allowance.bottom*g.size+eps;
 if(!physicalPaperContained)fail('PAPER_ATTACHMENT_OVERFLOW','Complete actual guarded lyric ink must remain inside the physical sheet');
 if(!writingFieldContained)fail('WRITING_FIELD_OVERFLOW','Actual guarded glyph ink exceeds the writing field and original font-relative overhang allowance');
 return {physicalPaperContained,writingFieldContained,kind:g.mode==='gate'?'padded-sheet-rectangle':'proportional-inner-field-and-physical-diamond',padding,halfWritingField:[hx,hy],bounds:b,nativeOverhangAllowanceEm:allowance,actualOverhangEm:overhang,guardScope:'Complete un-clipped source TextMetrics + stroke/font/device guards; no nominal-advance substitution'};
}
function proof(renderer,plan,cut,nativeAllowance){
 const ctx=A.measurementContext();ctx.reset();const time=cut.start+Math.min(cut.dur/2,Math.max(.9,cut.inDur)),env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:time,realTime:time,lt:time-cut.start,ltb:time-cut.start,step:0,scale:1,allowFilter:false,placementEnvelope:true}),program=A.record(renderer,env),g=program.nativeDGeometry;
 if(!program.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(program.diagnostics));
 if(g?.kind!=='origami'||!['gate','blintz'].includes(g.mode)||!Number.isFinite(g.size)||g.size<=0)fail('ORIGAMI_SOURCE_GEOMETRY','Finite source sheet/text metadata required');
 const text=program.events.filter(e=>e.owner==='origami.text');if(text.length!==1||text[0].kind!=='item'||norm(text[0].args[0].text)!==norm(cut.text))fail('SOURCE_COVERAGE','Exactly one complete original lyric run required');
 if(program.events.some(e=>e.role!=='primary'||!['origami.sheet','origami.text'].includes(e.owner)))fail('UNMEASURED_OWNER','Every sheet, flap, crease, shadow and lyric event must be source owned');
 if(cut.layoutDRecipe && (g.mode==='gate' ? g.writing[0]>g.sw-g.size*.5||g.writing[1]>g.sh-g.size*.5 : g.writing[0]>g.rx*.84||g.writing[1]>g.ry*.84))fail('WRITING_FIELD_OVERFLOW','Reflow must retain the native sheet interior writing field');
 const attached=attachment(g,text[0].polygons,plan,nativeAllowance);
 const cx=plan.W/2,cy=plan.H/2,points=g.mode==='gate'?rect(cx-g.sw/2,cy-g.sh*.55,cx+g.sw/2,cy+g.sh*.55):[[cx,cy-g.ry],[cx+g.rx,cy],[cx,cy+g.ry],[cx-g.rx,cy]],shadow=points.map(p=>[p[0]+g.shadow[0],p[1]+g.shadow[1]]);
 if(!points.flat().every(Number.isFinite))fail('ORIGAMI_SOURCE_GEOMETRY','Finite source extrema required');
 // The recorder bounds each joined flap line [a,apex,b] by its full
 // axis-aligned box. Across the four hinges those boxes fill this octagon;
 // the physical diamond alone would omit conservative recorded corners.
 const lineInterval=g.mode==='blintz'?[[cx-g.rx,cy-g.ry/2],[cx-g.rx/2,cy-g.ry],[cx+g.rx/2,cy-g.ry],[cx+g.rx,cy-g.ry/2],[cx+g.rx,cy+g.ry/2],[cx+g.rx/2,cy+g.ry],[cx-g.rx/2,cy+g.ry],[cx-g.rx,cy+g.ry/2]]:[];
 // Gate ex lies between hinge ±sw/4 and |skew|<=sh*.05. Blintz
 // apex=hm+(centre-hm)*cos(theta) is a convex segment inside the diamond.
 // shrink∈[0,1] contracts all sheet coordinates about centre. Shadow offset
 // stays fixed. All hidden faces and both painter branches are included.
 const sheet=A.convexHull([...points,...shadow,...lineInterval,[cx,cy]].flatMap(p=>rect(p[0]-10,p[1]-10,p[0]+10,p[1]+10))),ink=text[0].polygons.flat(),textSweep=A.convexHull([[cx,cy],...ink]),camera=ps=>A.cameraEnvelope([ps],{...plan,fx:cut.effectFx||plan.fx,style:cut.effectStyle||plan.style},cut,20);
 return {g,envelopes:[camera(sheet),camera(textSweep)],unitProofs:[{owner:'origami.sheet',envelopes:[camera(sheet)]},{owner:'origami.text',envelopes:[camera(textSweep)]}],quality:{complete:true,sourceGlyphs:[...norm(g.text)].length,minPrimaryPx:g.size*(cut.contentScale??1),fontSize:g.size,requestedMode:cut.params.mode,sourceMode:g.mode,attachment:attached}};
}
function finalize({plan,cut,revision,stepDur,reachTail,explicitSize}){
 if(cut.enter!=='cut'||cut.exit!=='cut'||cut.hold!=='still'||cut.treat!=='none'||!['gate','blintz'].includes(cut.params.mode)||!Number.isInteger(cut.params.order)||cut.params.order<0||cut.params.order>3)fail('UNSUPPORTED_PARAMETER_RANGE','Origami native cut/cut/still, no treatment, gate/blintz and order0..3 required');
 if([...norm(cut.text)].length<1||[...norm(cut.text)].length>14)fail('UNSUPPORTED_PARAMETER_RANGE','Native origami1..14 source glyph slots required');
 const renderer=Object.create(J.Renderer.prototype),native=proof(renderer,plan,cut),evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail],baseSize=native.g.size;
 const recipes=[null,...[undefined,2,3,4,5,7].map(columns=>({strategy:'native-font-sheet-writing-hinge-pitch',sheetWriting:true,baseSize,...(columns?{columns}:{})})),...(explicitSize?[]:[.95,.9,.85,.8,.75,.7].flatMap(fontScale=>[undefined,2,3,4,5].map(columns=>({strategy:'local-font-sheet-writing-hinge-pitch',sheetWriting:true,baseSize,fontScale,...(columns?{columns}:{})}))))],memo=new Map([[JSON.stringify(null),native]]),segments=[];
 for(let i=0;i<plan.lyricAvoidanceIndex.regions.length;i++){
  const r=plan.lyricAvoidanceIndex.regions[i],end=Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1]||end<=evaluationRange[0]||end<=r.start)continue;
  const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)},attempts=[];let chosen=null;
  for(const recipe of recipes){const key=JSON.stringify(recipe);let trial=memo.get(key);if(!trial){try{trial=proof(renderer,plan,{...cut,layoutDRecipe:recipe},native.quality.attachment.nativeOverhangAllowanceEm);if(trial.quality.minPrimaryPx<Math.min(native.quality.minPrimaryPx,Math.max(18,.035*Math.min(plan.W,plan.H)))-1e-8)fail('READABILITY_FLOOR','Native primary readable floor required');}catch(e){trial={error:{code:e.code||'DRAW_PROGRAM_ERROR',message:e.message}};}memo.set(key,trial);}
   if(trial.error){attempts.push({strategy:recipe?.strategy,status:'unsupported',reason:trial.error.code});continue;}
   const solution=A.solveBasic(trial.envelopes,circle,plan.W,plan.H,cut.seed,{supportHull:true});attempts.push({strategy:recipe?.strategy||'native-full-size-joint-placement',recipe,status:solution.status,reason:solution.reason||null,quality:trial.quality});if(solution.status==='safe'){chosen={trial,recipe,solution};break;}
  }
  const p=chosen?.trial||native,offset=chosen?.solution.offset||[0,0];segments.push({start:r.start,end,region:r.id,circle,from:offset,to:offset,status:chosen?'safe':'insufficient-space',decision:chosen?'certified':'excluded-during-avoidance',composition:chosen?.recipe||null,envelopes:p.envelopes,unitProofs:p.unitProofs,attempts});
 }
 return {kind:'layouts-d-source-native',version:1,revision,evaluationRange,measurementSupported:true,units:[{owner:'origami.composition',segments}],sourceProof:{kind:'analytic-sheet-hinge-extrema',coverage:native.quality,interval:'All source fold clocks and shrink0..1; gate cos[-1,1]/sin[-1,1]; blintz apex convex hinge-centre-corner segment; all hidden faces and both under/over branches',lineRecorderProof:'Every joined flap line is measured by its axis-aligned box. The continuous four-hinge box union fits the octagon(cx±rx,cy±ry/2),(cx±rx/2,cy±ry), including all cos/sin branches; physical diamond and its fixed shadow remain separately included before stroke/miter/camera guards.',font:'ON uses fixed native CSS size and continuous Canvas sx/sy shrink; measured source outline plus font/device guards. OFF retains original CSS-size shrink.',ownership:'Lyric, sheet, shadow, creases and all folding flaps; original order and occlusion retained',attachment:'Complete actual un-clipped guarded glyph polygons must fit the physical paper, and the changed writing field plus the original per-side font-relative overhang allowance; gate has .25font padding, blintz has .84rx by .84ry writing field inside its physical diamond',sourceMode:native.g.mode,requestedMode:cut.params.mode,explicitSizePreserved:explicitSize,candidateBudget:memo.size},safety:segments.every(s=>s.status==='safe')?'certified-bounded-adapter':'insufficient-space'};
}
const contains=(p,poly)=>{let pos=false,neg=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],v=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(v>1e-5)pos=true;if(v< -1e-5)neg=true;}return !(pos&&neg);};
function render({renderer,env,trajectory}){
 A.validateFinal(env.plan);const scale=env.scale??1;if(!Number.isFinite(scale)||scale<.1||scale>4)fail('UNSUPPORTED_RENDER_SCALE','Origami certified render scale .1..4 required');
 const unit=trajectory.units[0],active=unit.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),offset=A.offsetAt(unit,env.realTime);if(active?.composition){const cut={...env.cut,layoutDRecipe:active.composition};env=renderer.makeEnv(env.ctx,env.plan,cut,env.sc,{...env,cut});}
 const program=A.record(renderer,env);if(!program.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(program.diagnostics));const events=program.events.map(event=>({event,polygons:event.polygons.map(p=>p.map(v=>[v[0]/scale,v[1]/scale]))})),covered=!active||events.every(({event,polygons})=>{const proof=active.unitProofs.find(u=>u.owner===event.owner);return event.role==='primary'&&proof&&polygons.every(p=>proof.envelopes.some(q=>p.every(v=>contains(v,q))));});if(!covered)fail('D_ENVELOPE_VIOLATION','Origami actual source event escaped complete analytic hinge/sheet envelope');
 const polygons=events.flatMap(e=>e.polygons.map(p=>p.map(v=>[v[0]+offset[0],v[1]+offset[1]]))),region=J.resolveAvoidanceAt(env.plan,env.realTime),circle=region?J.avoidanceCirclePixels(region,env.plan.W,env.plan.H):null,clear=polygons.length===0||A.clear(polygons,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H))),stageContained=polygons.every(p=>p.every(v=>v[0]>=0&&v[0]<=env.plan.W&&v[1]>=0&&v[1]<=env.plan.H));if(active?.status==='safe'&&(!clear||!stageContained))fail('D_SOURCE_SAFETY_VIOLATION','Origami actual owned ink escaped stage or active circle clearance');
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset,measurementSupported:true,envelopeCovered:covered,stageContained,strictCircleClear:clear,safety:active?.status==='insufficient-space'?'conflict':clear?'safe':'conflict',polygons,events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,polygons:e.polygons}))});A.replay(env,program,offset);
}
A.registerLayoutsDAdapter('origami',{id:'origami-native-hinges-v1',finalize,render});
})();
