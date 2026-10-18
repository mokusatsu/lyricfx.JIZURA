// Immutable capture bundle. Local requests only; remote fonts/models are blocked.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),http=require('node:http'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function serve(directory=root){const server=http.createServer((req,res)=>{let p=path.resolve(directory,'.'+decodeURIComponent(req.url.split('?')[0]));
    if(!p.startsWith(directory+path.sep)){res.writeHead(403).end();
      return}try{if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');
      const type=({'.html':'text/html','.js':'text/javascript','.json':'application/json','.otf':'font/otf','.png':'image/png'})[path.extname(p)]||'application/octet-stream';
      res.setHeader('Content-Type',type);
      res.end(fs.readFileSync(p))}catch{res.writeHead(404).end()}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  return {server,base:`http://127.0.0.1:${server.address().port}`};
}
function compareHTML(m){return `<!doctype html>
<html lang="ja">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>${m.task} ${m.build}</title>
<style>body{font:16px sans-serif;max-width:1600px;margin:auto;padding:16px;background:#16202a;color:#eee}a{color:#adf}.pair{display:flex;gap:12px}figure{margin:0;min-width:0}figcaption{height:6em;overflow:auto;overflow-wrap:anywhere}.pair figure{width:50%}img{width:100%;height:auto}button,select,input{font:inherit}.overlay{position:relative}.overlay figure{width:100%}.overlay figure+figure{position:absolute;top:0;left:0;opacity:var(--alpha,.5)}.toggle figure{width:100%}.toggle figure:first-child{display:none}.toggle.before figure:first-child{display:block}.toggle.before figure+figure{display:none}.original{overflow:auto;max-height:85vh}.original img{width:auto;max-width:none}@media(max-width:650px){.pair{flex-direction:column}.pair figure{width:100%}.overlay{display:block}}</style>
<h1>${m.task} / ${m.build}</h1>
<p>
<strong>操作サンプルは確認専用のプライベート/シークレットウィンドウで開いてください。</strong>固定アプリの保存領域を通常の編集セッションから隔離してください。</p>
<p>変更前: ${m.before.commit}; 変更後: 同じ本番描画ソース＋契約確認ページ追加。実装済みの新軌道はありません。beforeの契約UIは不存在と表示。仕様見本は未実装として別枠。ローカルで撮影、Pages一致は別途検証。</p>
<p>撮影条件: seed 1 / viewport 1500×1000 / DPR 1 / Chromium ${m.browser} / ローカルNoto Sans CJK subset。時刻と寸法は各caseとmanifest参照。${m.hids.length}項目 / ${m.cases.length}cases。</p>
<nav>${m.hids.map(h=>`<a href="#${h}">${h}</a>`).join(' / ')} / <a href="sample.html">操作サンプル</a> / <a href="manifest.json">manifest</a> / <a href="fixtures/contract.json">採用契約</a> / <a href="fixtures/inventory.json">184ID担当</a>
</nav>
<p>
<label>表示 <select id="mode">
<option value="pair">並列</option>
<option value="toggle">前後切替</option>
<option value="overlay">重ね合わせ</option>
</select>
</label> <button id="toggle">変更前/後切替</button> <label>重ね合わせ <input id="alpha" type="range" min="0" max="1" step=".05" value=".5">
</label> <button id="size">原寸/画面幅（全画像同期）</button>
</p>${m.hids.map(h=>`<section id="${h}">
<h2>${h}</h2>${m.cases.filter(c=>c.hid===h).map(c=>`<article>
<h3>${c.id}</h3>
<p>${c.notes} / time=${c.conditions.time}s seed=${c.conditions.seed} / <a href="sample.html?layout=${c.conditions.layout}&aspect=${c.conditions.aspect}&position=${c.conditions.position}&time=${c.conditions.time}">同じfixtureを操作</a>
</p>
<div class="pair">${['before','after'].map(s=>`<figure>
<figcaption>${s==='before'?'変更前 固定旧版＋UI不存在':'変更後 確認ページ＋現行実描画'} (${c[s].implementation}) / <a href="${c[s].original.path}">原寸ステージPNG</a>
</figcaption>
<a href="${c[s].path}">
<img src="${c[s].path}" alt="${c.id} ${s}" width="${c[s].width}" height="${c[s].height}">
</a>
</figure>`).join('')}</div>
</article>`).join('')}</section>`).join('')}<script>const pairs=[...document.querySelectorAll('.pair')];mode.onchange=()=>pairs.forEach(p=>p.className=mode.value);toggle.onclick=()=>pairs.forEach(p=>p.classList.toggle('before'));alpha.oninput=()=>document.body.style.setProperty('--alpha',alpha.value);size.onclick=()=>pairs.forEach(p=>p.classList.toggle('original'));</script>
</html>`;
}
async function main(){const command=process.argv[2],build=process.argv[3];
  assert.ok(['capture', 'validate'].includes(command), 'command must be capture or validate');
  assert.match(build||'',/^[a-zA-Z0-9._-]+$/);
  const extra = process.argv.slice(4);
  let baseURL = null;
  if (extra.length) {
    assert.equal(command, 'validate', 'capture accepts no options');
    assert.equal(extra.length, 2, 'expected --base-url HTTP(S)-URL/');
    assert.equal(extra[0], '--base-url', 'unknown option');
    const parsed = new URL(extra[1]);
    assert.ok(['http:', 'https:'].includes(parsed.protocol), 'base URL must use HTTP(S)');
    assert.ok(extra[1].endsWith('/'), 'base URL needs trailing slash');
    assert.ok(!parsed.search && !parsed.hash && !parsed.username && !parsed.password, 'base URL must be a plain public directory');
    baseURL = parsed.href;
  }
  const dir=path.join(root,'review/AVOID-002',build),relative=path.relative(root,dir).split(path.sep).join('/');
  if(command==='capture'){
    assert.equal(sha(cp.execFileSync('git',['show','HEAD:index.html'],{cwd:root,maxBuffer:16*1024*1024})),sha(fs.readFileSync(path.join(root,'index.html'))),'before must match fixed HEAD source');
    assert.ok(!fs.existsSync(dir),'build ID immutable; choose a new one');
    fs.mkdirSync(path.join(dir,'images'),{recursive:true});
    fs.mkdirSync(path.join(dir,'fixtures'));
    for(const name of ['contract.json','cases.json'])fs.copyFileSync(path.join(__dirname,name),path.join(dir,'fixtures',name));
    fs.copyFileSync(path.join(root,'tasks/evidence/AVOID-002/inventory.json'),path.join(dir,'fixtures/inventory.json'));
    fs.copyFileSync(path.join(root,'index.html'),path.join(dir,'fixtures/current.html'));
    fs.copyFileSync(path.join(__dirname,'sample.html'),path.join(dir,'sample.html'));
    cp.execFileSync('python',['-m','fontTools.subset','/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','--font-number=0','--text=夜明けの色を覚えてるABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 *~:/.','--output-file='+path.join(dir,'fixtures/font.otf')]);
    fs.copyFileSync('/usr/share/doc/fonts-noto-cjk/copyright',path.join(dir,'fixtures/font-license.txt'));
    const {server,base}=await serve(),browser=await require('../browser.cjs').launch();
    try{const page=await browser.newPage({viewport:{width:1500,height:1000},deviceScaleFactor:1});
      await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('console',m=>{if(m.type()==='warning')errors.push(m.text())});
      const manifest={schema:1,task:'AVOID-002',build,comparisonVersion:1,hids:['AVOID-002-H01','AVOID-002-H02','AVOID-002-H03'],before:{commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()},after:{baseCommit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceSHA256:sha(fs.readFileSync(path.join(root,'index.html')))},browser:browser.version(),created:new Date().toISOString(),cases:[],assets:{},limitations:['No production avoidance changes','No region resolver yet','Specification examples are unimplemented','Per-layout adapter verification pending','No public Pages verification yet']};
      const specs=[];
      for(const position of ['center','upper','lower','default'])specs.push({hid:manifest.hids[0],layout:'ring',aspect:'16:9',position,time:1});
      for(const layout of ['center','ring','tile'])for(const aspect of ['16:9','9:16','1:1','21:9','4:5'])specs.push({hid:manifest.hids[1],layout,aspect,position:'default',time:1});
      for(const time of [.001,1,4.999])specs.push({hid:manifest.hids[2],layout:'center',aspect:'16:9',position:'default',time});
      for (let i = 0; i < specs.length; i++) {const conditions={...specs[i],seed:1,viewport:[1500,1000],dpr:1,font:'NotoSansCJK-Regular subset / all J.FONTS families overridden',media:'none',color:'sRGB browser default',alpha:'opaque screenshot',externalRequests:'blocked'},c={id:`case-${String(i+1).padStart(2,'0')}`,hid:conditions.hid,conditions,notes:'見る箇所: 現行の小矩形と実測値、追加契約。意図した変化: 確認UI追加。維持: 現行Rendererの描画。仕様円は別枠・未実装。'};
        for(const side of ['before','after']){const q=new URLSearchParams({...specs[i],...(side==='before'?{before:'1'}:{})});
          await page.goto(`${base}/${relative}/sample.html?${q}`);
          await page.waitForFunction(()=>window.ready||window.failure);
          assert.equal(await page.evaluate(()=>window.failure),undefined);
          assert.equal(await page.evaluate(()=>window.fontReady),true);
          if(i===0&&side==='before'){const actual=await page.locator('#app').evaluate(f=>f.contentWindow.J.order('layout').map(id=>({id,source:f.contentWindow.J.LAYOUTS[id].render.toString()})));const expected=JSON.parse(fs.readFileSync(path.join(dir,'fixtures/inventory.json')));for(const row of actual)assert.equal(sha(row.source),expected.find(r=>r.id===row.id).renderSHA256,'current render source mismatch '+row.id);}
          await page.evaluate(()=>document.fonts.ready);
          const imagePath=`images/${c.id}-${side}.png`;
          const shot=await page.locator('#capture').screenshot({path:path.join(dir,imagePath)});
          c[side]={path:imagePath,width:shot.readUInt32BE(16),height:shot.readUInt32BE(20),sha256:sha(shot),time:conditions.time,conditionsSHA256:sha(JSON.stringify(conditions)),implementation:side==='before'?manifest.before.commit:manifest.after.sourceSHA256,captured:new Date().toISOString(),sourceSHA256:manifest.after.sourceSHA256,fixtureSHA256:sha(fs.readFileSync(path.join(dir,'fixtures/cases.json'))),method:'Playwright locator screenshot, local HTTP',observation:await page.evaluate(()=>window.observation)};
          const b=Buffer.from((await page.locator('#current').evaluate(c=>c.toDataURL('image/png'))).split(',')[1],'base64'),p=`images/${c.id}-${side}-original.png`;
          fs.writeFileSync(path.join(dir,p),b);
          c[side].original={path:p,sha256:sha(b),width:b.readUInt32BE(16),height:b.readUInt32BE(20),kind:'original-stage Renderer canvas, no UI or specification guide'};
        }
        manifest.cases.push(c);
        console.log(c.id,c.hid);
      }
      assert.deepEqual(errors,[]);
      fs.writeFileSync(path.join(dir,'index.html'),compareHTML(manifest));
      for(const p of ['index.html','sample.html',...fs.readdirSync(path.join(dir,'fixtures')).map(x=>'fixtures/'+x),...fs.readdirSync(path.join(dir,'images')).map(x=>'images/'+x)])manifest.assets[p]=sha(fs.readFileSync(path.join(dir,p)));
      for(const p of ['index.html','en/index.html'])manifest.assets['../../../'+p]=sha(fs.readFileSync(path.join(root,p)));
      fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
    }finally{await browser.close();
      await new Promise(r=>server.close(r))}}
  else if(command==='validate'){await validate(dir,relative,baseURL)}else throw Error('capture|validate BUILD');
}
async function validate(dir,relative,baseURL=null){const m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));
  assert.equal(m.schema,1);
  assert.deepEqual(m.hids,['AVOID-002-H01','AVOID-002-H02','AVOID-002-H03'],'manifest H-ID list');
  assert.equal(m.cases.length,22,'incomplete capture matrix');
  for(const hid of m.hids)assert.ok(m.cases.some(c=>c.hid===hid),'missing H-ID');
  assert.equal(new Set(m.cases.map(c=>c.id)).size,m.cases.length);
  const key = c => [c.hid,c.conditions.layout,c.conditions.aspect,c.conditions.position,c.conditions.time].join('|');
  const expected=[];
  for(const position of ['center','upper','lower','default'])expected.push(['AVOID-002-H01','ring','16:9',position,1].join('|'));
  for(const layout of ['center','ring','tile'])for(const aspect of ['16:9','9:16','1:1','21:9','4:5'])expected.push(['AVOID-002-H02',layout,aspect,'default',1].join('|'));
  for(const time of [.001,1,4.999])expected.push(['AVOID-002-H03','center','16:9','default',time].join('|'));
  assert.deepEqual(m.cases.map(key).sort(),expected.sort(),'capture matrix identities');

  for(const [p,hash] of Object.entries(m.assets)){assert.equal(sha(fs.readFileSync(p.startsWith('../../../')?path.join(root,p.slice(9)):path.resolve(dir,p))),hash,'asset mismatch '+p)}for(const c of m.cases){assert.deepEqual([c.before.width,c.before.height],[c.after.width,c.after.height],'UI pair dimensions');
    assert.equal(c.before.original.sha256,c.after.original.sha256,'002 must preserve current drawing');
    assert.equal(c.before.conditionsSHA256,sha(JSON.stringify(c.conditions)),'conditions before');
    assert.equal(c.after.conditionsSHA256,sha(JSON.stringify(c.conditions)),'conditions after');
    for(const s of ['before','after']){const b=fs.readFileSync(path.join(dir,c[s].path));
      assert.equal(sha(b),c[s].sha256,'PNG hash');
      assert.ok(b.length>1000);
      assert.equal(b.readUInt32BE(16),c[s].width);
      assert.equal(b.readUInt32BE(20),c[s].height);
      assert.equal(c[s].time,c.conditions.time);
      assert.equal(c[s].observation.fontLoaded,'loaded');
      assert.equal(c[s].sourceSHA256,m.after.sourceSHA256,'source identity');
      assert.equal(c[s].fixtureSHA256,m.assets['fixtures/cases.json']);
      const original=fs.readFileSync(path.join(dir,c[s].original.path));
      assert.equal(sha(original),c[s].original.sha256);
      assert.deepEqual([original.readUInt32BE(16),original.readUInt32BE(20)],c[s].observation.stage);
      assert.equal(c[s].original.width,original.readUInt32BE(16));
      assert.equal(c[s].original.height,original.readUInt32BE(20));
    }}
  const local = baseURL ? null : await serve(dir);
  const target = baseURL ? new URL(relative + '/index.html', baseURL).href : local.base + '/index.html';
  const browser = await require('../browser.cjs').launch();
  try{const page=await browser.newPage();
    await page.route('**/*', route => route.request().url().startsWith(new URL(target).origin+'/') ? route.continue() : route.abort());
    if (baseURL) {
      for (const [asset, hash] of [...Object.entries(m.assets), ['manifest.json', sha(fs.readFileSync(path.join(dir,'manifest.json')))]]) {
        const url = new URL(asset, target).href;
        const response = await page.request.get(url);
        assert.equal(response.status(), 200, 'public HTTP ' + url);
        assert.equal(sha(await response.body()), hash, 'public hash ' + url);
      }
    }

    const broken=[];
    page.on('response',r=>{if(r.status()>=400)broken.push(r.url())});
    for(const width of [1500,390]){await page.setViewportSize({width,height:1000});
      await page.goto(target);
      await page.locator('img').last().waitFor();
      assert.equal(await page.locator('img').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0)),true);
      assert.equal(await page.locator('section[id]').count(),m.hids.length);
      for (const mode of ['pair', 'toggle', 'overlay']) {
        await page.selectOption('#mode', mode);
        if (mode === 'overlay') {
          for (const pair of await page.locator('.overlay').all()) {
            const bounds = await pair.locator('img').evaluateAll(xs => xs.map(x => { const r=x.getBoundingClientRect(); return [r.x,r.y,r.width,r.height]; }));
            assert.deepEqual(bounds[0], bounds[1], 'overlay image geometry');
          }
        }
        assert.equal(await page.locator('figure').first().locator('figcaption').count(), 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, mode + ' responsive page');
        await page.locator('#toggle').click();
        await page.locator('#size').click();
        assert.equal(await page.locator('.original').count(), m.cases.length);
        await page.locator('#size').click();
      }
      await page.selectOption('#mode', 'pair');
      for(const href of await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')))){if(href.startsWith('#'))assert.equal(await page.locator(href).count(),1);
        else assert.equal((await page.request.get(new URL(href,page.url()).href)).status(),200,'link '+href)}}assert.deepEqual(broken,[]);
    await page.goto(new URL('sample.html', target).href);
    await page.waitForFunction(() => window.ready || window.failure);
    assert.equal(await page.evaluate(() => window.failure), undefined);
    assert.equal(await page.evaluate(() => window.fontReady), true);
    assert.equal(await page.locator('#current').evaluate(c => c.width > 0 && c.height > 0), true);
    console.log(JSON.stringify({publicURL:baseURL||null,validated:true,cases:m.cases.length,uiImages:m.cases.length*2,originalImages:m.cases.length*2,images:m.cases.length*4,widths:[1500,390],manifestSHA256:sha(fs.readFileSync(path.join(dir,'manifest.json')))}));
  }finally{await browser.close();
    if(local)await new Promise(r=>local.server.close(r))}}
module.exports={validate};
if(require.main===module)main().catch(e=>{console.error(e);
  process.exitCode=1});
