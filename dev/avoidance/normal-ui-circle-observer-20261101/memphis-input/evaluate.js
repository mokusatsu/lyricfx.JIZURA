#!/usr/bin/env node
'use strict';
// Usage: node /tmp/jizura-memphis-evaluate.js captured-options.json [iterations]
// JSON is a single options object, an array, or {options:[...]}; include W,H,P,bbRanges.
// Measures support construction only, not solver retry or UI safety.
const fs=require('fs'),vm=require('vm'),{performance}=require('perf_hooks');
const root='/workspace/jizura-bulbs-product-20261029';
const file=process.argv[2],iterations=Number(process.argv[3]||3);
if(!file||!Number.isInteger(iterations)||iterations<1)throw Error('usage: evaluator captured-options.json [positive iterations]');
const raw=JSON.parse(fs.readFileSync(file,'utf8')),inputs=Array.isArray(raw)?raw:Array.isArray(raw.options)?raw.options:[raw];
const util=fs.readFileSync(root+'/src/01_util.js','utf8'),hash=util.slice(util.indexOf('J.h = function'),util.indexOf('J.rs ='));
function load(path){const context=vm.createContext({J:{placement:{}}});vm.runInContext(hash,context);vm.runInContext(fs.readFileSync(path,'utf8'),context);return context.J.placement.memphisUnits;}
const old=load(root+'/src/11zz14b_memphis_units.js'),marked=load('/tmp/jizura-memphis-retry/src/11zz14b_memphis_units.js');
const clean=x=>JSON.parse(JSON.stringify(x,(k,v)=>k==='certainlyInvisible'?undefined:v));
const outputs=inputs.map((o,i)=>{
 if(!o||!(o.W>0)||!(o.H>0)||!o.P||!Array.isArray(o.bbRanges))throw Error('invalid input '+i);
 let a,b,oldMs=0,newMs=0;
 for(let n=0;n<iterations;n++){let t=performance.now();a=old({...o,markInvisible:false});oldMs+=performance.now()-t;t=performance.now();b=marked({...o,markInvisible:true});newMs+=performance.now()-t;}
 const before=JSON.stringify(clean(a)),after=JSON.stringify(clean(b));
 return {index:i,supports:a.length,markedSupports:b.filter(x=>x.certainlyInvisible).length,markedBranches:new Set(b.filter(x=>x.certainlyInvisible).map(x=>[x.owner,x.rangeIndex,x.branch].join('/'))).size,unchangedWithoutMarker:before===after,oldMeanMs:oldMs/iterations,markedMeanMs:newMs/iterations};
});
console.log(JSON.stringify({iterations,inputs:outputs,note:'construction timing only; no candidate retry or safety verification'},null,2));
