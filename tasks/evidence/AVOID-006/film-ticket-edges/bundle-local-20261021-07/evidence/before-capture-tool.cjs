/* AVOID-006: fixed 8193 baseline, native 24fps PNG->MP4, numeric motion/ownership audit. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../..'),evidence='tasks/evidence/AVOID-006/film-ticket-edges',baseCommit='8193b0580a03f19472637807231685728d0718d7',film=require('./film-review.cjs');
const specs=[];
for(const [W,H]of [[1920,1080],[1080,1920]])for(const radius of [.05,.2])specs.push({id:`film-${W}-${radius}`,layout:'filmstrip',W,H,radius,cx:.5,cy:W>H?.42:.5,text:'風の先へ',params:{dir:-1,tilt:0}});
for(const [W,H,radius]of [[1920,1080,.2],[1080,1920,.05]])specs.push({id:`film-long-${W}`,layout:'filmstrip',W,H,radius,cx:.5,cy:W>H?.42:.5,text:'風の先へ歩いて行こう',params:{dir:1,tilt:0}});
for(const [W,H,radius,cy]of [[1920,1080,.2,.42],[1080,1920,.05,.5],[1920,1080,.2,.78]])specs.push({id:`ticket-${W}-${cy}`,layout:'ticket',W,H,radius,cx:.5,cy,text:'風の先へ',params:{tilt:3}});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),json=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
async function main(){
 const [side='after',mode='test']=process.argv.slice(2);assert.ok(['before','after'].includes(side));assert.ok(['test','capture'].includes(mode));
 const dir=path.join(root,evidence,side);fs.mkdirSync(dir,{recursive:true});
 if(mode==='capture'){assert.ok(!fs.existsSync(path.join(dir,'capture-tool.cjs')),'fresh capture tool snapshot');fs.copyFileSync(__filename,path.join(dir,'capture-tool.cjs'));}
 const source=side==='before'?fs.readFileSync(path.join(root,evidence,'baseline/index.html')):fs.readFileSync(path.join(root,'index.html'));
 if(side==='before')assert.equal(sha(source),sha(cp.execFileSync('git',['show',baseCommit+':index.html'],{cwd:root,maxBuffer:30e6})));
 fs.writeFileSync(path.join(dir,'engine.html'),require('./layouts-a-review.cjs').normalizeAppHTML(source));
 const server=http.createServer((req,res)=>{try{const p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);assert.ok(p.startsWith(root+'/'));res.end(fs.readFileSync(p));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port,browser=await require('../browser.cjs').launch(),rows=[];
 const selected=mode==='test'&&side==='after'?specs.concat([1920,1080].flatMap(W=>[-1,1].flatMap(dir=>[-3,0,3].map(tilt=>({id:`film-matrix-${W}-${dir}-${tilt}`,layout:'filmstrip',W,H:W===1920?1080:1920,radius:W===1920?.2:.05,cx:.5,cy:W===1920?.42:.5,text:'風の先へ',params:{dir,tilt}}))))):specs;
 try{for(const spec of selected){
  const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await page.goto(base+'/'+evidence+'/'+side+'/engine.html');await page.addScriptTag({url:base+'/dev/avoidance/layouts-a-fixture.js'});
  const result=await page.evaluate(async({spec,base})=>{
   const fontRoot=base+'/review/AVOID-006/local-20261020-04/fixtures/';const info=await (await fetch(fontRoot+'font-symbols.json')).json();document.fonts.add(await new FontFace('Avoid006Fixture',`url(${fontRoot}font-symbols.ttf)`,{unicodeRange:info.unicodeRange}).load());
   window.result=await runLayoutsAFixture(J,spec,{adaptive:true,fontURL:fontRoot+'font.otf'});const r=result,source=r.plan.cuts[0],segment=source.placementTrajectory?.units[0].segments[0],recipe=segment?.composition;
   const cut={...source,placementTrajectory:undefined,layoutARecipe:recipe,placementUnits:true,placementLayoutsA:true,fullStagePlacement:true,placementAdaptiveTrial:true};
   const samples=[0,.05,.12,.24,.28,.6,1.5,2.5,3.6,3.93].map(time=>{const ctx=J.placement.measurementContext();ctx.reset();const env=r.renderer.makeEnv(ctx,r.plan,cut,r.plan.style.schemes[0],{pass:'main',t:time,realTime:time,lt:time,ltb:time,pIn:Math.min(1,time/cut.inDur),pOut:Math.max(0,(time-cut.dur+cut.outDur)/cut.outDur),scale:1,allowFilter:false});const p=J.placement.record(r.renderer,env);if(!p.measurementSupported)throw Error(JSON.stringify(p.diagnostics));return {time,events:p.events.filter(e=>e.role==='primary').map(e=>({kind:e.kind,args:e.args,matrix:e.matrix,nativeMotion:e.nativeMotion,polygons:e.polygons}))};});
   window.sampleEdgesGeometry=function(time){const holdGeometry=[];const original=J.placement.replay;J.placement.replay=function(env,program,offset,...rest){const point=(matrix,p)=>{const q=J.placement.point(matrix,p);return [q[0]+offset[0],q[1]+offset[1]];},corners=e=>{const [x,y,w,h]=e.args;return [[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(p=>point(e.matrix,p));},band=program.events.find(e=>e.role==='primary'&&e.kind==='rect'),exposures=program.events.filter(e=>e.kind==='rrect'&&Math.abs(e.args[4]/Math.min(e.args[2],e.args[3])-.04)<1e-8),holes=program.events.filter(e=>e.kind==='rrect'&&!exposures.includes(e));if(spec.layout==='filmstrip')holdGeometry.push({time,motionTime:env.t,offset,band:corners(band),exposures:exposures.map(corners),holes:holes.map(e=>point(e.matrix,[e.args[0]+e.args[2]/2,e.args[1]+e.args[3]/2])),main:program.events.filter(e=>e.kind==='item'&&e.args[0].placementMain).flatMap(e=>e.polygons.map(p=>p.map(q=>[q[0]+offset[0],q[1]+offset[1]])))});return original(env,program,offset,...rest);};try{r.renderer.frame(r.canvas.getContext('2d'),r.plan,time,{noHud:true,noPost:true});}finally{J.placement.replay=original;}return holdGeometry;};const holdGeometry=[.75,1.5,2.5,3.5].flatMap(window.sampleEdgesGeometry);
   const audits=[.125,1.5,3.75].map(t=>auditLayoutsAPrimary(r,t));return {status:segment?.status,recipe,segment,params:cut.params,samples,audits,holdGeometry};
  },{spec,base});
  if(side==='after')checkNumeric(spec,result);
  let encoder=null,video;
  if(mode==='capture'){video=spec.id+'.mp4';assert.ok(!fs.existsSync(path.join(dir,video)),'fresh video required');encoder=cp.spawn('ffmpeg',film.encodeArgs(path.join(dir,video)),{stdio:['pipe','ignore','pipe']});let stderr='';encoder.stderr.on('data',b=>stderr+=b);encoder.done=new Promise((resolve,reject)=>encoder.on('exit',code=>code===0?resolve():reject(Error(stderr))));}
  const frames=[];
  for(let n=0;n<(mode==='capture'?96:3);n++){const time=mode==='capture'?n/24:[.125,1.5,3.75][n];const frame=await page.evaluate(time=>{const observations=[];result.renderer.frame(result.canvas.getContext('2d'),result.plan,time,{noHud:true,noPost:true,placementObservation:o=>observations.push(o)});const png=result.canvas.toDataURL();const geometry=window.sampleEdgesGeometry(time);return {png:result.canvas.toDataURL(),nativePNG:png,observations,geometry};},time);
   const certified=['safe','safe-hold'].includes(result.status);if(side==='after'&&certified)for(const o of frame.observations){assert.equal(o.envelopeCovered,true,spec.id+' envelope '+time);assert.equal(o.strictCircleClear,true,spec.id+' strict '+time);const circle={cx:spec.cx*spec.W,cy:spec.cy*spec.H,r:spec.radius*Math.min(spec.W,spec.H)};for(const p of o.strictPolygons)assert.ok(require('./oracle.cjs').polygonClear(circle,p,Math.max(2,.005*Math.min(spec.W,spec.H))),'independent strict polygon '+spec.id);}
   if(side==='after'&&spec.layout==='filmstrip'&&certified){const geometry=frame.geometry.filter(g=>g.motionTime>=.6&&g.motionTime<=3.6);checkNumeric(spec,{...result,holdGeometry:geometry});}const raw=Buffer.from(frame.nativePNG.split(',')[1],'base64');if(encoder&&!encoder.stdin.write(raw))await new Promise(r=>encoder.stdin.once('drain',r));
   if([3,36,90].includes(n)&&mode==='capture'){fs.writeFileSync(path.join(dir,spec.id+'-'+n+'.png'),raw);json(path.join(dir,spec.id+'-'+n+'.json'),frame.observations);}
   frames.push({time,holdGeometry:frame.geometry,nativePNG:sha(Buffer.from(frame.nativePNG.split(',')[1],'base64')),observations:frame.observations.map(o=>({envelopeCovered:o.envelopeCovered,strictCircleClear:o.strictCircleClear,rawCircleClear:o.rawCircleClear,eventCount:o.events?.length}))});
  }
  if(encoder){encoder.stdin.end();await encoder.done;film.checkMP4(path.join(dir,video),{frames:96,duration:4});}
  rows.push({spec,...result,frames,video});json(path.join(dir,'report.json'),{baseline:baseCommit,side,mode,sourceSHA256:sha(source),toolSHA256:sha(fs.readFileSync(mode==='capture'?path.join(dir,'capture-tool.cjs'):__filename)),fixtureSHA256:sha(fs.readFileSync(path.join(root,'dev/avoidance/layouts-a-fixture.js'))),fps:24,rows});await page.close();console.log(JSON.stringify({id:spec.id,status:result.status,strategy:result.recipe?.strategy,audits:result.audits}));
 }
 }finally{await browser.close();await new Promise(r=>server.close(r));}
 return rows;
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={specs,checkNumeric};

function checkNumeric(spec,r){
 // Canvas recorder matrices round to Float32 precision; stage-pixel tolerance.
 const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-4,`${spec.id} ${label}: ${a} != ${b}`),port=spec.H>spec.W*1.08;
 if(['safe','safe-hold'].includes(r.status))for(const a of r.audits){assert.equal(a.strictConflictPixels,0,spec.id+' strict alpha-1');assert.equal(a.strictMarginConflictPixels,0,spec.id+' strict margin alpha-1');}
 if(spec.layout==='filmstrip'){
  if(spec.id.includes('matrix'))assert.ok(['safe','safe-hold'].includes(r.status),spec.id+' certified direction/tilt control');
  const axis=port?1:0,across=1-axis,A=port?spec.H:spec.W;
  for(const s of r.samples){const frames=s.events.filter(e=>e.kind==='rrect'&&Math.abs(e.args[4]/Math.min(e.args[2],e.args[3])-.04)<1e-8);assert.equal(frames.length,3);for(const f of frames)near(port?f.args[3]/f.args[2]:f.args[2]/f.args[3],1.5,'Leica aspect');}
  if(!['safe','safe-hold'].includes(r.status))return;
  for(const g of r.holdGeometry){
   const polygon=g.band,at=edge=>{const intersections=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];if((a[axis]<=edge&&b[axis]>=edge)||(b[axis]<=edge&&a[axis]>=edge)){if(a[axis]!==b[axis]){const t=(edge-a[axis])/(b[axis]-a[axis]);intersections.push(a[across]+t*(b[across]-a[across]));}}}return intersections;};
   for(const edge of [0,A]){const span=at(edge).sort((a,b)=>a-b);assert.ok(span.length>=2&&span.at(-1)>0&&span[0]<(port?spec.W:spec.H),spec.id+' continuous band crosses edge '+edge+' at '+g.time);}
   // Keep every exposure window and main glyph on-screen during the hold.
   for(const p of g.exposures.flat().concat(g.main.flat()))assert.ok(p[0]>=-1e-5&&p[0]<=spec.W+1e-5&&p[1]>=-1e-5&&p[1]<=spec.H+1e-5,spec.id+' hold exposure/main fit '+JSON.stringify(p));
   if(r.recipe){const hs=g.holes.map(p=>p[axis]).sort((a,b)=>a-b),pitch=r.recipe.film.band*.11;assert.ok(hs[0]<pitch*2&&hs.at(-1)>A-pitch*2,spec.id+' sprockets reach both edges');}
  }
 }else if(r.recipe){
  const tr=r.recipe.ticket,nativeW=Math.min(spec.W*(port?.9:.74),spec.H*1.9),nativeH=Math.min(nativeW*(port?.46:.38),spec.H*.5);near(tr.tearOffset[0],nativeW*.12,'native tear X');near(tr.tearOffset[1],nativeH*.2,'native tear Y');near(tr.tearTurn,12,'native tear angle');
  const stub=t=>r.samples.find(s=>s.time===t).events.find(e=>e.nativeMotion==='ticket-stub'),body=t=>r.samples.find(s=>s.time===t).events.find(e=>e.nativeMotion==='ticket-body');
  for(const time of [1.5,3.93]){const s=stub(time),b=body(time),eOut=Math.pow(Math.max(0,(time-3.6)/.4),3),dx=s.matrix[4]-b.matrix[4],dy=s.matrix[5]-b.matrix[5],angle=Math.atan2(b.matrix[1],b.matrix[0]);near(dx,Math.cos(angle)*tr.tearOffset[0]*eOut-Math.sin(angle)*tr.tearOffset[1]*eOut,'drawn tear X');near(dy,Math.sin(angle)*tr.tearOffset[0]*eOut+Math.cos(angle)*tr.tearOffset[1]*eOut,'drawn tear Y');near(Math.atan2(s.matrix[1],s.matrix[0])-angle,eOut*12*Math.PI/180,'drawn tear angle');}
 }
}
