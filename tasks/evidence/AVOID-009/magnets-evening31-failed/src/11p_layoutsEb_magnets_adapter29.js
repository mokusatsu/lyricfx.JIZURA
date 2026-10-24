/* SOURCE29 ONLY: native magnets, strict all-phase circle/stage/board;
   independent ornament overlap is diagnostic ONLY during true source f<1.
   Old strict ornament candidate failures remain recorded. No integration yet. */
(()=>{'use strict';
const A=J.placement,REV='magnets-native-two-group-v1',fail=(code,message)=>{throw Object.assign(Error(message),{code});},own=v=>JSON.parse(JSON.stringify(v)),seal=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(seal);Object.freeze(v);}return v;};
const knownProof=A.magnetsNativeProof29,admitted=new WeakSet(),checked=new WeakSet(),identities=new WeakMap();let nextID=1;
const id=v=>{if(v==null||!['function','object'].includes(typeof v))fail('MAGNETS_DEPENDENCY','Object/function required');if(!identities.has(v))identities.set(v,nextID++);return identities.get(v);};
function same(a,b){if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const ka=Object.keys(a).sort(),kb=Object.keys(b).sort();return ka.length===kb.length&&ka.every((k,i)=>k===kb[i]&&same(a[k],b[k]));}
const sourceKeys=['index','layout','text','seed','start','end','dur','inDur','outDur','stagger','params','cam','camP','contentScale','motionScale','enter','exit','hold','treat','renderStart','displayEnd','groupExit','groupOutDur','decor','drawing','effectsOnly','palette','effectFx','effectStyle','fonts','opacity','blend','frontmost','blank','insertedAtPlayhead','group','trans','transP','transDur','note','words','lyricSize','placementLocked','emphasis','effectEvents','customEffects','mask','personOcclusion'];
const signature=(plan,cut)=>JSON.stringify([plan.W,plan.H,plan.fps,plan.duration,plan.fx,plan.style,plan.events,plan.beats,plan.energy,plan.energyRate,plan.media,plan.foreground,plan.keyBg,plan.ghostPreRoll,plan.retainedCutIndices,plan.customEffects,plan.layerVisibility,plan.lyricAvoidanceIndex,sourceKeys.map(k=>cut[k])]);
function dependency(cut){
 if(A.magnetsNativeProof29!==knownProof||!A.layoutsDSourceKnown?.('magnets')||!A.layoutsDTransportKnown?.(Object.create(J.Renderer.prototype))||document.fonts.status!=='loaded')fail('MAGNETS_STALE_DEPENDENCY','Known proof/source/transport/loaded fonts required');
 const faces=Array.from(document.fonts);if(faces.length>128||faces.some(f=>f.status!=='loaded'))fail('MAGNETS_FONT_DOMAIN','At most128 loaded faces required');
 const refs=[['proof',knownProof],['finalize',finalize],['render',render],['source',J.LAYOUTS.magnets.render],['sourcePlan',J.LAYOUTS.magnets.plan],['camera',J.CAMERA.push.get],['record',A.record],['replay',A.replay],['geometry',A.itemGeometry],['cameraEnvelope',A.cameraEnvelope],['clear',A.clear],['bounds',A.bounds],['hull',A.convexHull],['inverse',A.inverse],['affine',A.affine],['point',A.point],['measurement',A.measurementContext()],['makeEnv',J.Renderer.prototype.makeEnv],['drawCut',J.Renderer.prototype.drawCut],['mainDraw',J.mainDraw],['drawItem',J.drawItem],['drawFx',J.drawFx],['layoutText',J.layoutText],['fontCSS',J.fontCSS],['Number.toFixed',Number.prototype.toFixed],['fontForChar',J.fontForChar],['faceOf',J.faceOf],['adv',J.metrics.adv],['fontRegistry',J.FONTS],['fontSet',document.fonts]];
 for(const k of ['h','r','rs','mix','lum','contrast','combineChar','combinePiece','glyphCount','chunkText','lerp','clamp','stepDur','komaOf','lyricCutsAt','lyricRenderCut','resolveAvoidanceAt','avoidanceCirclePixels'])refs.push(['J.'+k,J[k]]);
 for(const k of ['inCubic','outCubic','inQuad','outExpo'])refs.push(['E.'+k,J.E[k]]);
 for(const k of ['sin','cos','pow','ceil','floor','round','min','max','abs','sqrt','hypot'])refs.push(['Math.'+k,Math[k]]);
 for(const [name,obj]of [['enter',J.ENTER.cut],['exit',J.EXIT.cut],['hold',J.HOLD.still],['treat',J.TREAT.none]]){refs.push([name,obj]);for(const k of Object.keys(obj))if(typeof obj[k]==='function')refs.push([name+'.'+k,obj[k]]);}
 for(const [tag,obj]of [['metrics',J.metrics],['glyphs',J.glyphs]]){refs.push([tag,obj]);for(const k of Object.keys(obj).sort())if(typeof obj[k]==='function')refs.push([tag+'.'+k,obj[k]]);}
 // Bind all exported root helpers as well as the explicit proof seams. The
 // source uses classification/measurement/character factories beyond drawItem.
 for(const [tag,obj]of [['J',J],['placement',A]])for(const k of Object.keys(obj).sort())if(typeof obj[k]==='function')refs.push([tag+'.'+k,obj[k]]);
 refs.push(['Renderer.frame',J.Renderer.prototype.frame]);
 for(const k of ['measureText','fillText','strokeText','setTransform','translate','rotate','scale','save','restore'])refs.push(['Canvas.'+k,CanvasRenderingContext2D.prototype[k]]);
 const descriptors=['family','style','weight','stretch','unicodeRange','status','featureSettings','variationSettings','display','ascentOverride','descentOverride','lineGapOverride'];
 return {revision:REV,metricsRevision:J.metrics.revision||0,language:J.lang,scalars:[J.DEG,J.TAU,Math.PI,Math.SQRT2,Number.EPSILON],tokens:refs.map(([k,v])=>[k,id(v)]),fontRegistry:JSON.stringify(J.FONTS),faces:faces.map(f=>({token:id(f),...Object.fromEntries(descriptors.map(k=>[k,String(f[k]??'')]))}))};
}
function checkDependency(dep,cut){if(!same(dep,dependency(cut)))fail('MAGNETS_STALE_DEPENDENCY','Replan/refinalize after source/helper/font changes; old cache identity is not recertification');}
function regionOf(plan){
 const rs=plan.lyricAvoidanceIndex?.regions;if(plan.cuts.length!==1||rs?.length!==1)fail('MAGNETS_REGION','One source cut and one whole extended region required');const r=rs[0],end=Math.min(r.end??plan.duration,plan.duration);
 if(r.start!==0||end!==4.150001||plan.duration!==end)fail('MAGNETS_REGION','Original4sec cut plus complete monotone ghost/quantizer tail required');
 return {start:0,end,id:r.id,circle:{cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)}};
}
function stable(diag,dep,sig,original){
 const choice=diag.chosen29;if(!choice)return null;
 // Live tables are transient proof working data. Never serialize full CSS-bin
 // values into every plan/certificate/cache entry. Rebuild scans all bins again.
 const metrics=diag.metricReceipts.map(({fullBinValues,negativeZeroIndices,...m})=>m);
 return seal({version:1,revision:REV,dependency:dep,signature:sig,originalSource:own(original),region:own(diag.region),recipe:{kind:'two-group-stage',left:choice.leftDelta.slice(),right:choice.rightDelta.slice(),qGroups:[[0,1],[2,3]]},sourceCatalog:diag.sourceCatalog,sourceCut:diag.sourceCutSnapshot,branches:diag.branches,domain:diag.domain,ledger:diag.ledger,obstacles:diag.obstacles,boardModel:diag.boardModel29,boardIntervals:diag.boardIntervals29,metricPreflight:diag.metricPreflight,metricReceipts:metrics,metricKeys:diag.metricKeys,retentionTail:diag.retentionTail,holdWindow:diag.holdWindow,qualityPolicy:diag.qualityPolicy,selectedCounts:choice.counts,selectedWorst:choice.worst,attempts:diag.attempts29,renderScaleRange:[.5,2],fullCircleStageBoard:true,strictHeldOrnaments:true,allPhaseOrnamentClear:choice.originalStrictOrnamentClear,movingEntryOrnamentQualityPending:true,continuousCameraMode:diag.continuousCameraMode});
}
function prepare(plan,cut,original,dep){
 const region=regionOf(plan),diag=knownProof(Object.create(J.Renderer.prototype),plan,cut,{original});checkDependency(dep,cut);
 if(diag.status!=='diagnostic-only'||!same(diag.region,region)||!diag.retentionTail.endExpired||diag.domain.sourceExpiryUpperBound>region.end)fail('MAGNETS_PROOF_INCONCLUSIVE','Complete native source and selected tail proof required');
 const cert=stable(diag,dep,signature(plan,cut),original);if(cert)admitted.add(cert);return {diag,cert};
}
function finalize({plan,cut,original,revision,stepDur,reachTail,explicitSize}){
 const dep=dependency(cut),{diag,cert}=prepare(plan,cut,original,dep),region=regionOf(plan),status=cert?'safe':'insufficient-space';
 return {kind:'layouts-d-source-native',version:1,revision,evaluationRange:[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail],measurementSupported:true,units:[{owner:'magnets.composition',segments:[{start:region.start,end:region.end,region:region.id,circle:region.circle,from:[0,0],to:[0,0],status,decision:cert?'certified':'excluded-during-avoidance',qualityPolicy:diag.qualityPolicy}]}],dependency:dep,certificate:cert,safety:cert?'certified-bounded-adapter':'insufficient-space',explicitSizePreserved:explicitSize,sourceProof:{kind:REV,qualityPolicy:diag.qualityPolicy,circle:'strict-all-continuous-primary-body-depth-ghost-phases',stage:'strict-all-continuous-phases',board:'SOURCE24-directed-eroded-rounded-literal-board',obstacles:'SOURCE21-all-lifetime17;held-including-damped-strict;moving-native-f<1-entry-quality-diagnostic',originalStrictOrnamentClear:cert?.allPhaseOrnamentClear??false,nativeShapeFontGrowthKinematicsPaintOrderPreserved:true,independentDecorOffsetsZero:true,selectedRecipe:cert?.recipe||null,selectedCounts:cert?.selectedCounts||null,fullMetricTablesSerialized:false,sourceOriginalCompared:true,decodedAdmission:'Fresh live all-bin/support reprepare exact certificate equality',formalPerformanceAccepted:false,diagnostic26To28NotRuntimeInputs:true}};
}
function firstUse(cert,plan,cut){
 if(!cert||!Object.isFrozen(cert)||cert.version!==1||cert.revision!==REV)fail('MAGNETS_CERTIFICATE','Owned frozen native certificate required');
 if(!admitted.has(cert)){checkDependency(cert.dependency,cut);if(cert.signature!==signature(plan,cut))fail('MAGNETS_STALE_SOURCE','Decoded source signature differs');const native={...cut};delete native.placementTrajectory;delete native.layoutDRecipe;const fresh=prepare(plan,native,cert.originalSource,dependency(native)).cert;if(!fresh||!same(fresh,cert))fail('MAGNETS_DECODED_PROOF','Fresh live-font/source proof differs from decoded certificate');admitted.add(cert);}
 if(checked.has(cert))return;
 if(cert.qualityPolicy!=='native-moving-entry-ornament-diagnostic-v1'||cert.ledger.length!==1324||cert.obstacles.length!==17||cert.branches.ranges.length!==93||!cert.retentionTail.endExpired||cert.metricReceipts.some(m=>Object.hasOwn(m,'fullBinValues'))||!cert.fullCircleStageBoard||!cert.strictHeldOrnaments||['circle','globalStage','board','heldHandle','heldDecoys'].some(k=>cert.selectedCounts[k]!==0))fail('MAGNETS_CERTIFICATE_FORMAT','Complete continuous source and strict hard/held obligations required');
 checked.add(cert);
}
const inside=(p,poly)=>{let positive=false,negative=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],c=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);positive||=c>0;negative||=c<0;}return !(positive&&negative);};
function render({renderer,env,trajectory}){
 A.validateFinal(env.plan);checkDependency(trajectory.dependency,env.cut);const scale=env.scale??1;if(!Number.isFinite(scale)||scale<.5||scale>2||!Number.isInteger(env.plan.W*scale)||!Number.isInteger(env.plan.H*scale))fail('MAGNETS_RENDER_SCALE','Uniform scale.5..2 and integral output stage required');
 const cert=trajectory.certificate;if(!cert)fail('MAGNETS_COMPOSITION_EXCLUDED','No proved native composition; no unsafe native fallback');firstUse(cert,env.plan,env.cut);if(signature(env.plan,env.cut)!==cert.signature)fail('MAGNETS_STALE_SOURCE','Source inputs changed after proof');
 const segment=trajectory.units?.[0]?.segments?.[0];if(trajectory.units.length!==1||trajectory.units[0].segments.length!==1||segment.status!=='safe'||segment.decision!=='certified'||segment.start!==cert.region.start||segment.end!==cert.region.end||!same(segment.circle,cert.region.circle)||!same(segment.from,[0,0])||!same(segment.to,[0,0])||segment.qualityPolicy!==cert.qualityPolicy||trajectory.safety!=='certified-bounded-adapter')fail('MAGNETS_SEGMENT','Exact owned two-group proof/region/status required');
 const pass=cert.domain.passes.find(p=>p.pass===env.pass),tq=Math.floor(env.realTime/cert.domain.step+1e-6)*cert.domain.step,tp=pass?Math.max(0,tq-pass.lag):NaN;
 if(!pass||env.t!==tp||env.lt!==tp-env.cut.start||env.ltb!==env.lt+pass.lag||!J.lyricCutsAt(env.plan,tp).some(c=>c.index===env.cut.index)||env.realTime<segment.start||env.realTime>=segment.end)fail('MAGNETS_SOURCE_CLOCK','Original selected quantized pass/own clock within whole region required');
 const root=(()=>{const m=env.ctx.getTransform();return [m.a,m.b,m.c,m.d,m.e,m.f];})(),motion=env.cut.motionScale??1,cam=J.CAMERA.push.get(env,env.cut.camP||{}),cs=J.lerp(1,cam.s??1,motion)*(env.cut.contentScale??1),dx=pass.off[0]*cert.domain.chroma*env.H/1080*motion,dy=pass.off[1]*cert.domain.chroma*env.H/1080*motion,expected=[scale*cs,0,0,scale*cs,scale*(env.W/2+dx-cs*env.W/2),scale*(env.H/2+dy-cs*env.H/2)];
 if(root[1]!==0||root[2]!==0||root[0]<=0||root[3]<=0||root.some((v,i)=>!Number.isFinite(v)||Math.abs(v-expected[i])/scale>(i<4?1e-6*Math.max(1,cs):cert.domain.rootGuard)))fail('MAGNETS_ACTUAL_ROOT','Unchanged bounded native uniform camera root required');
 const program=A.record(renderer,env),g=program.nativeDGeometry;if(!program.measurementSupported||g?.kind!=='magnets-native-catalog'||g.seed!==cert.sourceCatalog.seed||g.base!==cert.sourceCatalog.base||g.glyphs.length!==4||g.clock.lt!==env.lt||g.clock.ltb!==env.ltb||g.clock.pOut!==env.pOut)fail('MAGNETS_NATIVE_CATALOG','Complete unchanged native source/clock required');
 const offsets={},actual=[],decor=[];
 for(const e of program.events){
  if(e.role==='primary'){
   const m=/^magnets\.glyph\.([0-3])\.(depth|body)$/.exec(e.owner);if(!m||e.kind!=='item'||e.clips.length||!e.nativeTransform||e.nativeTransform.ops.length||!same(e.nativeTransform.root,root))fail('MAGNETS_PRIMARY_OWNER','Original exact native glyph body/depth owner/root required');
   const q=+m[1],matches=cert.ledger.filter(s=>s.owner===e.owner&&s.pass===env.pass&&s.sourceRange[0]<=env.lt&&env.lt<=s.sourceRange[1]);if(matches.length!==1)fail('MAGNETS_SOURCE_CELL','Exactly one original owner/pass/own-clock support required');const support=matches[0],polygons=e.polygons.map(poly=>poly.map(p=>[p[0]/scale,p[1]/scale]));
   if(!polygons.every(poly=>poly.every(p=>inside(p,support.polygon))))fail('MAGNETS_ACTUAL_ENVELOPE','Actual native primary escaped continuous source support');
   const delta=q<2?cert.recipe.left:cert.recipe.right;if(Math.abs(delta[0])>cert.domain.replayRootBudget.maxDeltaX||Math.abs(delta[1])>cert.domain.replayRootBudget.maxDeltaY||[e.args[0].x,e.args[0].y,e.args[0].size].some(v=>!Number.isFinite(v)||Math.abs(v)>cert.domain.coordinateCeiling))fail('MAGNETS_REPLAY_ROOT_BUDGET','Bounded original item and constant stage translation required');offsets[e.key??e.owner]=delta.slice();const moved=polygons.map(poly=>poly.map(p=>[p[0]+delta[0],p[1]+delta[1]])),clear=!moved.length||A.clear(moved,segment.circle,Math.max(2,.005*Math.min(env.W,env.H))),stage=moved.every(poly=>poly.every(p=>p[0]>=0&&p[0]<=env.W&&p[1]>=0&&p[1]<=env.H));
   if(!clear||!stage)fail('MAGNETS_ACTUAL_SAFETY','Actual translated native primary violated strict all-phase circle/stage');
   const f=g.glyphs[q].f;if((f<1)!==support.entry)fail('MAGNETS_SOURCE_PHASE','Source geometric f<1 phase must match complete support cell');
   actual.push({owner:e.owner,q,part:m[2],entry:support.entry,sourceF:f,sourceRange:support.sourceRange,delta:delta.slice(),polygons,movedPolygons:moved,circleClear:clear,stageContained:stage,continuousBoardCertified:true,heldOrnamentCertified:!support.entry,movingEntryOrnamentDiagnostic:support.entry});
  }else{
   if(e.role!=='independentDecor'||!g.independentDecorOwners.includes(e.owner))fail('MAGNETS_UNKNOWN_DECOR','Original independent scene/decoy owner required');decor.push({owner:e.owner,kind:e.kind,offset:[0,0],order:e.order,alpha:e.alpha});
  }
 }
 // Native replay15 applies stage translation before exact native root; the
 // literal gradient and every independent scene event retain zero offsets.
 A.replay(env,program,offsets);env.placementObservation?.({cut:env.cut.index,realTime:env.realTime,motionTime:env.t,lt:env.lt,ltb:env.ltb,pass:env.pass,renderScale:scale,safety:'safe',qualityPolicy:cert.qualityPolicy,allPhaseCircleStrict:true,movingEntryOrnamentQualityPending:true,allPhaseOrnamentClear:cert.allPhaseOrnamentClear,recipe:cert.recipe,actual,decor,nativeGeometry:g,actualRoot:root,events:program.events.map(e=>({kind:e.kind,owner:e.owner,role:e.role,order:e.order,alpha:e.alpha,args:e.args,matrix:e.matrix,nativeTransform:e.nativeTransform,polygons:e.polygons}))});
}
A.registerLayoutsDAdapter('magnets',{id:REV,finalize,render});
})();
