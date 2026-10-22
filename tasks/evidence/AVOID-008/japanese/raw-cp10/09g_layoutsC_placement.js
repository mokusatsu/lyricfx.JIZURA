/* AVOID-008 C source-native adapters. Explicit opt-in; incomplete recipes are
   reported individually and never counted as a certified C34 adapter. */
(() => {
'use strict';
const A=J.placement,fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;};
A.layoutsC34=['magazine','headlineDeck','contents','footnote','proofread','numbered','poster','swissGrid','dictionary','ema','ransom','newspaper','vinyl','cassette','bookSpine','polaroid','stampSheet','postcard','letterPaper','calendar','chochin','routeMap','stationSign','noren','tanzaku','omikuji','kakejiku','shoji','clapper','warningLabel','priceTag','nameTag','stickyNotes','karuta'];
const externalAdapters=new Map();
A.registerLayoutsCAdapter=(layout,adapter)=>{
 if(!A.layoutsC34.includes(layout)||['stickyNotes','nameTag','clapper'].includes(layout)||externalAdapters.has(layout)||!adapter||typeof adapter.id!=='string'||!/^[A-Za-z0-9_-]{3,64}$/.test(adapter.id)||typeof adapter.finalize!=='function'||typeof adapter.render!=='function')fail('INVALID_C_ADAPTER_REGISTRATION','Unique C source ID, stable adapter ID, finalize and render functions required');
 externalAdapters.set(layout,Object.freeze({id:adapter.id,finalize:adapter.finalize,render:adapter.render}));
};
A.layoutsCRegisteredAdapters=()=>Array.from(externalAdapters,([layout,a])=>({layout,id:a.id}));
const freezeReadOnly=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freezeReadOnly);Object.freeze(value);}return value;};
function expectedRegions(plan,range){return plan.lyricAvoidanceIndex.regions.map((r,i)=>({...r,end:Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration)})).filter(r=>r.start<range[1]&&r.end>range[0]&&r.end>r.start);}
function validateExternalTrajectory(tr,plan,cut,revision,requiredRange){
 const bad=message=>fail('INVALID_C_ADAPTER_RESULT',message),finitePair=a=>Array.isArray(a)&&a.length===2&&a.every(Number.isFinite);
 if(!tr||tr.kind!=='layouts-c-source-native'||tr.version!==1||tr.revision!==revision||tr.measurementSupported!==true||!Array.isArray(tr.units)||!tr.units.length||!tr.sourceProof||!['certified-bounded-adapter','certified-hold-adapter','insufficient-space'].includes(tr.safety))bad('Complete typed C source-native trajectory required');
 if(!finitePair(tr.evaluationRange)||tr.evaluationRange[0]>requiredRange[0]||tr.evaluationRange[1]<requiredRange[1])bad('C evaluation range must include source cut/render/display and composed ghost/transition reach');
 const regions=expectedRegions(plan,tr.evaluationRange),owners=new Set(),statuses=[];if(!regions.length)bad('Cannot certify an empty C region coverage');
 for(const unit of tr.units){
  if(typeof unit.owner!=='string'||!unit.owner||owners.has(unit.owner)||!Array.isArray(unit.segments)||unit.segments.length!==regions.length)bad('Unique C unit owner and complete nonempty region segments required');owners.add(unit.owner);
  for(let i=0;i<regions.length;i++){const s=unit.segments[i],r=regions[i],circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)};
   if(!s||!Number.isFinite(s.start)||!Number.isFinite(s.end)||s.start>=s.end||s.start!==r.start||s.end!==r.end||s.region!==r.id||!finitePair(s.from)||!finitePair(s.to)||s.from.some((v,j)=>v!==s.to[j])||!['safe','safe-hold','insufficient-space'].includes(s.status))bad('C segment must exactly cover its source region with finite fixed offsets and typed status');
   if(!s.circle||Object.keys(circle).some(k=>!Number.isFinite(s.circle[k])||Math.abs(s.circle[k]-circle[k])>1e-8))bad('C segment circle differs from the resolved stage-pixel region');
   const decision=s.status==='safe'?'certified':s.status==='safe-hold'?'certified-hold-adapter':'excluded-during-avoidance';if(s.decision!==decision)bad('C segment decision/status mismatch');
   if(s.status==='safe-hold'){const hold=s.holdWindow||tr.holdWindow;if(!finitePair(hold)||hold[1]-hold[0]<.04||hold[0]<cut.start||hold[1]>cut.end)bad('C safe-hold requires at least .04s inside the actual source cut interval');}
   statuses.push(s.status);
  }
 }
 if(tr.safety==='certified-bounded-adapter'&&statuses.some(s=>s!=='safe')||tr.safety==='certified-hold-adapter'&&statuses.some(s=>!['safe','safe-hold'].includes(s))||tr.safety==='insufficient-space'&&!statuses.includes('insufficient-space'))bad('C root safety contradicts its actual segment outcomes');
}
const normalized=t=>String(t||'').replace(/\s/g,'');
function cameraEnvelope(polygons,plan,cut,reserve){return A.cameraEnvelope(polygons,{...plan,fx:cut.effectFx||plan.fx,style:cut.effectStyle||plan.style},cut,reserve);}
function record(renderer,plan,cut,time){const ctx=A.measurementContext();ctx.reset();const env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t:time,realTime:time,lt:time-cut.start,ltb:time-cut.start,step:Math.floor(time*(plan.fps||24)),scale:1,allowFilter:false});const p=A.record(renderer,env);if(!p.measurementSupported)fail('UNSUPPORTED_MEASUREMENT',JSON.stringify(p.diagnostics));return p;}
function mapping(program,cut){
 const texts=program.events.filter(e=>e.role==='primary'&&e.kind==='item'&&e.args[0].placementMain).map(e=>e.args[0]),copy=texts.map(i=>normalized(i.text)).join('');
 if(copy!==normalized(cut.text))fail('SOURCE_COVERAGE','C ordered native primary source must contain every occurrence exactly once');
 return {complete:true,source:normalized(cut.text),main:texts.map((i,index)=>({index,text:i.text,font:i.font,size:i.size,mi:i.mi??0})),metadata:program.events.filter(e=>e.kind==='nativeText'||e.kind==='item'&&!e.args[0].placementMain).map(e=>({kind:e.kind,text:e.kind==='nativeText'?e.args[0]:e.args[0].text,font:e.kind==='nativeText'?e.args[3].font:e.args[0].font,size:e.kind==='nativeText'?parseFloat(e.args[3].font):e.args[0].size})),shapes:program.events.filter(e=>!['item','nativeText'].includes(e.kind)).map(e=>({kind:e.kind,order:e.order,owner:e.owner})),rule:'Ordered native source occurrences, meaningful metadata and every owned shape retained; no substitute glyphs/plates'};
}
// Continuous interval arithmetic, not frame sampling. Every source exit point
// is R(angle+turn*z)*(dx,(1-.3*z)*dy) + pivot + z*drop, z in [0,1].
// Native entry adds only the known uniform squash scale about the same pivot.
function sourceStageEnvelopes(program,plan,cut){
 if(cut.layout!=='stickyNotes')return null;
 const trig=(a,b,cos)=>{const f=cos?Math.cos:Math.sin,v=[f(a),f(b)],base=cos?0:Math.PI/2;for(let k=Math.ceil((a-base)/Math.PI);base+k*Math.PI<b;k++)v.push(f(base+k*Math.PI));return [Math.min(...v),Math.max(...v)];},mul=(a,b)=>{const v=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return [Math.min(...v),Math.max(...v)];},out=[];
 for(const e of program.events.filter(e=>e.role==='primary')){
  const s=e.nativeCBody;if(!s||s.kind!=='sticky-note')fail('SOURCE_STAGE_SWEEP_MISSING','Each sticky owned event requires its native note pivot/peel model');const theta=s.angle*J.DEG,c=Math.cos(theta),sn=Math.sin(theta),[px,py]=s.pivot,points=[];
  for(const [x,y]of e.polygons.flat()){
   const dx=c*(x-px)+sn*(y-py),dy=-sn*(x-px)+c*(y-py);
   for(const scale of [1,s.maxEntryScale])points.push([px+(c*dx-sn*dy)*scale,py+(sn*dx+c*dy)*scale]);
   for(let j=0;j<32;j++){const z0=j/32,z1=(j+1)/32,angles=[theta+s.turn*J.DEG*z0,theta+s.turn*J.DEG*z1].sort((a,b)=>a-b),cs=trig(...angles,true),ss=trig(...angles,false),ys=mul([dy,dy],[1-(1-s.minYScale)*z1,1-(1-s.minYScale)*z0]),cx=mul(cs,[dx,dx]),sy=mul(ss,ys),sx=mul(ss,[dx,dx]),cy=mul(cs,ys),xx=[px+cx[0]-sy[1]+Math.min(s.dx*z0,s.dx*z1),px+cx[1]-sy[0]+Math.max(s.dx*z0,s.dx*z1)],yy=[py+sx[0]+cy[0]+Math.min(s.dy*z0,s.dy*z1),py+sx[1]+cy[1]+Math.max(s.dy*z0,s.dy*z1)];points.push([xx[0],yy[0]],[xx[1],yy[1]]);}
  }
  out.push(cameraEnvelope([A.convexHull(points)],plan,cut,e.kind==='item'?20:10));
 }return out;
}
function ownedQuality(program){
 let checked=0;for(const e of program.events.filter(e=>e.kind==='item'&&e.args[0].placementMain)){const z=e.args[0].placementCOwnedZone;if(!z)fail('OWNED_ZONE_REQUIRED','C primary requires an explicit source-owned writing field');const local=[[z.x0,z.y0],[z.x1,z.y0],[z.x1,z.y1],[z.x0,z.y1]],zone=local.map(p=>A.point(e.matrix,p));if(!(z.x0<z.x1&&z.y0<z.y1)||!e.inkPolygons?.length||e.inkPolygons.some(poly=>poly.some(p=>!contains(p,zone))))fail('OWNED_TEXT_OUTSIDE_FIELD','C complete pre-clip primary ink escaped its source paper writing field');checked++;}return {completePreClipWritingFields:checked};
}
function sourceCandidate(renderer,plan,cut,native,recipe,time,explicitSize){
 const trial={...cut,layoutCRecipe:recipe},program=record(renderer,plan,trial,time),source=mapping(program,trial),expected=mapping(native,cut),semanticMetadata=m=>m.map(({size,...rest})=>rest);
 if(source.main.length!==expected.main.length||JSON.stringify(semanticMetadata(source.metadata))!==JSON.stringify(semanticMetadata(expected.metadata))||JSON.stringify(source.shapes)!==JSON.stringify(expected.shapes))fail('NATIVE_SEMANTIC_MAPPING','C recipe must preserve every ordered native owned shape/metadata/copy');
 const ownership=ownedQuality(program);
 const short=Math.min(plan.W,plan.H),floor=Math.max(18,.035*short),secondaryFloor=Math.max(12,.02*short),scale=cut.contentScale??1,ratios=[];
 for(let i=0;i<source.main.length;i++){const n=expected.main[i],a=source.main[i],ratio=a.size/n.size,actualSize=a.size*scale;ratios.push(ratio);if(normalized(a.text)!==normalized(n.text)||a.font!==n.font||a.mi!==n.mi||ratio<.7-1e-8||actualSize<floor||explicitSize&&Math.abs(ratio-1)>1e-8)fail('NATIVE_SIZE_MAPPING','C source text/font/clock or actual font floor/explicit size changed');}
 for(let i=0;i<source.metadata.length;i++){const n=expected.metadata[i],a=source.metadata[i];if(a.size<n.size*.7-1e-8||a.size*scale<Math.min(n.size*scale,secondaryFloor)-1e-8)fail('METADATA_SIZE_FLOOR','Every real native metadata copy must preserve its font ratio and readable floor');}
 return {source,stageEnvelopes:sourceStageEnvelopes(program,plan,trial),quality:{...ownership,nativeFontSizePreserved:source.main.every((a,i)=>Math.abs(a.size-expected.main[i].size)<1e-8),minNativeFontRatio:Math.min(...ratios),minPrimaryPx:Math.min(...source.main.map(i=>i.size*scale)),floor,minSecondaryPx:source.metadata.length?Math.min(...source.metadata.map(i=>i.size*scale)):null,secondaryFloor},envelopes:program.events.filter(e=>e.role==='primary').map(e=>cameraEnvelope(e.polygons,plan,trial,e.kind==='item'||e.kind==='nativeText'?20:10))};
}
function sourceStrategy(cut,explicitSize){
 const p=cut.params;
 if(cut.layout==='stickyNotes'){
  if(!Array.isArray(p.chunks)||p.chunks.length<1||p.chunks.length>4||p.chunks.some(t=>typeof t!=='string')||!['cascade','scatter'].includes(p.layout)||!['glue','tape'].includes(p.pin)||!Array.isArray(p.rots)||p.rots.length!==4||p.rots.some(r=>Math.abs(r)>7)||!Array.isArray(p.offs)||p.offs.length!==4||p.offs.some(o=>Math.abs(o)>1)||!Array.isArray(p.cols)||p.cols.length!==4||p.cols.some(c=>!Number.isInteger(c)||c<0||c>3))fail('UNSUPPORTED_PARAMETER_RANGE','Sticky note native slot/angle/colour domain required');
  if(normalized(p.chunks.join(''))!==normalized(cut.text))fail('SOURCE_COVERAGE','Sticky native chunks differ from actual lyric');
  return {entry:.03+(p.chunks.length-1)*.13+.22,native:'native-note-cluster-translation',candidates:[...[1.2,1.5,2].map(pitch=>({noteScale:1,pitch,strategy:'native-note-slot-pitch'})),...(explicitSize?[]:[.95,.9,.85,.8,.75,.7].flatMap(noteScale=>[1,1.2,1.5,2].map(pitch=>({noteScale,pitch,strategy:'source-note-size-and-slot-pitch'}))))],proof:{kind:'sticky-notes-static-hold-source-proof',entry:'Each native note entry uniformly squashes paper/fold/shadow/pin/glyphs; last start .03+(k-1)*.13, finish +.22',exit:'Source peel moves every owned note unit from cut.end-outDur',hold:'sq=1, peel=0, source slots/angles/font sizes fixed'}};
 }
 if(cut.layout==='nameTag'){
  if(!['hello','school'].includes(p.variant)||!Number.isFinite(p.tilt)||Math.abs(p.tilt)>6||!Number.isInteger(p.grade)||p.grade<1||p.grade>6||!Number.isInteger(p.cls)||p.cls<1||p.cls>4)fail('UNSUPPORTED_PARAMETER_RANGE','Name badge native variant/tilt/grade/class required');
  return {entry:.5,native:'native-badge-translation',candidates:[...[.85,.7,.6,.5].map(badgeMeasure=>({badgeMeasure,objectScale:1,strategy:'badge-field-measure'})),...(explicitSize?[]:[.95,.9,.85,.8,.75,.7].flatMap(objectScale=>[1,.85,.7,.6,.5].map(badgeMeasure=>({badgeMeasure,objectScale,strategy:'source-badge-size-and-field-measure'}))))],proof:{kind:'name-badge-static-hold-source-proof',entry:'The entire badge/clip/header/inscription shares source outBack rotation/drop until .5',exit:'Every owned badge unit shares source rotation/translation from cut.end-outDur',hold:'q=1, eo=0; source badge/clip/header/body field geometry fixed; metadata strings and native main clock retained'}};
 }
 fail('C_RECIPE_PENDING','C '+cut.layout+' owned-unit interval/recipe verification is pending');
}
const contains=(p,poly)=>{let pos=false,neg=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],cross=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(cross>1e-5)pos=true;if(cross< -1e-5)neg=true;}return !(pos&&neg);};
A.finalizeLayoutsC=(plan,cut,original,diagnostics,{revision,stepDur,reachTail,explicitSize=false})=>{
 try{
  const requiredRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail];
  if(!expectedRegions(plan,requiredRange).length){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:'PRESERVED_NO_ACTIVE_REGION',safety:'not-evaluated'});return;}
  const external=externalAdapters.get(cut.layout);
  if(external){
   const trajectory=external.finalize(Object.freeze({plan,cut,original:freezeReadOnly(JSON.parse(JSON.stringify(original))),revision,stepDur,reachTail,explicitSize}));
   validateExternalTrajectory(trajectory,plan,cut,revision,requiredRange);
   cut.placementTrajectory={...trajectory,sourceAdapter:external.id};diagnostics.push({cut:cut.index,code:'STAGED_C_ADAPTER',adapter:external.id,safety:trajectory.safety});return;
  }
  if(cut.treat!=='none')fail('UNSUPPORTED_ADAPTER','C treatment requires a dedicated owned geometry proof');
  const finite=v=>typeof v==='number'?Number.isFinite(v):!v||typeof v!=='object'||Object.values(v).every(finite);if(!finite(cut.params))fail('UNSUPPORTED_PARAMETER_RANGE','Finite C source parameters required');
  const strategy=sourceStrategy(cut,explicitSize),holdWindow=[cut.start+strategy.entry,cut.end-cut.outDur],candidateCache=new Map();let reconstructed=0,candidateHits=0;
  if(holdWindow[1]-holdWindow[0]<.04)fail('INSUFFICIENT_HOLD_WINDOW','C source needs at least .04s after its final native geometry entry and before native exit');
  cut.placementUnits=true;cut.placementLayoutsC=true;
  const renderer=Object.create(J.Renderer.prototype),program=record(renderer,plan,cut,holdWindow[0]+.0001),sourceMapping=mapping(program,cut),nativeOwnership=ownedQuality(program),stageEnvelopes=sourceStageEnvelopes(program,plan,cut),envelopes=program.events.filter(e=>e.role==='primary').map(e=>cameraEnvelope(e.polygons,plan,cut,e.kind==='item'||e.kind==='nativeText'?20:10)),evaluationRange=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail],segments=[];
  for(let i=0;i<plan.lyricAvoidanceIndex.regions.length;i++){const r=plan.lyricAvoidanceIndex.regions[i],end=Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration);if(r.start>=evaluationRange[1])break;if(end<=evaluationRange[0]||end<=r.start)continue;const circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)};let selectedEnvelopes=envelopes,selectedStageEnvelopes=stageEnvelopes,composition=null,quality=null,solution=A.solveBasic(envelopes,circle,plan.W,plan.H,cut.seed,stageEnvelopes?{fitBounds:A.bounds(stageEnvelopes)}:{});const attempts=[{strategy:strategy.native,status:solution.status,reason:solution.reason||null}];
   if(solution.status!=='safe'){
    const candidates=strategy.candidates;
    for(const recipe of candidates){try{const key=JSON.stringify(recipe);let trial=candidateCache.get(key);if(trial){candidateHits++;if(trial.error)fail(trial.error.code,trial.error.message);}else{if(reconstructed>=128)fail('CUT_CANDIDATE_BUDGET','C per-cut reconstruction budget exhausted');reconstructed++;try{trial=sourceCandidate(renderer,plan,cut,program,recipe,holdWindow[0]+.0001,explicitSize);candidateCache.set(key,trial);}catch(e){candidateCache.set(key,{error:{code:e.code||'DRAW_PROGRAM_ERROR',message:e.message}});throw e;}}const solved=A.solveBasic(trial.envelopes,circle,plan.W,plan.H,cut.seed,trial.stageEnvelopes?{fitBounds:A.bounds(trial.stageEnvelopes)}:{});attempts.push({...recipe,status:solved.status,quality:trial.quality});if(solved.status==='safe'){solution=solved;composition=recipe;quality=trial.quality;selectedEnvelopes=trial.envelopes;selectedStageEnvelopes=trial.stageEnvelopes;break;}}catch(e){attempts.push({...recipe,status:'rejected',reason:e.code||'DRAW_PROGRAM_ERROR',details:e.message});}}
   }
   const safe=solution.status==='safe';segments.push({start:r.start,end,region:r.id,circle,from:solution.offset,to:solution.offset,status:safe?'safe-hold':'insufficient-space',decision:safe?'certified-hold-adapter':'excluded-during-avoidance',failure:safe?null:cut.layout+'-has-no-certified-composition',safetyScope:'source-owned-object-entry-exit-relaxed',holdWindow,attempts,composition,quality,envelopes:selectedEnvelopes,stageEnvelopes:selectedStageEnvelopes,proof:{...strategy.proof,explicitSizePreserved:explicitSize}});}
  cut.placementTrajectory={version:1,kind:'layouts-c-source-native',revision,evaluationRange,holdWindow,units:[{owner:cut.layout+'.composition',envelopes,segments}],sourceProof:{sourceMapping,nativeOwnership,stageProof:stageEnvelopes?'Continuous source squash/peel point intervals + camera envelope; full stage containment separate from circle hold safety':'pending source entry/exit stage scope',recipe:strategy.native,sourceIdentity:'unchanged registered C source + renderer/makeEnv prototypes',nativeFontSizePreserved:segments.every(s=>!s.composition||s.quality.nativeFontSizePreserved),ownedShapesPreserved:true,candidateBudget:{reconstructed,cacheHits:candidateHits,perCutLimit:128}},measurementSupported:true,safety:segments.every(s=>s.status==='safe-hold')?'certified-hold-adapter':'insufficient-space',explicitSizePreserved:explicitSize};
  diagnostics.push({cut:cut.index,code:'STAGED_C_ADAPTER',safety:cut.placementTrajectory.safety});
 }catch(e){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:e.code||'DRAW_PROGRAM_ERROR',details:e.message,safety:'unsupported'});}
};
A.renderLayoutsC=(renderer,env)=>{
 A.validateFinal(env.plan);const scale=env.scale||1;if(scale<.1||scale>4)fail('UNSUPPORTED_RENDER_SCALE','C certified render scale is .1..4');
 const external=externalAdapters.get(env.cut.layout);if(external){if(env.cut.placementTrajectory.sourceAdapter!==external.id||!A.layoutsCSourceKnown?.(env.cut.layout)||!A.layoutsCTransportKnown?.(renderer))fail('STALE_C_ADAPTER','Registered C source/renderer/adapter identity changed');return external.render(Object.freeze({renderer,env,trajectory:env.cut.placementTrajectory}));}
 const tr=env.cut.placementTrajectory,unit=tr.units[0],active=unit.segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),offset=A.offsetAt(unit,env.realTime);if(active?.composition){const cut={...env.cut,layoutCRecipe:active.composition};env=renderer.makeEnv(env.ctx,env.plan,cut,env.sc,{...env,cut});}const program=A.record(renderer,env);if(!program.measurementSupported)fail('UNSUPPORTED_DRAW_PROGRAM',JSON.stringify(program.diagnostics));
 const polygons=program.events.filter(e=>e.role==='primary').flatMap(e=>e.polygons).map(p=>p.map(q=>[q[0]/scale,q[1]/scale])),inHold=env.t>=tr.holdWindow[0]&&env.t<=tr.holdWindow[1],covered=!inHold||polygons.every(p=>(active?.envelopes||unit.envelopes).some(q=>p.every(v=>contains(v,q))));if(!covered)fail('ENVELOPE_VIOLATION','C '+env.cut.layout+' native hold geometry escaped its source proof');
 const stage=active?.stageEnvelopes,stageEnvelopeCovered=!stage||polygons.every(p=>stage.some(q=>p.every(v=>contains(v,q))));if(stage&&!stageEnvelopeCovered)fail('STAGE_ENVELOPE_VIOLATION','C source entry/exit escaped its continuous stage envelope');
 const moved=polygons.map(p=>p.map(v=>[v[0]+offset[0],v[1]+offset[1]])),stageContained=moved.every(p=>p.every(v=>v[0]>=0&&v[0]<=env.plan.W&&v[1]>=0&&v[1]<=env.plan.H));if(stage&&active.status==='safe-hold'&&!stageContained)fail('STAGE_CONTAINMENT_VIOLATION','C certified source entry/exit introduced stage crop');const region=J.resolveAvoidanceAt(env.plan,env.realTime),circle=region?J.avoidanceCirclePixels(region,env.plan.W,env.plan.H):null,clear=!moved.length||A.clear(moved,circle,Math.max(2,.005*Math.min(env.plan.W,env.plan.H))),relaxed=!!active&&!inHold;
 env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,pass:env.pass,offset,measurementSupported:true,envelopeCovered:covered,stageEnvelopeCovered,stageContained,safety:active?.status==='insufficient-space'?'conflict':clear?'safe':relaxed?'source-entry-exit-relaxed':'conflict',safetyScope:active?.safetyScope||'no-active-region',polygons:moved,events:program.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,order:e.order,polygons:e.polygons}))});A.replay(env,program,offset);
};
})();
