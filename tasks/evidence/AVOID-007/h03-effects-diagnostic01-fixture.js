/* Supplemental real-group / decoded-media integration. Not the frozen B25 fixture. */
window.runLayoutsBH03=async function(J,{layout,camera,fonts,mediaURLs,newPath}){
 const lines=['風の先へ','光を越えて','夢の続き'];
 const fontCoverage=fonts.faces.filter(f=>f.id!=='symbols').map(f=>({id:f.id,missing:[...new Set(lines.join(''))].filter(ch=>!f.codepoints.includes(ch.codePointAt(0)))}));
 if(fontCoverage.some(f=>f.missing.length))throw Error('H03 subset missing input characters');
 const warm=await runLayoutsBFixture(J,{layout:'crossBands',W:3200,H:1080,text:lines[0]},{fonts,newPath:false,renderInitial:false,exportDataURL:false});
 const p=J.defaultProject();p.seed=704;p.videoSize={w:3200,h:1080};p.title='';p.lyrics=['{',...lines.map((s,i)=>`[00:0${i*3}]${s}`),'}'].join('\n');p.durationOverride=12;p.anticipation=false;
 p.lyricEffects={autoPlacement:true,avoidCenter:true,avoidForeground:false,randomBlend:false,randomOpacity:false};p.lyricAvoidance={version:1,regions:[{id:'h03',start:0,end:null,center:{x:.5,y:.42},radius:.2}]};
 p.overrides=Object.fromEntries([0,1,2].map(i=>[i,{layout,cam:camera,enter:'cut',exit:'cut',hold:'still',treat:'none',decor:[],bg:'none'}]));
 const videos=[];
 for(const [i,layer]of ['media','foreground'].entries()){
  const v=document.createElement('video');v.muted=true;v.preload='auto';v.playsInline=true;v.src=mediaURLs[i];v.width=160;v.height=90;v.style.cssText='position:fixed;right:0;top:'+i*90+'px;width:160px;height:90px';document.body.append(v);v.h03SeekCount=0;v.addEventListener('seeking',()=>v.h03SeekCount++);
  await new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=()=>reject(Error('H03 input video load'));v.load();});
  if(v.videoWidth!==640||v.videoHeight!==360||v.duration<11.99)throw Error('H03 input video metadata');
  const id='h03-'+layer;J.mediaAssets.set(id,{element:v,type:'video'});videos.push(v);
  p[layer]={...J.normalizeMedia(null),items:[{id,type:'video',name:id+'.mp4',width:640,height:360,duration:12}],manualCuts:true,cutCount:1,timing:{lineTimes:{0:0}},opacity:100,cutOverrides:{0:{itemId:id,layout:'cover',technique:'none',enter:'cut',exit:'cut',entrance:'none',departure:'none',hold:'still',videoLoop:false,...(layer==='foreground'?{placement:{cx:.82,cy:.18,w:.22,h:.22,angle:0,lockAspect:false}}:{})}}};
 }
 let plan=J.plan(p);const rawLifetime=plan.cuts.filter(c=>Number.isInteger(c.part)&&c.line>=0).map(c=>({index:c.index,line:c.line,part:c.part,text:c.text,group:c.group,start:c.start,end:c.end,dur:c.dur,renderStart:c.renderStart,slotEnd:c.slotEnd,displayEnd:c.displayEnd,groupExit:c.groupExit,groupOutDur:c.groupOutDur}));
 window.layoutsBH03PlanDiagnostic={rawLifetime,retainedCutIndices:[...plan.retainedCutIndices],sourceParams:plan.cuts.filter(c=>Number.isInteger(c.part)&&c.line>=0).map(c=>({index:c.index,params:JSON.parse(JSON.stringify(c.params))})),parsed:J.parseLyrics(p.lyrics),project:p};
 // Fixed input's native split/recap identities and clock expectations, derived
 // independently from the e96 native-plan diagnostic; never extend these cuts.
 const expectedRows=[[0,0,'風の',0,12/13,0,2],[0,1,'先へ',12/13,24/13,2,4],[0,2,'風の先へ',24/13,3,0,4],[1,0,'光を',3,3.810506566604128,0,2],[1,1,'越えて',3.810506566604128,4.846153846153847,2,5],[1,2,'光を越えて',4.846153846153847,6,0,5],[2,0,'夢の',6,6.75,0,2],[2,1,'続き',6.75,null,2,4]],lineSources=['風の先へ','光を越えて','夢の続き'];
 if(rawLifetime.length!==8||rawLifetime.some((c,i)=>{const [line,part,text,start,slot]=expectedRows[i];return c.index!==i||c.line!==line||c.part!==part||c.text!==text||c.group!==0||Math.abs(c.start-start)>1e-9||c.end!==7.5||c.displayEnd!==7.5||Math.abs(c.dur-(7.5-start))>1e-9||c.renderStart!==c.start||c.groupExit!=='cut'||c.groupOutDur!==0||(slot===null?c.slotEnd!=null:Math.abs(c.slotEnd-slot)>1e-9);})||JSON.stringify([...plan.retainedCutIndices])!==JSON.stringify([0,1,2,3,4,5,6,7]))throw Error('H03 actual eight-cut source/clock/retained identities differ; native diagnostic preserved');
 const sourceOccurrences=expectedRows.map(([line,part,text,start,slot,from,to],index)=>({index,line,part,copy:part===2?'recap':'fragment',source:lineSources[line],start:from,end:to,text,occurrences:[...text].map((ch,j)=>({ch,start:from+j,end:from+j+1}))}));
 if(sourceOccurrences.some(r=>[...r.source].slice(r.start,r.end).join('')!==r.text))throw Error('H03 expected source occurrence table invalid');
 const actualEffects=plan.cuts.map(c=>({index:c.index,line:c.line,part:c.part,text:c.text,layout:c.layout,cam:c.cam,enter:c.enter,exit:c.exit,hold:c.hold,treat:c.treat})); window.layoutsBH03EffectsDiagnostic={...window.layoutsBH03PlanDiagnostic,actualEffects,project:p,rawCuts:plan.cuts};
 if(actualEffects.some(c=>c.layout!==layout||c.cam!==camera||c.enter!=='cut'||c.exit!=='cut'||c.hold!=='still'||c.treat!=='none'))throw Error('H03 native eight-cut case effects differ');
 const retainedCutIndices=[...plan.retainedCutIndices],sourceParams=plan.cuts.filter(c=>Number.isInteger(c.part)&&c.line>=0).map(c=>({index:c.index,params:JSON.parse(JSON.stringify(c.params))}));
 plan.W=3200;plan.H=1080;plan.duration=12;plan.events=[];plan.beats=[];plan.hud=false;plan.style=warm.plan.style;plan.fx=warm.plan.fx;
 // Explicit full-stage fixture geometry; source lifetime and native group clocks
 // above remain actual J.plan values, rather than hand-extended displayEnd fields.
 plan.cuts=plan.cuts.filter(c=>Number.isInteger(c.part)&&c.line>=0);
 for(const c of plan.cuts){c.area=null;c.areaMode='auto';c.contentScale=1;c.motionScale=1;c.opacity=100;c.blend='normal';c.camP={a:camera==='dutch'?3.5:.022,dir:1};if(JSON.stringify(c.params)!==JSON.stringify(sourceParams.find(p=>p.index===c.index).params))throw Error('H03 native group params changed');}
 const geometryLifetime=plan.cuts.map(c=>Object.fromEntries(Object.keys(rawLifetime[0]).map(k=>[k,c[k]])));
 if(JSON.stringify(geometryLifetime)!==JSON.stringify(rawLifetime)||JSON.stringify(plan.retainedCutIndices)!==JSON.stringify(retainedCutIndices))throw Error('H03 geometry altered native group clocks');
 plan.media=J.planMedia(p,plan,12,'media');plan.foreground=J.planMedia(p,plan,12,'foreground');
 const native=plan;if(newPath)plan=J.finalizePlacementPlan(plan,{layoutsB:true});
 const canvas=document.createElement('canvas');canvas.width=3200;canvas.height=1080;
 const renderer=new J.Renderer(),sha=async data=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data))).map(n=>n.toString(16).padStart(2,'0')).join('');
 async function frame(time){
  // Native preparation seeks actual HTMLVideoElements. A decoded compositor
  // callback is additionally required for both inputs, including reverse seeks.
  const decoded=[];for(let i=0;i<videos.length;i++){const cut=J.mediaAt(plan,time,i?'foreground':'media'),target=J.mediaVideoTime(cut,time,videos[i].duration),proof=await window.seekDecodedFrame(videos[i],target);decoded.push({target,proof,seekCount:videos[i].h03SeekCount,currentTime:videos[i].currentTime});}
  await J.prepareMediaFrame(plan,time);
  for(let i=0;i<videos.length;i++)if(videos[i].seeking||videos[i].h03SeekCount!==decoded[i].seekCount||videos[i].currentTime!==decoded[i].currentTime)throw Error('Native media preparation changed decoded frame');
  const observations=[],emitted=[],draw=J.drawItem,replay=J.placement?.replay,eventRoles=new WeakMap();if(replay)J.placement.replay=function(env,program,...args){for(const e of program.events)if(e.kind==='item')eventRoles.set(e.args[0],{role:e.role,owner:e.owner});return replay.call(this,env,program,...args);};J.drawItem=(env,it)=>{if(env.placementRecorder)return draw(env,it);const ownership=eventRoles.get(it)||env.drawOwnership||{},glyphs=[];for(const ch of [...String(it.text||'')].filter(c=>!/[\s\u200b]/.test(c))){const font=J.fontForChar(it.font,ch),id=fonts.assignments[font]||fonts.assignments[it.font],face=fonts.faces.find(f=>f.id===id),cp=ch.codePointAt(0),fallback=!face?.codepoints.includes(cp)&&/\p{S}/u.test(ch)&&fonts.faces.find(f=>f.id==='symbols')?.codepoints.includes(cp);if(!face||!face.codepoints.includes(cp)&&!fallback)throw Error('H03 emitted FONT_CMAP '+JSON.stringify({font,id,ch}));glyphs.push({cp,font,face:fallback?'symbols':id});}emitted.push({cut:env.cut.index,role:ownership.role||null,owner:ownership.owner||null,text:it.text,font:it.font,size:it.size,source:it.placementSource||null,metadata:it.placementMetadata||null,glyphs});return draw(env,it);};try{renderer.frame(canvas.getContext('2d'),plan,time,{noHud:true,noPost:true,placementObservation:o=>observations.push(o)});}finally{J.drawItem=draw;if(replay)J.placement.replay=replay;}
  const rgbaSHA256=await sha(canvas.getContext('2d').getImageData(0,0,3200,1080).data),layers={};
  for(const layer of ['media','foreground']){const cv=document.createElement('canvas');cv.width=3200;cv.height=1080;const x=cv.getContext('2d');const cut=J.mediaAt(plan,time,layer);J.drawMediaCut(x,cut,time);const data=x.getImageData(0,0,3200,1080).data;let pixels=0,x0=3200,y0=1080,x1=-1,y1=-1;for(let y=0;y<1080;y++)for(let z=0;z<3200;z++)if(data[(y*3200+z)*4+3]){pixels++;x0=Math.min(x0,z);x1=Math.max(x1,z);y0=Math.min(y0,y);y1=Math.max(y1,y);}layers[layer]={rgbaSHA256:await sha(data),pixels,bounds:[x0,y0,x1,y1],cut:JSON.parse(JSON.stringify(cut))};cv.width=cv.height=1;}
  return {time,rgbaSHA256,layers,emitted,decoded:videos.map((v,i)=>({...decoded[i],currentTime:v.currentTime,readyState:v.readyState,width:v.videoWidth,height:v.videoHeight,seeking:v.seeking,prepareDidNotReseek:true})),activeCuts:J.lyricCutsAt(plan,time).map(c=>c.index),observations};
 }
 return {project:p,plan,native,canvas,renderer,frame,rawLifetime,sourceParams,sourceOccurrences,actualEffects,geometryLifetimeUnchanged:true,retainedCutIndices,fontCoverage,fonts:window.layoutsBFixtureFontAudit};
};
