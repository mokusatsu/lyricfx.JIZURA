/* Pure synthetic control contracts: no browser/renderer/ffmpeg/credential. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const H=require('./layouts-b-h03-control-review.cjs'),L=require('./layouts-b-h03-review.cjs'),T=require('./layouts-b-review.cjs'),B=require('./layouts-b-pages-bridge.cjs');
const copy=v=>structuredClone(v);
function initial(spec=H.SPECS[0],side='after',focused=false){
  const raw=H.EXPECTED.map(([line,part,text,start,slot],index)=>({index,line,part,text,group:0,start,end:9.5,dur:9.5-start,renderStart:start,slotEnd:slot===null?undefined:slot,displayEnd:9.5,groupExit:'cut',groupOutDur:0}));
  const effects=raw.map(c=>({index:c.index,layout:spec[1],cam:spec[2],enter:'cut',exit:'cut',hold:'still',treat:'none'}));
  const params=raw.map(c=>({index:c.index,params:{syntheticSource:c.index}}));
  const rawAllEffects=raw.map((c,n)=>({...effects[n],line:c.line,part:c.part,text:c.text,start:c.start,end:c.end,group:c.group}));
  const outro=[0,1].map(n=>({index:n+3,line:-2,part:'outro_'+(n+1),text:'',layout:'outro',cam:'push',enter:n?'cut':'blur',exit:n?'blur':'cut',hold:n?'still':'jitter',treat:'none',start:[9.5,10.75][n],end:[10.75,12][n],group:undefined}));rawAllEffects.push(...outro);
  const all=[...raw.map((c,n)=>({...c,...effects[n],params:params[n].params,insertedAtPlayhead:false})),...outro];
  return {profile:H.PROFILE,controlWindowProof:copy(H.CONTROL_WINDOW_PROOF),conditions:H.conditions(spec),stage:[3200,1080],planStage:[3200,1080],planDuration:12,
    project:{seed:704,lyrics:'{\n[00:00.000]風の先へ\n[00:04.500]光を越えて\n[00:08.000]夢の続き\n}',overrides:Object.fromEntries(effects.map(e=>[e.index,{layout:e.layout,cam:e.cam,single:true,enter:'cut',exit:'cut',hold:'still',treat:'none',decor:[],bg:'none'}]))},
    rawLifetime:raw,rawAllCuts:JSON.parse(JSON.stringify(all)),rawAllEffects,excludedNativeEffects:outro,sourceParams:params,actualEffects:effects,
    sourceOccurrences:H.LINES.map((text,index)=>({index,line:index,part:0,text,source:text,ranges:[...text].map((ch,n)=>({ch,start:n,end:n+1}))})),
    retainedCutIndices:[0,1,2],geometryLifetimeUnchanged:true,newAPI:side==='after',regions:[{center:{x:.5,y:.42},radius:.2,start:0,end:null}],
    fontCoverage:[{id:'synthetic',missing:[]}],fontAudit:{faces:Array.from({length:8},(_,n)=>({id:'f'+n,status:'loaded'}))},
    media:{cuts:[{start:0,end:12,seed:9,placement:{cx:.5,cy:.5}}]},foreground:{cuts:[{start:0,end:12,seed:10,placement:{cx:.82,cy:.18}}]},
    cuts:raw.map((c,n)=>({...c,...effects[n],...(focused?{sourceStart:c.start,sourceParamsUnchanged:true}:{}),area:null,params:params[n].params,safety:side==='after'?'certified-bounded-adapter':'unsupported',units:side==='after'?[{segments:[{status:'safe'}]}]:[]}))};
}
function frame(time,side='after',conflict=false){
  const text=H.LINES[0],polygon=conflict?[[100,100],[110,100],[110,110],[100,110]]:[[1,1],[10,1],[10,10],[1,10]];
  const f={time,rgbaSHA256:T.sha('composite'+time),activeCuts:[0],layers:Object.fromEntries(['media','foreground'].map(layer=>[layer,{rgbaSHA256:T.sha(layer+time),pixels:100,bounds:[100,100,120,120],cut:{layer,time}}])),
    decoded:['background','foreground'].map(name=>({target:time,currentTime:time,readyState:2,seeking:false,width:640,height:360,prepareDidNotReseek:true,seekCount:1,kind:'fresh-decoded-seek',witness:{epoch:1,seekCount:1,src:'https://example.test/media/'+name+'.mp4',currentSrc:'https://example.test/media/'+name+'.mp4',target:time,currentTime:time,paused:true,seeking:false,readyState:2},proof:{seekedAt:time,decodedAfterSeek:{mediaTime:time,presentedFrames:1}}})),
    emitted:[{cut:0,text,font:'synthetic',role:side==='after'?'primary':null,owner:'synthetic-primary',glyphs:[...text].map(ch=>({cp:ch.codePointAt(0),font:'synthetic',face:'f0'})),source:side==='after'?{start:0,end:4,text,originalCodepointOffsets:[0,1,2,3]}:null}],
    observations:side==='after'?[{cut:0,pass:'main',measurementSupported:true,envelopeCovered:true,safety:'safe',polygons:[polygon]}]:[]};
  f.foregroundClearance=side==='after'?H.foregroundSupport(f):null;return f;
}
function focused(){
  return {profile:H.PROFILE,controlWindowProof:copy(H.CONTROL_WINDOW_PROOF),mainBundle:{manifestSHA256:T.sha('synthetic-main')},endInputsUnchanged:true,warnings:[],
    negative:H.SPECS.flatMap(spec=>H.SIDES.map(side=>({spec:{layout:spec[1],camera:spec[2]},side,positionDetected:true,timeDetected:true}))),
    rows:H.SPECS.map((spec,n)=>({spec:{layout:spec[1],camera:spec[2]},engines:Object.fromEntries(H.SIDES.map(side=>{const frames=H.SEEK.map(t=>frame(t,side,n===2));return [side,{initial:initial(spec,side,true),frames,circleStatus:side==='after'?'safe':undefined,foregroundClearance:side==='after'?frames.map(f=>H.foregroundSupport(f)):[],status:side==='before'?'native-fullstage':n===2?'insufficient':'safe'}];}))}))};
}
function linkage(media=true) {
  const faces=Array.from({length:8},(_,i)=>({id:'f'+i,url:'fonts/f'+i+'.otf',sourceSHA256:T.sha('synthetic-font'+i)}));
  const assets={'sources/before/index.html':H.BEFORE_SHA,'sources/after/index.html':T.sha('synthetic-after'),'sources/after/en/index.html':T.sha('synthetic-en')};
  for(const f of faces)assets[f.url]=f.sourceSHA256;
  const main={schema:'avoid007-native-v1',taskID:'AVOID-007',baseline:T.BASE,buildID:'synthetic-main',assets,fixtureOptions:{fonts:{faces,assignments:{sans:'f0',symbol:'f7'}}},
    cases:T.LAYOUTS.map((layout,n)=>({id:'main-'+layout,hids:n===0?B.HIDS:[B.HIDS[0]],conditions:{layout,W:1920,H:1080,cx:.5,cy:.42,radius:.2}}))};
  const mainBytes=Buffer.from(JSON.stringify(main));
  const m={profile:H.PROFILE,controlWindowProof:copy(H.CONTROL_WINDOW_PROOF),controlMetadata:{path:'evidence/control-metadata.json',sha256:H.CONTROL_METADATA_SHA},schema:'avoid007-h03-native-v1',taskID:'AVOID-007',buildID:'synthetic-h03',baseline:T.BASE,
    mainBundle:{manifestSHA256:T.sha(mainBytes)},capture:{...H.CLOCK},sources:{before:{html:'sources/before/index.html',sha256:assets['sources/before/index.html']},after:{html:'sources/after/index.html',sha256:assets['sources/after/index.html']},
      products:{jaSHA256:assets['sources/after/index.html'],enSHA256:assets['sources/after/en/index.html'],en:'sources/after/en/index.html'}},
    assets:{...assets,'evidence/control-metadata.json':H.CONTROL_METADATA_SHA,'evidence/fonts.json':T.sha('synthetic-font-descriptor'),'evidence/focused.json':T.sha('synthetic-focused')},
    fonts:faces.map(f=>({path:f.url,sha256:f.sourceSHA256})),fixtureOptions:structuredClone(main.fixtureOptions),
    fontManifest:{path:'evidence/fonts.json',sha256:T.sha('synthetic-font-descriptor')},focusedReceipt:{path:'evidence/focused.json',sha256:T.sha('synthetic-focused')},
    cases:H.SPECS.map((s,n)=>({id:s[0],hids:['AVOID-007-H03'],conditions:H.conditions(s),status:['safe','insufficient','unsupported'][n]})),
    status:media?'native media acquired; browser/public verification separate':'diagnostic-only-no-approved-media'};
  if(media){m.cases[0].media={};for(const side of H.SIDES){const video='videos/'+side+'.mp4',png='images/'+side+'.png';m.assets[video]=T.sha('not-real-mp4-'+side);m.assets[png]=T.sha('not-real-png-'+side);m.cases[0].media[side]={video,keyImages:[png]};}}
  return {mainBytes,m,raw:()=>Buffer.from(JSON.stringify(m))};
}


test('natural three full-line cuts, all five raw cuts, ordinary overrides and true retained interval are exact',()=>{
  H.initialGuard(initial(),H.conditions(H.SPECS[0]),'after');H.initialGuard(initial(H.SPECS[0],'before'),H.conditions(H.SPECS[0]),'before');
  for(const mutate of [i=>i.profile='old',i=>i.rawLifetime.pop(),i=>i.retainedCutIndices.pop(),i=>i.rawLifetime[0].end=4.5,i=>i.rawLifetime[0].slotEnd=4.5,i=>i.project.overrides[0].single=false,i=>i.project.lyrics=i.project.lyrics.replace('04.500','03.000'),i=>i.rawAllCuts.pop(),i=>i.excludedNativeEffects[0].text='x',i=>i.rawAllEffects[3].start=9,i=>i.sourceOccurrences[0].ranges[0].end=2,i=>i.sourceParams[0].params.changed=true,i=>i.controlWindowProof.cells[1].active.push(1),i=>i.controlWindowProof.postWindowRetention=0,i=>i.cuts[0].units=[]]){const i=initial();mutate(i);assert.throws(()=>H.initialGuard(i,H.conditions(H.SPECS[0]),'after'));}
});
test('actual decoded witnesses, single owner, circle and independent foreground support are required at every captured frame',()=>{
  H.frameGuard(frame(4.25),initial(),'after',4.25);
  for(const mutate of [f=>f.activeCuts.push(1),f=>f.activeCuts=[],f=>f.decoded[0].kind='unproved',f=>f.decoded[0].witness.target=0,f=>f.decoded[0].prepareDidNotReseek=false,f=>f.decoded[0].witness.seeking=true,f=>f.observations[0].safety='conflict',f=>f.observations[0].polygons=[[]],f=>f.emitted[0].source.text='wrong',f=>f.layers.foreground.bounds=[0,0,10,10]]){const f=frame(4);mutate(f);assert.throws(()=>H.frameGuard(f,initial(),'after',4));}
  assert.throws(()=>H.frameGuard(frame(4,'after',true),initial(),'after',4));assert.throws(()=>H.frameGuard(frame(4.5),initial(),'after',4.5));
});
test('all three focused diagnoses remain; circle-safe credits with foreground collisions cannot be promoted',()=>{
  const r=focused(),hash=r.mainBundle.manifestSHA256;assert.deepEqual(H.focusedRows(r,hash).map(c=>c.status),['safe','safe','insufficient']);
  for(const mutate of [r=>r.rows.pop(),r=>r.profile=undefined,r=>r.rows[2].engines.after.status='safe',r=>r.rows[2].engines.after.foregroundClearance.forEach(f=>f.conflicts=0),r=>r.rows[0].engines.after.circleStatus='unsupported',r=>r.negative.pop(),r=>r.negative[0].timeDetected=false,r=>r.rows[0].engines.after.initial.rawAllCuts[0].params.changed=true]){const bad=focused();mutate(bad);assert.throws(()=>H.focusedRows(bad,hash));}
});
test('control-only five JSON omissions are directional, sealed, nonmutating, and not old schema compatible',()=>{
  const fresh=initial(),original=JSON.parse(JSON.stringify(fresh)),saved=copy(fresh);const boundary=H.serializedInitialGuard(original,fresh);H.serializationBoundaryGuard(boundary);assert.deepEqual(fresh,saved);assert.equal(boundary.omissions.length,5);
  assert.throws(()=>H.pairGuard(original,fresh));assert.throws(()=>L.serializationBoundaryGuard(boundary));
  for(const [field,index,key]of H.SERIALIZED_OMISSIONS)for(const value of [0,null,1]){const changed=copy(fresh);changed[field][index][key]=value;assert.throws(()=>H.serializedInitialGuard(original,changed));}
  for(const mutate of [f=>f.rawLifetime[1].other=undefined,f=>f.rawAllEffects[3].other=undefined,f=>f.rawAllCuts[0].insertedAtPlayhead=true,f=>f.retainedCutIndices.push(3),f=>f.retainedCutIndices.pop()]){const changed=copy(fresh);mutate(changed);assert.throws(()=>H.serializedInitialGuard(original,changed));}
  for(const [field,index,key]of H.SERIALIZED_OMISSIONS){const changed=copy(original);changed[field][index][key]=undefined;assert.throws(()=>H.serializedInitialGuard(changed,fresh));}
});
test('bridge admits new window only under the exact profile; legacy clock remains strict',()=>{
  const f=linkage();assert.equal(B.verifyH03Linkage(f.mainBytes,f.raw(),[f.m.cases[0].id]).caseIDs.length,1);H.linkageGuard(f.mainBytes,f.raw());
  for(const profile of [undefined,null,'old']){const bad=linkage();bad.m.profile=profile;assert.throws(()=>B.verifyH03Linkage(bad.mainBytes,bad.raw(),[bad.m.cases[0].id]));}
  const old=linkage();delete old.m.profile;old.m.capture={absoluteStart:3,absoluteEnd:7,fps:24,frames:96,duration:4};assert.equal(B.verifyH03Linkage(old.mainBytes,old.raw(),[old.m.cases[0].id]).caseIDs.length,1);assert.throws(()=>H.linkageGuard(old.mainBytes,old.raw()));
  old.m.profile=H.PROFILE;assert.throws(()=>B.verifyH03Linkage(old.mainBytes,old.raw(),[old.m.cases[0].id]));
});
test('UI defaults and clocks stay inside the half-open new window and all statuses remain bilingual',()=>{
  const html=H.liveHTML();assert.ok(html.includes('value="2.0"'));assert.ok(!html.includes('max="7"'));assert.ok(!html.includes('6.5'));assert.ok(H.liveControls.toString().includes('seek(.5 +'));
  const m=linkage().m;m.cases[0].records={before:{},after:{}};m.cases[1].status='safe';
  for(const en of [false,true]){const page=H.pageHTML(m,en);assert.ok(page.includes('0.5'));assert.ok(!page.includes('eight retained')&&!page.includes('eight native'));assert.ok(!page.includes('元の8'));assert.ok(page.includes('h03-credits-dutch'));assert.ok(page.includes(en?'not selected for this comparison':'この比較では未採用'));assert.ok(page.includes(en?'it does not mean the appearance passed':'見え方の合格を意味しません'));assert.ok(page.includes(en?'passed a separate visual review':'別の視覚確認を通過した採用例のみ'));assert.ok(!page.includes('awaiting acquisition approval')&&!page.includes('取得承認待ち'));}
});
test('native adapter executes exactly one absolute native frame and copied sibling module imports remain portable',async()=>{
  const base=initial(),plan={W:3200,H:1080,duration:12,cuts:base.cuts,lyricAvoidanceIndex:{regions:base.regions},media:base.media,foreground:base.foreground};let calls=0;
  const fixture={...base,plan,fonts:base.fontAudit,canvas:{width:3200,height:1080,style:{},toDataURL:()=> 'data:image/png;base64,U1lOVEhFVElD'},frame:async t=>{calls++;return frame(t);}};
  const sandbox={J:{placement:{layoutsB25:true}},runLayoutsBH03:async()=>fixture,structuredClone,URL,document:{body:{append(){}}},H03_FOREGROUND:H.foregroundSupport};sandbox.window=sandbox;
  const init=require('node:vm').runInNewContext('('+H.runtimeInit.toString()+')',sandbox);await init({profile:H.PROFILE,baseURL:'https://example.test/bundle/',conditions:base.conditions,side:'after',media:[],fixtureOptions:{fonts:{faces:[]}}});const f=await sandbox.H03_FRAME(3.75);assert.equal(calls,1);assert.equal(f.time,3.75);assert.equal(f.foregroundClearance.conflicts,0);await assert.rejects(()=>sandbox.H03_FRAME(4.5));assert.equal(calls,1);
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'h03-control-module-'));try{for(const name of ['layouts-b-h03-control-review.cjs','layouts-b-review.cjs','layouts-b-pages-bridge.cjs'])fs.copyFileSync(path.join(__dirname,name),path.join(dir,name));assert.equal(require(path.join(dir,'layouts-b-h03-control-review.cjs')).PROFILE,H.PROFILE);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});

const actualArg=process.argv.indexOf('--focused');
if(actualArg>=0)test('approved actual focused01 independently qualifies two safe and one foreground-insufficient outcome',()=>{
  const filename=process.argv[actualArg+1],raw=fs.readFileSync(filename),before=T.sha(raw);
  assert.equal(before,'2be224b1515a4fca7e8150018bfd783d8b57fe9adb96b4825c349cbd59524acb');
  const receipt=JSON.parse(raw),rows=H.focusedRows(receipt,receipt.mainBundle.manifestSHA256);
  assert.deepEqual(rows.map(r=>r.status),['safe','safe','insufficient']);
  const conflicts=receipt.rows.map(row=>row.engines.after.frames.map(f=>H.foregroundSupport(f).conflicts));
  assert.deepEqual(conflicts,[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[23,18,17,17,17,17,18,23]]);
  assert.equal(T.sha(fs.readFileSync(filename)),before);
  console.log('# actual read-only focused SHA '+before+'; statuses '+rows.map(r=>r.id+':'+r.status).join(',')+'; circle and foreground recomputed; no browser/capture');
});
