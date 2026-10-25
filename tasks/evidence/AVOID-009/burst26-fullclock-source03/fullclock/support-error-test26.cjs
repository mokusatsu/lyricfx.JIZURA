'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const geometry=fs.readFileSync(__dirname+'/geometry-test26.cjs','utf8');
const sandbox={require,console:{log(){}},__dirname};vm.runInNewContext(geometry+';globalThis.fixture={records,normalize,l};',sandbox);
const {records,normalize,l}=sandbox.fixture,clone=v=>JSON.parse(JSON.stringify(v));let accepted=0,rejected=0;
for(const original of records){const p=clone(original),stroke=p.kind.startsWith('stroke'),used=stroke?'strokeStyle':'fillStyle',unused=stroke?'fillStyle':'strokeStyle';p.state[unused]={nonstring:true};assert.deepEqual(normalize(p,0,l).bounds,normalize(original,0,l).bounds);accepted++;p.state[used]={nonstring:true};assert.throws(()=>normalize(p,0,l),/BURST26_PAINT_SCOPE/);rejected++;}
const browser=fs.readFileSync(__dirname+'/browser26.js','utf8'),start=browser.indexOf('function support('),end=browser.indexOf('window.frameBurst26=');
const collect=new Function('need','eq',browser.slice(start,end)+';return collectSupports;')((v,c)=>assert(v,c),(a,b)=>JSON.stringify(a)===JSON.stringify(b));
const good=clone(records[0]),bad=clone(records[1]);good.state.fillStyle={nonstring:true};bad.state.strokeStyle={nonstring:true};const raw=[good,bad,clone(records[2])],before=JSON.stringify(raw),partial=collect(raw,l);assert.equal(JSON.stringify(raw),before);assert.equal(partial.supports.length,1);assert.equal(partial.supportPrefix,partial.supports);assert.equal(partial.supportError.ordinal,1);assert.match(partial.supportError.message,/BURST26_PAINT_SCOPE/);
const {acceptSample}=require('./runner26.cjs'),frame={records:raw,glyphs:[{text:'風の先へ'}],passes:[{pass:'main'}],...partial},events=[];
assert.throws(()=>acceptSample(frame,v=>events.push(v)),/BURST26_SUPPORT_ERROR/);assert.equal(events.length,1);assert.equal(events[0].phase,'support-error-frame');assert.equal(events[0].frame,frame);const whole=collect([good],l);assert.equal(whole.supportError,null);assert.equal(whole.supportPrefix,null);assert.equal(acceptSample(whole,()=>assert.fail('unexpected persistence')),whole);
console.log(JSON.stringify({status:'PASS_PURE_SUPPORT_ERROR26',acceptedUnusedStyle:accepted,rejectedActiveStyle:rejected,supportPrefixPreserved:true,rawGlyphPassPreservedBeforeAssertion:true,canvasFrames:0}));
