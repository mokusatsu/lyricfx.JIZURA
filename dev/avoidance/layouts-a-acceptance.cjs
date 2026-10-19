/* AVOID-006 native A26 matrix: certified, insufficient and unsupported remain distinct. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),root=path.resolve(__dirname,'../..'),oracle=require('./oracle.cjs');
(async()=>{
 const compiled=fs.readFileSync(path.join(root,'index.html')),fixtureSource=fs.readFileSync(path.join(__dirname,'layouts-a-fixture.js'),'utf8'),compiledSHA256=crypto.createHash('sha256').update(compiled).digest('hex'),fixtureSHA256=crypto.createHash('sha256').update(fixtureSource).digest('hex');
 const server=http.createServer((req,res)=>{try{const file=req.url==='/font.otf'?'/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc':path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':'application/octet-stream');res.end(file===path.join(root,'index.html')?compiled:fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await require('../browser.cjs').launch();
 try{
  const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForFunction(()=>J?.ui?.plan);await page.addScriptTag({content:fixtureSource});
  const report=await page.evaluate(async anchors=>{
   const A=J.placement,fontURL=location.origin+'/font.otf',checks=[],variants=[],check=(name,passed,details)=>checks.push({name,passed:!!passed,details});
   await runLayoutsAFixture(J,{layout:'edgeFrame'},{fontURL});
   const baseList=JSON.stringify(A.basicLayouts);
   for(const layout of ['bubble','justified','filmstrip','notification','ticket']){
    const spec=anchors[layout],r=await runLayoutsAFixture(J,spec,{newPath:false,fontURL}),src=r.plan,first=J.finalizePlacementPlan(src,{layoutsA:true});
    check('standalone A26 opt-in '+layout,!!first.cuts[0].placementTrajectory);
    for(const options of [{layoutsA:true},{layoutsA:false},{layoutsA:true,cutIndices:[]},{basicLayouts:true,layoutsA:true}])check('refinalize original lineage '+layout+' '+JSON.stringify(options),JSON.stringify(J.finalizePlacementPlan(src,options))===JSON.stringify(J.finalizePlacementPlan(first,options)));
    const options={layoutsA:true,params:{0:layout==='justified'?{dens:1e-300}:layout==='bubble'?{tilt:500}:layout==='filmstrip'?{tilt:500}:layout==='ticket'?{tilt:500}:{font:Infinity}}},bad=J.finalizePlacementPlan(first,options);
    check('unsupported does not retain stale route '+layout,!bad.cuts[0].placementTrajectory&&!bad.cuts[0].fullStagePlacement&&!bad.cuts[0].placementLayoutsA);
   }
   {const r=await runLayoutsAFixture(J,anchors.chat,{newPath:false,fontURL}),src=r.plan,validOptions={layoutsA:true,params:{0:{font:null}}},invalidOptions={layoutsA:true,params:{0:{font:Infinity}}},valid=J.finalizePlacementPlan(src,validOptions),bad=J.finalizePlacementPlan(valid,invalidOptions),again=J.finalizePlacementPlan(bad,validOptions);check('nonfinite option cannot collide with null finalization cache',!!valid.cuts[0].placementTrajectory&&!bad.cuts[0].placementTrajectory&&JSON.stringify(again)===JSON.stringify(J.finalizePlacementPlan(src,validOptions)));}
   check('basic16 API unchanged',JSON.stringify(A.basicLayouts)===baseList&&A.basicLayouts.length===16);
   const negative=[];
   const reference=await runLayoutsAFixture(J,{layout:'bubble'},{newPath:false,fontURL});
   for(const kind of ['mixedPath','pathTransform','clipTransform','unclosedFill','glyphBudget','letterSpacing','nondefaultTextState']){
    const renderer={makeEnv:reference.renderer.makeEnv.bind(reference.renderer),drawCut:e=>{const c=e.ctx;c.beginPath();if(kind==='glyphBudget'){c.fillText('W'.repeat(16385),0,0);return;}if(kind==='letterSpacing'){c.letterSpacing='Infinitypx';return;}if(kind==='nondefaultTextState'){c.fontKerning='none';c.fillText('Text',0,0);return;}c.moveTo(0,0);c.lineTo(40,0);c.lineTo(40,40);if(kind!=='unclosedFill')c.closePath();if(kind==='mixedPath')c.rect(0,0,20,20);if(kind==='pathTransform'||kind==='clipTransform')c.translate(10,0);if(kind==='clipTransform')c.clip();else c.fill();}},canvas=document.createElement('canvas'),env=renderer.makeEnv(canvas.getContext('2d'),reference.plan,{...reference.plan.cuts[0],placementLayoutsA:true,placementUnits:true},reference.plan.style.schemes[0],{pass:'main',t:1.5,lt:1.5,ltb:1.5,scale:1});const program=A.record(renderer,env);negative.push({kind,supported:program.measurementSupported,diagnostics:program.diagnostics});
   }
   check('new recorder boundaries reject unknown programs',negative.every(v=>!v.supported),negative);
   const renderer={makeEnv:reference.renderer.makeEnv.bind(reference.renderer),drawCut:e=>e.rect(0,0,10,10,'white')},env=renderer.makeEnv(document.createElement('canvas').getContext('2d'),reference.plan,reference.plan.cuts[0],reference.plan.style.schemes[0],{pass:'main',t:1.5,lt:1.5,ltb:1.5,scale:1}),program=A.record(renderer,env);program.events[0].kind='unknown-native-event';let unknown=false;try{A.replay(env,program,[0,0]);}catch(e){unknown=e.code==='UNSUPPORTED_DRAW_PROGRAM';}check('unknown replay events fail explicitly',unknown);
   // Positive corruption probe: text stays outside while the owned plate alone overlaps.
   const plateProbe=await runLayoutsAFixture(J,{layout:'bubble',cx:.5,cy:.5,radius:.2},{newPath:false,fontURL});plateProbe.renderer.drawCut=e=>{e.rrect(400,190,160,160,20,'#ffffff',1,false);e.draw({text:'TEXT OUTSIDE',font:'gothic_black',size:20,x:100,y:70,ghost:false});};const plateAudit=auditLayoutsAPrimary(plateProbe,1.5,{native:true});check('primary raster detects overlapping owned plate with text outside',plateAudit.visiblePixels>0&&plateAudit.conflictPixels>0&&plateAudit.marginConflictPixels>0,plateAudit);
   // Actual parsed suppression restores intrinsic intent with layoutsA alone.
   const suppression=[];
   for(const explicit of [null,1,.85]){const project=J.defaultProject();project.title='';project.lyrics='[00:00]~Go~';project.durationOverride=4;project.videoSize={w:960,h:540};project.lyricEffects={autoPlacement:true,avoidCenter:true};project.overrides={0:{layout:'chat',single:true}};if(explicit!=null)project.lyricCutOptions={'0:0':{details:{contentScale:explicit}}};const src=J.plan(project);src.cuts=src.cuts.filter(c=>c.line>=0);src.style.glow=0;src.style.ghost=0;src.fx.chroma=0;src.fx.motion=0;src.events=[];Object.assign(src.cuts[0],{enter:'cut',exit:'cut',groupExit:'cut',hold:'still',cam:'push',camP:{},decor:[],treat:'none',trans:null,effectStyle:null,effectFx:null,drawing:null});const result=J.finalizePlacementPlan(src,{layoutsA:true});suppression.push({explicit,sourceScale:src.cuts[0].contentScale,stageScale:result.cuts[0].contentScale,suppressed:result.cuts[0].suppressed,motionScale:result.cuts[0].motionScale,trajectory:!!result.cuts[0].placementTrajectory});}
   check('parsed suppression intrinsic scale survives A26-only API',suppression[0].suppressed&&suppression[0].motionScale===.25&&suppression[0].stageScale===J.SUPPRESSED_TEXT_SCALE,suppression);
   check('explicit1 and .85 survive A26-only API',suppression.slice(1).every(r=>r.stageScale===r.explicit),suppression);
   const variantSpecs=[
    ...Object.values(anchors).map(spec=>({...spec,ghost:true})),
    ...['round','ellipse','thought'].map(shape=>({...anchors.bubble,params:{shape,tilt:3,tail:-1,burst:true}})),
    ...[true,false].flatMap(ripple=>[.7,1].map(squash=>({...anchors.mirror,params:{ripple,squash}}))),
    ...['v','h','diag'].map(split=>({...anchors.splitScreen,params:{split,side:-1},text:'光'})),
    ...['floor','side'].map(mode=>({...anchors.perspective,params:{mode,copies:6,guides:true,vx:-1}})),
    ...['none','focus','tone'].map(fx=>({...anchors.panels,params:{fx,slant:11}})),
    ...[-3,0,3].map(tilt=>({...anchors.filmstrip,params:{tilt}})),
    ...['bar','band'].map(place=>({...anchors.subtitleBar,params:{place,bar:.13},text:'W'.repeat(26)})),
    ...['center','banner','lock'].map(pos=>({...anchors.notification,params:{pos}})),
    ...[-5,0,5].map(tilt=>({...anchors.ticket,params:{tilt}})),
    ...['filmstrip','notification','ticket','quote'].flatMap(layout=>[.85,1.1].flatMap(scale=>['push','dutch'].map(camera=>({...anchors[layout],scale,camera})))),
    {layout:'lowerThird',note:'意味のある注釈',params:{label:'copy'},W:1920,H:1080,cx:0,cy:0,radius:.02},
   ];
   const holdFit=r=>{let count=0,outside=0;const original=A.replay;A.replay=(env,program,offset,decor)=>{if(env.pass==='main')for(const e of program.events){if(e.role!=='primary')continue;if(env.cut.layout==='filmstrip'&&(e.kind!=='item'||String(e.args[0].text).startsWith('▸')))continue;for(const polygon of e.polygons){count++;for(const p of polygon){const x=p[0]/(env.scale||1)+offset[0],y=p[1]/(env.scale||1)+offset[1];if(x<-.00001||y<-.00001||x>r.plan.W+.00001||y>r.plan.H+.00001)outside++;}}}return original(env,program,offset,decor);};try{r.renderer.frame(r.canvas.getContext('2d'),r.plan,1.5,{noHud:true,noPost:true});}finally{A.replay=original;}return {count,outside};};
   for(const spec of variantSpecs){try{const r=await runLayoutsAFixture(J,spec,{fontURL}),tr=r.plan.cuts[0].placementTrajectory,frames=[];for(const time of [.01,.15,.35,.55,1.5,3.8,3.99]){const observations=[];r.renderer.frame(r.canvas.getContext('2d'),r.plan,time,{noHud:true,noPost:true,placementObservation:o=>observations.push(o)});frames.push({time,safety:observations.map(o=>o.safety),covered:observations.every(o=>o.envelopeCovered)});}variants.push({spec,safety:tr?.safety||'unsupported',diagnostics:r.observation.diagnostics,frames,holdFit:tr?.safety==='certified-bounded-adapter'&&['filmstrip','quote','notification','ticket'].includes(spec.layout)?holdFit(r):null});}catch(e){variants.push({spec,error:{code:e.code,message:e.message}});}}
   check('native variants certify or diagnose honestly',variants.every(r=>!r.error&&(r.safety!=='unsupported'||r.diagnostics.length&&r.diagnostics.every(d=>d.code==='UNSUPPORTED_ADAPTER'&&r.spec.layout==='panels'&&String(d.details).includes('tone pattern')||d.code==='UNSUPPORTED_NATIVE_HOLD_CROP'&&['filmstrip','quote','notification','ticket'].includes(r.spec.layout)))&&(r.safety!=='certified-bounded-adapter'||r.frames.every(f=>f.covered&&f.safety.every(v=>v==='safe')))),variants.filter(r=>r.error||r.safety==='certified-bounded-adapter'&&!r.frames.every(f=>f.covered&&f.safety.every(v=>v==='safe'))));
   check('cropped native entry preserves stage-visible owned hold text and plates',variants.filter(r=>r.holdFit).length>0&&variants.filter(r=>r.holdFit).every(r=>r.holdFit.count>0&&r.holdFit.outside===0),variants.filter(r=>r.holdFit).map(r=>({spec:r.spec,holdFit:r.holdFit})));
   const stale=await runLayoutsAFixture(J,anchors.chat,{fontURL});J.metrics.clear();let invalidated=false;try{A.validateFinal(stale.plan);}catch(e){invalidated=e.code==='STALE_PLACEMENT_PLAN';}check('font revision invalidates A26 route',invalidated);
   return {passed:checks.every(r=>r.passed),checks,negative,variants,suppression,plateAudit};
  },require('./layouts-a-anchors.json'));
  console.log(JSON.stringify({...report,compiledSHA256,fixtureSHA256}));assert.ok(report.passed,'AVOID-006 acceptance failed; inspect named checks');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
