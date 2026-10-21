/* AVOID-006. Explicit opt-in, native A26 composition translation. */
(() => {
'use strict';
const A=J.placement;
A.layoutsA26=['lowerThird','corners','staircase','zigzag','gridCells','dropCap','justified','frameBox','bubble','subtitleBar','ticker','splitScreen','mirror','sideways','edgeFrame','perspective','hanko','genkou','panels','filmstrip','quote','ruler','searchBar','chat','notification','ticket'];
const envelopeViews=new WeakMap();
function viewsOf(envelopes){let views=envelopeViews.get(envelopes);if(!views){views=envelopes.map(polygon=>({polygon,box:A.bounds([polygon])}));envelopeViews.set(envelopes,views);}return views;}
// Recorded/camera envelopes are convex. Only a whole bounding rectangle
// strictly inside every envelope half-plane can bypass the original vertex
// tests; ambiguous signs, boundaries and numeric ranges always use those tests.
function strictBoxInside(box,view){
 const magnitude=Math.max(Math.abs(box.x0),Math.abs(box.x1),Math.abs(box.y0),Math.abs(box.y1),Math.abs(view.box.x0),Math.abs(view.box.x1),Math.abs(view.box.y0),Math.abs(view.box.y1));
 if(!Number.isFinite(magnitude)||magnitude>1e7)return false;
 const corners=[[box.x0,box.y0],[box.x1,box.y0],[box.x1,box.y1],[box.x0,box.y1]],poly=view.polygon;let sign=0;
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dy=b[1]-a[1],guard=1e-5+256*Number.EPSILON*(1+(Math.abs(dx)+Math.abs(dy))*(1+magnitude));
  for(const p of corners){const cross=dx*(p[1]-a[1])-dy*(p[0]-a[0]),next=cross>guard?1:cross< -guard?-1:0;if(!next||sign&&next!==sign)return false;sign=next;}
 }
 return !!sign;
}
A.layoutsAOptionsFinite=options=>{const finite=v=>typeof v==='number'?Number.isFinite(v):!v||typeof v!=='object'||Object.values(v).every(finite);return finite(options.params);};
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;};
const expand=(p,dx,dy=dx)=>{const b=A.bounds([p]);return rect(b.x0-dx,b.y0-dy,b.x1+dx,b.y1+dy);};
function sweepPolygon(p,s){
 if(!s)return p;
 let points=p;
 if(s.pivot){const [cx,cy]=s.pivot,angle=(s.angle||0)*J.DEG,scales=s.scale||[1,1],out=[];
  // Exact coordinate extrema of each corner over the full angular interval.
  for(const [x,y]of p)for(const scale of scales){const dx=(x-cx)*scale,dy=(y-cy)*scale,angles=[-angle,angle,0];for(const root of [Math.atan2(-dy,dx),Math.atan2(dx,dy)])for(let k=-2;k<=2;k++){const a=root+k*Math.PI;if(a>=-angle&&a<=angle)angles.push(a);}for(const a of angles)out.push([cx+dx*Math.cos(a)-dy*Math.sin(a),cy+dx*Math.sin(a)+dy*Math.cos(a)]);}
  points=A.convexHull(out);
 }
 if(s.vector)return A.convexHull(points.flatMap(p=>[-1,1].map(k=>[p[0]+k*s.vector[0],p[1]+k*s.vector[1]])));
 const b=A.bounds([points]);return rect(b.x0-(s.dx||0),b.y0-(s.dy||0)-(s.negativeY||0),b.x1+(s.dx||0),b.y1+(s.dy||0)+(s.positiveY||0));
}
A.layoutsASweep=sweepPolygon;
// Intersect conservative native ink with the source's own convex clip. No new
// product clipping is introduced. Clip AA is bounded by one device pixel.
function clippedPolygons(event){
 let polygons=event.polygons;
 for(const clip of event.clips||[]){if(clip.worldFixed)continue;const pts=(clip.points||rect(clip.args[0],clip.args[1],clip.args[0]+clip.args[2],clip.args[1]+clip.args[3])).map(p=>A.point(clip.matrix,p));
  const expanded=A.convexHull(pts.flatMap(p=>[[p[0]-1,p[1]-1],[p[0]+1,p[1]-1],[p[0]+1,p[1]+1],[p[0]-1,p[1]+1]]));
  const area=expanded.reduce((n,a,i)=>{const b=expanded[(i+1)%expanded.length];return n+a[0]*b[1]-b[0]*a[1];},0),sign=Math.sign(area);
  polygons=polygons.map(p=>{let result=p;for(let i=0;i<expanded.length&&result.length;i++){const a=expanded[i],b=expanded[(i+1)%expanded.length],side=p=>sign*((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])),out=[];for(let j=0;j<result.length;j++){const u=result[j],v=result[(j+1)%result.length],su=side(u),sv=side(v);if(su>=0)out.push(u);if((su>=0)!==(sv>=0)){const t=su/(su-sv);out.push([u[0]+(v[0]-u[0])*t,u[1]+(v[1]-u[1])*t]);}}result=out;}return result;}).filter(p=>p.length>=3);
 }return polygons;
}
A.layoutsAClip=clippedPolygons;
function numericSweep(event,cut){
 const it=event.args[0];if(event.kind!=='item'||it.placementMain||it.placementNativeKind!=='dynamic-number'||!/[0-9]/.test(it.text)||!['ruler','ticker','subtitleBar'].includes(cut.layout))return null;
 const digits='0123456789',fixed=[...it.text].filter(c=>!/[0-9]/.test(c)),count=Math.max([...it.text].filter(c=>/[0-9]/.test(c)).length,J.fmtTime(Math.max(0,cut.layoutAEvaluationRange[1]),24).replace(/\D/g,'').length);
 const advance=Math.max(...[...digits].map(c=>J.metrics.adv(it.font,c))),width=(count*advance+fixed.reduce((n,c)=>n+J.metrics.adv(it.font,c),0)+Math.abs(it.track||0)*(count+fixed.length))*it.size;
 const ink=[...new Set(digits+fixed.join(''))].flatMap(ch=>A.itemGeometry({text:ch,font:it.font,size:it.size,x:0,y:0},[1,0,0,1,0,0],{pass:'main',scale:1}).polygons),b=A.bounds(ink),x0=it.align==='left'?0:it.align==='right'?-width:-width/2,x1=it.align==='left'?width:it.align==='right'?0:width/2,a=(it.rot||0)*J.DEG,c=Math.cos(a),sn=Math.sin(a),sk=Math.tan((it.skew||0)*J.DEG),m=A.multiply(event.matrix,A.multiply([1,0,0,1,it.x,it.y],A.multiply([c,sn,-sn,c,0,0],[it.sx||1,0,sk*(it.sy||1),it.sy||1,0,0])));
 return rect(x0+b.x0,b.y0,x1+b.x1,b.y1).map(p=>A.point(m,p));
}
function nativeEnvelopes(program,plan,cut,holdOnly=false){
 const u=Math.min(plan.W,plan.H),id=cut.layout,p=cut.params;
 const primary=program.events.filter(e=>e.role==='primary'&&e.polygons.length),main=primary.filter(e=>e.args[0]?.placementMain),mainPolys=main.flatMap(e=>e.polygons),mainBounds=A.bounds(mainPolys);
 const polygons=[];
 for(const e of primary){const numeric=numericSweep(e,cut);if(numeric)polygons.push(A.cameraEnvelope([sweepPolygon(numeric,e.nativeSweep)],plan,cut,20));}
 for(const e of primary)for(const polygon of clippedPolygons(e)){
  let sweep=e.nativeSweep;
  if(holdOnly&&['quote','ticket'].includes(id))sweep=null;
  if(holdOnly&&id==='filmstrip'&&sweep?.vector){const norm=Math.hypot(...sweep.vector),axis=sweep.vector.map(v=>norm?v/norm:0),range=cut.layoutAHoldRange,rate=u*.03,amount=Math.max(...range.map(t=>Math.abs(t-cut.start-cut.dur/2)))*rate;sweep={vector:axis.map(v=>v*amount)};}
  let shape=sweepPolygon(polygon,sweep);
  // Source-specific native motion not expressed as Canvas transforms.
  if(id==='lowerThird')shape=expand(shape,Math.max(14,Math.min(u*.024,34))*2,0);
  if(id==='gridCells')shape=expand(shape,u*.018);
  if(id==='ruler'&&e.kind==='line')shape=expand(shape,Math.max(14,Math.min(u*.024,34))*.8);
  if(id==='chat')shape=expand(shape,0,u*.012);
  if(id==='ticker')shape=expand(shape,u*.01);
  if(id==='mirror')shape=expand(shape,u*.008,0);
  if(id==='sideways'&&!holdOnly)shape=expand(shape,0,u*.03);
  if(id==='quote'&&!holdOnly&&e.kind==='item'&&!e.args[0]?.placementMain)shape=expand(shape,u*.35,u*.21);
  if(id==='perspective'&&e.kind==='item'&&e.args[0]?.placementNativeKind==='perspective-copy'){
   // q=r^(j+phase) is in [0,1]; the complete receding ink lies
   // between the full front copy and the vanishing point. Shear <=14deg.
   const V=[plan.W/2+(p.mode==='side'?p.vx*plan.W*.36:0),plan.H*.1],anchorY=main[0].args[0].y,pad=Math.max(Math.abs(mainBounds.y0-anchorY),Math.abs(mainBounds.y1-anchorY))*Math.tan(14*J.DEG)+4;
   shape=rect(Math.min(mainBounds.x0,V[0])-pad,Math.min(mainBounds.y0,V[1])-pad,Math.max(mainBounds.x1,V[0])+pad,Math.max(mainBounds.y1,V[1])+pad);
  }
  polygons.push(A.cameraEnvelope([shape],plan,cut,e.kind==='item'?20:10));
 }
 if(!polygons.length)fail('UNSUPPORTED_MEASUREMENT','A26 requires measured native primary ink');
 return polygons;
}
A.layoutsAHoldEnvelopes=(program,plan,cut)=>nativeEnvelopes(program,plan,cut,true);
A.finalizeLayoutsA=(plan,cut,original,diagnostics,{revision,stepDur,reachTail,adaptive=false,explicitSize=false,selectionOrigin='unknown'})=>{
 const evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail];
 try{
  const visit=v=>{if(Array.isArray(v)&&v.length>64||typeof v==='string'&&[...v].length>4096)fail('GEOMETRY_LIMIT','Native parameter array/string resource ceiling exceeded');if(typeof v==='number'&&!Number.isFinite(v))fail('UNSUPPORTED_PARAMETER_RANGE','Nonfinite native layout parameter');if(v&&typeof v==='object')Object.values(v).forEach(visit);};visit(cut.params);visit([cut.text,cut.lineText||'',cut.note||'']);
  const p=cut.params,between=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
  if(cut.layout==='justified'&&!between(p.dens,.062,.078)||cut.layout==='searchBar'&&(!Number.isInteger(p.sugg)||!between(p.sugg,1,4))||cut.layout==='subtitleBar'&&(!between(p.bar,.1,.13)||![-1,1].includes(p.drift))||cut.layout==='filmstrip'&&![-1,1].includes(p.dir)||cut.layout==='perspective'&&(!between(p.speed,.25,.45)||!['floor','side'].includes(p.mode))||cut.layout==='gridCells'&&!between(p.gap,0,.16)||cut.layout==='lowerThird'&&!between(p.lift,0,.04)||cut.layout==='zigzag'&&(!between(p.amp,.24,.34)||![-1,1].includes(p.phase))||cut.layout==='genkou'&&!between(p.pad,2,4)||cut.layout==='panels'&&(!between(p.slant,5,11)||!Array.isArray(p.widths)||p.widths.some(v=>!between(v,.8,1.25))))fail('UNSUPPORTED_PARAMETER_RANGE','Outside source-certified native parameter domain');
  const nativeNumbers={corners:{ratio:[.76,1]},staircase:{shrink:[.82,.9]},bubble:{off:[-.05,.05]},ticker:{speed:[.8,1.3]},splitScreen:{tilt:[12,22]},mirror:{strength:[.34,.5]},ticket:{serial:[1,999999]}};
  for(const [key,range]of Object.entries(nativeNumbers[cut.layout]||{}))if(!between(p[key],...range))fail('UNSUPPORTED_PARAMETER_RANGE','Outside native '+cut.layout+'.'+key+' range');
  if(cut.layout==='bubble'&&![-1,1].includes(p.tail)||cut.layout==='splitScreen'&&![-1,1].includes(p.side)||cut.layout==='edgeFrame'&&!between(Math.abs(p.speed),.6,1.2)||cut.layout==='panels'&&p.widths.length!==3||cut.layout==='ticket'&&!Number.isInteger(p.serial))fail('UNSUPPORTED_PARAMETER_RANGE','Outside native A26 discrete parameter domain');
  if(cut.treat!=='none')fail('UNSUPPORTED_ADAPTER','A26 treatment requires an owned native treatment envelope');
  if(cut.layout==='panels'&&cut.params.fx==='tone')fail('UNSUPPORTED_ADAPTER','Panel tone pattern requires a bounded paint adapter');
  if(cut.layout==='bubble'&&Math.abs(cut.params.tilt)>3||cut.layout==='hanko'&&Math.abs(cut.params.rot)>7||cut.layout==='filmstrip'&&Math.abs(cut.params.tilt)>3||cut.layout==='ticket'&&Math.abs(cut.params.tilt)>5||cut.layout==='perspective'&&(!(cut.params.copies>=1&&cut.params.copies<=16)||Math.abs(cut.params.vx)>1)||cut.layout==='mirror'&&(!(cut.params.squash>0&&cut.params.squash<=1)))fail('UNSUPPORTED_PARAMETER_RANGE','Native A26 transform range exceeded');
  cut.placementUnits=true;cut.placementLayoutsA=true;cut.layoutAEvaluationRange=evaluationRange;if(adaptive&&A.layoutsAAdaptive8.includes(cut.layout))cut.placementAdaptiveTrial=true;
  const renderer=Object.create(J.Renderer.prototype),ctx=A.measurementContext();ctx.reset();
  const time=cut.start+cut.dur/2,env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:time,realTime:time,lt:cut.dur/2,ltb:cut.dur/2,pIn:1,pOut:0,step:0,scale:1,allowFilter:false,placementEnvelope:true,layoutAEvaluationRange:evaluationRange});
  const program=A.preparedProgram(renderer,env,evaluationRange);if(!program.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(program.diagnostics));
  const envelopes=nativeEnvelopes(program,plan,cut),owner=cut.layout+'.composition',segments=[];
  let fitBounds=A.bounds(envelopes),crop=null;
  if(['filmstrip','notification','ticket','quote'].includes(cut.layout)){
   // Natural native entry/exit is retained. Hold geometry remains visible;
   // only the source's animated crop axes may leave the stage.
   const raw=program.events.filter(e=>e.role==='primary').flatMap(e=>clippedPolygons(e)),hold=A.bounds(raw.map(p=>A.cameraEnvelope([p],plan,cut,20))),holdText=program.events.filter(e=>e.role==='primary'&&e.kind==='item'&&!(cut.layout==='filmstrip'&&String(e.args[0].text).startsWith('▸'))),holdInk=A.bounds(holdText.flatMap(e=>clippedPolygons(e)).map(p=>A.cameraEnvelope([p],plan,cut,20)));
   // Film edge-code repetitions intentionally extend beyond the native stage;
   // all actual lyric slots and every other meaningful text remain visible.
   // A measured hold envelope larger than the stage is an honest fixed-size
   // family failure below (insufficient-space), not an unsupported measurement.
   crop=cut.layout==='filmstrip'?(cut.params.tilt!==0?'xy':plan.H>plan.W*1.08?'y':'x'):cut.layout==='notification'?'y':cut.layout==='ticket'?'y':'xy';
   fitBounds={...fitBounds};if(crop.includes('x')){fitBounds.x0=cut.layout==='filmstrip'?Math.min(holdInk.x0,Math.max(0,hold.x0)):hold.x0;fitBounds.x1=cut.layout==='filmstrip'?Math.max(holdInk.x1,Math.min(plan.W,hold.x1)):hold.x1;}if(crop.includes('y')){fitBounds.y0=cut.layout==='filmstrip'?Math.min(holdInk.y0,Math.max(0,hold.y0)):hold.y0;fitBounds.y1=cut.layout==='filmstrip'?Math.max(holdInk.y1,Math.min(plan.H,hold.y1)):hold.y1;}
  }
  const regions=plan.lyricAvoidanceIndex.regions;
  for(let i=0;i<regions.length;i++){
   const r=regions[i],end=Math.min(r.end??regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1])break;if(end<=evaluationRange[0]||end<=r.start)continue;
   const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)};
   const solution=A.solveBasic(envelopes,circle,plan.W,plan.H,J.h(cut.seed,581),{fitBounds,...(adaptive&&A.layoutsAAdaptive8.includes(cut.layout)?{supportHull:true}:{}),...(cut.layout==='subtitleBar'&&cut.params.place==='bar'?{accept:d=>Math.abs(d[1])<1e-9}:{})});
   segments.push({start:r.start,end,from:solution.offset,to:solution.offset,status:solution.status,direction:solution.direction||null,reason:solution.reason||null,region:r.id,proof:{kind:'joint-native-translation',rule:'One shared stage translation preserves all native primary/frame/note relative positions; source analytic sweeps plus camera/AA envelopes certify the full interval',nativeCropAxis:crop,fitBounds}});
  }
  cut.placementTrajectory={version:1,kind:'layouts-a-joint-translation',revision,evaluationRange,units:[{owner,envelopes,segments}],measurementSupported:true,safety:segments.every(s=>s.status==='safe')?'certified-bounded-adapter':'insufficient-space'};
  if(adaptive){cut.placementSelectionOrigin=selectionOrigin;A.adaptLayoutsA(plan,cut,program,renderer,explicitSize);}
  diagnostics.push({cut:cut.index,code:'STAGED_ADAPTER',measurement:'supported',safety:cut.placementTrajectory.safety,units:1});
 }catch(e){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:e.code||'DRAW_PROGRAM_ERROR',details:e.message,safety:'unsupported'});}
};
A.renderLayoutsA=(renderer,env)=>{
 A.validateFinal(env.plan);const scale=env.scale||1;if(scale<.1||scale>4)fail('UNSUPPORTED_RENDER_SCALE','Staged certified scale range is 0.1 through 4');
 const tr=env.cut.placementTrajectory,unit=tr.units[0],active=unit.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end);
 if(active?.composition){const cut={...env.cut,layoutARecipe:active.composition};env=renderer.makeEnv(env.ctx,env.plan,cut,env.sc,{...env,cut,fx:cut.effectFx||env.plan.fx});}
 const program=A.record(renderer,env);if(!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM',JSON.stringify(program.diagnostics));
 const offset=A.offsetAt(unit,env.realTime),scope=active?.safetyScope,groups=program.events.filter(e=>e.role==='primary').map(e=>({event:e,phase:scope?A.layoutsAMotionPhase(env.cut,e,env.t):'strict',polygons:clippedPolygons(e).map(p=>p.map(v=>[v[0]/scale+offset[0],v[1]/scale+offset[1]]))})),polygons=groups.flatMap(g=>g.polygons),strictPolygons=scope?groups.filter(g=>!['entry','exit'].includes(g.phase)).flatMap(g=>g.polygons):polygons,relaxedPolygons=scope?groups.filter(g=>['entry','exit'].includes(g.phase)).flatMap(g=>g.polygons):[];
 const inside=(p,poly)=>{let positive=false,negative=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],v=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(v>1e-5)positive=true;if(v< -1e-5)negative=true;}return !(positive&&negative);};
 const covered=groups.every(g=>{const bounds=scope&&['entry','exit'].includes(g.phase)?(active.relaxedEnvelopes||unit.envelopes):active?.envelopes||unit.envelopes,views=viewsOf(bounds);return g.polygons.every(poly=>{if(!poly.length)return views.length>0;const local=poly.map(p=>[p[0]-offset[0],p[1]-offset[1]]),p=local[0],box=local.length>4&&local[0]&&local.every(p=>p.every(Number.isFinite))?A.bounds([local]):null,contains=v=>box&&strictBoxInside(box,v)||local.every(p=>inside(p,v.polygon)),preferred=b=>p[0]>=b.x0&&p[0]<=b.x1&&p[1]>=b.y0&&p[1]<=b.y1;for(const v of views)if(preferred(v.box)&&contains(v))return true;for(const v of views)if(!preferred(v.box)&&contains(v))return true;return false;});});
 if(!covered)fail('ENVELOPE_VIOLATION','Actual native A26 ink escaped its declared phase envelope');
 const region=J.resolveAvoidanceAt(env.plan,env.realTime),circle=region?J.avoidanceCirclePixels(region,env.plan.W,env.plan.H):null,margin=Math.max(2,.005*Math.min(env.plan.W,env.plan.H)),clear=!strictPolygons.length||A.clear(strictPolygons,circle,margin),rawClear=scope?(!polygons.length||A.clear(polygons,circle,margin)):clear,certified=!active||['safe','safe-hold'].includes(active.status);
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset:{[unit.owner]:offset},measurementSupported:true,envelopeCovered:covered,safety:certified&&clear?(scope?'hold-safe-entry-exit-relaxed':'safe'):'conflict',safetyScope:scope||'full-interval',holdWindow:active?.holdWindow||null,strictCircleClear:clear,rawCircleClear:rawClear,relaxedEvents:groups.filter(g=>['entry','exit'].includes(g.phase)).map(g=>({kind:g.event.kind,motion:g.event.nativeMotion,phase:g.phase,polygons:g.polygons})),events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,polygons:e.polygons})),polygons,strictPolygons,relaxedPolygons});
 A.replay(env,program,offset);
};
})();
