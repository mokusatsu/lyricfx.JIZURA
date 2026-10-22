/* Unchanged decoded-seek guard with event-order instrumentation and case context. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),H=require('./layouts-b-test-harness.cjs'),T=require('./layouts-b-review.cjs');
(async()=>{const dir=path.join(H.root,'work/avoid007-native/local-20261022-01'),receipt=path.join(H.root,process.env.JIZURA_PLAYBACK_REPORT||'tasks/evidence/AVOID-007/playback-diagnostic01.json'),m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'))),startup=H.pin(receipt,__filename,['dev/avoidance/layouts-b-review.cjs',path.relative(H.root,path.join(dir,'manifest.json'))]),assetPins=Object.entries(m.assets).map(([file,sha256])=>{assert.equal(H.sha(fs.readFileSync(path.join(dir,file))),sha256);return {file,sha256};}),server=await T.serve(dir),browser=await require('../browser.cjs').launch(),rows=[];
 let source=T.seekDecodedFrame.toString();for(const [from,to]of [
  ['let seekedAt=null,decoded=null,callback=null,settled=false;','let seekedAt=null,decoded=null,callback=null,settled=false;window.h03SeekEvents=[];'],
  ['function seek(){','function seek(){window.h03SeekEvents.push({event:"seeked",now:performance.now(),time:video.currentTime});'],
  ['callback=null;\n      const f={','callback=null;window.h03SeekEvents.push({event:"callback",now:performance.now(),mediaTime:meta.mediaTime,currentTime:video.currentTime,seekedAt});\n      const f={'],
 ]){assert.equal(source.split(from).length,2);source=source.replace(from,to);}
 try{const page=await browser.newPage();await page.goto(server.baseURL);
  for(const c of m.cases)for(const side of ['before','after']){
   await page.setContent('<video controls playsinline preload="auto" style="display:block;width:640px;max-width:100%;height:auto" src="'+new URL(c[side].video,server.baseURL).href+'"></video>');
   const video=await page.locator('video').elementHandle();await video.evaluate(v=>new Promise((resolve,reject)=>{if(v.readyState>=2)return resolve();v.onloadeddata=resolve;v.onerror=()=>reject(Error('video load'));v.load();}));
   const row={case:c.id,side,seeks:[]};rows.push(row);
   for(const target of [1.5,.125,3.75]){const r=await page.evaluate(async({v,target,source})=>{let result,error;try{result=await (0,eval)('('+source+')')(v,target);}catch(e){error=e.message;}return {target,result,error,events:window.h03SeekEvents,state:{currentTime:v.currentTime,readyState:v.readyState,seeking:v.seeking,paused:v.paused,duration:v.duration,decoded:v.getVideoPlaybackQuality(),seekable:Array.from({length:v.seekable.length},(_,i)=>[v.seekable.start(i),v.seekable.end(i)])}};},{v:video,target,source});row.seeks.push(r);console.log(JSON.stringify({case:c.id,side,target,error:r.error||null,events:r.events}));if(r.error)break;}
  }
  H.verify(startup);for(const p of assetPins)assert.equal(H.sha(fs.readFileSync(path.join(dir,p.file))),p.sha256);
 }finally{await browser.close();await new Promise(r=>server.server.close(r));fs.writeFileSync(receipt,JSON.stringify({startup,manifestSHA256:H.sha(fs.readFileSync(path.join(dir,'manifest.json'))),assetPins,scope:'diagnostic event instrumentation only; does not replace full validate-browser acceptance',rows}));}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
