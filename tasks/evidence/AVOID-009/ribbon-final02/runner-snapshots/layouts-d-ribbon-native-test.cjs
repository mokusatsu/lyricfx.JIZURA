'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const target=process.env.JIZURA_D_RIBBON_REPORT||path.join(root,'evidence/ribbon01/native01.json.gz');assert(!fs.existsSync(target));
 const files=['src/09a_placement.js','src/09k_layoutsD_placement.js','src/11p_layoutsD.js','src/11za_layoutsD_transport.js','index.html','en/index.html','evidence/ribbon01/before-11p.js','dev/avoidance/layouts-a-fixture.js','dev/avoidance/layouts-d-ribbon-native-test.cjs'],pins=files.map(p=>({path:p,sha256:sha(fs.readFileSync(path.join(root,p)))}));
 const snap=target+'.inputs',blobDir=path.join(root,'evidence/ribbon01/blobs');fs.mkdirSync(snap);fs.mkdirSync(blobDir,{recursive:true});const manifest=[];for(const file of files){const bytes=fs.readFileSync(path.join(root,file)),hash=sha(bytes),blob=path.join(blobDir,hash+'.gz');if(!fs.existsSync(blob))fs.writeFileSync(blob,zlib.gzipSync(bytes,{mtime:0}));manifest.push({path:file,sha256:hash,blob:path.relative(root,blob)});}fs.writeFileSync(path.join(snap,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 const original=fs.readFileSync(path.join(root,'evidence/ribbon01/before-11p.js'),'utf8');let before=original;const start=before.indexOf('/* ================================================================== 6 ribbon'),end=before.indexOf('/* ================================================================== 7 pendulum',start);let block=before.slice(start,end);
 block=block.replace('    const bw = size * 0.72;', '    const bw = size * 0.72; if(env.ribbonReference)env.ribbonReference.size=size;');
 block=block.replace('      const TL = acc[NS];', '      const TL = acc[NS]; const ref=env.ribbonReference?{row:ri,text:row,cy,A,ph,tl,NS,pts,acc,TL,slots:[]}:null;if(ref)env.ribbonReference.rows.push(ref);');
 block=block.replace('      // shadow + band','      if(ref)ref.e=e;\n      // shadow + band');
 block=block.replace('      const sh = size', '      if(ref)ref.band=seg;\n      const sh = size');
 block=block.replace('        if (ch === \' \') return;', "        if(ref){const f=sc0/TL;ref.slots.push({id:ri+':'+i,row:ri,slot:i,ch,advance:ads[i],sc0,delta:sc0-TL/2,f,visible:vis(f),rawMi:miAt(env, ri * 0.12 + (Pm.reveal === 'left' ? f : Math.abs(f - 0.5) * 2) * 0.6),space:ch===' '});}\n        if (ch === ' ') return;");
 before=before.slice(0,start)+block+before.slice(end);
 const current=fs.readFileSync(path.join(root,'src/11p_layoutsD.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes(current));
 const font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',server=http.createServer((q,r)=>{try{if(q.url==='/font.otf')r.end(fs.readFileSync(font));else if(q.url==='/reference')r.end(html.replace(current,before));else if(q.url==='/unchanged')r.end(html.replace(current,original));else r.end(fs.readFileSync(path.join(root,q.url==='/'?'index.html':q.url)));}catch{r.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;
 try{
 browser=await require('../browser.cjs').launch();const open=async url=>{const p=await browser.newPage();await p.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await p.goto(base+url);await p.waitForFunction(()=>window.J?.ui?.plan);await p.addScriptTag({content:fs.readFileSync(path.join(__dirname,'layouts-a-fixture.js'),'utf8')});return p;};
 const exercise=async({reference=false,unchanged=false,cases=null}={})=>{
  const rows=[],transport=[],off=[];const hash=async ctx=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height).data)),b=>b.toString(16).padStart(2,'0')).join('');
  const specs=[{W:640,H:360,text:'風風の先へ',reveal:'center'},{W:360,H:640,text:'GO GO GO',reveal:'left'},{W:640,H:360,text:'AB AB AB AB',reveal:'left'},{W:360,H:640,text:'あいうえおかきくけこさしすせ',reveal:'center'}];
  const invocations=[];
  for(const [si,s]of specs.entries()){
   const spec={layout:'ribbon',...s,cx:.5,cy:.42,params:{amp:.075,freq:.71,ph:2.4,tilt:-5,col:'accent',reveal:s.reveal}},r=await runLayoutsAFixture(J,spec,{newPath:false,fontURL:location.origin+'/font.otf'}),baseCut={...r.plan.cuts[0],placementLayoutsD:true,placementUnits:true},sc=baseCut.palette,ctx=r.canvas.getContext('2d');
   const run=(t,stagger=.04,d=true)=>{
    ctx.reset();const cut={...baseCut,stagger,placementLayoutsD:d},env=r.renderer.makeEnv(ctx,r.plan,cut,sc,{pass:'main',t,realTime:t,lt:t,ltb:t,step:0,scale:1,allowFilter:false}),inputs=[],main=J.mainDraw;env.ribbonReference={rows:[]};J.mainDraw=(e,it)=>{inputs.push({...it});return main(e,it);};let p;try{if(d)p=J.placement.record(r.renderer,env);else{r.renderer.drawCut(env);p={measurementSupported:true,events:[]};}}finally{J.mainDraw=main;}return {p,inputs,reference:env.ribbonReference};
   };
   let calls=cases?.filter(c=>c.si===si).map(c=>({t:c.t,stagger:c.stagger}));if(!calls){calls=[0,.01,.12,.3,.6,.75,1.5,3.6,4].map(t=>({t,stagger:.04}));
    // Gates are roots of the original time-varying source predicate, not ordinal clocks.
    const catalog=run(1.5).p.nativeDGeometry;
    for(const row of catalog.rows)for(const slot of row.slots.filter(s=>!s.space)){
     let lo=0,hi=1.2;for(let k=0;k<45;k++){const t=(lo+hi)/2,slotAt=run(t).p.nativeDGeometry.rows[row.row].slots[slot.slot];if(slotAt.visible)hi=t;else lo=t;}for(const eps of [-1e-10,0,1e-10])calls.push({t:hi+eps,stagger:.04});
     const t=.6,sl=run(t).p.nativeDGeometry.rows[row.row].slots[slot.slot],onset=sl.rawMi*.04;for(const eps of [-1e-15,0,1e-15])if(onset/7+eps>=.005)calls.push({t,stagger:onset/7+eps});
    }
    calls=calls.filter((c,i,a)=>a.findIndex(v=>v.t===c.t&&v.stagger===c.stagger)===i);
   }
   for(const c of calls){const q=run(c.t,c.stagger);const g=reference?q.reference:q.p.nativeDGeometry;rows.push({si,...c,supported:q.p.measurementSupported,diagnostics:q.p.diagnostics,size:g?.size,catalog:g?.rows,inputs:q.inputs,events:q.p.events});invocations.push({si,...c});}
   for(const t of [0,.3,1.5,3.8]){
    const counts={},math={};for(const key of ['sin','cos','hypot','atan2','tan']){const fn=Math[key];Math[key]=(...args)=>{counts[key]=(counts[key]||0)+1;return fn(...args);};math[key]=fn;}const adv=J.metrics.adv;J.metrics.adv=function(...args){counts.adv=(counts.adv||0)+1;return adv.apply(this,args);};let q;try{q=run(t,.04,false);}finally{for(const [key,fn]of Object.entries(math))Math[key]=fn;J.metrics.adv=adv;}off.push({si,t,counts,inputs:q.inputs,sha:await hash(ctx)});
   }
   if(si===0&&!reference&&!unchanged)for(const camera of ['push','dutch'])for(const scale of [.1,4])for(const pass of ['main','A','B'])for(const offset of [[0,0],[27.25,-13.5]]){
    const cut={...baseCut,cam:camera},canvas=document.createElement('canvas');canvas.width=Math.round(spec.W*scale);canvas.height=Math.round(spec.H*scale);const ctx=canvas.getContext('2d'),t=1.5,opts={pass,passColor:'#ff00ff',t,realTime:t,lt:t,ltb:t+(pass==='A'?.8/24:pass==='B'?1.6/24:0),step:0,scale,allowFilter:false};const reset=()=>{ctx.reset();ctx.setTransform(scale,0,0,scale,0,0);const env=r.renderer.makeEnv(ctx,r.plan,cut,sc,opts),cam=J.CAMERA[camera].get(env,cut.camP||{})||{};ctx.translate(spec.W/2+(cam.x||0),spec.H/2+(cam.y||0));if(cam.rot)ctx.rotate(cam.rot*J.DEG);ctx.scale(cam.s??1,cam.s??1);ctx.translate(-spec.W/2,-spec.H/2);return env;};let env=reset();const m=ctx.getTransform(),inv=J.placement.inverse([m.a,m.b,m.c,m.d,m.e,m.f]),dx=offset[0]*scale,dy=offset[1]*scale;if(dx||dy)ctx.translate(inv[0]*dx+inv[2]*dy,inv[1]*dx+inv[3]*dy);r.renderer.drawCut(env);const direct=await hash(ctx);env=reset();const p=J.placement.record(r.renderer,env);if(p.measurementSupported)J.placement.replay(env,p,offset);transport.push({camera,scale,pass,offset,direct,replay:await hash(ctx),supported:p.measurementSupported,diagnostics:p.diagnostics});
   }
  }
  return {rows,off,transport,invocations};
 };
 const page=await open('/'),result=await page.evaluate(exercise),p2=await open('/reference'),reference=await p2.evaluate(exercise,{reference:true,cases:result.invocations}),p3=await open('/unchanged'),unchanged=await p3.evaluate(exercise,{unchanged:true,cases:result.invocations});
 const simplify=it=>{const q={...it};delete q.placementDSource;return q;},events=rows=>rows.map(e=>({kind:e.kind,args:e.args.map((a,i)=>e.kind==='item'&&i===0?simplify(a):a),matrix:e.matrix,polygons:e.polygons,alpha:e.alpha,order:e.order,blend:e.blend,state:e.state}));
 const bad=[];for(let i=0;i<result.rows.length;i++){const x=result.rows[i],y=reference.rows[i],z=unchanged.rows[i];for(const [kind,a,b]of [['catalog',x.catalog,y.catalog],['inputs',x.inputs.map(simplify),z.inputs],['events',events(x.events),events(z.events)]])if(!require('node:util').isDeepStrictEqual(a,b))bad.push({i,si:x.si,t:x.t,stagger:x.stagger,kind});if(!x.supported)bad.push({i,kind:'unsupported',diagnostics:x.diagnostics});for(const row of x.catalog)for(const slot of row.slots)if(!slot.space&&slot.visible){const it=x.inputs.find(q=>q.placementDSource?.id===slot.id);if(!it||it.mi!==slot.rawMi)bad.push({i,kind:'slotMi',slot});}}
 const offFailures=result.off.filter((x,i)=>JSON.stringify(x)!==JSON.stringify(unchanged.off[i])),transportFailures=result.transport.filter(x=>!x.supported||x.direct!==x.replay),owners=[...new Set(result.rows.flatMap(x=>x.events.map(e=>e.owner)))];
 for(const x of result.rows)assert(x.events.every(e=>e.role==='primary'&&/^ribbon\.\d+\.(shadow|front|back|highlight|twist|tail\.(start|end)|glyph\.\d+)$/.test(e.owner)));
 for(const pin of pins)assert.equal(sha(fs.readFileSync(path.join(root,pin.path))),pin.sha256);
 fs.writeFileSync(target,zlib.gzipSync(JSON.stringify({pins,font:{path:font,sha256:sha(fs.readFileSync(font))},browser:browser.version(),result,reference,unchanged,bad,offFailures,transportFailures,owners}),{mtime:0}));
 console.log(JSON.stringify({report:target,rows:result.rows.length,failures:bad.slice(0,6),off:result.off.length,offFailures:offFailures.length,transport:result.transport.length,transportFailures:transportFailures.slice(0,4),owners}));assert.equal(bad.length,0);assert.equal(offFailures.length,0);assert.equal(transportFailures.length,0);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
