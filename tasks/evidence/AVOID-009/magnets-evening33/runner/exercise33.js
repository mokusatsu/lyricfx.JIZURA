async function exercise33({fonts}){
 const progress=window.magnets33Progress={stage:'fixture-setup',completedFrames:0,completedFrameSummaries:[],completedZeroPasses:0,completedMetadataComparisons:0,literalMetadataMismatches:[],lastContext:null,certificate:null,diagnostics:null};
 // Diagnostic comparator only. Array order and every cleaned field retained;
 // key ordering differences are reported separately, never assumed equivalent.
 function differences(expected,actual){
  const values=[],keyOrders=[];const show=v=>v===undefined?{diagnosticUndefined:true}:v;
  const walk=(a,b,path)=>{if(Object.is(a,b))return;if(a===null||b===null||typeof a!=='object'||typeof b!=='object'){if(values.length<20)values.push({path,expected:show(a),actual:show(b)});return;}
   if(Array.isArray(a)!==Array.isArray(b)){if(values.length<20)values.push({path,expectedType:Array.isArray(a)?'array':'object',actualType:Array.isArray(b)?'array':'object'});return;}
   if(Array.isArray(a)){if(a.length!==b.length&&values.length<20)values.push({path:path+'.length',expected:a.length,actual:b.length});for(let i=0;i<Math.max(a.length,b.length);i++)walk(a[i],b[i],path+'['+i+']');return;}
   const ak=Object.keys(a),bk=Object.keys(b);if(JSON.stringify(ak)!==JSON.stringify(bk)&&keyOrders.length<20)keyOrders.push({path,expectedKeyOrder:ak,actualKeyOrder:bk});
   for(const key of [...new Set([...ak,...bk])].sort()){const hasA=Object.hasOwn(a,key),hasB=Object.hasOwn(b,key);if(hasA!==hasB){if(values.length<20)values.push({path:path+'.'+key,expectedPresent:hasA,actualPresent:hasB,expected:show(a[key]),actual:show(b[key])});}else walk(a[key],b[key],path+'.'+key);}
  };walk(expected,actual,'$');return {first20ValueDifferences:values,first20KeyOrderDifferences:keyOrders,structuralValuesAndArrayOrderEqual:values.length===0};
 }

 const A=J.placement,errors=[],checks=[],clean=v=>JSON.parse(JSON.stringify(v,(_,x)=>typeof x==='function'?undefined:x)),equal=(a,b)=>JSON.stringify(clean(a))===JSON.stringify(clean(b)),assert=(v,message)=>{if(!v)throw Error(message);},hash=async cv=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data))).map(x=>x.toString(16).padStart(2,'0')).join('');
 async function make(control='off'){
  const r=await runLayoutsBFixture(J,{layout:'magnets',control,ghost:true,W:960,H:540,text:'風の先へ',seed:1205,fps:60},{newPath:false,fonts,renderInitial:false,exportDataURL:false});r.plan.duration=4.150001;r.plan.fps=60;r.plan.fx.koma=0;r.plan.lyricAvoidanceIndex.regions[0].end=4.150001;return r;
 }
 const r=await make(),off=structuredClone(r.plan);r.plan.lyricAvoidanceIndex.enabled=true;const input=structuredClone(r.plan),inputBytes=JSON.stringify(input),start=performance.now(),plan=J.finalizePlacementPlan(r.plan,{layoutsD:true}),finalizeMilliseconds=performance.now()-start,cut=plan.cuts[0],tr=cut.placementTrajectory,cert=tr?.certificate;
 progress.stage='adapter-finalized';progress.certificate=clean(cert??null);progress.diagnostics=clean(plan.placementFinalization);progress.sourceInput=clean(input);progress.finalizeMilliseconds=finalizeMilliseconds;assert(JSON.stringify(r.plan)===inputBytes,'SOURCE_INPUT_MUTATED');assert(cert&&tr.safety==='certified-bounded-adapter','NO_BOUNDED_NATIVE_CERTIFICATE:'+JSON.stringify(plan.placementFinalization));assert(!cert.metricReceipts.some(m=>Object.hasOwn(m,'fullBinValues')),'FULL_FONT_TABLE_SERIALIZED');
 for(const k of Object.keys(input.cuts[0]))if(!['area','fullStagePlacement','placementLayoutsD','placementUnits','placementTrajectory','layoutDRecipe'].includes(k))assert(equal(input.cuts[0][k],cut[k]),'SOURCE_CUT_CHANGED:'+k);
 const baseline=structuredClone(r.plan),schedule=[0,.18,.2,.34,.35,.44,.54,.64,1.5,184/60,3.6,3.8,4,4.033333333333333,4.05,4.066666666666666,4.15,4.150001];const frames=[],zero=[],canvas=(scale=1)=>{const c=document.createElement('canvas');c.width=960*scale;c.height=540*scale;return c;},native=r.renderer;
 function rebuiltRoot(ctx,scale,o,nativeCut,options,context){
  progress.stage='rebuild-native-root';assert(!baseline.events.length&&!baseline.beats.length&&!baseline.energy&&!nativeCut.area&&!nativeCut.effectFx&&!nativeCut.effectStyle,'ROOT_REBUILD_FIXED_SOURCE_SCOPE');
  ctx.setTransform(scale,0,0,scale,0,0);
  const env=native.makeEnv(ctx,baseline,nativeCut,nativeCut.palette,options),plan=baseline,cut=nativeCut,W=plan.W,H=plan.H,t=options.realTime,fx=env.fx,st=env.st,fps=plan.fps;
    const stepDur = J.stepDur(fx, fps);
    const clock = J.komaOf(fx) > 0 ? stepDur : 1 / 24;
    const tq = Math.floor(t / stepDur + 1e-6) * stepDur;
    const u = H / 1080;
  const spike=0,shake=0,beatPulse=0;
    const chroma = (fx.chroma ?? 0.7) * (st.ghost ?? 1) * (1 + spike + beatPulse);
    const step = Math.floor(tq / clock + 1e-6);
    const shx = J.rs(step, 71) * shake * 16 * u, shy = J.rs(step, 72) * shake * 11 * u;
    const passes = [
      { pass: 'B', lag: 1.6 / 24, off: [-3.4 * chroma * u, -1.3 * chroma * u] },
      { pass: 'A', lag: 0.8 / 24, off: [3.2 * chroma * u, 1.9 * chroma * u] },
      { pass: 'main', lag: 0, off: [0, 0] },
    ];
  const P=passes.find(p=>p.pass===o.pass),motion=cut.motionScale??1,cam=J.CAMERA.push.get(env,cut.camP||{}),X=ctx,areaX=0,areaY=0,contentW=W,contentH=H;
  assert(P&&!cam.rot&&!cam.skx,'ROOT_REBUILD_STOCK_PUSH_ONLY');
        const cs = J.lerp(1, cam.s ?? 1, motion) * (cut.contentScale ?? 1);
        X.translate(areaX + contentW / 2 + (shx + P.off[0] + (cam.x || 0)) * motion, areaY + contentH / 2 + (shy + P.off[1] + (cam.y || 0)) * motion);
        if (cam.rot) X.rotate(cam.rot * J.DEG * motion);
        if (cam.skx) X.transform(1, 0, Math.tan(cam.skx * J.DEG * motion), 1, 0, 0);
        X.scale(cs * J.lerp(1, cam.sx ?? 1, motion), cs * J.lerp(1, cam.sy ?? 1, motion)); X.translate(-contentW / 2, -contentH / 2);
  const m=ctx.getTransform(),rebuilt=[m.a,m.b,m.c,m.d,m.e,m.f];progress.lastRootRebuild={context,liveRoot:o.actualRoot,rebuiltRoot:rebuilt};assert(rebuilt.every((v,i)=>v===o.actualRoot[i]),'SOURCE_OPERATION_ROOT_NOT_BIT_EXACT');progress.rootRebuildExactCount=(progress.rootRebuildExactCount||0)+1;
  return rebuilt;
 }
 for(const [index,time]of schedule.entries()){
  progress.stage='canonical-representative-frame';progress.lastContext={index,time,scale:1};
  const before=canvas(),after=canvas(),obs=[];native.frame(before.getContext('2d'),baseline,time,{scale:1,noHud:true,noPost:true,allowFilter:false});native.frame(after.getContext('2d'),plan,time,{scale:1,noHud:true,noPost:true,allowFilter:false,placementObservation:o=>obs.push(clean(o))});
  for(const o of obs)for(const a of o.actual){assert(a.circleClear&&a.stageContained,'ACTUAL_CIRCLE_STAGE');assert(a.entry===(a.sourceF<1),'ACTUAL_PHASE');}
  frames.push({index,time,beforeSHA256:await hash(before),afterSHA256:await hash(after),observations:obs});progress.currentFrame=frames.at(-1);
  // Original native paint and native zero-replay at each actual own clock/root.
  // No synthetic clock is called Renderer co-time. Both compare transparent
  // native pass material; source main gradient stays at the exact original root.
  for(const o of obs){
   const direct=canvas(),replay=canvas(),nativeCut={...cut};delete nativeCut.placementTrajectory;const options={pass:o.pass,passColor:o.pass==='A'?cut.palette.ghostA:o.pass==='B'?cut.palette.ghostB:null,t:o.motionTime,realTime:time,lt:o.lt,ltb:o.ltb,step:Math.floor(o.motionTime/(1/24)+1e-6),scale:1,allowFilter:false};
   rebuiltRoot(direct.getContext('2d'),1,o,nativeCut,options,{index,time,pass:o.pass,scale:1,role:'zero-native'});rebuiltRoot(replay.getContext('2d'),1,o,nativeCut,options,{index,time,pass:o.pass,scale:1,role:'zero-replay'});
   if(time===184/60&&o.pass==='B'){const imported=canvas(),ic=imported.getContext('2d');ic.setTransform(...o.actualRoot);const im=ic.getTransform(),importedRoot=[im.a,im.b,im.c,im.d,im.e,im.f];progress.rootImportNegativeControl={index,time,pass:o.pass,liveRoot:o.actualRoot,importedRoot,delta:importedRoot.map((v,i)=>v-o.actualRoot[i]),operationRebuiltRoot:progress.lastRootRebuild.rebuiltRoot,importChanged:true};assert(importedRoot[5]!==o.actualRoot[5],'KNOWN_ROOT_IMPORT_NEGATIVE_CONTROL_NOT_REPRODUCED');imported.width=1;}
   const de=native.makeEnv(direct.getContext('2d'),baseline,nativeCut,cut.palette,options),re=native.makeEnv(replay.getContext('2d'),baseline,nativeCut,cut.palette,options);J.LAYOUTS.magnets.render(de);const program=A.record(native,re);assert(program.measurementSupported,'ZERO_SOURCE_RECORD');A.replay(re,program,[0,0]);const hd=await hash(direct),hr=await hash(replay);progress.lastContext={index,time,pass:o.pass,lt:o.lt,ltb:o.ltb,scale:1,actualRoot:o.actualRoot,nativePixelSHA256:hd,zeroReplayPixelSHA256:hr};progress.stage='zero-native-pixel';assert(hd===hr,'ZERO_NATIVE_PIXEL_PARITY');progress.completedZeroPasses++;
   const expected=clean(program.events.map(e=>({kind:e.kind,owner:e.owner,role:e.role,order:e.order,alpha:e.alpha,args:e.args,matrix:e.matrix,nativeTransform:e.nativeTransform,polygons:e.polygons})));progress.stage='native-paint-metadata';if(!equal(expected,o.events)){
    const expectedJSON=JSON.stringify(expected),actualJSON=JSON.stringify(o.events);let firstLiteralDifference=0;while(firstLiteralDifference<Math.min(expectedJSON.length,actualJSON.length)&&expectedJSON[firstLiteralDifference]===actualJSON[firstLiteralDifference])firstLiteralDifference++;
    progress.literalMetadataMismatches.push({context:progress.lastContext,firstLiteralDifference,expectedJSONLength:expectedJSON.length,actualJSONLength:actualJSON.length,expectedExcerpt:expectedJSON.slice(Math.max(0,firstLiteralDifference-160),firstLiteralDifference+320),actualExcerpt:actualJSON.slice(Math.max(0,firstLiteralDifference-160),firstLiteralDifference+320),...differences(expected,o.events),fullExpectedRecords:expected,fullActualRecords:o.events});
   }
   // SOURCE33 preserves the original strict literal assertion. Diagnostics are
   // saved BEFORE it; any semantic/order decision belongs to parent review.
   assert(equal(expected,o.events),'NATIVE_PAINT_CATALOG_CHANGED');progress.completedMetadataComparisons++;zero.push({frame:index,time,pass:o.pass,lt:o.lt,nativeSHA256:hd,replaySHA256:hr,eventCount:expected.length});direct.width=replay.width=1;
  }
  before.width=after.width=1;progress.completedFrames++;progress.completedFrameSummaries.push({index,time,beforeSHA256:frames.at(-1).beforeSHA256,afterSHA256:frames.at(-1).afterSHA256,observationCount:obs.length});
 }
 assert(frames.at(-1).observations.length===0,'SOURCE_LIVE_AT_REGION_END');assert(progress.rootImportNegativeControl?.importChanged,'ROOT_IMPORT_NEGATIVE_CONTROL_MISSING');
 progress.stage='boundary-scales';const boundaryScales=[];for(const scale of [.5,2])for(const time of [0,.18,.34,.44,.54,.64,1.5,3.6,3.8,4,4.033333333333333,4.066666666666666,4.15]){const cv=canvas(scale),obs=[];native.frame(cv.getContext('2d'),plan,time,{scale,noHud:true,noPost:true,allowFilter:false,placementObservation:o=>obs.push(clean(o))});boundaryScales.push({scale,time,pixelSHA256:await hash(cv),observations:obs});cv.width=1;}
 progress.stage='moved-pixel-references';const movedPixelReferences=[];
 const chosenRows=[...frames.filter(f=>[.2,.35,1.5,3.8,4,4.05].includes(f.time)).map(f=>({scale:1,time:f.time,observations:f.observations})),...boundaryScales.filter(f=>[.18,.34,1.5,3.8,4.033333333333333].includes(f.time))];
 for(const row of chosenRows)for(const o of row.observations){
  const scale=row.scale,direct=canvas(scale),adapted=canvas(scale),dc=direct.getContext('2d'),ac=adapted.getContext('2d'),nativeCut={...cut};delete nativeCut.placementTrajectory;
  const options={pass:o.pass,passColor:o.pass==='A'?cut.palette.ghostA:o.pass==='B'?cut.palette.ghostB:null,t:o.motionTime,realTime:row.time,lt:o.lt,ltb:o.ltb,step:Math.floor(o.motionTime/(1/24)+1e-6),scale,allowFilter:false};rebuiltRoot(dc,scale,o,nativeCut,options,{time:row.time,pass:o.pass,scale,role:'moved-native'});rebuiltRoot(ac,scale,o,nativeCut,options,{time:row.time,pass:o.pass,scale,role:'moved-adapter'});const de=native.makeEnv(dc,baseline,nativeCut,cut.palette,options),ae=native.makeEnv(ac,plan,cut,cut.palette,options),withRole=de.withDrawRole;
  // Independent direct native paint: source closure and live charFn unchanged;
  // only the local role callback adds the original-root stage delta. No record
  // or replay participates in the reference; no global function is replaced.
  de.withDrawRole=(role,owner,fn)=>{if(role!=='primary')return withRole(role,owner,fn);const match=/^magnets\.glyph\.([0-3])\.(depth|body)$/.exec(owner);assert(match,'MOVED_REFERENCE_OWNER');const delta=+match[1]<2?cert.recipe.left:cert.recipe.right;dc.save();try{dc.setTransform(o.actualRoot[0],o.actualRoot[1],o.actualRoot[2],o.actualRoot[3],o.actualRoot[4]+delta[0]*scale,o.actualRoot[5]+delta[1]*scale);return withRole(role,owner,fn);}finally{dc.restore();}};
  J.LAYOUTS.magnets.render(de);A.renderLayoutsD(native,ae);const directHash=await hash(direct),adapterHash=await hash(adapted);assert(directHash===adapterHash,'MOVED_NATIVE_PIXEL_REFERENCE_MISMATCH:'+JSON.stringify([scale,row.time,o.pass]));movedPixelReferences.push({scale,time:row.time,pass:o.pass,lt:o.lt,directNativeSHA256:directHash,adapterSHA256:adapterHash,referenceUsesRecordReplay:false});direct.width=adapted.width=1;
 }
 assert(movedPixelReferences.length>=18,'MOVED_REFERENCE_SCOPE_MISSING');
 progress.stage='bypass-controls';const bypass=[];for(const control of ['off','manual','lock','emphasis']){
  const q=await make(control);if(control!=='off')q.plan.lyricAvoidanceIndex.enabled=true;const source=structuredClone(q.plan),p=J.finalizePlacementPlan(q.plan,{layoutsD:true}),pairs=[];assert(!p.cuts[0].placementTrajectory?.certificate,'BYPASS_ADAPTER_ACTIVATED:'+control);
  for(const time of [0,.35,1.5,3.8,4.05]){const a=canvas(),b=canvas();native.frame(a.getContext('2d'),source,time,{noHud:true,noPost:true});native.frame(b.getContext('2d'),p,time,{noHud:true,noPost:true});const ah=await hash(a),bh=await hash(b);assert(ah===bh,'BYPASS_PIXELS_CHANGED:'+control);pairs.push({time,beforeSHA256:ah,afterSHA256:bh});a.width=b.width=1;}bypass.push({control,diagnostics:p.placementFinalization?.diagnostics,pairs});
 }
 // Enabled index alone changes no native source material.
 const enabledIndexPairs=[];for(const time of [0,.2,.35,1.5,3.8,4.05]){const a=canvas(),b=canvas();native.frame(a.getContext('2d'),off,time,{noHud:true,noPost:true});native.frame(b.getContext('2d'),baseline,time,{noHud:true,noPost:true});const ah=await hash(a),bh=await hash(b);assert(ah===bh,'ENABLED_INDEX_NATIVE_PAINT_CHANGED');enabledIndexPairs.push({time,offSHA256:ah,enabledNativeSHA256:bh});a.width=b.width=1;}
 const codeAt=p=>{const cv=canvas();try{native.frame(cv.getContext('2d'),p,1.5,{noHud:true,noPost:true});return null;}catch(e){return e.code||e.name;}finally{cv.width=1;}};
 progress.stage='cache-controls';const cacheBefore=A.layoutsCFinalCacheStats?.()||null;A.clearLayoutsCFinalCache?.();const fresh=await make();fresh.plan.lyricAvoidanceIndex.enabled=true;const rebuilt=J.finalizePlacementPlan(fresh.plan,{layoutsD:true}),sameInput=fresh.plan,decoded=J.finalizePlacementPlan(sameInput,{layoutsD:true}),decodeCode=codeAt(decoded);assert(!decodeCode,'DECODED_RENDER_FAILED:'+decodeCode);const cacheAfter=A.layoutsCFinalCacheStats?.()||null;assert(cacheAfter&&cacheAfter.hits>0&&decoded!==rebuilt&&decoded.cuts[0].placementTrajectory.certificate!==rebuilt.cuts[0].placementTrajectory.certificate,'CACHE_DECODE_NOT_EXERCISED');
 const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};const badCert=structuredClone(cert);badCert.recipe.left[0]+=1;freeze(badCert);const badCut={...cut,placementTrajectory:{...tr,certificate:badCert}},badCanvas=canvas(),badEnv=native.makeEnv(badCanvas.getContext('2d'),plan,badCut,cut.palette,{pass:'main',t:1.5,realTime:1.5,lt:1.5,ltb:1.5,step:36,scale:1,allowFilter:false});let tamperCode=null;try{A.renderLayoutsD(native,badEnv);}catch(e){tamperCode=e.code||e.name;}assert(tamperCode==='MAGNETS_DECODED_PROOF','TAMPERED_CERT_NOT_REJECTED:'+tamperCode);badCanvas.width=1;
 const unsupported=[];for(const [name,change]of [['camera',p=>p.cuts[0].cam='panL'],['cut-effect-event',p=>p.cuts[0].effectEvents=[{type:'shake',t:0,amp:1}]],['short-tail',p=>{p.duration=4;p.lyricAvoidanceIndex.regions[0].end=4;}],['source-text',p=>p.cuts[0].text='違う文']]){const q=await make();q.plan.lyricAvoidanceIndex.enabled=true;change(q.plan);const p=J.finalizePlacementPlan(q.plan,{layoutsD:true});assert(!p.cuts[0].placementTrajectory?.certificate,'UNSUPPORTED_CERTIFIED:'+name);unsupported.push({name,diagnostics:p.placementFinalization.diagnostics});}

 const font=J.FONTS[cut.params.font],label=font.label;let staleFont,staleProof;try{font.label=label+' native29-stale';staleFont=codeAt(plan);}finally{font.label=label;}assert(staleFont==='MAGNETS_STALE_DEPENDENCY','STALE_FONT_NOT_REJECTED:'+staleFont);
 const helper=A.magnetsNativeProof29;try{A.magnetsNativeProof29=(...args)=>helper(...args);staleProof=codeAt(plan);}finally{A.magnetsNativeProof29=helper;}assert(staleProof==='MAGNETS_STALE_DEPENDENCY','STALE_PROOF_NOT_REJECTED:'+staleProof);
 // Real font-state revision change requires a fresh project/source replan.
 J.metrics.clear();J.glyphs.clear();const staleRevision=codeAt(plan);assert(['STALE_PLACEMENT_PLAN','MAGNETS_STALE_DEPENDENCY'].includes(staleRevision),'STALE_REVISION_NOT_REJECTED');const restored=await make();restored.plan.lyricAvoidanceIndex.enabled=true;const restoredPlan=J.finalizePlacementPlan(restored.plan,{layoutsD:true}),restoredCode=codeAt(restoredPlan);assert(!restoredCode,'FRESH_REPLAN_FAILED:'+restoredCode);
 progress.stage='complete';return {kind:'magnets33-canonical-representative-native-run',edition:document.documentElement.lang,representativeOnly:true,full250NotRepeated:true,sourceInput:input,sourceInputUnmutated:true,sourceCutInputsPreserved:true,certificate:cert,diagnostics:plan.placementFinalization.diagnostics,finalizeMilliseconds,schedule,frames,zeroReplay:zero,boundaryScales,movedPixelReferences,bypass,enabledIndexPairs,unsupported,cache:{before:cacheBefore,after:cacheAfter,decodeCode,tamperCode,decodedCertificateMatches:equal(rebuilt.cuts[0].placementTrajectory.certificate,decoded.cuts[0].placementTrajectory.certificate)},stale:{staleFont,staleProof,staleRevision,restoredCode},rootRebuildExactCount:progress.rootRebuildExactCount,rootImportNegativeControl:progress.rootImportNegativeControl,fontAudit:window.layoutsBFixtureFontAudit,errors};
}

async function run33Diagnostic({fonts}){try{return {completed:true,result:await exercise33({fonts})};}catch(e){return {completed:false,error:{name:e.name,message:e.message,code:e.code||null,stack:e.stack},partial:window.magnets33Progress||null,allFramesPassed:false};}}
