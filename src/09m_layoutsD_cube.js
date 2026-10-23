/* Cube source certificate: a finite orthographic solid, not a frame union.
   For every real yaw, a cos(t)+b sin(t) is bounded by hypot(a,b).
   Each face's complete local text outline is measured before its visibility
   test. Pop's exact cubic maximum and all camera/ghost clocks are included. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],fail=(code,message)=>{const e=Error(message);e.code=code;throw e;},rect=(a,b,c,d)=>[[a,b],[c,b],[c,d],[a,d]],clean=t=>String(t).replace(/\s/g,'');
function proof(renderer,plan,cut){
 const ctx=A.measurementContext();ctx.reset();const time=cut.start+cut.dur/2,env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:time,realTime:time,lt:time-cut.start,ltb:time-cut.start,step:0,scale:1,allowFilter:false}),program=A.record(renderer,env),g=program.nativeDGeometry;
 if(!program.measurementSupported||g?.kind!=='cube')fail('CUBE_RECORD','Native source cube geometry required: '+JSON.stringify(program.diagnostics));
 if(clean(g.chunks.join(''))!==clean(cut.text))fail('CUBE_SOURCE_COVERAGE','Ordered chunks must cover the complete source lyric');
 const {h,cx,cy,pitch:p}=g,cp=Math.cos(p),sp=Math.abs(Math.sin(p)),pop=1+4*1.3**3/(27*(1+1.3)**2),lw=Math.max(1.2,Math.min(plan.W,plan.H)*.0022);
 let rx=Math.SQRT2*h,up=h*(cp+Math.SQRT2*sp),down=h*(cp+.14+1.04*Math.SQRT2*sp);rx=Math.max(rx,Math.SQRT2*1.04*h);
 const sources=[];
 for(const entry of g.items){const it={...entry.item,alpha:1},b=A.bounds(A.itemGeometry(it,ID,env).polygons),x=Math.max(Math.abs(b.x0),Math.abs(b.x1)),y=Math.max(Math.abs(b.y0),Math.abs(b.y1));
  // Exact pre-clip local ink must fit its physical face, including stroke.
  const nb=A.bounds(A.itemGeometry(entry.nativeItem,ID,env).polygons),nx=Math.max(Math.abs(nb.x0),Math.abs(nb.x1))/g.nativeH,ny=Math.max(Math.abs(nb.y0),Math.abs(nb.y1))/g.nativeH,field=entry.kind==='lyric'?[.82,.75]:entry.kind==='alternate-copy'?[.75,.6]:[.9,.9],limit=[Math.max(field[0],nx),Math.max(field[1],ny)];
  if(x>Math.min(h-1,h*limit[0])+1e-8||y>Math.min(h-1,h*limit[1])+1e-8)fail('CUBE_WRITING_FIELD','Complete '+(entry.main?'lyric':'metadata')+' ink does not fit face '+entry.face);
  if(entry.face===4){const r=Math.hypot(x,y);rx=Math.max(rx,r);up=Math.max(up,h*cp+r*sp);down=Math.max(down,-h*cp+r*sp);}
  else{const r=Math.hypot(x,h);rx=Math.max(rx,r);up=Math.max(up,y*cp+r*sp);down=Math.max(down,y*cp+r*sp);}
  sources.push({face:entry.face,main:entry.main,chunk:entry.chunk,kind:entry.kind,writingField:{relative:limit,nativeOutlineOverhang:[Math.max(0,nx-field[0]),Math.max(0,ny-field[1])]},text:it.text,font:it.font,size:it.size,bounds:b});
 }
 // Outline recorder's conservative miter bound uses the Frobenius norm of
 // the root; the native screen-space cube edges themselves have no CTM.
 const pad=lw*10+2,poly=rect(cx-rx*pop-pad,cy-up*pop-pad,cx+rx*pop+pad,cy+down*pop+pad),envelopes=[A.cameraEnvelope([poly],{...plan,style:cut.effectStyle||plan.style,fx:cut.effectFx||plan.fx},cut,20)];
 if(program.events.some(e=>e.role!=='primary'||e.owner!=='cube.solid'))fail('CUBE_UNMEASURED_OWNER','All cube surfaces and copies remain primary');
 const ordered=sources.filter(s=>s.main).sort((a,b)=>a.chunk-b.chunk);
 if(ordered.length!==g.chunks.length||ordered.some((s,i)=>s.chunk!==i)||clean(ordered.map(s=>s.text).join(''))!==clean(cut.text))fail('CUBE_SOURCE_COVERAGE','Every lyric chunk must have a distinct native face');
 return {envelopes,sources,geometry:{h,edgeLengths:[2*h,2*h,2*h],pitch:p,mode:g.mode,dir:g.dir},minPrimaryPx:Math.min(...sources.filter(s=>s.main).map(s=>s.size))*(cut.contentScale??1)};
}
function finalize({plan,cut,revision,stepDur,reachTail,explicitSize}){
 const p=cut.params;if((cut.decor||[]).length||cut.treat!=='none'||cut.enter!=='cut'||cut.exit!=='cut'||cut.hold!=='still')fail('CUBE_EFFECT_DOMAIN','Source-native cube currently supports cut/cut/still and no treatment');
 if(!['single','pair','turn'].includes(p.mode)||!Array.isArray(p.chunks)||!p.chunks.length||p.chunks.length>4||!Number.isFinite(p.pitch)||p.pitch<0||p.pitch>35||!Number.isFinite(p.sway)||Math.abs(p.sway)>15||![1,-1].includes(p.dir))fail('CUBE_PARAMETER_DOMAIN','Finite native cube mode/chunk/pitch/sway domain required');
 const renderer=Object.create(J.Renderer.prototype),native=proof(renderer,plan,cut),floor=Math.min(native.minPrimaryPx,Math.max(18,.035*Math.min(plan.W,plan.H))),schedule=[null];
 for(const edgeScale of [1,.9,.8,.7,.6,.5])for(const pitch of [p.pitch])for(const wrap of [2,3,4,6,8])if(!(edgeScale===1&&pitch===p.pitch))schedule.push({edgeScale,pitch,wrap,fontScale:1,strategy:'physical-cube-edge-and-writing-reflow'});
 if(!explicitSize)for(const fontScale of [.95,.9,.85,.8,.75,.7])for(const edgeScale of [.7,.6,.5])for(const wrap of [2,3,4,6,8])schedule.push({edgeScale,pitch:p.pitch,wrap,fontScale,strategy:'local-face-type-size-after-structure'});
 const evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail],memo=new Map([['null',{proof:native}]]),segments=[];
 const regions=plan.lyricAvoidanceIndex.regions;
 for(let i=0;i<regions.length;i++){const r=regions[i],end=Math.min(r.end??regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1]||end<=evaluationRange[0]||end<=r.start)continue;
  const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)},attempts=[];let chosen=null;
  for(const recipe of schedule){const key=JSON.stringify(recipe);let trial=memo.get(key);if(!trial){try{const pr=proof(renderer,plan,{...cut,layoutDRecipe:recipe});if(pr.geometry.pitch!==native.geometry.pitch||pr.sources.find(s=>s.face===4).size!==native.sources.find(s=>s.face===4).size)fail('CUBE_TOP_LEGIBILITY','Native top label projection must be preserved');if(pr.sources.length!==native.sources.length||pr.sources.some((s,i)=>s.face!==native.sources[i].face||s.chunk!==native.sources[i].chunk||s.font!==native.sources[i].font||s.main!==native.sources[i].main||clean(s.text)!==clean(native.sources[i].text)))fail('CUBE_SOURCE_COVERAGE','Native face-local text/font/owner must remain unchanged');if(pr.minPrimaryPx<floor-1e-8)fail('CUBE_READABILITY_FLOOR','Local primary font below native/readable minimum');const minSecondary=Math.min(...native.sources.filter(s=>!s.main).map(s=>s.size)),secondaryFloor=Math.min(minSecondary,Math.max(12,.02*Math.min(plan.W,plan.H)));if(pr.sources.some(s=>!s.main&&s.size<secondaryFloor-1e-8))fail('CUBE_READABILITY_FLOOR','Local secondary font below native/readable minimum');trial={proof:pr};}catch(e){trial={error:e.code||'CUBE_RECORD',message:e.message};}memo.set(key,trial);}
   if(trial.error){attempts.push({recipe,status:'unsupported',reason:trial.error,details:trial.message});continue;}
   const solution=A.solveBasic(trial.proof.envelopes,circle,plan.W,plan.H,cut.seed,{supportHull:true});attempts.push({recipe,status:solution.status,reason:solution.reason||null,minPrimaryPx:trial.proof.minPrimaryPx});if(solution.status==='safe'){chosen={recipe,proof:trial.proof,solution};break;}
  }
  segments.push({start:r.start,end,region:r.id,circle,from:chosen?.solution.offset||[0,0],to:chosen?.solution.offset||[0,0],status:chosen?'safe':'insufficient-space',decision:chosen?'certified':'excluded-during-avoidance',composition:chosen?.recipe||null,envelopes:(chosen?.proof||native).envelopes,sourceUnits:(chosen?.proof||native).sources,geometry:(chosen?.proof||native).geometry,attempts});
 }
 return {kind:'layouts-d-source-native',version:1,revision,evaluationRange,measurementSupported:true,units:[{owner:'cube.solid',segments}],safety:segments.every(s=>s.status==='safe')?'certified-bounded-adapter':'insufficient-space',explicitSizePreserved:explicitSize,sourceProof:{kind:'orthographic-solid-source-algebra',interval:'All real yaw and all cut/render/display/ghost clocks; native cubic pop exact maximum 1+4s^3/(27(s+1)^2), s=1.3; exit pop factor in[.85,1].',trig:'For every real t, |a*cos(t)+b*sin(t)|<=hypot(a,b); side and top local face supports plus complete contact shadow and edge miter bounds.',sourceCoverage:native.sources,ownership:'All five face solids, edges, lyric chunks, alternate copy, side numeral, top label and contact shadow share one primary physical solid; no auxiliary exemption.',structure:'Uniform physical cube edge may change, preserving all three equal edge lengths and native pitch; top label retains its native font size and projected singular values; face-local text retains its native nominal size until local type reduction and remains uncompressed and measured before visibility. Turn/chunk/arrival chronology and yaw/sway/pop functions unchanged.',candidateBudget:{unique:memo.size,limit:schedule.length},limitations:['cut/cut/still + no treatment only','Conservative all-yaw support can exclude feasible orientations','No independent decor or primary masking; insufficient segments replay unchanged source']}};
}
const contains=(p,q)=>{let pos=false,neg=false;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],v=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(v>1e-5)pos=true;if(v< -1e-5)neg=true;}return !(pos&&neg);};
function render({renderer,env,trajectory}){
 const scale=env.scale||1;if(scale<.1||scale>4)fail('CUBE_RENDER_SCALE','D render scale .1..4 required');const unit=trajectory.units[0],active=unit.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),offset=A.offsetAt(unit,env.realTime);
 if(active?.status==='safe'&&active.composition){const cut={...env.cut,layoutDRecipe:active.composition};env=renderer.makeEnv(env.ctx,env.plan,cut,env.sc,{...env,cut});}
 const program=A.record(renderer,env);if(!program.measurementSupported)fail('CUBE_RECORD',JSON.stringify(program.diagnostics));const polygons=program.events.flatMap(e=>e.polygons).map(p=>p.map(v=>[v[0]/scale,v[1]/scale])),covered=!active||polygons.every(p=>active.envelopes.some(q=>p.every(v=>contains(v,q)))),moved=polygons.map(p=>p.map(v=>[v[0]+offset[0],v[1]+offset[1]])),region=J.resolveAvoidanceAt(env.plan,env.realTime),circle=region?J.avoidanceCirclePixels(region,env.plan.W,env.plan.H):null,clear=!moved.length||A.clear(moved,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H))),stageContained=moved.every(p=>p.every(v=>v[0]>=0&&v[0]<=env.plan.W&&v[1]>=0&&v[1]<=env.plan.H));
 if(active?.status==='safe'&&(!covered||!clear||!stageContained))fail('CUBE_SOURCE_SAFETY_VIOLATION','Certified native cube escaped continuous support');
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset,measurementSupported:true,envelopeCovered:covered,stageContained,strictCircleClear:clear,safety:active?.status==='safe'?'safe':'conflict',polygons:moved,events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order}))});A.replay(env,program,offset);
}
A.registerLayoutsDAdapter('cube',{id:'cube_source_v1',finalize,render});
})();
