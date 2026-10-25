'use strict';
// SEALED SOURCE ONLY: parent owns execution after independent review.
const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto'),zlib=require('zlib'),assert=require('assert/strict');
const dir=path.resolve(__dirname,'..'),root=path.resolve(dir,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const specs=[
 {W:960,H:540,text:'風',seed:804,params:{tie:'bunch',arc:.02,colOff:0,mono:false}},
 {W:960,H:540,text:'風の先へ続く青い空',seed:805,params:{tie:'bunch',arc:.06,colOff:4,mono:true}},
 {W:480,H:854,text:'GO GO GO',seed:806,params:{tie:'free',arc:.04,colOff:2,mono:false}},
 {W:960,H:540,text:'A B C D E',seed:807,params:{tie:'free',arc:.02,colOff:1,mono:true}},
 {W:480,H:854,text:'風の先へ続く道',seed:808,params:{tie:'bunch',arc:.06,colOff:3,mono:false},motionScale:.5},
 {W:720,H:777,text:'風の先へ',seed:809,params:{tie:'free',arc:.04,colOff:4,mono:false}},
 {W:720,H:778,text:'A B',seed:810,params:{tie:'bunch',arc:.03,colOff:1,mono:true}},
 {W:960,H:540,text:'placeholder',empty:true,seed:811,params:{tie:'free',arc:.02,colOff:0,mono:false}},
];
async function exercise({spec,fonts,after,calls:provided}){
 const failures=[],eq=(a,b,label)=>{if(JSON.stringify(a)!==JSON.stringify(b))failures.push({label,expected:a,actual:b});};
 const r=await runLayoutsBFixture(J,{layout:'balloons',control:'off',ghost:true,...spec},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),base=r.plan.cuts[0];
 if(spec.empty){base.text='';base.lineText='';}
 base.params.probe={nested:['preserve',spec.seed]};Object.freeze(base.params.probe.nested);Object.seal(base.params.probe);if(spec.seed%2===0)Object.freeze(base.params);
 const sourceJSON=JSON.stringify(r.plan),refs=new Set(),collect=v=>{if(v&&typeof v==='object'&&!refs.has(v)){refs.add(v);for(const x of Object.values(v))collect(x);}};collect(r.plan);
 const flags=()=>Array.from(refs,v=>[Object.isFrozen(v),Object.isSealed(v),Object.isExtensible(v)]),sourceFlags=flags();
 const assertDetachedFrozen=v=>{if(v&&typeof v==='object'){if(refs.has(v))throw Error('catalog aliases input');if(!Object.isFrozen(v))throw Error('catalog not deeply frozen');for(const x of Object.values(v))assertDetachedFrozen(x);}};
 const clean=v=>JSON.parse(JSON.stringify(v,(_,x)=>typeof x==='function'?undefined:x));
 const hash=async ctx=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height).data))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const mat=ctx=>{const m=ctx.getTransform();return [m.a,m.b,m.c,m.d,m.e,m.f];};
 const draw=async(call,kind,offset=[0,0],capture=false)=>{
  const cv=document.createElement('canvas'),scale=call.scale||1;cv.width=Math.round(spec.W*scale);cv.height=Math.round(spec.H*scale);const ctx=cv.getContext('2d');ctx.scale(scale,scale);
  if(call.root){ctx.translate(spec.W/2+.137,spec.H/2+.281);ctx.rotate(.013);ctx.scale(1.013,1.013);ctx.translate(-spec.W/2,-spec.H/2);}
  const root=mat(ctx),cut={...base,area:null,fullStagePlacement:true};if(kind!=='off')cut.placementLayoutsD=true;
  let staggerReads=0;Object.defineProperty(cut,'stagger',{enumerable:true,get(){staggerReads++;return base.stagger;}});
  const env=r.renderer.makeEnv(ctx,r.plan,cut,cut.palette,{pass:call.pass,passColor:call.pass==='A'?'#e9529e':'#4bcade',t:call.t,realTime:call.t,lt:call.t,ltb:call.t+(call.pass==='A'?.8/24:call.pass==='B'?1.6/24:0),step:0,scale,allowFilter:false}),sentinel=Object.freeze({role:'primary',owner:'test.previous'});env.drawOwnership=sentinel;
  let program=null,bb=null,trace=[],recordError=null;const readsBefore=staggerReads;
  if(kind==='replay'){
   try{program=J.placement.record(r.renderer,env);if(!program.measurementSupported)throw Error('record unsupported '+JSON.stringify(program.diagnostics));J.placement.replay(env,program,offset);}
   catch(e){recordError={name:e.name,message:e.message,code:e.code||null};}
  }else{
   if(offset.some(Boolean)){const inv=J.placement.inverse(root),dx=offset[0]*scale,dy=offset[1]*scale;ctx.translate(inv[0]*dx+inv[2]*dy,inv[1]*dx+inv[3]*dy);}
   if(capture){for(const key of ['line','poly','circle']){const fn=env[key];env[key]=(...args)=>{trace.push({key,args:clean(args),matrix:mat(ctx),ownership:clean(env.drawOwnership)});return fn(...args);};}
    const recorder={item(it){trace.push({key:'item',args:clean([it]),callbackSource:it.charFn?String(it.charFn):null,matrix:mat(ctx),ownership:clean(env.drawOwnership)});delete env.placementRecorder;try{return J.drawItem(env,it);}finally{env.placementRecorder=recorder;}}};env.placementRecorder=recorder;}
   bb=J.LAYOUTS.balloons.render(env);
  }
  if(env.drawOwnership!==sentinel)throw Error('ownership leaked');
  const catalog=program?.nativeDGeometry||env.placementDGeometry||null;if(catalog){assertDetachedFrozen(catalog);if(catalog.kind!=='balloons-native-catalog'||!catalog.nativeOnly)throw Error('wrong catalog');}
  // Callback remains live in the ACTUAL program used above. Raw JSON is diagnostic only.
  const callbacks=program?program.events.filter(e=>e.kind==='item').map(e=>({owner:e.owner,live:typeof e.args[0].charFn==='function',source:e.args[0].charFn?String(e.args[0].charFn):null})):null;
  const value={hash:await hash(ctx),bb:clean(bb),trace,catalog,root,staggerReads:staggerReads-readsBefore,events:program?clean(program.events):null,callbacks,recordError};cv.width=cv.height=1;return value;
 };
 const discovery=after?await draw({t:1.5,pass:'main',root:false,scale:1},'direct'):null;
 let calls=provided;
 if(after){
  const times=[0,.05,.05+1e-9,.05+.45*13/24,.5,1.5,3.6,3.8,4];
  if(!spec.empty){const g=discovery.catalog,last=g.glyphs[g.glyphs.length-1];for(const when of [.05,last.t1,.05+.45,last.t1+.45,Math.floor(last.t1/Math.max(.005,base.stagger||.04))*(base.stagger||0)])for(const eps of [-1e-9,0,1e-9])times.push(when+eps);}
  calls=[...new Set(times)].filter(t=>t>=0).map((t,i)=>({t,pass:['main','A','B'][i%3],root:i%2===1,scale:[.5,1,2][i%3]}));
  for(const pass of ['main','A','B'])for(const scale of [.5,1,2])calls.push({t:1.5,pass,root:true,scale});
 }
 const rows=[];
 for(const [ci,call]of calls.entries()){
  const off=await draw(call,'off',[0,0],true),row={call,off};
  if(after){
   const direct=await draw(call,'direct',[0,0],true),zero=await draw(call,'replay'),offset=[17,-11],shifted=await draw(call,'direct',offset),moved=await draw(call,'replay',offset);Object.assign(row,{direct,zero,offset,shifted,moved});
   eq(off.hash,direct.hash,'OFF/direct pixels '+ci);eq(off.bb,direct.bb,'original returnBB '+ci);eq(off.staggerReads,direct.staggerReads,'original timing getter call count '+ci);
   const payload=t=>t.map(({ownership,...e})=>e);eq(payload(off.trace),payload(direct.trace),'original native paint/callback/CTM/order '+ci);
   if(zero.recordError||moved.recordError)failures.push({label:'record/replay error '+ci,zero:zero.recordError,moved:moved.recordError});
   else{eq(direct.hash,zero.hash,'zero replay pixels '+ci);eq(shifted.hash,moved.hash,'nonzero replay pixels '+ci);eq(direct.catalog,zero.catalog,'direct/record catalog '+ci);}
   eq(direct.catalog,shifted.catalog,'catalog offset-independent '+ci);
   const g=direct.catalog;
   if(spec.empty){eq(g,null,'empty catalog '+ci);eq(direct.bb,null,'empty BB '+ci);eq(zero.events,[],'empty events '+ci);}
   else{
    eq(g.glyphs.map(v=>v.q),g.glyphs.map((_,i)=>i),'source q identity '+ci);
    eq(g.gloss,{s:.93,clipY:[-.75,-.22],source:'native-live-charFn'},'semantic gloss '+ci);
    const owners=new Set(g.primaryOwners);for(const e of zero.events||[])if(e.role!=='primary'||!owners.has(e.owner))failures.push({label:'unknown/exempt event '+ci,event:e});
    for(const cb of zero.callbacks||[])eq(cb.live,cb.owner.endsWith('.gloss'),'original live callback retained '+ci+':'+cb.owner);
    const actual=direct.trace.filter(e=>e.key==='item'&&e.ownership.owner.endsWith('.body')).map(e=>e.ownership.owner);
    const expected=g.glyphs.filter(v=>v.emitted&&call.t-(v.mi|0)*(base.stagger||0)>=0).map(v=>'balloons.'+v.id+'.body');eq(actual,expected,'native main glyph timing coverage '+ci);
    let previous=-1;for(const e of direct.trace){const m=/^balloons\.balloon\.(\d+)\.(\w+)$/.exec(e.ownership.owner),part=m?.[2],q=m?+m[1]:0,rank=e.ownership.owner==='balloons.anchor'?g.glyphs.length*2:part==='string'?q*2:part==='knot'?q*2+1:g.glyphs.length*2+1+q*4+({rim:0,body:1,gloss:2,highlight:3}[part]);if(rank<previous)failures.push({label:'painter order '+ci,owner:e.ownership.owner,rank,previous});previous=rank;}
    const otherRefs=new Set(),walk=v=>{if(v&&typeof v==='object'){otherRefs.add(v);Object.values(v).forEach(walk);}};walk(discovery.catalog);
    const independent=v=>{if(v&&typeof v==='object'){if(otherRefs.has(v))throw Error('catalog invocation alias');Object.values(v).forEach(independent);}};independent(g);
    for(const v of g.glyphs){eq(v.t1,.05+v.q*J.clamp(base.dur*.3/g.n,.03,.08),'source onset '+ci+':'+v.q);eq(v.e,J.clamp((call.t-v.t1)/.45),'source phase '+ci+':'+v.q);if(v.emitted){eq(v.stringPoints.length,11,'11 string vertices '+ci+':'+v.q);eq(v.size,g.nativeSize*(.3+.7*J.E.outBack(v.e,2.2)),'source growth '+ci+':'+v.q);}}
   }
  }
  eq(JSON.stringify(r.plan),sourceJSON,'source unchanged '+ci);eq(flags(),sourceFlags,'source freeze/seal/extensibility unchanged '+ci);rows.push(row);
 }
 return {spec,calls,discovery,rows,failures,fontAudit:window.layoutsBFixtureFontAudit};
}
(async()=>{
 assert.equal(process.env.BALLOONS_NATIVE01_RELEASE,'PARENT_REVIEWED_SOURCE_RUNNER','parent source gate required');
 const target=path.join(dir,'evidence/native01.raw.json.gz');assert(!fs.existsSync(target));
 const pins=JSON.parse(fs.readFileSync(path.join(dir,'evidence/baseline-pins01.json'))),seal=JSON.parse(fs.readFileSync(path.join(dir,'evidence/pre-run-seal01.json')));
 const check=()=>{for(const p of pins.files)assert.equal(sha(fs.readFileSync(path.join(root,p.path))),p.sha256,'canonical changed '+p.path);for(const p of pins.runtimeExternalPins)assert.equal(sha(fs.readFileSync(p.path)),p.sha256,'runtime changed '+p.path);for(const p of seal.files)assert.equal(sha(fs.readFileSync(path.join(dir,p.path))),p.sha256,'isolated changed '+p.path);};check();
 const canonical=fs.readFileSync(path.join(root,'index.html'),'utf8'),before=fs.readFileSync(path.join(dir,'evidence/native-balloons.before.js'),'utf8'),after=fs.readFileSync(path.join(dir,'evidence/native-balloons.after.js'),'utf8');assert.equal(canonical.split(before).length,2);
 const html={before:canonical,after:canonical.replace(before,after)},fonts=JSON.parse(fs.readFileSync(path.join(root,'dev/avoidance/layouts-c-editorial-fonts/manifest.json'))),assets=new Map([['/before.html',Buffer.from(html.before)],['/after.html',Buffer.from(html.after)]]);
 for(const face of fonts.faces){const u=new URL(face.url,'http://127.0.0.1'),p=u.pathname.slice(1),pin=pins.files.find(v=>v.path===p),bytes=fs.readFileSync(path.join(root,p));assert.equal(u.origin,'http://127.0.0.1');assert(pin);assert.equal(sha(bytes),pin.sha256);assert.equal(sha(bytes),face.sourceSHA256);assert(!assets.has(u.pathname));assets.set(u.pathname,bytes);}
 const invocation={at:new Date().toISOString(),pins,seal,specs,htmlSHA256:{before:sha(html.before),after:sha(html.after)}};fs.writeFileSync(path.join(dir,'evidence/native01.invocation.json'),JSON.stringify(invocation,null,2),{flag:'wx'});
 const fixture=fs.readFileSync(path.join(root,'dev/avoidance/layouts-b-fixture.js'),'utf8'),requests=[],results=[],errors=[];let server,browser,summary=null;
 try{
  server=http.createServer((q,res)=>{const pathname=new URL(q.url,'http://127.0.0.1').pathname,b=assets.get(pathname);requests.push({pathname,status:b?200:404});res.writeHead(b?200:404,{'Content-Type':pathname.endsWith('.html')?'text/html':pathname.endsWith('.ttf')?'font/ttf':'font/otf'});res.end(b||'');});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const origin='http://127.0.0.1:'+server.address().port;browser=await require(path.join(root,'dev/browser.cjs')).launch({executablePath:pins.browser.path});
  const pages=[];for(const variant of ['before','after']){const page=await browser.newPage();await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());await page.goto(origin+'/'+variant+'.html');await page.waitForFunction(()=>window.J?.ui?.plan);await page.addScriptTag({content:fixture});pages.push(page);}
  for(const spec of specs){const current=await pages[1].evaluate(exercise,{spec,fonts,after:true}),original=await pages[0].evaluate(exercise,{spec,fonts,after:false,calls:current.calls}),parity=[];for(let i=0;i<current.rows.length;i++)if(JSON.stringify(current.rows[i].off)!==JSON.stringify(original.rows[i].off))parity.push({index:i,call:current.calls[i],current:current.rows[i].off,original:original.rows[i].off});results.push({current,original,parity});}
  summary={fixtures:results.length,calls:results.reduce((n,v)=>n+v.current.rows.length,0),failures:results.reduce((n,v)=>n+v.current.failures.length+v.original.failures.length+v.parity.length,0),publicChecks:0};
 }catch(e){errors.push({name:e.name,message:e.message,stack:e.stack});}
 finally{if(browser)await browser.close();if(server)await new Promise(ok=>server.close(ok));}
 try{check();}catch(e){errors.push({postPinFailure:e.message});}
 fs.writeFileSync(target,zlib.gzipSync(JSON.stringify({invocation,requests,summary,results,errors}),{mtime:0}),{flag:'wx'});console.log(JSON.stringify({target,summary,errors}));assert.equal(errors.length,0);assert.equal(summary?.failures,0);
})().catch(e=>{console.error(e);process.exitCode=1;});
