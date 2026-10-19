/* AVOID-006 native A26 matrix: certified, insufficient and unsupported remain distinct. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),root=path.resolve(__dirname,'../..'),oracle=require('./oracle.cjs');
(async()=>{
 const compiled=fs.readFileSync(path.join(root,'index.html')),fixtureSource=fs.readFileSync(path.join(__dirname,'layouts-a-fixture.js'),'utf8'),compiledSHA256=crypto.createHash('sha256').update(compiled).digest('hex'),fixtureSHA256=crypto.createHash('sha256').update(fixtureSource).digest('hex');
 const server=http.createServer((req,res)=>{try{const file=req.url==='/font.otf'?'/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc':path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':'application/octet-stream');res.end(file===path.join(root,'index.html')?compiled:fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await require('../browser.cjs').launch();
 try{
  const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForFunction(()=>J?.ui?.plan);await page.addScriptTag({content:fixtureSource});
  const result=await page.evaluate(async()=>{
   const A=J.placement,fontURL=location.origin+'/font.otf',rows=[],colorRGB=color=>{const c=document.createElement('canvas'),x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,1,1);return [...x.getImageData(0,0,1,1).data].slice(0,3);};
   for(const light of [false,true])for(const layout of ['splitScreen','subtitleBar']){
    const baseSpec={layout,W:1920,H:1080,text:'光',cx:0,cy:0,radius:.02,params:layout==='splitScreen'?{split:'v',side:1,plate:'fg'}:{place:'bar',bar:.13}},native=await runLayoutsAFixture(J,baseSpec,{newPath:false,fontURL});
    Object.assign(native.plan.style.schemes[0],light?{bg:'#ffffff',fg:'#101820',sub:'#637080',ink:'#edf1f6',dim:'#c7cdd4'}:{bg:'#151923',fg:'#ffffff',sub:'#a6b2c2',ink:'#e6edf7',dim:'#384354'});
    const cut={...native.plan.cuts[0],placementLayoutsA:true,placementUnits:true,fullStagePlacement:true},ctx=document.createElement('canvas').getContext('2d'),env=native.renderer.makeEnv(ctx,native.plan,cut,cut.palette,{pass:'main',t:1.5,lt:1.5,ltb:1.5,scale:1}),program=A.record(native.renderer,env),lyricEvents=program.events.filter(e=>e.args[0]?.placementMain),copyEvent=program.events.find(e=>e.kind==='item'&&!e.args[0]?.placementMain&&e.args[0]?.text==='光'),reference=A.bounds(layout==='splitScreen'?lyricEvents.flatMap(e=>e.polygons):copyEvent.polygons);
    let selected;
    for(const delta of [10,15,5,20,0,-10]){const cx=(reference.x1+delta)/1920;native.plan.lyricAvoidanceIndex={...native.plan.lyricAvoidanceIndex,regions:native.plan.lyricAvoidanceIndex.regions.map(region=>({...region,center:{x:cx,y:.5}}))};const plan=J.finalizePlacementPlan(native.plan,{layoutsA:true}),tr=plan.cuts[0].placementTrajectory,segment=tr?.units[0].segments[0];if(tr?.safety==='certified-bounded-adapter'&&Math.hypot(...segment.from)>1){const r={...native,plan},beforeAudit=auditLayoutsAPrimary(native,1.5,{native:true}),afterAudit=auditLayoutsAPrimary(r,1.5);if(beforeAudit.conflictPixels>0&&afterAudit.marginConflictPixels===0){selected={r,offset:segment.from,beforeAudit,afterAudit};break;}}}
    if(!selected){rows.push({layout,light,error:'No real native collision resolved by admitted joint movement'});continue;}
    const {r,offset,beforeAudit,afterAudit}=selected,mask=document.createElement('canvas');mask.width=1920;mask.height=1080;const mx=mask.getContext('2d'),original=A.replay;let active;
    A.replay=(env,program,delta,decor)=>{if(env.pass==='main'){active={env,program};const maskEnv=r.renderer.makeEnv(mx,r.plan,env.cut,env.sc,{...env,ctx:mx,placementRecorder:null});original(maskEnv,{...program,events:program.events.filter(e=>e.args[0]?.placementMain)},delta,decor);}return original(env,program,delta,decor);};
    try{r.renderer.frame(r.canvas.getContext('2d'),r.plan,1.5,{noHud:true,noPost:true});}finally{A.replay=original;}
    const image=mx.getImageData(0,0,1920,1080).data,sc=r.plan.style.schemes[0],plate=active.program.events.find(e=>e.role==='independentDecor'&&e.owner.endsWith(layout==='splitScreen'?'.inversion-field':'.letterbox')),expectedLeft=colorRGB(sc.fg),expectedRight=colorRGB(sc.bg);let checked=0,wrong=0,left=0,right=0;
    if(layout==='splitScreen')for(let y=0;y<1080;y++)for(let x=0;x<1920;x++){const i=(y*1920+x)*4;if(image[i+3]<254||Math.abs(x+.5-960)<2)continue;const expected=x<960?expectedLeft:expectedRight;if(x<960)left++;else right++;checked++;if(expected.some((v,j)=>Math.abs(v-image[i+j])>2))wrong++;}
    if(layout==='subtitleBar'){const bottom=active.program.events.filter(e=>e.role==='independentDecor'&&e.owner.endsWith('.letterbox')&&e.kind==='rect').find(e=>e.args[1]>540),top=A.point(bottom.matrix,[bottom.args[0],bottom.args[1]])[1],a=J.contrast(sc.bg,bottom.args[4]),b=J.contrast(sc.fg,bottom.args[4]),expected=colorRGB(a>=b?sc.bg:sc.fg);for(let y=0;y<1080;y++)for(let x=0;x<1920;x++){const i=(y*1920+x)*4;if(image[i+3]<254)continue;checked++;if(y+.5<top||expected.some((v,j)=>Math.abs(v-image[i+j])>2))wrong++;}}
    const clips=active.program.events.filter(e=>e.args[0]?.placementMain).flatMap(e=>e.clips||[]),boundariesFixed=layout==='splitScreen'?clips.length===2&&clips.every(c=>c.worldFixed):Math.abs(offset[1])<1e-9&&!!plate;
    rows.push({layout,light,offset,beforeAudit,afterAudit,checked,wrong,left,right,boundariesFixed,passed:boundariesFixed&&checked>0&&wrong===0&&(layout!=='splitScreen'||left>0&&right>0)});
   }
   return {passed:rows.every(r=>r.passed),rows};
  });
  console.log(JSON.stringify({...result,compiledSHA256,fixtureSHA256}));assert.ok(result.passed,'A26 light/dark contrast binding failed');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
