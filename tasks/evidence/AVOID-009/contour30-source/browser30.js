(async function contourFidelity27(options){
'use strict';
const{plan,factorySource,oracleSource,observerSource}=options;
const need=(v,c,d)=>{if(!v)throw Object.assign(Error(c),{code:c,details:d});},P=J.placement.tilesProof48,B=J.placement.bulbsProof69,same=B.same,cp=x=>structuredClone(x);
need(plan.W===960&&plan.H===540&&plan.lang==='ja'&&J.lang==='ja'&&plan.cuts.length===1,'C27_PLAN');
const cut=plan.cuts[0];need(cut.layout==='contour'&&cut.text==='風の先へ'&&cut.seed===1205&&cut.start===0&&cut.dur===4&&cut.inDur===.35&&cut.outDur===.4&&cut.opacity===100&&cut.blend==='normal','C27_CUT');
need(!cut.fullStagePlacement&&!cut.placementUnits&&!cut.drawing&&!cut.effectsOnly&&!cut.area&&!cut.effectFx&&!cut.effectStyle&&!cut.fonts&&!cut.mask&&!cut.trans&&!cut.group&&!cut.groupExit&&!(cut.decor||[]).length&&!(cut.effectEvents||[]).length&&!(cut.customEffects||[]).length,'C27_EXTRA_CUT');
need(!plan.media&&!plan.foreground&&!plan.energy&&!plan.ghostPreRoll&&!(plan.events||[]).length&&!(plan.beats||[]).length&&!(plan.customEffects||[]).length&&J.lum(cut.palette.bg)<=.55&&plan.style.glow===0&&plan.fx.texture===0,'C27_EXTRA_FRAME');
need(J.placement.layoutsDSourceKnown('contour'),'C27_SOURCE');
need(document.fonts.status==='loaded'&&[...document.fonts].every(f=>f.status==='loaded')&&[...document.fonts].some(f=>f.family.replace(/["']/g,'').trim()===J.FONTS.dela.family.replace(/["']/g,'').trim()&&String(f.weight)===String(J.FONTS.dela.weight)&&f.status==='loaded'),'C27_EXACT_FONT');
const candidate=(0,eval)(factorySource)(J),oracle=(0,eval)(oracleSource),spy=(0,eval)(observerSource)(),identity=candidate.render,live=J.LAYOUTS.contour.render,renderer=Object.create(J.Renderer.prototype);
function render(fn,own,t,spec){const cv=document.createElement('canvas');cv.width=960;cv.height=540;const ctx=cv.getContext('2d');B.pristine(ctx);const initial=P.contextState(ctx);ctx.fillStyle=cut.palette.bg;ctx.fillRect(0,0,960,540);const env=P.makeEnv(renderer,plan,cut,ctx,own,t),root=B.matrix(ctx),calls=[];let owner='contour.hero';
const main=J.mainDraw,draw=env.draw,line=env.line,invoke=(name,role,args,f)=>{const old=owner;owner=role;calls.push({name,args:cp(args),clock:{t:env.t,realTime:env.realTime,lt:env.lt,ltb:env.ltb,pIn:env.pIn,pOut:env.pOut,step:env.step},seed:cut.seed,params:cp(cut.params)});try{return f();}finally{owner=old;}};
J.mainDraw=(e,it)=>invoke('mainDraw','contour.body',[it],()=>main(e,it));env.draw=it=>invoke('draw','contour.metadata',[it],()=>draw(it));env.line=(...args)=>invoke('line','contour.line',args,()=>line(...args));
let o=null,result,failure=null;const failed=e=>({code:e.code||e.name,message:e.message,details:e.details??null,stack:e.stack});try{o=spy(ctx,()=>({pass:env.pass,drawOwnership:{owner,role:'primary'}}),false);result=spec?candidate.withRecipe(env,spec,()=>fn(env)):fn(env);}catch(e){failure=failed(e);}finally{if(o)o.restore();J.mainDraw=main;env.draw=draw;env.line=line;}
const records=o?o.records:[];try{need(J.mainDraw===main&&same(root,B.matrix(ctx)),'C27_RESTORE');
for(const p of records){need(p.role==='primary'&&p.owner.startsWith('contour.'),'C27_PRIMARY');if(p.kind.endsWith('Text'))need(document.fonts.check(p.state.font,String(p.args[0]))&&Object.values(p.metrics).every(Number.isFinite),'C27_METRICS');}}catch(e){if(!failure)failure=failed(e);}
return{failure,initial,root,calls,records,result};}
const binding={cut:cp(cut),fonts:cp(J.FONTS),revision:J.metrics.revision},support=(0,eval)(options.supportSource)(J),specification=options.specification,clock=P.clock(plan,cut),emit=r=>window.contour30StoreRow(r),native=new Map(),nativeAll=[];
const error=e=>({code:e.code||e.name,message:e.message,details:e.details??null,stack:e.stack});
const circles=specification.circles.map(c=>({id:c.id,cx:c.normalized[0]*960,cy:c.normalized[1]*540,r:c.normalized[2]*540,margin:Math.max(2,.005*540)}));
need(clock.states.length===250&&clock.actualCounts.selectedPasses===727,'C30_CLOCK_COUNTS');
const zero={heroScale:1,heroDelta:[0,0],bodyDelta:[0,0]};
function augment(r){let supports=[],supportFailure=null;try{need(!r.failure,'C30_RENDER_FAILURE',r.failure);supports=support.supports(r.records);}catch(e){supportFailure=error(e);}return{...r,supports,supportFailure};}
function sameSource(r,n,spec){need(!r.failure&&!r.supportFailure,'C30_RENDER_SUPPORT',r);const body=r.calls[0],ref=n.calls[0];need(body?.name==='mainDraw'&&ref?.name==='mainDraw'&&body.args[0].text==='風の先へ'&&body.args[0].size===ref.args[0].size,'C30_NATIVE_BODY');need(r.calls.length===n.calls.length,'C30_METADATA_OWNERSHIP');for(let i=0;i<r.calls.length;i++){need(r.calls[i].name===n.calls[i].name&&same(r.calls[i].clock,n.calls[i].clock)&&same(r.calls[i].params,n.calls[i].params),'C30_SOURCE_CLOCK');if(r.calls[i].name==='draw')need(r.calls[i].args[0].text==='風  ─  No.01','C30_FULL_NO');}need(spec.heroScale>=.5&&candidate.render===identity&&J.LAYOUTS.contour.render===live,'C30_RECIPE_IDENTITY');}
const cacheKey=(n,p)=>n+':'+p;
try{
 await emit({phase:'clock',clock,circles,specification,input:{cut:cp(cut),fonts:cp(J.FONTS)},accepted29Reuse:options.accepted29Reuse});
 for(const state of clock.states)for(const own of state.passes.filter(p=>p.active)){
  const r=augment(render(live,own,state.firstTime));await emit({phase:'native',n:state.n,own,realTime:state.firstTime,render:r});
  need(!r.failure&&!r.supportFailure,'C30_NATIVE_SUPPORT',r);native.set(cacheKey(state.n,own.pass),r);nativeAll.push(...r.supports);
 }
 const summaries=[];const unresolved=new Set(circles.map(c=>c.id));let attempted=0;
 for(const recipe of specification.recipeOrder){if(!unresolved.size)break;
  const base={heroScale:recipe.heroScale,heroDelta:recipe.heroDelta,bodyDelta:recipe.bodyDelta};let seeds=[];
  if(recipe.id==='native-joint')seeds=nativeAll;
  else{const state=clock.states.find(s=>s.n===72);for(const own of state.passes.filter(p=>p.active)){const r=augment(render(identity,own,state.firstTime,base));await emit({phase:'seed',recipe:recipe.id,n:state.n,own,render:r});sameSource(r,native.get(cacheKey(state.n,own.pass)),base);seeds.push(...r.supports);}}
  for(const circle of circles.filter(c=>unresolved.has(c.id))){const positions=[[0,0]],seen=new Set(['0,0']);for(const p of J.placement.bulbsGeometry68.positions(seeds,circle,{evaluate:false})){const key=p.delta.join(',');if(!seen.has(key)&&positions.length<8){seen.add(key);positions.push(p.delta);}}
   await emit({phase:'family',recipe,circle,positions,seedOnly:true});
   for(let pi=0;pi<positions.length;pi++){const delta=positions[pi],spec={heroScale:base.heroScale,heroDelta:base.heroDelta.map((v,i)=>v+delta[i]),bodyDelta:base.bodyDelta.map((v,i)=>v+delta[i])},id=circle.id+'/'+recipe.id+'/'+pi,acceptedRows=[];let rejected=null;attempted++;need(attempted<=176,'C30_ATTEMPT_LIMIT');
    for(const state of clock.states){for(const own of state.passes.filter(p=>p.active)){
     const key=cacheKey(state.n,own.pass),n=native.get(key),r=recipe.id==='native-joint'&&pi===0?n:augment(render(identity,own,state.firstTime,spec));
     let check=null;try{sameSource(r,n,spec);check=support.evaluate(r.supports,circle);}catch(e){await emit({phase:'attempt-error',id,n:state.n,own,spec,circle,render:r,error:error(e)});throw e;}
     const quality=support.quality(r.supports,r.calls,spec);await emit({phase:'attempt',id,n:state.n,own,spec,circle,nativeRef:recipe.id==='native-joint'&&pi===0?key:null,render:recipe.id==='native-joint'&&pi===0?null:r,check,quality});
     acceptedRows.push({n:state.n,own,render:r});if(!check.passed){rejected={n:state.n,pass:own.pass,failures:check.failures};break;}
    }if(rejected)break;}
    await emit({phase:'attempt-summary',id,spec,circle,rejected,checkedPasses:acceptedRows.length,passed:rejected===null,qualityDiagnosticOnly:true});
    if(rejected)continue;
    need(acceptedRows.length===727,'C30_COMPLETE_WINNER');const ofn=oracle(J,spec);
    for(const entry of acceptedRows){const {n,own,render:expected}=entry,state=clock.states.find(s=>s.n===n),actual=augment(render(ofn,own,state.firstTime));const fields=['records','calls','result','root','supports'];const comparisons=Object.fromEntries(fields.map(k=>[k,same(expected[k],actual[k])]));await emit({phase:'winner-oracle',id,n,own,spec,render:actual,comparisons});need(!actual.failure&&!actual.supportFailure&&Object.values(comparisons).every(Boolean),'C30_WINNER_SOURCE_ORACLE',comparisons);}
    const summary={circle:circle.id,id,spec,passes:727,states:250,oraclePasses:727,qualityDiagnosticOnly:true};summaries.push(summary);unresolved.delete(circle.id);await emit({phase:'winner',...summary});break;
   }
  }
 }
 need(same(cut,binding.cut)&&same(J.FONTS,binding.fonts)&&J.metrics.revision===binding.revision&&document.fonts.status==='loaded'&&[...document.fonts].every(f=>f.status==='loaded'),'C30_INPUT_FONT_IDENTITY');
 const result={status:'complete-bounded-geometry-study',winners:summaries,unresolved:[...unresolved],attempted,clockStates:250,activePasses:727,geometryCertified:false,conditionalCapturedSupportOnly:true,adapterRegistered:false,pixelReads:0,fullCombinedFramePostFX:false};await emit({phase:'study-summary',...result});return result;
}catch(e){const result={status:'failed-bounded-geometry-study',error:error(e),geometryCertified:false,adapterRegistered:false};await emit({phase:'study-failure',...result});return result;}
})
