const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../preload.cjs'),'utf8'),chunk=8*1024*1024;
function api(invoke){let exposed;vm.runInNewContext(source,{Blob,ArrayBuffer,console,window:{},require:()=>({ipcRenderer:{on(){},invoke},contextBridge:{exposeInMainWorld:(_,value)=>exposed=value}})});return exposed;}
class TrackedBlob extends Blob{
 constructor(bytes,failAt=-1,short=false){super([bytes]);this.reads=[];this.failAt=failAt;this.short=short;}
 slice(start,end){this.reads.push([start,end]);const part=super.slice(start,end);if(start===this.failAt)part.arrayBuffer=async()=>{if(this.short)return new ArrayBuffer(1);throw Error('read failed');};return part;}
}
(async()=>{
 const bytes=new Uint8Array(chunk*2+11);bytes.fill(9);bytes[0]=1;bytes[chunk]=2;bytes[chunk*2]=3;
 const blob=new TrackedBlob(bytes),written=[];let release,notify,inflight=0,maxInflight=0;
 const firstWrite=new Promise(resolve=>notify=resolve),ack=new Promise(resolve=>release=resolve);
 const upload=api(async(channel,args)=>{
  if(channel==='desktop:startChunkedAsset')return 'asset';
  if(channel==='desktop:appendAssetChunk'){
   inflight++;maxInflight=Math.max(maxInflight,inflight);written.push(Buffer.from(args.buffer));
   try{if(written.length===1){notify();await ack;}return {ok:true};}finally{inflight--;}
  }
  if(channel==='desktop:finishChunkedAsset')return {assetToken:'complete'};
  throw Error('Unexpected '+channel);
 });
 const pending=upload.uploadChunkedAsset('asset.bin','application/octet-stream',blob);
 await firstWrite;await new Promise(resolve=>setImmediate(resolve));assert.equal(blob.reads.length,2,'one prefetched chunk while the first waits for acknowledgement');
 release();assert.equal((await pending).assetToken,'complete');assert.equal(maxInflight,1);assert.equal(written.length,3);assert(Buffer.concat(written).equals(Buffer.from(bytes)));
 for(const data of [new ArrayBuffer(0),new Uint8Array([1,2,3]).buffer,new Blob()]){
  const chunks=[],saved=api(async(channel,args)=>{
   if(channel==='desktop:saveProjectStart')return {saveToken:'save'};
   if(channel==='desktop:saveProjectChunk'){chunks.push(Buffer.from(args.buffer));return {ok:true};}
   if(channel==='desktop:saveProjectFinish')return {canceled:false,size:args.expectedSize};
   throw Error('Unexpected '+channel);
  });
  const result=await saved.saveProjectFile('project.lyricfx',data);assert.equal(result.canceled,false);assert.equal(Buffer.concat(chunks).length,data instanceof Blob?data.size:data.byteLength);
 }
 const canceledBlob=new TrackedBlob(bytes);assert.equal((await api(async()=>({canceled:true})).saveProjectFile('project.lyricfx',canceledBlob)).canceled,true);assert.equal(canceledBlob.reads.length,0);
 for(const short of [false,true]){
  const operations=[],failed=api(async(channel)=>{operations.push(channel);if(channel==='desktop:saveProjectStart')return {saveToken:'save'};await new Promise(resolve=>setImmediate(resolve));return {ok:true};});
  const result=await failed.saveProjectFile('project.lyricfx',new TrackedBlob(bytes,chunk,short));
  assert.match(result.error,short?/size mismatch/:/read failed/);assert.equal(operations.filter(op=>op==='desktop:saveProjectCancel').length,1);assert(!operations.includes('desktop:saveProjectFinish'));
 }
 const operations=[],failedUpload=api(async channel=>{operations.push(channel);if(channel==='desktop:startChunkedAsset')return 'asset';if(channel==='desktop:appendAssetChunk')throw Error('write failed');return {ok:true};});
 await assert.rejects(failedUpload.uploadChunkedAsset('asset.bin','application/octet-stream',blob),/write failed/);assert.equal(operations.filter(op=>op==='desktop:cancelChunkedAsset').length,1);assert(!operations.includes('desktop:finishChunkedAsset'));
 console.log('File chunks: bounded prefetch, byte order, Blob/ArrayBuffer, empty/cancel, short/read/write errors passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
