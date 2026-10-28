/* AVOID-009: D source inventory and custom drawing boundary. All capabilities
   are explicit opt-in. A declaration is never a geometry certificate. */
(() => {
'use strict';
const A=J.placement;
const rows=[
 ['cube','face-solid','face-local lyric, face labels, alternate copy and numeral','face yaw/pitch and pop intervals; chunk/face schedule'],
 ['cylinder','drum','front lyric rows, deliberate secondary text rings and optional band/glass','front arc pitch/row spacing; bounded spin, ring text and shear'],
 ['flipCards','card','each card face, corner rank and lyric glyph','card pitch/row arrangement; flip intervals'],
 ['accordion','fold','each folded panel and printed glyph','fold pitch/depth; bounded affine panels'],
 ['flag','cloth','cloth strips and printed glyphs','wave amplitude/path and line pitch; strip shear'],
 ['ribbon','ribbon','ribbon path, edge and printed glyphs','path bend, path measure and text spacing'],
 ['pendulum','pendulum','strings, weights/fan papers and printed text','anchor pitch and string length; angular sweep'],
 ['pile','composition','every falling/settled glyph, mound, seeded heap glyph and impact dust is primary','source-native physical field and contiguous runs; allphase strict circle/X; original falling main TOP entry; original source exit BOTTOM only, otherwise stage strict'],
 ['blocks','block','each block face, edges and printed glyph','block pitch and row arrangement; projected fall'],
 ['balloons','balloon','glyph balloons, highlights and tied strings','balloon pitch and string length; buoyant sweep'],
 ['magnets','magnet','lyric magnets and their actual glyph shadow copies','magnet row pitch; source attraction/rotation'],
 ['tiles','tile','letter tile, face glyph and point value','tile pitch and rows; affine entry/exit'],
 ['bulbs','sign','sign body, shadow, rim bulbs, lyric and subtitle','sign writing measure and rim pitch; pop interval'],
 ['ledScroll','display','module housing, main scrolling lyric and information strip','display lane/width; clipped source scroll and dot texture'],
 ['billboard','billboard','board, structure, lamps and lyric/tag','board writing field and post geometry; rise interval'],
 ['crowdBubbles','bubble','hero bubble and lyric; crowd captions retain separate roles','hero writing field and bubble tail; crowd intervals'],
 ['crossword','crossword','grid, clue labels, numbers, crossing entries and lyric cells','grid cell measure and clue arrangement; typed writing clocks'],
 ['wordSearch','search-grid','grid panel, find capsule and path glyphs','grid cell pitch and find-path direction; decoy capsule separate'],
 ['puzzle','piece','jigsaw pieces, their clipped lyric portions and seams','piece grid measure and arrival paths; clip union'],
 ['shadowPlay','cast-shadow','solid lyric, affine cast lyric and shared floor/lamp','light direction and cast extent; wall blur needs finite support'],
 ['kaleido','hero','central disc/band and complete lyric','hero writing field and disc radius; repeated radial background deferred'],
 ['dominoes','domino','each domino face, pips and printed glyph','domino row pitch and fall angle; per-piece phases'],
 ['burst','burst-plate','burst plate and complete printed lyric','ray proportions and writing field; plate motion'],
 ['fisheye','glyph','every lens-scaled primary glyph and lens markers','lens position/strength and glyph pitch; interval scale'],
 ['wall','wall-face','projected wall surfaces and complete front lyric','wall depth, face writing measure and perspective'],
 ['origami','folded-sheet','folded sheet faces, creases and printed lyric','sheet aspect and writing measure; fold topology'],
 ['zipper','zipper','teeth, pull tab and revealed primary lyric','zip path and tooth pitch; reveal clip'],
 ['sliceStack','slice','all clipped glyph slices and extrusion copies','slice pitch and extrusion depth; clip/offset intervals'],
 ['glitchGrid','cell','all source glyph fragments and glitch cells','cell displacement and reveal intervals; source coverage'],
 ['mosaicTiles','glyph-tile','lit tiles, bevels and mask cells construct primary lyric','primary glyph tile pitch; offscreen sampler is provenance'],
 ['maskReveal','text-window','primary glyph including pattern/texture and rim','glyph writing measure; repeated texture stays primary fill'],
 ['contour','contour-copy','first lyric glyph rings/fill, complete lyric and meaningful metadata','contour radius/spacing and side writing field; raw stroke bounds'],
 ['halftoneBig','screened-glyph','screened primary glyph and optional offset duo copy','screen pitch and primary glyph measure; alpha sampler provenance'],
 ['stencil','sprayed-glyph','bridged primary glyph, marks, overspray and drips','stencil field and spray path; evenodd clip topology']
];
A.layoutsD34=rows.map(r=>r[0]);
const adapters=new Map(),fail=(code,message)=>{const e=Error(message);e.code=code;throw e;};
A.registerLayoutsDAdapter=(layout,adapter)=>{if(!A.layoutsD34.includes(layout)||layout==='fisheye'||adapters.has(layout)||!adapter||typeof adapter.id!=='string'||!/^[A-Za-z0-9_-]{3,64}$/.test(adapter.id)||typeof adapter.finalize!=='function'||typeof adapter.render!=='function'||adapter.runtimeAdmission!==undefined&&typeof adapter.runtimeAdmission!=='function')fail('INVALID_D_ADAPTER_REGISTRATION','Unique native D ID and stable finalize/render callbacks required');adapters.set(layout,Object.freeze({id:adapter.id,finalize:adapter.finalize,render:adapter.render,...(adapter.runtimeAdmission===undefined?{}:{runtimeAdmission:adapter.runtimeAdmission})}));};
A.layoutsDRegisteredAdapters=()=>Array.from(adapters,([layout,a])=>({layout,id:a.id}));
// Exact completed-plan cache dependency collector receives identities only;
// neither its snapshots nor callers can mutate the private adapter registry.
A.layoutsDCacheAdapterDependencies=()=>Array.from(adapters,([layout,a])=>a.runtimeAdmission===undefined?[layout,a.id,a.finalize,a.render]:[layout,a.id,a.finalize,a.render,a.runtimeAdmission]);
// Read-only runtime ownership admission. A false result/exception is a cache miss;
// this callback must not compile, paint, mutate or reissue a certificate.
// Adapters without the optional callback retain their existing cache behavior.
Object.defineProperty(A,'layoutsDRuntimeAdmission',{enumerable:true,value:Object.freeze(plan=>{for(const cut of plan.cuts||[]){if(cut.placementLayoutsD!==true||cut.layout==='fisheye')continue;const adapter=adapters.get(cut.layout);if(!adapter?.runtimeAdmission)continue;if(cut.placementTrajectory?.sourceAdapter!==adapter.id)return false;try{if(adapter.runtimeAdmission(Object.freeze({plan,cut,trajectory:cut.placementTrajectory}))!==true)return false;}catch{return false;}}return true;})});
const readonly=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(readonly);Object.freeze(v);}return v;};
function validate(tr,plan,cut,{revision,stepDur,reachTail}){
 const bad=m=>fail('INVALID_D_ADAPTER_RESULT',m),pair=v=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite),range=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail];
 if(!tr||tr.kind!=='layouts-d-source-native'||tr.version!==1||tr.revision!==revision||tr.measurementSupported!==true||!tr.sourceProof||!pair(tr.evaluationRange)||tr.evaluationRange[0]>range[0]||tr.evaluationRange[1]<range[1]||!Array.isArray(tr.units)||!tr.units.length||!['certified-bounded-adapter','certified-hold-adapter','insufficient-space'].includes(tr.safety))bad('Complete typed D source/interval proof required');
 const regions=plan.lyricAvoidanceIndex.regions.map((r,i)=>({...r,end:Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration)})).filter(r=>r.start<tr.evaluationRange[1]&&r.end>tr.evaluationRange[0]&&r.end>r.start),owners=new Set(),statuses=[];if(!regions.length)bad('Nonempty active source region coverage required');
 for(const unit of tr.units){if(typeof unit.owner!=='string'||!unit.owner||owners.has(unit.owner)||!Array.isArray(unit.segments)||unit.segments.length!==regions.length)bad('Unique owner and complete exact region segments required');owners.add(unit.owner);
  for(let i=0;i<regions.length;i++){const r=regions[i],s=unit.segments[i],circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)};if(!s||s.start!==r.start||s.end!==r.end||s.region!==r.id||!pair(s.from)||!pair(s.to)||s.from.some((v,j)=>v!==s.to[j])||!['safe','safe-hold','insufficient-space'].includes(s.status)||!s.circle||Object.keys(circle).some(k=>!Number.isFinite(s.circle[k])||Math.abs(s.circle[k]-circle[k])>1e-8))bad('Finite fixed segment offset, source region and exact stage circle required');const decision=s.status==='safe'?'certified':s.status==='safe-hold'?'certified-hold-adapter':'excluded-during-avoidance';if(s.decision!==decision)bad('D decision/status mismatch');if(s.status==='safe-hold'){const hold=s.holdWindow||tr.holdWindow;if(!pair(hold)||hold[1]-hold[0]<.04||hold[0]<cut.start||hold[1]>cut.end)bad('D safe-hold requires explicit in-cut hold window of at least.04s');}statuses.push(s.status);}
 }
 if(tr.safety==='certified-bounded-adapter'&&statuses.some(s=>s!=='safe')||tr.safety==='certified-hold-adapter'&&statuses.some(s=>!['safe','safe-hold'].includes(s))||tr.safety==='insufficient-space'&&!statuses.includes('insufficient-space'))bad('D root safety contradicts segment outcomes');
}
A.finalizeLayoutsD=(plan,cut,original,diagnostics,options)=>{
 if(cut.layout==='fisheye')return A.finalizeLayoutsDFisheye(plan,cut,original,diagnostics,options);
 try{const adapter=adapters.get(cut.layout);if(!adapter)fail('D_SOURCE_PROOF_PENDING','Dedicated '+cut.layout+' source proof remains pending; see layoutsDInventory');if(!A.layoutsDSourceKnown?.(cut.layout))fail('STALE_D_SOURCE','Unchanged native D renderer required');cut.placementUnits=true;cut.placementLayoutsD=true;const tr=adapter.finalize(Object.freeze({plan,cut,original:readonly(JSON.parse(JSON.stringify(original))),...options}));validate(tr,plan,cut,options);cut.placementTrajectory={...tr,sourceAdapter:adapter.id};diagnostics.push({cut:cut.index,code:'STAGED_D_ADAPTER',adapter:adapter.id,safety:tr.safety});}catch(e){plan.cuts[plan.cuts.indexOf(cut)]=original;diagnostics.push({cut:cut.index,code:e.code||'DRAW_PROGRAM_ERROR',details:e.message,safety:'unsupported'});}
};
A.renderLayoutsD=(renderer,env)=>{A.validateFinal(env.plan);if(!A.layoutsDSourceKnown?.(env.cut.layout)||!A.layoutsDTransportKnown?.(renderer))fail('STALE_D_SOURCE','Unchanged D source/renderer required');if(env.cut.layout==='fisheye')return A.renderLayoutsDFisheye(renderer,env);const adapter=adapters.get(env.cut.layout);if(!adapter||env.cut.placementTrajectory.sourceAdapter!==adapter.id)fail('STALE_D_ADAPTER','Exact registered D adapter required');return adapter.render(Object.freeze({renderer,env,trajectory:env.cut.placementTrajectory}));};
A.layoutsDInventory=()=>rows.map(([layout,unit,primary,strategy])=>({layout,unit,primary,strategy,status:'source-proof-pending',measurementSupported:false,
 tiledAux:layout==='kaleido'?'6..12 clipped sectors each repeat five radial background captions; complete hero lyric is separately protected':layout==='wordSearch'?'seeded off-path kana filler':null,
 auxiliaryCandidate:null,independentDecor:layout==='wordSearch'?'Earlier decoy capsule has no source lyric and is separate from the protected find capsule.':layout==='magnets'?'Seeded DECOY alphabet magnets at board edges; actual lyric glyph shadows remain protected.':null,
 provenance:['mosaicTiles','halftoneBig'].includes(layout)?'Offscreen text raster is a primary construction input; final tiles/screened output are the stage ink.':layout==='maskReveal'?'Repeated texture is an input inside the primary glyph, never auxiliary stage text.':null}));

// Read the portable project-owned definitions, rather than the currently active
// registry. The report therefore agrees for imported, saved and preview plans.
// No program node, component parameter or manual coordinate is changed.
A.customDrawingCapability=(cut,plan)=>{
 const definitions=new Map((plan.customEffects||[]).map(d=>[d.id,d])),programs=[],components=[];
 // Snapshot nested portable JSON values; retain primitive/undefined spread overrides.
 const snapshotParams=params=>Object.fromEntries(Object.entries(params).map(([key,value])=>[key,value&&typeof value==='object'?JSON.parse(JSON.stringify(value)):value]));
 const add=(program,path,group,params={},event=null)=>{if(!program)return;const nodes=(program.nodes||[]).map((n,index)=>({path:path+'.nodes['+index+']',type:n.type,role:['text','arcText'].includes(n.type)?'primary':'owned-program-shape',...(['text','arcText'].includes(n.type)?{textSource:n.text==='$text'||n.text===undefined?(group==='fx'||group==='trans'?'empty-render-input':'lyric'):n.text==='$note'?(group==='fx'||group==='trans'?'empty-render-input':'note'):'literal'}:{}),frame:n.frame||'area',units:n.units||'frame'}));programs.push({path,group,mode:program.mode,nodes,params:snapshotParams(params),...(event?{event}:{})});};
 add(cut.drawing,'cut.drawing','drawing');
 for(const group of ['layout','enter','hold','exit','treat','cam','bg','trans']){
  const d=definitions.get(cut[group]);if(!d||d.group!==group)continue;
  components.push({id:d.id,group,path:'cut.'+group,base:d.base||null,motion:!!d.motion});
  add(d.program,'components.'+d.id+'.program',group,{...d.params,...cut[group==='layout'?'params':group+'P']});
 }
 for(let i=0;i<(cut.decor||[]).length;i++){
  const entry=cut.decor[i],d=definitions.get(entry.id);if(!d||d.group!=='decor')continue;
  components.push({id:d.id,group:'decor',path:'cut.decor['+i+']',base:d.base||null,motion:false});
  add(d.program,'components.'+d.id+'.program','decor',{...d.params,...entry});
 }
 const owner=cut.line+':'+cut.part;
 for(const [domain,events]of [['cut.effectEvents',cut.effectEvents||[]],['plan.events',plan.events||[]]])for(let i=0;i<events.length;i++){
  const event=events[i],d=definitions.get(event.type);if(!d||d.group!=='fx'||domain==='plan.events'&&event.cutOwner!==owner)continue;
  const path=domain+'['+i+']';components.push({id:d.id,group:'fx',path,base:d.base||null,motion:false,cutOwner:owner});
  add(d.program,path+'.components.'+d.id+'.program','fx',{...d.params,...event.params},{cutOwner:owner,domain,clock:domain==='plan.events'?'absolute t/dur':'offset/dur'});
 }
 if(!programs.length&&!components.length)return null;
 return {version:1,capability:'custom-manual-placement',measurementSupported:false,safety:'unsupported',code:'CUSTOM_PLACEMENT_UNSUPPORTED',coordinatePolicy:'preserve-manual-program-and-component-coordinates',reason:'Custom program nodes and component motion have no certified complete-interval source adapter; original drawing remains unchanged.',programs,components,
  textNodes:programs.flatMap(p=>p.nodes.filter(n=>n.role==='primary')),schemaPreserved:true};
};
A.customGlobalEventCapabilities=plan=>(plan.events||[]).flatMap((event,index)=>{
 if(event.cutOwner!=null)return [];const d=(plan.customEffects||[]).find(d=>d.id===event.type&&d.group==='fx');if(!d)return [];
 const report=A.customDrawingCapability({line:null,part:null,effectEvents:[event]}, {customEffects:plan.customEffects});
 for(const component of report.components){component.cutOwner=null;component.path='plan.events['+index+']';}
 for(const program of report.programs){program.path='plan.events['+index+'].components.'+d.id+'.program';program.event={cutOwner:null,domain:'plan.events',clock:'absolute t/dur',scope:'global-event'};program.nodes.forEach((node,i)=>node.path=program.path+'.nodes['+i+']');}
 return [{code:'CUSTOM_GLOBAL_EVENT_UNSUPPORTED',safety:'unsupported',scope:'global-event',eventIndex:index,cutOwner:null,capability:report}];
});
})();
