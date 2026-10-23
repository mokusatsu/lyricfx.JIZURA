'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),zlib=require('node:zlib'),H=require('./layouts-b-test-harness.cjs');
(async()=>{
 const target=process.env.JIZURA_D_EMPTY_REPORT||'/tmp/avoid009-fisheye-empty01.json',startup=H.pin(target,__filename),h=await H.open();
 try{
  const result=await h.page.evaluate(async({fonts})=>{
   const rows=[];
   for(const glass of ['none','lens','grid']){
    const r=await runLayoutsBFixture(J,{layout:'fisheye',W:960,H:540,params:{glass,mode:'sweep'}},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),plan=J.finalizePlacementPlan(r.plan,{layoutsD:true}),cut=plan.cuts[0],sc=cut.palette||plan.style.schemes[0];
    for(const pass of ['main','ghostA','ghostB'])for(const time of [-.12,-.04,0,.5]){
     const observations=[],env=r.renderer.makeEnv(r.canvas.getContext('2d'),plan,cut,sc,{pass,t:time,realTime:.01,lt:time-cut.start,ltb:time-cut.start,step:0,scale:1,allowFilter:false,placementObservation:o=>observations.push(o)});let error=null;
     try{J.placement.renderLayoutsDFisheye(r.renderer,env);}catch(e){error={code:e.code,message:e.message};}
     rows.push({glass,pass,time,error,observations});
    }
   }
   return {rows,scope:'Focused source-clock boundaries including negative ghost motion clocks; safe and insufficient diagnostics remain distinct. Empty ink is vacuously clear, not missing font/owner evidence.'};
  },{fonts:h.fonts});H.verify(startup);fs.writeFileSync(target+'.gz',zlib.gzipSync(JSON.stringify({...result,startup,browser:h.browser.version(),warnings:h.warnings}),{mtime:0}));const failures=result.rows.filter(r=>r.error);console.log(JSON.stringify({rows:result.rows.length,failures,report:target+'.gz'}));assert.equal(failures.length,0);assert.equal(h.warnings.length,0);
 }finally{await h.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
