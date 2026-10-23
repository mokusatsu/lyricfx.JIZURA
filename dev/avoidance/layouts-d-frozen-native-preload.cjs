'use strict';
// Environment-only observation for the unchanged native transport runner.
// All served app/font/fixture bytes come from the selected immutable preview.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),Module=require('node:module');
const root=path.resolve(process.env.JIZURA_FROZEN_GATE_ROOT),preview=path.resolve(process.env.JIZURA_FROZEN_PREVIEW_ROOT),out=path.join(root,'observer');
const rawRead=fs.readFileSync.bind(fs),rawWrite=fs.writeFileSync.bind(fs),rawMkdir=fs.mkdirSync.bind(fs),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
rawMkdir(out,{recursive:true});
const remap=file=>{if(typeof file!=='string')return file;if(file==='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')return path.join(preview,'fonts/NotoSansCJK-Regular.ttc');if(file==='/tmp/avoid009-baseline-6e016f7/index.html')return path.join(preview,'before/index.html');if(file==='/tmp/avoid009-native01-inputs'||file.startsWith('/tmp/avoid009-native01-inputs/'))return path.join(out,'runner-inputs')+file.slice('/tmp/avoid009-native01-inputs'.length);return file;};
fs.readFileSync=(file,...args)=>rawRead(remap(file),...args);fs.writeFileSync=(file,...args)=>rawWrite(remap(file),...args);fs.mkdirSync=(file,...args)=>rawMkdir(remap(file),...args);
const files=['index.html','en/index.html','dev/avoidance/layouts-a-fixture.js','dev/avoidance/layouts-d-native-test.cjs','dev/browser.cjs','dev/package.json','dev/package-lock.json',...fs.readdirSync(path.join(root,'src')).filter(n=>n.endsWith('.js')).map(n=>'src/'+n)].map(n=>path.join(root,n));
files.push(path.join(preview,'fonts/NotoSansCJK-Regular.ttc'),path.join(preview,'before/index.html'),__filename);
const pins=files.map(file=>{const b=rawRead(file);return {file,bytes:b.length,sha256:sha(b)};});
rawWrite(path.join(out,'start.json'),JSON.stringify({phase:'before browser launch',at:new Date().toISOString(),node:process.version,scope:'Unchanged native runner; only fixed input/output path remapping and returned-PNG observation. No public requests or visual review.',pins},null,2)+'\n');
const batches=[],load=Module._load;
Module._load=function(request,parent,...rest){const result=load.call(this,request,parent,...rest);let resolved;try{resolved=Module._resolveFilename(request,parent);}catch{return result;}
 if(resolved!==path.join(root,'dev/browser.cjs'))return result;
 return {...result,launch:async(...args)=>{
  const browser=await result.launch(...args),newPage=browser.newPage.bind(browser),close=browser.close.bind(browser);
  browser.newPage=async(...options)=>{
   const page=await newPage(...options);await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.toDataURL;globalThis.__nativePNGTrace=[];globalThis.__nativePNGTraceCapped=false;HTMLCanvasElement.prototype.toDataURL=function(...args){const value=original.apply(this,args);if(globalThis.__nativePNGTrace.length<2000)globalThis.__nativePNGTrace.push({url:value,width:this.width,height:this.height});else globalThis.__nativePNGTraceCapped=true;return value;};});
   const evaluate=page.evaluate.bind(page);page.evaluate=async(fn,...params)=>{
    if(typeof fn!=='function'||!fn.toString().includes('J.placement.record('))return evaluate(fn,...params);
    await evaluate(()=>{globalThis.__nativePNGTrace=[];globalThis.__nativePNGTraceCapped=false;});let rows;
    try{return rows=await evaluate(fn,...params);}finally{
     const trace=await evaluate(()=>({values:globalThis.__nativePNGTrace,capped:globalThis.__nativePNGTraceCapped})),digests=trace.values.map(({url,...size})=>{const bytes=Buffer.from(url.split(',')[1]||'','base64');return {...size,bytes:bytes.length,sha256:sha(bytes)};});
     const pairs=(rows||[]).map((row,i)=>{const offset=Math.floor(i/4)*9+1+2*(i%4);return {layout:row.layout,time:row.time,supported:row.supported,native:digests[offset]||null,replay:digests[offset+1]||null,equal:!!digests[offset]&&digests[offset]?.sha256===digests[offset+1]?.sha256};});
     batches.push({browser:browser.version(),traceCount:digests.length,expectedTraceCount:rows?rows.length/4*9:null,capped:trace.capped,digests,pairs});rawWrite(path.join(out,'native-png-digests.json'),JSON.stringify(batches,null,2)+'\n');
    }
   };return page;
  };
  browser.close=async()=>{try{return await close();}finally{const end=pins.map(pin=>({...pin,actualSHA256:sha(rawRead(pin.file))}));rawWrite(path.join(out,'end.json'),JSON.stringify({at:new Date().toISOString(),allInputsUnchanged:end.every(pin=>pin.sha256===pin.actualSHA256),pins:end},null,2)+'\n');}};
  return browser;
 }};
};
