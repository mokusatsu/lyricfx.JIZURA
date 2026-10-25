'use strict';
// SOURCE ONLY. Parent reviews source/math/pins before an explicit release.
const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto'),zlib=require('zlib'),assert=require('assert/strict');
const dir=path.resolve(__dirname,'..'),root=path.resolve(dir,'../..'),targetDir='/tmp/avoid009-balloons-diagnostic03/evidence',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const specs=[
 {W:960,H:540,text:'風',seed:804,params:{tie:'bunch',arc:.02,colOff:0,mono:false}},
 {W:480,H:854,text:'風の先へ続く道',seed:808,params:{tie:'bunch',arc:.06,colOff:3,mono:false},motionScale:.5},
 {W:960,H:540,text:'A B C D E',seed:807,params:{tie:'free',arc:.02,colOff:1,mono:true}},
];
async function exercise({spec,fonts,totalUsed,approved}){
 const r=await runLayoutsBFixture(J,{layout:'balloons',control:'off',ghost:true,...spec},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),base=r.plan.cuts[0],cut={...base,area:null,fullStagePlacement:true,placementLayoutsD:true},before=JSON.stringify(r.plan),budget={used:totalUsed};
 const inputRefs=new Set(),collect=v=>{if(v&&typeof v==='object'&&!inputRefs.has(v)){inputRefs.add(v);Object.values(v).forEach(collect);}};collect(r.plan);const flags=()=>Array.from(inputRefs,v=>[Object.isFrozen(v),Object.isSealed(v),Object.isExtensible(v)]),beforeFlags=flags();
 const region={id:'original4sec',start:0,end:4,circle:{cx:spec.W*.5,cy:spec.H*.42,r:Math.min(spec.W,spec.H)*.2}};
 let result;try{result=await J.placement.balloonsNativeTranslationDiagnostic03(r.renderer,r.plan,cut,{metricBudget:budget,region});}catch(e){result={status:/BUDGET/.test(e.code||'')?'budget-inconclusive':'unsupported-source-or-model',code:e.code||e.name,message:e.message,details:e.details||null,certificate:false};}
 if(result.sourceCatalog){const binding=Object.fromEntries(Object.keys(approved.nativeCatalogBinding).map(k=>[k,result.sourceCatalog[k]]));if(JSON.stringify(binding)!==JSON.stringify(approved.nativeCatalogBinding))throw Error('Original approved native catalog/font/rows changed '+spec.seed);}
 const actual=[],containmentFailures=[],clean=v=>JSON.parse(JSON.stringify(v,(_,x)=>typeof x==='function'?undefined:x));
 if(result.ledger){
  const A=J.placement,buf=new ArrayBuffer(8),f=new Float64Array(buf),u=new BigUint64Array(buf),previous=x=>{f[0]=x;u[0]-=1n;return f[0];},onset=result.branches.branches[0].onset,times=[0,onset,.05+.45*13/24,1.5,3.6,3.8,previous(4),4],pointIn=(p,poly)=>{let pos=false,neg=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],c=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(c>1e-6)pos=true;if(c< -1e-6)neg=true;}return !(pos&&neg);};
  for(const pass of result.domain.passes)for(const lt of times)for(const scale of [.5,1,2]){
   const cv=document.createElement('canvas');cv.width=Math.round(spec.W*scale);cv.height=Math.round(spec.H*scale);const ctx=cv.getContext('2d');ctx.scale(scale,scale);
   const env=r.renderer.makeEnv(ctx,r.plan,cut,cut.palette,{pass:pass.pass,passColor:pass.pass==='A'?'#e9529e':'#4bcade',t:lt,realTime:lt+pass.lag,lt,ltb:lt+pass.lag,step:0,scale,allowFilter:false}),motion=cut.motionScale??1,cam=J.CAMERA.push.get(env,cut.camP||{}),cs=J.lerp(1,cam.s??1,motion)*(cut.contentScale??1),dx=pass.off[0]*result.domain.chroma*spec.H/1080*motion,dy=pass.off[1]*result.domain.chroma*spec.H/1080*motion;
   ctx.translate(spec.W/2+dx,spec.H/2+dy);ctx.scale(cs,cs);ctx.translate(-spec.W/2,-spec.H/2);const rootMatrix=ctx.getTransform(),program=A.record(r.renderer,env),selectorActive=J.lyricCutsAt(r.plan,lt).some(v=>v.index===cut.index),events=[];
   if(!program.measurementSupported)throw Error('Actual source record unsupported '+JSON.stringify(program.diagnostics));
   for(const event of program.events){
    const supports=result.ledger.filter(v=>v.pass===pass.pass&&v.sourceRange[0]<=lt&&lt<=v.sourceRange[1]&&(v.owner===event.owner||v.owner.startsWith(event.owner+'.'))),supportHull=supports.length===1?supports[0].polygon:[],physical=[];
    const physicalSegments=[],segmentMissing=[];
    if(event.kind==='line'){
     const points=event.args[0],state=event.args[4],width=event.args[2],m=event.matrix;if(points.length!==11||state.miterLimit!==10||state.dash.length||state.dashOffset!==0||event.state.lineCap!=='butt'||event.state.lineJoin!=='miter'||!Number.isFinite(width)||width<=0)throw Error('Exact native11point butt/miter10 solid stroke required');
     // Independently reconstruct each physical segment and its endpoint/join cap.
     // A radius halfWidth*miterLimit encloses every admitted miter, including
     // bevel fallback; endpoint squares conservatively contain the butt caps.
     const guard=width/2*state.miterLimit;
     for(let index=0;index<10;index++){
      const vertices=[];for(const p of [points[index],points[index+1]])for(const x of [-guard,guard])for(const y of [-guard,guard]){const q=A.point(m,[p[0]+x,p[1]+y]);for(const ax of [-1,1])for(const ay of [-1,1])vertices.push([(q[0]+ax)/scale,(q[1]+ay)/scale]);}
      const segmentSupports=supports.filter(v=>v.owner===event.owner+'.'+index),hull=segmentSupports.length===1?segmentSupports[0].polygon:[],missing=selectorActive?vertices.filter(p=>!hull.length||!pointIn(p,hull)):[];segmentMissing.push(...missing);physical.push(...vertices);physicalSegments.push({index,owner:event.owner+'.'+index,vertices,matchingCells:segmentSupports.length,contained:selectorActive?missing.length===0:null});
     }
    }else for(const polygon of event.polygons||[])for(const p of polygon)physical.push([p[0]/scale,p[1]/scale]);
    const missing=selectorActive?(event.kind==='line'?segmentMissing:physical.filter(p=>!supportHull.length||!pointIn(p,supportHull))):[],bounds=supports.length?A.bounds(supports.map(v=>v.polygon)):null,recorderBoundsContainment=selectorActive&&bounds?(event.polygons||[]).flat().every(p=>p[0]/scale>=bounds.x0-1e-7&&p[0]/scale<=bounds.x1+1e-7&&p[1]/scale>=bounds.y0-1e-7&&p[1]/scale<=bounds.y1+1e-7):null;
    if(selectorActive&&missing.length)containmentFailures.push({pass:pass.pass,lt,scale,owner:event.owner,kind:event.kind,missing,supports:supports.length});
    events.push({event:clean(event),callbackRetained:event.kind==='item'&&typeof event.args[0].charFn==='function',physicalSupportVertices:physical,physicalSegments,containment:selectorActive?missing.length===0:null,recorderBoundsContainment,matchingOwnerCells:supports.length,comparison:event.kind==='line'?'independent native physical segment+join support against SAME .string.k cell; whole-line recorder AABB retained separately and excluded from persegment geometry requirement':'actual recorder polygon vertices',sourceSelectorActive:selectorActive});
   }
   actual.push({pass:pass.pass,lt,ltb:lt+pass.lag,scale,selectorActive,forcedOutsideSelector:!selectorActive,actualEffectiveFX:clean(env.fx),cam:clean(cam),cs,actualPassShift:[dx,dy],root:[rootMatrix.a,rootMatrix.b,rootMatrix.c,rootMatrix.d,rootMatrix.e,rootMatrix.f],catalog:clean(program.nativeDGeometry),events});cv.width=cv.height=1;
  }
 }
 const sourceUnchanged=JSON.stringify(r.plan)===before&&JSON.stringify(flags())===JSON.stringify(beforeFlags);if(!sourceUnchanged)throw Error('Source input state changed');
 return {spec,sourcePlan:clean(r.plan),region,result,actual,containmentFailures,sourceUnchanged,totalMetricKeysUsed:budget.used,fontAudit:window.layoutsBFixtureFontAudit};
}
(async()=>{
 assert.equal(process.env.BALLOONS_DIAGNOSTIC03_RELEASE,'PARENT_REVIEWED_SOURCE_RUNNER');
 const pins=JSON.parse(fs.readFileSync(path.join(dir,'evidence/baseline-pins03.json'))),seal=JSON.parse(fs.readFileSync(path.join(dir,'evidence/pre-run-seal03.json'))),target=path.join(targetDir,'diagnostic03.raw.json.gz');assert(!fs.existsSync(target),'Never overwrite raw');
 const check=()=>{for(const p of pins.files)assert.equal(sha(fs.readFileSync(path.join(root,p.path))),p.sha256,'source changed '+p.path);for(const p of pins.runtimeExternalPins)assert.equal(sha(fs.readFileSync(p.path)),p.sha256,'runtime changed '+p.path);for(const p of seal.files)assert.equal(sha(fs.readFileSync(path.join(dir,p.path))),p.sha256,'sealed source changed '+p.path);for(const p of pins.absent24)assert(!fs.existsSync(path.join(root,p)),'Retained absent artifact reappeared '+p);assert.equal(sha(fs.readFileSync(path.join(root,pins.pycache.path))),pins.pycache.sha256);};check();
 const canonical=fs.readFileSync(path.join(root,'index.html'),'utf8'),helper=fs.readFileSync(path.join(dir,'src/balloons-diagnostic03.js'),'utf8'),html=canonical.replace('</body>','<script>\n'+helper+'\n</script>\n</body>'),fonts=JSON.parse(fs.readFileSync(path.join(root,'dev/avoidance/layouts-c-editorial-fonts/manifest.json'))),assets=new Map([['/native.html',Buffer.from(html)]]);assert.notEqual(html,canonical);
 for(const face of fonts.faces){const url=new URL(face.url,'http://127.0.0.1'),p=url.pathname.slice(1),b=fs.readFileSync(path.join(root,p));assert.equal(url.origin,'http://127.0.0.1');assert.equal(sha(b),face.sourceSHA256);assert(!assets.has(url.pathname));assets.set(url.pathname,b);}
 fs.mkdirSync(targetDir,{recursive:true});const invocation={at:new Date().toISOString(),pins,seal,specs,htmlSHA256:sha(html),helperSHA256:sha(helper),outputRoot:targetDir};fs.writeFileSync(path.join(targetDir,'diagnostic03.invocation.json'),JSON.stringify(invocation,null,2),{flag:'wx'});
 let server,browser,summary=null;const requests=[],results=[],errors=[];
 try{
  server=http.createServer((q,res)=>{const pathname=new URL(q.url,'http://127.0.0.1').pathname,b=assets.get(pathname);requests.push({pathname,status:b?200:404});res.writeHead(b?200:404,{'Content-Type':pathname.endsWith('.html')?'text/html':pathname.endsWith('.ttf')?'font/ttf':'font/otf'});res.end(b||'');});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const origin='http://127.0.0.1:'+server.address().port;browser=await require(path.join(root,'dev/browser.cjs')).launch({executablePath:pins.browser.path});const page=await browser.newPage();await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());await page.goto(origin+'/native.html');await page.waitForFunction(()=>window.J?.ui?.plan);await page.addScriptTag({content:fs.readFileSync(path.join(root,'dev/avoidance/layouts-b-fixture.js'),'utf8')});
  const approvedCases=JSON.parse(fs.readFileSync(path.join(dir,'evidence/approved-native-cases03.json')));
  let totalUsed=0;for(const spec of specs){const result=await page.evaluate(exercise,{spec,fonts,totalUsed,approved:approvedCases.find(v=>v.seed===spec.seed)});results.push(result);totalUsed=result.totalMetricKeysUsed;console.log(JSON.stringify({seed:spec.seed,status:result.result.status,metricKeys:result.result.metricKeys,ledger:result.result.ledger?.length||0,containmentFailures:result.containmentFailures.length}));}
  summary={cases:results.length,firstCaseFullMetrics:results[0]?.result.status==='diagnostic-only',totalMetricKeys:totalUsed,containmentFailures:results.reduce((n,v)=>n+v.containmentFailures.length,0),certificates:0,adapterIncrement:0,publicChecks:0};
 }catch(e){errors.push({name:e.name,message:e.message,stack:e.stack});}finally{if(browser)await browser.close();if(server)await new Promise(ok=>server.close(ok));}
 try{check();}catch(e){errors.push({postPinFailure:e.message});}fs.writeFileSync(target,zlib.gzipSync(JSON.stringify({invocation,requests,results,summary,errors}),{mtime:0}),{flag:'wx'});console.log(JSON.stringify({target,bytes:fs.statSync(target).size,summary,errors}));assert.equal(errors.length,0);assert(summary?.firstCaseFullMetrics,'First case must complete all metrics/cells');assert.equal(summary?.containmentFailures,0,'Actual native source must fit diagnostic model');
})().catch(e=>{console.error(e);process.exitCode=1;});
