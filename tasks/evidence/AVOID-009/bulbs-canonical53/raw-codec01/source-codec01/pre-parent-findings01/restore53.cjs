'use strict';
// Independent decoder. Does NOT import encoder/trial/patch or application code.
const C=require('./common53.cjs'),{fs,path,z,assert,sha,GZIP}=C;
function decode(base,p){
 assert(p&&typeof p==='object');
 switch(p.kind){
  case'same':assert.notEqual(base,undefined,'same requires existing base value');return base;
  case'literal':assert(Object.hasOwn(p,'value'));return p.value;
  case'array':assert(Array.isArray(base)&&Number.isSafeInteger(p.length)&&p.length>=0&&p.length===p.items.length);return Array.from({length:p.length},(_,i)=>decode(base[i],p.items[i]));
  case'object':{assert(base&&typeof base==='object'&&!Array.isArray(base));assert(Array.isArray(p.keys)&&p.keys.length===p.items.length&&new Set(p.keys).size===p.keys.length);const result=Object.create(null);for(let i=0;i<p.keys.length;i++){const k=p.keys[i];assert.equal(typeof k,'string');Object.defineProperty(result,k,{value:decode(Object.hasOwn(base,k)?base[k]:undefined,p.items[i]),enumerable:true,writable:true,configurable:true});}assert.deepEqual(Object.keys(result),p.keys,'object key order must reconstruct exactly');return result;}
  default:throw Error('unknown delta tag '+p.kind);
 }
}
function main(){
 const required=['--package','--package-sha256','--base51','--out','--base-pins-sha256'];const a=C.args(required,required),packagePath=C.shm(a['--package']),baseDir=C.shm(a['--base51']),out=C.shm(a['--out']);assert(!out.startsWith(baseDir+'/')&&!baseDir.startsWith(out+'/')&&!packagePath.startsWith(out+'/'),'separate new SHM output required');const bytes=C.read(packagePath);assert.equal(sha(bytes),a['--package-sha256']);const pkg=JSON.parse(z.gunzipSync(bytes));assert.equal(pkg.format,'BULBS53-EXACT-JSON-GZIP-BASE51-v1');assert.equal(pkg.standalone,false);assert.equal(pkg.excludedDerivedDirectory,'reference51');C.exactSources(pkg.codecSources);const base=C.verifyBase(baseDir,a['--base-pins-sha256']);assert.deepEqual(base.pins,pkg.requiredImmutableBase51);assert.equal(pkg.provenance.parent53AndAfter6Reviewed,true);
 const by=new Map(pkg.originalDirectoryInventory.map(x=>[C.rel(x.path),x]));assert.equal(by.size,pkg.originalDirectoryInventory.length);const metadata=pkg.otherFiles.find(x=>x.path==='manifest.json');assert(metadata&&metadata.kind==='literal-original-bytes');const manifestBytes=Buffer.from(metadata.base64,'base64');assert.equal(sha(manifestBytes),pkg.originalManifestSHA256);const manifest=JSON.parse(manifestBytes);assert.equal(manifest.records.length,pkg.records.length);const encoded=new Map(pkg.records.map(x=>[x.id,x]));assert.equal(encoded.size,pkg.records.length);const toWrite=new Map();
 for(const row of manifest.records){const e=encoded.get(row.id);assert(e);let raw;
  if(e.kind==='literal-complete-decoded-JSON')raw=Buffer.from(e.rawBase64,'base64');
  else{assert.equal(e.kind,'base51-pair-with-exhaustive-ordered-delta');const ref=base.loadRecord(e.baseReference.id,e.baseReference.JSONSHA256);assert.equal(ref.row.JSONBytes,e.baseReference.JSONBytes);const values=new Map(e.fields);assert.equal(values.size,e.fields.length);assert(Array.isArray(e.topLevelOrder)&&new Set(e.topLevelOrder).size===e.topLevelOrder.length&&e.topLevelOrder.includes('pair'));assert.equal(values.size,e.topLevelOrder.length-1);const value=Object.create(null);for(const k of e.topLevelOrder){assert.equal(typeof k,'string');assert(k==='pair'||values.has(k));Object.defineProperty(value,k,{value:k==='pair'?decode(ref.value.pair,e.pairPatch):values.get(k),enumerable:true,writable:true,configurable:true});}assert.deepEqual(Object.keys(value),e.topLevelOrder);raw=Buffer.from(JSON.stringify(value));const r=value.reference;assert(r&&r.id===ref.row.id&&r.JSONSHA256===ref.row.JSONSHA256&&r.JSONBytes===ref.row.JSONBytes);}
  C.jsonSeal(raw,e);C.jsonSeal(raw,row);for(const p of C.splitRecord(raw,row)){assert(!toWrite.has(p.path));toWrite.set(p.path,p.bytes);}
 }
 for(const f of pkg.otherFiles){const name=C.rel(f.path);assert(!toWrite.has(name));let b;
  if(f.kind==='literal-original-bytes')b=Buffer.from(f.base64,'base64');
  else if(f.kind==='base51-file-exact-fullbytes')b=base.originalFile(f.member);
  else{assert.equal(f.kind,'literal-decoded-gzip-bytes');const raw=Buffer.from(f.rawBase64,'base64');assert.equal(raw.length,f.rawBytes);assert.equal(sha(raw),f.rawSHA256);b=z.gzipSync(raw,GZIP);}
  toWrite.set(name,b);
 }
 assert.deepEqual([...toWrite.keys()].sort(),[...by.keys()].sort(),'every original nonderived file must be reconstructed');for(const[name,b]of toWrite)C.byteSeal(b,by.get(name),name);
 // All decoding and hashes checked before any output; originals/base are read-only.
 C.newDir(out);for(const d of pkg.originalDirectoryPaths){C.rel(d);C.shm(path.join(out,d));fs.mkdirSync(path.join(out,d),{recursive:true,mode:0o700});}for(const[name,b]of toWrite)C.writeRelative(out,name,b);
 const receipt=pkg.derivedReferenceExtractionReceipt;assert.equal(receipt.path,'reference51/reference53.json');const rb=Buffer.from(receipt.base64,'base64');C.byteSeal(rb,receipt,'derived receipt');const originalReceipt=JSON.parse(rb);assert.equal(originalReceipt.archiveSHA256,base.pins.archiveSHA256);assert.equal(originalReceipt.manifestSHA256,base.pins.manifest51SHA256);assert.equal(originalReceipt.verifiedMembers,base.pins.baseMemberCount);C.writeRelative(out,receipt.path,rb);assert.deepEqual(C.walk(out,true),pkg.originalDirectoryInventory,'exact restored inventory');assert.deepEqual(C.directories(out,true),pkg.originalDirectoryPaths,'all original nonderived directories restored');
 console.log(JSON.stringify({state:'RESTORED_ALL_SOURCE53_NONDERIVED_FILES_HASH_EXACT_IN_NEW_SHM_INDEPENDENT_DIRECTORY_VERIFY_STILL_REQUIRED',packageSHA256:sha(bytes),out,files:toWrite.size,records:manifest.records.length,derivedReceiptPreserved:true,standalone:false,originalsDeleted:false}));
}
if(require.main===module)main();
