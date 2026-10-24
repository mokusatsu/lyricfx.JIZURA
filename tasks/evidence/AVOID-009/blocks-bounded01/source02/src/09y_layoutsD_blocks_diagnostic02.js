/* Blocks native continuous diagnostic ONLY. Lazy invocation, no adapter registration,
   render hook, trajectory, candidate mutation, size change or safety designation. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],fail=(code,message)=>{throw Object.assign(Error(message),{code});};
const core={record:A.record,itemGeometry:A.itemGeometry,cameraEnvelope:A.cameraEnvelope,mainDraw:J.mainDraw,drawItem:J.drawItem,drawFx:J.drawFx,layoutText:J.layoutText,push:J.CAMERA.push.get,selector:J.lyricCutsAt,renderCut:J.lyricRenderCut};
const own=v=>JSON.parse(JSON.stringify(v)),seal=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const x of Object.values(v))seal(x);Object.freeze(v);}return v;};
function domain(renderer,plan,cut,options){
 if(A.record!==core.record||A.itemGeometry!==core.itemGeometry||A.cameraEnvelope!==core.cameraEnvelope||J.mainDraw!==core.mainDraw||J.drawItem!==core.drawItem||J.drawFx!==core.drawFx||J.layoutText!==core.layoutText||J.CAMERA.push.get!==core.push||J.lyricCutsAt!==core.selector||J.lyricRenderCut!==core.renderCut||!A.layoutsDSourceKnown?.('blocks')||!A.layoutsDTransportKnown?.(renderer))fail('BLOCKS_STALE_SOURCE','Original stock source/core/camera/selector/transport required');
 const original=plan.cuts?.[0],bindingKeys=['index','layout','text','seed','start','end','dur','inDur','outDur','stagger','renderStart','displayEnd','blank','insertedAtPlayhead','groupExit','groupOutDur','enter','exit','hold','treat','cam','camP','contentScale','motionScale','params','effectFx','effectStyle','trans','transDur','drawing','effectsOnly','decor','palette'];
 if(!original||bindingKeys.some(k=>JSON.stringify(original[k])!==JSON.stringify(cut[k])))fail('BLOCKS_SOURCE_BINDING','Diagnostic cut must preserve the actual plan source cut selector/lifetime/native fields; only full-stage/D flags and area overlay may differ');
 const effective=J.lyricRenderCut(original);if(effective.end!==cut.end||effective.dur!==cut.dur||effective.exit!==cut.exit||effective.outDur!==cut.outDur)fail('BLOCKS_SOURCE_BINDING','Effective original engine lyricRenderCut clock must exactly equal the supplied native cut; no clock reconstruction permitted');
 const p=cut.params||{},fx=plan.fx||{},st=plan.style||{},scale=options.renderScale??1;
 if(cut.layout!=='blocks'||cut.placementLayoutsD!==true||cut.placementLayoutsA||cut.placementLayoutsB||cut.placementLayoutsC||cut.placementTrajectory||cut.layoutDRecipe||cut.fullStagePlacement!==true||cut.enter!=='cut'||cut.exit!=='cut'||cut.hold!=='still'||cut.treat!=='none'||cut.drawing||cut.effectsOnly||(cut.decor||[]).length||cut.effectFx||cut.effectStyle||J.activeMask?.(cut)||cut.trans&&cut.trans!=='none')fail('BLOCKS_SOURCE_DOMAIN','Unadapted full-stage stock blocks cut/cut/still/none without overlays/masks/recipes required');
 const nums=[plan.W,plan.H,plan.fps,plan.duration,cut.start,cut.end,cut.dur,cut.inDur,cut.outDur,cut.seed,cut.stagger??0,cut.contentScale??1,cut.motionScale??1,fx.motion??.7,fx.chroma??.7,st.ghost??1,scale,p.colOff];
 if(nums.some(v=>!Number.isFinite(v))||plan.W<64||plan.H<64||plan.W>4096||plan.H>4096||plan.fps<1||plan.fps>120||cut.start<0||cut.start>3600||cut.dur<=0||cut.dur>12||cut.end!==cut.start+cut.dur||cut.end>plan.duration||cut.inDur<0||cut.outDur<0||cut.outDur>cut.dur||(cut.stagger??0)<0||(cut.stagger??0)>.25||!Number.isInteger(cut.seed)||Math.abs(cut.seed)>2147483647||!Number.isInteger(p.colOff)||p.colOff<0||p.colOff>5||![1,-1].includes(p.side)||['deco','tilt','hop'].some(k=>typeof p[k]!=='boolean')||!J.FONTS[p.font]||J.glyphCount(cut.text)<1||J.glyphCount(cut.text)>14)fail('BLOCKS_NUMERICAL_DOMAIN','Finite bounded native1..14/stage64..4096/duration<=12/font/seed/params required');
 if((cut.motionScale??1)!==1||(cut.contentScale??1)<.5||(cut.contentScale??1)>2||scale<.5||scale>2||(fx.motion??.7)<0||(fx.motion??.7)>1||(fx.chroma??.7)<0||(fx.chroma??.7)>1||(st.ghost??1)<0||(st.ghost??1)>1||cut.cam!=='push'||(plan.events||[]).length||(plan.beats||[]).length||st.glow!==0||(plan.cuts||[]).length!==1||cut.blank||cut.insertedAtPlayhead||cut.groupExit||cut.groupOutDur!=null||(cut.renderStart??cut.start)!==cut.start||(cut.displayEnd??cut.end)!==cut.end)fail('BLOCKS_INITIAL_DOMAIN','Single native push cut, no beat/event/glow/group lifetime changes, motionScale1, content/render scale[.5,2] required');
 if(document.fonts.status!=='loaded')fail('BLOCKS_FONT_PENDING','Loaded original font faces required');
 const stepDur=J.stepDur(fx,plan.fps);if(!Number.isFinite(stepDur)||stepDur<=0||stepDur>1)fail('BLOCKS_CLOCK_DOMAIN','Finite native quantization step(0,1] required');
 const ghost=(fx.chroma??.7)>.02&&(st.ghost??1)>.02,passes=ghost?[{pass:'B',lag:1.6/24},{pass:'A',lag:.8/24},{pass:'main',lag:0}]:[{pass:'main',lag:0}];
 const maxScale=(cut.contentScale??1)*Math.max(1.02,1+.03*Math.max(J.clamp((fx.motion??.7)*1.25,0,1.25),fx.motion??.7));
 const chromaMax=(fx.chroma??.7)*(st.ghost??1)*1.9,coordinateCeiling=8*Math.max(plan.W,plan.H),rootCoefficientMax=Math.max(1,maxScale),translationMax=Math.max(plan.W,plan.H)*(1+maxScale)+3.4*chromaMax*plan.H/1080;
 const u=2**-23,gamma64=64*u/(1-64*u),rootRoundGuard=gamma64*(rootCoefficientMax*coordinateCeiling+translationMax+1/scale),arithmeticGuard=1e-8*Math.max(plan.W,plan.H);
 return {sourceBinding:{cutIndex:original.index,keys:bindingKeys,overlayOnly:'fullStagePlacement/placementLayoutsD/area'},stepDur,renderScale:scale,passes,maxLag:Math.max(...passes.map(p=>p.lag)),maxScale,chromaMax,coordinateCeiling,rootRoundGuard,arithmeticGuard,sourceExpiryUpperBound:cut.end+Math.max(...passes.map(p=>p.lag))+stepDur};
}
function intervalMath(){
 const memory=new ArrayBuffer(8),f=new Float64Array(memory),u=new BigUint64Array(memory);let operations=0;
 const next=(x,up)=>{if(!Number.isFinite(x))fail('BLOCKS_INTERVAL_DOMAIN','Finite interval arithmetic required');if(x===0)return up?Number.MIN_VALUE:-Number.MIN_VALUE;f[0]=x;u[0]+=((x>0)===up)?1n:-1n;return f[0];};
 const range=(a,b)=>{if(++operations>3000000)fail('BLOCKS_INTERVAL_BUDGET','Directed interval budget exhausted');if(!Number.isFinite(a)||!Number.isFinite(b)||a>b||Math.max(Math.abs(a),Math.abs(b))>1e8)fail('BLOCKS_INTERVAL_DOMAIN','Finite ordered source support within1e8 required');return [next(a,false),next(b,true)];},P=x=>[x,x],add=(a,b)=>range(a[0]+b[0],a[1]+b[1]),mul=(a,b)=>{const q=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return range(Math.min(...q),Math.max(...q));};
 return {P,range,add,mul,count:()=>operations};
}
function sourceBranches(g,cut){
 const buffer=new ArrayBuffer(8),f=new Float64Array(buffer),u=new BigUint64Array(buffer);let operations=0;
 const bits=x=>{f[0]=x;return u[0];},value=x=>{u[0]=x;return f[0];},previous=x=>x===0?null:value(bits(x)-1n),last=previous(cut.dur);
 const first=predicate=>{let lo=0n,hi=bits(last);if(++operations>100000)fail('BLOCKS_BRANCH_BUDGET','Finite source predicate search exhausted');if(!predicate(last))return null;if(predicate(0))return 0;
  while(hi-lo>1n){if(++operations>100000)fail('BLOCKS_BRANCH_BUDGET','Finite source predicate search exhausted');const mid=(lo+hi)>>1n;if(predicate(value(mid)))hi=mid;else lo=mid;}return value(hi);};
 const until=threshold=>threshold==null?last:previous(threshold),qAt=(b,t)=>J.clamp((cut.outDur>0?J.clamp((t-(cut.dur-cut.outDur))/cut.outDur):0)*1.4-(b.order+1)/(g.n+3)*.4);
 const blocks=g.blocks.map(b=>{
  const when=.06+(b.order+1)*g.gap,sourceF=t=>(t-when)/g.fd,bodyStart=first(t=>sourceF(t)>=0),settledStart=first(t=>sourceF(t)>=1),movingStart=first(t=>qAt(b,t)>0),tailStart=first(t=>qAt(b,t)===1),mi=Math.max(0,when)/Math.max(.005,cut.stagger||.04),delay=(mi|0)*(cut.stagger||0),glyphStart=first(t=>t-delay>=0),falls=[],exits=[],ranges=[];
  if(bodyStart!=null){const end=until(settledStart);if(end!=null&&bodyStart<=end)falls.push({fall:'entry',range:[bodyStart,end]});}
  if(settledStart!=null)falls.push({fall:'settled',range:[settledStart,last]});
  const q0End=until(movingStart);if(q0End!=null&&q0End>=0)exits.push({exit:'q0',range:[0,q0End]});
  if(movingStart!=null){const end=until(tailStart);if(end!=null&&movingStart<=end)exits.push({exit:'moving',range:[movingStart,end]});}
  if(tailStart!=null)exits.push({exit:'q1',range:[tailStart,last]});
  for(const a of falls)for(const c of exits){const lo=Math.max(a.range[0],c.range[0]),hi=Math.min(a.range[1],c.range[1]);if(lo<=hi)ranges.push({key:a.fall+':'+c.exit,fall:a.fall,exit:c.exit,range:[lo,hi],predicate:a.fall==='entry'?'0<=sourceF && sourceF<1':'sourceF>=1',exitPredicate:c.exit==='q0'?'sourceQ===0':c.exit==='q1'?'sourceQ===1':'0<sourceQ && sourceQ<1'});}
  return {sourceIndex:b.sourceIndex,when,bodyStart,settledStart,movingStart,tailStart,glyphStart,mi,delay,ranges};
 });
 return {blocks,operations,sourceLifetime:[0,cut.dur],lastActiveOwnLt:last,method:'Monotone ORIGINAL f/q predicates; ordered Float64-bit bisection to the first representable true value, predecessor closes prior branch; no inverse-root tolerance or sampled branch label'};
}
function ownBranch(cut,g,lt,index){
 const b=g.blocks[index];if(!b)fail('BLOCKS_BRANCH_DOMAIN','Original source block index required');const when=.06+(b.order+1)*g.gap,f=(lt-when)/g.fd,pOut=cut.outDur>0?J.clamp((lt-(cut.dur-cut.outDur))/cut.outDur):0,q=J.clamp(pOut*1.4-(b.order+1)/(g.n+3)*.4),within=lt>=0&&lt<cut.dur;
 return {sourceIndex:index,ownLt:lt,f,pOut,q,sourceLifetimeActive:within,branchKey:!within?'expired':f<0?'absent':(f<1?'entry':'settled')+':'+(q===0?'q0':q===1?'q1':'moving'),entry:within&&f>=0&&f<1,movingExit:within&&q>0&&q<1,q1Tail:within&&q===1};
}
function sourceCatalog(renderer,plan,cut){
 const ctx=A.measurementContext();ctx.reset();const lt=cut.dur/2,t=cut.start+lt,env=renderer.makeEnv(ctx,plan,cut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass:'main',t,realTime:t,lt,ltb:lt,step:0,scale:1,allowFilter:false});
 const program=A.record(renderer,env),g=program.nativeDGeometry;
 if(!program.measurementSupported||g?.kind!=='blocks-native-catalog'||!g.nativeOnly||!g.blocks?.length||g.blocks.length>64||g.blocks.some((b,i)=>b.sourceIndex!==i)||g.rows.flat().filter(ch=>ch!==' ').join('')!==g.blocks.filter(b=>b.ch!=null).map(b=>b.ch).join(''))fail('BLOCKS_NATIVE_CATALOG','Complete unchanged source slot/support/toy catalog required');
 if(program.events.some(e=>e.role!=='primary'||!/^blocks\.(floor|block\.\d+\.(top|side|front|rim|mark|glyph))$/.test(e.owner)))fail('BLOCKS_OWNER_DOMAIN','All exact native parts remain primary');
 return {g:own(g),env};
}
function localParts(g,cut,env){
 const parts=[],metrics=[],floorLW=Math.max(1,Math.min(...g.stage)*.002),rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
 parts.push({owner:'blocks.floor',block:null,part:'floor',vertices:rect(g.stage[0]*.08-floorLW/Math.SQRT2,g.floorY-floorLW/Math.SQRT2,g.stage[0]*.92+floorLW/Math.SQRT2,g.floorY+floorLW/Math.SQRT2),font:false,sourceStroke:{width:floorLW,join:'physical single straight segment, butt caps unchanged',miterFactor:1,recorderLocalFrobeniusPad:floorLW/Math.SQRT2,reason:'Uniform push line recorder encloses both axes by lw*sqrt(2)/2 before its device AA'}});
 for(const b of g.blocks){
  const z=g.k*b.sz,h=z/2,dx=g.dx*b.sz,dy=g.dy*b.sz,owner='blocks.'+b.id,put=(part,vertices,extra={})=>parts.push({owner:owner+'.'+part,block:b.sourceIndex,part,vertices,font:false,...extra});
  put('top',[[-h,-h],[h,-h],[h+dx,-h+dy],[-h+dx,-h+dy]]);
  put('side',cut.params.side>0?[[h,-h],[h+dx,-h+dy],[h+dx,h+dy],[h,h]]:[[-h,-h],[-h+dx,-h+dy],[-h+dx,h+dy],[-h,h]]);
  put('front',rect(-h,-h,h,h));
  const rimStroke=g.lw*1.5,rimPad=Math.max(rimStroke/2*10,(z*.06+rimStroke/2)/Math.cos(Math.PI/32)-z*.06);
  put('rim',rect(-h+z*.08-rimPad,-h+z*.08-rimPad,-h+z*.92+rimPad,-h+z*.92+rimPad),{sourceStroke:{width:rimStroke,miterLimit:10,miterFactor:10,reason:'Conservative full miter cap retained although native arcTo corners are tangent'}});
  if(b.ch==null){const q=z*.26;if(b.shape===0){const r=q/Math.cos(Math.PI/64);put('mark',rect(-r,-r,r,r),{shape:'Exact native disc plus existing recorder64-point circumscribed support',recorderOuterRadius:r});}else if(b.shape===1)put('mark',[[0,-q*1.1],[q*1.05,q*.8],[-q*1.05,q*.8]]);else if(b.shape===2)put('mark',[[0,-q],[q,0],[0,q],[-q,0]]);}
  else{
   const size=z*.6,item={text:b.ch,font:g.params.font,size,x:0,y:-z/2,alpha:1},geo=A.itemGeometry(item,ID,env);
   if(geo.glyphs.length!==1||geo.glyphs[0].ch!==b.ch||!geo.inkPolygons.length)fail('BLOCKS_UNMEASURED_GLYPH','One original source codepoint at exact nominal font size required');
   const ink=geo.inkPolygons.flat().map(p=>p.slice());if(ink.some(p=>p.some(v=>!Number.isFinite(v)||Math.abs(v)>2*Math.max(...g.stage))))fail('BLOCKS_INK_DOMAIN','Finite complete actual ink inside numeric coordinate ceiling required');
   const m={sourceIndex:b.sourceIndex,ch:b.ch,font:g.params.font,size,inkPolygons:own(geo.inkPolygons),fontSpaceGuard:1,sourceStroke:0,deviceGuardDeferred:2};metrics.push(m);put('glyph',ink,{font:true,metricIndex:metrics.length-1});
  }
 }
 return {parts,metrics};
}
const clamp=J.clamp;
function bounceRange(lo,hi,z,I){
 if(hi<0)return I.P(0);lo=Math.max(0,lo);hi=Math.max(lo,hi);
 const values=[Math.abs(Math.sin(14*lo))*Math.exp(-lo/.1),Math.abs(Math.sin(14*hi))*Math.exp(-hi/.1)],root=Math.atan(1.4);
 // Every positive-lobe stationary root, not a sample union. Later lobes decay.
 const first=Math.max(0,Math.ceil((14*lo-root)/Math.PI));for(let k=first;k<=first+1;k++){const t=(root+k*Math.PI)/14;if(t>=lo&&t<=hi)values.push(Math.abs(Math.sin(14*t))*Math.exp(-t/.1));}
 const maximum=Math.min(1,Math.max(...values)+1e-13);return I.range(-.1*z*maximum,0);
}
function trajectory(g,cut,b,pass,lo,hi,I,branch){
 const z=g.k*b.sz,t1=.06+(b.order+1)*g.gap,impact=t1+g.fd,fLo=(lo-t1)/g.fd,fHi=(hi-t1)/g.fd,launch=-z*2-(g.stage[1]-b.y)*.2;
 let y,sq;
 if(branch.fall==='entry'){if(!(fLo>=0&&fHi<1))fail('BLOCKS_BRANCH_INCONCLUSIVE','Entry support range crosses exact source f predicate');y=I.range(J.lerp(launch,b.y,fLo*fLo),J.lerp(launch,b.y,fHi*fHi));sq=I.P(1);}
 else{if(!(fLo>=1))fail('BLOCKS_BRANCH_INCONCLUSIVE','Settled support range crosses exact source f predicate');const tauLo=(fLo-1)*g.fd,tauHi=(fHi-1)*g.fd;y=I.add(I.P(b.y),bounceRange(tauLo,tauHi,z,I));sq=I.range(1-.1*Math.exp(-tauLo/.05)-1e-14,1-.1*Math.exp(-tauHi/.05)+1e-14);}
 let hop=I.P(0);const gate=.3+(g.n+2)*g.gap+g.fd,periodLo=Math.floor((lo+pass.lag)/.65),periodHi=Math.floor((hi+pass.lag)/.65);
 if(cut.params.hop&&hi>gate&&periodHi-periodLo>2)fail('BLOCKS_HOP_PARTITION','Native hop period partition unresolved');
 if(cut.params.hop&&hi>gate&&b.sourceIndex<g.n){let maximum=0;for(let kk=periodLo;kk<=periodHi;kk++){if(J.h(cut.seed,kk,4)%g.n!==b.sourceIndex)continue;const u0=(lo+pass.lag-kk*.65)/.32,u1=(hi+pass.lag-kk*.65)/.32;if(u0>=1||u1<=0)continue;const a=clamp(u0),c=clamp(u1),v=[Math.sin(Math.PI*a),Math.sin(Math.PI*c)];if(a<=.5&&c>=.5)v.push(1);maximum=Math.max(maximum,...v);}if(maximum>0){hop=I.range(-z*.16*Math.min(1,maximum+1e-13),0);y=I.add(y,hop);}}
 const p0=cut.outDur>0?clamp((lo-(cut.dur-cut.outDur))/cut.outDur):0,p1=cut.outDur>0?clamp((hi-(cut.dur-cut.outDur))/cut.outDur):0,a=(b.order+1)/(g.n+3)*.4,q0=clamp(p0*1.4-a),q1=clamp(p1*1.4-a);
 if(branch.exit==='q0'&&(q0!==0||q1!==0)||branch.exit==='q1'&&(q0!==1||q1!==1)||branch.exit==='moving'&&!(q0>0&&q1<1))fail('BLOCKS_BRANCH_INCONCLUSIVE','Exit support range crosses exact original q predicate');
 const exit=I.range(q0*q0*g.stage[1]*.7,q1*q1*g.stage[1]*.7);y=I.add(y,exit);
 return {y,sq,hop,exit,q:[q0,q1],t1,impact,f:[fLo,fHi],mi:Math.max(0,t1)/Math.max(.005,cut.stagger||.04),rot:cut.params.tilt&&b.r===0&&g.rows.length>1?J.rs(cut.seed,b.sourceIndex,3)*3:0,entry:branch.fall==='entry',movingExit:branch.exit==='moving',q1Tail:branch.exit==='q1',q0Stationary:branch.exit==='q0',branchKey:branch.key,exactSourcePredicate:true};
}
function localHull(part,g,cut,pass,lo,hi,I,branch){
 if(part.block==null)return {polygon:part.vertices.map(p=>p.slice()),phase:{floor:true,entry:false,movingExit:false,q1Tail:false}};
 const b=g.blocks[part.block],state=trajectory(g,cut,b,pass,lo,hi,I,branch),theta=state.rot*J.DEG,abs=Math.abs(theta),co=I.range(1-theta*theta/2-1e-14,1+1e-14),si=I.range(theta-abs**3/6-1e-14,theta+abs**3/6+1e-14),z=g.k*b.sz,points=[];
 for(const [x,rawY]of part.vertices){const y=part.font?rawY:rawY-z/2,qy=I.mul(state.sq,I.P(y)),xx=I.add(I.P(b.x),I.add(I.mul(co,I.P(x)),I.mul(si,[-qy[1],-qy[0]]))),yy=I.add(I.add(state.y,I.P(z/2)),I.add(I.mul(si,I.P(x)),I.mul(co,qy)));
  for(const a of xx)for(const c of yy)points.push([a,c]);}
 return {polygon:A.convexHull(points),phase:state};
}
function passEnvelope(poly,part,pass,plan,cut,d){
 const aa=(part.font||part.part==='front'?2:1)/d.renderScale+d.rootRoundGuard+d.arithmeticGuard;
 const cameraPlan={...plan,fx:{...plan.fx,chroma:0},style:{...plan.style,ghost:0}};
 const camera=A.cameraEnvelope([poly],cameraPlan,cut,aa),factor=plan.H/1080,dx=pass.pass==='A'?3.2:pass.pass==='B'?-3.4:0,dy=pass.pass==='A'?1.9:pass.pass==='B'?-1.3:0;
 return A.convexHull(camera.flatMap(p=>[[p[0],p[1]],[p[0]+dx*d.chromaMax*factor,p[1]+dy*d.chromaMax*factor]]));
}
function knots(g,cut,pass){
 const values=[0,cut.dur,.4,.6,cut.dur-cut.outDur,.3+(g.n+2)*g.gap+g.fd];
 for(const b of g.blocks){const t1=.06+(b.order+1)*g.gap;values.push(t1,t1+.3,(Math.max(0,t1)/Math.max(.005,cut.stagger||.04)|0)*(cut.stagger||0));if(cut.outDur>0){const a=(b.order+1)/(g.n+3)*.4;values.push(cut.dur-cut.outDur+cut.outDur*a/1.4,cut.dur-cut.outDur+cut.outDur*(1+a)/1.4);}}
 if(cut.params.hop)for(let k=0;k<=Math.ceil((cut.dur+pass.lag)/.65);k++)values.push(k*.65-pass.lag,k*.65+.32-pass.lag);
 return [...new Set(values.filter(v=>Number.isFinite(v)&&v>=0&&v<=cut.dur))].sort((a,b)=>a-b);
}
function emitted(part,g,cut,pass,lt){
 if(part.block==null)return pass.pass==='main'&&lt>0&&lt<cut.dur;
 const b=g.blocks[part.block],t1=.06+(b.order+1)*g.gap;if(lt<t1)return false;
 if(part.part==='glyph'){const mi=Math.max(0,t1)/Math.max(.005,cut.stagger||.04);return lt-(mi|0)*(cut.stagger||0)>=0;}
 if(pass.pass==='main')return true;
 return part.part==='front'&&lt<.6&&(cut.outDur<=0||lt<=cut.dur-cut.outDur);
}
function phaseAt(plan,cut,g,realTime,passName){
 const stepDur=J.stepDur(plan.fx,plan.fps),lag=passName==='B'?1.6/24:passName==='A'?.8/24:0,tq=Math.floor(realTime/stepDur+1e-6)*stepDur,tp=Math.max(0,tq-lag),lt=tp-cut.start,active=J.lyricCutsAt(plan,tp).some(c=>c.index===cut.index),pOut=cut.outDur>0?clamp((lt-(cut.dur-cut.outDur))/cut.outDur):0;
 return {realTime,pass:passName,tq,tp,lt,ltb:lt+lag,pOut,active,sourceExpired:!active,forcedDirectOutsideSelector:!active,expiryUpperBound:cut.end+lag+stepDur,blocks:g.blocks.map(b=>{const t1=.06+(b.order+1)*g.gap,f=(lt-t1)/.3,q=clamp(pOut*1.4-(b.order+1)/(g.n+3)*.4),mi=Math.max(0,t1)/Math.max(.005,cut.stagger||.04);return {id:b.id,t1,f,q,entry:active&&f>=0&&f<1,movingExit:active&&cut.outDur>0&&q>0&&q<1,stationaryExitComponent:q===0||q===1,sourceBodyActive:active&&f>=0,sourceGlyphActive:active&&b.ch!=null&&f>=0&&lt-(mi|0)*(cut.stagger||0)>=0,mi,delay:(mi|0)*(cut.stagger||0)};})};
}
A.blocksNativeProofDiagnostic=function(renderer,plan,cut,options={}){
 const d=domain(renderer,plan,cut,options),{g,env}=sourceCatalog(renderer,plan,cut),{parts,metrics}=localParts(g,cut,env),I=intervalMath(),branches=sourceBranches(g,cut),ledger=[],limits={maxCells:512,maxLedgerEntries:96000,maxCandidatesPerRegion:81},passReports=[];
 const latestImpact=Math.max(...branches.blocks.map(b=>b.settledStart??cut.dur)),hold=[cut.start+latestImpact+d.maxLag+d.stepDur,cut.end-cut.outDur],hasHold=hold[1]-hold[0]>=.04;
 const branchRows=(part,pass,lo,hi)=>{
  if(part.block==null)return [{key:'floor',fall:'stationary',exit:'stationary',range:[lo,hi]}];
  const source=branches.blocks[part.block],out=[];
  for(const b of source.ranges){const a=Math.max(lo,b.range[0],part.font?source.glyphStart??cut.dur:0),c=Math.min(hi,b.range[1]);if(a<=c&&emitted(part,g,cut,pass,(a+c)/2))out.push({...b,range:[a,c]});}return out;
 };
 for(const pass of d.passes){const ks=knots(g,cut,pass);if(ks.length>limits.maxCells)fail('BLOCKS_CELL_BUDGET','Finite source partition exhausted');const cells=[];
  for(let i=0;i+1<ks.length;i++){const lo=ks[i],hi=ks[i+1],indices=[];
   for(const part of parts){if(part.block==null&&!emitted(part,g,cut,pass,(lo+hi)/2))continue;
    for(const branch of branchRows(part,pass,lo,hi)){const a=branch.range[0],b=branch.range[1],local=localHull(part,g,cut,pass,a,b,I,branch),polygon=passEnvelope(local.polygon,part,pass,plan,cut,d),phase=local.phase;
     const entry={owner:part.owner,block:part.block,part:part.part,pass:pass.pass,lag:pass.lag,sourceRange:[a,b],branchKey:branch.key,sourcePredicate:part.block==null?'floor/source main paint':{fall:branch.predicate,exit:branch.exitPredicate},sourcePredicateResolved:true,closedSupportForExactPredicate:true,realRange:[Math.max(0,cut.start+a+pass.lag-d.stepDur),cut.start+b+pass.lag+d.stepDur],polygon,phase:{floor:part.block==null,entry:!!phase.entry,movingExit:!!phase.movingExit,q1Tail:!!phase.q1Tail,q0Stationary:!!phase.q0Stationary,q:phase.q||null},AAReserve:(part.font||part.part==='front'?2:1)/d.renderScale+d.rootRoundGuard+d.arithmeticGuard};
     indices.push(ledger.length);ledger.push(entry);if(ledger.length>limits.maxLedgerEntries)fail('BLOCKS_LEDGER_BUDGET','Finite branch ledger exhausted');}}
   cells.push({lt:[lo,hi],entries:indices});}
  const atoms=ks.filter(lt=>lt<cut.dur).map(lt=>({lt,blocks:g.blocks.map(b=>ownBranch(cut,g,lt,b.sourceIndex))}));
  passReports.push({...pass,sourceLifetime:[cut.start,cut.end],rightOpen:true,expiryUpperBound:cut.end+pass.lag+d.stepDur,cells,atoms});
 }
 const tails=[];
 for(const b of g.blocks){const source=branches.blocks[b.sourceIndex];if(source.tailStart==null)continue;
  const from=Math.max(source.bodyStart??cut.dur,source.tailStart-d.maxLag-d.stepDur),points=[];
  for(const pass of d.passes){const ts=[from,...knots(g,cut,pass).filter(t=>t>from),cut.dur].filter((v,i,a)=>i===0||v>a[i-1]);
   for(let i=0;i+1<ts.length;i++)for(const part of parts.filter(p=>p.block===b.sourceIndex))for(const branch of branchRows(part,pass,ts[i],ts[i+1]))points.push(...passEnvelope(localHull(part,g,cut,pass,branch.range[0],branch.range[1],I,branch).polygon,part,pass,plan,cut,d));}
  if(points.length){const polygon=A.convexHull(points);tails.push({block:b.sourceIndex,sourceSaturation:source.tailStart,allCopiesContinuousFromSourceLt:from,allCopiesHull:polygon,minY:A.bounds([polygon]).y0,expiryUpperBound:d.sourceExpiryUpperBound,noReentryMeaning:'Fixed candidate offset ONLY, complete remaining source-predicate branches/all-parts/all-enabled-copies; later region offset adoption needs a separate global check'});}
 }
 const regions=options.regions;if(!Array.isArray(regions)||!regions.length||regions.length>16)fail('BLOCKS_REGION_DOMAIN','1..16 explicit diagnostic pixel-circle regions required');
 const trials=[];
 for(const region of regions){const c=region.circle;if(![region.start,region.end,c?.cx,c?.cy,c?.r].every(Number.isFinite)||region.end<=region.start||c.r<.02*Math.min(plan.W,plan.H)||c.r>.45*Math.min(plan.W,plan.H)||c.cx<0||c.cx>plan.W||c.cy<0||c.cy>plan.H)fail('BLOCKS_REGION_DOMAIN','Finite actual stage circle and half-open region required');
  const active=ledger.filter(e=>e.realRange[0]<region.end&&e.realRange[1]>region.start);if(!active.length){trials.push({region:own(region),disposition:'no-source-overlap',diagnosticOnly:true,attempts:[]});continue;}const held=active.filter(e=>e.sourceRange[0]+cut.start>=hold[0]-d.maxLag-d.stepDur&&e.sourceRange[1]+cut.start<=hold[1]),seedSolution=held.length?A.solveBasic(held.map(e=>e.polygon),c,plan.W,plan.H,cut.seed):null;
  const candidates=[[0,0]],fit=A.bounds((held.length?held:active).map(e=>e.polygon));if(seedSolution?.status==='safe')candidates.push(seedSolution.offset.slice());
  const xs=[0,-fit.x0,plan.W-fit.x1],ys=[0,-fit.y0,plan.H-fit.y1,c.cy+c.r+Math.max(2,.005*Math.min(plan.W,plan.H))-fit.y0,c.cy-c.r-Math.max(2,.005*Math.min(plan.W,plan.H))-fit.y1];for(const x of xs)for(const y of ys)candidates.push([x,y]);
  const unique=[...new Map(candidates.map(p=>[p.join(','),p])).values()].slice(0,limits.maxCandidatesPerRegion),intersection=[Math.max(hold[0],region.start),Math.min(hold[1],region.end)],holdEnough=hasHold&&intersection[1]-intersection[0]>=.04,attempts=[];
  for(const offset of unique){const moved=e=>e.polygon.map(p=>[p[0]+offset[0],p[1]+offset[1]]),circleFailures=[],relaxedCircleFailures=[],stageFailures=[];
   for(const e of active){const polygon=moved(e),b=A.bounds([polygon]),clear=A.clear([polygon],c,Math.max(2,.005*Math.min(plan.W,plan.H)));if(!clear)circleFailures.push(e.owner+':'+e.pass+':'+e.sourceRange.join(','));const intersectsHold=e.realRange[0]<hold[1]&&e.realRange[1]>hold[0],relax=(e.phase.entry||e.phase.movingExit)&&!intersectsHold;if(!clear&&!relax)relaxedCircleFailures.push(e.owner+':'+e.pass+':'+e.sourceRange.join(','));
    const tail=e.phase.q1Tail?tails.find(t=>t.block===e.block):null,tailAllowed=!!tail&&tail.minY+offset[1]>plan.H,top=b.y0>=0||e.phase.entry,bottom=b.y1<=plan.H||e.phase.movingExit||tailAllowed;
    if(b.x0<0||b.x1>plan.W||!top||!bottom||e.phase.floor&&(b.y0<0||b.y1>plan.H))stageFailures.push({owner:e.owner,pass:e.pass,lt:e.sourceRange,bounds:b,tailAllowed});}
   // Diagnostic only: atoms are reported for independent exact-boundary checks.
   // Candidate can never be a certificate while source-boundary atoms remain unverified.
   attempts.push({offset,fullIntervalCircleStrict:circleFailures.length===0,selectiveMovingCircleCheck:relaxedCircleFailures.length===0,stagePolicyContinuousCellCheck:stageFailures.length===0,holdIntersection:intersection,holdEnough,sourceBoundaryPredicatesExact:true,atomGeometryObservationPending:true,crossRegionTailAdoptionPending:true,diagnosticOnly:true,disposition:!holdEnough?'hold-intersection-insufficient':stageFailures.length?'stage-policy-inconclusive':circleFailures.length===0?'native-translation-full-circle-diagnostic-candidate':relaxedCircleFailures.length?'circle-support-insufficient':'native-translation-selective-moving-diagnostic-candidate',circleFailures,relaxedCircleFailures,stageFailures});}
  trials.push({region:own(region),holdIntersection:intersection,holdEnough,attempts,searchExhaustionIsNotImpossibility:true});
 }
 return seal({kind:'blocks-native-branch-proof-diagnostic',version:2,status:'diagnostic-only',adapterRegistered:false,safetyCertificate:false,sourceUnchanged:true,measurementRevision:J.metrics.revision||0,sourceCutSnapshot:own(cut),planClockSnapshot:{fps:plan.fps,duration:plan.duration,fx:own(plan.fx),stepDur:d.stepDur,exactOutDur:cut.outDur,exactStagger:cut.stagger??0},sourceCatalog:g,sourceBranches:branches,metrics,localParts:parts,domain:d,holdWindow:hold,globalHoldEnough:hasHold,ledger,passes:passReports,tails,trials,errorBudget:{fontSpaceGuard:1,glyphDeviceGuard:2/d.renderScale,shapeDeviceAA:1/d.renderScale,frontRectRecorderDeviceAA:2/d.renderScale,floorRecorderLocalPad:'lw/sqrt(2) both axes under admitted uniform push; includes physical butt stroke without changing it',markCircleRecorderRadius:'q/cos(pi/64)',sourceRimMiterFactor:10,rootRoundGuard:d.rootRoundGuard,rootModel:'64 bounded binary32 component operations, u=2^-23, gamma64 times root coefficient*coordinate+translation bound; source live root retained. Model needs parent/runtime containment validation, not a formal Canvas specification theorem.',transcendentalAllowance:1e-13,arithmeticGuard:d.arithmeticGuard,directedOperations:I.count(),limits},expiry:{sourceSelector:'J.lyricCutsAt(plan,tp), source lifetime[start,end); no blank/insert/group lifetime extension admitted',finiteSourceEmissionUpperBound:d.sourceExpiryUpperBound,forcedDirectOutsideLifetime:'Preserve native event diagnostics separately; never coverage or waiver success'},limitations:['No adapter or SAFE product designation','Source f/q branch endpoints resolved by exact monotone predicate search; actual selected-branch atom geometry still needs independent observation review','Conservative preimage of quantized source cells may overinclude a real-time region','No geometry/font/travel/floor/camera mutation','Native03 conditional feasibility is not adoption evidence','Numeric/AA model inherits actual TextMetrics guard contract and a declared bounded-root arithmetic assumption']});
};
A.blocksNativeOwnBranchAt=function(cut,catalog,ownLt,index){if(!Number.isFinite(ownLt))fail('BLOCKS_BRANCH_DOMAIN','Finite own source clock required');return ownBranch(cut,catalog,ownLt,index);};
A.blocksNativeSourcePhaseAt=function(plan,cut,catalog,realTime,pass){if(!Number.isFinite(realTime)||realTime<0||!['main','A','B'].includes(pass))fail('BLOCKS_PHASE_DOMAIN','Finite real time and named native pass required');return phaseAt(plan,cut,catalog,realTime,pass);};
})();
