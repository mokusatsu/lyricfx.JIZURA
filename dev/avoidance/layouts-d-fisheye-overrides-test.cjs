'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),zlib=require('node:zlib'),H=require('./layouts-b-test-harness.cjs');
(async()=>{
 const target=process.env.JIZURA_D_OVERRIDE_REPORT||'/tmp/avoid009-fisheye-overrides01.json',startup=H.pin(target,__filename),h=await H.open();
 try{
  const result=await h.page.evaluate(async({fonts})=>{
   const rows=[];for(const glass of ['none','lens','grid'])for(const camera of ['panL','dutch']){
    const r=await runLayoutsBFixture(J,{layout:'fisheye',W:540,H:960,cx:.1,cy:.1,radius:.02,camera,params:{glass,mode:'sweep'}},{newPath:false,fonts,renderInitial:false,exportDataURL:false});
    r.plan.fx={...r.plan.fx,motion:0,chroma:0};r.plan.style={...r.plan.style,ghost:0};const base=J.finalizePlacementPlan(r.plan,{layoutsD:true});
    r.plan.cuts[0].effectFx={...r.plan.fx,motion:1,chroma:1};r.plan.cuts[0].effectStyle={...r.plan.style,ghost:1};const source=JSON.stringify(r.plan),sourceCut=JSON.stringify(r.plan.cuts[0]),final=J.finalizePlacementPlan(r.plan,{layoutsD:true}),tr=final.cuts[0].placementTrajectory,baseTr=base.cuts[0].placementTrajectory,observations=[],errors=[];
    if(!baseTr||!tr){rows.push({glass,camera,errors:[],unsupported:!!baseTr&&!tr&&final.placementFinalization.diagnostics.some(d=>d.code==='UNSUPPORTED_POST_FX'&&d.safety==='unsupported'),sourceUnchanged:source===JSON.stringify(r.plan),cutPreserved:sourceCut===JSON.stringify(final.cuts[0]),diagnostics:final.placementFinalization.diagnostics});continue;}
    const original=baseTr.units[0].segments[0].unitProofs,actual=tr.units[0].segments[0].unitProofs,bounds=ps=>J.placement.bounds(ps);let larger=0,contained=true;
    for(const a of original){const b=actual.find(b=>b.owner===a.owner),p=bounds(a.envelopes),q=bounds(b.envelopes);contained&&=q.x0<=p.x0&&q.y0<=p.y0&&q.x1>=p.x1&&q.y1>=p.y1;if(q.x0<p.x0-1e-6||q.y0<p.y0-1e-6||q.x1>p.x1+1e-6||q.y1>p.y1+1e-6)larger++;}
    for(const time of [.02,.1,.2,.4,.8,1.2,1.8,2.2,2.8,3.2,3.6,3.99])try{r.renderer.frame(r.canvas.getContext('2d'),final,time,{noHud:true,noPost:true,noTrans:true,placementObservation:o=>observations.push(o)});}catch(e){errors.push({time,code:e.code,message:e.message});}
    rows.push({glass,camera,larger,owners:actual.length,contained,baseSafety:baseTr.safety,safety:tr.safety,errors,observations,overrideFx:r.plan.cuts[0].effectFx,overrideGhost:r.plan.cuts[0].effectStyle.ghost});
   }return {rows,scope:'Cut effectFx/effectStyle overrides are rejected by the existing common UNSUPPORTED_POST_FX guard before D source proof. They preserve the original cut and never claim a trajectory or safety. No override support added.'};
  },{fonts:h.fonts});H.verify(startup);fs.writeFileSync(target+'.gz',zlib.gzipSync(JSON.stringify({...result,startup,browser:h.browser.version(),warnings:h.warnings}),{mtime:0}));const failures=result.rows.filter(r=>r.errors.length||!r.unsupported||!r.sourceUnchanged||!r.cutPreserved);console.log(JSON.stringify({rows:result.rows.length,failures,report:target+'.gz'}));assert.equal(failures.length,0);assert.equal(h.warnings.length,0);
 }finally{await h.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
