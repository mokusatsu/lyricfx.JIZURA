/* D fisheye: continuous source algebra, not sampled frames. Source widths are
   b_i*k_i with 1<=k_i<=1+amp; signed prefix/suffix sums bound every glyph
   centre while the lens reflows the row. The actual native renderer is replayed. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],fail=(code,message)=>{const e=Error(message);e.code=code;throw e;};
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],norm=t=>String(t||'').replace(/\s/g,'');
function rowIntervals(row,g,W){
 if(!row.base.every(b=>Number.isFinite(b)&&b>=0&&b<=4*g.s0))fail('UNSUPPORTED_PARAMETER_RANGE','Finite nonnegative native advances at most4em required');
 const total=row.base.reduce((a,b)=>a+b,0),center=row.centerX??W/2,rest=[];let prefix=0;for(const b of row.base){rest.push(center-total/2+prefix+b/2);prefix+=b;}
 const centres=row.base.map(()=>[Infinity,-Infinity]),lens=[Infinity,-Infinity],sig=g.s0*1.25;
 // Partition every possible lens position by the nearest native glyph centre.
 // Inside its Voronoi cell, distance to every other glyph has this exact lower
 // bound. exp(-d²/sig²) therefore bounds all Gaussian width factors together.
 for(let nearest=0;nearest<rest.length;nearest++){
  const lo=nearest?(rest[nearest-1]+rest[nearest])/2:-Infinity,hi=nearest+1<rest.length?(rest[nearest]+rest[nearest+1])/2:Infinity,maxima=rest.map((x,i)=>{const distance=Math.max(0,lo-x,x-hi);return row.base[i]*(1+g.amp*Math.exp(-((distance/sig)**2)));});
  for(let i=0;i<rest.length;i++){let before=0,after=0,beforeMax=0,afterMax=0;for(let j=0;j<rest.length;j++)if(j<i){before+=row.base[j];beforeMax+=maxima[j];}else if(j>i){after+=row.base[j];afterMax+=maxima[j];}const x0=center+(before-afterMax)/2,x1=center+(beforeMax-after)/2;centres[i][0]=Math.min(centres[i][0],x0);centres[i][1]=Math.max(centres[i][1],x1);if(i===nearest){lens[0]=Math.min(lens[0],x0);lens[1]=Math.max(lens[1],x1);}}
 }
 return {centres,lens};
}
function record(renderer,plan,cut,time){const ctx=A.measurementContext();ctx.reset();const env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:time,realTime:time,lt:time-cut.start,ltb:time-cut.start,step:0,scale:1,allowFilter:false});const program=A.record(renderer,env);if(!program.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(program.diagnostics));return {program,env};}
function proof(renderer,plan,cut,time){
 const {program,env}=record(renderer,plan,cut,time),g=program.nativeDGeometry;if(g?.kind!=='fisheye'||!g.rows?.length||!Number.isFinite(g.s0)||g.s0<=0||!Number.isFinite(g.amp)||g.amp<0||g.amp>1.1)fail('UNSUPPORTED_PARAMETER_RANGE','Finite native fisheye amplitude0..1.1 and nonempty rows required');
 const main=program.events.filter(e=>e.kind==='item'&&e.args[0].placementDSource),copy=main.map(e=>e.args[0].text).join('');if(norm(copy)!==norm(cut.text))fail('SOURCE_COVERAGE','Every source glyph must appear once in native reading order');
 const units=[],maxK=1+g.amp,intervals=g.rows.map(r=>rowIntervals(r,g,plan.W));
 for(const e of main){const it=e.args[0],{row,index}=it.placementDSource,r=g.rows[row];if(!r||r.chars[index]!==it.text)fail('SOURCE_COVERAGE','Native row/glyph mapping differs');
  const [x0,x1]=intervals[row].centres[index];
  const local=A.bounds(A.itemGeometry({...it,x:0,y:0,size:g.s0,sx:maxK,sy:maxK},ID,env).polygons),poly=rect(x0+Math.min(0,local.x0),r.cy+Math.min(0,local.y0),x1+Math.max(0,local.x1),r.cy+Math.max(0,local.y1));
  units.push({owner:e.owner,source:{row,index,text:it.text,font:it.font},envelopes:[A.cameraEnvelope([poly],plan,cut,20)]});
 }
 if(g.glass!=='none')for(let row=0;row<g.rows.length;row++){
  if(g.glass==='lens'&&g.mode==='pingpong'&&row!==g.rows.length-1)continue;
  const r=g.rows[row],total=r.base.reduce((a,b)=>a+b,0),cx=r.centerX??plan.W/2,cy=r.cy;let poly;
  if(g.glass==='lens'){const radius=Math.max(g.s0*(1+.5*g.amp)*.95*1.25,g.s0*1.05),pad=4*Math.max(2,Math.min(plan.W,plan.H)*.005)+4,[x0,x1]=intervals[row].lens;poly=rect(x0-radius-pad,cy-radius-pad,x1+Math.max(radius,1.75*Math.cos(50*J.DEG)*radius)+pad,cy+Math.max(radius,1.75*Math.sin(50*J.DEG)*radius)+pad);}
  else if(g.glass==='grid'){const lw=Math.max(1,Math.min(plan.W,plan.H)*.0012),displacement=.9*g.amp*(1.4*1.25*g.s0)/Math.sqrt(2*Math.E),rx=3*g.s0+displacement+20*lw+4,ry=1.5*g.s0+displacement+20*lw+4,x0=cx-total/2-g.s0*1.25,x1=cx+total/2+g.s0*1.25;poly=rect(x0-rx,cy-ry,x1+rx,cy+ry);}
  else fail('UNSUPPORTED_PARAMETER_RANGE','Native fisheye lens/grid/none required');
  units.push({owner:'fisheye.row.'+row+'.lens',source:{row,kind:g.glass,role:'owned lens markers'},envelopes:[A.cameraEnvelope([poly],plan,cut,20)]});
 }
 if(program.events.some(e=>e.role!=='primary'||!units.some(u=>u.owner===e.owner)))fail('UNMEASURED_OWNER','Every fisheye glyph and lens event requires a source owner');
 return {program,geometry:g,units,quality:{complete:true,sourceGlyphs:main.length,minPrimaryPx:g.s0*(cut.contentScale??1),nativeRows:g.rows.length,amp:g.amp}};
}
A.finalizeLayoutsDFisheye=(plan,cut,original,diagnostics,{revision,stepDur,reachTail,explicitSize})=>{
 try{
  if(cut.layout!=='fisheye')fail('D_SOURCE_PROOF_PENDING','Dedicated '+cut.layout+' source geometry proof remains pending; see layoutsDInventory');
  if([...norm(cut.text)].length<3||[...norm(cut.text)].length>16)fail('UNSUPPORTED_PARAMETER_RANGE','Native fisheye source requires3..16 glyph slots');
  if(cut.treat!=='none'||!['sweep','pingpong'].includes(cut.params.mode)||!['lens','grid','none'].includes(cut.params.glass)||!Number.isFinite(cut.params.amp)||cut.params.amp<.7||cut.params.amp>1.1)fail('UNSUPPORTED_PARAMETER_RANGE','Unmodified fisheye mode/glass and native amplitude .7..1.1 required');
  if(!A.layoutsDSourceKnown?.(cut.layout))fail('STALE_D_SOURCE','Unchanged registered D source required');
  cut.placementLayoutsD=true;cut.placementUnits=true;
  const renderer=Object.create(J.Renderer.prototype),time=cut.start+cut.dur/2,native=proof(renderer,plan,cut,time),evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail],regions=plan.lyricAvoidanceIndex.regions,candidates=[null,...[1.2,1.4,1.6].map(rowPitch=>({rowPitch,amp:cut.params.amp,strategy:'native-row-pitch'})),...(explicitSize?[]:[.9,.8,.7].flatMap(ratio=>[1,1.2,1.4].map(rowPitch=>({rowPitch,amp:Math.max(.7,cut.params.amp*ratio),strategy:'source-lens-strength-and-row-pitch'})))),...(explicitSize?[]:[.95,.9,.85,.8,.75,.7].flatMap(fontScale=>[1,1.2,1.4].map(rowPitch=>({fontScale,rowPitch,amp:.7,strategy:'local-type-size-with-native-bulge-and-row-pitch'}))))],memo=new Map(),segments=[];
  for(let i=0;i<regions.length;i++){
   const r=regions[i],end=Math.min(r.end??regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1]||end<=evaluationRange[0]||end<=r.start)continue;
   const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)},attempts=[];let chosen=null;
   const top=(circle.cy-circle.r)/2,bottom=(circle.cy+circle.r+plan.H)/2,k=native.geometry.rows.length,laneCandidates=[{strategy:'source-existing-rows-upper-lane',rowCenters:native.geometry.rows.map((row,i)=>[row.centerX,top+(i-(k-1)/2)*native.geometry.s0*(1.35+native.geometry.amp*.55)])},{strategy:'source-existing-rows-lower-lane',rowCenters:native.geometry.rows.map((row,i)=>[row.centerX,bottom+(i-(k-1)/2)*native.geometry.s0*(1.35+native.geometry.amp*.55)])},...(k===2?[{strategy:'source-existing-rows-opposite-bands',rowCenters:[[plan.W/2,top],[plan.W/2,bottom]]}]:[])],schedule=[candidates[0],...laneCandidates,...candidates.slice(1)];
   for(let j=0;j<schedule.length;j++){
    const recipe=schedule[j],key=JSON.stringify(recipe);let trial=memo.get(key);if(!trial){if(memo.size>=128){attempts.push({strategy:'candidate-budget',status:'insufficient-space',reason:'CUT_CANDIDATE_BUDGET'});break;}try{trial=recipe?proof(renderer,plan,{...cut,layoutDRecipe:recipe},time):native;if(trial.quality.minPrimaryPx<Math.min(native.quality.minPrimaryPx,Math.max(18,.035*Math.min(plan.W,plan.H)))-1e-8)fail('READABILITY_FLOOR','Source lens candidate reduces native primary below its readable floor');memo.set(key,trial);}catch(e){trial={error:{code:e.code||'DRAW_PROGRAM_ERROR',message:e.message}};memo.set(key,trial);}}
    if(trial.error){attempts.push({strategy:recipe?.strategy||'native-source-translation',status:'unsupported',reason:trial.error.code,details:trial.error.message});continue;}
    const envelopes=trial.units.flatMap(u=>u.envelopes),solution=A.solveBasic(envelopes,circle,plan.W,plan.H,cut.seed,{supportHull:true});attempts.push({strategy:recipe?.strategy||'native-source-translation',recipe,status:solution.status,reason:solution.reason||null,quality:trial.quality});if(solution.status==='safe'){chosen={trial,recipe,solution};break;}
   }
   segments.push({start:r.start,end,region:r.id,circle,from:chosen?.solution.offset||[0,0],to:chosen?.solution.offset||[0,0],status:chosen?'safe':'insufficient-space',decision:chosen?'certified':'excluded-during-avoidance',composition:chosen?.recipe||null,envelopes:(chosen?.trial||native).units.flatMap(u=>u.envelopes),unitProofs:(chosen?.trial||native).units,attempts});
  }
  if(!segments.length){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:'PRESERVED_NO_ACTIVE_REGION',safety:'not-evaluated'});return;}
  cut.placementTrajectory={kind:'layouts-d-source-native',version:1,revision,evaluationRange,measurementSupported:true,units:[{owner:'fisheye.composition',segments}],sourceProof:{kind:'signed-source-width-intervals',glyphCoverage:native.quality,fontProof:'D bulge uses one fixed CSS font at base size and uniform Canvas glyph scale k in[1,1+amp]. Measured fixed outline +1fontpx/+2devicepx; no assumption that TextMetrics scales across changing hinted CSS sizes.',interval:'all cut/render/display/ghost clocks, including continuous hold lens reflow',lensProof:'Nearest-rest-centre Voronoi cells; glass requires lensIn>.01 and native finite0..4em advances. Source midpoint ties choose first; union includes both cells.',candidateBudget:{unique:memo.size,perCutLimit:128,limitPerRegion:34},manualCoordinates:false},safety:segments.every(s=>s.status==='safe')?'certified-bounded-adapter':'insufficient-space'};
  diagnostics.push({cut:cut.index,code:'STAGED_D_ADAPTER',safety:cut.placementTrajectory.safety});
 }catch(e){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:e.code||'DRAW_PROGRAM_ERROR',details:e.message,safety:'unsupported'});}
};
const contains=(p,poly)=>{let pos=false,neg=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],v=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(v>1e-5)pos=true;if(v< -1e-5)neg=true;}return !(pos&&neg);};
A.renderLayoutsDFisheye=(renderer,env)=>{
 A.validateFinal(env.plan);const scale=env.scale||1;if(scale<.1||scale>4)fail('UNSUPPORTED_RENDER_SCALE','D certified scale range .1..4 required');
 const tr=env.cut.placementTrajectory,unit=tr.units[0],active=unit.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),offset=A.offsetAt(unit,env.realTime);if(active?.composition){const cut={...env.cut,layoutDRecipe:active.composition};env=renderer.makeEnv(env.ctx,env.plan,cut,env.sc,{...env,cut});}
 const program=A.record(renderer,env);if(!program.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(program.diagnostics));const proofs=active?.unitProofs,events=program.events.filter(e=>e.role==='primary').map(e=>({event:e,polygons:e.polygons.map(p=>p.map(v=>[v[0]/scale,v[1]/scale]))})),covered=!active||events.every(({event,polygons})=>{const u=proofs.find(u=>u.owner===event.owner);return u&&polygons.every(p=>u.envelopes.some(q=>p.every(v=>contains(v,q))));});
 if(!covered)fail('D_ENVELOPE_VIOLATION','Native fisheye event escaped its continuous source owner interval');
 const polygons=events.flatMap(e=>e.polygons.map(p=>p.map(v=>[v[0]+offset[0],v[1]+offset[1]]))),region=J.resolveAvoidanceAt(env.plan,env.realTime),circle=region?J.avoidanceCirclePixels(region,env.plan.W,env.plan.H):null,clear=!polygons.length||A.clear(polygons,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H))),stageContained=polygons.every(p=>p.every(v=>v[0]>=0&&v[0]<=env.plan.W&&v[1]>=0&&v[1]<=env.plan.H));
 if(active?.status==='safe'&&(!clear||!stageContained))fail('D_SOURCE_SAFETY_VIOLATION','Certified fisheye source ink escaped stage or intersects the active circle');
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset,measurementSupported:true,envelopeCovered:covered,stageContained,strictCircleClear:clear,safety:active?.status==='insufficient-space'?'conflict':clear?'safe':'conflict',polygons,events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,polygons:e.polygons}))});A.replay(env,program,offset);
};
})();
