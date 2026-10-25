/* Lossless SOURCE_PENDING storage adapter. No browser or server implementation. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function createStore({root,out,release}){
 assert.equal(release,'PARENT_REVIEWED_CROSSWORD28_LOCAL_ONLY');assert(path.isAbsolute(root));assert(out.startsWith('/dev/shm/avoid009-crossword26/')&&!fs.existsSync(out));
 const {createCodec69,CODEC69}=require(path.join(root,'dev/avoidance/layouts-d-bulbs69-runner.cjs')),codec=createCodec69(),tables=codec.tables,written={matrix:0,paint:0,catalog:0},records=[];let bytes=0,failed=false;
 fs.mkdirSync(out);const manifest={status:'INCOMPLETE_SOURCE_FIDELITY_ONLY',CanvasExecutionMustBeSeparatelyAuthorized:true,CODEC69,records,complete:false,publicChecks:0,safetyCertified:false,limits:{records:96,JSONBytes:268435456,oneRecordBytes:16777216}};
 const save=()=>fs.writeFileSync(out+'/manifest.json',JSON.stringify({...manifest,JSONBytes:bytes,failed},null,2)+'\n');save();
 return Object.freeze({
  emit(value){assert(!failed);try{assert(records.length<96);const binding=codec.pack(value);assert.deepEqual(codec.restore(binding),value,'LOSSLESS_FULL_ROW_ROUNDTRIP');const tableDeltas={};for(const[k,t]of Object.entries(tables)){tableDeltas[k]=t.drain(written[k]);written[k]=t.table.length;}const raw=Buffer.from(JSON.stringify({CODEC69,tableEpoch:0,binding,tableDeltas}));assert(raw.length<=16777216);bytes+=raw.length;assert(bytes<=268435456);const data=zlib.gzipSync(raw),file=String(records.length).padStart(4,'0')+'.json.gz';fs.writeFileSync(out+'/'+file,data,{flag:'wx'});records.push({file,bytes:data.length,JSONBytes:raw.length,sha256:sha(data)});save();}catch(e){failed=true;const K=require(path.join(root,'tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/kernel59.cjs'));fs.writeFileSync(out+'/failed-row.encoded.json.gz',zlib.gzipSync(Buffer.from(JSON.stringify(K.encode(value)))),{flag:'wx'});fs.writeFileSync(out+'/failure.txt',e.stack,{flag:'wx'});save();throw e;}},
  finish(expectedRecords){assert(!failed&&records.length===expectedRecords);manifest.complete=true;manifest.status='LOCAL_FIDELITY_SUBSET_PRODUCER_DONE_PARENT_RAW_REVIEW_PENDING';save();return manifest;}
 });
}
module.exports={createStore};
