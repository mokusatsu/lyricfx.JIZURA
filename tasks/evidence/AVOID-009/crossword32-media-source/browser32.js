/* SOURCE_PENDING. Definition only. Caller must obtain parent review before invoking.
   No URL, fetch, network, registry replacement, product install or frame loop. */
(function createMedia32(input) {
'use strict';
const {J,renderer,plan,project,sources}=input;
const A=J.placement,P=A.bulbsProof69,T=A.tilesProof48,need=(v,c,d)=>{if(!v)throw Object.assign(Error(c),{code:c,details:d});},clone=P.clone,same=P.same;
need(P&&T&&typeof renderer?.makeEnv==='function','CROSSWORD28_DEPENDENCY');
const cut=plan.cuts[0],nativeRegistered=J.LAYOUTS.crossword.render;
function eligibility(){
 if(project?.lyricEffects?.autoPlacement!==true||plan.lyricAvoidanceIndex?.enabled!==true)return{status:'preserved',code:'CROSSWORD28_DISABLED'};
 if(cut.emphasis)return{status:'preserved',code:'CROSSWORD28_EMPHASIS'};
 if(cut.area||cut.placementLocked||['manual','notation'].includes(cut.areaMode)||cut.lyricSize!=null||cut.contentScale!==1||Object.values(project.overrides||{}).some(o=>o.lock||o.lockedAreas||o.lockedEffects)||Object.keys(project.lyricCutOptions||{}).length)return{status:'unsupported',code:'CROSSWORD28_MANUAL_LOCK_SIZE'};
 need(plan.cuts.length===1&&plan.W===960&&plan.H===540&&plan.fps===60&&plan.lang==='ja'&&J.lang==='ja','CROSSWORD28_STAGE_LANGUAGE');
 need(cut.layout==='crossword'&&cut.text==='風の先へ'&&cut.seed===1205&&same(cut.params,{font:'dela',dens:.18,fill:2,clue:true}),'CROSSWORD28_FAMILY');
 need(cut.start===0&&cut.end===4&&cut.dur===4&&(cut.renderStart??0)===0&&(cut.displayEnd??4)===4&&cut.inDur===.35&&cut.outDur===.4&&cut.enter==='cut'&&cut.exit==='cut'&&cut.hold==='still'&&cut.treat==='none'&&cut.cam==='push'&&same(cut.camP,{a:.022,dir:1})&&cut.motionScale===1&&cut.stagger===0.03950859557604417&&plan.fx.motion===.65,'CROSSWORD28_NATIVE_OPERATIONS');
 need(cut.lineText==='風の先へ'&&!cut.note&&!cut.decor?.length&&!cut.drawing&&!cut.mask&&!cut.effectsOnly&&!cut.effectFx&&!cut.effectStyle&&!cut.group&&!cut.groupExit&&!cut.fonts&&!plan.events?.length&&!plan.beats?.length&&!plan.media&&!plan.foreground&&!plan.energy&&!plan.ghostPreRoll,'CROSSWORD28_EXTRA_INPUT');
 need(plan.duration===4.150001&&J.stepDur(plan.fx,60)===1/60&&J.komaOf(plan.fx)===0&&plan.fx.chroma===.25&&plan.style.ghost===.6&&plan.style.glow===0&&document.fonts.status==='loaded','CROSSWORD28_CLOCK_FONTS');
 return{status:'eligible',code:'SOURCE_PENDING_ONLY',safe:false};
}
const admissibility=eligibility();need(admissibility.status==='eligible','CROSSWORD28_NOT_ELIGIBLE',admissibility);
const projectKey=JSON.stringify(project),planKey=JSON.stringify(plan),refs=[nativeRegistered,J.mainDraw,J.drawItem,J.drawFx,J.layoutText,J.fontCSS,J.measure,J.clamp,J.h,J.r,J.isPunct,J.isSmallKana,J.isLatin,J.romaji,J.metrics.adv,J.Renderer.prototype.makeEnv,J.CAMERA.push.get,P,T,P.shift,P.pristine,P.clone,P.same],fontKey=JSON.stringify(J.FONTS),fontRevision=J.metrics.revision,faces=JSON.stringify([...document.fonts].map(f=>[f.family,f.style,f.weight,f.status]));
function stable(){need(JSON.stringify(project)===projectKey&&JSON.stringify(plan)===planKey&&JSON.stringify(J.FONTS)===fontKey&&J.metrics.revision===fontRevision&&JSON.stringify([...document.fonts].map(f=>[f.family,f.style,f.weight,f.status]))===faces,'CROSSWORD28_SOURCE_FONT_DRIFT');need(refs.every((f,i)=>f===[J.LAYOUTS.crossword.render,J.mainDraw,J.drawItem,J.drawFx,J.layoutText,J.fontCSS,J.measure,J.clamp,J.h,J.r,J.isPunct,J.isSmallKana,J.isLatin,J.romaji,J.metrics.adv,J.Renderer.prototype.makeEnv,J.CAMERA.push.get,A.bulbsProof69,A.tilesProof48,P.shift,P.pristine,P.clone,P.same][i]),'CROSSWORD28_HELPER_DRIFT');}
const fontProbe=document.createElement('canvas').getContext('2d');P.pristine(fontProbe);
const compile=(text,facade)=>Function('return ('+text+'\n)')()(facade),spy=compile(sources.observer,J);
const rgba64=bytes=>{let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return{encoding:'literal-RGBA-unorm8-base64',bytes:bytes.length,data:btoa(binary)};};
const winner=input.winner,policy=input.policy,clocks=T.clock(plan,cut),shape=winner.shape;
need(winner.id==='58A-default-left-bottom'&&shape.id==='58A'&&shape.scale===.58&&shape.profile==='A'&&same(winner.delta,[-291.6562058007809,141.39171833166608])&&same(winner.circle,{id:'default',cx:480,cy:226.8,effectiveRadius:110.7}),'MEDIA32_FIXED_WINNER');
need(clocks.actualCounts.states===250&&clocks.actualCounts.selectedPasses===727,'MEDIA32_COMPLETE_CLOCK');
const privateSource=compile(sources.private,J),oracle=compile(sources.oracles[shape.id],J),candidateQuality=Function('A','nativeCell','need','return ('+sources.qualityCandidate+'\n)')(A,68.26666666666667,need),nativeQuality=Function('A','nativeCell','nativeNumber','return ('+sources.qualityNative+'\n)')(A,68.26666666666667,68.26666666666667*.2),supportOf=Function('T','need','return ('+sources.support+'\n)')(T,need),geometryOf=Function('P','return ('+sources.geometry+'\n)')(P),recipe={scale:.58,below:true,profile:'A'},mediaRefs=[renderer.frame,renderer.drawCut,T.support,T.clock,P.shift,P.kernel],policyKey=JSON.stringify(policy);
function guard32(){stable();need(JSON.stringify(policy)===policyKey&&mediaRefs.every((f,i)=>f===[renderer.frame,renderer.drawCut,T.support,T.clock,P.shift,P.kernel][i]),'MEDIA32_HELPER_DRIFT');}
async function pixelsSHA32(pixels){return window.crossword32Hash(rgba64(pixels));}
async function frame32({j,variant,png=false}){
 guard32();need(Number.isInteger(j)&&j>=0&&j<250&&['native','destination','oracle'].includes(variant),'MEDIA32_FRAME_DOMAIN');const state=clocks.states[j],time=j/60,pre=clocks.preimages.find(p=>p.n===j&&p.reachable);need(pre&&pre.firstTime<=time&&time<=pre.lastTime&&Math.floor(time/clocks.h+1e-6)===j,'MEDIA32_EXACT_J_PREIMAGE');
 const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const ctx=canvas.getContext('2d');P.pristine(ctx);const context=T.contextState(ctx),rows=[],expected=state.passes.filter(p=>p.active),drawOwn=Object.getOwnPropertyDescriptor(renderer,'drawCut'),drawStock=renderer.drawCut,mainOwn=Object.getOwnPropertyDescriptor(J,'mainDraw'),mainStock=J.mainDraw,renderStock=J.LAYOUTS.crossword.render;let active=null,frameError=null;
 renderer.drawCut=function(env){
  need(env.ctx===ctx&&env.cut===cut,'MEDIA32_ACTUAL_DRAW_ENV');const own=expected[rows.length];need(own,'MEDIA32_EXTRA_PASS');const actualClock={pass:env.pass,t:env.t,realTime:env.realTime,lt:env.lt,ltb:env.ltb,pIn:env.pIn,pOut:env.pOut,step:env.step};need(actualClock.pass===own.pass&&Object.is(actualClock.t,own.tp)&&Object.is(actualClock.lt,own.lt)&&Object.is(actualClock.ltb,own.ltb)&&actualClock.step===own.step&&Object.is(actualClock.realTime,time),'MEDIA32_ACTUAL_OWN_CLOCK');
  const scope={own,clock:actualClock,passRoot:P.matrix(ctx),root:null,rootRestored:false,calls:[],counts:{rect:0,line:0,draw:0,main:0},sourceCalls:0,paintError:null,fontChecks:[],records:[]},saved=[],placement=Object.getOwnPropertyDescriptor(env,'placementRecording');active={env,scope};
  for(const key of['rect','line','draw']){const f=env[key];saved.push([key,f]);env[key]=(...args)=>{const ordinal=scope.counts[key]++,item=key==='draw'?args[0]:null,sub=key==='draw'?(item.track===.08?'clue':/^\d+$/.test(item.text)?'number':'pencil'):key,owner='crossword28.'+sub+'.'+ordinal;scope.calls.push({kind:key,sub,owner,args:clone(args),matrix:P.matrix(ctx)});return env.withDrawRole('primary',owner,()=>f(...args));};}
  const observation=spy(ctx,()=>env,false);
  J.LAYOUTS.crossword.render=function(e){need(e===env,'MEDIA32_SOURCE_ENV');scope.sourceCalls++;scope.root=P.matrix(ctx);try{return env.withDrawRole('primary','crossword28.native',()=>P.shift(env,variant==='native'?[0,0]:winner.delta,()=>variant==='native'?renderStock(env):variant==='oracle'?oracle(env):privateSource.withRecipe(env,recipe,()=>privateSource.render(env))));}finally{scope.rootRestored=same(scope.root,P.matrix(ctx));}};
  env.placementRecording=true;
  try{return Reflect.apply(drawStock,this,[env]);}catch(e){scope.paintError={name:e.name,message:e.message,stack:e.stack};throw e;}
  finally{
   J.LAYOUTS.crossword.render=renderStock;observation.restore();scope.records=observation.records;scope.allPrimary=scope.records.every(r=>r.role==='primary'&&r.owner?.startsWith('crossword28.'));for(const[k,f]of saved)env[k]=f;if(placement)Object.defineProperty(env,'placementRecording',placement);else delete env.placementRecording;active=null;
   for(const p of scope.records.filter(p=>p.kind.endsWith('Text'))){const call=scope.calls.find(c=>c.owner===p.owner),it=call?.kind==='main'?call.item:call?.kind==='draw'?call.args[0]:null;if(!it){scope.fontChecks.push({owner:p.owner,passed:false,reason:'unbound-source-text'});continue;}const requestedCSS=J.FONTS[it.font]?.composite?J.fontCSS(it.font,it.size,String(p.args[0])):J.fontCSS(it.font,it.size);fontProbe.font=requestedCSS;scope.fontChecks.push({owner:p.owner,font:it.font,size:it.size,requestedCSS,acceptedCSS:fontProbe.font,actualCSS:p.state.font,passed:fontProbe.font===p.state.font});}
   const mode=variant==='native'?{native:true,delta:[0,0]}:{id:shape.id,recipe,delta:winner.delta};scope.quality=scope.root?(variant==='native'?nativeQuality(scope,mode):candidateQuality(scope,mode)):null;scope.support=supportOf(scope);scope.geometry=variant==='native'||scope.support.error?null:geometryOf(scope.support.rows,winner.circle);rows.push(scope);
  }
 };
 J.mainDraw=function(env,it){if(active?.env===env){const s=active.scope,owner='crossword28.main.'+s.counts.main++;s.calls.push({kind:'main',owner,item:clone(it),matrix:P.matrix(ctx)});return env.withDrawRole('primary',owner,()=>Reflect.apply(mainStock,this,[env,it]));}return Reflect.apply(mainStock,this,[env,it]);};
 try{renderer.frame(ctx,plan,time,{noHud:true,noPost:true,noForeground:true,noMedia:true,fast:true,avoidanceRealTime:time});}catch(e){frameError={name:e.name,message:e.message,stack:e.stack};}
 finally{J.LAYOUTS.crossword.render=renderStock;if(drawOwn)Object.defineProperty(renderer,'drawCut',drawOwn);else delete renderer.drawCut;if(mainOwn)Object.defineProperty(J,'mainDraw',mainOwn);else delete J.mainDraw;}
 const pixels=ctx.getImageData(0,0,960,540).data,rgba={bytes:pixels.length,sha256:await pixelsSHA32(pixels)},image=png?canvas.toDataURL('image/png'):null;canvas.width=1;guard32();
 const healthy=!frameError&&rows.length===expected.length&&rows.every(s=>!s.paintError&&s.sourceCalls===1&&s.rootRestored&&s.allPrimary&&s.fontChecks.every(f=>f.passed)&&!s.support.error),qualityPassed=variant==='native'?null:rows.every(s=>s.quality?.passed),geometryPassed=variant==='native'?null:rows.every(s=>s.geometry?.passed);
 return{detail:{kind:'media-frame',j,time,variant,delta:variant==='native'?[0,0]:winner.delta,context,expectedPasses:expected,passes:rows,frameError,healthy,qualityPassed,geometryPassed,rgba,conditionalFoundation:true,adapterRegistered:false},pixels,png:image};
}
async function qualify32(j,emit){
 const a=await frame32({j,variant:'native'}),d=await frame32({j,variant:'destination'}),o=await frame32({j,variant:'oracle'}),rgbaEqual=d.pixels.length===o.pixels.length&&d.pixels.every((x,i)=>x===o.pixels[i]),projection=x=>{const{variant,...rest}=x;return rest;},allNumericEqual=same(projection(d.detail),projection(o.detail));
 for(const f of[a,d,o])await emit(f.detail);const result={kind:'media-qualified',j,time:j/60,nativeSHA256:a.detail.rgba.sha256,destinationSHA256:d.detail.rgba.sha256,oracleSHA256:o.detail.rgba.sha256,fullRGBABytesCompared:2073600,rgbaEqual,allNumericEqual,healthy:[a,d,o].every(f=>f.detail.healthy),candidateQualityPassed:d.detail.qualityPassed&&o.detail.qualityPassed,strictCircleStagePassed:d.detail.geometryPassed&&o.detail.geometryPassed};await emit(result);
 need(result.healthy&&rgbaEqual&&allNumericEqual&&result.candidateQualityPassed&&result.strictCircleStagePassed,'MEDIA32_QUALIFICATION_FAILED',result);return result;
}
async function encode32({j,side,expectedSHA256,emit}){const f=await frame32({j,variant:side==='before'?'native':'destination',png:true});if(!f.detail.healthy||side==='after'&&(!f.detail.qualityPassed||!f.detail.geometryPassed)||f.detail.rgba.sha256!==expectedSHA256){await emit({...f.detail,kind:'media-encode-failure'});need(false,'MEDIA32_ENCODE_RGBA_OR_SUPPORT_FAILED');}return{j,time:j/60,SHA256:f.detail.rgba.sha256,png:f.png};}
return Object.freeze({qualify:qualify32,encode:encode32,clocks,admissibility,winner,scope:'single accepted fixed winner; exact-j media pending'});
})
