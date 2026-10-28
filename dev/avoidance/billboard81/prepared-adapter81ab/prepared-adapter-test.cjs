'use strict';const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');let checks=0;const ok=(v)=>{assert.ok(v);checks++},eq=(a,b)=>{assert.deepEqual(a,b);checks++},reject=(fn,code)=>{assert.throws(fn,e=>e.code===code);checks++};
let generation=1,revision=1,sourceVersion=1,faceVersion=1,compiles=0,steps=0,bitmap=0,current=null,bridge,adapter,reserve;const bindings=new Map(),tickets=new Map();
const clone=x=>structuredClone(x),source=plan=>JSON.stringify({...plan,placementFinalization:undefined,cuts:plan.cuts.map(c=>{const n={...c};for(const k of ['placementLayoutsD','fullStagePlacement','placementUnits','placementTrajectory'])delete n[k];return n})});
const A={bulbsScalarCompiler80:{exact:x=>x,serializedBytes:x=>Buffer.byteLength(JSON.stringify(x))},billboardPrivatePrepare81n2:Object.freeze({stageFingerprint:()=>[revision,sourceVersion,faceVersion].join('|'),createOwner(){return {installPlanBridge(options){reserve=options.adapterReservedBytes;bridge={sourceKey:source,needs:p=>!!p.placementFinalization?.diagnostics.some(d=>d.runtimeAdmissionRequired)||bindings.has(p),admit:p=>!!current&&Object.isFrozen(p)&&bindings.has(p)&&tickets.has(bindings.get(p).ticket)&&current.revision===revision,issue({plan,ticket}){ok(tickets.has(ticket));const certificate=Object.freeze({id:bindings.size+1});const trajectory={safety:'certified-bounded-adapter'};bindings.set(plan,{ticket,certificate});return {trajectory,certificate}},release(certificate){for(const [p,b]of bindings)if(b.certificate===certificate){tickets.delete(b.ticket);bindings.delete(p)}},releaseTicket:t=>tickets.delete(t),checkBudget(){ok(reserve()<=131072)}};return bridge},drop(){current=null;tickets.clear()},begin({plan,currentGeneration,generation:g}){ok(Object.isFrozen(plan)&&Object.isFrozen(plan.cuts[0]));ok(g===currentGeneration());current={plan,revision};compiles++},step(){steps++;return {done:true}},commit(){return Object.freeze({id:compiles})},validate(h){if(!current||h.id!==compiles)throw Object.assign(Error(),{code:'EVICTED'});return true},ticketForPlan(h,p){this.validate(h);eq(source(p),source(current.plan));const ticket=Object.freeze({id:steps+1});tickets.set(ticket,p);return ticket},stats:()=>({compiles,steps})}}})};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'prepared-adapter81.js'),'utf8'),{J:{placement:A},Object,Number,JSON,Error});
const unit=A.billboardPreparedAdapter81ab.create({generation:1,currentGeneration:()=>generation});adapter=unit.adapter;
// Execute the actual product failure-marker/admission helper bodies, with only
// their private adapter registry supplied by this mock. Cache wrapper below is
// a semantic unit, not the full 09a/09g codec.
const product=process.argv[2];assert.ok(product,'Pass the product 09k source path');let source09k;
try{source09k=fs.readFileSync(product,'utf8')}catch{const dir=path.dirname(product);source09k=fs.readFileSync(path.join(dir,fs.readdirSync(dir).find(n=>n.startsWith('09k_'))),'utf8')}
const helpers=source09k.split('\n').filter(l=>l.startsWith("Object.defineProperty(A,'layoutsDRuntimeAdmission'")||l.startsWith("Object.defineProperty(A,'markLayoutsDRuntimeFailures'"));eq(helpers.length,2);vm.runInNewContext(helpers.join('\n'),{A,adapters:new Map([['billboard',adapter]]),Object});
const input={duration:4,cuts:[{index:0,layout:'billboard',params:{text:'HELLO'},area:null}],lyricAvoidanceIndex:{enabled:true}};
const working=()=>{const p=clone(input);Object.assign(p.cuts[0],{placementLayoutsD:true,fullStagePlacement:true,placementUnits:true});return p};
const failPlan=()=>{const p=working();let code;try{adapter.finalize({plan:p,cut:p.cuts[0]})}catch(e){code=e.code;adapter.finalizationLifecycle({phase:'failed'})}eq(code,'BILLBOARD81AB_PREPARE_REQUIRED');p.cuts[0]=clone(input.cuts[0]);const diagnostics=[{cut:0,safety:'unsupported',code}];A.markLayoutsDRuntimeFailures(p,diagnostics,{layoutsD:true});p.placementFinalization={diagnostics};return Object.freeze(p)};
const failed=failPlan();ok(unit.needs(failed));ok(!A.layoutsDRuntimeAdmission(failed));eq(compiles,0);eq(bitmap,0);
function render(p){if(unit.needs(p)&&!unit.admit(p))throw Object.assign(Error(),{code:'OWNED_PLAN_REQUIRED'});bitmap++}
reject(()=>render(failed),'OWNED_PLAN_REQUIRED');eq(bitmap,0);
// Both shortcut choices must miss the marker before readiness and after it.
let prior=failed,decoded=clone(failed),misses=0;function cacheRead(p){if(!A.layoutsDRuntimeAdmission(p)){misses++;return null}return p}
eq(cacheRead(prior),null);eq(cacheRead(decoded),null);
// Caller edits do not reach the private stage. Stage came from working(), not input.
input.cuts[0].params.text='CHANGED';unit.begin();unit.step();unit.commit();eq(current.plan.cuts[0].params.text,'HELLO');eq(compiles,1);input.cuts[0].params.text='HELLO';eq(cacheRead(prior),null);eq(cacheRead(decoded),null);
const success=working(),tr=adapter.finalize({plan:success,cut:success.cuts[0]});success.cuts[0].placementTrajectory={...tr,sourceAdapter:adapter.id};adapter.finalizationLifecycle({phase:'validated',trajectory:success.cuts[0].placementTrajectory});Object.freeze(success);adapter.finalizationLifecycle({phase:'finalized',trajectory:success.cuts[0].placementTrajectory});ok(A.layoutsDRuntimeAdmission(success));render(success);eq(bitmap,1);eq(compiles,1);ok(!unit.admit(clone(success)));eq(misses,4);
// Changed normalized input cannot use old ready handle; no compile during finalize.
input.cuts[0].params.text='DIFFERENT';const changed=failPlan();ok(!unit.admit(success));reject(()=>render(changed),'OWNED_PLAN_REQUIRED');eq(compiles,1);unit.begin();unit.step();unit.commit();eq(compiles,2);
revision++;reject(()=>unit.begin(),'BILLBOARD81AB_DEPENDENCY_STALE');eq(compiles,2);
// Same normalized source, changed font revision/face/source fingerprint: old
// work is refused, explicit finalization captures a fresh stage, then prepare.
for(const change of [()=>{},()=>faceVersion++,()=>sourceVersion++]){change();failPlan();ok(!unit.stats().prepared);unit.begin();unit.step();unit.commit();ok(unit.stats().prepared)}
eq(compiles,5);
input.lyricAvoidanceIndex.center={x:.7,y:.2};failPlan();ok(!unit.stats().prepared);eq(compiles,5);unit.begin();unit.step();unit.commit();eq(compiles,6);
generation++;reject(()=>unit.commit(),'BILLBOARD81AB_GENERATION_STALE');unit.cancel();ok(!unit.stats().prepared);ok(!unit.stats().staged);reject(()=>unit.begin(),'BILLBOARD81AB_CANCELLED');
// Early unsupported diagnostic for this adapter only; preservation and other
// layouts remain outside this marker's needs route.
const legacy={cuts:[{index:0,layout:'other'}],lyricAvoidanceIndex:{enabled:true},placementFinalization:{diagnostics:[{cut:0,safety:'unsupported'}]}};A.markLayoutsDRuntimeFailures(legacy,legacy.placementFinalization.diagnostics,{layoutsD:true});ok(!unit.needs(legacy));ok(A.layoutsDRuntimeAdmission(legacy));
const second=A.billboardPreparedAdapter81ab.create({generation:2,currentGeneration:()=>generation});const huge=working();huge.cuts[0].params.text='x'.repeat(40000);reject(()=>second.adapter.finalize({plan:huge,cut:huge.cuts[0]}),'BILLBOARD81AB_STAGE_BUDGET');ok(!second.stats().staged);second.cancel();
console.log(JSON.stringify({checks,compiles,steps,scope:'mock owner; actual 09k admission/marker helper bodies; no real J.plan/codec/Canvas'}));
