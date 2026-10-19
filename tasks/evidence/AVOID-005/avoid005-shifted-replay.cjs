const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const root='/workspace/lyricfx.JIZURA',html=fs.readFileSync(root+'/index.html'),font=fs.readFileSync('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'),browser=await chromium.launch({headless:true,executablePath:process.env.JIZURA_BROWSER});
 try{const page=await browser.newPage();await page.route('**/*',r=>r.request().url()==='http://fixture/'?r.fulfill({contentType:'text/html',body:html}):r.request().url()==='http://fixture/font.otf'?r.fulfill({body:font}):r.abort());await page.goto('http://fixture/');await page.waitForFunction(()=>J.ui?.plan);await page.addScriptTag({path:root+'/dev/avoidance/basic-fixture.js'});
 const rows=await page.evaluate(async()=>{
  const r=await runBasicFixture(J,{layout:'pill',params:{grad:true,smalls:true}},{newPath:false,fontURL:'http://fixture/font.otf'}),A=J.placement,renderer=r.renderer,cut={...r.plan.cuts[0],fullStagePlacement:true,placementUnits:true},sc={...r.plan.style.schemes[0],grad:['#ee2266','#2255ff']},rows=[];
  for(const scale of [.1,.2,.5,1,2])for(const time of [.08,.25,1.5,3.85]){
   const W=Math.ceil(960*scale+100),H=Math.ceil(640*scale+100),cvs=[0,1].map(()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c;}),dx=13.25,dy=-7.75,envs=cvs.map((cv,i)=>{const c=cv.getContext('2d');c.setTransform(scale,.04*scale,-.08*scale,scale,50+(i===0?dx*scale:0),50+(i===0?dy*scale:0));return renderer.makeEnv(c,r.plan,cut,sc,{pass:'main',scale,t:time,lt:time,ltb:time,step:0,allowFilter:false});});
   renderer.drawCut(envs[0]);const program=A.record(renderer,envs[1]);if(program.measurementSupported)A.replay(envs[1],program,[dx,dy]);
   const data=cvs.map(cv=>cv.getContext('2d').getImageData(0,0,W,H).data);let changed=0,maxChannelDifference=0,inkPixels=0;for(let i=0;i<data[0].length;i+=4){if(data[0][i+3])inkPixels++;let different=false;for(let j=0;j<4;j++){const d=Math.abs(data[0][i+j]-data[1][i+j]);maxChannelDifference=Math.max(maxChannelDifference,d);different||=d!==0;}if(different)changed++;}
   rows.push({scale,time,admitted:program.measurementSupported,diagnostics:program.diagnostics,inkPixels,changed,maxChannelDifference});
  }
  return rows;
 });const result={compiledSHA256:crypto.createHash('sha256').update(html).digest('hex'),scope:'Native pill enter/hold/exit with gradient and owned clipping; shifted recorder/replay against original renderer shifted before affine drawing',rows};fs.writeFileSync('/workspace/work/jizura-handoff/avoid005-shifted-replay.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({compiledSHA256:result.compiledSHA256,cases:rows.length,allAdmitted:rows.every(r=>r.admitted),different:rows.filter(r=>r.changed)},null,2));assert.ok(rows.every(r=>r.admitted&&r.changed===0),'native shifted pill must preserve clip and gradient pixels');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
