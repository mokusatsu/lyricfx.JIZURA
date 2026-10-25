/* Thin lossless codec69 adapter, fixed original caps. Only64-value batching added. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function createStore({root,out,release}){
 assert.equal(release,'PARENT_REVIEWED_CROSSWORD30_LOCAL_ONLY');assert(path.isAbsolute(root));assert(out.startsWith('/dev/shm/avoid009-crossword26/')&&!fs.existsSync(out));
 const {createCodec69,CODEC69}=require(path.join(root,'dev/avoidance/layouts-d-bulbs69-runner.cjs')),K=require(path.join(root,'tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/kernel59.cjs')),codec=createCodec69(),tables=codec.tables,written={matrix:0,paint:0,catalog:0},records=[],pending=[];let bytes=0,failed=false,values=0;
 fs.mkdirSync(out);const manifest={status:'INCOMPLETE_SOURCE30_PILOT',CODEC69,records,complete:false,publicChecks:0,safetyCertified:false,limits:{records:96,JSONBytes:268435456,oneRecordBytes:16777216,batchValues:64}};
 const save=()=>fs.writeFileSync(out+'/manifest.json',JSON.stringify({...manifest,JSONBytes:bytes,failed,values},null,2)+'\n');save();
 function encoded(name,value){fs.writeFileSync(out+'/'+name,zlib.gzipSync(Buffer.from(JSON.stringify(K.encode(value)))),{flag:'wx'});}
 function flush(){if(!pending.length)return;assert(records.length<96);const tableDeltas=Object.fromEntries(Object.entries(tables).map(([k,t])=>[k,t.drain(written[k])])),record={CODEC69,tableEpoch:0,binding:{type:'array',items:pending},tableDeltas},raw=Buffer.from(JSON.stringify(record));
  if(raw.length>16777216||bytes+raw.length>268435456){fs.writeFileSync(out+'/offending-batch.raw.json.gz',zlib.gzipSync(raw),{flag:'wx'});throw Error('SOURCE30_ORIGINAL_STORAGE_CAP');}
  const data=zlib.gzipSync(raw),file=String(records.length).padStart(4,'0')+'.json.gz';fs.writeFileSync(out+'/'+file,data,{flag:'wx'});records.push({file,bytes:data.length,JSONBytes:raw.length,sha256:sha(data),values:pending.length});bytes+=raw.length;for(const[k,t]of Object.entries(tables))written[k]=t.table.length;pending.length=0;save();
 }
 function failure(value,e){failed=true;try{encoded('failed-row.encoded.json.gz',value);}catch(e2){fs.writeFileSync(out+'/failure-preservation.txt',e2.stack,{flag:'wx'});}try{flush();}catch(e2){try{encoded('pending-bindings.encoded.json.gz',{pending,tableDeltas:Object.fromEntries(Object.entries(tables).map(([k,t])=>[k,t.drain(written[k])]))});}catch{}fs.appendFileSync(out+'/failure-preservation.txt','\n'+e2.stack);}fs.writeFileSync(out+'/failure.txt',e.stack,{flag:'wx'});save();}
 return Object.freeze({emit(value){assert(!failed);try{const binding=codec.pack(value);assert.deepEqual(codec.restore(binding),value,'LOSSLESS_FULL_ROW_ROUNDTRIP');pending.push(binding);values++;if(pending.length===64)flush();}catch(e){failure(value,e);throw e;}},finish(expectedValues){assert(!failed&&values===expectedValues);try{flush();manifest.complete=true;manifest.status='SOURCE30_PRODUCER_COMPLETE_PARENT_RAW_REVIEW_REQUIRED';save();return manifest;}catch(e){failure({phase:'finish',expectedValues},e);throw e;}},abort(error){if(!failed){try{flush();}catch(e){failure({phase:'abort',originalError:error?.message},e);return;}failed=true;save();}},stats:()=>({values,records:records.length,pendingValues:pending.length})});
}
module.exports={createStore};
