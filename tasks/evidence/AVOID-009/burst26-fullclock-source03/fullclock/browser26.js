(function setupBurst26(createBinding,installer){'use strict';
const binding=createBinding();installer(binding);const need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c});},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
window.initBurst26=async({fonts})=>{
 const run=await runLayoutsBFixture(J,{layout:'burst',control:'fullstage',ghost:true,W:960,H:540,seed:1205,text:'風の先へ',params:{font:'dela',spikes:15,sharp:.72,tilt:4,lines:true,debris:true,order:'accent'}},{newPath:false,fonts,renderInitial:false,exportDataURL:false});
 const plan=run.plan;plan.duration=4.150001;plan.fps=60;plan.fx.koma=0;plan.lyricAvoidanceIndex.regions[0].end=plan.duration;if(J.lang!==plan.lang)J.setLang(plan.lang);
 const cut=plan.cuts[0];need(plan.lang==='ja'&&plan.W===960&&plan.H===540&&plan.cuts.length===1,'BURST26_SCOPE');
 need(cut.start===0&&cut.end===4&&cut.dur===4&&cut.inDur===.35&&cut.outDur===.4&&cut.renderStart===0&&cut.displayEnd===4&&cut.enter==='cut'&&cut.exit==='cut'&&cut.hold==='still'&&cut.cam==='push'&&eq(cut.camP,{a:.022,dir:1})&&cut.opacity===100&&cut.blend==='normal'&&cut.decor.length===0&&!cut.drawing&&!cut.effectStyle&&!cut.effectFx&&!cut.area&&!cut.effectsOnly&&!cut.fullStagePlacement&&!cut.placementLayoutsD,'BURST26_OPERATIONS');
 need(plan.events.length===0&&plan.beats.length===0&&!plan.energy&&!plan.media&&!plan.foreground&&!plan.ghostPreRoll&&plan.fx.chroma===.25&&plan.style.ghost===.6&&plan.style.glow===0,'BURST26_FX');
 const B=window.burst26Pure;B.family({W:960,H:540,cut,knownSourceFX:true});
 const P=J.placement.tilesProof48,G=J.placement.bulbsGeometry68,K=J.placement.bulbsProof69.kernel,primitives=window.oracle69Primitives;
 const helpers=[J.mainDraw,J.measure,J.fitSize,J.layoutText,J.fontCSS,J.stepDur,J.komaOf,J.lyricCutsAt,J.lyricRenderCut,J.CAMERA.push.get,J.r,J.rs,J.rr,J.Renderer.prototype.frame,J.Renderer.prototype.makeEnv,J.Renderer.prototype.drawCut];
 const clocks=P.clock(plan,cut),native=J.LAYOUTS.burst.render,original=J.burst26Original,oracle=J.burst26Oracle;
 const text='風の先へ',o={track:.02,lead:1.05},rxM=960*.355,ryM=Math.min(540*.355,rxM*1.1),nativeSize=Math.min(J.fitSize(text,'dela',rxM*1.08,ryM*1,o),540*.24);
 const recipes=B.recipes().map(recipe=>{const size=nativeSize*recipe.fontRatio,m=J.measure({text:recipe.text,font:'dela',size,...o});return{recipe,metrics:primitives.clean(m),dimensions:B.dimensions(recipe,nativeSize,m)};});
 const source=JSON.stringify(plan),fontRevision=J.metrics.revision,fontFaces=JSON.stringify([...document.fonts].map(f=>[f.family,f.style,f.weight,f.status])),fontRegistry=JSON.stringify(J.FONTS);
 window.burst26Local={run,plan,cut,P,G,K,B,primitives,clocks,native,original,oracle,source,fontRevision,fontFaces,fontRegistry,helpers,recipes};
 return{plan,clocks,fontAudit:window.layoutsBFixtureFontAudit,recipes,nativeSize,sourceWitnesses:{native:String(native),original:String(original),oracle:String(oracle)},adapterRegistered:false};
};
function stable(){const l=window.burst26Local;need(l.source===JSON.stringify(l.plan)&&l.native===J.LAYOUTS.burst.render&&l.original===J.burst26Original&&l.oracle===J.burst26Oracle&&l.fontRevision===J.metrics.revision&&l.fontFaces===JSON.stringify([...document.fonts].map(f=>[f.family,f.style,f.weight,f.status]))&&l.fontRegistry===JSON.stringify(J.FONTS),'BURST26_SOURCE_FONT_DRIFT');const h=[J.mainDraw,J.measure,J.fitSize,J.layoutText,J.fontCSS,J.stepDur,J.komaOf,J.lyricCutsAt,J.lyricRenderCut,J.CAMERA.push.get,J.r,J.rs,J.rr,J.Renderer.prototype.frame,J.Renderer.prototype.makeEnv,J.Renderer.prototype.drawCut];need(h.every((v,i)=>v===l.helpers[i]),'BURST26_HELPER_DRIFT');return l;}
function support(record,ordinal,l){
 const p=l.primitives.clean(record);need(p.role==='primary'&&p.owner==='burst.native-plate'&&p.state.alpha>0&&typeof p.state[p.kind.startsWith('stroke')?'strokeStyle':'fillStyle']==='string'&&p.state.dash.length===0&&p.state.blend==='source-over','BURST26_PAINT_SCOPE');
 // Narrow normalization only: source shock-ring stroke and source two-point speed ray.
 // Both remain primary. Ring uses a half-line-width outer circle; ray reuses T48.support unchanged.
 const arcs=p.path.filter(c=>c.key==='arc');let normalization='none',ringStroke=false;
 if(p.kind==='stroke'&&arcs.length){need(arcs.length===1&&p.path.length===1&&eq(arcs[0].matrix,p.matrix),'BURST26_RING_PATH');const[x,y,r,a,b]=arcs[0].args;need(a===0&&b===Math.PI*2&&r>=0&&arcs[0].args.length===5&&p.state.lineCap==='butt','BURST26_RING_ARC');p.kind='fill';ringStroke=true;normalization='ring-stroke-existing-circle-atom-plus-exact-affine-halfwidth';}
 else if(p.kind==='stroke'&&p.path.length===2&&p.path.every(c=>c.key==='moveTo'||c.key==='lineTo')){need(eq(p.path[0].matrix,p.matrix)&&eq(p.path[1].matrix,p.matrix),'BURST26_RAY_MATRIX');const s=l.P.support({...p,ordinal},{owner:record.owner,primitive:{kind:'line'}});return{...s,role:record.role,normalization:'none-existing-T48-two-point-line-support'};}
 const atom=l.K.atom(p);
 if(ringStroke){const F=l.K.F,add=(a,b)=>{const e=Math.min(a.e,b.e);return{n:(a.n<<BigInt(a.e-e))+(b.n<<BigInt(b.e-e)),e};},mul=(a,b)=>({n:a.n*b.n,e:a.e+b.e}),abs=a=>({n:a.n<0n?-a.n:a.n,e:a.e}),neg=a=>({n:-a.n,e:a.e});const pad=mul(F(record.state.lineWidth),F(.5)),px=mul(add(abs(F(p.matrix[0])),abs(F(p.matrix[2]))),pad),py=mul(add(abs(F(p.matrix[1])),abs(F(p.matrix[3]))),pad);atom.bounds={x0:add(atom.bounds.x0,neg(px)),x1:add(atom.bounds.x1,px),y0:add(atom.bounds.y0,neg(py)),y1:add(atom.bounds.y1,py)};}
 const bounds=Object.fromEntries(Object.entries(atom.bounds).map(([k,v])=>[k,l.K.directed(v,k.endsWith('1'))]));
 return{ordinal,owner:record.owner,role:record.role,kind:record.kind,bounds,normalization,foundation:atom.foundation};
}
function collectSupports(records,l){
 const supports=[];let supportError=null;
 for(let i=0;i<records.length;i++){if(!(records[i].state.alpha>0))continue;try{supports.push(support(records[i],i,l));}catch(e){supportError={ordinal:i,name:String(e.name||'Error'),code:e.code==null?null:String(e.code),message:String(e.message||e),stack:e.stack==null?null:String(e.stack)};break;}}
 return{supports,supportPrefix:supportError?supports:null,supportError};
}
window.frameBurst26=async({n,mode,recipe=null,delta=[0,0]})=>{
 const l=stable(),s=l.clocks.states.find(s=>s.n===n);need(s&&['native','candidate','oracle'].includes(mode),'BURST26_STATE_MODE');
 const selected=recipe?l.recipes.find(r=>r.recipe.id===recipe.id):null;need(!recipe||selected&&eq(selected.recipe,recipe),'BURST26_RECIPE_INPUT');
 const shape=recipe&&recipe.id!=='native'?{text:recipe.text,fontRatio:recipe.fontRatio,padEm:recipe.padEm}:null,r={dx:delta[0],dy:delta[1],shape};
 const c=l.primitives.cv(),ctx=c.getContext('2d'),renderer=l.run.renderer,oldDraw=renderer.drawCut,ownDraw=Object.getOwnPropertyDescriptor(renderer,'drawCut'),oldMain=J.mainDraw,ownMain=Object.getOwnPropertyDescriptor(J,'mainDraw'),glyphs=[],passes=[],saved=[];let current=null,observer;
 try{
  observer=l.primitives.spy(ctx,()=>current);
  for(const key of ['clip','drawImage','putImageData','clearRect','createPattern','createLinearGradient','createRadialGradient','createConicGradient'])if(key in ctx){const own=Object.getOwnPropertyDescriptor(ctx,key),f=ctx[key];saved.push([key,own]);ctx[key]=function(...a){need(!current,'BURST26_UNSUPPORTED:'+key);return Reflect.apply(f,this,a);};}
  J.mainDraw=function(e,it){if(e===current)glyphs.push({pass:e.pass,item:l.primitives.clean(it),lt:e.lt,ltb:e.ltb,step:e.step,pIn:e.pIn,pOut:e.pOut,matrix:l.primitives.matrix(ctx)});return Reflect.apply(oldMain,this,[e,it]);};
  renderer.drawCut=function(env){need(env.ctx===ctx&&env.cut.layout==='burst'&&env.W===960&&env.H===540,'BURST26_ACTUAL_TARGET');current=env;env.drawOwnership={role:'primary',owner:'burst.native-plate'};const root=l.primitives.matrix(ctx),clock={pass:env.pass,t:env.t,realTime:env.realTime,lt:env.lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut};let bb;
   try{if(mode==='native')bb=l.original(env);else if(mode==='oracle')bb=l.oracle(env,r);else bb=binding.withRecipe(env,r,()=>l.native(env));}
   finally{passes.push({clock,root,finalRoot:l.primitives.matrix(ctx),bb:l.primitives.clean(bb??null)});current=null;need(binding.recipeFor(env)===null,'BURST26_BINDING_LEAK');}
   return bb;
  };
  renderer.frame(ctx,l.plan,s.firstTime,{...l.primitives.options,avoidanceRealTime:s.firstTime});
 }finally{current=null;for(const[k,d]of saved.reverse())if(d)Object.defineProperty(ctx,k,d);else delete ctx[k];observer?.restore();if(ownDraw)Object.defineProperty(renderer,'drawCut',ownDraw);else delete renderer.drawCut;if(ownMain)Object.defineProperty(J,'mainDraw',ownMain);else delete J.mainDraw;}
 stable();const expected=s.passes.filter(p=>p.active);need(eq(passes.map(p=>p.clock.pass),expected.map(p=>p.pass)),'BURST26_ACTUAL_PASS_SET');
 for(let i=0;i<expected.length;i++){const e=expected[i],a=passes[i];for(const k of ['lt','ltb','step'])need(Object.is(a.clock[k],e[k]),'BURST26_ACTUAL_CLOCK:'+k);need(Object.is(a.clock.t,e.tp)&&Object.is(a.clock.realTime,s.firstTime)&&eq(a.root,a.finalRoot),'BURST26_ACTUAL_CLOCK_ROOT');}
 const records=observer.records;need(records.length<=2048&&records.every(p=>p.role==='primary'&&p.owner==='burst.native-plate'),'BURST26_PRIMARY_ALL');
 const {supports,supportPrefix,supportError}=collectSupports(records,l);
 for(const g of glyphs){need(g.item.text===(shape?shape.text:'風の先へ')&&g.item.font==='dela','BURST26_FULLTEXT');const p=passes.find(p=>p.clock.pass===g.pass);for(const k of ['lt','ltb','step','pIn','pOut'])need(Object.is(p.clock[k],g[k]),'BURST26_GLYPH_CLOCK');}
 const result={n,firstTime:s.firstTime,mode,recipe:recipe?.id??null,delta,passes,glyphs,records,supports,supportPrefix,supportError,positivePaintCount:records.filter(p=>p.state.alpha>0).length,rgbaSHA256:await l.primitives.hash(ctx),sourceUnchanged:true,adapterRegistered:false};c.width=1;return result;
};
window.evaluateBurst26=({supports,circle})=>{const l=stable();return l.B.evaluate(supports,circle,l.G,{sourcePositivePaintCount:supports.length});};
window.candidatesBurst26=({recipe,supports,circle})=>{const l=stable();return l.B.candidates(recipe,supports,circle,l.G);};
})
