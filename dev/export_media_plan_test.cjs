const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({console,Map,WeakMap,Blob,File,Uint8Array,ArrayBuffer,crypto,setTimeout,
  navigator:{},document:{documentElement:{classList:{add(){},remove(){}}}},J:{clamp:(x,a=0,b=1)=>Math.max(a,Math.min(b,x))}});
context.window=context;context.addEventListener=()=>{};
vm.runInContext(fs.readFileSync(path.join(root,'src/08d_media.js'),'utf8'),context);
const J=context.J;
const asset=duration=>({element:{duration,videoWidth:64,videoHeight:48},file:new File(['x'],'source.mp4')});
J.mediaAssets.set('a',asset(1.5));J.mediaAssets.set('b',asset(4));J.mediaAssets.set('c',asset(4));
const cut=(index,itemId,start,end,more={})=>({index,itemId,start,end,type:'video',videoStart:0,...more});
const a=cut(0,'a',0,3,{videoStart:.4,videoLoop:true}),b=cut(1,'b',3,6,{videoStart:1,trans:'crossfade',transDur:.5});
const foreground=cut(0,'c',0,6,{videoStart:.3});
const plan={media:{cuts:[a,b]},foreground:{cuts:[foreground]}};
(async()=>{
  for(const time of [0,.5,1.1,1.5,2.9]){
    const demand=J.exportMediaDemand(plan,time),source=demand.sources[0];
    assert.equal(demand.backgroundRequired,true);
    assert.equal(source.time,Math.min((.4+time)%1.5,1.46));
    assert.equal(source.cycle,Math.floor((.4+time)/1.5));
    assert.equal(demand.sources[1].layer,'foreground');
  }
  const transition=J.exportMediaDemand(plan,3.1).sources;
  assert.equal(transition.length,3);
  assert.equal(transition[0].cut,a);assert.equal(transition[0].transition,true);
  assert.equal(transition[1].cut,b);assert(Math.abs(transition[1].time-1.1)<1e-8);
  const hidden=J.exportMediaDemand({...plan,layerVisibility:{media:false,foreground:false}},3.1);
  assert.equal(hidden.backgroundRequired,true);assert.equal(hidden.sources.length,0);
  let uploads=0;
  context.jizuraDesktop={ensureNativeAsset:async()=>({assetToken:`token${++uploads}`}),onRequestSaveAndClose:()=>{}};
  J.seekMediaVideo=async()=>{};
  context.VideoFrame=class { constructor(){this.format='I420';this.visibleRect={width:64,height:48};this.colorSpace={toJSON:()=>({matrix:'bt709',primaries:'bt709',transfer:'bt709',fullRange:false})};} close(){} };
  vm.runInContext(fs.readFileSync(path.join(root,'desktop/renderer/native-backend.js'),'utf8'),context);
  const media=await J.platform.planExportMedia(plan,0,6,24);
  assert.equal(media.frames.length,144);assert.equal(uploads,3,'upload each retained asset once');
  assert.equal(media.sources.length,6,'loop runs, frozen transition source, next background and foreground');
  assert(media.sources.every(s=>Number.isFinite(s.start)&&s.end>=s.start));
  assert.notEqual(media.frames[36][0].cursor.id,media.frames[0][0].cursor.id);
  assert(media.frames[75].some(source=>source.transition));
  const shared={...plan,foreground:{cuts:[{...foreground,itemId:'b',videoStart:.2}]}};
  const concurrent=await J.platform.planExportMedia(shared,0,6,24);
  const sameAsset=concurrent.frames[75].filter(source=>source.cut.itemId==='b'&&!source.transition);
  assert.equal(sameAsset.length,2);assert.notEqual(sameAsset[0].cursor.id,sameAsset[1].cursor.id);
  const before=J.mediaAssets.get('c').element,decoded={width:64,height:48};
  J.exportMediaSources=new Map([[foreground,decoded]]);
  assert.equal(J.mediaSourceForCut(foreground),decoded);
  assert.equal(J.mediaCopySource(plan,{itemId:'@copy:foreground-source'},1,{},64,48),decoded);
  assert.equal(J.mediaAssets.get('c').element,before,'browser video remains intact');
  console.log('Export media plan: loops, offsets, foreground, transitions, visibility, shared assets and copies passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
