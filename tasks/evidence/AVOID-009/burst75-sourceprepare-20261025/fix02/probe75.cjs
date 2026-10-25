/* Fix02 initial-load + one draw probe SOURCE. Parent source review precedes release. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ROOT='/workspace/lyricfx.JIZURA',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
 assert.equal(process.env.BURST75_PROBE_RELEASE,'PARENT_REVIEWED_FIX02_INITIAL_LOAD_PROBE');
 const args=process.argv.slice(2),arg=k=>{assert(args.includes(k));return args[args.indexOf(k)+1];},out=arg('--output-file'),binary=arg('--browser-path');assert(out.startsWith('/dev/shm/')&&!fs.existsSync(out));assert(/^\/dev\/shm\/b75-[A-Za-z0-9_-]{1,8}$/.test(process.env.TMPDIR||''));
 const source=fs.readFileSync(ROOT+'/src/11p_layoutsD.js','utf8'),html=fs.readFileSync(ROOT+'/index.html','utf8'),{prepare}=require('./source75.cjs');assert.equal(html.split(source).length,2);
 const setup=fs.readFileSync(__dirname+'/browser75.js','utf8'),binding='(function(){const module={exports:null};'+fs.readFileSync(__dirname+'/private-binding.cjs','utf8')+';return module.exports;})()',replacement=setup+'('+binding+','+prepare(source).installer+');',overlay=html.replace(source,replacement);assert.equal(overlay.replace(replacement,source),html);
 const fonts=JSON.parse(fs.readFileSync(ROOT+'/dev/avoidance/layouts-c-editorial-fonts/manifest.json')),assets=new Map([['/overlay.html',Buffer.from(overlay)]]);
 for(const face of fonts.faces){const url=new URL(face.url,'http://127.0.0.1');assert.equal(url.origin,'http://127.0.0.1');assets.set(url.pathname,fs.readFileSync(path.join(ROOT,url.pathname)));}
 const result={state:'FAIL_FIX02_INITIAL_LOAD_PROBE',browserRun:true,drawCount:0,full108Run:false,geometrySafetyCertified:false,publicChecks:0,errors:[],pins:['probe75.cjs','source75.cjs','browser75.js','private-binding.cjs'].map(n=>{const b=fs.readFileSync(__dirname+'/'+n);return{name:n,bytes:b.length,sha256:sha(b)};}),HTMLSHA256:sha(html),sourceSHA256:sha(source)};let browser,server;
 try{
  server=http.createServer((req,res)=>{const b=assets.get(req.url);if(req.method!=='GET'||!b){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':req.url.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'}).end(b);});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const origin='http://127.0.0.1:'+server.address().port;
  browser=await require(ROOT+'/dev/browser.cjs').launch({executablePath:binary});const page=await browser.newPage();page.on('pageerror',e=>result.errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());await page.goto(origin+'/overlay.html');await page.waitForFunction(()=>window.J?.ui?.plan&&typeof window.initBurst75==='function');
  for(const n of ['layouts-b-fixture.js','layouts-d-bulbs69-oracle-primitives.js'])await page.addScriptTag({content:fs.readFileSync(ROOT+'/dev/avoidance/'+n,'utf8')});
  result.init=await page.evaluate(fonts=>initBurst75({fonts}),fonts);result.frame=await page.evaluate(()=>frameBurst75({n:0,mode:'on-moved',query:{lt:.2,pass:'main'}}));result.drawCount=1;assert.equal(result.errors.length,0);assert.equal(result.frame.sourceUnchanged,true);assert(result.frame.records.length>0);assert.equal(result.frame.glyphs.length,1);assert.equal(result.frame.glyphs[0].item.text,'風の先へ');result.state='PASS_FIX02_INITIAL_LOAD_PROBE';
 }catch(e){result.errors.push({name:e.name,message:e.message,stack:e.stack});process.exitCode=1;}
 finally{if(browser)await browser.close();if(server?.listening)await new Promise(ok=>server.close(ok));fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({state:result.state,drawCount:result.drawCount,errors:result.errors,output:out,full108Run:false}));}
}
if(require.main===module)main();
