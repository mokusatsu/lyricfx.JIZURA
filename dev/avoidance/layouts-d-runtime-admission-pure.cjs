'use strict';const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');let checks=0;
const ok=v=>{assert.ok(v);checks++},eq=(a,b)=>{assert.deepEqual(a,b);checks++},reject=(f,c)=>{assert.throws(f,e=>e.code===c);checks++};
const A={},J={placement:A,metrics:{revision:1}},sandbox={J,A,console};vm.createContext(sandbox);const read=n=>fs.readFileSync(require('node:path').resolve(__dirname,'../../src',n),'utf8');vm.runInContext(read('09k_layoutsD_placement.js'),sandbox);
const admissionDescriptor=Object.getOwnPropertyDescriptor(A,'layoutsDRuntimeAdmission');ok(admissionDescriptor.writable===false&&admissionDescriptor.configurable===false&&Object.isFrozen(admissionDescriptor.value));assert.throws(()=>{A.layoutsDRuntimeAdmission=()=>true},e=>e.name==='TypeError');checks++;assert.throws(()=>Object.defineProperty(A,'layoutsDRuntimeAdmission',{value:()=>true}),e=>e.name==='TypeError');checks++;
const ownedPlans=new WeakSet(),ownedCerts=new WeakSet(),resident=new Set([1]);let calls=0,mode='owned',compiles=0,paints=0,lastArgs;
const admission=args=>{calls++;lastArgs=args;if(mode==='false')return false;if(mode==='throw')throw Error('STALE');if(mode==='promise')return Promise.resolve(true);return ownedPlans.has(args.plan)&&ownedCerts.has(args.trajectory.certificate)&&resident.has(args.trajectory.certificate.id)};
const finalize=()=>{},render=()=>{},adapter={id:'bulbs-owned-test',finalize,render,runtimeAdmission:admission};A.registerLayoutsDAdapter('bulbs',adapter);adapter.runtimeAdmission=()=>false; // Registry retains original callback identity.
A.registerLayoutsDAdapter('tiles',{id:'legacy-tiles',finalize,render});
A.registerLayoutsDAdapter('billboard',{id:'other-owned',finalize,render,runtimeAdmission:()=>true});
for(const value of [null,1,'function',{}])reject(()=>A.registerLayoutsDAdapter('dominoes',{id:'invalid-callback',finalize,render,runtimeAdmission:value}),'INVALID_D_ADAPTER_REGISTRATION');
const cert={id:1},cut={index:0,layout:'bulbs',text:'ORIGINAL',placementLayoutsD:true,placementTrajectory:{sourceAdapter:'bulbs-owned-test',certificate:cert}},plan={duration:4.15,cuts:[cut]};ownedPlans.add(plan);ownedCerts.add(cert);
ok(A.layoutsDRuntimeAdmission(plan)===true);ok(Object.isFrozen(lastArgs)&&lastArgs.plan===plan&&lastArgs.cut===cut&&lastArgs.trajectory===cut.placementTrajectory);
const deps=A.layoutsDCacheAdapterDependencies();ok(deps[0].length===5&&deps[0][4]===admission);ok(deps[1].length===4);const before=deps[0][4];deps[0][4]=()=>false;ok(A.layoutsDCacheAdapterDependencies()[0][4]===before);
for(const value of ['false','throw','promise']){mode=value;ok(A.layoutsDRuntimeAdmission(plan)===false)}mode='owned';
const alias=JSON.parse(JSON.stringify(plan));ok(A.layoutsDRuntimeAdmission(alias)===false);const otherPlan={...plan};ok(A.layoutsDRuntimeAdmission(otherPlan)===false);
resident.clear();ok(A.layoutsDRuntimeAdmission(plan)===false);resident.add(1);ok(A.layoutsDRuntimeAdmission(plan)===true);
const countBefore=calls;for(const layout of ['tiles','fisheye','unregistered'])ok(A.layoutsDRuntimeAdmission({cuts:[{layout,placementLayoutsD:true,placementTrajectory:{sourceAdapter:'legacy'}}]})===true);ok(calls===countBefore);
ok(A.layoutsDRuntimeAdmission({cuts:[{...cut,placementLayoutsD:false}]})===true);ok(calls===countBefore);
ok(A.layoutsDRuntimeAdmission({cuts:[{layout:'billboard',placementLayoutsD:true,placementTrajectory:{sourceAdapter:'other-owned'}}]})===true);ok(calls===countBefore);
const wrong={...cut,placementTrajectory:{...cut.placementTrajectory,sourceAdapter:'different'}};ok(A.layoutsDRuntimeAdmission({cuts:[wrong]})===false);ok(calls===countBefore);
// Execute the actual09a entry, shortcut, cache read and originalCuts restore,
// stopping immediately before expensive unchanged trajectory finalization.
const srcA=read('09a_placement.js'),startA=srcA.indexOf('J.finalizePlacementPlan = (input,options={}) => {'),endA=srcA.indexOf('  const diagnostics=[],stepDur=',startA);assert(startA>=0&&endA>startA);
const finalized=new WeakMap(),sources=new WeakMap();let cacheResult=null,cacheReads=0,keepFreezeCalls=0;
Object.assign(sandbox,{finalized,sources,signature:p=>JSON.stringify(p),layoutsCFinalCache:{begin:()=>({}),read:()=>{cacheReads++;return cacheResult},freeze:p=>{keepFreezeCalls++;return p}},freeze:p=>p,jsonClone:x=>JSON.parse(JSON.stringify(x)),fail:(code,message)=>{throw Object.assign(Error(message),{code})}});A.layoutsAOptionsFinite=()=>true;
vm.runInContext(srcA.slice(startA,endA)+'return {continued:true,plan,originalCuts};\n};',sandbox);
const options={layoutsD:true},prior=p=>finalized.set(p,{signature:JSON.stringify(p),revision:1,options:JSON.stringify(options)}),lineage={originalCuts:[{index:0,layout:'bulbs',text:'RESTORED_SOURCE'}]};sources.set(plan,lineage);prior(plan);
const readsBefore=cacheReads;ok(J.finalizePlacementPlan(plan,options)===plan);ok(cacheReads===readsBefore);
for(const value of ['false','throw']){mode=value;const v=J.finalizePlacementPlan(plan,options);ok(v.continued===true);ok(v.plan!==plan);eq(v.plan.cuts[0].text,'RESTORED_SOURCE');ok(!v.plan.cuts[0].placementTrajectory)}mode='owned';
resident.clear();const evicted=J.finalizePlacementPlan(plan,options);ok(evicted.continued===true&&evicted.plan.cuts[0].text==='RESTORED_SOURCE');resident.add(1);
// No actual-plan lineage is invented for serialized aliases.
reject(()=>J.finalizePlacementPlan(alias,options),'SOURCE_PLAN_REQUIRED');
const legacy={duration:4,cuts:[{layout:'tiles',placementLayoutsD:true}]};prior(legacy);ok(J.finalizePlacementPlan(legacy,options)===legacy);
const fisheye={duration:4,cuts:[{layout:'fisheye',placementLayoutsD:true}]};prior(fisheye);ok(J.finalizePlacementPlan(fisheye,options)===fisheye);
// Execute the actual09g hit function with decoded/repair payload results. Guard
// must run before edge registration, hit counters, LRU mutation, freeze target.
const srcG=read('09g_layoutsC_placement.js'),startG=srcG.indexOf('const readFinalCache=context=>{'),endG=srcG.indexOf('const keepFinalCache=',startG);assert(startG>=0&&endG>startG);
const entry={id:'entry'},sentinel={id:'sentinel'},pool=new Map([['key',entry],['sentinel',sentinel]]),counters={hits:0,misses:0,identityDrifts:0,bypasses:0,admissionRejects:0};let decoded={plan:alias},edgeCalls=0,readCalls=0;
Object.assign(sandbox,{pendingFreezeRoot:{old:true},completedPool:pool,cacheCounters:counters,verifyCacheContext:()=>true,readCompletedPayload:()=>{readCalls++;return decoded},edgeRegisterFinal:()=>{edgeCalls++}});
vm.runInContext(srcG.slice(startG,endG)+'this.readCache=readFinalCache;',sandbox);
for(const value of ['owned','false','throw']){mode=value;decoded={plan:alias};const hitBefore=counters.hits,edgeBefore=edgeCalls,order=[...pool.keys()],rejectBefore=counters.admissionRejects,missBefore=counters.misses,driftBefore=counters.identityDrifts,bypassBefore=counters.bypasses;ok(sandbox.readCache({key:'key'})===null);ok(counters.hits===hitBefore&&edgeCalls===edgeBefore);eq([...pool.keys()],order);ok(sandbox.pendingFreezeRoot===null);ok(counters.admissionRejects===rejectBefore+1&&counters.misses===missBefore+1);ok(counters.identityDrifts===driftBefore&&counters.bypasses===bypassBefore)}mode='owned';
decoded={plan};resident.clear();ok(sandbox.readCache({key:'key'})===null);ok(sandbox.pendingFreezeRoot===null);resident.add(1);
const hitBefore=counters.hits,edgeBefore=edgeCalls;const accepted=sandbox.readCache({key:'key'});ok(accepted===decoded&&counters.hits===hitBefore+1&&edgeCalls===edgeBefore+1);eq([...pool.keys()],['sentinel','key']);ok(sandbox.pendingFreezeRoot===plan);
for(const p of [legacy,fisheye]){decoded={plan:p};ok(sandbox.readCache({key:'key'})===decoded)}
const h=counters.hits;ok(sandbox.readCache({key:'missing'})===null);ok(counters.hits===h&&sandbox.pendingFreezeRoot===null);
const driftBefore=counters.identityDrifts,bypassBefore=counters.bypasses,rejectBefore=counters.admissionRejects,missBefore=counters.misses,edgeBeforeDrift=edgeCalls;sandbox.verifyCacheContext=()=>false;ok(sandbox.readCache({key:'key'})===null);ok(counters.identityDrifts===driftBefore+1&&counters.bypasses===bypassBefore+1);ok(counters.admissionRejects===rejectBefore&&counters.misses===missBefore&&edgeCalls===edgeBeforeDrift&&sandbox.pendingFreezeRoot===null);sandbox.verifyCacheContext=()=>true;
// Execute the actual clear function with its existing unrelated cleanup mocked.
const clearLine=srcG.split('\n').find(l=>l.startsWith('A.clearLayoutsCFinalCache=()=>'));assert(clearLine);Object.assign(sandbox,{dependencyMemo:{},nativeLocalBoundsBridge:{clear(){}},retireRepairMemo(){},repairCounters:{},cacheBytes:1,cacheResidentBytes:1,lastKeyBytes:1,lastKeyResidentBytes:1,lastPayloadBytes:1,lastAdmissionPayloadBytes:1,lastAdmissionPayloadResidentBytes:1,lastCompactPayloadResidentBytes:1,lastPayloadRejection:'old'});vm.runInContext(clearLine,sandbox);A.clearLayoutsCFinalCache();ok(sandbox.cacheCounters.admissionRejects===0&&sandbox.cacheCounters.hits===0&&sandbox.cacheCounters.misses===0);ok(pool.size===0&&sandbox.pendingFreezeRoot===null);
// Dependency collector must retain callback identity, not just first4 columns.
const line=srcG.split('\n').find(l=>l.includes('const adapters=Array.from(externalAdapters,'));assert(line);
const ids=new WeakMap();let serial=0;Object.assign(sandbox,{externalAdapters:new Map(),cacheID:x=>{if(!ids.has(x))ids.set(x,++serial);return ids.get(x)}});vm.runInContext('this.collect=()=>{'+line+'return adapters};',sandbox);
const collected=sandbox.collect();ok(collected.find(r=>r[0]==='D:bulbs').length===5);ok(collected.find(r=>r[0]==='D:tiles').length===4);
const original=A.layoutsDCacheAdapterDependencies;A.layoutsDCacheAdapterDependencies=()=>original().map(r=>r[0]==='bulbs'?[...r.slice(0,4),()=>true]:r);const changed=sandbox.collect();ok(changed.find(r=>r[0]==='D:bulbs')[4]!==collected.find(r=>r[0]==='D:bulbs')[4]);eq([...changed.find(r=>r[0]==='D:tiles')],[...collected.find(r=>r[0]==='D:tiles')]);A.layoutsDCacheAdapterDependencies=original;
ok(compiles===0&&paints===0);
console.log(JSON.stringify({passed:true,checks,calls,readCalls,scope:'full actual09k registry plus actual09a entry/restore and09g read/collector fragments with mock ownership/cache payloads; no real bulbs adapter, compiler, paint, codec or Canvas qualification'}));
