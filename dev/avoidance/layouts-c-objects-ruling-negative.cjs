/* Fault injection checks the dedicated inscription field admission, not pixels. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),root=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{const report=path.join(root,process.env.OBJECTS_NEGATIVE_REPORT||'tasks/evidence/AVOID-008/objects/ruling-negative03.json');assert(!fs.existsSync(report));const fontsDir=path.join(__dirname,'layouts-c-objects-fonts-v2'),fonts=JSON.parse(fs.readFileSync(path.join(fontsDir,'manifest.json'))),pins=['src/09i_layoutsC_objects.js','src/11p_layoutsC.js','index.html','dev/avoidance/layouts-c-objects-ruling-negative.cjs'].map(file=>({file,sha256:sha(fs.readFileSync(path.join(root,file)))}));const server=http.createServer((req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;res.end(fs.readFileSync(p.startsWith('/fonts/')?path.join(fontsDir,p.slice(7)):path.join(root,p==='/'?'index.html':p)));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;try{browser=await require('../browser.cjs').launch({executablePath:'/usr/bin/chromium'});const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForFunction(()=>J?.ui?.plan);await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'layouts-b-fixture.js'),'utf8')});const rows=await page.evaluate(async fonts=>{const rows=[];
for(const fault of ['rule-through-main','missing-thin','missing-thick','move-thin','move-thick','extra-untagged-rule']){
 const spec={layout:'letterPaper',W:540,H:960,radius:.2,text:'風の先へ',params:{font:'gothic_med'}};
 const r=await runLayoutsBFixture(J,spec,{newPath:false,fonts,renderInitial:false,exportDataURL:false});
 for(const f of Object.values(J.FONTS))f.fb=fonts.fallbackFamilies.map(n=>'"'+n+'"').join(',');J.metrics.clear();J.glyphs.clear();
 const saved=J.placement.record;let changed=0;
 try{J.placement.record=(renderer,env,...args)=>{const p=saved(renderer,env,...args);
 if(env.cut.layoutCRecipe?.letterWritingScale!=null){
  const rule=p.events.find(e=>e.nativeCBody?.inscriptionRule),main=p.events.find(e=>e.kind==='item'&&e.args[0].placementMain);
  if(fault==='rule-through-main'){
   const inv=J.placement.inverse(rule.matrix),ink=(main.inkPolygons||main.polygons)[0].map(q=>J.placement.point(inv,q));
   const xs=ink.map(p=>p[0]),ys=ink.map(p=>p[1]),x=(Math.min(...xs)+Math.max(...xs))/2,y=(Math.min(...ys)+Math.max(...ys))/2;
   rule.args[0]=rule.nativeCBody.inscriptionRule.axis==='x'?[[x,Math.min(...ys)-1],[x,Math.max(...ys)+1]]:[[Math.min(...xs)-1,y],[Math.max(...xs)+1,y]];
  }else if(fault.startsWith('missing-')||fault.startsWith('move-')){
   const member=fault.split('-')[1],i=p.events.findIndex(e=>e.nativeCBody?.inscriptionHeader?.member===member);
   if(i<0)throw Error('No genuine native header '+member);
   if(fault.startsWith('missing-'))p.events.splice(i,1);else p.events[i].args[0]=p.events[i].args[0].map(q=>[q[0],q[1]+1]);
  }else{const e={...rule,nativeCBody:{...rule.nativeCBody}};delete e.nativeCBody.inscriptionRule;p.events.push(e);}
  changed++;
 }return p;};
 const plan=J.finalizePlacementPlan(r.plan,{layoutsC:true}),tr=plan.cuts[0].placementTrajectory;
 rows.push({spec,fault,changed,safety:tr?.safety,attempts:tr?.units[0].segments[0].attempts,diagnostics:plan.placementFinalization.diagnostics});
 }finally{J.placement.record=saved;}
}return rows;},fonts);
const failures=rows.filter(r=>r.changed<1||r.safety!=='insufficient-space'||r.attempts.filter(a=>a.status==='rejected'&&a.reason===(r.fault==='rule-through-main'?'C_OBJECT_RULE_RELATION':r.fault==='extra-untagged-rule'?'C_OBJECT_SOURCE_MAPPING':'C_OBJECT_HEADER_MAPPING')).length!==r.changed);
for(const p of pins)assert.equal(sha(fs.readFileSync(path.join(root,p.file))),p.sha256);fs.writeFileSync(report,JSON.stringify({scope:'Actual primary rule args moved through main ink; genuine thick header removed; extra untagged line added. All dedicated trials reject; only explicitly tagged body-rule cardinality may change. Not visual acceptance.',pins,rows,failures},null,2));console.log(JSON.stringify({cases:rows.length,failures}));assert.equal(failures.length,0);}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
