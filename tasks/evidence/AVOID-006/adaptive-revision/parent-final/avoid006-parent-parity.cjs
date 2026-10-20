const fs=require('node:fs'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root='/workspace/lyricfx.JIZURA',baseline='/workspace/work/avoid006-adaptive-before';
const oracle=require(root+'/dev/avoidance/oracle.cjs'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const raw={before:fs.readFileSync(baseline+'/index.html'),after:fs.readFileSync(root+'/index.html')};
const html=Object.fromEntries(Object.entries(raw).map(([k,b])=>[k,b.toString().replace('id="app"','id="parent-a26-fixture"').replace('<link rel="preconnect" href="https://fonts.googleapis.com">\n','').replace('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n','')]));
const fixture=fs.readFileSync(root+'/dev/avoidance/layouts-a-fixture.js','utf8'),basic=fs.readFileSync(root+'/dev/avoidance/basic-fixture.js','utf8'),anchors=require(root+'/dev/avoidance/layouts-a-anchors.json');
const server=http.createServer((req,res)=>{if(req.url==='/font.otf'){res.end(fs.readFileSync('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'));return;}const side=req.url.slice(1);if(html[side]){res.setHeader('Content-Type','text/html');res.end(html[side]);}else res.writeHead(404).end();});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await require(root+'/dev/browser.cjs').launch();
 const report={baselineCommit:'06b87459822ac5bc6395e20b8eeb4a47cf12cb57',hashes:Object.fromEntries(Object.entries(raw).map(([k,b])=>[k,sha(b)])),fixtureSHA256:sha(fixture),comparisons:[],a26:[],failures:[]};
 try{
  const sides={};
  for(const side of ['before','after']){
   const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base+'/'+side);await page.waitForFunction(()=>window.J?.placement?.basicLayouts);await page.addScriptTag({content:fixture});await page.addScriptTag({content:basic});
   const checks=[];
   for(const layout of Object.keys(anchors))for(const time of [.17,1.73,3.87]){const value=await page.evaluate(async spec=>{const r=await runLayoutsAFixture(J,spec,{newPath:false,fontURL:location.origin+'/font.otf'});return r.canvas.toDataURL();},{layout,time});checks.push({type:'native26',layout,time,sha256:sha(value)});}
   for(const layout of await page.evaluate(()=>J.placement.basicLayouts))for(const time of [.17,1.73,3.87]){const value=await page.evaluate(async spec=>{const r=await runBasicFixture(J,spec,{fontURL:location.origin+'/font.otf'});return {data:r.canvas.toDataURL(),safety:r.observation.safety};},{layout,time});checks.push({type:'staged-basic16',layout,time,sha256:sha(value.data),safety:value.safety});}
   sides[side]=checks;
   const accepted=Object.values(anchors).filter(s=>!['justified','subtitleBar','splitScreen','sideways','panels','filmstrip','quote','ticket'].includes(s.layout));
   for(const spec of accepted)for(const time of [.17,1.73,3.87]){
    const value=await page.evaluate(async s=>{const r=await runLayoutsAFixture(J,s,{adaptive:true,fontURL:location.origin+'/font.otf'});return {data:r.canvas.toDataURL(),safety:r.observation.safety};},{...spec,time});checks.push({type:'accepted18-staged',layout:spec.layout,time,sha256:sha(value.data),safety:value.safety});
   }
   await page.close();
  }
  report.comparisons=sides.before.map((v,i)=>({...v,after:sides.after[i],equal:v.sha256===sides.after[i].sha256&&v.safety===sides.after[i].safety}));
  report.passed=report.failures.length===0&&report.comparisons.every(v=>v.equal);
  const dest='/workspace/work/avoid006-parent-parity.json';fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,nativeComparisons:report.comparisons.filter(r=>r.type==='native26').length,basicComparisons:report.comparisons.filter(r=>r.type==='staged-basic16').length,mismatches:report.comparisons.filter(r=>!r.equal),a26Cases:report.a26.length,actualFrames:report.a26.reduce((n,r)=>n+r.frames,0),polygons:report.a26.reduce((n,r)=>n+r.independentlyCheckedPolygons,0),failures:report.failures}));assert.ok(report.passed,'parent independent regression/geometry failed');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
