/* AVOID-007 portable native-Canvas MP4 bundles. No screen capture or video input. */
'use strict';

const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),http=require('node:http'),zlib=require('node:zlib'),assert=require('node:assert/strict');

const BASE='e96cbb2f8379eb5895c36f1312f5083b0c583e75',FPS=24,FRAMES=96,KEYS=[3,15,36,90],SIDES=['before','after'],LAYOUTS=['rain','hanging','tunnel','wordCloud','bounceLine','elastic','crossBands','stickerBomb','neon','keycaps','bubbles','slotMachine','flipBoard','credits','zoomRepeat','splitHalves','columnsBig','dotMatrix','depthStack','typeSpecimen','kanjiFocus','halfVertical','curtain','equalizer','tape'];

const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),bytes=p=>fs.readFileSync(p),json=v=>JSON.stringify(v,null,2)+'\n',digest=v=>sha(Buffer.from(json(v))),esc=s=>String(s).replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

function relative(p){
  assert.equal(typeof p,'string');
  assert.match(p,/^[a-zA-Z0-9_./-]+$/);
  assert.ok(!p.startsWith('/')&&!p.split('/').some(x=>!x||x==='.'||x==='..'),'canonical local relative path');
  return p;
}

function regular(root,p){
  relative(p);
  const file=path.join(root,p);
  assert.equal(fs.realpathSync(file),path.resolve(file),'no symlink assets');
  assert.ok(fs.statSync(file).isFile());
  return bytes(file);
}

const CRC_TABLE = Array.from({length:256}, (_, value) => {
  let n=value;
  for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0);
  return n>>>0;
});
function crc32(b){
  let c=0xffffffff;
  for(const n of b)c=(c>>>8)^CRC_TABLE[(c^n)&255];
  return (c^0xffffffff)>>>0;
}

// Canvas toDataURL emits 8-bit RGBA PNGs. Other encodings fail closed.
function decodePNG(b){
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  let at=8,w,h,ended=false;
  const parts=[];
  while(at<b.length){
    assert.ok(at+12<=b.length);
    const n=b.readUInt32BE(at),type=b.toString('ascii',at+4,at+8);
    assert.ok(n<=64e6&&at+n+12<=b.length);
    assert.equal(crc32(b.subarray(at+4,at+8+n)),b.readUInt32BE(at+8+n),'PNG CRC');
    const d=b.subarray(at+8,at+8+n);
    if(type==='IHDR'){
      assert.equal(at,8);
      assert.equal(n,13);
      w=d.readUInt32BE(0);
      h=d.readUInt32BE(4);
      assert.ok(w>0&&h>0&&w*h<=32e6);
      assert.deepEqual([...d.subarray(8)],[8,6,0,0,0],'native 8-bit RGBA noninterlaced PNG');
    }
    else if(type==='IDAT')parts.push(d);
    else if(type==='IEND'){
      ended=true;
      assert.equal(n,0);
      at+=12;
      break;
    }
    at+=n+12;
  }
  assert.ok(ended&&at===b.length&&w&&h&&parts.length);
  const stride=w*4,raw=zlib.inflateSync(Buffer.concat(parts),{
    maxOutputLength:(stride+1)*h
  });
  assert.equal(raw.length,(stride+1)*h);
  const rgba=Buffer.alloc(w*h*4),paeth=(a,b,c)=>{
    const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
    return pa<=pb&&pa<=pc?a:pb<=pc?b:c;
  };
  for(let y=0;y<h;y++){
    const f=raw[y*(stride+1)];
    assert.ok(f<=4);
    for(let x=0;x<stride;x++){
      const i=y*stride+x,a=x>=4?rgba[i-4]:0,b=y?rgba[i-stride]:0,c=y&&x>=4?rgba[i-stride-4]:0;
      let predictor=0;
      if(f===1)predictor=a;
      else if(f===2)predictor=b;
      else if(f===3)predictor=(a+b)>>1;
      else if(f===4)predictor=paeth(a,b,c);
      rgba[i]=(raw[y*(stride+1)+1+x]+predictor)&255;
    }
  }
  return {
    width:w,height:h,rgba
  };
}

function safeObservations(observations){
  assert.ok(Array.isArray(observations)&&observations.length,'candidate native placement observations');
  for(const o of observations){
    assert.equal(o.measurementSupported,true);
    assert.equal(o.envelopeCovered,true);
    assert.equal(o.safety,'safe');
    if(o.strictCircleClear!==undefined)assert.equal(o.strictCircleClear,true);
    if(o.rawCircleClear!==undefined)assert.equal(o.rawCircleClear,true);
  }
  return observations.map(o=>({
    measurementSupported:o.measurementSupported,envelopeCovered:o.envelopeCovered,safety:o.safety,realTime:o.realTime,motionTime:o.motionTime,pass:o.pass,polygonCount:o.polygons?.length||0,polygonsSHA256:digest(o.polygons||[])
  }));
}

function safeInitial(initial){
  assert.equal(initial.observation.newAPI,true);
  assert.equal(initial.observation.staged,true);
  assert.equal(initial.observation.safety,'certified-bounded-adapter');
  assert.ok(!initial.observation.diagnostics.some(d=>d.safety==='unsupported'));
  const units=initial.plan.cuts[0].placementTrajectory?.units;
  assert.ok(Array.isArray(units)&&units.length,'active-circle representative requires nonempty trajectory units');
  for(const u of units){
    assert.ok(Array.isArray(u.segments)&&u.segments.length,'active-circle representative requires nonempty trajectory segments');
    for(const s of u.segments){
      assert.equal(s.status,'safe','representative excludes unsupported/insufficient states');
      assert.ok(s.decision!=='excluded-during-avoidance');
    }
  }
}

function normalizedRegions(regions,duration){
  assert.ok(Array.isArray(regions)&&regions.length,'active-circle representative requires regions');
  const sorted=regions.slice().sort((a,b)=>a.start-b.start);
  return sorted.map((r,i)=>{
    assert.ok(Number.isFinite(r.start)&&r.start>=0,'finite region start');
    assert.ok(r.end===null||Number.isFinite(r.end),'finite or implicit region end');
    assert.ok(Number.isFinite(r.center?.x)&&Number.isFinite(r.center?.y),'finite region center');
    assert.ok(Number.isFinite(r.radius),'finite region radius');
    // Match the existing source resolver: a null end reaches the next region,
    // or the composed duration for the last region, and never exceeds duration.
    const end=Math.min(r.end??sorted[i+1]?.start??duration,duration);
    assert.ok(end>r.start,'nonempty effective region interval');
    return {start:r.start,end,center:{x:r.center.x,y:r.center.y},radius:r.radius};
  });
}

function actualConditionGuard(initial,spec){
  const plan=initial.plan;
  assert.deepEqual([plan.W,plan.H],[spec.W,spec.H],'actual stage equals source condition');
  const duration=(spec.start??0)+(spec.duration??4);
  assert.equal(plan.duration,duration,'actual composed duration equals source condition');
  assert.ok(Array.isArray(plan.cuts)&&plan.cuts.length===1,'one actual representative cut');
  // The shared fixture deliberately takes the main text before the first |.
  // It does not trim whitespace or replace the main text with the note field.
  assert.equal(plan.cuts[0].text,String(spec.text||'風の先へ').split('|')[0],
    'actual cut main text equals source condition');
  assert.equal(plan.cuts[0].layout,spec.layout,'actual layout equals source condition');
  const index=plan.lyricAvoidanceIndex;
  assert.equal(index?.version,1,'actual avoidance schema');
  assert.equal(index.enabled,true,'actual circle avoidance index enabled');
  const sourceRegions=spec.regions||[{
    start:0,end:null,center:{x:spec.cx,y:spec.cy},radius:spec.radius,
  }];
  assert.deepEqual(normalizedRegions(index.regions,plan.duration),normalizedRegions(sourceRegions,duration),
    'actual circle regions equal source conditions');
}

function pngRecord(b,liveRGBA,W,H){
  const p=decodePNG(b);
  assert.deepEqual([p.width,p.height],[W,H]);
  assert.equal(sha(p.rgba),liveRGBA,'native getImageData equals decoded PNG RGBA');
  return {
    sha256:sha(b),rgbaSHA256:liveRGBA,width:W,height:H,bytes:b.length
  };
}

function codecQuality(file,keyFiles){
  return {
    method:'decoded H264 RGB versus original native Canvas key PNG; alpha excluded; no exact lossy equality claim',frames:keyFiles.map(({
      frame,file:pngFile
    })=>{
      const p=decodePNG(bytes(pngFile)),d=cp.execFileSync('ffmpeg',['-v','error','-threads','1','-i',file,'-vf','select=eq(n\\,'+frame+')','-frames:v','1','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{
        maxBuffer:p.rgba.length+1024
      });
      assert.equal(d.length,p.rgba.length);
      let absolute=0,squared=0,max=0,nonopaque=0;
      for(let i=0;i<d.length;i++){
        if(i%4===3){
          if(p.rgba[i]!==255)nonopaque++;
          continue;
        }
        const error=Math.abs(d[i]-p.rgba[i]);
        absolute+=error;
        squared+=error*error;
        max=Math.max(max,error);
      }
      const samples=p.width*p.height*3,mse=squared/samples;
      return {
        frame,decodedRGBA_SHA256:sha(d),rgbSamples:samples,absoluteError:absolute,squaredError:squared,maxError:max,mae:absolute/samples,psnrDB:mse?10*Math.log10(255*255/mse):null,nonopaqueNativePixels:nonopaque
      };
    })
  };
}

function encodeArgs(output){
  return ['-hide_banner','-loglevel','error','-f','image2pipe','-framerate','24','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart','-r','24','-frames:v','96','-threads','1','-n',output];
}

function probe(file,W,H){
  const p=JSON.parse(cp.execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',file],{
    maxBuffer:2e6
  })),ss=p.streams;
  assert.equal(ss.length,1,'video only');
  const s=ss[0];
  assert.equal(s.codec_type,'video');
  assert.equal(s.codec_name,'h264');
  assert.equal(s.pix_fmt,'yuv420p');
  assert.deepEqual([s.width,s.height],[W,H]);
  assert.equal(+s.nb_read_frames,96);
  assert.equal(+s.nb_frames,96);
  assert.equal(s.avg_frame_rate,'24/1');
  assert.equal(s.r_frame_rate,'24/1');
  assert.ok(Math.abs(+s.duration-4)<1e-6&&Math.abs(+p.format.duration-4)<1e-6,'exact four seconds');
  const b=bytes(file),atoms=[];
  for(let at=0;at<b.length;){
    assert.ok(at+8<=b.length);
    let n=b.readUInt32BE(at),head=8;
    if(n===1){
      n=Number(b.readBigUInt64BE(at+8));
      head=16;
    }
    if(n===0)n=b.length-at;
    assert.ok(n>=head&&at+n<=b.length);
    atoms.push({
      type:b.toString('ascii',at+4,at+8),offset:at
    });
    at+=n;
  }
  assert.ok(atoms.find(a=>a.type==='moov')?.offset<atoms.find(a=>a.type==='mdat')?.offset,'faststart');
  return {
    codec:s.codec_name,pixelFormat:s.pix_fmt,width:W,height:H,frames:+s.nb_read_frames,fps:24,duration:+s.duration,atoms
  };
}

const NORMALIZATION=[['id="app"','id="avoid007-fixture-app"'],['<link rel="preconnect" href="https://fonts.googleapis.com">\n',''],['<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n','']];

function normalize(b){
  let s=b.toString('utf8');
  assert.ok(Buffer.from(s).equals(b),'lossless UTF8');
  for(const [from,to]of NORMALIZATION){
    assert.equal(s.split(from).length-1,1,'exact engine-only DOM normalization target');
    s=s.replace(from,to);
  }
  return Buffer.from(s);
}

function guardCases(rows, {synthetic=false} = {}) {
  assert.ok(Array.isArray(rows)&&rows.length>0);
  if(!synthetic){
    assert.equal(rows.length,25,'one representative per B25 ID');
    assert.deepEqual(rows.map(c=>c.conditions.layout).sort(),LAYOUTS.slice().sort(),'exact B25 coverage');
  }
  assert.equal(new Set(rows.map(c=>c.id)).size,rows.length);
  assert.equal(new Set(rows.map(c=>c.conditions.layout)).size,rows.length,'unique layouts');
  for(const c of rows){
    assert.match(c.id,/^[a-zA-Z0-9_-]+$/);
    const s=c.conditions;
    for(const k of ['W','H'])assert.ok(Number.isSafeInteger(s[k])&&s[k]>0&&s[k]%2===0,'native even stage size');
    assert.ok(s.W*s.H<=32e6);
    assert.ok(typeof s.layout==='string'&&typeof s.text==='string'&&s.text.length);
    assert.ok(Number.isSafeInteger(s.seed));
    assert.equal(s.start??0,0);
    assert.equal(s.duration??4,4);
    assert.ok(!s.control||s.control==='automatic','representative must enable candidate avoidance; before newPath=false');
    for(const k of ['cx','cy','radius'])assert.ok(Number.isFinite(s[k]),'explicit circle '+k);
    assert.ok(s.radius>=.02&&s.radius<=.45);
    assert.ok(s.cx>=0&&s.cx<=1&&s.cy>=0&&s.cy<=1);
    assert.equal(s.time??0,0,'capture initializes at frame zero');
    assert.ok(Array.isArray(c.hids)&&c.hids.includes('AVOID-007-H01'));
  }
  for(const h of ['AVOID-007-H01','AVOID-007-H02','AVOID-007-H03'])assert.ok(rows.some(c=>c.hids.includes(h)),'H anchor coverage '+h);
  return rows;
}

async function serve(root){
  root=path.resolve(root);
  const server=http.createServer((req,res)=>{
    try{
      const p=decodeURIComponent(new URL(req.url,'http://local').pathname).slice(1)||'index.html',b=regular(root,p),ext=path.extname(p),types={
        '.html':'text/html; charset=utf-8','.js':'text/javascript','.cjs':'text/javascript','.json':'application/json','.mp4':'video/mp4','.png':'image/png','.otf':'font/otf','.ttf':'font/ttf','.woff2':'font/woff2'
      };
      res.setHeader('Content-Type',types[ext]||'application/octet-stream');
      res.setHeader('Cache-Control','no-store');
      res.setHeader('Accept-Ranges','bytes');
      if(req.headers.range){
        const r=req.headers.range.match(/^bytes=(\d+)-(\d*)$/);
        assert.ok(r);
        const start=+r[1],end=r[2]?Math.min(+r[2],b.length-1):b.length-1;
        if(start>end||start>=b.length){
          res.writeHead(416,{
            'Content-Range':'bytes */'+b.length
          });
          return res.end();
        }
        res.writeHead(206,{
          'Content-Range':`bytes ${start}-${end}/${b.length}`,'Content-Length':end-start+1
        });
        res.end(b.subarray(start,end+1));
      }
      else{
        res.setHeader('Content-Length',b.length);
        res.end(b);
      }
    }
    catch{
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  return {
    server,baseURL:`http://127.0.0.1:${server.address().port}/`
  };
}

async function isolate(page,baseURL,authorize){
  const origin=new URL(baseURL).origin;
  await page.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin!==origin||request.redirectedFrom())return route.abort();
    let headers;
    try{
      headers=authorize?await authorize({
        origin,url:url.href
      }):null;
    }
    catch{
      await route.abort();
      throw Error('Authorization hook failed (details suppressed)');
    }
    await route.continue(headers?{
      headers:{
        ...request.headers(),...headers
      }
    }
    :undefined);
  });
}

function publicBrowserOptions(target,env=process.env){

  const url=new URL(target),host=url.hostname.replace(/^\[|\]$/g,'').toLowerCase();

  if(['localhost','127.0.0.1','::1'].includes(host))return {};

  const noProxy=env.no_proxy||env.NO_PROXY||'',port=url.port||(url.protocol==='https:'?'443':'80');

  if(noProxy.split(/[\s,]+/).filter(Boolean).some(entry=>{
    if(entry==='*')return true;
    const m=entry.match(/^(\[[^\]]+\]|[^:]+)(?::(\d+))?$/);
    if(!m||(m[2]&&m[2]!==port))return false;
    const domain=m[1].replace(/^\[|\]$/g,'').replace(/^\*?\./,'').toLowerCase();
    return host===domain||host.endsWith('.'+domain);
  }))return {};

  const raw=url.protocol==='https:'?env.https_proxy||env.HTTPS_PROXY||env.all_proxy||env.ALL_PROXY:env.http_proxy||env.HTTP_PROXY||env.all_proxy||env.ALL_PROXY;

  if(!raw)return {};

  try{
    const p=new URL(raw);
    assert.ok(['http:','https:','socks5:'].includes(p.protocol));
    return {
      proxy:{
        server:p.protocol+'//'+p.host,...(p.username?{
          username:decodeURIComponent(p.username)
        }
        :{
        }),...(p.password?{
          password:decodeURIComponent(p.password)
        }
        :{
        }),...(noProxy?{
          bypass:noProxy
        }
        :{
        })
      }
    };
  }
  catch{
    throw Error('Invalid environment proxy configuration');
  }

}

async function launch(target){
  try{
    const options=target?publicBrowserOptions(target):{};
    const shared=path.resolve(__dirname,'../browser.cjs');
    if(fs.existsSync(shared))return await require(shared).launch(options);
    return await require('playwright').chromium.launch({
      headless:true,...options,...(process.env.JIZURA_BROWSER?{
        executablePath:process.env.JIZURA_BROWSER
      }
      :{
      })
    });
  }
  catch{
    throw Error('Browser launch failed (runtime/proxy details suppressed)');
  }
}

function resolveOptions(options,baseURL){
  const o=structuredClone(options||{
  });
  const url=p=>new URL(relative(p),baseURL).href;
  if(o.fontURL)o.fontURL=url(o.fontURL);
  if(o.fonts)for(const f of o.fonts.faces)f.url=url(f.url);
  return o;
}

function fontOptionsGuard(config){
  const o=config.fixtureOptions;
  assert.equal(o?.fonts?.version,1,'final review requires real role font fixture; single-face transport is separate');
  assert.ok(o.fonts.faces.length>=6,'at least six actual faces');
  const assets=new Set(config.fonts.map(f=>'fonts/'+f.name));
  for(const f of o.fonts.faces){
    assert.ok(assets.has(relative(f.url)),'face URL maps to bundled font bytes');
    for(const k of ['sourceSHA256','cmapSHA256'])assert.match(f[k],/^[a-f0-9]{64}$/);
    assert.ok(f.id&&f.family&&f.label);
  }
  assert.equal(new Set(o.fonts.faces.map(f=>f.id)).size,o.fonts.faces.length);
  assert.ok(new Set(o.fonts.faces.map(f=>f.url)).size>=6,'six distinct font assets');
  for(const id of Object.values(o.fonts.assignments))assert.ok(o.fonts.faces.some(f=>f.id===id));
}

function startup(config){
  assert.equal(config.before.commit,BASE,'exact immutable baseline');
  guardCases(config.cases);
  assert.ok(config.fonts?.length,'actual font files required');
  fontOptionsGuard(config);
  relative(config.fontAuditPath);
  assert.ok((config.supportFiles||[]).some(f=>'evidence/'+f.name===config.fontAuditPath),'font coverage audit must be bundled before startup');
  const source=[];
  const add=(name,file,raw)=>{
    relative(name);
    const b=raw??bytes(file);
    source.push({
      name,file,bytes:b,sha256:sha(b)
    });
  };
  for(const side of SIDES){
    const root=config[side].root;
    for(const p of ['index.html','en/index.html',...(side==='before'?cp.execFileSync('git',['ls-tree','-r','--name-only',BASE,'src'],{
      cwd:config.before.root,encoding:'utf8'
    }).trim().split('\n'):fs.readdirSync(path.join(root,'src')).filter(p=>p.endsWith('.js')).sort().map(p=>'src/'+p))]){
      const raw=side==='before'?cp.execFileSync('git',['show',BASE+':'+p],{
        cwd:root,maxBuffer:40e6
      }):undefined;
      add('sources/'+side+'/'+p,side==='after'?path.join(root,p):null,raw);
    }
  }

  add('fixtures/fixture.js',config.fixture);
  for(const f of config.fonts){
    relative(f.name);
    add('fonts/'+f.name,f.path);
  }
  for(const f of config.supportFiles||[]){
    relative(f.name);
    add('evidence/'+f.name,f.path);
  }
  for(const [i,p]of (config.pins||[]).entries())add('pins/'+i+'-'+path.basename(p),p);
  add('tools/layouts-b-review.cjs',__filename);
  const test=path.join(__dirname,'layouts-b-review-test.cjs');
  if(fs.existsSync(test))add('tools/layouts-b-review-test.cjs',test);
  for(const p of ['dev/package.json','dev/package-lock.json','dev/browser.cjs'])add('runtime/'+p,path.join(config.after.root,p));
  const pkg=require.resolve('playwright/package.json');
  add('runtime/playwright-package.json',pkg);
  add('config.json',null,Buffer.from(json({
    ...config,before:{
      commit:BASE
    },after:{
      identity:config.after.identity||'uncommitted candidate: source hashes'
    },fixture:'fixtures/fixture.js',fonts:config.fonts.map(f=>({
      name:f.name,path:'fonts/'+f.name
    })),pins:undefined,supportFiles:(config.supportFiles||[]).map(f=>({
      name:f.name,path:'evidence/'+f.name
    }))
  })));
  assert.equal(new Set(source.map(p=>p.name)).size,source.length);
  return source;
}

function assertUnchanged(inputs){
  for(const p of inputs)if(p.file)assert.equal(sha(bytes(p.file)),p.sha256,'input unchanged since startup: '+p.name);
}

async function fixturePage(browser,baseURL,c,side,options,authorize){
  const page=await browser.newPage({
    viewport:{
      width:c.conditions.viewport?.[0]||1100,height:c.conditions.viewport?.[1]||800
    },deviceScaleFactor:1
  });
  try{
    await isolate(page,baseURL,authorize);
    await page.goto(new URL('fixtures/'+side+'-engine.html',baseURL).href);
    await page.addScriptTag({
      url:new URL('fixtures/fixture.js',baseURL).href
    });
    const init=await page.evaluate(async({
      spec,options,side
    })=>{
      window.result=await runLayoutsBFixture(J,spec,{
        ...options,newPath:side==='after'
      });
      await document.fonts.ready;
      if(result.observation.fontLoaded!==true)throw Error('fixture font not loaded');
      if(side==='after'&&!result.observation.newAPI)throw Error('candidate layoutsB25 API absent');
      if(side==='before'&&result.observation.staged)throw Error('baseline must be fullstage original');
      if(side==='before'&&result.plan.cuts[0].area!==null)throw Error('baseline original must not use legacy area shrink');
      window.initialPlan=JSON.stringify(result.plan);
      return {
        conditions:spec,observation:result.observation,plan:result.plan,project:result.project,fonts:[...document.fonts].map(f=>({
          family:f.family,status:f.status,weight:f.weight,style:f.style
        }))
      };
    },{
      spec:{
        ...c.conditions,time:0
      },options:resolveOptions(options,baseURL),side
    });
    actualConditionGuard(init,c.conditions);
    return {
      page,init
    };
  }
  catch(e){
    await page.close();
    throw e;
  }
}

async function render(page,n){
  return page.evaluate(async n=>{
    const observations=[];
    result.renderer.frame(result.canvas.getContext('2d'),result.plan,n/24,{
      noHud:true,noPost:true,placementObservation:o=>observations.push(o)
    });
    if(JSON.stringify(result.plan)!==initialPlan)throw Error('renderer mutated pinned plan');
    const data=result.canvas.getContext('2d').getImageData(0,0,result.canvas.width,result.canvas.height).data;
    return {
      observations,after:!!result.observation.staged,png:result.canvas.toDataURL('image/png'),rgbaSHA256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data))).map(n=>n.toString(16).padStart(2,'0')).join('')
    };
  },n);
}

async function encodeFrames(file,W,H,renderFrame,onKey=()=>{
}){
  const args=encodeArgs(file),encoder=cp.spawn('ffmpeg',args,{
    stdio:['pipe','ignore','pipe']
  });
  let errorText='';
  encoder.stderr.on('data',b=>{
    errorText=(errorText+b).slice(-8000);
  });
  encoder.stdin.on('error',()=>{
  });
  const done=new Promise((resolve,reject)=>{
    encoder.once('error',reject);
    encoder.once('close',code=>code===0?resolve():reject(Error('ffmpeg failed '+errorText)));
  });
  done.catch(()=>{
  });
  const frames=[];
  try{
    for(let n=0;n<FRAMES;n++){
      const f=await renderFrame(n),png=Buffer.from(f.png.split(',')[1],'base64');
      assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
      assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[W,H],'every native PNG uses original stage size');
      assert.match(f.rgbaSHA256,/^[a-f0-9]{64}$/);
      const record=KEYS.includes(n)?pngRecord(png,f.rgbaSHA256,W,H):{sha256:sha(png),rgbaSHA256:f.rgbaSHA256,width:W,height:H,bytes:png.length};
      frames.push({
        frame:n,time:n/FPS,...record,...(f.after?{
          safetyAudit:safeObservations(f.observations)
        }
        :{
        })
      });
      if(KEYS.includes(n))await onKey(n,png,record);
      await new Promise((resolve,reject)=>encoder.stdin.write(png,e=>e?reject(e):resolve()));
    }
    encoder.stdin.end();
    await done;
    return {
      frames,probe:probe(file,W,H),encoderArgs:args.map(p=>p===file?'<output.mp4>':p)
    };
  }
  catch(e){
    encoder.stdin.destroy();
    encoder.kill('SIGTERM');
    await done.catch(()=>{
    });
    throw e;
  }
}

async function capture(config, dir, {browser:provided} = {}) {
  assert.ok(!fs.existsSync(dir),'fresh immutable build directory');
  assert.match(config.buildID,/^[a-zA-Z0-9_-]+$/);
  const inputs=startup(config);
  fs.mkdirSync(dir,{
    recursive:true
  });
  const m={
    schema:'avoid007-native-v1',taskID:'AVOID-007',buildID:config.buildID,baseline:BASE,capturedAt:new Date().toISOString(),capture:{
      method:'native Canvas renderer.frame(n/24) -> original PNG -> ffmpeg image2pipe -> H264; no screen recording, slide input or source video',fps:FPS,frames:FRAMES,duration:4,keyFrames:KEYS,frameOptions:{
        noHud:true,noPost:true
      },normalization:NORMALIZATION,baselineControl:'newPath:false, source area:null fullstage original; layoutsB25 avoidance API unavailable in baseline',limitations:config.limitations||[],scope:'representative visual evidence only; no all-time safety/performance claim'
    },assets:{
    },cases:structuredClone(config.cases),fixtureOptions:structuredClone(config.fixtureOptions)
  };
  const add=(p,b)=>{
    relative(p);
    fs.mkdirSync(path.dirname(path.join(dir,p)),{
      recursive:true
    });
    fs.writeFileSync(path.join(dir,p),b);
    m.assets[p]=sha(b);
  };
  for(const i of inputs)add(i.name,i.bytes);
  assert.ok(new Set(config.fixtureOptions.fonts.faces.map(f=>m.assets[f.url])).size>=6,'six distinct font byte identities');
  for(const side of SIDES)add('fixtures/'+side+'-engine.html',normalize(bytes(path.join(dir,'sources',side,'index.html'))));
  const start={
    recorded:new Date().toISOString(),phase:'all inputs fixed before browser startup',inputs:inputs.map(i=>({
      path:i.name,sha256:i.sha256,bytes:i.bytes.length
    })),node:process.version,ffmpeg:cp.execFileSync('ffmpeg',['-version'],{
      encoding:'utf8'
    }).split('\n')[0],ffprobe:cp.execFileSync('ffprobe',['-version'],{
      encoding:'utf8'
    }).split('\n')[0]
  };
  add('startup.json',Buffer.from(json(start)));
  assertUnchanged(inputs);
  const local=await serve(dir);
  let browser=provided;
  try{
    browser||=await launch();
    m.browser=browser.version();
    for(const c of m.cases)for(const side of SIDES){
      const {
        page,init
      }
      =await fixturePage(browser,local.baseURL,c,side,m.fixtureOptions);
      try{
        if(side==='after')safeInitial(init);
        const initPath=`observations/${c.id}-${side}-initial.json`;
        add(initPath,Buffer.from(json(init)));
        const video=`videos/${c.id}-${side}.mp4`;
        fs.mkdirSync(path.join(dir,'videos'),{
          recursive:true
        });
        const r=await encodeFrames(path.join(dir,video),c.conditions.W,c.conditions.H,n=>render(page,n),(n,png)=>add(`images/${c.id}-${side}-${n}.png`,png));
        const framesPath=`observations/${c.id}-${side}-frames.json`;
        add(framesPath,Buffer.from(json(r.frames)));
        m.assets[video]=sha(bytes(path.join(dir,video)));
        c[side]={
          video,codecQuality:codecQuality(path.join(dir,video),KEYS.map(frame=>({
            frame,file:path.join(dir,`images/${c.id}-${side}-${frame}.png`)
          }))),initial:initPath,frames:framesPath,conditionsSHA256:digest(c.conditions),probe:r.probe,encoderArgs:r.encoderArgs,keyImages:KEYS.map(n=>`images/${c.id}-${side}-${n}.png`)
        };
      }
      finally{
        await page.close();
      }
    }

    assertUnchanged(inputs);
    m.endCheck={
      checked:new Date().toISOString(),allInputsUnchanged:true
    };
    add('controls.js',Buffer.from('('+controls.toString()+')();'));
    add('live.js',Buffer.from('('+liveControls.toString()+')();'));
    add('live.html',Buffer.from(liveHTML()));
    for(const en of [false,true])add(en?'en.html':'index.html',Buffer.from(pageHTML(m,en)));
    fs.writeFileSync(path.join(dir,'manifest.json'),json(m));
    validateFiles(dir);
    return {
      directory:dir,manifestSHA256:sha(bytes(path.join(dir,'manifest.json'))),cases:m.cases.length,videos:m.cases.length*2,status:'capture and local file verification only'
    };
  }
  finally{
    try{
      assertUnchanged(inputs);
    }
    finally{
      if(browser&&!provided)await browser.close();
      await new Promise(r=>local.server.close(r));
    }
  }
}

function controls(){
  const guide=document.querySelector('[data-guide]');
  document.documentElement.dataset.circleGuide=guide.checked?'on':'off';
  guide.onchange=()=>{document.documentElement.dataset.circleGuide=guide.checked?'on':'off';};
  document.querySelectorAll('[data-case]').forEach(s=>{
    const v=[...s.querySelectorAll('video')],images=[...s.querySelectorAll('.image-media')];
    s.querySelectorAll('.keys').forEach(pair=>{
      const figures=[...pair.querySelectorAll('figure')];
      figures.forEach(figure=>figure.addEventListener('scroll',()=>{
        for(const peer of figures)if(peer!==figure){
          if(peer.scrollLeft!==figure.scrollLeft)peer.scrollLeft=figure.scrollLeft;
          if(peer.scrollTop!==figure.scrollTop)peer.scrollTop=figure.scrollTop;
        }
      }));
    });
    let generation=0;
    s.querySelector('[data-play]').onclick=async()=>{
      const current=++generation;
      try{
        await Promise.all(v.map(async x=>{
          x.pause();
          x.currentTime=0;
          await x.play();
        }));
        if(current!==generation)v.forEach(x=>x.pause());
        else s.querySelector('output').textContent='';
      }
      catch{
        if(current===generation)s.querySelector('output').textContent='Playback failed';
      }
    };
    s.querySelector('[data-pause]').onclick=()=>{generation++;v.forEach(x=>x.pause());s.querySelector('output').textContent='';};
    s.querySelector('[data-mode]').onchange=e=>{
      s.dataset.mode=e.target.value;
    };
    s.querySelector('[data-zoom]').oninput=e=>images.forEach(i=>i.style.width=e.target.value+'%');
  });
}

function circleGuide(c){
  const {W,H,cx,cy,radius}=c.conditions;
  return `<svg class="circle-guide" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><circle cx="${cx*W}" cy="${cy*H}" r="${radius*Math.min(W,H)}" fill="none" stroke="#ff7058" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}

// Browser-side measurement: compare the SVG's actual transform against the
// painted media rectangle, including object-fit letterboxing and page scrolling.
function measureGuides(elements,spec){
  return elements.filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0).map(wrapper=>{
    const media=wrapper.querySelector('video,img'),rect=media.getBoundingClientRect();
    const svg=wrapper.querySelector('svg'),circle=svg.querySelector('circle'),matrix=circle.getScreenCTM();
    const point=(x,y)=>new DOMPoint(x,y).matrixTransform(matrix);
    const cx=circle.cx.baseVal.value,cy=circle.cy.baseVal.value,r=circle.r.baseVal.value;
    const center=point(cx,cy),edgeX=point(cx+r,cy),edgeY=point(cx,cy+r);
    const scale=Math.min(rect.width/spec.W,rect.height/spec.H);
    const left=rect.left+(rect.width-spec.W*scale)/2,top=rect.top+(rect.height-spec.H*scale)/2;
    return {kind:media.tagName,visibility:getComputedStyle(svg).visibility,pointerEvents:getComputedStyle(svg).pointerEvents,
      intrinsic:media.tagName==='VIDEO'?[media.videoWidth,media.videoHeight]:[media.naturalWidth,media.naturalHeight],
      actual:{cx:center.x,cy:center.y,rx:Math.hypot(edgeX.x-center.x,edgeX.y-center.y),ry:Math.hypot(edgeY.x-center.x,edgeY.y-center.y)},
      expected:{cx:left+spec.cx*spec.W*scale,cy:top+spec.cy*spec.H*scale,radius:spec.radius*Math.min(spec.W,spec.H)*scale}};
  });
}

async function checkGuideGeometry(section,spec){
  const rows=await section.locator('.native-media').evaluateAll(measureGuides,spec);
  assert.ok(rows.length>=6,'visible video and key-image guides');
  for(const row of rows){
    assert.deepEqual(row.intrinsic,[spec.W,spec.H],'guide uses actual original-stage media');
    assert.equal(row.visibility,'visible');
    assert.equal(row.pointerEvents,'none');
    for(const [actual,expected]of [[row.actual.cx,row.expected.cx],[row.actual.cy,row.expected.cy],
      [row.actual.rx,row.expected.radius],[row.actual.ry,row.expected.radius]]){
      assert.ok(Math.abs(actual-expected)<.5,'SVG guide agrees with painted media within .5 CSS px');
    }
    assert.ok(Math.abs(row.actual.rx-row.actual.ry)<.01,'guide remains a circle');
  }
  return rows.length;
}

function pageHTML(m,en=false){
  return `<!doctype html><html lang="${en?'en':'ja'}" data-circle-guide="off"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AVOID-007 ${esc(m.buildID)}</title><style>body{font:16px system-ui;background:#151923;color:#eee;margin:20px}a{color:#9ddcff}button,select,input{font:inherit;margin:6px}.pair,.keys{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pair figure{margin:0;min-width:0}.native-media{display:block;position:relative;width:100%}.video-media{max-height:65vh}.video-media video{display:block;width:100%;height:100%;object-fit:contain}.circle-guide{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:hidden}html[data-circle-guide=off] .circle-guide{visibility:hidden}.keys{overflow:auto}.keys img{display:block;width:100%;max-width:none}.keys figure{margin:0;min-width:0;overflow:auto}section{margin:36px 0;max-width:1400px}[data-mode=before] .keys figure:nth-child(2),[data-mode=after] .keys figure:first-child{display:none}[data-mode=before] .keys,[data-mode=after] .keys{grid-template-columns:1fr}[data-mode=overlay] .keys{position:relative;display:block}[data-mode=overlay] .keys figure:nth-child(2){position:absolute;inset:0;opacity:.5}@media(max-width:650px){.pair,.keys{grid-template-columns:1fr}}small{overflow-wrap:anywhere}</style><body><h1>AVOID-007 · ${esc(m.buildID)}</h1><a href="${en?'index.html':'en.html'}">${en?'日本語':'English'}</a> · <label><input type="checkbox" data-guide>${en?'Show circle outline':'円の輪郭を表示'}</label> · <a href="manifest.json">manifest</a> · <a href="live.html">${en?'Live fixture':'同じfixtureを操作'}</a><p>${en?'Native Canvas at original stage size, 96 frames / 24 fps / 4 seconds. Before: full-stage original e96 engine, no new B avoidance API. After: candidate B avoidance. PNGs are original Canvas frames; H264 is lossy.':'原寸Canvas、96コマ・24fps・4秒。変更前: e96原演出の全画面描画、新B回避APIなし。変更後: 候補のB回避。PNGはCanvas原本、H264は非可逆。'}</p><p><small>${esc(m.baseline)} → ${esc(m.assets['sources/after/index.html'])}</small></p><p>${esc((m.capture.limitations||[]).join(' / '))}</p><p>${en?'The circle outline is a page guide only; it is not part of MP4 or original PNG files.':'円の輪郭はページ上の目印です。MP4・元のPNGファイルには含まれません。'}</p><p>${en?'Representative visual evidence does not certify all-time safety or performance. Background / foreground fixture media are absent unless explicitly declared in the recorded plan.':'代表例の見え方確認であり、全時刻の安全性・性能の証明ではありません。記録planに明示がなければ背景/前景のfixture動画はありません。'}</p><nav>${['H01','H02','H03'].map(h=>`<a href="#AVOID-007-${h}">${h}</a>`).join(' · ')} · ${m.cases.length} ${en?'cases / 3 items':'例 / 3項目'}</nav>${['H01','H02','H03'].map(h=>`<h2 id="AVOID-007-${h}">${h}</h2><p>${m.cases.filter(c=>c.hids.includes('AVOID-007-'+h)).map(c=>`<a href="#${esc(c.id)}">${esc(c.id)}</a>`).join(' · ')}</p>`).join('')}${m.cases.map(c=>`<section id="${esc(c.id)}" data-case data-mode="pair"><h2>${esc(c.id)} · ${esc(c.conditions.layout)}</h2><p>${esc(c.conditions.text)} · ${c.conditions.W}×${c.conditions.H} · seed ${c.conditions.seed}</p><p>${en?'Circle center':'円中心'} x=${(100*c.conditions.cx).toFixed(1)}%, y=${(100*c.conditions.cy).toFixed(1)}%; ${en?'radius = short side ×':'半径 = 短辺 ×'} ${(100*c.conditions.radius).toFixed(1)}% (${(Math.min(c.conditions.W,c.conditions.H)*c.conditions.radius).toFixed(1)}px). ${en?'Circle guides are absent from native video and PNG pixels.':'円ガイドはnative動画・PNG画素に含まれません。'}</p><p>${esc(c.focus?.[en?'en':'ja']||c.focus||'')}</p><p>${esc(c.intent?.[en?'en':'ja']||c.intent||'')} ${esc(c.preserve?.[en?'en':'ja']||c.preserve||'')}</p><button data-play>${en?'Play both':'前後を再生'}</button><button data-pause>${en?'Pause both':'前後を停止'}</button><output role="status"></output><a href="live.html?case=${esc(c.id)}">${en?'Live':'操作'}</a><div class="pair">${SIDES.map(side=>`<figure><figcaption>${side==='before'?(en?'Before':'変更前'):(en?'After':'変更後')}</figcaption><div class="native-media video-media" style="aspect-ratio:${c.conditions.W}/${c.conditions.H}"><video controls playsinline preload="none" src="${esc(c[side].video)}"></video>${circleGuide(c)}</div><a href="${esc(c[side].video)}">MP4</a></figure>`).join('')}</div><label>${en?'PNG display':'PNG表示'} <select data-mode><option value="pair">${en?'Side by side':'前後'}</option><option value="before">${en?'Before':'変更前'}</option><option value="after">${en?'After':'変更後'}</option><option value="overlay">${en?'Overlay 50%':'重ね合わせ50%'}</option></select></label><label>${en?'Zoom':'拡大'} <input data-zoom type="range" min="100" max="300" step="25" value="100"></label>${KEYS.map(n=>`<p>${n}/24 = ${(n/24).toFixed(3)}s</p><div class="keys">${SIDES.map(side=>`<figure><figcaption>${side==='before'?(en?'Before':'変更前'):(en?'After':'変更後')}</figcaption><a class="native-media image-media" href="images/${c.id}-${side}-${n}.png"><img loading="lazy" alt="${side} ${esc(c.id)} frame ${n}" src="images/${c.id}-${side}-${n}.png">${circleGuide(c)}</a></figure>`).join('')}</div>`).join('')}</section>`).join('')}<script src="controls.js"></script></body></html>`;
}

function liveHTML(){
  return '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AVOID-007 live fixture</title><body><h1>AVOID-007 live fixture</h1><a href="index.html">比較 / Comparison</a><label>Case <select id="case"></select></label><label>Side <select id="side"><option>before</option><option selected>after</option></select></label><label>Frame <input id="frame" type="range" min="0" max="95" value="36"></label><button id="play">Play / 再生</button><button id="pause">Pause / 停止</button><output role="status"></output><iframe title="Native Canvas fixture" style="width:100%;height:75vh;border:0"></iframe><script src="live.js"></script></body></html>';
}

function liveControls(){
  (async()=>{
    const m=await fetch('manifest.json').then(r=>r.json()),select=document.querySelector('#case'),side=document.querySelector('#side'),slider=document.querySelector('#frame'),frame=document.querySelector('iframe'),status=document.querySelector('output');
    let r,timer;
    for(const c of m.cases)select.add(new Option(c.id,c.id));
    select.value=new URL(location.href).searchParams.get('case')||m.cases[0].id;
    async function paint(){
      if(!r)return;
      r.renderer.frame(r.canvas.getContext('2d'),r.plan,+slider.value/24,{
        noHud:true,noPost:true
      });
      status.textContent=slider.value+'/24';
    }
    async function setup(){
      clearInterval(timer);
      document.body.dataset.fixtureSide='loading';
      select.disabled=side.disabled=true;
      r=null;
      const s=side.value;
      frame.src='fixtures/'+s+'-engine.html';
      await new Promise((resolve,reject)=>{
        frame.onload=resolve;
        frame.onerror=reject;
      });
      const options=structuredClone(m.fixtureOptions),bundleBase=new URL('.',location.href);
      if(options.fontURL)options.fontURL=new URL(options.fontURL,bundleBase).href;
      if(options.fonts)for(const f of options.fonts.faces)f.url=new URL(f.url,bundleBase).href;
      const w=frame.contentWindow,script=w.document.createElement('script');
      script.src='fixture.js';
      w.document.head.append(script);
      await new Promise((resolve,reject)=>{
        script.onload=resolve;
        script.onerror=reject;
      });
      r=await w.runLayoutsBFixture(w.J,{
        ...m.cases.find(c=>c.id===select.value).conditions,time:0
      },{
        ...options,newPath:s==='after'
      });
      r.canvas.style.width='100%';
      r.canvas.style.height='auto';
      w.document.body.replaceChildren(r.canvas);
      await paint();
      document.body.dataset.fixtureSide=s;
      select.disabled=side.disabled=false;
    }
    select.onchange=()=>setup().catch(fail);
    side.onchange=select.onchange;
    slider.oninput=paint;
    document.querySelector('#play').onclick=()=>{
      clearInterval(timer);
      timer=setInterval(()=>{
        slider.value=(+slider.value+1)%96;
        paint();
      },1000/24);
    };
    document.querySelector('#pause').onclick=()=>clearInterval(timer);
    function fail(){
      select.disabled=side.disabled=false;
      status.textContent='Fixture failed';
    }
    await setup();
  })().catch(()=>{
    document.querySelector('output').textContent='Fixture failed';
  });
}

function validateFiles(dir, {synthetic=false} = {}) {
  const raw=regular(dir,'manifest.json'),m=JSON.parse(raw);
  assert.equal(m.schema,'avoid007-native-v1');
  assert.equal(m.baseline,BASE);
  guardCases(m.cases,{
    synthetic
  });
  assert.deepEqual(m.capture.keyFrames,KEYS);
  assert.equal(m.capture.frames,96);
  assert.equal(m.capture.fps,24);
  assert.equal(m.capture.duration,4);
  assert.deepEqual(m.capture.frameOptions,{
    noHud:true,noPost:true
  });
  assert.equal(m.endCheck.allInputsUnchanged,true);
  for(const [p,h]of Object.entries(m.assets)){
    assert.match(h,/^[a-f0-9]{64}$/);
    assert.equal(sha(regular(dir,p)),h,'raw asset hash '+p);
  }
  const required=p=>{
    assert.ok(Object.hasOwn(m.assets,p),'required asset indexed '+p);
    return regular(dir,p);
  };
  const st=JSON.parse(required('startup.json'));
  for(const p of st.inputs){
    assert.equal(m.assets[p.path],p.sha256);
    assert.equal(required(p.path).length,p.bytes);
  }
  for(const side of SIDES)assert.ok(normalize(required('sources/'+side+'/index.html')).equals(required('fixtures/'+side+'-engine.html')),'normalized executed engine matches source');
  for(const p of ['config.json','tools/layouts-b-review.cjs','fixtures/fixture.js'])required(p);
  const config=JSON.parse(required('config.json'));
  assert.deepEqual(config.cases,m.cases.map(({
    before,after,...c
  })=>c),'manifest conditions equal pre-startup config');
  assert.deepEqual(config.fixtureOptions,m.fixtureOptions);
  if(!synthetic)fontOptionsGuard(config);
  for(const f of config.fonts)required(f.path);
  for(const f of config.supportFiles||[])required(f.path);
  if(!synthetic){required(config.fontAuditPath);assert.ok(new Set(m.fixtureOptions.fonts.faces.map(f=>m.assets[f.url])).size>=6,'distinct actual font bytes');}
  for(const c of m.cases)for(const side of SIDES){
    const r=c[side];
    assert.equal(r.conditionsSHA256,digest(c.conditions),'same conditions each side');
    const initial=JSON.parse(required(r.initial));
    assert.deepEqual(initial.conditions,{
      ...c.conditions,time:0
    });
    actualConditionGuard(initial,c.conditions);
    assert.equal(initial.observation.fontLoaded,true);
    assert.ok(initial.fonts.length&&initial.fonts.every(f=>f.status==='loaded'),'loaded actual font faces');
    if(side==='after')safeInitial(initial);
    else{
      assert.equal(initial.observation.staged,false);
      assert.equal(initial.plan.cuts[0].area,null,'baseline no legacy shrink');
    }
    assert.deepEqual([initial.plan.W,initial.plan.H],[c.conditions.W,c.conditions.H]);
    const frames=JSON.parse(required(r.frames));
    assert.equal(frames.length,96);
    for(let n=0;n<96;n++){
      const f=frames[n];
      assert.equal(f.frame,n);
      assert.equal(f.time,n/24);
      assert.match(f.sha256,/^[a-f0-9]{64}$/);
      assert.match(f.rgbaSHA256,/^[a-f0-9]{64}$/);
      if(side==='after')safeObservations(f.safetyAudit);
      if(KEYS.includes(n)){
        const p=`images/${c.id}-${side}-${n}.png`,png=required(p);
        assert.deepEqual(pngRecord(png,f.rgbaSHA256,c.conditions.W,c.conditions.H),Object.fromEntries(Object.entries(f).filter(([k])=>!['frame','time','safetyAudit'].includes(k))));
        assert.ok(r.keyImages.includes(p));
      }
    }
    required(r.video);
    assert.deepEqual(probe(path.join(dir,r.video),c.conditions.W,c.conditions.H),r.probe);
    assert.deepEqual(r.encoderArgs,encodeArgs('<output.mp4>'));
    assert.deepEqual(codecQuality(path.join(dir,r.video),KEYS.map(frame=>({
      frame,file:path.join(dir,`images/${c.id}-${side}-${frame}.png`)
    }))),r.codecQuality);
  }
  for(const en of [false,true])assert.equal(required(en?'en.html':'index.html').toString(),pageHTML(m,en));
  assert.equal(required('controls.js').toString(),'('+controls.toString()+')();');
  assert.equal(required('live.js').toString(),'('+liveControls.toString()+')();');
  assert.equal(required('live.html').toString(),liveHTML());
  return {
    manifest:m,manifestSHA256:sha(raw),assets:Object.keys(m.assets).length,status:'files verified; browser/public checks separate'
  };
}

// Based on all-review.cjs' accepted decoded-frame seek helper. Both seek completion
// and a compositor callback matching the target are required; pre-seek frames ignored.
function seekDecodedFrame(video,target){
  return new Promise((resolve,reject)=>{
    let seekedAt=null,decoded=null,callback=null,settled=false;
    const ignoredFrames=[],timer=setTimeout(()=>finish('requested frame not decoded'),10000);
    function cleanup(){
      clearTimeout(timer);
      video.removeEventListener('seeked',seek);
      video.removeEventListener('error',error);
      if(callback!==null)video.cancelVideoFrameCallback(callback);
    }
    function finish(message){
      if(settled)return;
      if(message){
        settled=true;
        cleanup();
        return reject(Error(message));
      }
      if(seekedAt!==null&&decoded){
        settled=true;
        cleanup();
        resolve({
          seekedAt,decodedAfterSeek:decoded,ignoredFrames
        });
      }
    }
    function seek(){
      seekedAt=video.currentTime;
      if(Math.abs(seekedAt-target)>1/24+1e-6)return finish('seek did not reach requested time');
      finish();
    }
    function error(){
      finish('media error '+video.error?.code);
    }
    function frame(now,meta){
      callback=null;
      const f={
        mediaTime:meta.mediaTime,presentedFrames:meta.presentedFrames
      };
      // Chromium may deliver the requested decoded frame before its seeked
      // event. Keep that matching frame pending; finish still requires both
      // the decoded target and the independently checked seeked target.
      if(Number.isFinite(f.mediaTime)&&Math.abs(f.mediaTime-target)<=1/24+1e-6){
        decoded=f;
        finish();
      }
      else{
        ignoredFrames.push(f);
        callback=video.requestVideoFrameCallback(frame);
      }
    }
    video.addEventListener('seeked',seek,{
      once:true
    });
    video.addEventListener('error',error,{
      once:true
    });
    try{
      callback=video.requestVideoFrameCallback(frame);
      video.currentTime=target;
    }
    catch{
      finish('seek setup failed');
    }
  });
}

async function playNativeVideo(v,seek){
  v.pause();
  const startFrame=await seek(v,0);
  const start=v.getVideoPlaybackQuality(),startObservedNow=performance.now();
  return new Promise((resolve,reject)=>{
    let callback=null,settled=false;
    const frames=[];
    const quality=q=>({decoded:q.totalVideoFrames,dropped:q.droppedVideoFrames,corrupt:q.corruptedVideoFrames||0});
    const snapshot=()=>{
      const q=v.getVideoPlaybackQuality(),gaps=frames.slice(1).map((f,i)=>f.mediaTime-frames[i].mediaTime);
      return {ended:v.ended,currentTime:v.currentTime,decoded:q.totalVideoFrames-start.totalVideoFrames,
        dropped:q.droppedVideoFrames-start.droppedVideoFrames,corrupt:(q.corruptedVideoFrames||0)-(start.corruptedVideoFrames||0),
        startFrame,startQuality:quality(start),endQuality:quality(q),startObservedNow,endObservedNow:performance.now(),
        playbackRate:v.playbackRate,callbackFrames:frames,
        callbackCount:frames.length,maxMediaTimeGap:gaps.length?Math.max(...gaps):0,
        mediaTimeGapCount:gaps.filter(g=>g>1/24+1e-6).length,
        callbackNowMonotonic:frames.every((f,i)=>i===0||f.callbackNow>=frames[i-1].callbackNow),
        presentedFramesMonotonic:frames.every((f,i)=>i===0||f.presentedFrames>=frames[i-1].presentedFrames)};
    };
    const cleanup=()=>{
      clearTimeout(timer);v.onended=null;v.onerror=null;
      if(callback!==null){v.cancelVideoFrameCallback(callback);callback=null;}
    };
    const fail=(error,reason)=>{
      if(settled)return;
      settled=true;v.pause();cleanup();
      error.playback={...snapshot(),failure:reason};
      reject(error);
    };
    const frame=(now,meta)=>{
      callback=null;
      if(settled)return;
      frames.push({callbackNow:now,observedNow:performance.now(),mediaTime:meta.mediaTime,
        presentedFrames:meta.presentedFrames,currentTime:v.currentTime,quality:quality(v.getVideoPlaybackQuality())});
      callback=v.requestVideoFrameCallback(frame);
    };
    const timer=setTimeout(()=>fail(Error('playback timeout'),'timeout'),12000);
    v.onerror=()=>fail(Error('media error'),'media-error');
    v.onended=()=>{
      if(settled)return;
      settled=true;cleanup();resolve(snapshot());
    };
    try{
      callback=v.requestVideoFrameCallback(frame);
      v.play().catch(error=>fail(error,'play-rejected'));
    }catch(error){fail(error,'play-rejected');}
  });
}

async function releaseVideo(video){
  try{await video.evaluate(v=>{v.pause();v.removeAttribute('src');v.load();});}
  finally{await video.dispose();}
}

// One owner at a time. A caller-provided browser is explicitly diagnostic and
// released between phases without closing it; it is never process isolation.
function browserPhases({provided,baseURL,launchBrowser=launch,records=[],onProgress=()=>{}}){
  let active=null,current=null;
  return {
    async start(phase){
      assert.ok(['raw-ui','playback','native-live'].includes(phase));
      assert.equal(active,null,'previous phase shutdown awaited');
      current={phase,lifecycle:provided?'provided-shared-diagnostic':'owned',startedAt:new Date().toISOString(),status:'starting'};
      records.push(current);onProgress();
      try{
        active=provided||await launchBrowser(baseURL);
        current.acquiredAt=new Date().toISOString();current.status='active';onProgress();
        return active;
      }catch(error){
        current.status='launch-failed';onProgress();throw error;
      }
    },
    async close(){
      if(!active)return;
      const browser=active,record=current;
      if(provided){active=null;current=null;record.status='released-shared';record.releasedAt=new Date().toISOString();onProgress();return;}
      record.closeStartedAt=new Date().toISOString();
      let observerError;
      try{onProgress();}catch(error){observerError=error;}
      try{
        await browser.close();record.closedAt=new Date().toISOString();record.status='closed';active=null;current=null;
      }catch(error){record.status='close-failed';throw error;}
      finally{onProgress();}
      if(observerError)throw observerError;
    }
  };
}
function browserInputPins(dir,manifest){
  const files=[['validator',__filename],['manifest',path.join(dir,'manifest.json')],
    ...Object.keys(manifest.assets).map(p=>['assets/'+p,path.join(dir,p)]),
    ['playwright-package',require.resolve('playwright/package.json')]];
  for(const name of ['../browser.cjs','layouts-b-review-test.cjs']){
    const file=path.resolve(__dirname,name);if(fs.existsSync(file))files.push(['tools/'+name.replace('../',''),file]);
  }
  return files.map(([name,file])=>{
    assert.equal(fs.realpathSync(file),path.resolve(file),'regular validation input');
    const b=bytes(file),sha256=sha(b);
    if(name.startsWith('assets/'))assert.equal(sha256,manifest.assets[name.slice(7)],'prelaunch manifest asset identity');
    return {name,file,sha256,bytes:b.length};
  });
}
function assertBrowserInputs(pins){
  for(const p of pins){
    assert.equal(fs.realpathSync(p.file),path.resolve(p.file),'regular unchanged input');
    assert.equal(sha(bytes(p.file)),p.sha256,'browser validation input bytes unchanged: '+p.name);
  }
}

async function validateBrowser(dir, {baseURL,browser:provided,authorize,synthetic=false,playAll=true,onProgress} = {}) {
  const checked=validateFiles(dir,{
    synthetic
  }),m=checked.manifest,pins=browserInputPins(dir,m);
  assert.equal(pins.find(p=>p.name==='manifest').sha256,checked.manifestSHA256,'prelaunch raw manifest identity');
  const local=baseURL?null:await serve(dir);
  baseURL=baseURL||local.baseURL;
  assert.ok(baseURL.endsWith('/'));
  assert.ok(!new URL(baseURL).username&&!new URL(baseURL).password&&!new URL(baseURL).search,'no credentials or tokens in base URL');
  let browser;
  const report={
    manifestSHA256:checked.manifestSHA256,origin:new URL(baseURL).origin,raw:[],ui:[],playback:[],nativeParity:[],live:[],
    phaseIsolation:provided?'provided-shared-diagnostic':'owned-three-browser-lifecycles',phases:[],
    playbackPageMode:'fresh-same-origin-minimal-page-per-video',
    startupInputs:pins.map(({name,sha256,bytes})=>({name,sha256,bytes}))
  };
  let context={stage:'raw-http'},phase='raw-ui';
  const progress=()=>onProgress?.({...report,context:{...context,phase},status:'incomplete'});
  const owners=browserPhases({provided,baseURL,records:report.phases,onProgress:progress});
  try{
    browser=await owners.start(phase);
    const page=await browser.newPage();
    try{
      await isolate(page,baseURL,authorize);
      await page.goto(new URL('index.html',baseURL).href);
      for(const [p,h]of [['manifest.json',checked.manifestSHA256],...Object.entries(m.assets)]){
        context={stage:'raw-http',asset:p};
        const r=await page.evaluate(async({
          url,range
        })=>{
          const response=await fetch(url,{
            redirect:'error',...(range?{
              headers:{
                Range:'bytes=0-31'
              }
            }
            :{
            })
          }),b=await response.arrayBuffer();
          return {
            status:response.status,type:response.headers.get('content-type'),range:response.headers.get('content-range'),length:b.byteLength,sha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).map(x=>x.toString(16).padStart(2,'0')).join('')
          };
        },{
          url:new URL(p,baseURL).href
        });
        assert.equal(r.status,200,'HTTP raw '+p);
        assert.equal(r.sha256,h,'browser raw hash '+p);
        if(p.endsWith('.mp4'))assert.match(r.type,/^video\/mp4/);
        if(p.endsWith('.html'))assert.match(r.type,/^text\/html/);
        if(p.endsWith('.png'))assert.match(r.type,/^image\/png/);
        report.raw.push({
          path:p,...r
        });
        if(p.endsWith('.mp4')){
          const range=await page.evaluate(async url=>{
            const r=await fetch(url,{
              redirect:'error',headers:{
                Range:'bytes=0-31'
              }
            });
            return {
              status:r.status,range:r.headers.get('content-range'),bytes:(await r.arrayBuffer()).byteLength
            };
          },new URL(p,baseURL).href);
          assert.equal(range.status,206);
          assert.equal(range.range,`bytes 0-31/${regular(dir,p).length}`);
          assert.equal(range.bytes,32);
          report.raw.push({
            path:p,range
          });
        }
      }
    }
    finally{
      await page.close();
    }

    for(const lang of ['index.html','en.html'])for(const width of [1100,390]){
      context={stage:'review-ui',lang,width};progress();
      const p=await browser.newPage({
        viewport:{
          width,height:850
        },deviceScaleFactor:1
      });
      try{
        await isolate(p,baseURL,authorize);
        await p.goto(new URL(lang,baseURL).href);
        const guide=p.locator('[data-guide]');
        assert.equal(await guide.isChecked(),false,'circle guide defaults OFF');
        assert.equal(await p.locator('.circle-guide').evaluateAll(items=>items.every(i=>getComputedStyle(i).visibility==='hidden')),true);
        await guide.focus();
        await guide.press('Space');
        assert.equal(await guide.isChecked(),true,'keyboard enables common guide');
        let guideMeasurements=0;
        assert.equal(await p.locator('[data-case]').count(),m.cases.length);
        for(const h of ['H01','H02','H03'])assert.equal(await p.locator('#AVOID-007-'+h).count(),1);
        for(const c of m.cases){
          const s=p.locator('#'+c.id);
          await s.scrollIntoViewIfNeeded();
          await s.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
          assert.equal(await s.locator('img').evaluateAll(imgs=>imgs.every(i=>i.naturalWidth>0)),true);
          await s.locator('[data-play]').click();
          await s.locator('video').first().evaluate(v=>new Promise((resolve,reject)=>{
            if(!v.paused)return resolve();
            const timeout=setTimeout(()=>reject(Error('review playback did not start')),10000);
            v.addEventListener('playing',()=>{
              clearTimeout(timeout);
              resolve();
            },{
              once:true
            });
          }));
          await s.locator('[data-pause]').click();
          assert.equal(await s.locator('video').evaluateAll(v=>v.every(x=>x.paused)),true);
          assert.equal(await s.locator('output').textContent(),'');
          await s.locator('video').evaluateAll(videos=>Promise.all(videos.map(v=>new Promise((resolve,reject)=>{
            if(v.videoWidth)return resolve();
            const timer=setTimeout(()=>reject(Error('guide video metadata not loaded')),10000);
            v.addEventListener('loadedmetadata',()=>{clearTimeout(timer);resolve();},{once:true});
            v.addEventListener('error',()=>{clearTimeout(timer);reject(Error('guide video load'));},{once:true});
            v.preload='metadata';v.load();
          }))));
          guideMeasurements+=await checkGuideGeometry(s,c.conditions);
          await s.locator('[data-mode]').selectOption('overlay');
          assert.equal(await s.getAttribute('data-mode'),'overlay');
          guideMeasurements+=await checkGuideGeometry(s,c.conditions);
          await s.locator('[data-mode]').selectOption('before');
          guideMeasurements+=await checkGuideGeometry(s,c.conditions);
          await s.locator('[data-mode]').selectOption('after');
          guideMeasurements+=await checkGuideGeometry(s,c.conditions);
          await s.locator('[data-mode]').selectOption('pair');
          await s.locator('[data-zoom]').evaluate(i=>{
            i.value='200';
            i.dispatchEvent(new Event('input',{
              bubbles:true
            }));
          });
          assert.equal(await s.locator('.image-media').first().evaluate(i=>i.style.width),'200%');
          guideMeasurements+=await checkGuideGeometry(s,c.conditions);
          await s.locator('.keys').first().locator('figure').first().evaluate(f=>{f.scrollLeft=27;});
          await p.waitForFunction(id=>{
            const figures=document.getElementById(id).querySelector('.keys').querySelectorAll('figure');
            return figures[0].scrollLeft===figures[1].scrollLeft;
          },c.id);
          guideMeasurements+=await checkGuideGeometry(s,c.conditions);
          await s.locator('[data-mode]').selectOption('overlay');
          guideMeasurements+=await checkGuideGeometry(s,c.conditions);
          await s.locator('[data-mode]').selectOption('pair');
          await s.locator('[data-zoom]').evaluate(i=>{
            i.value='100';
            i.dispatchEvent(new Event('input',{
              bubbles:true
            }));
          });
          // Force a letterboxed media element: SVG meet must follow the same
          // intrinsic stage rectangle as object-fit:contain, not the outer box.
          await s.locator('.video-media').evaluateAll(items=>items.forEach(i=>{i.style.height='90px';}));
          guideMeasurements+=await checkGuideGeometry(s,c.conditions);
          await s.locator('.video-media').evaluateAll(items=>items.forEach(i=>{i.style.height='';}));
        }
        await guide.focus();
        await guide.press('Space');
        assert.equal(await guide.isChecked(),false);
        assert.equal(await p.locator('.circle-guide').evaluateAll(items=>items.every(i=>getComputedStyle(i).visibility==='hidden')),true);
        assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile document fits viewport');
        report.ui.push({
          lang,width,cases:m.cases.length,controls:true,guideMeasurements,guideKeyboardOnOff:true
        });
      }
      finally{
        await p.close();
      }
    }

    await owners.close();
    phase='playback';context={stage:'playback'};
    browser=await owners.start(phase);
    for(const c of m.cases)for(const side of SIDES){
      const playbackPage=await browser.newPage();
      let video;
      try{
        await isolate(playbackPage,baseURL,authorize);
        const blank=new URL('__avoid007_playback_blank__.html',baseURL).href;
        await playbackPage.route(blank,route=>route.fulfill({contentType:'text/html',body:'<!doctype html><meta charset="utf-8"><title>Playback validation</title>'}));
        await playbackPage.goto(blank);
        context={stage:'video-load',case:c.id,side};progress();
        await playbackPage.setContent('<video controls playsinline preload="auto" style="display:block;width:640px;max-width:100%;height:auto" src="'+esc(new URL(c[side].video,baseURL).href)+'"></video>');
        video=await playbackPage.locator('video').elementHandle();
        await video.evaluate(v=>new Promise((resolve,reject)=>{
          if(v.readyState>=2)return resolve();
          v.onloadeddata=()=>resolve();
          v.onerror=()=>reject(Error('video load'));
          v.preload='auto';
          v.load();
        }));
        const seeks=[];
        context={stage:'decoded-seek',case:c.id,side};progress();
        for(const target of [1.5,.125,3.75])seeks.push(await playbackPage.evaluate(({
          v,target,source
        })=>(0,eval)('('+source+')')(v,target),{
          v:video,target,source:seekDecodedFrame.toString()
        }));
        let playback=null;
        if(playAll){
          context={stage:'continuous-playback',case:c.id,side};progress();
          playback=await playbackPage.evaluate(async({v,seekSource,playSource})=>{
            try{return await (0,eval)('('+playSource+')')(v,(0,eval)('('+seekSource+')'));}
            catch(error){if(error.playback)return error.playback;throw error;}
          },{v:video,seekSource:seekDecodedFrame.toString(),playSource:playNativeVideo.toString()});
          // Save the failed raw playback values before any acceptance assertion.
          report.playback.push({case:c.id,side,seeks,playback});progress();
          assert.equal(playback.failure,undefined,'no playback failure marker');
          assert.equal(playback.ended,true);
          assert.ok(playback.decoded>=92,'accepted006 >=92 decoded frames of 96');
          assert.ok(Math.abs(playback.currentTime-4)<1/24);
          assert.equal(playback.dropped,0);
          assert.equal(playback.corrupt,0);
        }
        if(!playAll)report.playback.push({
          case:c.id,side,seeks,playback
        });
      }finally{
        try{if(video)await releaseVideo(video);}finally{await playbackPage.close();}
      }
    }
    await owners.close();
    phase='native-live';context={stage:'native-parity'};
    browser=await owners.start(phase);
    // Rerender original native frames; H264 decoded pixels are deliberately not an RGBA oracle.
    for(const c of m.cases)for(const side of SIDES){
      context={stage:'native-parity',case:c.id,side};progress();
      const {
        page
      }
      =await fixturePage(browser,baseURL,c,side,m.fixtureOptions,authorize);
      try{
        const records=JSON.parse(regular(dir,c[side].frames));
        for(const n of [...KEYS,...KEYS.slice().reverse()]){
          const f=await render(page,n),b=Buffer.from(f.png.split(',')[1],'base64');
          assert.equal(f.rgbaSHA256,records[n].rgbaSHA256,'live native frame RGBA');
          assert.equal(sha(b),records[n].sha256,'live original native PNG');
          pngRecord(b,f.rgbaSHA256,c.conditions.W,c.conditions.H);
        }
        report.nativeParity.push({
          case:c.id,side,frames:KEYS,reverseFrames:KEYS.slice().reverse()
        });
      }
      finally{
        await page.close();
      }
    }
    context={stage:'live-fixture'};progress();
    const livePage=await browser.newPage({viewport:{width:390,height:850}});
  try {
    await isolate(livePage,baseURL,authorize);
    const c=m.cases[0];
    await livePage.goto(new URL('live.html?case='+c.id,baseURL).href);
    await livePage.waitForFunction(()=>document.body.dataset.fixtureSide==='after');
    for(const side of ['after','before']) {
      if(side==='before') {
        await livePage.locator('#side').selectOption(side);
        await livePage.waitForFunction(()=>document.body.dataset.fixtureSide==='before');
      }
      const canvas=livePage.frameLocator('iframe').locator('canvas');
      assert.equal(await canvas.count(),1);
      assert.deepEqual(await canvas.evaluate(c=>[c.width,c.height]),[c.conditions.W,c.conditions.H]);
      await livePage.locator('#frame').evaluate(i=>{i.value='90';i.dispatchEvent(new Event('input',{bubbles:true}));});
      await livePage.waitForFunction(()=>document.querySelector('output').textContent==='90/24');
      report.live.push({case:c.id,side,frame:90,canvas:[c.conditions.W,c.conditions.H],width:390});
    }
  } finally {await livePage.close();}
  for(const [asset,hash]of Object.entries(m.assets))assert.equal(sha(regular(dir,asset)),hash,'UI controls preserve all original asset bytes');
  report.guideSourceAssetsUnchanged=true;
  await owners.close();
  report.status='raw HTTP, UI, MP4 decoded seek/playback and native parity verified';
    return report;
  }
  catch(error){
    report.failure={...context,message:error.message};progress();
    error.message='['+JSON.stringify(context)+'] '+error.message;
    throw error;
  }
  finally{
    try{await owners.close();}
    finally{
      try{
        try{assertBrowserInputs(pins);report.inputIntegrity='unchanged';}
        catch(error){report.inputIntegrity='changed';report.failure={...context,message:'validation input bytes changed'};progress();throw error;}
        progress();
      }finally{if(local)await new Promise(r=>local.server.close(r));}
    }
  }
}

module.exports={
  BASE,FPS,FRAMES,KEYS,LAYOUTS,resolveOptions,fontOptionsGuard,sha,digest,relative,codecQuality,publicBrowserOptions,safeInitial,safeObservations,normalizedRegions,actualConditionGuard,decodePNG,pngRecord,encodeArgs,probe,normalize,guardCases,startup,assertUnchanged,serve,isolate,fixturePage,render,encodeFrames,pageHTML,liveHTML,controls,liveControls,capture,validateFiles,seekDecodedFrame,playNativeVideo,releaseVideo,circleGuide,measureGuides,checkGuideGeometry,validateBrowser,browserPhases,browserInputPins,assertBrowserInputs
};

if(require.main===module)(async()=>{
  const [command,a,b]=process.argv.slice(2);
  if(command==='capture')return capture(JSON.parse(bytes(a)),b);
  if(command==='validate-files'){
    const r=validateFiles(a);
    return {
      manifestSHA256:r.manifestSHA256,assets:r.assets,status:r.status
    };
  }
  if(command==='validate-browser')return validateBrowser(a,{
    baseURL:b,onProgress:process.env.JIZURA_B25_BROWSER_PARTIAL?report=>fs.writeFileSync(process.env.JIZURA_B25_BROWSER_PARTIAL,json(report)):undefined
  });
  throw Error('Usage: layouts-b-review.cjs capture config.json fresh-directory | validate-files directory | validate-browser directory [baseURL/]');
})().then(r=>process.stdout.write(json(r))).catch(e=>{
  console.error(e.stack);
  process.exitCode=1;
});
