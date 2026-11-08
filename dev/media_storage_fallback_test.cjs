const {launchBrowser,loadApp}=require('./test_helpers.cjs'),fs=require('fs'),assert=require('assert/strict');
const wav=Buffer.alloc(44+16000*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);
(async()=>{const browser=await launchBrowser();try{for(const lang of ['','en/'])for(const mode of ['sync','async']){
const page=await browser.newPage();await page.addInitScript(mode=>{const open=IDBFactory.prototype.open;window.failMediaDB=true;IDBFactory.prototype.open=function(name,...args){if(name==='jizura-media-v1'&&window.failMediaDB){const error=new DOMException('Internal error opening backing store for indexedDB.open.','UnknownError');if(mode==='sync')throw error;const request={error};setTimeout(()=>request.onerror?.(),0);return request;}return open.call(this,name,...args);};},mode);
await loadApp(page,{locale:lang});
const bytes=process.env.JIZURA_TEST_VIDEO?fs.readFileSync(process.env.JIZURA_TEST_VIDEO):wav;
await page.evaluate(async({base64,video})=>{const file=new File([Uint8Array.from(atob(base64),c=>c.charCodeAt(0))],video?'source.mp4':'source.wav',{type:video?'video/mp4':'audio/wav'});await J.uiApi.loadAudioFile(file,{matchDuration:true,background:video});},{base64:bytes.toString('base64'),video:!!process.env.JIZURA_TEST_VIDEO});
assert.equal(await page.evaluate(()=>!!J.ui.audio&&!!J.ui.project.audioAsset),true);assert.equal(await page.locator('#mediaStorageWarning').isVisible(),true);
// Direct material import must succeed too, independently of audio decoding.
await page.locator('#mediaFiles').setInputFiles({name:'material.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="red"/></svg>')});
await page.waitForFunction(()=>[...J.ui.project.media.items,...J.ui.project.foreground.items].some(i=>i.name==='material.svg'));
const result=await page.evaluate(async()=>{const p=J.ui.project;const blob=await J.packProject(p,J.ui.audioFile),unpacked=await J.unpackProject(blob);await J.saveFile('fallback.lyricfx',blob);const audio=await J.loadMedia(p.audioAsset.id);return {audio:audio.size,files:unpacked.files.length,temporary:J.hasTemporaryMedia(),video:p.media.items.some(i=>i.type==='video')};});assert.ok(result.audio>0);assert.ok(result.files>=2);assert.ok(result.temporary);if(process.env.JIZURA_TEST_VIDEO)assert.ok(result.video);
// Storage recovering must not lose the session data; retry persistence then reload it.
await page.evaluate(async()=>{window.failMediaDB=false;const p=J.ui.project;for(const id of [p.audioAsset.id,...p.media.items.map(i=>i.id),...p.foreground.items.map(i=>i.id)])await J.storeMedia(id,await J.loadMedia(id));});assert.equal(await page.evaluate(()=>J.hasTemporaryMedia()),false);assert.equal(await page.locator('#mediaStorageWarning').isVisible(),false);
// Project replacement releases session-only orphans while preserving new references and persistent data.
const retained=await page.evaluate(async()=>{
 window.persistedAudioId=J.ui.project.audioAsset.id;window.failMediaDB=true;
 const orphan='orphan-session-file',kept='active-session-file';
 await J.storeMedia(orphan,new File(['discarded bytes'],'orphan.bin'));window.orphanSessionFile=new WeakRef(await J.loadMedia(orphan));
 const file=new File(['<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="blue"/></svg>'],'kept.svg',{type:'image/svg+xml'});
 const item={id:kept,name:'kept.svg',type:'image',width:32,height:32},assets=new Map();await J.attachMedia(item,file,assets);await J.storeMedia(kept,file);
 const p=J.defaultProject();p.title='';p.artist='';p.lyrics='';p.media.items=[item];J.uiApi.replaceProject(p,null,null,assets);
 return {orphan:await J.loadMedia(orphan).then(()=>true,()=>false),keptSize:(await J.loadMedia(kept)).size,expected:file.size,temporary:J.hasTemporaryMedia()};
});assert.equal(retained.orphan,false);assert.equal(retained.keptSize,retained.expected);assert.equal(retained.temporary,true);assert.equal(await page.locator('#mediaStorageWarning').isVisible(),true);
const cdp=await page.context().newCDPSession(page);await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.collectGarbage');assert.equal(await page.evaluate(()=>!!window.orphanSessionFile.deref()),false,'discarded session bytes are collectible');await cdp.send('HeapProfiler.disable');
await page.evaluate(()=>{const p=J.defaultProject();p.title='';p.artist='';p.lyrics='';J.uiApi.replaceProject(p,null,null,new Map());});assert.equal(await page.evaluate(()=>J.hasTemporaryMedia()),false);assert.equal(await page.locator('#mediaStorageWarning').isVisible(),false);
assert.ok(await page.evaluate(async()=>{window.failMediaDB=false;return (await J.loadMedia(window.persistedAudioId)).size>0;}),'persistent storage remains available after session pruning');
console.log(lang||'ja',mode,'IndexedDB failure: import, project export, recovery passed');await page.close();}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
