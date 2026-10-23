'use strict';
// Exercise the actual second-cut compositor, whose custom program receives
// source:B but no lyric text/note arguments. This makes no safety claim.
const fs=require('node:fs'),assert=require('node:assert/strict'),zlib=require('node:zlib'),H=require('./layouts-b-test-harness.cjs');
(async()=>{
 const target=process.env.JIZURA_D_TRANS_REPORT||'/tmp/avoid009-custom-trans01.json',startup=H.pin(target,__filename),h=await H.open();
 try{
  const result=await h.page.evaluate(async({fonts})=>{
   const r=await runLayoutsBFixture(J,{layout:'center',camera:'none'},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),plan=r.plan,first=plan.cuts[0],id='custom_boundary_actual_trans';
   r.canvas.getContext('2d',{willReadFrequently:true});Object.assign(first,{end:2,dur:2,displayEnd:2,slotEnd:2});
   const second={...JSON.parse(JSON.stringify(first)),index:1,line:1,text:'次の歌詞',lineText:'次の歌詞',note:'注記',start:2,end:4,dur:2,renderStart:2,displayEnd:4,slotEnd:4,trans:id,transDur:.8,transP:{}};
   const program={version:1,mode:'overlay',nodes:[{type:'text',text:'$text',x:.2,y:.2,size:.1},{type:'text',text:'$note',x:.5,y:.2,size:.1},{type:'text',text:'転換',x:.5,y:.7,size:.12},{type:'arcText',text:'環',x:.5,y:.5,w:.4,h:.4,size:.08,bounce:0},{type:'rect',x:.1,y:.8,w:.8,h:.08,fill:'accent'}]};
   plan.cuts=[first,second];plan.customEffects=[{version:1,id,group:'trans',name:'actual transition boundary',tags:['pop'],base:'wipe',program}];
   const before=JSON.stringify(plan),calls=[],drawProgram=J.drawProgram;
   J.drawProgram=(ctx,p,args)=>{if(p.nodes?.some(n=>n.text==='転換'))calls.push({p:args.p,W:args.W,H:args.H,text:args.text??null,note:args.note??null,source:!!args.source,sourceSize:args.source?[args.source.width,args.source.height]:null,drawText:typeof args.drawText});return drawProgram(ctx,p,args);};
   const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join(''),capture=async(p,t)=>{r.renderer.frame(r.canvas.getContext('2d'),p,t,{noHud:true,noPost:true});return digest(r.canvas.getContext('2d').getImageData(0,0,plan.W,plan.H).data);},times=[2.08,2.3,2.65],native=[];
   try{
    for(const t of times)native.push(await capture(plan,t));
    const nativeCalls=calls.splice(0),final=J.finalizePlacementPlan(plan,{layoutsD:true}),diagnostic=final.placementFinalization.diagnostics.find(d=>d.cut===1&&d.code==='CUSTOM_PLACEMENT_UNSUPPORTED'),after=[];
    for(const t of times)after.push(await capture(final,t));
    const finalCalls=calls.splice(0),roundtrip=JSON.parse(JSON.stringify(plan)),capability=J.placement.customDrawingCapability(roundtrip.cuts[1],roundtrip);
    return {times,native,after,nativeCalls,finalCalls,sourceUnchanged:before===JSON.stringify(plan),secondCutPreserved:JSON.stringify(second)===JSON.stringify(final.cuts[1]),diagnostic,roundtripEqual:JSON.stringify(capability)===JSON.stringify(diagnostic?.capability),scope:'Actual custom transition compositor invoked at three nonzero progress clocks. $text/$note are empty because source:B is the only supplied content. Manual programs and rendering preserved; custom geometry remains unsupported.'};
   }finally{J.drawProgram=drawProgram;}
  },{fonts:h.fonts});
  H.verify(startup);fs.writeFileSync(target+'.gz',zlib.gzipSync(JSON.stringify({...result,startup,browser:h.browser.version(),warnings:h.warnings}),{mtime:0}));
  assert(result.sourceUnchanged&&result.secondCutPreserved&&result.diagnostic&&result.roundtripEqual);assert.deepEqual(result.native,result.after);assert.equal(result.nativeCalls.length,3);assert.deepEqual(result.nativeCalls,result.finalCalls);assert(result.nativeCalls.every(c=>c.p>0&&c.p<1&&c.text===null&&c.note===null&&c.source&&c.drawText==='undefined'&&c.sourceSize[0]===c.W&&c.sourceSize[1]===c.H));assert.equal(h.warnings.length,0);console.log(JSON.stringify({calls:result.nativeCalls.length,pixelPairs:result.times.length,report:target+'.gz'}));
 }finally{await h.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
