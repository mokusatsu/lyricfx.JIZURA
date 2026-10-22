'use strict';
require('./spawn-registry.cjs');
// Environment-only adaptation. No assertion, fixture, app text or font substitution.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.env.JIZURA_CORE_VARIANT_ROOT),job=path.resolve(process.env.JIZURA_CORE_JOB_DIR);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),append=fs.appendFileSync.bind(fs);
const log=(file,data)=>append(path.join(job,file),JSON.stringify(data)+'\n');
function trace(file,value){if(typeof file!=='string')return;const p=path.resolve(file);if(p===path.join(root,'index.html')||p===path.join(root,'en/index.html')||p.startsWith(path.join(root,'src')+path.sep))log('actual-reads.jsonl',{path:p,bytes:Buffer.byteLength(value),sha256:sha(value)});}
const read=fs.readFileSync.bind(fs);fs.readFileSync=function(file,...args){const v=read(file,...args);trace(file,v);return v;};
const asyncRead=fs.promises.readFile.bind(fs.promises);fs.promises.readFile=async function(file,...args){const v=await asyncRead(file,...args);trace(file,v);return v;};
log('runtime.jsonl',{node:process.version,platform:process.platform,browserExecutable:process.env.JIZURA_BROWSER||'/usr/bin/chromium'});
const {chromium}=require('playwright'),launch=chromium.launch.bind(chromium);
const local=u=>['localhost','127.0.0.1','[::1]'].includes(u.hostname),synthetic=u=>u.protocol==='http:'&&u.hostname==='test';
const contexts=new WeakSet(),pages=new WeakSet();
async function installContext(c){if(contexts.has(c))return;contexts.add(c);await c.route('**/*',r=>{const u=new URL(r.request().url());return local(u)?r.continue():r.abort();});const newPage=c.newPage.bind(c);c.newPage=async(...a)=>{const p=await newPage(...a);installPage(p);return p;};}
function installPage(p){if(pages.has(p))return;pages.add(p);const route=p.route.bind(p);p.route=(pattern,handler,...rest)=>route(pattern,(r,...args)=>{const u=new URL(r.request().url());if(!local(u)&&!synthetic(u))return r.abort();if(synthetic(u)){const proxy=new Proxy(r,{get:(t,k)=>k==='continue'||k==='fallback'?()=>t.abort():typeof t[k]==='function'?t[k].bind(t):t[k]});return handler(proxy,...args);}return handler(r,...args);},...rest);
 const screenshot=p.screenshot.bind(p);p.screenshot=async(options={})=>{if(!options.path)return screenshot(options);const target=path.join(job,'screenshots',path.basename(options.path.replaceAll('\\','/')));fs.mkdirSync(path.dirname(target),{recursive:true});log('screenshot-paths.jsonl',{original:options.path,actual:target});return screenshot({...options,path:target});};}
chromium.launch=async options=>{const b=await launch({...options,executablePath:process.env.JIZURA_BROWSER||'/usr/bin/chromium'});log('runtime.jsonl',{chromiumVersion:b.version()});const nc=b.newContext.bind(b),np=b.newPage.bind(b);b.newContext=async(...a)=>{const c=await nc(...a);await installContext(c);return c;};b.newPage=async(...a)=>{const p=await np(...a);await installContext(p.context());installPage(p);return p;};return b;};
