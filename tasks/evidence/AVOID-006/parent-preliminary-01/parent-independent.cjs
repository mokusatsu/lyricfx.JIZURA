const fs=require('node:fs'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root='/workspace/lyricfx.JIZURA',baseline='/workspace/work/avoid006-before';
const oracle=require(root+'/dev/avoidance/oracle.cjs'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const raw={before:fs.readFileSync(baseline+'/index.html'),after:fs.readFileSync(root+'/index.html')};
const html=Object.fromEntries(Object.entries(raw).map(([k,b])=>[k,b.toString().replace('id="app"','id="parent-a26-fixture"').replace('<link rel="preconnect" href="https://fonts.googleapis.com">\n','').replace('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n','')]));
const fixture=fs.readFileSync(root+'/dev/avoidance/layouts-a-fixture.js','utf8'),basic=fs.readFileSync(root+'/dev/avoidance/basic-fixture.js','utf8'),anchors=require(root+'/dev/avoidance/layouts-a-anchors.json');
const server=http.createServer((req,res)=>{if(req.url==='/font.otf'){res.end(fs.readFileSync('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'));return;}const side=req.url.slice(1);if(html[side]){res.setHeader('Content-Type','text/html');res.end(html[side]);}else res.writeHead(404).end();});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await require(root+'/dev/browser.cjs').launch();
 const report={baselineCommit:'b64ee11e9a762942643babd4f637ded8efdd8b42',hashes:Object.fromEntries(Object.entries(raw).map(([k,b])=>[k,sha(b)])),fixtureSHA256:sha(fixture),comparisons:[],a26:[],failures:[]};
 try{
  const sides={};
  for(const side of ['before','after']){
   const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base+'/'+side);await page.waitForFunction(()=>window.J?.placement?.basicLayouts);await page.addScriptTag({content:fixture});await page.addScriptTag({content:basic});
   const checks=[];
   for(const layout of Object.keys(anchors))for(const time of [.17,1.73,3.87]){const value=await page.evaluate(async spec=>{const r=await runLayoutsAFixture(J,spec,{newPath:false,fontURL:location.origin+'/font.otf'});return r.canvas.toDataURL();},{layout,time});checks.push({type:'native26',layout,time,sha256:sha(value)});}
   for(const layout of await page.evaluate(()=>J.placement.basicLayouts))for(const time of [.17,1.73,3.87]){const value=await page.evaluate(async spec=>{const r=await runBasicFixture(J,spec,{fontURL:location.origin+'/font.otf'});return {data:r.canvas.toDataURL(),safety:r.observation.safety};},{layout,time});checks.push({type:'staged-basic16',layout,time,sha256:sha(value.data),safety:value.safety});}
   sides[side]=checks;
   if(side==='after'){
    // Independent phases and output scales exercise the real renderer rather
    // than the interval preparation timestamp. Only certified routes can pass.
    for(const spec of Object.values(anchors)){
     const row=await page.evaluate(async spec=>{
      try{const r=await runLayoutsAFixture(J,spec,{fontURL:location.origin+'/font.otf'}),frames=[],units=r.plan.cuts[0].placementTrajectory?.units,canvas=document.createElement('canvas');
       for(const scale of [.1,.5,2,4])for(const time of [.07,.31,.77,1.91,3.49,3.93]){
        canvas.width=Math.round(r.plan.W*scale);canvas.height=Math.round(r.plan.H*scale);const observations=[];
        r.renderer.frame(canvas.getContext('2d'),r.plan,time,{scale,noHud:true,noPost:true,placementObservation:o=>observations.push({safety:o.safety,covered:o.envelopeCovered,polygons:o.polygons,pass:o.pass})});frames.push({scale,time,observations});
       }
       return {spec,safety:r.observation.safety,units,frames};
      }catch(e){return {spec,error:e.stack};}
     },spec);
     let polygons=0;const failures=[];
     if(row.error)failures.push({error:row.error});else{
      if(row.safety!=='certified-bounded-adapter')failures.push({safety:row.safety});
      const circle={cx:spec.W*spec.cx,cy:spec.H*spec.cy,r:Math.min(spec.W,spec.H)*spec.radius},margin=Math.max(2,.005*Math.min(spec.W,spec.H));
      for(const unit of row.units||[])for(const segment of unit.segments)for(const p of unit.envelopes){polygons++;if(!oracle.polygonClear(circle,p.map(v=>[v[0]+segment.from[0],v[1]+segment.from[1]]),margin))failures.push({kind:'interval oracle'});}
      for(const f of row.frames){if(!f.observations.length)failures.push({kind:'no actual render observation',scale:f.scale,time:f.time});for(const o of f.observations){if(!o.covered||o.safety!=='safe')failures.push({kind:'render status',scale:f.scale,time:f.time,covered:o.covered,safety:o.safety});for(const p of o.polygons){polygons++;if(!oracle.polygonClear(circle,p,margin))failures.push({kind:'actual-time oracle',scale:f.scale,time:f.time});}}}
     }
     const summary={layout:spec.layout,spec,frames:row.frames?.length||0,independentlyCheckedPolygons:polygons,failures};report.a26.push(summary);report.failures.push(...failures.map(f=>({layout:spec.layout,...f})));
     console.error('parent A26 checked '+spec.layout+' failures='+failures.length);
    }
   }
   await page.close();
  }
  report.comparisons=sides.before.map((v,i)=>({...v,after:sides.after[i],equal:v.sha256===sides.after[i].sha256&&v.safety===sides.after[i].safety}));
  report.passed=report.failures.length===0&&report.comparisons.every(v=>v.equal);
  const dest=root+'/tasks/evidence/AVOID-006/parent-independent.json';fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,nativeComparisons:report.comparisons.filter(r=>r.type==='native26').length,basicComparisons:report.comparisons.filter(r=>r.type==='staged-basic16').length,mismatches:report.comparisons.filter(r=>!r.equal),a26Cases:report.a26.length,actualFrames:report.a26.reduce((n,r)=>n+r.frames,0),polygons:report.a26.reduce((n,r)=>n+r.independentlyCheckedPolygons,0),failures:report.failures}));assert.ok(report.passed,'parent independent regression/geometry failed');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
