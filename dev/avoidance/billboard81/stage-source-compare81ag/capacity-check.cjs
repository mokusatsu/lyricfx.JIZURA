'use strict';
// Saved normalized shape only. The dependency fingerprint's CONTENT is not in
// old raw: infer its exact encoded LENGTH from the independently recorded total.
const fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib'),assert=require('node:assert/strict'),path=require('node:path');
const raw=process.argv[2];assert.ok(raw,'Pass saved budget.json.gz');
const evidence=JSON.parse(zlib.gunzipSync(fs.readFileSync(raw)));
const decode=x=>Array.isArray(x)?x.map(decode):x&&typeof x==='object'?Object.keys(x).length===1&&typeof x.$f64==='string'?Buffer.from(x.$f64,'hex').readDoubleBE():Object.keys(x).length===1&&x.$undefined===true?undefined:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,decode(v)])):x;
const A={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../fragment-extension81af/baseline-codec80.js'),'utf8'),{J:{placement:A},Object,JSON,Number,Error,DataView,ArrayBuffer});
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../plan-binding81y/plan-binding81.js'),'utf8'),{J:{placement:A},Object,JSON,Number,Error,Map,WeakMap,Set,Reflect,Array});
const C=A.bulbsScalarCompiler80,B=A.billboardPlanBinding81y.create({adapterId:'budget_mock81ad',codec:C,ticketState(){},validateFinal(){},onAccount(){}}),plan=decode(evidence.canonical),signature=B.sourceKey(plan);
const state={stage:{id:1,plan,signature,fingerprint:''},prepared:null,work:null,certificates:[],stageSerial:1,generation:1,closed:false,busy:false};
const bytes=()=>4*C.serializedBytes(state)+4096;
const actual=evidence.events.find(e=>e.phase==='staged').stats.retainedSerializedBytes;
const fingerprintAsciiLength=(actual-bytes())/4;assert.ok(Number.isSafeInteger(fingerprintAsciiLength)&&fingerprintAsciiLength>0);
// ASCII surrogate has the same exact JSON byte length; not a genuine dependency.
state.stage.fingerprint='x'.repeat(fingerprintAsciiLength);assert.equal(bytes(),actual);
state.prepared={handle:{kind:'billboard-private-owned-unqualified81p',id:1},stageId:1};assert.equal(bytes(),116380);
state.work={plan,ticket:null,certificate:null};assert.equal(bytes(),134620);
delete state.stage.signature;
const issueWithoutSignature=bytes();state.work=null;
const beforeComparison=bytes(),inputComparison=beforeComparison+4*C.serializedBytes({currentPlan:plan,scratch:[]});
const fingerprintComparison=inputComparison+4*C.serializedBytes({currentFingerprint:state.stage.fingerprint});
assert.ok(inputComparison<=131072);assert.ok(fingerprintComparison>131072);
console.log(JSON.stringify({savedStageBytes:actual,reproducedCommitBytes:116380,reproducedIssueBytes:134620,canonicalBytes:C.serializedBytes(plan),signatureBytes:C.serializedBytes(signature),inferredFingerprintEncodedBytes:C.serializedBytes(state.stage.fingerprint),issueWithoutSignature,beforeComparison,inputComparison,fingerprintComparison,cap:131072,scope:'capacity proof with actual saved plan; fingerprint equal-length surrogate only; no genuine owner/finalizer/Canvas authority'}));
