const assert=require('node:assert/strict'),{launchBrowser,loadApp}=require('./test_helpers.cjs');
(async()=>{
 const browser=await launchBrowser();
 try{
  const page=await browser.newPage();
  await page.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>fn.name==='tick'?0:raf(fn);window.requestIdleCallback=()=>0;});
  await loadApp(page);
  const result=await page.evaluate(async()=>{
   const image=document.createElement('canvas');image.width=32;image.height=24;const x=image.getContext('2d');x.fillStyle='rgba(255,255,255,.5)';x.fillRect(0,0,32,24);
   const png=await new Promise(resolve=>image.toBlob(resolve,'image/png'));
   const ref=id=>({maskId:id,sourceId:'source-'+id,model:'fixture',display:'only',fps:1,width:32,height:24,duration:0,frameCount:1});
   const pack=r=>J.packPersonMask({sourceId:r.sourceId,model:r.model,fps:1,width:32,height:24,duration:0},[png]);
   const cut=r=>({itemId:r.sourceId,type:'image',start:0,end:5,personCutout:r});
   const a=ref('keep'),b=ref('release'),entryA=await J.attachPersonMask(a,pack(a)),entryB=await J.attachPersonMask(b,pack(b));
   await J.preparePersonMask(cut(a),0,true);await J.preparePersonMask(cut(b),0,true);
   const frameA=entryA.decoded.get(0),frameB=entryB.decoded.get(0),source=document.createElement('canvas');source.width=64;source.height=48;source.getContext('2d').fillRect(0,0,64,48);
   const pixels=()=>{const c=J.personMaskSource(source,cut(a),0);return c.getContext('2d').getImageData(0,0,c.width,c.height).data;},before=pixels();
   const project=J.defaultProject();project.lyrics='';project.durationOverride=5;project.media.items=[{id:a.sourceId,name:'source.png',type:'image'}];project.media.manualCuts=true;project.media.cutCount=1;project.media.cutOverrides={0:{itemId:a.sourceId,personCutout:a}};
   J.uiApi.replaceProject(project,null,null,new Map(),true);
   const after=pixels(),keptPixelsEqual=before.every((value,i)=>value===after[i]),keptWidth=frameA.width,releasedWidth=frameB.width;
   const c=ref('pending'),entryC=await J.attachPersonMask(c,pack(c)),create=window.createImageBitmap;let release;
   window.createImageBitmap=()=>new Promise(resolve=>release=resolve);
   let pendingDecodeError,lateBitmapWidth;
   try{
    const pending=J.preparePersonMask(cut(c),0,true).then(()=>null,error=>error.name);await new Promise(resolve=>setTimeout(resolve,0));
    if(!release)throw Error('Mask decode did not start');J.retainPersonMasks(project);
    const bitmap=await create(png);release(bitmap);pendingDecodeError=await pending;lateBitmapWidth=bitmap.width;
   }finally{window.createImageBitmap=create;}
   const d=ref('storage'),load=J.loadMedia,replies=[];let oldLoadDiscarded,newLoadShared;
   J.loadMedia=()=>new Promise(resolve=>replies.push(resolve));
   try{
    const old=J.loadPersonMask(d);J.retainPersonMasks(project);const current=J.loadPersonMask(d);
    replies[0](pack(d));oldLoadDiscarded=await old===null;newLoadShared=J.loadPersonMask(d)===current;
    replies[1](pack(d));await current;
   }finally{J.loadMedia=load;}
   const e=ref('attach'),read=J.readPersonMask,ready=await read(pack(e),e);let finish;
   J.readPersonMask=()=>new Promise(resolve=>finish=resolve);let pendingAttachError;
   try{const pending=J.attachPersonMask(e,pack(e)).then(()=>null,error=>error.name);J.retainPersonMasks(project);finish(ready);pendingAttachError=await pending;}finally{J.readPersonMask=read;}
   J.uiApi.replaceProject(J.defaultProject(),null,null,new Map(),true);
   return {keptPixelsEqual,keptWidth,releasedWidth,pendingDecodeError,lateBitmapWidth,staleDecodedCount:entryC.decoded.size,
    oldLoadDiscarded,newLoadShared,pendingAttachError,remainingWidth:frameA.width,remainingDecoded:entryA.decoded.size};
  });
  assert.deepEqual(result,{keptPixelsEqual:true,keptWidth:32,releasedWidth:0,pendingDecodeError:'AbortError',lateBitmapWidth:0,staleDecodedCount:0,
   oldLoadDiscarded:true,newLoadShared:true,pendingAttachError:'AbortError',remainingWidth:0,remainingDecoded:0});
  console.log('Person masks: retained pixels, bitmap disposal, pending decode/attach cancellation and overlapping storage loads passed');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
