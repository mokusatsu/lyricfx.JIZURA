/* Fault injection checks the dedicated inscription field admission, not pixels. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{const report=path.join(root,process.env.OBJECTS_NEGATIVE_REPORT||'tasks/evidence/AVOID-008/objects/writing-copy-negative01.json');assert(!fs.existsSync(report));const fontsDir=path.join(__dirname,'layouts-c-objects-fonts-v2'),fonts=JSON.parse(fs.readFileSync(path.join(fontsDir,'manifest.json'))),pins=['src/09i_layoutsC_objects.js','src/11p_layoutsC.js','index.html','dev/avoidance/layouts-c-objects-writing-copy-negative.cjs'].map(file=>({file,sha256:sha(fs.readFileSync(path.join(root,file)))}));const server=http.createServer((req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;res.end(fs.readFileSync(p.startsWith('/fonts/')?path.join(fontsDir,p.slice(7)):path.join(root,p==='/'?'index.html':p)));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;try{browser=await require('../browser.cjs').launch({executablePath:'/usr/bin/chromium'});const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForFunction(()=>J?.ui?.plan);await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'layouts-b-fixture.js'),'utf8')});const rows=await page.evaluate(async fonts=>{const rows=[];
for(const fault of ['main-space','main-replace','main-order','main-mi','main-font']){
 const spec={layout:'letterPaper',W:540,H:960,radius:.2,text:'風の先へ',params:{font:'gothic_med'}};
 const r=await runLayoutsBFixture(J,spec,{newPath:false,fonts,renderInitial:false,exportDataURL:false});
 for(const f of Object.values(J.FONTS))f.fb=fonts.fallbackFamilies.map(n=>'"'+n+'"').join(',');J.metrics.clear();J.glyphs.clear();
 const saved=J.placement.record;let changed=0;
 try{J.placement.record=(renderer,env,...args)=>{const p=saved(renderer,env,...args);
 if(env.cut.layoutCRecipe?.letterWritingScale!=null){
  const rule=p.events.find(e=>e.nativeCBody?.inscriptionRule),main=p.events.find(e=>e.kind==='item'&&e.args[0].placementMain);
  if(fault==='main-space')main.args[0].text=main.args[0].text[0]+' '+main.args[0].text.slice(1);
  if(fault==='main-replace')main.args[0].text=main.args[0].text.replace('風','海');
  if(fault==='main-order')main.args[0].text=[...main.args[0].text].reverse().join('');
  if(fault==='main-mi')main.args[0].mi=(main.args[0].mi||0)+1;
  if(fault==='main-font')main.args[0].font='mono';
  changed++;
 }return p;};
 const plan=J.finalizePlacementPlan(r.plan,{layoutsC:true}),tr=plan.cuts[0].placementTrajectory;
 rows.push({spec,fault,changed,safety:tr?.safety,attempts:tr?.units[0].segments[0].attempts,diagnostics:plan.placementFinalization.diagnostics});
 }finally{J.placement.record=saved;}
}return rows;},fonts);
const failures=rows.filter(r=>r.changed<1||r.safety!=='insufficient-space'||r.attempts.filter(a=>a.status==='rejected'&&a.reason===(['main-replace','main-order'].includes(r.fault)?'C_OBJECT_SOURCE_COVERAGE':'C_OBJECT_SOURCE_MAPPING')).length!==r.changed);
for(const p of pins)assert.equal(sha(fs.readFileSync(path.join(root,p.file))),p.sha256);fs.writeFileSync(report,JSON.stringify({scope:'Dedicated actual main text injected with meaningful space, substituted glyph, reordered characters, altered mi and forged font. All recorded dedicated candidates must reject. Not visual acceptance.',pins,rows,failures},null,2));console.log(JSON.stringify({cases:rows.length,failures}));assert.equal(failures.length,0);}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
