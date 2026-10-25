/* SOURCE_PENDING. Definition only. Caller must obtain parent review before invoking.
   No URL, fetch, network, registry replacement, product install or frame loop. */
(function createCrossword28(input) {
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
 need(cut.start===0&&cut.end===4&&cut.dur===4&&(cut.renderStart??0)===0&&(cut.displayEnd??4)===4&&cut.inDur===.35&&cut.outDur===.4&&cut.enter==='cut'&&cut.exit==='cut'&&cut.hold==='still'&&cut.treat==='none'&&cut.cam==='push'&&same(cut.camP,{a:.022,dir:1})&&cut.motionScale===1,'CROSSWORD28_NATIVE_OPERATIONS');
 need(cut.lineText==='風の先へ'&&!cut.note&&!cut.decor?.length&&!cut.drawing&&!cut.mask&&!cut.effectsOnly&&!cut.effectFx&&!cut.effectStyle&&!cut.group&&!cut.groupExit&&!cut.fonts&&!plan.events?.length&&!plan.beats?.length&&!plan.media&&!plan.foreground&&!plan.energy&&!plan.ghostPreRoll,'CROSSWORD28_EXTRA_INPUT');
 need(plan.duration===4.150001&&J.stepDur(plan.fx,60)===1/60&&J.komaOf(plan.fx)===0&&plan.fx.chroma===.25&&plan.style.ghost===.6&&plan.style.glow===0&&document.fonts.status==='loaded','CROSSWORD28_CLOCK_FONTS');
 return{status:'eligible',code:'SOURCE_PENDING_ONLY',safe:false};
}
const admissibility=eligibility();need(admissibility.status==='eligible','CROSSWORD28_NOT_ELIGIBLE',admissibility);
const projectKey=JSON.stringify(project),planKey=JSON.stringify(plan),refs=[nativeRegistered,J.mainDraw,J.drawItem,J.drawFx,J.layoutText,J.fontCSS,J.measure,J.clamp,J.h,J.r,J.isPunct,J.isSmallKana,J.isLatin,J.romaji,J.metrics.adv,J.Renderer.prototype.makeEnv,J.CAMERA.push.get,P,T,P.shift,P.pristine,P.clone,P.same],fontKey=JSON.stringify(J.FONTS),fontRevision=J.metrics.revision,faces=JSON.stringify([...document.fonts].map(f=>[f.family,f.style,f.weight,f.status]));
function stable(){need(JSON.stringify(project)===projectKey&&JSON.stringify(plan)===planKey&&JSON.stringify(J.FONTS)===fontKey&&J.metrics.revision===fontRevision&&JSON.stringify([...document.fonts].map(f=>[f.family,f.style,f.weight,f.status]))===faces,'CROSSWORD28_SOURCE_FONT_DRIFT');need(refs.every((f,i)=>f===[J.LAYOUTS.crossword.render,J.mainDraw,J.drawItem,J.drawFx,J.layoutText,J.fontCSS,J.measure,J.clamp,J.h,J.r,J.isPunct,J.isSmallKana,J.isLatin,J.romaji,J.metrics.adv,J.Renderer.prototype.makeEnv,J.CAMERA.push.get,A.bulbsProof69,A.tilesProof48,P.shift,P.pristine,P.clone,P.same][i]),'CROSSWORD28_HELPER_DRIFT');}
const fontProbe=document.createElement('canvas').getContext('2d');P.pristine(fontProbe);
const compile=(text,facade)=>Function('return '+text)()(facade),spy=compile(sources.observer,J);
const rgba64=bytes=>{let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return{encoding:'literal-RGBA-unorm8-base64',bytes:bytes.length,data:btoa(binary)};};
const cases=Object.freeze([{id:'off',native:true,delta:[0,0]}, {id:'zero',recipe:{scale:1,below:false},delta:[0,0]}, {id:'move',recipe:{scale:1,below:false},delta:[30,-15]}, {id:'cell60below',recipe:{scale:.6,below:true},delta:[0,0]}]);
function makeCanvas(){const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const ctx=canvas.getContext('2d');T.contextState(ctx);P.pristine(ctx);return ctx;}
function paintProjection(rows){return rows.map(({owner,role,...row})=>row);}
function draw(ctx,own,realTime,mode,useOracle=false,registered=false){
 P.pristine(ctx);const initial=T.contextState(ctx),env=T.makeEnv(renderer,plan,cut,ctx,own,realTime),root=P.matrix(ctx),calls=[],counts={rect:0,line:0,draw:0,main:0};let factory;
 const facade=Object.create(J);facade.mainDraw=(e,it)=>{const owner='crossword28.main.'+(counts.main++);calls.push({kind:'main',owner,item:clone(it),matrix:P.matrix(e.ctx)});return e.withDrawRole('primary',owner,()=>J.mainDraw(e,it));};
 const native=compile(sources.native,facade),privateSource=compile(sources.private,facade),oracle=compile(mode.id==='cell60below'?sources.oracleCell:sources.oracleZero,facade);
 for(const key of['rect','line','draw']){const original=env[key];env[key]=(...args)=>{const ordinal=counts[key]++,item=key==='draw'?args[0]:null,sub=key==='draw'?(item.track===.08?'clue':/^\d+$/.test(item.text)?'number':'pencil'):key,owner='crossword28.'+sub+'.'+ordinal;calls.push({kind:key,sub,owner,args:clone(args),matrix:P.matrix(ctx)});return env.withDrawRole('primary',owner,()=>original(...args));};}
 const observation=spy(ctx,()=>env,false);let result,paintError=null;
 try{result=env.withDrawRole('primary','crossword28.native',()=>P.shift(env,mode.delta,()=>registered?nativeRegistered(env):useOracle?oracle(env):mode.native?native(env):privateSource.withRecipe(env,mode.recipe,()=>privateSource.render(env))));}catch(e){paintError={name:e.name,message:e.message,stack:e.stack};}finally{observation.restore();}
 const rootRestored=same(root,P.matrix(ctx)),allPrimary=observation.records.every(r=>r.role==='primary'&&r.owner?.startsWith('crossword28.'));
 const fontChecks=[];
 for(const p of observation.records.filter(p=>p.kind.endsWith('Text'))){const call=calls.find(c=>c.owner===p.owner),item=call?.kind==='main'?call.item:call?.kind==='draw'?call.args[0]:null;
  if(!item){fontChecks.push({owner:p.owner,unboundRegisteredNative:registered&&p.owner==='crossword28.native',passed:registered&&p.owner==='crossword28.native'});continue;}
  const requestedCSS=J.FONTS[item.font]?.composite?J.fontCSS(item.font,item.size,String(p.args[0])):J.fontCSS(item.font,item.size);fontProbe.font=requestedCSS;const acceptedCSS=fontProbe.font,passed=acceptedCSS===p.state.font; fontChecks.push({owner:p.owner,text:p.args[0],font:item.font,size:item.size,requestedCSS,acceptedCSS,actualCSS:p.state.font,passed});
 }
 const rgba=ctx.getImageData(0,0,960,540).data;
 return{initial,root,rootRestored,allPrimary,paintError,clock:{pass:env.pass,t:env.t,realTime:env.realTime,lt:env.lt,ltb:env.ltb,pIn:env.pIn,pOut:env.pOut,step:env.step},calls,counts,fontChecks,records:observation.records,result:clone(result),rgba};
}
const nativeCell=Math.min(960*(.88-.24)/9,540*.8/5,540*.14),nativeNumber=nativeCell*.2;
function quality(sample,mode){
 const scale=mode.recipe?.scale??1,cell=nativeCell*scale,gw=9*cell,gh=5*cell,fs=Math.max(13*1.15,nativeCell*.24),below=mode.recipe?.below??false,gx=(960-gw-(below?0:960*.24))/2,gy=(540-gh-(below?fs*5:0))/2;
 const inverse=A.inverse(sample.root),point=(m,x,y)=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]],bounds=points=>({x0:Math.min(...points.map(p=>p[0])),y0:Math.min(...points.map(p=>p[1])),x1:Math.max(...points.map(p=>p[0])),y1:Math.max(...points.map(p=>p[1]))}),atoms=[];
 for(const p of sample.records.filter(p=>p.kind.endsWith('Text')&&p.state.alpha>0)){
  const m=p.metrics,x=p.args[1],y=p.args[2],v=[[x-m.actualBoundingBoxLeft-1,y-m.actualBoundingBoxAscent-1],[x+m.actualBoundingBoxRight+1,y-m.actualBoundingBoxAscent-1],[x+m.actualBoundingBoxRight+1,y+m.actualBoundingBoxDescent+1],[x-m.actualBoundingBoxLeft-1,y+m.actualBoundingBoxDescent+1]],local=bounds(v.map(p0=>point(inverse,...point(p.matrix,...p0))));
  atoms.push({owner:p.owner,text:p.args[0],local,foundation:'actual TextMetrics+1fontpx mapped to local grid; conditional padding diagnostic; no universal AA bound'});
 }
 const sx=inverse[0]*mode.delta[0]+inverse[2]*mode.delta[1],sy=inverse[1]*mode.delta[0]+inverse[3]*mode.delta[1],numbers=sample.calls.filter(c=>c.sub==='number'),checks=[];
 for(const c of numbers){const it=c.args[0],col=Math.round((it.x-gx)/cell-.07),row=Math.round((it.y-gy)/cell-.15),cellBox={x0:gx+col*cell+sx,y0:gy+row*cell+sy,x1:gx+(col+1)*cell+sx,y1:gy+(row+1)*cell+sy};
  const owned=atoms.filter(a=>a.owner===c.owner),padding=owned.map(a=>Math.min(a.local.x0-cellBox.x0,a.local.y0-cellBox.y0,cellBox.x1-a.local.x1,cellBox.y1-a.local.y1));
  const contacts=owned.flatMap(a=>atoms.filter(q=>q.owner!==a.owner&&(q.owner.includes('.main.')||q.owner.includes('.pencil.'))).map(q=>({other:q.owner,otherText:q.text,dx:Math.max(a.local.x0-q.local.x1,q.local.x0-a.local.x1,0),dy:Math.max(a.local.y0-q.local.y1,q.local.y0-a.local.y1,0),intersects:a.local.x0<=q.local.x1&&q.local.x0<=a.local.x1&&a.local.y0<=q.local.y1&&q.local.y0<=a.local.y1})));checks.push({owner:c.owner,text:it.text,size:it.size,requiredSize:nativeNumber,sizePassed:it.size>=12&&it.size===nativeNumber,cell:[row,col],cellBox,padding,contained:padding.every(p=>p>=0),contacts});
 }
 return{cell,mainSize:cell*.7,mainFloorReference:18.9,numberSizePolicy:'preserve native13.653333333333334px; explicit local adjustment at reduced cell; not proportional8.192px',numberChecks:checks,atoms,passed:cell*.7>=18.9&&checks.every(c=>c.sizePassed&&c.contained&&!c.contacts.some(x=>x.intersects)),status:'DIAGNOSTIC_ONLY_NO_APPROVED_PADDING_OR_SEPARATION_FLOOR',heldOwnClock:sample.clock.lt>=.35&&sample.clock.pOut===0,safetyCertified:false};
}
async function sample({n,caseId,emit}){
 stable();need(typeof emit==='function','CROSSWORD28_LITERAL_RAW_SINK_REQUIRED');const mode=cases.find(c=>c.id===caseId);need(mode&&Number.isInteger(n)&&[0,18,24,90,231,249].includes(n),'CROSSWORD28_MINIMAL_SAMPLE_DOMAIN');const clocks=T.clock(plan,cut),state=clocks.states.find(s=>s.n===n);need(state,'CROSSWORD28_STATE');
 for(const own of state.passes.filter(p=>p.active)){
  const actual=draw(makeCanvas(),own,state.firstTime,mode),expected=draw(makeCanvas(),own,state.firstTime,mode,true),registered=mode.id==='off'||mode.id==='zero'?draw(makeCanvas(),own,state.firstTime,{id:'off',native:true,delta:[0,0]},false,true):null;
  const expectedPaint=same(actual.records,expected.records),expectedCalls=same(actual.calls,expected.calls),expectedClock=same(actual.clock,expected.clock),rgbaEqual=actual.rgba.every((v,i)=>v===expected.rgba[i]),registeredPaint=registered?same(paintProjection(actual.records),paintProjection(registered.records)):null,registeredRGBA=registered?actual.rgba.every((v,i)=>v===registered.rgba[i]):null;
  const healthy=x=>!x||(!x.paintError&&x.rootRestored&&x.allPrimary&&x.fontChecks.every(f=>f.passed)),actualHealthy=healthy(actual)&&healthy(expected)&&healthy(registered);
  const main=actual.calls.filter(c=>c.kind==='main').map(c=>c.item.text).join(''),clues=actual.calls.filter(c=>c.sub==='clue').map(c=>c.args[0]);const sourceTextComplete=main==='風の先へ'&&clues.length===4;
  const row={phase:'source28-minimal-fidelity',n,caseId,own,mode,actual:{...actual,rgba:rgba64(actual.rgba)},expected:{...expected,rgba:rgba64(expected.rgba)},registered:registered?{...registered,rgba:rgba64(registered.rgba)}:null,checks:{actualHealthy,sourceTextComplete,expectedPaint,expectedCalls,expectedClock,rgbaEqual,registeredPaint,registeredRGBA,fullText:main,clueTextFonts:clues.map(c=>({text:c.text,font:c.font,size:c.size,track:c.track}))},quality:quality(actual,mode),safetyCertified:false};
  await emit(row);need(actualHealthy&&sourceTextComplete&&expectedPaint&&expectedCalls&&expectedClock&&rgbaEqual&&registeredPaint!==false&&registeredRGBA!==false,'CROSSWORD28_FIDELITY_FAILED',row.checks);stable();
 }
 return{n,caseId,status:'SOURCE_FIDELITY_SUBSET_ONLY',safe:false};
}
return Object.freeze({sample,eligibility,admissibility,cases,scope:'SOURCE_PENDING; no source transport, no adapter, no whole frame integration, no avoidance certificate'});
})
