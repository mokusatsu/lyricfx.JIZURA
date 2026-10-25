/* Harness-only synthetic checks; no Canvas/browser qualification. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
async function exercise(mode='normal'){
 const writes=[],J={placement:{},metrics:{revision:3},measure(){return 1;}},originalMeasure=J.measure,originalRevision=J.metrics.revision;
 const ctx={fillStyle:'',letterSpacing:'0px',fillRect(){},getImageData(){return{data:new Uint8Array([this.changed?1:0,2,3,4])};}},canvas={width:960,height:540,getContext:()=>ctx};
 const A=J.placement;A.bulbsProof69={clone:structuredClone};A.bulbs69Stats=()=>({cacheEntries:1});
 const final={cuts:[{text:'風の先へ',placementTrajectory:{certificate:{}}}]},plan={cuts:[{text:'風の先へ'}]};let calls=0;
 const errors=['STALE_PLACEMENT_PLAN','STALE_PLACEMENT_PLAN','BULBS69_STALE_DEPENDENCY','BULBS69_FRAME_OPTIONS','BULBS69_ACTUAL_CONTEXT'];
 const renderer={frame(){const index=calls++;if(mode==='paint-before-reject'&&index===0)ctx.changed=true;if(mode==='missing-reject'&&index===0)return;throw Object.assign(Error(errors[index]),{code:mode==='wrong-reason'&&index===0?'WRONG':errors[index]});}};
 J.finalizePlacementPlan=input=>{assert.equal(input,plan,'must use live composed source, not a detached clone');assert.equal(input.cuts[0].lyricSize,40);return{cuts:[{placementTrajectory:{safety:mode==='silent-safe'?'certified-bounded-adapter':'unsupported',units:[]}}],placementFinalization:{diagnostics:[{code:'UNSUPPORTED'}]}};};
 class XMLHttpRequest{open(){}setRequestHeader(){}send(body){writes.push(JSON.parse(body));this.status=200;}}
 const window={},context={window,J,document:{createElement:()=>({...canvas})},DataView,ArrayBuffer,Uint8Array,crypto:webcrypto,XMLHttpRequest};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/layouts-d-bulbs69-browser.js','utf8'),context);
 window.bulbs69Local={run:{plan,renderer},final};let result,error;
 try{result=await window.negativeBoundaries69();}catch(e){error=e;}
 assert.equal(J.measure,originalMeasure);assert.equal(J.metrics.revision,originalRevision);assert(!Object.hasOwn(plan.cuts[0],'lyricSize'));
 return{result,error,writes,calls};
}
(async()=>{
 const ok=await exercise();assert(!ok.error);assert.equal(ok.result.cases,5);assert.equal(ok.calls,5);assert.equal(ok.writes.length,1);assert.equal(ok.writes[0].value.phase,'boundary-negatives');assert.equal(ok.writes[0].value.rows.length,5);
 for(const mode of['missing-reject','wrong-reason','paint-before-reject','silent-safe']){const r=await exercise(mode);assert(r.error,mode);assert.equal(r.writes.length,0,mode+' must not emit successful evidence');}
 console.log(JSON.stringify({status:'PASS',checks:5,scope:'ordinary boundary harness only; real browser cases unexecuted',browserExecutions:0}));
})().catch(e=>{console.error(e);process.exitCode=1;});
