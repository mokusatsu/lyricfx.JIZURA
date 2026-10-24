'use strict';
// PRE-RUN REVIEW ONLY. Do not execute until parent explicitly releases this seal.
const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto'),zlib=require('zlib'),assert=require('assert/strict');
const dir=path.resolve(__dirname,'..'),root=path.resolve(dir,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const specs=[
 {W:960,H:540,text:'風',seed:704,params:{side:1,deco:true,tilt:false,hop:false,colOff:0}},
 {W:960,H:540,text:'風の先へ続く青い空',seed:705,params:{side:-1,deco:true,tilt:true,hop:true,colOff:5}},
 {W:720,H:1280,text:'GO GO GO',seed:706,params:{side:1,deco:false,tilt:true,hop:true,colOff:2},beat:true},
 {W:960,H:540,text:'BBBBBBBBB AAAA',seed:707,params:{side:-1,deco:true,tilt:false,hop:true,colOff:1}},
 {W:720,H:777,text:'風の先へ続く道',seed:708,params:{side:1,deco:false,tilt:true,hop:true,colOff:3}},
 {W:720,H:778,text:'風の先へ続く道',seed:709,params:{side:-1,deco:true,tilt:true,hop:true,colOff:4},beat:true},
 {W:960,H:540,text:'placeholder',empty:true,seed:710,params:{side:1,deco:true,tilt:true,hop:true,colOff:0}},
];
async function exercise({spec,fonts,after}){
 const rows=[],failures=[],eq=(a,b,label)=>{if(JSON.stringify(a)!==JSON.stringify(b))failures.push({label,expected:a,actual:b});};
 const r=await runLayoutsBFixture(J,{layout:'blocks',control:'off',...spec},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),base=r.plan.cuts[0];
 if(spec.empty){base.text='';base.lineText='';}
 base.params.probe={nested:['preserve',spec.seed]};Object.freeze(base.params.probe.nested);Object.seal(base.params.probe);if(spec.seed%2===0)Object.freeze(base.params);
 const json=()=>JSON.stringify(r.plan),state=()=>[Object.isFrozen(base.params),Object.isSealed(base.params),Object.isExtensible(base.params),Object.isFrozen(base.params.probe),Object.isSealed(base.params.probe),Object.isFrozen(base.params.probe.nested)],before=json(),flags=state();
 const refs=new Set(),collect=v=>{if(v&&typeof v==='object'&&!refs.has(v)){refs.add(v);for(const x of Object.values(v))collect(x);}};collect(r.plan);const sourceGraphFlags=()=>Array.from(refs,v=>[Object.isFrozen(v),Object.isSealed(v),Object.isExtensible(v)]),graphFlags=sourceGraphFlags();
 const detached=v=>{if(v&&typeof v==='object'){if(refs.has(v))throw Error('Catalog aliases original source input');for(const x of Object.values(v))detached(x);}};
 const hash=async ctx=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height).data))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const mat=c=>{const m=c.getTransform();return [m.a,m.b,m.c,m.d,m.e,m.f];};
 const clean=v=>JSON.parse(JSON.stringify(v,(_,x)=>typeof x==='function'?undefined:x));
 const draw=async(call,kind,offset=[0,0],capture=false)=>{
  const cv=document.createElement('canvas');cv.width=spec.W;cv.height=spec.H;const ctx=cv.getContext('2d');
  // Canonical root is untouched between native and record/replay. Fractional root is deliberate.
  if(call.root){ctx.translate(spec.W/2,spec.H/2);ctx.rotate(.013);ctx.scale(1.013,1.013);ctx.translate(-spec.W/2,-spec.H/2);}
  const root=mat(ctx),cut={...base,area:null,fullStagePlacement:true};if(kind!=='off')cut.placementLayoutsD=true;
  const lt=call.t,beat=spec.beat?{len:.5,index:Math.floor(lt/.5),since:lt-Math.floor(lt/.5)*.5}:null;
  const env=r.renderer.makeEnv(ctx,r.plan,cut,cut.palette,{pass:call.pass,passColor:call.pass==='A'?'#e9529e':'#4bcade',t:lt,realTime:lt,lt,ltb:lt+(call.pass==='A'?.8/24:call.pass==='B'?1.6/24:0),step:0,scale:1,allowFilter:false,beat}),sentinel=Object.freeze({role:'primary',owner:'test.previous'});env.drawOwnership=sentinel;
  let program=null,bb=null,trace=[];
  if(kind==='replay'){
   program=J.placement.record(r.renderer,env);if(!program.measurementSupported)throw Error('Record unsupported '+JSON.stringify(program.diagnostics));
   J.placement.replay(env,program,offset);
  }else{
   if(offset.some(Boolean)){const inv=J.placement.inverse(root);ctx.translate(inv[0]*offset[0]+inv[2]*offset[1],inv[1]*offset[0]+inv[3]*offset[1]);}
   if(capture){for(const key of ['line','poly','rect','rrect','circle']){const fn=env[key];env[key]=(...args)=>{trace.push({key,args:clean(args),matrix:mat(ctx),ownership:clean(env.drawOwnership)});return fn(...args);};}}
   if(capture){const recorder={item(it){trace.push({key:'item',args:clean([it]),matrix:mat(ctx),ownership:clean(env.drawOwnership)});delete env.placementRecorder;try{return J.drawItem(env,it);}finally{env.placementRecorder=recorder;}}};env.placementRecorder=recorder;}
   bb=J.LAYOUTS.blocks.render(env);
  }
  if(env.drawOwnership!==sentinel)throw Error('Ownership scope leaked');
  const catalog=program?.nativeDGeometry||env.placementDGeometry||null;
  if(catalog){detached(catalog);if(catalog.kind!=='blocks-native-catalog'||!catalog.nativeOnly)throw Error('Unexpected catalog kind');}
  const value={hash:await hash(ctx),bb:clean(bb),trace,catalog,root,events:program?clean(program.events):null};cv.width=cv.height=1;return value;
 };
 // Catalog discovery is one native direct draw, not finalize or a safe adapter.
 const discovery=after?await draw({t:1.5,pass:'main',root:false},'direct'):null;
 let calls;if(after&&spec.empty){calls=[{t:0,pass:'main',root:false},{t:1.5,pass:'A',root:true},{t:3.8,pass:'B',root:true}];}else if(after){
  const g=discovery.catalog,first=g.blocks.reduce((a,b)=>a.t1<b.t1?a:b),last=g.blocks.reduce((a,b)=>a.t1>b.t1?a:b),times=[0,.06,.4,1.5,3.6,3.8,4];
  for(const t of [first.t1,last.t1,first.t1+.3,last.t1+.3,.6+(g.n+2)*g.gap])for(const eps of [-1e-9,0,1e-9])times.push(t+eps);
  calls=[...new Set(times)].map((t,i)=>({t,pass:['main','A','B'][i%3],root:i%2===1}));
  for(const pass of ['main','A','B'])calls.push({t:1.5,pass,root:true});
 }else calls=spec.calls;
 for(const [ci,call]of calls.entries()){
  const off=await draw(call,'off',[0,0],true),row={call,off};
  if(after){
   const direct=await draw(call,'direct',[0,0],true),zero=await draw(call,'replay'),offset=[17,-11],shifted=await draw(call,'direct',offset),moved=await draw(call,'replay',offset);
   row.direct=direct;row.zero=zero;row.offset=offset;row.shifted=shifted;row.moved=moved;
   eq(off.hash,direct.hash,'native direct D pixels '+ci);eq(off.bb,direct.bb,'native return BB '+ci);
   const payload=trace=>trace.map(({ownership,...event})=>event);eq(payload(off.trace),payload(direct.trace),'native paint/CTM/order '+ci);
   eq(direct.hash,zero.hash,'zero-offset replay pixels '+ci);eq(shifted.hash,moved.hash,'nonzero-offset replay pixels '+ci);
   const g=direct.catalog;eq(g,zero.catalog,'catalog direct/record '+ci);eq(g,shifted.catalog,'catalog unaffected by stage offset '+ci);
   if(spec.empty){eq(g,null,'empty source has no catalog '+ci);eq(direct.bb,null,'empty source return null '+ci);eq(zero.events,[],'empty source paints nothing '+ci);}else{
   eq(g.blocks.map(b=>b.sourceIndex),g.blocks.map((_,i)=>i),'source indices '+ci);
   for(const e of zero.events){if(e.role!=='primary'||!/^blocks\.(floor|block\.\d+\.(top|side|front|rim|mark|glyph))$/.test(e.owner))failures.push({label:'all events primary/source owner',event:e});}
   const actualGlyphIDs=zero.events.filter(e=>e.kind==='item').map(e=>e.owner),expectedGlyphIDs=g.blocks.filter(b=>b.emitted&&b.ch!=null&&call.t-(b.mi|0)*(base.stagger||0)>=0).sort((a,b)=>a.painterIndex-b.painterIndex).map(b=>'blocks.'+b.id+'.glyph');
   eq(expectedGlyphIDs,actualGlyphIDs,'original source/delayed glyph coverage '+ci);
   const partRank={top:0,side:1,front:2,rim:3,mark:4,glyph:5};let previous=-1;
   for(const e of zero.events){if(e.owner==='blocks.floor')continue;const m=/^blocks\.block\.(\d+)\.(\w+)$/.exec(e.owner);if(!m)continue;const b=g.blocks[+m[1]],rank=b.painterIndex*6+partRank[m[2]];if(!b.emitted||rank<previous)failures.push({label:'original painter/source membership '+ci,owner:e.owner,rank,previous});previous=rank;}
   for(const b of g.blocks){
    eq(b.t1,.06+(b.order+1)*g.gap,'original when '+ci+':'+b.id);eq(b.f,(call.t-b.t1)/.3,'original phase '+ci+':'+b.id);
    if(b.emitted&&b.ch!=null){const rad=b.rot*J.DEG;eq(b.glyphMatrix,[Math.cos(rad),Math.sin(rad),-Math.sin(rad)*b.sq,Math.cos(rad)*b.sq,b.x,b.yNow+b.kz/2],'native glyph matrix '+ci+':'+b.id);}
   }
   // A fresh catalog must not share arrays/objects with a previous invocation.
   const snap=JSON.stringify(discovery.catalog);g.rows[0].push('catalog-only');g.blocks[0].source.probe=true;
   eq(JSON.stringify(discovery.catalog),snap,'fresh catalog isolation '+ci);
   // Restore only returned diagnostic copy for a clear raw record; source was never touched.
   g.rows[0].pop();delete g.blocks[0].source.probe;
   }
  }
  eq(json(),before,'source JSON unchanged '+ci);eq(state(),flags,'source freeze/seal flags unchanged '+ci);eq(sourceGraphFlags(),graphFlags,'every original object freeze/seal/extensible state unchanged '+ci);rows.push(row);
 }
 return {spec:{...spec,calls:undefined},calls,discovery,rows,failures,sourceState:{before:flags,after:state(),unchanged:json()===before},fontAudit:window.layoutsBFixtureFontAudit};
}

async function controlSpot({layout,fonts}){
 const r=await runLayoutsBFixture(J,{layout,control:'off',W:960,H:540,text:'風の先へ',seed:704,params:layout==='flag'?{mode:'unfurl'}:{}},{newPath:false,fonts,renderInitial:false,exportDataURL:false});
 const rows={layout},hash=async c=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',c.getImageData(0,0,c.canvas.width,c.canvas.height).data))).map(v=>v.toString(16).padStart(2,'0')).join('');
 for(const kind of ['off','direct','zero','shifted','moved']){
  const cv=document.createElement('canvas');cv.width=960;cv.height=540;const ctx=cv.getContext('2d');ctx.translate(480,270);ctx.rotate(.013);ctx.scale(1.013,1.013);ctx.translate(-480,-270);
  const cut={...r.plan.cuts[0],area:null,fullStagePlacement:true};if(kind!=='off')cut.placementLayoutsD=true;
  const env=r.renderer.makeEnv(ctx,r.plan,cut,cut.palette,{pass:'main',passColor:'#e9529e',t:1.5,realTime:1.5,lt:1.5,ltb:1.5,step:0,scale:1,allowFilter:false});
  if(kind==='zero'||kind==='moved'){
   const p=J.placement.record(r.renderer,env);if(!p.measurementSupported)throw Error('Other-D control unsupported '+layout+JSON.stringify(p.diagnostics));
   rows[kind+'Events']=p.events.map(e=>({kind:e.kind,role:e.role,owner:e.owner,matrix:e.matrix,root:e.nativeTransform?.root}));J.placement.replay(env,p,kind==='moved'?[17,-11]:[0,0]);
  }else{
   if(kind==='shifted'){const m=ctx.getTransform(),inv=J.placement.inverse([m.a,m.b,m.c,m.d,m.e,m.f]);ctx.translate(inv[0]*17-inv[2]*11,inv[1]*17-inv[3]*11);}J.LAYOUTS[layout].render(env);
  }
  rows[kind]=await hash(ctx);cv.width=cv.height=1;
 }
 return rows;
}

(async()=>{
 assert.equal(process.env.BLOCKS_NATIVE03_RELEASE,'PARENT_REVIEWED_SOURCE_RUNNER', 'Parent must explicitly authorize this sealed runner');
 const target=path.join(dir,'evidence/native03.raw.json.gz');assert(!fs.existsSync(target),'Never overwrite raw');
 const pins=JSON.parse(fs.readFileSync(path.join(dir,'evidence/baseline-pins03.json'))),seal=JSON.parse(fs.readFileSync(path.join(dir,'evidence/pre-run-seal03.json')));
 for(const p of pins.files)assert.equal(sha(fs.readFileSync(path.join(root,p.path))),p.sha256,'canonical input changed '+p.path);
 for(const p of pins.runtimeExternalPins)assert.equal(sha(fs.readFileSync(p.path)),p.sha256,'canonical runtime changed '+p.path);
 for(const p of seal.files)assert.equal(sha(fs.readFileSync(path.join(dir,p.path))),p.sha256,'isolated sealed input changed '+p.path);
 const before=fs.readFileSync(path.join(dir,'evidence/11p_layoutsD.before.js'),'utf8'),after=fs.readFileSync(path.join(dir,'src/11p_layoutsD.js'),'utf8'),canonical=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.equal(canonical.split(before).length,2,'Canonical JA embeds exactly the pinned source');
 const rootBefore=fs.readFileSync(path.join(dir,'evidence/09a_placement.before.js'),'utf8'),rootAfter=fs.readFileSync(path.join(dir,'src/09a_placement.js'),'utf8');assert.equal(canonical.split(rootBefore).length,2,'Canonical JA embeds exactly the original09a');
 // One standalone HTML before and one after, in memory only; no build/module operation.
 const html={before:canonical,after:canonical.replace(before,after).replace(rootBefore,rootAfter)},fonts=JSON.parse(fs.readFileSync(path.join(root,'dev/avoidance/layouts-c-editorial-fonts/manifest.json')));
 const assets=new Map([['/before.html',Buffer.from(html.before)],['/after.html',Buffer.from(html.after)]]);
 const fontAssets=[];
 for(const face of fonts.faces){
  const url=new URL(face.url,'http://127.0.0.1'),assetPath=url.pathname.replace(/^\//,''),pin=pins.files.find(p=>p.path===assetPath);
  assert.equal(url.origin,'http://127.0.0.1','Only the existing local font manifest is allowed');assert(pin,'Missing pinned manifest font '+face.id);
  const bytes=fs.readFileSync(path.join(root,assetPath)),digest=sha(bytes);assert.equal(digest,pin.sha256);assert.equal(digest,face.sourceSHA256,'Canonical manifest font bytes '+face.id);
  assert(!assets.has(url.pathname),'Duplicate local asset URL');assets.set(url.pathname,bytes);fontAssets.push({id:face.id,url:face.url,path:assetPath,bytes:bytes.length,sha256:digest});
 }
 const invocation={at:new Date().toISOString(),pins,seal,htmlSHA256:{before:sha(html.before),after:sha(html.after)},fontAssets,specs,release:process.env.BLOCKS_NATIVE03_RELEASE};fs.writeFileSync(path.join(dir,'evidence/native03.invocation.json'),JSON.stringify(invocation,null,2),{flag:'wx'});
 const localAssetRequests=[];
 const fixture=fs.readFileSync(path.join(root,'dev/avoidance/layouts-b-fixture.js'),'utf8');let browser,server,results=[],controls=[],errors=[],summary=null;
 try{
  server=http.createServer((q,res)=>{const pathname=new URL(q.url,'http://127.0.0.1').pathname,b=assets.get(pathname);localAssetRequests.push({url:q.url,pathname,status:b?200:404,bytes:b?.length||0,sha256:b?sha(b):sha(Buffer.alloc(0))});if(!b){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',pathname.endsWith('.html')?'text/html':pathname.endsWith('.ttf')?'font/ttf':'font/otf');res.end(b);});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const base='http://127.0.0.1:'+server.address().port;browser=await require(path.join(root,'dev/browser.cjs')).launch({executablePath:pins.browser.path});
  const pages=[];for(const variant of ['before','after']){const p=await browser.newPage();await p.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());await p.goto(base+'/'+variant+'.html');await p.waitForFunction(()=>window.J?.ui?.plan);await p.addScriptTag({content:fixture});pages.push(p);}
  for(const spec of specs){const current=await pages[1].evaluate(exercise,{spec,fonts,after:true}),original=await pages[0].evaluate(exercise,{spec:{...spec,calls:current.calls},fonts,after:false});
   const parity=[];for(let i=0;i<current.rows.length;i++){const a=current.rows[i].off,b=original.rows[i].off;if(JSON.stringify(a)!==JSON.stringify(b))parity.push({index:i,call:current.calls[i],expected:b,actual:a});}
   results.push({current,original,parity});}
  for(const layout of ['pile','accordion','flag']){
   const original=await pages[0].evaluate(controlSpot,{layout,fonts}),current=await pages[1].evaluate(controlSpot,{layout,fonts});
   const equal=JSON.stringify(original)===JSON.stringify(current),parity=original.direct===original.zero&&original.shifted===original.moved&&current.direct===current.zero&&current.shifted===current.moved;
   controls.push({layout,original,current,equal,parity});if(!equal)errors.push({controlSourceRegression:layout});if(!parity)errors.push({controlNativeReplayMismatch:layout});
  }
  const catalogs=results.map(r=>r.current.discovery.catalog).filter(Boolean),coverage={fixtures:results.length,empty:results.some(r=>r.current.spec.empty&&r.current.discovery.catalog===null),supports:catalogs.some(g=>g.blocks.some(b=>b.source.kind==='support')),toys:catalogs.some(g=>g.blocks.some(b=>b.source.kind==='toy')),spaces:catalogs.some(g=>g.rows.flat().includes(' ')),portrait:catalogs.some(g=>g.port),landscape:catalogs.some(g=>!g.port),tilt:catalogs.some(g=>g.blocks.some(b=>b.rot!==0)),passes:[...new Set(results.flatMap(r=>r.current.calls.map(c=>c.pass)))]};
  summary={coverage,failures:results.reduce((n,r)=>n+r.current.failures.length+r.original.failures.length+r.parity.length,0)};for(const k of ['empty','supports','toys','spaces','portrait','landscape','tilt'])if(!coverage[k])errors.push({missingCoverage:k});
 }catch(e){errors.push({name:e.name,message:e.message,stack:e.stack});}
 finally{if(browser)await browser.close();if(server)await new Promise(ok=>server.close(ok));}
 for(const p of pins.files)if(sha(fs.readFileSync(path.join(root,p.path)))!==p.sha256)errors.push({changedCanonical:p.path});
 for(const p of pins.runtimeExternalPins)if(sha(fs.readFileSync(p.path))!==p.sha256)errors.push({changedRuntime:p.path});
 for(const p of seal.files)if(sha(fs.readFileSync(path.join(dir,p.path)))!==p.sha256)errors.push({changedIsolated:p.path});
 fs.writeFileSync(target,zlib.gzipSync(JSON.stringify({invocation,localAssetRequests,summary,results,controls,errors}),{mtime:0}),{flag:'wx'});console.log(JSON.stringify({target,summary,errors}));assert.equal(errors.length,0);assert.equal(summary?.failures,0);
})().catch(e=>{console.error(e);process.exitCode=1;});
