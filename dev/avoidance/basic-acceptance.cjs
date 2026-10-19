/* AVOID-005 independent acceptance probes. Route admission itself is analytic. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
(async()=>{
 const compiled=fs.readFileSync(path.join(root,'index.html')),fixtureSource=fs.readFileSync(path.join(__dirname,'basic-fixture.js'),'utf8'),compiledSHA256=crypto.createHash('sha256').update(compiled).digest('hex'),fixtureSHA256=crypto.createHash('sha256').update(fixtureSource).digest('hex');
 const server=http.createServer((req,res)=>{try{const file=req.url==='/font.otf'?'/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc':path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':'application/octet-stream');res.end(file===path.join(root,'index.html')?compiled:fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await require('../browser.cjs').launch();
 try{
  const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForFunction(()=>J?.ui?.plan);await page.addScriptTag({content:fixtureSource});
  const report=await page.evaluate(async()=>{
   const A=J.placement,fontURL=location.origin+'/font.otf',rows=[],variants=[],raster=[],p95=a=>a.slice().sort((a,b)=>a-b)[Math.ceil(a.length*.95)-1],fixture=s=>runBasicFixture(J,s,{fontURL});
   const check=(name,value,details)=>{rows.push({name,passed:!!value,...(details===undefined?{}:{details})});};
   await fixture({layout:'center'});
   // Independent closest-point rectangle/circle test, separate from A.clear.
   const rectClear=(b,c,m)=>Math.hypot(c.cx-Math.max(b.x0,Math.min(b.x1,c.cx)),c.cy-Math.max(b.y0,Math.min(b.y1,c.cy)))>c.r+m;
   const directionCounts={};
   for(const cy of [.25,.5,.75]){const counts={left:0,right:0,above:0,below:0};for(let seed=0;seed<100;seed++){const y=540*cy,poly=[[450,y-24],[510,y-24],[510,y+24],[450,y+24]],s=A.solveBasic([poly],{cx:480,cy:y,r:108},960,540,seed);if(s.status==='safe')counts[s.direction]++;}directionCounts[cy]=counts;}
   check('same100seed central four directions',Object.values(directionCounts[.5]).every(n=>n>0),directionCounts[.5]);check('upper below exceeds above',directionCounts[.25].below>directionCounts[.25].above,directionCounts[.25]);check('lower above exceeds below',directionCounts[.75].above>directionCounts[.75].below,directionCounts[.75]);
   let routes=0,routeFailures=0,tangentJumps=0;
   for(const side of ['above','below','left','right'])for(const cx of [100,480,850])for(const cy of [100,270,440])for(const size of [8,24,60]){const route={W:960,H:540,circle:{cx,cy,r:72},side,halfWidth:size,halfHeight:size};if(!A.certifyBasicRoute(route))continue;routes++;const swap=side==='left'||side==='right';for(const x of [0,100,300,480,700,960])for(const y of [-500,0,270,540,1000]){const p=A.basicRoutePoint([x,y],route),b={x0:p[0]-(swap?size:size),x1:p[0]+size,y0:p[1]-size,y1:p[1]+size};if(b.x0<0||b.y0<0||b.x1>960||b.y1>540||!rectClear(b,{...route.circle,r:route.circle.r-.0001},0))routeFailures++;}const tangent=(swap?route.circle.cy:route.circle.cx)+size+route.circle.r,points=[-1e-7,1e-7].map(d=>A.basicRoutePoint(swap?[270,tangent+d]:[tangent+d,270],route));if(Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1])>.1)tangentJumps++;}
   check('universal route independent rectangle oracle',routes>0&&routeFailures===0,{routes,routeFailures});check('continuous tangent guards',tangentJumps===0,{tangentJumps});
   const poly=[[-5,-5],[5,-5],[5,5],[-5,5]],c={cx:0,cy:0,r:40};check('safe endpoints unsafe interior counterexample',A.clear([poly.map(p=>[p[0]-100,p[1]])],c)&&A.clear([poly.map(p=>[p[0]+100,p[1]])],c)&&!A.certifySegment([poly],[-100,0],[100,0],c));
   const variantSpecs=[
    ...[0,1e-12,-1e-12,.01,-.01,.25,-.45,.9,-.9].map(travel=>({layout:'wave',params:{travel}})),
    ...[5,7,9].map(trail=>({layout:'wave',params:{trail,amp:.08,freq:1.2}})),
    ...['outline','dim','box'].flatMap(rowStyle=>[2,4].map(count=>({layout:'marquee',params:{rows:count,rowStyle}}))),
    ...[true,false].map(extras=>({layout:'scatter',params:{extras}})),
    ...[-22,-10,10,22].flatMap(ang=>[true,false].map(second=>({layout:'diag',params:{ang,second}}))),
    ...['radial','rows','scatter'].flatMap(variant=>['orb','word','none'].map(center=>({layout:'labels',params:{variant,center}}))),
    ...['disc','ring','eclipse'].map(variant=>({layout:'circle',params:{variant}})),
    ...['repeat','split'].map(variant=>({layout:'vcols',params:{variant}})),
    ...['LOVE','LIVE','hello','MUSIC','Go','風の先へ'].flatMap(text=>[[960,540],[720,720],[540,960]].map(([W,H])=>({layout:'huge',text,W,H}))),
    {layout:'center',text:'長い歌詞をそのまま保つ\n二行目も保つ'},
    {layout:'center',text:'未来へ',lineText:'未来へ進もう',params:{sub:true,under:true}},
    {layout:'gloss',text:'歌詞|よみ',params:{vertNote:false}},
    {layout:'gloss',text:'歌詞|よみ',params:{vertNote:true}},
    {layout:'pill',text:'未来へ',note:'みらいへ'},
   ];
   for(const spec of variantSpecs){try{const r=await fixture(spec),cut=r.plan.cuts[0],tr=cut.placementTrajectory;let frameErrors=0,unsafeCertified=0;for(const time of [.01,.2,1.5,3.8,3.99]){const observations=[];try{r.renderer.frame(r.canvas.getContext('2d'),r.plan,time,{noHud:true,noPost:true,placementObservation:o=>observations.push(o)});}catch{frameErrors++;}if(tr?.safety.startsWith('certified'))unsafeCertified+=observations.filter(o=>o.safety!=='safe').length;}variants.push({spec,safety:tr?.safety||'unsupported',diagnostics:r.observation.diagnostics,frameErrors,unsafeCertified,note:cut.note});}catch(e){variants.push({spec,error:e.code||e.message});}}
   check('native variant frames reject or certify honestly',variants.every(v=>!v.error&&!v.frameErrors&&!v.unsafeCertified),variants.filter(v=>v.error||v.frameErrors||v.unsafeCertified));check('native eclipse is explicit unsupported',variants.some(v=>v.spec.layout==='circle'&&v.spec.params.variant==='eclipse'&&v.safety==='unsupported'&&v.diagnostics.some(d=>d.code==='UNSUPPORTED_ADAPTER')));check('actual pipe ruby/note reaches owner',variants.filter(v=>String(v.spec.text).includes('|')).every(v=>v.note==='よみ'));
   // Identical source composition and options must give identical outputs even
   // after prior staging. This includes restoration of original automatic area.
   for(const layout of ['center','circle','wave','huge']){
    const r=await runBasicFixture(J,{layout},{newPath:false,fontURL}),src=r.plan;src.cuts[0].area={x:.12,y:.18,w:.56,h:.63,angle:0};if(layout==='circle')src.cuts[0].params.variant='disc';const staged=J.finalizePlacementPlan(src,{basicLayouts:true});
    for(const options of [{basicLayouts:true,cutIndices:[]},{basicLayouts:false},{basicLayouts:true}]){const a=J.finalizePlacementPlan(src,options),b=J.finalizePlacementPlan(staged,options);check('refinalize '+layout+' '+JSON.stringify(options),JSON.stringify(a)===JSON.stringify(b));}
    if(layout==='circle'){const opts={basicLayouts:true,params:{0:{variant:'eclipse'}}},a=J.finalizePlacementPlan(src,opts),b=J.finalizePlacementPlan(staged,opts);check('unsupported override restores original',JSON.stringify(a)===JSON.stringify(b)&&!b.cuts[0].placementTrajectory&&!b.cuts[0].fullStagePlacement&&!b.cuts[0].placementUnits&&!b.cuts[0].placementGlyphs);}
   }
   for(const control of ['legacy','fullstage','off','manual','lock','emphasis']){const r=await fixture({layout:'center',control});check('real fixture control '+control,r.observation.controlApplied===control&&!r.observation.staged&&(control!=='legacy'||!!r.observation.appliedArea)&&(control!=='lock'||r.plan.cuts[0].placementLocked));}
   // Parse the real lyric grammar; the simple visual fixture deliberately fixes
   // size/motion and therefore cannot substitute for these integration checks.
   const parsedProject=J.defaultProject();parsedProject.title='';parsedProject.videoSize={w:960,h:540};parsedProject.lyrics='[00:00]歌詞|よみ\n[00:02]~小さく~\n[00:04]*強く*\n[00:06]第一行\\n第二行\n[00:08]150:明示サイズ';parsedProject.durationOverride=10;parsedProject.lyricEffects={autoPlacement:true,avoidCenter:true};parsedProject.overrides={0:{layout:'gloss',single:true},1:{layout:'center',single:true},2:{layout:'center',single:true},3:{layout:'center',single:true},4:{layout:'center',single:true}};
   const parsed=J.plan(parsedProject);parsed.cuts=parsed.cuts.filter(c=>c.line>=0);parsed.style.glow=0;parsed.events=[];for(const c of parsed.cuts){Object.assign(c,{enter:'cut',exit:'cut',groupExit:'cut',hold:'still',cam:'push',decor:[],treat:'none',trans:null,effectStyle:null,effectFx:null,drawing:null});if(c.layout==='gloss')c.params.vertNote=false;}
   const semantic=c=>Object.fromEntries(['line','part','text','lineText','note','start','end','renderStart','displayEnd','slotEnd','seed','scheme','palette','motionScale','lyricSize','emphasis','suppressed'].map(k=>[k,c[k]])),beforeSemantics=parsed.cuts.map(semantic),finalParsed=J.finalizePlacementPlan(parsed,{basicLayouts:true});
   check('actual parsed semantic identity and timing',JSON.stringify(beforeSemantics)===JSON.stringify(finalParsed.cuts.map(semantic)));
   const soft=parsed.cuts.find(c=>c.suppressed),strong=parsed.cuts.find(c=>c.emphasis),sized=parsed.cuts.find(c=>c.lyricSize!=null),multiline=finalParsed.cuts.find(c=>c.text.includes('\n')),ruby=finalParsed.cuts.find(c=>c.note==='よみ');
   check('actual suppression keeps size and motion scales',!!soft&&soft.motionScale===.25&&Number.isFinite(soft.contentScale)&&finalParsed.cuts.find(c=>c.index===soft.index).motionScale===soft.motionScale&&finalParsed.cuts.find(c=>c.index===soft.index).contentScale===J.SUPPRESSED_TEXT_SCALE,{source:soft&&semantic(soft),staged:soft&&semantic(finalParsed.cuts.find(c=>c.index===soft.index))});
   check('actual emphasis preserves full cut',!!strong&&JSON.stringify(finalParsed.cuts.find(c=>c.index===strong.index))===JSON.stringify(strong));
   check('actual size notation preserves explicit area',!!sized&&sized.areaMode==='notation'&&JSON.stringify(finalParsed.cuts.find(c=>c.index===sized.index))===JSON.stringify(sized));
   check('actual multiline preserves two native rows',!!multiline&&new Set(J.layoutText({text:multiline.text,font:multiline.params.font,size:40}).map(g=>g.li)).size===2);
   check('actual parsed pipe ruby has primary ownership',!!ruby&&ruby.layout==='gloss'&&ruby.placementTrajectory?.measurementSupported===true);
   const suppressionPlans=[];
   for(const [softText,explicit] of [[false,null],[true,null],[true,1],[true,.85]]){
    const project=J.defaultProject();project.title='';project.lyrics='[00:00]'+(softText?'~Go~':'Go');project.durationOverride=4;project.videoSize={w:960,h:540};project.lyricEffects={autoPlacement:true,avoidCenter:true};project.lyricAvoidance={version:1,regions:[{id:'soft',start:0,end:null,center:{x:.5,y:.25},radius:.2}]};project.overrides={0:{layout:'center',single:true}};if(explicit!=null)project.lyricCutOptions={'0:0':{details:{contentScale:explicit}}};
    const src=J.plan(project);src.cuts=src.cuts.filter(c=>c.line>=0);src.style.glow=0;src.style.ghost=0;src.fx.chroma=0;src.fx.motion=0;src.events=[];const c=src.cuts[0];Object.assign(c,{seed:704,enter:'cut',exit:'cut',groupExit:'cut',hold:'still',cam:'push',camP:{},decor:[],treat:'none',trans:null,effectStyle:null,effectFx:null,drawing:null,params:{font:'gothic_black',sx:1,track:.04,sub:false,under:false,accent:false,ox:0,oy:0}});const staged=J.finalizePlacementPlan(src,{basicLayouts:true});
    const cv=document.createElement('canvas');cv.width=960;cv.height=540;const observations=[];new J.Renderer().frame(cv.getContext('2d'),staged,(c.start+c.end)/2,{noHud:true,noPost:true,noGhost:true,placementObservation:o=>observations.push(o)});const ps=observations.flatMap(o=>o.polygons),box=ps.length?A.bounds(ps):{x0:0,x1:0,y0:0,y1:0};
    const nativeProject={...project,lyricEffects:{autoPlacement:false,avoidCenter:true}},native=J.plan(nativeProject).cuts.find(c=>c.line>=0);suppressionPlans.push({softText,explicit,timing:[c.start,c.end,c.renderStart,c.displayEnd],diagnostics:staged.placementFinalization.diagnostics,sourceScale:c.contentScale,stageScale:staged.cuts[0].contentScale,nativeFullStageScale:native.contentScale,width:box.x1-box.x0,height:box.y1-box.y0});
   }
   check('actual suppression fullstage intent and rendered footprint',suppressionPlans[1].stageScale===suppressionPlans[1].nativeFullStageScale&&suppressionPlans[1].stageScale===J.SUPPRESSED_TEXT_SCALE&&suppressionPlans[1].width<suppressionPlans[0].width*.85&&suppressionPlans[1].height<suppressionPlans[0].height*.85,suppressionPlans);
   check('actual suppression explicit scale overrides',suppressionPlans.slice(2).every(p=>p.stageScale===p.explicit),suppressionPlans.slice(2));
   // A waveform's zero and tiny travel must join continuously; magnitude must
   // remain meaningful. Compare the explicit first main glyph route key.
   const waveOffsets=[];for(const travel of [0,1e-12,-1e-12,.01,.9]){const r=await fixture({layout:'wave',text:'Go',time:1.5,params:{travel,amp:.08,freq:.8}});const o=r.observations.find(o=>o.pass==='main');waveOffsets.push({travel,offset:o?.offset['wave.unit.0']});}check('wave zero/tiny travel continuity',waveOffsets.slice(1,3).every(v=>Math.hypot(v.offset[0]-waveOffsets[0].offset[0],v.offset[1]-waveOffsets[0].offset[1])<1e-6),waveOffsets);check('wave travel magnitude is retained',Math.abs(waveOffsets[3].offset[0]-waveOffsets[4].offset[0])>1);
   // Actual alpha pixels are isolated by replaying primary events, preserving
   // painter order and every shape/clip/gradient against a transparent target.
   const rasterSpecs=[
    {layout:'center',cy:.25},{layout:'mixed'},{layout:'vcols',W:540,H:960,cy:.5},{layout:'marquee'},
    {layout:'tile',cy:.25},{layout:'scatter',cy:.25},{layout:'wave',text:'Go',params:{amp:.08,freq:.8}},{layout:'huge',W:540,H:960,cy:.25},
    {layout:'labels'},{layout:'condensed'},{layout:'gloss',cy:.25},{layout:'type'},{layout:'diag',cy:.25},
    {layout:'circle',cy:.25},{layout:'stack',W:540,H:960},{layout:'pill',cy:.25},
   ];
   const inside=(p,poly)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i],dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,u=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)):0;if(Math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dy)<1e-7)return true;if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
   for(const spec of rasterSpecs){const r=await fixture(spec);if(!r.observation.safety.startsWith('certified')){raster.push({spec,error:'selected raster fixture is not certified',safety:r.observation.safety});continue;}for(const scale of [.1,1,2])for(const time of [.2,1.5,3.8]){const canvas=document.createElement('canvas');canvas.width=Math.round(r.plan.W*scale);canvas.height=Math.round(r.plan.H*scale);const mask=document.createElement('canvas');mask.width=canvas.width;mask.height=canvas.height;const ctx=mask.getContext('2d'),original=A.replay,observations=[];
    A.replay=(env,program,offset,decorOffsets)=>{const maskEnv=r.renderer.makeEnv(ctx,env.plan,env.cut,env.sc,{...env,ctx});original(maskEnv,{...program,events:program.events.filter(e=>e.role==='primary')},offset);return original(env,program,offset,decorOffsets);};
    let frameError;try{r.renderer.frame(canvas.getContext('2d'),r.plan,time,{noHud:true,noPost:true,scale,placementObservation:o=>observations.push(o)});}catch(e){frameError=e.code+':'+e.message;}finally{A.replay=original;}if(frameError){raster.push({spec,time,scale,error:frameError});continue;}
    const polygons=observations.flatMap(o=>o.polygons),pixels=ctx.getImageData(0,0,mask.width,mask.height).data,c={cx:r.plan.W*.5,cy:r.plan.H*(spec.cy??.5),r:Math.min(r.plan.W,r.plan.H)*.2},margin=Math.max(2,.005*Math.min(r.plan.W,r.plan.H));let ink=0,collisions=0,uncovered=0;
    for(let i=3;i<pixels.length;i+=4)if(pixels[i]>=1){ink++;const p=[(((i-3)/4)%mask.width+.5)/scale,(Math.floor((i-3)/4/mask.width)+.5)/scale];if(Math.hypot(p[0]-c.cx,p[1]-c.cy)<=c.r+margin)collisions++;if(!polygons.some(poly=>inside(p,poly)))uncovered++;}
    raster.push({spec,time,scale,ink,collisions,uncovered,conflicts:observations.filter(o=>o.safety!=='safe').length});
   }}
   check('all16 actual alpha raster boundaries',raster.length===16*9&&raster.every(r=>!r.error&&!r.collisions&&!r.uncovered&&!r.conflicts),raster.filter(r=>r.error||r.collisions||r.uncovered||r.conflicts));
   const seek=await fixture({layout:'wave'}),images=[];for(const time of [1.5,.01,3.99,.2,3.8,1.5]){seek.renderer.frame(seek.canvas.getContext('2d'),seek.plan,time,{noHud:true,noPost:true});if(time===1.5)images.push(seek.canvas.toDataURL());}check('random seek deterministic',images[0]===images[1]);
   const immutable=JSON.stringify(seek.plan);seek.renderer.frame(seek.canvas.getContext('2d'),seek.plan,2,{noHud:true,noPost:true});check('render source/plan immutable',immutable===JSON.stringify(seek.plan)&&Object.isFrozen(seek.plan));check('shared one-pixel measurement buffer',A.bufferStats().contexts===1&&A.bufferStats().pixels===1&&A.bufferStats().perGlyphStageBuffers===0,A.bufferStats());
   // A hit must be observationally identical to a fresh measurement after
   // every consulted source field changes. Detached immutable cached programs
   // must not retain mutable source references or alias another cut's owner.
   const cacheSource=(await runBasicFixture(J,{layout:'center'},{newPath:false,fontURL})).plan,cacheCases=[
    p=>{},p=>{p.cuts[0].text='Go';p.cuts[0].lineText='Go forward';p.cuts[0].note='よみ';p.cuts[0].words=['Go'];},
    p=>{p.cuts[0].params={...p.cuts[0].params,font:'gothic_black',sx:.85,ox:.1};},
    p=>{p.W=720;p.H=720;},p=>{p.cuts[0].seed+=3;p.cuts[0].index+=101;p.cuts[0].line+=2;},
    p=>{p.style={...p.style,ghost:.2,fonts:{...p.style.fonts,body:['gothic_black']}};p.fx={...p.fx,motion:.2};},
    p=>{p.cuts[0].start+=.1;p.cuts[0].dur-=.2;p.cuts[0].inDur=.1;p.duration+=1;},
    p=>{p.cuts[0].contentScale=.8;p.cuts[0].cam='dutch';p.cuts[0].params.sub=true;p.cuts[0].lineText='another line';},
   ];let cacheMismatch=0,cacheMutated=0;const cacheStats=[];
   for(const mutate of cacheCases){const source=(await runBasicFixture(J,{layout:'center'},{newPath:false,fontURL})).plan;mutate(source);const before=JSON.stringify(source);A.clearPreparationCache();const first=J.finalizePlacementPlan(source,{basicLayouts:true}),s1=A.preparationCacheStats(),hit=J.finalizePlacementPlan(source,{basicLayouts:true}),s2=A.preparationCacheStats();A.clearPreparationCache();const uncached=J.finalizePlacementPlan(source,{basicLayouts:true});if(JSON.stringify(first)!==JSON.stringify(hit)||JSON.stringify(hit)!==JSON.stringify(uncached)||s2.hits<=s1.hits)cacheMismatch++;if(JSON.stringify(source)!==before)cacheMutated++;cacheStats.push(s2);}
   check('preparation cache differential source/font/params/geometry/owner',cacheMismatch===0&&cacheMutated===0,{cacheMismatch,cacheMutated,cases:cacheCases.length});check('preparation cache bounded storage',cacheStats.every(s=>s.entries<=s.maxEntries&&s.serializedBytes<=s.maxSerializedBytes),cacheStats.at(-1));
   const source=await runBasicFixture(J,{layout:'wave'},{newPath:false,fontURL}),old=J.finalizePlacementPlan(source.plan,{basicLayouts:true});J.metrics.clear();let stale=false;try{old&&A.validateFinal(old);}catch(e){stale=e.code==='STALE_PLACEMENT_PLAN';}check('font revision invalidates basic plan',stale);
   const fresh=await runBasicFixture(J,{layout:'wave'},{newPath:false,fontURL});let resolve;const wait=new Promise(r=>resolve=r),pending=J.finalizePlacementPlanAsync(fresh.plan,wait,{basicLayouts:true});fresh.plan.duration+=1;resolve();let asyncStale=false;try{await pending;}catch(e){asyncStale=e.code==='STALE_FINALIZATION';}check('async composition revision invalidates basic plan',asyncStale);
   return {passed:rows.every(r=>r.passed),checks:rows.length,rows,directionCounts,variants,raster};
  });
  report.compiledSHA256=compiledSHA256;report.fixtureSHA256=fixtureSHA256;console.log(JSON.stringify(report));assert.ok(report.passed,'AVOID-005 acceptance probes failed; inspect named rows');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
