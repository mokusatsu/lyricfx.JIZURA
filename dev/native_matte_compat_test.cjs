const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {spawnSync}=require('node:child_process'),{root,tempDirectory}=require('./test_helpers.cjs');
const directory=tempDirectory('matte-compat-'),filename=path.join(directory,'sample.jizmat');
assert(directory.startsWith(path.join(root,'.codex-temp','tests')+path.sep));
(async()=>{
 try{
  const python=`
import sys,base64
sys.path.insert(0,${JSON.stringify(root)})
from native.matte_format import write_jizmat_file
meta=dict(sourceId='compat-src-456',model='rvm-mobilenetv3-fp32-p512-r05-v1',duration=4.0,fps=24,width=512,height=512)
png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8//8/AAX+Av6nVgGEAAAAAElFTkSuQmCC')
write_jizmat_file(${JSON.stringify(filename)},meta,[(0,png),(5,png),(12,png)])
`;
  const child=spawnSync(process.platform==='win32'?'python':'python3',['-c',python],{encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},windowsHide:true});
  assert.equal(child.status,0,child.stderr||child.error?.message);
  const J={mediaLabel:ja=>ja,clamp:(value,min,max)=>Math.min(max,Math.max(min,value))};
  const context={J,Blob,TextEncoder,TextDecoder,DOMException,window:{addEventListener(){}},document:{createElement:()=>({})}};
  const source=path.join(root,'src/08m_person_cutout.js');
  vm.runInNewContext(fs.readFileSync(source,'utf8'),context,{filename:source});
  const blob=new Blob([fs.readFileSync(filename)]),ref={sourceId:'compat-src-456',model:'rvm-mobilenetv3-fp32-p512-r05-v1'};
  const entry=await J.readPersonMask(blob,ref);
  assert.equal(entry.meta.sourceId,ref.sourceId);assert.equal(entry.meta.version,2);assert.equal(entry.slots.size,3);
  for(const slot of [0,5,12])assert(entry.slots.has(slot));assert(!entry.slots.has(99));
  await assert.rejects(J.readPersonMask(new Blob([blob,new Uint8Array([0])]),ref));
  console.log('JIZMAT01: Python writer and actual JavaScript reader preserve sparse slots and reject trailing bytes');
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
