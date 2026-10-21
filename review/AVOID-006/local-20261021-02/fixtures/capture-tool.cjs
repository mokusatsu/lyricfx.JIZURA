/* Focused AVOID-006 actual MP4 evidence. Does not display media during capture. */
'use strict';

const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),http=require('node:http'),zlib=require('node:zlib'),os=require('node:os'),assert=require('node:assert/strict');

const ROOT=path.resolve(__dirname,'../..'),BASE='3e2ff804fac2e94dce79039ddf7a46ec19221494',OLD='local-20261020-04',FPS=24,FRAMES=96;

const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>fs.readFileSync(p),json=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n'),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const cases=()=>[
{id:'film-landscape',label:'フィルム／Landscape',layout:'filmstrip',W:1920,H:1080,text:'風の先へ',seed:704,cx:.5,cy:.42,radius:.2,time:0},
{id:'film-long',label:'長い歌詞／Long lyric',layout:'filmstrip',W:1920,H:1080,text:'風の先へ歩いて行こう',seed:704,cx:.5,cy:.42,radius:.2,time:0},
{id:'film-portrait',label:'縦長／Portrait',layout:'filmstrip',W:1080,H:1920,text:'風の先へ',seed:704,cx:.5,cy:.5,radius:.05,time:0}
];

function fontAudit(){
  const fonts=['font.otf','font-symbols.ttf'].map(name=>path.join(ROOT,'review/AVOID-006',OLD,'fixtures',name)),texts=cases().map(c=>c.text);
  require('./layouts-a-review.cjs').fontCoverage(fonts,texts.join(''));
  return {passed:true,texts,fonts:fonts.map(p=>({path:path.relative(ROOT,p),sha256:sha(read(p))})),method:'existing fontCoverage/fontTools cmap union; no fallback allowed'};
}

function probe(file){
  const p=JSON.parse(cp.execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',file],{maxBuffer:2e6}));
  delete p.format.filename;
  return p;
}

function atoms(file){
  const b=read(file),a=[];
  let i=0;
  while(i+8<=b.length){
    let n=b.readUInt32BE(i),header=8;
    if(n===1){
      assert.ok(i+16<=b.length);
      n=Number(b.readBigUInt64BE(i+8));
      header=16;
    }
    if(n===0)n=b.length-i;
    assert.ok(n>=header&&i+n<=b.length,'valid MP4 atom boundary');
    a.push({type:b.toString('ascii',i+4,i+8),offset:i,bytes:n});
    i+=n;
  }
  assert.equal(i,b.length,'complete MP4 atoms');
  return a;
}

function checkMP4(file,{fps=FPS,duration,frames}={}){
  const p=probe(file),v=p.streams.filter(s=>s.codec_type==='video');
  assert.equal(v.length,1);
  const s=v[0];
  assert.equal(s.codec_name,'h264');
  assert.equal(s.pix_fmt,'yuv420p');
  assert.equal(s.width%2,0);
  assert.equal(s.height%2,0);
  const rate=s.avg_frame_rate.split('/').map(Number);
  assert.equal(rate[0]/rate[1],fps);
  assert.ok(+p.format.duration>0);
  if(duration!=null)assert.ok(Math.abs(+p.format.duration-duration)<.08,'intended duration');
  if(frames!=null)assert.equal(+s.nb_read_frames,frames,'all intended frames decoded');
  const a=atoms(file),moov=a.find(x=>x.type==='moov'),mdat=a.find(x=>x.type==='mdat');
  assert.ok(moov&&mdat&&moov.offset<mdat.offset,'faststart moov before mdat');
  return {probe:p,atoms:a};
}

function encodeArgs(output){
  return ['-hide_banner','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart','-r',String(FPS),'-n',output];
}

async function server(){
  const s=http.createServer((req,res)=>{
    try{
      const file=path.resolve(ROOT,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
      assert.ok(file.startsWith(ROOT+path.sep));
      const ext=path.extname(file);
      res.setHeader('Content-Type',({'.html':'text/html','.json':'application/json','.js':'text/javascript','.mp4':'video/mp4','.otf':'font/otf','.ttf':'font/ttf'})[ext]||'application/octet-stream');
      res.setHeader('Cache-Control','no-store');
      const bytes=read(file);
      res.setHeader('Accept-Ranges','bytes');
      const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if(range){
        const start=+range[1],end=range[2]?Math.min(+range[2],bytes.length-1):bytes.length-1;
        if(start>end||start>=bytes.length){
          res.writeHead(416,{'Content-Range':'bytes */'+bytes.length});
          res.end();
          return;
        }
        res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});
        res.end(bytes.subarray(start,end+1));
      }else{
        res.setHeader('Content-Length',bytes.length);
        res.end(bytes);
      }
    }catch{
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise(r=>s.listen(0,'127.0.0.1',r));
  return {s,base:'http://127.0.0.1:'+s.address().port+'/'};
}

function pageHTML(m,en=false){
  const title=en?'AVOID-006 · Film motion review':'AVOID-006 · フィルムの動作確認';
  return `<!doctype html><html lang="${en?'en':'ja'}"><meta charset="utf-8"><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width"><title>${title}</title><style>body{font:16px system-ui,sans-serif;max-width:1100px;margin:24px auto;padding:0 16px;background:#151923;color:#eee}a{color:#9ddcff}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}video{display:block;width:100%;max-height:65vh;background:#080b10}section{margin:36px 0}h2{font-size:1.2rem}p{line-height:1.6}@media(max-width:650px){.pair{grid-template-columns:1fr}}</style><h1>${title}</h1><p>${esc(m.build)} · <a href="${en?'index.html':'en.html'}">${en?'日本語':'English'}</a> · <a href="manifest.json">Manifest / evidence</a> · <a href="../${OLD}/index.html">Previous full comparison</a></p><p>${en?'Play each MP4 using its native controls. Film pairs use identical input, 24 frames/sec, 0–4 seconds; pause and seek to compare. Dashed green circles are review guides. Check: landscape exposures retain 3:2, the strip scrolls horizontally, and lyrics appear in sequence.':'各MP4の再生ボタンで確認できます。同じ入力・24fps・0〜4秒の変更前後です。一時停止・シークで比較してください。緑の点線は回避円ガイドです。確認点：横長の露光枠が3:2、横方向にフィルムが流れる、歌詞が順に現れること。'}</p>${m.cases.map(c=>`<section id="${c.id}"><h2>${esc(c.label)}</h2><p>${esc(c.text)} · ${c.W}×${c.H} · seed ${c.seed} · circle (${c.cx}, ${c.cy}), r=${c.radius}</p><div class="pair">${['before','after'].map(side=>`<div><p>${side==='before'?(en?'Before (3e2ff804)':'変更前 (3e2ff804)'):(en?'After':'変更後')}</p><video controls playsinline preload="none" src="${c[side].path}"></video><a href="${c[side].path}">MP4</a><p>${esc(c[side].diagnosis.status==='safe-hold'?(en?'Avoidance during hold; entry/exit can cross the circle':'保持中は回避・入退場は円を通過できます'):c[side].diagnosis.status==='safe'?(en?'Avoidance for the full interval':'全区間で回避'):c[side].diagnosis.decision==='excluded-during-avoidance'?(en?'Excluded candidate: shows original rendering; avoidance is not guaranteed':'候補除外：元の描画を表示・円回避は保証しません'):(en?'Uncertified diagnostic: avoidance is not guaranteed':'未保証の診断：円回避は保証しません'))}</p>${c[side].snapshot?`<p><a href="${c[side].snapshot.nativePath}">1.5s PNG</a> · <a href="${c[side].snapshot.mp4SourcePath}">MP4 source PNG</a></p>`:''}</div>`).join('')}</div></section>`).join('')}<section><h2>${en?'Other motion examples':'その他の動き'}</h2><p>${en?'These three MP4s retain the previous comparison capture, including its low capture rate. Encoding at24fps cannot recover missing source frames. They do not demonstrate the new film animation.':'以下3本は前回の比較動画をMP4へ変換したものです。元の取得フレーム数が少なく、24fpsへの変換で欠落した動きは復元されません。今回のフィルム修正を示す動画ではありません。'}</p>${m.legacy.map(v=>`<h2>${esc(v.layout)}</h2><p>${esc(v.original.actualFrames)} captured renderer frames / ${v.original.duration}s</p><video controls playsinline preload="none" src="${v.path}"></video>`).join('')}</section></html>`;
}

async function capture(build,{smoke=false}={}){
  assert.match(build,/^[a-zA-Z0-9._-]+$/);
  const gateRoot=path.join(ROOT,'tasks/evidence/AVOID-006/film-revision'),gate=smoke?null:JSON.parse(read(path.join(gateRoot,'functional-summary.json')));
  if(gate){
    assert.equal(gate.compiledSHA256,sha(read(path.join(ROOT,'index.html'))),'preflight gate JA');
    assert.equal(gate.compiledENSHA256,sha(read(path.join(ROOT,'en/index.html'))),'preflight gate EN');
    for(const name of ['filmstrip-test','filmstrip-parity'])assert.ok(gate.tests.some(t=>t.name===name),'film gate '+name);
  }
  const fontsChecked=fontAudit();const rel=(smoke?'work/film-review-smoke/':'review/AVOID-006/')+build,dir=path.join(ROOT,rel);
  assert.ok(!fs.existsSync(dir),'fresh bundle path required');fs.mkdirSync(dir,{recursive:true});
  assert.equal(fs.readdirSync(dir).length,0,'fresh bundle required');
  fs.mkdirSync(path.join(dir,'fixtures'));
  fs.mkdirSync(path.join(dir,'videos'));
  fs.mkdirSync(path.join(dir,'observations'));
  fs.mkdirSync(path.join(dir,'images'));
  const oldDir=path.join(ROOT,'review/AVOID-006',OLD),old=JSON.parse(read(path.join(oldDir,'manifest.json'))),m={schema:1,revision:'focused-native-mp4-v1',fontAudit:fontsChecked,task:'AVOID-006',build,smoke,created:new Date().toISOString(),baselineCommit:BASE,fps:FPS,frames:smoke?40:FRAMES,duration:smoke?40/FPS:4,assets:{},cases:smoke?cases().slice(0,1):cases(),legacy:[],observationCoverage:{allFrames:'source/PNG/full native observation hashes; actual per-pass safety, envelope, clock, phase and event counts; certified frames assert strict clearance and envelope coverage',completeRawFrames:[3,7,15,36,90],notRetained:'Full per-frame polygon observations outside these five keyframes are not retained.'},limitations:['Fresh film capture is deterministic direct seek at n/24, no temporal accumulation; source renderer quantizes its internal motion clock as recorded.','Guides are drawn after rendering; raw native frame SHA256 and full placement observations retained at five specified keyframes (3,7,15,36,90) only.','Other layouts reuse old immutable WebM capture with original capture limitations.'],captureConditions:{viewport:[1100,1100],dpr:1,zoom:1,language:'ja',media:'none',seek:'direct n/24',nativeDuration:4,noHud:true,noPost:true,guide:'green dashed circle composited after native rendering',normalization:'engine-only-dom-v1',font:'immutable old04 Noto font + DejaVu symbols'},environment:{platform:os.platform(),release:os.release(),arch:os.arch(),node:process.version,ffmpeg:cp.execFileSync('ffmpeg',['-version'],{encoding:'utf8'}).split('\n')[0]}};
  
  const add=(p,b)=>{
    fs.writeFileSync(path.join(dir,p),b);
    m.assets[p]=sha(b);
  };
  const shared=name=>{
    const p=path.relative(dir,path.join(oldDir,'fixtures',name));
    m.assets[p]=sha(read(path.join(dir,p)));
    return p;
  };
  const font=shared('font.otf'),symbols=shared('font-symbols.ttf'),symbolInfo=JSON.parse(read(path.join(oldDir,'fixtures/font-symbols.json')));
  shared('font-symbols.json');
  add('fixtures/fixture.js',read(path.join(ROOT,'dev/avoidance/layouts-a-fixture.js')));
  add('fixtures/capture-tool.cjs',read(__filename));
  
  const norm=require('./layouts-a-review.cjs').normalizeAppHTML;
  const engines={};
  assert.equal(sha(cp.execFileSync('git',['show',BASE+':dev/avoidance/layouts-a-fixture.js'],{cwd:ROOT})),m.assets['fixtures/fixture.js'],'identical baseline/candidate fixture');
  const files=cp.execFileSync('git',['ls-tree','-r','--name-only',BASE,'src'],{cwd:ROOT,encoding:'utf8'}).trim().split('\n');
  add('fixtures/source-provenance.json',Buffer.from(JSON.stringify(files.map(p=>({path:p,before:sha(cp.execFileSync('git',['show',BASE+':'+p],{cwd:ROOT,maxBuffer:20e6})),after:sha(read(path.join(ROOT,p)))})),null,2)));
  
  for(const side of ['before','after']){
    const source=side==='before'?cp.execFileSync('git',['show',BASE+':index.html'],{cwd:ROOT,maxBuffer:30e6}):read(path.join(ROOT,'index.html'));
    if(side==='before'){
      assert.equal(sha(source),old.after.sourceSHA256,'old04 source equals pinned baseline');
      engines.before=shared('after-engine.html');
      shared('after.html');
      m.beforeSourceSHA256=sha(source);
    }else{
      add('fixtures/after.html.gz',zlib.gzipSync(source,{level:9}));
      add('fixtures/after-engine.html',norm(source));
      engines.after='fixtures/after-engine.html';
      m.afterSourceSHA256=sha(source);
    }
  }
  
  add('fixtures/after-en.html.gz',zlib.gzipSync(read(path.join(ROOT,'en/index.html')),{level:9}));
  if(gate){
    add('fixtures/functional-summary.json',read(path.join(gateRoot,'functional-summary.json')));
    m.gateLogs=[];
    for(const p of require('./layouts-a-review.cjs').functionalLogPaths(gate)){
      const raw=read(path.join(gateRoot,path.basename(p))),encoded=zlib.gzipSync(raw,{level:9}),encodedPath=p+'.gz';
      add(encodedPath,encoded);
      m.gateLogs.push({rawPath:p,encodedPath,encoding:'gzip',rawSHA256:sha(raw),rawBytes:raw.length,encodedSHA256:sha(encoded),encodedBytes:encoded.length});
    }
    assert.equal(gate.performance?.passed,true,'formal performance passed');assert.equal(gate.performance.exitCode,0);assert.equal(gate.performance.reportPath,'performance.json');assert.equal(gate.performance.logPath,'performance.log');add('fixtures/performance.json',read(path.join(gateRoot,'performance.json')));const perfRaw=read(path.join(gateRoot,'performance.log')),perfEncoded=zlib.gzipSync(perfRaw,{level:9});add('fixtures/performance.log.gz',perfEncoded);m.performanceLog={rawPath:'fixtures/performance.log',encodedPath:'fixtures/performance.log.gz',rawSHA256:sha(perfRaw),rawBytes:perfRaw.length,encodedSHA256:sha(perfEncoded),encodedBytes:perfEncoded.length};checkGate(dir,m);
  }
  m.source={en:sha(read(path.join(ROOT,'en/index.html'))),before:m.beforeSourceSHA256,after:m.afterSourceSHA256,fixture:m.assets['fixtures/fixture.js'],gitHead:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim()};
  
  m.engines=engines;m.appPublicFiles=[{path:'../../../index.html',sha256:m.source.after},{path:'../../../en/index.html',sha256:m.source.en}];
  const local=await server(),browser=await require('../browser.cjs').launch();
  try{
    m.environment.browser=browser.version();
    for(const c of m.cases)for(const side of ['before','after']){
      const page=await browser.newPage({viewport:{width:1100,height:1100},deviceScaleFactor:1});
      await page.route('**/*',r=>r.request().url().startsWith(local.base)?r.continue():r.abort());
      await page.goto(new URL(engines[side],local.base+rel+'/').href);
      await page.addScriptTag({url:local.base+rel+'/fixtures/fixture.js'});
      await page.evaluate(async({c,font,symbols,range})=>{
        const f=new FontFace('Avoid006Fixture',`url(${symbols})`,{unicodeRange:range});
        document.fonts.add(await f.load());
        window.result=await runLayoutsAFixture(J,c,{newPath:true,adaptive:true,fontURL:font});
        await document.fonts.ready;
        window.initialPlan=JSON.stringify(result.plan);
      },{c,font:new URL(font,local.base+rel+'/').href,symbols:new URL(symbols,local.base+rel+'/').href,range:symbolInfo.unicodeRange});
      
      const dest=`videos/${c.id}-${side}.mp4`,args=encodeArgs(path.join(dir,dest)),encoder=cp.spawn('ffmpeg',args,{stdio:['pipe','ignore','pipe']});
      let stderr='';
      encoder.stderr.on('data',b=>stderr+=b);
      const completed=new Promise((resolve,reject)=>{
        encoder.on('error',reject);
        encoder.on('close',code=>code===0?resolve():reject(Error(stderr)));
      });
      completed.catch(()=>{});
      encoder.stdin.on('error',()=>{
      });
      const initial=await page.evaluate(()=>({observation:result.observation,plan:result.plan,project:result.project}));
      const diagnosis=await page.evaluate(()=>{
        const o=result.observationAt(1.5);
        return {time:1.5,decision:o.decision,status:o.segment?.status||'not-certified',safetyScope:o.safetyScope,failure:o.failure,selectedStrategy:o.selectedStrategy};
      });
      const observations=[];
      try{
      for(let n=0;n<m.frames;n++){
        const frame=await page.evaluate(({n,fps,c})=>{
          const time=n/fps,observations=[];
          result.renderer.frame(result.canvas.getContext('2d'),result.plan,time,{noHud:true,noPost:true,placementObservation:o=>observations.push(o)});
          if(JSON.stringify(result.plan)!==initialPlan)throw Error('capture mutated plan');
          const raw=result.canvas.toDataURL();
          const guide=document.createElement('canvas');
          guide.width=c.W;
          guide.height=c.H;
          const ctx=guide.getContext('2d');
          ctx.drawImage(result.canvas,0,0);
          ctx.strokeStyle='#67e8bd';
          ctx.lineWidth=2;
          ctx.setLineDash([6,5]);
          ctx.beginPath();
          ctx.arc(c.cx*c.W,c.cy*c.H,c.radius*Math.min(c.W,c.H),0,Math.PI*2);
          ctx.stroke();
          return {raw,encoded:guide.toDataURL(),observation:{time,observations}};
        },{n,fps:FPS,c});
        const raw=Buffer.from(frame.raw.split(',')[1],'base64'),png=Buffer.from(frame.encoded.split(',')[1],'base64');
        checkRuntimeFrame(c,side,diagnosis,frame);
        const fullObservationSHA256=sha(Buffer.from(JSON.stringify(frame.observation))),summary={time:n/FPS,observations:frame.observation.observations.map(summarizePass)};
        observations.push({frame:n,time:n/FPS,nativePNGHash:sha(raw),encodedPNGHash:sha(png),fullObservationSHA256,observation:summary,...([3,7,15,36,90].includes(n)?{fullObservation:frame.observation}:{})});
        if(n===36){
          add(`images/${c.id}-${side}-native.png`,raw);
          add(`images/${c.id}-${side}-mp4-source.png`,png);
        }
        await new Promise((resolve,reject)=>encoder.stdin.write(png,error=>error?reject(error):resolve()));
      }
      encoder.stdin.end();
      await completed;
      }catch(error){encoder.stdin.destroy();encoder.kill('SIGTERM');await completed.catch(()=>{});throw error;}
      const observationPath=`observations/${c.id}-${side}.json.gz`,raw=Buffer.from(JSON.stringify({initial,frames:observations}));
      add(observationPath,zlib.gzipSync(raw,{level:9}));
      m.assets[dest]=sha(read(path.join(dir,dest)));
      c[side]={path:dest,diagnosis,snapshot:{time:1.5,frame:36,nativePath:`images/${c.id}-${side}-native.png`,mp4SourcePath:`images/${c.id}-${side}-mp4-source.png`},observationPath,observationEncoding:'json+gzip',observationEncodedSHA256:m.assets[observationPath],observationEncodedBytes:fs.statSync(path.join(dir,observationPath)).size,observationRawSHA256:sha(raw),observationRawBytes:raw.length,encodeArgs:args.map(a=>a===path.join(dir,dest)?dest:a),...checkMP4(path.join(dir,dest),{duration:m.duration,frames:m.frames})};
      await page.close();
    }
    
    if(!smoke)for(const layout of ['quote','ticket','sideways']){
      const original=old.playback[layout],input=path.join(oldDir,original.path),dest=`videos/${layout}-previous.mp4`;
      assert.equal(sha(read(input)),old.assets[original.path],'immutable original WebM');
      const args=['-hide_banner','-loglevel','error','-i',input,'-an','-vf','scale=960:-2','-r',String(FPS),'-c:v','libx264','-preset','medium','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','-n',path.join(dir,dest)];
      cp.execFileSync('ffmpeg',args);
      m.assets[dest]=sha(read(path.join(dir,dest)));
      const p=`../${OLD}/${original.path}`;
      m.assets[p]=old.assets[original.path];
      m.legacy.push({layout,path:dest,original:{path:p,sha256:old.assets[original.path],duration:original.duration,actualFrames:original.actualFrames,method:original.method},...checkMP4(path.join(dir,dest))});
    }
    
    add('index.html',pageHTML(m));
    add('en.html',pageHTML(m,true));
    m.bundleBytes=Object.keys(m.assets).filter(p=>!p.startsWith('../')).reduce((n,p)=>n+fs.statSync(path.join(dir,p)).size,0);
    assert.ok(m.bundleBytes<45e6,'focused bundle below45MB');
    checkCurrentSource(m.source);for(const p of JSON.parse(read(path.join(dir,'fixtures/source-provenance.json'))))assert.equal(p.after,sha(read(path.join(ROOT,p.path))),'source stayed frozen during capture '+p.path);
    assert.equal(sha(read(__filename)),m.assets['fixtures/capture-tool.cjs'],'tool stayed frozen during capture');
    if(!smoke)assert.equal(m.cases[0].after.diagnosis.status,'safe-hold','canonical main is actual certified hold');
    json(path.join(dir,'manifest.json'),m);
    return {dir,bytes:m.bundleBytes,cases:m.cases.map(c=>({id:c.id,before:c.before.diagnosis,after:c.after.diagnosis}))};
  }finally{
    await browser.close();
    await new Promise(r=>local.s.close(r));
  }
}

function verifyAsset(dir,p,h){
  assert.match(h,/^[a-f0-9]{64}$/,'asset SHA256');
  assert.ok(typeof p==='string'&&!p.includes('\\')&&!path.isAbsolute(p),'relative asset path');
  const target=path.resolve(dir,p),oldRoot=path.join(ROOT,'review/AVOID-006',OLD);
  const shared=['font.otf','font-symbols.ttf','font-symbols.json','after.html','after-engine.html','playback-quote.webm','playback-ticket.webm','playback-sideways.webm'].map(n=>path.join(oldRoot,'fixtures',n));
  assert.ok(target.startsWith(dir+path.sep)||shared.includes(target),'asset bounded to bundle or immutable old04 allowlist');
  assert.equal(fs.realpathSync(target),target,'no symlink assets');
  assert.equal(sha(read(target)),h,'asset hash '+p);
  return target;
}

function checkCurrentSource(source){
  assert.equal(source.after,sha(read(path.join(ROOT,'index.html'))),'current JA source drift');
  assert.equal(source.en,sha(read(path.join(ROOT,'en/index.html'))),'current EN source drift');
  assert.equal(source.fixture,sha(read(path.join(ROOT,'dev/avoidance/layouts-a-fixture.js'))),'current fixture drift');
}

function decodeGzipEvidence(encoded,ref){
  assert.ok(Number.isSafeInteger(ref.rawBytes)&&ref.rawBytes>0&&ref.rawBytes<=32*1024*1024,'bounded raw log bytes');
  assert.equal(encoded.length,ref.encodedBytes,'encoded log bytes');
  assert.equal(sha(encoded),ref.encodedSHA256,'encoded log SHA');
  const raw=zlib.gunzipSync(encoded,{maxOutputLength:32*1024*1024});
  assert.equal(raw.length,ref.rawBytes,'raw log bytes');
  assert.equal(sha(raw),ref.rawSHA256,'raw log SHA');
  return raw;
}

function checkGate(dir,m){
  const receipt=JSON.parse(read(path.join(dir,'fixtures/functional-summary.json'))),paths=require('./layouts-a-review.cjs').functionalLogPaths(receipt);
  assert.deepEqual(m.gateLogs.map(r=>r.rawPath),paths,'complete raw gate logs');
  for(const name of ['filmstrip-test','filmstrip-parity'])assert.ok(receipt.tests.some(t=>t.name===name),'required focused film gate');
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'film-gate-'));
  try{
    fs.mkdirSync(path.join(tmp,'fixtures'));
    fs.copyFileSync(path.join(dir,'fixtures/functional-summary.json'),path.join(tmp,'fixtures/functional-summary.json'));
    for(const r of m.gateLogs){
      assert.equal(r.encodedPath,r.rawPath+'.gz');
      assert.equal(r.encodedSHA256,m.assets[r.encodedPath]);
      fs.writeFileSync(path.join(tmp,r.rawPath),decodeGzipEvidence(read(path.join(dir,r.encodedPath)),r));
    }
    const checked=require('./layouts-a-review.cjs').checkFunctionalReceipt(tmp,ROOT);assert.equal(receipt.performance?.passed,true,'performance receipt passed');assert.equal(receipt.performance.exitCode,0);const perfRaw=read(path.join(dir,'fixtures/performance.json'));assert.equal(sha(perfRaw),receipt.performance.reportSHA256,'performance report pin');const perf=JSON.parse(perfRaw);assert.equal(perf.passed,true);assert.equal(perf.compiledSHA256.after,receipt.compiledSHA256,'performance current source');assert.equal(perf.fixtureSHA256,receipt.fixtureSHA256);assert.deepEqual(perf.comparisons,receipt.performance.comparisons);assert.deepEqual(perf.config,receipt.performance.config);assert.equal(m.performanceLog.rawPath,'fixtures/performance.log');assert.equal(m.performanceLog.encodedPath,'fixtures/performance.log.gz');const perfLog=decodeGzipEvidence(read(path.join(dir,m.performanceLog.encodedPath)),m.performanceLog);assert.equal(sha(perfLog),receipt.performance.logSHA256,'performance raw log pin');return checked;
  }finally{
    fs.rmSync(tmp,{recursive:true,force:true});
  }
}

function readRawObservation(dir,v){
  const encoded=read(path.join(dir,v.observationPath));assert.equal(encoded.length,v.observationEncodedBytes,'encoded observation bytes');assert.equal(sha(encoded),v.observationEncodedSHA256,'encoded observation hash');const raw=zlib.gunzipSync(encoded,{maxOutputLength:128e6});
  assert.equal(raw.length,v.observationRawBytes,'raw observation length');
  assert.equal(sha(raw),v.observationRawSHA256,'raw observation hash');
  const stored=JSON.parse(raw);
  assert.ok(stored.initial.plan&&stored.initial.observation);
  return stored;
}

function summarizePass(o){
  const {events,polygons,strictPolygons,relaxedPolygons,relaxedEvents,...rest}=o;
  const groups={};
  for(const e of events||[]){
    const key=JSON.stringify([e.kind,e.motion,e.phase]);
    groups[key]=(groups[key]||0)+1;
  }
  return {...rest,counts:{events:events?.length||0,polygons:polygons?.length||0,strictPolygons:strictPolygons?.length||0,relaxedPolygons:relaxedPolygons?.length||0},eventGroups:groups,relaxedEvents:(relaxedEvents||[]).map(({polygons,...e})=>({...e,polygonCount:polygons?.length||0}))};
}

function checkRuntimeFrame(c,side,diagnosis,frame){
  const certified=['safe','safe-hold'].includes(diagnosis.status);if(certified&&frame.observation.time===1.5)assert.ok(frame.observation.observations.length>0,'certified hold has actual native passes');
  if(certified)for(const o of frame.observation.observations){
    assert.equal(o.measurementSupported,true,'native measurement '+c.id+' '+side);
    assert.equal(o.envelopeCovered,true,'actual frame inside certified envelope '+c.id+' '+side);
    assert.equal(o.strictCircleClear,true,'actual strict geometry clear '+c.id+' '+side);
    if(o.safetyScope==='full-interval')assert.equal(o.rawCircleClear,true,'full interval geometry clear '+c.id+' '+side);
  }
}

function validateFiles(dir){
  const m=JSON.parse(read(path.join(dir,'manifest.json')));
  assert.equal(m.revision,'focused-native-mp4-v1');assert.deepEqual(m.fontAudit,fontAudit(),'pinned fixture font coverage');
  assert.equal(m.baselineCommit,BASE);
  assert.equal(m.fps,FPS);
  checkCurrentSource(m.source);assert.equal(m.engines.after,'fixtures/after-engine.html');assert.equal(m.engines.before,Object.keys(m.assets).find(p=>p.startsWith('..')&&p.endsWith('/fixtures/after-engine.html')));
  if(!m.smoke)checkGate(dir,m);
  assert.equal(m.frames,m.smoke?40:FRAMES);
  assert.equal(m.duration,m.frames/FPS);
  for(const [p,h]of Object.entries(m.assets))verifyAsset(dir,p,h);
  const beforeSource=read(path.join(dir,Object.keys(m.assets).find(p=>p.endsWith('/after.html')))),afterSource=zlib.gunzipSync(read(path.join(dir,'fixtures/after.html.gz')),{maxOutputLength:30e6});
  assert.equal(sha(beforeSource),m.source.before);
  assert.equal(sha(cp.execFileSync('git',['show',BASE+':index.html'],{cwd:ROOT,maxBuffer:30e6})),m.source.before,'pinned baseline source');
  assert.equal(sha(require('./layouts-a-review.cjs').normalizeAppHTML(beforeSource)),m.assets[Object.keys(m.assets).find(p=>p.endsWith('/after-engine.html')&&p.startsWith('..'))],'baseline engine normalization');
  const afterEN=zlib.gunzipSync(read(path.join(dir,'fixtures/after-en.html.gz')),{maxOutputLength:30e6});
  assert.equal(sha(afterEN),m.source.en,'retained EN source');
  assert.equal(m.assets['fixtures/fixture.js'],m.source.fixture,'retained fixture identity');
  const provenance=JSON.parse(read(path.join(dir,'fixtures/source-provenance.json')));
  assert.deepEqual(provenance.map(p=>p.path),fs.readdirSync(path.join(ROOT,'src')).filter(p=>p.endsWith('.js')).sort().map(p=>'src/'+p),'complete current src inventory');
  for(const p of provenance)assert.equal(p.after,sha(read(path.join(ROOT,p.path))),'current src drift '+p.path);
  assert.equal(sha(afterSource),m.source.after);
  assert.equal(sha(require('./layouts-a-review.cjs').normalizeAppHTML(afterSource)),m.assets['fixtures/after-engine.html']);
  assert.deepEqual(m.cases.map(({before,after,...c})=>c),m.smoke?cases().slice(0,1):cases());
  assert.equal(m.assets['fixtures/capture-tool.cjs'],sha(read(__filename)),'current tool matches capture');
  for(const [p,h]of Object.entries(m.assets)){
    assert.ok(!p.startsWith('/')&&!p.includes('\\'),'relative paths');
    const target=path.resolve(dir,p);
    assert.ok(target.startsWith(ROOT+'/'),'asset inside repo');
    assert.equal(sha(read(target)),h,'asset hash '+p);
  }
  for(const c of m.cases)for(const side of ['before','after']){
    const v=c[side];
    assert.equal(v.path,`videos/${c.id}-${side}.mp4`);
    assert.ok(m.assets[v.path]&&m.assets[v.observationPath]);
    const actual=checkMP4(path.join(dir,v.path),{duration:m.duration,frames:m.frames});
    assert.deepEqual(actual.probe,v.probe);
    assert.deepEqual(actual.atoms,v.atoms);
    const stored=readRawObservation(dir,v),obs=stored.frames;
    assert.equal(obs.length,m.frames);
    for(const [n,o]of obs.entries()){
      assert.equal(o.frame,n);
      assert.equal(o.time,n/FPS);
      assert.equal(o.observation.time,n/FPS);
      assert.match(o.nativePNGHash,/^[a-f0-9]{64}$/);
      if(n===36){
        assert.equal(v.snapshot.frame,n);
        assert.equal(v.snapshot.time,o.time);
        assert.equal(m.assets[v.snapshot.nativePath],o.nativePNGHash,'same native capture PNG');
        assert.equal(m.assets[v.snapshot.mp4SourcePath],o.encodedPNGHash,'exact PNG passed to encoder');
      }
      assert.ok(Array.isArray(o.observation.observations));
      checkRuntimeFrame(c,side,v.diagnosis,o);
      assert.match(o.fullObservationSHA256,/^[a-f0-9]{64}$/);
      if([3,7,15,36,90].includes(n)){
        assert.equal(sha(Buffer.from(JSON.stringify(o.fullObservation))),o.fullObservationSHA256,'complete raw keyframe');
        assert.deepEqual(o.observation.observations,o.fullObservation.observations.map(summarizePass),'full keyframe summary matches');
      }else assert.equal(o.fullObservation,undefined,'honest keyframe raw scope');
    }
    assert.equal(actual.probe.streams[0].width,c.W);
    assert.equal(actual.probe.streams[0].height,c.H);
  }
  for(const v of m.legacy)checkMP4(path.join(dir,v.path));
  for(const [name,en]of [['index.html',false],['en.html',true]])assert.equal(read(path.join(dir,name)).toString(),pageHTML(m,en),'canonical native-video page');
  return m;
}

async function rerenderSnapshots(browser,m,base,report){
  report.rerenderedSnapshots=[];
  const shared=name=>Object.keys(m.assets).find(p=>p.endsWith('/fixtures/'+name)&&p.startsWith('..'));
  const symbolInfo=JSON.parse(read(path.resolve(ROOT,'review/AVOID-006',OLD,'fixtures/font-symbols.json')));
  for(const c of m.cases)for(const side of ['before','after']){
    const record=c[side],page=await browser.newPage({viewport:{width:1100,height:1100},deviceScaleFactor:1});
    try{
      await page.route('**/*',r=>r.request().url().startsWith(new URL(base).origin+'/')?r.continue():r.abort());
      await page.goto(new URL(m.engines[side],base).href);
      await page.addScriptTag({url:new URL('fixtures/fixture.js',base).href});
      const png=await page.evaluate(async({c,time,font,symbols,range})=>{
        const f=new FontFace('Avoid006Fixture',`url(${symbols})`,{unicodeRange:range});
        document.fonts.add(await f.load());
        const result=await runLayoutsAFixture(J,c,{newPath:true,adaptive:true,fontURL:font});
        await document.fonts.ready;
        result.renderer.frame(result.canvas.getContext('2d'),result.plan,time,{noHud:true,noPost:true});
        return result.canvas.toDataURL();
      },{c,time:record.snapshot.time,font:new URL(shared('font.otf'),base).href,symbols:new URL(shared('font-symbols.ttf'),base).href,range:symbolInfo.unicodeRange});
      const actual=sha(Buffer.from(png.split(',')[1],'base64'));
      assert.equal(actual,m.assets[record.snapshot.nativePath],'live fixture native PNG matches '+c.id+' '+side);
      report.rerenderedSnapshots.push({case:c.id,side,time:record.snapshot.time,sha256:actual,matched:true});
    }finally{await page.close();}
  }
}

async function validate(dir,baseURL){
  if(baseURL){const u=new URL(baseURL);assert.ok(u.pathname.endsWith('/'),'public bundle URL requires trailing slash');assert.ok(['http:','https:'].includes(u.protocol));}
  dir=path.resolve(dir);
  const m=validateFiles(dir),local=baseURL?null:await server(),base=baseURL||new URL(path.relative(ROOT,dir)+'/',local.base).href,browser=await require('../browser.cjs').launch(baseURL?require('./review.cjs').publicBrowserOptions(base):{}),report={created:new Date().toISOString(),baseURL:base,browser:null,initial:[],playback:[],publicHashes:[]};
  try{
    report.browser=browser.version();
    for(const name of ['index.html','en.html']){
      const page=await browser.newPage(),requests=[],responses=[],errors=[];
      page.on('request',r=>requests.push(r.url()));
      page.on('response',r=>responses.push(r));
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(new URL(name,base).href,{waitUntil:'networkidle'});
      assert.equal(await page.locator('canvas,iframe,script').count(),0,'review has no renderer or frame playback');
      assert.equal(await page.locator('video:not([preload="none"]),video:not([controls])').count(),0,'native video controls and no initial preload');
      assert.equal(requests.filter(u=>/\.(mp4|webm|png|otf|ttf|gz)(?:\?|$)/.test(u)).length,0,'no initial media/font/observation transfers');
      const bytes=await page.evaluate(()=>({navigation:performance.getEntriesByType('navigation').map(e=>({transferSize:e.transferSize,encodedBodySize:e.encodedBodySize,decodedBodySize:e.decodedBodySize})),resources:performance.getEntriesByType('resource').map(e=>({name:e.name,transferSize:e.transferSize,encodedBodySize:e.encodedBodySize}))}));
      report.initial.push({page:name,requests,requestCount:requests.length,bytes});
      assert.ok(bytes.navigation[0].encodedBodySize<30000,'lightweight initial document');
      assert.deepEqual(errors,[]);
      await page.close();
    }
    
    const page=await browser.newPage();
    await page.goto(new URL('index.html',base).href);
    assert.notEqual(await page.evaluate(()=>document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"')),'','Chromium supports H264');
    for(const v of [...m.cases.flatMap(c=>[c.before,c.after]),...m.legacy]){
      const result=await page.evaluate(async src=>{
        const v=[...document.querySelectorAll('video')].find(v=>v.getAttribute('src')===src);
        if(!v)throw Error('missing video');
        const event=(name,ms=15000)=>new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(Error('timeout '+name)),ms);
          v.addEventListener(name,()=>{
            clearTimeout(timer);
            resolve();
          },{once:true});
          v.addEventListener('error',()=>reject(Error('media error '+v.error?.code)),{once:true});
        });
        v.muted=true;
        v.load();
        if(v.readyState<1)await event('loadedmetadata');
        let frames=0;
        const stamp=[];
        function onFrame(now,meta){
          frames++;
          stamp.push({mediaTime:meta.mediaTime,presentedFrames:meta.presentedFrames});
          if(!v.paused)v.requestVideoFrameCallback(onFrame);
        }
        v.requestVideoFrameCallback(onFrame);
        const start=v.currentTime;
        await v.play();
        await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(Error('time did not advance')),10000);
          function tick(){
            if(v.currentTime>Math.min(1.5,v.duration*.7)){
              clearTimeout(timer);
              resolve();
            }else requestAnimationFrame(tick);
          }
          tick();
        });
        v.pause();
        const pausedAt=v.currentTime,quality=v.getVideoPlaybackQuality();
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        if(v.currentTime!==pausedAt)throw Error('pause advanced');
        const seekTo=v.duration*.65,seeked=event('seeked');
        v.currentTime=seekTo;
        await seeked;
        const decodedAfterSeek=await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(Error('seek frame not decoded')),10000);
          v.requestVideoFrameCallback((now,meta)=>{
            clearTimeout(timer);
            resolve({mediaTime:meta.mediaTime,presentedFrames:meta.presentedFrames});
          });
        });
        const seekedAt=v.currentTime;
        const rewind=event('seeked');
        v.currentTime=0;
        await rewind;
        const fullFrames=[];
        let lastWall=null,maxWallGap=0;
        function fullFrame(now,meta){
          if(lastWall!=null)maxWallGap=Math.max(maxWallGap,(now-lastWall)/1000);
          lastWall=now;
          fullFrames.push({mediaTime:meta.mediaTime,presentedFrames:meta.presentedFrames});
          if(!v.ended)v.requestVideoFrameCallback(fullFrame);
        }
        v.requestVideoFrameCallback(fullFrame);
        const fullStart=performance.now(),ended=event('ended',Math.ceil(v.duration*2000+8000));
        await v.play();
        await ended;
        const fullWallSeconds=(performance.now()-fullStart)/1000,fullQuality=v.getVideoPlaybackQuality();
        const fullPlayback={ended:v.ended,wallSeconds:fullWallSeconds,frames:fullFrames.length,firstMediaTime:fullFrames[0]?.mediaTime,lastMediaTime:fullFrames.at(-1)?.mediaTime,maxWallGap,quality:{totalVideoFrames:fullQuality.totalVideoFrames,droppedVideoFrames:fullQuality.droppedVideoFrames,corruptedVideoFrames:fullQuality.corruptedVideoFrames}};
        return {src,start,fullPlayback,pausedAt,duration:v.duration,frames,stamp,quality:{totalVideoFrames:quality.totalVideoFrames,droppedVideoFrames:quality.droppedVideoFrames,corruptedVideoFrames:quality.corruptedVideoFrames},seekTo,seekedAt,decodedAfterSeek,readyState:v.readyState,error:v.error?.code||null};
      },v.path);
      assert.ok(result.frames>0,'decoded playback frames');
      assert.ok(result.pausedAt>result.start,'playback advanced');
      assert.ok(Math.abs(result.seekTo-result.seekedAt)<.05,'native seek '+JSON.stringify(result));
      assert.ok(Math.abs(result.decodedAfterSeek.mediaTime-result.seekTo)<.1,'seek decoded intended frame');
      assert.equal(result.error,null);
      const full=result.fullPlayback;
      assert.equal(full.ended,true,'video reached ended');
      assert.ok(full.wallSeconds<result.duration*1.8+2,'bounded real playback time');
      assert.ok(full.frames>=Math.max(2,result.duration*FPS*.4),'decoded frames throughout playback');
      assert.ok(full.lastMediaTime-full.firstMediaTime>=result.duration-.2,'decoded timeline spans full clip');
      assert.ok(full.maxWallGap<.75,'no long decode stall');
      assert.equal(full.quality.corruptedVideoFrames,0,'no corrupted frames');
      assert.ok(full.quality.droppedVideoFrames/Math.max(1,full.quality.totalVideoFrames)<.25,'bounded dropped decode frames');
      report.playback.push(result);
    }
    
    if(baseURL)for(const [p,h]of [...Object.entries(m.assets),['manifest.json',sha(read(path.join(dir,'manifest.json')))]]){
      const r=await page.evaluate(async url=>{
        const r=await fetch(url);
        return {status:r.status,bytes:Array.from(new Uint8Array(await r.arrayBuffer()))};
      },new URL(p,base).href);
      assert.equal(r.status,200,'public HTTP '+p);
      assert.equal(sha(Buffer.from(r.bytes)),h,'public raw hash '+p);
      report.publicHashes.push({path:p,sha256:h,bytes:r.bytes.length});
    }
    if(baseURL){
      report.application=[];
      assert.deepEqual(m.appPublicFiles,[{path:'../../../index.html',sha256:m.source.after},{path:'../../../en/index.html',sha256:m.source.en}]);
      for(const app of m.appPublicFiles){
        const url=new URL(app.path,base).href,r=await page.evaluate(async url=>{
          const r=await fetch(url);
          return {status:r.status,bytes:Array.from(new Uint8Array(await r.arrayBuffer()))};
        },url);
        assert.equal(r.status,200,'public application HTTP');
        assert.equal(sha(Buffer.from(r.bytes)),app.sha256,'public application hash');
        const appPage=await browser.newPage();
        await appPage.goto(url);
        await appPage.waitForFunction(()=>window.J?.uiApi&&J.ui.plan,null,{timeout:30000});
        report.application.push({url,sha256:app.sha256,uiApiInitialized:true,rendererTest:'separate site-smoke owned by parent'});
        await appPage.close();
      }
    }
    await page.close();
    await rerenderSnapshots(browser,m,base,report);
    report.passed=true;
    return report;
  }finally{
    await browser.close();
    if(local)await new Promise(r=>local.s.close(r));
  }
}

module.exports={fontAudit,rerenderSnapshots,decodeGzipEvidence,checkGate,summarizePass,checkRuntimeFrame,checkCurrentSource,readRawObservation,verifyAsset,cases,probe,atoms,checkMP4,encodeArgs,pageHTML,capture,validateFiles,validate};

if(require.main===module)(async()=>{
  const [command,arg,...rest]=process.argv.slice(2);
  if(command==='capture'){
    assert.ok(rest.every(x=>x==='--smoke'));
    console.log(JSON.stringify(await capture(arg,{smoke:rest.includes('--smoke')})));
  }else if(command==='validate'){
    const report=await validate(arg,rest[0]);
    console.log(JSON.stringify(report,null,2));
  }else throw Error('capture BUILD [--smoke] | validate DIRECTORY [BASE_URL]');
})().catch(e=>{
  console.error(e);
  process.exitCode=1;
});

