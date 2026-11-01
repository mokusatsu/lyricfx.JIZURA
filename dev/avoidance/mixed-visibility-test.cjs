'use strict';
// The exit cache may have been populated by any earlier direct seek.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../..'),sandbox={window:{},console};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'src/01_util.js'),'utf8'),sandbox);
sandbox.window.J.placement={};
vm.runInContext(fs.readFileSync(path.join(root,'src/11zz14a_center_circle.js'),'utf8'),sandbox);
const run=sandbox.window.J.placement.centerCircle.mixedVisibilityRanges;
const s=run([0,.1,.2],.05,.8,.4,[.6,.6,.6]),sets=Array.from(s.sets,x=>Array.from(x).join(','));
assert.deepEqual(sets,['0','0,1','0,1,2']);
assert.equal(s.fallback,true);
assert.deepEqual(Array.from(s.times),[.05,.1,.2,.4,.6,.8]);
const exit=run([0,.1,.2],.45,.55,.4,[.6,.6,.6]);
assert.deepEqual(Array.from(exit.sets,x=>Array.from(x).join(',')),['0,1,2','0','0,1']);
assert.equal(exit.fallback,false);
const noExit=run([0,.1,.2],.21,.3,.4,[.6,.6,.6]);
assert.deepEqual(Array.from(noExit.sets,x=>Array.from(x).join(',')),['0,1,2']);
const simultaneous=run([0,0,.8],.45,.55,.4,[.6,.6,.6]);
assert.deepEqual(Array.from(simultaneous.sets,x=>Array.from(x).join(',')),['0,1']);
const staggeredExit=run([0,.1,.2],.45,.65,.4,[.5,.6,.7]);
assert.deepEqual(Array.from(staggeredExit.sets,x=>Array.from(x).join(',')),['0,1,2','1,2','2','0','0,1']);
// A bbox is gone at the drawItem alpha threshold, before tyStrike's HIDE.
const threshold=.4+(.3+.4*Math.pow(.998,1/6))*.4;
const atThreshold=run([0,.1],threshold,threshold,.4,[threshold,.8]);
assert(Array.from(atThreshold.sets,x=>Array.from(x).join(',')).includes('1'));
const atEmpty=run([0],.3,.3,.4,[.3]);
assert.equal(atEmpty.fallback,true);
console.log('PASS: visibility events, direct-seek cache prefixes and empty fallback');
