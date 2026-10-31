'use strict';
// Pure boundary regression: real timing/admission code, no browser or raster.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'../..'),box={window:{},console,performance};vm.createContext(box);
const run=file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),box,{filename:file});
run('src/01_util.js');const J=box.window.J;
for(const name of ['LAYOUT_ORDER','ENTER_ORDER','EXIT_ORDER','HOLD_ORDER','DECOR_ORDER'])J[name]=[];
run('src/08_planner.js');run('src/08e_lyric_features.js');
// Seed only planner output; preserve the real placement lineage/lock wrapper.
J.plan=project=>project.fixture;J.LAYOUTS=Object.fromEntries(['center','vcols','neon','pill','magazine','type','condensed'].map(k=>[k,{render(){}}]));J.metrics={revision:0};J.ENTER={cut:{},invertBox:{},flicker:{}};J.EXIT={cut:{},tyStrike:{}};
run('src/09a_placement.js');run('src/11zz14_simple_circle.js');run('src/11zz14a_center_circle.js');
const A=J.placement,S=A.simpleCircle,actualCenter=A.centerCircle;let viewportCalls=0;
// Geometry is deliberately a stub: this suite checks admission and propagation,
// while center-circle-support-test covers source support geometry separately.
A.centerCircle={...actualCenter,prepareViewport(plan,cut,opt){viewportCalls++;assert(opt.holdRange);return {area:{...cut.area},recipe:{nativeIdentity:true},diagnostic:{cut:cut.index,status:'safe',safety:'safe-hold',holdWindow:opt.holdRange}};}};
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);
function fixture(change={},extra=[],overrides={}){
 const cut={index:1,line:0,part:0,layout:'center',text:'native',lineText:'native',start:1,end:5,dur:4,inDur:.5,outDur:.4,enter:'invertBox',exit:'tyStrike',hold:'knCounterRock',cam:'panL',treat:'none',params:{},decor:[{id:'memphis'}],area:{x:.2,y:.6,w:.4,h:.3,angle:0},...change};
 const plan={W:1920,H:1080,duration:10,fps:60,fx:{koma:12,motion:.7,chroma:.7},style:{ghost:1},cuts:[cut,...extra],events:[],lyricAvoidanceIndex:{enabled:true,regions:[{start:0,end:10,center:{x:.5,y:.42},radius:.2}]}};
 return {cut,plan:J.plan({fixture:plan,overrides})};
}
let cases=0;
{
 const {plan,cut}=fixture({},[{index:2,line:1,part:0,effectFx:{koma:4}}]),h=S.centerHoldInterval(plan,cut);
 near(h.native.start,1.5);near(h.native.end,4.6);near(h.step,.25);near(h.real.start,1.25);near(h.real.end,4.6+.25+1.6/24);cases++;
}
{
 const {plan,cut}=fixture({enter:'cut',exit:'cut',inDur:3,outDur:3}),h=S.centerHoldInterval(plan,cut);
 near(h.native.start,1);near(h.native.end,5);cases++;
}
for(const layout of ['neon','pill','magazine']){
 const {plan,cut}=fixture({layout}),h=S.centerHoldInterval(plan,cut);near(h.native.start,1.5);near(h.native.end,4.6);cases++;
}
{
 const {plan,cut}=fixture({layout:'type',enter:'cut'}),h=S.centerHoldInterval(plan,cut);
 near(h.native.start,1.5);cases++;
}
{
 J.LAYOUTS.userRing={custom:true,customDefinition:{base:'ring'},render(){}};
 const {plan,cut}=fixture({layout:'userRing'});
 assert.equal(S.targets(plan,cut),false);assert.equal(S.centerHoldInterval(plan,cut),null);cases++;
}
{
 const {plan,cut}=fixture({layout:'pill',enter:'missing',exit:'missing'}),h=S.centerHoldInterval(plan,cut);near(h.native.start,1);near(h.native.end,5);cases++;
}
{
 const {plan,cut}=fixture({displayEnd:8,groupOutDur:1.2,renderStart:.2}),h=S.centerHoldInterval(plan,cut);
 near(h.native.start,1.5);near(h.native.end,6.8);assert.equal(J.lyricRenderCut(cut).dur,7);cases++;
}
{
 const {plan,cut}=fixture({displayEnd:8,groupOutDur:3,groupExit:'cut'}),h=S.centerHoldInterval(plan,cut);
 near(h.native.end,8);cases++;
}
{
 const {plan,cut}=fixture({dur:1,end:2,inDur:.5,outDur:.47});assert.equal(S.centerHoldInterval(plan,cut),null);cases++;
}
{
 const {plan,cut}=fixture({inDur:0}),h=S.centerHoldInterval(plan,cut);near(h.native.start,1.01);cases++;
}
{
 const {plan,cut}=fixture(),h=S.centerHoldInterval(plan,cut),area=JSON.stringify(cut.area);
 plan.events=[{type:'unknown-in-entry',t:1,dur:.1},{type:'unknown-after-exit',t:5,dur:.1}];
 assert.equal(S.eventPolicy(plan,cut,h.real).unsupported.length,0);
 const prepared=S.prepare(plan);assert.equal(prepared.diagnostics[0].safety,'safe-hold');assert.equal(JSON.stringify(prepared.plan.cuts[0].area),area);assert.equal(JSON.stringify(prepared.plan.cuts[0].simpleCircleRecipe.sourceCut.area),area);assert.equal(JSON.stringify(cut.area),area);cases++;
 plan.events=[{type:'unknown-held',t:2,dur:.1}];const before=viewportCalls;
 assert.equal(S.eventPolicy(plan,cut,h.real).unsupported[0],'unknown-held');assert.equal(S.prepare(plan).diagnostics[0].reason,'UNSUPPORTED_EFFECT');assert.equal(viewportCalls,before);cases++;
 // Event duration is at least one output frame; touching the range end alone
 // is outside, while a zero-duration event immediately before it is included.
 plan.events=[{type:'unknown-edge',t:h.real.end,dur:0}];assert.equal(S.eventPolicy(plan,cut,h.real).events.length,0);
 plan.events=[{type:'unknown-edge',t:h.real.start-1/120,dur:0}];assert.equal(S.eventPolicy(plan,cut,h.real).unsupported.length,1);cases++;
}
{
 const {plan,cut}=fixture(),range={start:2,end:3};plan.events=[{type:'zoomPunch',t:1,dur:.2,amp:1},{type:'whipBlur',t:2.2,dur:.2,amp:.5},{type:'heartbeat',t:2.6,dur:.2,amp:1}];
 const p=S.postMotion(plan,1920,1080,1,cut,range);near(p.x,1920*.045*.5+2);near(p.y,1920*.045*.5+2);cases++;
}
{
 const {plan,cut}=fixture(),range={start:2,end:3};plan.events=[{type:'edgeDetect',t:2.2,dur:.2,amp:1}];
 assert.equal(S.eventPolicy(plan,cut,range).unsupported.length,0);
 const p=S.postMotion(plan,960,540,1,cut,range);near(p.x,8);near(p.y,8);cases++;
}
S.registerProvider('fixed-center-exclusion-test',{ids:['ring'],handles:()=>true,prepare(){throw Error('fixed center must never dispatch');}});
// Renderer activation lasts at least one output frame, but zoom's k uses
// max(dur,.001). Tiny durations therefore continue through k>1, reversing
// and eventually enlarging the scratch image in the opposite direction.
for(const fps of [24,60,120])for(const dur of [0,.0001,.001,.002,1/fps/4,1/fps,.2])for(const amp of [-2,1]){
 const {plan,cut}=fixture();plan.fps=fps;plan.events=[{type:'zoom',t:2,dur,amp}];
 const p=S.postMotion(plan,1920,1080,1,cut,{start:2,end:3}),life=Math.max(dur,1/fps);
 for(const elapsed of [0,life*(1-1e-12)])for(let i=1;i<=6;i++){
  const k=elapsed/Math.max(dur,1e-3),s=1+i*.022*amp*(1-k);
  assert(p.x+1e-9>=Math.abs(s-1)*1920/2);
  assert(p.y+1e-9>=Math.abs(s-1)*1080/2);
 }
 if(dur===0)assert(p.x>1920*.066*Math.abs(amp));
 if(dur>=1/fps){near(p.x,1920*.066*Math.abs(amp));near(p.y,1080*.066*Math.abs(amp));}
 cases++;
}
for(const change of [{areaMode:'manual'},{areaMode:'notation'},{placementLocked:true},{emphasis:true},{layout:'ring'}]){
 const {plan,cut}=fixture(change);assert.equal(S.targets(plan,cut),false);assert.equal(S.prepare(plan).diagnostics.length,0);cases++;
}
{
 const {plan,cut}=fixture({},[],{0:{lock:true}});assert.equal(S.targets(plan,cut),false);assert.equal(S.prepare(plan).diagnostics.length,0);cases++;
}
for(const area of [null,{x:.2,y:.6,w:.4,h:.3,angle:5},{x:-.01,y:.6,w:.4,h:.3,angle:0}]){
 const {plan,cut}=fixture({area});assert(!actualCenter.viewportHandles(cut));assert.equal(S.centerHoldInterval(plan,cut),null);cases++;
}
console.log(JSON.stringify({status:'PASS',cases,viewportCalls,scope:'pure native timing, post/admission boundaries and preserved-cut exclusions; geometry stub; no raster/UI acceptance'}));
