/* SOURCE_PENDING. Definition only. Caller must obtain parent review before invoking.
   No URL, fetch, network, registry replacement, product install or frame loop. */
(function createCrossword30(input) {
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
 need(cut.start===0&&cut.end===4&&cut.dur===4&&(cut.renderStart??0)===0&&(cut.displayEnd??4)===4&&cut.inDur===.35&&cut.outDur===.4&&cut.enter==='cut'&&cut.exit==='cut'&&cut.hold==='still'&&cut.treat==='none'&&cut.cam==='push'&&same(cut.camP,{a:.022,dir:1})&&cut.motionScale===1&&cut.stagger===.04&&plan.fx.motion===.65,'CROSSWORD28_NATIVE_OPERATIONS');
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
const policy=input.policy;
function makeCanvas(){const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const ctx=canvas.getContext('2d');T.contextState(ctx);P.pristine(ctx);return ctx;}
function paintProjection(rows){return rows.map(({owner,role,...row})=>row);}
function draw(ctx,own,realTime,mode,useOracle=false,registered=false){
 P.pristine(ctx);const initial=T.contextState(ctx),env=T.makeEnv(renderer,plan,cut,ctx,own,realTime),root=P.matrix(ctx),calls=[],counts={rect:0,line:0,draw:0,main:0};let factory;
 const facade=Object.create(J);facade.mainDraw=(e,it)=>{const owner='crossword28.main.'+(counts.main++);calls.push({kind:'main',owner,item:clone(it),matrix:P.matrix(e.ctx)});return e.withDrawRole('primary',owner,()=>J.mainDraw(e,it));};
 const native=compile(sources.native,facade),privateSource=compile(sources.private,facade),oracle=compile(sources.oracles[mode.id],facade);
 for(const key of['rect','line','draw']){const original=env[key];env[key]=(...args)=>{const ordinal=counts[key]++,item=key==='draw'?args[0]:null,sub=key==='draw'?(item.track===.08?'clue':/^\d+$/.test(item.text)?'number':'pencil'):key,owner='crossword28.'+sub+'.'+ordinal;calls.push({kind:key,sub,owner,args:clone(args),matrix:P.matrix(ctx)});return env.withDrawRole('primary',owner,()=>original(...args));};}
 const observation=spy(ctx,()=>env,false);let result,paintError=null;
 try{result=env.withDrawRole('primary','crossword28.native',()=>P.shift(env,mode.delta,()=>registered?nativeRegistered(env):useOracle?oracle(env):mode.native?native(env):privateSource.withRecipe(env,mode.recipe,()=>privateSource.render(env))));}catch(e){paintError={name:e.name,message:e.message,stack:e.stack};}finally{observation.restore();}
 const rootRestored=same(root,P.matrix(ctx)),allPrimary=observation.records.every(r=>r.role==='primary'&&r.owner?.startsWith('crossword28.'));
 const fontChecks=[];
 for(const p of observation.records.filter(p=>p.kind.endsWith('Text'))){const call=calls.find(c=>c.owner===p.owner),item=call?.kind==='main'?call.item:call?.kind==='draw'?call.args[0]:null;
  if(!item){fontChecks.push({owner:p.owner,unboundRegisteredNative:registered&&p.owner==='crossword28.native',passed:registered&&p.owner==='crossword28.native'});continue;}
  const requestedCSS=J.FONTS[item.font]?.composite?J.fontCSS(item.font,item.size,String(p.args[0])):J.fontCSS(item.font,item.size);fontProbe.font=requestedCSS;const acceptedCSS=fontProbe.font,passed=acceptedCSS===p.state.font; fontChecks.push({owner:p.owner,text:p.args[0],font:item.font,size:item.size,requestedCSS,acceptedCSS,actualCSS:p.state.font,passed});
 }
 const rgba=ctx.getImageData(0,0,960,540).data;ctx.canvas.width=1;
 return{initial,root,rootRestored,allPrimary,paintError,clock:{pass:env.pass,t:env.t,realTime:env.realTime,lt:env.lt,ltb:env.ltb,pIn:env.pIn,pOut:env.pOut,step:env.step},calls,counts,fontChecks,records:observation.records,result:clone(result),rgba};
}
const nativeCell=68.26666666666667,clocks=T.clock(plan,cut);
const refs30=[T.support,P.kernel,P.kernel.F,P.kernel.circleConflict,P.kernel.stageFail,A.inverse],policyKey30=JSON.stringify(policy);function stable30(){stable();need(JSON.stringify(policy)===policyKey30&&refs30.every((f,i)=>f===[T.support,P.kernel,P.kernel.F,P.kernel.circleConflict,P.kernel.stageFail,A.inverse][i]),'CROSSWORD30_SUPPORT_POLICY_DRIFT');}
need(clocks.actualCounts.states===250&&clocks.actualCounts.selectedPasses===727,'CROSSWORD30_CLOCK_COUNTS');
function modeFor(shape,delta=[0,0]){return{id:shape.id,recipe:{scale:shape.scale,below:true,profile:shape.profile},delta};}
function quality30(sample,mode){
 const cell=nativeCell*mode.recipe.scale,fs=16.384,gx=(960-9*cell)/2,gy=(540-5*cell-fs*5)/2,mainY=mode.recipe.profile==='B'?.62:.64,numberY=mode.recipe.profile==='A'?.15:.18,inverse=A.inverse(sample.root),sx=inverse[0]*mode.delta[0]+inverse[2]*mode.delta[1],sy=inverse[1]*mode.delta[0]+inverse[3]*mode.delta[1];
 const point=(m,x,y)=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]],atoms=[];
 for(const p of sample.records.filter(p=>p.kind.endsWith('Text')&&p.state.alpha>0)){
  const m=p.metrics,x=p.args[1],y=p.args[2],points=[[x-m.actualBoundingBoxLeft-1,y-m.actualBoundingBoxAscent-1],[x+m.actualBoundingBoxRight+1,y-m.actualBoundingBoxAscent-1],[x+m.actualBoundingBoxRight+1,y+m.actualBoundingBoxDescent+1],[x-m.actualBoundingBoxLeft-1,y+m.actualBoundingBoxDescent+1]].map(q=>point(inverse,...point(p.matrix,...q)));
  atoms.push({owner:p.owner,text:p.args[0],local:{x0:Math.min(...points.map(p=>p[0])),y0:Math.min(...points.map(p=>p[1])),x1:Math.max(...points.map(p=>p[0])),y1:Math.max(...points.map(p=>p[1]))}});
 }
 const checks=[];let witness=null;
 for(const c of sample.calls.filter(c=>c.kind==='main'||c.sub==='number'||c.sub==='pencil')){
  const it=c.kind==='main'?c.item:c.args[0],kind=c.kind==='main'?'main':c.sub,xFraction=kind==='number'?.07:.5,yFraction=kind==='number'?numberY:kind==='main'?mainY:.56,col=Math.round((it.x-gx)/cell-xFraction),row=Math.round((it.y-gy)/cell-yFraction),box={x0:gx+col*cell+sx,y0:gy+row*cell+sy,x1:gx+(col+1)*cell+sx,y1:gy+(row+1)*cell+sy},owned=atoms.filter(a=>a.owner===c.owner),padding=owned.map(a=>Math.min(a.local.x0-box.x0,a.local.y0-box.y0,box.x1-a.local.x1,box.y1-a.local.y1)),floor=kind==='main'?18.9:kind==='number'?12:0,sizePassed=it.size>=floor,contained=padding.every(x=>x>=0);
  checks.push({owner:c.owner,kind,text:it.text,size:it.size,floor,sizePassed,cell:[row,col],box,padding,contained});
  if(!witness&&(!sizePassed||!contained))witness={criterion:!sizePassed?'size-floor':'cell-containment',owner:c.owner,kind,text:it.text,padding,size:it.size,floor};
 }
 const contacts=[];
 if(!witness)for(const a of atoms.filter(a=>a.owner.includes('.number.'))){for(const b of atoms.filter(b=>b.owner.includes('.main.')||b.owner.includes('.pencil.'))){const x=a.local,y=b.local;if(x.x0<=y.x1&&y.x0<=x.x1&&x.y0<=y.y1&&y.y0<=x.y1){const c={criterion:'number-character-contact',numberOwner:a.owner,numberGlyph:a.text,otherOwner:b.owner,otherText:b.text};contacts.push(c);witness=c;break;}}if(witness)break;}
 return{passed:!witness,witness,checks,atoms,contacts,held:sample.clock.lt>=.35&&sample.clock.pOut===0,foundation:'source29 actual TextMetrics+1fontpx local containment/contact, conditional; no positive gap floor',partialAfterFirstWitness:!!witness};
}
function supports30(sample){const rows=[];let error=null;for(let ordinal=0;ordinal<sample.records.length;ordinal++){
 const p=sample.records[ordinal];if(p.state.alpha<=0)continue;
 try{need(p.role==='primary'&&p.owner?.startsWith('crossword28.'),'CROSSWORD30_SUPPORT_OWNER');const active=p.kind.startsWith('stroke')?'strokeStyle':'fillStyle';need(typeof p.state[active]==='string','CROSSWORD30_ACTIVE_STYLE:'+active);need(p.state.filter==='none'&&!p.state.shadowBlur&&!p.state.shadowOffsetX&&!p.state.shadowOffsetY&&!p.state.dash.length,'CROSSWORD30_SUPPORT_EFFECT');
  let primitive=null;if(p.kind==='stroke'){need(p.path.length===2&&p.path[0].key==='moveTo'&&p.path[1].key==='lineTo','CROSSWORD30_LINE_SCOPE');primitive={kind:'line'};}else need(['fillText','fillRect'].includes(p.kind),'CROSSWORD30_SUPPORT_CHANNEL');
  const support=T.support({...p,ordinal,primitive});rows.push({ordinal,owner:p.owner,kind:p.kind,bounds:support.bounds,foundation:support.foundation});
 }catch(e){error={name:e.name,message:e.message,code:e.code??null,ordinal,owner:p.owner,kind:p.kind,activeStyle:p.kind.startsWith('stroke')?'strokeStyle':'fillStyle',supportsCompleted:rows.length};break;}}
 return{rows,error,foundation:'unmodified tilesProof48.support; all active primary paints, no moving exemptions'};
}
function geometry30(supports,circle,delta=[0,0]){const K=P.kernel;let checked=0;for(const s of supports){checked++;const b=s.bounds,poly=[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]].map(p=>p.map(K.F)),bounds=Object.fromEntries(Object.entries(b).map(([k,v])=>[k,K.F(v)])),stage=K.stageFail(bounds,delta),conflict=K.circleConflict(poly,circle,delta);if(stage||conflict)return{passed:false,checked,total:supports.length,witness:{owner:s.owner,ordinal:s.ordinal,stage,circle:conflict,bounds:b},partial:true};}return{passed:true,checked,total:supports.length,witness:null,partial:false};}
async function tuple30(shape,state,own,delta,phase,emit,circle=null){
 stable30();const mode=modeFor(shape,delta),actual=draw(makeCanvas(),own,state.firstTime,mode),expected=draw(makeCanvas(),own,state.firstTime,mode,true),quality=quality30(actual,mode),support=supports30(actual),healthy=x=>!x.paintError&&x.rootRestored&&x.allPrimary&&x.fontChecks.every(f=>f.passed),checks={healthy:healthy(actual)&&healthy(expected),paint:same(actual.records,expected.records),calls:same(actual.calls,expected.calls),clock:same(actual.clock,expected.clock),RGBA:actual.rgba.every((x,i)=>x===expected.rgba[i])},geometry=circle&&!support.error?geometry30(support.rows,circle):null;
 const row={kind:'tuple',phase,shape,n:state.n,own,time:state.firstTime,delta,circle,actual:{...actual,rgba:rgba64(actual.rgba)},expected:{...expected,rgba:rgba64(expected.rgba)},checks,quality,support,geometry,safetyCertified:false};
 await emit(row);need(Object.values(checks).every(Boolean),'CROSSWORD30_LITERAL_FIDELITY_FAILED',checks);need(!support.error,'CROSSWORD30_UNSUPPORTED_PAINT',support.error);stable30();return{qualityPassed:quality.passed,qualityWitness:quality.witness,supports:support.rows,geometry};
}
async function pilot30({phase,emit}){
 need(['representative','full'].includes(phase)&&typeof emit==='function','CROSSWORD30_PHASE');const results=[],winners=[],finalists=[],screened=[];let tupleCount=0;
 const sink=async row=>{if(row.kind==='tuple')tupleCount++;await emit(row);};
 if(phase==='representative'){
  const shape=policy.shapes.find(s=>s.id==='55C'),state=clocks.states[90];let witness=null,passes=[];
  for(const own of state.passes.filter(p=>p.active)){const r=await tuple30(shape,state,own,[0,0],phase,sink);passes.push(own.pass);if(!r.qualityPassed){witness={n:state.n,pass:own.pass,quality:r.qualityWitness};break;}}
  const result={kind:'pilot-result',phase,tupleCount,representative:{shape,passes,witness},winners:[],complete:true,geometrySafetyCertified:false,rawPersisted:false};await sink(result);return result;
 }
 for(const shape of policy.shapes){const supports=[],visited=[];let witness=null;
  outer:for(const n of policy.sparseN){const state=clocks.states[n];visited.push(n);for(const own of state.passes.filter(p=>p.active)){const r=await tuple30(shape,state,own,[0,0],'shape-screen',sink);supports.push(...r.supports.map(s=>({...s,n,pass:own.pass})));if(!r.qualityPassed){witness={n,pass:own.pass,quality:r.qualityWitness};break outer;}}}
  const result={kind:'shape-result',shape,visited,witness,passedSparseQuality:!witness,notFullClockQualification:true};results.push(result);await sink(result);if(!witness)screened.push({shape,supports});
 }
 const anchors=[];
 for(const {shape,supports}of screened){need(supports.length,'CROSSWORD30_EMPTY_SHAPE_SUPPORT');const b={x0:Math.min(...supports.map(s=>s.bounds.x0)),y0:Math.min(...supports.map(s=>s.bounds.y0)),x1:Math.max(...supports.map(s=>s.bounds.x1)),y1:Math.max(...supports.map(s=>s.bounds.y1))};
  for(const circle of policy.circles)for(const [side,dx]of[['left',2-b.x0],['right',958-b.x1]])for(const [vertical,dy]of[['top',2-b.y0],['center',(540-b.y0-b.y1)/2],['bottom',538-b.y1]]){
   need(anchors.length<108,'CROSSWORD30_ANCHOR_CAP');const delta=[dx,dy],geometry=geometry30(supports,circle,delta),anchor={kind:'anchor-result',id:shape.id+'-'+circle.id+'-'+side+'-'+vertical,shape,circle,delta,geometry,source:'sparse-support bound only; actual destination/allclock not yet evaluated'};anchors.push(anchor);await sink(anchor);
  }
 }
 for(const circle of policy.circles){let tried=0;for(const anchor of anchors.filter(a=>a.circle.id===circle.id&&a.geometry.passed)){
  if(tried>=3||finalists.length>=6)break;tried++;let witness=null,statesVisited=0,passesChecked=0;
  outer:for(const state of clocks.states){statesVisited++;for(const own of state.passes.filter(p=>p.active)){
   const r=await tuple30(anchor.shape,state,own,anchor.delta,'finalist',sink,circle);passesChecked++;
   if(!r.qualityPassed||!r.geometry.passed){witness={n:state.n,pass:own.pass,quality:r.qualityWitness,geometry:r.geometry.witness};break outer;}
  }}
  const result={kind:'finalist-result',id:anchor.id,shape:anchor.shape,circle,delta:anchor.delta,statesVisited,passesChecked,witness,passed:!witness&&statesVisited===250&&passesChecked===727,conditionalFoundation:true};finalists.push(result);await sink(result);if(result.passed){winners.push(result);break;}
 }}
 const result={kind:'pilot-result',phase,tupleCount,screenedShapes:results,anchorsConsidered:anchors.length,finalists,winners,complete:true,notEvaluatedEligibleAnchors:anchors.filter(a=>a.geometry.passed&&!finalists.some(f=>f.id===a.id)).map(a=>a.id),geometrySafetyCertified:false,conditionalFullClockWinners:winners.length,rawPersisted:false,scope:'finite9shape/108anchor/6finalist pilot; not global impossibility or product registration'};await sink(result);return result;
}
return Object.freeze({pilot:pilot30,eligibility,admissibility,policy,scope:'SOURCE30_PENDING_PARENT_RUN_GATE',clock:clocks});
})
