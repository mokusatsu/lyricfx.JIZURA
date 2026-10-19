const fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const root='/workspace/lyricfx.JIZURA',out=process.argv[2]||'/workspace/work/jizura-handoff/avoid005-refinalization-probe.json';
(async()=>{
 const html=fs.readFileSync(root+'/index.html'),font=fs.readFileSync('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'),browser=await chromium.launch({headless:true,executablePath:process.env.JIZURA_BROWSER});
 try{
  const page=await browser.newPage();await page.route('**/*',r=>r.request().url()==='http://fixture/'?r.fulfill({contentType:'text/html',body:html}):r.request().url()==='http://fixture/font.otf'?r.fulfill({body:font}):r.abort());await page.goto('http://fixture/');await page.waitForFunction(()=>J.ui?.plan);await page.addScriptTag({path:root+'/dev/avoidance/basic-fixture.js'});
  const rows=await page.evaluate(async()=>{
   const rows=[];
   for(const layout of ['center','circle','wave']){
    const source=(await runBasicFixture(J,{layout,params:layout==='circle'?{variant:'disc'}:{}},{newPath:false,fontURL:'http://fixture/font.otf'})).plan;
    source.cuts[0].area={x:.12,y:.18,w:.56,h:.63,angle:0};source.cuts[0].areaMode='auto';
    const first=J.finalizePlacementPlan(source,{basicLayouts:true});
    for(const [name,options] of [['excluded',{basicLayouts:true,cutIndices:[]}],['foundationOnly',{}],['unsupportedEclipse',{basicLayouts:true,params:{0:{variant:'eclipse'}}}]]){
     if(name==='unsupportedEclipse'&&layout!=='circle')continue;
     const fromPrior=J.finalizePlacementPlan(first,options),fromSource=J.finalizePlacementPlan(source,options);
     const pick=p=>({area:p.cuts[0].area,params:p.cuts[0].params,fullStagePlacement:p.cuts[0].fullStagePlacement??null,placementUnits:p.cuts[0].placementUnits??null,trajectory:p.cuts[0].placementTrajectory??null,diagnostics:p.placementFinalization.diagnostics});
     const a=pick(fromPrior),b=pick(fromSource);rows.push({layout,name,equal:JSON.stringify(a)===JSON.stringify(b),fromPrior:a,fromSource:b});
    }
   }
   return rows;
  });
  const result={compiledSHA256:crypto.createHash('sha256').update(html).digest('hex'),scope:'Parent independent refinalization probe; previous-finalized input versus original composed source for identical options',rows};fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({compiledSHA256:result.compiledSHA256,rows:rows.map(r=>({layout:r.layout,name:r.name,equal:r.equal,priorTrajectory:!!r.fromPrior.trajectory,sourceTrajectory:!!r.fromSource.trajectory,priorDiagnostics:r.fromPrior.diagnostics}))},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
