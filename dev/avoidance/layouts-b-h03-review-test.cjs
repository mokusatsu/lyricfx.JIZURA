/* Pure synthetic contracts only: no Canvas, ffmpeg, browser, request or real fonts. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const H = require('./layouts-b-h03-review.cjs');
const T = require('./layouts-b-review.cjs');
const B = require('./layouts-b-pages-bridge.cjs');
const startup = [__filename, require.resolve('./layouts-b-h03-review.cjs'), require.resolve('./layouts-b-review.cjs'), require.resolve('./layouts-b-pages-bridge.cjs')]
  .map(file => ({file, sha256:T.sha(fs.readFileSync(file))}));
console.log('# H03 review startup ' + JSON.stringify(startup.map(p=>({name:path.basename(p.file),sha256:p.sha256}))));
function initial(spec=H.SPECS[0], side='after', focused=false) {
  const raw = H.EXPECTED.map(([line,part,text,start,slot],index)=>({index,line,part,text,group:0,start,end:7.5,dur:7.5-start,renderStart:start,
    ...(slot===null?{}:{slotEnd:slot}),displayEnd:7.5,groupExit:'cut',groupOutDur:0}));
  const sourceParams=raw.map(c=>({index:c.index,params:{syntheticClock:c.index}}));
  const occurrences=H.EXPECTED.map(([line,part,text,start,slot,from,to],index)=>({index,line,part,copy:part===2?'recap':'fragment',source:H.LINES[line],start:from,end:to,text,
    occurrences:[...text].map((ch,j)=>({ch,start:from+j,end:from+j+1}))}));
  return {conditions:H.conditions(spec),stage:[3200,1080],planStage:[3200,1080],planDuration:12,
    project:{seed:704,lyrics:'{\n[00:00]風の先へ\n[00:03]光を越えて\n[00:06]夢の続き\n}'},
    rawLifetime:raw,sourceParams,sourceOccurrences:occurrences,
    actualEffects:raw.map(c=>({index:c.index,layout:spec[1],cam:spec[2],enter:'cut',exit:'cut',hold:'still',treat:'none'})),
    retainedCutIndices:[0,1,2,3,4,5,6,7],geometryLifetimeUnchanged:true,newAPI:side==='after',
    regions:[{center:{x:.5,y:.42},radius:.2,start:0,end:null}],
    fontCoverage:[{id:'synthetic',missing:[]}],fontAudit:{faces:Array.from({length:8},(_,i)=>({id:'f'+i,status:'loaded'}))},
    media:{cuts:[{id:'synthetic-bg',start:0,end:12,seed:9,placement:{cx:.5,cy:.5}}]},foreground:{cuts:[{id:'synthetic-fg',start:0,end:12,seed:10,placement:{cx:.8,cy:.2}}]},
    cuts:raw.map(c=>({...c,...(focused?{sourceStart:c.start,sourceParamsUnchanged:true}:{}),area:null,params:sourceParams[c.index].params,
      safety:side==='after'?'certified-bounded-adapter':'unsupported',units:side==='after'?[{segments:[{status:'safe'}]}]:[]}))};
}
function proof(time, i=initial(), side='after') {
  const active=i.rawLifetime.filter(c=>c.start<=time&&time<7.5).map(c=>c.index);
  return {time,rgbaSHA256:T.sha('synthetic-composite-'+time),activeCuts:active,
    layers:Object.fromEntries(['media','foreground'].map(layer=>[layer,{rgbaSHA256:T.sha(layer+time),pixels:10,bounds:[0,0,1,1],cut:{id:layer,time}}])),
    decoded:Array.from({length:2},()=>({target:time,currentTime:time,readyState:2,seeking:false,width:640,height:360,prepareDidNotReseek:true,proof:{seekedAt:time,decodedAfterSeek:{mediaTime:time,presentedFrames:1}}})),
    emitted:active.map(cut=>{const text=i.rawLifetime[cut].text;return {cut,text,font:'synthetic',role:'primary',owner:'synthetic-primary',glyphs:[...text].map(ch=>({cp:ch.codePointAt(0),font:'synthetic',face:'f0'})),
      source:side==='after'?{start:0,end:[...text].length,text,originalCodepointOffsets:[...text].map((c,n)=>n)}:null};}),
    observations:side==='after'?active.map(cut=>({cut,pass:'main',measurementSupported:true,envelopeCovered:true,safety:'safe'})):[]};
}
function focused() {
  return {mainBundle:{manifestSHA256:T.sha('synthetic-main')},endInputsUnchanged:true,warnings:[],negative:H.SPECS.flatMap(spec=>H.SIDES.map(side=>({spec:{layout:spec[1],camera:spec[2]},side,positionDetected:true,timeDetected:true}))),
    rows:H.SPECS.map((s,n)=>({spec:{layout:s[1],camera:s[2]},engines:Object.fromEntries(H.SIDES.map(side=>{
      const i=initial(s,side,true);
      if(side==='after'&&n===1){i.cuts[0].safety='insufficient-space';i.cuts[0].units[0].segments[0].status='conflict';}
      if(side==='after'&&n===2){i.cuts[0].safety='unsupported';i.cuts[0].units=[];}
      return [side,{initial:i,status:side==='before'?'native-fullstage':['safe','insufficient','unsupported'][n],frames:H.SEEK.map(t=>proof(t,i,side))}];
    }))}))};
}
function linkage(media=true) {
  const faces=Array.from({length:8},(_,i)=>({id:'f'+i,url:'fonts/f'+i+'.otf',sourceSHA256:T.sha('synthetic-font'+i)}));
  const assets={'sources/before/index.html':H.BEFORE_SHA,'sources/after/index.html':T.sha('synthetic-after'),'sources/after/en/index.html':T.sha('synthetic-en')};
  for(const f of faces)assets[f.url]=f.sourceSHA256;
  const main={schema:'avoid007-native-v1',taskID:'AVOID-007',baseline:T.BASE,buildID:'synthetic-main',assets,fixtureOptions:{fonts:{faces,assignments:{sans:'f0',symbol:'f7'}}},
    cases:T.LAYOUTS.map((layout,n)=>({id:'main-'+layout,hids:n===0?B.HIDS:[B.HIDS[0]],conditions:{layout,W:1920,H:1080,cx:.5,cy:.42,radius:.2}}))};
  const mainBytes=Buffer.from(JSON.stringify(main));
  const m={schema:'avoid007-h03-native-v1',taskID:'AVOID-007',buildID:'synthetic-h03',baseline:T.BASE,
    mainBundle:{manifestSHA256:T.sha(mainBytes)},capture:{...H.CLOCK},sources:{before:{html:'sources/before/index.html',sha256:assets['sources/before/index.html']},after:{html:'sources/after/index.html',sha256:assets['sources/after/index.html']},
      products:{jaSHA256:assets['sources/after/index.html'],enSHA256:assets['sources/after/en/index.html'],en:'sources/after/en/index.html'}},
    assets:{...assets,'evidence/fonts.json':T.sha('synthetic-font-descriptor'),'evidence/focused.json':T.sha('synthetic-focused')},
    fonts:faces.map(f=>({path:f.url,sha256:f.sourceSHA256})),fixtureOptions:structuredClone(main.fixtureOptions),
    fontManifest:{path:'evidence/fonts.json',sha256:T.sha('synthetic-font-descriptor')},focusedReceipt:{path:'evidence/focused.json',sha256:T.sha('synthetic-focused')},
    cases:H.SPECS.map((s,n)=>({id:s[0],hids:['AVOID-007-H03'],conditions:H.conditions(s),status:['safe','insufficient','unsupported'][n]})),
    status:media?'native media acquired; browser/public verification separate':'diagnostic-only-no-approved-media'};
  if(media){m.cases[0].media={};for(const side of H.SIDES){const video='videos/'+side+'.mp4',png='images/'+side+'.png';m.assets[video]=T.sha('not-real-mp4-'+side);m.assets[png]=T.sha('not-real-png-'+side);m.cases[0].media[side]={video,keyImages:[png]};}}
  return {mainBytes,m,raw:()=>Buffer.from(JSON.stringify(m))};
}

test('eight independent native lifetimes, source occurrences and params remain exact',()=>{
  H.initialGuard(initial(),H.conditions(H.SPECS[0]),'after');H.initialGuard(initial(H.SPECS[0],'before'),H.conditions(H.SPECS[0]),'before');
  for(const mutate of [i=>i.rawLifetime.pop(),i=>i.cuts[1].index=0,i=>i.actualEffects[1].index=0,i=>i.rawLifetime[0].end=12,i=>i.rawLifetime[0].start=.2,i=>i.cuts[0].params={},i=>i.retainedCutIndices.pop(),i=>i.sourceOccurrences[0].start=1,i=>i.actualEffects[0].cam='push',i=>i.regions[0].center.y=.5,i=>i.cuts[0].units=[]]){
    const i=initial();mutate(i);assert.throws(()=>H.initialGuard(i,H.conditions(H.SPECS[0]),'after'));
  }
});
test('frame proofs require decoded seek, no reseek, every active primary and source mapping',()=>{
  const i=initial(),time=4.5;H.frameGuard(proof(time,i),i,'after',time);
  for(const mutate of [f=>f.decoded[0].seeking=true,f=>f.decoded[0].prepareDidNotReseek=false,f=>f.decoded[0].target=0,f=>f.decoded[0].proof.decodedAfterSeek.mediaTime=0,f=>f.layers.media.pixels=0,f=>f.activeCuts.pop(),f=>f.observations.pop(),f=>f.observations[0].safety='conflict',f=>delete f.emitted[0].role,f=>f.emitted[0].source.text='wrong',f=>f.emitted[0].source.originalCodepointOffsets=[99]]){
    const f=proof(time,i);mutate(f);assert.throws(()=>H.frameGuard(f,i,'after',time));
  }
});
test('completed focused receipt preserves all three outcomes and rejects missing proof/partial success',()=>{
  const r=focused(),hash=r.mainBundle.manifestSHA256;assert.deepEqual(H.focusedRows(r,hash).map(c=>c.status),['safe','insufficient','unsupported']);
  for(const mutate of [r=>r.rows[0].engines.after.status='insufficient',r=>r.rows[1].engines.after.status='unsupported',r=>r.rows[2].engines.after.status='safe',r=>delete r.endInputsUnchanged,r=>delete r.negative,r=>r.negative[0].positionDetected=false,r=>r.negative[0].timeDetected=false,r=>r.negative[1]=r.negative[0],r=>r.rows.pop(),r=>r.rows[0].engines.after.initial.cuts[0].units=[],r=>delete r.rows[0].engines.before.initial.media,r=>r.rows[0].engines.after.frames[0].decoded[0].prepareDidNotReseek=false,r=>r.rows[0].engines.after.initial.sourceParams[0].params={changed:true},r=>r.rows[0].engines.after.frames[0].layers.foreground.rgbaSHA256=T.sha('moved')]){
    const changed=focused();mutate(changed);assert.throws(()=>H.focusedRows(changed,hash));
  }
});
test('bridge schema/linkage fixes new main/EN/fonts/absolute window; no-media is diagnostic only',()=>{
  const x=linkage();assert.equal(H.linkageGuard(x.mainBytes,x.raw()).length,1);assert.equal(B.verifyH03Linkage(x.mainBytes,x.raw(),['h03-rain-panL']).caseIDs.length,1);
  for(const mutate of [m=>m.capture.absoluteStart=6,m=>m.sources.after.sha256=T.sha('old-after'),m=>m.sources.products.enSHA256=T.sha('other-en'),m=>m.fixtureOptions.fonts.assignments.sans='f7',m=>delete m.assets['fonts/f0.otf'],m=>m.cases[0].status='unsupported',m=>delete m.cases[0].media.after]){const changed=linkage();mutate(changed.m);assert.throws(()=>H.linkageGuard(changed.mainBytes,changed.raw()));}
  const zero=linkage(false);assert.equal(H.linkageGuard(zero.mainBytes,zero.raw()).length,0);zero.m.status='verified';assert.throws(()=>H.linkageGuard(zero.mainBytes,zero.raw()));
});
test('seek revisit is actual source time and mapping; stale/constant layers reject',()=>{
  const frames=H.SEEK.map(t=>proof(t));H.revisitGuard(frames);
  const changed=structuredClone(frames);changed[4].rgbaSHA256=T.sha('stale');assert.throws(()=>H.revisitGuard(changed));
  const frozen=structuredClone(frames);for(const f of frozen)f.layers.media.rgbaSHA256=T.sha('constant');assert.throws(()=>H.revisitGuard(frozen));
  const i=initial(),other=structuredClone(i);other.foreground.cuts[0].end=11;assert.throws(()=>H.pairGuard(i,other));
});
test('runtime adapter calls fixture frame once at absolute time and rejects mutation without relayout',async()=>{
  const base=initial(),plan={W:3200,H:1080,duration:12,cuts:base.cuts.map((c,n)=>({...c,...base.actualEffects[n]})),lyricAvoidanceIndex:{regions:base.regions},media:base.media,foreground:base.foreground};
  let calls=0,mutate=false;const fixture={...base,plan,project:base.project,fonts:base.fontAudit,fontCoverage:base.fontCoverage,canvas:{width:3200,height:1080,style:{},toDataURL:()=> 'data:image/png;base64,U1lOVEhFVElD'},
    frame:async t=>{calls++;if(mutate)plan.cuts[0].params.changed=true;return proof(t,base);}};
  const vm=require('node:vm');
  const sandbox={J:{placement:{layoutsB25:true}},runLayoutsBH03:async()=>fixture,structuredClone,URL,document:{body:{append(){}}}};
  sandbox.window=sandbox; // Real browser window properties are global bindings.
  const adapter=vm.runInNewContext('('+H.runtimeInit.toString()+')',sandbox);
  await adapter({baseURL:'https://example.test/bundle/',conditions:base.conditions,side:'after',media:[],fixtureOptions:{fonts:{faces:[]}}});
  const f=await sandbox.H03_FRAME(3.125);assert.equal(f.time,3.125);assert.equal(calls,1);assert.ok(f.png.startsWith('data:image/png;'));
  mutate=true;await assert.rejects(()=>sandbox.H03_FRAME(3.25),/mutated native/);assert.equal(calls,2);
});
test('quality failure marker/full counters and incomplete phase evidence cannot pass',()=>{
  const p={ended:true,decoded:96,currentTime:4,dropped:0,corrupt:0,startFrame:{seekedAt:0,decodedAfterSeek:{mediaTime:0}}};H.playbackGuard(p);
  for(const mutate of [p=>p.failure='media-error',p=>p.decoded=91,p=>p.dropped=1,p=>p.corrupt=1,p=>p.ended=false]){const bad=structuredClone(p);mutate(bad);assert.throws(()=>H.playbackGuard(bad));}
  assert.throws(()=>H.completionGuard({phases:[]},[],[]),/diagnostic-only/);
  assert.throws(()=>H.completionGuard({phases:[]},[{id:H.SPECS[0][0]}],[]));
});
test('bilingual comparison keeps all outcomes without promoting unsupported to acquired media',()=>{
  const x=linkage();x.m.cases[0].records={before:{},after:{}};
  for(const en of [false,true]){const html=H.pageHTML(x.m,en);assert.ok(html.includes('AVOID-007-H03'));assert.ok(html.includes('h03-credits-dutch'));assert.ok(html.includes(en?'unsupported':'未対応'));assert.ok(html.includes(en?'No MP4 acquired: unsupported':'MP4未取得：未対応のため'));assert.equal((html.match(/data-case /g)||[]).length,1);}
  for(const p of startup)assert.equal(T.sha(fs.readFileSync(p.file)),p.sha256);console.log('# H03 source pins unchanged; no native H03 capture or browser qualification');
});

test('captured sibling helpers import outside the repository without external runtime execution',()=>{
  const dir=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'h03-portable-'));
  try {
    fs.mkdirSync(path.join(dir,'tools'));
    for(const name of ['layouts-b-h03-review.cjs','layouts-b-review.cjs','layouts-b-pages-bridge.cjs'])fs.copyFileSync(path.join(__dirname,name),path.join(dir,'tools',name));
    // Browser dependency is loaded lazily by the copied main helper; no launch occurs.
    const imported=require(path.join(dir,'tools/layouts-b-h03-review.cjs'));
    assert.deepEqual(imported.CLOCK,H.CLOCK);assert.equal(typeof imported.validateBrowser,'function');
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});

test('completion requires every acquired side, raw asset, decoded seek and closed phase',()=>{
  const acquired=[{id:H.SPECS[0][0]}],assets=['manifest.json','videos/synthetic.mp4'];
  const inputMedia=['media','foreground'].map(layer=>({layer,path:'media/'+layer+'.mp4'}));
  assets.push(...inputMedia.map(r=>r.path));
  const report={phases:['raw-ui','playback','native-live'].map((phase,n)=>({phase,status:'closed',lifecycle:'owned',startedAt:n,closedAt:n+1})),
    raw:[{path:assets[0],status:200},{path:assets[1],status:200},{path:assets[1],range:{status:206}}],
    ui:['index.html','en.html'].flatMap(lang=>[1100,390].map(width=>({lang,width,controls:true,cases:1,pairPlayback:[{case:acquired[0].id,started:[0,1].map(()=>({start:0,currentTime:.1,readyState:2,paused:false,ended:false})),paused:[true,true]}]}))),playback:[],nativeParity:[],live:[],inputPlayback:inputMedia.map(i=>inputRow(i))};
  for(const side of H.SIDES){const identity={case:acquired[0].id,side};
    report.playback.push({...identity,seeks:[1.5,.125,3.75].map(t=>({seekedAt:t,decodedAfterSeek:{mediaTime:t}})),playback:{ended:true,decoded:96,currentTime:4,dropped:0,corrupt:0,startFrame:{seekedAt:0,decodedAfterSeek:{mediaTime:0}}}});
    report.nativeParity.push({...identity,frames:T.KEYS,reverseFrames:T.KEYS.slice().reverse(),serializationBoundary:{schema:'avoid007-h03-serialized-initial-equivalence-v1',completeRawSchemaIdentity:false,omission:{path:'rawLifetime[7].slotEnd',serialized:'absent',fresh:'own-undefined',meaning:'native-unset'},mediaDifferences:[]}});
    report.live.push({...identity,width:390,canvas:[3200,1080],times:H.SEEK});
  }
  for(const input of inputMedia)report.raw.push({path:input.path,status:200},{path:input.path,range:{status:206}});
  H.completionGuard(report,acquired,assets,inputMedia);
  for(const mutate of [r=>r.inputPlayback.pop(),r=>r.inputPlayback[1]=r.inputPlayback[0],r=>r.inputPlayback[0].playback.decoded=283,r=>r.ui[0].pairPlayback[0].started[1].paused=true,r=>r.raw.pop(),r=>r.ui.pop(),r=>r.playback.pop(),r=>r.nativeParity.pop(),r=>r.live.pop(),r=>r.phases[0].status='started',r=>r.playback[0].seeks[0].decodedAfterSeek.mediaTime=0,r=>r.playback[0].playback.failure='media-error']){
    const bad=structuredClone(report);mutate(bad);assert.throws(()=>H.completionGuard(bad,acquired,assets,inputMedia));
  }
});

test('actual draw role distinguishes primary mapping from only the known rain tiled auxiliary',()=>{
  const i=initial(),f=proof(4.5,i),item=f.emitted[0];
  item.source=null;item.metadata={id:'native:synthetic:'+item.text,text:item.text,font:item.font};H.frameGuard(f,i,'after',4.5);
  item.metadata.text='wrong';assert.throws(()=>H.frameGuard(f,i,'after',4.5));
  item.role='tiledAux';item.owner='rain.background-grid';item.metadata=null;H.frameGuard(f,i,'after',4.5);
  item.owner='unapproved-grid';assert.throws(()=>H.frameGuard(f,i,'after',4.5));
});

test('focused approval is bound to prelaunch exact main, source, font, fixture, helper and input media bytes',()=>{
  const x=linkage(),main=JSON.parse(x.mainBytes),fixture=T.sha('synthetic-fixture'),helper=T.sha('synthetic-helper'),media=[T.sha('synthetic-bg'),T.sha('synthetic-fg')];
  const hashes=[T.sha(x.mainBytes),fixture,helper,...media,...Object.values(main.assets)];
  const r={startup:{pins:hashes.map((sha256,n)=>({file:'synthetic/input-'+n,sha256,bytes:1}))}};
  H.focusedInputGuard(r,x.mainBytes,main,fixture,helper,media);
  for(const mutate of [r=>delete r.startup,r=>r.startup.pins.pop(),r=>r.startup.pins[1].sha256=T.sha('other-fixture'),r=>r.startup.pins.push(r.startup.pins[0])]){
    const bad=structuredClone(r);mutate(bad);assert.throws(()=>H.focusedInputGuard(bad,x.mainBytes,main,fixture,helper,media));
  }
});

function inputRow(input={path:'media/media.mp4',layer:'media'}){
  return {...input,duration:12,frames:288,fps:24,seeks:[.5,6.5,11.5].map(t=>({seekedAt:t,decodedAfterSeek:{mediaTime:t}})),
    playback:{ended:true,currentTime:12,decoded:288,dropped:0,corrupt:0,startFrame:{seekedAt:0,decodedAfterSeek:{mediaTime:0}}},pause:{paused:true,ended:false,playing:true,seek:{seekedAt:.5,decodedAfterSeek:{mediaTime:.5}},startTime:.5,playedTime:.6,pausedTime:.6,afterWaitTime:.6,waitMs:125}};
}
test('12-second input playback keeps qualified helper body except timeout and fails closed',async()=>{
  assert.equal(H.playInputVideo.toString().replace("'timeout'),30000)","'timeout'),12000)"),T.playNativeVideo.toString());
  H.inputPlaybackGuard(inputRow());
  for(const mutate of [r=>r.playback.failure='media-error',r=>r.playback.decoded=283,r=>r.playback.dropped=1,r=>r.playback.corrupt=1,r=>r.playback.currentTime=4,r=>r.playback.startFrame.seekedAt=1,r=>r.seeks[2].decodedAfterSeek.mediaTime=1,r=>r.pause.paused=false,r=>r.pause.ended=true,r=>r.pause.playedTime=.5,r=>r.pause.afterWaitTime=.7,r=>r.pause.waitMs=0]){
    const row=inputRow();mutate(row);assert.throws(()=>H.inputPlaybackGuard(row));
  }
  let decoded=0,cancelled=0,cleared=0,timeout;
  const video={pause(){},currentTime:0,ended:false,playbackRate:1,getVideoPlaybackQuality:()=>({totalVideoFrames:decoded,droppedVideoFrames:0,corruptedVideoFrames:0}),requestVideoFrameCallback:()=>7,cancelVideoFrameCallback(id){assert.equal(id,7);cancelled++;},play(){decoded=288;this.currentTime=12;this.ended=true;queueMicrotask(()=>this.onended());return Promise.resolve();}};
  const helper=require('node:vm').runInNewContext('('+H.playInputVideo.toString()+')',{performance:{now:()=>1},setTimeout(fn,ms){timeout=ms;return 1;},clearTimeout(){cleared++;}});
  const result=await helper(video,async()=>({seekedAt:0,decodedAfterSeek:{mediaTime:0}}));
  assert.equal(timeout,30000);assert.equal(cancelled,1);assert.equal(cleared,1);assert.equal(result.ended,true);assert.equal(result.decoded,288);assert.equal(video.onended,null);assert.equal(video.onerror,null);
});
test('both review videos must be ready, progressing and then paused',async()=>{
  const videos=[0,1].map(()=>({currentTime:0,readyState:2,paused:false,ended:false,error:null}));
  const started=await require('node:vm').runInNewContext('('+H.waitPairPlayback.toString()+')',{performance:{now:()=>0},setTimeout(resolve){videos.forEach(v=>v.currentTime+=.05);queueMicrotask(resolve);}})(videos);
  const row={started,paused:[true,true]};H.pairPlaybackGuard(row);
  for(const mutate of [r=>r.started[1].paused=true,r=>r.started[1].currentTime=0,r=>r.started[1].readyState=1,r=>r.paused[1]=false]){const bad=structuredClone(row);mutate(bad);assert.throws(()=>H.pairPlaybackGuard(bad));}
  videos[1].error={};await assert.rejects(()=>H.waitPairPlayback(videos));
});

test('input pause operation proves mid-play advancement and stable time before continuous measurement',async()=>{
  let now=0,pauses=0;const video={currentTime:0,paused:true,ended:false,readyState:2,error:null,
    play(){this.paused=false;this.currentTime+=.05;return Promise.resolve();},pause(){pauses++;this.paused=true;}};
  const helper=require('node:vm').runInNewContext('('+H.pauseInputVideo.toString()+')',{performance:{now:()=>now},setTimeout(resolve,ms){now+=ms;queueMicrotask(resolve);}});
  const pause=await helper(video,async(v,target)=>{v.currentTime=target;return {seekedAt:target,decodedAfterSeek:{mediaTime:target}};});
  const row=inputRow();row.pause=pause;H.inputPlaybackGuard(row);
  assert.equal(pauses,2);assert.equal(pause.ended,false);assert.equal(pause.waitMs,125);assert.equal(pause.afterWaitTime,pause.pausedTime);
  const endedOnly=inputRow();endedOnly.pause={paused:true,ended:true,currentTime:12};assert.throws(()=>H.inputPlaybackGuard(endedOnly));
});

test('pairGuard permits only own undefined placementSeed versus absent and seals its raw direction',()=>{
  const before=initial(),after=structuredClone(before);
  before.media.cuts[0].placementSeed=undefined;before.foreground.cuts[0].placementSeed=undefined;
  const beforeCopy=structuredClone(before),afterCopy=structuredClone(after);
  const witness=H.pairGuard(before,after);
  assert.deepEqual(witness.differences,[{path:'media.cuts[0].placementSeed',before:'own-undefined',after:'absent'},{path:'foreground.cuts[0].placementSeed',before:'own-undefined',after:'absent'}]);
  assert.equal(witness.completeRawSchemaIdentity,false);assert.deepEqual(before,beforeCopy);assert.deepEqual(after,afterCopy);
  assert.equal(Object.hasOwn(before.media.cuts[0],'placementSeed'),true);assert.equal(Object.hasOwn(after.media.cuts[0],'placementSeed'),false);
  const parsedBefore=JSON.parse(JSON.stringify(before)),parsedAfter=JSON.parse(JSON.stringify(after));
  H.pairWitnessGuard(parsedBefore,parsedAfter,witness);
  assert.equal(H.pairGuard(after,before).differences[0].before,'absent');
  for(const mutate of [b=>b.media.cuts[0].placementSeed=0,b=>b.media.cuts[0].placementSeed=null,b=>b.media.cuts[0].placementSeed=7,
    b=>b.media.cuts[0].otherOptional=undefined,b=>b.media.otherOptional=undefined,b=>b.media.cuts.otherOptional=undefined,
    b=>b.media.cuts[0].seed=11,b=>b.media.cuts[0].placement.cx=.6,b=>b.media.cuts[0].start=1,
    b=>b.media.cuts[0].placement.placementSeed=undefined,b=>delete b.sourceParams,b=>delete b.media]){
    const changed=structuredClone(after);mutate(changed);assert.throws(()=>H.pairGuard(before,changed));
  }
  const changedSeed=structuredClone(after),sameSeed=structuredClone(after);changedSeed.media.cuts[0].placementSeed=0;sameSeed.media.cuts[0].placementSeed=1;
  assert.throws(()=>H.pairGuard(changedSeed,sameSeed));
  const corrupt=structuredClone(witness);corrupt.differences[0].before='absent';assert.throws(()=>H.pairWitnessGuard(parsedBefore,parsedAfter,corrupt));
});

// Exact rawLifetime JSON rows from failed native capture01 before initial.
// Full source initial SHA256: 660b080a411cd21feaf6ca794edfefe1d9f0a5c3e70a283feb8b4abd724c6dfd
const actualSavedRawLifetime = [
  {"index":0,"line":0,"part":0,"text":"風の","group":0,"start":0,"end":7.5,"dur":7.5,"renderStart":0,"slotEnd":0.9230769230769232,"displayEnd":7.5,"groupExit":"cut","groupOutDur":0},
  {"index":1,"line":0,"part":1,"text":"先へ","group":0,"start":0.9230769230769232,"end":7.5,"dur":6.576923076923077,"renderStart":0.9230769230769232,"slotEnd":1.8461538461538465,"displayEnd":7.5,"groupExit":"cut","groupOutDur":0},
  {"index":2,"line":0,"part":2,"text":"風の先へ","group":0,"start":1.8461538461538465,"end":7.5,"dur":5.653846153846153,"renderStart":1.8461538461538465,"slotEnd":3,"displayEnd":7.5,"groupExit":"cut","groupOutDur":0},
  {"index":3,"line":1,"part":0,"text":"光を","group":0,"start":3,"end":7.5,"dur":4.5,"renderStart":3,"slotEnd":3.810506566604128,"displayEnd":7.5,"groupExit":"cut","groupOutDur":0},
  {"index":4,"line":1,"part":1,"text":"越えて","group":0,"start":3.810506566604128,"end":7.5,"dur":3.689493433395872,"renderStart":3.810506566604128,"slotEnd":4.846153846153847,"displayEnd":7.5,"groupExit":"cut","groupOutDur":0},
  {"index":5,"line":1,"part":2,"text":"光を越えて","group":0,"start":4.846153846153847,"end":7.5,"dur":2.6538461538461533,"renderStart":4.846153846153847,"slotEnd":6,"displayEnd":7.5,"groupExit":"cut","groupOutDur":0},
  {"index":6,"line":2,"part":0,"text":"夢の","group":0,"start":6,"end":7.5,"dur":1.5,"renderStart":6,"slotEnd":6.75,"displayEnd":7.5,"groupExit":"cut","groupOutDur":0},
  {"index":7,"line":2,"part":1,"text":"続き","group":0,"start":6.75,"end":7.5,"dur":0.75,"renderStart":6.75,"displayEnd":7.5,"groupExit":"cut","groupOutDur":0}
];
test('serialized initial guard admits only final native unset slot omitted by JSON, without mutation',()=>{
  const source=initial();source.rawLifetime=structuredClone(actualSavedRawLifetime);
  source.cuts=source.cuts.map((cut,n)=>({...cut,...actualSavedRawLifetime[n]}));
  // Same property construction as the actual fixture rawLifetime map, including
  // slotEnd:c.slotEnd for semantic native cut7 whose slotEnd is unset.
  source.rawLifetime=source.rawLifetime.map(c=>({...c,slotEnd:c.slotEnd}));
  const original=JSON.parse(JSON.stringify(source)),fresh=structuredClone(source);
  const originalCopy=structuredClone(original),freshCopy=structuredClone(fresh);
  const boundary=H.serializedInitialGuard(original,fresh);H.serializationBoundaryGuard(boundary);
  assert.equal(Object.hasOwn(original.rawLifetime[7],'slotEnd'),false);
  assert.equal(Object.hasOwn(fresh.rawLifetime[7],'slotEnd'),true);
  assert.deepEqual(boundary.omission,{path:'rawLifetime[7].slotEnd',serialized:'absent',fresh:'own-undefined',meaning:'native-unset'});
  assert.deepEqual(original,originalCopy);assert.deepEqual(fresh,freshCopy);
  assert.throws(()=>H.pairGuard(original,fresh),'before/after guard itself remains strict for rawLifetime');
  for(const mutate of [f=>f.rawLifetime[7].slotEnd=0,f=>f.rawLifetime[7].slotEnd=null,f=>f.rawLifetime[7].slotEnd=7.5,
    f=>delete f.rawLifetime[7].slotEnd,f=>f.rawLifetime[0].slotEnd=undefined,f=>f.rawLifetime[7].otherOptional=undefined,
    f=>f.rawLifetime[6].start=6.1,f=>f.sourceParams[0].params.changed=true]){
    const changed=structuredClone(fresh);mutate(changed);assert.throws(()=>H.serializedInitialGuard(original,changed));
  }
  for(const value of [undefined,null,0,7.5]){const changed=structuredClone(original);changed.rawLifetime[7].slotEnd=value;assert.throws(()=>H.serializedInitialGuard(changed,fresh));}
  const corrupt=structuredClone(boundary);corrupt.omission.path='rawLifetime[6].slotEnd';assert.throws(()=>H.serializationBoundaryGuard(corrupt));
});
