'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),B=require('./bounded26.cjs');
const J={placement:{}};vm.runInNewContext(fs.readFileSync('/workspace/lyricfx.JIZURA/src/11p_layoutsEe_bulbs_geometry68.js','utf8'),{J});const G=J.placement.bulbsGeometry68;
const input={W:960,H:540,knownSourceFX:true,cut:{text:'風の先へ',seed:1205,params:{font:'dela',spikes:15,sharp:.72,tilt:4,lines:true,debris:true,order:'accent'}}};
assert.equal(B.family(input).status,'scope-only-unproven');
for(const patch of [{W:540},{knownSourceFX:false},{cut:{...input.cut,lyricSize:30}},{cut:{...input.cut,params:{...input.cut.params,debris:false}}}])assert.throws(()=>B.family({...input,...patch}),e=>e.status==='unsupported');
const recipes=B.recipes();assert.equal(recipes.length,17);assert.equal(new Set(recipes.map(r=>r.id)).size,17);assert(recipes.every(r=>r.text.replace(/\n/g,'')===input.cut.text&&r.onePlate&&r.wholeStageScale===1));
const circle={cx:480,cy:540*.2,r:108,margin:2.7},support=bounds=>({role:'primary',owner:'burst.native-plate',bounds});
const safe=[support({x0:100,x1:200,y0:350,y1:400})],hit=[support({x0:470,x1:490,y0:100,y1:120})],outside=[support({x0:-1,x1:10,y0:350,y1:400})];
assert(B.evaluate(safe,circle,G,{sourcePositivePaintCount:1}).passed);assert(!B.evaluate(hit,circle,G,{sourcePositivePaintCount:1}).passed);assert(!B.evaluate(outside,circle,G,{sourcePositivePaintCount:1}).passed);
assert.throws(()=>B.evaluate(safe,circle,G,{sourcePositivePaintCount:2}),/COMPLETE_SOURCE_PAINTS/);assert.throws(()=>B.evaluate([{...safe[0],role:'aux'}],circle,G,{sourcePositivePaintCount:1}),/PRIMARY_SUPPORT/);
assert.equal(B.evaluate([],circle,G,{sourcePositivePaintCount:0}).certificateIssued,false);assert.throws(()=>B.evaluate([],circle,G),/COMPLETE_SOURCE_PAINTS/);
assert.throws(()=>B.candidates({id:'unknown'},safe,circle,G),/RECIPE/);
for(const r of recipes){const c=B.candidates(r,safe,circle,G);assert(c.candidates.length<=9);assert.equal(c.requiresActualDestinationProof,true);const d=B.dimensions(r,80,{w:r.text.includes('\n')?130:260,h:r.text.includes('\n')?140:70});assert(d.size>=18.9&&d.rx>0&&d.ry>0);}
assert.throws(()=>B.dimensions({...recipes[0],fontRatio:.1},80,{w:30,h:20}),/RECIPE/);
console.log(JSON.stringify({status:'PASS',recipes:17,maxCandidates:153,geometry:'existing-G68-exact',canvasFrames:0,safetyCertified:false}));
