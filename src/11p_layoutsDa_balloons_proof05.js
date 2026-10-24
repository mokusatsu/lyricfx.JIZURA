/* SOURCE GATE ONLY. Native balloons continuous-envelope diagnostic; no adapter. */
(()=>{
'use strict';
const A=J.placement,fail=(code,message,details={})=>{throw Object.assign(Error(message),{code,details});},copy=v=>JSON.parse(JSON.stringify(v));
const limits=Object.freeze({metricKeysPerCut:150000,metricKeysTotal:300000,metricMillisecondsPerCut:45000,cellsPerCut:4096,maxDepth:16,candidates:128,familyCandidates:81,intervalOperations:6000000});
const stock={source:J.LAYOUTS.balloons.render,push:J.CAMERA.push.get,record:A.record,camera:A.cameraEnvelope,fonts:J.fontCSS,selector:J.lyricCutsAt,makeEnv:J.Renderer.prototype.makeEnv};
const fixedSets=[[J,['r','rs','h','clamp','lerp','fontForChar','faceOf','glyphCount','stepDur','komaOf','lyricRenderCut']], [J.E,['inCubic','outCubic','outBack','outExpo']], [Math,['sin','cos','pow','ceil','floor','round','min','max','abs','sqrt','hypot']], [A,['convexHull','bounds','clear','point','inverse','affine']]].map(([object,keys])=>({object,refs:keys.map(k=>[k,object[k]])}));
function IFactory(){
 const buf=new ArrayBuffer(8),f=new Float64Array(buf),u=new BigUint64Array(buf);let operations=0;
 const adjacent=(x,up)=>{if(!Number.isFinite(x))fail('NONFINITE_INTERVAL','Finite interval required');if(x===0)return up?Number.MIN_VALUE:-Number.MIN_VALUE;f[0]=x;u[0]+=((x>0)===up)?1n:-1n;return f[0];};
 const R=(a,b)=>{if(++operations>limits.intervalOperations)fail('INTERVAL_BUDGET','Interval operation cap');if(!Number.isFinite(a)||!Number.isFinite(b)||a>b||Math.max(Math.abs(a),Math.abs(b))>1e8)fail('INTERVAL_DOMAIN','Ordered bounded finite interval required');return [adjacent(a,false),adjacent(b,true)];};
 const P=x=>[x,x],add=(a,b)=>R(a[0]+b[0],a[1]+b[1]),neg=a=>[-a[1],-a[0]],sub=(a,b)=>add(a,neg(b)),mul=(a,b)=>{const q=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return R(Math.min(...q),Math.max(...q));},C=(a,k)=>mul(a,P(k));
 const sin=a=>{if(a[1]-a[0]>=2*Math.PI)return R(-1,1);const v=[Math.sin(a[0]),Math.sin(a[1])];for(let k=Math.ceil((a[0]-Math.PI/2)/Math.PI);Math.PI/2+k*Math.PI<=a[1];k++)v.push(k%2===0?1:-1);return R(Math.max(-1,Math.min(...v)-1e-13),Math.min(1,Math.max(...v)+1e-13));};
 return {R,P,add,sub,neg,mul,C,sin,cos:a=>sin(add(a,P(Math.PI/2))),previous:x=>adjacent(x,false),next:x=>adjacent(x,true),count:()=>operations};
}
function domain(renderer,plan,cut){
 if(fixedSets.some(set=>set.refs.some(([k,v])=>set.object[k]!==v)))fail('STALE_NATIVE_SOURCE','Original bounded source arithmetic/font/geometry functions required');
 if(J.LAYOUTS.balloons.render!==stock.source||J.CAMERA.push.get!==stock.push||A.record!==stock.record||A.cameraEnvelope!==stock.camera||J.fontCSS!==stock.fonts||J.lyricCutsAt!==stock.selector||J.Renderer.prototype.makeEnv!==stock.makeEnv||!A.layoutsDSourceKnown?.('balloons')||!A.layoutsDTransportKnown?.(renderer))fail('STALE_NATIVE_SOURCE','Exact native source/camera/transport required');
 const original=plan.cuts?.[0],keys=['index','layout','text','seed','start','end','dur','inDur','outDur','stagger','params','motionScale','contentScale','cam','camP','enter','exit','hold','treat','renderStart','displayEnd','effectFx','effectStyle','palette'];
 if(!original||keys.some(k=>JSON.stringify(original[k])!==JSON.stringify(cut[k])))fail('SOURCE_BINDING','Only D/fullstage/area overlay allowed');
 const effective=J.lyricRenderCut(original);if(['end','dur','outDur','exit'].some(k=>effective[k]!==cut[k]))fail('SELECTOR_BINDING','Original engine source clocks required');
 const fx=plan.fx,st=plan.style,motion=cut.motionScale??1,base=cut.contentScale??1;
 if(plan.cuts.length!==1||cut.layout!=='balloons'||cut.placementLayoutsD!==true||!cut.fullStagePlacement||cut.placementLayoutsA||cut.placementLayoutsB||cut.placementLayoutsC||cut.layoutDRecipe||cut.placementTrajectory||cut.cam!=='push'||cut.enter!=='cut'||cut.exit!=='cut'||cut.hold!=='still'||cut.treat!=='none'||cut.drawing||cut.effectsOnly||(cut.decor||[]).length||cut.effectFx||cut.effectStyle||J.activeMask?.(cut)||(plan.events||[]).length||(plan.beats||[]).length||st.glow!==0||cut.blank||cut.groupExit||cut.groupOutDur!=null||cut.insertedAtPlayhead||cut.start!==0||cut.end!==cut.dur||cut.dur!==4||(cut.renderStart??0)!==0||(cut.displayEnd??cut.end)!==cut.end)fail('UNSUPPORTED_NATIVE_DOMAIN','Initial original4sec single stock push cut without extra effects/lifetimes required');
 if(![plan.W,plan.H,plan.fps,plan.duration,cut.dur,cut.outDur,cut.inDur,cut.stagger??0,motion,base,fx.motion,fx.chroma,st.ghost].every(Number.isFinite)||plan.W<64||plan.H<64||plan.W>4096||plan.H>4096||plan.fps<1||plan.fps>120||plan.duration<4||motion<0||motion>1||base<.5||base>2||fx.motion<0||fx.motion>1||fx.chroma<0||fx.chroma>1||st.ghost<0||st.ghost>1||cut.outDur<0||cut.outDur>4||(cut.stagger??0)<0||(cut.stagger??0)>.25)fail('NUMERICAL_DOMAIN','Finite bounded camera/clock domain required');
 if(document.fonts.status!=='loaded')fail('FONT_PENDING','Pinned fonts must be loaded');
 const step=J.stepDur(fx,plan.fps),passes=fx.chroma>.02&&st.ghost>.02?[{pass:'B',lag:1.6/24,off:[-3.4,-1.3]},{pass:'A',lag:.8/24,off:[3.2,1.9]},{pass:'main',lag:0,off:[0,0]}]:[{pass:'main',lag:0,off:[0,0]}];
 if(!Number.isFinite(step)||step<=0||step>1)fail('CLOCK_DOMAIN','Finite original clock required');
 const effectiveMotion=fx.motion*(motion<1?motion:1),actualMaxScale=base*(1+.03*effectiveMotion*motion),K=J.clamp(fx.motion*1.25,0,1.25),cameraEnvelopeMaxScale=base*Math.max(1,1+.03*Math.max(K,fx.motion)*motion,1.02);
 if(cameraEnvelopeMaxScale<actualMaxScale)fail('CAMERA_BOUND','Camera-only helper must contain actual stock push scale');
 const maxLag=Math.max(...passes.map(p=>p.lag)),coordinateCeiling=8*Math.max(plan.W,plan.H),rootCoefficient=Math.max(1,cameraEnvelopeMaxScale),stageDeltaBound=2*Math.max(plan.W,plan.H),translationMax=Math.max(plan.W,plan.H)*(1+cameraEnvelopeMaxScale)+3.4*fx.chroma*st.ghost*plan.H/1080*motion+stageDeltaBound,u=2**-23,gamma=128*u/(1-128*u),rootGuard=gamma*(rootCoefficient*coordinateCeiling+translationMax+2),u64=Number.EPSILON,gamma32=32*u64/(1-32*u64),replayFloat64Guard=gamma32*(coordinateCeiling+2*stageDeltaBound+1)*rootCoefficient,arithmeticGuard=1e-8*Math.max(plan.W,plan.H);
 return {step,passes,maxLag,motion,base,effectiveMotion,actualMaxScale,cameraEnvelopeMaxScale,K,chroma:fx.chroma*st.ghost,sourceExpiryUpperBound:cut.end+maxLag+step,minRenderScale:.5,coordinateCeiling,rootGuard,replayFloat64Guard,stageDeltaBound,rootOperationBudget:128,arithmeticGuard,sourceBindingKeys:keys,cameraModel:'cameraEnvelope(chroma0,ghost0) plus exact final P.off*motion; stock push uses effectiveFX then CS lerp(motion)'};
}
function catalog(renderer,plan,cut){
 const cv=document.createElement('canvas');cv.width=plan.W;cv.height=plan.H;const ctx=cv.getContext('2d'),env=renderer.makeEnv(ctx,plan,cut,cut.palette,{pass:'main',t:1.5,realTime:1.5,lt:1.5,ltb:1.5,step:0,scale:1,allowFilter:false}),program=A.record(renderer,env),g=program.nativeDGeometry;cv.width=cv.height=1;
 if(!program.measurementSupported||g?.kind!=='balloons-native-catalog'||!g.nativeOnly||g.glyphs.length<1||g.glyphs.length>14||g.glyphs.some((v,i)=>v.q!==i)||g.glyphs.map(v=>v.ch).join('')!==g.rows.map(r=>r.chars.filter(c=>c!==' ').join('')).join(''))fail('CATALOG_DOMAIN','Complete original source catalog required');
 if(program.events.some(e=>e.role!=='primary'||!g.primaryOwners.includes(e.owner)))fail('OWNER_DOMAIN','Every source paint remains owned primary');return copy(g);
}
function sourceE(cut,g,t){return J.clamp((t-g.t1)/.45);}
function sourceOut(cut,t){return cut.outDur>0?J.clamp((t-(cut.dur-cut.outDur))/cut.outDur):0;}
function cssAt(font,ch,size){return J.FONTS[font]?.composite?J.fontCSS(font,size,ch):J.fontCSS(font,size);}
function metrics(g,budget){
 const min=Math.floor(g.nativeSize*.3*100)-1,max=Math.ceil(g.nativeSize*1.1078356481481482*100)+1,chars=[...new Set(g.glyphs.map(v=>v.ch))],count=chars.length*(max-min+1);
 const preflight={minBin:min,maxBin:max,uniqueCharacters:chars.length,requiredKeys:count,remainingTotal:limits.metricKeysTotal-budget.used};
 if(min<=0||count>limits.metricKeysPerCut||count>preflight.remainingTotal)return {complete:false,status:'metric-budget-inconclusive',preflight,tables:null,receipts:[]};
 const started=performance.now(),cv=document.createElement('canvas'),ctx=cv.getContext('2d'),tables=new Map(),receipts=[];ctx.textAlign='center';ctx.textBaseline='middle';let completed=0;
 for(const ch of chars){
  const n=max-min+1,raw=new Float64Array(n*4),block=64,blocks=new Float64Array(Math.ceil(n/block)*4);blocks.fill(-Infinity);const selected=[];
  for(let bin=min;bin<=max;bin++){
   if(performance.now()-started>limits.metricMillisecondsPerCut)return {complete:false,status:'metric-time-budget-inconclusive',preflight,completedKeys:completed,remainingKeys:count-completed,tables:null,receipts,elapsed:performance.now()-started};
   const css=cssAt(g.params.font,ch,bin/100);ctx.font=css;const m=ctx.measureText(ch),v=[m.actualBoundingBoxLeft,m.actualBoundingBoxRight,m.actualBoundingBoxAscent,m.actualBoundingBoxDescent];if(!v.every(Number.isFinite))fail('UNMEASURED_INK','Complete actual TextMetrics required');
   const j=bin-min;raw.set(v,j*4);for(let k=0;k<4;k++)blocks[Math.floor(j/block)*4+k]=Math.max(blocks[Math.floor(j/block)*4+k],v[k]);completed++;budget.used++;
   if(bin===min||bin===max||bin===Math.round(g.nativeSize*100)||bin===Math.round(g.nativeSize*.3*100))selected.push({bin,requestedCSS:css,actualCSS:ctx.font,values:v});
  }
  const digest=null; // Synchronous proof deliberately omits the async digest; ALL bins are still measured.
  const query=(lo,hi)=>{const requestedMin=Math.round(lo*100)-1,requestedMax=Math.round(hi*100)+1;if(!Number.isFinite(lo)||!Number.isFinite(hi)||lo>hi||requestedMin<min||requestedMax>max)fail('METRIC_BIN_RANGE','Every requested rounded CSS bin plus guard must be fully premeasured',{lo,hi,requestedMin,requestedMax,measuredMin:min,measuredMax:max});let a=requestedMin-min,b=requestedMax-min;if(a>b)fail('METRIC_BIN_RANGE','Nonempty complete CSS-bin query required');const v=[-Infinity,-Infinity,-Infinity,-Infinity];while(a<=b&&a%block){for(let k=0;k<4;k++)v[k]=Math.max(v[k],raw[a*4+k]);a++;}while(a+block-1<=b){for(let k=0;k<4;k++)v[k]=Math.max(v[k],blocks[Math.floor(a/block)*4+k]);a+=block;}while(a<=b){for(let k=0;k<4;k++)v[k]=Math.max(v[k],raw[a*4+k]);a++;}return v;};
  tables.set(ch,{query});receipts.push({ch,minBin:min,maxBin:max,count:n,digestSHA256:digest,digestOmitted:'synchronous-complete-scan; decoded proof requires fresh all-support equality',encoding:'four Float64 values per ascending CSS bin; runtime native endianness',selected,allBinExtrema:[0,1,2,3].map(k=>{let value=-Infinity;for(let j=0;j<n;j++)value=Math.max(value,raw[j*4+k]);return value;})});
 }
 cv.width=cv.height=1;return {complete:true,status:'all-css-bins-measured',preflight,completedKeys:completed,tables,receipts,elapsed:performance.now()-started};
}
function sourceRanges(g,cut,I){
 const buf=new ArrayBuffer(8),f=new Float64Array(buf),bits=new BigUint64Array(buf),toBits=x=>{f[0]=x;return bits[0];},toValue=x=>{bits[0]=x;return f[0];},last=I.previous(cut.dur),first=predicate=>{if(!predicate(last))return null;if(predicate(0))return 0;let lo=0n,hi=toBits(last);while(hi-lo>1n){const mid=(lo+hi)>>1n;if(predicate(toValue(mid)))hi=mid;else lo=mid;}return toValue(hi);};
 const boundaries=[0,cut.dur],branches=g.glyphs.map(v=>{const onset=first(t=>sourceE(cut,v,t)>0),held=first(t=>sourceE(cut,v,t)>=1),mi=Math.max(0,v.t1)/Math.max(.005,cut.stagger||.04),delay=(mi|0)*(cut.stagger||0),body=first(t=>t-delay>=0);for(const t of [onset,held,body,v.t1+.45*13/24])if(t!=null&&t>0&&t<cut.dur)boundaries.push(t);return {q:v.q,onset,held,body,mi,delay};});
 const exit=first(t=>sourceOut(cut,t)>0);if(exit!=null)boundaries.push(exit);const ks=[...new Set(boundaries)].sort((a,b)=>a-b),ranges=[];
 const split=(lo,hi,depth)=>{if(ranges.length>=limits.cellsPerCut)fail('CELL_BUDGET','Continuous source cell cap');if(hi-lo>.05){if(depth>=limits.maxDepth)fail('CELL_DEPTH_BUDGET','Depth cap');const mid=(lo+hi)/2;split(lo,I.previous(mid),depth+1);split(mid,hi,depth+1);}else ranges.push({lo,hi,depth});};
 for(let i=0;i+1<ks.length;i++)if(ks[i]<=I.previous(ks[i+1]))split(ks[i],I.previous(ks[i+1]),0);
 return {branches,exit,last,breakpoints:ks,ranges,method:'Original monotone e/mi/pOut predicates; ordered positive Float64 bisection; predecessor closes each exact source branch; conservative range membership elsewhere'};
}
function sourceState(v,g,cut,pass,lo,hi,I){
 const {P,R,add,sub,mul,C,sin,cos}=I,N=g.nativeSize,t=R(lo+pass.lag,hi+pass.lag),e=[sourceE(cut,v,lo),sourceE(cut,v,hi)],p=[sourceOut(cut,lo),sourceOut(cut,hi)],fly=R(J.E.inCubic(p[0])*g.stage[1]*.9,J.E.inCubic(p[1])*g.stage[1]*.9),rot=add(C(sin(add(C(t,.8),P(v.phase*1.3))),5*(.4+g.motion)),P(J.rs(g.seed,v.q,3)*4)),theta=C(rot,J.DEG),x=add(P(v.restX),C(sin(add(C(t,.9),P(v.phase))),N*.03)),bob=C(sin(add(C(t,1.4),P(v.phase))),N*.05*(.4+g.motion)),entry=R((1-J.E.outCubic(e[1]))*g.stage[1]*.35,(1-J.E.outCubic(e[0]))*g.stage[1]*.35),y=sub(add(add(P(v.yRow-cut.params.arc*g.stage[1]*(1-v.u0*v.u0)),bob),entry),C(fly,.8+.4*J.r(g.seed,v.q,2)));
 const growthValues=[J.E.outBack(e[0],2.2),J.E.outBack(e[1],2.2)];if(e[0]<=13/24&&e[1]>=13/24)growthValues.push(J.E.outBack(13/24,2.2));const size=R(N*(.3+.7*Math.min(...growthValues)),N*(.3+.7*Math.max(...growthValues))),bx=sub(x,C(sin(theta),N*.58)),by=add(y,C(cos(theta),N*.58));
 let ex,ey,freeClampPossible=false;if(cut.params.tie==='bunch'){ex=add(P(g.stage[0]/2),C(sub(x,P(g.stage[0]/2)),.06));ey=sub(P(g.stage[1]*.93),fly);}else{ex=add(bx,C(sin(add(C(t,1.1),P(v.q))),N*.2));const freeY=add(by,P(g.stage[1]*.3));ey=R(Math.min(g.stage[1]*1.05,freeY[0]),Math.min(g.stage[1]*1.05,freeY[1]));freeClampPossible=freeY[1]>=g.stage[1]*1.05;}
 return {e,p,fly,rot,theta,x,y,size,bx,by,ex,ey,t,freeClampPossible,entry:e[0]>0&&e[1]<1,exit:p[0]>0&&p[1]<1};
}
function boxHull(x,y){return [[x[0],y[0]],[x[1],y[0]],[x[1],y[1]],[x[0],y[1]]];}
function sourceParts(v,g,cut,pass,lo,hi,state,metric,I,branch){
 const {P,R,add,sub,mul,C,sin,cos}=I,N=g.nativeSize,parts=[],bodyActive=hi-branch.delay>=0,main=pass.pass==='main',push=(part,x,y,phase={})=>parts.push({owner:'balloons.balloon.'+v.q+'.'+part,q:v.q,part,local:boxHull(x,y),phase:{entry:state.entry,exit:state.exit,...phase}});
 if(state.e[1]<=0)return parts;
 const rotated=(x,y)=>[sub(mul(cos(state.theta),x),mul(sin(state.theta),y)),add(mul(sin(state.theta),x),mul(cos(state.theta),y))];
 for(const part of ['rim','body','gloss']){
  if(!main&&part!=='body'||part==='body'&&!bodyActive)continue;
  const m=metric.query(state.size[0],state.size[1]),stroke=part==='rim'?state.size[1]*.13:part==='body'?state.size[1]*.065:0,pad=stroke/2+1,scale=part==='gloss'?.93:1,localX=R((-m[0]-pad)*scale,(m[1]+pad)*scale),localY=R((-m[2]-pad)*scale,(m[3]+pad)*scale),[rx,ry]=rotated(localX,localY),ox=part==='gloss'?C(state.size,-.02):P(0),oy=part==='gloss'?C(state.size,-.03):P(0);push(part,add(add(state.x,ox),rx),add(add(state.y,oy),ry));
 }
 if(main){
  const radius=state.size[1]*.045;push('highlight',add(state.x,add(C(state.size,-.22),R(-radius,radius))),add(state.y,add(C(state.size,-.26),R(-radius,radius))));
  push('knot',add(state.bx,R(-N*.05,N*.05)),add(state.by,R(-N*.02,N*.07)));
  const pts=[];for(let k=0;k<=10;k++){const f=k/10,wig=C(sin(add(C(state.t,2),P(f*7+v.q))),N*.05*f*(1-f)*4),x=add(add(C(state.bx,1-f),C(state.ex,f)),wig),y=add(add(C(state.by,1-f),C(state.ey,f)),P(Math.sin(f*Math.PI)*N*.25));pts.push({x,y});}
  const halfWidth=g.lw/2,guard=halfWidth*10;for(let k=0;k<10;k++){const a=pts[k],b=pts[k+1];push('string.'+k,R(Math.min(a.x[0],b.x[0])-guard,Math.max(a.x[1],b.x[1])+guard),R(Math.min(a.y[0],b.y[0])-guard,Math.max(a.y[1],b.y[1])+guard),{entry:state.entry&&!(cut.params.tie==='free'&&state.freeClampPossible),freeClampPossible:state.freeClampPossible,strokeWidth:g.lw,miterLimit:10});parts[parts.length-1].endpointLocals=[a,b].map(p=>boxHull(R(p.x[0]-guard,p.x[1]+guard),R(p.y[0]-guard,p.y[1]+guard)));parts[parts.length-1].fractions=[k/10,(k+1)/10];}
 }
 return parts;
}
function envelope(local,pass,plan,cut,d){
 const aa=2/d.minRenderScale+d.rootGuard+d.replayFloat64Guard+d.arithmeticGuard,cameraPlan={...plan,fx:{...plan.fx,chroma:0},style:{...plan.style,ghost:0}},camera=A.cameraEnvelope([local],cameraPlan,cut,aa),dx=pass.off[0]*d.chroma*plan.H/1080*d.motion,dy=pass.off[1]*d.chroma*plan.H/1080*d.motion;
 if(local.some(p=>p.some(v=>!Number.isFinite(v)||Math.abs(v)>d.coordinateCeiling)))fail('COORDINATE_CEILING','Root guard coordinate ceiling exceeded');
 return camera.map(p=>[p[0]+dx,p[1]+dy]);
}
function candidateChecks(ledger,plan,cut,d,hold,region,legacyCandidates=[]){
 let x0=-Infinity,x1=Infinity,y0=-Infinity,y1=Infinity;for(const e of ledger){const b=e.bounds;x0=Math.max(x0,-b.x0);x1=Math.min(x1,plan.W-b.x1);if(!e.phase.exit)y0=Math.max(y0,-b.y0);if(!e.phase.entry)y1=Math.min(y1,plan.H-b.y1);}
 const intersection=[Math.max(hold[0],region.start),Math.min(hold[1],region.end)],holdEnough=hold[1]-hold[0]>=.04&&intersection[1]-intersection[0]>=.04,slab={x:[x0,x1],y:[y0,y1]},empty=x0>x1||y0>y1;
 const xs=empty?[0]:Array.from({length:9},(_,i)=>x0+(x1-x0)*i/8),ys=empty?[0]:Array.from({length:9},(_,i)=>y0+(y1-y0)*i/8),candidateRows=[[0,0],...xs.map(x=>[x,0]),...ys.map(y=>[0,y]),...legacyCandidates,...(empty?[]:xs.flatMap(x=>ys.map(y=>[x,y])))],candidates=[...new Map(candidateRows.map(p=>[p.join(','),p])).values()];
 const attempts=candidates.slice(0,limits.candidates).map(offset=>{
  let full=0,selective=0,stage=0;const worst={full:null,selective:null,stage:null};
  for(const e of ledger){const b=e.bounds,moved={x0:b.x0+offset[0],x1:b.x1+offset[0],y0:b.y0+offset[1],y1:b.y1+offset[1]},stageOK=moved.x0>=0&&moved.x1<=plan.W&&(moved.y0>=0||e.phase.exit)&&(moved.y1<=plan.H||e.phase.entry);if(!stageOK){stage++;worst.stage??={owner:e.owner,pass:e.pass,range:e.sourceRange,bounds:moved};}
   if(e.realRange[0]>=region.end||e.realRange[1]<=region.start)continue;const polygon=e.polygon.map(p=>[p[0]+offset[0],p[1]+offset[1]]),clear=A.clear([polygon],region.circle,Math.max(2,.005*Math.min(plan.W,plan.H)));if(!clear){full++;worst.full??={owner:e.owner,pass:e.pass,range:e.sourceRange};if(!e.phase.entry&&!e.phase.exit){selective++;worst.selective??=worst.full;}}
  }
  return {offset,fullCircleFailures:full,selectiveMovingCircleFailures:selective,stageFailures:stage,holdEnough,worst,status:!holdEnough?'hold-insufficient':stage?'conservative-stage-insufficient':full===0?'full-circle-diagnostic-candidate':selective===0?'selective-moving-diagnostic-candidate':'conservative-circle-insufficient',certificate:false};
 });
 const rank=attempt=>attempt.status==='full-circle-diagnostic-candidate'?0:attempt.status==='selective-moving-diagnostic-candidate'?1:2,rankedCandidateIndices=attempts.map((_,i)=>i).sort((a,b)=>rank(attempts[a])-rank(attempts[b])||Math.hypot(...attempts[a].offset)-Math.hypot(...attempts[b].offset)||a-b);return {region,holdIntersection:intersection,holdEnough,stageOffsetSlab:slab,emptyConservativeSlab:empty,attempts,rankedCandidateIndices,zeroAndAxesExplicit:true,legacyCandidateCount:legacyCandidates.length,finiteSearchFailureIsNotImpossibility:true};
}

function stageFamily(ledger,plan,cut,d,hold,region,g,nativeTrials){
 const eligible=nativeTrials.attempts.filter(a=>a.status==='full-circle-diagnostic-candidate'||a.status==='selective-moving-diagnostic-candidate');
 if(g.glyphs.length!==4||g.nR!==1||cut.params.tie!=='bunch')return {status:'unsupported-original-family-domain',nativeTie:cut.params.tie,glyphs:g.glyphs.length,rows:g.nR,attempts:[],certificate:false};
 if(eligible.length)return {status:'not-needed-native-translation-candidate-exists',attempts:[],certificate:false};
 const glyphs=ledger.filter(e=>e.q!=null&&!e.part.startsWith('string.')),held=glyphs.filter(e=>e.part==='body'&&!e.phase.entry&&!e.phase.exit),left=held.filter(e=>e.q<2),right=held.filter(e=>e.q>=2);
 if(!left.length||!right.length)return {status:'inconclusive-held-support',attempts:[],certificate:false};
 const margin=Math.max(2,.005*Math.min(plan.W,plan.H)),needLeft=Math.max(0,...left.map(e=>e.bounds.x1-(region.circle.cx-region.circle.r-margin))),needRight=Math.max(0,...right.map(e=>region.circle.cx+region.circle.r+margin-e.bounds.x0)),availableLeft=Math.max(0,Math.min(...glyphs.filter(e=>e.q<2).map(e=>e.bounds.x0))),availableRight=Math.max(0,Math.min(...glyphs.filter(e=>e.q>=2).map(e=>plan.W-e.bounds.x1)));
 const levels=(need,available)=>[...new Set([0,...[1,2,3,4].map(k=>Math.min(available,need)*k/4),...[1,2,3,4].map(k=>available*k/4)])].sort((a,b)=>a-b),Ls=levels(needLeft,availableLeft),Rs=levels(needRight,availableRight),holdIntersection=[Math.max(hold[0],region.start),Math.min(hold[1],region.end)],holdEnough=hold[1]-hold[0]>=.04&&holdIntersection[1]-holdIntersection[0]>=.04;
 const deltaAt=(q,L,R)=>[q<2?-L:R,0],endpointDelta=dg=>[.06*dg[0],0],vertexDelta=(dg,f)=>[(1-f)*dg[0]+f*endpointDelta(dg)[0],0],shift=(poly,delta)=>delta[0]===0&&delta[1]===0?poly.map(p=>p.slice()):poly.map(p=>[p[0]+delta[0],p[1]+delta[1]]);
 const moved=(e,L,R)=>{if(e.q==null)return e.polygon.map(p=>p.slice());const dg=deltaAt(e.q,L,R);if(e.endpointPolygons){if(e.endpointPolygons.length!==2||e.fractions.length!==2)fail('STRING_ENDPOINT_MODEL','Two source endpoint hulls required');return A.convexHull(e.endpointPolygons.flatMap((poly,i)=>shift(poly,vertexDelta(dg,e.fractions[i]))));}return shift(e.polygon,dg);};
 let zeroDeltaSupportExact=true;for(const e of ledger)if(JSON.stringify(moved(e,0,0))!==JSON.stringify(e.polygon))zeroDeltaSupportExact=false;
 if(!zeroDeltaSupportExact)fail('ZERO_STAGE_DELTA_SUPPORT','Native04 and zero-family support must be exact');
 const attempts=[];
 for(const L of Ls)for(const R of Rs){if(attempts.length>=limits.familyCandidates)break;let stage=0,full=0,selective=0;const worst={stage:null,full:null,selective:null};
  for(const e of ledger){const polygon=moved(e,L,R),b=A.bounds([polygon]),stageOK=b.x0>=0&&b.x1<=plan.W&&(b.y0>=0||e.phase.exit)&&(b.y1<=plan.H||e.phase.entry);if(!stageOK){stage++;worst.stage??={owner:e.owner,pass:e.pass,range:e.sourceRange,bounds:b};}
   if(e.realRange[0]>=region.end||e.realRange[1]<=region.start)continue;if(!A.clear([polygon],region.circle,margin)){full++;worst.full??={owner:e.owner,pass:e.pass,range:e.sourceRange};if(!e.phase.entry&&!e.phase.exit){selective++;worst.selective??=worst.full;}}
  }
  attempts.push({leftDelta:[-L,0],rightDelta:[R,0],anchorDelta:[0,0],maxDisplacement:Math.max(L,R),sumSquares:2*L*L+2*R*R,fullCircleFailures:full,selectiveMovingCircleFailures:selective,stageFailures:stage,holdEnough,worst,status:!holdEnough?'hold-insufficient':stage?'conservative-stage-insufficient':full===0?'full-circle-diagnostic-candidate':selective===0?'selective-moving-diagnostic-candidate':'conservative-circle-insufficient',certificate:false});
 }
 const rank=a=>a.status==='full-circle-diagnostic-candidate'?0:a.status==='selective-moving-diagnostic-candidate'?1:2,rankedCandidateIndices=attempts.map((_,i)=>i).sort((a,b)=>rank(attempts[a])-rank(attempts[b])||attempts[a].maxDisplacement-attempts[b].maxDisplacement||attempts[a].sumSquares-attempts[b].sumSquares||a-b);
 return {status:'finite-two-group-stage-family-diagnostic',coordinateSpace:'constant stage deltas after original camera',groups:[[0,1],[2,3]],anchorDelta:[0,0],needLeft,needRight,availableLeft,availableRight,leftLevels:Ls,rightLevels:Rs,zeroDeltaSupportExact,holdIntersection,holdEnough,attempts,rankedCandidateIndices,certificate:false,finiteFamilyFailureIsNotImpossibility:true,velocityInvariant:'Every original output point receives a time-independent stage delta; no new camera/source/font/size/time term',stringInvariant:'de=(.06dg.x+.94da.x,da.y); each original vertex gets (1-f)dg+f*de, with da0'};
}

A.balloonsNativeProof05=function(renderer,plan,cut,options={}){
 const before=JSON.stringify(plan),d=domain(renderer,plan,cut),g=catalog(renderer,plan,cut);if(![1,4].includes(g.glyphs.length)||g.nR!==1||cut.params.tie!=='bunch')fail('BALLOONS_INITIAL_VARIANT','Initial proof admits native one-row bunch singleton or4glyph only; no forced free-to-bunch');const budget=options.metricBudget||{used:0},measured=metrics(g,budget),common={kind:'balloons-native-stage-proof05',status:'diagnostic-only',adapterRegistered:false,safetyCertificate:false,sourceCatalog:g,sourceCutSnapshot:copy(cut),domain:d,limits,metricPreflight:measured.preflight,metricReceipts:measured.receipts,metricElapsed:measured.elapsed||0,metricKeys:measured.completedKeys||0};
 if(!measured.complete)return {...common,status:measured.status,unmeasuredKeys:measured.remainingKeys??measured.preflight.requiredKeys};
 const I=IFactory(),branches=sourceRanges(g,cut,I),ledger=[],hold=[Math.max(...branches.branches.map(v=>v.held??cut.dur))+d.maxLag+d.step,cut.dur-cut.outDur],region=options.region;
 if(!region||![region.start,region.end,region.circle?.cx,region.circle?.cy,region.circle?.r].every(Number.isFinite)||region.start<0||region.end<=region.start||region.circle.r<=0)fail('REGION_DOMAIN','Explicit finite stage circle/time interval required');
 if(branches.ranges.length*d.passes.length>limits.cellsPerCut)fail('CELL_BUDGET','All pass source cells cap exceeded');
 for(const pass of d.passes)for(const cell of branches.ranges){
  const push=p=>{const endpointPolygons=p.endpointLocals?.map(local=>envelope(local,pass,plan,cut,d)),polygon=endpointPolygons?A.convexHull(endpointPolygons.flat()):envelope(p.local,pass,plan,cut,d);ledger.push({owner:p.owner,q:p.q,part:p.part,pass:pass.pass,lag:pass.lag,sourceRange:[cell.lo,cell.hi],realRange:[Math.max(0,cut.start+cell.lo+pass.lag-d.step),cut.start+cell.hi+pass.lag+d.step],phase:p.phase,polygon,bounds:A.bounds([polygon]),...(endpointPolygons?{endpointPolygons,fractions:p.fractions}: {})});};
  for(const v of g.glyphs){const state=sourceState(v,g,cut,pass,cell.lo,cell.hi,I);for(const p of sourceParts(v,g,cut,pass,cell.lo,cell.hi,state,measured.tables.get(v.ch),I,branches.branches[v.q]))push(p);}
  if(pass.pass==='main'&&cut.params.tie==='bunch'){
   const p0=sourceOut(cut,cell.lo),p1=sourceOut(cut,cell.hi),r=g.nativeSize*.05,fy=[J.E.inCubic(p0)*plan.H*.9,J.E.inCubic(p1)*plan.H*.9];push({owner:'balloons.anchor',q:null,part:'anchor',local:boxHull([plan.W/2-r,plan.W/2+r],[plan.H*.93-fy[1]-r,plan.H*.93-fy[0]+r]),phase:{entry:false,exit:p0>0&&p1<1,stationaryEntry:true}});
  }
 }
 const trials=candidateChecks(ledger,plan,cut,d,hold,region,options.legacyCandidates||[]),family=stageFamily(ledger,plan,cut,d,hold,region,g,trials),remaining=ledger.filter(e=>e.realRange[1]>region.end&&e.realRange[0]<d.sourceExpiryUpperBound),zeroTailAllTop=remaining.every(e=>e.bounds.y1<0),retentionTail={from:region.end,sourceExpiryUpperBound:d.sourceExpiryUpperBound,remainingSupports:remaining.length,zeroOffsetAllRemainingTop:zeroTailAllTop,noReentryCoveredByAllRemainingRanges:true,planHorizon:plan.duration,status:plan.duration<d.sourceExpiryUpperBound?'unsupported-plan-duration-retention-tail':zeroTailAllTop?'conservative-all-remaining-top-diagnostic':'unsupported-live-zero-offset-tail',pOut1Waiver:false,allSourceCopiesKept:true};
 const tqAtEnd=Math.floor(region.end/d.step+1e-6)*d.step,selectorAtEnd=d.passes.map(pass=>{const tp=Math.max(0,tqAtEnd-pass.lag);return {pass:pass.pass,lag:pass.lag,tq:tqAtEnd,tp,active:J.lyricCutsAt(plan,tp).some(v=>v.index===cut.index),effectiveEnd:J.lyricRenderCut(plan.cuts[0]).end};}),endExpired=selectorAtEnd.every(v=>!v.active&&v.tp>=v.effectiveEnd);Object.assign(retentionTail,{selectorAtEnd,endExpired,noReentryByMonotoneTpAndFixedSelector:endExpired,status:plan.duration<d.sourceExpiryUpperBound?'unsupported-plan-duration-retention-tail':endExpired?'all-source-selectors-expired-at-region-end':retentionTail.status});
 if(JSON.stringify(plan)!==before)fail('SOURCE_MUTATION','Diagnostic must not mutate original plan');
 return {...common,status:'diagnostic-only',sourceUnchanged:true,stringModel:'Each guarded endpoint remains separate until its constant stage delta, then segment convex hull; zero-family support matches native04',branches:{...branches,ranges:branches.ranges.map(v=>({...v}))},holdWindow:hold,globalHoldEnough:hold[1]-hold[0]>=.04,ledger,trials,family,retentionTail,directedOperations:I.count(),policy:{circle:'full-circle first; separate source-moving entry/exit-only candidate; no shared anchor entry waiver',stage:'X always strict; native entry BOTTOM only; native exit TOP only; held free clamp strict; pOut1/tail has no phase waiver',mixedCells:'full-range conservative; no midpoint membership',atoms:'intervals include every representable own clock; selected actual geometry audits separately; no certificate before parent root/raster/branch review'},modelPendingParentReview:true};
};
})();
