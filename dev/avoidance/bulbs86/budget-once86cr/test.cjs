'use strict';const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),U=__dirname,R=path.resolve(U,'../../../..');
const old=fs.readFileSync(R+'/src/11zz06d_bulbs_generator86.js','utf8'),now=fs.readFileSync(U+'/compiler86cr.js','utf8');
function codec(s){const J={placement:{bulbsFinalFrameAccounting86g:{create(){}}}};s=s.replace("Object.defineProperty(A,'bulbsScalarGenerator80ab'", "A.testByteLength=byteLength;Object.defineProperty(A,'bulbsScalarGenerator80ab'");vm.runInNewContext(s,{J,performance});return J.placement}
const a=codec(old),b=codec(now);let checks=0;
for(const native of [{kind:'geometry',rings:[],culled:true},{kind:'geometry',rings:[{points:Array.from({length:140},(_,i)=>[i/7,-i/3])}],layout:{text:'風の先へ',n:NaN}}]){
 if(Number.isNaN(native.layout?.n))native.layout.n=-0;
 for(const current of [native,{kind:'recipe',rings:[{points:[[1e-300,-0],[Number.MAX_VALUE,4]]}],subtitle:{text:'a"\ud800風',size:16}}]){
  const scalar={native,nativeBytes:a.testByteLength(native),current,currentBytes:a.testByteLength(current)};
  for(const x of [{entry:{n:1,root:[.25,0,0,.25,1,2]},native,current,mutable:{values:[1,null,undefined]}},{outer:{native,current},work:{native,n:4}},{native,current,values:[native,current,native]}]){assert.equal(b.testByteLength(x,scalar),a.testByteLength(x));checks++}
  // Mutable work must remain live: only the two owned geometry identities are cached.
  const x={native,current,mutable:[]};const before=b.testByteLength(x,scalar);x.mutable.push('new content');assert.equal(b.testByteLength(x,scalar),a.testByteLength(x));assert(b.testByteLength(x,scalar)>before);checks++;
 }
}
assert.throws(()=>b.testByteLength({x:Infinity}),{code:'BULBS80_FINITE'});checks++;
assert.equal(b.testByteLength([,undefined]),a.testByteLength([,undefined]));checks++;
console.log(JSON.stringify({pass:true,checks,scope:'actual old/new codec equality with two immutable geometry identities, live mutable siblings, native alias, exact Float64/string/sparse array/nonfinite behavior; no Canvas or geometry mutation proof'}));
