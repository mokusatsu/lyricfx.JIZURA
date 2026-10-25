'use strict';
// SOURCE ONLY. Parent runs after raw53 + sixAFTER baselines/source review gates.
const C=require('./common53.cjs'),{fs,path,z,assert,sha,GZIP}=C;
const allowed=['--raw53','--base51','--out','--base-pins-sha256','--manifest53-sha256','--parent53-and-after6-reviewed'];
function orderedEqual(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function patch(base,value){
 if(orderedEqual(base,value))return{kind:'same'};
 if(Array.isArray(value)&&Array.isArray(base))return{kind:'array',length:value.length,items:value.map((v,i)=>i<base.length?patch(base[i],v):{kind:'literal',value:v})};
 if(value&&base&&typeof value==='object'&&typeof base==='object'&&!Array.isArray(value)&&!Array.isArray(base)){
  const keys=Object.keys(value);return{kind:'object',keys,items:keys.map(k=>Object.hasOwn(base,k)?patch(base[k],value[k]):{kind:'literal',value:value[k]})};
 }
 return{kind:'literal',value};
}
// Encoder's local selfcheck decoder; independent restore has its own implementation.
function trial(base,p){if(p.kind==='same')return base;if(p.kind==='literal')return p.value;if(p.kind==='array')return p.items.map((q,i)=>trial(base[i],q));const out=Object.create(null);p.keys.forEach((k,i)=>{out[k]=trial(base[k],p.items[i]);});return out;}
function main(){
 const a=C.args(allowed,allowed);assert.equal(a['--parent53-and-after6-reviewed'],'PARENT_ACCEPTED_RAW53_AND_AFTER6_POSTPINS');const raw=C.shm(a['--raw53']),baseDir=C.shm(a['--base51']),out=C.shm(a['--out']);assert.equal(baseDir,path.join(raw,'reference51'),'use actual53 one-pass derived reference51');assert(!out.startsWith(raw+'/')&&!raw.startsWith(out+'/')&&!out.startsWith(baseDir+'/'),'output separate from original/base');
 const base=C.verifyBase(baseDir,a['--base-pins-sha256']),manifestBytes=C.read(path.join(raw,'manifest.json'));assert.equal(sha(manifestBytes),a['--manifest53-sha256']);const manifest=JSON.parse(manifestBytes);assert(manifest.complete&&!manifest.errors.length&&!manifest.partialRecords.length&&!manifest.inFlight&&manifest.postPins.unchanged,'parent must review complete accepted53 raw');for(const k of Object.keys(manifest.expected))assert.equal(manifest.completed[k],manifest.expected[k]);
 let encodedBudget=0,maxEntryBytes=0;function account(value,label){const n=Buffer.byteLength(JSON.stringify(value));assert(n<=C.CAPS.entryEncodedBytes,'encoded entry cap exceeded '+label+'; preserve all originals');encodedBudget+=n+1;maxEntryBytes=Math.max(maxEntryBytes,n);assert(encodedBudget<=C.CAPS.payloadJSONBytes,'encoded payload accounting cap exceeded; preserve all originals');}
 const inventory=C.walk(raw,true),originalDirectoryPaths=C.directories(raw,true),handled=new Set(),records=[],fallbacks=[];
 for(const row of manifest.records){assert(!records.some(r=>r.id===row.id),'duplicate record ID');const original=C.recordRaw(raw,row);assert(original.length<=C.CAPS.recordDecodedBytes,'record decoded cap exceeded; preserve original '+row.id);const value=JSON.parse(original.toString('utf8'));let encoded;
  try{
   assert(Buffer.from(JSON.stringify(value)).equals(original),'original JSON not exactly canonical stringify');assert(value.reference&&Object.hasOwn(value,'pair'),'missing full51pair reference');const ref=base.loadRecord(value.reference.id,value.reference.JSONSHA256);assert.equal(value.reference.JSONBytes,ref.row.JSONBytes);assert(Object.hasOwn(ref.value,'pair'));const pairPatch=patch(ref.value.pair,value.pair),keys=Object.keys(value),fields=keys.filter(k=>k!=='pair').map(k=>[k,value[k]]);
   encoded={kind:'base51-pair-with-exhaustive-ordered-delta',id:row.id,baseReference:{id:ref.row.id,JSONBytes:ref.row.JSONBytes,JSONSHA256:ref.row.JSONSHA256},topLevelOrder:keys,fields,pairPatch};
   const restored=Object.create(null),others=new Map(fields);for(const k of keys)restored[k]=k==='pair'?trial(ref.value.pair,pairPatch):others.get(k);assert(Buffer.from(JSON.stringify(restored)).equals(original),'encoder delta trial not byteexact');
  }catch(e){encoded={kind:'literal-complete-decoded-JSON',id:row.id,rawBase64:original.toString('base64'),reason:e.message};fallbacks.push({id:row.id,reason:e.message});}
  // Regardless of representation: exact original boundaries and EVERY original gzip byte.
  C.splitRecord(original,row);encoded.JSONBytes=row.JSONBytes;encoded.JSONSHA256=row.JSONSHA256;account(encoded,row.id);records.push(encoded);for(const p of row.parts){assert(!handled.has(p.path));handled.add(p.path);}
 }
 const otherFiles=[];let baseStorageRefs=0;
 for(const x of inventory){if(handled.has(x.path))continue;const original=C.read(path.join(raw,x.path));C.byteSeal(original,x,x.path);
  if(x.path.startsWith('storage51/')&&x.path.endsWith('.gz')){
   const member='decoded-fragments/'+x.path.slice(0,-3);let identical=false;try{identical=base.originalFile(member).equals(original);}catch{}
   if(identical){const entry={path:x.path,kind:'base51-file-exact-fullbytes',member};account(entry,x.path);otherFiles.push(entry);baseStorageRefs++;continue;}
  }
  if(x.path.endsWith('.gz')){const decoded=z.gunzipSync(original,{maxOutputLength:C.CAPS.recordDecodedBytes});assert(z.gzipSync(decoded,GZIP).equals(original),'nonstandard original gzip cannot claim Node24 exact '+x.path);assert(decoded.length<=C.CAPS.recordDecodedBytes,'literal decoded file cap exceeded; preserve originals');const entry={path:x.path,kind:'literal-decoded-gzip-bytes',rawBase64:decoded.toString('base64'),rawBytes:decoded.length,rawSHA256:sha(decoded)};account(entry,x.path);otherFiles.push(entry);}
  else{assert(original.length<=C.CAPS.recordDecodedBytes,'literal metadata cap exceeded; preserve originals');const entry={path:x.path,kind:'literal-original-bytes',base64:original.toString('base64')};account(entry,x.path);otherFiles.push(entry);}
 }
 // The manifest and every other metadata file stay literal original bytes.
 assert(otherFiles.some(x=>x.path==='manifest.json'&&x.kind==='literal-original-bytes'));
 const derivedReceipt=C.read(path.join(baseDir,'reference53.json'));assert(derivedReceipt.equals(base.receiptBytes));
 const payload={format:'BULBS53-EXACT-JSON-GZIP-BASE51-v1',standalone:false,requiredImmutableBase51:base.pins,codecSources:C.sourcePins(),originalManifestSHA256:sha(manifestBytes),originalDirectoryInventory:inventory,originalDirectoryPaths,excludedDerivedDirectory:'reference51',derivedReferenceExtractionReceipt:{path:'reference51/reference53.json',bytes:derivedReceipt.length,sha256:sha(derivedReceipt),base64:derivedReceipt.toString('base64')},records,otherFiles,provenance:{baseDirDerivedNotNewObservations:true,baseArchive:base.pins.archiveSHA256,baseStorage:base.pins.storage51SHA256,baseManifest:base.pins.manifest51SHA256,NodeVersion:process.version,NodeSHA256:base.pins.nodeSHA256,gzipOptions:GZIP,caps:C.CAPS,parent53AndAfter6Reviewed:true},fallbacks};
 assert.deepEqual(C.walk(raw,true),inventory,'original53 changed during encode');assert.deepEqual(C.directories(raw,true),originalDirectoryPaths);
 const headerBytes=Buffer.byteLength(JSON.stringify({...payload,records:[],otherFiles:[]}));assert(headerBytes+encodedBudget<=C.CAPS.payloadJSONBytes,'total header+record payload cap exceeded; preserve all originals');const payloadJSON=Buffer.from(JSON.stringify(payload));assert(payloadJSON.length<=C.CAPS.payloadJSONBytes);
 const bytes=z.gzipSync(payloadJSON,GZIP);assert(bytes.length<=C.CAPS.packageBytes,'2MiB package cap exceeded; preserve all originals; no field dropping');C.newDir(out);C.writeExclusive(path.join(out,'payload53.json.gz'),bytes);const report={state:'ENCODED_SOURCE53_WITH_EXACT_JSON_AND_EVERY_GZIP_SELF_CHECK_RESTORE_STILL_REQUIRED',standalone:false,caps:C.CAPS,payloadJSONBytes:payloadJSON.length,accountedEntryBytes:encodedBudget,maximumEncodedEntryBytes:maxEntryBytes,packageBytes:bytes.length,packageSHA256:sha(bytes),manifestSHA256:sha(manifestBytes),inventoryFiles:inventory.length,recordCount:records.length,exactPairReuseRecords:records.filter(r=>r.kind==='base51-pair-with-exhaustive-ordered-delta'&&r.pairPatch.kind==='same').length,deltaRecords:records.filter(r=>r.kind==='base51-pair-with-exhaustive-ordered-delta'&&r.pairPatch.kind!=='same').length,literalFallbacks:fallbacks,baseStorageExactFileRefs:baseStorageRefs,originalsDeleted:false,restorationVerified:false};C.writeExclusive(path.join(out,'encode-report.json'),Buffer.from(JSON.stringify(report,null,2)+'\n'));console.log(JSON.stringify(report));
}
if(require.main===module)main();
